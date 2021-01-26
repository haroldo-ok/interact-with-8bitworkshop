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
exports.MSX1 = void 0;
var vdp_z80_1 = require("./vdp_z80");
var emu_1 = require("../common/emu");
var util_1 = require("../common/util");
var audio_1 = require("../common/audio");
var MSX_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.UP, 0, 0x1],
    [emu_1.Keys.DOWN, 0, 0x2],
    [emu_1.Keys.LEFT, 0, 0x4],
    [emu_1.Keys.RIGHT, 0, 0x8],
    [emu_1.Keys.A, 0, 0x10],
    [emu_1.Keys.B, 0, 0x20],
    [emu_1.Keys.P2_UP, 1, 0x1],
    [emu_1.Keys.P2_DOWN, 1, 0x2],
    [emu_1.Keys.P2_LEFT, 1, 0x4],
    [emu_1.Keys.P2_RIGHT, 1, 0x8],
    [emu_1.Keys.P2_A, 1, 0x10],
    [emu_1.Keys.P2_B, 1, 0x20],
    [emu_1.Keys.ANYKEY, 2, 0x0],
]);
var JOY_INPUT_0 = 0;
var JOY_INPUT_1 = 1;
var KEYBOARD_ROW_0 = 16;
var MSX_KEYMATRIX_INTL_NOSHIFT = [
    emu_1.Keys.VK_7, emu_1.Keys.VK_6, emu_1.Keys.VK_5, emu_1.Keys.VK_4, emu_1.Keys.VK_3, emu_1.Keys.VK_2, emu_1.Keys.VK_1, emu_1.Keys.VK_0,
    emu_1.Keys.VK_SEMICOLON, emu_1.Keys.VK_CLOSE_BRACKET, emu_1.Keys.VK_OPEN_BRACKET, emu_1.Keys.VK_BACK_SLASH, emu_1.Keys.VK_EQUALS, emu_1.Keys.VK_MINUS, emu_1.Keys.VK_9, emu_1.Keys.VK_8,
    emu_1.Keys.VK_B, emu_1.Keys.VK_A, null /*DEAD*/, emu_1.Keys.VK_SLASH, emu_1.Keys.VK_PERIOD, emu_1.Keys.VK_COMMA, emu_1.Keys.VK_ACUTE, emu_1.Keys.VK_QUOTE,
    emu_1.Keys.VK_J, emu_1.Keys.VK_I, emu_1.Keys.VK_H, emu_1.Keys.VK_G, emu_1.Keys.VK_F, emu_1.Keys.VK_E, emu_1.Keys.VK_D, emu_1.Keys.VK_C,
    emu_1.Keys.VK_R, emu_1.Keys.VK_Q, emu_1.Keys.VK_P, emu_1.Keys.VK_O, emu_1.Keys.VK_N, emu_1.Keys.VK_M, emu_1.Keys.VK_L, emu_1.Keys.VK_K,
    emu_1.Keys.VK_Z, emu_1.Keys.VK_Y, emu_1.Keys.VK_X, emu_1.Keys.VK_W, emu_1.Keys.VK_V, emu_1.Keys.VK_U, emu_1.Keys.VK_T, emu_1.Keys.VK_S,
    emu_1.Keys.VK_F3, emu_1.Keys.VK_F2, emu_1.Keys.VK_F1, null, emu_1.Keys.VK_CAPS_LOCK, null, emu_1.Keys.VK_CONTROL, emu_1.Keys.VK_SHIFT,
    emu_1.Keys.VK_ENTER, null, emu_1.Keys.VK_BACK_SPACE, null, emu_1.Keys.VK_TAB, emu_1.Keys.VK_ESCAPE, emu_1.Keys.VK_F5, emu_1.Keys.VK_F4,
    emu_1.Keys.VK_RIGHT, emu_1.Keys.VK_DOWN, emu_1.Keys.VK_UP, emu_1.Keys.VK_LEFT, emu_1.Keys.VK_DELETE, emu_1.Keys.VK_INSERT, emu_1.Keys.VK_HOME, emu_1.Keys.VK_SPACE,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
];
var MSX1 = /** @class */ (function (_super) {
    __extends(MSX1, _super);
    function MSX1() {
        var _this = _super.call(this) || this;
        _this.numVisibleScanlines = 240;
        _this.defaultROMSize = 0x8000;
        _this.ram = new Uint8Array(0x10000);
        _this.slotmask = 0;
        _this.ppi_c = 0;
        _this.read = function (a) {
            var shift = (a >> 14) << 1;
            var slotnum = (_this.slotmask >> shift) & 3;
            var slot = _this.slots[slotnum];
            return slot ? slot.read(a) : 0;
        };
        _this.write = function (a, v) {
            var shift = (a >> 14) << 1;
            var slotnum = (_this.slotmask >> shift) & 3;
            var slot = _this.slots[slotnum];
            if (slot)
                slot.write(a, v);
        };
        _this.init(_this, _this.newIOBus(), new audio_1.AY38910_Audio(new audio_1.MasterAudio()));
        _this.bios = new util_1.lzgmini().decode(util_1.stringToByteArray(atob(MSX1_BIOS_LZG)));
        // skip splash screen
        _this.bios[0xdd5] = 0;
        _this.bios[0xdd6] = 0;
        _this.bios[0xdd7] = 0;
        // slot definitions
        _this.slots = [
            // slot 0 : BIOS
            {
                read: function (a) { return _this.bios[a] | 0; },
                write: function (a, v) { }
            },
            // slot 1: cartridge
            {
                read: function (a) { return _this.rom[a - 0x4000] | 0; },
                write: function (a, v) { }
            },
            // slot 2: cartridge
            {
                read: function (a) { return _this.rom[a - 0x4000] | 0; },
                write: function (a, v) { }
            },
            // slot 3 : RAM
            {
                read: function (a) { return _this.ram[a] | 0; },
                write: function (a, v) { _this.ram[a] = v; }
            },
        ];
        return _this;
    }
    MSX1.prototype.getKeyboardMap = function () { return MSX_KEYCODE_MAP; };
    // http://map.grauw.nl/articles/keymatrix.php
    MSX1.prototype.getKeyboardFunction = function () {
        var _this = this;
        return function (o, key, code, flags) {
            //console.log(o,key,code,flags);
            var keymap = MSX_KEYMATRIX_INTL_NOSHIFT;
            for (var i = 0; i < keymap.length; i++) {
                if (keymap[i] && keymap[i].c == key) {
                    var row = i >> 3;
                    var bit = 7 - (i & 7);
                    //console.log(key, row, bit);
                    if (flags & emu_1.KeyFlags.KeyDown) {
                        _this.inputs[KEYBOARD_ROW_0 + row] |= (1 << bit);
                    }
                    else if (flags & emu_1.KeyFlags.KeyUp) {
                        _this.inputs[KEYBOARD_ROW_0 + row] &= ~(1 << bit);
                    }
                    break;
                }
            }
        };
    };
    MSX1.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                addr &= 0xff;
                //console.log('IO read', hex(addr,4));
                switch (addr) {
                    case 0x98: return _this.vdp.readData();
                    case 0x99: return _this.vdp.readStatus();
                    case 0xa2:
                        if (_this.psg.currentRegister() == 14)
                            return ~_this.inputs[JOY_INPUT_0]; // TODO: joy 1?
                        else
                            return _this.psg.readData();
                    case 0xa8: return _this.slotmask;
                    case 0xa9: return ~_this.inputs[KEYBOARD_ROW_0 + (_this.ppi_c & 15)];
                    case 0xaa: return _this.ppi_c; // TODO?
                    //default: throw new EmuHalt("Read I/O " + hex(addr));
                }
                return 0;
            },
            write: function (addr, val) {
                addr &= 0xff;
                val &= 0xff;
                //console.log('IO write', hex(addr,4), hex(val,2));
                switch (addr) {
                    case 0x98:
                        _this.vdp.writeData(val);
                        break;
                    case 0x99:
                        _this.vdp.writeAddress(val);
                        break;
                    case 0xa8:
                        _this.slotmask = val;
                        break;
                    case 0xaa:
                        _this.ppi_c = val;
                        break;
                    case 0xab: // command register, modifies PPI C
                        var ibit = (val >> 1) & 7;
                        _this.ppi_c = (_this.ppi_c & ~(1 << ibit)) | ((val & 1) << ibit);
                        break;
                    case 0xa0:
                        _this.psg.selectRegister(val);
                        break;
                    case 0xa1:
                        _this.psg.setData(val);
                        break;
                    case 0xfc:
                    case 0xfd:
                    case 0xfe:
                    case 0xff:
                        break; // memory mapper (MSX2)
                    //default: throw new EmuHalt("Write I/O " + hex(addr));
                }
            }
        };
    };
    MSX1.prototype.vdpInterrupt = function () {
        this.probe.logInterrupt(0xff);
        this.cpu.interrupt(0xff); // RST 0x38
    };
    MSX1.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.slotmask = state['slotmask'];
        this.ppi_c = state['ppi_c'];
        this.psg.selectRegister(state['psgRegister']);
    };
    MSX1.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['slotmask'] = this.slotmask;
        state['ppi_c'] = this.ppi_c;
        state['psgRegister'] = this.psg.currentRegister();
        return state;
    };
    MSX1.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.slotmask = 0;
        this.ppi_c = 0;
    };
    /* TODO
    resume() {
      super.resume();
      this.resetInputs();
    }*/
    MSX1.prototype.resetInputs = function () {
        // clear keyboard matrix
        this.inputs.fill(0);
    };
    return MSX1;
}(vdp_z80_1.BaseZ80VDPBasedMachine));
exports.MSX1 = MSX1;
///
/*
    C-BIOS is a BIOS compatible with the MSX BIOS
    C-BIOS was written from scratch by BouKiCHi
    C-BIOS is available for free, including its source code (2-clause BSD license)
    C-BIOS can be shipped with MSX emulators so they are usable out-of-the-box without copyright issues

    http://cbios.sourceforge.net/
*/
var MSX1_BIOS_LZG = "\n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\nweHV5TsMNno7CjZZzYXz0eVRtuHJCNnz/eXx3eXhV6dRMtVRIUcO/N3l8VF3hygHywDLAT0g+SFn\nJOXbqPWhsNnDjPNRK9FRtgjZyfPlb1EqPqvGVQXyeyRXOwNuZ0c+wAcHBfKLJF8vT3qjR32n8tYk\nDw/mA+XFOwUipSSjR3rmwGfbqG/mwLRaBAxiobBPMv//fdOoIcX8euYDhW98zgBneXfB4duoobDT\nqOHJVw8PX+bAb9uoT+Y/tdOoe+YDb3wmAxgCKSnWQDD6fC9nUX5fpLVRPm9506hRPE8GAH0hxfwJ\nd8l6Dw/mwEdRs7BRM1EbOwcaUVlzydOoXhgD06hzetOoUQQIzZjzCPGT4cnd6QBaBQ87MC4yOTsk\n8mNiaW9zLnNmLm5ldA0KQ2hhcmFjdGVyIHNldDogVVMNCkluUQdydXB0IGZyZXF1ZW5jeTogNjBI\neg0KS2V5Ym9hcmQgdHlwZVHmkyQASW5pdCBST00gaW4gc2xvdDogAENhbm5vdCBleGVjdXRlIGEg\nQkFTSUNRXS5RKUVSUk9SOgBNRU1PUlkgTk9UIEZPVU5ELgBDQUxMRURRCk4gRVhJU1RJTkdR8i4A\nU1RBQ0sgUbIuADsCb05vIGNhcnRyaWRnZSBmb3VuZC5RT1RoaXMgdmVyc2lvbiBvZiA7BfxjYW4N\nCm9ubHkgc3RRLjsIM3NRLlBsZWFzZSByZVHUeW91ciBNU1gNCihlbXVsYXRvcikgd2l0aCBhOwgw\nDQppbnNlcnRlZC4AMDEyMzQ1Njc4OS09XFtdOwAnYCwuLwBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2\nd3h5eikhQCMkJV4mKihfK3x7fToifjw+PwBBQkNERUZHSElKS0xNTk9QUQBSU1RVVldYWVoACayr\nuu+99PvsBxfxHgENBgW78/IdAMQRvMfNFBUT3MbdyAsbwtvMGNISwBrPHBkPCgD9/AAA9QAACB/w\nFgIOBAP3rq/2AP4A+sHO1BDW38reyQzTw9fLqdEAxdXQ+ar465/Zv5uY4OHnh+7pAO3at7nlhqan\nAISXjYuMlIGxoZGzteakoqODkwCJloKViIqghditnr6cnQAA4jvCpOjqtrjkjwCoAI5RBQCZmrAA\nkrK0AKUA41FHO4QvkwgbCQAIAA0gDAAAHR4fHCorLzspMywuAIBwgQCCAYT1h1oEAnWTH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+THpMdkwPF5cEbe7IoAwkY+FoDGKu1Mc2fCT4g\n0y560y970y/x4clST01CQVM7H6CTH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5MekxyTBj46kz+T\nP5Ms5fUhSTpaBRvgWgMMYHN0YXRlbWVudHMgYXJlIG5vdCBpbXBsUYtlZCB5ZXQ7P7uTH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mf\nkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TBc2O\nWgpBt5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5MfWh5ixDsfeZMfkx+TH5Mfkx+TH5Mfkx+TH5MeAOX1ISJ9WgQ60XVua25v\nd25AN0QxNwA5fd0hiQHNPxrJ3SGFAcM/Wh9abpMeOw71H347DfVFMTQ735aTH5Mfkx6TC1oNaeX/\nzW8AWgdqSmIAKiL5AQADPgDNVgABAALNRwABA5+TogQAk6FaA3T+B5MBR1oDcC9aA3AqyfNRIyok\nUS4ECesBMAMhvIDNXFHJAQnrKgQACQEAA1FKyfM7Bxvsg1HJEQABGVEWPvFReyL5AYQACeshHIcG\nCsXl1QEYAFEd4QEgUQzhUQUJwRDpO01I/viTYh9/k6E/OwwSHzsIAvj+OwYDfx9aA1VJ/vz48B8/\nUS2TBVFIAFG+kwk7CS8Afz8f+Pw7CwdaBVbh/v4fP387CUH+/DsGUPiTAfCTAR+TAT+TAVFIUdBR\nzTsGKzsGCDsHJMffUQ3wOwi3WgZcfjsDen8//pMB/Pz8fDsGKAAA/PgfP3/+UWnwf1Ef/FFk8FFr\nfz8fH/D++PAff3z8+D8/f5MDOwZMOwYIOwaYUUdRUFEzkwN8PDw8x5MBHx7j45Pi/Pjw8FFhOwb/\nOwUfkwT+fzstdn87B7hRKz9+kwFRHvAfHz9+OwJEOwK0k+J4eHh8UVg/OyRI/vz8+DsDTzsD0loI\nXXOTBTsEcfD4/HyTAlEDf39/PzsKcFGIOwJkOwwv/B+TgfA7Itw8jx9/OwJ0n5MBfH5+f+M+Pz87\nJE7wPlEiOwZEOyI6OyLQ/vjxPPA7Isc7JS1RkHz8+DsiaAA/OyJV8Pj8k8L4UT07TRc7TTU7BwY7\nBFz++D87S3k7SYo7CEB/OwovOwYCOyJQ/viTofA7Tac7AvaTCztz8gkJk2KQkAmTgZNhkxFRGFGX\nOwUnkAGTARmTAZGRkTsHHFEEkQmRGRlRVJMGOwYIOwcZOwUoOwU4kTsGeDsHETsFIFEUUbg7QoCT\nCvGTAVFQCFEfCJCQkJPjk2GBUSyBUS07BhyTgQ8Pk8EPkwFRaJPiH1FBUVZRUTsJSJPiURFRhFEu\nD/FRRlHBUWtRnzsFI/GAkJCAkICAOwJwCAkICAkYGRkYGRgYGVGVOwdEAQE7B1k7B1w7Bho7BnQ7\nJBg7CA6TBFHOOwSsOwJzCAg7Al8ICfHx4ZNB4VE0Hh+T4lFIHx5RBJPlUVCT4VF4k+JRkPHhk+E7\nBWA7BkoPDx47BXA7BEgICAhaA1/Qk+GTA1ETGJMC4ZMBDpMBUWST4x4eUQhRTuHhHpNikwFRhDsG\nAVEnUUZRJx47BTCT4lHSUZ4BAVE5OwsQUU07BnQYGBiBkwIICDtEClELUQZRDTsHkFGak+GTAxiT\npBiBUW47BrRRq1EsUVU7CEA7AliT4pMCOwffUYWAURCEOwUhBDtmAwSTDVHOAICAgYKDhIWGhzsj\nJpMJiImKi4yNjo+QjJMK45GSkwCUjJWWUUSXOwkQ5JiZmoyMm5ydnp+goaKjnaSlpp2TAYzkp6ip\njIyqq4yMrK2ur4yMsLGys7OztIzktbVRLraTYbe4ubqMjLu8vb6+v8CM5MHCw4yMxMXFxsfIycrL\nzM3OxcXFz9CM5NHC0jsLgZMF5NPU1dbX2Nna2zsHC1YwLjI55IDc3d7C3+Dh4pMM5VoGXW2TH5Mf\nkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mf\nkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+T\nH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+TH5Mfkx+THpMc/w==\n";
//# sourceMappingURL=msx.js.map