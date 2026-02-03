import { def_classes, GNumList, GSettingGroup, Numlist } from "./custom_setting_types"

export default class CustomSettingsManager {
    public canvas_bkg: Setting<string>
    public zoom: GNumList<[Numlist, typeof this.unl_zoom]>
    public unl_zoom: GSettingGroup<{
        speed: Setting<number>, 
        min: Setting<number>, 
        max: Setting<number>
    }>

    public show_floater: Setting<boolean> 

    public fpan_speed: Setting<number> 
    public cpan_speed: Setting<number> 
    public upan_speed: Setting<number> 

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
            this.zoom,
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
