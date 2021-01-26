import { CodeProject } from "./project";
import { WorkerError, FileData } from "../common/workertypes";
import { ProjectView } from "./views";
declare type WindowCreateFunction = (id: string) => ProjectView;
declare type WindowShowFunction = (id: string, view: ProjectView) => void;
export declare class ProjectWindows {
    containerdiv: HTMLElement;
    project: CodeProject;
    id2window: {
        [id: string]: ProjectView;
    };
    id2createfn: {
        [id: string]: WindowCreateFunction;
    };
    id2showfn: {
        [id: string]: WindowShowFunction;
    };
    id2div: {
        [id: string]: HTMLElement;
    };
    activeid: string;
    activewnd: ProjectView;
    activediv: HTMLElement;
    lasterrors: WorkerError[];
    undofiles: string[];
    constructor(containerdiv: HTMLElement, project: CodeProject);
    isWindow(id: string): boolean;
    setCreateFunc(id: string, createfn: WindowCreateFunction): void;
    setShowFunc(id: string, showfn: WindowShowFunction): void;
    create(id: string): ProjectView;
    createOrShow(id: string, moveCursor?: boolean): ProjectView;
    put(id: string, window: ProjectView): void;
    refresh(moveCursor: boolean): void;
    tick(): void;
    setErrors(errors: WorkerError[]): void;
    refreshErrors(): void;
    getActive(): ProjectView;
    getActiveID(): string;
    getCurrentText(): string;
    resize(): void;
    updateFile(fileid: string, data: FileData): void;
    undoStep(): void;
    updateAllOpenWindows(store: any): void;
    findWindowWithFilePrefix(filename: string): string;
}
export {};
