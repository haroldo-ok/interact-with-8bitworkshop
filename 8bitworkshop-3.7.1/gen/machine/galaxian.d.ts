import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicScanlineMachine } from "../common/devices";
import { AY38910_Audio } from "../common/audio";
export declare class GalaxianMachine extends BasicScanlineMachine {
    options: {};
    palBase: number;
    keyMap: Map<number, import("../common/emu").KeyMapEntry>;
    cpuFrequency: number;
    canvasWidth: number;
    numTotalScanlines: number;
    numVisibleScanlines: number;
    defaultROMSize: number;
    sampleRate: number;
    cpuCyclesPerLine: number;
    rotate: number;
    cpu: Z80;
    ram: Uint8Array;
    vram: Uint8Array;
    oram: Uint8Array;
    palette: Uint32Array;
    gfx: any;
    audioadapter: any;
    psg1: AY38910_Audio;
    psg2: AY38910_Audio;
    watchdog_counter: number;
    interruptEnabled: number;
    defaultInputs: number[];
    constructor();
    init(): void;
    read: (a: number, v?: number) => number;
    readConst(a: number): number;
    write: (a: number, v?: number) => number;
    newIOBus(): {
        read: (addr: any) => number;
        write: (addr: any, val: any) => void;
    };
    reset(): void;
    startScanline(): void;
    drawScanline(): void;
    advanceFrame(trap: any): number;
    loadROM(data: any): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
}
export declare class GalaxianScrambleMachine extends GalaxianMachine {
    defaultROMSize: number;
    palBase: number;
    scramble: boolean;
    keyMap: Map<number, import("../common/emu").KeyMapEntry>;
    options: {
        gfxBase: number;
        missileWidth: number;
        missileOffset: number;
    };
    defaultInputs: number[];
    constructor();
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    m_protection_state: number;
    m_protection_result: number;
    scramble_protection_w(addr: any, data: any): void;
    scramble_protection_alt_r(): number;
}
