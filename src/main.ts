import CustomSettingsManager from "./custom_settings";
import Handler from "./handler"
import Patcher from "./patcher"

dependOn("betterSettings.js", () => {
    let on_change = {cb: () => {}}
    const settings_manager = new CustomSettingsManager(on_change)

    runAfterLoad(() => {
        const patcher = new Patcher(settings_manager)
        const handler = new Handler(settings_manager, patcher)
        on_change.cb = () => patcher.update_from_settings()
    })
}, true);