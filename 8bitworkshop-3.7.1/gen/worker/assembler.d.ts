declare type AssemblerVar = {
    bits: number;
    toks: string[];
    iprel?: boolean;
    ipofs?: number;
};
declare type AssemblerRule = {
    fmt: string;
    bits: (string | number)[];
    re?: RegExp;
    prefix?: string;
    varlist?: string[];
};
declare type AssemblerVarList = {
    [name: string]: AssemblerVar;
};
declare type AssemblerLine = {
    line: number;
    offset: number;
    nbits: number;
    insns?: string;
};
declare type AssemblerFixup = {
    sym: string;
    ofs: number;
    bitlen: number;
    bitofs: number;
    line: number;
    iprel: boolean;
    ipofs: number;
};
declare type AssemblerSpec = {
    name: string;
    width: number;
    vars: AssemblerVarList;
    rules: AssemblerRule[];
};
declare type AssemblerInstruction = {
    opcode: number;
    nbits: number;
};
declare type AssemblerErrorResult = {
    error: string;
};
declare type AssemblerLineResult = AssemblerErrorResult | AssemblerInstruction;
declare type AssemblerError = {
    msg: string;
    line: number;
};
declare type AssemblerState = {
    ip: number;
    line: number;
    origin: number;
    codelen: number;
    intermediate: any;
    output: number[];
    lines: AssemblerLine[];
    errors: AssemblerError[];
    fixups: AssemblerFixup[];
};
export declare class Assembler {
    spec: AssemblerSpec;
    ip: number;
    origin: number;
    linenum: number;
    symbols: {
        [name: string]: {
            value: number;
        };
    };
    errors: AssemblerError[];
    outwords: number[];
    asmlines: AssemblerLine[];
    fixups: AssemblerFixup[];
    width: number;
    codelen: number;
    aborted: boolean;
    constructor(spec: AssemblerSpec);
    rule2regex(rule: AssemblerRule, vars: AssemblerVarList): AssemblerRule;
    preprocessRules(): void;
    warning(msg: string, line?: number): void;
    fatal(msg: string, line?: number): void;
    fatalIf(msg?: string, line?: number): void;
    addBytes(result: AssemblerInstruction): void;
    addWords(data: number[]): void;
    parseData(toks: string[]): number[];
    alignIP(align: any): void;
    parseConst(s: string, nbits?: number): number;
    buildInstruction(rule: AssemblerRule, m: string[]): AssemblerLineResult;
    loadArch(arch: string): string;
    parseDirective(tokens: any): void;
    assemble(line: string): AssemblerInstruction;
    finish(): AssemblerState;
    assembleFile(text: any): AssemblerState;
    state(): AssemblerState;
    loadJSON: (path: string) => any;
    loadInclude: (path: string) => string;
    loadModule: (path: string) => string;
}
export {};
