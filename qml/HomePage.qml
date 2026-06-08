import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: homePage
    required property var app
    property var mainCategories: []
    property var otherCategories: []

    signal openRequested(var category)

    spacing: 22

    HomeSection {
        app: homePage.app
        title: "Main Adhkar"
        subtitle: "Morning, evening, and core daily remembrances."
        categories: mainCategories
        onOpenRequested: category => homePage.openRequested(category)
    }

    HomeSection {
        visible: otherCategories.length > 0
        Layout.preferredHeight: visible ? implicitHeight : 0
        app: homePage.app
        title: "Other Adhkar"
        subtitle: "Situational supplications and additional collections."
        categories: otherCategories
        onOpenRequested: category => homePage.openRequested(category)
    }
}
