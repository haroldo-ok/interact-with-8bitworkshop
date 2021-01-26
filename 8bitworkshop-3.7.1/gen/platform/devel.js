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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialTestHarness = void 0;
var emu_1 = require("../common/emu");
var devel_1 = require("../machine/devel");
var baseplatform_1 = require("../common/baseplatform");
var util_1 = require("../common/util");
var teletype_1 = require("../common/teletype");
var ui_1 = require("../ide/ui");
var DEVEL_6502_PRESETS = [
    { id: 'hello.dasm', name: 'Hello World (ASM)' },
];
var SerialInOutViewer = /** @class */ (function () {
    function SerialInOutViewer(div) {
        div.style.overflowY = 'auto';
        var gameport = $('<div id="gameport"/>').appendTo(div);
        $('<p class="transcript-header">Serial Output</p>').appendTo(gameport);
        var windowport = $('<div id="windowport" class="transcript"/>').appendTo(gameport);
        this.div = windowport[0];
    }
    SerialInOutViewer.prototype.start = function () {
        this.tty = new teletype_1.TeleType(this.div, false);
        //this.tty.ncols = 40;
    };
    SerialInOutViewer.prototype.reset = function () {
        this.tty.clear();
    };
    SerialInOutViewer.prototype.saveState = function () {
        return this.tty.saveState();
    };
    SerialInOutViewer.prototype.loadState = function (state) {
        this.tty.loadState(state);
    };
    return SerialInOutViewer;
}());
function byteToASCII(b) {
    if (b == 10)
        return '';
    if (b < 32)
        return String.fromCharCode(b + 0x2400);
    else
        return String.fromCharCode(b);
}
var SerialTestHarness = /** @class */ (function () {
    function SerialTestHarness() {
        this.bufferedRead = true;
        this.cyclesPerByte = 1000000 / (57600 / 8); // 138.88888 cycles
        this.maxOutputBytes = 4096;
    }
    SerialTestHarness.prototype.clearToSend = function () {
        return this.outputBytes.length < this.maxOutputBytes;
    };
    SerialTestHarness.prototype.sendByte = function (b) {
        if (this.clearToSend()) {
            this.outputBytes.push(b);
            this.viewer.tty.addtext(byteToASCII(b), 2 | 32);
            if (b == 10)
                this.viewer.tty.newline();
            if (!this.clearToSend()) {
                this.viewer.tty.newline();
                this.viewer.tty.addtext("⚠️ OUTPUT BUFFER FULL ⚠️", 4);
            }
        }
    };
    SerialTestHarness.prototype.byteAvailable = function () {
        return this.readIndex() > this.inputIndex;
    };
    SerialTestHarness.prototype.recvByte = function () {
        var index = this.readIndex();
        this.inputIndex = index;
        var b = (this.inputBytes && this.inputBytes[index]) | 0;
        //this.bufin += byteToASCII(b);
        this.viewer.tty.addtext(byteToASCII(b), 2 | 16);
        if (b == 10)
            this.viewer.tty.newline();
        return b;
    };
    SerialTestHarness.prototype.readIndex = function () {
        return this.bufferedRead ? (this.inputIndex + 1) : Math.floor(this.clk / this.cyclesPerByte);
    };
    SerialTestHarness.prototype.reset = function () {
        this.inputIndex = -1;
        this.clk = 0;
        this.outputBytes = [];
        this.bufin = '';
    };
    SerialTestHarness.prototype.advance = function (clocks) {
        this.clk += clocks;
    };
    SerialTestHarness.prototype.saveState = function () {
        return {
            clk: this.clk,
            idx: this.inputIndex,
            out: this.outputBytes.slice()
        };
    };
    SerialTestHarness.prototype.loadState = function (state) {
        this.clk = state.clk;
        this.inputIndex = state.idx;
        this.outputBytes = state.out.slice();
    };
    return SerialTestHarness;
}());
exports.SerialTestHarness = SerialTestHarness;
var Devel6502Platform = /** @class */ (function (_super) {
    __extends(Devel6502Platform, _super);
    function Devel6502Platform(mainElement) {
        var _this = _super.call(this, mainElement) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'RAM', start: 0x0000, size: 0x4000, type: 'ram' },
                    { name: 'ROM', start: 0x8000, size: 0x8000, type: 'rom' },
                ] };
        };
        _this.serview = new SerialInOutViewer(mainElement);
        return _this;
    }
    Devel6502Platform.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.start.call(this);
                        return [4 /*yield*/, ui_1.loadScript('./gen/common/teletype.js')];
                    case 1:
                        _a.sent();
                        this.serial = new SerialTestHarness();
                        this.serial.viewer = this.serview;
                        this.serview.start();
                        this.machine.connectSerialIO(this.serial);
                        return [2 /*return*/];
                }
            });
        });
    };
    Devel6502Platform.prototype.reset = function () {
        this.serial.inputBytes = util_1.convertDataToUint8Array(this.internalFiles['serialin.dat']);
        _super.prototype.reset.call(this);
        this.serview.reset();
    };
    Devel6502Platform.prototype.isBlocked = function () {
        return this.machine.isHalted();
    };
    Devel6502Platform.prototype.advance = function (novideo) {
        if (this.isBlocked()) {
            this.internalFiles['serialout.dat'] = util_1.byteArrayToString(this.serial.outputBytes);
            ui_1.haltEmulation();
            return 0;
        }
        return _super.prototype.advance.call(this, novideo);
    };
    Devel6502Platform.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state.serial = this.serial.saveState();
        state.serview = this.serview.saveState();
        return state;
    };
    Devel6502Platform.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.serial.loadState(state.serial);
        this.serview.loadState(state.serview);
        // TODO: reload tty UI
    };
    Devel6502Platform.prototype.newMachine = function () { return new devel_1.Devel6502(); };
    Devel6502Platform.prototype.getPresets = function () { return DEVEL_6502_PRESETS; };
    Devel6502Platform.prototype.getDefaultExtension = function () { return ".dasm"; };
    ;
    Devel6502Platform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    return Devel6502Platform;
}(baseplatform_1.Base6502MachinePlatform));
///
emu_1.PLATFORMS['devel-6502'] = Devel6502Platform;
//# sourceMappingURL=devel.js.map