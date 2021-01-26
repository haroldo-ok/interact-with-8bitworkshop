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
var c64_1 = require("../machine/c64");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var C64_PRESETS = [
    { id: 'hello.dasm', name: 'Hello World (ASM)' },
    { id: 'eliza.c', name: 'Eliza (C)' },
    { id: 'tgidemo.c', name: 'TGI Graphics Demo (C)' },
    { id: 'upandaway.c', name: 'Up, Up and Away (C)' },
    { id: 'joymove.c', name: 'Joystick Movement (C)' },
    { id: 'siegegame.c', name: 'Siege Game (C)' },
    { id: 'scroll1.c', name: 'Scrolling 1 (C)' },
    { id: 'scroll2.c', name: 'Scrolling 2 (C)' },
    { id: 'scroll3.c', name: 'Scrolling 3 (C)' },
    { id: 'scroll4.c', name: 'Scrolling 4 (C)' },
    { id: 'scroll5.c', name: 'Scrolling 5 (C)' },
    { id: 'climber.c', name: 'Climber Game (C)' },
    { id: 'multilines.c', name: 'Multicolor Lines+Flood Fill (C)' },
    { id: 'sidtune.dasm', name: 'SID Tune (ASM)' },
    { id: 'musicplayer.c', name: 'Music Player (C)' },
];
var C64_MEMORY_MAP = { main: [
        { name: '6510 Registers', start: 0x0, size: 0x2, type: 'io' },
        //{name:'RAM',          start:0x2,   size:0x7ffe,type:'ram'},
        { name: 'Cartridge ROM', start: 0x8000, size: 0x2000, type: 'rom' },
        { name: 'BASIC ROM', start: 0xa000, size: 0x2000, type: 'rom' },
        { name: 'RAM', start: 0xc000, size: 0x1000, type: 'ram' },
        { name: 'VIC-II I/O', start: 0xd000, size: 0x0400, type: 'io' },
        { name: 'SID', start: 0xd400, size: 0x0400, type: 'io' },
        { name: 'Color RAM', start: 0xd800, size: 0x0400, type: 'io' },
        { name: 'CIA 1', start: 0xdc00, size: 0x0100, type: 'io' },
        { name: 'CIA 2', start: 0xdd00, size: 0x0100, type: 'io' },
        { name: 'I/O 1', start: 0xde00, size: 0x0100, type: 'io' },
        { name: 'I/O 2', start: 0xdf00, size: 0x0100, type: 'io' },
        { name: 'KERNAL ROM', start: 0xe000, size: 0x2000, type: 'rom' },
    ] };
// WASM C64 platform
var C64WASMPlatform = /** @class */ (function (_super) {
    __extends(C64WASMPlatform, _super);
    function C64WASMPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    C64WASMPlatform.prototype.newMachine = function () { return new c64_1.C64_WASMMachine('c64'); };
    C64WASMPlatform.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // TODO: start() needs to block
                    return [4 /*yield*/, this.machine.loadWASM()];
                    case 1:
                        // TODO: start() needs to block
                        _a.sent();
                        _super.prototype.start.call(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    C64WASMPlatform.prototype.getPresets = function () { return C64_PRESETS; };
    C64WASMPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    C64WASMPlatform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    C64WASMPlatform.prototype.getMemoryMap = function () { return C64_MEMORY_MAP; };
    C64WASMPlatform.prototype.showHelp = function () {
        window.open("https://sta.c64.org/cbm64mem.html", "_help");
    };
    C64WASMPlatform.prototype.getROMExtension = function (rom) {
        /*
        if (rom && rom[0] == 0x00 && rom[1] == 0x80 && rom[2+4] == 0xc3 && rom[2+5] == 0xc2) return ".crt";
        */
        if (rom && rom[0] == 0x01 && rom[1] == 0x08)
            return ".prg";
        else
            return ".bin";
    };
    return C64WASMPlatform;
}(baseplatform_1.Base6502MachinePlatform));
emu_1.PLATFORMS['c64'] = C64WASMPlatform;
emu_1.PLATFORMS['c64.wasm'] = C64WASMPlatform;
//# sourceMappingURL=c64.js.map