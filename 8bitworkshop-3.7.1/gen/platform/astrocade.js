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
var astrocade_1 = require("../machine/astrocade");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
// http://metopal.com/projects/ballybook/doku.php
var ASTROCADE_PRESETS = [
    { id: '01-helloworlds.asm', name: 'Hello World (ASM)' },
    { id: '02-telephone.asm', name: 'Telephone (ASM)' },
    { id: '03-horcbpal.asm', name: 'Paddle Demo (ASM)' },
    { id: 'hello.c', name: 'Hello Graphics' },
    { id: 'lines.c', name: 'Lines' },
    { id: 'sprites.c', name: 'Sprites' },
    { id: 'vsync.c', name: 'Sprites w/ VSYNC' },
    { id: 'fastsprites.c', name: 'Fast Sprites' },
    { id: 'music.c', name: 'Music' },
    { id: 'rotate.c', name: 'Rotate Op' },
    { id: 'rainbow.c', name: 'Rainbow' },
    { id: 'cosmic.c', name: 'Cosmic Impalas Game' },
    { id: 'racing.c', name: 'Pseudo 3-D Racing Game' },
];
var ASTROCADE_BIOS_PRESETS = [
    { id: 'bios.c', name: 'BIOS' },
];
var BallyAstrocadePlatform = /** @class */ (function (_super) {
    __extends(BallyAstrocadePlatform, _super);
    function BallyAstrocadePlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'BIOS', start: 0x0, size: 0x2000, type: 'rom' },
                    //{name:'Cart ROM',start:0x2000,size:0x2000,type:'rom'},
                    //{name:'Magic RAM',start:0x0,size:0x4000,type:'ram'},
                    { name: 'Screen RAM', start: 0x4000, size: 0x1000, type: 'ram' },
                    { name: 'BIOS Variables', start: 0x4fce, size: 0x5000 - 0x4fce, type: 'ram' },
                ] };
        };
        return _this;
    }
    BallyAstrocadePlatform.prototype.newMachine = function () { return new astrocade_1.BallyAstrocade(false); };
    BallyAstrocadePlatform.prototype.getPresets = function () { return ASTROCADE_PRESETS; };
    BallyAstrocadePlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    BallyAstrocadePlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    BallyAstrocadePlatform.prototype.showHelp = function (tool, ident) {
        window.open("https://8bitworkshop.com/blog/platforms/astrocade/", "_help"); // TODO
    };
    return BallyAstrocadePlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
var BallyAstrocadeBIOSPlatform = /** @class */ (function (_super) {
    __extends(BallyAstrocadeBIOSPlatform, _super);
    function BallyAstrocadeBIOSPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BallyAstrocadeBIOSPlatform.prototype.getPresets = function () { return ASTROCADE_BIOS_PRESETS; };
    BallyAstrocadeBIOSPlatform.prototype.loadROM = function (title, rom) { this.machine.loadBIOS(rom); };
    return BallyAstrocadeBIOSPlatform;
}(BallyAstrocadePlatform));
var BallyArcadePlatform = /** @class */ (function (_super) {
    __extends(BallyArcadePlatform, _super);
    function BallyArcadePlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'Magic RAM', start: 0x0, size: 0x4000, type: 'ram' },
                    { name: 'Screen RAM', start: 0x4000, size: 0x4000, type: 'ram' },
                ] };
        };
        return _this;
    }
    BallyArcadePlatform.prototype.newMachine = function () { return new astrocade_1.BallyAstrocade(true); };
    return BallyArcadePlatform;
}(BallyAstrocadePlatform));
emu_1.PLATFORMS['astrocade'] = BallyAstrocadePlatform;
emu_1.PLATFORMS['astrocade-bios'] = BallyAstrocadeBIOSPlatform;
emu_1.PLATFORMS['astrocade-arcade'] = BallyArcadePlatform;
//# sourceMappingURL=astrocade.js.map