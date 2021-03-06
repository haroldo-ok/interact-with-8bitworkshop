export declare class TeleType {
    page: HTMLElement;
    fixed: boolean;
    ncols: number;
    scrolldiv: HTMLElement;
    bell: any;
    curline: HTMLElement;
    curstyle: number;
    reverse: boolean;
    col: number;
    row: number;
    lines: HTMLElement[];
    ncharsout: number;
    constructor(page: HTMLElement, fixed: boolean);
    clear(): void;
    ensureline(): void;
    flushline(): void;
    addtext(line: string, style: number): void;
    newline(): void;
    print(val: string): void;
    move_cursor(col: number, row: number): void;
    setrows(size: number): void;
    formfeed(): void;
    scrollToBottom(): void;
    movePrintHead(printing: boolean): void;
    showPrintHead(show: boolean): void;
    resize(columns: number): void;
    saveState(): {
        curstyle: number;
        reverse: boolean;
        col: number;
        row: number;
        ncharsout: number;
        lines: Node[];
    };
    loadState(state: any): void;
}
export declare class TeleTypeWithKeyboard extends TeleType {
    input: HTMLInputElement;
    msecPerLine: number;
    keepinput: boolean;
    keephandler: boolean;
    uppercaseOnly: boolean;
    splitInput: boolean;
    resolveInput: (InputResponse: any) => void;
    focused: boolean;
    scrolling: number;
    waitingfor: string;
    lastInputRequestTime: number;
    constructor(page: HTMLElement, fixed: boolean, input: HTMLInputElement);
    clear(): void;
    focusinput(): void;
    hideinput(): void;
    clearinput(): void;
    cancelinput(): void;
    sendkey(e: KeyboardEvent): void;
    sendinput(s: string): void;
    sendchar(code: number): void;
    ensureline(): void;
    scrollToBottom(): void;
    isBusy(): boolean;
}
