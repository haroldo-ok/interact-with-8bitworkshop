/// <reference types="jquery" />
/// <reference types="bootstrap" />
import { SourceLocation } from "./workertypes";
export declare var PLATFORMS: {};
export declare function noise(): number;
export declare function getNoiseSeed(): number;
export declare function setNoiseSeed(x: number): void;
declare type KeyboardCallback = (which: number, charCode: number, flags: KeyFlags) => void;
export declare enum KeyFlags {
    KeyDown = 1,
    Shift = 2,
    Ctrl = 4,
    Alt = 8,
    Meta = 16,
    KeyUp = 64,
    KeyPress = 128
}
export declare function _setKeyboardEvents(canvas: HTMLElement, callback: KeyboardCallback): void;
declare type VideoCanvasOptions = {
    rotate?: number;
    overscan?: boolean;
};
export declare class RasterVideo {
    mainElement: HTMLElement;
    width: number;
    height: number;
    options: VideoCanvasOptions;
    constructor(mainElement: HTMLElement, width: number, height: number, options?: VideoCanvasOptions);
    canvas: HTMLCanvasElement;
    ctx: any;
    imageData: any;
    arraybuf: any;
    buf8: any;
    datau32: any;
    vcanvas: JQuery;
    paddle_x: number;
    paddle_y: number;
    setRotate(rotate: number): void;
    create(): void;
    setKeyboardEvents(callback: any): void;
    getFrameData(): any;
    getContext(): any;
    updateFrame(sx?: number, sy?: number, dx?: number, dy?: number, w?: number, h?: number): void;
    clearRect(dx: number, dy: number, w: number, h: number): void;
    setupMouseEvents(el?: HTMLCanvasElement): void;
}
export declare class VectorVideo extends RasterVideo {
    persistenceAlpha: number;
    jitter: number;
    gamma: number;
    sx: number;
    sy: number;
    create(): void;
    clear(): void;
    COLORS: string[];
    drawLine(x1: number, y1: number, x2: number, y2: number, intensity: number, color: number): void;
}
export declare class RAM {
    mem: Uint8Array;
    constructor(size: number);
}
export declare class EmuHalt extends Error {
    $loc: SourceLocation;
    constructor(msg: string, loc?: SourceLocation);
}
export declare class AnimationTimer {
    callback: any;
    running: boolean;
    pulsing: boolean;
    lastts: number;
    useReqAnimFrame: boolean;
    nframes: any;
    startts: any;
    frameRate: any;
    intervalMsec: any;
    constructor(frequencyHz: number, callback: () => void);
    scheduleFrame(msec: number): void;
    nextFrame(ts?: number): void;
    isRunning(): boolean;
    start(): void;
    stop(): void;
}
export declare function dumpRAM(ram: ArrayLike<number>, ramofs: number, ramlen: number): string;
export interface KeyDef {
    c: number;
    n: string;
    plyr?: number;
    xaxis?: number;
    yaxis?: number;
    button?: number;
}
export interface KeyMapEntry {
    index: number;
    mask: number;
    def: KeyDef;
}
declare type KeyCodeMap = Map<number, KeyMapEntry>;
export declare const Keys: {
    ANYKEY: {
        c: number;
        n: string;
    };
    UP: {
        c: number;
        n: string;
        plyr: number;
        yaxis: number;
    };
    DOWN: {
        c: number;
        n: string;
        plyr: number;
        yaxis: number;
    };
    LEFT: {
        c: number;
        n: string;
        plyr: number;
        xaxis: number;
    };
    RIGHT: {
        c: number;
        n: string;
        plyr: number;
        xaxis: number;
    };
    A: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    B: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    GP_A: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    GP_B: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    GP_C: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    GP_D: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    SELECT: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    START: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_UP: {
        c: number;
        n: string;
        plyr: number;
        yaxis: number;
    };
    P2_DOWN: {
        c: number;
        n: string;
        plyr: number;
        yaxis: number;
    };
    P2_LEFT: {
        c: number;
        n: string;
        plyr: number;
        xaxis: number;
    };
    P2_RIGHT: {
        c: number;
        n: string;
        plyr: number;
        xaxis: number;
    };
    P2_A: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_B: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_GP_A: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_GP_B: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_GP_C: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_GP_D: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_SELECT: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    P2_START: {
        c: number;
        n: string;
        plyr: number;
        button: number;
    };
    VK_ESCAPE: {
        c: number;
        n: string;
    };
    VK_F1: {
        c: number;
        n: string;
    };
    VK_F2: {
        c: number;
        n: string;
    };
    VK_F3: {
        c: number;
        n: string;
    };
    VK_F4: {
        c: number;
        n: string;
    };
    VK_F5: {
        c: number;
        n: string;
    };
    VK_F6: {
        c: number;
        n: string;
    };
    VK_F7: {
        c: number;
        n: string;
    };
    VK_F8: {
        c: number;
        n: string;
    };
    VK_F9: {
        c: number;
        n: string;
    };
    VK_F10: {
        c: number;
        n: string;
    };
    VK_F11: {
        c: number;
        n: string;
    };
    VK_F12: {
        c: number;
        n: string;
    };
    VK_SCROLL_LOCK: {
        c: number;
        n: string;
    };
    VK_PAUSE: {
        c: number;
        n: string;
    };
    VK_QUOTE: {
        c: number;
        n: string;
    };
    VK_1: {
        c: number;
        n: string;
    };
    VK_2: {
        c: number;
        n: string;
    };
    VK_3: {
        c: number;
        n: string;
    };
    VK_4: {
        c: number;
        n: string;
    };
    VK_5: {
        c: number;
        n: string;
    };
    VK_6: {
        c: number;
        n: string;
    };
    VK_7: {
        c: number;
        n: string;
    };
    VK_8: {
        c: number;
        n: string;
    };
    VK_9: {
        c: number;
        n: string;
    };
    VK_0: {
        c: number;
        n: string;
    };
    VK_MINUS: {
        c: number;
        n: string;
    };
    VK_MINUS2: {
        c: number;
        n: string;
    };
    VK_EQUALS: {
        c: number;
        n: string;
    };
    VK_EQUALS2: {
        c: number;
        n: string;
    };
    VK_BACK_SPACE: {
        c: number;
        n: string;
    };
    VK_TAB: {
        c: number;
        n: string;
    };
    VK_Q: {
        c: number;
        n: string;
    };
    VK_W: {
        c: number;
        n: string;
    };
    VK_E: {
        c: number;
        n: string;
    };
    VK_R: {
        c: number;
        n: string;
    };
    VK_T: {
        c: number;
        n: string;
    };
    VK_Y: {
        c: number;
        n: string;
    };
    VK_U: {
        c: number;
        n: string;
    };
    VK_I: {
        c: number;
        n: string;
    };
    VK_O: {
        c: number;
        n: string;
    };
    VK_P: {
        c: number;
        n: string;
    };
    VK_ACUTE: {
        c: number;
        n: string;
    };
    VK_OPEN_BRACKET: {
        c: number;
        n: string;
    };
    VK_CLOSE_BRACKET: {
        c: number;
        n: string;
    };
    VK_CAPS_LOCK: {
        c: number;
        n: string;
    };
    VK_A: {
        c: number;
        n: string;
    };
    VK_S: {
        c: number;
        n: string;
    };
    VK_D: {
        c: number;
        n: string;
    };
    VK_F: {
        c: number;
        n: string;
    };
    VK_G: {
        c: number;
        n: string;
    };
    VK_H: {
        c: number;
        n: string;
    };
    VK_J: {
        c: number;
        n: string;
    };
    VK_K: {
        c: number;
        n: string;
    };
    VK_L: {
        c: number;
        n: string;
    };
    VK_CEDILLA: {
        c: number;
        n: string;
    };
    VK_TILDE: {
        c: number;
        n: string;
    };
    VK_ENTER: {
        c: number;
        n: string;
    };
    VK_SHIFT: {
        c: number;
        n: string;
    };
    VK_BACK_SLASH: {
        c: number;
        n: string;
    };
    VK_Z: {
        c: number;
        n: string;
    };
    VK_X: {
        c: number;
        n: string;
    };
    VK_C: {
        c: number;
        n: string;
    };
    VK_V: {
        c: number;
        n: string;
    };
    VK_B: {
        c: number;
        n: string;
    };
    VK_N: {
        c: number;
        n: string;
    };
    VK_M: {
        c: number;
        n: string;
    };
    VK_COMMA: {
        c: number;
        n: string;
    };
    VK_PERIOD: {
        c: number;
        n: string;
    };
    VK_SEMICOLON: {
        c: number;
        n: string;
    };
    VK_SLASH: {
        c: number;
        n: string;
    };
    VK_CONTROL: {
        c: number;
        n: string;
    };
    VK_ALT: {
        c: number;
        n: string;
    };
    VK_SPACE: {
        c: number;
        n: string;
    };
    VK_INSERT: {
        c: number;
        n: string;
    };
    VK_DELETE: {
        c: number;
        n: string;
    };
    VK_HOME: {
        c: number;
        n: string;
    };
    VK_END: {
        c: number;
        n: string;
    };
    VK_PAGE_UP: {
        c: number;
        n: string;
    };
    VK_PAGE_DOWN: {
        c: number;
        n: string;
    };
    VK_UP: {
        c: number;
        n: string;
    };
    VK_DOWN: {
        c: number;
        n: string;
    };
    VK_LEFT: {
        c: number;
        n: string;
    };
    VK_RIGHT: {
        c: number;
        n: string;
    };
    VK_NUM_LOCK: {
        c: number;
        n: string;
    };
    VK_DIVIDE: {
        c: number;
        n: string;
    };
    VK_MULTIPLY: {
        c: number;
        n: string;
    };
    VK_SUBTRACT: {
        c: number;
        n: string;
    };
    VK_ADD: {
        c: number;
        n: string;
    };
    VK_DECIMAL: {
        c: number;
        n: string;
    };
    VK_NUMPAD0: {
        c: number;
        n: string;
    };
    VK_NUMPAD1: {
        c: number;
        n: string;
    };
    VK_NUMPAD2: {
        c: number;
        n: string;
    };
    VK_NUMPAD3: {
        c: number;
        n: string;
    };
    VK_NUMPAD4: {
        c: number;
        n: string;
    };
    VK_NUMPAD5: {
        c: number;
        n: string;
    };
    VK_NUMPAD6: {
        c: number;
        n: string;
    };
    VK_NUMPAD7: {
        c: number;
        n: string;
    };
    VK_NUMPAD8: {
        c: number;
        n: string;
    };
    VK_NUMPAD9: {
        c: number;
        n: string;
    };
    VK_NUMPAD_CENTER: {
        c: number;
        n: string;
    };
};
declare type KeyMapFunction = (o: KeyMapEntry, key: number, code: number, flags: number) => void;
export declare function newKeyboardHandler(switches: number[] | Uint8Array, map: KeyCodeMap, func?: KeyMapFunction, alwaysfunc?: boolean): (key: number, code: number, flags: number) => void;
export declare function setKeyboardFromMap(video: RasterVideo, switches: number[] | Uint8Array, map: KeyCodeMap, func?: KeyMapFunction, alwaysfunc?: boolean): ControllerPoller;
export declare function makeKeycodeMap(table: [KeyDef, number, number][]): KeyCodeMap;
export declare class ControllerPoller {
    active: boolean;
    handler: any;
    state: Int8Array;
    lastState: Int8Array;
    AXIS0: number;
    constructor(handler: (key: any, code: any, flags: any) => void);
    poll(): void;
    handleStateChange(gpi: number, k: number): void;
}
export declare function padBytes(data: Uint8Array | number[], len: number, padstart?: boolean): Uint8Array;
declare type AddressReadWriteFn = ((a: number) => number) | ((a: number, v: number) => void);
declare type AddressDecoderEntry = [number, number, number, AddressReadWriteFn];
declare type AddressDecoderOptions = {
    gmask?: number;
};
export declare function AddressDecoder(table: AddressDecoderEntry[], options?: AddressDecoderOptions): any;
export declare function newAddressDecoder(table: AddressDecoderEntry[], options?: AddressDecoderOptions): (a: number, v?: number) => number;
export declare class Toolbar {
    span: JQuery;
    grp: JQuery;
    mousetrap: any;
    boundkeys: any[];
    constructor(parentDiv: HTMLElement, focusDiv: HTMLElement);
    destroy(): void;
    newGroup(): JQuery<HTMLSpanElement>;
    add(key: string, alttext: string, icon: string, fn: (e: any, combo: any) => void): any;
}
export declare function getMousePos(canvas: HTMLCanvasElement, evt: any): {
    x: number;
    y: number;
};
export {};
