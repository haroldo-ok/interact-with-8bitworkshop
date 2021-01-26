import { FileData, Dependency, CodeListing, CodeListingMap, Segment, WorkerResult } from "../common/workertypes";
import { Platform } from "../common/baseplatform";
declare type BuildResultCallback = (result: WorkerResult) => void;
declare type BuildStatusCallback = (busy: boolean) => void;
declare type IterateFilesCallback = (path: string, data: FileData) => void;
declare type GetRemoteCallback = (path: string, callback: (data: FileData) => void, datatype: 'text' | 'arraybuffer') => any;
export declare class CodeProject {
    filedata: {
        [path: string]: FileData;
    };
    listings: CodeListingMap;
    segments: Segment[];
    mainPath: string;
    pendingWorkerMessages: number;
    tools_preloaded: {};
    worker: Worker;
    platform_id: string;
    platform: Platform;
    store: any;
    isCompiling: boolean;
    filename2path: {};
    persistent: boolean;
    callbackBuildResult: BuildResultCallback;
    callbackBuildStatus: BuildStatusCallback;
    callbackGetRemote: GetRemoteCallback;
    callbackStoreFile: IterateFilesCallback;
    constructor(worker: any, platform_id: string, platform: any, store: any);
    receiveWorkerMessage(data: WorkerResult): void;
    preloadWorker(path: string): void;
    pushAllFiles(files: string[], fn: string): void;
    parseIncludeDependencies(text: string): string[];
    parseLinkDependencies(text: string): string[];
    loadFileDependencies(text: string): Promise<Dependency[]>;
    okToSend(): boolean;
    updateFileInStore(path: string, text: FileData): void;
    buildWorkerMessage(depends: Dependency[]): {
        updates: any[];
        buildsteps: any[];
    };
    loadFiles(paths: string[]): Promise<Dependency[]>;
    getFile(path: string): FileData;
    iterateFiles(callback: IterateFilesCallback): void;
    sendBuild(): Promise<void>;
    updateFile(path: string, text: FileData): void;
    setMainFile(path: string): void;
    processBuildResult(data: WorkerResult): void;
    getListings(): CodeListingMap;
    getListingForFile(path: any): CodeListing;
    stripLocalPath(path: string): string;
}
export {};