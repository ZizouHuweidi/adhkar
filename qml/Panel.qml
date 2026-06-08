import QtQuick

Rectangle {
    required property var app
    property color colorOverride: app.surface

    color: colorOverride
    radius: 24
    border.color: app.borderColor
}
