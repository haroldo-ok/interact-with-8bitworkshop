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
var disasm6502_1 = require("../common/cpu/disasm6502");
var recorder_1 = require("../common/recorder");
var devices_1 = require("../common/devices");
var VCS_PRESETS = [
    { id: 'examples/hello.a', chapter: 4, name: 'Hello 6502 and TIA' },
    { id: 'examples/vsync.a', chapter: 5, name: 'Painting on the CRT', title: 'Color Bars' },
    { id: 'examples/playfield.a', chapter: 6, name: 'Playfield Graphics' },
    { id: 'examples/sprite.a', chapter: 7, name: 'Players and Sprites' },
    { id: 'examples/colorsprites.a', chapter: 8, name: 'Color Sprites' },
    { id: 'examples/timing2.a', chapter: 9, name: 'Fine Positioning', title: 'Fine Position' },
    { id: 'examples/missiles.a', chapter: 10, name: 'Player/Missile Graphics', title: 'Player/Missile' },
    { id: 'examples/sethorizpos.a', chapter: 11, name: 'SetHorizPos Routine' },
    { id: 'examples/piatimer.a', chapter: 12, name: 'PIA Timer' },
    { id: 'examples/controls.a', chapter: 13, name: 'Joysticks' },
    { id: 'examples/complexscene.a', chapter: 15, name: 'Complex Scene I' },
    { id: 'examples/complexscene2.a', chapter: 16, name: 'Complex Scene II' },
    { id: 'examples/scoreboard.a', chapter: 18, name: 'Scoreboard' },
    { id: 'examples/collisions.a', chapter: 19, name: 'Collisions' },
    { id: 'examples/bitmap.a', chapter: 20, name: 'Async Playfield: Bitmap', title: 'Async PF Bitmap' },
    { id: 'examples/brickgame.a', chapter: 21, name: 'Async Playfield: Bricks', title: 'Async PF Bricks' },
    //  {id:'examples/multisprite1.a', chapter:8, name:'Sprite Kernel'},
    { id: 'examples/bigsprite.a', chapter: 22, name: 'A Big 48-Pixel Sprite', title: '48-Pixel Sprite' },
    { id: 'examples/tinyfonts2.a', chapter: 23, name: 'Tiny Text' },
    { id: 'examples/score6.a', chapter: 24, name: '6-Digit Score' },
    { id: 'examples/retrigger.a', chapter: 26, name: 'Sprite Formations' },
    //  {id:'examples/tinyfonts.a', chapter:23, name:'Tiny Fonts, Slow'},
    { id: 'examples/multisprite3.a', chapter: 28, name: 'Multisprites' },
    { id: 'examples/procgen1.a', chapter: 30, name: 'Procedural Generation' },
    { id: 'examples/lines.a', chapter: 31, name: 'Drawing Lines' },
    //  {id:'examples/piatable.a', name:'Timer Table'},
    { id: 'examples/musicplayer.a', chapter: 32, name: 'Music Player' },
    { id: 'examples/road.a', chapter: 33, name: 'Pseudo 3D Road' },
    { id: 'examples/bankswitching.a', chapter: 35, name: 'Bankswitching' },
    { id: 'examples/wavetable.a', chapter: 36, name: 'Wavetable Sound' },
    { id: 'examples/fracpitch.a', name: 'Fractional Pitch' },
    { id: 'examples/pal.a', name: 'PAL Video Output' },
    //  {id:'examples/testlibrary.a', name:'VCS Library Demo'},
    //  {id:'examples/music2.a', name:'Pitch-Accurate Music'},
    //  {id:'examples/fullgame.a', name:'Thru Hike: The Game', title:'Thru Hike'},
    { id: 'bb/helloworld.bas', name: 'Hello World (batariBASIC)' },
    { id: 'bb/draw.bas', name: 'Playfield Draw (batariBASIC)' },
    { id: 'bb/sample.bas', name: 'Sprite Test (batariBASIC)' },
    { id: 'bb/FIFA1977.bas', name: '2P Soccer Game (batariBASIC)' },
    { id: 'bb/duck_chase.bas', name: 'Duck Chase (batariBASIC)' },
];
Javatari.AUTO_START = false;
Javatari.SHOW_ERRORS = false;
Javatari.CARTRIDGE_CHANGE_DISABLED = true;
Javatari.DEBUG_SCANLINE_OVERFLOW = false; // TODO: make a switch
Javatari.AUDIO_BUFFER_SIZE = 256;
var VCSPlatform = /** @class */ (function (_super) {
    __extends(VCSPlatform, _super);
    function VCSPlatform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // TODO: super hack for ProbeBitmap view
        _this.machine = {
            cpuCyclesPerLine: 76 // NTSC
        };
        _this.getMemoryMap = function () {
            return { main: [
                    { name: 'TIA Registers', start: 0x00, size: 0x80, type: 'io' },
                    { name: 'PIA RAM', start: 0x80, size: 0x80, type: 'ram' },
                    { name: 'PIA Ports and Timer', start: 0x280, size: 0x18, type: 'io' },
                    { name: 'Cartridge ROM', start: 0xf000, size: 0x1000, type: 'rom' },
                ] };
        };
        // probing
        _this.nullProbe = new devices_1.NullProbe();
        _this.probe = _this.nullProbe;
        return _this;
    }
    VCSPlatform.prototype.getPresets = function () { return VCS_PRESETS; };
    VCSPlatform.prototype.start = function () {
        var _this = this;
        var self = this;
        $("#javatari-div").show();
        Javatari.start();
        var console = Javatari.room.console;
        // intercept clockPulse function
        console.oldClockPulse = console.clockPulse;
        console.clockPulse = function () {
            self.updateRecorder();
            self.probe.logNewFrame();
            this.oldClockPulse();
        };
        // intercept TIA end of line
        var videoSignal = console.tia.getVideoOutput();
        videoSignal.oldNextLine = videoSignal.nextLine;
        videoSignal.nextLine = function (pixels, vsync) {
            self.probe.logNewScanline();
            return this.oldNextLine(pixels, vsync);
        };
        // setup mouse events
        var rasterPosBreakFn = function (e) {
            if (e.ctrlKey) {
                console.resetDebug();
                var vcanvas = $(e.target);
                var x = e.pageX - vcanvas.offset().left;
                var y = e.pageY - vcanvas.offset().top;
                var new_x = Math.floor(x * 152 / vcanvas.width());
                var new_y = Math.floor((y - 37) * (210 + 37) / vcanvas.height());
                _this.runEval(function (c) {
                    var pos = _this.getRasterPosition();
                    return (pos.x >= new_x) && (pos.y >= new_y);
                });
            }
        };
        var jacanvas = $("#javatari-screen").find("canvas");
        jacanvas.mousedown(rasterPosBreakFn);
        this.resize();
    };
    VCSPlatform.prototype.loadROM = function (title, data) {
        if (data.length == 0 || ((data.length & 0x3ff) != 0))
            throw Error("Invalid ROM length: " + data.length);
        // TODO: parse Log messages from Javatari?
        var wasrunning = this.isRunning();
        Javatari.loadROM(title, data);
        if (!this.isRunning())
            throw Error("Could not load ROM");
        if (!wasrunning)
            this.pause();
    };
    VCSPlatform.prototype.getOpcodeMetadata = function (opcode, offset) {
        return Javatari.getOpcodeMetadata(opcode, offset);
    };
    VCSPlatform.prototype.getRasterPosition = function () {
        var clkfs = Javatari.room.console.getClocksFromFrameStart() - 1;
        var row = Math.floor(clkfs / 76);
        var col = clkfs - row * 76;
        var xpos = col * 3 - 68;
        var ypos = row - 39;
        return { x: xpos, y: ypos };
    };
    VCSPlatform.prototype.getRasterScanline = function () {
        return this.getRasterPosition().y;
    };
    // TODO: Clock changes this on event, so it may not be current
    VCSPlatform.prototype.isRunning = function () {
        //console.log(Javatari.room.console.isRunning(), Javatari.room.console.isPowerOn);
        return Javatari.room && Javatari.room.console.isRunning();
    };
    VCSPlatform.prototype.pause = function () {
        Javatari.room.console.pause();
        Javatari.room.speaker.mute();
    };
    VCSPlatform.prototype.resume = function () {
        Javatari.room.console.go();
        // for browser autostart
        Javatari.room.speaker.powerOff();
        Javatari.room.speaker.powerOn();
    };
    VCSPlatform.prototype.advance = function () {
        Javatari.room.console.clockPulse();
        return 0; //TODO
    };
    // for unit test
    VCSPlatform.prototype.nextFrame = function () {
        Javatari.room.console.clockPulse();
    };
    VCSPlatform.prototype.step = function () { Javatari.room.console.debugSingleStepCPUClock(); };
    VCSPlatform.prototype.stepBack = function () { Javatari.room.console.debugStepBackInstruction(); };
    VCSPlatform.prototype.runEval = function (evalfunc) { Javatari.room.console.debugEval(evalfunc); };
    VCSPlatform.prototype.setupDebug = function (callback) {
        var _this = this;
        Javatari.room.console.onBreakpointHit = function (state) {
            state.c.PC = (state.c.PC - 1) & 0xffff;
            _this.fixState(state);
            Javatari.room.console.pause();
            Javatari.room.speaker.mute();
            _this.lastBreakState = state;
            callback(state);
        };
        Javatari.room.speaker.mute();
    };
    VCSPlatform.prototype.isDebugging = function () {
        // TODO: always true
        return Javatari.room.console.onBreakpointHit != null;
    };
    VCSPlatform.prototype.clearDebug = function () {
        this.lastBreakState = null;
        Javatari.room.console.disableDebug();
        Javatari.room.console.onBreakpointHit = null;
        if (this.isRunning())
            Javatari.room.speaker.play();
    };
    VCSPlatform.prototype.reset = function () {
        Javatari.room.console.powerOff();
        Javatari.room.console.resetDebug();
        Javatari.room.console.powerOn();
        Javatari.room.speaker.play();
    };
    VCSPlatform.prototype.getOriginPC = function () {
        return (this.readAddress(0xfffc) | (this.readAddress(0xfffd) << 8)) & 0xffff;
    };
    VCSPlatform.prototype.newCodeAnalyzer = function () {
        return new analysis_1.CodeAnalyzer_vcs(this);
    };
    VCSPlatform.prototype.saveState = function () {
        var state = Javatari.room.console.saveState();
        this.fixState(state);
        return state;
    };
    VCSPlatform.prototype.fixState = function (state) {
        var ofs = (state.ca && state.ca.bo) || 0;
        if (state.ca && state.ca.fo && (state.c.PC & 0xfff) >= 2048)
            ofs = state.ca.fo; // 3E/3F fixed-slice formats
        // TODO: for batari BASIC
        state.c.EPC = state.c.PC + ofs; // EPC = effective PC for ROM
    };
    VCSPlatform.prototype.loadState = function (state) {
        return Javatari.room.console.loadState(state);
    };
    VCSPlatform.prototype.getCPUState = function () {
        return Javatari.room.console.saveState().c;
    };
    VCSPlatform.prototype.saveControlsState = function () {
        return Javatari.room.console.saveControlsState();
    };
    VCSPlatform.prototype.loadControlsState = function (state) {
        Javatari.room.console.loadControlsState(state);
    };
    VCSPlatform.prototype.readAddress = function (addr) {
        // TODO: shouldn't have to do this when debugging
        if (this.lastBreakState && addr >= 0x80 && addr < 0x100)
            return this.getRAMForState(this.lastBreakState)[addr & 0x7f];
        else if ((addr & 0x1280) === 0x280)
            return 0; // don't read PIA
        else
            return Javatari.room.console.readAddress(addr);
    };
    VCSPlatform.prototype.writeAddress = function (addr, value) {
        Javatari.room.console.writeAddress(addr, value);
    };
    VCSPlatform.prototype.runUntilReturn = function () {
        var depth = 1;
        this.runEval(function (c) {
            if (depth <= 0 && c.T == 0)
                return true;
            if (c.o == 0x20)
                depth++;
            else if (c.o == 0x60 || c.o == 0x40)
                --depth;
            return false;
        });
    };
    VCSPlatform.prototype.runToVsync = function () {
        this.advance();
        this.runEval(function (c) { return true; });
    };
    VCSPlatform.prototype.cpuStateToLongString = function (c) {
        return baseplatform_1.cpuStateToLongString_6502(c);
    };
    VCSPlatform.prototype.getRAMForState = function (state) {
        return jt.Util.byteStringToUInt8Array(atob(state.r.b));
    };
    VCSPlatform.prototype.ramStateToLongString = function (state) {
        var ram = this.getRAMForState(state);
        return "\n" + emu_1.dumpRAM(ram, 0x80, 0x80);
    };
    VCSPlatform.prototype.getToolForFilename = function (fn) {
        if (fn.endsWith(".bb") || fn.endsWith(".bas"))
            return "bataribasic";
        return "dasm";
    };
    VCSPlatform.prototype.getDefaultExtension = function () { return ".a"; };
    VCSPlatform.prototype.getROMExtension = function () { return ".a26"; };
    VCSPlatform.prototype.getDebugCategories = function () {
        return ['CPU', 'Stack', 'PIA', 'TIA'];
    };
    VCSPlatform.prototype.getDebugInfo = function (category, state) {
        switch (category) {
            case 'CPU': return this.cpuStateToLongString(state.c) + this.bankSwitchStateToString(state);
            case 'Stack': return baseplatform_1.dumpStackToString(this, this.getRAMForState(state), 0x100, 0x1ff, 0x100 + state.c.SP, 0x20);
            case 'PIA': return this.ramStateToLongString(state) + "\n" + this.piaStateToLongString(state.p);
            case 'TIA': return this.tiaStateToLongString(state.t);
        }
    };
    VCSPlatform.prototype.bankSwitchStateToString = function (state) {
        return (state.ca.bo !== undefined ? ("BankOffset " + util_1.hex(state.ca.bo, 4) + "\n") : "");
    };
    VCSPlatform.prototype.piaStateToLongString = function (p) {
        return "Timer  " + p.t + "/" + p.c + "\nINTIM  $" + util_1.hex(p.IT, 2) + " (" + p.IT + ")\nINSTAT $" + util_1.hex(p.IS, 2) + "\n";
    };
    VCSPlatform.prototype.tiaStateToLongString = function (t) {
        var pos = this.getRasterPosition();
        var s = '';
        s += "H" + util_1.lpad(pos.x.toString(), 5) + "  V" + util_1.lpad(pos.y.toString(), 5) + "   ";
        s += (t.vs ? "VSYNC " : "- ") + (t.vb ? "VBLANK " : "- ") + "\n";
        s += "\n";
        s += "Playfield " + t.f + "\n";
        s += "          " + (t.fr ? "REFLECT " : "- ") + (t.fs ? "SCOREMODE " : "- ") + (t.ft ? "PRIORITY " : "- ") + "\n";
        for (var j = 0; j < 2; j++) {
            var i = "p" + j;
            s += "Player" + j + util_1.lpad(util_1.tobin(t[i]), 11) + util_1.lpad(util_1.tobin(t[i + 'd']), 11) + "\n";
        }
        s += "\n";
        // TODO? s += "    Color {color:0x" + hex(t.fc)  + "} {color:0x" + hex(t.fb) + "}\n";
        s += "          Count Scan Speed\n";
        for (var j = 0; j < 2; j++) {
            var i = "p" + j;
            s += "Player" + j + util_1.lpad(t[i + 'co'], 8) + util_1.lpad(nonegstr(t[i + 'sc']), 5) + util_1.lpad(t[i + 'ss'], 6);
            s += " " + (t[i + 'rr'] ? "RESET" : "") + " " + (t[i + 'v'] ? "DELAY" : "") + " " + (t[i + 'cc'] ? "CLOSECOPY" : "") + " " + (t[i + 'mc'] ? "MEDCOPY" : "") + " " + (t[i + 'wc'] ? "WIDECOPY" : "") + " " + (t[i + 'r'] ? "REFLECT" : "") + "\n";
        }
        for (var j = 0; j < 2; j++) {
            var i = "m" + j;
            s += "Missile" + j + util_1.lpad(t[i + 'co'], 7) + util_1.lpad(nonegstr(t[i + 'sc']), 5) + util_1.lpad(t[i + 'ss'], 6);
            s += " " + (t[i + 'rr'] ? "RESET" : "") + " " + (t[i + 'r'] ? "RESET2PLAYER" : "") + "\n";
        }
        s += "Ball" + util_1.lpad(t['bco'], 11) + util_1.lpad(nonegstr(t['bsc']), 5) + util_1.lpad(t['bss'], 6) + "\n";
        return s;
    };
    VCSPlatform.prototype.disassemble = function (pc, read) {
        return disasm6502_1.disassemble6502(pc, read(pc), read(pc + 1), read(pc + 2));
    };
    VCSPlatform.prototype.showHelp = function (tool, ident) {
        if (tool == 'bataribasic')
            window.open("help/bataribasic/manual.html", "_help");
        else
            window.open("https://8bitworkshop.com/blog/platforms/vcs/", "_help"); // TODO
    };
    VCSPlatform.prototype.startProbing = function () {
        var self = this;
        var rec = new recorder_1.ProbeRecorder(this);
        this.connectProbe(rec);
        var probe = this.probe;
        // intercept CPU clock pulse
        var cpu = Javatari.room.console.cpu;
        if (cpu.oldCPUClockPulse == null) {
            cpu.oldCPUClockPulse = cpu.clockPulse;
            cpu.clockPulse = function () {
                if (cpu.isPCStable())
                    probe.logExecute(cpu.getPC(), cpu.getSP());
                this.oldCPUClockPulse();
                probe.logClocks(1);
            };
        }
        // intercept bus read/write
        var bus = Javatari.room.console.bus;
        if (bus.oldRead == null) {
            bus.oldRead = bus.read;
            bus.read = function (a) {
                var v = this.oldRead(a);
                probe.logRead(a, v);
                return v;
            };
            bus.oldWrite = bus.write;
            bus.write = function (a, v) {
                this.oldWrite(a, v);
                probe.logWrite(a, v);
            };
        }
        return rec;
    };
    VCSPlatform.prototype.stopProbing = function () {
        this.connectProbe(null);
        var cpu = Javatari.room.console.cpu;
        if (cpu.oldCPUClockPulse != null) {
            cpu.clockPulse = cpu.oldCPUClockPulse;
            cpu.oldCPUClockPulse = null;
        }
        var bus = Javatari.room.console.bus;
        if (bus.oldRead) {
            bus.read = bus.oldRead;
            bus.oldRead = null;
        }
        if (bus.oldWrite) {
            bus.write = bus.oldWrite;
            bus.oldWrite = null;
        }
    };
    VCSPlatform.prototype.connectProbe = function (probe) {
        this.probe = probe || this.nullProbe;
    };
    // resizing
    VCSPlatform.prototype.resize = function () {
        var scale = Math.min(1, ($('#emulator').width() - 24) / 640);
        var xt = (1 - scale) * 50;
        $('#javatari-div').css('transform', "translateX(-" + xt + "%) translateY(-" + xt + "%) scale(" + scale + ")");
    };
    return VCSPlatform;
}(baseplatform_1.BasePlatform));
;
// TODO: mixin for Base6502Platform?
function nonegstr(n) {
    return n < 0 ? "-" : n.toString();
}
///////////////
var VCSMAMEPlatform = /** @class */ (function (_super) {
    __extends(VCSMAMEPlatform, _super);
    function VCSMAMEPlatform() {
        //  MCFG_SCREEN_RAW_PARAMS( MASTER_CLOCK_NTSC, 228, 26, 26 + 160 + 16, 262, 24 , 24 + 192 + 31 )
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.start = function () {
            this.startModule(this.mainElement, {
                jsfile: 'mame8bitws.js',
                driver: 'a2600',
                width: 176 * 2,
                height: 223,
                romfn: '/emulator/cart.rom',
                romsize: 0x1000,
            });
        };
        _this.loadROM = function (title, data) {
            this.loadROMFile(data);
            this.loadRegion(":cartslot:cart:rom", data);
        };
        _this.getPresets = function () { return VCS_PRESETS; };
        _this.getToolForFilename = function (fn) {
            return "dasm";
        };
        _this.getDefaultExtension = function () { return ".a"; };
        _this.getOriginPC = function () {
            return (this.readAddress(0xfffc) | (this.readAddress(0xfffd) << 8)) & 0xffff;
        };
        return _this;
    }
    return VCSMAMEPlatform;
}(baseplatform_1.BaseMAMEPlatform));
////////////////
emu_1.PLATFORMS['vcs'] = VCSPlatform;
emu_1.PLATFORMS['vcs.mame'] = VCSMAMEPlatform;
//# sourceMappingURL=vcs.js.map