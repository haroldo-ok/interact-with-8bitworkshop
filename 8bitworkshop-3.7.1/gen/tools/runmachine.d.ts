import { Machine } from "../common/baseplatform";
import { SerialIOInterface } from "../common/devices";
declare class SerialTestHarness implements SerialIOInterface {
    bufferedRead: boolean;
    cyclesPerByte: number;
    maxOutputBytes: number;
    inputBytes: Uint8Array;
    outputBytes: number[];
    inputIndex: number;
    clk: number;
    bufin: string;
    clearToSend(): boolean;
    sendByte(b: number): void;
    byteAvailable(): boolean;
    recvByte(): number;
    readIndex(): number;
    reset(): void;
    advance(clocks: number): void;
}
export declare class MachineRunner {
    machine: Machine;
    pixels: Uint32Array;
    serial: SerialTestHarness;
    constructor(machine: Machine);
    setup(): void;
    run(): void;
}
export {};
