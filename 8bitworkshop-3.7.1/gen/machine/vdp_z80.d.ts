import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicScanlineMachine, Bus, ProbeAll } from "../common/devices";
import { TMS9918A } from "../common/video/tms9918a";
export declare abstract class BaseZ80VDPBasedMachine extends BasicScanlineMachine {
    cpuFrequency: number;
    canvasWidth: number;
    numTotalScanlines: number;
    numVisibleScanlines: number;
    cpuCyclesPerLine: number;
    sampleRate: number;
    overscan: boolean;
    cpu: Z80;
    vdp: TMS9918A;
    psg: any;
    audioadapter: any;
    abstract vdpInterrupt(): any;
    abstract getKeyboardMap(): any;
    getKeyboardFunction(): any;
    init(membus: Bus, iobus: Bus, psg: any): void;
    connectVideo(pixels: any): void;
    connectProbe(probe: ProbeAll): void;
    newVDP(frameData: any, cru: any, flicker: any): TMS9918A;
    startScanline(): void;
    drawScanline(): void;
    loadState(state: any): void;
    saveState(): {
        c: any;
        ram: Uint8Array;
        inputs: Uint8Array;
    };
    reset(): void;
    getDebugCategories(): string[];
    getDebugInfo(category: any, state: any): string;
    vdpStateToLongString(ppu: any): string;
    readVRAMAddress(a: number): number;
}
