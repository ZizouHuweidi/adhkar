import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Button {
    id: collectionCard
    required property var app
    required property var category

    signal openRequested
    Layout.preferredHeight: 164
    padding: 0
    onClicked: openRequested()
    background: Rectangle {
        radius: 24
        color: collectionCard.hovered ? Qt.tint(app.surface, Qt.rgba(app.accent.r, app.accent.g, app.accent.b, 0.08)) : app.surface
        border.color: collectionCard.hovered ? app.accent : app.borderColor
    }

    contentItem: ColumnLayout {
        anchors.fill: parent
        anchors.margins: 22
        spacing: 8

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: collectionCard.category.name
                color: app.accent
                font.pixelSize: 13
                font.bold: true
                font.letterSpacing: 1.0
                Layout.fillWidth: true
                elide: Text.ElideRight
            }
            Label {
                text: collectionCard.category.dhikr.length
                color: app.muted
                font.pixelSize: 13
            }
        }

        Label {
            Layout.fillWidth: true
            text: collectionCard.category.name_ar
            color: app.textColor
            horizontalAlignment: Text.AlignRight
            font.family: app.arabicFontFamily
            font.pixelSize: 31
            lineHeight: 1.35
            wrapMode: Text.WordWrap
        }

        Item {
            Layout.fillHeight: true
        }

        Label {
            text: collectionCard.category.dhikr.length + " reminders"
            color: app.muted
            font.pixelSize: 13
        }
    }
}
