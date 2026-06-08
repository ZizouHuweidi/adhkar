pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Panel {
    id: resultListPage
    required property string title
    required property string subtitle
    required property var resultRows
    required property string emptyText
    property bool compactCards: false

    implicitHeight: resultColumn.implicitHeight + 44

    ColumnLayout {
        id: resultColumn
        anchors.fill: parent
        anchors.margins: 22
        spacing: 14

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: title
                color: app.textColor
                font.pixelSize: 22
                font.bold: true
            }
            Item {
                Layout.fillWidth: true
            }
            Label {
                text: subtitle
                color: app.muted
            }
        }

        Label {
            visible: resultListPage.resultRows.length === 0
            text: emptyText
            color: app.muted
        }

        Repeater {
            model: resultListPage.resultRows
            delegate: ReminderCard {
                required property var modelData
                Layout.fillWidth: true
                app: resultListPage.app
                compact: resultListPage.compactCards
                item: modelData.item
                itemIndex: modelData.index
                category: modelData.category
            }
        }
    }
}
