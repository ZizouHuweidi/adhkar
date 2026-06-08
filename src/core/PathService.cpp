#include "PathService.h"

#include <QDir>
#include <QStandardPaths>

namespace {
QString ensureDir(QStandardPaths::StandardLocation location,
                  const QString &child) {
  const QString path =
      QDir(QStandardPaths::writableLocation(location)).filePath(child);
  QDir().mkpath(path);
  return path;
}
} // namespace

QString PathService::configDir() {
  return ensureDir(QStandardPaths::GenericConfigLocation,
                   QStringLiteral("adhkar"));
}

QString PathService::dataDir() {
  return ensureDir(QStandardPaths::GenericDataLocation,
                   QStringLiteral("adhkar"));
}

QString PathService::cacheDir() {
  return ensureDir(QStandardPaths::GenericCacheLocation,
                   QStringLiteral("adhkar"));
}

QString PathService::configFilePath() {
  return QDir(configDir()).filePath(QStringLiteral("config.json"));
}

QString PathService::databasePath() {
  return QDir(dataDir()).filePath(QStringLiteral("adhkar.sqlite"));
}
