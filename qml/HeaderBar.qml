import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

RowLayout {
    id: headerBar
    required property var app

    signal homeRequested
    signal favoritesRequested
    signal historyRequested
    signal settingsRequested

    spacing: 20

    Button {
        id: titleButton
        Layout.fillWidth: true
        padding: 0
        onClicked: homeRequested()
        background: Rectangle {
            color: "transparent"
        }
        contentItem: ColumnLayout {
            spacing: 4

            Label {
                text: app.appLanguage === "ar" ? "الأذكار" : "Adhkar"
                color: titleButton.hovered ? app.accent : app.textColor
                font.pixelSize: Math.max(30, Math.min(44, app.width * 0.042))
                font.bold: true
                font.family: app.appLanguage === "ar" ? app.arabicFontFamily : "Sans Serif"
            }

            Label {
                Layout.fillWidth: true
                text: "Read daily remembrance offline with clear Arabic typography."
                color: app.muted
                wrapMode: Text.WordWrap
                lineHeight: 1.2
            }
        }
    }

    RowLayout {
        Layout.alignment: Qt.AlignRight | Qt.AlignBottom
        spacing: 8

        AppButton {
            app: headerBar.app
            text: "Home"
            highlighted: app.currentPage === "home" && !app.selectedCategory && app.activeTab === "dhikr"
            onClicked: homeRequested()
        }
        AppButton {
            app: headerBar.app
            text: "Favorites"
            highlighted: app.currentPage !== "settings" && app.activeTab === "favorites"
            onClicked: favoritesRequested()
        }
        AppButton {
            app: headerBar.app
            text: "History"
            highlighted: app.currentPage !== "settings" && app.activeTab === "history"
            onClicked: historyRequested()
        }
        AppButton {
            app: headerBar.app
            text: "Settings"
            highlighted: app.currentPage === "settings"
            onClicked: settingsRequested()
        }
    }
}
