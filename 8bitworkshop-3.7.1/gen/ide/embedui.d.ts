import { Platform } from "../common/baseplatform";
import { StateRecorderImpl } from "../common/recorder";
export declare var platform_id: string;
export declare var platform: Platform;
export declare var stateRecorder: StateRecorderImpl;
export declare function loadScript(scriptfn: string): Promise<Event>;
export declare function startEmbed(): void;
