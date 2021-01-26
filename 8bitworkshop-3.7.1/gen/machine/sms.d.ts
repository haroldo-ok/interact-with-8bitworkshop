import { BaseZ80VDPBasedMachine } from "./vdp_z80";
import { SMSVDP } from "../common/video/tms9918a";
export declare class SG1000 extends BaseZ80VDPBasedMachine {
    numVisibleScanlines: number;
    defaultROMSize: number;
    ram: Uint8Array;
    constructor();
    getKeyboardMap(): Map<number, import("../common/emu").KeyMapEntry>;
    vdpInterrupt(): void;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    getVCounter(): number;
    getHCounter(): number;
    setMemoryControl(v: number): void;
    setIOPortControl(v: number): void;
    newIOBus(): {
        read: (addr: number) => number;
        write: (addr: number, val: number) => any;
    };
}
export declare class SMS extends SG1000 {
    cartram: Uint8Array;
    pagingRegisters: Uint8Array;
    romPageMask: number;
    latchedHCounter: number;
    ioControlFlags: number;
    ram: Uint8Array;
    newVDP(frameData: any, cru: any, flicker: any): SMSVDP;
    reset(): void;
    getVCounter(): number;
    getHCounter(): number;
    computeHCounter(): number;
    setIOPortControl(v: number): void;
    getPagedROM(a: number, reg: number): number;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    loadROM(data: Uint8Array): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
    getDebugInfo(category: any, state: any): string;
}
