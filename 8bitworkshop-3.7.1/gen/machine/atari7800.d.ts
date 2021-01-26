import { MOS6502, MOS6502State } from "../common/cpu/MOS6502";
import { BasicMachine, RasterFrameBased, Bus } from "../common/devices";
interface Atari7800StateBase {
    ram: Uint8Array;
    regs6532: Uint8Array;
}
interface Atari7800ControlsState {
    inputs: Uint8Array;
}
interface Atari7800State extends Atari7800StateBase, Atari7800ControlsState {
    c: MOS6502State;
    tia: {
        regs: Uint8Array;
    };
    maria: {
        regs: Uint8Array;
        offset: any;
        dll: any;
        dlstart: number;
        dli: any;
        h16: any;
        h8: boolean;
    };
}
declare class TIA {
    regs: Uint8Array;
    reset(): void;
    read(a: number): number;
    write(a: number, v: number): void;
    saveState(): {
        regs: Uint8Array;
    };
    loadState(s: any): void;
    static stateToLongString(state: any): string;
}
declare class MARIA {
    bus: Bus;
    cycles: number;
    regs: Uint8Array;
    offset: number;
    dll: number;
    dlstart: number;
    dli: boolean;
    h16: boolean;
    h8: boolean;
    pixels: Uint8Array;
    WSYNC: number;
    reset(): void;
    read(a: number): number;
    write(a: number, v: number): void;
    saveState(): {
        regs: Uint8Array;
        offset: number;
        dll: number;
        dlstart: number;
        dli: boolean;
        h16: boolean;
        h8: boolean;
    };
    loadState(s: any): void;
    isDMAEnabled(): boolean;
    getDLLStart(): number;
    getCharBaseAddress(): number;
    setVBLANK(b: boolean): void;
    readDLLEntry(bus: any): void;
    isHoley(a: number): boolean;
    readDMA(a: number): number;
    doDMA(bus: Bus): number;
    doInterrupt(): boolean;
    static stateToLongString(state: any): string;
}
export declare class Atari7800 extends BasicMachine implements RasterFrameBased {
    cpuFrequency: number;
    canvasWidth: number;
    numTotalScanlines: number;
    numVisibleScanlines: number;
    defaultROMSize: number;
    cpuCyclesPerLine: number;
    sampleRate: number;
    cpu: MOS6502;
    ram: Uint8Array;
    regs6532: Uint8Array;
    tia: TIA;
    maria: MARIA;
    pokey1: any;
    audioadapter: any;
    lastFrameCycles: number;
    xtracyc: number;
    read: (a: number) => number;
    write: (a: number, v: number) => void;
    probeDMABus: Bus;
    constructor();
    readConst(a: any): number;
    readInput(a: number): number;
    advanceCPU(): number;
    advanceFrame(trap: any): number;
    getRasterX(): number;
    getRasterY(): number;
    loadROM(data: any): void;
    reset(): void;
    readAddress(addr: number): number;
    loadState(state: Atari7800State): void;
    saveState(): Atari7800State;
    loadControlsState(state: Atari7800ControlsState): void;
    saveControlsState(): Atari7800ControlsState;
    getDebugCategories(): string[];
    getDebugInfo(category: any, state: any): string;
}
export {};
