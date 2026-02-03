import NLIST_SPINNER from "./nlist_spinner.png"

const CSS = `
#betterSettings\\/div\\/zoom\\.js input::-webkit-inner-spin-button,
#betterSettings\\/div\\/zoom\\.js input::-webkit-outer-spin-button {
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
#betterSettings\\/div\\/zoom\\.js input::-webkit-inner-spin-button:hover,
#betterSettings\\/div\\/zoom\\.js input::-webkit-outer-spin-button:active {
    border-left: 2px solid white;
    opacity: 1;
}
` as const

export default CSS