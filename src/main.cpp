#include <QGuiApplication>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonParseError>
#include <QQmlContext>
#include <QQmlApplicationEngine>
#include <QQuickStyle>
#include <QUrl>

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    QGuiApplication::setApplicationName("Adhkar");
    QGuiApplication::setOrganizationName("Adhkar");
    QQuickStyle::setStyle("Fusion");

    QQmlApplicationEngine engine;
    QFile dataFile(QStringLiteral(":/data/adhkar.json"));
    QVariantMap adhkarData;

    if (dataFile.open(QIODevice::ReadOnly)) {
        QJsonParseError parseError;
        const QJsonDocument document = QJsonDocument::fromJson(dataFile.readAll(), &parseError);
        if (parseError.error == QJsonParseError::NoError && document.isObject()) {
            adhkarData = document.object().toVariantMap();
        } else {
            qWarning("Failed to parse bundled adhkar data: %s", qPrintable(parseError.errorString()));
        }
    } else {
        qWarning("Failed to open bundled adhkar data");
    }

    engine.rootContext()->setContextProperty(QStringLiteral("adhkarData"), adhkarData);

    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreationFailed,
        &app,
        []() { QCoreApplication::exit(-1); },
        Qt::QueuedConnection);

    engine.load(QUrl(QStringLiteral("qrc:/qml/Main.qml")));

    return app.exec();
}
