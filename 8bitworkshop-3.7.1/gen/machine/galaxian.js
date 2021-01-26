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
exports.GalaxianScrambleMachine = exports.GalaxianMachine = void 0;
var ZilogZ80_1 = require("../common/cpu/ZilogZ80");
var devices_1 = require("../common/devices");
var emu_1 = require("../common/emu");
var audio_1 = require("../common/audio");
var GALAXIAN_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.A, 0, 0x10],
    [emu_1.Keys.LEFT, 0, 0x4],
    [emu_1.Keys.RIGHT, 0, 0x8],
    [emu_1.Keys.P2_A, 1, 0x10],
    [emu_1.Keys.P2_LEFT, 1, 0x4],
    [emu_1.Keys.P2_RIGHT, 1, 0x8],
    [emu_1.Keys.SELECT, 0, 0x1],
    [emu_1.Keys.START, 1, 0x1],
    [emu_1.Keys.VK_2, 1, 0x2],
]);
var SCRAMBLE_KEYCODE_MAP = emu_1.makeKeycodeMap([
    [emu_1.Keys.UP, 0, -0x1],
    [emu_1.Keys.B, 0, -0x2],
    [emu_1.Keys.VK_7, 0, -0x4],
    [emu_1.Keys.A, 0, -0x8],
    [emu_1.Keys.RIGHT, 0, -0x10],
    [emu_1.Keys.LEFT, 0, -0x20],
    [emu_1.Keys.VK_6, 0, -0x40],
    [emu_1.Keys.SELECT, 0, -0x80],
    [emu_1.Keys.START, 1, -0x80],
    [emu_1.Keys.VK_2, 1, -0x40],
    [emu_1.Keys.DOWN, 2, -0x40],
]);
var bitcolors = [
    0x000021, 0x000047, 0x000097,
    0x002100, 0x004700, 0x009700,
    0x510000, 0xae0000 // blue
];
var GalaxianVideo = function (rom, vram, oram, palette, options) {
    var gfxBase = options.gfxBase || 0x2800;
    this.missileWidth = options.missileWidth || 4;
    this.missileOffset = options.missileOffset || 0;
    this.showOffscreenObjects = false;
    this.frameCounter = 0;
    this.starsEnabled = 0;
    var stars = [];
    for (var i = 0; i < 256; i++)
        stars[i] = emu_1.noise();
    this.advanceFrame = function () {
        this.frameCounter = (this.frameCounter + 1) & 0xff;
    };
    this.drawScanline = function (pixels, sl) {
        var pixofs = sl * 264;
        // hide offscreen on left + right (b/c rotated)
        if (!this.showOffscreenObjects && (sl < 16 || sl >= 240)) {
            for (var i = 0; i < 264; i++)
                pixels[pixofs + i] = 0xff000000;
            return; // offscreen
        }
        // draw tiles
        var outi = pixofs; // starting output pixel in frame buffer
        for (var xx = 0; xx < 32; xx++) {
            var xofs = xx;
            var scroll = oram[xofs * 2]; // even entries control scroll position
            var attrib = oram[xofs * 2 + 1]; // odd entries control the color base
            var sl2 = (sl + scroll) & 0xff;
            var vramofs = (sl2 >> 3) << 5; // offset in VRAM
            var yy = sl2 & 7; // y offset within tile
            var tile = vram[vramofs + xofs]; // TODO: why undefined?
            var color0 = (attrib & 7) << 2;
            var addr = gfxBase + (tile << 3) + yy;
            var data1 = rom[addr];
            var data2 = rom[addr + 0x800];
            for (var i = 0; i < 8; i++) {
                var bm = 128 >> i;
                var color = color0 + ((data1 & bm) ? 1 : 0) + ((data2 & bm) ? 2 : 0);
                pixels[outi] = palette[color];
                outi++;
            }
        }
        // draw sprites
        for (var sprnum = 7; sprnum >= 0; sprnum--) {
            var base = (sprnum << 2) + 0x40;
            var base0 = oram[base];
            var sy = 240 - (base0 - ((sprnum < 3) ? 1 : 0)); // the first three sprites match against y-1
            var yy = (sl - sy);
            if (yy >= 0 && yy < 16) {
                var sx = oram[base + 3] + 1; // +1 pixel offset from tiles
                if (sx == 0 && !this.showOffscreenObjects) {
                    continue; // drawn off-buffer
                }
                var code = oram[base + 1];
                var flipx = code & 0x40; // TODO: flipx
                if (code & 0x80) // flipy
                    yy = 15 - yy;
                code &= 0x3f;
                var color0 = (oram[base + 2] & 7) << 2;
                var addr = gfxBase + (code << 5) + (yy < 8 ? yy : yy + 8);
                outi = pixofs + sx; //<< 1
                var data1 = rom[addr];
                var data2 = rom[addr + 0x800];
                for (var i = 0; i < 8; i++) {
                    var bm = 128 >> i;
                    var color = ((data1 & bm) ? 1 : 0) + ((data2 & bm) ? 2 : 0);
                    if (color)
                        pixels[flipx ? (outi + 15 - i) : (outi + i)] = palette[color0 + color];
                }
                var data1 = rom[addr + 8];
                var data2 = rom[addr + 0x808];
                for (var i = 0; i < 8; i++) {
                    var bm = 128 >> i;
                    var color = ((data1 & bm) ? 1 : 0) + ((data2 & bm) ? 2 : 0);
                    if (color)
                        pixels[flipx ? (outi + 7 - i) : (outi + i + 8)] = palette[color0 + color];
                }
            }
        }
        // draw bullets/shells
        var shell = 0xff;
        var missile = 0xff;
        for (var which = 0; which < 8; which++) {
            var sy = oram[0x60 + (which << 2) + 1];
            if (((sy + sl - ((which < 3) ? 1 : 0)) & 0xff) == 0xff) {
                if (which != 7)
                    shell = which;
                else
                    missile = which;
            }
        }
        for (var i = 0; i < 2; i++) {
            which = i ? missile : shell;
            if (which != 0xff) {
                var sx = 255 - oram[0x60 + (which << 2) + 3];
                var outi = pixofs + sx - this.missileOffset;
                var col = which == 7 ? 0xffffff00 : 0xffffffff;
                for (var j = 0; j < this.missileWidth; j++)
                    pixels[outi++] = col;
            }
        }
        // draw stars
        if (this.starsEnabled) {
            var starx = ((this.frameCounter + stars[sl & 0xff]) & 0xff);
            if ((starx + sl) & 0x10) {
                var outi = pixofs + starx;
                if ((pixels[outi] & 0xffffff) == 0) {
                    pixels[outi] = palette[sl & 0x1f];
                }
            }
        }
    };
};
var XTAL = 18432000.0;
var scanlinesPerFrame = 264;
var cpuFrequency = XTAL / 6; // 3.072 MHz
var hsyncFrequency = XTAL / 3 / 192 / 2; // 16 kHz
var vsyncFrequency = hsyncFrequency / 132 / 2; // 60.606060 Hz
var vblankDuration = 1 / vsyncFrequency * (20 / 132); // 2500 us
var cpuCyclesPerLine = cpuFrequency / hsyncFrequency;
var INITIAL_WATCHDOG = 8;
var audioOversample = 2;
var audioSampleRate = 60 * scanlinesPerFrame; // why not hsync?
var GalaxianMachine = /** @class */ (function (_super) {
    __extends(GalaxianMachine, _super);
    function GalaxianMachine() {
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.palBase = 0x3800;
        _this.keyMap = GALAXIAN_KEYCODE_MAP;
        _this.cpuFrequency = cpuFrequency;
        _this.canvasWidth = 264;
        _this.numTotalScanlines = 264;
        _this.numVisibleScanlines = 264;
        _this.defaultROMSize = 0x4000;
        _this.sampleRate = audioSampleRate * audioOversample;
        _this.cpuCyclesPerLine = cpuCyclesPerLine | 0;
        _this.rotate = 90;
        _this.cpu = new ZilogZ80_1.Z80();
        _this.ram = new Uint8Array(0x800);
        _this.vram = new Uint8Array(0x400);
        _this.oram = new Uint8Array(0x100);
        _this.watchdog_counter = 0;
        _this.interruptEnabled = 0;
        _this.defaultInputs = [0xe, 0x8, 0x0];
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x3fff, 0, function (a) { return _this.rom ? _this.rom[a] : null; }],
            [0x4000, 0x47ff, 0x3ff, function (a) { return _this.ram[a]; }],
            [0x5000, 0x57ff, 0x3ff, function (a) { return _this.vram[a]; }],
            [0x5800, 0x5fff, 0xff, function (a) { return _this.oram[a]; }],
            [0x6000, 0x6000, 0, function (a) { return _this.inputs[0]; }],
            [0x6800, 0x6800, 0, function (a) { return _this.inputs[1]; }],
            [0x7000, 0x7000, 0, function (a) { return _this.inputs[2]; }],
            [0x7800, 0x7800, 0, function (a) { _this.watchdog_counter = INITIAL_WATCHDOG; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x4000, 0x47ff, 0x3ff, function (a, v) { _this.ram[a] = v; }],
            [0x5000, 0x57ff, 0x3ff, function (a, v) { _this.vram[a] = v; }],
            [0x5800, 0x5fff, 0xff, function (a, v) { _this.oram[a] = v; }],
            //[0x6004, 0x6007, 0x3,    function(a,v) => { }], // lfo freq
            //[0x6800, 0x6807, 0x7,    function(a,v) => { }], // sound
            //[0x7800, 0x7800, 0x7,    function(a,v) => { }], // pitch
            //[0x6000, 0x6003, 0x3, (a, v) => { this.outlatches[a] = v; }],
            [0x7001, 0x7001, 0, function (a, v) { _this.interruptEnabled = v & 1; }],
            [0x7004, 0x7004, 0, function (a, v) { _this.gfx.starsEnabled = v & 1; }],
        ]);
        var audio = new audio_1.MasterAudio();
        _this.psg1 = new audio_1.AY38910_Audio(audio);
        _this.psg2 = new audio_1.AY38910_Audio(audio);
        _this.audioadapter = new audio_1.TssChannelAdapter([_this.psg1.psg, _this.psg2.psg], audioOversample, _this.sampleRate);
        _this.init();
        return _this;
    }
    GalaxianMachine.prototype.init = function () {
        this.rom = new Uint8Array(this.defaultROMSize);
        this.palette = new Uint32Array(new ArrayBuffer(32 * 4));
        this.gfx = new GalaxianVideo(this.rom, this.vram, this.oram, this.palette, this.options);
        this.connectCPUMemoryBus(this);
        this.connectCPUIOBus(this.newIOBus());
        this.inputs.set(this.defaultInputs);
        this.handler = emu_1.newKeyboardHandler(this.inputs, this.keyMap);
    };
    GalaxianMachine.prototype.readConst = function (a) {
        return (a < 0x7000) ? this.read(a) : null;
    };
    GalaxianMachine.prototype.newIOBus = function () {
        var _this = this;
        return {
            read: function (addr) {
                return 0;
            },
            write: function (addr, val) {
                if (addr & 0x1) {
                    _this.psg1.selectRegister(val & 0xf);
                }
                ;
                if (addr & 0x2) {
                    _this.psg1.setData(val);
                }
                ;
                if (addr & 0x4) {
                    _this.psg2.selectRegister(val & 0xf);
                }
                ;
                if (addr & 0x8) {
                    _this.psg2.setData(val);
                }
                ;
            }
        };
    };
    GalaxianMachine.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.psg1.reset();
        this.psg2.reset();
        this.watchdog_counter = INITIAL_WATCHDOG;
    };
    GalaxianMachine.prototype.startScanline = function () {
        this.audio && this.audioadapter && this.audioadapter.generate(this.audio);
    };
    GalaxianMachine.prototype.drawScanline = function () {
        this.gfx.drawScanline(this.pixels, this.scanline);
    };
    GalaxianMachine.prototype.advanceFrame = function (trap) {
        var steps = _super.prototype.advanceFrame.call(this, trap);
        // advance graphics
        this.gfx.advanceFrame();
        // clear bottom of screen?
        if (!this.gfx.showOffscreenObjects) {
            for (var i = 0; i < 264; i++)
                this.pixels.fill(0xff000000, 256 + i * 264, 264 + i * 264);
        }
        // watchdog fired?
        if (this.watchdog_counter-- <= 0) {
            throw new emu_1.EmuHalt("WATCHDOG FIRED");
        }
        // NMI interrupt @ 0x66
        if (this.interruptEnabled) {
            this.cpu.NMI();
        }
        return steps;
    };
    GalaxianMachine.prototype.loadROM = function (data) {
        this.rom.set(emu_1.padBytes(data, this.defaultROMSize));
        for (var i = 0; i < 32; i++) {
            var b = this.rom[this.palBase + i];
            this.palette[i] = 0xff000000;
            for (var j = 0; j < 8; j++)
                if (((1 << j) & b))
                    this.palette[i] += bitcolors[j];
        }
    };
    GalaxianMachine.prototype.loadState = function (state) {
        _super.prototype.loadState.call(this, state);
        this.vram.set(state.bv);
        this.oram.set(state.bo);
        this.watchdog_counter = state.wdc;
        this.interruptEnabled = state.ie;
        this.gfx.starsEnabled = state.se;
        this.gfx.frameCounter = state.fc;
    };
    GalaxianMachine.prototype.saveState = function () {
        var state = _super.prototype.saveState.call(this);
        state['bv'] = this.vram.slice(0);
        state['bo'] = this.oram.slice(0);
        state['fc'] = this.gfx.frameCounter;
        state['ie'] = this.interruptEnabled;
        state['se'] = this.gfx.starsEnabled;
        state['wdc'] = this.watchdog_counter;
        return state;
    };
    return GalaxianMachine;
}(devices_1.BasicScanlineMachine));
exports.GalaxianMachine = GalaxianMachine;
var GalaxianScrambleMachine = /** @class */ (function (_super) {
    __extends(GalaxianScrambleMachine, _super);
    function GalaxianScrambleMachine() {
        var _this = _super.call(this) || this;
        _this.defaultROMSize = 0x5020;
        _this.palBase = 0x5000;
        _this.scramble = true;
        _this.keyMap = SCRAMBLE_KEYCODE_MAP;
        _this.options = {
            gfxBase: 0x4000,
            missileWidth: 1,
            missileOffset: 6,
        };
        _this.defaultInputs = [0xff, 0xfc, 0xf1];
        _this.read = emu_1.newAddressDecoder([
            [0x0000, 0x3fff, 0, function (a) { return _this.rom[a]; }],
            [0x4000, 0x47ff, 0x7ff, function (a) { return _this.ram[a]; }],
            [0x4800, 0x4fff, 0x3ff, function (a) { return _this.vram[a]; }],
            [0x5000, 0x5fff, 0xff, function (a) { return _this.oram[a]; }],
            [0x7000, 0x7000, 0, function (a) { _this.watchdog_counter = INITIAL_WATCHDOG; }],
            [0x7800, 0x7800, 0, function (a) { _this.watchdog_counter = INITIAL_WATCHDOG; }],
            //[0x8000, 0x820f, 0,      function(a) { return noise(); }], // TODO: remove
            [0x8100, 0x8100, 0, function (a) { return _this.inputs[0]; }],
            [0x8101, 0x8101, 0, function (a) { return _this.inputs[1]; }],
            [0x8102, 0x8102, 0, function (a) { return _this.inputs[2] | _this.scramble_protection_alt_r(); }],
            [0x8202, 0x8202, 0, function (a) { return _this.m_protection_result; }],
            [0x9100, 0x9100, 0, function (a) { return _this.inputs[0]; }],
            [0x9101, 0x9101, 0, function (a) { return _this.inputs[1]; }],
            [0x9102, 0x9102, 0, function (a) { return _this.inputs[2] | _this.scramble_protection_alt_r(); }],
            [0x9212, 0x9212, 0, function (a) { return _this.m_protection_result; }],
        ]);
        _this.write = emu_1.newAddressDecoder([
            [0x4000, 0x47ff, 0x7ff, function (a, v) { _this.ram[a] = v; }],
            [0x4800, 0x4fff, 0x3ff, function (a, v) { _this.vram[a] = v; }],
            [0x5000, 0x5fff, 0xff, function (a, v) { _this.oram[a] = v; }],
            [0x6801, 0x6801, 0, function (a, v) { _this.interruptEnabled = v & 1; /*console.log(a,v,cpu.getPC().toString(16));*/ }],
            [0x6802, 0x6802, 0, function (a, v) { }],
            [0x6803, 0x6803, 0, function (a, v) { }],
            [0x6804, 0x6804, 0, function (a, v) { _this.gfx.starsEnabled = v & 1; }],
            [0x6808, 0x6808, 0, function (a, v) { _this.gfx.missileWidth = v; }],
            [0x6809, 0x6809, 0, function (a, v) { _this.gfx.missileOffset = v; }],
            [0x8202, 0x8202, 0, _this.scramble_protection_w.bind(_this)],
        ]);
        _this.m_protection_state = 0;
        _this.m_protection_result = 0;
        _this.init(); // TODO: why do we have to call twice?
        return _this;
    }
    GalaxianScrambleMachine.prototype.scramble_protection_w = function (addr, data) {
        /*
            This is not fully understood; the low 4 bits of port C are
            inputs; the upper 4 bits are outputs. Scramble main set always
            writes sequences of 3 or more nibbles to the low port and
            expects certain results in the upper nibble afterwards.
        */
        this.m_protection_state = (this.m_protection_state << 4) | (data & 0x0f);
        switch (this.m_protection_state & 0xfff) {
            /* scramble */
            case 0xf09:
                this.m_protection_result = 0xff;
                break;
            case 0xa49:
                this.m_protection_result = 0xbf;
                break;
            case 0x319:
                this.m_protection_result = 0x4f;
                break;
            case 0x5c9:
                this.m_protection_result = 0x6f;
                break;
            /* scrambls */
            case 0x246:
                this.m_protection_result ^= 0x80;
                break;
            case 0xb5f:
                this.m_protection_result = 0x6f;
                break;
        }
    };
    GalaxianScrambleMachine.prototype.scramble_protection_alt_r = function () {
        var bit = (this.m_protection_result >> 7) & 1;
        return (bit << 5) | ((bit ^ 1) << 7);
    };
    return GalaxianScrambleMachine;
}(GalaxianMachine));
exports.GalaxianScrambleMachine = GalaxianScrambleMachine;
//# sourceMappingURL=galaxian.js.map