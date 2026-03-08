import CustomSettingsManager from "./custom_settings";
import Handler from "./handler"
import Patcher from "./patcher"
import { patch_worldedit } from "./worldedit_interop";

dependOn("betterSettings.js", () => {
    const on_change = {cb: () => {}}
    const settings_manager = new CustomSettingsManager(on_change)

    runAfterLoad(() => {
        const patcher = new Patcher(settings_manager)
        const handler = new Handler(settings_manager, patcher)
    
        dependOn("worldEdit.js", () => patch_worldedit(handler))
        
        on_change.cb = () => patcher.update_from_settings()
    })
}, true);