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
exports.Devel6502 = void 0;
var MOS6502_1 = require("../common/cpu/MOS6502");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu"); // TODO
var INPUT_HALTED = 31;
var Devel6502 = /** @class */ (function (_super) {
    __extends(Devel6502, _super);
    function Devel6502() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = 1000000;
        _this.defaultROMSize = 0x8000;
        _this.cpu = new MOS6502_1.MOS6502();
        _this.ram = new Uint8Array(0x4000);
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x3fff, 0x3fff, function (a) { return _this.ram[a]; }],
            [0x4000, 0x4000, 0xffff, function (a) { return _this.serial.byteAvailable() ? 0x80 : 0; }],
            [0x4001, 0x4001, 0xffff, function (a) { return _this.serial.recvByte(); }],
            [0x4002, 0x4002, 0xffff, function (a) { return _this.serial.clearToSend() ? 0x80 : 0; }],
            [0x8000, 0xffff, 0x7fff, function (a) { return _this.rom && _this.rom[a]; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x0000, 0x3fff, 0x3fff, function (a, v) { _this.ram[a] = v; }],
            [0x4003, 0x4003, 0xffff, function (a, v) { return _this.serial.sendByte(v); }],
            [0x400f, 0x400f, 0xffff, function (a, v) { _this.inputs[INPUT_HALTED] = 1; }],
        ]);
        _this.connectCPUMemoryBus(_this);
        return _this;
    }
    Devel6502.prototype.connectSerialIO = function (serial) {
        this.serial = serial;
    };
    Devel6502.prototype.readConst = function (a) {
        return this.read(a);
    };
    Devel6502.prototype.advanceFrame = function (trap) {
        var clock = 0;
        while (clock < this.cpuFrequency / 60) {
            if (trap && trap())
                break;
            clock += this.advanceCPU();
        }
        return clock;
    };
    Devel6502.prototype.advanceCPU = function () {
        if (this.isHalted())
            return 1;
        var n = _super.prototype.advanceCPU.call(this);
        if (this.serial)
            this.serial.advance(n);
        return n;
    };
    Devel6502.prototype.reset = function () {
        this.inputs[INPUT_HALTED] = 0;
        _super.prototype.reset.call(this);
        if (this.serial)
            this.serial.reset();
    };
    Devel6502.prototype.isHalted = function () { return this.inputs[INPUT_HALTED] != 0; };
    return Devel6502;
}(devices_1.BasicHeadlessMachine));
exports.Devel6502 = Devel6502;
//# sourceMappingURL=devel.js.map