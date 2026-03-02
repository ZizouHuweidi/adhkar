use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub type_id: i64,
    pub name_en: String,
    pub name_ar: String,
    pub slug: String,
    pub description_en: Option<String>,
    pub description_ar: Option<String>,
    pub icon: Option<String>,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Content {
    pub id: i64,
    pub type_id: i64,
    pub source_id: i64,
    pub title: Option<String>,
    pub arabic: String,
    pub transliteration: Option<String>,
    pub translation_en: Option<String>,
    pub translation_ar: Option<String>,
    pub description_en: Option<String>,
    pub description_ar: Option<String>,
    pub virtue: Option<String>,
    pub explanation: Option<String>,
    pub count: Option<i64>,
    pub source: Option<String>,
    pub reference: Option<String>,
    pub grade: Option<String>,
    pub hadith_arabic: Option<String>,
    pub hadith_english: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Favorite {
    pub content_id: i64,
    pub folder_id: Option<i64>,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProgress {
    pub content_id: i64,
    pub current_count: i64,
    pub target_count: i64,
    pub last_practiced: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationLog {
    pub id: i64,
    pub content_id: Option<i64>,
    pub shown_at: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}
