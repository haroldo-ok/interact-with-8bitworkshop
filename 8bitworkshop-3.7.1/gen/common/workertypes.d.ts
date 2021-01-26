export declare type FileData = string | Uint8Array;
export interface SourceLocation {
    line: number;
    label?: string;
    path?: string;
    start?: number;
    end?: number;
}
export interface SourceLine extends SourceLocation {
    offset: number;
    insns?: string;
    iscode?: boolean;
    cycles?: number;
}
export declare class SourceFile {
    lines: SourceLine[];
    text: string;
    offset2loc: Map<number, SourceLine>;
    line2offset: Map<number, number>;
    constructor(lines: SourceLine[], text: string);
    findLineForOffset(PC: number, lookbehind: number): any;
    lineCount(): number;
}
export interface Dependency {
    path: string;
    filename: string;
    link: boolean;
    data: FileData;
}
export interface WorkerFileUpdate {
    path: string;
    data: FileData;
}
export interface WorkerBuildStep {
    path?: string;
    platform: string;
    tool: string;
    mainfile?: boolean;
}
export interface WorkerMessage extends WorkerBuildStep {
    preload: string;
    reset: boolean;
    code: string;
    updates: WorkerFileUpdate[];
    buildsteps: WorkerBuildStep[];
}
export interface WorkerError extends SourceLocation {
    msg: string;
}
export interface CodeListing {
    lines: SourceLine[];
    asmlines?: SourceLine[];
    text?: string;
    sourcefile?: SourceFile;
    assemblyfile?: SourceFile;
}
export declare type CodeListingMap = {
    [path: string]: CodeListing;
};
export declare type VerilogOutput = {
    program_rom_variable: string;
    program_rom: Uint8Array;
    code: string;
    name: string;
    ports: any[];
    signals: any[];
};
export declare type WorkerOutput = Uint8Array | VerilogOutput;
export declare type Segment = {
    name: string;
    start: number;
    size: number;
    last?: number;
    type?: string;
};
export interface WorkerResult {
    errors: WorkerError[];
    output?: WorkerOutput;
    listings?: CodeListingMap;
    symbolmap?: {
        [sym: string]: number;
    };
    params?: {};
    segments?: Segment[];
    unchanged?: boolean;
    debuginfo?: {};
}
