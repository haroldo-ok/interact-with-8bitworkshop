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
exports.SMS = exports.SG1000 = void 0;
var vdp_z80_1 = require("./vdp_z80");
var emu_1 = require("../common/emu");
var util_1 = require("../common/util");
var audio_1 = require("../common/audio");
var tms9918a_1 = require("../common/video/tms9918a");
// http://www.smspower.org/Development/Index
// http://www.smspower.org/uploads/Development/sg1000.txt
// http://www.smspower.org/uploads/Development/richard.txt
// http://www.smspower.org/uploads/Development/msvdp-20021112.txt
// http://www.smspower.org/uploads/Development/SN76489-20030421.txt
var SG1000_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.UP, 0, 0x1],
    [emu_1.Keys.DOWN, 0, 0x2],
    [emu_1.Keys.LEFT, 0, 0x4],
    [emu_1.Keys.RIGHT, 0, 0x8],
    [emu_1.Keys.A, 0, 0x10],
    [emu_1.Keys.B, 0, 0x20],
    [emu_1.Keys.P2_UP, 0, 0x40],
    [emu_1.Keys.P2_DOWN, 0, 0x80],
    [emu_1.Keys.P2_LEFT, 1, 0x1],
    [emu_1.Keys.P2_RIGHT, 1, 0x2],
    [emu_1.Keys.P2_A, 1, 0x4],
    [emu_1.Keys.P2_B, 1, 0x8],
    [emu_1.Keys.VK_BACK_SLASH, 1, 0x10],
]);
var SG1000 = /** @class */ (function (_super) {
    __extends(SG1000, _super);
    function SG1000() {
        var _this = _super.call(this) || this;
        _this.numVisibleScanlines = 240;
        _this.defaultROMSize = 0xc000;
        _this.ram = new Uint8Array(0x400);
        _this.read = emu_1.newAddressDecoder([
            [0xc000, 0xffff, 0x3ff, function (a) { return _this.ram[a]; }],
            [0x0000, 0xbfff, 0xffff, function (a) { return _this.rom && _this.rom[a]; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0xc000, 0xffff, 0x3ff, function (a, v) { _this.ram[a] = v; }],
        ]);
        _this.init(_this, _this.newIOBus(), new audio_1.SN76489_Audio(new audio_1.MasterAudio()));
        return _this;
    }
    SG1000.prototype.getKeyboardMap = function () { return SG1000_KEYCODE_MAP; };
    SG1000.prototype.vdpInterrupt = function () {
        this.probe.logInterrupt(0xff);
        return this.cpu.interrupt(0xff); // RST 0x38
    };
    SG1000.prototype.getVCounter = function () { return 0; };
    SG1000.prototype.getHCounter = function () { return 0; };
    SG1000.prototype.setMemoryControl = function (v) { };
    SG1000.prototype.setIOPortControl = function (v) { };
    SG1000.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                addr &= 0xff;
                //console.log('IO read', hex(addr,4));
                switch (addr & 0xc1) {
                    case 0x40: return _this.getVCounter();
                    case 0x41: return _this.getHCounter();
                    case 0x80: return _this.vdp.readData();
                    case 0x81: return _this.vdp.readStatus();
                    case 0xc0: return _this.inputs[0] ^ 0xff;
                    case 0xc1: return _this.inputs[1] ^ 0xff;
                }
                return 0;
            },
            write: function (addr, val) {
                addr &= 0xff;
                val &= 0xff;
                //console.log('IO write', hex(addr,4), hex(val,2));
                switch (addr & 0xc1) {
                    case 0x00: return _this.setMemoryControl(val);
                    case 0x01: return _this.setIOPortControl(val);
                    case 0x40:
                    case 0x41: return _this.psg.setData(val);
                    case 0x80: return _this.vdp.writeData(val);
                    case 0x81: return _this.vdp.writeAddress(val);
                }
            }
        };
    };
    return SG1000;
}(vdp_z80_1.BaseZ80VDPBasedMachine));
exports.SG1000 = SG1000;
///
var SMS = /** @class */ (function (_super) {
    __extends(SMS, _super);
    function SMS() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cartram = new Uint8Array(0);
        _this.pagingRegisters = new Uint8Array(4);
        _this.latchedHCounter = 0;
        _this.ioControlFlags = 0;
        // TODO: hide bottom scanlines
        _this.ram = new Uint8Array(0x2000);
        _this.read = emu_1.newAddressDecoder([
            [0xc000, 0xffff, 0x1fff, function (a) { return _this.ram[a]; }],
            [0x0000, 0x03ff, 0x3ff, function (a) { return _this.rom[a]; }],
            [0x0400, 0x3fff, 0x3fff, function (a) { return _this.getPagedROM(a, 1); }],
            [0x4000, 0x7fff, 0x3fff, function (a) { return _this.getPagedROM(a, 2); }],
            [0x8000, 0xbfff, 0x3fff, function (a) {
                    var reg0 = _this.pagingRegisters[0]; // RAM select?
                    if (reg0 & 0x8) {
                        return _this.cartram[(reg0 & 0x4) ? a + 0x4000 : a];
                    }
                    else {
                        return _this.getPagedROM(a, 3);
                    }
                }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0xc000, 0xfffb, 0x1fff, function (a, v) {
                    _this.ram[a] = v;
                }],
            [0xfffc, 0xffff, 0x3, function (a, v) {
                    _this.pagingRegisters[a] = v;
                    _this.ram[a + 0x1ffc] = v;
                }],
            [0x8000, 0xbfff, 0x3fff, function (a, v) {
                    var reg0 = _this.pagingRegisters[0]; // RAM select?
                    if (reg0 & 0x8) {
                        if (_this.cartram.length == 0)
                            _this.cartram = new Uint8Array(0x8000); // create cartridge RAM lazily
                        _this.cartram[(reg0 & 0x4) ? a + 0x4000 : a] = v;
                    }
                }],
        ]);
        return _this;
    }
    SMS.prototype.newVDP = function (frameData, cru, flicker) {
        return new tms9918a_1.SMSVDP(frameData, cru, flicker);
    };
    SMS.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.pagingRegisters.set([0, 0, 1, 2]);
    };
    SMS.prototype.getVCounter = function () {
        var y = this.scanline;
        return (y <= 0xda) ? (y) : (y - 6);
    };
    SMS.prototype.getHCounter = function () {
        return this.latchedHCounter;
    };
    SMS.prototype.computeHCounter = function () {
        return 0;
        /*
        var t0 = this.startLineTstates;
        var t1 = this.cpu.getTstates();
        return (t1-t0) & 0xff; // TODO
        */
    };
    SMS.prototype.setIOPortControl = function (v) {
        if ((v ^ this.ioControlFlags) & 0xa0) { // either joystick TH pin
            this.latchedHCounter = this.computeHCounter();
            //console.log("H:"+hex(this.latchedHCounter)+" V:"+hex(this.getVCounter()));
        }
        this.ioControlFlags = v;
    };
    SMS.prototype.getPagedROM = function (a, reg) {
        //if (!(a&0xff)) console.log(hex(a), reg, this.pagingRegisters[reg], this.romPageMask);
        return this.rom && this.rom[a + ((this.pagingRegisters[reg] & this.romPageMask) << 14)]; // * $4000
    };
    SMS.prototype.loadROM = function (data) {
        if (data.length <= 0xc000) {
            this.rom = emu_1.padBytes(data, 0xc000);
            this.romPageMask = 3; // only pages 0, 1, 2
        }
        else {
            switch (data.length) {
                case 0x10000:
                case 0x20000:
                case 0x40000:
                case 0x80000:
                    this.rom = data;
                    this.romPageMask = (data.length >> 14) - 1; // div $4000
                    break;
                default:
                    throw Error("Unknown rom size: $" + util_1.hex(data.length));
            }
        }
        //console.log("romPageMask: " + hex(this.romPageMask));
        this.reset();
    };
    SMS.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.pagingRegisters.set(state.pr);
        this.cartram.set(state.cr);
        this.latchedHCounter = state.lhc;
        this.ioControlFlags = state.iocf;
    };
    SMS.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['pr'] = this.pagingRegisters.slice(0);
        state['cr'] = this.cartram.slice(0);
        state['lhc'] = this.latchedHCounter;
        state['iocf'] = this.ioControlFlags;
        return state;
    };
    SMS.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'SMS': // TODO
                return _super.prototype.getDebugInfo.call(this, category, state) +
                    "\nBank Regs: " + this.pagingRegisters + "\n";
            default: return _super.prototype.getDebugInfo.call(this, category, state);
        }
    };
    return SMS;
}(SG1000));
exports.SMS = SMS;
//# sourceMappingURL=sms.js.map