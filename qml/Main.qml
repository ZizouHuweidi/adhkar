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
    property bool darkMode: settings.darkMode
    property string appLanguage: settings.language || "en"
    property var favorites: loadJsonSetting(settings.favoritesJson, [])
    property var history: loadJsonSetting(settings.historyJson, [])

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
        property bool darkMode: false
        property string language: "en"
        property string favoritesJson: "[]"
        property string historyJson: "[]"
    }

    FontLoader { id: kitabRegular; source: "qrc:/fonts/arabic/kitab-base.woff2" }
    FontLoader { id: kitabBold; source: "qrc:/fonts/arabic/kitab-base-bold.woff2" }

    Component.onCompleted: loadAdhkarData()

    onDarkModeChanged: settings.darkMode = darkMode
    onAppLanguageChanged: settings.language = appLanguage
    onFavoritesChanged: settings.favoritesJson = JSON.stringify(favorites)
    onHistoryChanged: settings.historyJson = JSON.stringify(history)

    function loadJsonSetting(raw, fallback) {
        try {
            return JSON.parse(raw || JSON.stringify(fallback));
        } catch (error) {
            return fallback;
        }
    }

    function loadAdhkarData() {
        const mainCategories = adhkarData.main || [];
        const otherCategories = adhkarData.others || [];
        root.categories = mainCategories.concat(otherCategories);
    }

    function goHome() {
        root.currentPage = "home";
        root.activeTab = "dhikr";
        root.searchQuery = "";
        root.selectedCategory = null;
    }

    function reminderId(category, index) {
        return category.slug + "-" + index;
    }

    function isFavorite(id) {
        return root.favorites.indexOf(id) !== -1;
    }

    function toggleFavorite(id) {
        const next = root.favorites.slice();
        const existingIndex = next.indexOf(id);
        if (existingIndex === -1)
            next.push(id);
        else
            next.splice(existingIndex, 1);
        root.favorites = next;
    }

    function recordHistory(reminder, category) {
        const next = root.history.slice();
        next.unshift({
            title: reminder.title || category.name,
            shownAt: new Date().toISOString()
        });
        root.history = next.slice(0, 50);
    }

    function allReminders() {
        const rows = [];
        for (let categoryIndex = 0; categoryIndex < root.categories.length; categoryIndex += 1) {
            const category = root.categories[categoryIndex];
            for (let itemIndex = 0; itemIndex < category.dhikr.length; itemIndex += 1) {
                const item = category.dhikr[itemIndex];
                rows.push({
                    category: category,
                    item: item,
                    index: itemIndex,
                    id: reminderId(category, itemIndex)
                });
            }
        }
        return rows;
    }

    function selectedRows() {
        if (!root.selectedCategory)
            return [];
        return root.selectedCategory.dhikr.map((item, index) => ({
            category: root.selectedCategory,
            item: item,
            index: index,
            id: reminderId(root.selectedCategory, index)
        }));
    }

    function favoriteRows() {
        return allReminders().filter(row => isFavorite(row.id));
    }

    function searchRows() {
        const trimmed = root.searchQuery.trim();
        const query = trimmed.toLowerCase();
        if (!query)
            return [];
        return allReminders().filter(row =>
            (row.item.arabic || "").indexOf(trimmed) !== -1
            || (row.item.title || "").toLowerCase().indexOf(query) !== -1
            || (row.item.translation || "").toLowerCase().indexOf(query) !== -1
            || (row.item.transliteration || "").toLowerCase().indexOf(query) !== -1);
    }

    function tabLabel(tab) {
        return tab;
    }

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0; color: root.bgGlow }
            GradientStop { position: 0.44; color: root.bg }
            GradientStop { position: 1; color: root.bgEdge }
        }
    }

    ScrollView {
        anchors.fill: parent
        contentWidth: availableWidth
        clip: true

        ColumnLayout {
            width: root.width
            spacing: 18

            RowLayout {
                Layout.fillWidth: true
                Layout.margins: 28
                Layout.bottomMargin: 0
                spacing: 24

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 8

                    Label {
                        text: "Daily remembrance"
                        color: root.accent
                        font.pixelSize: 12
                        font.bold: true
                        font.letterSpacing: 1.3
                    }

                    Button {
                        id: titleButton
                        padding: 0
                        onClicked: root.goHome()
                        background: Rectangle { color: "transparent" }
                        contentItem: Label {
                            text: root.appLanguage === "ar" ? "الأذكار" : "Adhkar"
                            color: titleButton.hovered ? root.accent : root.textColor
                            font.pixelSize: Math.max(34, Math.min(56, root.width * 0.052))
                            font.bold: true
                            font.family: root.appLanguage === "ar" ? root.arabicFontFamily : "Sans Serif"
                        }
                    }

                    Label {
                        Layout.maximumWidth: 720
                        text: "Read morning, evening, and daily adhkar offline with clear Arabic typography, saved favorites, and local reading history."
                        color: root.muted
                        wrapMode: Text.WordWrap
                        lineHeight: 1.25
                    }
                }

                RowLayout {
                    Layout.alignment: Qt.AlignRight | Qt.AlignBottom
                    spacing: 10

                    AppButton { text: "Home"; highlighted: root.currentPage === "home" && !root.selectedCategory && root.activeTab === "dhikr"; onClicked: root.goHome() }
                    AppButton { text: "Settings"; highlighted: root.currentPage === "settings"; onClicked: root.currentPage = "settings" }
                }
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

            RowLayout {
                visible: root.currentPage !== "settings"
                Layout.preferredHeight: visible ? implicitHeight : 0
                Layout.leftMargin: 28
                Layout.rightMargin: 28
                spacing: 8

                Repeater {
                    model: ["dhikr", "favorites", "history"]
                    delegate: AppButton {
                        required property string modelData
                        text: root.tabLabel(modelData)
                        highlighted: root.activeTab === modelData
                        onClicked: root.activeTab = modelData
                    }
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
                    return root.selectedCategory ? detailView : homeView;
                }
            }
        }
    }

    Component {
        id: emptyDataView

        Panel {
            implicitHeight: 180
            ColumnLayout {
                anchors.centerIn: parent
                spacing: 8
                Label { text: "No adhkar data loaded"; color: root.textColor; font.pixelSize: 22; font.bold: true }
                Label { text: "Check the bundled data/adhkar.json resource."; color: root.muted }
            }
        }
    }

    Component {
        id: settingsView

        Panel {
            implicitHeight: settingsColumn.implicitHeight + 44

            ColumnLayout {
                id: settingsColumn
                anchors.fill: parent
                anchors.margins: 22
                spacing: 18

                RowLayout {
                    Layout.fillWidth: true
                    Label { text: "Settings"; color: root.textColor; font.pixelSize: 24; font.bold: true }
                    Item { Layout.fillWidth: true }
                    Label { text: "Preferences are saved locally"; color: root.muted; font.pixelSize: 13 }
                }

                Rectangle { Layout.fillWidth: true; Layout.preferredHeight: 1; color: root.borderColor }

                SettingRow {
                    title: "Appearance"
                    description: "Switch between the light and dark reading themes."
                    AppButton {
                        text: root.darkMode ? "Use light mode" : "Use dark mode"
                        onClicked: root.darkMode = !root.darkMode
                    }
                }

                SettingRow {
                    title: "Language"
                    description: "Change the app chrome language. Arabic adhkar text is always shown in Arabic."
                    AppButton {
                        text: root.appLanguage === "en" ? "Switch to Arabic" : "Switch to English"
                        onClicked: root.appLanguage = root.appLanguage === "en" ? "ar" : "en"
                    }
                }

                SettingRow {
                    title: "Arabic font"
                    description: "Kitab is used for Arabic text in this prototype. Other font choices are hidden until we need them."
                    Label {
                        text: "Kitab"
                        color: root.accent
                        font.bold: true
                        Layout.alignment: Qt.AlignVCenter | Qt.AlignRight
                    }
                }

                SettingRow {
                    title: "Reading history"
                    description: "Clear locally stored reading history. Favorites are not affected."
                    AppButton {
                        text: "Clear history"
                        onClicked: root.history = []
                    }
                }
            }
        }
    }

    Component {
        id: homeView

        GridLayout {
            columns: root.width < 760 ? 1 : root.width < 1080 ? 2 : 3
            rowSpacing: 16
            columnSpacing: 16

            Repeater {
                model: root.categories
                delegate: CollectionCard {
                    required property var modelData
                    Layout.fillWidth: true
                    category: modelData
                    onOpenRequested: {
                        root.selectedCategory = category;
                        root.currentPage = "home";
                        root.activeTab = "dhikr";
                    }
                }
            }
        }
    }

    Component {
        id: detailView

        GridLayout {
            columns: root.narrow ? 1 : 2
            columnSpacing: 20
            rowSpacing: 20

            Panel {
                Layout.fillWidth: true
                Layout.preferredWidth: root.narrow ? -1 : 290
                Layout.maximumWidth: root.narrow ? Number.POSITIVE_INFINITY : 320
                Layout.alignment: Qt.AlignTop
                implicitHeight: sidebarColumn.implicitHeight + 32

                ColumnLayout {
                    id: sidebarColumn
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 8

                    AppButton {
                        Layout.fillWidth: true
                        text: "All collections"
                        highlighted: false
                        accentText: true
                        onClicked: root.selectedCategory = null
                    }

                    Repeater {
                        model: root.categories
                        delegate: CategoryButton {
                            required property var modelData
                            Layout.fillWidth: true
                            category: modelData
                            selected: root.selectedCategory && root.selectedCategory.slug === modelData.slug
                            onClicked: root.selectedCategory = modelData
                        }
                    }
                }
            }

            Panel {
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
                                text: root.selectedCategory ? root.selectedCategory.name : ""
                                color: root.accent
                                font.pixelSize: 12
                                font.bold: true
                            }
                            Label {
                                Layout.fillWidth: true
                                text: root.selectedCategory ? root.selectedCategory.name_ar : ""
                                color: root.textColor
                                horizontalAlignment: Text.AlignRight
                                font.family: root.arabicFontFamily
                                font.pixelSize: 30
                                lineHeight: 1.5
                                wrapMode: Text.WordWrap
                            }
                        }

                        Label {
                            text: root.selectedCategory ? root.selectedCategory.dhikr.length + " reminders" : ""
                            color: root.muted
                            Layout.alignment: Qt.AlignTop | Qt.AlignRight
                        }
                    }

                    Repeater {
                        model: root.selectedRows()
                        delegate: ReminderCard {
                            required property var modelData
                            Layout.fillWidth: true
                            item: modelData.item
                            itemIndex: modelData.index
                            category: modelData.category
                        }
                    }
                }
            }
        }
    }

    Component {
        id: searchView

        Panel {
            implicitHeight: searchColumn.implicitHeight + 36
            colorOverride: Qt.rgba(root.surfaceStrong.r, root.surfaceStrong.g, root.surfaceStrong.b, 0.45)

            ColumnLayout {
                id: searchColumn
                anchors.fill: parent
                anchors.margins: 18
                spacing: 14

                Label {
                    text: "Search results (" + root.searchRows().length + ")"
                    color: root.textColor
                    font.pixelSize: 18
                    font.bold: true
                }

                Repeater {
                    model: root.searchRows()
                    delegate: ReminderCard {
                        required property var modelData
                        Layout.fillWidth: true
                        compact: true
                        item: modelData.item
                        itemIndex: modelData.index
                        category: modelData.category
                    }
                }
            }
        }
    }

    Component {
        id: favoritesView

        Panel {
            implicitHeight: favoritesColumn.implicitHeight + 44

            ColumnLayout {
                id: favoritesColumn
                anchors.fill: parent
                anchors.margins: 22
                spacing: 14

                RowLayout {
                    Layout.fillWidth: true
                    Label { text: "Favorites"; color: root.textColor; font.pixelSize: 22; font.bold: true }
                    Item { Layout.fillWidth: true }
                    Label { text: root.favoriteRows().length + " saved"; color: root.muted }
                }

                Label {
                    visible: root.favoriteRows().length === 0
                    text: "No favorites yet."
                    color: root.muted
                }

                Repeater {
                    model: root.favoriteRows()
                    delegate: ReminderCard {
                        required property var modelData
                        Layout.fillWidth: true
                        item: modelData.item
                        itemIndex: modelData.index
                        category: modelData.category
                    }
                }
            }
        }
    }

    Component {
        id: historyView

        Panel {
            implicitHeight: historyColumn.implicitHeight + 44

            ColumnLayout {
                id: historyColumn
                anchors.fill: parent
                anchors.margins: 22
                spacing: 14

                RowLayout {
                    Layout.fillWidth: true
                    Label { text: "History"; color: root.textColor; font.pixelSize: 22; font.bold: true }
                    Item { Layout.fillWidth: true }
                    AppButton { text: "Clear"; onClicked: root.history = [] }
                }

                Label {
                    visible: root.history.length === 0
                    text: "No history yet."
                    color: root.muted
                }

                Repeater {
                    model: root.history
                    delegate: Rectangle {
                        id: historyDelegate
                        required property var modelData
                        Layout.fillWidth: true
                        implicitHeight: 54
                        color: root.surface
                        radius: 14
                        border.color: root.borderColor

                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 12
                            spacing: 16
                            Label { text: historyDelegate.modelData.title; color: root.textColor; font.bold: true }
                            Item { Layout.fillWidth: true }
                            Label { text: new Date(historyDelegate.modelData.shownAt).toLocaleString(); color: root.muted; font.pixelSize: 13 }
                        }
                    }
                }
            }
        }
    }

    component Panel: Rectangle {
        property color colorOverride: root.surface

        color: colorOverride
        radius: 24
        border.color: root.borderColor
        layer.enabled: true
        layer.samples: 4
    }

    component AppButton: Button {
        property bool accentText: false

        id: appButton
        implicitHeight: 42
        padding: 10
        highlighted: false
        contentItem: Label {
            text: appButton.text
            color: appButton.accentText ? root.accent : root.textColor
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
            font.bold: appButton.highlighted || appButton.accentText
            font.capitalization: Font.MixedCase
        }
        background: Rectangle {
            radius: 12
            color: appButton.highlighted ? Qt.tint(root.surface, Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.14)) : root.surface
            border.color: appButton.hovered || appButton.highlighted ? root.accent : root.borderColor
        }
    }

    component SettingRow: Rectangle {
        required property string title
        required property string description
        default property alias controls: controlHost.data

        id: settingRow
        Layout.fillWidth: true
        implicitHeight: Math.max(textColumn.implicitHeight, controlHost.implicitHeight) + 24
        color: "transparent"
        radius: 14
        border.color: root.borderColor

        RowLayout {
            anchors.fill: parent
            anchors.margins: 12
            spacing: 18

            ColumnLayout {
                id: textColumn
                Layout.fillWidth: true
                spacing: 4

                Label {
                    text: settingRow.title
                    color: root.textColor
                    font.bold: true
                    font.pixelSize: 15
                }

                Label {
                    Layout.fillWidth: true
                    text: settingRow.description
                    color: root.muted
                    wrapMode: Text.WordWrap
                    lineHeight: 1.2
                }
            }

            RowLayout {
                id: controlHost
                Layout.alignment: Qt.AlignVCenter | Qt.AlignRight
                spacing: 8
            }
        }
    }

    component CollectionCard: Button {
        required property var category
        signal openRequested

        id: collectionCard
        Layout.preferredHeight: 160
        padding: 0
        onClicked: openRequested()
        background: Rectangle {
            radius: 24
            color: collectionCard.hovered ? Qt.tint(root.surface, Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.08)) : root.surface
            border.color: collectionCard.hovered ? root.accent : root.borderColor
        }

        contentItem: ColumnLayout {
            anchors.fill: parent
            anchors.margins: 22
            spacing: 8

            Label {
                text: collectionCard.category.name
                color: root.accent
                font.pixelSize: 13
                font.bold: true
                font.letterSpacing: 1.0
            }

            Label {
                Layout.fillWidth: true
                text: collectionCard.category.name_ar
                color: root.textColor
                horizontalAlignment: Text.AlignRight
                font.family: root.arabicFontFamily
                font.pixelSize: 30
                lineHeight: 1.35
                wrapMode: Text.WordWrap
            }

            Item { Layout.fillHeight: true }

            Label {
                text: collectionCard.category.dhikr.length + " reminders"
                color: root.muted
                font.pixelSize: 13
            }
        }
    }

    component CategoryButton: Button {
        required property var category
        property bool selected: false

        id: categoryButton
        padding: 0
        implicitHeight: categoryContent.implicitHeight + 24
        background: Rectangle {
            radius: 14
            color: categoryButton.selected || categoryButton.hovered ? Qt.tint(root.surface, Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.10)) : "transparent"
            border.color: categoryButton.selected || categoryButton.hovered ? root.accent : "transparent"
        }
        contentItem: ColumnLayout {
            id: categoryContent
            anchors.fill: parent
            anchors.margins: 12
            spacing: 4
            Label { text: categoryButton.category.name; color: root.textColor; font.bold: categoryButton.selected }
            Label {
                Layout.fillWidth: true
                text: categoryButton.category.name_ar
                color: root.muted
                horizontalAlignment: Text.AlignRight
                font.family: root.arabicFontFamily
                font.pixelSize: 16
            }
        }
    }

    component ReminderCard: Rectangle {
        required property var item
        required property int itemIndex
        required property var category
        property bool compact: false

        id: card
        property bool expanded: false
        readonly property string idValue: root.reminderId(category, itemIndex)

        color: root.surface
        radius: 20
        border.color: root.borderColor
        implicitHeight: cardColumn.implicitHeight + 36

        ColumnLayout {
            id: cardColumn
            anchors.fill: parent
            anchors.margins: 18
            spacing: 12

            RowLayout {
                Layout.fillWidth: true
                spacing: 10
                Label { text: String(card.itemIndex + 1); color: root.muted; font.pixelSize: 13 }
                Label {
                    text: card.item.title || card.category.name
                    color: root.muted
                    font.pixelSize: 13
                    font.bold: true
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
                Label { text: card.item.count || ""; color: root.muted; font.pixelSize: 13 }
            }

            Label {
                Layout.fillWidth: true
                text: card.item.arabic || ""
                color: root.textColor
                horizontalAlignment: Text.AlignRight
                wrapMode: Text.WordWrap
                lineHeight: card.compact ? 1.55 : 1.75
                font.family: root.arabicFontFamily
                font.pixelSize: card.compact ? 30 : Math.max(30, Math.min(42, root.width * 0.036))

                TapHandler {
                    onTapped: {
                        card.expanded = !card.expanded;
                        root.recordHistory(card.item, card.category);
                    }
                }
            }

            RowLayout {
                spacing: 8
                AppButton {
                    text: root.isFavorite(card.idValue) ? "Remove favorite" : "Favorite"
                    onClicked: root.toggleFavorite(card.idValue)
                }
                AppButton {
                    text: card.expanded ? "Hide details" : "Show details"
                    onClicked: {
                        card.expanded = !card.expanded;
                        root.recordHistory(card.item, card.category);
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
                    color: root.borderColor
                }

                ColumnLayout {
                    id: detailColumn
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.top: parent.top
                    anchors.topMargin: 14
                    spacing: 10

                    DetailText { label: "Translation"; value: card.item.translation || "" }
                    DetailText { label: "Transliteration"; value: card.item.transliteration || "" }
                    DetailText { label: "Reference"; value: card.item.reference || "" }
                    DetailText { label: "Virtue"; value: card.item.virtue || "" }
                }
            }
        }
    }

    component DetailText: ColumnLayout {
        required property string label
        required property string value

        id: detailText
        visible: value.length > 0
        spacing: 4

        Label { text: detailText.label; color: root.textColor; font.bold: true }
        Label {
            Layout.fillWidth: true
            text: detailText.value
            color: root.muted
            wrapMode: Text.WordWrap
            lineHeight: 1.25
        }
    }
}
