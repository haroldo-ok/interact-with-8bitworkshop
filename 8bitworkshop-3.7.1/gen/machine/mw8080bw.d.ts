import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicScanlineMachine } from "../common/devices";
export declare class Midway8080 extends BasicScanlineMachine {
    cpuFrequency: number;
    canvasWidth: number;
    numTotalScanlines: number;
    numVisibleScanlines: number;
    cpuCyclesPerLine: number;
    defaultROMSize: number;
    rotate: number;
    sampleRate: number;
    bitshift_offset: number;
    bitshift_register: number;
    watchdog_counter: any;
    cpu: Z80;
    ram: Uint8Array;
    constructor();
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    newIOBus(): {
        read: (addr: any) => number;
        write: (addr: any, val: any) => void;
    };
    startScanline(): void;
    drawScanline(): void;
    interrupt(data: number): void;
    advanceFrame(trap: any): number;
    loadState(state: any): void;
    saveState(): any;
    reset(): void;
}
