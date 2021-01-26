"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceFile = void 0;
var SourceFile = /** @class */ (function () {
    function SourceFile(lines, text) {
        lines = lines || [];
        this.lines = lines;
        this.text = text;
        this.offset2loc = new Map();
        this.line2offset = new Map();
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var info = lines_1[_i];
            if (info.offset >= 0) {
                this.offset2loc[info.offset] = info;
                this.line2offset[info.line] = info.offset;
            }
        }
    }
    // TODO: smarter about looking for source lines between two addresses
    SourceFile.prototype.findLineForOffset = function (PC, lookbehind) {
        if (this.offset2loc) {
            for (var i = 0; i <= lookbehind; i++) {
                var loc = this.offset2loc[PC];
                if (loc) {
                    return loc;
                }
                PC--;
            }
        }
        return null;
    };
    SourceFile.prototype.lineCount = function () { return this.lines.length; };
    return SourceFile;
}());
exports.SourceFile = SourceFile;
;
;
//# sourceMappingURL=workertypes.js.map