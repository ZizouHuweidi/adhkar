set shell := ["bash", "-uc"]

build_dir := "build"
app := "adhkar"
cli := "adhkarctl"
daemon := "adhkar-daemon"

# List available recipes.
default:
    @just --list

# Show the Qt/CMake toolchain available in the current shell.
doctor:
    @printf "Shell: %s\n" "$SHELL"
    @which cmake ninja g++ qt-cmake qmake6 qmllint-qt6 qmlformat-qt6 clang-format
    @cmake --version | sed -n "1p"
    @qmake6 --version

# Configure the CMake build directory.
configure:
    cmake -S . -B {{build_dir}} -G Ninja -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

# Build the app.
build: configure
    cmake --build {{build_dir}}

# Run the app in the current desktop session.
run: build
    ./{{build_dir}}/{{app}}

# Run with Qt's offscreen platform to catch startup/QML errors in non-GUI shells.
run-offscreen: build
    @QT_QPA_PLATFORM=offscreen timeout 5s ./{{build_dir}}/{{app}}; status=$?; test "$status" = 0 -o "$status" = 124

# Run the CLI. Usage: just ctl -- categories
ctl *args: build
    ./{{build_dir}}/{{cli}} {{args}}

# Show config, database, and cache paths.
paths: build
    ./{{build_dir}}/{{cli}} paths

# List dhikr categories using the shared core API.
categories: build
    ./{{build_dir}}/{{cli}} categories

# Search adhkar using the shared core API. Usage: just search mercy
search *query: build
    ./{{build_dir}}/{{cli}} search {{query}}

# Show daemon initialization status.
daemon-status: build
    ./{{build_dir}}/{{daemon}} --status

# Run the headless daemon loop.
daemon: build
    ./{{build_dir}}/{{daemon}}

# Run quick verification checks.
check: build run-offscreen

# Lint QML files. This is intentionally separate because the current prototype
# uses dynamic JSON data and a single large QML file, which makes qmllint noisy.
lint-qml:
    qmllint-qt6 qml/*.qml

# Format QML files in place.
fmt-qml:
    qmlformat-qt6 -i qml/*.qml

# Format C++ files in place.
fmt-cpp:
    clang-format -i src/core/*.cpp src/gui/*.cpp src/cli/*.cpp src/daemon/*.cpp

# Format source files.
fmt: fmt-qml fmt-cpp

# Remove build output.
clean:
    rm -rf {{build_dir}}

# Clean and rebuild from scratch.
rebuild: clean build
