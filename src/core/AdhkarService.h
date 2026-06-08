#pragma once

#include <QStringList>
#include <QVariantList>
#include <QVariantMap>

#include "DatabaseService.h"

class AdhkarService {
public:
    bool load(const QString &path = QStringLiteral(":/data/adhkar.json"));

    QString errorString() const;
    QVariantList categories() const;
    QVariantList allRows() const;
    QVariantList rowsForCategory(const QString &slug) const;
    QVariantList searchRows(const QString &query) const;
    QVariantList favoriteRows() const;
    QStringList favoriteIds() const;
    bool setFavorite(const QString &rowId, bool favorite);
    QVariantList historyRows(int limit = 50) const;
    bool recordHistory(const QString &rowId, const QString &title);
    bool clearHistory();

private:
    DatabaseService m_database;
    QString m_errorString;
};
