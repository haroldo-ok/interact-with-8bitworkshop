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
exports.WilliamsSoundPlatform = void 0;
var ZilogZ80_1 = require("../common/cpu/ZilogZ80");
var devices_1 = require("../common/devices");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var WILLIAMS_SOUND_PRESETS = [
    { id: 'swave.c', name: 'Wavetable Synth' },
];
/****************************************************************************

    Midway/Williams Audio Boards
    ----------------------------

    6809 MEMORY MAP

    Function                                  Address     R/W  Data
    ---------------------------------------------------------------
    Program RAM                               0000-07FF   R/W  D0-D7

    Music (YM-2151)                           2000-2001   R/W  D0-D7

    6821 PIA                                  4000-4003   R/W  D0-D7

    HC55516 clock low, digit latch            6000        W    D0
    HC55516 clock high                        6800        W    xx

    Bank select                               7800        W    D0-D2

    Banked Program ROM                        8000-FFFF   R    D0-D7

****************************************************************************/
var WilliamsSound = /** @class */ (function (_super) {
    __extends(WilliamsSound, _super);
    function WilliamsSound() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = 18432000 / 6; // 3.072 MHz
        _this.cpuCyclesPerFrame = _this.cpuFrequency / 60;
        _this.cpuAudioFactor = 32;
        _this.canvasWidth = 256;
        _this.numVisibleScanlines = 256;
        _this.defaultROMSize = 0x4000;
        _this.sampleRate = _this.cpuFrequency;
        _this.overscan = true;
        _this.ram = new Uint8Array(0x400);
        _this.command = 0;
        _this.dac = 0;
        _this.dac_float = 0;
        _this.xpos = 0;
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x3fff, 0x3fff, function (a) { return _this.rom && _this.rom[a]; }],
            [0x4000, 0x7fff, 0x3ff, function (a) { return _this.ram[a]; }]
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x4000, 0x7fff, 0x3ff, function (a, v) { _this.ram[a] = v; }],
        ]);
        _this.cpu = new ZilogZ80_1.Z80();
        _this.connectCPUMemoryBus(_this);
        _this.connectCPUIOBus({
            read: function (addr) {
                return _this.command & 0xff;
            },
            write: function (addr, val) {
                var dac = _this.dac = val & 0xff;
                _this.dac_float = ((dac & 0x80) ? -256 + dac : dac) / 128.0;
            }
        });
        return _this;
    }
    WilliamsSound.prototype.advanceFrame = function (trap) {
        this.pixels && this.pixels.fill(0); // clear waveform
        var maxCycles = this.cpuCyclesPerFrame;
        var n = 0;
        while (n < maxCycles) {
            if (trap && trap()) {
                break;
            }
            n += this.advanceCPU();
        }
        return n;
    };
    WilliamsSound.prototype.advanceCPU = function () {
        var n = _super.prototype.advanceCPU.call(this);
        this.audio && this.audio.feedSample(this.dac_float, n);
        // draw waveform on screen
        if (this.pixels && !this.cpu.isHalted()) {
            this.pixels[((this.xpos >> 8) & 0xff) + ((255 - this.dac) << 8)] = 0xff33ff33;
            this.xpos = (this.xpos + n) & 0xffffff;
        }
        return n;
    };
    WilliamsSound.prototype.setKeyInput = function (key, code, flags) {
        var intr = (key - 49);
        if (intr >= 0 && (flags & 1)) {
            this.command = intr & 0xff;
            this.cpu.reset();
        }
    };
    return WilliamsSound;
}(devices_1.BasicMachine));
var WilliamsSoundPlatform = /** @class */ (function (_super) {
    __extends(WilliamsSoundPlatform, _super);
    function WilliamsSoundPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WilliamsSoundPlatform.prototype.newMachine = function () { return new WilliamsSound(); };
    WilliamsSoundPlatform.prototype.getPresets = function () { return WILLIAMS_SOUND_PRESETS; };
    WilliamsSoundPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    WilliamsSoundPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    return WilliamsSoundPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
exports.WilliamsSoundPlatform = WilliamsSoundPlatform;
emu_1.PLATFORMS['sound_williams-z80'] = WilliamsSoundPlatform;
//# sourceMappingURL=sound_williams.js.map