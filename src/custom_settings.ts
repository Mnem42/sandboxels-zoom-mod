import { def_classes, GNumList, GSettingGroup, Numlist } from "./custom_setting_types"

export default class CustomSettingsManager {
    public canvas_bkg: Setting<string>
    public zoom: GNumList<[Numlist, typeof this.unl_zoom]>
    public unl_zoom: GSettingGroup<{
        speed: Setting<number>, 
        min: Setting<number>, 
        max: Setting<number>
    }>

    public fpan_speed: Setting<number> 
    public cpan_speed: Setting<number> 
    public upan_speed: Setting<number> 

    public pan_keys: SelectSetting<"wasd" | "ijkl" | "">
    public show_floater: Setting<boolean> 
    public show_pos: Setting<boolean>

    public enable_scroll_zoom: Setting<boolean>
    public scroll_zoom_multiplier: Setting<number>

    public pan_zeroing_en: Setting<boolean>
    public zoom_zeroing_en: Setting<boolean>

    constructor(on_edit: { cb: (settings: CustomSettingsManager) => void }) {
        const { Numlist, MultiSetting, SettingGroup } = def_classes()

        const settings_tab = new SettingsTab("zoom.js")
        const validator = () => { on_edit.cb(this); return true } // Mildly  hacky way to do hot reload

        this.canvas_bkg = new Setting(
            "Canvas background", 
            "canvas_bkg", 
            settingType.COLOR, 
            false, 
            "#252525",
            "The colour for the area around the canvas",
            validator
        );

        this.cpan_speed = new Setting(
            "Coarse pan speed", 
            "cpan_speed", 
            settingType.NUMBER, 
            false, 
            10,
            "The default pan speed",
            validator
        );

        this.fpan_speed = new Setting(
            "Fine pan speed", 
            "fpan_speed", 
            settingType.NUMBER, 
            false, 
            3,
            "The pan speed when holding shift (F in the floater)",
            validator
        );

        this.upan_speed = new Setting(
            "Ultrafine pan speed", 
            "upan_speed", 
            settingType.NUMBER, 
            false, 
            1,
            "The pan speed when holding alt (U in the floater)",
            validator
        );

        this.show_floater = new Setting(
            "Show floater",
            "show_floater",
            settingType.BOOLEAN,
            false,
            true,
            "Whether to show the floater or not",
            validator
        )

        this.show_pos = new Setting(
            "Show position overlay",
            "show_pos_ovl",
            settingType.BOOLEAN,
            false,
            true,
            "Whether to show the zoom/pan overlay or not",
            validator
        )

        this.pan_keys = new SelectSetting(
            "Panning keys",
            "pan_keys",
            [
                ["wasd", "WASD"],
                ["ijkl", "IJKL"],
                ["", "<none>"]
            ],
            false,
            "wasd"
        )

        this.enable_scroll_zoom = new Setting(
            "Use shift+scroll for zoom",
            "enable_scroll_zoom",
            settingType.BOOLEAN,
            false,
            true,
            "Whether to use shift+scroll for zooming or not",
            validator
        )

        this.scroll_zoom_multiplier = new Setting(
            "Scroll zoom multiplier", 
            "scroll_zoom_mul", 
            settingType.NUMBER, 
            false, 
            1,
            "Multiplier for scroll zoom speed",
            validator
        )

        this.pan_zeroing_en = new Setting(
            "Enable pan zeroing",
            "en_pzero",
            settingType.BOOLEAN,
            false,
            true,
            "Allows the Q key to reset pan (requires refresh)",
            validator
        )

        this.zoom_zeroing_en = new Setting(
            "Enable zoom zeroing",
            "en_zzero",
            settingType.BOOLEAN,
            false,
            true,
            "Allows the P key to reset zoom. Doesn't work with set zoom levels (requires refresh)",
            validator
        )

        const zoom_levels = new Numlist(
            "Zoom levels",
            "zoom_levels",
            "Zoom levels",
            {
                default_values: [0.5, 1, 2, 3, 6, 12],
                step: 0.1,
                custom_validator: validator
            }
        )

        this.unl_zoom = new SettingGroup({
            speed: new Setting(
                "Zoom speed", 
                "unl_zoom_speed", 
                settingType.NUMBER, 
                false, 
                2,
                "The zoom magnitude (as the multiplier to the zoom level every time zoom is used)",
                validator
            ),
            min: new Setting(
                "Zoom limit (min)", 
                "unl_zlim_min", 
                settingType.NUMBER, 
                false, 
                0.25,
                "The lower zoom limit (reducing may lead to rounding error coming back from very low levels)",
                validator
            ),
            max: new Setting(
                "Zoom limit (max)", 
                "unl_zlim_max", 
                settingType.NUMBER, 
                false, 
                25,
                "The upper zoom limit (reducing may lead to rounding error coming back from very high levels)",
                validator
            )
        })


        this.zoom = new MultiSetting(
            "Zoom mode",
            "zoom_mode",
            {},
            zoom_levels,
            this.unl_zoom
        )

        settings_tab.registerSettings(
            undefined, 
            this.canvas_bkg, 
            this.show_floater,
            this.show_pos
        )
        
        settings_tab.registerSettings(
            "Keybinds (requires reset)",
            this.pan_keys,
            this.pan_zeroing_en,
            this.zoom_zeroing_en
        )

        settings_tab.registerSettings(
            "Mouse",
            this.enable_scroll_zoom,
            this.scroll_zoom_multiplier
        )

        settings_tab.registerSettings(
            "Zoom",
            this.zoom
        )

        settings_tab.registerSettings(
            "Panning",
            this.cpan_speed, 
            this.fpan_speed, 
            this.upan_speed, 
        )
        settingsManager.registerTab(settings_tab)
    }
}
