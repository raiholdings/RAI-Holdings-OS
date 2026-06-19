// RAI OS desktop shell (Tauri v2). Thin shell that opens the live workspace web app
// and supports auto-update via the Tauri updater plugin.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running RAI OS");
}
