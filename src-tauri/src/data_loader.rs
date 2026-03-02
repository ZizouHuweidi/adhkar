use crate::db::{get_connection, is_db_empty};
use log::{info, warn};
use serde::Deserialize;
use sqlx::Row;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
pub struct DhikrJson {
    pub main: Vec<DhikrCategory>,
    pub others: Vec<DhikrCategory>,
}

#[derive(Debug, Deserialize)]
pub struct DhikrCategory {
    pub slug: String,
    pub name: String,
    pub name_ar: String,
    pub description: Option<String>,
    pub dhikr: Vec<DhikrItem>,
}

#[derive(Debug, Deserialize)]
pub struct DhikrItem {
    pub title: String,
    pub arabic: String,
    pub translation: String,
    pub transliteration: String,
    pub reference: String,
    pub virtue: String,
    pub explanation: String,
    pub count: String,
}

pub async fn load_adhkar_data() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    if !is_db_empty().await? {
        info!("Database already has content, skipping data load");
        return Ok(());
    }

    info!("Loading adhkar data from data/adhkar.json...");

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let data_dir = manifest_dir.parent().unwrap().join("data");
    let dhikr_path = data_dir.join("adhkar.json");

    if !dhikr_path.exists() {
        warn!("adhkar.json not found at {:?}", dhikr_path);
        return Ok(());
    }

    let content = std::fs::read_to_string(&dhikr_path)?;
    let dhikr_data: DhikrJson = serde_json::from_str(&content)?;

    let pool = get_connection();

    // Process main categories
    for (index, cat) in dhikr_data.main.iter().enumerate() {
        let slug = cat.slug.clone();
        let name = cat.name.clone();
        let name_ar = cat.name_ar.clone();
        let description = cat.description.clone().unwrap_or_default();

        sqlx::query(
            "INSERT OR IGNORE INTO categories (name_en, name_ar, slug, description_en, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)"
        )
        .bind(&name)
        .bind(&name_ar)
        .bind(&slug)
        .bind(&description)
        .bind(index as i64)
        .execute(pool)
        .await?;

        let row = sqlx::query("SELECT id FROM categories WHERE slug = ?1")
            .bind(&slug)
            .fetch_one(pool)
            .await?;
        let category_id: i64 = row.get("id");

        for item in &cat.dhikr {
            sqlx::query(
                r#"INSERT OR IGNORE INTO content
                   (type_id, source_id, title, arabic, translation_en, transliteration, virtue, explanation, count, reference)
                   VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"#
            )
            .bind(category_id)
            .bind(&item.title)
            .bind(&item.arabic)
            .bind(&item.translation)
            .bind(&item.transliteration)
            .bind(&item.virtue)
            .bind(&item.explanation)
            .bind(&parse_count(&item.count))
            .bind(&item.reference)
            .execute(pool)
            .await?;
        }
    }

    // Process others categories (offset by main count)
    let main_count = dhikr_data.main.len();
    for (index, cat) in dhikr_data.others.iter().enumerate() {
        let slug = cat.slug.clone();
        let name = cat.name.clone();
        let name_ar = cat.name_ar.clone();
        let description = cat.description.clone().unwrap_or_default();

        sqlx::query(
            "INSERT OR IGNORE INTO categories (name_en, name_ar, slug, description_en, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)"
        )
        .bind(&name)
        .bind(&name_ar)
        .bind(&slug)
        .bind(&description)
        .bind((main_count + index) as i64)
        .execute(pool)
        .await?;

        let row = sqlx::query("SELECT id FROM categories WHERE slug = ?1")
            .bind(&slug)
            .fetch_one(pool)
            .await?;
        let category_id: i64 = row.get("id");

        for item in &cat.dhikr {
            sqlx::query(
                r#"INSERT OR IGNORE INTO content
                   (type_id, source_id, title, arabic, translation_en, transliteration, virtue, explanation, count, reference)
                   VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"#
            )
            .bind(category_id)
            .bind(&item.title)
            .bind(&item.arabic)
            .bind(&item.translation)
            .bind(&item.transliteration)
            .bind(&item.virtue)
            .bind(&item.explanation)
            .bind(&parse_count(&item.count))
            .bind(&item.reference)
            .execute(pool)
            .await?;
        }
    }

    info!("Data loading complete");
    Ok(())
}

fn parse_count(count: &str) -> i64 {
    if count.is_empty() {
        return 1;
    }
    // Extract number from strings like "(3x)", "3x", etc.
    let count_digits: String = count.chars().filter(|c| c.is_ascii_digit()).collect();
    count_digits.parse().unwrap_or(1)
}
