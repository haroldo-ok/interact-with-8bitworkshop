import { Z80 } from "../common/cpu/ZilogZ80";
import { BasicMachine, Bus } from "../common/devices";
import { BaseZ80MachinePlatform } from "../common/baseplatform";
/****************************************************************************

    Midway/Williams Audio Boards
    ----------------------------

    6809 MEMORY MAP

    Function                                  Address     R/W  Data
    ---------------------------------------------------------------
    Program RAM                               0000-07FF   R/W  D0-D7

    Music (YM-2151)                           2000-2001   R/W  D0-D7

    6821 PIA                                  4000-4003   R/W  D0-D7

    HC55516 clock low, digit latch            6000        W    D0
    HC55516 clock high                        6800        W    xx

    Bank select                               7800        W    D0-D2

    Banked Program ROM                        8000-FFFF   R    D0-D7

****************************************************************************/
declare class WilliamsSound extends BasicMachine {
    cpuFrequency: number;
    cpuCyclesPerFrame: number;
    cpuAudioFactor: number;
    canvasWidth: number;
    numVisibleScanlines: number;
    defaultROMSize: number;
    sampleRate: number;
    overscan: boolean;
    cpu: Z80;
    ram: Uint8Array;
    iobus: Bus;
    command: number;
    dac: number;
    dac_float: number;
    xpos: number;
    read: (a: number, v?: number) => number;
    write: (a: number, v?: number) => number;
    constructor();
    advanceFrame(trap: any): number;
    advanceCPU(): number;
    setKeyInput(key: number, code: number, flags: number): void;
}
export declare class WilliamsSoundPlatform extends BaseZ80MachinePlatform<WilliamsSound> {
    newMachine(): WilliamsSound;
    getPresets(): {
        id: string;
        name: string;
    }[];
    getDefaultExtension(): string;
    readAddress(a: any): number;
}
export {};
