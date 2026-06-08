cmake_minimum_required(VERSION 3.21)

project(adhkar VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Quick QuickControls2 Sql)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_library(adhkar_core STATIC
    src/core/AdhkarService.cpp
    src/core/AdhkarService.h
    src/core/ConfigService.cpp
    src/core/ConfigService.h
    src/core/DatabaseService.cpp
    src/core/DatabaseService.h
    src/core/PathService.cpp
    src/core/PathService.h
)

target_include_directories(adhkar_core
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(adhkar_core
    PUBLIC
        Qt6::Core
        Qt6::Sql
)

qt_add_resources(adhkar_core "data_resources"
    PREFIX "/"
    FILES
        data/adhkar.json
)

qt_add_executable(adhkar
    src/gui/main.cpp
    src/gui/AppController.cpp
    src/gui/AppController.h
)

qt_add_resources(adhkar "app_resources"
    PREFIX "/"
    FILES
        qml/AppButton.qml
        qml/CategoryButton.qml
        qml/CollectionCard.qml
        qml/DetailText.qml
        qml/HeaderBar.qml
        qml/HistoryPage.qml
        qml/HomePage.qml
        qml/HomeSection.qml
        qml/Main.qml
        qml/Panel.qml
        qml/ReaderPage.qml
        qml/ReminderCard.qml
        qml/ResultListPage.qml
        qml/SettingRow.qml
        qml/SettingsPage.qml
        fonts/arabic/kitab-base.woff2
        fonts/arabic/kitab-base-bold.woff2
)

target_link_libraries(adhkar
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Quick
        Qt6::QuickControls2
        adhkar_core
)

qt_add_executable(adhkarctl
    src/cli/main.cpp
)

target_link_libraries(adhkarctl
    PRIVATE
        adhkar_core
)

qt_add_executable(adhkar-daemon
    src/daemon/main.cpp
)

target_link_libraries(adhkar-daemon
    PRIVATE
        adhkar_core
)

install(TARGETS adhkar adhkarctl adhkar-daemon
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)
