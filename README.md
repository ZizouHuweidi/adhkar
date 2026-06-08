# Adhkar

Desktop app for reading daily Islamic adhkar with clear Arabic typography.

## Build And Run

Requires Qt 6, CMake, Ninja, a C++ compiler, and `just`.

```bash
just build
just run
```

Run a quick build/startup check:

```bash
just check
```

## CLI

The same core API is available through `adhkarctl`:

```bash
just paths
just categories
just search mercy
just ctl -- show morning
```

## Daemon

The headless daemon is being built for future reminders and notifications:

```bash
just daemon-status
```

## Notes

- Arabic text currently uses the bundled Kitab font.
- Settings are stored in the XDG config directory.
- App data is stored in a local SQLite database under the XDG data directory.
- Qt is used through open-source, dynamically linked packages.
