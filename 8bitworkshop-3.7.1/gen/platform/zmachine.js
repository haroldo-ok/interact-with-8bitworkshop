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
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var ui_1 = require("../ide/ui");
var teletype_1 = require("../common/teletype");
var ZMACHINE_PRESETS = [
    { id: 'hello.inf', name: 'Hello World' },
    { id: 'house01.inf', name: 'House Tutorial #1' },
    { id: 'house02.inf', name: 'House Tutorial #2' },
    { id: 'house03.inf', name: 'House Tutorial #3' },
    { id: 'house04.inf', name: 'House Tutorial #4' },
    { id: 'house05.inf', name: 'House Tutorial #5' },
    { id: 'house06.inf', name: 'House Tutorial #6' },
    { id: 'house07.inf', name: 'House Tutorial #7' },
    { id: 'alice.inf', name: 'Through the Looking-Glass' },
    { id: 'aloneice.inf', name: 'Alone on the Ice' },
    { id: 'adventureland.inf', name: 'Adventureland' },
    { id: 'toyshop.inf', name: 'Toyshop' },
    { id: 'ruins1.inf', name: 'Ruins #1' },
    { id: 'ruins2.inf', name: 'Ruins #2' },
    { id: 'ruins3.inf', name: 'Ruins #3' },
    { id: 'balances.inf', name: 'Balances' },
    { id: 'museum.inf', name: 'Museum of Inform' },
    { id: 'advent.inf', name: 'Colossal Cave Adventure' },
    { id: 'ztrek.inf', name: 'Super Z Trek' },
];
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    //console.log(arguments);
}
var GlkImpl = /** @class */ (function () {
    function GlkImpl(page, input, upper) {
        var _this = this;
        this.exited = false;
        /* Dummy return value, which means that the Glk call is still in progress,
           or will never return at all. This is used by glk_exit(), glk_select(),
           and glk_fileref_create_by_prompt().
        */
        this.DidNotReturn = { dummy: 'Glk call has not yet returned' };
        this.RefBox = RefBox;
        this.RefStruct = RefStruct;
        this.mainwnd = new teletype_1.TeleTypeWithKeyboard(page, false, input);
        this.mainwnd.keepinput = false; // input moves w/ cursor
        this.mainwnd.splitInput = false;
        this.mainwnd.uppercaseOnly = true;
        this.mainwnd.hideinput();
        this.windows = {
            1: this.mainwnd,
            2: new teletype_1.TeleType(upper, true),
            3: new teletype_1.TeleType(null, true),
        };
        this.input = input;
        this.mainwnd.resolveInput = function (resp) {
            var s = resp.line;
            if (_this.vm.read_data.buffer) {
                for (var i = 0; i < s.length; i++) {
                    _this.vm.read_data.buffer[i] = s.charCodeAt(i) & 0xff;
                }
                _this.vm.handle_line_input(s.length);
            }
            else {
                _this.vm.handle_char_input(s.charCodeAt(0));
            }
            _this.vm.run();
        };
        this.reset();
    }
    GlkImpl.prototype.reset = function () {
        this.windowcount = 0;
        this.exited = false;
        this.windows[1].clear();
        this.windows[2].clear();
        this.curwnd = this.windows[1];
    };
    GlkImpl.prototype.init = function (options) {
        this.vm = options.vm;
        this.vm.start();
    };
    GlkImpl.prototype.fatal_error = function (s) {
        throw new emu_1.EmuHalt(s);
    };
    GlkImpl.prototype.update = function () {
        // TODO
    };
    GlkImpl.prototype.focusinput = function () {
        this.mainwnd.focusinput();
    };
    GlkImpl.prototype.flushline = function () {
        this.curwnd.flushline();
    };
    GlkImpl.prototype.glk_exit = function () {
        this.exited = true;
        this.flushline();
        this.windows[1].addtext("** Game exited **", 1);
    };
    GlkImpl.prototype.glk_window_clear = function (win) {
        debug('glk_window_clear', arguments);
        this.windows[win].clear();
    };
    GlkImpl.prototype.glk_request_line_event_uni = function (win, buf, initlen) {
        this.mainwnd.waitingfor = 'line';
        this.focusinput();
        this.startinputtimer();
    };
    GlkImpl.prototype.glk_request_char_event_uni = function (win, buf, initlen) {
        this.mainwnd.waitingfor = 'char';
        this.focusinput();
        this.startinputtimer();
    };
    GlkImpl.prototype.startinputtimer = function () {
        /* TODO?
        var rd = this.vm.read_data;
        if (rd.routine && rd.time) {
            this.vm['call'](rd.routine);
            //this.vm.run();
            setTimeout(this.startinputtimer.bind(this), rd.time*10);
        }
        */
    };
    GlkImpl.prototype.glk_put_jstring = function (val, allbytes) {
        //debug('glk_put_jstring', arguments);
        this.curwnd.print(val);
    };
    GlkImpl.prototype.glk_put_jstring_stream = function (stream, val) {
        //debug('glk_put_jstring_stream', arguments);
        this.windows[stream].print(val);
    };
    GlkImpl.prototype.glk_put_char_stream_uni = function (stream, ch) {
        //debug('glk_put_char_stream_uni', arguments);
        this.windows[stream].print(String.fromCharCode(ch));
    };
    GlkImpl.prototype.glk_set_style = function (val) {
        this.curwnd.curstyle = val;
    };
    /*
    glk_put_char(ch) {
        debug('glk_put_char', arguments);
    }
    glk_put_string(val) {
        debug('glk_put_string', arguments);
    }
    glk_put_string_stream(str, val) {
        debug('glk_put_string_stream', arguments);
    }
    glk_put_buffer(arr) {
        debug('glk_put_buffer', arguments);
    }
    glk_put_buffer_stream(str, arr) {
        debug('glk_put_buffer_stream', arguments);
    }
    glk_set_style_stream(str, val) {
        debug('glk_set_style_stream', arguments);
    }
    glk_get_char_stream(str) {
        debug('glk_get_char_stream', arguments);
    }
    glk_get_line_stream(str, buf) {
        debug('glk_get_line_stream', arguments);
    }
    glk_get_buffer_stream(str, buf) {
        debug('glk_get_buffer_stream', arguments);
    }
    */
    GlkImpl.prototype.glk_char_to_lower = function (val) {
        if (val >= 0x41 && val <= 0x5A)
            return val + 0x20;
        if (val >= 0xC0 && val <= 0xDE && val != 0xD7)
            return val + 0x20;
        return val;
    };
    GlkImpl.prototype.glk_char_to_upper = function (val) {
        if (val >= 0x61 && val <= 0x7A)
            return val - 0x20;
        if (val >= 0xE0 && val <= 0xFE && val != 0xF7)
            return val - 0x20;
        return val;
    };
    GlkImpl.prototype.glk_stylehint_set = function (wintype, styl, hint, value) {
        //debug('glk_stylehint_set', arguments);
    };
    GlkImpl.prototype.glk_stylehint_clear = function (wintype, styl, hint) {
        //debug('glk_stylehint_clear', arguments);
    };
    GlkImpl.prototype.glk_style_distinguish = function (win, styl1, styl2) {
        return 0;
    };
    GlkImpl.prototype.glk_style_measure = function (win, styl, hint, resultref) {
        if (resultref)
            resultref.set_value(0);
        return 0;
    };
    GlkImpl.prototype.glk_select = function (eventref) {
        debug('glk_select', arguments);
    };
    GlkImpl.prototype.glk_window_open = function (splitwin, method, size, wintype, rock) {
        debug('glk_window_open', arguments);
        if (splitwin) {
            if (method != 0x12 || wintype != 4)
                return 0;
            if (size) {
                $(this.windows[2].page).show();
                return 2; // split window
            }
            else {
                return 3; // fake window
            }
        }
        else {
            return 1; // main window
        }
    };
    GlkImpl.prototype.glk_window_close = function (win) {
        debug('glk_window_close', arguments);
        if (win == 2) {
            this.windows[win].clear();
            $(this.windows[win].page).hide();
        }
    };
    GlkImpl.prototype.glk_window_get_parent = function (win) {
        debug('glk_window_get_parent', arguments);
        if (win == 1)
            return 0;
        else
            return 1;
    };
    GlkImpl.prototype.glk_window_move_cursor = function (win, col, row) {
        debug('glk_window_move_cursor', arguments);
        this.windows[win].move_cursor(col, row);
    };
    GlkImpl.prototype.glk_window_set_arrangement = function (win, method, size, unknown) {
        debug('glk_window_set_arrangement', arguments);
        if (win == 1)
            this.windows[2].setrows(size);
    };
    GlkImpl.prototype.glk_window_get_stream = function (win) {
        debug('glk_window_get_stream', arguments);
        return win;
    };
    GlkImpl.prototype.glk_set_window = function (win) {
        debug('glk_set_window', arguments);
        this.curwnd = this.windows[win];
        if (this.curwnd == null)
            this.fatal_error("no window " + win);
    };
    GlkImpl.prototype.glk_window_get_size = function (win, widthref, heightref) {
        debug('glk_window_get_size', arguments);
        // TODO: made up sizes, only status line supported
        if (widthref)
            widthref.set_value(STATUS_NUM_COLS);
        if (heightref)
            heightref.set_value(win == 1 ? 25 : 1);
    };
    GlkImpl.prototype.garglk_set_reversevideo = function (val) {
        debug('garglk_set_reversevideo', arguments);
        this.curwnd.reverse = !!val;
    };
    GlkImpl.prototype.garglk_set_reversevideo_stream = function (win, val) {
        debug('garglk_set_reversevideo_stream', arguments);
        this.windows[win].reverse = !!val;
    };
    GlkImpl.prototype.glk_fileref_create_by_prompt = function (usage, mode, rock) {
        debug('glk_fileref_create_by_prompt', arguments);
        // TODO: support files?
        this.vm.handle_create_fileref(0);
        this.vm.run();
    };
    GlkImpl.prototype.glk_gestalt = function (sel, val) {
        return this.glk_gestalt_ext(sel, val, null);
    };
    GlkImpl.prototype.glk_gestalt_ext = function (sel, val, arr) {
        //debug('glk_gestalt_ext', arguments);
        switch (sel) {
            case 0: // gestalt_Version
                /* This implements Glk spec version 0.7.4? */
                return 0x00000101; // 0.1.1
            case 1: // gestalt_CharInput
                /* This is not a terrific approximation. Return false for function
                   keys, control keys, and the high-bit non-printables. For
                   everything else in the Unicode range, return true. */
                if (val <= Const.keycode_Left && val >= Const.keycode_End)
                    return 1;
                if (val >= 0x100000000 - Const.keycode_MAXVAL)
                    return 0;
                if (val > 0x10FFFF)
                    return 0;
                if ((val >= 0 && val < 32) || (val >= 127 && val < 160))
                    return 0;
                return 1;
            case 2: // gestalt_LineInput
                /* Same as the above, except no special keys. */
                if (val > 0x10FFFF)
                    return 0;
                if ((val >= 0 && val < 32) || (val >= 127 && val < 160))
                    return 0;
                return 1;
            case 3: // gestalt_CharOutput
                /* Same thing again. We assume that all printable characters,
                   as well as the placeholders for nonprintables, are one character
                   wide. */
                if ((val > 0x10FFFF)
                    || (val >= 0 && val < 32)
                    || (val >= 127 && val < 160)) {
                    if (arr)
                        arr[0] = 1;
                    return 0; // gestalt_CharOutput_CannotPrint
                }
                if (arr)
                    arr[0] = 1;
                return 2; // gestalt_CharOutput_ExactPrint
            case 4: // gestalt_MouseInput
                if (val == Const.wintype_TextBuffer)
                    return 0;
                if (val == Const.wintype_Graphics && has_canvas)
                    return 0;
                return 0;
            case 5: // gestalt_Timer
                return 0;
            case 6: // gestalt_Graphics
                return 0;
            case 7: // gestalt_DrawImage
                if (val == Const.wintype_TextBuffer)
                    return 0;
                if (val == Const.wintype_Graphics && has_canvas)
                    return 0;
                return 0;
            case 8: // gestalt_Sound
                return 0;
            case 9: // gestalt_SoundVolume
                return 0;
            case 10: // gestalt_SoundNotify
                return 0;
            case 11: // gestalt_Hyperlinks
                return 0;
            case 12: // gestalt_HyperlinkInput
                if (val == 3 || val == 4) // TextBuffer or TextGrid
                    return 0;
                else
                    return 0;
            case 13: // gestalt_SoundMusic
                return 0;
            case 14: // gestalt_GraphicsTransparency
                return 0;
            case 15: // gestalt_Unicode
                return 1;
            case 16: // gestalt_UnicodeNorm
                return 1;
            case 17: // gestalt_LineInputEcho
                return 1;
            case 18: // gestalt_LineTerminators
                return 1;
            case 19: // gestalt_LineTerminatorKey
                /* Really this result should be inspected from glkote.js. Since it
                   isn't, be sure to keep these values in sync with
                   terminator_key_names. */
                if (val == Const.keycode_Escape)
                    return 0;
                if (val >= Const.keycode_Func12 && val <= Const.keycode_Func1)
                    return 0;
                return 0;
            case 20: // gestalt_DateTime
                return 0;
            case 21: // gestalt_Sound2
                return 0;
            case 22: // gestalt_ResourceStream
                return 0;
            case 23: // gestalt_GraphicsCharInput
                return 0;
            case 0x1100: // reverse video, color
                return 0;
        }
        return 0;
    };
    return GlkImpl;
}());
/* RefBox: Simple class used for "call-by-reference" Glk arguments. The object
   is just a box containing a single value, which can be written and read.
*/
var RefBox = /** @class */ (function () {
    function RefBox() {
    }
    RefBox.prototype.set_value = function (val) {
        this.value = val;
    };
    RefBox.prototype.get_value = function () {
        return this.value;
    };
    return RefBox;
}());
/* RefStruct: Used for struct-type Glk arguments. After creating the
   object, you should call push_field() the appropriate number of times,
   to set the initial field values. Then set_field() can be used to
   change them, and get_fields() retrieves the list of all fields.

   (The usage here is loose, since Javascript is forgiving about arrays.
   Really the caller could call set_field() instead of push_field() --
   or skip that step entirely, as long as the Glk function later calls
   set_field() for each field. Which it should.)
*/
var RefStruct = /** @class */ (function () {
    function RefStruct(numels) {
        this.fields = [];
    }
    RefStruct.prototype.push_field = function (val) {
        this.fields.push(val);
    };
    RefStruct.prototype.set_field = function (pos, val) {
        this.fields[pos] = val;
    };
    RefStruct.prototype.get_field = function (pos) {
        return this.fields[pos];
    };
    RefStruct.prototype.get_fields = function () {
        return this.fields;
    };
    return RefStruct;
}());
var has_canvas = typeof window === 'object';
var Const = {
    gestalt_Version: 0,
    gestalt_CharInput: 1,
    gestalt_LineInput: 2,
    gestalt_CharOutput: 3,
    gestalt_CharOutput_CannotPrint: 0,
    gestalt_CharOutput_ApproxPrint: 1,
    gestalt_CharOutput_ExactPrint: 2,
    gestalt_MouseInput: 4,
    gestalt_Timer: 5,
    gestalt_Graphics: 6,
    gestalt_DrawImage: 7,
    gestalt_Sound: 8,
    gestalt_SoundVolume: 9,
    gestalt_SoundNotify: 10,
    gestalt_Hyperlinks: 11,
    gestalt_HyperlinkInput: 12,
    gestalt_SoundMusic: 13,
    gestalt_GraphicsTransparency: 14,
    gestalt_Unicode: 15,
    gestalt_UnicodeNorm: 16,
    gestalt_LineInputEcho: 17,
    gestalt_LineTerminators: 18,
    gestalt_LineTerminatorKey: 19,
    gestalt_DateTime: 20,
    gestalt_Sound2: 21,
    gestalt_ResourceStream: 22,
    gestalt_GraphicsCharInput: 23,
    keycode_Unknown: 0xffffffff,
    keycode_Left: 0xfffffffe,
    keycode_Right: 0xfffffffd,
    keycode_Up: 0xfffffffc,
    keycode_Down: 0xfffffffb,
    keycode_Return: 0xfffffffa,
    keycode_Delete: 0xfffffff9,
    keycode_Escape: 0xfffffff8,
    keycode_Tab: 0xfffffff7,
    keycode_PageUp: 0xfffffff6,
    keycode_PageDown: 0xfffffff5,
    keycode_Home: 0xfffffff4,
    keycode_End: 0xfffffff3,
    keycode_Func1: 0xffffffef,
    keycode_Func2: 0xffffffee,
    keycode_Func3: 0xffffffed,
    keycode_Func4: 0xffffffec,
    keycode_Func5: 0xffffffeb,
    keycode_Func6: 0xffffffea,
    keycode_Func7: 0xffffffe9,
    keycode_Func8: 0xffffffe8,
    keycode_Func9: 0xffffffe7,
    keycode_Func10: 0xffffffe6,
    keycode_Func11: 0xffffffe5,
    keycode_Func12: 0xffffffe4,
    /* The last keycode is always (0x100000000 - keycode_MAXVAL) */
    keycode_MAXVAL: 28,
    evtype_None: 0,
    evtype_Timer: 1,
    evtype_CharInput: 2,
    evtype_LineInput: 3,
    evtype_MouseInput: 4,
    evtype_Arrange: 5,
    evtype_Redraw: 6,
    evtype_SoundNotify: 7,
    evtype_Hyperlink: 8,
    evtype_VolumeNotify: 9,
    style_Normal: 0,
    style_Emphasized: 1,
    style_Preformatted: 2,
    style_Header: 3,
    style_Subheader: 4,
    style_Alert: 5,
    style_Note: 6,
    style_BlockQuote: 7,
    style_Input: 8,
    style_User1: 9,
    style_User2: 10,
    style_NUMSTYLES: 11,
    wintype_AllTypes: 0,
    wintype_Pair: 1,
    wintype_Blank: 2,
    wintype_TextBuffer: 3,
    wintype_TextGrid: 4,
    wintype_Graphics: 5,
    winmethod_Left: 0x00,
    winmethod_Right: 0x01,
    winmethod_Above: 0x02,
    winmethod_Below: 0x03,
    winmethod_DirMask: 0x0f,
    winmethod_Fixed: 0x10,
    winmethod_Proportional: 0x20,
    winmethod_DivisionMask: 0xf0,
    winmethod_Border: 0x000,
    winmethod_NoBorder: 0x100,
    winmethod_BorderMask: 0x100,
    fileusage_Data: 0x00,
    fileusage_SavedGame: 0x01,
    fileusage_Transcript: 0x02,
    fileusage_InputRecord: 0x03,
    fileusage_TypeMask: 0x0f,
    fileusage_TextMode: 0x100,
    fileusage_BinaryMode: 0x000,
    filemode_Write: 0x01,
    filemode_Read: 0x02,
    filemode_ReadWrite: 0x03,
    filemode_WriteAppend: 0x05,
    seekmode_Start: 0,
    seekmode_Current: 1,
    seekmode_End: 2,
    stylehint_Indentation: 0,
    stylehint_ParaIndentation: 1,
    stylehint_Justification: 2,
    stylehint_Size: 3,
    stylehint_Weight: 4,
    stylehint_Oblique: 5,
    stylehint_Proportional: 6,
    stylehint_TextColor: 7,
    stylehint_BackColor: 8,
    stylehint_ReverseColor: 9,
    stylehint_NUMHINTS: 10,
    stylehint_just_LeftFlush: 0,
    stylehint_just_LeftRight: 1,
    stylehint_just_Centered: 2,
    stylehint_just_RightFlush: 3,
    imagealign_InlineUp: 1,
    imagealign_InlineDown: 2,
    imagealign_InlineCenter: 3,
    imagealign_MarginLeft: 4,
    imagealign_MarginRight: 5
};
//
var STATUS_NUM_COLS = 80;
var ZmachinePlatform = /** @class */ (function () {
    function ZmachinePlatform(mainElement) {
        this.focused = false;
        this.mainElement = mainElement;
        $(mainElement).css('overflowY', 'auto');
    }
    ZmachinePlatform.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parent, gameport, upperwnd, windowport, inputline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ui_1.loadScript('./lib/zvm/ifvms.min.js')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ui_1.loadScript('./gen/common/teletype.js')];
                    case 2:
                        _a.sent();
                        parent = this.mainElement;
                        gameport = $('<div id="gameport"/>').appendTo(parent);
                        upperwnd = $('<div id="upperport" class="transcript transcript-split transcript-style-2"/>').insertBefore(parent).hide();
                        windowport = $('<div id="windowport" class="transcript"/>').appendTo(gameport);
                        inputline = $('<input class="transcript-input" type="text"/>').appendTo(gameport).hide();
                        this.glk = new GlkImpl(windowport[0], inputline[0], upperwnd[0]);
                        this.resize = function () {
                            // set font size proportional to window width
                            var charwidth = $(gameport).width() * 1.6 / STATUS_NUM_COLS;
                            $(upperwnd).css('font-size', charwidth + 'px');
                        };
                        this.resize();
                        return [2 /*return*/];
                }
            });
        });
    };
    ZmachinePlatform.prototype.loadROM = function (title, data) {
        this.zfile = data;
        this.reset();
    };
    ZmachinePlatform.prototype.getROMExtension = function () {
        return ".z" + (this.zvm.version || 5);
    };
    ZmachinePlatform.prototype.reset = function () {
        if (this.zfile == null)
            return;
        this.zvm = new ZVM();
        this.zvm.prepare(this.zfile.slice(0), {
            Glk: this.glk,
        });
        this.glk.reset();
        this.glk.init({
            vm: this.zvm,
        });
        console.log(this.zvm);
    };
    ZmachinePlatform.prototype.pause = function () {
    };
    ZmachinePlatform.prototype.resume = function () {
    };
    ZmachinePlatform.prototype.readAddress = function (a) {
        return this.zvm && a < this.zvm.ram.byteLength ? this.zvm.ram.getUint8(a) : this.zfile[a];
    };
    ZmachinePlatform.prototype.getPC = function () {
        return this.zvm.pc;
    };
    /*
    loadState(state): void {
        throw new Error("Method not implemented.");
    }
    saveState() {
        return {
            //glk: this.Glk.save_allstate(),
            io: $.extend(true, {}, this.zvm.io),
            ram: this.zvm.save_file(this.zvm.pc, 1),
            read_data: $.extend(true, {}, this.zvm.read_data),
            xorshift_seed: this.zvm.xorshift_seed,
        }
    }
    */
    ZmachinePlatform.prototype.isRunning = function () {
        return this.zvm != null && !this.glk.exited;
    };
    ZmachinePlatform.prototype.advance = function (novideo) {
        // TODO? we should advance 1 step, whatever that is in ZVM
        return 0;
    };
    ZmachinePlatform.prototype.getToolForFilename = function (s) {
        return "inform6";
    };
    ZmachinePlatform.prototype.getDefaultExtension = function () {
        return ".inf";
    };
    ZmachinePlatform.prototype.showHelp = function (tool, ident) {
        switch (tool) {
            case 'inform6':
                window.open("https://www.inform-fiction.org/manual/html/contents.html");
                break;
        }
    };
    ZmachinePlatform.prototype.getPresets = function () {
        return ZMACHINE_PRESETS;
    };
    // TODO: Z machine is big endian!!
    ZmachinePlatform.prototype.inspect = function (ident) {
        return baseplatform_1.inspectSymbol(this, ident);
    };
    ZmachinePlatform.prototype.getDebugTree = function () {
        var _this = this;
        var root = {};
        //root['debuginfo'] = sym.debuginfo;
        if (this.zvm != null) {
            root['Objects'] = { $$: function () { return _this.getRootObjects(); } };
            root['Globals'] = { $$: function () { return _this.getGlobalVariables(); } };
            //root['VM'] = {$$: () => this.zvm};
        }
        return root;
    };
    ZmachinePlatform.prototype.getObjectName = function (node) {
        var objlookup = this.getDebugLookup('object');
        var name = objlookup[node] || "";
        name += " (#" + node + ")";
        return name;
    };
    ZmachinePlatform.prototype.addObjectToTree = function (tree, child) {
        var name = this.getObjectName(child);
        tree[name] = this.getObjectTree(child);
    };
    ZmachinePlatform.prototype.getRootObjects = function () {
        var tree = {};
        // TODO: better way?
        try {
            for (var child = 0; child < 65536; child++) {
                if (this.zvm.get_parent(child) == 0) {
                    this.addObjectToTree(tree, child);
                }
            }
        }
        catch (e) {
            if (!(e instanceof RangeError))
                throw e;
        }
        return tree;
    };
    ZmachinePlatform.prototype.getObjectTree = function (parentobj) {
        var child = this.zvm.get_child(parentobj);
        var tree = {};
        while (child) {
            this.addObjectToTree(tree, child);
            child = this.zvm.get_sibling(child);
        }
        // add attributes
        var flags = this.getFlagList(parentobj);
        if (flags.length) {
            tree["[attributes]"] = flags.join(' ');
        }
        /*
        var props = this.getPropList(parentobj);
        if (props.length) {
            tree["[properties]"] = props.join(' ');
        }
        */
        return tree;
    };
    ZmachinePlatform.prototype.getFlagList = function (obj) {
        var attrlookup = this.getDebugLookup('attribute');
        var set_attrs = [];
        for (var i = 0; i < 32; i++) {
            if (this.zvm.test_attr(obj, i)) {
                set_attrs.push(attrlookup[i] || "#" + i);
            }
        }
        return set_attrs;
    };
    ZmachinePlatform.prototype.getPropList = function (obj) {
        var proplookup = this.getDebugLookup('property');
        var set_props = [];
        var addr = 0;
        for (var i = 0; i < 50; i++) {
            addr = this.zvm.find_prop(obj, 0, addr);
            if (addr == 0)
                break;
            set_props.push(proplookup[addr] || "%" + addr);
        }
        return set_props;
    };
    ZmachinePlatform.prototype.getDebugLookup = function (key) {
        var debugsym = this.debugSymbols;
        return (debugsym && debugsym.debuginfo && debugsym.debuginfo[key]) || {};
    };
    ZmachinePlatform.prototype.getGlobalVariables = function () {
        var _this = this;
        var globals = this.getDebugLookup('global-variable');
        var result = {};
        Object.entries(globals).forEach(function (entry) {
            var addr = parseInt(entry[0]);
            var name = entry[1];
            result[name] = _this.zvm.m.getUint16(addr);
        });
        return result;
    };
    return ZmachinePlatform;
}());
//
emu_1.PLATFORMS['zmachine'] = ZmachinePlatform;
//# sourceMappingURL=zmachine.js.map