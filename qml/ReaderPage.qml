pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

GridLayout {
    id: readerPage
    required property var app
    property var categories: []
    property var selectedCategory: null
    property var reminderRows: []

    signal allCollectionsRequested
    signal categoryRequested(var category)

    columns: app.narrow ? 1 : 2
    columnSpacing: 20
    rowSpacing: 20

    Panel {
        app: readerPage.app
        Layout.fillWidth: true
        Layout.preferredWidth: app.narrow ? -1 : 290
        Layout.maximumWidth: app.narrow ? Number.POSITIVE_INFINITY : 320
        Layout.alignment: Qt.AlignTop
        implicitHeight: sidebarColumn.implicitHeight + 32

        ColumnLayout {
            id: sidebarColumn
            anchors.fill: parent
            anchors.margins: 16
            spacing: 8

            AppButton {
                app: readerPage.app
                Layout.fillWidth: true
                text: "All collections"
                highlighted: false
                accentText: true
                onClicked: allCollectionsRequested()
            }

            Repeater {
                model: categories
                delegate: CategoryButton {
                    required property var modelData
                    Layout.fillWidth: true
                    app: readerPage.app
                    category: modelData
                    selected: readerPage.selectedCategory && readerPage.selectedCategory.slug === modelData.slug
                    onClicked: readerPage.categoryRequested(modelData)
                }
            }
        }
    }

    Panel {
        app: readerPage.app
        Layout.fillWidth: true
        Layout.alignment: Qt.AlignTop
        implicitHeight: contentColumn.implicitHeight + 44

        ColumnLayout {
            id: contentColumn
            anchors.fill: parent
            anchors.margins: 22
            spacing: 14

            RowLayout {
                Layout.fillWidth: true
                spacing: 16

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 4
                    Label {
                        text: selectedCategory ? selectedCategory.name : ""
                        color: app.accent
                        font.pixelSize: 12
                        font.bold: true
                    }
                    Label {
                        Layout.fillWidth: true
                        text: selectedCategory ? selectedCategory.name_ar : ""
                        color: app.textColor
                        horizontalAlignment: Text.AlignRight
                        font.family: app.arabicFontFamily
                        font.pixelSize: 30
                        lineHeight: 1.5
                        wrapMode: Text.WordWrap
                    }
                }

                Label {
                    text: selectedCategory ? selectedCategory.dhikr.length + " reminders" : ""
                    color: app.muted
                    Layout.alignment: Qt.AlignTop | Qt.AlignRight
                }
            }

            Repeater {
                model: readerPage.reminderRows
                delegate: ReminderCard {
                    required property var modelData
                    Layout.fillWidth: true
                    app: readerPage.app
                    item: modelData.item
                    itemIndex: modelData.index
                    category: modelData.category
                }
            }
        }
    }
}
