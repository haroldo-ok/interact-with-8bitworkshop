import { Platform, EmuState, EmuControlsState, EmuRecorder } from "./baseplatform";
declare type FrameRec = {
    controls: EmuControlsState;
    seed: number;
};
export declare class StateRecorderImpl implements EmuRecorder {
    checkpointInterval: number;
    callbackStateChanged: () => void;
    callbackNewCheckpoint: (state: EmuState) => void;
    maxCheckpoints: number;
    platform: Platform;
    checkpoints: EmuState[];
    framerecs: FrameRec[];
    frameCount: number;
    lastSeekFrame: number;
    lastSeekStep: number;
    lastStepCount: number;
    constructor(platform: Platform);
    reset(): void;
    frameRequested(): boolean;
    numFrames(): number;
    currentFrame(): number;
    currentStep(): number;
    recordFrame(state: EmuState): void;
    getStateAtOrBefore(frame: number): {
        frame: number;
        state: EmuState;
    };
    loadFrame(seekframe: number, seekstep?: number): number;
    loadControls(frame: number): void;
    getLastCheckpoint(): EmuState;
}
import { Probeable, ProbeAll } from "./devices";
export declare enum ProbeFlags {
    CLOCKS = 0,
    EXECUTE = 16777216,
    HAS_VALUE = 268435456,
    MEM_READ = 301989888,
    MEM_WRITE = 318767104,
    IO_READ = 335544320,
    IO_WRITE = 352321536,
    VRAM_READ = 369098752,
    VRAM_WRITE = 385875968,
    INTERRUPT = 134217728,
    ILLEGAL = 150994944,
    SP_PUSH = 167772160,
    SP_POP = 184549376,
    SCANLINE = 2113929216,
    FRAME = 2130706432
}
export declare class ProbeRecorder implements ProbeAll {
    m: Probeable;
    buf: Uint32Array;
    idx: number;
    sl: number;
    cur_sp: number;
    singleFrame: boolean;
    constructor(m: Probeable, buflen?: number);
    start(): void;
    stop(): void;
    reset(newbuflen?: number): void;
    clear(): void;
    logData(a: number): void;
    log(a: number): void;
    relog(a: number): void;
    lastOp(): number;
    lastAddr(): number;
    addLogBuffer(src: Uint32Array): void;
    logClocks(clocks: number): void;
    logNewScanline(): void;
    logNewFrame(): void;
    logExecute(address: number, SP: number): void;
    logInterrupt(type: number): void;
    logValue(address: number, value: number, op: number): void;
    logRead(address: number, value: number): void;
    logWrite(address: number, value: number): void;
    logIORead(address: number, value: number): void;
    logIOWrite(address: number, value: number): void;
    logVRAMRead(address: number, value: number): void;
    logVRAMWrite(address: number, value: number): void;
    logIllegal(address: number): void;
    countEvents(op: number): number;
    countClocks(): number;
}
export {};
