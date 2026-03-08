import Handler from "./handler";

declare let mousePosToWorldPos: (pos: { x: number, y: number }) => { x: number, y: number };

export function patch_worldedit(handler: Handler) {
    mousePosToWorldPos = ({ x, y }) => handler.mouse_to_world(x, y)
}