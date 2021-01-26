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
var msx_1 = require("../machine/msx");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
// https://github.com/Konamiman/MSX2-Technical-Handbook
// https://www.msx.org/wiki/MSX_Cartridge_slot
// http://map.grauw.nl/resources/msx_io_ports.php
// https://openmsx.org/manual/setup.html
// https://www.msx.org/wiki/Slots
// https://www.msx.org/wiki/SDCC
// https://github.com/gseidler/The-MSX-Red-Book/blob/master/the_msx_red_book.md
var MSX_BIOS_PRESETS = [
    { id: 'helloworld.asm', name: 'Hello World (ASM)' },
    { id: 'redbook_kbd.asm', name: 'Redbook Keyboard Scanner (ASM)' },
    { id: 'siegegame.c', name: 'Siege Game' },
    { id: 'eliza.c', name: 'Eliza' },
];
// TODO: share with coleco, sms
var LIBCV_PRESETS = [
    { id: 'text.c', name: 'Text Mode' },
    { id: 'hello.c', name: 'Scrolling Text' },
    { id: 'text32.c', name: '32-Column Color Text' },
    { id: 'stars.c', name: 'Scrolling Starfield' },
    { id: 'cursorsmooth.c', name: 'Moving Cursor' },
    { id: 'simplemusic.c', name: 'Simple Music' },
    { id: 'musicplayer.c', name: 'Multivoice Music' },
    { id: 'mode2bitmap.c', name: 'Mode 2 Bitmap' },
    { id: 'mode2compressed.c', name: 'Mode 2 Bitmap (LZG)' },
    { id: 'lines.c', name: 'Mode 2 Lines' },
    { id: 'multicolor.c', name: 'Multicolor Mode' },
    { id: 'siegegame.c', name: 'Siege Game' },
    { id: 'shoot.c', name: 'Solarian Game' },
    { id: 'climber.c', name: 'Climber Game' },
];
var MSXPlatform = /** @class */ (function (_super) {
    __extends(MSXPlatform, _super);
    function MSXPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'BIOS', start: 0x0, size: 0x4000, type: 'rom' },
                    //{name:'Cartridge',start:0x4000,size:0x4000,type:'rom'},
                    { name: 'RAM', start: 0xc000, size: 0x3200, type: 'ram' },
                    { name: 'Stack', start: 0xf000, size: 0x300, type: 'ram' },
                    { name: 'BIOS Work RAM', start: 0xf300, size: 0xd00 },
                ] };
        };
        return _this;
    }
    MSXPlatform.prototype.newMachine = function () { return new msx_1.MSX1(); };
    MSXPlatform.prototype.getPresets = function () { return MSX_BIOS_PRESETS; };
    MSXPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    MSXPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    MSXPlatform.prototype.readVRAMAddress = function (a) { return this.machine.readVRAMAddress(a); };
    return MSXPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
var MSXLibCVPlatform = /** @class */ (function (_super) {
    __extends(MSXLibCVPlatform, _super);
    function MSXLibCVPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MSXLibCVPlatform.prototype.getPresets = function () { return LIBCV_PRESETS; };
    return MSXLibCVPlatform;
}(MSXPlatform));
emu_1.PLATFORMS['msx'] = MSXPlatform;
emu_1.PLATFORMS['msx-libcv'] = MSXLibCVPlatform;
//# sourceMappingURL=msx.js.map