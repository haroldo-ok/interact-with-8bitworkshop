"use strict";
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
exports.MachineRunner = void 0;
var baseplatform_1 = require("../common/baseplatform");
global.atob = require('atob');
global.btoa = require('btoa');
var NullAudio = /** @class */ (function () {
    function NullAudio() {
    }
    NullAudio.prototype.feedSample = function (value, count) {
    };
    return NullAudio;
}());
// TODO: merge with platform
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
        }
    };
    SerialTestHarness.prototype.byteAvailable = function () {
        return this.readIndex() > this.inputIndex;
    };
    SerialTestHarness.prototype.recvByte = function () {
        var index = this.readIndex();
        this.inputIndex = index;
        var b = this.inputBytes[index] | 0;
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
    return SerialTestHarness;
}());
///
var MachineRunner = /** @class */ (function () {
    function MachineRunner(machine) {
        this.machine = machine;
    }
    MachineRunner.prototype.setup = function () {
        if (baseplatform_1.hasVideo(this.machine)) {
            var vid = this.machine.getVideoParams();
            this.pixels = new Uint32Array(vid.width * vid.height);
            this.machine.connectVideo(this.pixels);
        }
        if (baseplatform_1.hasAudio(this.machine)) {
            this.machine.connectAudio(new NullAudio());
        }
        if (baseplatform_1.hasSerialIO(this.machine)) {
            this.serial = new SerialTestHarness();
            this.machine.connectSerialIO(this.serial);
        }
        this.machine.reset();
    };
    MachineRunner.prototype.run = function () {
        this.machine.advanceFrame(null);
    };
    return MachineRunner;
}());
exports.MachineRunner = MachineRunner;
function loadMachine(modname, clsname) {
    return __awaiter(this, void 0, void 0, function () {
        var mod, cls, machine;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../machine/' + modname); })];
                case 1:
                    mod = _a.sent();
                    cls = mod[clsname];
                    machine = new cls();
                    return [2 /*return*/, machine];
            }
        });
    });
}
function runMachine() {
    return __awaiter(this, void 0, void 0, function () {
        var machine, runner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadMachine(process.argv[2], process.argv[3])];
                case 1:
                    machine = _a.sent();
                    runner = new MachineRunner(machine);
                    runner.setup();
                    runner.run();
                    console.log(runner.machine.saveState());
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    runMachine();
}
//# sourceMappingURL=runmachine.js.map