mod data_loader;
mod db;
mod models;

use db::init_db;
use db::get_connection;
use log::error;
use models::*;
use sqlx::Row;

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT id, type_id, name_en, name_ar, slug, description_en, description_ar, icon, sort_order
         FROM categories WHERE type_id = 1 ORDER BY sort_order"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Category {
                id: row.get("id"),
                type_id: row.get("type_id"),
                name_en: row.get("name_en"),
                name_ar: row.get("name_ar"),
                slug: row.get("slug"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                icon: row.get("icon"),
                sort_order: row.get("sort_order"),
            })
        })
        .collect()
}

#[tauri::command]
async fn get_dhikr_by_category(category_id: i64) -> Result<Vec<Content>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT id, type_id, source_id, arabic, transliteration, translation_en, translation_ar,
                description_en, description_ar, count, source, reference, grade, hadith_arabic, hadith_english
         FROM content WHERE type_id = 1 AND source_id = ?1"
    )
    .bind(category_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Content {
                id: row.get("id"),
                type_id: row.get("type_id"),
                source_id: row.get("source_id"),
                arabic: row.get("arabic"),
                transliteration: row.get("transliteration"),
                translation_en: row.get("translation_en"),
                translation_ar: row.get("translation_ar"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                count: row.get("count"),
                source: row.get("source"),
                reference: row.get("reference"),
                grade: row.get("grade"),
                hadith_arabic: row.get("hadith_arabic"),
                hadith_english: row.get("hadith_english"),
            })
        })
        .collect()
}

#[tauri::command]
async fn get_all_dhikr() -> Result<Vec<Content>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT id, type_id, source_id, arabic, transliteration, translation_en, translation_ar,
                description_en, description_ar, count, source, reference, grade, hadith_arabic, hadith_english
         FROM content WHERE type_id = 1"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Content {
                id: row.get("id"),
                type_id: row.get("type_id"),
                source_id: row.get("source_id"),
                arabic: row.get("arabic"),
                transliteration: row.get("transliteration"),
                translation_en: row.get("translation_en"),
                translation_ar: row.get("translation_ar"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                count: row.get("count"),
                source: row.get("source"),
                reference: row.get("reference"),
                grade: row.get("grade"),
                hadith_arabic: row.get("hadith_arabic"),
                hadith_english: row.get("hadith_english"),
            })
        })
        .collect()
}

#[tauri::command]
async fn search_dhikr(query: String) -> Result<Vec<Content>, String> {
    let pool = get_connection();
    let search_pattern = format!("%{}%", query);

    let rows = sqlx::query(
        "SELECT id, type_id, source_id, arabic, transliteration, translation_en, translation_ar,
                description_en, description_ar, count, source, reference, grade, hadith_arabic, hadith_english
         FROM content
         WHERE type_id = 1 AND (arabic LIKE ?1 OR translation_en LIKE ?1 OR transliteration LIKE ?1)
         LIMIT 50"
    )
    .bind(search_pattern)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Content {
                id: row.get("id"),
                type_id: row.get("type_id"),
                source_id: row.get("source_id"),
                arabic: row.get("arabic"),
                transliteration: row.get("transliteration"),
                translation_en: row.get("translation_en"),
                translation_ar: row.get("translation_ar"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                count: row.get("count"),
                source: row.get("source"),
                reference: row.get("reference"),
                grade: row.get("grade"),
                hadith_arabic: row.get("hadith_arabic"),
                hadith_english: row.get("hadith_english"),
            })
        })
        .collect()
}

#[tauri::command]
async fn get_favorites() -> Result<Vec<Content>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT c.id, c.type_id, c.source_id, c.arabic, c.transliteration, c.translation_en, c.translation_ar,
                c.description_en, c.description_ar, c.count, c.source, c.reference, c.grade, c.hadith_arabic, c.hadith_english
         FROM content c
         JOIN favorites f ON c.id = f.content_id
         ORDER BY f.added_at DESC"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Content {
                id: row.get("id"),
                type_id: row.get("type_id"),
                source_id: row.get("source_id"),
                arabic: row.get("arabic"),
                transliteration: row.get("transliteration"),
                translation_en: row.get("translation_en"),
                translation_ar: row.get("translation_ar"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                count: row.get("count"),
                source: row.get("source"),
                reference: row.get("reference"),
                grade: row.get("grade"),
                hadith_arabic: row.get("hadith_arabic"),
                hadith_english: row.get("hadith_english"),
            })
        })
        .collect()
}

#[tauri::command]
async fn add_favorite(content_id: i64) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query("INSERT OR IGNORE INTO favorites (content_id) VALUES (?1)")
        .bind(content_id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn remove_favorite(content_id: i64) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query("DELETE FROM favorites WHERE content_id = ?1")
        .bind(content_id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_user_progress(content_id: i64) -> Result<Option<UserProgress>, String> {
    let pool = get_connection();
    let result = sqlx::query(
        "SELECT content_id, current_count, target_count, last_practiced FROM user_progress WHERE content_id = ?1"
    )
    .bind(content_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.map(|row| UserProgress {
        content_id: row.get("content_id"),
        current_count: row.get("current_count"),
        target_count: row.get("target_count"),
        last_practiced: row.get("last_practiced"),
    }))
}

#[tauri::command]
async fn update_progress(content_id: i64, current_count: i64, target_count: i64) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query(
        r#"INSERT INTO user_progress (content_id, current_count, target_count, last_practiced)
           VALUES (?1, ?2, ?3, datetime('now'))
           ON CONFLICT(content_id) DO UPDATE SET
           current_count = ?2, target_count = ?3, last_practiced = datetime('now')"#
    )
    .bind(content_id)
    .bind(current_count)
    .bind(target_count)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_notification_history(limit: i64) -> Result<Vec<NotificationLog>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT id, content_id, shown_at, action FROM notification_log ORDER BY shown_at DESC LIMIT ?1"
    )
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(NotificationLog {
                id: row.get("id"),
                content_id: row.get("content_id"),
                shown_at: row.get("shown_at"),
                action: row.get("action"),
            })
        })
        .collect()
}

#[tauri::command]
async fn add_notification_log(content_id: i64, action: String) -> Result<i64, String> {
    let pool = get_connection();
    let result = sqlx::query(
        "INSERT INTO notification_log (content_id, action) VALUES (?1, ?2)"
    )
    .bind(content_id)
    .bind(action)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn get_setting(key: String) -> Result<Option<String>, String> {
    let pool = get_connection();
    let result = sqlx::query("SELECT value FROM settings WHERE key = ?1")
        .bind(key)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.map(|row| row.get("value")))
}

#[tauri::command]
async fn set_setting(key: String, value: String) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)")
        .bind(key)
        .bind(value)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_all_settings() -> Result<Vec<Setting>, String> {
    let pool = get_connection();
    let rows = sqlx::query("SELECT key, value FROM settings")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Setting {
                key: row.get("key"),
                value: row.get("value"),
            })
        })
        .collect()
}

#[tauri::command]
async fn is_favorite(content_id: i64) -> Result<bool, String> {
    let pool = get_connection();
    let result = sqlx::query("SELECT COUNT(*) FROM favorites WHERE content_id = ?1")
        .bind(content_id)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;

    let count: i64 = result.get(0);
    Ok(count > 0)
}

#[tauri::command]
async fn get_folders() -> Result<Vec<Folder>, String> {
    let pool = get_connection();
    let rows = sqlx::query("SELECT id, name FROM folders ORDER BY name")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Folder {
                id: row.get("id"),
                name: row.get("name"),
            })
        })
        .collect()
}

#[tauri::command]
async fn create_folder(name: String) -> Result<Folder, String> {
    let pool = get_connection();
    let result = sqlx::query("INSERT INTO folders (name) VALUES (?1)")
        .bind(&name)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();
    Ok(Folder { id, name })
}

#[tauri::command]
async fn delete_folder(id: i64) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query("DELETE FROM folders WHERE id = ?1")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn add_favorite_to_folder(content_id: i64, folder_id: i64) -> Result<(), String> {
    let pool = get_connection();
    sqlx::query("INSERT OR REPLACE INTO favorites (content_id, folder_id) VALUES (?1, ?2)")
        .bind(content_id)
        .bind(folder_id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_favorites_by_folder(folder_id: i64) -> Result<Vec<Content>, String> {
    let pool = get_connection();
    let rows = sqlx::query(
        "SELECT c.id, c.type_id, c.source_id, c.arabic, c.transliteration, c.translation_en, c.translation_ar,
                c.description_en, c.description_ar, c.count, c.source, c.reference, c.grade, c.hadith_arabic, c.hadith_english
         FROM content c
         JOIN favorites f ON c.id = f.content_id
         WHERE f.folder_id = ?1
         ORDER BY f.added_at DESC"
    )
    .bind(folder_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|row| {
            Ok(Content {
                id: row.get("id"),
                type_id: row.get("type_id"),
                source_id: row.get("source_id"),
                arabic: row.get("arabic"),
                transliteration: row.get("transliteration"),
                translation_en: row.get("translation_en"),
                translation_ar: row.get("translation_ar"),
                description_en: row.get("description_en"),
                description_ar: row.get("description_ar"),
                count: row.get("count"),
                source: row.get("source"),
                reference: row.get("reference"),
                grade: row.get("grade"),
                hadith_arabic: row.get("hadith_arabic"),
                hadith_english: row.get("hadith_english"),
            })
        })
        .collect()
}

#[tauri::command]
async fn get_favorites_with_folders() -> Result<Vec<(Folder, Vec<Content>)>, String> {
    let pool = get_connection();
    
    let folders = sqlx::query("SELECT id, name FROM folders ORDER BY name")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let mut result: Vec<(Folder, Vec<Content>)> = Vec::new();
    
    for folder_row in folders {
        let folder_id: i64 = folder_row.get("id");
        let folder = Folder {
            id: folder_id,
            name: folder_row.get("name"),
        };
        
        let contents = sqlx::query(
            "SELECT c.id, c.type_id, c.source_id, c.arabic, c.transliteration, c.translation_en, c.translation_ar,
                    c.description_en, c.description_ar, c.count, c.source, c.reference, c.grade, c.hadith_arabic, c.hadith_english
             FROM content c
             JOIN favorites f ON c.id = f.content_id
             WHERE f.folder_id = ?1
             ORDER BY f.added_at DESC"
        )
        .bind(folder_id)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;
        
        let content_list: Vec<Content> = contents.iter()
            .map(|row| {
                Ok(Content {
                    id: row.get("id"),
                    type_id: row.get("type_id"),
                    source_id: row.get("source_id"),
                    arabic: row.get("arabic"),
                    transliteration: row.get("transliteration"),
                    translation_en: row.get("translation_en"),
                    translation_ar: row.get("translation_ar"),
                    description_en: row.get("description_en"),
                    description_ar: row.get("description_ar"),
                    count: row.get("count"),
                    source: row.get("source"),
                    reference: row.get("reference"),
                    grade: row.get("grade"),
                    hadith_arabic: row.get("hadith_arabic"),
                    hadith_english: row.get("hadith_english"),
                })
            })
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e: sqlx::Error| e.to_string())?;
        
        result.push((folder, content_list));
    }
    
    Ok(result)
}

#[tauri::command]
async fn create_folder_for_category(category_id: i64) -> Result<Folder, String> {
    let pool = get_connection();
    
    let cat_row = sqlx::query("SELECT name_en, name_ar FROM categories WHERE id = ?1")
        .bind(category_id)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let name: String = cat_row.get("name_en");
    
    let result = sqlx::query("INSERT INTO folders (name) VALUES (?1)")
        .bind(&name)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let folder_id = result.last_insert_rowid();
    
    let dhikr_rows = sqlx::query("SELECT id FROM content WHERE source_id = ?1")
        .bind(category_id)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;
    
    for row in dhikr_rows {
        let content_id: i64 = row.get("id");
        sqlx::query("INSERT OR REPLACE INTO favorites (content_id, folder_id) VALUES (?1, ?2)")
            .bind(content_id)
            .bind(folder_id)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    Ok(Folder { id: folder_id, name })
}

#[tauri::command]
async fn is_category_favorite(category_id: i64) -> Result<bool, String> {
    let pool = get_connection();
    let folder_name: Option<String> = sqlx::query("SELECT name_en FROM categories WHERE id = ?1")
        .bind(category_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?
        .map(|row| row.get("name_en"));
    
    if let Some(name) = folder_name {
        let result = sqlx::query("SELECT COUNT(*) FROM folders WHERE name = ?1")
            .bind(&name)
            .fetch_one(pool)
            .await
            .map_err(|e| e.to_string())?;
        let count: i64 = result.get(0);
        Ok(count > 0)
    } else {
        Ok(false)
    }
}

#[tauri::command]
async fn remove_category_favorite(category_id: i64) -> Result<(), String> {
    let pool = get_connection();
    
    let folder_name: Option<String> = sqlx::query("SELECT name_en FROM categories WHERE id = ?1")
        .bind(category_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?
        .map(|row| row.get("name_en"));
    
    if let Some(name) = folder_name {
        let folder_row = sqlx::query("SELECT id FROM folders WHERE name = ?1")
            .bind(&name)
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;
        
        if let Some(f_row) = folder_row {
            let folder_id: i64 = f_row.get("id");
            sqlx::query("DELETE FROM favorites WHERE folder_id = ?1")
                .bind(folder_id)
                .execute(pool)
                .await
                .map_err(|e| e.to_string())?;
            sqlx::query("DELETE FROM folders WHERE id = ?1")
                .bind(folder_id)
                .execute(pool)
                .await
                .map_err(|e| e.to_string())?;
        }
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            tauri::async_runtime::spawn(async move {
                if let Err(e) = init_db().await {
                    error!("Failed to initialize database: {}", e);
                    return;
                }

                if let Err(e) = data_loader::load_adhkar_data().await {
                    error!("Failed to load adhkar data: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_categories,
            get_dhikr_by_category,
            get_all_dhikr,
            search_dhikr,
            get_favorites,
            add_favorite,
            remove_favorite,
            get_user_progress,
            update_progress,
            get_notification_history,
            add_notification_log,
            get_setting,
            set_setting,
            get_all_settings,
            is_favorite,
            get_folders,
            create_folder,
            delete_folder,
            add_favorite_to_folder,
            get_favorites_by_folder,
            get_favorites_with_folders,
            create_folder_for_category,
            is_category_favorite,
            remove_category_favorite
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
