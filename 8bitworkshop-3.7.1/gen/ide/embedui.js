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
exports.startEmbed = exports.loadScript = exports.stateRecorder = exports.platform = exports.platform_id = void 0;
window['Javatari'].AUTO_START = false;
var emu_1 = require("../common/emu");
var util_1 = require("../common/util");
var recorder_1 = require("../common/recorder");
var _qs = (function (a) {
    if (!a || a.length == 0)
        return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));
// catch errors
function installErrorHandler() {
    if (typeof window.onerror == "object") {
        window.onerror = function (msgevent, url, line, col, error) {
            var msg = msgevent + " " + url + " " + " " + line + ":" + col + ", " + error;
            $.get("/error?msg=" + encodeURIComponent(msg), "text");
        };
    }
}
function uninstallErrorHandler() {
    window.onerror = null;
}
function addPageFocusHandlers() {
    var hidden = false;
    document.addEventListener("visibilitychange", function (e) {
        if (document.visibilityState == 'hidden' && exports.platform.isRunning()) {
            exports.platform.pause();
            hidden = true;
        }
        else if (document.visibilityState == 'visible' && hidden) {
            exports.platform.resume();
            hidden = false;
        }
    });
    $(window).on("focus", function () {
        if (hidden) {
            exports.platform.resume();
            hidden = false;
        }
    });
    $(window).on("blur", function () {
        if (exports.platform.isRunning()) {
            exports.platform.pause();
            hidden = true;
        }
    });
}
function startROM(title, rom) {
    if (!rom) {
        alert("No ROM found.");
        return;
    }
    console.log(rom.length + ' bytes');
    exports.platform.loadROM(title, rom);
    exports.platform.resume();
}
function enableRecording() {
    exports.stateRecorder = new recorder_1.StateRecorderImpl(exports.platform);
    exports.stateRecorder.reset();
    exports.stateRecorder.checkpointInterval = 60 * 5; // every 5 sec
    exports.stateRecorder.maxCheckpoints = 360; // 30 minutes
    exports.platform.setRecorder(exports.stateRecorder);
    console.log('start recording');
}
function findPrimaryCanvas() {
    return $("#emulator").find('canvas');
}
function recordVideo(intervalMsec, maxFrames, callback) {
    loadScript("gif.js/dist/gif.js").then(function () {
        var canvas = findPrimaryCanvas()[0];
        if (!canvas) {
            alert("Could not find canvas element to record video!");
            return;
        }
        var rotate = 0;
        if (canvas.style && canvas.style.transform) {
            if (canvas.style.transform.indexOf("rotate(-90deg)") >= 0)
                rotate = -1;
            else if (canvas.style.transform.indexOf("rotate(90deg)") >= 0)
                rotate = 1;
        }
        var gif = new GIF({
            workerScript: 'gif.js/dist/gif.worker.js',
            workers: 4,
            quality: 10,
            rotate: rotate
        });
        gif.on('finished', function (blob) {
            console.log('finished encoding GIF');
            callback(blob);
        });
        intervalMsec = intervalMsec || (100 + ((Math.random() * 256) & 3));
        maxFrames = maxFrames || (100 + ((Math.random() * 256) & 15));
        var nframes = 0;
        console.log("Recording video", canvas);
        var f = function () {
            if (nframes++ > maxFrames) {
                console.log("Rendering video");
                gif.render();
            }
            else {
                gif.addFrame(canvas, { delay: intervalMsec, copy: true });
                setTimeout(f, intervalMsec);
            }
        };
        f();
    });
}
function startPlatform(qs) {
    return __awaiter(this, void 0, void 0, function () {
        var title, rom, romurl, lzgvar, lzgrom;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!emu_1.PLATFORMS[exports.platform_id])
                        throw Error("Invalid platform '" + exports.platform_id + "'.");
                    exports.platform = new emu_1.PLATFORMS[exports.platform_id]($("#emuscreen")[0]);
                    return [4 /*yield*/, exports.platform.start()];
                case 1:
                    _a.sent();
                    // start recorder when click on canvas (TODO?)
                    if (qs['rec']) {
                        findPrimaryCanvas().on('focus', function () {
                            //if (!stateRecorder) { enableRecording(); }
                            // toggle sound for browser autoplay
                            exports.platform.resume();
                        });
                    }
                    title = qs['n'] || 'Game';
                    romurl = qs['url'];
                    lzgvar = qs['r'];
                    if (romurl) {
                        // load rom url remotely
                        console.log(romurl);
                        util_1.getWithBinary(romurl, function (data) {
                            startROM(title, data);
                        }, 'arraybuffer');
                        return [2 /*return*/, true];
                    }
                    else if (lzgvar) {
                        lzgrom = util_1.stringToByteArray(atob(lzgvar));
                        rom = new lzgmini().decode(lzgrom);
                    }
                    addPageFocusHandlers();
                    startROM(title, rom);
                    return [2 /*return*/, true];
            }
        });
    });
}
// TODO: merge with ui
function loadPlatform(qs) {
    return __awaiter(this, void 0, void 0, function () {
        var platformfn, machinefn, e_1, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (qs.data)
                        qs = qs.data;
                    exports.platform_id = qs['p'];
                    if (!exports.platform_id)
                        throw ('No platform variable!');
                    platformfn = 'gen/platform/' + exports.platform_id.split(/[.-]/)[0] + '.js';
                    machinefn = platformfn.replace('/platform/', '/machine/');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadScript(platformfn)];
                case 2:
                    _a.sent(); // load platform file
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    throw ('Platform "' + exports.platform_id + '" not supported.');
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, loadScript(machinefn)];
                case 5:
                    _a.sent(); // load machine file
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _a.sent();
                    console.log('skipped', machinefn); // optional file skipped
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    console.log("starting platform", exports.platform_id); // loaded required <platform_id>.js file
                    return [4 /*yield*/, startPlatform(qs)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_3 = _a.sent();
                    console.log(e_3);
                    alert('Platform "' + exports.platform_id + '" not supported.');
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function loadScript(scriptfn) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.onload = resolve;
        script.onerror = reject;
        script.src = scriptfn;
        document.getElementsByTagName('head')[0].appendChild(script);
    });
}
exports.loadScript = loadScript;
// start
function startEmbed() {
    installErrorHandler();
    if (_qs['p']) {
        loadPlatform(_qs);
    }
}
exports.startEmbed = startEmbed;
// iframe API
window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    if (event.data) {
        var cmd = event.data.cmd;
        if (cmd == 'start' && !exports.platform) {
            loadPlatform(event);
        }
        else if (cmd == 'reset') {
            exports.platform.reset();
            exports.stateRecorder.reset();
        }
        else if (cmd == 'getReplay') {
            var replay = {
                frameCount: exports.stateRecorder.frameCount,
                checkpoints: exports.stateRecorder.checkpoints,
                framerecs: exports.stateRecorder.framerecs,
                checkpointInterval: exports.stateRecorder.checkpointInterval,
                maxCheckpoints: exports.stateRecorder.maxCheckpoints,
            };
            event.source.postMessage({ ack: cmd, replay: replay }, event.origin);
        }
        else if (cmd == 'watchState') {
            var watchfn = new Function('platform', 'state', event.data.fn);
            exports.stateRecorder.callbackNewCheckpoint = function (state) {
                event.source.postMessage({ ack: cmd, state: watchfn(exports.platform, state) }, event.origin);
            };
        }
        else if (cmd == 'recordVideo') {
            recordVideo(event.data.intervalMsec, event.data.maxFrames, function (blob) {
                if (event.data.filename) {
                    saveAs(blob, event.data.filename);
                }
                event.source.postMessage({ ack: cmd, gif: blob }, event.origin);
            });
        }
        else {
            console.log("Unknown data.cmd: " + cmd);
        }
    }
}
//# sourceMappingURL=embedui.js.map