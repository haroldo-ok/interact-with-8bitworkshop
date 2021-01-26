import { Platform } from "./baseplatform";
export interface CodeAnalyzer {
    showLoopTimingForPC(pc: number): any;
    pc2minclocks: {
        [key: number]: number;
    };
    pc2maxclocks: {
        [key: number]: number;
    };
    MAX_CLOCKS: number;
}
declare abstract class CodeAnalyzer6502 implements CodeAnalyzer {
    pc2minclocks: {};
    pc2maxclocks: {};
    START_CLOCKS: number;
    MAX_CLOCKS: number;
    WRAP_CLOCKS: boolean;
    jsrresult: {};
    platform: Platform;
    MAX_CYCLES: number;
    constructor(platform: Platform);
    getClockCountsAtPC(pc: any): import("./baseplatform").OpcodeMetadata;
    traceInstructions(pc: number, minclocks: number, maxclocks: number, subaddr: number, constraints: any): void;
    showLoopTimingForPC(pc: number): void;
}
export declare class CodeAnalyzer_vcs extends CodeAnalyzer6502 {
    constructor(platform: Platform);
}
export declare class CodeAnalyzer_nes extends CodeAnalyzer6502 {
    constructor(platform: Platform);
}
export declare class CodeAnalyzer_apple2 extends CodeAnalyzer6502 {
    constructor(platform: Platform);
}
export {};
