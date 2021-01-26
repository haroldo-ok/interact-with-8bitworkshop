import { Toolbar } from "../common/emu";
export interface WaveformMeta {
    label: string;
    len: number;
}
export interface WaveformProvider {
    getSignalMetadata(): WaveformMeta[];
    getSignalData(index: number, start: number, len: number): number[];
}
export declare class WaveformView {
    parent: HTMLElement;
    wfp: WaveformProvider;
    toolbar: Toolbar;
    wavelist: any;
    meta: WaveformMeta[];
    lines: HTMLCanvasElement[];
    zoom: number;
    t0: number;
    tsel: number;
    pageWidth: number;
    clocksPerPage: number;
    clockMax: number;
    hexformat: boolean;
    constructor(parent: HTMLElement, wfp: WaveformProvider);
    wtimer: any;
    recreate(): void;
    destroy(): void;
    _recreate(): void;
    roundT(t: number): number;
    setOrgTime(t: number): void;
    setEndTime(t: number): void;
    setSelTime(t: number): void;
    setZoom(zoom: number): void;
    refresh(): void;
    refreshRow(row: number): void;
}
