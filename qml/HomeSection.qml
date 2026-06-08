pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: homeSection
    required property var app
    required property string title
    required property string subtitle
    property var categories: []

    signal openRequested(var category)

    spacing: 12

    RowLayout {
        Layout.fillWidth: true
        spacing: 16

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 3
            Label {
                text: title
                color: app.textColor
                font.pixelSize: 24
                font.bold: true
            }
            Label {
                text: subtitle
                color: app.muted
                wrapMode: Text.WordWrap
                Layout.fillWidth: true
            }
        }

        Label {
            text: categories.length + " collections"
            color: app.muted
            Layout.alignment: Qt.AlignRight | Qt.AlignTop
        }
    }

    GridLayout {
        Layout.fillWidth: true
        columns: app.width < 760 ? 1 : app.width < 1080 ? 2 : 3
        rowSpacing: 16
        columnSpacing: 16

        Repeater {
            model: categories
            delegate: CollectionCard {
                required property var modelData
                Layout.fillWidth: true
                app: homeSection.app
                category: modelData
                onOpenRequested: homeSection.openRequested(category)
            }
        }
    }
}
