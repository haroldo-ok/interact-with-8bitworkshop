import { BaseZ80VDPBasedMachine } from "./vdp_z80";
import { TMS9918A } from "../common/video/tms9918a";
interface MSXSlot {
    read(addr: number): number;
    write(addr: number, val: number): void;
}
export declare class MSX1 extends BaseZ80VDPBasedMachine {
    numVisibleScanlines: number;
    defaultROMSize: number;
    ram: Uint8Array;
    vdp: TMS9918A;
    bios: Uint8Array;
    slots: MSXSlot[];
    slotmask: number;
    ppi_c: number;
    constructor();
    getKeyboardMap(): Map<number, import("../common/emu").KeyMapEntry>;
    getKeyboardFunction(): (o: any, key: any, code: any, flags: any) => void;
    read: (a: any) => number;
    write: (a: any, v: any) => void;
    newIOBus(): {
        read: (addr: any) => any;
        write: (addr: any, val: any) => void;
    };
    vdpInterrupt(): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
    reset(): void;
    resetInputs(): void;
}
export {};
