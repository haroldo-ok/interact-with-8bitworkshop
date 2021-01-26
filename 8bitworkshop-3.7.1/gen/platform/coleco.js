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
exports.ColecoVision_PRESETS = void 0;
var coleco_1 = require("../machine/coleco");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
exports.ColecoVision_PRESETS = [
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
var ColecoVisionPlatform = /** @class */ (function (_super) {
    __extends(ColecoVisionPlatform, _super);
    function ColecoVisionPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'BIOS', start: 0x0, size: 0x2000, type: 'rom' },
                    { name: 'Cartridge Header', start: 0x8000, size: 0x100, type: 'rom' },
                ] };
        };
        return _this;
    }
    ColecoVisionPlatform.prototype.newMachine = function () { return new coleco_1.ColecoVision(); };
    ColecoVisionPlatform.prototype.getPresets = function () { return exports.ColecoVision_PRESETS; };
    ColecoVisionPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    ColecoVisionPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    ColecoVisionPlatform.prototype.readVRAMAddress = function (a) { return this.machine.readVRAMAddress(a); };
    ColecoVisionPlatform.prototype.showHelp = function (tool, ident) {
        window.open("https://8bitworkshop.com/blog/platforms/coleco/", "_help");
    };
    return ColecoVisionPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
/// MAME support
var ColecoVisionMAMEPlatform = /** @class */ (function (_super) {
    __extends(ColecoVisionMAMEPlatform, _super);
    function ColecoVisionMAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getToolForFilename = baseplatform_1.getToolForFilename_z80;
        return _this;
    }
    ColecoVisionMAMEPlatform.prototype.start = function () {
        this.startModule(this.mainElement, {
            jsfile: 'mame8bitws.js',
            cfgfile: 'coleco.cfg',
            biosfile: 'coleco/313 10031-4005 73108a.u2',
            driver: 'coleco',
            width: 280 * 2,
            height: 216 * 2,
            romfn: '/emulator/cart.rom',
            romsize: 0x8000,
            preInit: function (_self) {
            },
        });
    };
    ColecoVisionMAMEPlatform.prototype.loadROM = function (title, data) {
        this.loadROMFile(data);
        this.loadRegion(":coleco_cart:rom", data);
    };
    ColecoVisionMAMEPlatform.prototype.getPresets = function () { return exports.ColecoVision_PRESETS; };
    ColecoVisionMAMEPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    return ColecoVisionMAMEPlatform;
}(baseplatform_1.BaseMAMEPlatform));
///
emu_1.PLATFORMS['coleco.mame'] = ColecoVisionMAMEPlatform;
emu_1.PLATFORMS['coleco'] = ColecoVisionPlatform;
//# sourceMappingURL=coleco.js.map