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
exports.ZX_WASMMachine = void 0;
var emu_1 = require("../common/emu");
//// WASM Machine
var baseplatform_1 = require("../common/baseplatform");
var ZX_WASMMachine = /** @class */ (function (_super) {
    __extends(ZX_WASMMachine, _super);
    function ZX_WASMMachine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numTotalScanlines = 312;
        _this.cpuCyclesPerLine = 224;
        _this.joymask0 = 0;
        return _this;
    }
    ZX_WASMMachine.prototype.reset = function () {
        _super.prototype.reset.call(this);
        // advance bios
        this.exports.machine_exec(this.sys, 500000); // TODO?
        // load rom (Z80 header: https://worldofspectrum.org/faq/reference/z80format.htm)
        if (this.romptr && this.romlen) {
            // TODO
            this.exports.machine_load_rom(this.sys, this.romptr, this.romlen);
            /*
            var romstart = 0x5ccb;
            for (var i=0; i<this.romlen; i++) {
              this.exports.machine_mem_write(this.sys, romstart+i, this.romarr[i]);
            }
            */
        }
        // clear keyboard
        for (var ch = 0; ch < 128; ch++) {
            this.setKeyInput(ch, 0, emu_1.KeyFlags.KeyUp);
        }
    };
    ZX_WASMMachine.prototype.advanceFrame = function (trap) {
        //var scanline = this.exports.machine_get_raster_line(this.sys);
        var probing = this.probe != null;
        if (probing)
            this.exports.machine_reset_probe_buffer();
        var clocks = _super.prototype.advanceFrameClock.call(this, trap, Math.floor(1000000 / 50)); // TODO: use ticks, not msec
        if (probing)
            this.copyProbeData();
        return clocks;
    };
    /*
      z80_tick_t tick_cb; // 0
      uint64_t bc_de_hl_fa; // 8
      uint64_t bc_de_hl_fa_; // 16
      uint64_t wz_ix_iy_sp; // 24
      uint64_t im_ir_pc_bits; // 32
      uint64_t pins;          // 48
      void* user_data;
      z80_trap_t trap_cb;
      void* trap_user_data;
      int trap_id;
    */
    ZX_WASMMachine.prototype.getCPUState = function () {
        this.exports.machine_save_cpu_state(this.sys, this.cpustateptr);
        var s = this.cpustatearr;
        var af = s[9] + (s[8] << 8); // not FA
        var hl = s[10] + (s[11] << 8);
        var de = s[12] + (s[13] << 8);
        var bc = s[14] + (s[15] << 8);
        var sp = s[24] + (s[25] << 8);
        var iy = s[26] + (s[27] << 8);
        var ix = s[28] + (s[29] << 8);
        var pc = s[34] + (s[35] << 8);
        var ir = s[36] + (s[37] << 8);
        return {
            PC: pc,
            SP: sp,
            AF: af,
            BC: bc,
            DE: de,
            HL: hl,
            IX: ix,
            IY: iy,
            IR: ir,
            o: this.readConst(pc),
        };
    };
    ZX_WASMMachine.prototype.saveState = function () {
        this.exports.machine_save_state(this.sys, this.stateptr);
        return {
            c: this.getCPUState(),
            state: this.statearr.slice(0),
        };
    };
    ZX_WASMMachine.prototype.loadState = function (state) {
        this.statearr.set(state.state);
        this.exports.machine_load_state(this.sys, this.stateptr);
    };
    ZX_WASMMachine.prototype.getVideoParams = function () {
        return { width: 320, height: 256, overscan: true, videoFrequency: 50 };
    };
    ZX_WASMMachine.prototype.setKeyInput = function (key, code, flags) {
        // TODO: handle shifted keys
        if (key == 16 || key == 17 || key == 18 || key == 224)
            return; // meta keys
        //console.log(key, code, flags);
        //if (flags & KeyFlags.Shift) { key += 64; }
        // convert to c64 (TODO: zx)
        var mask = 0;
        var mask2 = 0;
        if (key == 37) {
            key = 0x8;
            mask = 0x4;
        } // LEFT
        if (key == 38) {
            key = 0xb;
            mask = 0x1;
        } // UP
        if (key == 39) {
            key = 0x9;
            mask = 0x8;
        } // RIGHT
        if (key == 40) {
            key = 0xa;
            mask = 0x2;
        } // DOWN
        if (key == 32) {
            mask = 0x10;
        } // FIRE
        if (key == 65) {
            key = 65;
            mask2 = 0x4;
        } // LEFT
        if (key == 87) {
            key = 87;
            mask2 = 0x1;
        } // UP
        if (key == 68) {
            key = 68;
            mask2 = 0x8;
        } // RIGHT
        if (key == 83) {
            key = 83;
            mask2 = 0x2;
        } // DOWN
        if (key == 69) {
            mask2 = 0x10;
        } // FIRE
        if (key == 113) {
            key = 0xf1;
        } // F2
        if (key == 115) {
            key = 0xf3;
        } // F4
        if (key == 119) {
            key = 0xf5;
        } // F8
        if (key == 121) {
            key = 0xf7;
        } // F10
        if (flags & emu_1.KeyFlags.KeyDown) {
            this.exports.machine_key_down(this.sys, key);
            this.joymask0 |= mask;
        }
        else if (flags & emu_1.KeyFlags.KeyUp) {
            this.exports.machine_key_up(this.sys, key);
            this.joymask0 &= ~mask;
        }
        this.exports.zx_joystick(this.sys, this.joymask0, 0);
    };
    return ZX_WASMMachine;
}(baseplatform_1.BaseWASMMachine));
exports.ZX_WASMMachine = ZX_WASMMachine;
//# sourceMappingURL=zx.js.map