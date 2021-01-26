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
var compiler_1 = require("./compiler");
var runtime_1 = require("./runtime");
var util_1 = require("../util");
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
    crlfDelay: Infinity,
});
var inputlines = [];
rl.on('line', function (line) {
    //console.log(`Line from file: ${line}`);
    inputlines.push(line);
});
var fs = require('fs');
var parser = new compiler_1.BASICParser();
var runtime = new runtime_1.BASICRuntime();
function getCurrentLabel() {
    var loc = runtime.getCurrentSourceLocation();
    return loc ? loc.label : "?";
}
// parse args
var filename = '/dev/stdin';
var args = process.argv.slice(2);
var force = false;
for (var i = 0; i < args.length; i++) {
    if (args[i] == '-v')
        runtime.trace = true;
    else if (args[i] == '-d')
        parser.opts = compiler_1.DIALECTS[args[++i]] || Error('no such dialect');
    else if (args[i] == '-f')
        force = true;
    else if (args[i] == '--dialects')
        dumpDialectInfo();
    else
        filename = args[i];
}
// parse file
var data = fs.readFileSync(filename, 'utf-8');
try {
    var pgm = parser.parseFile(data, filename);
}
catch (e) {
    console.log(e);
    if (parser.errors.length == 0)
        console.log("@@@ " + e);
}
parser.errors.forEach(function (err) { return console.log("@@@ " + err.msg + " (line " + err.label + ")"); });
if (parser.errors.length && !force)
    process.exit(2);
// run program
try {
    runtime.load(pgm);
}
catch (e) {
    console.log("### " + e.message + " (line " + getCurrentLabel() + ")");
    process.exit(1);
}
runtime.reset();
runtime.print = function (s) {
    fs.writeSync(1, s + "");
};
runtime.input = function (prompt) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                function answered(answer) {
                    var line = answer.toUpperCase();
                    var vals = line.split(',');
                    //console.log(">>>",vals);
                    resolve({ line: line, vals: vals });
                }
                prompt += ' ?';
                if (inputlines.length) {
                    fs.writeSync(1, prompt);
                    fs.writeSync(1, '\n');
                    answered(inputlines.shift());
                }
                else
                    rl.question(prompt, function (answer) {
                        fs.writeSync(1, '\n');
                        answered(answer);
                    });
            })];
    });
}); };
runtime.resume = function () {
    process.nextTick(function () {
        try {
            if (runtime.step()) {
                if (runtime.running)
                    runtime.resume();
            }
            else if (runtime.exited) {
                //console.log("*** PROGRAM EXITED ***");
                process.exit(0);
            }
        }
        catch (e) {
            console.log("### " + e.message + " (line " + getCurrentLabel() + ")");
            process.exit(1);
        }
    });
};
runtime.resume();
/////
function dumpDialectInfo() {
    var dialects = new Set();
    var array = {};
    var SELECTED_DIALECTS = ['TINY', 'ECMA55', 'DARTMOUTH', 'HP', 'DEC', 'ALTAIR', 'BASIC80', 'MODERN'];
    SELECTED_DIALECTS.forEach(function (dkey) {
        dialects.add(compiler_1.DIALECTS[dkey]);
    });
    var ALL_KEYWORDS = new Set();
    var ALL_FUNCTIONS = new Set();
    var ALL_OPERATORS = new Set();
    dialects.forEach(function (dialect) {
        Object.entries(dialect).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value === null)
                value = "all";
            else if (value === true)
                value = "Y";
            else if (value === false)
                value = "-";
            else if (Array.isArray(value))
                value = value.length;
            if (!array[key])
                array[key] = [];
            array[key].push(value);
            if (dialect.validKeywords)
                dialect.validKeywords.map(ALL_KEYWORDS.add.bind(ALL_KEYWORDS));
            if (dialect.validFunctions)
                dialect.validFunctions.map(ALL_FUNCTIONS.add.bind(ALL_FUNCTIONS));
            if (dialect.validOperators)
                dialect.validOperators.map(ALL_OPERATORS.add.bind(ALL_OPERATORS));
        });
    });
    dialects.forEach(function (dialect) {
        ALL_KEYWORDS.forEach(function (keyword) {
            if (parser.supportsCommand(keyword)) {
                var has = dialect.validKeywords == null || dialect.validKeywords.indexOf(keyword) >= 0;
                keyword = '`' + keyword + '`';
                if (!array[keyword])
                    array[keyword] = [];
                array[keyword].push(has ? "Y" : "-");
            }
        });
        ALL_OPERATORS.forEach(function (keyword) {
            var has = dialect.validOperators == null || dialect.validOperators.indexOf(keyword) >= 0;
            if (keyword == '#')
                keyword = '*#*';
            keyword = "*a* " + keyword + " *b*";
            if (!array[keyword])
                array[keyword] = [];
            array[keyword].push(has ? "Y" : "-");
        });
        ALL_FUNCTIONS.forEach(function (keyword) {
            if (runtime.supportsFunction(keyword)) {
                var has = dialect.validFunctions == null || dialect.validFunctions.indexOf(keyword) >= 0;
                keyword = '`' + keyword + '()`';
                if (!array[keyword])
                    array[keyword] = [];
                array[keyword].push(has ? "Y" : "-");
            }
        });
    });
    Object.entries(array).forEach(function (_a) {
        var key = _a[0], arr = _a[1];
        var s = util_1.rpad(key, 30) + "|";
        s += arr.map(function (val) { return util_1.rpad(val, 9); }).join('|');
        console.log(s);
    });
    process.exit(0);
}
//# sourceMappingURL=run.js.map