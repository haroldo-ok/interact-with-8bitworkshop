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
var atari7800_1 = require("../machine/atari7800");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var Atari7800_PRESETS = [
    { id: 'sprites.dasm', name: 'Sprites (ASM)' },
    { id: 'wsync.c', name: 'WSYNC' },
    { id: 'sprites.c', name: 'Double Buffering' },
    { id: 'scroll.c', name: 'Scrolling' },
];
var Atari7800Platform = /** @class */ (function (_super) {
    __extends(Atari7800Platform, _super);
    function Atari7800Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'TIA', start: 0x00, size: 0x20, type: 'io' },
                    { name: 'MARIA', start: 0x20, size: 0x20, type: 'io' },
                    { name: 'RAM (6166 Block 0)', start: 0x40, size: 0xc0, type: 'ram' },
                    { name: 'RAM (6166 Block 1)', start: 0x140, size: 0xc0, type: 'ram' },
                    { name: 'PIA', start: 0x280, size: 0x18, type: 'io' },
                    { name: 'RAM', start: 0x1800, size: 0x1000, type: 'ram' },
                    { name: 'Cartridge ROM', start: 0x4000, size: 0xc000, type: 'rom' },
                ] };
        };
        return _this;
    }
    Atari7800Platform.prototype.newMachine = function () { return new atari7800_1.Atari7800(); };
    Atari7800Platform.prototype.getPresets = function () { return Atari7800_PRESETS; };
    Atari7800Platform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    Atari7800Platform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    Atari7800Platform.prototype.getROMExtension = function () { return ".a78"; };
    return Atari7800Platform;
}(baseplatform_1.Base6502MachinePlatform));
///
emu_1.PLATFORMS['atari7800'] = Atari7800Platform;
//# sourceMappingURL=atari7800.js.map