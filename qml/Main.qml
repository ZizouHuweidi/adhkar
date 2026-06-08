pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtCore

ApplicationWindow {
    id: root

    width: 1180
    height: 780
    minimumWidth: 820
    minimumHeight: 560
    visible: true
    title: "Adhkar"

    property var categories: []
    property var selectedCategory: null
    property string currentPage: "home"
    property string activeTab: "dhikr"
    property string searchQuery: ""
    property bool darkMode: appController.theme === "dark"
    property string appLanguage: appController.language || "en"
    property var favoriteIds: []
    property int dataVersion: 0

    readonly property bool narrow: width < 900
    readonly property color bg: darkMode ? "#111c17" : "#f6f2ea"
    readonly property color bgEdge: darkMode ? "#0b130f" : "#efe5d5"
    readonly property color bgGlow: darkMode ? "#1f342b" : "#fdf6e7"
    readonly property color surface: darkMode ? "#17251f" : "#fffaf1"
    readonly property color surfaceStrong: darkMode ? "#20352c" : "#ede2d0"
    readonly property color textColor: darkMode ? "#ecf6ef" : "#26332c"
    readonly property color muted: darkMode ? "#a8b9af" : "#68786f"
    readonly property color accent: darkMode ? "#7ce0bd" : "#16735e"
    readonly property color borderColor: darkMode ? "#2c473c" : "#dfd2bd"
    readonly property color shadowColor: darkMode ? "#000000" : "#322614"
    readonly property string arabicFontFamily: kitabRegular.name

    Settings {
        id: settings
        category: "preferences"
        property string favoritesJson: "[]"
    }

    FontLoader {
        id: kitabRegular
        source: "qrc:/fonts/arabic/kitab-base.woff2"
    }
    FontLoader {
        id: kitabBold
        source: "qrc:/fonts/arabic/kitab-base-bold.woff2"
    }

    Component.onCompleted: {
        loadAdhkarData();
        migrateLegacyFavorites();
        reloadFavorites();
    }

    onDarkModeChanged: appController.savePreferences(darkMode ? "dark" : "light", appLanguage)
    onAppLanguageChanged: appController.savePreferences(darkMode ? "dark" : "light", appLanguage)

    function loadJsonSetting(raw, fallback) {
        try {
            return JSON.parse(raw || JSON.stringify(fallback));
        } catch (error) {
            return fallback;
        }
    }

    function loadAdhkarData() {
        root.categories = appController.categories || [];
    }

    function migrateLegacyFavorites() {
        const legacyFavorites = loadJsonSetting(settings.favoritesJson, []);
        if (legacyFavorites.length === 0 || appController.favoriteIds().length > 0)
            return;
        for (const id of legacyFavorites)
            appController.setFavorite(id, true);
        settings.favoritesJson = "[]";
    }

    function reloadFavorites() {
        root.favoriteIds = appController.favoriteIds();
        root.dataVersion += 1;
    }

    function goHome() {
        root.currentPage = "home";
        root.activeTab = "dhikr";
        root.searchQuery = "";
        root.selectedCategory = null;
    }

    function showTab(tab) {
        root.currentPage = "home";
        root.selectedCategory = null;
        root.searchQuery = "";
        root.activeTab = tab;
    }

    function reminderId(category, index) {
        return category.slug + "-" + index;
    }

    function isFavorite(id) {
        return root.favoriteIds.indexOf(id) !== -1;
    }

    function toggleFavorite(id) {
        if (appController.setFavorite(id, !root.isFavorite(id)))
            root.reloadFavorites();
    }

    function recordHistory(rowId, reminder, category) {
        const title = reminder.title || category.name;
        if (appController.recordHistory(rowId, title))
            root.dataVersion += 1;
    }

    function allReminders() {
        return appController.allRows();
    }

    function selectedRows() {
        if (!root.selectedCategory)
            return [];
        return appController.rowsForCategory(root.selectedCategory.slug);
    }

    function favoriteRows() {
        const _ = root.dataVersion;
        return appController.favoriteRows();
    }

    function historyRows() {
        const _ = root.dataVersion;
        return appController.historyRows(50);
    }

    function clearHistory() {
        if (appController.clearHistory())
            root.dataVersion += 1;
    }

    function searchRows() {
        const trimmed = root.searchQuery.trim();
        if (!trimmed)
            return [];
        return appController.searchRows(trimmed);
    }

    function categoriesForGroup(group) {
        return root.categories.filter(category => (category.group || "main") === group);
    }

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop {
                position: 0
                color: root.bgGlow
            }
            GradientStop {
                position: 0.44
                color: root.bg
            }
            GradientStop {
                position: 1
                color: root.bgEdge
            }
        }
    }

    ScrollView {
        anchors.fill: parent
        contentWidth: availableWidth
        clip: true

        ColumnLayout {
            width: root.width
            spacing: 18

            HeaderBar {
                Layout.fillWidth: true
                Layout.margins: 28
                Layout.bottomMargin: 0
                app: root
                onHomeRequested: root.goHome()
                onFavoritesRequested: root.showTab("favorites")
                onHistoryRequested: root.showTab("history")
                onSettingsRequested: root.currentPage = "settings"
            }

            TextField {
                visible: root.currentPage !== "settings"
                Layout.preferredHeight: visible ? implicitHeight : 0
                Layout.fillWidth: true
                Layout.leftMargin: 28
                Layout.rightMargin: 28
                placeholderText: "Search Arabic, translation, or transliteration"
                text: root.searchQuery
                color: root.textColor
                placeholderTextColor: root.muted
                selectedTextColor: root.surface
                selectionColor: root.accent
                onTextChanged: root.searchQuery = text
                background: Rectangle {
                    implicitHeight: 42
                    color: root.surface
                    radius: 12
                    border.color: root.borderColor
                }
            }

            Loader {
                Layout.fillWidth: true
                Layout.leftMargin: 28
                Layout.rightMargin: 28
                Layout.bottomMargin: 28
                sourceComponent: {
                    if (root.categories.length === 0)
                        return emptyDataView;
                    if (root.currentPage === "settings")
                        return settingsView;
                    if (root.searchQuery.trim())
                        return searchView;
                    if (root.activeTab === "favorites")
                        return favoritesView;
                    if (root.activeTab === "history")
                        return historyView;
                    return root.selectedCategory ? readerView : homeView;
                }
            }
        }
    }

    Component {
        id: emptyDataView

        Panel {
            app: root
            implicitHeight: 180
            ColumnLayout {
                anchors.centerIn: parent
                spacing: 8
                Label {
                    text: "No adhkar data loaded"
                    color: root.textColor
                    font.pixelSize: 22
                    font.bold: true
                }
                Label {
                    text: "Check the bundled data/adhkar.json resource."
                    color: root.muted
                }
            }
        }
    }

    Component {
        id: settingsView

        SettingsPage {
            app: root
            onToggleThemeRequested: root.darkMode = !root.darkMode
            onToggleLanguageRequested: root.appLanguage = root.appLanguage === "en" ? "ar" : "en"
            onClearHistoryRequested: root.clearHistory()
        }
    }

    Component {
        id: homeView

        HomePage {
            app: root
            mainCategories: root.categoriesForGroup("main")
            otherCategories: root.categoriesForGroup("others")
            onOpenRequested: category => {
                root.selectedCategory = category;
                root.currentPage = "home";
                root.activeTab = "dhikr";
            }
        }
    }

    Component {
        id: readerView

        ReaderPage {
            app: root
            categories: root.categories
            selectedCategory: root.selectedCategory
            reminderRows: root.selectedRows()
            onAllCollectionsRequested: root.selectedCategory = null
            onCategoryRequested: category => root.selectedCategory = category
        }
    }

    Component {
        id: searchView

        ResultListPage {
            app: root
            title: "Search results"
            subtitle: root.searchRows().length + " matches"
            resultRows: root.searchRows()
            emptyText: "No matching adhkar found."
            compactCards: true
        }
    }

    Component {
        id: favoritesView

        ResultListPage {
            app: root
            title: "Favorites"
            subtitle: root.favoriteRows().length + " saved"
            resultRows: root.favoriteRows()
            emptyText: "No favorites yet."
        }
    }

    Component {
        id: historyView

        HistoryPage {
            app: root
            history: root.historyRows()
            onClearRequested: root.clearHistory()
        }
    }
}
