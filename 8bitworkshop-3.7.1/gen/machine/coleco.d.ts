import { BaseZ80VDPBasedMachine } from "./vdp_z80";
export declare class ColecoVision extends BaseZ80VDPBasedMachine {
    defaultROMSize: number;
    ram: Uint8Array;
    bios: Uint8Array;
    keypadMode: boolean;
    constructor();
    getKeyboardMap(): Map<number, import("../common/emu").KeyMapEntry>;
    vdpInterrupt(): void;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    newIOBus(): {
        read: (addr: number) => number;
        write: (addr: number, val: number) => void;
    };
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
    reset(): void;
}
