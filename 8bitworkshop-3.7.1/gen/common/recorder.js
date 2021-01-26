"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbeRecorder = exports.ProbeFlags = exports.StateRecorderImpl = void 0;
var emu_1 = require("./emu");
var StateRecorderImpl = /** @class */ (function () {
    function StateRecorderImpl(platform) {
        this.checkpointInterval = 10;
        this.maxCheckpoints = 300;
        this.reset();
        this.platform = platform;
    }
    StateRecorderImpl.prototype.reset = function () {
        this.checkpoints = [];
        this.framerecs = [];
        this.frameCount = 0;
        this.lastSeekFrame = 0;
        this.lastSeekStep = 0;
        this.lastStepCount = 0;
        if (this.callbackStateChanged)
            this.callbackStateChanged();
    };
    StateRecorderImpl.prototype.frameRequested = function () {
        var controls = {
            controls: this.platform.saveControlsState(),
            seed: emu_1.getNoiseSeed()
        };
        var requested = false;
        // are we replaying? then we don't need to save a frame, just replace controls
        if (this.lastSeekFrame < this.frameCount) {
            this.loadControls(this.lastSeekFrame);
        }
        else {
            // record the control state, if available
            if (this.platform.saveControlsState) {
                this.framerecs.push(controls);
            }
            // time to save next frame?
            requested = (this.frameCount++ % this.checkpointInterval) == 0;
        }
        this.lastSeekFrame++;
        this.lastSeekStep = 0;
        if (this.callbackStateChanged)
            this.callbackStateChanged();
        return requested;
    };
    StateRecorderImpl.prototype.numFrames = function () {
        return this.frameCount;
    };
    StateRecorderImpl.prototype.currentFrame = function () {
        return this.lastSeekFrame;
    };
    StateRecorderImpl.prototype.currentStep = function () {
        return this.lastSeekStep;
    };
    StateRecorderImpl.prototype.recordFrame = function (state) {
        this.checkpoints.push(state);
        if (this.callbackNewCheckpoint)
            this.callbackNewCheckpoint(state);
        // checkpoints full?
        if (this.checkpoints.length > this.maxCheckpoints) {
            this.checkpoints.shift(); // remove 1st checkpoint
            this.framerecs = this.framerecs.slice(this.checkpointInterval);
            this.lastSeekFrame -= this.checkpointInterval;
            this.frameCount -= this.checkpointInterval;
            if (this.callbackStateChanged)
                this.callbackStateChanged();
        }
    };
    StateRecorderImpl.prototype.getStateAtOrBefore = function (frame) {
        // initial frame?
        if (frame <= 0 && this.checkpoints.length > 0)
            return { frame: 0, state: this.checkpoints[0] };
        var bufidx = Math.floor(frame / this.checkpointInterval);
        var foundidx = bufidx < this.checkpoints.length ? bufidx : this.checkpoints.length - 1;
        var foundframe = foundidx * this.checkpointInterval;
        return { frame: foundframe, state: this.checkpoints[foundidx] };
    };
    StateRecorderImpl.prototype.loadFrame = function (seekframe, seekstep) {
        seekframe |= 0;
        seekstep |= 0;
        if (seekframe == this.lastSeekFrame && seekstep == this.lastSeekStep) {
            return seekframe; // already set to this frame
        }
        // TODO: what if < 1?
        var _a = this.getStateAtOrBefore(seekframe - 1), frame = _a.frame, state = _a.state;
        if (state) {
            var numSteps = 0;
            this.platform.pause();
            this.platform.loadState(state);
            // seek to frame index
            while (frame < seekframe) {
                if (frame < this.framerecs.length) {
                    this.loadControls(frame);
                }
                frame++;
                numSteps = this.platform.advance(frame < seekframe); // TODO: infinite loop?
            }
            // TODO: if first frame, we must figure out # of steps
            if (frame == 0) {
                numSteps = this.platform.advance(true);
                this.platform.loadState(state);
            }
            // seek to step index
            // TODO: what if advance() returns clocks, but steps use insns?
            if (seekstep > 0 && this.platform.advanceFrameClock) {
                seekstep = this.platform.advanceFrameClock(null, seekstep);
            }
            // record new values
            this.lastSeekFrame = seekframe;
            this.lastSeekStep = seekstep;
            this.lastStepCount = numSteps;
            return seekframe;
        }
        else {
            return -1;
        }
    };
    StateRecorderImpl.prototype.loadControls = function (frame) {
        if (this.platform.loadControlsState)
            this.platform.loadControlsState(this.framerecs[frame].controls);
        emu_1.setNoiseSeed(this.framerecs[frame].seed);
    };
    StateRecorderImpl.prototype.getLastCheckpoint = function () {
        return this.checkpoints.length && this.checkpoints[this.checkpoints.length - 1];
    };
    return StateRecorderImpl;
}());
exports.StateRecorderImpl = StateRecorderImpl;
var ProbeFlags;
(function (ProbeFlags) {
    ProbeFlags[ProbeFlags["CLOCKS"] = 0] = "CLOCKS";
    ProbeFlags[ProbeFlags["EXECUTE"] = 16777216] = "EXECUTE";
    ProbeFlags[ProbeFlags["HAS_VALUE"] = 268435456] = "HAS_VALUE";
    ProbeFlags[ProbeFlags["MEM_READ"] = 301989888] = "MEM_READ";
    ProbeFlags[ProbeFlags["MEM_WRITE"] = 318767104] = "MEM_WRITE";
    ProbeFlags[ProbeFlags["IO_READ"] = 335544320] = "IO_READ";
    ProbeFlags[ProbeFlags["IO_WRITE"] = 352321536] = "IO_WRITE";
    ProbeFlags[ProbeFlags["VRAM_READ"] = 369098752] = "VRAM_READ";
    ProbeFlags[ProbeFlags["VRAM_WRITE"] = 385875968] = "VRAM_WRITE";
    ProbeFlags[ProbeFlags["INTERRUPT"] = 134217728] = "INTERRUPT";
    ProbeFlags[ProbeFlags["ILLEGAL"] = 150994944] = "ILLEGAL";
    ProbeFlags[ProbeFlags["SP_PUSH"] = 167772160] = "SP_PUSH";
    ProbeFlags[ProbeFlags["SP_POP"] = 184549376] = "SP_POP";
    ProbeFlags[ProbeFlags["SCANLINE"] = 2113929216] = "SCANLINE";
    ProbeFlags[ProbeFlags["FRAME"] = 2130706432] = "FRAME";
})(ProbeFlags = exports.ProbeFlags || (exports.ProbeFlags = {}));
var ProbeFrame = /** @class */ (function () {
    function ProbeFrame() {
    }
    return ProbeFrame;
}());
var ProbeRecorder = /** @class */ (function () {
    function ProbeRecorder(m, buflen) {
        this.idx = 0; // index into buffer
        this.sl = 0; // scanline
        this.cur_sp = -1; // last stack pointer
        this.singleFrame = true; // clear between frames
        this.m = m;
        this.reset(buflen || 0x100000);
    }
    ProbeRecorder.prototype.start = function () {
        this.m.connectProbe(this);
    };
    ProbeRecorder.prototype.stop = function () {
        this.m.connectProbe(null);
    };
    ProbeRecorder.prototype.reset = function (newbuflen) {
        if (newbuflen)
            this.buf = new Uint32Array(newbuflen);
        this.sl = 0;
        this.cur_sp = -1;
        this.clear();
    };
    ProbeRecorder.prototype.clear = function () {
        this.idx = 0;
    };
    ProbeRecorder.prototype.logData = function (a) {
        this.log(a);
    };
    ProbeRecorder.prototype.log = function (a) {
        // TODO: coalesce READ and EXECUTE and PUSH/POP
        if (this.idx >= this.buf.length)
            return;
        this.buf[this.idx++] = a;
    };
    ProbeRecorder.prototype.relog = function (a) {
        this.buf[this.idx - 1] = a;
    };
    ProbeRecorder.prototype.lastOp = function () {
        if (this.idx > 0)
            return this.buf[this.idx - 1] & 0xff000000;
        else
            return -1;
    };
    ProbeRecorder.prototype.lastAddr = function () {
        if (this.idx > 0)
            return this.buf[this.idx - 1] & 0xffffff;
        else
            return -1;
    };
    ProbeRecorder.prototype.addLogBuffer = function (src) {
        if (this.idx + src.length > this.buf.length) {
            src = src.slice(0, this.buf.length - this.idx);
        }
        this.buf.set(src, this.idx);
        this.idx += src.length;
    };
    ProbeRecorder.prototype.logClocks = function (clocks) {
        clocks |= 0;
        if (clocks > 0) {
            if (this.lastOp() == ProbeFlags.CLOCKS)
                this.relog((this.lastAddr() + clocks) | ProbeFlags.CLOCKS); // coalesce clocks
            else
                this.log(clocks | ProbeFlags.CLOCKS);
        }
    };
    ProbeRecorder.prototype.logNewScanline = function () {
        this.log(ProbeFlags.SCANLINE);
        this.sl++;
    };
    ProbeRecorder.prototype.logNewFrame = function () {
        this.log(ProbeFlags.FRAME);
        this.sl = 0;
        if (this.singleFrame)
            this.clear();
    };
    ProbeRecorder.prototype.logExecute = function (address, SP) {
        // record stack pushes/pops (from last instruction)
        if (this.cur_sp !== SP) {
            if (SP < this.cur_sp) {
                this.log(ProbeFlags.SP_PUSH | SP);
            }
            if (SP > this.cur_sp) {
                this.log(ProbeFlags.SP_POP | SP);
            }
            this.cur_sp = SP;
        }
        this.log(address | ProbeFlags.EXECUTE);
    };
    ProbeRecorder.prototype.logInterrupt = function (type) {
        this.log(type | ProbeFlags.INTERRUPT);
    };
    ProbeRecorder.prototype.logValue = function (address, value, op) {
        this.log((address & 0xffff) | ((value & 0xff) << 16) | op);
    };
    ProbeRecorder.prototype.logRead = function (address, value) {
        this.logValue(address, value, ProbeFlags.MEM_READ);
    };
    ProbeRecorder.prototype.logWrite = function (address, value) {
        this.logValue(address, value, ProbeFlags.MEM_WRITE);
    };
    ProbeRecorder.prototype.logIORead = function (address, value) {
        this.logValue(address, value, ProbeFlags.IO_READ);
    };
    ProbeRecorder.prototype.logIOWrite = function (address, value) {
        this.logValue(address, value, ProbeFlags.IO_WRITE);
    };
    ProbeRecorder.prototype.logVRAMRead = function (address, value) {
        this.logValue(address, value, ProbeFlags.VRAM_READ);
    };
    ProbeRecorder.prototype.logVRAMWrite = function (address, value) {
        this.logValue(address, value, ProbeFlags.VRAM_WRITE);
    };
    ProbeRecorder.prototype.logIllegal = function (address) {
        this.log(address | ProbeFlags.ILLEGAL);
    };
    ProbeRecorder.prototype.countEvents = function (op) {
        var count = 0;
        for (var i = 0; i < this.idx; i++) {
            if ((this.buf[i] & 0xff000000) == op)
                count++;
        }
        return count;
    };
    ProbeRecorder.prototype.countClocks = function () {
        var count = 0;
        for (var i = 0; i < this.idx; i++) {
            if ((this.buf[i] & 0xff000000) == ProbeFlags.CLOCKS)
                count += this.buf[i] & 0xffff;
        }
        return count;
    };
    return ProbeRecorder;
}());
exports.ProbeRecorder = ProbeRecorder;
//# sourceMappingURL=recorder.js.map