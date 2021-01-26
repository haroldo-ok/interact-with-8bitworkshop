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
exports.KIM1 = void 0;
var MOS6502_1 = require("../common/cpu/MOS6502");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu"); // TODO
var util_1 = require("../common/util");
var KIM1_KEYMATRIX_NOSHIFT = [
    emu_1.Keys.VK_DELETE, emu_1.Keys.VK_ENTER, emu_1.Keys.VK_RIGHT, emu_1.Keys.VK_F7, emu_1.Keys.VK_F1, emu_1.Keys.VK_F3, emu_1.Keys.VK_F5, emu_1.Keys.VK_DOWN,
    emu_1.Keys.VK_3, emu_1.Keys.VK_W, emu_1.Keys.VK_A, emu_1.Keys.VK_4, emu_1.Keys.VK_Z, emu_1.Keys.VK_S, emu_1.Keys.VK_E, emu_1.Keys.VK_SHIFT,
    emu_1.Keys.VK_5, emu_1.Keys.VK_R, emu_1.Keys.VK_D, emu_1.Keys.VK_6, emu_1.Keys.VK_C, emu_1.Keys.VK_F, emu_1.Keys.VK_T, emu_1.Keys.VK_X,
    emu_1.Keys.VK_7, emu_1.Keys.VK_Y, emu_1.Keys.VK_G, emu_1.Keys.VK_8, emu_1.Keys.VK_B, emu_1.Keys.VK_H, emu_1.Keys.VK_U, emu_1.Keys.VK_V,
    emu_1.Keys.VK_9, emu_1.Keys.VK_I, emu_1.Keys.VK_J, emu_1.Keys.VK_0, emu_1.Keys.VK_M, emu_1.Keys.VK_K, emu_1.Keys.VK_O, emu_1.Keys.VK_N,
    null /*Keys.VK_PLUS*/, emu_1.Keys.VK_P, emu_1.Keys.VK_L, emu_1.Keys.VK_MINUS, emu_1.Keys.VK_PERIOD, null /*Keys.VK_COLON*/, null /*Keys.VK_AT*/, emu_1.Keys.VK_COMMA,
    null /*Keys.VK_POUND*/, null /*TIMES*/, emu_1.Keys.VK_SEMICOLON, emu_1.Keys.VK_HOME, emu_1.Keys.VK_SHIFT /*right*/, emu_1.Keys.VK_EQUALS, emu_1.Keys.VK_TILDE, emu_1.Keys.VK_SLASH,
    emu_1.Keys.VK_1, emu_1.Keys.VK_LEFT, emu_1.Keys.VK_CONTROL, emu_1.Keys.VK_2, emu_1.Keys.VK_SPACE, emu_1.Keys.VK_ALT, emu_1.Keys.VK_Q, null /*STOP*/,
];
var KEYBOARD_ROW_0 = 0;
var RRIOT_6530 = /** @class */ (function () {
    function RRIOT_6530() {
        this.regs = new Uint8Array(16);
        this.ina = 0;
        this.inb = 0;
    }
    RRIOT_6530.prototype.read = function (a) {
        //console.log('read', hex(a), hex(this.regs[a]));
        return this.regs[a];
    };
    RRIOT_6530.prototype.write = function (a, v) {
        this.regs[a] = v;
        //console.log('write', hex(a), hex(v));
    };
    RRIOT_6530.prototype.input_a = function () { return this.ina & ~this.regs[1]; };
    RRIOT_6530.prototype.input_b = function () { return this.inb & ~this.regs[1]; };
    RRIOT_6530.prototype.output_a = function () { return (this.regs[0] ^ 0xff) | this.regs[1]; };
    RRIOT_6530.prototype.output_b = function () { return (this.regs[2] ^ 0xff) | this.regs[3]; };
    return RRIOT_6530;
}());
var KIM1 = /** @class */ (function (_super) {
    __extends(KIM1, _super);
    function KIM1() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = 1000000;
        _this.defaultROMSize = 0x1000;
        _this.cpu = new MOS6502_1.MOS6502();
        _this.ram = new Uint8Array(0x1800);
        _this.rriot1 = new RRIOT_6530();
        _this.rriot2 = new RRIOT_6530();
        _this.digits = [];
        _this.read = emu_1.newAddressDecoder([
            [0x1700, 0x173f, 0x000f, function (a) { return _this.readIO_1(a); }],
            [0x1740, 0x177f, 0x000f, function (a) { return _this.readIO_2(a); }],
            [0x0000, 0x17ff, 0x1fff, function (a) { return _this.ram[a]; }],
            [0x1800, 0x1fff, 0x07ff, function (a) { return _this.bios[a]; }],
        ], { gmask: 0x1fff });
        _this.write = emu_1.newAddressDecoder([
            [0x1700, 0x173f, 0x000f, function (a, v) { return _this.writeIO_1(a, v); }],
            [0x1740, 0x177f, 0x000f, function (a, v) { return _this.writeIO_2(a, v); }],
            [0x0000, 0x17ff, 0x1fff, function (a, v) { _this.ram[a] = v; }],
        ], { gmask: 0x1fff });
        _this.bios = new util_1.lzgmini().decode(util_1.stringToByteArray(atob(KIM1_BIOS_LZG)));
        _this.connectCPUMemoryBus(_this);
        return _this;
    }
    KIM1.prototype.readConst = function (a) {
        return this.read(a);
    };
    KIM1.prototype.readIO_1 = function (a) {
        return this.rriot1.read(a);
    };
    KIM1.prototype.writeIO_1 = function (a, v) {
        this.rriot1.write(a, v);
    };
    KIM1.prototype.readIO_2 = function (a) {
        switch (a & 0xf) {
            case 0x0:
                var cols = 0;
                for (var i = 0; i < 8; i++)
                    if ((this.rriot2.regs[0] & (1 << i)) == 0)
                        cols |= this.inputs[KEYBOARD_ROW_0 + i];
                //if (cols) console.log(this.rriot1.regs[0], cols);
                this.rriot2.ina = cols ^ 0xff;
        }
        return this.rriot2.read(a);
    };
    KIM1.prototype.writeIO_2 = function (a, v) {
        this.rriot2.write(a, v);
        // update LED
        var digit = this.rriot2.output_a();
        var segments = this.rriot2.output_b();
        console.log(digit, segments);
    };
    KIM1.prototype.loadROM = function (data) {
        _super.prototype.loadROM.call(this, data);
        this.ram.set(this.rom, 0x400);
        this.reset();
    };
    KIM1.prototype.loadBIOS = function (data) {
        this.bios = emu_1.padBytes(data, 0x800);
        this.reset();
    };
    KIM1.prototype.setKeyInput = function (key, code, flags) {
        //console.log(key,code,flags);
        var keymap = KIM1_KEYMATRIX_NOSHIFT;
        for (var i = 0; i < keymap.length; i++) {
            if (keymap[i] && keymap[i].c == key) {
                var row = i >> 3;
                var col = i & 7;
                // is column selected?
                if (flags & emu_1.KeyFlags.KeyDown) {
                    this.inputs[KEYBOARD_ROW_0 + row] |= (1 << col);
                }
                else if (flags & emu_1.KeyFlags.KeyUp) {
                    this.inputs[KEYBOARD_ROW_0 + row] &= ~(1 << col);
                }
                console.log(key, row, col, util_1.hex(this.inputs[KEYBOARD_ROW_0 + row]));
                break;
            }
        }
    };
    KIM1.prototype.advanceFrame = function (trap) {
        var clock = 0;
        while (clock < this.cpuFrequency / 60) {
            if (trap && trap())
                break;
            clock += this.advanceCPU();
        }
        return clock;
    };
    return KIM1;
}(devices_1.BasicHeadlessMachine));
exports.KIM1 = KIM1;
// https://github.com/jefftranter/6502/blob/master/asm/KIM-1/ROMs/kim.s
var KIM1_BIOS_LZG = "TFpHAAAIAAAABY3ivWkoAQsOJSiprY3sFyAyGaknjUIXqb+NQxeiZKkWIHoZytD4qSoo4a35FyBhGa31FyBeGa32KKPtF833F63uF+34F5AkqS8lXeclnegooqICqQQOBTgAhfqF+0xPHCDsJXAg6hlMMxgPGamNDgVrTI3vF61xGI3wF61yGI3xF6kHDgJ8/43pFyBBGk7pFw3pFyUErekXyRbQ7aIKICQaJQHfytD2JUIq8AYlBtHw8yDzGc35F/ANrfkXyQAlDf/wF9CcJQ0gTBmN7RcOBQHuF0z4GCXEKKSiAiV9L/AUIAAa0CPK0PElDEzsFw4CnCWhzecX0Awo4ugX0ASpAPACqf8OBcWt9ReN7Ret9heN7hepYI3vF6kAjecXjegXYKgYbSUB5xet6BdpACUJmGAgTBmoSigBIG8ZmChiYCkPyQoYMAJpB2kwjukXjOoXoAggnhlKsAYooUyRGSDEKEKI0Ouu6Res6hdgoglILEcXEPupfo1EF6mnjUIXDgkHDiKqytDfaGCiBg4FHsMODB4lhw4HHu7tF9AD7u4XYCAkGiAAGiikYMkwMB7JRxAayUAwAxhpCSooAaQEKi7pF4jQ+a3pF6AAYMhgjusXoggOIovqFw3qF43qF8rQ8a3qFypKrusXYCxCFxD7rUYXoP+MKIEUiND9JQow+zjtDgYLByULSf8pgGAOSFsOBJeaDgymJYclW0x1Gv8oHygfKB4oGWsaKCKF82iF8WiF74X6aIXwhfuE9Ib1uobyIIgeTE8cbPoXbP4Xov+aJYmp/43zF6kBLEAX0Bkw+an8GGkBkAPu8xesQBcQ843yDkIbah4gjB4l2x4gLx6iCiAxHkyvHakAhfiF+SBaHskB8AYgrB9M2x0gGR/Q0yWi8MwlBPD0KILvIGofyRUQu8kU8ETJEPAsyREoYRLwL8kT8DEKKAGF/KIEpP/QCrH6BvwqkfpMwxwKJvom+8rQ6vAIqQHQAqkAhf8OgmZjHyihTMgdpe+F+qXwDoR6Wh7JO9D5JRr3hfYgnR+qIJEfKMGF+yjl+ijhivAPJQORJUMlO8rQ8uglB8X20BcowvfQE4rQuaIMDkOaDgLPTxwlD6IR0O4OBNYoofaF9yAvHqk7IKAepfrN9xel+w6iGRipACA7HiDMHyAeHqX2JQOl9yiBTGQcqRiqJVGRJVGgALH6DgUFDgJy8A4IIeb40ALm+UxIHSV6Lx4lJCCeDgcnng4CQCUqTKwdpvKapftIpfpIpfFIpvWk9KXzQMkg8MrJf/AbyQ3w28kK8BzJLvAmyUfw1clR8ArJTPAJTGocDiIgQh1M5xw4pfrpAYX6sALG+0ysHaAApfiR+kzCHaX7DgSOpQ4FlmCiB73VHyCgHsoQ92CF/A6D00wepfwogw6K1UygHob9oggORAQiMPkg1B4g6x6tQBcpgEb+Bf6F/iUJytDvJQym/aX+KkpgogGG/6IAjkEXoj+OQxeiB45CF9h4YKkghf6G/SUkrUIXKf4OInLUHqIIJYVG/mkAJcnK0O4lCgkBJcam/WCt8xeN9Bet8hc46QGwA870F6z0FxDzDggPSk70F5DjCYCw4KADogGp/45CF+joLUAXiND1oAeMQhcJgEn/YA4iXIX5qX+NQReiCaADufgADgPmSB8lAikPKOGI0OslMakAJRlM/h6E/Ki55x+gAIxAFyUOjUAXoH+I0P3o6KT8YOb60ALm+2CiIaABIAIf0AfgJ9D1qRVgoP8KsAPIEPqKKQ9KqpgQAxhpB8rQ+mAYZfeF96X2aQCF9mAgWh4grB8opKX4DqKkG8lHEBcOqaSgBCom+Cb5iA7iZWCl+IX6pfmF+2AAKAMKDU1JSyATUlJFIBO/htvP5u39h//v9/y53vnx////HBwiHB8c";
//# sourceMappingURL=kim1.js.map