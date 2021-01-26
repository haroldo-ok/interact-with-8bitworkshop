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
exports.ColecoVision = void 0;
var vdp_z80_1 = require("./vdp_z80");
var emu_1 = require("../common/emu");
var util_1 = require("../common/util");
var audio_1 = require("../common/audio");
// http://www.colecovision.eu/ColecoVision/development/tutorial1.shtml
// http://www.colecovision.eu/ColecoVision/development/libcv.shtml
// http://www.kernelcrash.com/blog/recreating-the-colecovision/2016/01/27/
// http://www.atarihq.com/danb/files/CV-Tech.txt
// http://www.atarihq.com/danb/files/CV-Sound.txt
// http://www.colecoboxart.com/faq/FAQ05.htm
// http://www.theadamresource.com/manuals/technical/Jeffcoleco.html
// http://bifi.msxnet.org/msxnet//tech/tms9918a.txt
// http://www.colecovision.dk/tools.htm?refreshed
// http://www.theadamresource.com/manuals/technical/ColecoVision%20Coding%20Guide.pdf
// http://www.unige.ch/medecine/nouspikel/ti99/tms9918a.htm
// http://map.grauw.nl/articles/vdp_tut.php
// http://www.msxcomputermagazine.nl/mccw/91/msx1demos1/en.html
// http://www.segordon.com/colecovision.php
// http://samdal.com/svvideo.htm
// https://github.com/tursilion/convert9918
// http://www.harmlesslion.com/cgi-bin/showprog.cgi?ColecoVision
var COLECOVISION_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.UP, 0, 0x1],
    [emu_1.Keys.DOWN, 0, 0x4],
    [emu_1.Keys.LEFT, 0, 0x8],
    [emu_1.Keys.RIGHT, 0, 0x2],
    [emu_1.Keys.A, 0, 0x40],
    [emu_1.Keys.B, 1, 0x40],
    [emu_1.Keys.P2_UP, 2, 0x1],
    [emu_1.Keys.P2_DOWN, 2, 0x4],
    [emu_1.Keys.P2_LEFT, 2, 0x8],
    [emu_1.Keys.P2_RIGHT, 2, 0x2],
    [emu_1.Keys.P2_A, 2, 0x40],
    [emu_1.Keys.P2_B, 3, 0x40],
]);
var ColecoVision = /** @class */ (function (_super) {
    __extends(ColecoVision, _super);
    function ColecoVision() {
        var _this = _super.call(this) || this;
        _this.defaultROMSize = 0x8000;
        _this.ram = new Uint8Array(0x400);
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x1fff, 0x1fff, function (a) { return _this.bios ? _this.bios[a] : 0; }],
            [0x6000, 0x7fff, 0x03ff, function (a) { return _this.ram[a]; }],
            [0x8000, 0xffff, 0x7fff, function (a) { return _this.rom ? _this.rom[a] : 0; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x6000, 0x7fff, 0x03ff, function (a, v) { _this.ram[a] = v; }],
        ]);
        _this.init(_this, _this.newIOBus(), new audio_1.SN76489_Audio(new audio_1.MasterAudio()));
        _this.bios = new util_1.lzgmini().decode(util_1.stringToByteArray(atob(COLECO_BIOS_LZG)));
        return _this;
    }
    ColecoVision.prototype.getKeyboardMap = function () { return COLECOVISION_KEYCODE_MAP; };
    ColecoVision.prototype.vdpInterrupt = function () {
        this.probe.logInterrupt(0);
        this.cpu.NMI();
    };
    ColecoVision.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                addr &= 0xff;
                //console.log('IO read', hex(addr,4));
                switch (addr) {
                    case 0xfc: return _this.inputs[_this.keypadMode ? 1 : 0] ^ 0xff;
                    case 0xff: return _this.inputs[_this.keypadMode ? 3 : 2] ^ 0xff;
                }
                if (addr >= 0xa0 && addr <= 0xbf) {
                    if (addr & 1)
                        return _this.vdp.readStatus();
                    else
                        return _this.vdp.readData();
                }
                return 0;
            },
            write: function (addr, val) {
                addr &= 0xff;
                val &= 0xff;
                //console.log('IO write', hex(addr,4), hex(val,2));
                switch (addr >> 4) {
                    case 0x8:
                    case 0x9:
                        _this.keypadMode = true;
                        break;
                    case 0xc:
                    case 0xd:
                        _this.keypadMode = false;
                        break;
                    case 0xa:
                    case 0xb:
                        if (addr & 1)
                            return _this.vdp.writeAddress(val);
                        else
                            return _this.vdp.writeData(val);
                    case 0xf:
                        _this.psg.setData(val);
                        break;
                }
            }
        };
    };
    ColecoVision.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.keypadMode = state['kpm'];
    };
    ColecoVision.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['kpm'] = this.keypadMode;
        return state;
    };
    ColecoVision.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.keypadMode = false;
    };
    return ColecoVision;
}(vdp_z80_1.BaseZ80VDPBasedMachine));
exports.ColecoVision = ColecoVision;
var COLECO_BIOS_LZG = "\nTFpHAAAgAAAAB7djQcnHAQEDBgcx/3MYawAAAMMMgAehB+EPB+USB+UVB+UYB+UbB+UeB+QHHAZm\nIYA8igUCBYIAKgCAff5VIAl8/qogBCoKgOnHAwkfgICAAAMFT6CgB4LgByEH4WDAYMBABlggQIAg\nB+HAwOCgYAMGKweBQAYxBphAQEAG+KBABnAGEuAGUAabB+QA4AflBkggIAYyB+FgoKCgwAZdwAY5\nB+HABhAGYAfhIAZQoKDgIAMCcOCAwAaIYIDgoAZY4AMFOAYGBsgGIAZYAwJWBlAAQAMEcAYfQAZ4\nBhoDA3gGBgaQBjgGGwYfoOCAAwLIB+EDA/DAoAchAwNggAaQwAMFmOCAByEH5QZ4AwKABligAwUw\n4EBAQAZYICAgoAMCUAYuBpAGPwawoOAG4AfhAyNQQKCgBqDAoMADJECgoOADBGjgwAZYYIADBPgD\nAlADBEigAwVooAMFCAMEQAYHAwRQBg8GUAMiEAMEoAMEcAMD6gaQICAGyAADJZgDJ4gDI7gAwGAD\nI0CAwAME6AMC+QMCaCBgAwRwAGCgwAaIQOADA2AGJiAH4gZoAwPgA0M6ACAAAwX4gKDAAwPAAyLP\nAwNgAwXwAyNJAwR+AwX4oMADRQBgAyOgAyJxB+PAYANDEOBAQAMDeAMF+AfhA0RQAyJBB+NAAwPI\nBncGkOBgwAZQYECABrADQs8DAkjAQCBAA0QYAAMDUAcLOERsRFREOAA4fFR8RHw4AAAofHx8OBAA\nABA4B+MQODgQfHwDBQgQBhgAADAwB4H8/PzMzAeBAAB4SEh4BkiEtLSEBggcDDRISDAAOEREOBAG\neBgUEDBwYAAMNCw0LGxgAABUOGw4VAAAIDA4PDgwIAAIGDh4OBgIAwJXEAMCaCgHAgAoADxUVDQU\nFBQAOEQwKBhEAwNwAAB4eAMGIAchfBAHAQAHggMEqBh8GAfBABAwfDAH4gAAQEBAfAAAKCh8KCgG\nDxA4OHwGB3x8ODgGLwcHBg8GfgBsbEgGyQZnfCgAIDhAMAhwEABkZAgQIExMACBQUCBUSDQAMDAD\nZEsQIAcCEAAgAwJ5EAYMKDh8OCgGURB8AwdYBuV8AwdlAyIyBAgQAyKmOERMVGREOAAQMAZ4OAYI\nBBggQHwH4jgEBhAIGChIfAgIAHxAQHgGSAYVeEQH4XwGeCAgAyNYBkgHgTwECAMiijAwAySSB+Mg\nBh5AIBAIAwR3B0EGBAZyAwNgAwLoOERcVFxABrhEfEREAHhERAdCBghAQEBEOAZIBwF4AwN4AyJA\nB+RABlhcREQ8AAbvRAA4AwP4OAAEBwEDAohESFBgUEhEAyJ1AyN4RGxUBh9EAERkVEwGqAZGAwRY\nAwVIREQDIlAGSEgGmEADA/gDI9YQEAMCYAaoB8MoBkhUBwEoB+EoECgGKAaOBiB4AwLpQHgAOAMj\nkDgAAAMC9gQAADgIBwI4AAYlA0rv/DADRR0GGgQ8RDwABjQDA+gGCEQDAvgEBg4DAuAGSHhAAyJ4\nIHgDInAAAAYQPAQ4QEBwSAcBAANEehgACAAYCAgISDBAQAMD+QaOBlAAAGhUVEQDAnQG6AMCSAMC\nyAADI1p4QAMDSEQ8BAAAWCQgIHAGWEA4BAYYAwJnKAMCnAYuWANCUQME+AfiVHwGSEhIMAMDSAYY\nOBBgAAB4CDBAeAMCoGAgIBgDAngHYzAICAwICDAAKFADRuhsRER8AwPeQEQ4EDBIAwVYDAMF4Ach\nAyMIKAflMAflOCgH5AMkFxAwBiAGqAYgB+MGIAMFCAME8BAGgRgAIAMFCAYHKER8RAMCQGwH4gwA\nfEB4A2KYAHgUfFA8ADxQUHxQUFwAOAAwSAOCOCgH5WAH5TgDBaBgB+UoAwXwAwL9BugH5AAQOEBA\nOBAAGCQgeCAkXABEKBB8ByEAYFBQaFxISAAIFBA4EBBQIBgDBdADIyIQGAfhAwRgGAMGWFADI6kH\n4khoWEgDBSY8AwUeeAMi8DADQiAAA2ISA6N2/AQEB6FASFA4RAgcB+IsVBwEBmADglsGEiRIJAZf\nAEgkAyKuVACoB2SoBySo/FT8B2IDRDAHA/AHpQfjUFBQ0AdhAyK+8AfjAwYQ0BAGkAcGBhAGyNAQ\n8AYkAAYCB+MGJgfjBngDBVgcBpAQEPwDZgwDBhAHggZIAwYYAwUOBpBQUFBcAwNYXAMjtQMC9wbI\n3AboB6HcAwUYBpAGCAaQBhgGkBADBghQUAMGKAMDWAZCAwW7AwNQAwJoBpgDBXAGAnwG11ADB0AD\nJiADBbgGoPwHBQZJB+LgBwUcBwUDBhQAADRISDQDY49wSEhwQHhIA4OpAAB8A8R6eEggECADwtEA\nPANDTwNjYHAGWShQAwKHOBA4A8LZA0IIeAaZOEREKChsADBAIBA4BqkoA4KfA0KIVFQDIvg4QANi\nFwAGaQNjr3gHIwZYEAAGEEAwCDBABgkHoTAIBlEIFANIAlAgBiAAfAdhAwJ3B0IGfwMDjgPmiAcB\nA8SRHAYnBihQAwK9BwFgEAODTQPjNXgDAmgHHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8H\nHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBx8HHwcfBwM=";
//# sourceMappingURL=coleco.js.map