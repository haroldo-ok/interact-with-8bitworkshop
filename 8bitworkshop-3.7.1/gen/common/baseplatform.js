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
exports.BaseWASMMachine = exports.BaseZ80MachinePlatform = exports.Base6502MachinePlatform = exports.BaseMachinePlatform = exports.hasSerialIO = exports.hasBIOS = exports.hasProbe = exports.isRaster = exports.hasPaddleInput = exports.hasKeyInput = exports.hasAudio = exports.hasVideo = exports.lookupSymbol = exports.dumpStackToString = exports.BaseMAMEPlatform = exports.Base6809Platform = exports.getToolForFilename_6809 = exports.cpuStateToLongString_6809 = exports.getToolForFilename_z80 = exports.BaseZ80Platform = exports.cpuStateToLongString_Z80 = exports.getOpcodeMetadata_6502 = exports.cpuStateToLongString_6502 = exports.Base6502Platform = exports.getToolForFilename_6502 = exports.inspectSymbol = exports.BaseDebugPlatform = exports.BasePlatform = exports.BreakpointList = exports.isDebuggable = exports.DebugSymbols = void 0;
var emu_1 = require("./emu");
var util_1 = require("./util");
var disasm6502_1 = require("./cpu/disasm6502");
var disasmz80_1 = require("./cpu/disasmz80");
var ZilogZ80_1 = require("./cpu/ZilogZ80");
;
;
var DebugSymbols = /** @class */ (function () {
    function DebugSymbols(symbolmap, debuginfo) {
        this.symbolmap = symbolmap;
        this.debuginfo = debuginfo;
        this.addr2symbol = util_1.invertMap(symbolmap);
        //// TODO: shouldn't be necc.
        if (!this.addr2symbol[0x0])
            this.addr2symbol[0x0] = '$00'; // needed for ...
        this.addr2symbol[0x10000] = '__END__'; // ... dump memory to work
    }
    return DebugSymbols;
}());
exports.DebugSymbols = DebugSymbols;
function isDebuggable(arg) {
    return typeof arg.getDebugCategories === 'function';
}
exports.isDebuggable = isDebuggable;
// for composite breakpoints w/ single debug function
var BreakpointList = /** @class */ (function () {
    function BreakpointList() {
        this.id2bp = {};
    }
    BreakpointList.prototype.getDebugCondition = function () {
        var _this = this;
        if (Object.keys(this.id2bp).length == 0) {
            return null; // no breakpoints
        }
        else {
            // evaluate all breakpoints
            return function () {
                var result = false;
                for (var id in _this.id2bp)
                    if (_this.id2bp[id].cond())
                        result = true;
                return result;
            };
        }
    };
    return BreakpointList;
}());
exports.BreakpointList = BreakpointList;
;
/////
var BasePlatform = /** @class */ (function () {
    function BasePlatform() {
        this.recorder = null;
        this.internalFiles = {};
    }
    BasePlatform.prototype.setRecorder = function (recorder) {
        this.recorder = recorder;
    };
    BasePlatform.prototype.updateRecorder = function () {
        // are we recording and do we need to save a frame?
        if (this.recorder && this.isRunning() && this.recorder.frameRequested()) {
            this.recorder.recordFrame(this.saveState());
        }
    };
    BasePlatform.prototype.inspect = function (sym) {
        return inspectSymbol(this, sym);
    };
    BasePlatform.prototype.getDebugTree = function () {
        return this.saveState();
    };
    BasePlatform.prototype.readFile = function (path) {
        return this.internalFiles[path];
    };
    BasePlatform.prototype.writeFile = function (path, data) {
        this.internalFiles[path] = data;
        return true;
    };
    return BasePlatform;
}());
exports.BasePlatform = BasePlatform;
var BaseDebugPlatform = /** @class */ (function (_super) {
    __extends(BaseDebugPlatform, _super);
    function BaseDebugPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.debugSavedState = null;
        _this.debugBreakState = null;
        _this.debugTargetClock = 0;
        _this.debugClock = 0;
        _this.breakpoints = new BreakpointList();
        _this.frameCount = 0;
        return _this;
    }
    BaseDebugPlatform.prototype.setBreakpoint = function (id, cond) {
        if (cond) {
            this.breakpoints.id2bp[id] = { cond: cond };
            this.restartDebugging();
        }
        else {
            this.clearBreakpoint(id);
        }
    };
    BaseDebugPlatform.prototype.clearBreakpoint = function (id) {
        delete this.breakpoints.id2bp[id];
    };
    BaseDebugPlatform.prototype.hasBreakpoint = function (id) {
        return this.breakpoints.id2bp[id] != null;
    };
    BaseDebugPlatform.prototype.getDebugCallback = function () {
        return this.breakpoints.getDebugCondition();
    };
    BaseDebugPlatform.prototype.setupDebug = function (callback) {
        this.onBreakpointHit = callback;
    };
    BaseDebugPlatform.prototype.clearDebug = function () {
        this.debugSavedState = null;
        this.debugBreakState = null;
        this.debugTargetClock = -1;
        this.debugClock = 0;
        this.onBreakpointHit = null;
        this.clearBreakpoint('debug');
        this.frameCount = 0;
    };
    BaseDebugPlatform.prototype.setDebugCondition = function (debugCond) {
        this.setBreakpoint('debug', debugCond);
    };
    BaseDebugPlatform.prototype.restartDebugging = function () {
        if (this.debugSavedState) {
            this.loadState(this.debugSavedState);
        }
        else {
            this.debugSavedState = this.saveState();
        }
        this.debugClock = 0;
        this.debugCallback = this.getDebugCallback();
        this.debugBreakState = null;
        this.resume();
    };
    BaseDebugPlatform.prototype.preFrame = function () {
        // save state before frame, to record any inputs that happened pre-frame
        if (this.debugCallback && !this.debugBreakState) {
            // save state every frame and rewind debug clocks
            this.debugSavedState = this.saveState();
            this.debugTargetClock -= this.debugClock;
            this.debugClock = 0;
        }
    };
    BaseDebugPlatform.prototype.postFrame = function () {
        // reload debug state at end of frame after breakpoint
        if (this.debugCallback && this.debugBreakState) {
            this.loadState(this.debugBreakState);
        }
        this.frameCount++;
    };
    BaseDebugPlatform.prototype.pollControls = function () {
    };
    BaseDebugPlatform.prototype.nextFrame = function (novideo) {
        this.pollControls();
        this.updateRecorder();
        this.preFrame();
        var steps = this.advance(novideo);
        this.postFrame();
        return steps;
    };
    BaseDebugPlatform.prototype.evalDebugCondition = function () {
        if (this.debugCallback && !this.debugBreakState) {
            this.debugCallback();
        }
    };
    BaseDebugPlatform.prototype.wasBreakpointHit = function () {
        return this.debugBreakState != null;
    };
    BaseDebugPlatform.prototype.breakpointHit = function (targetClock, reason) {
        console.log(this.debugTargetClock, targetClock, this.debugClock, this.isStable());
        this.debugTargetClock = targetClock;
        this.debugBreakState = this.saveState();
        console.log("Breakpoint at clk", this.debugClock, "PC", this.debugBreakState.c.PC.toString(16));
        this.pause();
        if (this.onBreakpointHit) {
            this.onBreakpointHit(this.debugBreakState, reason);
        }
    };
    BaseDebugPlatform.prototype.haltAndCatchFire = function (reason) {
        this.breakpointHit(this.debugClock, reason);
    };
    BaseDebugPlatform.prototype.runEval = function (evalfunc) {
        var _this = this;
        this.setDebugCondition(function () {
            if (++_this.debugClock >= _this.debugTargetClock && _this.isStable()) {
                var cpuState = _this.getCPUState();
                if (evalfunc(cpuState)) {
                    _this.breakpointHit(_this.debugClock);
                    return true;
                }
                else {
                    return false;
                }
            }
        });
    };
    BaseDebugPlatform.prototype.runToPC = function (pc) {
        this.debugTargetClock++;
        this.runEval(function (c) {
            return c.PC == pc;
        });
    };
    BaseDebugPlatform.prototype.runUntilReturn = function () {
        var SP0 = this.getSP();
        this.runEval(function (c) {
            return c.SP > SP0; // TODO: check for RTS/RET opcode
        });
    };
    BaseDebugPlatform.prototype.runToFrameClock = function (clock) {
        this.restartDebugging();
        this.debugTargetClock = clock;
        this.runEval(function () { return true; });
    };
    BaseDebugPlatform.prototype.step = function () {
        this.runToFrameClock(this.debugClock + 1);
    };
    BaseDebugPlatform.prototype.stepBack = function () {
        var _this = this;
        var prevState;
        var prevClock;
        var clock0 = this.debugTargetClock;
        this.restartDebugging();
        this.debugTargetClock = clock0 - 25; // TODO: depends on CPU
        this.runEval(function (c) {
            if (_this.debugClock < clock0) {
                prevState = _this.saveState();
                prevClock = _this.debugClock;
                return false;
            }
            else {
                if (prevState) {
                    _this.loadState(prevState);
                    _this.debugClock = prevClock;
                }
                return true;
            }
        });
    };
    BaseDebugPlatform.prototype.runToVsync = function () {
        var _this = this;
        this.restartDebugging();
        var frame0 = this.frameCount;
        this.runEval(function () {
            return _this.frameCount > frame0;
        });
    };
    return BaseDebugPlatform;
}(BasePlatform));
exports.BaseDebugPlatform = BaseDebugPlatform;
function inspectSymbol(platform, sym) {
    if (!platform.debugSymbols)
        return;
    var symmap = platform.debugSymbols.symbolmap;
    var addr2sym = platform.debugSymbols.addr2symbol;
    if (!symmap || !platform.readAddress)
        return null;
    var addr = symmap["_" + sym] || symmap[sym]; // look for C or asm symbol
    if (!(typeof addr == 'number'))
        return null;
    var b = platform.readAddress(addr);
    // don't show 2 bytes if there's a symbol at the next address
    if (addr2sym && addr2sym[addr + 1] != null) {
        return "$" + util_1.hex(addr, 4) + " = $" + util_1.hex(b, 2) + " (" + b + " decimal)"; // unsigned
    }
    else {
        var b2 = platform.readAddress(addr + 1);
        var w = b | (b2 << 8);
        return "$" + util_1.hex(addr, 4) + " = $" + util_1.hex(b, 2) + " $" + util_1.hex(b2, 2) + " (" + ((w << 16) >> 16) + " decimal)"; // signed
    }
}
exports.inspectSymbol = inspectSymbol;
////// 6502
function getToolForFilename_6502(fn) {
    if (fn.endsWith(".pla"))
        return "plasm";
    if (fn.endsWith(".c"))
        return "cc65";
    if (fn.endsWith(".h"))
        return "cc65";
    if (fn.endsWith(".s"))
        return "ca65";
    if (fn.endsWith(".ca65"))
        return "ca65";
    if (fn.endsWith(".dasm"))
        return "dasm";
    if (fn.endsWith(".acme"))
        return "acme";
    return "dasm"; // .a
}
exports.getToolForFilename_6502 = getToolForFilename_6502;
// TODO: can merge w/ Z80?
var Base6502Platform = /** @class */ (function (_super) {
    __extends(Base6502Platform, _super);
    function Base6502Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // some platforms store their PC one byte before or after the first opcode
        // so we correct when saving and loading from state
        _this.debugPCDelta = -1;
        _this.getToolForFilename = getToolForFilename_6502;
        return _this;
    }
    Base6502Platform.prototype.fixPC = function (c) { c.PC = (c.PC + this.debugPCDelta) & 0xffff; return c; };
    Base6502Platform.prototype.unfixPC = function (c) { c.PC = (c.PC - this.debugPCDelta) & 0xffff; return c; };
    Base6502Platform.prototype.getSP = function () { return this.getCPUState().SP; };
    ;
    Base6502Platform.prototype.getPC = function () { return this.getCPUState().PC; };
    ;
    Base6502Platform.prototype.isStable = function () { return !this.getCPUState()['T']; };
    Base6502Platform.prototype.newCPU = function (membus) {
        var cpu = new jt.M6502();
        cpu.connectBus(membus);
        return cpu;
    };
    Base6502Platform.prototype.getOpcodeMetadata = function (opcode, offset) {
        return getOpcodeMetadata_6502(opcode, offset);
    };
    Base6502Platform.prototype.getOriginPC = function () {
        return (this.readAddress(0xfffc) | (this.readAddress(0xfffd) << 8)) & 0xffff;
    };
    Base6502Platform.prototype.disassemble = function (pc, read) {
        return disasm6502_1.disassemble6502(pc, read(pc), read(pc + 1), read(pc + 2));
    };
    Base6502Platform.prototype.getDefaultExtension = function () { return ".a"; };
    ;
    Base6502Platform.prototype.getDebugCategories = function () {
        return ['CPU', 'ZPRAM', 'Stack'];
    };
    Base6502Platform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return cpuStateToLongString_6502(state.c);
            case 'ZPRAM': return emu_1.dumpRAM(state.b || state.ram, 0x0, 0x100);
            case 'Stack': return dumpStackToString(this, state.b || state.ram, 0x100, 0x1ff, 0x100 + state.c.SP, 0x20);
        }
    };
    return Base6502Platform;
}(BaseDebugPlatform));
exports.Base6502Platform = Base6502Platform;
function cpuStateToLongString_6502(c) {
    function decodeFlags(c) {
        var s = "";
        s += c.N ? " N" : " -";
        s += c.V ? " V" : " -";
        s += c.D ? " D" : " -";
        s += c.Z ? " Z" : " -";
        s += c.C ? " C" : " -";
        s += c.I ? " I" : " -";
        return s;
    }
    return "PC " + util_1.hex(c.PC, 4) + "  " + decodeFlags(c) + "\n"
        + " A " + util_1.hex(c.A) + "     " + (c.R ? "" : "BUSY") + "\n"
        + " X " + util_1.hex(c.X) + "\n"
        + " Y " + util_1.hex(c.Y) + "     " + "SP " + util_1.hex(c.SP) + "\n";
}
exports.cpuStateToLongString_6502 = cpuStateToLongString_6502;
var OPMETA_6502 = {
    cycletime: [
        7, 6, 0, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7, 6, 6, 0, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7, 6, 6, 0, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7, 6, 6, 0, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7, 0, 6, 0, 6, 3, 3, 3, 3, 2, 0, 2, 0, 4, 4, 4, 4, 2, 6, 0, 0, 4, 4, 4, 4, 2, 5, 2, 0, 0, 5, 0, 0, 2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 0, 4, 4, 4, 4, 2, 5, 0, 5, 4, 4, 4, 4, 2, 4, 2, 0, 4, 4, 4, 4, 2, 6, 0, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 3, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7, 2, 6, 0, 8, 3, 3, 5, 5, 2, 2, 2, 0, 4, 4, 6, 6, 2, 5, 0, 8, 4, 4, 6, 6, 2, 4, 0, 7, 4, 4, 7, 7
    ],
    extracycles: [
        0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1
    ],
    insnlengths: [
        1, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3, 3, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3, 1, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3, 1, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3, 0, 2, 0, 2, 2, 2, 2, 2, 1, 0, 1, 0, 3, 3, 3, 3, 2, 2, 0, 0, 2, 2, 2, 3, 1, 3, 1, 0, 0, 3, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 1, 0, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 0, 3, 3, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 1, 3, 0, 3, 3, 3, 3, 3
    ],
    validinsns: [
        1, 2, 0, 0, 0, 2, 2, 0, 1, 2, 1, 0, 0, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0, 3, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0, 1, 2, 0, 0, 0, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0, 1, 2, 0, 0, 0, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0, 0, 2, 0, 0, 2, 2, 2, 0, 1, 0, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 0, 3, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 3, 0, 0, 0, 3, 3, 0
    ],
};
function getOpcodeMetadata_6502(opcode, address) {
    // TODO: more intelligent maximum cycles
    // TODO: must always be new object, b/c we might modify it
    return {
        opcode: opcode,
        minCycles: OPMETA_6502.cycletime[opcode],
        maxCycles: OPMETA_6502.cycletime[opcode] + OPMETA_6502.extracycles[opcode],
        insnlength: OPMETA_6502.insnlengths[opcode]
    };
}
exports.getOpcodeMetadata_6502 = getOpcodeMetadata_6502;
////// Z80
function cpuStateToLongString_Z80(c) {
    function decodeFlags(flags) {
        return util_1.printFlags(flags, ["S", "Z", , "H", , "V", "N", "C"], true);
    }
    return "PC " + util_1.hex(c.PC, 4) + "  " + decodeFlags(c.AF) + " " + (c.iff1 ? "I" : "-") + (c.iff2 ? "I" : "-") + "\n"
        + "SP " + util_1.hex(c.SP, 4) + "  IR " + util_1.hex(c.IR, 4) + "\n"
        + "IX " + util_1.hex(c.IX, 4) + "  IY " + util_1.hex(c.IY, 4) + "\n"
        + "AF " + util_1.hex(c.AF, 4) + "  BC " + util_1.hex(c.BC, 4) + "\n"
        + "DE " + util_1.hex(c.DE, 4) + "  HL " + util_1.hex(c.HL, 4) + "\n";
}
exports.cpuStateToLongString_Z80 = cpuStateToLongString_Z80;
var BaseZ80Platform = /** @class */ (function (_super) {
    __extends(BaseZ80Platform, _super);
    function BaseZ80Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.waitCycles = 0;
        _this.getToolForFilename = getToolForFilename_z80;
        return _this;
    }
    BaseZ80Platform.prototype.newCPU = function (membus, iobus) {
        this._cpu = new ZilogZ80_1.Z80();
        this._cpu.connectMemoryBus(membus);
        this._cpu.connectIOBus(iobus);
        return this._cpu;
    };
    BaseZ80Platform.prototype.getPC = function () { return this._cpu.getPC(); };
    BaseZ80Platform.prototype.getSP = function () { return this._cpu.getSP(); };
    BaseZ80Platform.prototype.isStable = function () { return true; };
    // TODO: refactor other parts into here
    BaseZ80Platform.prototype.runCPU = function (cpu, cycles) {
        this._cpu = cpu; // TODO?
        this.waitCycles = 0; // TODO: needs to spill over betwenn calls
        if (this.wasBreakpointHit())
            return 0;
        var debugCond = this.getDebugCallback();
        var n = 0;
        this.waitCycles += cycles;
        while (this.waitCycles > 0) {
            if (debugCond && debugCond()) {
                debugCond = null;
                break;
            }
            var cyc = cpu.advanceInsn();
            n += cyc;
            this.waitCycles -= cyc;
        }
        return n;
    };
    BaseZ80Platform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    // TODO: Z80 opcode metadata
    //this.getOpcodeMetadata = function() { }
    BaseZ80Platform.prototype.getDebugCategories = function () {
        return ['CPU', 'Stack'];
    };
    BaseZ80Platform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return cpuStateToLongString_Z80(state.c);
            case 'Stack': {
                var sp = (state.c.SP - 1) & 0xffff;
                var start = sp & 0xff00;
                var end = start + 0xff;
                if (sp == 0)
                    sp = 0x10000;
                console.log(sp, start, end);
                return dumpStackToString(this, [], start, end, sp, 0xcd);
            }
        }
    };
    BaseZ80Platform.prototype.disassemble = function (pc, read) {
        return disasmz80_1.disassembleZ80(pc, read(pc), read(pc + 1), read(pc + 2), read(pc + 3));
    };
    return BaseZ80Platform;
}(BaseDebugPlatform));
exports.BaseZ80Platform = BaseZ80Platform;
function getToolForFilename_z80(fn) {
    if (fn.endsWith(".c"))
        return "sdcc";
    if (fn.endsWith(".h"))
        return "sdcc";
    if (fn.endsWith(".s"))
        return "sdasz80";
    if (fn.endsWith(".ns"))
        return "naken";
    if (fn.endsWith(".scc"))
        return "sccz80";
    if (fn.endsWith(".z"))
        return "zmac";
    return "zmac";
}
exports.getToolForFilename_z80 = getToolForFilename_z80;
////// 6809
function cpuStateToLongString_6809(c) {
    function decodeFlags(flags) {
        return util_1.printFlags(flags, ["E", "F", "H", "I", "N", "Z", "V", "C"], true);
    }
    return "PC " + util_1.hex(c.PC, 4) + "  " + decodeFlags(c.CC) + "\n"
        + "SP " + util_1.hex(c.SP, 4) + "\n"
        + "DP " + util_1.hex(c.DP, 2) + "\n"
        + " A " + util_1.hex(c.A, 2) + "\n"
        + " B " + util_1.hex(c.B, 2) + "\n"
        + " X " + util_1.hex(c.X, 4) + "\n"
        + " Y " + util_1.hex(c.Y, 4) + "\n"
        + " U " + util_1.hex(c.U, 4) + "\n";
}
exports.cpuStateToLongString_6809 = cpuStateToLongString_6809;
function getToolForFilename_6809(fn) {
    if (fn.endsWith(".c"))
        return "cmoc";
    if (fn.endsWith(".h"))
        return "cmoc";
    if (fn.endsWith(".xasm"))
        return "xasm6809";
    return "lwasm";
}
exports.getToolForFilename_6809 = getToolForFilename_6809;
var Base6809Platform = /** @class */ (function (_super) {
    __extends(Base6809Platform, _super);
    function Base6809Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //this.getOpcodeMetadata = function() { }
        _this.getToolForFilename = getToolForFilename_6809;
        return _this;
    }
    Base6809Platform.prototype.newCPU = function (membus) {
        var cpu = new CPU6809();
        cpu.init(membus.write, membus.read, 0);
        return cpu;
    };
    Base6809Platform.prototype.cpuStateToLongString = function (c) {
        return cpuStateToLongString_6809(c);
    };
    Base6809Platform.prototype.disassemble = function (pc, read) {
        // TODO: don't create new CPU
        return new CPU6809().disasm(read(pc), read(pc + 1), read(pc + 2), read(pc + 3), read(pc + 4), pc);
    };
    Base6809Platform.prototype.getDefaultExtension = function () { return ".asm"; };
    ;
    Base6809Platform.prototype.getDebugCategories = function () {
        return ['CPU', 'Stack'];
    };
    Base6809Platform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return cpuStateToLongString_6809(state.c);
            default: return _super.prototype.getDebugInfo.call(this, category, state);
        }
    };
    return Base6809Platform;
}(BaseZ80Platform));
exports.Base6809Platform = Base6809Platform;
var BaseMAMEPlatform = /** @class */ (function () {
    function BaseMAMEPlatform(mainElement) {
        this.loaded = false;
        this.preinitted = false;
        this.started = false;
        this.running = false;
        this.initluavars = false;
        this.mainElement = mainElement;
        this.timer = new emu_1.AnimationTimer(20, this.poll.bind(this));
    }
    // http://docs.mamedev.org/techspecs/luaengine.html
    BaseMAMEPlatform.prototype.luacall = function (s) {
        if (!this.js_lua_string)
            this.js_lua_string = Module.cwrap('_Z13js_lua_stringPKc', 'string', ['string']);
        return this.js_lua_string(s || "");
    };
    BaseMAMEPlatform.prototype._pause = function () {
        this.running = false;
        this.timer.stop();
    };
    BaseMAMEPlatform.prototype.pause = function () {
        if (this.loaded && this.running) {
            this.luacall('emu.pause()');
            this._pause();
        }
    };
    BaseMAMEPlatform.prototype._resume = function () {
        this.luacall('emu.unpause()');
        this.running = true;
        this.timer.start();
    };
    BaseMAMEPlatform.prototype.resume = function () {
        if (this.loaded && !this.running) { // TODO
            this._resume();
        }
    };
    BaseMAMEPlatform.prototype.reset = function () {
        if (this.loaded) {
            this.luacall('manager:machine():soft_reset()');
            this.running = true;
            this.initluavars = false;
        }
    };
    BaseMAMEPlatform.prototype.isRunning = function () {
        return this.running;
    };
    BaseMAMEPlatform.prototype.bufferConsoleOutput = function (s) {
        if (typeof s !== 'string')
            return;
        console.log(s);
    };
    BaseMAMEPlatform.prototype.startModule = function (mainElement, opts) {
        var _this = this;
        this.started = true;
        var romfn = this.romfn = this.romfn || opts.romfn;
        var romdata = this.romdata = this.romdata || opts.romdata || new emu_1.RAM(opts.romsize).mem;
        // create canvas
        var video = this.video = new emu_1.RasterVideo(this.mainElement, opts.width, opts.height);
        video.create();
        $(video.canvas).attr('id', 'canvas');
        // load asm.js module
        console.log("loading", opts.jsfile);
        var modargs = [opts.driver,
            '-debug',
            '-debugger', 'none',
            '-verbose', '-window', '-nokeepaspect',
            '-resolution', video.canvas.width + 'x' + video.canvas.height
        ];
        if (romfn)
            modargs.push('-cart', romfn);
        window['JSMESS'] = {};
        window['Module'] = {
            arguments: modargs,
            screenIsReadOnly: true,
            print: this.bufferConsoleOutput,
            canvas: video.canvas,
            doNotCaptureKeyboard: true,
            keyboardListeningElement: video.canvas,
            preInit: function () {
                console.log("loading FS");
                ENV.SDL_EMSCRIPTEN_KEYBOARD_ELEMENT = 'canvas';
                if (opts.cfgfile) {
                    FS.mkdir('/cfg');
                    FS.writeFile('/cfg/' + opts.cfgfile, opts.cfgdata, { encoding: 'utf8' });
                }
                if (opts.biosfile) {
                    FS.mkdir('/roms');
                    FS.mkdir('/roms/' + opts.driver);
                    FS.writeFile('/roms/' + opts.biosfile, opts.biosdata, { encoding: 'binary' });
                }
                FS.mkdir('/emulator');
                if (romfn) {
                    FS.writeFile(romfn, romdata, { encoding: 'binary' });
                }
                //FS.writeFile('/debug.ini', 'debugger none\n', {encoding:'utf8'});
                if (opts.preInit) {
                    opts.preInit(self);
                }
                _this.preinitted = true;
            },
            preRun: [
                function () {
                    $(video.canvas).click(function (e) {
                        video.canvas.focus();
                    });
                    _this.loaded = true;
                    console.log("about to run...");
                }
            ]
        };
        // preload files
        // TODO: ensure loaded
        var fetch_cfg, fetch_lua;
        var fetch_bios = $.Deferred();
        var fetch_wasm = $.Deferred();
        // fetch config file
        if (opts.cfgfile) {
            fetch_cfg = $.get('mame/cfg/' + opts.cfgfile, function (data) {
                opts.cfgdata = data;
                console.log("loaded " + opts.cfgfile);
            }, 'text');
        }
        // fetch BIOS file
        if (opts.biosfile) {
            var oReq1 = new XMLHttpRequest();
            oReq1.open("GET", 'mame/roms/' + opts.biosfile, true);
            oReq1.responseType = "arraybuffer";
            oReq1.onload = function (oEvent) {
                opts.biosdata = new Uint8Array(oReq1.response);
                console.log("loaded " + opts.biosfile); // + " (" + oEvent.total + " bytes)");
                fetch_bios.resolve();
            };
            oReq1.ontimeout = function (oEvent) {
                throw Error("Timeout loading " + opts.biosfile);
            };
            oReq1.send();
        }
        else {
            fetch_bios.resolve();
        }
        // load debugger Lua script
        fetch_lua = $.get('mame/debugger.lua', function (data) {
            _this.luadebugscript = data;
            console.log("loaded debugger.lua");
        }, 'text');
        // load WASM
        {
            var oReq2 = new XMLHttpRequest();
            oReq2.open("GET", 'mame/' + opts.jsfile.replace('.js', '.wasm'), true);
            oReq2.responseType = "arraybuffer";
            oReq2.onload = function (oEvent) {
                console.log("loaded WASM file");
                window['Module'].wasmBinary = new Uint8Array(oReq2.response);
                fetch_wasm.resolve();
            };
            oReq2.ontimeout = function (oEvent) {
                throw Error("Timeout loading " + opts.jsfile);
            };
            oReq2.send();
        }
        // start loading script
        $.when(fetch_lua, fetch_cfg, fetch_bios, fetch_wasm).done(function () {
            var script = document.createElement('script');
            script.src = 'mame/' + opts.jsfile;
            document.getElementsByTagName('head')[0].appendChild(script);
            console.log("created script element");
        });
        // for debugging via browser console
        window['mamelua'] = function (s) {
            _this.initlua();
            return _this.luacall(s);
        };
    };
    BaseMAMEPlatform.prototype.loadROMFile = function (data) {
        this.romdata = data;
        if (this.preinitted && this.romfn) {
            FS.writeFile(this.romfn, data, { encoding: 'binary' });
        }
    };
    BaseMAMEPlatform.prototype.loadRegion = function (region, data) {
        if (this.loaded && data.length > 0) {
            //this.luacall('cart=manager:machine().images["cart"]\nprint(cart:filename())\ncart:load("' + region + '")\n');
            var s = 'rgn = manager:machine():memory().regions["' + region + '"]\n';
            //s += 'print(rgn.size)\n';
            for (var i = 0; i < data.length; i += 4) {
                var v = data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24);
                s += 'rgn:write_u32(' + i + ',' + v + ')\n'; // TODO: endian?
            }
            this.luacall(s);
            this.reset();
        }
    };
    // DEBUGGING SUPPORT
    BaseMAMEPlatform.prototype.initlua = function () {
        if (!this.initluavars) {
            this.luacall(this.luadebugscript);
            this.luacall('mamedbg.init()');
            this.initluavars = true;
        }
    };
    BaseMAMEPlatform.prototype.readAddress = function (a) {
        this.initlua();
        return parseInt(this.luacall('return mem:read_u8(' + a + ')'));
    };
    BaseMAMEPlatform.prototype.getCPUReg = function (reg) {
        if (!this.loaded)
            return 0; // TODO
        this.initlua();
        return parseInt(this.luacall('return cpu.state.' + reg + '.value'));
    };
    BaseMAMEPlatform.prototype.getPC = function () {
        return this.getCPUReg('PC');
    };
    BaseMAMEPlatform.prototype.getSP = function () {
        return this.getCPUReg('SP');
    };
    BaseMAMEPlatform.prototype.isStable = function () { return true; };
    BaseMAMEPlatform.prototype.getCPUState = function () {
        return {
            PC: this.getPC(),
            SP: this.getSP(),
            A: this.getCPUReg('A'),
            X: this.getCPUReg('X'),
            Y: this.getCPUReg('Y'),
        };
    };
    BaseMAMEPlatform.prototype.grabState = function (expr) {
        this.initlua();
        return {
            c: this.getCPUState(),
            buf: this.luacall("return string.tohex(" + expr + ")")
        };
    };
    BaseMAMEPlatform.prototype.saveState = function () {
        return this.grabState("manager:machine():buffer_save()");
    };
    BaseMAMEPlatform.prototype.loadState = function (state) {
        this.initlua();
        return this.luacall("manager:machine():buffer_load(string.fromhex('" + state.buf + "'))");
    };
    BaseMAMEPlatform.prototype.poll = function () {
        if (this.onBreakpointHit && this.luacall("return tostring(mamedbg.is_stopped())") == 'true') {
            this._pause();
            //this.luacall("manager:machine():buffer_load(lastBreakState)");
            var state = this.grabState("lastBreakState");
            this.onBreakpointHit(state);
        }
    };
    BaseMAMEPlatform.prototype.clearDebug = function () {
        this.onBreakpointHit = null;
        if (this.loaded) {
            this.initlua();
            this.luacall('mamedbg.reset()');
        }
    };
    BaseMAMEPlatform.prototype.getDebugCallback = function () {
        return this.onBreakpointHit; // TODO?
    };
    BaseMAMEPlatform.prototype.setupDebug = function (callback) {
        this.onBreakpointHit = callback;
    };
    BaseMAMEPlatform.prototype.debugcmd = function (s) {
        this.initlua();
        this.luacall(s);
        this._resume();
    };
    BaseMAMEPlatform.prototype.runToPC = function (pc) {
        this.debugcmd('mamedbg.runTo(' + pc + ')');
    };
    BaseMAMEPlatform.prototype.runToVsync = function () {
        this.debugcmd('mamedbg.runToVsync()');
    };
    BaseMAMEPlatform.prototype.runUntilReturn = function () {
        this.debugcmd('mamedbg.runUntilReturn()');
    };
    // TODO
    BaseMAMEPlatform.prototype.runEval = function () {
        this.reset();
        this.step();
    };
    BaseMAMEPlatform.prototype.step = function () {
        this.debugcmd('mamedbg.step()');
    };
    BaseMAMEPlatform.prototype.getDebugCategories = function () {
        return ['CPU'];
    };
    BaseMAMEPlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return this.cpuStateToLongString(state.c);
        }
    };
    // TODO: other than z80
    BaseMAMEPlatform.prototype.cpuStateToLongString = function (c) {
        if (c.HL)
            return cpuStateToLongString_Z80(c);
        else
            return cpuStateToLongString_6502(c); // TODO
    };
    BaseMAMEPlatform.prototype.disassemble = function (pc, read) {
        // TODO: z80
        return disasm6502_1.disassemble6502(pc, read(pc), read(pc + 1), read(pc + 2));
    };
    return BaseMAMEPlatform;
}());
exports.BaseMAMEPlatform = BaseMAMEPlatform;
//TODO: how to get stack_end?
function dumpStackToString(platform, mem, start, end, sp, jsrop) {
    var s = "";
    var nraw = 0;
    //s = dumpRAM(mem.slice(start,start+end+1), start, end-start+1);
    function read(addr) {
        if (addr < mem.length)
            return mem[addr];
        else
            return platform.readAddress(addr);
    }
    while (sp < end) {
        sp++;
        // see if there's a JSR on the stack here
        // TODO: make work with roms and memory maps
        var addr = read(sp) + read(sp + 1) * 256;
        var jsrofs = jsrop == 0x20 ? -2 : -3; // 6502 vs Z80
        var opcode = read(addr + jsrofs); // might be out of bounds
        if (opcode == jsrop) { // JSR
            s += "\n$" + util_1.hex(sp) + ": ";
            s += util_1.hex(addr, 4) + " " + lookupSymbol(platform, addr, true);
            sp++;
            nraw = 0;
        }
        else {
            if (nraw == 0)
                s += "\n$" + util_1.hex(sp) + ": ";
            s += util_1.hex(read(sp)) + " ";
            if (++nraw == 8)
                nraw = 0;
        }
    }
    return s + "\n";
}
exports.dumpStackToString = dumpStackToString;
// TODO: slow, funky, uses global
function lookupSymbol(platform, addr, extra) {
    var start = addr;
    var addr2symbol = platform.debugSymbols && platform.debugSymbols.addr2symbol;
    while (addr2symbol && addr >= 0) {
        var sym = addr2symbol[addr];
        if (sym) { // return first symbol we find
            var sym = addr2symbol[addr];
            return extra ? (sym + " + $" + util_1.hex(start - addr)) : sym;
        }
        if (!extra)
            break;
        addr--;
    }
    return "";
}
exports.lookupSymbol = lookupSymbol;
var devices_1 = require("./devices");
var audio_1 = require("./audio");
var recorder_1 = require("./recorder");
function hasVideo(arg) {
    return typeof arg.connectVideo === 'function';
}
exports.hasVideo = hasVideo;
function hasAudio(arg) {
    return typeof arg.connectAudio === 'function';
}
exports.hasAudio = hasAudio;
function hasKeyInput(arg) {
    return typeof arg.setKeyInput === 'function';
}
exports.hasKeyInput = hasKeyInput;
function hasPaddleInput(arg) {
    return typeof arg.setPaddleInput === 'function';
}
exports.hasPaddleInput = hasPaddleInput;
function isRaster(arg) {
    return typeof arg.getRasterY === 'function';
}
exports.isRaster = isRaster;
function hasProbe(arg) {
    return typeof arg.connectProbe == 'function';
}
exports.hasProbe = hasProbe;
function hasBIOS(arg) {
    return typeof arg.loadBIOS == 'function';
}
exports.hasBIOS = hasBIOS;
function hasSerialIO(arg) {
    return typeof arg.connectSerialIO === 'function';
}
exports.hasSerialIO = hasSerialIO;
var BaseMachinePlatform = /** @class */ (function (_super) {
    __extends(BaseMachinePlatform, _super);
    function BaseMachinePlatform(mainElement) {
        var _this = _super.call(this) || this;
        _this.mainElement = mainElement;
        _this.machine = _this.newMachine();
        return _this;
    }
    BaseMachinePlatform.prototype.reset = function () { this.machine.reset(); };
    BaseMachinePlatform.prototype.loadState = function (s) { this.machine.loadState(s); };
    BaseMachinePlatform.prototype.saveState = function () { return this.machine.saveState(); };
    BaseMachinePlatform.prototype.getSP = function () { return this.machine.cpu.getSP(); };
    BaseMachinePlatform.prototype.getPC = function () { return this.machine.cpu.getPC(); };
    BaseMachinePlatform.prototype.isStable = function () { return this.machine.cpu.isStable(); };
    BaseMachinePlatform.prototype.getCPUState = function () { return this.machine.cpu.saveState(); };
    BaseMachinePlatform.prototype.loadControlsState = function (s) { this.machine.loadControlsState(s); };
    BaseMachinePlatform.prototype.saveControlsState = function () { return this.machine.saveControlsState(); };
    BaseMachinePlatform.prototype.start = function () {
        var _this = this;
        var m = this.machine;
        var videoFrequency;
        if (hasVideo(m)) {
            var vp = m.getVideoParams();
            this.video = new emu_1.RasterVideo(this.mainElement, vp.width, vp.height, { overscan: !!vp.overscan, rotate: vp.rotate | 0 });
            this.video.create();
            m.connectVideo(this.video.getFrameData());
            // TODO: support keyboard w/o video?
            if (hasKeyInput(m)) {
                this.video.setKeyboardEvents(m.setKeyInput.bind(m));
                this.poller = new emu_1.ControllerPoller(m.setKeyInput.bind(m));
            }
            videoFrequency = vp.videoFrequency;
        }
        this.timer = new emu_1.AnimationTimer(videoFrequency || 60, this.nextFrame.bind(this));
        if (hasAudio(m)) {
            var ap = m.getAudioParams();
            this.audio = new audio_1.SampledAudio(ap.sampleRate);
            this.audio.start();
            m.connectAudio(this.audio);
        }
        if (hasPaddleInput(m)) {
            this.video.setupMouseEvents();
        }
        if (hasProbe(m)) {
            this.probeRecorder = new recorder_1.ProbeRecorder(m);
            this.startProbing = function () {
                m.connectProbe(_this.probeRecorder);
                return _this.probeRecorder;
            };
            this.stopProbing = function () {
                m.connectProbe(null);
            };
        }
        if (hasBIOS(m)) {
            this.loadBIOS = function (title, data) {
                m.loadBIOS(data, title);
            };
        }
        if (hasSerialIO(m) && this.serialIOInterface) {
            m.connectSerialIO(this.serialIOInterface);
        }
    };
    BaseMachinePlatform.prototype.loadROM = function (title, data) {
        this.machine.loadROM(data);
        this.reset();
    };
    BaseMachinePlatform.prototype.pollControls = function () {
        this.poller && this.poller.poll();
        if (hasPaddleInput(this.machine)) {
            this.machine.setPaddleInput(0, this.video.paddle_x);
            this.machine.setPaddleInput(1, this.video.paddle_y);
        }
        // TODO: put into interface
        if (this.machine['pollControls']) {
            this.machine['pollControls']();
        }
    };
    BaseMachinePlatform.prototype.advance = function (novideo) {
        var steps = this.machine.advanceFrame(this.getDebugCallback());
        if (!novideo && this.video)
            this.video.updateFrame();
        return steps;
    };
    BaseMachinePlatform.prototype.advanceFrameClock = function (trap, step) {
        if (!(step > 0))
            return;
        if (this.machine instanceof BaseWASMMachine) {
            return this.machine.advanceFrameClock(trap, step);
        }
        else {
            return this.machine.advanceFrame(function () {
                return --step <= 0;
            });
        }
    };
    BaseMachinePlatform.prototype.isRunning = function () {
        return this.timer && this.timer.isRunning();
    };
    BaseMachinePlatform.prototype.resume = function () {
        this.timer.start();
        this.audio && this.audio.start();
    };
    BaseMachinePlatform.prototype.pause = function () {
        this.timer.stop();
        this.audio && this.audio.stop();
        // i guess for runToVsync()?
        if (this.probeRecorder) {
            this.probeRecorder.singleFrame = true;
        }
    };
    // so probe views stick around TODO: must be a better way?
    BaseMachinePlatform.prototype.runToVsync = function () {
        if (this.probeRecorder) {
            this.probeRecorder.clear();
            this.probeRecorder.singleFrame = false;
        }
        _super.prototype.runToVsync.call(this);
    };
    // TODO: reset target clock counter
    BaseMachinePlatform.prototype.getRasterScanline = function () {
        return isRaster(this.machine) && this.machine.getRasterY();
    };
    BaseMachinePlatform.prototype.readAddress = function (addr) {
        return this.machine.read(addr);
    };
    return BaseMachinePlatform;
}(BaseDebugPlatform));
exports.BaseMachinePlatform = BaseMachinePlatform;
// TODO: move debug info into CPU?
var Base6502MachinePlatform = /** @class */ (function (_super) {
    __extends(Base6502MachinePlatform, _super);
    function Base6502MachinePlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getOpcodeMetadata = getOpcodeMetadata_6502;
        _this.getToolForFilename = getToolForFilename_6502;
        return _this;
    }
    Base6502MachinePlatform.prototype.disassemble = function (pc, read) {
        return disasm6502_1.disassemble6502(pc, read(pc), read(pc + 1), read(pc + 2));
    };
    Base6502MachinePlatform.prototype.getDebugCategories = function () {
        if (isDebuggable(this.machine))
            return this.machine.getDebugCategories();
        else
            return ['CPU', 'ZPRAM', 'Stack'];
    };
    Base6502MachinePlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return cpuStateToLongString_6502(state.c);
            case 'ZPRAM': return emu_1.dumpRAM(state.b || state.ram, 0x0, 0x100);
            case 'Stack': return dumpStackToString(this, state.b || state.ram, 0x100, 0x1ff, 0x100 + state.c.SP, 0x20);
            default: return isDebuggable(this.machine) && this.machine.getDebugInfo(category, state);
        }
    };
    return Base6502MachinePlatform;
}(BaseMachinePlatform));
exports.Base6502MachinePlatform = Base6502MachinePlatform;
var BaseZ80MachinePlatform = /** @class */ (function (_super) {
    __extends(BaseZ80MachinePlatform, _super);
    function BaseZ80MachinePlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //getOpcodeMetadata     = getOpcodeMetadata_z80;
        _this.getToolForFilename = getToolForFilename_z80;
        return _this;
    }
    BaseZ80MachinePlatform.prototype.getDebugCategories = function () {
        if (isDebuggable(this.machine))
            return this.machine.getDebugCategories();
        else
            return ['CPU', 'Stack'];
    };
    BaseZ80MachinePlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return cpuStateToLongString_Z80(state.c);
            case 'Stack': {
                var sp = (state.c.SP - 1) & 0xffff;
                var start = sp & 0xff00;
                var end = start + 0xff;
                if (sp == 0)
                    sp = 0x10000;
                console.log(sp, start, end);
                return dumpStackToString(this, [], start, end, sp, 0xcd);
            }
            default: return isDebuggable(this.machine) && this.machine.getDebugInfo(category, state);
        }
    };
    BaseZ80MachinePlatform.prototype.disassemble = function (pc, read) {
        return disasmz80_1.disassembleZ80(pc, read(pc), read(pc + 1), read(pc + 2), read(pc + 3));
    };
    return BaseZ80MachinePlatform;
}(BaseMachinePlatform));
exports.BaseZ80MachinePlatform = BaseZ80MachinePlatform;
// WASM Support
// TODO: detangle from c64
var BaseWASMMachine = /** @class */ (function () {
    function BaseWASMMachine(prefix) {
        this.prefix = prefix;
        var self = this;
        this.cpu = {
            getPC: self.getPC.bind(self),
            getSP: self.getSP.bind(self),
            isStable: self.isStable.bind(self),
            reset: self.reset.bind(self),
            saveState: function () {
                return self.getCPUState();
            },
            loadState: function () {
                console.log("loadState not implemented");
            },
            connectMemoryBus: function () {
                console.log("connectMemoryBus not implemented");
            },
        };
    }
    BaseWASMMachine.prototype.loadWASM = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wasmResponse, wasmBinary, wasmCompiled, wasmResult, biosResponse, biosBinary, statesize, ctrlstatesize, cpustatesize, sampbufsize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('res/' + this.prefix + '.wasm')];
                    case 1:
                        wasmResponse = _a.sent();
                        return [4 /*yield*/, wasmResponse.arrayBuffer()];
                    case 2:
                        wasmBinary = _a.sent();
                        return [4 /*yield*/, WebAssembly.compile(wasmBinary)];
                    case 3:
                        wasmCompiled = _a.sent();
                        return [4 /*yield*/, WebAssembly.instantiate(wasmCompiled)];
                    case 4:
                        wasmResult = _a.sent();
                        this.instance = wasmResult;
                        this.exports = wasmResult.exports;
                        this.exports.memory.grow(64); // TODO: need more when probing?
                        return [4 /*yield*/, fetch('res/' + this.prefix + '.bios')];
                    case 5:
                        biosResponse = _a.sent();
                        return [4 /*yield*/, biosResponse.arrayBuffer()];
                    case 6:
                        biosBinary = _a.sent();
                        this.biosptr = this.exports.malloc(biosBinary.byteLength);
                        this.biosarr = new Uint8Array(this.exports.memory.buffer, this.biosptr, biosBinary.byteLength);
                        this.loadBIOS(new Uint8Array(biosBinary));
                        // init machine instance
                        this.sys = this.exports.machine_init(this.biosptr);
                        console.log('machine_init', this.sys);
                        statesize = this.exports.machine_get_state_size();
                        this.stateptr = this.exports.malloc(statesize);
                        this.statearr = new Uint8Array(this.exports.memory.buffer, this.stateptr, statesize);
                        ctrlstatesize = this.exports.machine_get_controls_state_size();
                        this.ctrlstateptr = this.exports.malloc(ctrlstatesize);
                        this.ctrlstatearr = new Uint8Array(this.exports.memory.buffer, this.ctrlstateptr, ctrlstatesize);
                        cpustatesize = this.exports.machine_get_cpu_state_size();
                        this.cpustateptr = this.exports.malloc(cpustatesize);
                        this.cpustatearr = new Uint8Array(this.exports.memory.buffer, this.cpustateptr, cpustatesize);
                        sampbufsize = 4096 * 4;
                        this.audioarr = new Float32Array(this.exports.memory.buffer, this.exports.machine_get_sample_buffer(), sampbufsize);
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseWASMMachine.prototype.getPC = function () {
        return this.exports.machine_cpu_get_pc(this.sys);
    };
    BaseWASMMachine.prototype.getSP = function () {
        return this.exports.machine_cpu_get_sp(this.sys);
    };
    BaseWASMMachine.prototype.isStable = function () {
        return this.exports.machine_cpu_is_stable(this.sys);
    };
    BaseWASMMachine.prototype.loadROM = function (rom) {
        if (!this.romptr) {
            this.romptr = this.exports.malloc(0x10000);
            this.romarr = new Uint8Array(this.exports.memory.buffer, this.romptr, 0x10000);
        }
        this.romarr.set(rom);
        this.romlen = rom.length;
        this.reset();
    };
    // TODO: can't load after machine_init
    BaseWASMMachine.prototype.loadBIOS = function (srcArray) {
        this.biosarr.set(srcArray);
    };
    BaseWASMMachine.prototype.reset = function () {
        this.exports.machine_reset(this.sys);
    };
    /* TODO: we don't need this because c64_exec does this?
    pollControls() {
      this.exports.machine_start_frame(this.sys);
    }
    */
    BaseWASMMachine.prototype.read = function (address) {
        return this.exports.machine_mem_read(this.sys, address & 0xffff);
    };
    BaseWASMMachine.prototype.readConst = function (address) {
        return this.exports.machine_mem_read(this.sys, address & 0xffff);
    };
    BaseWASMMachine.prototype.write = function (address, value) {
        this.exports.machine_mem_write(this.sys, address & 0xffff, value & 0xff);
    };
    BaseWASMMachine.prototype.getAudioParams = function () {
        return { sampleRate: 44100, stereo: false };
    };
    BaseWASMMachine.prototype.connectVideo = function (pixels) {
        this.pixel_dest = pixels;
        // save video pointer
        var pixbuf = this.exports.machine_get_pixel_buffer(this.sys);
        this.pixel_src = new Uint32Array(this.exports.memory.buffer, pixbuf, pixels.length);
        console.log(pixbuf, pixels.length);
    };
    BaseWASMMachine.prototype.syncVideo = function () {
        if (this.pixel_dest != null) {
            this.pixel_dest.set(this.pixel_src);
        }
    };
    // assume controls buffer is smaller than cpu buffer
    BaseWASMMachine.prototype.saveControlsState = function () {
        //console.log(1, this.romptr, this.romlen, this.ctrlstateptr, this.romarr.slice(0,4), this.ctrlstatearr.slice(0,4));
        this.exports.machine_save_controls_state(this.sys, this.ctrlstateptr);
        //console.log(2, this.romptr, this.romlen, this.ctrlstateptr, this.romarr.slice(0,4), this.ctrlstatearr.slice(0,4));
        return { controls: this.ctrlstatearr.slice(0) };
    };
    BaseWASMMachine.prototype.loadControlsState = function (state) {
        this.ctrlstatearr.set(state.controls);
        this.exports.machine_load_controls_state(this.sys, this.ctrlstateptr);
    };
    BaseWASMMachine.prototype.connectAudio = function (audio) {
        this.audio = audio;
    };
    BaseWASMMachine.prototype.syncAudio = function () {
        if (this.audio != null) {
            var n = this.exports.machine_get_sample_count();
            for (var i = 0; i < n; i++) {
                this.audio.feedSample(this.audioarr[i], 1);
            }
        }
    };
    // TODO: tick might advance 1 instruction
    BaseWASMMachine.prototype.advanceFrameClock = function (trap, cpf) {
        var i;
        if (trap) {
            for (i = 0; i < cpf; i++) {
                if (trap()) {
                    break;
                }
                this.exports.machine_tick(this.sys);
            }
        }
        else {
            this.exports.machine_exec(this.sys, cpf);
            i = cpf;
        }
        this.syncVideo();
        this.syncAudio();
        return i;
    };
    BaseWASMMachine.prototype.copyProbeData = function () {
        if (this.probe && !(this.probe instanceof devices_1.NullProbe)) {
            var datalen = this.exports.machine_get_probe_buffer_size();
            var dataaddr = this.exports.machine_get_probe_buffer_address();
            // TODO: more efficient way to put into probe
            var databuf = new Uint32Array(this.exports.memory.buffer, dataaddr, datalen);
            this.probe.logNewFrame(); // TODO: machine should do this
            this.probe.addLogBuffer(databuf);
        }
    };
    BaseWASMMachine.prototype.connectProbe = function (probe) {
        this.probe = probe;
    };
    return BaseWASMMachine;
}());
exports.BaseWASMMachine = BaseWASMMachine;
//# sourceMappingURL=baseplatform.js.map