import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: detailText
    required property var app
    required property string label
    required property string value
    visible: value.length > 0
    spacing: 4

    Label {
        text: detailText.label
        color: app.textColor
        font.bold: true
    }
    Label {
        Layout.fillWidth: true
        text: detailText.value
        color: app.muted
        wrapMode: Text.WordWrap
        lineHeight: 1.25
    }
}
