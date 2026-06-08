#pragma once

#include <QSqlDatabase>
#include <QStringList>
#include <QVariantList>
#include <QVariantMap>

class DatabaseService {
public:
    DatabaseService();
    ~DatabaseService();

    bool initialize(const QString &seedPath = QStringLiteral(":/data/adhkar.json"));
    QString errorString() const;
    QString databasePath() const;

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
    QString m_connectionName;
    QSqlDatabase m_db;
    QString m_errorString;

    bool open();
    bool migrate();
    bool importIfNeeded(const QString &seedPath);
    bool importSeed(const QByteArray &seedBytes, const QString &contentHash);
    QVariantMap categoryBySlug(const QString &slug) const;
    QVariantList rowsFromWhere(const QString &whereClause, const QVariantList &binds = {}) const;
};
