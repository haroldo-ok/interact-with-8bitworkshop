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
var emu_1 = require("../common/emu");
var ui_1 = require("../ide/ui");
var views = require("../ide/views");
var runtime_1 = require("../common/basic/runtime");
var teletype_1 = require("../common/teletype");
var util_1 = require("../common/util");
var ui_2 = require("../ide/ui"); // TODO: make this a callback
var BASIC_PRESETS = [
    { id: 'hello.bas', name: 'Hello' },
    { id: 'tutorial.bas', name: 'Tutorial' },
    { id: 'sieve.bas', name: 'Sieve Benchmark' },
    { id: 'mortgage.bas', name: 'Interest Calculator' },
    { id: '23match.bas', name: '23 Matches' },
    { id: 'craps.bas', name: 'Craps' },
    { id: 'lander.bas', name: 'Lander' },
    { id: 'hamurabi.bas', name: 'Hammurabi' },
    { id: 'wumpus.bas', name: 'Hunt The Wumpus' },
    { id: 'startrader.bas', name: 'Star Trader' },
    { id: 'haunted.bas', name: 'Haunted House' },
];
var BASICPlatform = /** @class */ (function () {
    function BASICPlatform(mainElement) {
        this.clock = 0;
        this.hotReload = true;
        this.animcount = 0;
        this.internalFiles = {};
        //super();
        this.mainElement = mainElement;
        mainElement.style.overflowY = 'auto';
    }
    BASICPlatform.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parent, gameport, windowport, inputport, inputline;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ui_1.loadScript('./gen/common/basic/runtime.js')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ui_1.loadScript('./gen/common/teletype.js')];
                    case 2:
                        _a.sent();
                        // create runtime
                        this.runtime = new runtime_1.BASICRuntime();
                        this.runtime.reset();
                        parent = this.mainElement;
                        gameport = $('<div id="gameport" style="margin-top:calc(100vh - 8em)"/>').appendTo(parent);
                        windowport = $('<div id="windowport" class="transcript transcript-style-2"/>').appendTo(gameport);
                        inputport = $('<div id="inputport" class="transcript-bottom"/>').appendTo(gameport);
                        inputline = $('<input class="transcript-input transcript-style-2" type="text" style="max-width:95%"/>').appendTo(inputport);
                        //var printhead = $('<div id="printhead" class="transcript-print-head"/>').appendTo(parent);
                        //var printshield = $('<div id="printhead" class="transcript-print-shield"/>').appendTo(parent);
                        this.tty = new teletype_1.TeleTypeWithKeyboard(windowport[0], true, inputline[0]);
                        this.tty.keepinput = true; // input stays @ bottom
                        this.tty.splitInput = true; // split into arguments
                        this.tty.keephandler = false; // set handler each input
                        this.tty.hideinput();
                        this.tty.scrolldiv = parent;
                        this.tty.bell = new Audio('res/ttybell.mp3');
                        this.runtime.input = function (prompt, nargs) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        if (prompt != null) {
                                            _this.tty.addtext(prompt, 0);
                                            _this.tty.addtext('? ', 0);
                                            _this.tty.waitingfor = 'line';
                                        }
                                        else {
                                            _this.tty.waitingfor = 'char';
                                        }
                                        _this.tty.focusinput();
                                        _this.tty.resolveInput = resolve;
                                    })];
                            });
                        }); };
                        this.timer = new emu_1.AnimationTimer(60, this.animate.bind(this));
                        this.resize = function () {
                            _this.tty.resize(80);
                        };
                        this.resize();
                        this.runtime.print = function (s) {
                            // TODO: why null sometimes?
                            _this.animcount = 0; // exit advance loop when printing
                            _this.tty.print(s);
                            _this.transcript.push(s);
                        };
                        this.runtime.resume = this.resume.bind(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    BASICPlatform.prototype.animate = function () {
        if (this.tty.isBusy())
            return;
        var ips = this.program.opts.commandsPerSec || 1000;
        this.animcount += ips / 60;
        while (this.runtime.running && this.animcount-- > 0) {
            if (!this.advance())
                break;
        }
    };
    // should not depend on tty state
    BASICPlatform.prototype.advance = function (novideo) {
        if (this.runtime.running) {
            if (this.checkDebugTrap())
                return 0;
            var more = this.runtime.step();
            if (!more) {
                this.pause();
                if (this.runtime.exited) {
                    this.exitmsg();
                    this.didExit();
                }
            }
            this.clock++;
            return 1;
        }
        else {
            return 0;
        }
    };
    BASICPlatform.prototype.exitmsg = function () {
        this.tty.print("\n\n");
        this.tty.addtext("*** END OF PROGRAM ***", 1);
        this.tty.showPrintHead(false);
    };
    BASICPlatform.prototype.loadROM = function (title, data) {
        // TODO: disable hot reload if error
        // TODO: only hot reload when we hit a label?
        var didExit = this.runtime.exited;
        this.program = data;
        var resumePC = this.runtime.load(data);
        this.tty.uppercaseOnly = true; // this.program.opts.uppercaseOnly; //TODO?
        // map editor to uppercase-only if need be
        views.textMapFunctions.input = this.program.opts.uppercaseOnly ? function (s) { return s.toUpperCase(); } : null;
        // only reset if we exited, or couldn't restart at label (PC reset to 0)
        if (!this.hotReload || didExit || !resumePC)
            this.reset();
    };
    BASICPlatform.prototype.getROMExtension = function () {
        return ".json";
    };
    BASICPlatform.prototype.reset = function () {
        this.tty.clear();
        this.runtime.reset();
        this.clock = 0;
        this.transcript = [];
    };
    BASICPlatform.prototype.pause = function () {
        this.timer.stop();
    };
    BASICPlatform.prototype.resume = function () {
        if (this.isBlocked())
            return;
        this.animcount = 0;
        this.timer.start();
    };
    BASICPlatform.prototype.isBlocked = function () { return this.tty.waitingfor != null || this.runtime.exited; }; // is blocked for input?
    BASICPlatform.prototype.isRunning = function () { return this.timer.isRunning(); };
    BASICPlatform.prototype.getDefaultExtension = function () { return ".bas"; };
    BASICPlatform.prototype.getToolForFilename = function () { return "basic"; };
    BASICPlatform.prototype.getPresets = function () { return BASIC_PRESETS; };
    BASICPlatform.prototype.getPC = function () {
        return this.runtime.curpc;
    };
    BASICPlatform.prototype.getSP = function () {
        return 0x1000 - this.runtime.returnStack.length;
    };
    BASICPlatform.prototype.isStable = function () {
        return true;
    };
    BASICPlatform.prototype.getCPUState = function () {
        return { PC: this.getPC(), SP: this.getSP() };
    };
    BASICPlatform.prototype.saveState = function () {
        return {
            c: this.getCPUState(),
            rt: this.runtime.saveState(),
        };
    };
    BASICPlatform.prototype.loadState = function (state) {
        this.runtime.loadState(state);
    };
    BASICPlatform.prototype.getDebugTree = function () {
        return {
            CurrentLine: this.runtime.getCurrentLabel(),
            Variables: this.runtime.vars,
            Arrays: this.runtime.arrays,
            Functions: this.runtime.defs,
            ForLoops: this.runtime.forLoops,
            WhileLoops: this.runtime.whileLoops,
            ReturnStack: this.runtime.returnStack,
            NextDatum: this.runtime.datums[this.runtime.dataptr],
            Clock: this.clock,
            Options: this.runtime.opts,
            Internals: this.runtime,
        };
    };
    BASICPlatform.prototype.inspect = function (sym) {
        var o = this.runtime.vars[sym];
        if (o != null)
            return sym + " = " + o;
    };
    BASICPlatform.prototype.showHelp = function (tool, ident) {
        window.open("https://8bitworkshop.com/blog/platforms/basic/#basicreference", "_help");
    };
    BASICPlatform.prototype.getDebugCategories = function () {
        return ['Variables'];
    };
    BASICPlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'Variables': return this.varsToLongString();
        }
    };
    BASICPlatform.prototype.varsToLongString = function () {
        var s = '';
        var vars = Object.keys(this.runtime.vars);
        vars.sort();
        for (var _i = 0, vars_1 = vars; _i < vars_1.length; _i++) {
            var name = vars_1[_i];
            var value = this.runtime.vars[name];
            var valstr = JSON.stringify(value);
            if (valstr.length > 24)
                valstr = valstr.substr(0, 24) + "...(" + valstr.length + ")";
            s += util_1.lpad(name, 3) + " = " + valstr + "\n";
        }
        return s;
    };
    BASICPlatform.prototype.setupDebug = function (callback) {
        this.onBreakpointHit = callback;
    };
    BASICPlatform.prototype.clearDebug = function () {
        this.onBreakpointHit = null;
        this.debugTrap = null;
    };
    BASICPlatform.prototype.checkDebugTrap = function () {
        if (this.debugTrap && this.debugTrap()) {
            this.pause();
            this.break();
            return true;
        }
        return false;
    };
    BASICPlatform.prototype.break = function () {
        // TODO: why doesn't highlight go away on resume?
        if (this.onBreakpointHit) {
            this.onBreakpointHit(this.saveState());
        }
    };
    BASICPlatform.prototype.step = function () {
        var _this = this;
        var prevClock = this.clock;
        this.debugTrap = function () {
            return _this.clock > prevClock;
        };
        this.resume();
    };
    BASICPlatform.prototype.stepOver = function () {
        var _this = this;
        var stmt = this.runtime.getStatement();
        if (stmt && (stmt.command == 'GOSUB' || stmt.command == 'ONGOSUB')) {
            var nextPC = this.getPC() + 1;
            this.runEval(function () { return _this.getPC() == nextPC; });
        }
        else {
            this.step();
        }
    };
    BASICPlatform.prototype.runUntilReturn = function () {
        var _this = this;
        var prevSP = this.getSP();
        this.runEval(function () { return _this.getSP() > prevSP; });
    };
    BASICPlatform.prototype.runEval = function (evalfunc) {
        var _this = this;
        this.debugTrap = function () { return evalfunc(_this.getCPUState()); };
        this.resume();
    };
    BASICPlatform.prototype.restartAtPC = function (pc) {
        pc = Math.round(pc);
        if (pc >= 0 && pc < this.runtime.allstmts.length) {
            this.runtime.curpc = pc;
            this.tty.cancelinput();
            this.clock = 0;
            return true;
        }
        else {
            return false;
        }
    };
    BASICPlatform.prototype.readFile = function (path) {
        return this.internalFiles[path];
    };
    BASICPlatform.prototype.writeFile = function (path, data) {
        this.internalFiles[path] = data;
        return true;
    };
    BASICPlatform.prototype.didExit = function () {
        this.internalFiles['stdout.txt'] = this.transcript.join("");
        ui_2.haltEmulation();
    };
    return BASICPlatform;
}());
//
emu_1.PLATFORMS['basic'] = BASICPlatform;
//# sourceMappingURL=basic.js.map