import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicScanlineMachine, AcceptsPaddleInput } from "../common/devices";
import { AY38910_Audio } from "../common/audio";
export declare class BallyAstrocade extends BasicScanlineMachine implements AcceptsPaddleInput {
    cpuFrequency: number;
    numTotalScanlines: number;
    numVisibleScanlines: number;
    cpuCyclesPerLine: number;
    defaultROMSize: number;
    canvasWidth: number;
    sampleRate: number;
    ram: Uint8Array;
    cpu: Z80;
    m: any;
    psg: AstrocadeAudio;
    audioadapter: any;
    backbuffer: Uint32Array;
    frontbuffer: Uint32Array;
    constructor(arcade: boolean);
    read(a: number): number;
    write(a: number, v: number): void;
    connectVideo(pixels: Uint32Array): void;
    preFrame(): void;
    postFrame(): void;
    setPaddleInput(controller: number, value: number): void;
    startScanline(): void;
    drawScanline(): void;
    advanceCPU(): number;
    loadROM(data: any): void;
    loadBIOS(data: any): void;
    reset(): void;
    loadState(state: any): void;
    saveState(): any;
    getDebugCategories(): string[];
    getDebugInfo(category: any, state: any): any;
}
declare class AstrocadeAudio extends AY38910_Audio {
    setACRegister(addr: number, val: number): void;
}
export declare const _BallyArcade: () => void;
export {};
