"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicScanlineMachine = exports.BasicMachine = exports.BasicHeadlessMachine = exports.NullProbe = exports.xorshift32 = void 0;
function xorshift32(x) {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return x;
}
exports.xorshift32 = xorshift32;
var NullProbe = /** @class */ (function () {
    function NullProbe() {
    }
    NullProbe.prototype.logClocks = function () { };
    NullProbe.prototype.logNewScanline = function () { };
    NullProbe.prototype.logNewFrame = function () { };
    NullProbe.prototype.logExecute = function () { };
    NullProbe.prototype.logInterrupt = function () { };
    NullProbe.prototype.logRead = function () { };
    NullProbe.prototype.logWrite = function () { };
    NullProbe.prototype.logIORead = function () { };
    NullProbe.prototype.logIOWrite = function () { };
    NullProbe.prototype.logVRAMRead = function () { };
    NullProbe.prototype.logVRAMWrite = function () { };
    NullProbe.prototype.logIllegal = function () { };
    NullProbe.prototype.logData = function () { };
    NullProbe.prototype.addLogBuffer = function (src) { };
    return NullProbe;
}());
exports.NullProbe = NullProbe;
var BasicHeadlessMachine = /** @class */ (function () {
    function BasicHeadlessMachine() {
        this.inputs = new Uint8Array(32);
        this.nullProbe = new NullProbe();
        this.probe = this.nullProbe;
    }
    BasicHeadlessMachine.prototype.setKeyInput = function (key, code, flags) {
        this.handler && this.handler(key, code, flags);
    };
    BasicHeadlessMachine.prototype.connectProbe = function (probe) {
        this.probe = probe || this.nullProbe;
    };
    BasicHeadlessMachine.prototype.reset = function () {
        this.cpu.reset();
    };
    BasicHeadlessMachine.prototype.loadROM = function (data, title) {
        if (!this.rom)
            this.rom = new Uint8Array(this.defaultROMSize);
        this.rom.set(data);
    };
    BasicHeadlessMachine.prototype.loadState = function (state) {
        this.cpu.loadState(state.c);
        this.ram.set(state.ram);
        this.inputs.set(state.inputs);
    };
    BasicHeadlessMachine.prototype.saveState = function () {
        return {
            c: this.cpu.saveState(),
            ram: this.ram.slice(0),
            inputs: this.inputs.slice(0),
        };
    };
    BasicHeadlessMachine.prototype.loadControlsState = function (state) {
        this.inputs.set(state.inputs);
    };
    BasicHeadlessMachine.prototype.saveControlsState = function () {
        return {
            inputs: this.inputs.slice(0)
        };
    };
    BasicHeadlessMachine.prototype.advanceCPU = function () {
        var c = this.cpu;
        var n = 1;
        if (this.cpu.isStable()) {
            this.probe.logExecute(this.cpu.getPC(), this.cpu.getSP());
        }
        if (c.advanceClock) {
            c.advanceClock();
        }
        else if (c.advanceInsn) {
            n = c.advanceInsn(1);
        }
        this.probe.logClocks(n);
        return n;
    };
    BasicHeadlessMachine.prototype.probeMemoryBus = function (membus) {
        var _this = this;
        return {
            read: function (a) {
                var val = membus.read(a);
                _this.probe.logRead(a, val);
                return val;
            },
            write: function (a, v) {
                _this.probe.logWrite(a, v);
                membus.write(a, v);
            }
        };
    };
    BasicHeadlessMachine.prototype.connectCPUMemoryBus = function (membus) {
        this.cpu.connectMemoryBus(this.probeMemoryBus(membus));
    };
    BasicHeadlessMachine.prototype.probeIOBus = function (iobus) {
        var _this = this;
        return {
            read: function (a) {
                var val = iobus.read(a);
                _this.probe.logIORead(a, val);
                return val;
            },
            write: function (a, v) {
                _this.probe.logIOWrite(a, v);
                iobus.write(a, v);
            }
        };
    };
    BasicHeadlessMachine.prototype.connectCPUIOBus = function (iobus) {
        this.cpu['connectIOBus'](this.probeIOBus(iobus));
    };
    return BasicHeadlessMachine;
}());
exports.BasicHeadlessMachine = BasicHeadlessMachine;
var BasicMachine = /** @class */ (function (_super) {
    __extends(BasicMachine, _super);
    function BasicMachine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.overscan = false;
        _this.rotate = 0;
        return _this;
    }
    BasicMachine.prototype.getAudioParams = function () {
        return { sampleRate: this.sampleRate, stereo: false };
    };
    BasicMachine.prototype.connectAudio = function (audio) {
        this.audio = audio;
    };
    BasicMachine.prototype.getVideoParams = function () {
        return { width: this.canvasWidth, height: this.numVisibleScanlines, overscan: this.overscan, rotate: this.rotate };
    };
    BasicMachine.prototype.connectVideo = function (pixels) {
        this.pixels = pixels;
    };
    return BasicMachine;
}(BasicHeadlessMachine));
exports.BasicMachine = BasicMachine;
var BasicScanlineMachine = /** @class */ (function (_super) {
    __extends(BasicScanlineMachine, _super);
    function BasicScanlineMachine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BasicScanlineMachine.prototype.advanceFrame = function (trap) {
        this.preFrame();
        var endLineClock = 0;
        var steps = 0;
        this.probe.logNewFrame();
        this.frameCycles = 0;
        for (var sl = 0; sl < this.numTotalScanlines; sl++) {
            endLineClock += this.cpuCyclesPerLine; // could be fractional
            this.scanline = sl;
            this.startScanline();
            while (this.frameCycles < endLineClock) {
                if (trap && trap()) {
                    sl = 999;
                    break;
                }
                this.frameCycles += this.advanceCPU();
                steps++;
            }
            this.drawScanline();
            this.probe.logNewScanline();
            this.probe.logClocks(Math.floor(this.frameCycles - endLineClock)); // remainder of prev. line
        }
        this.postFrame();
        return steps; // TODO: return steps, not clock? for recorder
    };
    BasicScanlineMachine.prototype.preFrame = function () { };
    BasicScanlineMachine.prototype.postFrame = function () { };
    BasicScanlineMachine.prototype.getRasterY = function () { return this.scanline; };
    BasicScanlineMachine.prototype.getRasterX = function () { return this.frameCycles % this.cpuCyclesPerLine; };
    return BasicScanlineMachine;
}(BasicMachine));
exports.BasicScanlineMachine = BasicScanlineMachine;
//# sourceMappingURL=devices.js.map