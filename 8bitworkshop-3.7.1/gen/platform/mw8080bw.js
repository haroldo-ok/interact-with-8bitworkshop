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
var mw8080bw_1 = require("../machine/mw8080bw");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
// http://www.computerarcheology.com/Arcade/
var MW8080BW_PRESETS = [
    { id: 'gfxtest.c', name: 'Graphics Test' },
    { id: 'shifter.c', name: 'Sprite w/ Bit Shifter' },
    { id: 'game2.c', name: 'Cosmic Impalas' },
];
var Midway8080BWPlatform = /** @class */ (function (_super) {
    __extends(Midway8080BWPlatform, _super);
    function Midway8080BWPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'Frame Buffer', start: 0x2400, size: 7168, type: 'ram' },
                ] };
        };
        return _this;
    }
    Midway8080BWPlatform.prototype.newMachine = function () { return new mw8080bw_1.Midway8080(); };
    Midway8080BWPlatform.prototype.getPresets = function () { return MW8080BW_PRESETS; };
    Midway8080BWPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    Midway8080BWPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    return Midway8080BWPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
emu_1.PLATFORMS['mw8080bw'] = Midway8080BWPlatform;
//# sourceMappingURL=mw8080bw.js.map