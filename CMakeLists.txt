cmake_minimum_required(VERSION 3.21)

project(adhkar VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Quick QuickControls2)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(adhkar
    src/main.cpp
)

qt_add_resources(adhkar "app_resources"
    PREFIX "/"
    FILES
        qml/Main.qml
        data/adhkar.json
        fonts/arabic/kitab-base.woff2
        fonts/arabic/kitab-base-bold.woff2
)

target_link_libraries(adhkar
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Quick
        Qt6::QuickControls2
)

install(TARGETS adhkar
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)
