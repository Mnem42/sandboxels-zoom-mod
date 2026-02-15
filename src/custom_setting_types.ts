export const def_classes = () => {
    class Numlist extends Setting<number[]> {
        step: number
        input_container: HTMLElement | null = null
        push_btn: HTMLElement | null = null
        pop_btn:  HTMLElement | null = null

        constructor (
            name: string, 
            storage_name: string, 
            desc: string,
            options: {
                default_values?: number[], 
                step?: number,
                custom_validator?: () => boolean,
                disabled?: boolean
            }
        ) {
            super(
                name, 
                storage_name, 
                [5, 0],
                options.disabled,
                options.default_values,
                desc,
                options.custom_validator
            );
            this.step = options.step ?? 1
        }

        #new_input(value: number, i: number) {
            const elem = document.createElement("input")
            elem.type = "number"
            elem.value = value.toString()
            elem.step = this.step.toString()
            elem.classList.add("settingsInput")

            elem.onchange = (ev) => {
                const parsed = Number.parseFloat((ev.target as HTMLInputElement).value)

                if (!Number.isNaN(parsed)) {
                    this.value[i] = parsed
                    this.set(this.value)
                }
            }

            return elem
        }

        #push_pop_btns(): [HTMLElement, HTMLElement] {
            this.push_btn = document.createElement("button")
            this.push_btn.style.color = "#0F0"
            this.push_btn.innerText = "+"

            this.pop_btn = document.createElement("button")
            this.pop_btn.style.color = "#F00"
            this.pop_btn.innerText = "-"

            this.push_btn.onclick = () => {
                this.value.push(1)
                this.input_container!.append(this.#new_input(1, this.value.length))
            }

            this.pop_btn.onclick = () => {
                this.value.pop()
                
                if (this.input_container!.lastChild) {
                    this.input_container!.removeChild(this.input_container!.lastChild)
                }
            }

            return [this.push_btn, this.pop_btn]
        }

        disable() {
            this.push_btn?.setAttribute("disabled", "true")  
            this.pop_btn?.setAttribute("disabled", "true")  
        } 

        enable() {
            this.push_btn?.removeAttribute("disabled")  
            this.pop_btn?.removeAttribute("disabled")  
        } 

        build() {
            const value = this.get()

            const container = document.createElement("span")
            container.classList.add("setting-span", "zm_nml_setting")

            const l_container = document.createElement("span")

            const label = document.createElement("span")
            label.innerText = this.name

            const btn_container = document.createElement("span")
            btn_container.classList.add("zm_nml_btn_container")
            btn_container.append(...this.#push_pop_btns())

            l_container.append(label, document.createElement("br"), btn_container)

            this.input_container = document.createElement("span")
            this.input_container.classList.add("zm_nml_icontainer")

            const elems: HTMLElement[] = []
            value.forEach((x, i) => {
                elems.push(this.#new_input(x, i))
            })

            this.input_container.append(...elems)
            container.append(l_container, this.input_container)

            return container
        }
    }

    // This is technically storing an index
    class MultiSetting<V extends Setting<unknown>[]> extends Setting<number> {
        public readonly settings: V
        elements: HTMLElement[] = []
        multi_input_name: string
        rows: HTMLElement[] = []

        constructor(
            name: string, 
            storage_name: string, 
            extra_opts: {
                default_value?: number, 
                desc?: string,
                disabled?: boolean
            },
            ...settings: V
        ){
            super(
                name, 
                storage_name, 
                [255],
                extra_opts.disabled, 
                extra_opts.default_value ?? 0, 
                extra_opts.desc, 
                undefined
            )
            this.settings = settings
            this.multi_input_name = crypto.randomUUID()
        }

        build(): HTMLElement {
            const container = document.createElement("span")

            this.settings.forEach((setting, i) => {
                const row_container = document.createElement("div")
                row_container.classList.add("zm_ms_row")
                this.rows.push(row_container)

                const select_btn = document.createElement("button")
                select_btn.classList.add("zm_ms_selbtn")
                select_btn.innerText = "#"

                const built_item = setting.build()
                built_item.classList.add("zm_ms_item")
                built_item.dataset.index = i.toString()

                // As a ternary since it's clearer
                row_container.dataset.current = i == this.value ? "true" : "false"

                select_btn.onclick = () => {
                    this.set(i)

                    setting.enable()
                    for (const setting of this.settings) setting.disable()
                    
                    for (const row of this.rows) {
                        row.dataset.current = "false"
                        row.querySelectorAll(".zm_ms_item input")
                            .forEach(x => x.setAttribute("disabled", "true"))
                    }

                    built_item.querySelectorAll("input").forEach(x => x.removeAttribute("disabled"))

                    row_container.dataset.current = "true"
                }

                row_container.append(select_btn, built_item)
                container.appendChild(row_container)
            })

            return container
        }
    }

    class SettingGroup<V extends Record<string, Setting<unknown>>> extends Setting<void> {
        public settings: V

        constructor(settings: V) {
            super(
                "",
                "",
                [2763],
                false,
            )
            this.settings = settings
        }
        
        enable() {
            for (const x of Object.values(this.settings)) {
                x.enable()
            }
        }
        disable() {
            for (const x of Object.values(this.settings)) {
                x.disable()
            }
        }

        build(): HTMLElement {
            const container = document.createElement("div")
            for (const x of Object.values(this.settings)) {
                container.appendChild(x.build())
            }
            return container
        }

        get() { return this.settings }

        // Override these so the defaults don't do anything
        set() {}
        update() {}
        onUpdate() {}
    }

    return { 
        Numlist: Numlist, 
        MultiSetting: MultiSetting, 
        SettingGroup: SettingGroup
    }
}

export type Numlist      = InstanceType<ReturnType<typeof def_classes>["Numlist"]>
export type MultiSetting = InstanceType<ReturnType<typeof def_classes>["MultiSetting"]>
export type SettingGroup = InstanceType<ReturnType<typeof def_classes>["SettingGroup"]>

export type GNumList<T extends Setting<unknown>[]> = Setting<number> & { settings: [...T] }
export type GSettingGroup<T extends Record<string, Setting<unknown>>> = Setting<void> & { settings: T }