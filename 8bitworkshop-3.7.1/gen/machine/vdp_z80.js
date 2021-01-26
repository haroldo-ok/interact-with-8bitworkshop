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
exports.BaseZ80VDPBasedMachine = void 0;
var ZilogZ80_1 = require("../common/cpu/ZilogZ80");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu");
var audio_1 = require("../common/audio");
var tms9918a_1 = require("../common/video/tms9918a");
var audioOversample = 2;
var BaseZ80VDPBasedMachine = /** @class */ (function (_super) {
    __extends(BaseZ80VDPBasedMachine, _super);
    function BaseZ80VDPBasedMachine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cpuFrequency = 3579545; // MHz
        _this.canvasWidth = 304;
        _this.numTotalScanlines = 262;
        _this.numVisibleScanlines = 240;
        _this.cpuCyclesPerLine = _this.cpuFrequency / (262 * 60);
        _this.sampleRate = 262 * 60 * audioOversample;
        _this.overscan = true;
        _this.cpu = new ZilogZ80_1.Z80();
        return _this;
    }
    BaseZ80VDPBasedMachine.prototype.getKeyboardFunction = function () { return null; };
    BaseZ80VDPBasedMachine.prototype.init = function (membus, iobus, psg) {
        this.connectCPUMemoryBus(membus);
        this.connectCPUIOBus(iobus);
        this.handler = emu_1.newKeyboardHandler(this.inputs, this.getKeyboardMap(), this.getKeyboardFunction());
        this.psg = psg;
        this.audioadapter = psg && new audio_1.TssChannelAdapter(psg.psg, audioOversample, this.sampleRate);
    };
    BaseZ80VDPBasedMachine.prototype.connectVideo = function (pixels) {
        var _this = this;
        _super.prototype.connectVideo.call(this, pixels);
        var cru = {
            setVDPInterrupt: function (b) {
                if (b) {
                    _this.vdpInterrupt();
                }
                else {
                    // TODO: reset interrupt?
                }
            }
        };
        this.vdp = this.newVDP(this.pixels, cru, true);
    };
    BaseZ80VDPBasedMachine.prototype.connectProbe = function (probe) {
        _super.prototype.connectProbe.call(this, probe);
        this.vdp.probe = probe || this.nullProbe;
    };
    BaseZ80VDPBasedMachine.prototype.newVDP = function (frameData, cru, flicker) {
        return new tms9918a_1.TMS9918A(frameData, cru, flicker);
    };
    BaseZ80VDPBasedMachine.prototype.startScanline = function () {
        this.audio && this.audioadapter && this.audioadapter.generate(this.audio);
    };
    BaseZ80VDPBasedMachine.prototype.drawScanline = function () {
        this.vdp.drawScanline(this.scanline);
    };
    BaseZ80VDPBasedMachine.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.vdp.restoreState(state['vdp']);
    };
    BaseZ80VDPBasedMachine.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['vdp'] = this.vdp.getState();
        return state;
    };
    BaseZ80VDPBasedMachine.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.vdp.reset();
        this.psg.reset();
    };
    BaseZ80VDPBasedMachine.prototype.getDebugCategories = function () {
        return ['CPU', 'Stack', 'VDP'];
    };
    BaseZ80VDPBasedMachine.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'VDP': return this.vdpStateToLongString(state.vdp);
        }
    };
    BaseZ80VDPBasedMachine.prototype.vdpStateToLongString = function (ppu) {
        return this.vdp.getRegsString();
    };
    BaseZ80VDPBasedMachine.prototype.readVRAMAddress = function (a) {
        return this.vdp.ram[a & 0x3fff];
    };
    return BaseZ80VDPBasedMachine;
}(devices_1.BasicScanlineMachine));
exports.BaseZ80VDPBasedMachine = BaseZ80VDPBasedMachine;
//# sourceMappingURL=vdp_z80.js.map