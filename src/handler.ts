import CustomSettingsManager from "./custom_settings";
import Patcher from "./patcher";


export default class Handler {
    settings: CustomSettingsManager
    patcher: Patcher
    zoom_panning: [number, number] = [0, 0]
    zoom_level: number

    constructor(settings: CustomSettingsManager, patcher: Patcher) {
        this.settings = settings
        this.patcher = patcher
        this.zoom_level = 1

        this.patch_keybinds()
        this.patch_floater()

        // Redefine to give correct numbers when zoomed
        window.getMousePos = (canvas: HTMLCanvasElement, evt: TouchEvent) => {
            if (evt.touches) {
                evt.preventDefault();
                // @ts-expect-error going to trust the sandboxels source to be right
                evt = evt.touches[0];
                isMobile = true;
            }
            const rect = canvas.getBoundingClientRect();

            // @ts-expect-error ___
            const clx = evt.clientX
            // @ts-expect-error ___
            const cly = evt.clientY

            let x = (clx - rect.left) / this.scale()
            let y = (cly - rect.top ) / this.scale()

            x = Math.floor((x / canvas.clientWidth) * (width+1));
            y = Math.floor((y / canvas.clientHeight) * (height+1));

            return {x:x, y:y};
        }

        runAfterReset(() => {
            this.zoom_level = 1
            this.zoom_panning = [0, 0]
            this.update()
        })
    }

    public handle_zoom(direction: "in" | "out"){
        if (this.settings.zoom.value == 0) {
            switch (direction){
                case "in":
                    if (!(this.zoom_level+1 in this.settings.zoom.settings[0].value)) { break; }
                    this.zoom_level += 1
                    break;
                case "out":
                    if (!(this.zoom_level-1 in this.settings.zoom.settings[0].value)) { break; }
                    this.zoom_level -= 1
                    break;
            } 
        }
        else {
            const settings = this.settings.zoom.settings[1].settings
            const speed = settings.speed.value
            const min = settings.min.value
            const max = settings.max.value

            switch (direction){
                case "in":
                    if (this.zoom_level * speed > max) break
                    this.zoom_level *= speed
                    break;
                case "out":
                    if (this.zoom_level / speed < min) break
                    this.zoom_level /= speed
                    break;
            } 

            this.zoom_level = Number(this.zoom_level.toPrecision(3))
        }
        this.update()
    }

    public handle_pan(direction: "up" | "down" | "left" | "right", speed: number){
        switch (direction){
            case "right":
                this.zoom_panning[0] -= speed
                break;
            case "left":
                this.zoom_panning[0] += speed
                break;
            case "up":
                this.zoom_panning[1] += speed
                break;
            case "down":
                this.zoom_panning[1] -= speed
                break;
        }   
        this.update()        
    }

    scale(){
        return this.settings.zoom.value == 0
            ? this.settings.zoom.settings[0].value[this.zoom_level]
            : this.zoom_level
    }

    update(){
        this.log_info()

        const x = this.zoom_panning[0] * (pixelSize * this.scale())
        const y = this.zoom_panning[1] * (pixelSize * this.scale())

        canvas.style.transform = `translate(${x}px, ${y}px) translateX(-50%) scale(${this.scale()})`
    }
    
    log_info(){
        // Values are negated to make them more intuitive
        const x_pan = (-this.zoom_panning[0]).toString().padEnd(4)
        const y_pan = (-this.zoom_panning[1]).toString().padEnd(4)
        

        this.patcher.zoom_data_div.innerText = ""
        this.patcher.zoom_data_div.innerText += `Scale: ${this.scale()}x\n`
        this.patcher.zoom_data_div.innerText += `Pan  : ${x_pan}, ${y_pan}`
    }

    kbd_speed_noshift(ev: KeyboardEvent){
        return ev.altKey ? this.settings.upan_speed.value : this.settings.cpan_speed.value
    }

    patch_keybinds(){
        keybinds["9"] = () => this.handle_zoom("in")
        keybinds["0"] = () => this.handle_zoom("out")

        if (this.settings.pan_keys.value !== "") {
            // This is fine since they're all 4 letters except for the <none> option
            const pan_keys = this.settings.pan_keys.value
            const pan_keys_upper = pan_keys.toUpperCase()

            keybinds[pan_keys[0]] = ev => this.handle_pan("up",    this.kbd_speed_noshift(ev))
            keybinds[pan_keys[1]] = ev => this.handle_pan("left",  this.kbd_speed_noshift(ev))
            keybinds[pan_keys[2]] = ev => this.handle_pan("down",  this.kbd_speed_noshift(ev))
            keybinds[pan_keys[3]] = ev => this.handle_pan("right", this.kbd_speed_noshift(ev))

            keybinds[pan_keys_upper[0]] = () => this.handle_pan("up",    this.settings.fpan_speed.value)
            keybinds[pan_keys_upper[1]] = () => this.handle_pan("left",  this.settings.fpan_speed.value)
            keybinds[pan_keys_upper[2]] = () => this.handle_pan("down",  this.settings.fpan_speed.value)
            keybinds[pan_keys_upper[3]] = () => this.handle_pan("right", this.settings.fpan_speed.value)
        }

        if (this.settings.pan_zeroing_en.value) {
            keybinds["q"] = () => {
                this.zoom_panning = [0, 0]
                this.update()
            }
        }

        if (this.settings.zoom_zeroing_en.value) {
            keybinds["p"] = () => {
                if (this.settings.zoom.value == 1) this.zoom_level = 1
                this.update()
            }
        }
    }

    floater_speed() {
        switch (this.patcher.panmode_sel.innerText) {
            case "C": return this.settings.cpan_speed.value
            case "F": return this.settings.fpan_speed.value
            case "U": return this.settings.upan_speed.value
            default: return 0 as never
        }
    }

    patch_floater() {
        function patch(id: string, fn: () => void){
            (document.getElementById(id) as HTMLElement).onclick = fn;
        }

        patch("zm_floater_zi", () => this.handle_zoom("in"))
        patch("zm_floater_zo", () => this.handle_zoom("out"))

        patch("zm_floater_u", () => this.handle_pan("up"   , this.floater_speed()))
        patch("zm_floater_d", () => this.handle_pan("down" , this.floater_speed()))
        patch("zm_floater_l", () => this.handle_pan("left" , this.floater_speed()))
        patch("zm_floater_r", () => this.handle_pan("right", this.floater_speed()))
    }
}