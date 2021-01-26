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
var kim1_1 = require("../machine/kim1");
var baseplatform_1 = require("../common/baseplatform");
var KIM1_PRESETS = [
    { id: 'hello.dasm', name: 'Hello World (ASM)' },
];
var KIM1Platform = /** @class */ (function (_super) {
    __extends(KIM1Platform, _super);
    function KIM1Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'RAM', start: 0x0000, size: 0x1400, type: 'ram' },
                    { name: '6530', start: 0x1700, size: 0x0040, type: 'io' },
                    { name: '6530', start: 0x1740, size: 0x0040, type: 'io' },
                    { name: 'RAM', start: 0x1780, size: 0x0080, type: 'ram' },
                    { name: 'BIOS', start: 0x1800, size: 0x0800, type: 'rom' },
                ] };
        };
        return _this;
    }
    KIM1Platform.prototype.newMachine = function () { return new kim1_1.KIM1(); };
    KIM1Platform.prototype.getPresets = function () { return KIM1_PRESETS; };
    KIM1Platform.prototype.getDefaultExtension = function () { return ".dasm"; };
    ;
    KIM1Platform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    return KIM1Platform;
}(baseplatform_1.Base6502MachinePlatform));
///
emu_1.PLATFORMS['kim1'] = KIM1Platform;
//# sourceMappingURL=kim1.js.map