set shell := ["bash", "-uc"]

build_dir := "build"
app := "adhkar"

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

# Run quick verification checks.
check: build run-offscreen

# Lint QML files. This is intentionally separate because the current prototype
# uses dynamic JSON data and a single large QML file, which makes qmllint noisy.
lint-qml:
    qmllint-qt6 qml/Main.qml

# Format QML files in place.
fmt-qml:
    qmlformat-qt6 -i qml/Main.qml

# Format C++ files in place.
fmt-cpp:
    clang-format -i src/*.cpp

# Format source files.
fmt: fmt-qml fmt-cpp

# Remove build output.
clean:
    rm -rf {{build_dir}}

# Clean and rebuild from scratch.
rebuild: clean build
