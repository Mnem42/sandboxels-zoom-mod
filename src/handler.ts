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
            this.rescale()
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
        this.rescale()
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
        this.rescale()        
    }

    scale(){
        return this.settings.zoom.value == 0
            ? this.settings.zoom.settings[0].value[this.zoom_level]
            : this.zoom_level
    }

    rescale(){
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

    patch_keybinds(){
        keybinds["9"] = () => this.handle_zoom("in")
        keybinds["0"] = () => this.handle_zoom("out")

        keybinds["w"] = ev => this.handle_pan("up",    ev.altKey ? this.settings.upan_speed.value : this.settings.cpan_speed.value)
        keybinds["a"] = ev => this.handle_pan("left",  ev.altKey ? this.settings.upan_speed.value : this.settings.cpan_speed.value)
        keybinds["s"] = ev => this.handle_pan("down",  ev.altKey ? this.settings.upan_speed.value : this.settings.cpan_speed.value)
        keybinds["d"] = ev => this.handle_pan("right", ev.altKey ? this.settings.upan_speed.value : this.settings.cpan_speed.value)

        keybinds["W"] = () => this.handle_pan("up",    this.settings.fpan_speed.value)
        keybinds["A"] = () => this.handle_pan("left",  this.settings.fpan_speed.value)
        keybinds["S"] = () => this.handle_pan("down",  this.settings.fpan_speed.value)
        keybinds["D"] = () => this.handle_pan("right", this.settings.fpan_speed.value)
    }
    speed() {
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

        patch("zm_floater_u", () => this.handle_pan("up"   , this.speed()))
        patch("zm_floater_d", () => this.handle_pan("down" , this.speed()))
        patch("zm_floater_l", () => this.handle_pan("left" , this.speed()))
        patch("zm_floater_r", () => this.handle_pan("right", this.speed()))
    }
}