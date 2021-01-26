import { CPU, Bus, InstructionBased, IOBusConnected, SavesState, Interruptable } from "../devices";
export interface Z80State {
    AF: number;
    BC: number;
    DE: number;
    HL: number;
    AF_: number;
    BC_: number;
    DE_: number;
    HL_: number;
    IX: number;
    IY: number;
    SP: number;
    PC: number;
    IR: number;
    iff1: number;
    iff2: number;
    im: number;
    halted: boolean;
    do_delayed_di: boolean;
    do_delayed_ei: boolean;
    cycle_counter: number;
}
export declare class Z80 implements CPU, InstructionBased, IOBusConnected, SavesState<Z80State>, Interruptable<number> {
    cpu: any;
    interruptType: any;
    memBus: Bus;
    ioBus: Bus;
    retryInterrupts: boolean;
    retryData: number;
    private buildCPU;
    connectMemoryBus(bus: Bus): void;
    connectIOBus(bus: Bus): void;
    advanceInsn(): any;
    reset(): void;
    interrupt(data: number): void;
    NMI(): void;
    getSP(): any;
    getPC(): any;
    isHalted(): any;
    saveState(): any;
    loadState(s: any): void;
    isStable(): boolean;
}
