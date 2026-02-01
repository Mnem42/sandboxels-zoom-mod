import CustomSettingsManager from "./custom_settings";
import Handler from "./handler"
import Patcher from "./patcher"

dependOn("betterSettings.js", () => {
    const on_change = {cb: () => {}}
    const settings_manager = new CustomSettingsManager(on_change)

    const patcher = new Patcher(settings_manager)
    const handler = new Handler(settings_manager, patcher)
}, true);