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
exports.SMS_PRESETS = exports.SG1000_PRESETS = void 0;
var sms_1 = require("../machine/sms");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
// TODO: merge w/ coleco
exports.SG1000_PRESETS = [
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
exports.SMS_PRESETS = [
    { id: 'mode4test.c', name: 'Mode 4 Test' },
    { id: 'climber.c', name: 'Climber Game' },
];
///
var SG1000Platform = /** @class */ (function (_super) {
    __extends(SG1000Platform, _super);
    function SG1000Platform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SG1000Platform.prototype.newMachine = function () { return new sms_1.SG1000(); };
    SG1000Platform.prototype.getPresets = function () { return exports.SG1000_PRESETS; };
    SG1000Platform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    SG1000Platform.prototype.readAddress = function (a) { return this.machine.read(a); };
    SG1000Platform.prototype.readVRAMAddress = function (a) { return this.machine.readVRAMAddress(a); };
    return SG1000Platform;
}(baseplatform_1.BaseZ80MachinePlatform));
var SMSPlatform = /** @class */ (function (_super) {
    __extends(SMSPlatform, _super);
    function SMSPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SMSPlatform.prototype.newMachine = function () { return new sms_1.SMS(); };
    SMSPlatform.prototype.getPresets = function () { return exports.SMS_PRESETS; };
    SMSPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    SMSPlatform.prototype.readAddress = function (a) { return this.machine.read(a); };
    SMSPlatform.prototype.readVRAMAddress = function (a) { return this.machine.readVRAMAddress(a); };
    return SMSPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
///
emu_1.PLATFORMS['sms-sg1000-libcv'] = SG1000Platform;
emu_1.PLATFORMS['sms-sms-libcv'] = SMSPlatform;
//# sourceMappingURL=sms.js.map