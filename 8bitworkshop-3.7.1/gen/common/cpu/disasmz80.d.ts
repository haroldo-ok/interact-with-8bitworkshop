export declare function disassembleZ80(pc: number, b0: number, b1: number, b2: number, b3: number): {
    line: string;
    nbytes: number;
    isaddr: boolean;
};
