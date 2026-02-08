import NUMLIST_CSS from "../assets/numlist.css"
import CustomSettingsManager from "./custom_settings"
import MAIN_CSS from "../assets/main.css"
import MULTISETTING_CSS from "../assets/multisetting.css"
import CTRL_INFO from "../assets/ctrl_info.html"
import FLOATER from "../assets/floater.html"
import SPINNER_CSS from "../assets/spinner.css"

export default class Patcher {
    public zoom_data_div: HTMLElement
    floater_div: HTMLElement
    canvas_div: HTMLElement
    settings: CustomSettingsManager
    panmode_sel: HTMLElement

    constructor(settings: CustomSettingsManager) {
        this.settings = settings

        const style_div = document.createElement("style")
        style_div.innerHTML = MAIN_CSS

        document.head.appendChild(style_div)

        dependOn("betterSettings.js", () => {
            const style_div = document.createElement("style")
            style_div.innerHTML = NUMLIST_CSS + MULTISETTING_CSS + SPINNER_CSS

            document.head.appendChild(style_div)
        })

        this.canvas_div = document.getElementById("canvasDiv") as HTMLElement
        this.canvas_div.insertAdjacentHTML("beforeend", FLOATER)
        
        this.floater_div = document.getElementById("zm_floater_container") as HTMLElement
        this.panmode_sel = document.getElementById("zm_panmode_sel") as HTMLElement
        this.panmode_sel.onclick = () => {
            switch (this.panmode_sel.innerText) {
                case "C": this.panmode_sel.innerText = "F"; break
                case "F": this.panmode_sel.innerText = "U"; break
                case "U": this.panmode_sel.innerText = "C"; break
            }
        }

        const collapse_btn = document.getElementById("zm_collapse") as HTMLElement
        collapse_btn.onclick = () => {
            collapse_btn.dataset.collapsed = collapse_btn.dataset.collapsed == "true" 
                ? "false"
                : "true"
        }

        this.zoom_data_div = document.createElement("div")
        this.zoom_data_div.id = "zm_data_div"
        document.getElementById("logDiv")?.prepend(this.zoom_data_div)

        document.getElementById("controlsTable")
            ?.lastElementChild
            ?.insertAdjacentHTML("beforebegin", CTRL_INFO)

        this.update_from_settings()

        runAfterLoad(() => {
            // why, ggod, why did you put slashes in the selector
            const cb = this.update_from_settings.bind(this)
            for (const elem of document.querySelectorAll("#betterSettings\\/div\\/zoom\\.js span.setting-span input")) {
                elem.addEventListener(elem.classList.contains("toggleInput") ? "click" : "change", cb)
            }
        })
    }

    public update_from_settings() {
        this.floater_div.style.display = this.settings.show_floater.value ? "grid" : "none"
        this.zoom_data_div.style.display = this.settings.show_pos.value ? "block" : "none"
        this.canvas_div.style.backgroundColor = this.settings.canvas_bkg.value ?? "#252525"
    }
}