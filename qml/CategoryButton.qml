import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Button {
    id: categoryButton
    required property var app
    required property var category
    property bool selected: false
    padding: 0
    implicitHeight: categoryContent.implicitHeight + 24
    background: Rectangle {
        radius: 14
        color: categoryButton.selected || categoryButton.hovered ? Qt.tint(app.surface, Qt.rgba(app.accent.r, app.accent.g, app.accent.b, 0.10)) : "transparent"
        border.color: categoryButton.selected || categoryButton.hovered ? app.accent : "transparent"
    }
    contentItem: ColumnLayout {
        id: categoryContent
        anchors.fill: parent
        anchors.margins: 12
        spacing: 4
        Label {
            text: categoryButton.category.name
            color: app.textColor
            font.bold: categoryButton.selected
        }
        Label {
            Layout.fillWidth: true
            text: categoryButton.category.name_ar
            color: app.muted
            horizontalAlignment: Text.AlignRight
            font.family: app.arabicFontFamily
            font.pixelSize: 16
        }
    }
}
