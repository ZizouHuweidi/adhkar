import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: settingRow
    required property var app
    required property string title
    required property string description
    default property alias controls: controlHost.data
    Layout.fillWidth: true
    implicitHeight: Math.max(textColumn.implicitHeight, controlHost.implicitHeight) + 24
    color: "transparent"
    radius: 14
    border.color: app.borderColor

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 18

        ColumnLayout {
            id: textColumn
            Layout.fillWidth: true
            spacing: 4

            Label {
                text: settingRow.title
                color: app.textColor
                font.bold: true
                font.pixelSize: 15
            }

            Label {
                Layout.fillWidth: true
                text: settingRow.description
                color: app.muted
                wrapMode: Text.WordWrap
                lineHeight: 1.2
            }
        }

        RowLayout {
            id: controlHost
            Layout.alignment: Qt.AlignVCenter | Qt.AlignRight
            spacing: 8
        }
    }
}
