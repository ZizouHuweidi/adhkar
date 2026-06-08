#include "AppController.h"

#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>
#include <QUrl>

int main(int argc, char *argv[]) {
  QGuiApplication app(argc, argv);

  QGuiApplication::setApplicationName("Adhkar");
  QGuiApplication::setOrganizationName("Adhkar");
  QQuickStyle::setStyle("Fusion");

  AppController appController;
  QQmlApplicationEngine engine;
  engine.rootContext()->setContextProperty(QStringLiteral("appController"),
                                           &appController);

  QObject::connect(
      &engine, &QQmlApplicationEngine::objectCreationFailed, &app,
      []() { QCoreApplication::exit(-1); }, Qt::QueuedConnection);

  engine.load(QUrl(QStringLiteral("qrc:/qml/Main.qml")));

  return app.exec();
}
