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
exports.BASICRuntime = void 0;
var emu_1 = require("../emu");
function isLiteral(arg) {
    return arg.value != null;
}
function isLookup(arg) {
    return arg.name != null;
}
function isBinOp(arg) {
    return arg.op != null && arg.left != null && arg.right != null;
}
function isUnOp(arg) {
    return arg.op != null && arg.expr != null;
}
// expr2js() options
var ExprOptions = /** @class */ (function () {
    function ExprOptions() {
    }
    return ExprOptions;
}());
function isArray(obj) {
    return obj != null && (Array.isArray(obj) || obj.BYTES_PER_ELEMENT);
}
var RNG = /** @class */ (function () {
    function RNG() {
        var _this = this;
        var f = function () {
            var a, b, c, d;
            _this.seed = function (aa, bb, cc, dd) {
                a = aa;
                b = bb;
                c = cc;
                d = dd;
            };
            _this.seedfloat = function (n) {
                this.seed(n, n * 4294, n * 429496, n * 4294967296);
                this.next();
                this.next();
                this.next();
            };
            _this.next = function () {
                // sfc32
                a >>>= 0;
                b >>>= 0;
                c >>>= 0;
                d >>>= 0;
                var t = (a + b) | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = (c << 21 | c >>> 11);
                d = d + 1 | 0;
                t = t + d | 0;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        f();
        this.seedfloat(-1);
    }
    RNG.prototype.randomize = function () {
        this.seed(Math.random() * 0x7fffffff, Math.random() * 0x7fffffff, Math.random() * 0x7fffffff, Math.random() * 0x7fffffff);
    };
    return RNG;
}());
;
var DEFAULT_MAX_ARRAY_ELEMENTS = 1024 * 1024;
var BASICRuntime = /** @class */ (function () {
    function BASICRuntime() {
        this.margin = 80; // number of columns
        this.running = false;
        this.exited = true;
        this.trace = false;
    }
    BASICRuntime.prototype.load = function (program) {
        var _this = this;
        // get previous label and offset for hot reload
        var prevlabel = null;
        var prevpcofs = 0;
        if (this.pc2label != null) {
            var pc = this.curpc;
            while (pc > 0 && (prevlabel = this.pc2label.get(pc)) == null) {
                pc--;
            }
            prevpcofs = this.curpc - pc;
            console.log('oldpc=', this.curpc, 'restart @ label', prevlabel, '+', prevpcofs);
        }
        // initialize program
        this.program = program;
        this.opts = program.opts;
        if (!this.opts.maxArrayElements)
            this.opts.maxArrayElements = DEFAULT_MAX_ARRAY_ELEMENTS;
        this.allstmts = program.stmts;
        this.label2pc = program.labels;
        this.label2dataptr = {};
        this.pc2label = new Map();
        this.datums = [];
        this.subroutines = {};
        this.builtins = this.getBuiltinFunctions();
        // TODO: detect undeclared vars
        // build PC -> label lookup
        for (var label in program.labels) {
            var targetpc = program.labels[label];
            this.pc2label.set(targetpc, label);
        }
        // iterate through all the statements
        this.allstmts.forEach(function (stmt, pc) {
            // compile statements ahead of time
            _this.curpc = pc + 1; // for error reporting
            _this.compileStatement(stmt);
            // parse DATA literals
            if (stmt.command == 'DATA') {
                _this.label2dataptr[stmt.$loc.label] = _this.datums.length;
                stmt.datums.forEach(function (datum) {
                    _this.curpc = stmt.$loc.offset; // for error reporting
                    _this.datums.push(datum);
                });
            }
        });
        // try to resume where we left off after loading
        if (this.label2pc[prevlabel] != null) {
            this.curpc = this.label2pc[prevlabel] + prevpcofs;
            return true;
        }
        else {
            this.curpc = 0;
            return false;
        }
    };
    BASICRuntime.prototype.reset = function () {
        this.curpc = 0;
        this.dataptr = 0;
        this.clearVars();
        this.returnStack = [];
        this.column = 0;
        this.running = true;
        this.exited = false;
    };
    BASICRuntime.prototype.clearVars = function () {
        var _this = this;
        this.globals = this.vars = {};
        this.arrays = {};
        this.defs = {}; // TODO? only in interpreters
        this.forLoops = {};
        this.forLoopStack = [];
        this.whileLoops = [];
        this.rng = new RNG();
        // initialize arrays?
        if (this.opts && this.opts.staticArrays) {
            this.allstmts.filter(function (stmt) { return stmt.command == 'DIM'; }).forEach(function (dimstmt) {
                dimstmt.args.forEach(function (arg) { return _this.compileJS(_this._DIM(arg))(); });
            });
        }
    };
    // TODO: saveState(), loadState()
    BASICRuntime.prototype.saveState = function () {
        // TODO: linked list loop?
        return $.extend(true, {}, this);
    };
    BASICRuntime.prototype.loadState = function (state) {
        $.extend(true, this, state);
    };
    BASICRuntime.prototype.getBuiltinFunctions = function () {
        var fnames = this.program && this.opts.validFunctions;
        // if no valid function list, look for ABC...() functions in prototype
        if (!fnames)
            fnames = Object.keys(BASICRuntime.prototype).filter(function (name) { return /^[A-Z]{3,}[$]?$/.test(name); });
        var dict = {};
        for (var _i = 0, fnames_1 = fnames; _i < fnames_1.length; _i++) {
            var fn = fnames_1[_i];
            if (this.supportsFunction(fn))
                dict[fn] = this[fn].bind(this);
        }
        return dict;
    };
    BASICRuntime.prototype.supportsFunction = function (fnname) {
        return typeof this[fnname] === 'function';
    };
    BASICRuntime.prototype.runtimeError = function (msg) {
        this.curpc--; // we did curpc++ before executing statement
        throw new emu_1.EmuHalt(msg, this.getCurrentSourceLocation());
    };
    BASICRuntime.prototype.dialectError = function (what) {
        this.runtimeError("I can't " + what + " in this dialect of BASIC.");
    };
    BASICRuntime.prototype.getLineForPC = function (pc) {
        var stmt = this.allstmts[pc];
        return stmt && stmt.$loc && stmt.$loc.line;
    };
    BASICRuntime.prototype.getLabelForPC = function (pc) {
        var stmt = this.allstmts[pc];
        return stmt && stmt.$loc && stmt.$loc.label;
    };
    BASICRuntime.prototype.getCurrentSourceLocation = function () {
        var stmt = this.getStatement();
        return stmt && stmt.$loc;
    };
    BASICRuntime.prototype.getCurrentLabel = function () {
        var loc = this.getCurrentSourceLocation();
        return loc && loc.label;
    };
    BASICRuntime.prototype.getStatement = function () {
        return this.allstmts[this.curpc];
    };
    BASICRuntime.prototype.step = function () {
        if (!this.running)
            return false;
        var stmt = this.getStatement();
        // end of program?
        if (!stmt) {
            this.running = false;
            this.exited = true;
            return false;
        }
        if (this.trace)
            console.log(this.curpc, stmt, this.vars, Object.keys(this.arrays));
        // skip to next statment
        this.curpc++;
        // compile (unless cached) and execute statement
        this.executeStatement(stmt);
        return this.running;
    };
    BASICRuntime.prototype.compileStatement = function (stmt) {
        if (stmt.$run == null) {
            try {
                var stmtfn = this['do__' + stmt.command];
                if (stmtfn == null)
                    this.runtimeError("I don't know how to \"" + stmt.command + "\".");
                var functext = stmtfn.bind(this)(stmt);
                if (this.trace)
                    console.log(functext);
                stmt.$run = this.compileJS(functext);
            }
            catch (e) {
                if (functext)
                    console.log(functext);
                throw e;
            }
        }
    };
    BASICRuntime.prototype.compileJS = function (functext) {
        return new Function(functext).bind(this);
    };
    BASICRuntime.prototype.executeStatement = function (stmt) {
        // compile (unless cached)
        this.compileStatement(stmt);
        // run compiled statement
        stmt.$run();
    };
    // TODO: this only works because each line has a label
    BASICRuntime.prototype.skipToEOL = function () {
        do {
            this.curpc++;
        } while (this.curpc < this.allstmts.length && !this.pc2label.get(this.curpc));
    };
    BASICRuntime.prototype.skipToElse = function () {
        while (this.curpc < this.allstmts.length) {
            // in Altair BASIC, ELSE is bound to the right-most IF
            // TODO: this is complicated, we should just have nested expressions
            var cmd = this.allstmts[this.curpc].command;
            if (cmd == 'ELSE') {
                this.curpc++;
                break;
            }
            else if (cmd == 'IF')
                return this.skipToEOL();
            this.curpc++;
            if (this.pc2label.get(this.curpc))
                break;
        }
    };
    BASICRuntime.prototype.skipToEOF = function () {
        this.curpc = this.allstmts.length;
    };
    BASICRuntime.prototype.skipToAfterNext = function (forname) {
        var pc = this.curpc;
        while (pc < this.allstmts.length) {
            var stmt = this.allstmts[pc];
            if (stmt.command == 'NEXT') {
                var nextlexpr = stmt.lexpr;
                if (nextlexpr && nextlexpr.name == forname) {
                    this.curpc = pc + 1;
                    return;
                }
            }
            pc++;
        }
        this.runtimeError("I couldn't find a matching NEXT " + forname + " to skip this for loop.");
    };
    BASICRuntime.prototype.skipToAfterWend = function () {
        var pc = this.curpc - 1;
        var nesting = 0;
        while (pc < this.allstmts.length) {
            var stmt = this.allstmts[pc];
            //console.log(nesting, pc, stmt);
            if (stmt.command == 'WHILE') {
                nesting++;
            }
            else if (stmt.command == 'WEND') {
                nesting--;
                if (nesting == 0) {
                    this.curpc = pc + 1;
                    return;
                }
            }
            pc++;
        }
        this.runtimeError("I couldn't find a matching WEND for this WHILE.");
    };
    BASICRuntime.prototype.gotoLabel = function (label) {
        var pc = this.label2pc[label];
        if (pc >= 0) {
            this.curpc = pc;
        }
        else {
            this.runtimeError("I tried to go to the label \"" + label + "\" but couldn't find it.");
        }
    };
    BASICRuntime.prototype.newLocalScope = function () {
        this.vars = Object.create(this.vars);
    };
    BASICRuntime.prototype.popLocalScope = function () {
        if (this.vars !== this.globals)
            this.vars = Object.getPrototypeOf(this.vars);
    };
    BASICRuntime.prototype.gosubLabel = function (label) {
        if (this.returnStack.length > 32767) // TODO: const?
            this.runtimeError("I did too many GOSUBs without a RETURN.");
        this.returnStack.push(this.curpc);
        this.gotoLabel(label);
    };
    BASICRuntime.prototype.returnFromGosub = function () {
        if (this.returnStack.length == 0)
            this.runtimeError("I tried to RETURN, but there wasn't a corresponding GOSUB."); // RETURN BEFORE GOSUB
        var pc = this.returnStack.pop();
        this.curpc = pc;
        this.popLocalScope();
    };
    BASICRuntime.prototype.popReturnStack = function () {
        if (this.returnStack.length == 0)
            this.runtimeError("I tried to POP, but there wasn't a corresponding GOSUB.");
        this.returnStack.pop();
    };
    BASICRuntime.prototype.valueToString = function (obj, padding) {
        var str;
        if (typeof obj === 'number') {
            var numstr = this.float2str(obj, this.opts.printZoneLength - 4);
            if (!padding)
                return numstr;
            else if (numstr.startsWith('-'))
                return numstr + " ";
            else
                return " " + numstr + " ";
        }
        else if (obj == '\n') {
            this.column = 0;
            str = obj;
        }
        else if (obj == '\t') {
            var l = this.opts.printZoneLength;
            var curgroup = Math.floor(this.column / l);
            var nextcol = (curgroup + 1) * this.opts.printZoneLength;
            if (nextcol + l > this.margin) {
                this.column = 0;
                str = "\n";
            } // return to left margin
            else
                str = this.TAB(nextcol); // next column
        }
        else {
            str = "" + obj;
        }
        return str;
    };
    BASICRuntime.prototype.float2str = function (arg, numlen) {
        var numstr = arg.toString().toUpperCase();
        if (numlen > 0) {
            var prec = numlen;
            while (numstr.length > numlen) {
                numstr = arg.toPrecision(prec--);
            }
            if (numstr.startsWith('0.'))
                numstr = numstr.substr(1);
            else if (numstr.startsWith('-0.'))
                numstr = '-' + numstr.substr(2);
        }
        return numstr;
    };
    BASICRuntime.prototype.printExpr = function (obj) {
        var str = this.valueToString(obj, this.opts.numericPadding);
        this.column += str.length;
        this.print(str);
    };
    // override this
    BASICRuntime.prototype.print = function (str) {
        console.log(str);
    };
    // override this
    BASICRuntime.prototype.input = function (prompt, nargs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { line: "", vals: [] }];
            });
        });
    };
    // override this
    BASICRuntime.prototype.resume = function () { };
    BASICRuntime.prototype.expr2js = function (expr, opts) {
        var _this = this;
        if (!opts)
            opts = {};
        if (isLiteral(expr)) {
            return JSON.stringify(expr.value);
        }
        else if (isLookup(expr)) {
            if (!expr.args && opts.locals && opts.locals.indexOf(expr.name) >= 0) {
                return expr.name; // local arg in DEF
            }
            else {
                if (opts.isconst)
                    this.runtimeError("I expected a constant value here."); // TODO: check at compile-time?
                var s = '';
                var qname = JSON.stringify(expr.name);
                var jsargs = expr.args ? expr.args.map(function (arg) { return _this.expr2js(arg, opts); }).join(', ') : [];
                if (expr.name.startsWith("FN")) { // is it a user-defined function?
                    // TODO: check argument count?
                    s += "this.getDef(" + qname + ")(" + jsargs + ")";
                    // TODO: detect recursion?
                }
                else if (this.builtins[expr.name]) { // is it a built-in function?
                    this.checkFuncArgs(expr, this.builtins[expr.name]);
                    s += "this.builtins." + expr.name + "(" + jsargs + ")";
                }
                else if (expr.args) {
                    // get array slice (HP BASIC)
                    if (this.opts.arraysContainChars && expr.name.endsWith('$'))
                        s += "this.getStringSlice(this.vars." + expr.name + ", " + jsargs + ")";
                    else
                        s += "this.arrayGet(" + qname + ", " + jsargs + ")";
                }
                else { // just a variable
                    s += "this.vars." + expr.name;
                }
                return opts.novalid ? s : "this.checkValue(" + s + ", " + qname + ")";
            }
        }
        else if (isBinOp(expr)) {
            var left = this.expr2js(expr.left, opts);
            var right = this.expr2js(expr.right, opts);
            return "this." + expr.op + "(" + left + ", " + right + ")";
        }
        else if (isUnOp(expr)) {
            var e = this.expr2js(expr.expr, opts);
            return "this." + expr.op + "(" + e + ")";
        }
    };
    BASICRuntime.prototype.assign2js = function (expr, opts) {
        if (!opts)
            opts = {};
        var s = '';
        // is it a function? not allowed
        if (expr.name.startsWith("FN") || this.builtins[expr.name])
            this.runtimeError("I can't call a function here.");
        // is it a subscript?
        if (expr.args) {
            // TODO: set array slice (HP BASIC)
            if (this.opts.arraysContainChars && expr.name.endsWith('$')) {
                this.runtimeError("I can't set array slices via this command yet.");
            }
            else {
                s += this.array2js(expr, opts);
            }
        }
        else { // just a variable
            s = "this.globals." + expr.name;
        }
        return s;
    };
    BASICRuntime.prototype.array2js = function (expr, opts) {
        var _this = this;
        var qname = JSON.stringify(expr.name);
        var args = expr.args || [];
        return this.expr2js(expr, { novalid: true }) // check array bounds
            + (";this.getArray(" + qname + ", " + args.length + ")")
            + args.map(function (arg) { return '[this.ROUND(' + _this.expr2js(arg, opts) + ')]'; }).join('');
    };
    BASICRuntime.prototype.checkFuncArgs = function (expr, fn) {
        // TODO: check types?
        var nargs = expr.args ? expr.args.length : 0;
        // exceptions
        if (expr.name == 'RND' && nargs == 0)
            return;
        if (expr.name == 'MID$' && nargs == 2)
            return;
        if (expr.name == 'INSTR' && nargs == 2)
            return;
        if (fn.length != nargs)
            this.runtimeError("I expected " + fn.length + " arguments for the " + expr.name + " function, but I got " + nargs + ".");
    };
    BASICRuntime.prototype.startForLoop = function (forname, init, targ, step, endpc) {
        var _this = this;
        // save start PC and label in case of hot reload (only works if FOR is first stmt in line)
        var looppc = this.curpc - 1;
        var looplabel = this.pc2label.get(looppc);
        if (!step)
            step = 1;
        this.vars[forname] = init;
        if (this.trace)
            console.log("FOR " + forname + " = " + init + " TO " + targ + " STEP " + step);
        // create done function
        var loopdone = function () {
            return step >= 0 ? _this.vars[forname] > targ : _this.vars[forname] < targ;
        };
        // skip entire for loop before first iteration? (Minimal BASIC)
        if (this.opts.testInitialFor && loopdone()) {
            if (endpc != null)
                this.curpc = endpc + 1;
            else
                this.skipToAfterNext(forname);
        }
        // save for var name on stack, remove existing entry
        if (this.forLoopStack[forname] != null)
            this.forLoopStack = this.forLoopStack.filter(function (n) { return n == forname; });
        this.forLoopStack.push(forname);
        // create for loop record
        this.forLoops[forname] = {
            $next: function (nextname) {
                if (nextname && forname != nextname)
                    _this.runtimeError("I executed NEXT \"" + nextname + "\", but the last FOR was for \"" + forname + "\".");
                _this.vars[forname] += step;
                var done = loopdone();
                if (done) {
                    // delete entry, pop FOR off the stack and continue
                    _this.forLoopStack.pop();
                    delete _this.forLoops[forname];
                }
                else {
                    // go back to FOR loop, adjusting for hot reload (fetch pc by label)
                    _this.curpc = ((looplabel != null && _this.label2pc[looplabel]) || looppc) + 1;
                }
                if (_this.trace)
                    console.log("NEXT " + forname + ": " + _this.vars[forname] + " TO " + targ + " STEP " + step + " DONE=" + done);
            }
        };
    };
    BASICRuntime.prototype.nextForLoop = function (name) {
        // get FOR loop entry, or get top of stack if NEXT var is optional 
        var fl = this.forLoops[name || (this.opts.optionalNextVar && this.forLoopStack[this.forLoopStack.length - 1])];
        if (!fl)
            this.runtimeError("I couldn't find a matching FOR for this NEXT.");
        fl.$next(name);
    };
    BASICRuntime.prototype.whileLoop = function (cond) {
        if (cond) {
            this.whileLoops.push(this.curpc - 1);
        }
        else {
            this.skipToAfterWend();
        }
    };
    BASICRuntime.prototype.nextWhileLoop = function () {
        var pc = this.whileLoops.pop();
        if (pc == null)
            this.runtimeError("I couldn't find a matching WHILE for this WEND.");
        else
            this.curpc = pc;
    };
    // converts a variable to string/number based on var name
    BASICRuntime.prototype.assign = function (name, right, isRead) {
        // convert data? READ always converts if read into string
        if (isRead && name.endsWith("$"))
            return this.checkValue(this.convert(name, right), name);
        // TODO: use options
        if (name.endsWith("$")) {
            return this.convertToString(right, name);
        }
        else {
            return this.convertToNumber(right, name);
        }
    };
    BASICRuntime.prototype.convert = function (name, right) {
        if (name.endsWith("$")) {
            return right == null ? "" : right.toString();
        }
        else if (typeof right === 'number') {
            return right;
        }
        else {
            return parseFloat(right + "");
        }
    };
    BASICRuntime.prototype.convertToString = function (right, name) {
        if (typeof right !== 'string')
            this.runtimeError("I can't convert " + right + " to a string.");
        else
            return right;
    };
    BASICRuntime.prototype.convertToNumber = function (right, name) {
        if (typeof right !== 'number')
            this.runtimeError("I can't convert " + right + " to a number.");
        else
            return this.checkNum(right);
    };
    // dimension array
    BASICRuntime.prototype.dimArray = function (name) {
        var dims = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            dims[_i - 1] = arguments[_i];
        }
        // TODO: maybe do this check at compile-time?
        dims = dims.map(Math.round);
        if (this.arrays[name] != null) {
            if (this.opts.staticArrays)
                return;
            else
                this.runtimeError("I already dimensioned this array (" + name + ") earlier.");
        }
        var total = this.getTotalArrayLength(dims);
        if (total > this.opts.maxArrayElements)
            this.runtimeError("I can't create an array with this many elements.");
        var isstring = name.endsWith('$');
        // if numeric value, we use Float64Array which inits to 0
        var arrcons = isstring ? Array : Float64Array;
        if (dims.length == 1) {
            this.arrays[name] = new arrcons(dims[0] + 1);
        }
        else if (dims.length == 2) {
            this.arrays[name] = new Array(dims[0] + 1);
            for (var i = 0; i < dims[0] + 1; i++) {
                this.arrays[name][i] = new arrcons(dims[1] + 1);
            }
        }
        else {
            this.runtimeError("I only support arrays of one or two dimensions.");
        }
    };
    BASICRuntime.prototype.getTotalArrayLength = function (dims) {
        var n = 1;
        for (var i = 0; i < dims.length; i++) {
            if (dims[i] < this.opts.defaultArrayBase)
                this.runtimeError("I can't create an array with a dimension less than " + this.opts.defaultArrayBase + ".");
            n *= dims[i];
        }
        return n;
    };
    BASICRuntime.prototype.getArray = function (name, order) {
        if (!this.arrays[name]) {
            if (this.opts.defaultArraySize == 0)
                this.dialectError("automatically declare arrays without a DIM statement (or did you mean to call a function?)");
            if (order == 1)
                this.dimArray(name, this.opts.defaultArraySize - 1);
            else if (order == 2)
                this.dimArray(name, this.opts.defaultArraySize - 1, this.opts.defaultArraySize - 1);
            else
                this.runtimeError("I only support arrays of one or two dimensions."); // TODO
        }
        return this.arrays[name];
    };
    BASICRuntime.prototype.arrayGet = function (name) {
        var indices = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            indices[_i - 1] = arguments[_i];
        }
        var arr = this.getArray(name, indices.length);
        indices = indices.map(this.ROUND.bind(this));
        var v = arr;
        for (var i = 0; i < indices.length; i++) {
            var idx = indices[i];
            if (!isArray(v))
                this.runtimeError("I tried to lookup " + name + "(" + indices + ") but used too many dimensions.");
            if (idx < this.opts.defaultArrayBase)
                this.runtimeError("I tried to lookup " + name + "(" + indices + ") but an index was less than " + this.opts.defaultArrayBase + ".");
            if (idx >= v.length) // TODO: also can happen when mispelling function name
                this.runtimeError("I tried to lookup " + name + "(" + indices + ") but it exceeded the dimensions of the array.");
            v = v[indices[i]];
        }
        if (isArray(v)) // i.e. is an array?
            this.runtimeError("I tried to lookup " + name + "(" + indices + ") but used too few dimensions.");
        return v;
    };
    // for HP BASIC string slicing (TODO?)
    BASICRuntime.prototype.modifyStringSlice = function (orig, add, start, end) {
        orig = orig || "";
        this.checkString(orig);
        this.checkString(add);
        if (!end)
            end = start;
        start = this.ROUND(start);
        end = this.ROUND(end);
        if (start < 1)
            this.dialectError("accept a string slice index less than 1");
        if (end < start)
            this.dialectError("accept a string slice index less than the starting index");
        return (orig + ' '.repeat(start)).substr(0, start - 1) + add.substr(0, end + 1 - start) + orig.substr(end);
    };
    BASICRuntime.prototype.getStringSlice = function (s, start, end) {
        s = this.checkString(s);
        start = this.ROUND(start);
        if (start < 1)
            this.dialectError("accept a string slice index less than 1");
        if (end != null) {
            end = this.ROUND(end);
            if (end < start)
                this.dialectError("accept a string slice index less than the starting index");
            return s.substr(start - 1, end + 1 - start);
        }
        else {
            return s.substr(start - 1);
        }
    };
    BASICRuntime.prototype.checkOnGoto = function (value, labels) {
        value = this.ROUND(value);
        if (value < 0) // > 255 ?
            this.runtimeError("I needed a number between 1 and " + labels.length + ", but I got " + value + ".");
        if (this.opts.checkOnGotoIndex && (value < 1 || value > labels.length))
            this.runtimeError("I needed a number between 1 and " + labels.length + ", but I got " + value + ".");
        if (value < 1 || value > labels.length)
            return 0;
        return value;
    };
    BASICRuntime.prototype.onGotoLabel = function (value) {
        var labels = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            labels[_i - 1] = arguments[_i];
        }
        value = this.checkOnGoto(value, labels);
        if (value)
            this.gotoLabel(labels[value - 1]);
    };
    BASICRuntime.prototype.onGosubLabel = function (value) {
        var labels = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            labels[_i - 1] = arguments[_i];
        }
        value = this.checkOnGoto(value, labels);
        if (value)
            this.gosubLabel(labels[value - 1]);
    };
    BASICRuntime.prototype.nextDatum = function () {
        if (this.dataptr >= this.datums.length)
            this.runtimeError("I tried to READ, but ran out of data.");
        return this.datums[this.dataptr++].value;
    };
    //// STATEMENTS
    BASICRuntime.prototype.do__PRINT = function (stmt) {
        var s = '';
        for (var _i = 0, _a = stmt.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            var expr = this.expr2js(arg);
            var name = expr.name;
            s += "this.printExpr(this.checkValue(" + expr + ", " + JSON.stringify(name) + "));";
        }
        return s;
    };
    BASICRuntime.prototype.preInput = function () {
        this.running = false;
        this.curpc--;
    };
    BASICRuntime.prototype.postInput = function (valid) {
        if (valid)
            this.curpc++;
        this.running = true;
        this.resume();
    };
    BASICRuntime.prototype.do__INPUT = function (stmt) {
        var _this = this;
        var prompt = stmt.prompt != null ? this.expr2js(stmt.prompt) : '""';
        var elapsed = stmt.elapsed != null ? this.assign2js(stmt.elapsed) : "let ___";
        var setvals = '';
        stmt.args.forEach(function (arg, index) {
            var lexpr = _this.assign2js(arg);
            setvals += "\n            var value = this.convert(" + JSON.stringify(arg.name) + ", response.vals[" + index + "]);\n            valid &= this.isValid(value);\n            " + lexpr + " = value;\n            ";
        });
        return "this.preInput();\n                this.input(" + prompt + ", " + stmt.args.length + ").then((response) => {\n                    let valid = 1;\n                    " + setvals + "\n                    this.postInput(valid);\n                    this.column = 0; // assume linefeed\n                    " + elapsed + " = response.elapsed;\n                })";
    };
    BASICRuntime.prototype.do__LET = function (stmt) {
        var _this = this;
        var right = this.expr2js(stmt.right);
        var s = "let _right = " + right + ";";
        for (var _i = 0, _a = stmt.lexprs; _i < _a.length; _i++) {
            var lexpr = _a[_i];
            // HP BASIC string-slice syntax?
            if (this.opts.arraysContainChars && lexpr.args && lexpr.name.endsWith('$')) {
                s += "this.globals." + lexpr.name + " = this.modifyStringSlice(this.vars." + lexpr.name + ", _right, ";
                s += lexpr.args.map(function (arg) { return _this.expr2js(arg); }).join(', ');
                s += ');';
            }
            else {
                var ljs = this.assign2js(lexpr);
                s += ljs + " = this.assign(" + JSON.stringify(lexpr.name) + ", _right);";
            }
        }
        return s;
    };
    BASICRuntime.prototype.do__FOR = function (stmt) {
        var name = JSON.stringify(stmt.lexpr.name);
        var init = this.expr2js(stmt.initial);
        var targ = this.expr2js(stmt.target);
        var step = stmt.step ? this.expr2js(stmt.step) : 'null';
        return "this.startForLoop(" + name + ", " + init + ", " + targ + ", " + step + ", " + stmt.endpc + ")";
    };
    BASICRuntime.prototype.do__NEXT = function (stmt) {
        var name = stmt.lexpr && JSON.stringify(stmt.lexpr.name);
        return "this.nextForLoop(" + name + ")";
    };
    BASICRuntime.prototype.do__IF = function (stmt) {
        var cond = this.expr2js(stmt.cond);
        if (stmt.endpc != null)
            return "if (!(" + cond + ")) { this.curpc = " + stmt.endpc + "; }";
        else
            return "if (!(" + cond + ")) { this.skipToElse(); }";
    };
    BASICRuntime.prototype.do__ELSE = function (stmt) {
        if (stmt.endpc != null)
            return "this.curpc = " + stmt.endpc;
        else
            return "this.skipToEOL()";
    };
    BASICRuntime.prototype.do__WHILE = function (stmt) {
        var cond = this.expr2js(stmt.cond);
        if (stmt.endpc != null)
            return "if (!(" + cond + ")) { this.curpc = " + (stmt.endpc + 1) + "; }";
        else
            return "this.whileLoop(" + cond + ")";
    };
    BASICRuntime.prototype.do__WEND = function (stmt) {
        if (stmt.startpc != null)
            return "this.curpc = " + stmt.startpc;
        else
            return "this.nextWhileLoop()";
    };
    BASICRuntime.prototype.do__DEF = function (stmt) {
        var args = [];
        for (var _i = 0, _a = stmt.lexpr.args || []; _i < _a.length; _i++) {
            var arg = _a[_i];
            if (isLookup(arg)) {
                args.push(arg.name);
            }
            else {
                this.runtimeError("I found a DEF statement with arguments other than variable names.");
            }
        }
        var functext = this.expr2js(stmt.def, { locals: args });
        //this.defs[stmt.lexpr.name] = new Function(args.join(','), functext).bind(this);
        return "this.defs." + stmt.lexpr.name + " = function(" + args.join(',') + ") { return " + functext + "; }.bind(this)";
    };
    BASICRuntime.prototype._DIM = function (dim) {
        // HP BASIC doesn't really have string arrays, just strings
        if (this.opts.arraysContainChars && dim.name.endsWith('$'))
            return '';
        // dimension an array
        var argsstr = '';
        for (var _i = 0, _a = dim.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            argsstr += ', ' + this.expr2js(arg, { isconst: this.opts.staticArrays });
        }
        return "this.dimArray(" + JSON.stringify(dim.name) + argsstr + ");";
    };
    BASICRuntime.prototype.do__DIM = function (stmt) {
        var _this = this;
        if (this.opts.staticArrays)
            return; // DIM at reset()
        var s = '';
        stmt.args.forEach(function (dim) { return s += _this._DIM(dim); });
        return s;
    };
    BASICRuntime.prototype.do__GOTO = function (stmt) {
        var label = this.expr2js(stmt.label);
        return "this.gotoLabel(" + label + ")";
    };
    BASICRuntime.prototype.do__GOSUB = function (stmt) {
        var label = this.expr2js(stmt.label);
        return "this.gosubLabel(" + label + ")";
    };
    BASICRuntime.prototype.do__RETURN = function (stmt) {
        return "this.returnFromGosub()";
    };
    BASICRuntime.prototype.do__ONGOTO = function (stmt) {
        var _this = this;
        var expr = this.expr2js(stmt.expr);
        var labels = stmt.labels.map(function (arg) { return _this.expr2js(arg, { isconst: true }); }).join(', ');
        if (stmt.command == 'ONGOTO')
            return "this.onGotoLabel(" + expr + ", " + labels + ")";
        else
            return "this.onGosubLabel(" + expr + ", " + labels + ")";
    };
    BASICRuntime.prototype.do__ONGOSUB = function (stmt) {
        return this.do__ONGOTO(stmt);
    };
    BASICRuntime.prototype.do__DATA = function () {
        // data is preprocessed
    };
    BASICRuntime.prototype.do__READ = function (stmt) {
        var _this = this;
        var s = '';
        stmt.args.forEach(function (arg) {
            s += _this.assign2js(arg) + " = this.assign(" + JSON.stringify(arg.name) + ", this.nextDatum(), true);";
        });
        return s;
    };
    BASICRuntime.prototype.do__RESTORE = function (stmt) {
        if (stmt.label != null)
            return "this.dataptr = this.label2dataptr[" + this.expr2js(stmt.label, { isconst: true }) + "] || 0";
        else
            return "this.dataptr = 0";
    };
    BASICRuntime.prototype.do__END = function () {
        return "this.skipToEOF()";
    };
    BASICRuntime.prototype.do__STOP = function () {
        return "this.skipToEOF()";
    };
    BASICRuntime.prototype.do__OPTION = function (stmt) {
        // already parsed in compiler
    };
    BASICRuntime.prototype.do__POP = function () {
        return "this.popReturnStack()";
    };
    BASICRuntime.prototype.do__GET = function (stmt) {
        var lexpr = this.assign2js(stmt.lexpr);
        // TODO: single key input
        return "this.preInput();\n                this.input().then((vals) => {\n                    " + lexpr + " = this.convert(" + JSON.stringify(stmt.lexpr.name) + ", vals[0]);\n                    this.postInput(true);\n                })";
    };
    BASICRuntime.prototype.do__CLEAR = function () {
        return 'this.clearVars()';
    };
    BASICRuntime.prototype.do__RANDOMIZE = function () {
        return "this.rng.randomize()";
    };
    BASICRuntime.prototype.do__CHANGE = function (stmt) {
        var arr2str = stmt.dest.name.endsWith('$');
        if (arr2str) { // array -> string
            var arrname = stmt.src.name || this.runtimeError("I can only change to a string from an array.");
            var dest = this.assign2js(stmt.dest);
            return "\n            let arrname = " + JSON.stringify(arrname) + ";\n            let len = this.arrayGet(arrname, 0);\n            let s = '';\n            for (let i=0; i<len; i++) {\n                s += String.fromCharCode(this.arrayGet(arrname, i+1));\n            }\n            " + dest + " = s;\n            ";
        }
        else { // string -> array
            var src = this.expr2js(stmt.src);
            var dest = this.array2js(stmt.dest);
            return "\n            let src = " + src + "+\"\";\n            " + dest + "[0] = src.length;\n            for (let i=0; i<src.length; i++) {\n                " + dest + "[i+1] = src.charCodeAt(i);\n            }\n            ";
        }
    };
    BASICRuntime.prototype.do__CONVERT = function (stmt) {
        var num2str = stmt.dest.name.endsWith('$');
        var src = this.expr2js(stmt.src);
        var dest = this.assign2js(stmt.dest);
        if (num2str) {
            return dest + " = this.valueToString(" + src + ", false)";
        }
        else {
            return dest + " = this.VAL(" + src + ")";
        }
    };
    BASICRuntime.prototype.do__SUB = function (stmt) {
        this.subroutines[stmt.lexpr.name] = stmt;
        // skip the SUB definition
        return "this.curpc = " + stmt.endpc;
    };
    BASICRuntime.prototype.do__CALL = function (stmt) {
        var substmt = this.subroutines[stmt.call.name];
        if (substmt == null)
            this.runtimeError("I can't find a subroutine named \"" + stmt.call.name + "\".");
        var subargs = substmt.lexpr.args || [];
        var callargs = stmt.call.args || [];
        if (subargs.length != callargs.length)
            this.runtimeError("I tried to call " + stmt.call.name + " with the wrong number of parameters.");
        var s = '';
        s += "this.gosubLabel(" + JSON.stringify(stmt.call.name) + ");";
        s += "this.newLocalScope();";
        for (var i = 0; i < subargs.length; i++) {
            var arg = subargs[i];
            s += "this.vars." + arg.name + " = " + this.expr2js(callargs[i]) + ";";
        }
        return s;
    };
    // TODO: ONERR, ON ERROR GOTO
    // TODO: memory quota
    // TODO: useless loop (! 4th edition)
    // TODO: other 4th edition errors
    // TODO: ecma55 all-or-none input checking?
    // FUNCTIONS
    BASICRuntime.prototype.isValid = function (obj) {
        if (typeof obj === 'number' && !isNaN(obj) && (!this.opts.checkOverflow || isFinite(obj)))
            return true;
        else if (typeof obj === 'string')
            return true;
        else
            return false;
    };
    BASICRuntime.prototype.checkValue = function (obj, exprname) {
        // check for unreferenced value
        if (typeof obj !== 'number' && typeof obj !== 'string') {
            // assign default value?
            if (obj == null && this.opts.defaultValues) {
                return exprname.endsWith("$") ? "" : 0;
            }
            if (exprname != null && obj == null) {
                this.runtimeError("I haven't assigned a value to " + exprname + ".");
            }
            else if (exprname != null) {
                this.runtimeError("I got an invalid value for " + exprname + ": " + obj);
            }
            else {
                this.runtimeError("I got an invalid value: " + obj);
            }
        }
        return obj;
    };
    BASICRuntime.prototype.getDef = function (exprname) {
        var fn = this.defs[exprname];
        if (!fn)
            this.runtimeError("I haven't run a DEF statement for " + exprname + ".");
        return fn;
    };
    BASICRuntime.prototype.checkNum = function (n) {
        this.checkValue(n, 'this');
        if (n === Infinity)
            this.runtimeError("I computed a number too big to store.");
        if (isNaN(n))
            this.runtimeError("I computed an invalid number.");
        return n;
    };
    BASICRuntime.prototype.checkString = function (s) {
        this.checkValue(s, 'this');
        if (typeof s !== 'string')
            this.runtimeError("I expected a string here.");
        else if (s.length > this.opts.maxStringLength)
            this.dialectError("create strings longer than " + this.opts.maxStringLength + " characters");
        return s;
    };
    BASICRuntime.prototype.add = function (a, b) {
        // TODO: if string-concat
        if (typeof a === 'number' && typeof b === 'number')
            return this.checkNum(a + b);
        else if (this.opts.stringConcat)
            return this.checkString(a + b);
        else
            this.dialectError("use the \"+\" operator to concatenate strings");
    };
    BASICRuntime.prototype.sub = function (a, b) {
        return this.checkNum(a - b);
    };
    BASICRuntime.prototype.mul = function (a, b) {
        return this.checkNum(a * b);
    };
    BASICRuntime.prototype.div = function (a, b) {
        if (b == 0)
            this.runtimeError("I can't divide by zero.");
        return this.checkNum(a / b);
    };
    BASICRuntime.prototype.idiv = function (a, b) {
        return this.FIX(this.INT(a) / this.INT(b));
    };
    BASICRuntime.prototype.mod = function (a, b) {
        return this.checkNum(a % b);
    };
    BASICRuntime.prototype.pow = function (a, b) {
        if (a == 0 && b < 0)
            this.runtimeError("I can't raise zero to a negative power.");
        return this.checkNum(Math.pow(a, b));
    };
    BASICRuntime.prototype.band = function (a, b) {
        return a & b;
    };
    BASICRuntime.prototype.bor = function (a, b) {
        return a | b;
    };
    BASICRuntime.prototype.bnot = function (a) {
        return ~a;
    };
    BASICRuntime.prototype.bxor = function (a, b) {
        return a ^ b;
    };
    BASICRuntime.prototype.bimp = function (a, b) {
        return this.bor(this.bnot(a), b);
    };
    BASICRuntime.prototype.beqv = function (a, b) {
        return this.bnot(this.bxor(a, b));
    };
    BASICRuntime.prototype.land = function (a, b) {
        return a && b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.lor = function (a, b) {
        return a || b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.lnot = function (a) {
        return a ? 0 : (this.opts.bitwiseLogic ? -1 : 1);
    };
    BASICRuntime.prototype.neg = function (a) {
        return -a;
    };
    BASICRuntime.prototype.eq = function (a, b) {
        return a == b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.ne = function (a, b) {
        return a != b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.lt = function (a, b) {
        return a < b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.gt = function (a, b) {
        return a > b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.le = function (a, b) {
        return a <= b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.ge = function (a, b) {
        return a >= b ? (this.opts.bitwiseLogic ? -1 : 1) : 0;
    };
    BASICRuntime.prototype.min = function (a, b) {
        return a < b ? a : b;
    };
    BASICRuntime.prototype.max = function (a, b) {
        return a > b ? a : b;
    };
    // FUNCTIONS (uppercase)
    // TODO: swizzle names for type-checking
    BASICRuntime.prototype.ABS = function (arg) {
        return this.checkNum(Math.abs(arg));
    };
    BASICRuntime.prototype.ASC = function (arg) {
        arg = this.checkString(arg);
        if (arg == '')
            this.runtimeError("I tried to call ASC() on an empty string.");
        return arg.charCodeAt(0);
    };
    BASICRuntime.prototype.ATN = function (arg) {
        return this.checkNum(Math.atan(arg));
    };
    BASICRuntime.prototype.CHR$ = function (arg) {
        return String.fromCharCode(this.checkNum(arg));
    };
    BASICRuntime.prototype.CINT = function (arg) {
        return this.ROUND(arg);
    };
    BASICRuntime.prototype.COS = function (arg) {
        return this.checkNum(Math.cos(arg));
    };
    BASICRuntime.prototype.COT = function (arg) {
        return this.checkNum(1.0 / Math.tan(arg)); // 4th edition only
    };
    BASICRuntime.prototype.CTL = function (arg) {
        return this.CHR$(arg);
    };
    BASICRuntime.prototype.EXP = function (arg) {
        return this.checkNum(Math.exp(arg));
    };
    BASICRuntime.prototype.FIX = function (arg) {
        return this.checkNum(arg < 0 ? Math.ceil(arg) : Math.floor(arg));
    };
    BASICRuntime.prototype.HEX$ = function (arg) {
        return this.ROUND(arg).toString(16);
    };
    BASICRuntime.prototype.INSTR = function (a, b, c) {
        if (c != null) {
            return this.checkString(b).indexOf(this.checkString(c), this.checkNum(a) - 1) + 1;
        }
        else {
            return this.checkString(a).indexOf(this.checkString(b)) + 1;
        }
    };
    BASICRuntime.prototype.INT = function (arg) {
        return this.checkNum(Math.floor(arg));
    };
    BASICRuntime.prototype.LEFT$ = function (arg, count) {
        arg = this.checkString(arg);
        count = this.ROUND(count);
        return arg.substr(0, count);
    };
    BASICRuntime.prototype.LEN = function (arg) {
        return this.checkString(arg).length;
    };
    BASICRuntime.prototype.LIN = function (arg) {
        return this.STRING$(arg, '\n');
    };
    BASICRuntime.prototype.LOG = function (arg) {
        if (arg == 0)
            this.runtimeError("I can't take the logarithm of zero (" + arg + ").");
        if (arg < 0)
            this.runtimeError("I can't take the logarithm of a negative number (" + arg + ").");
        return this.checkNum(Math.log(arg));
    };
    BASICRuntime.prototype.LOG10 = function (arg) {
        if (arg == 0)
            this.runtimeError("I can't take the logarithm of zero (" + arg + ").");
        if (arg < 0)
            this.runtimeError("I can't take the logarithm of a negative number (" + arg + ").");
        return this.checkNum(Math.log10(arg));
    };
    BASICRuntime.prototype.MID$ = function (arg, start, count) {
        arg = this.checkString(arg);
        if (!count)
            count = arg.length;
        start = this.ROUND(start);
        count = this.ROUND(count);
        if (start < 1)
            this.runtimeError("I can't compute MID$ if the starting index is less than 1.");
        return arg.substr(start - 1, count);
    };
    BASICRuntime.prototype.OCT$ = function (arg) {
        return this.ROUND(arg).toString(8);
    };
    BASICRuntime.prototype.PI = function () {
        return Math.PI;
    };
    // TODO: POS(haystack, needle, start)
    BASICRuntime.prototype.POS = function (arg1, arg2) {
        if (typeof arg1 == 'string' && typeof arg2 == 'string')
            return arg1.indexOf(arg2) >= 0 + 1;
        else
            return this.column + 1;
    };
    BASICRuntime.prototype.RIGHT$ = function (arg, count) {
        arg = this.checkString(arg);
        count = this.ROUND(count);
        return arg.substr(arg.length - count, count);
    };
    BASICRuntime.prototype.RND = function (arg) {
        // TODO: X<0 restart w/ seed, X=0 repeats
        if (arg < 0)
            this.rng.seedfloat(arg);
        return this.rng.next();
    };
    BASICRuntime.prototype.ROUND = function (arg) {
        return this.checkNum(Math.round(arg));
    };
    BASICRuntime.prototype.SGN = function (arg) {
        this.checkNum(arg);
        return (arg < 0) ? -1 : (arg > 0) ? 1 : 0;
    };
    BASICRuntime.prototype.SIN = function (arg) {
        return this.checkNum(Math.sin(arg));
    };
    BASICRuntime.prototype.SPACE$ = function (arg) {
        return this.STRING$(arg, ' ');
    };
    BASICRuntime.prototype.SPC = function (arg) {
        return this.SPACE$(arg);
    };
    BASICRuntime.prototype.SQR = function (arg) {
        if (arg < 0)
            this.runtimeError("I can't take the square root of a negative number (" + arg + ").");
        return this.checkNum(Math.sqrt(arg));
    };
    BASICRuntime.prototype.STR$ = function (arg) {
        return this.valueToString(this.checkNum(arg), false);
    };
    BASICRuntime.prototype.STRING$ = function (len, chr) {
        len = this.ROUND(len);
        if (len <= 0)
            return '';
        if (len > this.opts.maxStringLength)
            this.dialectError("create a string longer than " + this.opts.maxStringLength + " characters");
        if (typeof chr === 'string')
            return chr.substr(0, 1).repeat(len);
        else
            return String.fromCharCode(chr).repeat(len);
    };
    BASICRuntime.prototype.TAB = function (arg) {
        if (arg < 1) {
            arg = 1;
        } // TODO: SYSTEM MESSAGE IDENTIFYING THE EXCEPTION
        var spaces = this.ROUND(arg) - 1 - this.column;
        return this.SPACE$(spaces);
    };
    BASICRuntime.prototype.TAN = function (arg) {
        return this.checkNum(Math.tan(arg));
    };
    BASICRuntime.prototype.TIM = function (arg) {
        var d = new Date();
        switch (this.ROUND(arg)) {
            case 0: return d.getMinutes();
            case 1: return d.getHours();
            case 2:
                var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                var mn = d.getMonth();
                var dn = d.getDate();
                var dayOfYear = dayCount[mn] + dn;
                var isLeapYear = (d.getFullYear() & 3) == 0; // TODO: wrong
                if (mn > 1 && isLeapYear)
                    dayOfYear++;
                return dayOfYear;
            case 3: return d.getFullYear() % 100; // Y@K!
            case 4: return d.getSeconds();
            default: return 0;
        }
    };
    BASICRuntime.prototype.TIMER = function () {
        return Date.now() / 1000;
    };
    BASICRuntime.prototype.UPS$ = function (arg) {
        return this.checkString(arg).toUpperCase();
    };
    BASICRuntime.prototype.VAL = function (arg) {
        var n = parseFloat(this.checkString(arg));
        return isNaN(n) ? 0 : n; // TODO? altair works this way
    };
    BASICRuntime.prototype.LPAD$ = function (arg, len) {
        arg = this.checkString(arg);
        while (arg.length < len)
            arg = " " + arg;
        return arg;
    };
    BASICRuntime.prototype.RPAD$ = function (arg, len) {
        arg = this.checkString(arg);
        while (arg.length < len)
            arg = arg + " ";
        return arg;
    };
    BASICRuntime.prototype.NFORMAT$ = function (arg, numlen) {
        var s = this.float2str(arg, numlen);
        return (numlen > 0) ? this.LPAD$(s, numlen) : this.RPAD$(s, -numlen);
    };
    return BASICRuntime;
}());
exports.BASICRuntime = BASICRuntime;
//# sourceMappingURL=runtime.js.map