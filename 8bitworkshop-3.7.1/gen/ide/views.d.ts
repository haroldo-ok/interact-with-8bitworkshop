/// <reference types="jquery" />
/// <reference types="bootstrap" />
import { SourceFile, WorkerError, Segment, FileData, SourceLocation } from "../common/workertypes";
import { CodeAnalyzer } from "../common/analysis";
import { ProbeRecorder } from "../common/recorder";
import * as pixed from "./pixeleditor";
export interface ProjectView {
    createDiv(parent: HTMLElement): HTMLElement;
    setVisible?(showing: boolean): void;
    refresh(moveCursor: boolean): void;
    tick?(): void;
    getPath?(): string;
    getValue?(): string;
    setText?(text: string): void;
    insertText?(text: string): void;
    getCursorPC?(): number;
    getSourceFile?(): SourceFile;
    setGutterBytes?(line: number, s: string): void;
    markErrors?(errors: WorkerError[]): void;
    clearErrors?(): void;
    setTimingResult?(result: CodeAnalyzer): void;
    recreateOnResize?: boolean;
    undoStep?(): void;
}
export declare var isMobileDevice: boolean;
export declare var textMapFunctions: {
    input: any;
};
export declare class SourceEditor implements ProjectView {
    constructor(path: string, mode: string);
    path: string;
    mode: string;
    editor: any;
    dirtylisting: boolean;
    sourcefile: SourceFile;
    currentDebugLine: SourceLocation;
    markCurrentPC: any;
    errormsgs: any[];
    errorwidgets: any[];
    errormarks: any[];
    inspectWidget: any;
    createDiv(parent: HTMLElement): HTMLDivElement;
    newEditor(parent: HTMLElement, isAsmOverride?: boolean): void;
    setupEditor(): void;
    inspect(ident: string): void;
    setText(text: string): void;
    insertText(text: string): void;
    replaceSelection(start: number, end: number, text: string): void;
    getValue(): string;
    getPath(): string;
    addError(info: WorkerError): void;
    addErrorMarker(line: number, msg: string): void;
    addErrorLine(line: number, msg: string): void;
    expandErrors(): void;
    markErrors(errors: WorkerError[]): void;
    clearErrors(): void;
    getSourceFile(): SourceFile;
    updateListing(): void;
    setGutter(type: string, line: number, text: string): void;
    setGutterBytes(line: number, s: string): void;
    setTimingResult(result: CodeAnalyzer): void;
    setCurrentLine(line: SourceLocation, moveCursor: boolean): void;
    clearCurrentLine(moveCursor: boolean): void;
    getActiveLine(): SourceLocation;
    refreshDebugState(moveCursor: boolean): void;
    refreshListing(): void;
    refresh(moveCursor: boolean): void;
    tick(): void;
    getLine(line: number): any;
    getCurrentLine(): number;
    getCursorPC(): number;
    undoStep(): void;
    toggleBreakpoint(lineno: number): void;
}
export declare class DisassemblerView implements ProjectView {
    disasmview: any;
    getDisasmView(): any;
    createDiv(parent: HTMLElement): HTMLDivElement;
    newEditor(parent: HTMLElement): void;
    refresh(moveCursor: boolean): void;
    getCursorPC(): number;
}
export declare class ListingView extends DisassemblerView implements ProjectView {
    assemblyfile: SourceFile;
    path: string;
    constructor(lstfn: string);
    refreshListing(): void;
    refresh(moveCursor: boolean): void;
}
interface VirtualTextLine {
    text: string;
    clas?: string;
}
declare class VirtualTextScroller {
    memorylist: any;
    maindiv: HTMLElement;
    getLineAt: (row: number) => VirtualTextLine;
    constructor(parent: HTMLElement);
    create(workspace: HTMLElement, maxRowCount: number, fn: (row: number) => VirtualTextLine): void;
    refresh(): void;
}
export declare class MemoryView implements ProjectView {
    memorylist: any;
    dumplines: any;
    maindiv: HTMLElement;
    recreateOnResize: boolean;
    totalRows: number;
    createDiv(parent: HTMLElement): HTMLDivElement;
    showMemoryWindow(workspace: HTMLElement, parent: HTMLElement): void;
    scrollToAddress(addr: number): void;
    refresh(): void;
    tick(): void;
    getMemoryLineAt(row: number): string;
    readAddress(n: number): number;
    getDumpLineAt(line: number): string;
    getDumpLines(): any;
    getMemorySegment(a: number): string;
    findMemoryWindowLine(a: number): number;
}
export declare class VRAMMemoryView extends MemoryView {
    totalRows: number;
    readAddress(n: number): number;
    getMemorySegment(a: number): string;
    getDumpLines(): any;
}
export declare class BinaryFileView implements ProjectView {
    vlist: VirtualTextScroller;
    maindiv: HTMLElement;
    path: string;
    data: Uint8Array;
    recreateOnResize: boolean;
    constructor(path: string, data: Uint8Array);
    createDiv(parent: HTMLElement): HTMLElement;
    getMemoryLineAt(row: number): VirtualTextLine;
    refresh(): void;
    getPath(): string;
}
export declare class MemoryMapView implements ProjectView {
    maindiv: JQuery;
    createDiv(parent: HTMLElement): HTMLElement;
    addSegment(seg: Segment, newrow: boolean): void;
    refresh(): void;
}
declare abstract class ProbeViewBaseBase {
    probe: ProbeRecorder;
    tooldiv: HTMLElement;
    cumulativeData: boolean;
    abstract tick(): void;
    addr2symbol(addr: number): string;
    addr2str(addr: number): string;
    showTooltip(s: string): void;
    setVisible(showing: boolean): void;
    redraw(eventfn: (op: any, addr: any, col: any, row: any, clk: any, value: any) => void): void;
    opToString(op: number, addr?: number, value?: number): string;
    getOpRGB(op: number): number;
}
declare abstract class ProbeViewBase extends ProbeViewBaseBase {
    maindiv: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    recreateOnResize: boolean;
    abstract drawEvent(op: any, addr: any, col: any, row: any): any;
    createCanvas(parent: HTMLElement, width: number, height: number): HTMLDivElement;
    initCanvas(): void;
    getTooltipText(x: number, y: number): string;
    clear(): void;
    tick(): void;
}
declare abstract class ProbeBitmapViewBase extends ProbeViewBase {
    imageData: ImageData;
    datau32: Uint32Array;
    recreateOnResize: boolean;
    createDiv(parent: HTMLElement): HTMLDivElement;
    initCanvas(): void;
    getTooltipText(x: number, y: number): string;
    refresh(): void;
    tick(): void;
    clear(): void;
}
export declare class AddressHeatMapView extends ProbeBitmapViewBase implements ProjectView {
    createDiv(parent: HTMLElement): HTMLDivElement;
    clear(): void;
    drawEvent(op: any, addr: any, col: any, row: any): void;
    getTooltipText(x: number, y: number): string;
}
export declare class RasterPCHeatMapView extends ProbeBitmapViewBase implements ProjectView {
    drawEvent(op: any, addr: any, col: any, row: any): void;
}
export declare class ProbeLogView extends ProbeViewBaseBase {
    vlist: VirtualTextScroller;
    maindiv: HTMLElement;
    recreateOnResize: boolean;
    dumplines: any;
    createDiv(parent: HTMLElement): HTMLElement;
    getMemoryLineAt(row: number): VirtualTextLine;
    refresh(): void;
    tick(): void;
}
export declare class ProbeSymbolView extends ProbeViewBaseBase {
    vlist: VirtualTextScroller;
    keys: string[];
    recreateOnResize: boolean;
    dumplines: any;
    cumulativeData: boolean;
    createDiv(parent: HTMLElement): HTMLElement;
    getMemoryLineAt(row: number): VirtualTextLine;
    refresh(): void;
    tick(): void;
}
declare class TreeNode {
    parent: TreeNode;
    name: string;
    _div: HTMLElement;
    _header: HTMLElement;
    _inline: HTMLElement;
    _content: HTMLElement;
    children: Map<string, TreeNode>;
    expanded: boolean;
    level: number;
    view: ProjectView;
    constructor(parent: TreeNode, name: string);
    getDiv(): HTMLElement;
    toggleExpanded(): void;
    remove(): void;
    update(obj: any): void;
}
export declare abstract class TreeViewBase implements ProjectView {
    root: TreeNode;
    createDiv(parent: HTMLElement): HTMLElement;
    refresh(): void;
    tick(): void;
    abstract getRootObject(): Object;
}
export declare class StateBrowserView extends TreeViewBase implements ProjectView {
    getRootObject(): import("../common/baseplatform").EmuState;
}
export declare class DebugBrowserView extends TreeViewBase implements ProjectView {
    getRootObject(): {};
}
interface CallGraphNode {
    $$SP: number;
    $$PC: number;
    count: number;
    startLine: number;
    endLine: number;
    calls: {
        [id: string]: CallGraphNode;
    };
}
export declare class CallStackView extends ProbeViewBaseBase implements ProjectView {
    treeroot: TreeNode;
    graph: CallGraphNode;
    stack: CallGraphNode[];
    lastsp: number;
    lastpc: number;
    jsr: boolean;
    rts: boolean;
    cumulativeData: boolean;
    createDiv(parent: HTMLElement): HTMLElement;
    refresh(): void;
    tick(): void;
    clear(): void;
    reset(): void;
    newNode(pc: number, sp: number): {
        $$SP: number;
        $$PC: number;
        count: number;
        startLine: any;
        endLine: any;
        calls: {};
    };
    newRoot(pc: number, sp: number): void;
    getRootObject(): Object;
}
export declare class FrameCallsView extends ProbeViewBaseBase implements ProjectView {
    treeroot: TreeNode;
    createDiv(parent: HTMLElement): HTMLElement;
    refresh(): void;
    tick(): void;
    getRootObject(): Object;
}
export declare class AssetEditorView implements ProjectView, pixed.EditorContext {
    maindiv: JQuery;
    cureditordiv: JQuery;
    cureditelem: JQuery;
    cureditnode: pixed.PixNode;
    rootnodes: pixed.PixNode[];
    deferrednodes: pixed.PixNode[];
    createDiv(parent: HTMLElement): HTMLElement;
    clearAssets(): void;
    registerAsset(type: string, node: pixed.PixNode, deferred: number): void;
    getPalettes(matchlen: number): pixed.SelectablePalette[];
    getTilemaps(matchlen: number): pixed.SelectableTilemap[];
    isEditing(): boolean;
    getCurrentEditNode(): pixed.PixNode;
    setCurrentEditor(div: JQuery, editing: JQuery, node: pixed.PixNode): void;
    scanFileTextForAssets(id: string, data: string): any[];
    addPaletteEditorViews(parentdiv: JQuery, pal2rgb: pixed.PaletteFormatToRGB, callback: any): void;
    addPixelEditor(parentdiv: JQuery, firstnode: pixed.PixNode, fmt: pixed.PixelEditorImageFormat): void;
    addPaletteEditor(parentdiv: JQuery, firstnode: pixed.PixNode, palfmt?: any): void;
    ensureFileDiv(fileid: string): JQuery<HTMLElement>;
    refreshAssetsInFile(fileid: string, data: FileData): number;
    getFileDivId(id: string): string;
    refresh(moveCursor: boolean): void;
    setVisible?(showing: boolean): void;
}
export {};
