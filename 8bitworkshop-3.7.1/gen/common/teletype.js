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
exports.TeleTypeWithKeyboard = exports.TeleType = void 0;
var TeleType = /** @class */ (function () {
    function TeleType(page, fixed) {
        this.ncols = 80;
        this.page = page;
        this.fixed = fixed;
        this.clear();
    }
    TeleType.prototype.clear = function () {
        this.curline = null;
        this.curstyle = 0;
        this.reverse = false;
        this.col = 0;
        this.row = -1;
        this.lines = [];
        this.ncharsout = 0;
        $(this.page).empty();
        this.showPrintHead(true);
    };
    TeleType.prototype.ensureline = function () {
        if (this.curline == null) {
            this.curline = this.lines[++this.row];
            if (this.curline == null) {
                this.curline = $('<div class="transcript-line"/>')[0];
                this.page.appendChild(this.curline);
                this.lines[this.row] = this.curline;
                this.scrollToBottom();
            }
        }
    };
    TeleType.prototype.flushline = function () {
        this.curline = null;
        this.col = 0;
        this.movePrintHead(false);
    };
    TeleType.prototype.addtext = function (line, style) {
        this.ensureline();
        if (line.length) {
            // in fixed mode, only do characters
            if (this.fixed && line.length > 1) {
                for (var i = 0; i < line.length; i++)
                    this.addtext(line[i], style);
                return;
            }
            // process control codes
            if (line.length == 1) {
                var ch = line.charCodeAt(0);
                switch (ch) {
                    case 7:
                        if (this.bell)
                            this.bell.play();
                        break;
                    case 8:
                        if (this.col > 0)
                            this.col--;
                        break;
                    case 12:
                        this.formfeed();
                        break;
                    case 13:
                        this.col = 0;
                        break;
                }
                if (ch < 32)
                    return; // ignore non-printables
            }
            var span = $("<span/>").text(line);
            for (var i = 0; i < 8; i++) {
                if (style & (1 << i))
                    span.addClass("transcript-style-" + (1 << i));
            }
            if (this.reverse)
                span.addClass("transcript-reverse");
            //span.data('vmip', this.vm.pc);
            // in fixed mode, we can overwrite individual characters
            if (this.fixed && line.length == 1 && this.col < this.curline.childNodes.length) {
                this.curline.replaceChild(span[0], this.curline.childNodes[this.col]);
            }
            else {
                span.appendTo(this.curline);
            }
            this.col += line.length;
            // wrap @ 80 columns (TODO: const)
            if (this.fixed && this.col >= this.ncols)
                this.flushline();
            this.ncharsout += line.length;
            this.movePrintHead(true);
        }
    };
    TeleType.prototype.newline = function () {
        this.flushline();
        this.ensureline();
    };
    TeleType.prototype.print = function (val) {
        // split by newlines
        var lines = val.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (i > 0)
                this.newline();
            this.addtext(lines[i], this.curstyle);
        }
    };
    TeleType.prototype.move_cursor = function (col, row) {
        if (!this.fixed)
            return; // fixed windows only
        // ensure enough row elements
        while (this.lines.length <= row) {
            this.flushline();
            this.ensureline();
        }
        // select row element
        this.curline = this.lines[row];
        this.row = row;
        // get children in row (individual text cells)
        var children = $(this.curline).children();
        // add whitespace to line?
        if (children.length > col) {
            this.col = col;
        }
        else {
            while (this.col < col)
                this.addtext(' ', this.curstyle);
        }
    };
    TeleType.prototype.setrows = function (size) {
        if (!this.fixed)
            return; // fixed windows only
        // truncate rows?
        var allrows = $(this.page).children();
        if (allrows.length > size) {
            this.flushline();
            allrows.slice(size).remove();
            this.lines = this.lines.slice(0, size);
            //this.move_cursor(0,0); 
        }
    };
    TeleType.prototype.formfeed = function () {
        for (var i = 0; i < 60; i++) {
            this.newline();
            this.ensureline();
        }
    };
    TeleType.prototype.scrollToBottom = function () {
        this.curline.scrollIntoView();
    };
    TeleType.prototype.movePrintHead = function (printing) {
        /*
        var ph = $("#printhead"); // TODO: speed?
        var x = $(this.page).position().left + this.col * ($(this.page).width() / 80) - 200;
        ph.stop().animate({left: x}, {duration:20});
        //ph.offset({left: x});
        if (printing) ph.addClass("printing");
        else ph.removeClass("printing");
        */
    };
    TeleType.prototype.showPrintHead = function (show) {
        /*
        var ph = $("#printhead"); // TODO: speed?
        if (show) ph.show(); else ph.hide();
        */
    };
    TeleType.prototype.resize = function (columns) {
        // set font size proportional to window width
        var charwidth = $(this.page).width() * 1.6 / columns;
        $(this.page).css('font-size', charwidth + 'px');
        this.scrollToBottom();
    };
    TeleType.prototype.saveState = function () {
        return {
            curstyle: this.curstyle,
            reverse: this.reverse,
            col: this.col,
            row: this.row,
            ncharsout: this.ncharsout,
            lines: this.lines.map(function (line) { return line.cloneNode(true); }),
        };
    };
    TeleType.prototype.loadState = function (state) {
        this.curstyle = state.curstyle;
        this.reverse = state.reverse;
        this.col = state.col;
        this.row = state.row;
        this.ncharsout = state.ncharsout;
        $(this.page).empty();
        for (var i = 0; i < state.lines.length; i++) {
            this.page.appendChild(state.lines[i]);
        }
        this.lines = state.lines;
        this.curline = state.lines[this.row];
    };
    return TeleType;
}());
exports.TeleType = TeleType;
var TeleTypeWithKeyboard = /** @class */ (function (_super) {
    __extends(TeleTypeWithKeyboard, _super);
    function TeleTypeWithKeyboard(page, fixed, input) {
        var _this = _super.call(this, page, fixed) || this;
        _this.msecPerLine = 100; // IBM 1403
        _this.keepinput = true;
        _this.keephandler = true;
        _this.uppercaseOnly = false;
        _this.splitInput = false;
        _this.focused = true;
        _this.scrolling = 0;
        _this.input = input;
        _this.input.onkeypress = function (e) {
            _this.sendkey(e);
        };
        _this.input.onfocus = function (e) {
            _this.focused = true;
            console.log('inputline gained focus');
        };
        $("#workspace").on('click', function (e) {
            _this.focused = false;
            console.log('inputline lost focus');
        });
        _this.page.onclick = function (e) {
            _this.input.focus();
        };
        return _this;
    }
    TeleTypeWithKeyboard.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.hideinput();
        this.waitingfor = null;
    };
    TeleTypeWithKeyboard.prototype.focusinput = function () {
        this.ensureline();
        this.showPrintHead(false);
        // don't steal focus while editing
        if (this.keepinput)
            $(this.input).css('visibility', 'visible');
        else
            $(this.input).appendTo(this.curline).show()[0];
        // scroll to bottom
        this.scrollToBottom();
        // refocus?
        if (this.focused) {
            $(this.input).focus();
        }
        // change size
        if (this.waitingfor == 'char')
            $(this.input).addClass('transcript-input-char');
        else
            $(this.input).removeClass('transcript-input-char');
        this.lastInputRequestTime = Date.now();
    };
    TeleTypeWithKeyboard.prototype.hideinput = function () {
        this.showPrintHead(true);
        if (this.keepinput)
            $(this.input).css('visibility', 'hidden');
        else
            $(this.input).appendTo($(this.page).parent()).hide();
    };
    TeleTypeWithKeyboard.prototype.clearinput = function () {
        this.input.value = '';
        this.waitingfor = null;
    };
    TeleTypeWithKeyboard.prototype.cancelinput = function () {
        this.sendinput('');
    };
    TeleTypeWithKeyboard.prototype.sendkey = function (e) {
        if (this.waitingfor == 'line') {
            if (e.key == "Enter") {
                this.sendinput(this.input.value.toString());
            }
        }
        else if (this.waitingfor == 'char') {
            this.sendchar(e.keyCode);
            e.preventDefault();
        }
    };
    TeleTypeWithKeyboard.prototype.sendinput = function (s) {
        if (this.resolveInput) {
            var elapsed = Date.now() - this.lastInputRequestTime;
            if (this.uppercaseOnly)
                s = s.toUpperCase(); // TODO: always uppercase?
            this.addtext(s, 4);
            this.flushline();
            this.clearinput();
            this.hideinput(); // keep from losing input handlers
            var vals = this.splitInput ? s.split(',') : null;
            this.resolveInput({ line: s, vals: vals, elapsed: elapsed / 1000 });
            if (!this.keephandler)
                this.resolveInput = null;
        }
    };
    TeleTypeWithKeyboard.prototype.sendchar = function (code) {
        this.sendinput(String.fromCharCode(code));
    };
    TeleTypeWithKeyboard.prototype.ensureline = function () {
        if (!this.keepinput)
            $(this.input).hide();
        _super.prototype.ensureline.call(this);
    };
    TeleTypeWithKeyboard.prototype.scrollToBottom = function () {
        var _this = this;
        if (this.scrolldiv) {
            this.scrolling++;
            var top = $(this.page).height() + $(this.input).height();
            $(this.scrolldiv).stop().animate({ scrollTop: top }, this.msecPerLine, 'swing', function () {
                _this.scrolling = 0;
                _this.ncharsout = 0;
            });
        }
        else {
            this.input.scrollIntoView();
        }
    };
    TeleTypeWithKeyboard.prototype.isBusy = function () {
        // stop execution when scrolling and printing non-newlines
        return this.scrolling > 0 && this.ncharsout > 0;
    };
    return TeleTypeWithKeyboard;
}(TeleType));
exports.TeleTypeWithKeyboard = TeleTypeWithKeyboard;
//# sourceMappingURL=teletype.js.map