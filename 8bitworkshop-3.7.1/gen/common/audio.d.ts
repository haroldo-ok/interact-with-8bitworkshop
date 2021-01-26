export declare class MasterAudio {
    master: any;
    looper: any;
    start(): void;
    stop(): void;
}
export declare class AY38910_Audio {
    master: MasterAudio;
    psg: any;
    curreg: number;
    constructor(master: MasterAudio);
    reset(): void;
    selectRegister(val: number): void;
    setData(val: number): void;
    readData(): any;
    currentRegister(): number;
}
export declare class SN76489_Audio {
    master: MasterAudio;
    psg: any;
    constructor(master: MasterAudio);
    reset(): void;
    setData(val: number): void;
}
export declare function newPOKEYAudio(count: number): MasterAudio;
export declare var POKEYDeviceChannel: () => void;
export declare var WorkerSoundChannel: (worker: any) => void;
export declare var SampleAudio: (clockfreq: any) => void;
export declare class SampledAudio {
    sa: any;
    constructor(sampleRate: number);
    feedSample(value: number, count: number): void;
    start(): void;
    stop(): void;
}
import { SampledAudioSink } from "./devices";
interface TssChannel {
    setBufferLength(len: number): void;
    setSampleRate(rate: number): void;
    getBuffer(): number[];
    generate(numSamples: number): void;
}
export declare class TssChannelAdapter {
    channels: TssChannel[];
    audioGain: number;
    bufferLength: number;
    constructor(chans: any, oversample: number, sampleRate: number);
    generate(sink: SampledAudioSink): void;
}
export {};
