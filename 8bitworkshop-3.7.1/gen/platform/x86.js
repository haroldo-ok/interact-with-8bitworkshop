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
var PC_PRESETS = [
    { id: 'hello.asm', name: 'Hello World (ASM)' },
    { id: 'mandelg.asm', name: 'Mandelbrot (ASM)' },
    { id: 'snake.c', name: 'Snake Game (C)' },
];
var FATFSArrayBufferDriver = /** @class */ (function () {
    function FATFSArrayBufferDriver(buffer) {
        this.buffer = buffer;
        this.data = new DataView(this.buffer);
        this.sectorSize = 512;
        this.numSectors = this.buffer.byteLength / this.sectorSize;
    }
    FATFSArrayBufferDriver.prototype.readSectors = function (sector, dest, cb) {
        var ofs = this.sectorSize * sector;
        for (var i = 0; i < dest.length; i++) {
            dest[i] = this.data.getUint8(i + ofs);
        }
        //console.log('read', sector, dest, cb);
        cb(null);
    };
    FATFSArrayBufferDriver.prototype.writeSectors = function (sector, data, cb) {
        var ofs = this.sectorSize * sector;
        for (var i = 0; i < data.length; i++) {
            this.data.setUint8(i + ofs, data[i]);
        }
        //console.log('write', sector, data, cb);
        cb(null);
    };
    return FATFSArrayBufferDriver;
}());
var X86PCPlatform = /** @class */ (function () {
    function X86PCPlatform(mainElement) {
        //super();
        this.mainElement = mainElement;
    }
    X86PCPlatform.prototype.getToolForFilename = function (s) {
        if (s.endsWith(".c"))
            return "smlrc";
        return "yasm";
    };
    X86PCPlatform.prototype.getDefaultExtension = function () {
        return ".asm";
    };
    X86PCPlatform.prototype.getPresets = function () {
        return PC_PRESETS;
    };
    X86PCPlatform.prototype.pause = function () {
        if (this.isRunning())
            this.emulator.stop();
    };
    X86PCPlatform.prototype.resume = function () {
        if (!this.isRunning())
            this.emulator.run();
    };
    X86PCPlatform.prototype.reset = function () {
        this.emulator.restart();
    };
    X86PCPlatform.prototype.isRunning = function () {
        return this.emulator.is_running();
    };
    X86PCPlatform.prototype.loadROM = function (title, rom) {
        var _this = this;
        this.fda_fs.writeFile('main.exe', rom, { encoding: 'binary' }, function (e) {
            if (e)
                throw e;
            else
                _this.reset();
        });
    };
    X86PCPlatform.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var div;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ui_1.loadScript('./lib/libv86.js')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ui_1.loadScript('./lib/fatfs.js')];
                    case 2:
                        _a.sent();
                        this.video = new emu_1.RasterVideo(this.mainElement, 640, 480, { overscan: false });
                        this.video.create();
                        div = document.createElement('div');
                        div.classList.add('pc-console');
                        div.classList.add('emuvideo');
                        this.mainElement.appendChild(div);
                        this.console_div = div;
                        this.resize(); // set font size
                        this.emulator = new V86Starter({
                            memory_size: 2 * 1024 * 1024,
                            vga_memory_size: 1 * 1024 * 1024,
                            screen_container: this.mainElement,
                            bios: {
                                url: "./res/seabios.bin",
                            },
                            vga_bios: {
                                url: "./res/vgabios.bin",
                            },
                            fda: {
                                url: "./res/freedos722.img",
                                size: 737280,
                            },
                            autostart: true,
                        });
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.emulator.add_listener("emulator-ready", function () {
                                    console.log("emulator ready");
                                    console.log(_this.emulator);
                                    _this.v86 = _this.emulator.v86;
                                    _this.fda_image = _this.v86.cpu.devices.fdc.fda_image;
                                    _this.fda_driver = new FATFSArrayBufferDriver(_this.fda_image.buffer);
                                    _this.fda_fs = fatfs.createFileSystem(_this.fda_driver);
                                    resolve();
                                });
                            })];
                }
            });
        });
    };
    X86PCPlatform.prototype.resize = function () {
        // set font size proportional to window width
        var charwidth = $(this.console_div).width() * 1.7 / 80;
        $(this.console_div).css('font-size', charwidth + 'px');
    };
    X86PCPlatform.prototype.getDebugTree = function () {
        return this.v86;
    };
    X86PCPlatform.prototype.readAddress = function (addr) {
        return this.v86.cpu.mem8[addr];
    };
    X86PCPlatform.prototype.getMemoryMap = function () {
        return { main: [
                { name: 'Real Mode IVT', start: 0x0, size: 0x400, type: 'ram' },
                { name: 'BIOS Data Area', start: 0x400, size: 0x100, type: 'ram' },
                { name: 'User RAM', start: 0x500, size: 0x80000 - 0x500, type: 'ram' },
                { name: 'Extended BIOS Data Area', start: 0x80000, size: 0x20000, type: 'ram' },
                { name: 'Video RAM', start: 0xa0000, size: 0x20000, type: 'ram' },
                { name: 'Video BIOS', start: 0xc0000, size: 0x8000, type: 'rom' },
                { name: 'BIOS Expansions', start: 0xc8000, size: 0x28000, type: 'rom' },
                { name: 'PC BIOS', start: 0xf0000, size: 0x10000, type: 'rom' },
            ] };
    };
    ;
    X86PCPlatform.prototype.getROMExtension = function (rom) {
        return ".exe";
    };
    return X86PCPlatform;
}());
emu_1.PLATFORMS['x86'] = X86PCPlatform;
//# sourceMappingURL=x86.js.map