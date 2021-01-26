/// <reference types="jquery" />
/// <reference types="bootstrap" />
import { ProjectWindows } from "./windows";
export declare type UintArray = number[] | Uint8Array | Uint16Array | Uint32Array;
export interface EditorContext {
    setCurrentEditor(div: JQuery, editing: JQuery, node: PixNode): void;
    getPalettes(matchlen: number): SelectablePalette[];
    getTilemaps(matchlen: number): SelectableTilemap[];
}
export declare type SelectablePalette = {
    node: PixNode;
    name: string;
    palette: Uint32Array;
};
export declare type SelectableTilemap = {
    node: PixNode;
    name: string;
    images: Uint8Array[];
    rgbimgs: Uint32Array[];
};
export declare type PixelEditorImageFormat = {
    w: number;
    h: number;
    count?: number;
    bpp?: number;
    np?: number;
    bpw?: number;
    sl?: number;
    pofs?: number;
    remap?: number[];
    brev?: boolean;
    flip?: boolean;
    destfmt?: PixelEditorImageFormat;
    xform?: string;
    skip?: number;
    aspect?: number;
};
export declare type PixelEditorPaletteFormat = {
    pal?: number | string;
    n?: number;
    layout?: string;
};
export declare type PixelEditorPaletteLayout = [string, number, number][];
export declare function parseHexWords(s: string): number[];
export declare function replaceHexWords(s: string, words: UintArray): string;
export declare function getPaletteLength(palfmt: PixelEditorPaletteFormat): number;
export declare abstract class PixNode {
    left: PixNode;
    right: PixNode;
    words?: UintArray;
    images?: Uint8Array[];
    rgbimgs?: Uint32Array[];
    palette?: Uint32Array;
    abstract updateLeft(): boolean;
    abstract updateRight(): boolean;
    refreshLeft(): void;
    refreshRight(): void;
    addRight(node: PixNode): PixNode;
    addLeft(node: PixNode): PixNode;
}
declare abstract class CodeProjectDataNode extends PixNode {
    project: ProjectWindows;
    fileid: string;
    label: string;
    words: UintArray;
}
export declare class FileDataNode extends CodeProjectDataNode {
    constructor(project: ProjectWindows, fileid: string);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class TextDataNode extends CodeProjectDataNode {
    text: string;
    start: number;
    end: number;
    constructor(project: ProjectWindows, fileid: string, label: string, start: number, end: number);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class Compressor extends PixNode {
    words: UintArray;
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class Mapper extends PixNode {
    fmt: PixelEditorImageFormat;
    words: UintArray;
    images: Uint8Array[];
    constructor(fmt: any);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class Palettizer extends PixNode {
    images: Uint8Array[];
    rgbimgs: Uint32Array[];
    palette: Uint32Array;
    ncolors: number;
    context: EditorContext;
    paloptions: SelectablePalette[];
    palindex: number;
    constructor(context: EditorContext, fmt: PixelEditorImageFormat);
    updateLeft(): boolean;
    updateRight(): boolean;
    updateRefs(): boolean;
}
export declare class PaletteFormatToRGB extends PixNode {
    words: UintArray;
    rgbimgs: Uint32Array[];
    palette: Uint32Array;
    palfmt: PixelEditorPaletteFormat;
    layout: PixelEditorPaletteLayout;
    constructor(palfmt: any);
    updateLeft(): boolean;
    updateRight(): boolean;
    getAllColors(): number[];
}
export declare abstract class Compositor extends PixNode {
    tilemap: Uint8Array[];
    images: Uint8Array[];
    width: number;
    height: number;
    context: EditorContext;
    tileoptions: SelectableTilemap[];
    tileindex: number;
    constructor(context: EditorContext);
    updateRefs(): boolean;
}
export declare type MetaspriteEntry = {
    x: number;
    y: number;
    tile: number;
    attr: number;
};
export declare class MetaspriteCompositor extends Compositor {
    metadefs: MetaspriteEntry[];
    constructor(context: EditorContext, metadefs: any);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class NESNametableConverter extends Compositor {
    cols: number;
    rows: number;
    baseofs: number;
    constructor(context: EditorContext);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class ImageChooser {
    rgbimgs: Uint32Array[];
    width: number;
    height: number;
    recreate(parentdiv: JQuery, onclick: any): void;
}
export declare class CharmapEditor extends PixNode {
    context: any;
    parentdiv: any;
    fmt: any;
    chooser: any;
    constructor(context: EditorContext, parentdiv: JQuery, fmt: PixelEditorImageFormat);
    updateLeft(): boolean;
    updateRight(): boolean;
    createEditor(aeditor: JQuery, viewer: Viewer, xscale: number, yscale: number): PixEditor;
}
export declare class MapEditor extends PixNode {
    context: any;
    parentdiv: any;
    fmt: any;
    constructor(context: EditorContext, parentdiv: JQuery, fmt: PixelEditorImageFormat);
    updateLeft(): boolean;
    updateRight(): boolean;
}
export declare class Viewer {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imagedata: ImageData;
    rgbdata: Uint32Array;
    peerviewers: Viewer[];
    recreate(): void;
    createWith(pv: Viewer): void;
    newCanvas(): HTMLCanvasElement;
    updateImage(imdata?: Uint32Array): void;
}
declare class PixEditor extends Viewer {
    left: PixNode;
    palette: Uint32Array;
    curpalcol: number;
    currgba: number;
    palbtns: JQuery[];
    offscreen: Map<string, number>;
    getPositionFromEvent(e: any): {
        x: number;
        y: number;
    };
    setPaletteColor(col: number): void;
    makeEditable(leftnode: PixNode, aeditor: JQuery, palette: Uint32Array): void;
    getPixel(x: number, y: number): number;
    setPixel(x: number, y: number, rgba: number): void;
    createPaletteButtons(): JQuery<HTMLDivElement>;
    createToolbarButtons(parent: HTMLElement): void;
    commit(): void;
    remapPixels(mapfn: (x: number, y: number) => number): void;
    rotate(deg: number): void;
    rotate90(): void;
    flipX(): void;
    flipY(): void;
    translate(dx: number, dy: number): void;
}
export {};
