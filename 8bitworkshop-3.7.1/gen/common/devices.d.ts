export interface SavesState<S> {
    saveState(): S;
    loadState(state: S): void;
}
export interface Bus {
    read(a: number): number;
    write(a: number, v: number): void;
    readConst?(a: number): number;
}
export interface ClockBased {
    advanceClock(): void;
}
export interface InstructionBased {
    advanceInsn(): number;
}
export declare type TrapCondition = () => boolean;
export interface FrameBased {
    advanceFrame(trap: TrapCondition): number;
}
export interface VideoSource {
    getVideoParams(): VideoParams;
    connectVideo(pixels: Uint32Array): void;
}
export interface RasterFrameBased extends FrameBased, VideoSource {
    getRasterY(): number;
    getRasterX(): number;
}
export interface VideoParams {
    width: number;
    height: number;
    overscan?: boolean;
    rotate?: number;
    videoFrequency?: number;
}
export interface SampledAudioParams {
    sampleRate: number;
    stereo: boolean;
}
export interface SampledAudioSink {
    feedSample(value: number, count: number): void;
}
export interface SampledAudioSource {
    getAudioParams(): SampledAudioParams;
    connectAudio(audio: SampledAudioSink): void;
}
export interface AcceptsROM {
    loadROM(data: Uint8Array, title?: string): void;
}
export interface AcceptsBIOS {
    loadBIOS(data: Uint8Array, title?: string): void;
}
export interface Resettable {
    reset(): void;
}
export interface MemoryBusConnected {
    connectMemoryBus(bus: Bus): void;
}
export interface IOBusConnected {
    connectIOBus(bus: Bus): void;
}
export interface CPU extends MemoryBusConnected, Resettable, SavesState<any> {
    getPC(): number;
    getSP(): number;
    isStable(): boolean;
}
export interface HasCPU extends Resettable {
    cpu: CPU;
}
export interface Interruptable<IT> {
    interrupt(type: IT): void;
}
export interface SavesInputState<CS> {
    loadControlsState(cs: CS): void;
    saveControlsState(): CS;
}
export interface AcceptsKeyInput {
    setKeyInput(key: number, code: number, flags: number): void;
}
export interface AcceptsPaddleInput {
    setPaddleInput(controller: number, value: number): void;
}
export interface SerialIOInterface {
    clearToSend(): boolean;
    sendByte(b: number): any;
    byteAvailable(): boolean;
    recvByte(): number;
    reset(): void;
    advance(clocks: number): void;
}
export interface HasSerialIO {
    connectSerialIO(serial: SerialIOInterface): any;
}
export interface Probeable {
    connectProbe(probe: ProbeAll): void;
}
export declare function xorshift32(x: number): number;
export interface ProbeTime {
    logClocks(clocks: number): any;
    logNewScanline(): any;
    logNewFrame(): any;
}
export interface ProbeCPU {
    logExecute(address: number, SP: number): any;
    logInterrupt(type: number): any;
    logIllegal(address: number): any;
}
export interface ProbeBus {
    logRead(address: number, value: number): any;
    logWrite(address: number, value: number): any;
}
export interface ProbeIO {
    logIORead(address: number, value: number): any;
    logIOWrite(address: number, value: number): any;
}
export interface ProbeVRAM {
    logVRAMRead(address: number, value: number): any;
    logVRAMWrite(address: number, value: number): any;
}
export interface ProbeAll extends ProbeTime, ProbeCPU, ProbeBus, ProbeIO, ProbeVRAM {
    logData(data: number): any;
    addLogBuffer(src: Uint32Array): any;
}
export declare class NullProbe implements ProbeAll {
    logClocks(): void;
    logNewScanline(): void;
    logNewFrame(): void;
    logExecute(): void;
    logInterrupt(): void;
    logRead(): void;
    logWrite(): void;
    logIORead(): void;
    logIOWrite(): void;
    logVRAMRead(): void;
    logVRAMWrite(): void;
    logIllegal(): void;
    logData(): void;
    addLogBuffer(src: Uint32Array): void;
}
export interface BasicMachineControlsState {
    inputs: Uint8Array;
}
export interface BasicMachineState extends BasicMachineControlsState {
    c: any;
    ram: Uint8Array;
}
export declare abstract class BasicHeadlessMachine implements HasCPU, Bus, AcceptsROM, Probeable, SavesState<BasicMachineState>, SavesInputState<BasicMachineControlsState> {
    abstract cpuFrequency: number;
    abstract defaultROMSize: number;
    abstract cpu: CPU;
    abstract ram: Uint8Array;
    rom: Uint8Array;
    inputs: Uint8Array;
    handler: (key: any, code: any, flags: any) => void;
    nullProbe: NullProbe;
    probe: ProbeAll;
    abstract read(a: number): number;
    abstract write(a: number, v: number): void;
    setKeyInput(key: number, code: number, flags: number): void;
    connectProbe(probe: ProbeAll): void;
    reset(): void;
    loadROM(data: Uint8Array, title?: string): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
    loadControlsState(state: any): void;
    saveControlsState(): {
        inputs: Uint8Array;
    };
    advanceCPU(): number;
    probeMemoryBus(membus: Bus): Bus;
    connectCPUMemoryBus(membus: Bus): void;
    probeIOBus(iobus: Bus): Bus;
    connectCPUIOBus(iobus: Bus): void;
}
export declare abstract class BasicMachine extends BasicHeadlessMachine implements SampledAudioSource {
    abstract canvasWidth: number;
    abstract numVisibleScanlines: number;
    abstract sampleRate: number;
    overscan: boolean;
    rotate: number;
    pixels: Uint32Array;
    audio: SampledAudioSink;
    scanline: number;
    getAudioParams(): SampledAudioParams;
    connectAudio(audio: SampledAudioSink): void;
    getVideoParams(): VideoParams;
    connectVideo(pixels: Uint32Array): void;
}
export declare abstract class BasicScanlineMachine extends BasicMachine implements RasterFrameBased {
    abstract numTotalScanlines: number;
    abstract cpuCyclesPerLine: number;
    abstract startScanline(): void;
    abstract drawScanline(): void;
    frameCycles: number;
    advanceFrame(trap: TrapCondition): number;
    preFrame(): void;
    postFrame(): void;
    getRasterY(): number;
    getRasterX(): number;
}
