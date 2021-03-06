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
var analysis_1 = require("../common/analysis");
var audio_1 = require("../common/audio");
var recorder_1 = require("../common/recorder");
var devices_1 = require("../common/devices");
var JSNES_PRESETS = [
    { id: 'hello.c', name: 'Hello World' },
    { id: 'attributes.c', name: 'Attribute Table' },
    { id: 'scroll.c', name: 'Scrolling' },
    { id: 'sprites.c', name: 'Sprites' },
    { id: 'metasprites.c', name: 'Metasprites' },
    { id: 'flicker.c', name: 'Flickering Sprites' },
    { id: 'metacursor.c', name: 'Controllers' },
    { id: 'vrambuffer.c', name: 'VRAM Buffer' },
    { id: 'statusbar.c', name: 'Split Status Bar' },
    { id: 'siegegame.c', name: 'Siege Game' },
    { id: 'tint.c', name: 'Color Emphasis' },
    { id: 'rletitle.c', name: 'Title Screen RLE' },
    { id: 'aputest.c', name: 'Sound Tester' },
    { id: 'music.c', name: 'Music Player' },
    { id: 'horizscroll.c', name: 'Offscreen Scrolling' },
    { id: 'monobitmap.c', name: 'Monochrome Bitmap' },
    { id: 'fami.c', name: 'Famitone Demo' },
    { id: 'shoot2.c', name: 'Solarian Game' },
    { id: 'climber.c', name: 'Climber Game' },
    { id: 'bankswitch.c', name: 'Bank Switching' },
    { id: 'irq.c', name: 'IRQ Scanline Counter' },
    { id: 'ex0.dasm', name: 'Initialization (ASM)' },
    { id: 'ex1.dasm', name: 'Hello World (ASM)' },
    { id: 'ex2.dasm', name: 'Scrolling Demo (ASM)' },
    { id: 'ex3.dasm', name: 'Sprite Demo (ASM)' },
    { id: 'ex4.dasm', name: 'Controller Demo (ASM)' },
    { id: 'musicdemo.dasm', name: 'Famitone Demo (ASM)' },
    { id: 'xyscroll.dasm', name: 'XY Split Scrolling (ASM)' },
    //  {id:'scrollrt.dasm', name:'Line-by-line Scrolling (ASM)'},
    { id: 'road.dasm', name: '3-D Road Demo (ASM)' },
    { id: 'chase/game.c', name: 'Shiru\'s Chase Game' },
];
/// JSNES
var JSNES_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.A, 0, 0],
    [emu_1.Keys.B, 0, 1],
    [emu_1.Keys.SELECT, 0, 2],
    [emu_1.Keys.START, 0, 3],
    [emu_1.Keys.UP, 0, 4],
    [emu_1.Keys.DOWN, 0, 5],
    [emu_1.Keys.LEFT, 0, 6],
    [emu_1.Keys.RIGHT, 0, 7],
    [emu_1.Keys.P2_A, 1, 0],
    [emu_1.Keys.P2_B, 1, 1],
    [emu_1.Keys.P2_SELECT, 1, 2],
    [emu_1.Keys.P2_START, 1, 3],
    [emu_1.Keys.P2_UP, 1, 4],
    [emu_1.Keys.P2_DOWN, 1, 5],
    [emu_1.Keys.P2_LEFT, 1, 6],
    [emu_1.Keys.P2_RIGHT, 1, 7],
]);
var JSNESPlatform = /** @class */ (function (_super) {
    __extends(JSNESPlatform, _super);
    function JSNESPlatform(mainElement) {
        var _this = _super.call(this) || this;
        _this.audioFrequency = 44030; //44100
        _this.frameindex = 0;
        _this.machine = { cpuCyclesPerLine: 114 }; // TODO: hack for width of probe scope
        _this.getToolForFilename = function (fn) {
            //if (fn.endsWith(".asm")) return "ca65"; // .asm uses ca65
            if (fn.endsWith(".nesasm"))
                return "nesasm";
            else
                return baseplatform_1.getToolForFilename_6502(fn);
        };
        // probing
        _this.nullProbe = new devices_1.NullProbe();
        _this.probe = _this.nullProbe;
        _this.getMemoryMap = function () {
            return { main: [
                    //{name:'Work RAM',start:0x0,size:0x800,type:'ram'},
                    { name: 'OAM Buffer', start: 0x200, size: 0x100, type: 'ram' },
                    { name: 'PPU Registers', start: 0x2000, last: 0x2008, size: 0x2000, type: 'io' },
                    { name: 'APU Registers', start: 0x4000, last: 0x4020, size: 0x2000, type: 'io' },
                    { name: 'Cartridge RAM', start: 0x6000, size: 0x2000, type: 'ram' },
                ] };
        };
        _this.mainElement = mainElement;
        return _this;
    }
    JSNESPlatform.prototype.getPresets = function () { return JSNES_PRESETS; };
    JSNESPlatform.prototype.start = function () {
        var _this = this;
        this.debugPCDelta = 1;
        var debugbar = $("<div>").appendTo(this.mainElement);
        this.audio = new audio_1.SampleAudio(this.audioFrequency);
        this.video = new emu_1.RasterVideo(this.mainElement, 256, 224, { overscan: true });
        this.video.create();
        // debugging view
        this.ntvideo = new emu_1.RasterVideo(this.mainElement, 512, 480, { overscan: false });
        this.ntvideo.create();
        $(this.ntvideo.canvas).hide();
        this.ntlastbuf = new Uint32Array(0x1000);
        Mousetrap.bind('ctrl+shift+alt+n', function () {
            $(_this.video.canvas).toggle();
            $(_this.ntvideo.canvas).toggle();
        });
        // toggle buttons (TODO)
        /*
        $('<button>').text("Video").appendTo(debugbar).click(() => { $(this.video.canvas).toggle() });
        $('<button>').text("Nametable").appendTo(debugbar).click(() => { $(this.ntvideo.canvas).toggle() });
        */
        var idata = this.video.getFrameData();
        this.nes = new jsnes.NES({
            onFrame: function (frameBuffer) {
                for (var i = 0; i < frameBuffer.length; i++)
                    idata[i] = frameBuffer[i] | 0xff000000;
                _this.video.updateFrame();
                _this.frameindex++;
                _this.updateDebugViews();
            },
            onAudioSample: function (left, right) {
                if (_this.frameindex < 10)
                    _this.audio.feedSample(0, 1); // avoid popping at powerup
                else
                    _this.audio.feedSample((left + right) * 0.5, 1);
            },
            onStatusUpdate: function (s) {
                console.log(s);
            },
        });
        //this.nes.ppu.showSpr0Hit = true;
        //this.nes.ppu.clipToTvSize = false;
        this.nes.stop = function () {
            _this.haltAndCatchFire("Illegal instruction");
            throw new emu_1.EmuHalt("CPU STOPPED"); //TODO: haltEmulation()
        };
        // insert debug hook
        this.nes.cpu._emulate = this.nes.cpu.emulate;
        this.nes.cpu.emulate = function () {
            _this.probe.logExecute(_this.nes.cpu.REG_PC + 1, _this.nes.cpu.REG_SP);
            var cycles = _this.nes.cpu._emulate();
            _this.evalDebugCondition();
            _this.probe.logClocks(cycles);
            return cycles > 0 ? cycles : 1;
        };
        this.timer = new emu_1.AnimationTimer(60, this.nextFrame.bind(this));
        // set keyboard map
        this.poller = emu_1.setKeyboardFromMap(this.video, [], JSNES_KEYCODE_MAP, function (o, key, code, flags) {
            if (flags & emu_1.KeyFlags.KeyDown)
                _this.nes.buttonDown(o.index + 1, o.mask); // controller, button
            else if (flags & emu_1.KeyFlags.KeyUp)
                _this.nes.buttonUp(o.index + 1, o.mask); // controller, button
        });
        //var s = ''; nes.ppu.palTable.curTable.forEach((rgb) => { s += "0x"+hex(rgb,6)+", "; }); console.log(s);
    };
    JSNESPlatform.prototype.pollControls = function () { this.poller.poll(); };
    JSNESPlatform.prototype.advance = function (novideo) {
        this.nes.frame();
        return 29780; //TODO
    };
    JSNESPlatform.prototype.updateDebugViews = function () {
        // don't update if view is hidden
        if (!$(this.ntvideo.canvas).is(":visible"))
            return;
        var a = 0;
        var attraddr = 0;
        var idata = this.ntvideo.getFrameData();
        var baseTile = this.nes.ppu.regS === 0 ? 0 : 256;
        for (var row = 0; row < 60; row++) {
            for (var col = 0; col < 64; col++) {
                a = 0x2000 + (col & 31) + ((row % 30) * 32);
                if (col >= 32)
                    a += 0x400;
                if (row >= 30)
                    a += 0x800;
                var name = this.nes.ppu.mirroredLoad(a) + baseTile;
                var t = this.nes.ppu.ptTile[name];
                attraddr = (a & 0x2c00) | 0x3c0 | (a & 0x0C00) | ((a >> 4) & 0x38) | ((a >> 2) & 0x07);
                var attr = this.nes.ppu.mirroredLoad(attraddr);
                var tag = name ^ (attr << 9) ^ 0x80000000;
                if (tag != this.ntlastbuf[a & 0xfff]) {
                    this.ntlastbuf[a & 0xfff] = tag;
                    var i = row * 64 * 8 * 8 + col * 8;
                    var j = 0;
                    var attrshift = (col & 2) + ((a & 0x40) >> 4);
                    var coloradd = ((attr >> attrshift) & 3) << 2;
                    for (var y = 0; y < 8; y++) {
                        for (var x = 0; x < 8; x++) {
                            var color = t.pix[j++];
                            if (color)
                                color += coloradd;
                            var rgb = this.nes.ppu.imgPalette[color];
                            idata[i++] = rgb | 0xff000000;
                        }
                        i += 64 * 8 - 8;
                    }
                }
            }
        }
        this.ntvideo.updateFrame();
    };
    JSNESPlatform.prototype.loadROM = function (title, data) {
        var romstr = util_1.byteArrayToString(data);
        this.nes.loadROM(romstr);
        this.frameindex = 0;
        this.installIntercepts();
    };
    JSNESPlatform.prototype.installIntercepts = function () {
        var _this = this;
        // intercept bus calls, unless we did it already
        var mmap = this.nes.mmap;
        if (!mmap.haveProxied) {
            var oldload = mmap.load.bind(mmap);
            var oldwrite = mmap.write.bind(mmap);
            var oldregLoad = mmap.regLoad.bind(mmap);
            var oldregWrite = mmap.regWrite.bind(mmap);
            var lastioaddr = -1;
            mmap.load = function (addr) {
                var val = oldload(addr);
                if (addr != lastioaddr)
                    _this.probe.logRead(addr, val);
                return val;
            };
            mmap.write = function (addr, val) {
                if (addr != lastioaddr)
                    _this.probe.logWrite(addr, val);
                oldwrite(addr, val);
            };
            // try not to read/write then IOread/IOwrite at same time
            mmap.regLoad = function (addr) {
                var val = oldregLoad(addr);
                _this.probe.logIORead(addr, val);
                lastioaddr = addr;
                return val;
            };
            mmap.regWrite = function (addr, val) {
                _this.probe.logIOWrite(addr, val);
                lastioaddr = addr;
                oldregWrite(addr, val);
            };
            mmap.haveProxied = true;
        }
        var ppu = this.nes.ppu;
        if (!ppu.haveProxied) {
            var old_endScanline = ppu.endScanline.bind(ppu);
            var old_startFrame = ppu.startFrame.bind(ppu);
            var old_writeMem = ppu.writeMem.bind(ppu);
            ppu.endScanline = function () {
                old_endScanline();
                _this.probe.logNewScanline();
            };
            ppu.startFrame = function () {
                old_startFrame();
                _this.probe.logNewFrame();
            };
            ppu.writeMem = function (a, v) {
                old_writeMem(a, v);
                _this.probe.logVRAMWrite(a, v);
            };
            ppu.haveProxied = true;
        }
    };
    JSNESPlatform.prototype.newCodeAnalyzer = function () {
        return new analysis_1.CodeAnalyzer_nes(this);
    };
    JSNESPlatform.prototype.getOriginPC = function () {
        return (this.readAddress(0xfffa) | (this.readAddress(0xfffb) << 8)) & 0xffff;
    };
    JSNESPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    JSNESPlatform.prototype.getROMExtension = function () { return ".nes"; };
    JSNESPlatform.prototype.reset = function () {
        //this.nes.cpu.reset(); // doesn't work right, crashes
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
        this.installIntercepts();
    };
    JSNESPlatform.prototype.isRunning = function () {
        return this.timer.isRunning();
    };
    JSNESPlatform.prototype.pause = function () {
        this.timer.stop();
        this.audio.stop();
    };
    JSNESPlatform.prototype.resume = function () {
        this.timer.start();
        this.audio.start();
    };
    JSNESPlatform.prototype.runToVsync = function () {
        var _this = this;
        var frame0 = this.frameindex;
        this.runEval(function (c) { return _this.frameindex > frame0; });
    };
    JSNESPlatform.prototype.getRasterScanline = function () {
        return this.nes.ppu.scanline;
    };
    JSNESPlatform.prototype.getCPUState = function () {
        var c = this.nes.cpu.toJSON();
        this.copy6502REGvars(c);
        return c;
    };
    // TODO don't need to save ROM?
    JSNESPlatform.prototype.saveState = function () {
        //var s = $.extend(true, {}, this.nes);
        var s;
        if (this.nes.mmap) {
            s = this.nes.toJSON();
        }
        else {
            console.log("no nes.mmap!");
            s = { cpu: this.nes.cpu.toJSON(), ppu: this.nes.ppu.toJSON() };
        }
        s.c = s.cpu;
        this.copy6502REGvars(s.c);
        s.b = s.cpu.mem = s.cpu.mem.slice(0);
        s.ppu.vramMem = s.ppu.vramMem.slice(0);
        s.ppu.spriteMem = s.ppu.spriteMem.slice(0);
        s.ctrl = this.saveControlsState();
        return s;
    };
    JSNESPlatform.prototype.loadState = function (state) {
        this.unfixPC(state.cpu);
        this.nes.fromJSON(state);
        this.fixPC(state.cpu);
        //this.nes.cpu.fromJSON(state.cpu);
        //this.nes.mmap.fromJSON(state.mmap);
        //this.nes.ppu.fromJSON(state.ppu);
        this.nes.cpu.mem = state.cpu.mem.slice(0);
        this.nes.ppu.vramMem = state.ppu.vramMem.slice(0);
        this.nes.ppu.spriteMem = state.ppu.spriteMem.slice(0);
        this.loadControlsState(state.ctrl);
        //$.extend(this.nes, state);
        this.installIntercepts();
    };
    JSNESPlatform.prototype.saveControlsState = function () {
        return {
            c1: this.nes.controllers[1].state.slice(0),
            c2: this.nes.controllers[2].state.slice(0),
        };
    };
    JSNESPlatform.prototype.loadControlsState = function (state) {
        this.nes.controllers[1].state = state.c1;
        this.nes.controllers[2].state = state.c2;
    };
    JSNESPlatform.prototype.readAddress = function (addr) {
        return this.nes.cpu.mem[addr];
    };
    JSNESPlatform.prototype.readVRAMAddress = function (addr) {
        return this.nes.ppu.vramMem[addr];
    };
    JSNESPlatform.prototype.copy6502REGvars = function (c) {
        c.T = 0;
        c.PC = c.REG_PC;
        this.fixPC(c);
        c.A = c.REG_ACC;
        c.X = c.REG_X;
        c.Y = c.REG_Y;
        c.SP = c.REG_SP & 0xff;
        c.Z = c.F_ZERO;
        c.N = c.F_SIGN;
        c.V = c.F_OVERFLOW;
        c.D = c.F_DECIMAL;
        c.C = c.F_CARRY;
        c.I = c.F_INTERRUPT;
        c.R = 1;
        c.o = this.readAddress(c.PC + 1);
        return c;
    };
    JSNESPlatform.prototype.getDebugCategories = function () {
        return _super.prototype.getDebugCategories.call(this).concat(['PPU', 'Mapper']);
    };
    JSNESPlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'PPU': return this.ppuStateToLongString(state.ppu, state.b);
            case 'Mapper': return this.mapperStateToLongString(state.mmap, state.b);
            default: return _super.prototype.getDebugInfo.call(this, category, state);
        }
    };
    JSNESPlatform.prototype.ppuStateToLongString = function (ppu, mem) {
        var s = '';
        var PPUFLAGS = [
            ["f_nmiOnVblank", "NMI_ON_VBLANK"],
            ["f_spVisibility", "SPRITES"],
            ["f_spClipping", "NO_CLIP_SPRITES"],
            ["f_dispType", "MONOCHROME"],
            ["f_bgVisibility", "BACKGROUND"],
            ["f_bgClipping", "NO_CLIP_BACKGROUND"],
        ];
        for (var i = 0; i < PPUFLAGS.length; i++) {
            var flag = PPUFLAGS[i];
            s += (ppu[flag[0]] ? flag[1] : "-") + " ";
            if (i == 2 || i == 5)
                s += "\n";
        }
        var status = mem[0x2002];
        s += "\n Status ";
        s += (status & 0x80) ? "VBLANK " : "- ";
        s += (status & 0x40) ? "SPRITE0HIT " : "- ";
        s += "\n";
        if (ppu.f_color)
            s += "   Tint " + ((ppu.f_color & 1) ? "RED " : "") + ((ppu.f_color & 2) ? "BLUE " : "") + ((ppu.f_color & 4) ? "GREEN " : "") + "\n";
        if (ppu.f_spVisibility) {
            s += "SprSize " + (ppu.f_spriteSize ? "8x16" : "8x8") + "\n";
            s += "SprBase $" + (ppu.f_spPatternTable ? "1000" : "0000") + "\n";
        }
        if (ppu.f_bgVisibility) {
            s += " BgBase $" + (ppu.f_bgPatternTable ? "1000" : "0000") + "\n";
            s += " NTBase $" + util_1.hex(ppu.f_nTblAddress * 0x400 + 0x2000) + "\n";
            s += "AddrInc " + (ppu.f_addrInc ? "32" : "1") + "\n";
        }
        var scrollX = ppu.regFH + ppu.regHT * 8;
        var scrollY = ppu.regFV + ppu.regVT * 8;
        s += "ScrollX $" + util_1.hex(scrollX) + " (" + ppu.regHT + " * 8 + " + ppu.regFH + " = " + scrollX + ")\n";
        s += "ScrollY $" + util_1.hex(scrollY) + " (" + ppu.regVT + " * 8 + " + ppu.regFV + " = " + scrollY + ")\n";
        s += "\n";
        s += "   Scan Y: " + ppu.scanline + "  X: " + ppu.curX + "\n";
        s += "VramCur" + (ppu.firstWrite ? " " : "?") + "$" + util_1.hex(ppu.vramAddress, 4) + "\n";
        s += "VramTmp $" + util_1.hex(ppu.vramTmpAddress, 4) + "\n";
        /*
        var PPUREGS = [
          'cntFV',
          'cntV',
          'cntH',
          'cntVT',
          'cntHT',
          'regV',
          'regH',
          'regS',
        ];
        s += "\n";
        for (var i=0; i<PPUREGS.length; i++) {
          var reg = PPUREGS[i];
          s += lpad(reg.toUpperCase(),7) + " $" + hex(ppu[reg]) + " (" + ppu[reg] + ")\n";
        }
        */
        return s;
    };
    JSNESPlatform.prototype.mapperStateToLongString = function (mmap, mem) {
        //console.log(mmap, mem);
        var s = "";
        if (this.nes.rom) {
            s += "Mapper " + this.nes.rom.mapperType + "\n";
        }
        if (mmap.irqCounter !== undefined) {
            s += "\nIRQ Counter: " + mmap.irqCounter;
            s += "\n  IRQ Latch: " + mmap.irqLatchValue;
            s += "\n IRQ Reload: " + mmap.irqReload;
            s += "\n IRQ Enable: " + mmap.irqEnable;
            s += "\n PRG Select: " + mmap.prgAddressSelect;
            s += "\n CHR Select: " + mmap.chrAddressSelect;
        }
        s += "\n";
        return s;
    };
    JSNESPlatform.prototype.startProbing = function () {
        var rec = new recorder_1.ProbeRecorder(this);
        this.connectProbe(rec);
        return rec;
    };
    JSNESPlatform.prototype.stopProbing = function () {
        this.connectProbe(null);
    };
    JSNESPlatform.prototype.connectProbe = function (probe) {
        this.probe = probe || this.nullProbe;
    };
    JSNESPlatform.prototype.showHelp = function (tool, ident) {
        window.open("https://8bitworkshop.com/blog/platforms/nes/", "_help"); // TODO
    };
    return JSNESPlatform;
}(baseplatform_1.Base6502Platform));
/// MAME support
var NESMAMEPlatform = /** @class */ (function (_super) {
    __extends(NESMAMEPlatform, _super);
    function NESMAMEPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getToolForFilename = baseplatform_1.getToolForFilename_6502;
        _this.getOpcodeMetadata = baseplatform_1.getOpcodeMetadata_6502;
        return _this;
    }
    NESMAMEPlatform.prototype.start = function () {
    };
    NESMAMEPlatform.prototype.loadROM = function (title, data) {
        if (!this.started) {
            this.startModule(this.mainElement, {
                jsfile: 'mame8bitws.js',
                //cfgfile:'nes.cfg',
                driver: 'nes',
                width: 256,
                height: 240,
                romfn: '/emulator/cart.nes',
                romdata: new Uint8Array(data),
                preInit: function (_self) {
                },
            });
        }
        else {
            // look at iNES header for PRG and CHR ROM lengths
            var prgromlen = data[4] * 0x4000;
            var chrromlen = data[5] * 0x2000;
            this.loadROMFile(data);
            this.loadRegion(":nes_slot:cart:prg_rom", data.slice(0x10, 0x10 + prgromlen));
            this.loadRegion(":nes_slot:cart:chr_rom", data.slice(0x10 + prgromlen, 0x10 + prgromlen + chrromlen));
        }
    };
    NESMAMEPlatform.prototype.getPresets = function () { return JSNES_PRESETS; };
    NESMAMEPlatform.prototype.getDefaultExtension = function () { return ".c"; };
    ;
    return NESMAMEPlatform;
}(baseplatform_1.BaseMAMEPlatform));
///
emu_1.PLATFORMS['nes'] = JSNESPlatform;
emu_1.PLATFORMS['nes-asm'] = JSNESPlatform;
emu_1.PLATFORMS['nes.mame'] = NESMAMEPlatform;
//# sourceMappingURL=nes.js.map