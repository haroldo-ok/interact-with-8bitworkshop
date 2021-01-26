export declare var OPS_6502: {
    mn: string;
    am: string;
    nb: number;
    il: number;
    c1: number;
    c2: number;
}[];
export declare function disassemble6502(pc: number, b0: number, b1: number, b2: number): {
    line: string;
    nbytes: number;
    isaddr: boolean;
};
