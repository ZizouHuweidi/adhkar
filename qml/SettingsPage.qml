import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Panel {
    id: settingsPage

    signal toggleThemeRequested
    signal toggleLanguageRequested
    signal clearHistoryRequested

    implicitHeight: settingsColumn.implicitHeight + 44

    ColumnLayout {
        id: settingsColumn
        anchors.fill: parent
        anchors.margins: 22
        spacing: 18

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "Settings"
                color: app.textColor
                font.pixelSize: 24
                font.bold: true
            }
            Item {
                Layout.fillWidth: true
            }
            Label {
                text: "Preferences are saved locally"
                color: app.muted
                font.pixelSize: 13
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            color: app.borderColor
        }

        SettingRow {
            app: settingsPage.app
            title: "Appearance"
            description: "Switch between the light and dark reading themes."
            AppButton {
                app: settingsPage.app
                text: settingsPage.app.darkMode ? "Use light mode" : "Use dark mode"
                onClicked: settingsPage.toggleThemeRequested()
            }
        }

        SettingRow {
            app: settingsPage.app
            title: "Language"
            description: "Change the app chrome language. Arabic adhkar text is always shown in Arabic."
            AppButton {
                app: settingsPage.app
                text: settingsPage.app.appLanguage === "en" ? "Switch to Arabic" : "Switch to English"
                onClicked: settingsPage.toggleLanguageRequested()
            }
        }

        SettingRow {
            app: settingsPage.app
            title: "Arabic font"
            description: "Kitab is used for Arabic text in this prototype. Other font choices are hidden until we need them."
            Label {
                text: "Kitab"
                color: settingsPage.app.accent
                font.bold: true
                Layout.alignment: Qt.AlignVCenter | Qt.AlignRight
            }
        }

        SettingRow {
            app: settingsPage.app
            title: "Reading history"
            description: "Clear locally stored reading history. Favorites are not affected."
            AppButton {
                app: settingsPage.app
                text: "Clear history"
                onClicked: settingsPage.clearHistoryRequested()
            }
        }
    }
}
