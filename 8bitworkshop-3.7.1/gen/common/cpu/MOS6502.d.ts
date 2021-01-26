import { CPU, Bus, ClockBased, SavesState, Interruptable } from "../devices";
export interface MOS6502State {
    PC: number;
    SP: number;
    A: number;
    X: number;
    Y: number;
    N: number;
    V: number;
    D: number;
    I: number;
    Z: number;
    C: number;
    T: number;
    o: number;
    R: number;
    d: number;
    AD: number;
    BA: number;
    BC: number;
    IA: number;
    bo: number;
    boa: number;
}
export declare enum MOS6502Interrupts {
    None = 0,
    NMI = 1,
    IRQ = 2
}
export declare class MOS6502 implements CPU, ClockBased, SavesState<MOS6502State>, Interruptable<MOS6502Interrupts> {
    cpu: any;
    interruptType: MOS6502Interrupts;
    connectMemoryBus(bus: Bus): void;
    advanceClock(): void;
    advanceInsn(): void;
    reset(): void;
    interrupt(itype: number): void;
    NMI(): void;
    IRQ(): void;
    getSP(): any;
    getPC(): any;
    saveState(): any;
    loadState(s: any): void;
    isStable(): boolean;
}
