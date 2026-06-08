#include "DatabaseService.h"

#include "PathService.h"

#include <QCryptographicHash>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonParseError>
#include <QSqlError>
#include <QSqlQuery>
#include <QUuid>

namespace {
bool execSql(QSqlDatabase &db, const QString &sql, QString *error) {
  QSqlQuery query(db);
  if (!query.exec(sql)) {
    if (error) {
      *error = query.lastError().text();
    }
    return false;
  }
  return true;
}

QString valueString(const QVariantMap &map, const QString &key) {
  return map.value(key).toString();
}

bool hasColumn(QSqlDatabase &db, const QString &table, const QString &column) {
  QSqlQuery query(db);
  query.prepare(QStringLiteral("PRAGMA table_info(%1)").arg(table));
  if (!query.exec()) {
    return false;
  }
  while (query.next()) {
    if (query.value(1).toString() == column) {
      return true;
    }
  }
  return false;
}
} // namespace

DatabaseService::DatabaseService()
    : m_connectionName(
          QStringLiteral("adhkar-%1")
              .arg(QUuid::createUuid().toString(QUuid::WithoutBraces))) {}

DatabaseService::~DatabaseService() {
  if (m_db.isValid()) {
    m_db.close();
  }
  m_db = QSqlDatabase();
  QSqlDatabase::removeDatabase(m_connectionName);
}

bool DatabaseService::initialize(const QString &seedPath) {
  return open() && migrate() && importIfNeeded(seedPath);
}

QString DatabaseService::errorString() const { return m_errorString; }

QString DatabaseService::databasePath() const {
  return PathService::databasePath();
}

bool DatabaseService::open() {
  m_db = QSqlDatabase::addDatabase(QStringLiteral("QSQLITE"), m_connectionName);
  m_db.setDatabaseName(databasePath());
  if (!m_db.open()) {
    m_errorString = QStringLiteral("Failed to open database: %1")
                        .arg(m_db.lastError().text());
    return false;
  }
  return true;
}

bool DatabaseService::migrate() {
  bool categoryGroupingAdded = false;
  const QStringList statements = {
      QStringLiteral("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, "
                     "value TEXT NOT NULL)"),
      QStringLiteral(
          "CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, name "
          "TEXT NOT NULL, name_ar TEXT NOT NULL, description TEXT, sort_order "
          "INTEGER NOT NULL, group_name TEXT NOT NULL DEFAULT 'main', "
          "group_order INTEGER NOT NULL DEFAULT 0)"),
      QStringLiteral(
          "CREATE TABLE IF NOT EXISTS dhikr (id INTEGER PRIMARY KEY "
          "AUTOINCREMENT, category_slug TEXT NOT NULL, item_index INTEGER NOT "
          "NULL, title TEXT, arabic TEXT, translation TEXT, transliteration "
          "TEXT, reference TEXT, virtue TEXT, explanation TEXT, count TEXT, "
          "UNIQUE(category_slug, item_index), FOREIGN KEY(category_slug) "
          "REFERENCES categories(slug) ON DELETE CASCADE)"),
      QStringLiteral(
          "CREATE TABLE IF NOT EXISTS favorites (row_id TEXT PRIMARY KEY, "
          "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
      QStringLiteral("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY "
                     "KEY AUTOINCREMENT, row_id TEXT NOT NULL, title TEXT NOT "
                     "NULL, shown_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
      QStringLiteral("CREATE TABLE IF NOT EXISTS collections (id INTEGER "
                     "PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, "
                     "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
      QStringLiteral(
          "CREATE TABLE IF NOT EXISTS collection_items (collection_id INTEGER "
          "NOT NULL, row_id TEXT NOT NULL, sort_order INTEGER NOT NULL, "
          "PRIMARY KEY(collection_id, row_id), FOREIGN KEY(collection_id) "
          "REFERENCES collections(id) ON DELETE CASCADE)"),
  };

  for (const QString &statement : statements) {
    if (!execSql(m_db, statement, &m_errorString)) {
      return false;
    }
  }

  if (!hasColumn(m_db, QStringLiteral("categories"),
                 QStringLiteral("group_name"))) {
    if (!execSql(m_db,
                 QStringLiteral("ALTER TABLE categories ADD COLUMN group_name "
                                "TEXT NOT NULL DEFAULT 'main'"),
                 &m_errorString)) {
      return false;
    }
    categoryGroupingAdded = true;
  }
  if (!hasColumn(m_db, QStringLiteral("categories"),
                 QStringLiteral("group_order"))) {
    if (!execSql(m_db,
                 QStringLiteral("ALTER TABLE categories ADD COLUMN group_order "
                                "INTEGER NOT NULL DEFAULT 0"),
                 &m_errorString)) {
      return false;
    }
    categoryGroupingAdded = true;
  }
  if (categoryGroupingAdded &&
      !execSql(m_db,
               QStringLiteral("DELETE FROM meta WHERE key = 'content_hash'"),
               &m_errorString)) {
    return false;
  }
  return true;
}

bool DatabaseService::importIfNeeded(const QString &seedPath) {
  QFile seed(seedPath);
  if (!seed.open(QIODevice::ReadOnly)) {
    m_errorString =
        QStringLiteral("Failed to open bundled adhkar seed: %1").arg(seedPath);
    return false;
  }

  const QByteArray seedBytes = seed.readAll();
  const QString contentHash = QString::fromLatin1(
      QCryptographicHash::hash(seedBytes, QCryptographicHash::Sha256).toHex());

  QSqlQuery query(m_db);
  query.prepare(
      QStringLiteral("SELECT value FROM meta WHERE key = 'content_hash'"));
  if (!query.exec()) {
    m_errorString = query.lastError().text();
    return false;
  }
  if (query.next() && query.value(0).toString() == contentHash) {
    return true;
  }

  return importSeed(seedBytes, contentHash);
}

bool DatabaseService::importSeed(const QByteArray &seedBytes,
                                 const QString &contentHash) {
  QJsonParseError parseError;
  const QJsonDocument document =
      QJsonDocument::fromJson(seedBytes, &parseError);
  if (parseError.error != QJsonParseError::NoError || !document.isObject()) {
    m_errorString = QStringLiteral("Failed to parse adhkar seed: %1")
                        .arg(parseError.errorString());
    return false;
  }

  const QVariantMap root = document.object().toVariantMap();
  QVariantList categoryGroups;
  categoryGroups.append(QVariantMap{
      {QStringLiteral("name"), QStringLiteral("main")},
      {QStringLiteral("items"), root.value(QStringLiteral("main")).toList()}});
  categoryGroups.append(
      QVariantMap{{QStringLiteral("name"), QStringLiteral("others")},
                  {QStringLiteral("items"),
                   root.value(QStringLiteral("others")).toList()}});

  if (!m_db.transaction()) {
    m_errorString = m_db.lastError().text();
    return false;
  }

  QString error;
  for (const QString &statement : {QStringLiteral("DELETE FROM dhikr"),
                                   QStringLiteral("DELETE FROM categories")}) {
    if (!execSql(m_db, statement, &error)) {
      m_db.rollback();
      m_errorString = error;
      return false;
    }
  }

  QSqlQuery categoryQuery(m_db);
  categoryQuery.prepare(QStringLiteral(
      "INSERT INTO categories (slug, name, name_ar, description, sort_order, "
      "group_name, group_order) VALUES (?, ?, ?, ?, ?, ?, ?)"));
  QSqlQuery itemQuery(m_db);
  itemQuery.prepare(QStringLiteral(
      "INSERT INTO dhikr (category_slug, item_index, title, arabic, "
      "translation, transliteration, reference, virtue, explanation, count) "
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"));

  int sortOrder = 0;
  for (int groupIndex = 0; groupIndex < categoryGroups.size(); ++groupIndex) {
    const QVariantMap group = categoryGroups.at(groupIndex).toMap();
    const QString groupName = group.value(QStringLiteral("name")).toString();
    const QVariantList categories =
        group.value(QStringLiteral("items")).toList();
    for (int categoryIndex = 0; categoryIndex < categories.size();
         ++categoryIndex) {
      const QVariantMap category = categories.at(categoryIndex).toMap();
      const QString slug = valueString(category, QStringLiteral("slug"));
      categoryQuery.addBindValue(slug);
      categoryQuery.addBindValue(valueString(category, QStringLiteral("name")));
      categoryQuery.addBindValue(
          valueString(category, QStringLiteral("name_ar")));
      categoryQuery.addBindValue(
          valueString(category, QStringLiteral("description")));
      categoryQuery.addBindValue(sortOrder++);
      categoryQuery.addBindValue(groupName);
      categoryQuery.addBindValue(groupIndex);
      if (!categoryQuery.exec()) {
        m_db.rollback();
        m_errorString = categoryQuery.lastError().text();
        return false;
      }

      const QVariantList items =
          category.value(QStringLiteral("dhikr")).toList();
      for (int itemIndex = 0; itemIndex < items.size(); ++itemIndex) {
        const QVariantMap item = items.at(itemIndex).toMap();
        itemQuery.addBindValue(slug);
        itemQuery.addBindValue(itemIndex);
        itemQuery.addBindValue(valueString(item, QStringLiteral("title")));
        itemQuery.addBindValue(valueString(item, QStringLiteral("arabic")));
        itemQuery.addBindValue(
            valueString(item, QStringLiteral("translation")));
        itemQuery.addBindValue(
            valueString(item, QStringLiteral("transliteration")));
        itemQuery.addBindValue(valueString(item, QStringLiteral("reference")));
        itemQuery.addBindValue(valueString(item, QStringLiteral("virtue")));
        itemQuery.addBindValue(
            valueString(item, QStringLiteral("explanation")));
        itemQuery.addBindValue(valueString(item, QStringLiteral("count")));
        if (!itemQuery.exec()) {
          m_db.rollback();
          m_errorString = itemQuery.lastError().text();
          return false;
        }
      }
    }
  }

  QSqlQuery metaQuery(m_db);
  metaQuery.prepare(QStringLiteral(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('content_hash', ?)"));
  metaQuery.addBindValue(contentHash);
  if (!metaQuery.exec()) {
    m_db.rollback();
    m_errorString = metaQuery.lastError().text();
    return false;
  }

  if (!m_db.commit()) {
    m_errorString = m_db.lastError().text();
    return false;
  }

  return true;
}

QVariantList DatabaseService::categories() const {
  QVariantList categories;
  QSqlQuery query(m_db);
  query.prepare(QStringLiteral(
      "SELECT slug, name, name_ar, description, group_name, group_order FROM "
      "categories ORDER BY group_order, sort_order"));
  if (!query.exec()) {
    return categories;
  }
  while (query.next()) {
    QVariantMap category;
    category.insert(QStringLiteral("slug"), query.value(0));
    category.insert(QStringLiteral("name"), query.value(1));
    category.insert(QStringLiteral("name_ar"), query.value(2));
    category.insert(QStringLiteral("description"), query.value(3));
    category.insert(QStringLiteral("group"), query.value(4));
    category.insert(QStringLiteral("group_order"), query.value(5));
    const QVariantList rows = rowsForCategory(query.value(0).toString());
    QVariantList dhikr;
    for (const QVariant &rowValue : rows) {
      dhikr.append(rowValue.toMap().value(QStringLiteral("item")));
    }
    category.insert(QStringLiteral("dhikr"), dhikr);
    categories.append(category);
  }
  return categories;
}

QVariantList DatabaseService::allRows() const {
  return rowsFromWhere(QString());
}

QVariantList DatabaseService::rowsForCategory(const QString &slug) const {
  return rowsFromWhere(QStringLiteral("WHERE d.category_slug = ?"), {slug});
}

QVariantList DatabaseService::searchRows(const QString &queryText) const {
  const QString query = QStringLiteral("%%1%").arg(queryText.trimmed());
  return rowsFromWhere(
      QStringLiteral("WHERE d.arabic LIKE ? OR d.title LIKE ? OR d.translation "
                     "LIKE ? OR d.transliteration LIKE ?"),
      {query, query, query, query});
}

QVariantList DatabaseService::favoriteRows() const {
  const QStringList ids = favoriteIds();
  QVariantList rows;
  for (const QVariant &rowValue : allRows()) {
    const QVariantMap row = rowValue.toMap();
    if (ids.contains(row.value(QStringLiteral("id")).toString())) {
      rows.append(row);
    }
  }
  return rows;
}

QStringList DatabaseService::favoriteIds() const {
  QStringList ids;
  QSqlQuery query(m_db);
  query.prepare(
      QStringLiteral("SELECT row_id FROM favorites ORDER BY created_at"));
  if (!query.exec()) {
    return ids;
  }
  while (query.next()) {
    ids.append(query.value(0).toString());
  }
  return ids;
}

bool DatabaseService::setFavorite(const QString &rowId, bool favorite) {
  if (rowId.trimmed().isEmpty()) {
    return false;
  }

  QSqlQuery query(m_db);
  if (favorite) {
    query.prepare(
        QStringLiteral("INSERT OR IGNORE INTO favorites (row_id) VALUES (?)"));
  } else {
    query.prepare(QStringLiteral("DELETE FROM favorites WHERE row_id = ?"));
  }
  query.addBindValue(rowId);
  if (!query.exec()) {
    m_errorString = query.lastError().text();
    return false;
  }
  return true;
}

QVariantList DatabaseService::historyRows(int limit) const {
  QVariantList rows;
  QSqlQuery query(m_db);
  query.prepare(QStringLiteral(
      "SELECT row_id, title, shown_at FROM history ORDER BY id DESC LIMIT ?"));
  query.addBindValue(qBound(1, limit, 500));
  if (!query.exec()) {
    return rows;
  }
  while (query.next()) {
    QVariantMap row;
    row.insert(QStringLiteral("rowId"), query.value(0));
    row.insert(QStringLiteral("title"), query.value(1));
    row.insert(QStringLiteral("shownAt"), query.value(2));
    rows.append(row);
  }
  return rows;
}

bool DatabaseService::recordHistory(const QString &rowId,
                                    const QString &title) {
  if (rowId.trimmed().isEmpty()) {
    return false;
  }

  QSqlQuery query(m_db);
  query.prepare(
      QStringLiteral("INSERT INTO history (row_id, title) VALUES (?, ?)"));
  query.addBindValue(rowId);
  query.addBindValue(title.trimmed().isEmpty() ? rowId : title);
  if (!query.exec()) {
    m_errorString = query.lastError().text();
    return false;
  }

  return execSql(m_db,
                 QStringLiteral("DELETE FROM history WHERE id NOT IN (SELECT "
                                "id FROM history ORDER BY id DESC LIMIT 50)"),
                 &m_errorString);
}

bool DatabaseService::clearHistory() {
  return execSql(m_db, QStringLiteral("DELETE FROM history"), &m_errorString);
}

QVariantMap DatabaseService::categoryBySlug(const QString &slug) const {
  QSqlQuery query(m_db);
  query.prepare(
      QStringLiteral("SELECT slug, name, name_ar, description, group_name, "
                     "group_order FROM categories WHERE slug = ?"));
  query.addBindValue(slug);
  if (!query.exec() || !query.next()) {
    return {};
  }
  QVariantMap category;
  category.insert(QStringLiteral("slug"), query.value(0));
  category.insert(QStringLiteral("name"), query.value(1));
  category.insert(QStringLiteral("name_ar"), query.value(2));
  category.insert(QStringLiteral("description"), query.value(3));
  category.insert(QStringLiteral("group"), query.value(4));
  category.insert(QStringLiteral("group_order"), query.value(5));
  return category;
}

QVariantList DatabaseService::rowsFromWhere(const QString &whereClause,
                                            const QVariantList &binds) const {
  QVariantList rows;
  QSqlQuery query(m_db);
  query.prepare(
      QStringLiteral(
          "SELECT c.slug, c.name, c.name_ar, c.description, c.group_name, "
          "c.group_order, d.item_index, d.title, d.arabic, d.translation, "
          "d.transliteration, d.reference, d.virtue, d.explanation, d.count "
          "FROM dhikr d JOIN categories c ON c.slug = d.category_slug %1 ORDER "
          "BY c.group_order, c.sort_order, d.item_index")
          .arg(whereClause));
  for (const QVariant &bind : binds) {
    query.addBindValue(bind);
  }
  if (!query.exec()) {
    return rows;
  }
  while (query.next()) {
    QVariantMap category;
    category.insert(QStringLiteral("slug"), query.value(0));
    category.insert(QStringLiteral("name"), query.value(1));
    category.insert(QStringLiteral("name_ar"), query.value(2));
    category.insert(QStringLiteral("description"), query.value(3));
    category.insert(QStringLiteral("group"), query.value(4));
    category.insert(QStringLiteral("group_order"), query.value(5));

    QVariantMap item;
    item.insert(QStringLiteral("title"), query.value(7));
    item.insert(QStringLiteral("arabic"), query.value(8));
    item.insert(QStringLiteral("translation"), query.value(9));
    item.insert(QStringLiteral("transliteration"), query.value(10));
    item.insert(QStringLiteral("reference"), query.value(11));
    item.insert(QStringLiteral("virtue"), query.value(12));
    item.insert(QStringLiteral("explanation"), query.value(13));
    item.insert(QStringLiteral("count"), query.value(14));

    const int index = query.value(6).toInt();
    QVariantMap row;
    row.insert(QStringLiteral("category"), category);
    row.insert(QStringLiteral("item"), item);
    row.insert(QStringLiteral("index"), index);
    row.insert(QStringLiteral("id"),
               QStringLiteral("%1-%2")
                   .arg(category.value(QStringLiteral("slug")).toString())
                   .arg(index));
    rows.append(row);
  }
  return rows;
}
