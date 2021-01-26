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
var emu_1 = require("../common/emu");
var galaxian_1 = require("../machine/galaxian");
var baseplatform_1 = require("../common/baseplatform");
var GALAXIAN_PRESETS = [
    { id: 'gfxtest.c', name: 'Graphics Test' },
    { id: 'shoot2.c', name: 'Solarian Game' },
];
var GalaxianPlatform = /** @class */ (function (_super) {
    __extends(GalaxianPlatform, _super);
    function GalaxianPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'Video RAM', start: 0x5000, size: 0x400, type: 'ram' },
                    { name: 'Sprite RAM', start: 0x5800, size: 0x100, type: 'ram' },
                    { name: 'I/O Registers', start: 0x6000, size: 0x2000, type: 'io' },
                ] };
        };
        return _this;
    }
    GalaxianPlatform.prototype.newMachine = function () { return new galaxian_1.GalaxianMachine(); };
    GalaxianPlatform.prototype.getPresets = function () { return GALAXIAN_PRESETS; };
    GalaxianPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    GalaxianPlatform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    GalaxianPlatform.prototype.readVRAMAddress = function (a) { return (a < 0x800) ? this.machine.vram[a] : this.machine.oram[a - 0x800]; };
    return GalaxianPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
var GalaxianScramblePlatform = /** @class */ (function (_super) {
    __extends(GalaxianScramblePlatform, _super);
    function GalaxianScramblePlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GalaxianScramblePlatform.prototype.newMachine = function () { return new galaxian_1.GalaxianScrambleMachine(); };
    return GalaxianScramblePlatform;
}(GalaxianPlatform));
emu_1.PLATFORMS['galaxian'] = GalaxianPlatform;
emu_1.PLATFORMS['galaxian-scramble'] = GalaxianScramblePlatform;
//# sourceMappingURL=galaxian.js.map