import { RasterVideo, AnimationTimer, ControllerPoller } from "./emu";
import { CodeAnalyzer } from "./analysis";
import { Segment, FileData } from "./workertypes";
export interface OpcodeMetadata {
    minCycles: number;
    maxCycles: number;
    insnlength: number;
    opcode: number;
}
export interface CpuState {
    PC: number;
    EPC?: number;
    o?: number;
    SP?: number;
}
export interface EmuState {
    c?: CpuState;
    b?: Uint8Array | number[];
    ram?: Uint8Array;
    o?: {};
}
export interface EmuControlsState {
}
export declare type DisasmLine = {
    line: string;
    nbytes: number;
    isaddr: boolean;
};
export declare type SymbolMap = {
    [ident: string]: number;
};
export declare type AddrSymbolMap = {
    [address: number]: string;
};
export declare class DebugSymbols {
    symbolmap: SymbolMap;
    addr2symbol: AddrSymbolMap;
    debuginfo: {};
    constructor(symbolmap: SymbolMap, debuginfo: {});
}
declare type MemoryMap = {
    [type: string]: Segment[];
};
export declare function isDebuggable(arg: any): arg is Debuggable;
export interface Debuggable {
    getDebugCategories?(): string[];
    getDebugInfo?(category: string, state: EmuState): string;
}
export interface Platform {
    start(): void | Promise<void>;
    reset(): void;
    isRunning(): boolean;
    getToolForFilename(s: string): string;
    getDefaultExtension(): string;
    getPresets(): Preset[];
    pause(): void;
    resume(): void;
    loadROM(title: string, rom: any): any;
    loadBIOS?(title: string, rom: Uint8Array): any;
    getROMExtension?(rom: FileData): string;
    loadState?(state: EmuState): void;
    saveState?(): EmuState;
    loadControlsState?(state: EmuControlsState): void;
    saveControlsState?(): EmuControlsState;
    inspect?(ident: string): string;
    disassemble?(addr: number, readfn: (addr: number) => number): DisasmLine;
    readAddress?(addr: number): number;
    readVRAMAddress?(addr: number): number;
    setFrameRate?(fps: number): void;
    getFrameRate?(): number;
    setupDebug?(callback: BreakpointCallback): void;
    clearDebug?(): void;
    step?(): void;
    runToVsync?(): void;
    runToPC?(pc: number): void;
    runUntilReturn?(): void;
    stepBack?(): void;
    runEval?(evalfunc: DebugEvalCondition): void;
    runToFrameClock?(clock: number): void;
    stepOver?(): void;
    restartAtPC?(pc: number): boolean;
    getOpcodeMetadata?(opcode: number, offset: number): OpcodeMetadata;
    getSP?(): number;
    getPC?(): number;
    getOriginPC?(): number;
    newCodeAnalyzer?(): CodeAnalyzer;
    getPlatformName?(): string;
    getMemoryMap?(): MemoryMap;
    setRecorder?(recorder: EmuRecorder): void;
    advance?(novideo?: boolean): number;
    advanceFrameClock?(trap: DebugCondition, step: number): number;
    showHelp?(tool: string, ident?: string): void;
    resize?(): void;
    getRasterScanline?(): number;
    setBreakpoint?(id: string, cond: DebugCondition): any;
    clearBreakpoint?(id: string): any;
    hasBreakpoint?(id: string): boolean;
    getCPUState?(): CpuState;
    debugSymbols?: DebugSymbols;
    getDebugTree?(): {};
    startProbing?(): ProbeRecorder;
    stopProbing?(): void;
    isBlocked?(): boolean;
    readFile?(path: string): FileData;
    writeFile?(path: string, data: FileData): boolean;
}
export interface Preset {
    id: string;
    name: string;
    chapter?: number;
    title?: string;
}
export interface MemoryBus {
    read: (address: number) => number;
    write: (address: number, value: number) => void;
    contend?: (address: number, cycles: number) => number;
    isContended?: (address: number) => boolean;
}
export declare type DebugCondition = () => boolean;
export declare type DebugEvalCondition = (c: CpuState) => boolean;
export declare type BreakpointCallback = (s: EmuState, msg?: string) => void;
export declare class BreakpointList {
    id2bp: {
        [id: string]: Breakpoint;
    };
    getDebugCondition(): DebugCondition;
}
export interface Breakpoint {
    cond: DebugCondition;
}
export interface EmuRecorder {
    frameRequested(): boolean;
    recordFrame(state: EmuState): any;
}
export declare abstract class BasePlatform {
    recorder: EmuRecorder;
    debugSymbols: DebugSymbols;
    internalFiles: {
        [path: string]: FileData;
    };
    abstract loadState(state: EmuState): void;
    abstract saveState(): EmuState;
    abstract pause(): void;
    abstract resume(): void;
    abstract advance(novideo?: boolean): number;
    setRecorder(recorder: EmuRecorder): void;
    updateRecorder(): void;
    inspect(sym: string): string;
    getDebugTree(): {};
    readFile(path: string): FileData;
    writeFile(path: string, data: FileData): boolean;
}
export declare abstract class BaseDebugPlatform extends BasePlatform {
    onBreakpointHit: BreakpointCallback;
    debugCallback: DebugCondition;
    debugSavedState: EmuState;
    debugBreakState: EmuState;
    debugTargetClock: number;
    debugClock: number;
    breakpoints: BreakpointList;
    frameCount: number;
    abstract getCPUState(): CpuState;
    setBreakpoint(id: string, cond: DebugCondition): void;
    clearBreakpoint(id: string): void;
    hasBreakpoint(id: string): boolean;
    getDebugCallback(): DebugCondition;
    setupDebug(callback: BreakpointCallback): void;
    clearDebug(): void;
    setDebugCondition(debugCond: DebugCondition): void;
    restartDebugging(): void;
    preFrame(): void;
    postFrame(): void;
    pollControls(): void;
    nextFrame(novideo: boolean): number;
    abstract getSP(): number;
    abstract getPC(): number;
    abstract isStable(): boolean;
    evalDebugCondition(): void;
    wasBreakpointHit(): boolean;
    breakpointHit(targetClock: number, reason?: string): void;
    haltAndCatchFire(reason: string): void;
    runEval(evalfunc: DebugEvalCondition): void;
    runToPC(pc: number): void;
    runUntilReturn(): void;
    runToFrameClock(clock: number): void;
    step(): void;
    stepBack(): void;
    runToVsync(): void;
}
export declare function inspectSymbol(platform: Platform, sym: string): string;
export declare function getToolForFilename_6502(fn: string): string;
export declare abstract class Base6502Platform extends BaseDebugPlatform {
    debugPCDelta: number;
    fixPC(c: any): any;
    unfixPC(c: any): any;
    getSP(): number;
    getPC(): number;
    isStable(): boolean;
    abstract readAddress(addr: number): number;
    newCPU(membus: MemoryBus): any;
    getOpcodeMetadata(opcode: any, offset: any): {
        opcode: any;
        minCycles: number;
        maxCycles: number;
        insnlength: number;
    };
    getOriginPC(): number;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
    getToolForFilename: typeof getToolForFilename_6502;
    getDefaultExtension(): string;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
}
export declare function cpuStateToLongString_6502(c: any): string;
export declare function getOpcodeMetadata_6502(opcode: any, address: any): {
    opcode: any;
    minCycles: number;
    maxCycles: number;
    insnlength: number;
};
export declare function cpuStateToLongString_Z80(c: any): string;
export declare abstract class BaseZ80Platform extends BaseDebugPlatform {
    _cpu: any;
    waitCycles: number;
    newCPU(membus: MemoryBus, iobus: MemoryBus): any;
    getPC(): any;
    getSP(): any;
    isStable(): boolean;
    runCPU(cpu: any, cycles: number): number;
    getToolForFilename: typeof getToolForFilename_z80;
    getDefaultExtension(): string;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
}
export declare function getToolForFilename_z80(fn: any): string;
export declare function cpuStateToLongString_6809(c: any): string;
export declare function getToolForFilename_6809(fn: string): string;
export declare abstract class Base6809Platform extends BaseZ80Platform {
    newCPU(membus: MemoryBus): any;
    cpuStateToLongString(c: CpuState): string;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
    getDefaultExtension(): string;
    getToolForFilename: typeof getToolForFilename_6809;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
}
export declare abstract class BaseMAMEPlatform {
    loaded: boolean;
    preinitted: boolean;
    started: boolean;
    romfn: string;
    romdata: Uint8Array;
    video: any;
    running: boolean;
    initluavars: boolean;
    luadebugscript: string;
    js_lua_string: any;
    onBreakpointHit: any;
    mainElement: HTMLElement;
    timer: AnimationTimer;
    constructor(mainElement: any);
    luacall(s: string): string;
    _pause(): void;
    pause(): void;
    _resume(): void;
    resume(): void;
    reset(): void;
    isRunning(): boolean;
    bufferConsoleOutput(s: any): void;
    startModule(mainElement: any, opts: any): void;
    loadROMFile(data: any): void;
    loadRegion(region: any, data: any): void;
    initlua(): void;
    readAddress(a: number): number;
    getCPUReg(reg: string): number;
    getPC(): number;
    getSP(): number;
    isStable(): boolean;
    getCPUState(): {
        PC: number;
        SP: number;
        A: number;
        X: number;
        Y: number;
    };
    grabState(expr: string): {
        c: {
            PC: number;
            SP: number;
            A: number;
            X: number;
            Y: number;
        };
        buf: string;
    };
    saveState(): {
        c: {
            PC: number;
            SP: number;
            A: number;
            X: number;
            Y: number;
        };
        buf: string;
    };
    loadState(state: any): string;
    poll(): void;
    clearDebug(): void;
    getDebugCallback(): any;
    setupDebug(callback: any): void;
    debugcmd(s: any): void;
    runToPC(pc: any): void;
    runToVsync(): void;
    runUntilReturn(): void;
    runEval(): void;
    step(): void;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
    cpuStateToLongString(c: any): string;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
}
export declare function dumpStackToString(platform: Platform, mem: Uint8Array | number[], start: number, end: number, sp: number, jsrop: number): string;
export declare function lookupSymbol(platform: Platform, addr: number, extra: boolean): string;
import { Bus, Resettable, FrameBased, VideoSource, SampledAudioSource, AcceptsROM, AcceptsBIOS, AcceptsKeyInput, SavesState, SavesInputState, HasCPU, CPU, HasSerialIO, SerialIOInterface } from "./devices";
import { Probeable, RasterFrameBased, AcceptsPaddleInput, SampledAudioSink, ProbeAll } from "./devices";
import { SampledAudio } from "./audio";
import { ProbeRecorder } from "./recorder";
export interface Machine extends Bus, Resettable, FrameBased, AcceptsROM, HasCPU, SavesState<EmuState>, SavesInputState<any> {
}
export declare function hasVideo(arg: any): arg is VideoSource;
export declare function hasAudio(arg: any): arg is SampledAudioSource;
export declare function hasKeyInput(arg: any): arg is AcceptsKeyInput;
export declare function hasPaddleInput(arg: any): arg is AcceptsPaddleInput;
export declare function isRaster(arg: any): arg is RasterFrameBased;
export declare function hasProbe(arg: any): arg is Probeable;
export declare function hasBIOS(arg: any): arg is AcceptsBIOS;
export declare function hasSerialIO(arg: any): arg is HasSerialIO;
export declare abstract class BaseMachinePlatform<T extends Machine> extends BaseDebugPlatform implements Platform {
    machine: T;
    mainElement: HTMLElement;
    timer: AnimationTimer;
    video: RasterVideo;
    audio: SampledAudio;
    poller: ControllerPoller;
    probeRecorder: ProbeRecorder;
    startProbing: any;
    stopProbing: any;
    abstract newMachine(): T;
    abstract getToolForFilename(s: string): string;
    abstract getDefaultExtension(): string;
    abstract getPresets(): Preset[];
    constructor(mainElement: HTMLElement);
    reset(): void;
    loadState(s: any): void;
    saveState(): EmuState;
    getSP(): number;
    getPC(): number;
    isStable(): boolean;
    getCPUState(): any;
    loadControlsState(s: any): void;
    saveControlsState(): any;
    start(): void;
    loadROM(title: any, data: any): void;
    loadBIOS: (title: any, data: any) => void;
    serialIOInterface: SerialIOInterface;
    pollControls(): void;
    advance(novideo: boolean): number;
    advanceFrameClock(trap: any, step: any): number;
    isRunning(): boolean;
    resume(): void;
    pause(): void;
    runToVsync(): void;
    getRasterScanline(): number;
    readAddress(addr: number): number;
}
export declare abstract class Base6502MachinePlatform<T extends Machine> extends BaseMachinePlatform<T> {
    getOpcodeMetadata: typeof getOpcodeMetadata_6502;
    getToolForFilename: typeof getToolForFilename_6502;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
}
export declare abstract class BaseZ80MachinePlatform<T extends Machine> extends BaseMachinePlatform<T> {
    getToolForFilename: typeof getToolForFilename_z80;
    getDebugCategories(): string[];
    getDebugInfo(category: string, state: EmuState): string;
    disassemble(pc: number, read: (addr: number) => number): DisasmLine;
}
export declare abstract class BaseWASMMachine {
    prefix: string;
    instance: WebAssembly.Instance;
    exports: any;
    sys: number;
    pixel_dest: Uint32Array;
    pixel_src: Uint32Array;
    stateptr: number;
    statearr: Uint8Array;
    cpustateptr: number;
    cpustatearr: Uint8Array;
    ctrlstateptr: number;
    ctrlstatearr: Uint8Array;
    cpu: CPU;
    romptr: number;
    romlen: number;
    romarr: Uint8Array;
    biosptr: number;
    biosarr: Uint8Array;
    audio: SampledAudioSink;
    audioarr: Float32Array;
    probe: ProbeAll;
    abstract getCPUState(): CpuState;
    constructor(prefix: string);
    loadWASM(): Promise<void>;
    getPC(): number;
    getSP(): number;
    isStable(): boolean;
    loadROM(rom: Uint8Array): void;
    loadBIOS(srcArray: Uint8Array): void;
    reset(): void;
    read(address: number): number;
    readConst(address: number): number;
    write(address: number, value: number): void;
    getAudioParams(): {
        sampleRate: number;
        stereo: boolean;
    };
    connectVideo(pixels: Uint32Array): void;
    syncVideo(): void;
    saveControlsState(): any;
    loadControlsState(state: any): void;
    connectAudio(audio: SampledAudioSink): void;
    syncAudio(): void;
    advanceFrameClock(trap: any, cpf: number): number;
    copyProbeData(): void;
    connectProbe(probe: ProbeAll): void;
}
export {};
