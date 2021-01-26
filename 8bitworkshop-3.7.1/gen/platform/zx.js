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
var zx_1 = require("../machine/zx");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var ZX_PRESETS = [
    { id: 'hello.asm', name: 'Hello World (ASM)' },
    { id: 'bios.c', name: 'BIOS Routines (C)' },
    { id: 'cosmic.c', name: 'Cosmic Impalas (C)' },
];
var ZX_MEMORY_MAP = { main: [
        { name: 'BIOS', start: 0x0000, size: 0x4000, type: 'rom' },
        { name: 'Screen RAM', start: 0x4000, size: 0x1800, type: 'ram' },
        { name: 'Color RAM', start: 0x5800, size: 0x200, type: 'ram' },
        //{name:'Printer Buffer', start:0x5b00, size:0x100, type:'ram'},
        { name: 'System RAM', start: 0x5c00, size: 0xc0, type: 'ram' },
        { name: 'User RAM', start: 0x5ccb, size: 0xff58 - 0x5ccb, type: 'ram' },
    ] };
// WASM C64 platform
var ZXWASMPlatform = /** @class */ (function (_super) {
    __extends(ZXWASMPlatform, _super);
    function ZXWASMPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZXWASMPlatform.prototype.newMachine = function () { return new zx_1.ZX_WASMMachine('zx'); };
    ZXWASMPlatform.prototype.start = function () {
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
    ZXWASMPlatform.prototype.getPresets = function () { return ZX_PRESETS; };
    ZXWASMPlatform.prototype.getDefaultExtension = function () { return ".asm"; };
    ;
    ZXWASMPlatform.prototype.readAddress = function (a) { return this.machine.readConst(a); };
    ZXWASMPlatform.prototype.getMemoryMap = function () { return ZX_MEMORY_MAP; };
    ZXWASMPlatform.prototype.showHelp = function () {
        window.open("https://worldofspectrum.org/faq/reference/reference.htm", "_help");
    };
    return ZXWASMPlatform;
}(baseplatform_1.BaseZ80MachinePlatform));
emu_1.PLATFORMS['zx'] = ZXWASMPlatform;
//# sourceMappingURL=zx.js.map