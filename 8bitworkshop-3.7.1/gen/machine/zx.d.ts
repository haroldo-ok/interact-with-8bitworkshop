import { Machine, BaseWASMMachine } from "../common/baseplatform";
import { TrapCondition } from "../common/devices";
export declare class ZX_WASMMachine extends BaseWASMMachine implements Machine {
    numTotalScanlines: number;
    cpuCyclesPerLine: number;
    joymask0: number;
    reset(): void;
    advanceFrame(trap: TrapCondition): number;
    getCPUState(): {
        PC: number;
        SP: number;
        AF: number;
        BC: number;
        DE: number;
        HL: number;
        IX: number;
        IY: number;
        IR: number;
        o: number;
    };
    saveState(): {
        c: {
            PC: number;
            SP: number;
            AF: number;
            BC: number;
            DE: number;
            HL: number;
            IX: number;
            IY: number;
            IR: number;
            o: number;
        };
        state: Uint8Array;
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
