import QtQuick
import QtQuick.Controls

Button {
    id: appButton
    required property var app
    property bool accentText: false
    implicitHeight: 42
    padding: 10
    highlighted: false
    contentItem: Label {
        text: appButton.text
        color: appButton.accentText ? appButton.app.accent : appButton.app.textColor
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        font.bold: appButton.highlighted || appButton.accentText
        font.capitalization: Font.MixedCase
    }
    background: Rectangle {
        radius: 12
        color: appButton.highlighted ? Qt.tint(appButton.app.surface, Qt.rgba(appButton.app.accent.r, appButton.app.accent.g, appButton.app.accent.b, 0.14)) : appButton.app.surface
        border.color: appButton.hovered || appButton.highlighted ? appButton.app.accent : appButton.app.borderColor
    }
}
