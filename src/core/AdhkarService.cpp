#include "AdhkarService.h"

bool AdhkarService::load(const QString &path) {
  if (!m_database.initialize(path)) {
    m_errorString = m_database.errorString();
    return false;
  }
  m_errorString.clear();
  return true;
}

QString AdhkarService::errorString() const { return m_errorString; }

QVariantList AdhkarService::categories() const {
  return m_database.categories();
}

QVariantList AdhkarService::allRows() const { return m_database.allRows(); }

QVariantList AdhkarService::rowsForCategory(const QString &slug) const {
  return m_database.rowsForCategory(slug);
}

QVariantList AdhkarService::searchRows(const QString &query) const {
  return m_database.searchRows(query);
}

QVariantList AdhkarService::favoriteRows() const {
  return m_database.favoriteRows();
}

QStringList AdhkarService::favoriteIds() const {
  return m_database.favoriteIds();
}

bool AdhkarService::setFavorite(const QString &rowId, bool favorite) {
  return m_database.setFavorite(rowId, favorite);
}

QVariantList AdhkarService::historyRows(int limit) const {
  return m_database.historyRows(limit);
}

bool AdhkarService::recordHistory(const QString &rowId, const QString &title) {
  return m_database.recordHistory(rowId, title);
}

bool AdhkarService::clearHistory() { return m_database.clearHistory(); }
