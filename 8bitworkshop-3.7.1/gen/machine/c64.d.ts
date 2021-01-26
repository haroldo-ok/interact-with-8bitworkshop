import { Probeable } from "../common/devices";
import { Machine, BaseWASMMachine } from "../common/baseplatform";
import { TrapCondition } from "../common/devices";
export declare class C64_WASMMachine extends BaseWASMMachine implements Machine, Probeable {
    numTotalScanlines: number;
    cpuCyclesPerLine: number;
    prgstart: number;
    joymask0: number;
    joymask1: number;
    loadBIOS(srcArray: Uint8Array): void;
    reset(): void;
    advanceFrame(trap: TrapCondition): number;
    getCPUState(): {
        PC: number;
        SP: number;
        A: number;
        X: number;
        Y: number;
        C: number;
        Z: number;
        I: number;
        D: number;
        V: number;
        N: number;
        o: number;
    };
    saveState(): {
        c: {
            PC: number;
            SP: number;
            A: number;
            X: number;
            Y: number;
            C: number;
            Z: number;
            I: number;
            D: number;
            V: number;
            N: number;
            o: number;
        };
        state: Uint8Array;
        ram: Uint8Array;
    };
    loadState(state: any): void;
    getVideoParams(): {
        width: number;
        height: number;
        overscan: boolean;
        videoFrequency: number;
    };
    setKeyInput(key: number, code: number, flags: number): void;
}
