import { MOS6502, MOS6502State } from "../common/cpu/MOS6502";
import { Bus, BasicScanlineMachine } from "../common/devices";
interface AppleIIStateBase {
    ram: Uint8Array;
    soundstate: number;
    auxRAMselected: any;
    writeinhibit: boolean;
    auxRAMbank: number;
}
interface AppleIIControlsState {
    inputs: Uint8Array;
    kbdlatch: number;
}
interface AppleIIState extends AppleIIStateBase, AppleIIControlsState {
    c: MOS6502State;
    grswitch: number;
    slots: SlotDevice[];
}
interface SlotDevice extends Bus {
    readROM(address: number): number;
    readConst(address: number): number;
}
export declare class AppleII extends BasicScanlineMachine {
    cpuFrequency: number;
    sampleRate: number;
    cpuCyclesPerLine: number;
    cpuCyclesPerFrame: number;
    canvasWidth: number;
    numVisibleScanlines: number;
    numTotalScanlines: number;
    defaultROMSize: number;
    ram: Uint8Array;
    bios: Uint8Array;
    cpu: MOS6502;
    grdirty: any[];
    grparams: {
        dirty: any[];
        grswitch: number;
        mem: Uint8Array;
    };
    ap2disp: any;
    kbdlatch: number;
    soundstate: number;
    auxRAMselected: boolean;
    auxRAMbank: number;
    writeinhibit: boolean;
    bank2rdoffset: number;
    bank2wroffset: number;
    slots: SlotDevice[];
    fakeDrive: SlotDevice;
    constructor();
    saveState(): AppleIIState;
    loadState(s: AppleIIState): void;
    saveControlsState(): AppleIIControlsState;
    loadControlsState(s: AppleIIControlsState): void;
    loadROM(data: any): void;
    reset(): void;
    skipboot(): void;
    readConst(address: number): number;
    read(address: number): number;
    write(address: number, val: number): void;
    floatbus(): number;
    connectVideo(pixels: Uint32Array): void;
    startScanline(): void;
    drawScanline(): void;
    advanceFrame(trap: any): number;
    advanceCPU(): number;
    setKeyInput(key: number, code: number, flags: number): void;
    doLanguageCardIO(address: number): number;
    setupLanguageCardConstants(): void;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: AppleIIState): any;
}
export {};
