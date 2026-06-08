#pragma once

#include <QObject>
#include <QStringList>
#include <QVariantList>

#include "core/AdhkarService.h"
#include "core/ConfigService.h"

class AppController : public QObject {
    Q_OBJECT
    Q_PROPERTY(QVariantList categories READ categories CONSTANT)
    Q_PROPERTY(QString errorString READ errorString CONSTANT)
    Q_PROPERTY(QString theme READ theme CONSTANT)
    Q_PROPERTY(QString language READ language CONSTANT)

public:
    explicit AppController(QObject *parent = nullptr);

    QVariantList categories() const;
    QString errorString() const;
    QString theme() const;
    QString language() const;

    Q_INVOKABLE QVariantList allRows() const;
    Q_INVOKABLE QVariantList rowsForCategory(const QString &slug) const;
    Q_INVOKABLE QVariantList searchRows(const QString &query) const;
    Q_INVOKABLE QVariantList favoriteRows() const;
    Q_INVOKABLE QStringList favoriteIds() const;
    Q_INVOKABLE bool setFavorite(const QString &rowId, bool favorite);
    Q_INVOKABLE QVariantList historyRows(int limit = 50) const;
    Q_INVOKABLE bool recordHistory(const QString &rowId, const QString &title);
    Q_INVOKABLE bool clearHistory();
    Q_INVOKABLE void savePreferences(const QString &theme, const QString &language);

private:
    ConfigService m_config;
    AdhkarService m_adhkar;
};
