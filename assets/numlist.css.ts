import NLIST_SPINNER from "./nlist_spinner.png"

const CSS = `
#settingsMenu .zm_nml_btn_container button {
    font-size: 2em;
    padding: 0px;
    margin: 0px;
}

#settingsMenu .zm_nml_icontainer {
    align-self: center
}

#settingsMenu .zm_nml_setting {
    display: grid;
    grid-template-columns: 7em 1fr;
}

#settingsMenu .zm_nml_setting span {
    input {
        width: 2em;
        margin-right: 4px;
        margin-bottom: 4px;
    }

    input:focus {
        outline: none;
        box-shadow: none;
        border-color: white;
    }

    /* Sorry, firefox users */
    input::-webkit-inner-spin-button,
    input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 0.75em;

        background: #000 url(${NLIST_SPINNER}) no-repeat center center;
        background-size: 100%;
        border-left: 2px solid var(--theme);

        image-rendering: pixelated;
        opacity: 0.8;
    }

    input::-webkit-inner-spin-button:hover,
    input::-webkit-outer-spin-button:active {
        border-left: 2px solid white;
        opacity: 1;
    }
}
` as const

export default CSS;