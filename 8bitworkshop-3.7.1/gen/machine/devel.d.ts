import { MOS6502 } from "../common/cpu/MOS6502";
import { BasicHeadlessMachine, HasSerialIO, SerialIOInterface } from "../common/devices";
export declare class Devel6502 extends BasicHeadlessMachine implements HasSerialIO {
    cpuFrequency: number;
    defaultROMSize: number;
    cpu: MOS6502;
    ram: Uint8Array;
    rom: Uint8Array;
    serial: SerialIOInterface;
    constructor();
    connectSerialIO(serial: SerialIOInterface): void;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    readConst(a: number): number;
    advanceFrame(trap: any): number;
    advanceCPU(): number;
    reset(): void;
    isHalted(): boolean;
}
