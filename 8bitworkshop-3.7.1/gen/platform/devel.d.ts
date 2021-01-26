import { SerialIOInterface } from "../common/devices";
import { TeleType } from "../common/teletype";
declare class SerialInOutViewer {
    div: HTMLElement;
    tty: TeleType;
    constructor(div: HTMLElement);
    start(): void;
    reset(): void;
    saveState(): {
        curstyle: number;
        reverse: boolean;
        col: number;
        row: number;
        ncharsout: number;
        lines: Node[];
    };
    loadState(state: any): void;
}
export declare class SerialTestHarness implements SerialIOInterface {
    viewer: SerialInOutViewer;
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
    saveState(): {
        clk: number;
        idx: number;
        out: number[];
    };
    loadState(state: any): void;
}
export {};
