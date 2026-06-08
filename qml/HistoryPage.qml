pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Panel {
    id: historyPage
    required property var history

    signal clearRequested

    implicitHeight: historyColumn.implicitHeight + 44

    ColumnLayout {
        id: historyColumn
        anchors.fill: parent
        anchors.margins: 22
        spacing: 14

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "History"
                color: app.textColor
                font.pixelSize: 22
                font.bold: true
            }
            Item {
                Layout.fillWidth: true
            }
            AppButton {
                app: historyPage.app
                text: "Clear"
                onClicked: historyPage.clearRequested()
            }
        }

        Label {
            visible: history.length === 0
            text: "No history yet."
            color: app.muted
        }

        Repeater {
            model: history
            delegate: Rectangle {
                id: historyDelegate
                required property var modelData
                Layout.fillWidth: true
                implicitHeight: 54
                color: historyPage.app.surface
                radius: 14
                border.color: historyPage.app.borderColor

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 16
                    Label {
                        text: historyDelegate.modelData.title
                        color: historyPage.app.textColor
                        font.bold: true
                    }
                    Item {
                        Layout.fillWidth: true
                    }
                    Label {
                        text: new Date(historyDelegate.modelData.shownAt).toLocaleString()
                        color: historyPage.app.muted
                        font.pixelSize: 13
                    }
                }
            }
        }
    }
}
