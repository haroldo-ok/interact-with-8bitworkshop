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
exports.AssetEditorView = exports.FrameCallsView = exports.CallStackView = exports.DebugBrowserView = exports.StateBrowserView = exports.TreeViewBase = exports.ProbeSymbolView = exports.ProbeLogView = exports.RasterPCHeatMapView = exports.AddressHeatMapView = exports.MemoryMapView = exports.BinaryFileView = exports.VRAMMemoryView = exports.MemoryView = exports.ListingView = exports.DisassemblerView = exports.SourceEditor = exports.textMapFunctions = exports.isMobileDevice = void 0;
var baseplatform_1 = require("../common/baseplatform");
var util_1 = require("../common/util");
var ui_1 = require("./ui");
var recorder_1 = require("../common/recorder");
var emu_1 = require("../common/emu");
var pixed = require("./pixeleditor");
;
// detect mobile (https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device)
exports.isMobileDevice = window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches;
// helper function for editor
function jumpToLine(ed, i) {
    var t = ed.charCoords({ line: i, ch: 0 }, "local").top;
    var middleHeight = ed.getScrollerElement().offsetHeight / 2;
    ed.scrollTo(null, t - middleHeight - 5);
}
function createTextSpan(text, className) {
    var span = document.createElement("span");
    span.setAttribute("class", className);
    span.appendChild(document.createTextNode(text));
    return span;
}
// TODO: https://stackoverflow.com/questions/10463518/converting-em-to-px-in-javascript-and-getting-default-font-size
function getVisibleEditorLineHeight() {
    return $("#booksMenuButton").first().height();
}
function newDiv(parent, cls) {
    var div = $(document.createElement("div"));
    if (parent)
        div.appendTo(parent);
    if (cls)
        div.addClass(cls);
    return div;
}
/////
var MAX_ERRORS = 200;
var MODEDEFS = {
    default: { theme: 'mbo' },
    '6502': { isAsm: true },
    z80: { isAsm: true },
    jsasm: { isAsm: true },
    gas: { isAsm: true },
    inform6: { theme: 'cobalt' },
    markdown: { lineWrap: true },
    fastbasic: { noGutters: true },
    basic: { noLineNumbers: true, noGutters: true },
};
exports.textMapFunctions = {
    input: null
};
var SourceEditor = /** @class */ (function () {
    function SourceEditor(path, mode) {
        this.dirtylisting = true;
        this.errormsgs = [];
        this.errorwidgets = [];
        this.errormarks = [];
        this.path = path;
        this.mode = mode;
    }
    SourceEditor.prototype.createDiv = function (parent) {
        var div = document.createElement('div');
        div.setAttribute("class", "editor");
        parent.appendChild(div);
        var text = ui_1.current_project.getFile(this.path);
        var asmOverride = text && this.mode == 'verilog' && /__asm\b([\s\S]+?)\b__endasm\b/.test(text);
        this.newEditor(div, asmOverride);
        if (text) {
            this.setText(text); // TODO: this calls setCode() and builds... it shouldn't
            this.editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 0 }, { scroll: true }); // move cursor to start
        }
        this.setupEditor();
        return div;
    };
    SourceEditor.prototype.newEditor = function (parent, isAsmOverride) {
        var modedef = MODEDEFS[this.mode] || MODEDEFS.default;
        var isAsm = isAsmOverride || modedef.isAsm;
        var lineWrap = !!modedef.lineWrap;
        var theme = modedef.theme || MODEDEFS.default.theme;
        var lineNums = !modedef.noLineNumbers && !exports.isMobileDevice;
        if (ui_1.qs['embed'])
            lineNums = false; // no line numbers while embedded
        var gutters = ["CodeMirror-linenumbers", "gutter-offset", "gutter-info"];
        if (isAsm)
            gutters = ["CodeMirror-linenumbers", "gutter-offset", "gutter-bytes", "gutter-clock", "gutter-info"];
        if (modedef.noGutters || exports.isMobileDevice)
            gutters = ["gutter-info"];
        this.editor = CodeMirror(parent, {
            theme: theme,
            lineNumbers: lineNums,
            matchBrackets: true,
            tabSize: 8,
            indentAuto: true,
            lineWrapping: lineWrap,
            gutters: gutters
        });
    };
    SourceEditor.prototype.setupEditor = function () {
        var _this = this;
        var timer;
        // update file in project (and recompile) when edits made
        this.editor.on('changes', function (ed, changeobj) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                ui_1.current_project.updateFile(_this.path, _this.editor.getValue());
            }, 300);
        });
        // inspect symbol when it's highlighted (double-click)
        this.editor.on('cursorActivity', function (ed) {
            var start = _this.editor.getCursor(true);
            var end = _this.editor.getCursor(false);
            if (start.line == end.line && start.ch < end.ch && end.ch - start.ch < 80) {
                var name = _this.editor.getSelection();
                _this.inspect(name);
            }
            else {
                _this.inspect(null);
            }
        });
        // gutter clicked
        this.editor.on("gutterClick", function (cm, n) {
            _this.toggleBreakpoint(n);
        });
        // set editor mode for highlighting, etc
        this.editor.setOption("mode", this.mode);
        // change text?
        this.editor.on('beforeChange', function (cm, chgobj) {
            if (exports.textMapFunctions.input && chgobj.text)
                chgobj.text = chgobj.text.map(exports.textMapFunctions.input);
        });
    };
    SourceEditor.prototype.inspect = function (ident) {
        var result;
        if (ui_1.platform.inspect) {
            result = ui_1.platform.inspect(ident);
        }
        if (this.inspectWidget) {
            this.inspectWidget.clear();
            this.inspectWidget = null;
        }
        if (result) {
            var infospan = createTextSpan(result, "tooltipinfoline");
            var line = this.editor.getCursor().line;
            this.inspectWidget = this.editor.addLineWidget(line, infospan, { above: false });
        }
    };
    SourceEditor.prototype.setText = function (text) {
        var i, j;
        var oldtext = this.editor.getValue();
        if (oldtext != text) {
            this.editor.setValue(text);
            /*
            // find minimum range to undo
            for (i=0; i<oldtext.length && i<text.length && text[i] == oldtext[i]; i++) { }
            for (j=0; j<oldtext.length && j<text.length && text[text.length-1-j] == oldtext[oldtext.length-1-j]; j++) { }
            //console.log(i,j,oldtext.substring(i,oldtext.length-j));
            this.replaceSelection(i, oldtext.length-j, text.substring(i, text.length-j)); // calls setCode()
            */
            // clear history if setting empty editor
            if (oldtext == '') {
                this.editor.clearHistory();
            }
        }
    };
    SourceEditor.prototype.insertText = function (text) {
        var cur = this.editor.getCursor();
        this.editor.replaceRange(text, cur, cur);
    };
    SourceEditor.prototype.replaceSelection = function (start, end, text) {
        this.editor.setSelection(this.editor.posFromIndex(start), this.editor.posFromIndex(end));
        this.editor.replaceSelection(text);
    };
    SourceEditor.prototype.getValue = function () {
        return this.editor.getValue();
    };
    SourceEditor.prototype.getPath = function () { return this.path; };
    SourceEditor.prototype.addError = function (info) {
        // only mark errors with this filename, or without any filename
        if (!info.path || this.path.endsWith(info.path)) {
            var numLines = this.editor.lineCount();
            var line = info.line - 1;
            if (line < 0 || line >= numLines)
                line = 0;
            this.addErrorMarker(line, info.msg);
            if (info.start != null) {
                var markOpts = { className: "mark-error", inclusiveLeft: true };
                var start = { line: line, ch: info.end ? info.start : info.start - 1 };
                var end = { line: line, ch: info.end ? info.end : info.start };
                var mark = this.editor.markText(start, end, markOpts);
                this.errormarks.push(mark);
            }
        }
    };
    SourceEditor.prototype.addErrorMarker = function (line, msg) {
        var _this = this;
        var div = document.createElement("div");
        div.setAttribute("class", "tooltipbox tooltiperror");
        div.appendChild(document.createTextNode("\u24cd"));
        this.editor.setGutterMarker(line, "gutter-info", div);
        this.errormsgs.push({ line: line, msg: msg });
        // expand line widgets when mousing over errors
        $(div).mouseover(function (e) {
            _this.expandErrors();
        });
    };
    SourceEditor.prototype.addErrorLine = function (line, msg) {
        var errspan = createTextSpan(msg, "tooltiperrorline");
        this.errorwidgets.push(this.editor.addLineWidget(line, errspan));
    };
    SourceEditor.prototype.expandErrors = function () {
        var e;
        while (e = this.errormsgs.shift()) {
            this.addErrorLine(e.line, e.msg);
        }
    };
    SourceEditor.prototype.markErrors = function (errors) {
        // TODO: move cursor to error line if offscreen?
        this.clearErrors();
        errors = errors.slice(0, MAX_ERRORS);
        for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
            var info = errors_1[_i];
            this.addError(info);
        }
    };
    SourceEditor.prototype.clearErrors = function () {
        this.dirtylisting = true;
        // clear line widgets
        this.editor.clearGutter("gutter-info");
        this.errormsgs = [];
        while (this.errorwidgets.length)
            this.errorwidgets.shift().clear();
        while (this.errormarks.length)
            this.errormarks.shift().clear();
    };
    SourceEditor.prototype.getSourceFile = function () { return this.sourcefile; };
    SourceEditor.prototype.updateListing = function () {
        // update editor annotations
        // TODO: recreate editor if gutter-bytes is used (verilog)
        this.clearErrors();
        this.editor.clearGutter("gutter-bytes");
        this.editor.clearGutter("gutter-offset");
        this.editor.clearGutter("gutter-clock");
        var lstlines = this.sourcefile.lines || [];
        for (var _i = 0, lstlines_1 = lstlines; _i < lstlines_1.length; _i++) {
            var info = lstlines_1[_i];
            if (info.offset >= 0) {
                this.setGutter("gutter-offset", info.line - 1, util_1.hex(info.offset & 0xffff, 4));
            }
            if (info.insns) {
                var insnstr = info.insns.length > 9 ? ("...") : info.insns;
                this.setGutter("gutter-bytes", info.line - 1, insnstr);
                if (info.iscode) {
                    // TODO: labels trick this part?
                    if (info.cycles) {
                        this.setGutter("gutter-clock", info.line - 1, info.cycles + "");
                    }
                    else if (ui_1.platform.getOpcodeMetadata) {
                        var opcode = parseInt(info.insns.split(" ")[0], 16);
                        var meta = ui_1.platform.getOpcodeMetadata(opcode, info.offset);
                        if (meta) {
                            var clockstr = meta.minCycles + "";
                            this.setGutter("gutter-clock", info.line - 1, clockstr);
                        }
                    }
                }
            }
        }
    };
    SourceEditor.prototype.setGutter = function (type, line, text) {
        var lineinfo = this.editor.lineInfo(line);
        if (lineinfo && lineinfo.gutterMarkers && lineinfo.gutterMarkers[type]) {
            // do not replace existing marker
        }
        else {
            var textel = document.createTextNode(text);
            this.editor.setGutterMarker(line, type, textel);
        }
    };
    SourceEditor.prototype.setGutterBytes = function (line, s) {
        this.setGutter("gutter-bytes", line - 1, s);
    };
    SourceEditor.prototype.setTimingResult = function (result) {
        this.editor.clearGutter("gutter-bytes");
        if (this.sourcefile == null)
            return;
        // show the lines
        for (var _i = 0, _a = Object.keys(this.sourcefile.line2offset); _i < _a.length; _i++) {
            var line = _a[_i];
            var pc = this.sourcefile.line2offset[line];
            var minclocks = result.pc2minclocks[pc];
            var maxclocks = result.pc2maxclocks[pc];
            if (minclocks >= 0 && maxclocks >= 0) {
                var s;
                if (maxclocks == minclocks)
                    s = minclocks + "";
                else
                    s = minclocks + "-" + maxclocks;
                if (maxclocks == result.MAX_CLOCKS)
                    s += "+";
                this.setGutterBytes(parseInt(line), s);
            }
        }
    };
    SourceEditor.prototype.setCurrentLine = function (line, moveCursor) {
        var _this = this;
        var blocked = ui_1.platform.isBlocked && ui_1.platform.isBlocked();
        var addCurrentMarker = function (line) {
            var div = document.createElement("div");
            var cls = blocked ? 'currentpc-marker-blocked' : 'currentpc-marker';
            div.classList.add(cls);
            div.appendChild(document.createTextNode("\u25b6"));
            _this.editor.setGutterMarker(line.line - 1, "gutter-info", div);
        };
        this.clearCurrentLine(moveCursor);
        if (line) {
            addCurrentMarker(line);
            if (moveCursor) {
                this.editor.setCursor({ line: line.line - 1, ch: line.start || 0 }, { scroll: true });
            }
            var cls = blocked ? 'currentpc-span-blocked' : 'currentpc-span';
            var markOpts = { className: cls, inclusiveLeft: true };
            if (line.start || line.end)
                this.markCurrentPC = this.editor.markText({ line: line.line - 1, ch: line.start }, { line: line.line - 1, ch: line.end || line.start + 1 }, markOpts);
            else
                this.markCurrentPC = this.editor.markText({ line: line.line - 1, ch: 0 }, { line: line.line, ch: 0 }, markOpts);
            this.currentDebugLine = line;
        }
    };
    SourceEditor.prototype.clearCurrentLine = function (moveCursor) {
        if (this.currentDebugLine) {
            this.editor.clearGutter("gutter-info");
            if (moveCursor)
                this.editor.setSelection(this.editor.getCursor());
            this.currentDebugLine = null;
        }
        if (this.markCurrentPC) {
            this.markCurrentPC.clear();
            this.markCurrentPC = null;
        }
    };
    SourceEditor.prototype.getActiveLine = function () {
        if (this.sourcefile) {
            var cpustate = ui_1.lastDebugState && ui_1.lastDebugState.c;
            if (!cpustate && ui_1.platform.getCPUState && !ui_1.platform.isRunning())
                cpustate = ui_1.platform.getCPUState();
            if (cpustate) {
                var EPC = (cpustate && (cpustate.EPC || cpustate.PC));
                var res = this.sourcefile.findLineForOffset(EPC, 15);
                return res;
            }
        }
    };
    SourceEditor.prototype.refreshDebugState = function (moveCursor) {
        // TODO: only if line changed
        // TODO: remove after compilation
        this.clearCurrentLine(moveCursor);
        var line = this.getActiveLine();
        if (line) {
            this.setCurrentLine(line, moveCursor);
        }
    };
    SourceEditor.prototype.refreshListing = function () {
        // lookup corresponding sourcefile for this file, using listing
        var lst = ui_1.current_project.getListingForFile(this.path);
        if (lst && lst.sourcefile && lst.sourcefile !== this.sourcefile) {
            this.sourcefile = lst.sourcefile;
            this.dirtylisting = true;
        }
        if (!this.sourcefile || !this.dirtylisting)
            return;
        this.updateListing();
        this.dirtylisting = false;
    };
    SourceEditor.prototype.refresh = function (moveCursor) {
        this.refreshListing();
        this.refreshDebugState(moveCursor);
    };
    SourceEditor.prototype.tick = function () {
        this.refreshDebugState(false);
    };
    SourceEditor.prototype.getLine = function (line) {
        return this.editor.getLine(line - 1);
    };
    SourceEditor.prototype.getCurrentLine = function () {
        return this.editor.getCursor().line + 1;
    };
    SourceEditor.prototype.getCursorPC = function () {
        var line = this.getCurrentLine();
        while (this.sourcefile && line >= 0) {
            var pc = this.sourcefile.line2offset[line];
            if (pc >= 0)
                return pc;
            line--;
        }
        return -1;
    };
    SourceEditor.prototype.undoStep = function () {
        this.editor.execCommand('undo');
    };
    SourceEditor.prototype.toggleBreakpoint = function (lineno) {
        // TODO: we have to always start at beginning of frame
        if (this.sourcefile != null) {
            var targetPC = this.sourcefile.line2offset[lineno + 1];
            /*
            var bpid = "pc" + targetPC;
            if (platform.hasBreakpoint(bpid)) {
              platform.clearBreakpoint(bpid);
            } else {
              platform.setBreakpoint(bpid, () => {
                return platform.getPC() == targetPC;
              });
            }
            */
            ui_1.runToPC(targetPC);
        }
    };
    return SourceEditor;
}());
exports.SourceEditor = SourceEditor;
///
var disasmWindow = 1024; // disassemble this many bytes around cursor
var DisassemblerView = /** @class */ (function () {
    function DisassemblerView() {
    }
    DisassemblerView.prototype.getDisasmView = function () { return this.disasmview; };
    DisassemblerView.prototype.createDiv = function (parent) {
        var div = document.createElement('div');
        div.setAttribute("class", "editor");
        parent.appendChild(div);
        this.newEditor(div);
        return div;
    };
    DisassemblerView.prototype.newEditor = function (parent) {
        this.disasmview = CodeMirror(parent, {
            mode: 'z80',
            theme: 'cobalt',
            tabSize: 8,
            readOnly: true,
            styleActiveLine: true
        });
    };
    // TODO: too many globals
    DisassemblerView.prototype.refresh = function (moveCursor) {
        var state = ui_1.lastDebugState || ui_1.platform.saveState(); // TODO?
        var pc = state.c ? state.c.PC : 0;
        var curline = 0;
        var selline = 0;
        var addr2symbol = (ui_1.platform.debugSymbols && ui_1.platform.debugSymbols.addr2symbol) || {};
        // TODO: not perfect disassembler
        var disassemble = function (start, end) {
            if (start < 0)
                start = 0;
            if (end > 0xffff)
                end = 0xffff;
            // TODO: use pc2visits
            var a = start;
            var s = "";
            while (a < end) {
                var disasm = ui_1.platform.disassemble(a, ui_1.platform.readAddress.bind(ui_1.platform));
                /* TODO: look thru all source files
                var srclinenum = sourcefile && this.sourcefile.offset2line[a];
                if (srclinenum) {
                  var srcline = getActiveEditor().getLine(srclinenum);
                  if (srcline && srcline.trim().length) {
                    s += "; " + srclinenum + ":\t" + srcline + "\n";
                    curline++;
                  }
                }
                */
                var bytes = "";
                var comment = "";
                for (var i = 0; i < disasm.nbytes; i++)
                    bytes += util_1.hex(ui_1.platform.readAddress(a + i));
                while (bytes.length < 14)
                    bytes += ' ';
                var dstr = disasm.line;
                if (addr2symbol && disasm.isaddr) { // TODO: move out
                    dstr = dstr.replace(/([^#])[$]([0-9A-F]+)/, function (substr) {
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        var addr = parseInt(args[1], 16);
                        var sym = addr2symbol[addr];
                        if (sym)
                            return (args[0] + sym);
                        sym = addr2symbol[addr - 1];
                        if (sym)
                            return (args[0] + sym + "+1");
                        return substr;
                    });
                }
                if (addr2symbol) {
                    var sym = addr2symbol[a];
                    if (sym) {
                        comment = "; " + sym;
                    }
                }
                var dline = util_1.hex(parseInt(a), 4) + "\t" + util_1.rpad(bytes, 14) + "\t" + util_1.rpad(dstr, 30) + comment + "\n";
                s += dline;
                if (a == pc)
                    selline = curline;
                curline++;
                a += disasm.nbytes || 1;
            }
            return s;
        };
        var text = disassemble(pc - disasmWindow, pc) + disassemble(pc, pc + disasmWindow);
        this.disasmview.setValue(text);
        if (moveCursor) {
            this.disasmview.setCursor(selline, 0);
        }
        jumpToLine(this.disasmview, selline);
    };
    DisassemblerView.prototype.getCursorPC = function () {
        var line = this.disasmview.getCursor().line;
        if (line >= 0) {
            var toks = this.disasmview.getLine(line).trim().split(/\s+/);
            if (toks && toks.length >= 1) {
                var pc = parseInt(toks[0], 16);
                if (pc >= 0)
                    return pc;
            }
        }
        return -1;
    };
    return DisassemblerView;
}());
exports.DisassemblerView = DisassemblerView;
///
var ListingView = /** @class */ (function (_super) {
    __extends(ListingView, _super);
    function ListingView(lstfn) {
        var _this = _super.call(this) || this;
        _this.path = lstfn;
        return _this;
    }
    ListingView.prototype.refreshListing = function () {
        // lookup corresponding assemblyfile for this file, using listing
        var lst = ui_1.current_project.getListingForFile(this.path);
        // TODO?
        this.assemblyfile = lst && (lst.assemblyfile || lst.sourcefile);
    };
    ListingView.prototype.refresh = function (moveCursor) {
        this.refreshListing();
        // load listing text into editor
        if (!this.assemblyfile)
            return;
        var asmtext = this.assemblyfile.text;
        var disasmview = this.getDisasmView();
        disasmview.setValue(asmtext);
        // go to PC
        if (!ui_1.platform.saveState)
            return;
        var state = ui_1.lastDebugState || ui_1.platform.saveState();
        var pc = state.c ? (state.c.EPC || state.c.PC) : 0;
        if (pc >= 0 && this.assemblyfile) {
            var res = this.assemblyfile.findLineForOffset(pc, 15);
            if (res) {
                // set cursor while debugging
                if (moveCursor) {
                    disasmview.setCursor(res.line - 1, 0);
                }
                jumpToLine(disasmview, res.line - 1);
            }
        }
    };
    return ListingView;
}(DisassemblerView));
exports.ListingView = ListingView;
var VirtualTextScroller = /** @class */ (function () {
    function VirtualTextScroller(parent) {
        var div = document.createElement('div');
        div.setAttribute("class", "memdump");
        parent.appendChild(div);
        this.maindiv = div;
    }
    VirtualTextScroller.prototype.create = function (workspace, maxRowCount, fn) {
        this.getLineAt = fn;
        this.memorylist = new VirtualList({
            w: $(workspace).width(),
            h: $(workspace).height(),
            itemHeight: getVisibleEditorLineHeight(),
            totalRows: maxRowCount,
            generatorFn: function (row) {
                var line = fn(row);
                var linediv = document.createElement("div");
                linediv.appendChild(document.createTextNode(line.text));
                if (line.clas != null)
                    linediv.className = line.clas;
                return linediv;
            }
        });
        $(this.maindiv).append(this.memorylist.container);
    };
    // TODO: refactor with elsewhere
    VirtualTextScroller.prototype.refresh = function () {
        var _this = this;
        if (this.memorylist) {
            $(this.maindiv).find('[data-index]').each(function (i, e) {
                var div = e;
                var row = parseInt(div.getAttribute('data-index'));
                var oldtext = div.innerText;
                var line = _this.getLineAt(row);
                var newtext = line.text;
                if (oldtext != newtext) {
                    div.innerText = newtext;
                    if (line.clas != null && !div.classList.contains(line.clas)) {
                        var oldclasses = Array.from(div.classList);
                        oldclasses.forEach(function (c) { return div.classList.remove(c); });
                        div.classList.add('vrow');
                        div.classList.add(line.clas);
                    }
                }
            });
        }
    };
    return VirtualTextScroller;
}());
///
function ignoreSymbol(sym) {
    return sym.endsWith('_SIZE__') || sym.endsWith('_LAST__') || sym.endsWith('STACKSIZE__') || sym.endsWith('FILEOFFS__')
        || sym.startsWith('l__') || sym.startsWith('s__') || sym.startsWith('.__.');
}
// TODO: make it use debug state
// TODO: make it safe (load/restore state?)
// TODO: refactor w/ VirtualTextLine
var MemoryView = /** @class */ (function () {
    function MemoryView() {
        this.recreateOnResize = true;
        this.totalRows = 0x1400;
    }
    MemoryView.prototype.createDiv = function (parent) {
        var div = document.createElement('div');
        div.setAttribute("class", "memdump");
        parent.appendChild(div);
        this.showMemoryWindow(parent, div);
        return this.maindiv = div;
    };
    MemoryView.prototype.showMemoryWindow = function (workspace, parent) {
        var _this = this;
        this.memorylist = new VirtualList({
            w: $(workspace).width(),
            h: $(workspace).height(),
            itemHeight: getVisibleEditorLineHeight(),
            totalRows: this.totalRows,
            generatorFn: function (row) {
                var s = _this.getMemoryLineAt(row);
                var linediv = document.createElement("div");
                if (_this.dumplines) {
                    var dlr = _this.dumplines[row];
                    if (dlr)
                        linediv.classList.add('seg_' + _this.getMemorySegment(_this.dumplines[row].a));
                }
                linediv.appendChild(document.createTextNode(s));
                return linediv;
            }
        });
        $(parent).append(this.memorylist.container);
        this.tick();
        if (ui_1.compparams && this.dumplines)
            this.scrollToAddress(ui_1.compparams.data_start);
    };
    MemoryView.prototype.scrollToAddress = function (addr) {
        if (this.dumplines) {
            this.memorylist.scrollToItem(this.findMemoryWindowLine(addr));
        }
    };
    MemoryView.prototype.refresh = function () {
        this.dumplines = null;
        this.tick();
    };
    MemoryView.prototype.tick = function () {
        var _this = this;
        if (this.memorylist) {
            $(this.maindiv).find('[data-index]').each(function (i, e) {
                var div = $(e);
                var row = parseInt(div.attr('data-index'));
                var oldtext = div.text();
                var newtext = _this.getMemoryLineAt(row);
                if (oldtext != newtext)
                    div.text(newtext);
            });
        }
    };
    MemoryView.prototype.getMemoryLineAt = function (row) {
        var offset = row * 16;
        var n1 = 0;
        var n2 = 16;
        var sym;
        if (this.getDumpLines()) {
            var dl = this.dumplines[row];
            if (dl) {
                offset = dl.a & 0xfff0;
                n1 = dl.a - offset;
                n2 = n1 + dl.l;
                sym = dl.s;
            }
            else {
                return '.';
            }
        }
        var s = util_1.hex(offset + n1, 4) + ' ';
        for (var i = 0; i < n1; i++)
            s += '   ';
        if (n1 > 8)
            s += ' ';
        for (var i = n1; i < n2; i++) {
            var read = this.readAddress(offset + i);
            if (i == 8)
                s += ' ';
            s += ' ' + (typeof read == 'number' ? util_1.hex(read, 2) : '??');
        }
        for (var i = n2; i < 16; i++)
            s += '   ';
        if (sym)
            s += '  ' + sym;
        return s;
    };
    MemoryView.prototype.readAddress = function (n) {
        return ui_1.platform.readAddress(n);
    };
    MemoryView.prototype.getDumpLineAt = function (line) {
        var d = this.dumplines[line];
        if (d) {
            return d.a + " " + d.s;
        }
    };
    // TODO: addr2symbol for ca65; and make it work without symbols
    MemoryView.prototype.getDumpLines = function () {
        var addr2sym = (ui_1.platform.debugSymbols && ui_1.platform.debugSymbols.addr2symbol) || {};
        if (!this.dumplines) {
            this.dumplines = [];
            var ofs = 0;
            var sym;
            for (var _i = 0, _a = Object.keys(addr2sym); _i < _a.length; _i++) {
                var _nextofs = _a[_i];
                var nextofs = parseInt(_nextofs); // convert from string (stupid JS)
                var nextsym = addr2sym[nextofs];
                if (sym) {
                    // ignore certain symbols
                    if (ignoreSymbol(sym)) {
                        sym = '';
                    }
                    while (ofs < nextofs) {
                        var ofs2 = (ofs + 16) & 0xffff0;
                        if (ofs2 > nextofs)
                            ofs2 = nextofs;
                        //if (ofs < 1000) console.log(ofs, ofs2, nextofs, sym);
                        this.dumplines.push({ a: ofs, l: ofs2 - ofs, s: sym });
                        ofs = ofs2;
                    }
                }
                sym = nextsym;
            }
        }
        return this.dumplines;
    };
    // TODO: use segments list?
    MemoryView.prototype.getMemorySegment = function (a) {
        if (ui_1.compparams) {
            if (a >= ui_1.compparams.data_start && a < ui_1.compparams.data_start + ui_1.compparams.data_size) {
                if (ui_1.platform.getSP && a >= ui_1.platform.getSP() - 15)
                    return 'stack';
                else
                    return 'data';
            }
            else if (a >= ui_1.compparams.code_start && a < ui_1.compparams.code_start + (ui_1.compparams.code_size || ui_1.compparams.rom_size))
                return 'code';
        }
        var segments = ui_1.current_project.segments;
        if (segments) {
            for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
                var seg = segments_1[_i];
                if (a >= seg.start && a < seg.start + seg.size) {
                    if (seg.type == 'rom')
                        return 'code';
                    if (seg.type == 'ram')
                        return 'data';
                    if (seg.type == 'io')
                        return 'io';
                }
            }
        }
        return 'unknown';
    };
    MemoryView.prototype.findMemoryWindowLine = function (a) {
        for (var i = 0; i < this.dumplines.length; i++)
            if (this.dumplines[i].a >= a)
                return i;
    };
    return MemoryView;
}());
exports.MemoryView = MemoryView;
var VRAMMemoryView = /** @class */ (function (_super) {
    __extends(VRAMMemoryView, _super);
    function VRAMMemoryView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.totalRows = 0x800;
        return _this;
    }
    VRAMMemoryView.prototype.readAddress = function (n) {
        return ui_1.platform.readVRAMAddress(n);
    };
    VRAMMemoryView.prototype.getMemorySegment = function (a) {
        return 'video';
    };
    VRAMMemoryView.prototype.getDumpLines = function () {
        return null;
    };
    return VRAMMemoryView;
}(MemoryView));
exports.VRAMMemoryView = VRAMMemoryView;
///
var BinaryFileView = /** @class */ (function () {
    function BinaryFileView(path, data) {
        this.recreateOnResize = true;
        this.path = path;
        this.data = data;
    }
    BinaryFileView.prototype.createDiv = function (parent) {
        this.vlist = new VirtualTextScroller(parent);
        this.vlist.create(parent, ((this.data.length + 15) >> 4), this.getMemoryLineAt.bind(this));
        return this.vlist.maindiv;
    };
    BinaryFileView.prototype.getMemoryLineAt = function (row) {
        var offset = row * 16;
        var n1 = 0;
        var n2 = 16;
        var s = util_1.hex(offset + n1, 4) + ' ';
        for (var i = 0; i < n1; i++)
            s += '   ';
        if (n1 > 8)
            s += ' ';
        for (var i = n1; i < n2; i++) {
            var read = this.data[offset + i];
            if (i == 8)
                s += ' ';
            s += ' ' + (read >= 0 ? util_1.hex(read, 2) : '  ');
        }
        return { text: s };
    };
    BinaryFileView.prototype.refresh = function () {
        this.vlist.refresh();
    };
    BinaryFileView.prototype.getPath = function () { return this.path; };
    return BinaryFileView;
}());
exports.BinaryFileView = BinaryFileView;
///
var MemoryMapView = /** @class */ (function () {
    function MemoryMapView() {
    }
    MemoryMapView.prototype.createDiv = function (parent) {
        this.maindiv = newDiv(parent, 'vertical-scroll');
        this.maindiv.css('display', 'grid');
        this.maindiv.css('grid-template-columns', '5em 40% 40%');
        return this.maindiv[0];
    };
    // TODO: overlapping segments (e.g. ROM + LC)
    MemoryMapView.prototype.addSegment = function (seg, newrow) {
        if (newrow) {
            var offset = $('<div class="segment-offset" style="grid-column-start:1"/>');
            offset.text('$' + util_1.hex(seg.start, 4));
            this.maindiv.append(offset);
        }
        var segdiv = $('<div class="segment"/>');
        if (!newrow)
            segdiv.css('grid-column-start', 3); // make sure it's on right side
        if (seg.last)
            segdiv.text(seg.name + " (" + (seg.last - seg.start) + " / " + seg.size + " bytes used)");
        else
            segdiv.text(seg.name + " (" + seg.size + " bytes)");
        if (seg.size >= 256) {
            var pad = (Math.log(seg.size) - Math.log(256)) * 0.5;
            segdiv.css('padding-top', pad + 'em');
            segdiv.css('padding-bottom', pad + 'em');
        }
        if (seg.type) {
            segdiv.addClass('segment-' + seg.type);
        }
        this.maindiv.append(segdiv);
        //var row = $('<div class="row"/>').append(offset, segdiv);
        //var container = $('<div class="container"/>').append(row);
        //this.maindiv.append(container);
        segdiv.click(function () {
            // TODO: what if memory browser does not exist?
            var memview = ui_1.projectWindows.createOrShow('#memory');
            memview.scrollToAddress(seg.start);
        });
    };
    MemoryMapView.prototype.refresh = function () {
        this.maindiv.empty();
        var segments = ui_1.current_project.segments;
        if (segments) {
            var curofs = 0;
            var laststart = -1;
            for (var _i = 0, segments_2 = segments; _i < segments_2.length; _i++) {
                var seg = segments_2[_i];
                //var used = seg.last ? (seg.last-seg.start) : seg.size;
                if (seg.start > curofs)
                    this.addSegment({ name: '', start: curofs, size: seg.start - curofs }, true);
                this.addSegment(seg, laststart != seg.start);
                laststart = seg.start;
                curofs = seg.start + seg.size;
            }
        }
    };
    return MemoryMapView;
}());
exports.MemoryMapView = MemoryMapView;
///
// TODO: clear buffer when scrubbing
var ProbeViewBaseBase = /** @class */ (function () {
    function ProbeViewBaseBase() {
        this.cumulativeData = false;
    }
    ProbeViewBaseBase.prototype.addr2symbol = function (addr) {
        var _addr2sym = (ui_1.platform.debugSymbols && ui_1.platform.debugSymbols.addr2symbol) || {};
        return _addr2sym[addr];
    };
    ProbeViewBaseBase.prototype.addr2str = function (addr) {
        var sym = this.addr2symbol(addr);
        if (typeof sym === 'string')
            return '$' + util_1.hex(addr) + ' (' + sym + ')';
        else
            return '$' + util_1.hex(addr);
    };
    ProbeViewBaseBase.prototype.showTooltip = function (s) {
        if (s) {
            if (!this.tooldiv) {
                this.tooldiv = document.createElement("div");
                this.tooldiv.setAttribute("class", "tooltiptrack");
                document.body.appendChild(this.tooldiv);
            }
            $(this.tooldiv).text(s).show();
        }
        else {
            $(this.tooldiv).hide();
        }
    };
    ProbeViewBaseBase.prototype.setVisible = function (showing) {
        if (showing) {
            this.probe = ui_1.platform.startProbing();
            this.probe.singleFrame = !this.cumulativeData;
            this.tick();
        }
        else {
            if (this.probe)
                this.probe.singleFrame = true;
            ui_1.platform.stopProbing();
            this.probe = null;
        }
    };
    ProbeViewBaseBase.prototype.redraw = function (eventfn) {
        var p = this.probe;
        if (!p || !p.idx)
            return; // if no probe, or if empty
        var row = 0;
        var col = 0;
        var clk = 0;
        for (var i = 0; i < p.idx; i++) {
            var word = p.buf[i];
            var addr = word & 0xffff;
            var value = (word >> 16) & 0xff;
            var op = word & 0xff000000;
            switch (op) {
                case recorder_1.ProbeFlags.SCANLINE:
                    row++;
                    col = 0;
                    break;
                case recorder_1.ProbeFlags.FRAME:
                    row = 0;
                    col = 0;
                    break;
                case recorder_1.ProbeFlags.CLOCKS:
                    col += addr;
                    clk += addr;
                    break;
                default:
                    eventfn(op, addr, col, row, clk, value);
                    break;
            }
        }
    };
    ProbeViewBaseBase.prototype.opToString = function (op, addr, value) {
        var s = "";
        switch (op) {
            case recorder_1.ProbeFlags.EXECUTE:
                s = "Exec";
                break;
            case recorder_1.ProbeFlags.MEM_READ:
                s = "Read";
                break;
            case recorder_1.ProbeFlags.MEM_WRITE:
                s = "Write";
                break;
            case recorder_1.ProbeFlags.IO_READ:
                s = "IO Read";
                break;
            case recorder_1.ProbeFlags.IO_WRITE:
                s = "IO Write";
                break;
            case recorder_1.ProbeFlags.VRAM_READ:
                s = "VRAM Read";
                break;
            case recorder_1.ProbeFlags.VRAM_WRITE:
                s = "VRAM Write";
                break;
            case recorder_1.ProbeFlags.INTERRUPT:
                s = "Interrupt";
                break;
            case recorder_1.ProbeFlags.ILLEGAL:
                s = "Error";
                break;
            case recorder_1.ProbeFlags.SP_PUSH:
                s = "Stack Push";
                break;
            case recorder_1.ProbeFlags.SP_POP:
                s = "Stack Pop";
                break;
            default: return "";
        }
        if (typeof addr == 'number')
            s += " " + this.addr2str(addr);
        if ((op & recorder_1.ProbeFlags.HAS_VALUE) && typeof value == 'number')
            s += " = $" + util_1.hex(value, 2);
        return s;
    };
    ProbeViewBaseBase.prototype.getOpRGB = function (op) {
        switch (op) {
            case recorder_1.ProbeFlags.EXECUTE: return 0x018001;
            case recorder_1.ProbeFlags.MEM_READ: return 0x800101;
            case recorder_1.ProbeFlags.MEM_WRITE: return 0x010180;
            case recorder_1.ProbeFlags.IO_READ: return 0x018080;
            case recorder_1.ProbeFlags.IO_WRITE: return 0xc00180;
            case recorder_1.ProbeFlags.VRAM_READ: return 0x808001;
            case recorder_1.ProbeFlags.VRAM_WRITE: return 0x4080c0;
            case recorder_1.ProbeFlags.INTERRUPT: return 0xcfcfcf;
            case recorder_1.ProbeFlags.ILLEGAL: return 0x3f3fff;
            default: return 0;
        }
    };
    return ProbeViewBaseBase;
}());
var ProbeViewBase = /** @class */ (function (_super) {
    __extends(ProbeViewBase, _super);
    function ProbeViewBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.recreateOnResize = true;
        return _this;
    }
    ProbeViewBase.prototype.createCanvas = function (parent, width, height) {
        var _this = this;
        var div = document.createElement('div');
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.classList.add('pixelated');
        canvas.style.width = '100%';
        canvas.style.height = '90vh'; // i hate css
        canvas.style.backgroundColor = 'black';
        canvas.style.cursor = 'crosshair';
        canvas.onmousemove = function (e) {
            var pos = emu_1.getMousePos(canvas, e);
            _this.showTooltip(_this.getTooltipText(pos.x, pos.y));
            $(_this.tooldiv).css('left', e.pageX + 10).css('top', e.pageY - 30);
        };
        canvas.onmouseout = function (e) {
            $(_this.tooldiv).hide();
        };
        parent.appendChild(div);
        div.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initCanvas();
        return this.maindiv = div;
    };
    ProbeViewBase.prototype.initCanvas = function () {
    };
    ProbeViewBase.prototype.getTooltipText = function (x, y) {
        return null;
    };
    ProbeViewBase.prototype.clear = function () {
    };
    ProbeViewBase.prototype.tick = function () {
        this.clear();
        this.redraw(this.drawEvent.bind(this));
    };
    return ProbeViewBase;
}(ProbeViewBaseBase));
var ProbeBitmapViewBase = /** @class */ (function (_super) {
    __extends(ProbeBitmapViewBase, _super);
    function ProbeBitmapViewBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.recreateOnResize = false;
        return _this;
    }
    ProbeBitmapViewBase.prototype.createDiv = function (parent) {
        var width = 160;
        var height = 262;
        try {
            width = Math.ceil(ui_1.platform['machine']['cpuCyclesPerLine']) || 256; // TODO
            height = Math.ceil(ui_1.platform['machine']['numTotalScanlines']) || 262; // TODO
        }
        catch (e) {
        }
        return this.createCanvas(parent, width, height);
    };
    ProbeBitmapViewBase.prototype.initCanvas = function () {
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        this.datau32 = new Uint32Array(this.imageData.data.buffer);
    };
    ProbeBitmapViewBase.prototype.getTooltipText = function (x, y) {
        var _this = this;
        x = x | 0;
        y = y | 0;
        var s = "";
        var lastroutine = null;
        var symstack = [];
        var lastcol = -1;
        this.redraw(function (op, addr, col, row, clk, value) {
            switch (op) {
                case recorder_1.ProbeFlags.EXECUTE:
                    lastroutine = _this.addr2symbol(addr) || lastroutine;
                    break;
                case recorder_1.ProbeFlags.SP_PUSH:
                    symstack.push(lastroutine);
                    break;
                case recorder_1.ProbeFlags.SP_POP:
                    lastroutine = symstack.pop();
                    break;
            }
            if (row == y && col <= x) {
                if (col != lastcol) {
                    s = "";
                    lastcol = col;
                }
                if (s == "" && lastroutine) {
                    s += "\n" + lastroutine;
                }
                s += "\n" + _this.opToString(op, addr, value);
            }
        });
        return 'X: ' + x + '  Y: ' + y + ' ' + s;
    };
    ProbeBitmapViewBase.prototype.refresh = function () {
        this.tick();
        this.datau32.fill(0xff000000);
    };
    ProbeBitmapViewBase.prototype.tick = function () {
        _super.prototype.tick.call(this);
        this.ctx.putImageData(this.imageData, 0, 0);
    };
    ProbeBitmapViewBase.prototype.clear = function () {
        this.datau32.fill(0xff000000);
    };
    return ProbeBitmapViewBase;
}(ProbeViewBase));
var AddressHeatMapView = /** @class */ (function (_super) {
    __extends(AddressHeatMapView, _super);
    function AddressHeatMapView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddressHeatMapView.prototype.createDiv = function (parent) {
        return this.createCanvas(parent, 256, 256);
    };
    AddressHeatMapView.prototype.clear = function () {
        for (var i = 0; i <= 0xffff; i++) {
            var v = ui_1.platform.readAddress(i);
            var rgb = (v >> 2) | (v & 0x1f);
            rgb |= (rgb << 8) | (rgb << 16);
            this.datau32[i] = rgb | 0xff000000;
        }
    };
    AddressHeatMapView.prototype.drawEvent = function (op, addr, col, row) {
        var rgb = this.getOpRGB(op);
        if (!rgb)
            return;
        var x = addr & 0xff;
        var y = (addr >> 8) & 0xff;
        var data = this.datau32[addr & 0xffff];
        data = data | rgb | 0xff000000;
        this.datau32[addr & 0xffff] = data;
    };
    AddressHeatMapView.prototype.getTooltipText = function (x, y) {
        var _this = this;
        var a = (x & 0xff) + (y << 8);
        var s = "";
        var pc = -1;
        var already = {};
        var lastroutine = null;
        var symstack = [];
        this.redraw(function (op, addr, col, row, clk, value) {
            switch (op) {
                case recorder_1.ProbeFlags.EXECUTE:
                    pc = addr;
                    lastroutine = _this.addr2symbol(addr) || lastroutine;
                    break;
                case recorder_1.ProbeFlags.SP_PUSH:
                    symstack.push(lastroutine);
                    break;
                case recorder_1.ProbeFlags.SP_POP:
                    lastroutine = symstack.pop();
                    break;
            }
            var key = op | pc;
            if (addr == a && !already[key]) {
                if (s == "" && lastroutine) {
                    s += "\n" + lastroutine;
                }
                s += "\nPC " + _this.addr2str(pc) + " " + _this.opToString(op, null, value);
                already[key] = 1;
            }
        });
        return this.addr2str(a) + s;
    };
    return AddressHeatMapView;
}(ProbeBitmapViewBase));
exports.AddressHeatMapView = AddressHeatMapView;
var RasterPCHeatMapView = /** @class */ (function (_super) {
    __extends(RasterPCHeatMapView, _super);
    function RasterPCHeatMapView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RasterPCHeatMapView.prototype.drawEvent = function (op, addr, col, row) {
        var iofs = col + row * this.canvas.width;
        var rgb = this.getOpRGB(op);
        if (!rgb)
            return;
        var data = this.datau32[iofs];
        data = data | rgb | 0xff000000;
        this.datau32[iofs] = data;
    };
    return RasterPCHeatMapView;
}(ProbeBitmapViewBase));
exports.RasterPCHeatMapView = RasterPCHeatMapView;
var ProbeLogView = /** @class */ (function (_super) {
    __extends(ProbeLogView, _super);
    function ProbeLogView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.recreateOnResize = true;
        return _this;
    }
    ProbeLogView.prototype.createDiv = function (parent) {
        this.vlist = new VirtualTextScroller(parent);
        this.vlist.create(parent, 160 * 262, this.getMemoryLineAt.bind(this));
        return this.vlist.maindiv;
    };
    ProbeLogView.prototype.getMemoryLineAt = function (row) {
        var s = "";
        var c = "seg_data";
        var line = this.dumplines && this.dumplines[row];
        if (line != null) {
            var xtra = line.info.join(", ");
            s = "(" + util_1.lpad(line.row, 4) + ", " + util_1.lpad(line.col, 4) + ")  " + util_1.rpad(line.asm || "", 20) + xtra;
            if (xtra.indexOf("Write ") >= 0)
                c = "seg_io";
            // if (xtra.indexOf("Stack ") >= 0) c = "seg_code";
        }
        return { text: s, clas: c };
    };
    ProbeLogView.prototype.refresh = function () {
        this.tick();
    };
    ProbeLogView.prototype.tick = function () {
        var _this = this;
        var isz80 = ui_1.platform instanceof baseplatform_1.BaseZ80MachinePlatform || ui_1.platform instanceof baseplatform_1.BaseZ80Platform; // TODO?
        // cache each line in frame
        this.dumplines = {};
        this.redraw(function (op, addr, col, row, clk, value) {
            if (isz80)
                clk >>= 2;
            var line = _this.dumplines[clk];
            if (line == null) {
                line = { op: op, addr: addr, row: row, col: col, asm: null, info: [] };
                _this.dumplines[clk] = line;
            }
            switch (op) {
                case recorder_1.ProbeFlags.EXECUTE:
                    if (ui_1.platform.disassemble) {
                        var disasm = ui_1.platform.disassemble(addr, ui_1.platform.readAddress.bind(ui_1.platform));
                        line.asm = disasm && disasm.line;
                    }
                    break;
                default:
                    var xtra = _this.opToString(op, addr, value);
                    if (xtra != "")
                        line.info.push(xtra);
                    break;
            }
        });
        this.vlist.refresh();
    };
    return ProbeLogView;
}(ProbeViewBaseBase));
exports.ProbeLogView = ProbeLogView;
///
var ProbeSymbolView = /** @class */ (function (_super) {
    __extends(ProbeSymbolView, _super);
    function ProbeSymbolView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.recreateOnResize = true;
        _this.cumulativeData = true;
        return _this;
    }
    // TODO: auto resize
    ProbeSymbolView.prototype.createDiv = function (parent) {
        // TODO: what if symbol list changes?
        if (ui_1.platform.debugSymbols && ui_1.platform.debugSymbols.symbolmap) {
            this.keys = Array.from(Object.keys(ui_1.platform.debugSymbols.symbolmap).filter(function (sym) { return !ignoreSymbol(sym); }));
        }
        else {
            this.keys = ['no symbols defined'];
        }
        this.vlist = new VirtualTextScroller(parent);
        this.vlist.create(parent, this.keys.length + 1, this.getMemoryLineAt.bind(this));
        return this.vlist.maindiv;
    };
    ProbeSymbolView.prototype.getMemoryLineAt = function (row) {
        // header line
        if (row == 0) {
            return { text: util_1.lpad("Symbol", 35) + util_1.lpad("Reads", 8) + util_1.lpad("Writes", 8) };
        }
        var sym = this.keys[row - 1];
        var line = this.dumplines && this.dumplines[sym];
        function getop(op) {
            var n = line[op] | 0;
            return util_1.lpad(n ? n.toString() : "", 8);
        }
        var s;
        var c;
        if (line != null) {
            s = util_1.lpad(sym, 35)
                + getop(recorder_1.ProbeFlags.MEM_READ)
                + getop(recorder_1.ProbeFlags.MEM_WRITE);
            if (line[recorder_1.ProbeFlags.EXECUTE])
                c = 'seg_code';
            else if (line[recorder_1.ProbeFlags.IO_READ] || line[recorder_1.ProbeFlags.IO_WRITE])
                c = 'seg_io';
            else
                c = 'seg_data';
        }
        else {
            s = util_1.lpad(sym, 35);
            c = 'seg_unknown';
        }
        return { text: s, clas: c };
    };
    ProbeSymbolView.prototype.refresh = function () {
        this.tick();
    };
    ProbeSymbolView.prototype.tick = function () {
        var _this = this;
        // cache each line in frame
        this.dumplines = {};
        this.redraw(function (op, addr, col, row, clk, value) {
            var sym = ui_1.platform.debugSymbols.addr2symbol[addr];
            if (sym != null) {
                var line = _this.dumplines[sym];
                if (line == null) {
                    line = {};
                    _this.dumplines[sym] = line;
                }
                line[op] = (line[op] | 0) + 1;
            }
        });
        this.vlist.refresh();
        if (this.probe)
            this.probe.clear(); // clear cumulative data (TODO: doesnt work with seeking or debugging)
    };
    return ProbeSymbolView;
}(ProbeViewBaseBase));
exports.ProbeSymbolView = ProbeSymbolView;
///
var MAX_CHILDREN = 256;
var MAX_STRING_LEN = 100;
var TREE_SHOW_DOLLAR_IDENTS = false;
var TreeNode = /** @class */ (function () {
    function TreeNode(parent, name) {
        this.expanded = false;
        this.parent = parent;
        this.name = name;
        this.children = new Map();
        this.level = parent ? (parent.level + 1) : -1;
        this.view = parent ? parent.view : null;
    }
    TreeNode.prototype.getDiv = function () {
        var _this = this;
        if (this._div == null) {
            this._div = document.createElement("div");
            this._div.classList.add("vertical-scroll");
            this._div.classList.add("tree-content");
            this._header = document.createElement("div");
            this._header.classList.add("tree-header");
            this._header.classList.add("tree-level-" + this.level);
            this._header.append(this.name);
            this._inline = document.createElement("span");
            this._inline.classList.add("tree-value");
            this._header.append(this._inline);
            this._div.append(this._header);
            this.parent._content.append(this._div);
            this._header.onclick = function (e) {
                _this.toggleExpanded();
            };
        }
        if (this.expanded && this._content == null) {
            this._content = document.createElement("div");
            this._div.append(this._content);
        }
        else if (!this.expanded && this._content != null) {
            this._content.remove();
            this._content = null;
            this.children.clear();
        }
        return this._div;
    };
    TreeNode.prototype.toggleExpanded = function () {
        this.expanded = !this.expanded;
        this.view.tick();
    };
    TreeNode.prototype.remove = function () {
        this._div.remove();
        this._div = null;
    };
    TreeNode.prototype.update = function (obj) {
        var _this = this;
        this.getDiv();
        var text = "";
        // is it a function? call it first, if we are expanded
        // TODO: only call functions w/ signature
        if (obj && obj.$$ && typeof obj.$$ == 'function' && this._content != null) {
            obj = obj.$$();
        }
        // check null first
        if (obj == null) {
            text = obj + "";
            // primitive types
        }
        else if (typeof obj == 'number') {
            if (obj != (obj | 0))
                text = obj.toString(); // must be a float
            else
                text = obj + "\t($" + util_1.hex(obj) + ")";
        }
        else if (typeof obj == 'boolean') {
            text = obj.toString();
        }
        else if (typeof obj == 'string') {
            if (obj.length < MAX_STRING_LEN)
                text = obj;
            else
                text = obj.substring(0, MAX_STRING_LEN) + "...";
            // typed byte array (TODO: other kinds)
        }
        else if (obj.buffer && obj.length <= MAX_CHILDREN) {
            text = emu_1.dumpRAM(obj, 0, obj.length);
            // recurse into object? (or function)
        }
        else if (typeof obj == 'object' || typeof obj == 'function') {
            // only if expanded
            if (this._content != null) {
                // split big arrays
                if (obj.slice && obj.length > MAX_CHILDREN) {
                    var newobj = {};
                    var oldobj_1 = obj;
                    var slicelen = MAX_CHILDREN;
                    while (obj.length / slicelen > MAX_CHILDREN)
                        slicelen *= 2;
                    var _loop_1 = function (ofs) {
                        newobj["$" + util_1.hex(ofs)] = { $$: function () { return oldobj_1.slice(ofs, ofs + slicelen); } };
                    };
                    for (var ofs = 0; ofs < oldobj_1.length; ofs += slicelen) {
                        _loop_1(ofs);
                    }
                    obj = newobj;
                }
                // get object keys
                var names = obj instanceof Array ? Array.from(obj.keys()) : Object.getOwnPropertyNames(obj);
                if (names.length > MAX_CHILDREN) { // max # of child objects
                    var newobj = {};
                    var oldobj = obj;
                    var slicelen = 100;
                    while (names.length / slicelen > 100)
                        slicelen *= 2;
                    for (var ofs = 0; ofs < names.length; ofs += slicelen) {
                        var newdict = {};
                        for (var i = ofs; i < ofs + slicelen; i++)
                            newdict[names[i]] = oldobj[names[i]];
                        newobj["[" + ofs + "...]"] = newdict;
                    }
                    obj = newobj;
                    names = Object.getOwnPropertyNames(obj);
                }
                // track deletions
                var orphans_1 = new Set(this.children.keys());
                // visit all children
                names.forEach(function (name) {
                    // hide $xxx idents?
                    var hidden = !TREE_SHOW_DOLLAR_IDENTS && typeof name === 'string' && name.startsWith("$$");
                    if (!hidden) {
                        var childnode = _this.children.get(name);
                        if (childnode == null) {
                            childnode = new TreeNode(_this, name);
                            _this.children.set(name, childnode);
                        }
                        childnode.update(obj[name]);
                    }
                    orphans_1.delete(name);
                });
                // remove orphans
                orphans_1.forEach(function (delname) {
                    var childnode = _this.children.get(delname);
                    childnode.remove();
                    _this.children.delete(delname);
                });
                this._header.classList.add("tree-expanded");
                this._header.classList.remove("tree-collapsed");
            }
            else {
                this._header.classList.add("tree-collapsed");
                this._header.classList.remove("tree-expanded");
            }
        }
        else {
            text = typeof obj; // fallthrough
        }
        // change DOM object if needed
        if (this._inline.innerText != text) {
            this._inline.innerText = text;
        }
    };
    return TreeNode;
}());
function createTreeRootNode(parent, view) {
    var mainnode = new TreeNode(null, null);
    mainnode.view = view;
    mainnode._content = parent;
    var root = new TreeNode(mainnode, "/");
    root.expanded = true;
    root.getDiv(); // create it
    root._div.style.padding = '0px';
    return root; // should be cached
}
var TreeViewBase = /** @class */ (function () {
    function TreeViewBase() {
    }
    TreeViewBase.prototype.createDiv = function (parent) {
        this.root = createTreeRootNode(parent, this);
        return this.root.getDiv();
    };
    TreeViewBase.prototype.refresh = function () {
        this.tick();
    };
    TreeViewBase.prototype.tick = function () {
        this.root.update(this.getRootObject());
    };
    return TreeViewBase;
}());
exports.TreeViewBase = TreeViewBase;
var StateBrowserView = /** @class */ (function (_super) {
    __extends(StateBrowserView, _super);
    function StateBrowserView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateBrowserView.prototype.getRootObject = function () { return ui_1.platform.saveState(); };
    return StateBrowserView;
}(TreeViewBase));
exports.StateBrowserView = StateBrowserView;
var DebugBrowserView = /** @class */ (function (_super) {
    __extends(DebugBrowserView, _super);
    function DebugBrowserView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DebugBrowserView.prototype.getRootObject = function () { return ui_1.platform.getDebugTree(); };
    return DebugBrowserView;
}(TreeViewBase));
exports.DebugBrowserView = DebugBrowserView;
// TODO: clear stack data when reset?
var CallStackView = /** @class */ (function (_super) {
    __extends(CallStackView, _super);
    function CallStackView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cumulativeData = true;
        return _this;
    }
    CallStackView.prototype.createDiv = function (parent) {
        this.clear();
        this.treeroot = createTreeRootNode(parent, this);
        return this.treeroot.getDiv();
    };
    CallStackView.prototype.refresh = function () {
        this.tick();
    };
    CallStackView.prototype.tick = function () {
        this.treeroot.update(this.getRootObject());
        if (this.probe)
            this.probe.clear(); // clear cumulative data (TODO: doesnt work with seeking or debugging)
    };
    CallStackView.prototype.clear = function () {
        this.graph = null;
        this.reset();
    };
    CallStackView.prototype.reset = function () {
        this.stack = [];
        this.lastsp = -1;
        this.lastpc = 0;
        this.jsr = false;
        this.rts = false;
    };
    CallStackView.prototype.newNode = function (pc, sp) {
        return { $$SP: sp, $$PC: pc, count: 0, startLine: null, endLine: null, calls: {} };
    };
    CallStackView.prototype.newRoot = function (pc, sp) {
        if (this.stack.length == 0) {
            this.graph = this.newNode(null, sp);
            this.stack.unshift(this.graph);
        }
        else if (sp > this.stack[0].$$SP) {
            this.graph = this.newNode(null, sp);
            this.graph.calls[this.addr2str(pc)] = this.stack[0];
            this.stack.unshift(this.graph);
        }
    };
    CallStackView.prototype.getRootObject = function () {
        var _this = this;
        // TODO: we don't capture every frame, so if we don't start @ the top frame we may have problems
        this.redraw(function (op, addr, col, row, clk, value) {
            switch (op) {
                case recorder_1.ProbeFlags.SP_POP:
                    _this.newRoot(_this.lastpc, _this.lastsp);
                case recorder_1.ProbeFlags.SP_PUSH:
                    if (_this.stack.length) {
                        var top_1 = _this.stack[_this.stack.length - 1];
                        var delta = _this.lastsp - addr;
                        if ((delta == 2 || delta == 3) && addr < top_1.$$SP) { // TODO: look for opcode?
                            _this.jsr = true;
                        }
                        if ((delta == -2 || delta == -3) && _this.stack.length > 1 && addr > top_1.$$SP) {
                            _this.rts = true;
                        }
                    }
                    _this.lastsp = addr;
                    break;
                case recorder_1.ProbeFlags.EXECUTE:
                    // TODO: better check for CALL/RET opcodes
                    if (Math.abs(addr - _this.lastpc) >= 4) { // make sure we're jumping a distance (TODO)
                        if (_this.jsr && _this.stack.length) {
                            var top_2 = _this.stack[_this.stack.length - 1];
                            var sym = _this.addr2str(addr);
                            var child = top_2.calls[sym];
                            if (child == null) {
                                child = top_2.calls[sym] = _this.newNode(addr, _this.lastsp);
                            }
                            else if (child.$$PC == null)
                                child.$$PC = addr;
                            //this.stack.forEach((node) => node.count++);
                            _this.stack.push(child);
                            child.count++;
                            child.startLine = row;
                        }
                        _this.jsr = false;
                        if (_this.rts && _this.stack.length) {
                            _this.stack.pop().endLine = row;
                        }
                        _this.rts = false;
                    }
                    _this.lastpc = addr;
                    break;
            }
        });
        if (this.graph)
            this.graph['$$Stack'] = this.stack;
        return TREE_SHOW_DOLLAR_IDENTS ? this.graph : this.graph && this.graph.calls;
    };
    return CallStackView;
}(ProbeViewBaseBase));
exports.CallStackView = CallStackView;
var FrameCallsView = /** @class */ (function (_super) {
    __extends(FrameCallsView, _super);
    function FrameCallsView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FrameCallsView.prototype.createDiv = function (parent) {
        this.treeroot = createTreeRootNode(parent, this);
        return this.treeroot.getDiv();
    };
    FrameCallsView.prototype.refresh = function () {
        this.tick();
    };
    FrameCallsView.prototype.tick = function () {
        this.treeroot.update(this.getRootObject());
    };
    FrameCallsView.prototype.getRootObject = function () {
        var _this = this;
        var frame = {};
        this.redraw(function (op, addr, col, row, clk, value) {
            switch (op) {
                case recorder_1.ProbeFlags.EXECUTE:
                    var sym = _this.addr2symbol(addr);
                    if (sym) {
                        if (!frame[sym]) {
                            frame[sym] = row;
                        }
                    }
                    break;
            }
        });
        return frame;
    };
    return FrameCallsView;
}(ProbeViewBaseBase));
exports.FrameCallsView = FrameCallsView;
///
var AssetEditorView = /** @class */ (function () {
    function AssetEditorView() {
    }
    AssetEditorView.prototype.createDiv = function (parent) {
        this.maindiv = newDiv(parent, "vertical-scroll");
        return this.maindiv[0];
    };
    AssetEditorView.prototype.clearAssets = function () {
        this.rootnodes = [];
        this.deferrednodes = [];
    };
    AssetEditorView.prototype.registerAsset = function (type, node, deferred) {
        this.rootnodes.push(node);
        if (deferred) {
            if (deferred > 1)
                this.deferrednodes.push(node);
            else
                this.deferrednodes.unshift(node);
        }
        else {
            node.refreshRight();
        }
    };
    AssetEditorView.prototype.getPalettes = function (matchlen) {
        var result = [];
        this.rootnodes.forEach(function (node) {
            while (node != null) {
                if (node instanceof pixed.PaletteFormatToRGB) {
                    // TODO: move to node class?
                    var palette = node.palette;
                    // match full palette length?
                    if (matchlen == palette.length) {
                        result.push({ node: node, name: "Palette", palette: palette });
                    }
                    // look at palette slices
                    if (node.layout) {
                        node.layout.forEach(function (_a) {
                            var name = _a[0], start = _a[1], len = _a[2];
                            if (start < palette.length) {
                                if (len == matchlen) {
                                    var rgbs = palette.slice(start, start + len);
                                    result.push({ node: node, name: name, palette: rgbs });
                                }
                                else if (-len == matchlen) { // reverse order
                                    var rgbs = palette.slice(start, start - len);
                                    rgbs.reverse();
                                    result.push({ node: node, name: name, palette: rgbs });
                                }
                                else if (len + 1 == matchlen) {
                                    var rgbs = new Uint32Array(matchlen);
                                    rgbs[0] = palette[0];
                                    rgbs.set(palette.slice(start, start + len), 1);
                                    result.push({ node: node, name: name, palette: rgbs });
                                }
                            }
                        });
                    }
                    break;
                }
                node = node.right;
            }
        });
        return result;
    };
    AssetEditorView.prototype.getTilemaps = function (matchlen) {
        var result = [];
        this.rootnodes.forEach(function (node) {
            while (node != null) {
                if (node instanceof pixed.Palettizer) {
                    var rgbimgs = node.rgbimgs;
                    if (rgbimgs && rgbimgs.length >= matchlen) {
                        result.push({ node: node, name: "Tilemap", images: node.images, rgbimgs: rgbimgs }); // TODO
                    }
                }
                node = node.right;
            }
        });
        return result;
    };
    AssetEditorView.prototype.isEditing = function () {
        return this.cureditordiv != null;
    };
    AssetEditorView.prototype.getCurrentEditNode = function () {
        return this.cureditnode;
    };
    AssetEditorView.prototype.setCurrentEditor = function (div, editing, node) {
        var timeout = 250;
        if (this.cureditordiv != div) {
            if (this.cureditordiv) {
                this.cureditordiv.hide(timeout);
                this.cureditordiv = null;
            }
            if (div) {
                this.cureditordiv = div;
                this.cureditordiv.show();
                this.cureditordiv[0].scrollIntoView({ behavior: "smooth", block: "center" });
                //setTimeout(() => { this.cureditordiv[0].scrollIntoView({behavior: "smooth", block: "center"}) }, timeout);
            }
        }
        if (this.cureditelem) {
            this.cureditelem.removeClass('selected');
            this.cureditelem = null;
        }
        if (editing) {
            this.cureditelem = editing;
            this.cureditelem.addClass('selected');
        }
        while (node.left) {
            node = node.left;
        }
        this.cureditnode = node;
    };
    AssetEditorView.prototype.scanFileTextForAssets = function (id, data) {
        // scan file for assets
        // /*{json}*/ or ;;{json};;
        // TODO: put before ident, look for = {
        var result = [];
        var re1 = /[/;][*;]([{].+[}])[*;][/;]/g;
        var m;
        while (m = re1.exec(data)) {
            var start = m.index + m[0].length;
            var end;
            // TODO: verilog end
            if (ui_1.platform_id == 'verilog') {
                end = data.indexOf("end", start); // asm
            }
            else if (m[0].startsWith(';;')) {
                end = data.indexOf(';;', start); // asm
            }
            else {
                end = data.indexOf(';', start); // C
            }
            //console.log(id, start, end, m[1], data.substring(start,end));
            if (end > start) {
                try {
                    var jsontxt = m[1].replace(/([A-Za-z]+):/g, '"$1":'); // fix lenient JSON
                    var json = JSON.parse(jsontxt);
                    // TODO: name?
                    result.push({ fileid: id, fmt: json, start: start, end: end });
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        // look for DEF_METASPRITE_2x2(playerRStand, 0xd8, 0)
        // TODO: could also look in ROM
        var re2 = /DEF_METASPRITE_(\d+)x(\d+)[(](\w+),\s*(\w+),\s*(\w+)/gi;
        while (m = re2.exec(data)) {
            var width = parseInt(m[1]);
            var height = parseInt(m[2]);
            var ident = m[3];
            var tile = parseInt(m[4]);
            var attr = parseInt(m[5]);
            var metadefs = [];
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    metadefs.push({ x: x * 8, y: y * 8, tile: tile, attr: attr });
                }
            }
            var meta = { defs: metadefs, width: width * 8, height: height * 8 };
            result.push({ fileid: id, label: ident, meta: meta });
        }
        return result;
    };
    // TODO: move to pixeleditor.ts?
    AssetEditorView.prototype.addPaletteEditorViews = function (parentdiv, pal2rgb, callback) {
        var _this = this;
        var adual = $('<div class="asset_dual"/>').appendTo(parentdiv);
        var aeditor = $('<div class="asset_editor"/>').hide(); // contains editor, when selected
        // TODO: they need to update when refreshed from right
        var allrgbimgs = [];
        pal2rgb.getAllColors().forEach(function (rgba) { allrgbimgs.push(new Uint32Array([rgba])); }); // array of array of 1 rgb color (for picker)
        var atable = $('<table/>').appendTo(adual);
        aeditor.appendTo(adual);
        // make default layout if not exists
        var layout = pal2rgb.layout;
        if (!layout) {
            var len = pal2rgb.palette.length;
            var imgsperline = len > 32 ? 8 : 4; // TODO: use 'n'?
            layout = [];
            for (var i = 0; i < len; i += imgsperline) {
                layout.push(["", i, Math.min(len - i, imgsperline)]);
            }
        }
        function updateCell(cell, j) {
            var val = pal2rgb.words[j];
            var rgb = pal2rgb.palette[j];
            var hexcol = '#' + util_1.hex(util_1.rgb2bgr(rgb), 6);
            var textcol = (rgb & 0x008000) ? 'black' : 'white';
            cell.text(util_1.hex(val, 2)).css('background-color', hexcol).css('color', textcol);
        }
        // iterate over each row of the layout
        layout.forEach(function (_a) {
            var name = _a[0], start = _a[1], len = _a[2];
            if (start < pal2rgb.palette.length) { // skip row if out of range
                var arow = $('<tr/>').appendTo(atable);
                $('<td/>').text(name).appendTo(arow);
                var inds = [];
                for (var k = start; k < start + Math.abs(len); k++)
                    inds.push(k);
                if (len < 0)
                    inds.reverse();
                inds.forEach(function (i) {
                    var cell = $('<td/>').addClass('asset_cell asset_editable').appendTo(arow);
                    updateCell(cell, i);
                    cell.click(function (e) {
                        var chooser = new pixed.ImageChooser();
                        chooser.rgbimgs = allrgbimgs;
                        chooser.width = 1;
                        chooser.height = 1;
                        chooser.recreate(aeditor, function (index, newvalue) {
                            callback(i, index);
                            updateCell(cell, i);
                        });
                        _this.setCurrentEditor(aeditor, cell, pal2rgb);
                    });
                });
            }
        });
    };
    AssetEditorView.prototype.addPixelEditor = function (parentdiv, firstnode, fmt) {
        // data -> pixels
        fmt.xform = 'scale(2)';
        var mapper = new pixed.Mapper(fmt);
        // TODO: rotate node?
        firstnode.addRight(mapper);
        // pixels -> RGBA
        var palizer = new pixed.Palettizer(this, fmt);
        mapper.addRight(palizer);
        // add view objects
        palizer.addRight(new pixed.CharmapEditor(this, newDiv(parentdiv), fmt));
    };
    AssetEditorView.prototype.addPaletteEditor = function (parentdiv, firstnode, palfmt) {
        // palette -> RGBA
        var pal2rgb = new pixed.PaletteFormatToRGB(palfmt);
        firstnode.addRight(pal2rgb);
        // TODO: refresh twice?
        firstnode.refreshRight();
        // TODO: add view objects
        // TODO: show which one is selected?
        this.addPaletteEditorViews(parentdiv, pal2rgb, function (index, newvalue) {
            console.log('set entry', index, '=', newvalue);
            // TODO: this forces update of palette rgb colors and file data
            firstnode.words[index] = newvalue;
            pal2rgb.words = null;
            pal2rgb.updateRight();
            pal2rgb.refreshLeft();
        });
    };
    AssetEditorView.prototype.ensureFileDiv = function (fileid) {
        var divid = this.getFileDivId(fileid);
        var body = $(document.getElementById(divid));
        if (body.length === 0) {
            var filediv = newDiv(this.maindiv, 'asset_file');
            var header = newDiv(filediv, 'asset_file_header').text(fileid);
            body = newDiv(filediv).attr('id', divid).addClass('disable-select');
        }
        return body;
    };
    AssetEditorView.prototype.refreshAssetsInFile = function (fileid, data) {
        var nassets = 0;
        // TODO: check fmt w/h/etc limits
        // TODO: defer editor creation
        // TODO: only refresh when needed
        if (ui_1.platform_id.startsWith('nes') && fileid.endsWith('.chr') && data instanceof Uint8Array) {
            // is this a NES CHR?
            var node = new pixed.FileDataNode(ui_1.projectWindows, fileid);
            var neschrfmt = { w: 8, h: 8, bpp: 1, count: (data.length >> 4), brev: true, np: 2, pofs: 8, remap: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12] }; // TODO
            this.addPixelEditor(this.ensureFileDiv(fileid), node, neschrfmt);
            this.registerAsset("charmap", node, 1);
            nassets++;
        }
        else if (ui_1.platform_id.startsWith('nes') && fileid.endsWith('.pal') && data instanceof Uint8Array) {
            // is this a NES PAL?
            var node = new pixed.FileDataNode(ui_1.projectWindows, fileid);
            var nespalfmt = { pal: "nes", layout: "nes" };
            this.addPaletteEditor(this.ensureFileDiv(fileid), node, nespalfmt);
            this.registerAsset("palette", node, 0);
            nassets++;
        }
        else if (typeof data === 'string') {
            var textfrags = this.scanFileTextForAssets(fileid, data);
            for (var _i = 0, textfrags_1 = textfrags; _i < textfrags_1.length; _i++) {
                var frag = textfrags_1[_i];
                if (frag.fmt) {
                    var label = fileid; // TODO: label
                    var node = new pixed.TextDataNode(ui_1.projectWindows, fileid, label, frag.start, frag.end);
                    var first = node;
                    // rle-compressed? TODO: how to edit?
                    if (frag.fmt.comp == 'rletag') {
                        node = node.addRight(new pixed.Compressor());
                    }
                    // is this a nes nametable?
                    if (frag.fmt.map == 'nesnt') {
                        node = node.addRight(new pixed.NESNametableConverter(this));
                        node = node.addRight(new pixed.Palettizer(this, { w: 8, h: 8, bpp: 4 }));
                        var fmt = { w: 8 * (frag.fmt.w || 32), h: 8 * (frag.fmt.h || 30), count: 1 }; // TODO: can't do custom sizes
                        node = node.addRight(new pixed.MapEditor(this, newDiv(this.ensureFileDiv(fileid)), fmt));
                        this.registerAsset("nametable", first, 2);
                        nassets++;
                    }
                    // is this a bitmap?
                    else if (frag.fmt.w > 0 && frag.fmt.h > 0) {
                        this.addPixelEditor(this.ensureFileDiv(fileid), node, frag.fmt);
                        this.registerAsset("charmap", first, 1);
                        nassets++;
                    }
                    // is this a palette?
                    else if (frag.fmt.pal) {
                        this.addPaletteEditor(this.ensureFileDiv(fileid), node, frag.fmt);
                        this.registerAsset("palette", first, 0);
                        nassets++;
                    }
                    else {
                        // TODO: other kinds of resources?
                    }
                }
            }
        }
        return nassets;
    };
    AssetEditorView.prototype.getFileDivId = function (id) {
        return '__asset__' + util_1.safeident(id);
    };
    // TODO: recreate editors when refreshing
    // TODO: look for changes, not moveCursor
    AssetEditorView.prototype.refresh = function (moveCursor) {
        var _this = this;
        // clear and refresh all files/nodes?
        if (moveCursor) {
            this.maindiv.empty();
            this.clearAssets();
            ui_1.current_project.iterateFiles(function (fileid, data) {
                try {
                    var nassets = _this.refreshAssetsInFile(fileid, data);
                }
                catch (e) {
                    console.log(e);
                    _this.ensureFileDiv(fileid).text(e + ""); // TODO: error msg?
                }
            });
            console.log("Found " + this.rootnodes.length + " assets");
            this.deferrednodes.forEach(function (node) {
                try {
                    node.refreshRight();
                }
                catch (e) {
                    console.log(e);
                    alert(e + "");
                }
            });
            this.deferrednodes = [];
        }
        else {
            // only refresh nodes if not actively editing
            // since we could be in the middle of an operation that hasn't been committed
            for (var _i = 0, _a = this.rootnodes; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node !== this.getCurrentEditNode()) {
                    node.refreshRight();
                }
            }
        }
    };
    AssetEditorView.prototype.setVisible = function (showing) {
        // TODO: make into toolbar?
        if (showing) {
            Mousetrap.bind('ctrl+z', ui_1.projectWindows.undoStep.bind(ui_1.projectWindows));
        }
        else {
            Mousetrap.unbind('ctrl+z');
        }
    };
    return AssetEditorView;
}());
exports.AssetEditorView = AssetEditorView;
//# sourceMappingURL=views.js.map