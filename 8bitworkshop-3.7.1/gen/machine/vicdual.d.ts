import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicScanlineMachine } from "../common/devices";
import { AY38910_Audio } from "../common/audio";
export declare class VicDual extends BasicScanlineMachine {
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
    psg: AY38910_Audio;
    display: VicDualDisplay;
    audioadapter: any;
    constructor();
    getKeyboardFunction(): (o: any) => void;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    newIOBus(): {
        read: (addr: any) => number;
        write: (addr: any, val: any) => void;
    };
    reset(): void;
    startScanline(): void;
    drawScanline(): void;
    loadROM(data: any): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
}
declare class VicDualDisplay {
    palbank: number;
    palette: number[];
    colorprom: number[];
    drawScanline(ram: any, pixels: Uint32Array, sl: number): void;
}
export {};
