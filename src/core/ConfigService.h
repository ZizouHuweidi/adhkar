#pragma once

#include <QJsonObject>
#include <QString>

class ConfigService {
public:
    bool load();
    bool save() const;

    QString errorString() const;
    QJsonObject config() const;
    QString configPath() const;
    QString theme() const;
    QString language() const;
    bool savePreferences(const QString &theme, const QString &language);

private:
    QJsonObject m_config;
    QString m_errorString;
};
