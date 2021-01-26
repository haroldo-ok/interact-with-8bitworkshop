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
var vicdual_1 = require("../machine/vicdual");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var VICDUAL_PRESETS = [
    { id: 'minimal.c', name: 'Minimal Example' },
    { id: 'hello.c', name: 'Hello World' },
    { id: 'gfxtest.c', name: 'Graphics Test' },
    { id: 'soundtest.c', name: 'Sound Test' },
    { id: 'snake1.c', name: 'Siege Game (Prototype)' },
    { id: 'snake2.c', name: 'Siege Game (Full)' },
    { id: 'music.c', name: 'Music Player' },
];
var VicDualPlatform = /** @class */ (function (_super) {
    __extends(VicDualPlatform, _super);
    function VicDualPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO loadBIOS(bios)	{ this.machine.loadBIOS(a); }
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'Cell RAM', start: 0xe000, size: 32 * 32, type: 'ram' },
                    { name: 'Tile RAM', start: 0xe800, size: 256 * 8, type: 'ram' },
                ] };
        };
        return _this;
    }
    VicDualPlatform.prototype.newMachine = function () { return new vicdual_1.VicDual(); };
    VicDualPlatform.prototype.getPresets = function () { return VICDUAL_PRESETS; };
    VicDualPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    VicDualPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    return VicDualPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
emu_1.PLATFORMS['vicdual'] = VicDualPlatform;
//# sourceMappingURL=vicdual.js.map