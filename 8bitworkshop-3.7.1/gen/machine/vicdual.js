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
exports.VicDual = void 0;
var ZilogZ80_1 = require("../common/cpu/ZilogZ80");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu");
var audio_1 = require("../common/audio");
var CARNIVAL_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.A, 2, -0x20],
    [emu_1.Keys.B, 2, -0x40],
    [emu_1.Keys.LEFT, 1, -0x10],
    [emu_1.Keys.RIGHT, 1, -0x20],
    [emu_1.Keys.UP, 1, -0x40],
    [emu_1.Keys.DOWN, 1, -0x80],
    [emu_1.Keys.START, 2, -0x10],
    [emu_1.Keys.P2_START, 3, -0x20],
    [emu_1.Keys.SELECT, 3, 0x8],
]);
var XTAL = 15468000.0;
var scanlinesPerFrame = 0x106;
var vblankStart = 0xe0;
var vsyncStart = 0xec;
var vsyncEnd = 0xf0;
var cpuFrequency = XTAL / 8;
var hsyncFrequency = XTAL / 3 / scanlinesPerFrame;
var vsyncFrequency = hsyncFrequency / 0x148;
var cpuCyclesPerLine = cpuFrequency / hsyncFrequency;
var timerFrequency = 500; // input 2 bit 0x8
var cyclesPerTimerTick = cpuFrequency / (2 * timerFrequency);
var audioOversample = 2;
var audioSampleRate = 60 * scanlinesPerFrame; // why not hsync?
var VicDual = /** @class */ (function (_super) {
    __extends(VicDual, _super);
    function VicDual() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = XTAL / 8; // MHz
        _this.canvasWidth = 256;
        _this.numTotalScanlines = 262;
        _this.numVisibleScanlines = 224;
        _this.defaultROMSize = 0x4040;
        _this.sampleRate = audioSampleRate * audioOversample;
        _this.cpuCyclesPerLine = cpuCyclesPerLine | 0;
        _this.rotate = -90;
        _this.cpu = new ZilogZ80_1.Z80();
        _this.ram = new Uint8Array(0x1000);
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x7fff, 0x3fff, function (a) { return _this.rom ? _this.rom[a] : null; }],
            [0x8000, 0xffff, 0x0fff, function (a) { return _this.ram[a]; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x8000, 0xffff, 0x0fff, function (a, v) { _this.ram[a] = v; }],
        ]);
        _this.connectCPUMemoryBus(_this);
        _this.connectCPUIOBus(_this.newIOBus());
        _this.inputs.set([0xff, 0xff, 0xff, 0xff ^ 0x8]); // most things active low
        _this.display = new VicDualDisplay();
        _this.handler = emu_1.newKeyboardHandler(_this.inputs, CARNIVAL_KEYCODE_MAP, _this.getKeyboardFunction());
        _this.psg = new audio_1.AY38910_Audio(new audio_1.MasterAudio());
        _this.audioadapter = new audio_1.TssChannelAdapter(_this.psg.psg, audioOversample, _this.sampleRate);
        return _this;
    }
    VicDual.prototype.getKeyboardFunction = function () {
        var _this = this;
        return function (o) {
            // reset when coin inserted
            if (o.index == 3 && o.mask == 0x8) {
                _this.cpu.reset();
                console.log("coin inserted");
                console.log(_this.inputs);
            }
        };
    };
    ;
    VicDual.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                return _this.inputs[addr & 3];
            },
            write: function (addr, val) {
                if (addr & 0x1) {
                    _this.psg.selectRegister(val & 0xf);
                }
                ; // audio 1
                if (addr & 0x2) {
                    _this.psg.setData(val);
                }
                ; // audio 2
                if (addr & 0x8) { }
                ; // TODO: assert coin status
                if (addr & 0x40) {
                    _this.display.palbank = val & 3;
                }
                ; // palette
            }
        };
    };
    VicDual.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.psg.reset();
    };
    VicDual.prototype.startScanline = function () {
        this.inputs[2] &= ~0x8;
        this.inputs[2] |= ((this.frameCycles / cyclesPerTimerTick) & 1) << 3;
        if (this.scanline == vblankStart)
            this.inputs[1] |= 0x8;
        if (this.scanline == vsyncEnd)
            this.inputs[1] &= ~0x8;
        this.audio && this.audioadapter.generate(this.audio);
    };
    VicDual.prototype.drawScanline = function () {
        this.display.drawScanline(this.ram, this.pixels, this.scanline);
    };
    VicDual.prototype.loadROM = function (data) {
        _super.prototype.loadROM.call(this, data);
        if (data.length >= 0x4020 && (data[0x4000] || data[0x401f])) {
            this.display.colorprom = data.slice(0x4000, 0x4020);
        }
    };
    VicDual.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.display.palbank = state.pb;
    };
    VicDual.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['pb'] = this.display.palbank;
        return state;
    };
    return VicDual;
}(devices_1.BasicScanlineMachine));
exports.VicDual = VicDual;
var VicDualDisplay = /** @class */ (function () {
    function VicDualDisplay() {
        this.palbank = 0;
        this.palette = [
            0xff000000,
            0xff0000ff,
            0xff00ff00,
            0xff00ffff,
            0xffff0000,
            0xffff00ff,
            0xffffff00,
            0xffffffff // white
        ];
        // default PROM
        this.colorprom = [
            0xe0, 0x60, 0x20, 0x60, 0xc0, 0x60, 0x40, 0xc0,
            0x20, 0x40, 0x60, 0x80, 0xa0, 0xc0, 0xe0, 0x0e,
            0xe0, 0xe0, 0xe0, 0xe0, 0x60, 0x60, 0x60, 0x60,
            0xe0, 0xe0, 0xe0, 0xe0, 0xe0, 0xe0, 0xe0, 0xe0,
        ];
    }
    // videoram 0xc000-0xc3ff
    // RAM      0xc400-0xc7ff
    // charram  0xc800-0xcfff
    VicDualDisplay.prototype.drawScanline = function (ram, pixels, sl) {
        if (sl >= 224)
            return;
        var pixofs = sl * 256;
        var outi = pixofs; // starting output pixel in frame buffer
        var vramofs = (sl >> 3) << 5; // offset in VRAM
        var yy = sl & 7; // y offset within tile
        for (var xx = 0; xx < 32; xx++) {
            var code = ram[vramofs + xx];
            var data = ram[0x800 + (code << 3) + yy];
            var col = (code >> 5) + (this.palbank << 3);
            var color1 = this.palette[(this.colorprom[col] >> 1) & 7];
            var color2 = this.palette[(this.colorprom[col] >> 5) & 7];
            for (var i = 0; i < 8; i++) {
                var bm = 128 >> i;
                pixels[outi] = (data & bm) ? color2 : color1;
                outi++;
            }
        }
    };
    return VicDualDisplay;
}());
//# sourceMappingURL=vicdual.js.map