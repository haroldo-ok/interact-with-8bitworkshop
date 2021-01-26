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
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var util_1 = require("../common/util");
var audio_1 = require("../common/audio");
var Atari8_PRESETS = [
    { id: 'hello.dasm', name: 'Hello World (ASM)' },
    { id: 'hellopm.dasm', name: 'Hello Sprites (ASM)' },
    { id: 'helloconio.c', name: 'Text Mode (C)' },
    { id: 'siegegame.c', name: 'Siege Game (C)' },
    { id: 'hellodlist.c', name: 'Display List (C)' },
];
var Atari800_PRESETS = Atari8_PRESETS.concat([
    { id: 'sieve.bas', name: 'Benchmark (FastBasic)' },
    { id: 'pmtest.bas', name: 'Sprites Test (FastBasic)' },
    { id: 'dli.bas', name: 'DLI Test (FastBasic)' },
    { id: 'joyas.bas', name: 'Match-3 Game (FastBasic)' },
]);
var ATARI8_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.VK_SPACE, 0, 0],
    [emu_1.Keys.VK_ENTER, 0, 0],
]);
// ANTIC
// https://www.atarimax.com/jindroush.atari.org/atanttim.html
// http://www.virtualdub.org/blog/pivot/entry.php?id=243
// http://www.beipmu.com/Antic_Timings.txt
// https://user.xmission.com/~trevin/atari/antic_regs.html
// https://user.xmission.com/~trevin/atari/antic_insns.html
// http://www.atarimuseum.com/videogames/consoles/5200/conv_to_5200.html
var PF_LEFT = [999, 64, 48, 32];
var PF_RIGHT = [999, 192, 208, 224];
var DMACTL = 0;
var CHACTL = 1;
var DLISTL = 2;
var DLISTH = 3;
var HSCROL = 4;
var VSCROL = 5;
var PMBASE = 7;
var CHBASE = 9;
var WSYNC = 10;
var VCOUNT = 11;
var PENH = 12;
var PENV = 13;
var NMIEN = 14;
var NMIRES = 15;
var NMIST = 15;
var PFNONE = 0;
var PFNARROW = 1;
var PFNORMAL = 2;
var PFWIDE = 3;
var NMIST_CYCLE = 12;
var NMI_CYCLE = 24;
var WSYNC_CYCLE = 212;
var MODE_LINES = [0, 0, 7, 9, 7, 15, 7, 15, 7, 3, 3, 1, 0, 1, 0, 0];
var MODE_PERIOD = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0];
var MODE_YPERIOD = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 1, 0, 0, 0, 0];
var ANTIC = /** @class */ (function () {
    function ANTIC(readfn) {
        this.regs = new Uint8Array(0x10); // registers
        this.nmiPending = false;
        // a la minute
        this.mode = 0; // current mode
        this.period = 0; // current mode period bitmask
        this.scanaddr = 0; // Scan Address (via LMS)
        this.startaddr = 0; // Start of line Address
        this.pfbyte = 0; // playfield byte fetched
        this.ch = 0; // char read
        this.linesleft = 0; // # of lines left in mode
        this.yofs = 0; // yofs fine
        this.v = 0; // vertical scanline #
        this.h = 0; // horizontal color clock
        this.read = readfn; // bus read function
    }
    ANTIC.prototype.reset = function () {
        this.regs[NMIEN] = 0x00;
        this.regs[NMIST] = 0x1f;
        this.setReg(DMACTL, 0x0);
    };
    ANTIC.prototype.saveState = function () {
        return {
            regs: this.regs.slice(0),
            mode: this.mode,
            period: this.period,
            scanaddr: this.scanaddr,
            startaddr: this.startaddr,
            pfbyte: this.pfbyte,
            ch: this.ch,
            linesleft: this.linesleft,
            yofs: this.yofs,
            v: this.v,
            h: this.h,
        };
    };
    ANTIC.prototype.loadState = function (s) {
        for (var i_1 = 0; i_1 < 16; i_1++)
            if (i_1 != NMIRES)
                this.setReg(i_1, s.regs[i_1]);
        this.mode = s.mode;
        this.period = s.period;
        this.scanaddr = s.scanaddr;
        this.startaddr = s.startaddr;
        this.pfbyte = s.pfbyte;
        this.ch = s.ch;
        this.linesleft = s.linesleft;
        this.yofs = s.yofs;
        this.v = s.v;
        this.h = s.h;
    };
    ANTIC.stateToLongString = function (state) {
        var s = "";
        s += "H: " + util_1.lpad(state.h, 3) + " V: " + util_1.lpad(state.v, 3) + " Linesleft: " + state.linesleft + "\n";
        s += "Mode: " + util_1.hex(state.mode, 2) + " Period: " + (state.period + 1) + "\n";
        s += "Addr: " + util_1.hex(state.scanaddr, 4) + "\n";
        s += emu_1.dumpRAM(state.regs, 0, 16).replace('$00', 'Regs');
        return s;
    };
    ANTIC.prototype.setReg = function (a, v) {
        this.regs[a] = v;
        switch (a) {
            case DMACTL:
                this.pfwidth = this.regs[DMACTL] & 3;
                this.setLeftRight();
                break;
            case NMIRES:
                this.regs[NMIST] = 0x1f;
                break;
        }
    };
    ANTIC.prototype.setLeftRight = function () {
        var offset = 4 << MODE_PERIOD[this.mode & 0xf];
        this.left = PF_LEFT[this.pfwidth];
        this.right = PF_RIGHT[this.pfwidth];
    };
    ANTIC.prototype.readReg = function (a) {
        switch (a) {
            case NMIST: return this.regs[NMIST];
            default: return 0;
        }
    };
    ANTIC.prototype.startline1 = function () {
        var stolen = 0;
        if (this.linesleft) {
            this.linesleft--;
            if ((this.linesleft & MODE_YPERIOD[this.mode & 0xf]) == 0) // use Y period
                this.yofs++;
        }
        if (!this.linesleft) {
            if (this.mode & 0x80) {
                this.triggerInterrupt(0x80); // Display List Interrupt (DLI)
            }
            this.mode = this.nextInsn();
            this.setLeftRight();
            stolen++;
            if ((this.mode & 0xf) == 0) { // N Blank Lines
                this.linesleft = (this.mode >> 4) + 1;
            }
            else {
                this.linesleft = MODE_LINES[this.mode & 0xf];
                this.period = (1 << MODE_PERIOD[this.mode & 0xf]) - 1;
                // TODO: this is actually at cclock 9-10
                if ((this.mode & ~0x40) == 0x01) { // JMP insn
                    var lo = this.nextInsn();
                    var hi = this.nextInsn();
                    this.regs[DLISTL] = lo;
                    this.regs[DLISTH] = hi;
                    // JVB (Jump and wait for Vertical Blank)
                    if (this.mode & 0x40) {
                        this.mode = 0;
                        this.linesleft = 240 - this.v;
                    }
                    stolen += 2;
                }
                else if ((this.mode & 0x40) && (this.mode & 0xf)) { // Load Memory Scan bit
                    var lo = this.nextInsn();
                    var hi = this.nextInsn();
                    this.scanaddr = lo + (hi << 8);
                    //console.log('scanaddr', hex(this.scanaddr));
                    stolen += 2;
                }
                this.startaddr = this.scanaddr;
                this.yofs = 0;
            }
        }
        else {
            if ((this.mode & 0xf) < 8) // character mode?
                this.scanaddr = this.startaddr; // reset line addr
        }
        return stolen;
    };
    ANTIC.prototype.startline2 = function () {
        return 0; // TODO
    };
    ANTIC.prototype.startline3 = function () {
        return 0; // TODO
    };
    ANTIC.prototype.startline4 = function () {
        var stolen = 0;
        return stolen;
    };
    ANTIC.prototype.triggerInterrupt = function (mask) {
        if (this.regs[NMIEN] & mask) {
            this.nmiPending = true;
            this.regs[NMIST] |= mask;
        }
    };
    ANTIC.prototype.nextInsn = function () {
        var pc = this.regs[DLISTL] + (this.regs[DLISTH] << 8);
        var b = this.read(pc);
        //console.log('nextInsn', hex(pc), hex(b), this.v);
        pc = ((pc + 1) & 0x3ff) | (pc & ~0x3ff);
        this.regs[DLISTL] = pc & 0xff;
        this.regs[DLISTH] = pc >> 8;
        return b;
    };
    ANTIC.prototype.nextScreen = function () {
        var b = this.read(this.scanaddr);
        this.scanaddr = ((this.scanaddr + 1) & 0xfff) | (this.scanaddr & ~0xfff);
        return b;
    };
    ANTIC.prototype.clockPulse4 = function () {
        var nc = 4; // number of cycles not stolen by DMA
        var h = this.h;
        // in overscan region?
        if (this.v >= 240) {
            // interrupts on last scanline of frame
            if (this.v == 240) {
                if (h == NMIST_CYCLE)
                    this.regs[NMIST] = 0x5f;
                else if (h == NMI_CYCLE)
                    this.triggerInterrupt(0x40);
            }
        }
        // DMA enabled?
        else if (this.regs[DMACTL] & 0x20) {
            // read line data?
            switch (h) {
                case 0:
                    nc -= this.startline1();
                    break;
                case 4:
                    nc -= this.startline2();
                    break;
                case 8:
                    nc -= this.startline3();
                    break;
                case 12:
                    nc -= this.startline4();
                    break;
                default:
                    var mode = this.mode & 0xf;
                    if (h >= 48 && h < 120)
                        nc--; // steal 1 clock for memory refresh
                    if (h >= this.left && h < this.right && mode >= 2) { // fetch screen byte?
                        if (((h >> 2) & this.period) == 0) { // use period interval
                            if (mode < 8) { // character mode
                                var ch = this.ch = this.nextScreen();
                                var addrofs = this.yofs;
                                var chbase = this.regs[CHBASE];
                                // modes 6 & 7
                                if ((mode & 0xe) == 6) { // or 7
                                    ch &= 0x3f;
                                    chbase &= 0xfe;
                                }
                                else {
                                    ch &= 0x7f;
                                    chbase &= 0xfc;
                                }
                                var addr = (ch << 3) + (chbase << 8);
                                // modes 2 & 3
                                if ((mode & 0xe) == 2) { // or 3
                                    var chactl = this.regs[CHACTL];
                                    if (mode == 3 && ch >= 0x60) {
                                        // TODO
                                    }
                                    if (chactl & 4)
                                        this.pfbyte = this.read(addr + (addrofs ^ 7)); // mirror
                                    else
                                        this.pfbyte = this.read(addr + addrofs);
                                    if (this.ch & 0x80) {
                                        if (chactl & 1)
                                            this.pfbyte = 0x0; // blank
                                        if (chactl & 2)
                                            this.pfbyte ^= 0xff; // invert
                                    }
                                }
                                else {
                                    this.pfbyte = this.read(addr + addrofs);
                                }
                                nc -= 2;
                            }
                            else { // map mode
                                this.pfbyte = this.nextScreen();
                                nc -= 1;
                            }
                        }
                    }
                    break;
            }
        }
        // next scanline?
        this.h += 4;
        if (this.h >= 228) {
            this.h = 0;
            this.v++;
            if (this.v >= 262) {
                this.v = 0;
            }
        }
        return nc;
    };
    return ANTIC;
}());
// GTIA
// https://user.xmission.com/~trevin/atari/gtia_regs.html
// write regs
var HPOSP0 = 0x0;
var HPOSM0 = 0x4;
var SIZEP0 = 0x8;
var SIZEM = 0x0c;
var GRAFP0 = 0x0d;
var GRAFM = 0x11;
var COLPM0 = 0x12;
var COLPF0 = 0x16;
var COLPF1 = 0x17;
var COLPF2 = 0x18;
var COLPF3 = 0x19;
var COLBK = 0x1a;
var PRIOR = 0x1b;
var VDELAY = 0x1c;
var GRACTL = 0x1d;
var HITCLR = 0x1e;
var CONSPK = 0x1f;
// read regs
var M0PF = 0x0;
var P0PF = 0x4;
var M0PL = 0x8;
var P0PL = 0xc;
var TRIG0 = 0x10;
var CONSOL = 0x1f;
var GTIA = /** @class */ (function () {
    function GTIA(antic) {
        this.regs = new Uint8Array(0x20);
        this.count = 0;
        this.antic = antic;
    }
    GTIA.prototype.saveState = function () {
        return {
            regs: this.regs.slice(0),
            count: this.count,
        };
    };
    GTIA.prototype.loadState = function (s) {
        for (var i_2 = 0; i_2 < 32; i_2++)
            this.setReg(i_2, s.regs[i_2]);
        this.count = s.count;
    };
    GTIA.prototype.setReg = function (a, v) {
        this.regs[a] = v;
        switch (a) {
        }
    };
    GTIA.prototype.clockPulse = function () {
        var pixel = (this.antic.pfbyte & 128) ? 1 : 0;
        var col = 0;
        switch (this.antic.mode & 0xf) {
            // blank line
            case 0:
            case 1:
                col = this.regs[COLBK];
                break;
            // normal text mode
            case 2:
            case 3:
            default:
                if (pixel)
                    col = (this.regs[COLPF1] & 0xf) | (this.regs[COLPF2] & 0xf0);
                else
                    col = this.regs[COLPF2];
                if ((this.count & this.antic.period) == 0)
                    this.antic.pfbyte <<= 1;
                break;
            // 4bpp mode	
            case 4:
            case 5:
                col = (this.antic.pfbyte >> 6) & 3;
                if ((this.antic.ch & 0x80) && col == 3)
                    col = 4; // 5th color
                col = col ? this.regs[COLPF0 - 1 + col] : this.regs[COLBK];
                if ((this.count & 1) == 0)
                    this.antic.pfbyte <<= 2;
                break;
            // 4 colors per 64 chars mode
            case 6:
            case 7:
                if (pixel)
                    col = this.regs[COLPF0 + (this.antic.ch >> 6)];
                else
                    col = this.regs[COLBK];
                if ((this.count & this.antic.period) == 0)
                    this.antic.pfbyte <<= 1;
                break;
        }
        this.count = (this.count + 1) & 0xff;
        return COLORS_RGBA[col];
    };
    GTIA.stateToLongString = function (state) {
        var s = "";
        s += emu_1.dumpRAM(state.regs, 0, 32);
        return s;
    };
    return GTIA;
}());
var _Atari8Platform = function (mainElement) {
    // http://www.ataripreservation.org/websites/freddy.offenga/megazine/ISSUE5-PALNTSC.html
    var cpuFrequency = 1789773;
    var linesPerFrame = 262;
    var colorClocksPerLine = 228;
    // TODO: for 400/800/5200
    var romLength = 0x8000;
    var cpu;
    var ram;
    var rom;
    var bios;
    var bus;
    var video, audio;
    var timer; // TODO : AnimationTimer;
    var antic;
    var gtia;
    var inputs = new Uint8Array(4);
    var Atari8Platform = /** @class */ (function (_super) {
        __extends(Atari8Platform, _super);
        function Atari8Platform() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Atari8Platform.prototype.getPresets = function () {
            return Atari8_PRESETS;
        };
        Atari8Platform.prototype.start = function () {
            var _this = this;
            cpu = new jt.M6502();
            ram = new emu_1.RAM(0x4000); // TODO
            bios = new util_1.lzgmini().decode(util_1.stringToByteArray(atob(ALTIRRA_SUPERKERNEL_LZG)));
            bus = {
                // TODO: https://github.com/dmlloyd/atari800/blob/master/DOC/cart.txt
                // TODO: http://atariage.com/forums/topic/169971-5200-memory-map/
                read: emu_1.newAddressDecoder([
                    [0x0000, 0x3fff, 0x3fff, function (a) { return ram.mem[a]; }],
                    [0x4000, 0xbfff, 0xffff, function (a) { return rom ? rom[a - 0x4000] : 0; }],
                    [0xd400, 0xd4ff, 0xf, function (a) { return antic.readReg(a); }],
                    [0xf800, 0xffff, 0x7ff, function (a) { return bios[a]; }],
                ]),
                write: emu_1.newAddressDecoder([
                    [0x0000, 0x3fff, 0xffff, function (a, v) { ram.mem[a] = v; }],
                    [0xc000, 0xcfff, 0x1f, function (a, v) { gtia.regs[a] = v; }],
                    [0xd400, 0xd4ff, 0xf, function (a, v) { antic.setReg(a, v); }],
                    [0xe800, 0xefff, 0xf, function (a, v) { audio.pokey1.setRegister(a, v); }],
                ]),
            };
            cpu.connectBus(bus);
            // create support chips
            antic = new ANTIC(bus.read);
            gtia = new GTIA(antic);
            // create video/audio
            video = new emu_1.RasterVideo(mainElement, 352, 192);
            audio = audio_1.newPOKEYAudio(1);
            video.create();
            emu_1.setKeyboardFromMap(video, inputs, ATARI8_KEYCODE_MAP, function (o, key, code, flags) {
                // TODO
            });
            timer = new emu_1.AnimationTimer(60, this.nextFrame.bind(this));
            // setup mouse events
            var rasterPosBreakFn = function (e) {
                if (e.ctrlKey) {
                    var clickpos = emu_1.getMousePos(e.target, e);
                    _this.runEval(function (c) {
                        var pos = { x: antic.h, y: _this.getRasterScanline() };
                        return (pos.x == (clickpos.x & ~3)) && (pos.y == (clickpos.y | 0));
                    });
                }
            };
            var jacanvas = $("#emulator").find("canvas");
            jacanvas.mousedown(rasterPosBreakFn);
        };
        Atari8Platform.prototype.advance = function (novideo) {
            var idata = video.getFrameData();
            var iofs = 0;
            var debugCond = this.getDebugCallback();
            var rgb;
            var freeClocks = 0;
            var totalClocks = 0;
            // load controls
            // TODO
            gtia.regs[0x10] = inputs[0] ^ 1;
            // visible lines
            for (var sl = 0; sl < linesPerFrame; sl++) {
                for (var i = 0; i < colorClocksPerLine; i += 4) {
                    // 2 color clocks per CPU cycle = 4 color clocks
                    freeClocks += antic.clockPulse4();
                    // interrupt?
                    if (antic.nmiPending) {
                        freeClocks -= cpu.setNMIAndWait(); // steal clocks b/c of interrupt (could be negative)
                        antic.nmiPending = false;
                    }
                    // iterate CPU with free clocks
                    while (freeClocks > 0) {
                        freeClocks--;
                        if (debugCond && debugCond()) {
                            debugCond = null;
                            i = 999;
                            sl = 999;
                            break;
                        }
                        cpu.clockPulse();
                        totalClocks++;
                    }
                    // 4 ANTIC pulses = 8 pixels
                    if (antic.v >= 24 && antic.h >= 44 && antic.h < 44 + 176) { // TODO: const
                        for (var j = 0; j < 8; j++) {
                            rgb = gtia.clockPulse();
                            idata[iofs++] = rgb;
                        }
                    }
                }
            }
            // update video frame
            if (!novideo) {
                video.updateFrame();
                // set background/border color
                var bkcol = gtia.regs[COLBK];
                $(video.canvas).css('background-color', COLORS_WEB[bkcol]);
            }
            return totalClocks;
        };
        Atari8Platform.prototype.loadROM = function (title, data) {
            rom = emu_1.padBytes(data, romLength);
            this.reset();
        };
        Atari8Platform.prototype.loadBIOS = function (title, data) {
            bios = emu_1.padBytes(data, 0x800);
            this.reset();
        };
        Atari8Platform.prototype.isRunning = function () {
            return timer.isRunning();
        };
        Atari8Platform.prototype.pause = function () {
            timer.stop();
            audio.stop();
        };
        Atari8Platform.prototype.resume = function () {
            timer.start();
            audio.start();
        };
        Atari8Platform.prototype.reset = function () {
            cpu.reset();
            // execute until out of BIOS
            for (var i = 0; i < 20000; i++) {
                cpu.clockPulse();
                if (this.getCPUState().PC < 0xf000)
                    break;
            }
        };
        Atari8Platform.prototype.readAddress = function (addr) {
            return ((addr & 0xf000) != 0xd000) ? bus.read(addr) : null; // ignore I/O space
        };
        Atari8Platform.prototype.loadState = function (state) {
            this.unfixPC(state.c);
            cpu.loadState(state.c);
            this.fixPC(state.c);
            ram.mem.set(state.b);
            antic.loadState(state.antic);
            gtia.loadState(state.gtia);
            this.loadControlsState(state);
        };
        Atari8Platform.prototype.saveState = function () {
            return {
                c: this.getCPUState(),
                b: ram.mem.slice(0),
                antic: antic.saveState(),
                gtia: gtia.saveState(),
                in: inputs.slice(0)
            };
        };
        Atari8Platform.prototype.loadControlsState = function (state) {
            inputs.set(state.in);
        };
        Atari8Platform.prototype.saveControlsState = function () {
            return {
                in: inputs.slice(0)
            };
        };
        Atari8Platform.prototype.getCPUState = function () {
            return this.fixPC(cpu.saveState());
        };
        Atari8Platform.prototype.getRasterScanline = function () {
            return antic.v;
        };
        Atari8Platform.prototype.getDebugCategories = function () {
            return _super.prototype.getDebugCategories.call(this).concat(['ANTIC', 'GTIA']);
        };
        Atari8Platform.prototype.getDebugInfo = function (category, state) {
            switch (category) {
                case 'ANTIC': return ANTIC.stateToLongString(state.antic);
                case 'GTIA': return GTIA.stateToLongString(state.gtia);
                default: return _super.prototype.getDebugInfo.call(this, category, state);
            }
        };
        return Atari8Platform;
    }(baseplatform_1.Base6502Platform));
    return new Atari8Platform(); // return inner class from constructor
};
// Atari 800
var _Atari800Platform = function (mainElement) {
    this.__proto__ = new _Atari8Platform(mainElement);
};
// Atari 5200
var _Atari5200Platform = function (mainElement) {
    this.__proto__ = new _Atari8Platform(mainElement);
};
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
///
/// MAME support
var Atari8MAMEPlatform = /** @class */ (function (_super) {
    __extends(Atari8MAMEPlatform, _super);
    function Atari8MAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getToolForFilename = function (fn) {
            if (fn.endsWith(".bas") || fn.endsWith(".fb") || fn.endsWith(".fbi"))
                return "fastbasic";
            else
                return baseplatform_1.getToolForFilename_6502(fn);
        };
        _this.getOpcodeMetadata = baseplatform_1.getOpcodeMetadata_6502;
        return _this;
    }
    Atari8MAMEPlatform.prototype.getPresets = function () { return Atari8_PRESETS; };
    Atari8MAMEPlatform.prototype.getDefaultExtension = function () { return ".asm"; };
    ;
    Atari8MAMEPlatform.prototype.showHelp = function (tool, ident) {
        if (tool == 'fastbasic')
            window.open("https://github.com/dmsc/fastbasic/blob/master/manual.md", "_help");
        else
            window.open("https://atariwiki.org/wiki/Wiki.jsp?page=Assembler", "_help"); // TODO
    };
    return Atari8MAMEPlatform;
}(baseplatform_1.BaseMAMEPlatform));
var Atari800MAMEPlatform = /** @class */ (function (_super) {
    __extends(Atari800MAMEPlatform, _super);
    function Atari800MAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'RAM', start: 0x0, size: 0x10000, type: 'ram' },
                    { name: 'Left Cartridge ROM', start: 0xa000, size: 0x2000, type: 'rom' },
                    { name: 'GTIA', start: 0xd000, size: 0x20, type: 'io' },
                    { name: 'POKEY', start: 0xd200, size: 0x10, type: 'io' },
                    { name: 'PIA', start: 0xd300, size: 0x04, type: 'io' },
                    { name: 'ANTIC', start: 0xd400, size: 0x10, type: 'io' },
                    { name: 'Cartridge Control Line', start: 0xd600, size: 0x100, type: 'io' },
                    { name: 'ROM', start: 0xd800, size: 0x800, type: 'rom' },
                    { name: 'ATARI Character Set', start: 0xe000, size: 0x400, type: 'rom' },
                    { name: 'ROM', start: 0xe400, size: 0x1c00, type: 'rom' },
                ] };
        };
        return _this;
    }
    Atari800MAMEPlatform.prototype.getPresets = function () { return Atari800_PRESETS; };
    Atari800MAMEPlatform.prototype.loadROM = function (title, data) {
        if (!this.started) {
            this.startModule(this.mainElement, {
                jsfile: 'mame8bitws.js',
                biosfile: 'a800xl.zip',
                cfgfile: 'a800xl.cfg',
                driver: 'a800xl',
                width: 336 * 2,
                height: 225 * 2,
                romfn: '/emulator/cart.rom',
                romdata: new Uint8Array(data),
                romsize: 0x2000,
                preInit: function (_self) {
                },
            });
        }
        else {
            this.loadROMFile(data);
            this.loadRegion(":cartleft:cart:rom", data);
        }
    };
    Atari800MAMEPlatform.prototype.start = function () {
    };
    return Atari800MAMEPlatform;
}(Atari8MAMEPlatform));
var Atari5200MAMEPlatform = /** @class */ (function (_super) {
    __extends(Atari5200MAMEPlatform, _super);
    function Atari5200MAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'RAM', start: 0x0, size: 0x4000, type: 'ram' },
                    { name: 'Cartridge ROM', start: 0x4000, size: 0x8000, type: 'rom' },
                    { name: 'GTIA', start: 0xc000, size: 0x20, type: 'io' },
                    { name: 'ANTIC', start: 0xd400, size: 0x10, type: 'io' },
                    { name: 'POKEY', start: 0xe800, size: 0x10, type: 'io' },
                    { name: 'ATARI Character Set', start: 0xf800, size: 0x400, type: 'rom' },
                    { name: 'ROM', start: 0xfc00, size: 0x400, type: 'rom' },
                ] };
        };
        return _this;
    }
    Atari5200MAMEPlatform.prototype.loadROM = function (title, data) {
        if (!this.started) {
            this.startModule(this.mainElement, {
                jsfile: 'mame8bitws.js',
                biosfile: 'a5200/5200.rom',
                cfgfile: 'a5200.cfg',
                driver: 'a5200',
                width: 336 * 2,
                height: 225 * 2,
                romfn: '/emulator/cart.rom',
                romdata: new Uint8Array(data),
                romsize: 0x8000,
                preInit: function (_self) {
                },
            });
        }
        else {
            this.loadROMFile(data);
            this.loadRegion(":cartleft:cart:rom", data);
        }
    };
    Atari5200MAMEPlatform.prototype.start = function () {
    };
    return Atari5200MAMEPlatform;
}(Atari8MAMEPlatform));
///
// Altirra Superkernel ROM (http://www.virtualdub.org/altirra.html) compiled with MADS
var ALTIRRA_SUPERKERNEL_LZG = "\nTFpHAAAIAAAABJGU01hQARcZHSUAACUFGCUBABgAAGZmZh2IZv9mJUEAGD5gPAZ8HVBsGDBmRgAcNhw4\nb2Y7HagdoA4cGBgcDgAAcDgYGDhwHSA8/zwdehgYfhkFGh1EMCWhfhkGYx0IAAAGDBgwYEAAADxmbnZm\nPB0MHTgYHRs8Zh0RJeF+DBgMHVAMHDxsfgwdCGB8Bh1IPGB8ZiXifh15MB1oPB2IPGY+Bgw4GQRVGQNx\nJeMwHV4YDAYZBHclQWAdBhgwYBkEYBkC6Dxmbm5gPh0nHT9+ZgAAfGZ8ZmZ8HVBgYBkCUHhsZmZseBkD\neGBgHXwl4h04PmBgbmYdMB1uGSIrfhkiOR0YBiUBHXAdLR0zAAAdJR2wY3d/a2NjHRB2fn5uHRA8HS4d\nYBkCZhkCSB1IbDYdyB1wPGA8BgYdGBkDUBkkkGZmfiXkPB0IY2Nrf3cZAkhmPB0zJeMdoH4ZAtcdIB4d\nbx4AAEAZAuoGAAB4HUh4AAAIHDYdLiUF/wAANn9/PhwIGSLHHx8lgQMlBR0D+PgZRA/4+Bkk5CXjAwcO\nHDhw4MDA4HA4HA4HAwEDBw8fP3//HRgADyUBgMDg8Pj8/v8dRB1M8CUBJeL/HZolBh3GHZQcHHd3CBwd\nRxkDeBkGFR0D//8diDx+fn48GQUu///AJQUdhxkjEx0gGQVEJQIZA8AdCHhgeGB+GQL4GDwZIjoZA0l+\nGSIwGDB+MBlDFwx+DCXjPH4dkAA8Bj4ZIshgGUJYfB1IYGBgPBkiyD5mHVAAPGZ+HUgOGD4ZBJ8dTwZ8\nHehmAAAYADgYGB1oGSP6PB0QbBkj+B0OHZAAZn9/axkich1nHRAZI+kdUBkm+RkDSAYdSBlDWAAZY3EA\nABliPxgOHXglARkCgBkl+ABja38+Nh1IPBgZY2kdVwwZQqEZZDgZAtAYPBljzyUCAH54fG5mBgAIGDh4\nOBgIABAYHB4cGBAAbAACSKkgLA7o0A1FAI0O6KUlgmwQAjAPqYAZCQkMAnAPqUAZCQkIAmodLfAZCi0S\nAmokAPASGQ5EFAKpARkODBYCKhkOCxgZEAsaAopIur0BASkQ0ANsDgJoqmhA////aKgdQUiKSJhI5gLQ\nCOYBpQQwAuYEpQPQ5aUFjQLUpQaNA9SlB40A1KAAJAQQAqQBogiYVQidEsDKEPeiB70A6JURyhD4jQvo\nbAQC////GQJBrQnoSikPqr0T/WwKAv8LAAoOCQgHDQYFBAwDAgEsD9SND9QQA2wGAmwCAnjYov+arf2/\nyf/QA2z+v6IAqQCVAJ0AwJ0A1J0A6OjQ8qn4jQnUogu9lf6dAAIZAmtPvc39nQAQHUMTvei/nVAdQ6kQ\nhQypD4UNqQCFDiVhDyVhEKkEjRvAogq9wh0nIB1cIoUHqcCNDtQdFQWpIIUGqQKND+ipwIUZIhapeMUC\n0Pxs/r9wcHBCABCCB0HC/SFsdGlycmEAFRIQEAAyLy0AK2VybmVsGWpyJQMub3cAcGxheWluZxoZDxUZ\na58lHiUcJQkD/Lj8svyh/gL9svxI5gzQBBkiJhkj9SUfJR8lHiUBI/0x/QD8";
///
emu_1.PLATFORMS['atari8-800'] = _Atari800Platform;
emu_1.PLATFORMS['atari8-5200'] = _Atari5200Platform;
emu_1.PLATFORMS['atari8-800xl.mame'] = Atari800MAMEPlatform;
emu_1.PLATFORMS['atari8-5200.mame'] = Atari5200MAMEPlatform;
//# sourceMappingURL=atari8.js.map