#include "AppController.h"

#include <QDebug>

AppController::AppController(QObject *parent) : QObject(parent) {
  if (!m_config.load()) {
    qWarning() << m_config.errorString();
  }
  if (!m_adhkar.load()) {
    qWarning() << m_adhkar.errorString();
  }
}

QVariantList AppController::categories() const { return m_adhkar.categories(); }

QString AppController::errorString() const { return m_adhkar.errorString(); }

QString AppController::theme() const { return m_config.theme(); }

QString AppController::language() const { return m_config.language(); }

QVariantList AppController::allRows() const { return m_adhkar.allRows(); }

QVariantList AppController::rowsForCategory(const QString &slug) const {
  return m_adhkar.rowsForCategory(slug);
}

QVariantList AppController::searchRows(const QString &query) const {
  return m_adhkar.searchRows(query);
}

QVariantList AppController::favoriteRows() const {
  return m_adhkar.favoriteRows();
}

QStringList AppController::favoriteIds() const {
  return m_adhkar.favoriteIds();
}

bool AppController::setFavorite(const QString &rowId, bool favorite) {
  return m_adhkar.setFavorite(rowId, favorite);
}

QVariantList AppController::historyRows(int limit) const {
  return m_adhkar.historyRows(limit);
}

bool AppController::recordHistory(const QString &rowId, const QString &title) {
  return m_adhkar.recordHistory(rowId, title);
}

bool AppController::clearHistory() { return m_adhkar.clearHistory(); }

void AppController::savePreferences(const QString &theme,
                                    const QString &language) {
  if (!m_config.savePreferences(theme, language)) {
    qWarning() << "Failed to save preferences";
  }
}
