#include "ConfigService.h"

#include "PathService.h"

#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonParseError>

namespace {
QJsonObject defaultConfig() {
  return {
      {QStringLiteral("theme"), QStringLiteral("light")},
      {QStringLiteral("language"), QStringLiteral("en")},
      {QStringLiteral("notifications"),
       QJsonObject{
           {QStringLiteral("enabled"), false},
           {QStringLiteral("morningTime"), QStringLiteral("07:00")},
           {QStringLiteral("eveningTime"), QStringLiteral("18:00")},
       }},
      {QStringLiteral("daemon"),
       QJsonObject{
           {QStringLiteral("autostart"), false},
       }},
  };
}
} // namespace

bool ConfigService::load() {
  QFile file(configPath());
  if (!file.exists()) {
    m_config = defaultConfig();
    return save();
  }

  if (!file.open(QIODevice::ReadOnly)) {
    m_errorString =
        QStringLiteral("Failed to open config: %1").arg(file.fileName());
    return false;
  }

  QJsonParseError parseError;
  const QJsonDocument document =
      QJsonDocument::fromJson(file.readAll(), &parseError);
  if (parseError.error != QJsonParseError::NoError || !document.isObject()) {
    m_errorString = QStringLiteral("Failed to parse config: %1")
                        .arg(parseError.errorString());
    return false;
  }

  m_config = document.object();
  m_errorString.clear();
  return true;
}

bool ConfigService::save() const {
  QFile file(configPath());
  if (!file.open(QIODevice::WriteOnly | QIODevice::Truncate)) {
    return false;
  }
  file.write(QJsonDocument(m_config).toJson(QJsonDocument::Indented));
  return true;
}

QString ConfigService::errorString() const { return m_errorString; }

QJsonObject ConfigService::config() const { return m_config; }

QString ConfigService::theme() const {
  return m_config.value(QStringLiteral("theme"))
      .toString(QStringLiteral("light"));
}

QString ConfigService::language() const {
  return m_config.value(QStringLiteral("language"))
      .toString(QStringLiteral("en"));
}

bool ConfigService::savePreferences(const QString &theme,
                                    const QString &language) {
  m_config.insert(QStringLiteral("theme"), theme == QStringLiteral("dark")
                                               ? QStringLiteral("dark")
                                               : QStringLiteral("light"));
  m_config.insert(QStringLiteral("language"), language == QStringLiteral("ar")
                                                  ? QStringLiteral("ar")
                                                  : QStringLiteral("en"));
  return save();
}

QString ConfigService::configPath() const {
  return PathService::configFilePath();
}
