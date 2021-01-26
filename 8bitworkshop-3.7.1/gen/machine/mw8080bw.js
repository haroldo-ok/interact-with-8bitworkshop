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
exports.Midway8080 = void 0;
var ZilogZ80_1 = require("../common/cpu/ZilogZ80");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu");
// http://www.computerarcheology.com/Arcade/
var MW8080BW_PRESETS = [
    { id: 'gfxtest.c', name: 'Graphics Test' },
    { id: 'shifter.c', name: 'Sprite w/ Bit Shifter' },
    { id: 'game2.c', name: 'Cosmic Impalas' },
];
var SPACEINV_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.A, 1, 0x10],
    [emu_1.Keys.LEFT, 1, 0x20],
    [emu_1.Keys.RIGHT, 1, 0x40],
    [emu_1.Keys.P2_A, 2, 0x10],
    [emu_1.Keys.P2_LEFT, 2, 0x20],
    [emu_1.Keys.P2_RIGHT, 2, 0x40],
    [emu_1.Keys.SELECT, 1, 0x1],
    [emu_1.Keys.START, 1, 0x4],
    [emu_1.Keys.P2_START, 1, 0x2],
]);
var INITIAL_WATCHDOG = 256;
var PIXEL_ON = 0xffeeeeee;
var PIXEL_OFF = 0xff000000;
var Midway8080 = /** @class */ (function (_super) {
    __extends(Midway8080, _super);
    function Midway8080() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = 1996800; // MHz
        _this.canvasWidth = 256;
        _this.numTotalScanlines = 262;
        _this.numVisibleScanlines = 224;
        _this.cpuCyclesPerLine = Math.floor(1996800 / (262 * 60));
        _this.defaultROMSize = 0x2000;
        _this.rotate = -90;
        _this.sampleRate = 1;
        _this.bitshift_offset = 0;
        _this.bitshift_register = 0;
        _this.cpu = new ZilogZ80_1.Z80();
        _this.ram = new Uint8Array(0x2000);
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x1fff, 0x1fff, function (a) { return _this.rom ? _this.rom[a] : 0; }],
            [0x2000, 0x3fff, 0x1fff, function (a) { return _this.ram[a]; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x2000, 0x23ff, 0x3ff, function (a, v) { _this.ram[a] = v; }],
            [0x2400, 0x3fff, 0x1fff, function (a, v) {
                    _this.ram[a] = v;
                    var ofs = (a - 0x400) << 3;
                    for (var i = 0; i < 8; i++) {
                        _this.pixels[ofs + i] = (v & (1 << i)) ? PIXEL_ON : PIXEL_OFF;
                    }
                    //if (displayPCs) displayPCs[a] = cpu.getPC(); // save program counter
                }],
        ]);
        _this.connectCPUMemoryBus(_this);
        _this.connectCPUIOBus(_this.newIOBus());
        _this.handler = emu_1.newKeyboardHandler(_this.inputs, SPACEINV_KEYCODE_MAP);
        return _this;
    }
    Midway8080.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                addr &= 0x3;
                //console.log('IO read', hex(addr,4));
                switch (addr) {
                    case 0:
                    case 1:
                    case 2:
                        return _this.inputs[addr];
                    case 3:
                        return (_this.bitshift_register >> (8 - _this.bitshift_offset)) & 0xff;
                }
                return 0;
            },
            write: function (addr, val) {
                addr &= 0x7;
                val &= 0xff;
                //console.log('IO write', hex(addr,4), hex(val,2));
                switch (addr) {
                    case 2:
                        _this.bitshift_offset = val & 0x7;
                        break;
                    case 3:
                    case 5:
                        // TODO: sound
                        break;
                    case 4:
                        _this.bitshift_register = (_this.bitshift_register >> 8) | (val << 8);
                        break;
                    case 6:
                        _this.watchdog_counter = INITIAL_WATCHDOG;
                        break;
                }
            }
        };
    };
    Midway8080.prototype.startScanline = function () {
    };
    Midway8080.prototype.drawScanline = function () {
        // at end of scanline
        if (this.scanline == 95)
            this.interrupt(0xcf); // RST $8
        else if (this.scanline == 223)
            this.interrupt(0xd7); // RST $10
    };
    Midway8080.prototype.interrupt = function (data) {
        this.probe.logInterrupt(data);
        this.cpu.interrupt(data);
    };
    Midway8080.prototype.advanceFrame = function (trap) {
        if (this.watchdog_counter-- <= 0) {
            console.log("WATCHDOG FIRED"); // TODO: alert on video
            this.reset();
        }
        return _super.prototype.advanceFrame.call(this, trap);
    };
    Midway8080.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.bitshift_register = state.bsr;
        this.bitshift_offset = state.bso;
        this.watchdog_counter = state.wdc;
    };
    Midway8080.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state.bsr = this.bitshift_register;
        state.bso = this.bitshift_offset;
        state.wdc = this.watchdog_counter;
        return state;
    };
    Midway8080.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.watchdog_counter = INITIAL_WATCHDOG;
    };
    return Midway8080;
}(devices_1.BasicScanlineMachine));
exports.Midway8080 = Midway8080;
//# sourceMappingURL=mw8080bw.js.map