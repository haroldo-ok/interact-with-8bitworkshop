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
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var APPLE2_PRESETS = [
    { id: 'sieve.c', name: 'Sieve' },
    { id: 'keyboardtest.c', name: 'Keyboard Test' },
    { id: 'mandel.c', name: 'Mandelbrot' },
    { id: 'tgidemo.c', name: 'TGI Graphics Demo' },
    { id: 'Eliza.c', name: 'Eliza' },
    { id: 'siegegame.c', name: 'Siege Game' },
    { id: 'cosmic.c', name: 'Cosmic Impalas' },
    { id: 'farmhouse.c', name: "Farmhouse Adventure" },
    { id: 'yum.c', name: "Yum Dice Game" },
    { id: 'lzgtest.c', name: "LZG Decompressor (C)" },
    { id: 'hgrtest.a', name: "HGR Test (ASM)" },
    { id: 'conway.a', name: "Conway's Game of Life (ASM)" },
    { id: 'lz4fh.a', name: "LZ4FH Decompressor (ASM)" },
    { id: 'deltamod.dasm', name: "Delta Modulation (ASM)" },
];
/// MAME support
var Apple2MAMEPlatform = /** @class */ (function (_super) {
    __extends(Apple2MAMEPlatform, _super);
    function Apple2MAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getOpcodeMetadata = baseplatform_1.getOpcodeMetadata_6502;
        _this.getToolForFilename = baseplatform_1.getToolForFilename_6502;
        return _this;
    }
    Apple2MAMEPlatform.prototype.start = function () {
        this.startModule(this.mainElement, {
            jsfile: 'mame8bitws.js',
            biosfile: ['apple2e.zip'],
            //cfgfile:'nes.cfg',
            driver: 'apple2e',
            width: 280 * 2,
            height: 192 * 2,
            //romfn:'/emulator/cart.nes',
            //romsize:romSize,
            //romdata:new lzgmini().decode(lzgRom).slice(0, romSize),
            preInit: function (_self) {
            },
        });
    };
    Apple2MAMEPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    Apple2MAMEPlatform.prototype.getPresets = function () { return APPLE2_PRESETS; };
    Apple2MAMEPlatform.prototype.loadROM = function (title, data) {
        this.loadROMFile(data);
        // TODO
    };
    return Apple2MAMEPlatform;
}(baseplatform_1.BaseMAMEPlatform));
///
var apple2_1 = require("../machine/apple2");
var baseplatform_2 = require("../common/baseplatform");
var NewApple2Platform = /** @class */ (function (_super) {
    __extends(NewApple2Platform, _super);
    function NewApple2Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'Zero Page RAM', start: 0x0, size: 0x100, type: 'ram' },
                    { name: 'Line Input RAM', start: 0x200, size: 0x100, type: 'ram' },
                    { name: 'RAM', start: 0x300, size: 0xc0, type: 'ram' },
                    { name: 'DOS Vectors', start: 0x3c0, size: 0x40, type: 'ram' },
                    { name: 'Text/Lores Page 1', start: 0x400, size: 0x400, type: 'ram' },
                    { name: 'RAM', start: 0x800, size: 0x1800, type: 'ram' },
                    { name: 'Hires Page 1', start: 0x2000, size: 0x2000, type: 'ram' },
                    { name: 'Hires Page 2', start: 0x4000, size: 0x2000, type: 'ram' },
                    { name: 'RAM', start: 0x6000, size: 0x6000, type: 'ram' },
                    { name: 'I/O', start: 0xc000, size: 0x1000, type: 'io' },
                    { name: 'ROM', start: 0xd000, size: 0x3000 - 6, type: 'rom' },
                ] };
        };
        _this.getToolForFilename = function (fn) {
            if (fn.endsWith(".lnk"))
                return "merlin32";
            else
                return baseplatform_1.getToolForFilename_6502(fn);
        };
        return _this;
        /*
        newCodeAnalyzer() {
          return new CodeAnalyzer_apple2(this);
        }
        getOriginPC() {
          return 0x803; // TODO?
        }
        */
    }
    NewApple2Platform.prototype.newMachine = function () { return new apple2_1.AppleII(); };
    NewApple2Platform.prototype.getPresets = function () { return APPLE2_PRESETS; };
    NewApple2Platform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    NewApple2Platform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    NewApple2Platform.prototype.getROMExtension = function (rom) {
        if (rom && rom.length == 35 * 16 * 256)
            return ".dsk"; // DSK image
        return ".bin";
    };
    ;
    return NewApple2Platform;
}(baseplatform_2.Base6502MachinePlatform));
//PLATFORMS['apple2.mame'] = Apple2MAMEPlatform;
emu_1.PLATFORMS['apple2'] = NewApple2Platform;
//# sourceMappingURL=apple2.js.map