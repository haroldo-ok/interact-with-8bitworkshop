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
exports.Atari7800 = void 0;
var MOS6502_1 = require("../common/cpu/MOS6502");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu");
var audio_1 = require("../common/audio");
var util_1 = require("../common/util");
var SWCHA = 0;
var SWCHB = 2;
var INPT0 = 8;
var Atari7800_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.A, INPT0 + 0, 0x80],
    [emu_1.Keys.B, INPT0 + 1, 0x80],
    [emu_1.Keys.SELECT, SWCHB, -0x02],
    [emu_1.Keys.START, SWCHB, -0x01],
    [emu_1.Keys.UP, SWCHA, -0x10],
    [emu_1.Keys.DOWN, SWCHA, -0x20],
    [emu_1.Keys.LEFT, SWCHA, -0x40],
    [emu_1.Keys.RIGHT, SWCHA, -0x80],
    [emu_1.Keys.P2_A, INPT0 + 2, 0x80],
    [emu_1.Keys.P2_B, INPT0 + 3, 0x80],
    //[Keys.P2_SELECT, 1, 2],
    //[Keys.P2_START,  1, 3],
    [emu_1.Keys.P2_UP, SWCHA, -0x01],
    [emu_1.Keys.P2_DOWN, SWCHA, -0x02],
    [emu_1.Keys.P2_LEFT, SWCHA, -0x04],
    [emu_1.Keys.P2_RIGHT, SWCHA, -0x08],
]);
// http://www.ataripreservation.org/websites/freddy.offenga/megazine/ISSUE5-PALNTSC.html
// http://7800.8bitdev.org/index.php/7800_Software_Guide#APPENDIX_4:_FRAME_TIMING
var CLK = 3579545;
var linesPerFrame = 262;
var numVisibleLines = 258 - 16;
var colorClocksPerLine = 454; // 456?
var colorClocksPreDMA = 28;
var audioOversample = 4;
var audioSampleRate = linesPerFrame * 60 * audioOversample;
// TIA chip
var TIA = /** @class */ (function () {
    function TIA() {
        this.regs = new Uint8Array(0x20);
    }
    TIA.prototype.reset = function () {
        this.regs.fill(0);
    };
    TIA.prototype.read = function (a) {
        return this.regs[a] | 0;
    };
    TIA.prototype.write = function (a, v) {
        this.regs[a] = v;
    };
    TIA.prototype.saveState = function () {
        return {
            regs: this.regs.slice(0)
        };
    };
    TIA.prototype.loadState = function (s) {
        for (var i_1 = 0; i_1 < 32; i_1++)
            this.write(i_1, s.regs[i_1]);
    };
    TIA.stateToLongString = function (state) {
        var s = "";
        s += emu_1.dumpRAM(state.regs, 0, 32);
        return s;
    };
    return TIA;
}());
// MARIA chip
var MARIA = /** @class */ (function () {
    function MARIA() {
        this.cycles = 0;
        this.regs = new Uint8Array(0x20);
        this.offset = -1;
        this.dll = 0;
        this.dlstart = 0;
        this.dli = false;
        this.h16 = false;
        this.h8 = false;
        this.pixels = new Uint8Array(320);
        this.WSYNC = 0;
    }
    MARIA.prototype.reset = function () {
        this.regs.fill(0);
        // TODO?
    };
    MARIA.prototype.read = function (a) {
        return this.regs[a] | 0;
    };
    MARIA.prototype.write = function (a, v) {
        this.regs[a] = v;
        if (a == 0x04)
            this.WSYNC++;
        //console.log(hex(a), '=', hex(v));
    };
    MARIA.prototype.saveState = function () {
        return {
            regs: this.regs.slice(0),
            offset: this.offset,
            dll: this.dll,
            dlstart: this.dlstart,
            dli: this.dli,
            h16: this.h16,
            h8: this.h8,
        };
    };
    MARIA.prototype.loadState = function (s) {
        for (var i_2 = 0; i_2 < 32; i_2++)
            this.write(i_2, s.regs[i_2] | 0);
        this.offset = s.offset | 0;
        this.dll = s.dll | 0;
        this.dlstart = s.dlstart | 0;
        this.dli = !!s.dli;
        this.h16 = !!s.h16;
        this.h8 = !!s.h8;
    };
    MARIA.prototype.isDMAEnabled = function () {
        return (this.regs[0x1c] & 0x60) == 0x40;
    };
    MARIA.prototype.getDLLStart = function () {
        return (this.regs[0x0c] << 8) + this.regs[0x10];
    };
    MARIA.prototype.getCharBaseAddress = function () {
        return (this.regs[0x14] << 8) + this.offset;
    };
    MARIA.prototype.setVBLANK = function (b) {
        if (b) {
            this.regs[0x08] |= 0x80;
            this.offset = -1;
            this.dll = this.getDLLStart();
            this.dli = this.bus && (this.bus.read(this.dll) & 0x80) != 0; // if DLI on first zone
        }
        else {
            this.regs[0x08] &= ~0x80;
        }
    };
    MARIA.prototype.readDLLEntry = function (bus) {
        // display lists must be in RAM (TODO: probe?)
        if (this.dll >= 0x4000) {
            return;
        }
        var x = bus.read(this.dll);
        this.offset = (x & 0xf);
        this.h16 = (x & 0x40) != 0;
        this.h8 = (x & 0x20) != 0;
        this.dlstart = (bus.read(this.dll + 1) << 8) + bus.read(this.dll + 2);
        //console.log(hex(this.dll,4), this.offset, hex(this.dlstart,4));
        this.dll = (this.dll + 3) & 0xffff; // TODO: can also only cross 1 page?
        this.dli = (bus.read(this.dll) & 0x80) != 0; // DLI flag is from next DLL entry
    };
    MARIA.prototype.isHoley = function (a) {
        if (a & 0x8000) {
            if (this.h16 && (a & 0x1000))
                return true;
            if (this.h8 && (a & 0x800))
                return true;
        }
        return false;
    };
    MARIA.prototype.readDMA = function (a) {
        if (this.isHoley(a))
            return 0;
        else {
            this.cycles += 3;
            return this.bus.read(a);
        }
    };
    MARIA.prototype.doDMA = function (bus) {
        this.bus = bus;
        this.cycles = 0;
        this.pixels.fill(this.regs[0x0]);
        if (this.isDMAEnabled()) {
            this.cycles += 16; // TODO: last line in zone gets additional 8 cycles
            // time for a new DLL entry?
            if (this.offset < 0) {
                this.readDLLEntry(bus);
            }
            // read the DL (only can span two pages)
            var dlhi = this.dlstart & 0xff00;
            var dlofs = this.dlstart & 0xff;
            do {
                // read DL entry
                var b0 = bus.read(dlhi + ((dlofs + 0) & 0x1ff));
                var b1 = bus.read(dlhi + ((dlofs + 1) & 0x1ff));
                if (b1 == 0)
                    break; // end of DL
                // display lists must be in RAM (TODO: probe?)
                if (dlhi >= 0x4000) {
                    break;
                }
                var b2 = bus.read(dlhi + ((dlofs + 2) & 0x1ff));
                var b3 = bus.read(dlhi + ((dlofs + 3) & 0x1ff));
                var indirect = false;
                // extended header?
                if ((b1 & 31) == 0) {
                    var pal = b3 >> 5;
                    var width = 32 - (b3 & 31);
                    var xpos = bus.read(dlhi + ((dlofs + 4) & 0x1ff));
                    var writemode = b1 & 0x80;
                    indirect = (b1 & 0x20) != 0;
                    dlofs += 5;
                    this.cycles += 10;
                }
                else {
                    // direct mode
                    var xpos = b3;
                    var pal = b1 >> 5;
                    var width = 32 - (b1 & 31);
                    var writemode = 0;
                    dlofs += 4;
                    this.cycles += 8;
                }
                var gfxadr = b0 + (((b2 + (indirect ? 0 : this.offset)) & 0xff) << 8);
                xpos *= 2;
                // copy graphics data (direct)
                var readmode = (this.regs[0x1c] & 0x3) + (writemode ? 4 : 0);
                // double bytes?
                var dbl = indirect && (this.regs[0x1c] & 0x10) != 0;
                if (dbl) {
                    width *= 2;
                }
                //if (this.offset == 0) console.log(hex(dla,4), hex(gfxadr,4), xpos, width, pal, readmode);
                for (var i = 0; i < width; i++) {
                    var data = this.readDMA(dbl ? (gfxadr + (i >> 1)) : (gfxadr + i));
                    if (indirect) {
                        var indadr = ((this.regs[0x14] + this.offset) << 8) + data;
                        if (dbl && (i & 1)) {
                            indadr++;
                            this.cycles -= 3; // indirect read has 6/9 cycles
                        }
                        data = this.readDMA(indadr);
                    }
                    // TODO: more modes (https://github.com/gstanton/ProSystem1_3/blob/master/Core/Maria.cpp)
                    switch (readmode) {
                        case 0: // 160 A/B
                            for (var j = 0; j < 4; j++) {
                                var col = (data >> 6) & 3;
                                if (col > 0) {
                                    this.pixels[xpos] = this.pixels[xpos + 1] = this.regs[(pal << 2) + col];
                                }
                                data <<= 2;
                                xpos = (xpos + 2) & 0x1ff;
                            }
                            break;
                        case 2: // 320 B/D (TODO?)
                        case 3: // 320 A/C
                            for (var j = 0; j < 8; j++) {
                                var col = (data & 128) ? 1 : 0;
                                if (col > 0) {
                                    this.pixels[xpos] = this.regs[(pal << 2) + col];
                                }
                                data <<= 1;
                                xpos = (xpos + 1) & 0x1ff;
                            }
                            break;
                    }
                }
            } while (this.cycles < colorClocksPerLine); // TODO?
            // decrement offset
            this.offset -= 1;
        }
        return this.cycles;
    };
    MARIA.prototype.doInterrupt = function () {
        if (this.dli && this.offset < 0) {
            this.dli = false;
            return true;
        }
        else
            return false;
        //return this.dli;// && this.offset == 1;
    };
    MARIA.stateToLongString = function (state) {
        var s = "";
        s += emu_1.dumpRAM(state.regs, 0, 32);
        s += "\n   DLL: $" + util_1.hex((state.regs[0x0c] << 8) + state.regs[0x10], 4) + " @ $" + util_1.hex(state.dll, 4);
        s += "\n    DL: $" + util_1.hex(state.dlstart, 4);
        s += "\nOffset:  " + state.offset;
        s += "\n   DLI?  " + state.dli;
        return s;
    };
    return MARIA;
}());
// Atari 7800
var Atari7800 = /** @class */ (function (_super) {
    __extends(Atari7800, _super);
    function Atari7800() {
        var _this = _super.call(this) || this;
        _this.cpuFrequency = 1789772;
        _this.canvasWidth = 320;
        _this.numTotalScanlines = linesPerFrame;
        _this.numVisibleScanlines = numVisibleLines;
        _this.defaultROMSize = 0xc000;
        _this.cpuCyclesPerLine = 113.5;
        _this.sampleRate = audioSampleRate;
        _this.ram = new Uint8Array(0x1000);
        _this.regs6532 = new Uint8Array(4);
        _this.tia = new TIA();
        _this.maria = new MARIA();
        _this.lastFrameCycles = 0;
        _this.xtracyc = 0;
        _this.cpu = new MOS6502_1.MOS6502();
        _this.read = emu_1.newAddressDecoder([
            [0x0008, 0x000d, 0x0f, function (a) { _this.xtracyc++; return _this.readInput(a); }],
            [0x0000, 0x001f, 0x1f, function (a) { _this.xtracyc++; return _this.tia.read(a); }],
            [0x0020, 0x003f, 0x1f, function (a) { return _this.maria.read(a); }],
            [0x0040, 0x00ff, 0xff, function (a) { return _this.ram[a + 0x800]; }],
            [0x0100, 0x013f, 0xff, function (a) { return _this.read(a); }],
            [0x0140, 0x01ff, 0x1ff, function (a) { return _this.ram[a + 0x800]; }],
            [0x0280, 0x02ff, 0x3, function (a) { _this.xtracyc++; return _this.inputs[a]; }],
            [0x1800, 0x27ff, 0xffff, function (a) { return _this.ram[a - 0x1800]; }],
            [0x2800, 0x3fff, 0x7ff, function (a) { return _this.read(a | 0x2000); }],
            [0x4000, 0xffff, 0xffff, function (a) { return _this.rom ? _this.rom[a - 0x4000] : 0; }],
            [0x0000, 0xffff, 0xffff, function (a) { return _this.probe && _this.probe.logIllegal(a); }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x0015, 0x001A, 0x1f, function (a, v) { _this.xtracyc++; _this.pokey1.setTIARegister(a, v); }],
            [0x0000, 0x001f, 0x1f, function (a, v) { _this.xtracyc++; _this.tia.write(a, v); }],
            [0x0020, 0x003f, 0x1f, function (a, v) { _this.maria.write(a, v); }],
            [0x0040, 0x00ff, 0xff, function (a, v) { _this.ram[a + 0x800] = v; }],
            [0x0100, 0x013f, 0xff, function (a, v) { _this.write(a, v); }],
            [0x0140, 0x01ff, 0x1ff, function (a, v) { _this.ram[a + 0x800] = v; }],
            [0x0280, 0x02ff, 0x3, function (a, v) { _this.xtracyc++; _this.regs6532[a] = v; /*TODO*/ }],
            [0x1800, 0x27ff, 0xffff, function (a, v) { _this.ram[a - 0x1800] = v; }],
            [0x2800, 0x3fff, 0x7ff, function (a, v) { _this.write(a | 0x2000, v); }],
            [0xbfff, 0xbfff, 0xffff, function (a, v) { }],
            [0x0000, 0xffff, 0xffff, function (a, v) { _this.probe && _this.probe.logIllegal(a); }],
        ]);
        _this.connectCPUMemoryBus(_this);
        _this.probeDMABus = _this.probeIOBus(_this);
        _this.handler = emu_1.newKeyboardHandler(_this.inputs, Atari7800_KEYCODE_MAP);
        _this.pokey1 = new audio_1.POKEYDeviceChannel();
        _this.audioadapter = new audio_1.TssChannelAdapter(_this.pokey1, audioOversample, audioSampleRate);
        return _this;
    }
    Atari7800.prototype.readConst = function (a) {
        // make sure we don't log during this
        var oldprobe = this.probe;
        this.probe = null;
        var v = this.read(a);
        this.probe = oldprobe;
        return v;
    };
    Atari7800.prototype.readInput = function (a) {
        switch (a) {
            case 0xc: return ~this.inputs[0x8] & 0x80; //INPT4
            case 0xd: return ~this.inputs[0x9] & 0x80; //INPT5
            default: return this.inputs[a] | 0;
        }
    };
    Atari7800.prototype.advanceCPU = function () {
        var clk = _super.prototype.advanceCPU.call(this);
        if (this.xtracyc) {
            clk += this.xtracyc;
            this.probe.logClocks(this.xtracyc);
            this.xtracyc = 0;
        }
        return clk;
    };
    Atari7800.prototype.advanceFrame = function (trap) {
        var idata = this.pixels;
        var iofs = 0;
        var rgb;
        var mc = 0;
        var fc = 0;
        var steps = 0;
        this.probe.logNewFrame();
        //console.log(hex(this.cpu.getPC()), hex(this.maria.dll));
        // visible lines
        for (var sl = 0; sl < linesPerFrame; sl++) {
            this.scanline = sl;
            var visible = sl < numVisibleLines;
            this.maria.setVBLANK(!visible);
            this.maria.WSYNC = 0;
            // pre-DMA clocks
            while (mc < colorClocksPreDMA) {
                if (this.maria.WSYNC)
                    break;
                if (trap && trap()) {
                    trap = null;
                    sl = 999;
                    break; // TODO?
                }
                mc += this.advanceCPU() << 2;
                steps++;
            }
            // is this scanline visible?
            if (visible) {
                // do DMA for scanline?
                var dmaClocks = this.maria.doDMA(this.probeDMABus);
                this.probe.logClocks(dmaClocks >> 2); // TODO: logDMA
                mc += dmaClocks;
                // copy line to frame buffer
                if (idata) {
                    for (var i = 0; i < 320; i++) {
                        idata[iofs++] = COLORS_RGBA[this.maria.pixels[i]];
                    }
                }
            }
            // do interrupt? (if visible or before 1st scanline)
            if ((visible || sl == linesPerFrame - 1) && this.maria.doInterrupt()) {
                this.probe.logInterrupt(0);
                this.cpu.NMI();
            }
            // post-DMA clocks
            while (mc < colorClocksPerLine) {
                if (this.maria.WSYNC) {
                    this.probe.logClocks((colorClocksPerLine - mc) >> 2);
                    mc = colorClocksPerLine;
                    break;
                }
                if (trap && trap()) {
                    trap = null;
                    sl = 999;
                    break;
                }
                mc += this.advanceCPU() << 2;
                steps++;
            }
            // audio
            this.audio && this.audioadapter.generate(this.audio);
            // update clocks, scanline
            mc -= colorClocksPerLine;
            fc += mc;
            this.probe.logNewScanline();
        }
        /*
          // TODO let bkcol = this.maria.regs[0x0];
          // TODO $(this.video.canvas).css('background-color', COLORS_WEB[bkcol]);
        */
        this.lastFrameCycles = fc;
        return steps;
    };
    Atari7800.prototype.getRasterX = function () { return this.lastFrameCycles % colorClocksPerLine; };
    Atari7800.prototype.getRasterY = function () { return Math.floor(this.lastFrameCycles / colorClocksPerLine); };
    Atari7800.prototype.loadROM = function (data) {
        if (data.length == 0xc080)
            data = data.slice(0x80); // strip header
        this.rom = emu_1.padBytes(data, this.defaultROMSize, true);
    };
    Atari7800.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.tia.reset();
        this.maria.reset();
        this.inputs.fill(0x0);
        this.inputs[SWCHA] = 0xff;
        this.inputs[SWCHB] = 1 + 2 + 8;
        //this.cpu.advanceClock(); // needed for test to pass?
    };
    Atari7800.prototype.readAddress = function (addr) {
        return this.read(addr) | 0;
    };
    Atari7800.prototype.loadState = function (state) {
        this.cpu.loadState(state.c);
        this.ram.set(state.ram);
        this.tia.loadState(state.tia);
        this.maria.loadState(state.maria);
        this.regs6532.set(state.regs6532);
        this.loadControlsState(state);
    };
    Atari7800.prototype.saveState = function () {
        return {
            c: this.cpu.saveState(),
            ram: this.ram.slice(0),
            tia: this.tia.saveState(),
            maria: this.maria.saveState(),
            regs6532: this.regs6532.slice(0),
            inputs: this.inputs.slice(0)
        };
    };
    Atari7800.prototype.loadControlsState = function (state) {
        this.inputs.set(state.inputs);
    };
    Atari7800.prototype.saveControlsState = function () {
        return {
            inputs: this.inputs.slice(0)
        };
    };
    Atari7800.prototype.getDebugCategories = function () {
        return ['CPU', 'Stack', 'TIA', 'MARIA'];
    };
    Atari7800.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'TIA': return TIA.stateToLongString(state.tia);
            case 'MARIA': return MARIA.stateToLongString(state.maria) + "\nScanline: " + this.scanline;
            //default: return super.getDebugInfo(category, state);
        }
    };
    return Atari7800;
}(devices_1.BasicMachine));
exports.Atari7800 = Atari7800;
///
var ATARI_NTSC_RGB = [
    0x000000,
    0x404040,
    0x6c6c6c,
    0x909090,
    0xb0b0b0,
    0xc8c8c8,
    0xdcdcdc,
    0xf4f4f4,
    0x004444,
    0x106464,
    0x248484,
    0x34a0a0,
    0x40b8b8,
    0x50d0d0,
    0x5ce8e8,
    0x68fcfc,
    0x002870,
    0x144484,
    0x285c98,
    0x3c78ac,
    0x4c8cbc,
    0x5ca0cc,
    0x68b4dc,
    0x78c8ec,
    0x001884,
    0x183498,
    0x3050ac,
    0x4868c0,
    0x5c80d0,
    0x7094e0,
    0x80a8ec,
    0x94bcfc,
    0x000088,
    0x20209c,
    0x3c3cb0,
    0x5858c0,
    0x7070d0,
    0x8888e0,
    0xa0a0ec,
    0xb4b4fc,
    0x5c0078,
    0x74208c,
    0x883ca0,
    0x9c58b0,
    0xb070c0,
    0xc084d0,
    0xd09cdc,
    0xe0b0ec,
    0x780048,
    0x902060,
    0xa43c78,
    0xb8588c,
    0xcc70a0,
    0xdc84b4,
    0xec9cc4,
    0xfcb0d4,
    0x840014,
    0x982030,
    0xac3c4c,
    0xc05868,
    0xd0707c,
    0xe08894,
    0xeca0a8,
    0xfcb4bc,
    0x880000,
    0x9c201c,
    0xb04038,
    0xc05c50,
    0xd07468,
    0xe08c7c,
    0xeca490,
    0xfcb8a4,
    0x7c1800,
    0x90381c,
    0xa85438,
    0xbc7050,
    0xcc8868,
    0xdc9c7c,
    0xecb490,
    0xfcc8a4,
    0x5c2c00,
    0x784c1c,
    0x906838,
    0xac8450,
    0xc09c68,
    0xd4b47c,
    0xe8cc90,
    0xfce0a4,
    0x2c3c00,
    0x485c1c,
    0x647c38,
    0x809c50,
    0x94b468,
    0xacd07c,
    0xc0e490,
    0xd4fca4,
    0x003c00,
    0x205c20,
    0x407c40,
    0x5c9c5c,
    0x74b474,
    0x8cd08c,
    0xa4e4a4,
    0xb8fcb8,
    0x003814,
    0x1c5c34,
    0x387c50,
    0x50986c,
    0x68b484,
    0x7ccc9c,
    0x90e4b4,
    0xa4fcc8,
    0x00302c,
    0x1c504c,
    0x347068,
    0x4c8c84,
    0x64a89c,
    0x78c0b4,
    0x88d4cc,
    0x9cece0,
    0x002844,
    0x184864,
    0x306884,
    0x4484a0,
    0x589cb8,
    0x6cb4d0,
    0x7ccce8,
    0x8ce0fc // FE
];
var COLORS_RGBA = new Uint32Array(256);
var COLORS_WEB = [];
for (var i = 0; i < 256; i++) {
    COLORS_RGBA[i] = ATARI_NTSC_RGB[i >> 1] | 0xff000000;
    COLORS_WEB[i] = "#" + util_1.hex(util_1.rgb2bgr(ATARI_NTSC_RGB[i >> 1]), 6);
}
//# sourceMappingURL=atari7800.js.map