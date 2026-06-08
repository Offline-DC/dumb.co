# App icons

Tauri needs platform icons to bundle. Generate them once from a single square
PNG (1024×1024 recommended):

```bash
# from desktop-signin/
cargo tauri icon path/to/dumbdown-icon.png
# (or: npx @tauri-apps/cli icon path/to/dumbdown-icon.png)
```

That writes `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns` (macOS),
`icon.ico` (Windows), and the Windows Store logos into this folder — matching
the `bundle.icon` list in `../tauri.conf.json`.

Until you run that, `cargo tauri build` will fail with a missing-icon error.
`cargo tauri dev` works without icons.
