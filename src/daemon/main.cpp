#include "core/AdhkarService.h"
#include "core/ConfigService.h"
#include "core/PathService.h"

#include <QCoreApplication>
#include <QTextStream>
#include <QTimer>

int main(int argc, char *argv[]) {
  QCoreApplication app(argc, argv);
  QCoreApplication::setApplicationName(QStringLiteral("adhkar-daemon"));
  QCoreApplication::setOrganizationName(QStringLiteral("Adhkar"));

  QTextStream out(stdout);
  QTextStream err(stderr);

  ConfigService config;
  if (!config.load()) {
    err << config.errorString() << '\n';
    return 1;
  }

  AdhkarService adhkar;
  if (!adhkar.load()) {
    err << adhkar.errorString() << '\n';
    return 1;
  }

  const bool statusOnly = app.arguments().contains(QStringLiteral("--status"));
  out << "Adhkar daemon ready\n"
      << "Config: " << PathService::configFilePath() << '\n'
      << "Database: " << PathService::databasePath() << '\n'
      << "Categories: " << adhkar.categories().size() << '\n';

  if (statusOnly) {
    return 0;
  }

  QTimer heartbeat;
  QObject::connect(&heartbeat, &QTimer::timeout, []() {
    // Placeholder for the notification scheduler loop.
  });
  heartbeat.start(std::chrono::minutes(1));

  return app.exec();
}
