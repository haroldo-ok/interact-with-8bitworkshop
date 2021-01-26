import { MOS6502 } from "../common/cpu/MOS6502";
import { BasicHeadlessMachine } from "../common/devices";
declare class RRIOT_6530 {
    regs: Uint8Array;
    ina: number;
    inb: number;
    read(a: number): number;
    write(a: number, v: number): void;
    input_a(): number;
    input_b(): number;
    output_a(): number;
    output_b(): number;
}
export declare class KIM1 extends BasicHeadlessMachine {
    cpuFrequency: number;
    defaultROMSize: number;
    cpu: MOS6502;
    ram: Uint8Array;
    bios: Uint8Array;
    rriot1: RRIOT_6530;
    rriot2: RRIOT_6530;
    digits: any[];
    constructor();
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    readConst(a: number): number;
    readIO_1(a: number): number;
    writeIO_1(a: number, v: number): void;
    readIO_2(a: number): number;
    writeIO_2(a: number, v: number): void;
    loadROM(data: any): void;
    loadBIOS(data: any): void;
    setKeyInput(key: number, code: number, flags: number): void;
    advanceFrame(trap: any): number;
}
export {};
