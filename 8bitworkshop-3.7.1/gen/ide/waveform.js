"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveformView = void 0;
var emu_1 = require("../common/emu");
var WaveformView = /** @class */ (function () {
    function WaveformView(parent, wfp) {
        this.lines = [];
        this.zoom = 8;
        this.t0 = 0;
        this.tsel = -1;
        this.hexformat = false;
        this.parent = parent;
        this.wfp = wfp;
        this.recreate();
    }
    WaveformView.prototype.recreate = function () {
        var _this = this;
        clearTimeout(this.wtimer);
        this.wtimer = setTimeout(function () {
            _this.destroy();
            // create new thing
            _this._recreate();
        }, 0);
    };
    WaveformView.prototype.destroy = function () {
        // remove old thing
        if (this.wavelist) {
            $(this.wavelist.container).remove();
            this.wavelist = null;
        }
        if (this.toolbar) {
            this.toolbar.destroy();
            this.toolbar = null;
        }
    };
    WaveformView.prototype._recreate = function () {
        var _this = this;
        this.meta = this.wfp.getSignalMetadata();
        if (!this.meta)
            return;
        var width = this.pageWidth = $(this.parent).width();
        var rowHeight = 40; // TODO
        this.clocksPerPage = Math.floor(this.pageWidth / this.zoom) - 1;
        this.clockMax = 0;
        this.wavelist = new VirtualList({
            w: width,
            h: $(this.parent).height(),
            itemHeight: rowHeight,
            totalRows: this.meta.length + 1,
            generatorFn: function (row) {
                var metarow = _this.meta[row]; // TODO: why null?
                var s = metarow != null ? metarow.label : "";
                var linediv = document.createElement("div");
                var canvas = document.createElement("canvas");
                canvas.width = width - 12;
                canvas.height = rowHeight;
                linediv.appendChild(canvas); //document.createTextNode(s));
                linediv.classList.add('waverow');
                _this.lines[row] = canvas;
                _this.refreshRow(row);
                return linediv;
            }
        });
        var wlc = this.wavelist.container;
        wlc.tabIndex = -1; // make it focusable
        //wlc.style = "overflow-x: hidden"; // TODO?
        this.toolbar = new emu_1.Toolbar(this.parent, this.parent);
        this.toolbar.span.css('display', 'inline-block');
        $(this.parent).append(wlc);
        var down = false;
        var selfn = function (e) {
            _this.setSelTime(e.offsetX / _this.zoom + _this.t0 - 0.5);
        };
        $(wlc).mousedown(function (e) {
            down = true;
            selfn(e);
            //if (e['pointerId']) e.target.setPointerCapture(e['pointerId']);
        });
        $(wlc).mousemove(function (e) {
            if (down)
                selfn(e);
        });
        $(wlc).mouseup(function (e) {
            down = false;
            //if (e['pointerId']) e.target.releasePointerCapture(e['pointerId']);
        });
        this.toolbar.add('=', 'Zoom In', 'glyphicon-zoom-in', function (e, combo) {
            _this.setZoom(_this.zoom * 2);
        });
        this.toolbar.add('+', 'Zoom In', null, function (e, combo) {
            _this.setZoom(_this.zoom * 2);
        });
        this.toolbar.add('-', 'Zoom Out', 'glyphicon-zoom-out', function (e, combo) {
            _this.setZoom(_this.zoom / 2);
        });
        this.toolbar.add('ctrl+shift+left', 'Move to beginning', 'glyphicon-backward', function (e, combo) {
            _this.setSelTime(0);
            _this.setOrgTime(0);
        });
        this.toolbar.add('ctrl+left', 'Move left 1/4 page', 'glyphicon-fast-backward', function (e, combo) {
            _this.setSelTime(_this.tsel - _this.clocksPerPage / 4);
        });
        this.toolbar.add('left', 'Move left 1 clock', 'glyphicon-step-backward', function (e, combo) {
            _this.setSelTime(_this.tsel - 1);
        });
        this.toolbar.add('right', 'Move right 1 clock', 'glyphicon-step-forward', function (e, combo) {
            _this.setSelTime(_this.tsel + 1);
        });
        this.toolbar.add('ctrl+right', 'Move right 1/4 page', 'glyphicon-fast-forward', function (e, combo) {
            _this.setSelTime(_this.tsel + _this.clocksPerPage / 4);
        });
        this.toolbar.add('h', 'Switch between hex/decimal format', 'glyphicon-barcode', function (e, combo) {
            _this.hexformat = !_this.hexformat;
            _this.refresh();
        });
        $(window).resize(function () {
            _this.recreate();
        }); // TODO: remove?
    };
    WaveformView.prototype.roundT = function (t) {
        t = Math.round(t);
        t = Math.max(0, t); // make sure >= 0
        t = Math.min(this.clockMax + this.clocksPerPage / 2, t); // make sure <= end
        return t;
    };
    WaveformView.prototype.setOrgTime = function (t) {
        this.t0 = this.roundT(t);
        this.refresh();
    };
    WaveformView.prototype.setEndTime = function (t) {
        this.setOrgTime(t - this.clocksPerPage);
    };
    WaveformView.prototype.setSelTime = function (t) {
        t = this.roundT(t);
        if (t >= this.t0 + this.clocksPerPage - 1)
            this.t0 += this.clocksPerPage / 4;
        if (t <= this.t0 + 2)
            this.t0 -= this.clocksPerPage / 4;
        this.tsel = t;
        this.setOrgTime(this.t0);
    };
    WaveformView.prototype.setZoom = function (zoom) {
        this.zoom = Math.max(1 / 16, Math.min(64, zoom));
        this.clocksPerPage = Math.ceil(this.pageWidth / this.zoom); // TODO: refactor into other one
        this.refresh();
    };
    WaveformView.prototype.refresh = function () {
        if (!this.meta)
            this.recreate();
        if (!this.meta)
            return;
        for (var i = 0; i < this.meta.length; i++) {
            this.refreshRow(i);
        }
    };
    WaveformView.prototype.refreshRow = function (row) {
        var canvas = this.lines[row];
        var meta = this.meta[row];
        if (!canvas || !meta)
            return;
        var isclk = (meta.label == 'clk');
        var w = canvas.width;
        var h = canvas.height;
        var ctx = canvas.getContext("2d");
        ctx.font = "14px Andale Mono, Lucida Console, monospace";
        // clear to black
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // draw waveform
        var fh = 12;
        var b1 = fh + 4;
        var b2 = 4;
        var h2 = h - b1 - b2;
        var yrange = ((1 << meta.len) - 1) || 0;
        var data = this.wfp.getSignalData(row, this.t0, Math.ceil(w / this.zoom));
        this.clockMax = Math.max(this.clockMax, this.t0 + data.length);
        var printvals = meta.len > 1 && this.zoom >= 32;
        var ycen = b1 + h2 - 1;
        ctx.fillStyle = "#336633";
        ctx.fillRect(0, fh / 2, 3, b1 + h2 - fh / 2); // draw left tag
        ctx.strokeStyle = ctx.fillStyle = "#66ff66";
        // draw waveform
        ctx.beginPath();
        var x = 0;
        var y = 0;
        var lastval = -1;
        var radix = this.hexformat ? 16 : 10;
        for (var i = 0; i < data.length; i++) {
            var val = data[i];
            if (printvals && val != lastval && x < w - 100) { // close to right edge? omit
                ctx.fillText(val.toString(radix), x + this.zoom / 4, ycen);
            }
            lastval = val;
            if (i > 0)
                ctx.lineTo(x, y);
            y = b1 + (1.0 - val / yrange) * h2;
            if (!isclk)
                x += this.zoom * (1 / 8);
            if (i == 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
            if (isclk)
                x += this.zoom;
            else
                x += this.zoom * (7 / 8);
        }
        ctx.stroke();
        // draw selection thingie
        if (this.tsel >= this.t0) {
            ctx.strokeStyle = ctx.fillStyle = "#ff66ff";
            ctx.beginPath();
            x = (this.tsel - this.t0) * this.zoom + this.zoom / 2;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
            // print value
            var val = data[this.tsel - this.t0];
            ctx.textAlign = 'right';
            if (val !== undefined) {
                var s = val.toString(radix);
                var x = w - fh;
                var dims = ctx.measureText(s);
                ctx.fillStyle = 'black';
                ctx.fillRect(x - dims.width - 2, ycen - 13, dims.width + 4, 17);
                ctx.fillStyle = "#ff66ff";
                ctx.fillText(s, x, ycen);
            }
        }
        // draw labels
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(meta.label, 5, fh);
    };
    return WaveformView;
}());
exports.WaveformView = WaveformView;
//# sourceMappingURL=waveform.js.map