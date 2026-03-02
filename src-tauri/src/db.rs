use once_cell::sync::OnceCell;
use sqlx::{SqlitePool, Row, Pool, Sqlite};
use std::path::PathBuf;
use log::{info, error};

static DB: OnceCell<SqlitePool> = OnceCell::new();

pub fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_local_dir()
        .unwrap_or_else(|| {
            error!("Could not find data_local_dir, using current directory");
            PathBuf::from(".")
        })
        .join("adhkar");
    
    if let Err(e) = std::fs::create_dir_all(&data_dir) {
        error!("Failed to create data directory: {}", e);
    }
    
    let db_path = data_dir.join("adhkar.db");
    info!("Database path: {:?}", db_path);
    db_path
}

pub async fn init_db() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let db_path = get_db_path();
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
    
    info!("Initializing database at: {:?}", db_path);
    
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| {
        error!("Failed to connect to database: {}", e);
        e
    })?;
    
    create_tables(&pool).await?;
    
    DB.set(pool).map_err(|_| "Failed to set DB pool")?;
    
    info!("Database initialized successfully");
    Ok(())
}

pub fn get_connection() -> &'static SqlitePool {
    DB.get().expect("Database not initialized")
}

async fn create_tables(pool: &Pool<Sqlite>) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        INSERT OR IGNORE INTO content_types (id, name, slug) VALUES 
            (1, 'Dhikr', 'dhikr'),
            (2, 'Sunnah', 'sunnah'),
            (3, 'Asma al-Husnah', 'asma')
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY,
            type_id INTEGER NOT NULL DEFAULT 1,
            name_en TEXT NOT NULL,
            name_ar TEXT,
            slug TEXT UNIQUE NOT NULL,
            description_en TEXT,
            description_ar TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (type_id) REFERENCES content_types(id)
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS names_of_allah (
            id INTEGER PRIMARY KEY,
            name_ar TEXT NOT NULL,
            transliteration TEXT NOT NULL,
            number INTEGER NOT NULL,
            meaning_en TEXT NOT NULL,
            description_en TEXT,
            meaning_ar TEXT,
            description_ar TEXT,
            found_in_quran TEXT
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY,
            type_id INTEGER NOT NULL DEFAULT 1,
            source_id INTEGER NOT NULL,
            
            title TEXT,
            arabic TEXT NOT NULL,
            transliteration TEXT,
            translation_en TEXT,
            translation_ar TEXT,
            description_en TEXT,
            description_ar TEXT,
            virtue TEXT,
            explanation TEXT,
            
            count INTEGER DEFAULT 1,
            source TEXT,
            reference TEXT,
            
            grade TEXT,
            hadith_arabic TEXT,
            hadith_english TEXT,
            
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (type_id) REFERENCES content_types(id)
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS favorites (
            content_id INTEGER PRIMARY KEY,
            folder_id INTEGER,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS user_progress (
            content_id INTEGER PRIMARY KEY,
            current_count INTEGER DEFAULT 0,
            target_count INTEGER DEFAULT 33,
            last_practiced DATETIME,
            FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS notification_log (
            id INTEGER PRIMARY KEY,
            content_id INTEGER,
            shown_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            action TEXT DEFAULT 'viewed',
            FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE SET NULL
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    "#).execute(pool).await?;
    
    sqlx::query(r#"
        INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('language', 'en'),
            ('theme', 'system'),
            ('notifications_enabled', 'true'),
            ('default_interval_minutes', '60'),
            ('start_with_system', 'false'),
            ('start_minimized', 'true'),
            ('default_mode', 'gui'),
            ('history_retention_days', '30')
    "#).execute(pool).await?;
    
    sqlx::query(r#"CREATE INDEX IF NOT EXISTS idx_content_type ON content(type_id)"#).execute(pool).await?;
    sqlx::query(r#"CREATE INDEX IF NOT EXISTS idx_content_source ON content(source_id)"#).execute(pool).await?;
    sqlx::query(r#"CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)"#).execute(pool).await?;
    sqlx::query(r#"CREATE INDEX IF NOT EXISTS idx_notification_log_date ON notification_log(shown_at)"#).execute(pool).await?;
    
    Ok(())
}

pub async fn is_db_empty() -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    let pool = get_connection();
    let row = sqlx::query("SELECT COUNT(*) FROM content")
        .fetch_one(pool)
        .await?;
    let count: i64 = row.get(0);
    Ok(count == 0)
}
