import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: card
    required property var app
    required property var item
    required property int itemIndex
    required property var category
    property bool compact: false
    property bool expanded: false
    readonly property string idValue: app.reminderId(category, itemIndex)
    readonly property bool favorite: app.isFavorite(idValue)

    color: app.surface
    radius: 22
    border.color: app.borderColor
    implicitHeight: cardColumn.implicitHeight + 40

    ColumnLayout {
        id: cardColumn
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            Rectangle {
                Layout.preferredWidth: 34
                Layout.preferredHeight: 34
                radius: 17
                color: Qt.tint(card.app.surfaceStrong, Qt.rgba(card.app.accent.r, card.app.accent.g, card.app.accent.b, 0.12))
                border.color: card.app.borderColor

                Label {
                    anchors.centerIn: parent
                    text: String(card.itemIndex + 1)
                    color: card.app.accent
                    font.pixelSize: 13
                    font.bold: true
                }
            }

            Label {
                text: card.item.title || card.category.name
                color: card.app.textColor
                font.pixelSize: 14
                font.bold: true
                elide: Text.ElideRight
                Layout.fillWidth: true
            }

            Rectangle {
                visible: (card.item.count || "").length > 0
                Layout.preferredHeight: 30
                Layout.preferredWidth: countLabel.implicitWidth + 22
                radius: 15
                color: "transparent"
                border.color: card.app.borderColor

                Label {
                    id: countLabel
                    anchors.centerIn: parent
                    text: card.item.count + "x"
                    color: card.app.muted
                    font.pixelSize: 12
                    font.bold: true
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            implicitHeight: arabicText.implicitHeight + 26
            radius: 18
            color: Qt.rgba(card.app.surfaceStrong.r, card.app.surfaceStrong.g, card.app.surfaceStrong.b, card.app.darkMode ? 0.30 : 0.42)
            border.color: Qt.rgba(card.app.borderColor.r, card.app.borderColor.g, card.app.borderColor.b, 0.55)

            Label {
                id: arabicText
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                anchors.margins: 18
                text: card.item.arabic || ""
                color: card.app.textColor
                horizontalAlignment: Text.AlignRight
                wrapMode: Text.WordWrap
                lineHeight: card.compact ? 1.55 : 1.75
                font.family: card.app.arabicFontFamily
                font.pixelSize: card.compact ? 30 : Math.max(30, Math.min(42, card.app.width * 0.036))
            }

            TapHandler {
                onTapped: {
                    card.expanded = !card.expanded;
                    card.app.recordHistory(card.idValue, card.item, card.category);
                }
            }
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            Item {
                Layout.fillWidth: true
            }
            AppButton {
                app: card.app
                text: card.favorite ? "Saved" : "Favorite"
                highlighted: card.favorite
                onClicked: card.app.toggleFavorite(card.idValue)
            }
            AppButton {
                app: card.app
                text: card.expanded ? "Hide details" : "Show details"
                onClicked: {
                    card.expanded = !card.expanded;
                    card.app.recordHistory(card.idValue, card.item, card.category);
                }
            }
        }

        Rectangle {
            visible: card.expanded
            Layout.fillWidth: true
            implicitHeight: detailColumn.implicitHeight + 14
            color: "transparent"
            border.color: "transparent"

            Rectangle {
                anchors.top: parent.top
                anchors.left: parent.left
                anchors.right: parent.right
                height: 1
                color: card.app.borderColor
            }

            ColumnLayout {
                id: detailColumn
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.topMargin: 14
                spacing: 10

                DetailText {
                    app: card.app
                    label: "Translation"
                    value: card.item.translation || ""
                }
                DetailText {
                    app: card.app
                    label: "Transliteration"
                    value: card.item.transliteration || ""
                }
                DetailText {
                    app: card.app
                    label: "Reference"
                    value: card.item.reference || ""
                }
                DetailText {
                    app: card.app
                    label: "Virtue"
                    value: card.item.virtue || ""
                }
            }
        }
    }
}
