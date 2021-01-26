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
exports.getMousePos = exports.Toolbar = exports.newAddressDecoder = exports.AddressDecoder = exports.padBytes = exports.ControllerPoller = exports.makeKeycodeMap = exports.setKeyboardFromMap = exports.newKeyboardHandler = exports.Keys = exports.dumpRAM = exports.AnimationTimer = exports.EmuHalt = exports.RAM = exports.VectorVideo = exports.RasterVideo = exports._setKeyboardEvents = exports.KeyFlags = exports.setNoiseSeed = exports.getNoiseSeed = exports.noise = exports.PLATFORMS = void 0;
var util_1 = require("./util");
// Emulator classes
exports.PLATFORMS = {};
var _random_state = 1;
function noise() {
    var x = _random_state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (_random_state = x) & 0xff;
}
exports.noise = noise;
function getNoiseSeed() {
    return _random_state;
}
exports.getNoiseSeed = getNoiseSeed;
function setNoiseSeed(x) {
    _random_state = x;
}
exports.setNoiseSeed = setNoiseSeed;
function __createCanvas(mainElement, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.classList.add("emuvideo");
    canvas.tabIndex = -1; // Make it focusable
    mainElement.appendChild(canvas);
    return canvas;
}
var KeyFlags;
(function (KeyFlags) {
    KeyFlags[KeyFlags["KeyDown"] = 1] = "KeyDown";
    KeyFlags[KeyFlags["Shift"] = 2] = "Shift";
    KeyFlags[KeyFlags["Ctrl"] = 4] = "Ctrl";
    KeyFlags[KeyFlags["Alt"] = 8] = "Alt";
    KeyFlags[KeyFlags["Meta"] = 16] = "Meta";
    KeyFlags[KeyFlags["KeyUp"] = 64] = "KeyUp";
    KeyFlags[KeyFlags["KeyPress"] = 128] = "KeyPress";
})(KeyFlags = exports.KeyFlags || (exports.KeyFlags = {}));
function _setKeyboardEvents(canvas, callback) {
    canvas.onkeydown = function (e) {
        callback(e.which, 0, KeyFlags.KeyDown | _metakeyflags(e));
        if (e.which == 8 || e.which == 9 || e.which == 27) { // eat backspace, tab, escape keys
            e.preventDefault();
        }
    };
    canvas.onkeyup = function (e) {
        callback(e.which, 0, KeyFlags.KeyUp | _metakeyflags(e));
    };
    canvas.onkeypress = function (e) {
        callback(e.which, e.charCode, KeyFlags.KeyPress | _metakeyflags(e));
    };
}
exports._setKeyboardEvents = _setKeyboardEvents;
;
var RasterVideo = /** @class */ (function () {
    function RasterVideo(mainElement, width, height, options) {
        this.paddle_x = 255;
        this.paddle_y = 255;
        this.mainElement = mainElement;
        this.width = width;
        this.height = height;
        this.options = options;
    }
    RasterVideo.prototype.setRotate = function (rotate) {
        var canvas = this.canvas;
        if (rotate) {
            // TODO: aspect ratio?
            canvas.style.transform = "rotate(" + rotate + "deg)";
            if (canvas.width < canvas.height)
                canvas.style.paddingLeft = canvas.style.paddingRight = "10%";
        }
        else {
            canvas.style.transform = null;
            canvas.style.paddingLeft = canvas.style.paddingRight = null;
        }
    };
    RasterVideo.prototype.create = function () {
        var canvas;
        this.canvas = canvas = __createCanvas(this.mainElement, this.width, this.height);
        this.vcanvas = $(canvas);
        if (this.options && this.options.rotate) {
            this.setRotate(this.options.rotate);
        }
        if (this.options && this.options.overscan) {
            this.vcanvas.css('padding', '0px');
        }
        this.ctx = canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.datau32 = new Uint32Array(this.imageData.data.buffer);
    };
    RasterVideo.prototype.setKeyboardEvents = function (callback) {
        _setKeyboardEvents(this.canvas, callback);
    };
    RasterVideo.prototype.getFrameData = function () { return this.datau32; };
    RasterVideo.prototype.getContext = function () { return this.ctx; };
    RasterVideo.prototype.updateFrame = function (sx, sy, dx, dy, w, h) {
        if (w && h)
            this.ctx.putImageData(this.imageData, sx, sy, dx, dy, w, h);
        else
            this.ctx.putImageData(this.imageData, 0, 0);
    };
    RasterVideo.prototype.clearRect = function (dx, dy, w, h) {
        var ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(dx, dy, w, h);
    };
    RasterVideo.prototype.setupMouseEvents = function (el) {
        var _this = this;
        if (!el)
            el = this.canvas;
        $(el).mousemove(function (e) {
            var pos = getMousePos(el, e);
            var new_x = Math.floor(pos.x * 255 / _this.canvas.width);
            var new_y = Math.floor(pos.y * 255 / _this.canvas.height);
            _this.paddle_x = util_1.clamp(0, 255, new_x);
            _this.paddle_y = util_1.clamp(0, 255, new_y);
        });
    };
    ;
    return RasterVideo;
}());
exports.RasterVideo = RasterVideo;
var VectorVideo = /** @class */ (function (_super) {
    __extends(VectorVideo, _super);
    function VectorVideo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.persistenceAlpha = 0.5;
        _this.jitter = 1.0;
        _this.gamma = 0.8;
        _this.COLORS = [
            '#111111',
            '#1111ff',
            '#11ff11',
            '#11ffff',
            '#ff1111',
            '#ff11ff',
            '#ffff11',
            '#ffffff'
        ];
        return _this;
    }
    VectorVideo.prototype.create = function () {
        _super.prototype.create.call(this);
        this.sx = this.width / 1024.0;
        this.sy = this.height / 1024.0;
    };
    VectorVideo.prototype.clear = function () {
        var ctx = this.ctx;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = this.persistenceAlpha;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'lighter';
    };
    VectorVideo.prototype.drawLine = function (x1, y1, x2, y2, intensity, color) {
        var ctx = this.ctx;
        var sx = this.sx;
        var sy = this.sy;
        //console.log(x1,y1,x2,y2,intensity,color);
        if (intensity > 0) {
            // TODO: landscape vs portrait
            var alpha = Math.pow(intensity / 255.0, this.gamma);
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 3;
            ctx.beginPath();
            // TODO: bright dots
            var jx = this.jitter * (Math.random() - 0.5);
            var jy = this.jitter * (Math.random() - 0.5);
            x1 += jx;
            x2 += jx;
            y1 += jy;
            y2 += jy;
            ctx.moveTo(x1 * sx, this.height - y1 * sy);
            if (x1 == x2 && y1 == y2)
                ctx.lineTo(x2 * sx + 1, this.height - y2 * sy);
            else
                ctx.lineTo(x2 * sx, this.height - y2 * sy);
            ctx.strokeStyle = this.COLORS[color & 7];
            ctx.stroke();
        }
    };
    return VectorVideo;
}(RasterVideo));
exports.VectorVideo = VectorVideo;
var RAM = /** @class */ (function () {
    function RAM(size) {
        this.mem = new Uint8Array(new ArrayBuffer(size));
    }
    return RAM;
}());
exports.RAM = RAM;
var EmuHalt = /** @class */ (function (_super) {
    __extends(EmuHalt, _super);
    function EmuHalt(msg, loc) {
        var _this = _super.call(this, msg) || this;
        _this.$loc = loc;
        Object.setPrototypeOf(_this, EmuHalt.prototype);
        return _this;
    }
    return EmuHalt;
}(Error));
exports.EmuHalt = EmuHalt;
var AnimationTimer = /** @class */ (function () {
    function AnimationTimer(frequencyHz, callback) {
        this.running = false;
        this.pulsing = false;
        this.lastts = 0;
        this.useReqAnimFrame = false; //TODO window.requestAnimationFrame ? (frequencyHz>40) : false;
        this.frameRate = frequencyHz;
        this.intervalMsec = 1000.0 / frequencyHz;
        this.callback = callback;
    }
    AnimationTimer.prototype.scheduleFrame = function (msec) {
        var _this = this;
        var fn = function () {
            try {
                _this.nextFrame();
            }
            catch (e) {
                _this.running = false;
                _this.pulsing = false;
                throw e;
            }
        };
        if (this.useReqAnimFrame)
            window.requestAnimationFrame(fn);
        else
            setTimeout(fn, msec);
    };
    AnimationTimer.prototype.nextFrame = function (ts) {
        if (!ts)
            ts = Date.now();
        if (ts - this.lastts < this.intervalMsec * 10) {
            this.lastts += this.intervalMsec;
        }
        else {
            this.lastts = ts + this.intervalMsec; // frames skipped, catch up
        }
        if (!this.useReqAnimFrame || this.lastts - ts > this.intervalMsec / 2) {
            if (this.running) {
                this.callback();
            }
            if (this.nframes == 0)
                this.startts = ts;
            if (this.nframes++ == 300) {
                console.log("Avg framerate: " + this.nframes * 1000 / (ts - this.startts) + " fps");
            }
        }
        if (this.running) {
            this.scheduleFrame(this.lastts - ts);
        }
        else {
            this.pulsing = false;
        }
    };
    AnimationTimer.prototype.isRunning = function () {
        return this.running;
    };
    AnimationTimer.prototype.start = function () {
        if (!this.running) {
            this.running = true;
            this.lastts = 0;
            this.nframes = 0;
            if (!this.pulsing) {
                this.scheduleFrame(0);
                this.pulsing = true;
            }
        }
    };
    AnimationTimer.prototype.stop = function () {
        this.running = false;
    };
    return AnimationTimer;
}());
exports.AnimationTimer = AnimationTimer;
// TODO: move to util?
function dumpRAM(ram, ramofs, ramlen) {
    var s = "";
    var bpel = ram['BYTES_PER_ELEMENT'] || 1;
    var perline = Math.ceil(16 / bpel);
    var isFloat = ram instanceof Float32Array || ram instanceof Float64Array;
    // TODO: show scrollable RAM for other platforms
    for (var ofs = 0; ofs < ramlen; ofs += perline) {
        s += '$' + util_1.hex(ofs + ramofs) + ':';
        for (var i = 0; i < perline; i++) {
            if (ofs + i < ram.length) {
                if (i == perline / 2)
                    s += " ";
                if (isFloat)
                    s += " " + ram[ofs + i].toPrecision(bpel * 2);
                else
                    s += " " + util_1.hex(ram[ofs + i], bpel * 2);
            }
        }
        s += "\n";
    }
    return s;
}
exports.dumpRAM = dumpRAM;
;
exports.Keys = {
    ANYKEY: { c: 0, n: "?" },
    // gamepad and keyboard (player 0)
    UP: { c: 38, n: "Up", plyr: 0, yaxis: -1 },
    DOWN: { c: 40, n: "Down", plyr: 0, yaxis: 1 },
    LEFT: { c: 37, n: "Left", plyr: 0, xaxis: -1 },
    RIGHT: { c: 39, n: "Right", plyr: 0, xaxis: 1 },
    A: { c: 32, n: "Space", plyr: 0, button: 0 },
    B: { c: 16, n: "Shift", plyr: 0, button: 1 },
    GP_A: { c: 88, n: "X", plyr: 0, button: 0 },
    GP_B: { c: 90, n: "Z", plyr: 0, button: 1 },
    GP_C: { c: 86, n: "V", plyr: 0, button: 2 },
    GP_D: { c: 67, n: "C", plyr: 0, button: 3 },
    SELECT: { c: 220, n: "\\", plyr: 0, button: 8 },
    START: { c: 13, n: "Enter", plyr: 0, button: 9 },
    // gamepad and keyboard (player 1)
    P2_UP: { c: 87, n: "W", plyr: 1, yaxis: -1 },
    P2_DOWN: { c: 83, n: "S", plyr: 1, yaxis: 1 },
    P2_LEFT: { c: 65, n: "A", plyr: 1, xaxis: -1 },
    P2_RIGHT: { c: 68, n: "D", plyr: 1, xaxis: 1 },
    P2_A: { c: 84, n: "T", plyr: 1, button: 0 },
    P2_B: { c: 82, n: "R", plyr: 1, button: 1 },
    P2_GP_A: { c: 69, n: "E", plyr: 1, button: 0 },
    P2_GP_B: { c: 82, n: "R", plyr: 1, button: 1 },
    P2_GP_C: { c: 84, n: "T", plyr: 1, button: 2 },
    P2_GP_D: { c: 89, n: "Y", plyr: 1, button: 3 },
    P2_SELECT: { c: 70, n: "F", plyr: 1, button: 8 },
    P2_START: { c: 71, n: "G", plyr: 1, button: 9 },
    // keyboard only
    VK_ESCAPE: { c: 27, n: "Esc" },
    VK_F1: { c: 112, n: "F1" },
    VK_F2: { c: 113, n: "F2" },
    VK_F3: { c: 114, n: "F3" },
    VK_F4: { c: 115, n: "F4" },
    VK_F5: { c: 116, n: "F5" },
    VK_F6: { c: 117, n: "F6" },
    VK_F7: { c: 118, n: "F7" },
    VK_F8: { c: 119, n: "F8" },
    VK_F9: { c: 120, n: "F9" },
    VK_F10: { c: 121, n: "F10" },
    VK_F11: { c: 122, n: "F11" },
    VK_F12: { c: 123, n: "F12" },
    VK_SCROLL_LOCK: { c: 145, n: "ScrLck" },
    VK_PAUSE: { c: 19, n: "Pause" },
    VK_QUOTE: { c: 192, n: "'" },
    VK_1: { c: 49, n: "1" },
    VK_2: { c: 50, n: "2" },
    VK_3: { c: 51, n: "3" },
    VK_4: { c: 52, n: "4" },
    VK_5: { c: 53, n: "5" },
    VK_6: { c: 54, n: "6" },
    VK_7: { c: 55, n: "7" },
    VK_8: { c: 56, n: "8" },
    VK_9: { c: 57, n: "9" },
    VK_0: { c: 48, n: "0" },
    VK_MINUS: { c: 189, n: "-" },
    VK_MINUS2: { c: 173, n: "-" },
    VK_EQUALS: { c: 187, n: "=" },
    VK_EQUALS2: { c: 61, n: "=" },
    VK_BACK_SPACE: { c: 8, n: "Bkspc" },
    VK_TAB: { c: 9, n: "Tab" },
    VK_Q: { c: 81, n: "Q" },
    VK_W: { c: 87, n: "W" },
    VK_E: { c: 69, n: "E" },
    VK_R: { c: 82, n: "R" },
    VK_T: { c: 84, n: "T" },
    VK_Y: { c: 89, n: "Y" },
    VK_U: { c: 85, n: "U" },
    VK_I: { c: 73, n: "I" },
    VK_O: { c: 79, n: "O" },
    VK_P: { c: 80, n: "P" },
    VK_ACUTE: { c: 219, n: "´" },
    VK_OPEN_BRACKET: { c: 221, n: "[" },
    VK_CLOSE_BRACKET: { c: 220, n: "]" },
    VK_CAPS_LOCK: { c: 20, n: "CpsLck" },
    VK_A: { c: 65, n: "A" },
    VK_S: { c: 83, n: "S" },
    VK_D: { c: 68, n: "D" },
    VK_F: { c: 70, n: "F" },
    VK_G: { c: 71, n: "G" },
    VK_H: { c: 72, n: "H" },
    VK_J: { c: 74, n: "J" },
    VK_K: { c: 75, n: "K" },
    VK_L: { c: 76, n: "L" },
    VK_CEDILLA: { c: 186, n: "Ç" },
    VK_TILDE: { c: 222, n: "~" },
    VK_ENTER: { c: 13, n: "Enter" },
    VK_SHIFT: { c: 16, n: "Shift" },
    VK_BACK_SLASH: { c: 226, n: "\\" },
    VK_Z: { c: 90, n: "Z" },
    VK_X: { c: 88, n: "X" },
    VK_C: { c: 67, n: "C" },
    VK_V: { c: 86, n: "V" },
    VK_B: { c: 66, n: "B" },
    VK_N: { c: 78, n: "N" },
    VK_M: { c: 77, n: "M" },
    VK_COMMA: { c: 188, n: "] =" },
    VK_PERIOD: { c: 190, n: "." },
    VK_SEMICOLON: { c: 191, n: ";" },
    VK_SLASH: { c: 193, n: "/" },
    VK_CONTROL: { c: 17, n: "Ctrl" },
    VK_ALT: { c: 18, n: "Alt" },
    VK_SPACE: { c: 32, n: "Space" },
    VK_INSERT: { c: 45, n: "Ins" },
    VK_DELETE: { c: 46, n: "Del" },
    VK_HOME: { c: 36, n: "Home" },
    VK_END: { c: 35, n: "End" },
    VK_PAGE_UP: { c: 33, n: "PgUp" },
    VK_PAGE_DOWN: { c: 34, n: "PgDown" },
    VK_UP: { c: 38, n: "Up" },
    VK_DOWN: { c: 40, n: "Down" },
    VK_LEFT: { c: 37, n: "Left" },
    VK_RIGHT: { c: 39, n: "Right" },
    VK_NUM_LOCK: { c: 144, n: "Num" },
    VK_DIVIDE: { c: 111, n: "Num /" },
    VK_MULTIPLY: { c: 106, n: "Num *" },
    VK_SUBTRACT: { c: 109, n: "Num -" },
    VK_ADD: { c: 107, n: "Num +" },
    VK_DECIMAL: { c: 194, n: "Num ." },
    VK_NUMPAD0: { c: 96, n: "Num 0" },
    VK_NUMPAD1: { c: 97, n: "Num 1" },
    VK_NUMPAD2: { c: 98, n: "Num 2" },
    VK_NUMPAD3: { c: 99, n: "Num 3" },
    VK_NUMPAD4: { c: 100, n: "Num 4" },
    VK_NUMPAD5: { c: 101, n: "Num 5" },
    VK_NUMPAD6: { c: 102, n: "Num 6" },
    VK_NUMPAD7: { c: 103, n: "Num 7" },
    VK_NUMPAD8: { c: 104, n: "Num 8" },
    VK_NUMPAD9: { c: 105, n: "Num 9" },
    VK_NUMPAD_CENTER: { c: 12, n: "Num Cntr" }
};
function _metakeyflags(e) {
    return (e.shiftKey ? KeyFlags.Shift : 0) |
        (e.ctrlKey ? KeyFlags.Ctrl : 0) |
        (e.altKey ? KeyFlags.Alt : 0) |
        (e.metaKey ? KeyFlags.Meta : 0);
}
function newKeyboardHandler(switches, map, func, alwaysfunc) {
    return function (key, code, flags) {
        if (!map) {
            func(null, key, code, flags);
            return;
        }
        var o = map[key];
        if (!o)
            o = map[0];
        if (func && (o || alwaysfunc)) {
            func(o, key, code, flags);
        }
        if (o) {
            //console.log(key,code,flags,o);
            var mask = o.mask;
            if (mask < 0) { // negative mask == active low
                mask = -mask;
                if (flags & (KeyFlags.KeyDown | KeyFlags.KeyUp))
                    flags ^= KeyFlags.KeyDown | KeyFlags.KeyUp;
            }
            if (flags & KeyFlags.KeyDown) {
                switches[o.index] |= mask;
            }
            else if (flags & KeyFlags.KeyUp) {
                switches[o.index] &= ~mask;
            }
        }
    };
}
exports.newKeyboardHandler = newKeyboardHandler;
function setKeyboardFromMap(video, switches, map, func, alwaysfunc) {
    var handler = newKeyboardHandler(switches, map, func, alwaysfunc);
    video.setKeyboardEvents(handler);
    return new ControllerPoller(handler);
}
exports.setKeyboardFromMap = setKeyboardFromMap;
function makeKeycodeMap(table) {
    var map = new Map();
    for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        var val = { index: entry[1], mask: entry[2], def: entry[0] };
        map[entry[0].c] = val;
    }
    return map;
}
exports.makeKeycodeMap = makeKeycodeMap;
var DEFAULT_CONTROLLER_KEYS = [
    exports.Keys.UP, exports.Keys.DOWN, exports.Keys.LEFT, exports.Keys.RIGHT, exports.Keys.A, exports.Keys.B, exports.Keys.SELECT, exports.Keys.START,
    exports.Keys.P2_UP, exports.Keys.P2_DOWN, exports.Keys.P2_LEFT, exports.Keys.P2_RIGHT, exports.Keys.P2_A, exports.Keys.P2_B, exports.Keys.P2_SELECT, exports.Keys.P2_START,
];
var ControllerPoller = /** @class */ (function () {
    function ControllerPoller(handler) {
        var _this = this;
        this.active = false;
        this.state = new Int8Array(32);
        this.lastState = new Int8Array(32);
        this.AXIS0 = 24; // first joystick axis index
        this.handler = handler;
        window.addEventListener("gamepadconnected", function (event) {
            console.log("Gamepad connected:", event);
            _this.active = typeof navigator.getGamepads === 'function';
        });
        window.addEventListener("gamepaddisconnected", function (event) {
            console.log("Gamepad disconnected:", event);
        });
    }
    ControllerPoller.prototype.poll = function () {
        if (!this.active)
            return;
        var gamepads = navigator.getGamepads();
        for (var gpi = 0; gpi < gamepads.length; gpi++) {
            var gp = gamepads[gpi];
            if (gp) {
                for (var i = 0; i < gp.axes.length; i++) {
                    var k = i + this.AXIS0;
                    this.state[k] = Math.round(gp.axes[i]);
                    if (this.state[k] != this.lastState[k]) {
                        this.handleStateChange(gpi, k);
                    }
                }
                for (var i = 0; i < gp.buttons.length; i++) {
                    this.state[i] = gp.buttons[i].pressed ? 1 : 0;
                    if (this.state[i] != this.lastState[i]) {
                        this.handleStateChange(gpi, i);
                    }
                }
                this.lastState.set(this.state);
            }
        }
    };
    ControllerPoller.prototype.handleStateChange = function (gpi, k) {
        var axis = k - this.AXIS0;
        // TODO: this is slow
        for (var _i = 0, DEFAULT_CONTROLLER_KEYS_1 = DEFAULT_CONTROLLER_KEYS; _i < DEFAULT_CONTROLLER_KEYS_1.length; _i++) {
            var def = DEFAULT_CONTROLLER_KEYS_1[_i];
            // is this a gamepad entry? same player #?
            if (def && def.plyr == gpi) {
                var code = def.c;
                var state = this.state[k];
                var lastState = this.lastState[k];
                // check for button/axis match
                if (k == def.button || (axis == 0 && def.xaxis == state) || (axis == 1 && def.yaxis == state)) {
                    //console.log(gpi,k,state,entry);
                    if (state != 0) {
                        this.handler(code, 0, KeyFlags.KeyDown);
                    }
                    else {
                        this.handler(code, 0, KeyFlags.KeyUp);
                    }
                    break;
                }
                // joystick released?
                else if (state == 0 && (axis == 0 && def.xaxis == lastState) || (axis == 1 && def.yaxis == lastState)) {
                    this.handler(code, 0, KeyFlags.KeyUp);
                    break;
                }
            }
        }
    };
    return ControllerPoller;
}());
exports.ControllerPoller = ControllerPoller;
function padBytes(data, len, padstart) {
    if (data.length > len) {
        throw Error("Data too long, " + data.length + " > " + len);
    }
    var r = new RAM(len);
    if (padstart)
        r.mem.set(data, len - data.length);
    else
        r.mem.set(data);
    return r.mem;
}
exports.padBytes = padBytes;
// TODO: better performance, check values
function AddressDecoder(table, options) {
    var self = this;
    function makeFunction(lo, hi) {
        var s = "";
        if (options && options.gmask) {
            s += "a&=" + options.gmask + ";";
        }
        for (var i = 0; i < table.length; i++) {
            var entry = table[i];
            var start = entry[0];
            var end = entry[1];
            var mask = entry[2];
            var func = entry[3];
            self['__fn' + i] = func;
            s += "if (a>=" + start + " && a<=" + end + "){";
            if (mask)
                s += "a&=" + mask + ";";
            s += "return this.__fn" + i + "(a,v)&0xff;}\n";
        }
        s += "return 0;"; // TODO: noise()?
        return new Function('a', 'v', s);
    }
    return makeFunction(0x0, 0xffff).bind(self);
}
exports.AddressDecoder = AddressDecoder;
function newAddressDecoder(table, options) {
    return new AddressDecoder(table, options);
}
exports.newAddressDecoder = newAddressDecoder;
/// TOOLBAR
var Toolbar = /** @class */ (function () {
    function Toolbar(parentDiv, focusDiv) {
        this.boundkeys = [];
        this.mousetrap = focusDiv ? new Mousetrap(focusDiv) : Mousetrap;
        this.span = $(document.createElement("span")).addClass("btn_toolbar");
        parentDiv.appendChild(this.span[0]);
        this.newGroup();
    }
    Toolbar.prototype.destroy = function () {
        if (this.span) {
            this.span.remove();
            this.span = null;
        }
        if (this.mousetrap) {
            for (var _i = 0, _a = this.boundkeys; _i < _a.length; _i++) {
                var key = _a[_i];
                this.mousetrap.unbind(key);
            }
            this.mousetrap = null;
        }
    };
    Toolbar.prototype.newGroup = function () {
        return this.grp = $(document.createElement("span")).addClass("btn_group").appendTo(this.span).hide();
    };
    Toolbar.prototype.add = function (key, alttext, icon, fn) {
        var btn = null;
        if (icon) {
            btn = $(document.createElement("button")).addClass("btn");
            if (icon.startsWith('glyphicon')) {
                icon = '<span class="glyphicon ' + icon + '" aria-hidden="true"></span>';
            }
            btn.html(icon);
            btn.prop("title", key ? (alttext + " (" + key + ")") : alttext);
            btn.click(fn);
            this.grp.append(btn).show();
        }
        if (key) {
            this.mousetrap.bind(key, fn);
            this.boundkeys.push(key);
        }
        return btn;
    };
    return Toolbar;
}());
exports.Toolbar = Toolbar;
// https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
    };
}
exports.getMousePos = getMousePos;
//# sourceMappingURL=emu.js.map