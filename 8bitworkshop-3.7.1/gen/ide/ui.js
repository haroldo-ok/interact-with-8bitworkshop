"use strict";
// 8bitworkshop IDE user interface
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
exports.highlightSearch = exports.reloadWorkspaceFile = exports.getElectronFile = exports.emulationHalted = exports.getSaveState = exports.getTestOutput = exports.setTestInput = exports.startUI = exports.setupSplits = exports.haltEmulation = exports.qs = exports.setFrameRateUI = exports.runToPC = exports.loadScript = exports.lastDebugState = exports.compparams = exports.projectWindows = exports.current_project = exports.platform = exports.repo_id = exports.store_id = exports.platform_id = void 0;
var $ = require("jquery");
var project_1 = require("./project");
var windows_1 = require("./windows");
var baseplatform_1 = require("../common/baseplatform");
var emu_1 = require("../common/emu");
var Views = require("./views");
var store_1 = require("./store");
var util_1 = require("../common/util");
var recorder_1 = require("../common/recorder");
var services_1 = require("./services");
// make sure VCS doesn't start
if (window['Javatari'])
    window['Javatari'].AUTO_START = false;
var PRESETS; // presets array
var toolbar = $("#controls_top");
var uitoolbar;
var stateRecorder;
var userPaused; // did user explicitly pause?
var current_output; // current ROM
var current_preset; // current preset object (if selected)
var store; // persistent store
var lastDebugInfo; // last debug info (CPU text)
var debugCategory; // current debug category
var debugTickPaused = false;
var recorderActive = false;
var lastViewClicked = null;
var lastBreakExpr = "c.PC == 0x6000";
// TODO: codemirror multiplex support?
// TODO: move to views.ts?
var TOOL_TO_SOURCE_STYLE = {
    'dasm': '6502',
    'acme': '6502',
    'cc65': 'text/x-csrc',
    'ca65': '6502',
    'nesasm': '6502',
    'z80asm': 'z80',
    'sdasz80': 'z80',
    'sdcc': 'text/x-csrc',
    'verilator': 'verilog',
    'jsasm': 'z80',
    'zmac': 'z80',
    'bataribasic': 'bataribasic',
    'markdown': 'markdown',
    'js': 'javascript',
    'xasm6809': 'z80',
    'cmoc': 'text/x-csrc',
    'yasm': 'gas',
    'smlrc': 'text/x-csrc',
    'inform6': 'inform6',
    'fastbasic': 'fastbasic',
    'basic': 'basic',
    'silice': 'verilog',
};
function gaEvent(category, action, label, value) {
    if (window['ga'])
        ga('send', 'event', category, action, label, value);
}
function alertError(s) {
    gaEvent('error', exports.platform_id || 'error', s);
    setWaitDialog(false);
    bootbox.alert({
        title: '<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> Alert',
        message: s
    });
}
function alertInfo(s) {
    setWaitDialog(false);
    bootbox.alert(s);
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
function newWorker() {
    return new Worker("./src/worker/loader.js");
}
var hasLocalStorage = function () {
    try {
        var key = "__some_random_key_you_are_not_going_to_use__";
        localStorage.setItem(key, key);
        var has = localStorage.getItem(key) == key;
        localStorage.removeItem(key);
        return has;
    }
    catch (e) {
        return false;
    }
}();
// https://developers.google.com/web/updates/2016/06/persistent-storage
function requestPersistPermission(interactive, failureonly) {
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(function (persistent) {
            console.log("requestPersistPermission =", persistent);
            if (persistent) {
                interactive && !failureonly && alertInfo("Your browser says it will persist your local file edits, but you may want to back up your work anyway.");
            }
            else {
                interactive && alertError("Your browser refused to expand the peristent storage quota. Your edits may not be preserved after closing the page.");
            }
        });
    }
    else {
        interactive && alertError("Your browser may not persist edits after closing the page. Try a different browser.");
    }
}
function getCurrentPresetTitle() {
    if (!current_preset)
        return exports.current_project.mainPath || "ROM";
    else
        return current_preset.title || current_preset.name || exports.current_project.mainPath || "ROM";
}
function setLastPreset(id) {
    if (hasLocalStorage) {
        if (exports.repo_id && exports.platform_id && !isElectron)
            localStorage.setItem("__lastrepo_" + exports.platform_id, exports.repo_id);
        else
            localStorage.removeItem("__lastrepo_" + exports.platform_id);
        localStorage.setItem("__lastplatform", exports.platform_id);
        localStorage.setItem("__lastid_" + exports.store_id, id);
    }
}
function unsetLastPreset() {
    if (hasLocalStorage) {
        delete exports.qs['file'];
        localStorage.removeItem("__lastid_" + exports.store_id);
    }
}
function initProject() {
    exports.current_project = new project_1.CodeProject(newWorker(), exports.platform_id, exports.platform, store);
    exports.projectWindows = new windows_1.ProjectWindows($("#workspace")[0], exports.current_project);
    if (isElectronWorkspace) {
        exports.current_project.persistent = false;
        exports.current_project.callbackGetRemote = getElectronFile;
        exports.current_project.callbackStoreFile = putWorkspaceFile;
    }
    else {
        exports.current_project.callbackGetRemote = util_1.getWithBinary;
    }
    exports.current_project.callbackBuildResult = function (result) {
        setCompileOutput(result);
    };
    exports.current_project.callbackBuildStatus = function (busy) {
        setBusyStatus(busy);
    };
}
function setBusyStatus(busy) {
    if (busy) {
        toolbar.addClass("is-busy");
    }
    else {
        toolbar.removeClass("is-busy");
    }
    $('#compile_spinner').css('visibility', busy ? 'visible' : 'hidden');
}
function refreshWindowList() {
    var ul = $("#windowMenuList").empty();
    var separate = false;
    function addWindowItem(id, name, createfn) {
        if (separate) {
            ul.append(document.createElement("hr"));
            separate = false;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.setAttribute("class", "dropdown-item");
        a.setAttribute("href", "#");
        a.setAttribute("data-wndid", id);
        if (id == exports.projectWindows.getActiveID())
            $(a).addClass("dropdown-item-checked");
        a.appendChild(document.createTextNode(name));
        li.appendChild(a);
        ul.append(li);
        if (createfn) {
            var onopen = function (id, wnd) {
                ul.find('a').removeClass("dropdown-item-checked");
                $(a).addClass("dropdown-item-checked");
            };
            exports.projectWindows.setCreateFunc(id, createfn);
            exports.projectWindows.setShowFunc(id, onopen);
            $(a).click(function (e) {
                exports.projectWindows.createOrShow(id);
                lastViewClicked = id;
            });
        }
    }
    function loadEditor(path) {
        var tool = exports.platform.getToolForFilename(path);
        var mode = tool && TOOL_TO_SOURCE_STYLE[tool];
        return new Views.SourceEditor(path, mode);
    }
    function addEditorItem(id) {
        addWindowItem(id, util_1.getFilenameForPath(id), function () {
            var data = exports.current_project.getFile(id);
            if (typeof data === 'string')
                return loadEditor(id);
            else if (data instanceof Uint8Array)
                return new Views.BinaryFileView(id, data);
        });
    }
    // add main file editor
    addEditorItem(exports.current_project.mainPath);
    // add other source files
    exports.current_project.iterateFiles(function (id, text) {
        if (text && id != exports.current_project.mainPath) {
            addEditorItem(id);
        }
    });
    // add listings
    separate = true;
    var listings = exports.current_project.getListings();
    if (listings) {
        for (var lstfn in listings) {
            var lst = listings[lstfn];
            // add listing if source/assembly file exists and has text
            if ((lst.assemblyfile && lst.assemblyfile.text) || (lst.sourcefile && lst.sourcefile.text)) {
                addWindowItem(lstfn, util_1.getFilenameForPath(lstfn), function (path) {
                    return new Views.ListingView(path);
                });
            }
        }
    }
    // add other tools
    separate = true;
    if (exports.platform.disassemble && exports.platform.saveState) {
        addWindowItem("#disasm", "Disassembly", function () {
            return new Views.DisassemblerView();
        });
    }
    if (exports.platform.readAddress) {
        addWindowItem("#memory", "Memory Browser", function () {
            return new Views.MemoryView();
        });
    }
    if (exports.current_project.segments && exports.current_project.segments.length) {
        addWindowItem("#memmap", "Memory Map", function () {
            return new Views.MemoryMapView();
        });
    }
    if (exports.platform.readVRAMAddress) {
        addWindowItem("#memvram", "VRAM Browser", function () {
            return new Views.VRAMMemoryView();
        });
    }
    if (exports.platform.startProbing) {
        addWindowItem("#memheatmap", "Memory Probe", function () {
            return new Views.AddressHeatMapView();
        });
        // TODO: only if raster
        addWindowItem("#crtheatmap", "CRT Probe", function () {
            return new Views.RasterPCHeatMapView();
        });
        addWindowItem("#probelog", "Probe Log", function () {
            return new Views.ProbeLogView();
        });
        addWindowItem("#symbolprobe", "Symbol Profiler", function () {
            return new Views.ProbeSymbolView();
        });
        addWindowItem("#callstack", "Call Stack", function () {
            return new Views.CallStackView();
        });
        /*
        addWindowItem("#framecalls", "Frame Profiler", () => {
          return new Views.FrameCallsView();
        });
        */
    }
    if (exports.platform.getDebugTree) {
        addWindowItem("#debugview", "Debug Tree", function () {
            return new Views.DebugBrowserView();
        });
    }
    addWindowItem('#asseteditor', 'Asset Editor', function () {
        return new Views.AssetEditorView();
    });
}
function loadMainWindow(preset_id) {
    // we need this to build create functions for the editor
    refreshWindowList();
    // show main file
    exports.projectWindows.createOrShow(preset_id);
    // build project
    exports.current_project.setMainFile(preset_id);
}
function loadProject(preset_id) {
    return __awaiter(this, void 0, void 0, function () {
        var result, skel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // set current file ID
                    // TODO: this is done twice (mainPath and mainpath!)
                    exports.current_project.mainPath = preset_id;
                    setLastPreset(preset_id);
                    return [4 /*yield*/, exports.current_project.loadFiles([preset_id])];
                case 1:
                    result = _a.sent();
                    measureTimeLoad = new Date(); // for timing calc.
                    if (!(result && result.length)) return [3 /*break*/, 2];
                    // file found; continue
                    loadMainWindow(preset_id);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getSkeletonFile(preset_id)];
                case 3:
                    skel = _a.sent();
                    exports.current_project.filedata[preset_id] = skel || "\n";
                    loadMainWindow(preset_id);
                    // don't alert if we selected "new file"
                    if (!exports.qs['newfile']) {
                        alertInfo("Could not find file \"" + preset_id + "\". Loading default file.");
                    }
                    else {
                        requestPersistPermission(true, true);
                    }
                    delete exports.qs['newfile'];
                    replaceURLState();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function reloadProject(id) {
    // leave repository == '/'
    if (id == '/') {
        exports.qs = { repo: '/' };
    }
    else if (id.indexOf('://') >= 0) {
        var urlparse = services_1.parseGithubURL(id);
        if (urlparse) {
            exports.qs = { repo: urlparse.repopath };
        }
    }
    else {
        exports.qs['platform'] = exports.platform_id;
        exports.qs['file'] = id;
    }
    gotoNewLocation();
}
function getSkeletonFile(fileid) {
    return __awaiter(this, void 0, void 0, function () {
        var ext, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ext = exports.platform.getToolForFilename(fileid);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, $.get("presets/" + util_1.getBasePlatform(exports.platform_id) + "/skeleton." + ext, 'text')];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_1 = _a.sent();
                    alertError("Could not load skeleton for " + exports.platform_id + "/" + ext + "; using blank file");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function checkEnteredFilename(fn) {
    if (fn.indexOf(" ") >= 0) {
        alertError("No spaces in filenames, please.");
        return false;
    }
    return true;
}
function _createNewFile(e) {
    // TODO: support spaces
    bootbox.prompt({
        title: "Enter the name of your new main source file.",
        placeholder: "newfile" + exports.platform.getDefaultExtension(),
        callback: function (filename) {
            if (filename && filename.trim().length > 0) {
                if (!checkEnteredFilename(filename))
                    return;
                if (filename.indexOf(".") < 0) {
                    filename += exports.platform.getDefaultExtension();
                }
                var path = filename;
                gaEvent('workspace', 'file', 'new');
                exports.qs['newfile'] = '1';
                reloadProject(path);
            }
        }
    });
    return true;
}
function _uploadNewFile(e) {
    $("#uploadFileElem").click();
}
// called from index.html
function handleFileUpload(files) {
    console.log(files);
    var index = 0;
    function uploadNextFile() {
        var f = files[index++];
        if (!f) {
            console.log("Done uploading", index);
            if (index > 2) {
                alertInfo("Files uploaded.");
                setTimeout(updateSelector, 1000); // TODO: wait for files to upload
            }
            else {
                exports.qs['file'] = files[0].name;
                bootbox.confirm({
                    message: "Open '" + exports.qs['file'] + "' as main project file?",
                    buttons: {
                        confirm: { label: "Open As New Project" },
                        cancel: { label: "Include/Link With Project Later" },
                    },
                    callback: function (result) {
                        if (result)
                            gotoNewLocation();
                        else
                            setTimeout(updateSelector, 1000); // TODO: wait for files to upload
                    }
                });
            }
            gaEvent('workspace', 'file', 'upload');
        }
        else {
            var path = f.name;
            var reader = new FileReader();
            reader.onload = function (e) {
                var arrbuf = e.target.result;
                var data = new Uint8Array(arrbuf);
                // convert to UTF8, unless it's a binary file
                if (util_1.isProbablyBinary(path, data)) {
                    //gotoMainFile = false;
                }
                else {
                    data = util_1.byteArrayToUTF8(data).replace('\r\n', '\n'); // convert CRLF to LF
                }
                // store in local forage
                exports.projectWindows.updateFile(path, data);
                console.log("Uploaded " + path + " " + data.length + " bytes");
                uploadNextFile();
            };
            reader.readAsArrayBuffer(f); // read as binary
        }
    }
    if (files)
        uploadNextFile();
}
function getCurrentMainFilename() {
    return util_1.getFilenameForPath(exports.current_project.mainPath);
}
function getCurrentEditorFilename() {
    return util_1.getFilenameForPath(exports.projectWindows.getActiveID());
}
// GITHUB stuff (TODO: move)
var githubService;
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function getGithubService() {
    if (!githubService) {
        // get github API key from cookie
        // TODO: move to service?
        var ghkey = getCookie('__github_key');
        githubService = new services_1.GithubService(exports['Octokat'], ghkey, store, exports.current_project);
        console.log("loaded github service");
    }
    return githubService;
}
function getBoundGithubURL() {
    var toks = (exports.repo_id || '').split('/');
    if (toks.length != 2) {
        alertError("<p>You are not in a GitHub repository.</p><p>Choose one from the pulldown, or Import or Publish one.</p>");
        return null;
    }
    return 'https://github.com/' + toks[0] + '/' + toks[1];
}
function importProjectFromGithub(githuburl, replaceURL) {
    var sess;
    var urlparse = services_1.parseGithubURL(githuburl);
    if (!urlparse) {
        alertError('Could not parse Github URL.');
        return;
    }
    // redirect to repo if exists
    var existing = services_1.getRepos()[urlparse.repopath];
    if (existing && !confirm("You've already imported " + urlparse.repopath + " -- do you want to replace all local files?")) {
        return;
    }
    // create new store for imported repository
    setWaitDialog(true);
    var newstore = store_1.createNewPersistentStore(urlparse.repopath);
    // import into new store
    setWaitProgress(0.25);
    return getGithubService().import(githuburl).then(function (sess1) {
        sess = sess1;
        setWaitProgress(0.75);
        return getGithubService().pull(githuburl, newstore);
    }).then(function (sess2) {
        // TODO: only first session has mainPath?
        // reload repo
        exports.qs = { repo: sess.repopath }; // file:sess.mainPath, platform:sess.platform_id};
        setWaitDialog(false);
        gaEvent('sync', 'import', githuburl);
        gotoNewLocation(replaceURL);
    }).catch(function (e) {
        setWaitDialog(false);
        console.log(e);
        alertError("<p>Could not import " + githuburl + ".</p>" + e);
    });
}
function _loginToGithub(e) {
    getGithubService().login().then(function () {
        alertInfo("You are signed in to Github.");
    }).catch(function (e) {
        alertError("<p>Could not sign in.</p>" + e);
    });
}
function _logoutOfGithub(e) {
    getGithubService().logout().then(function () {
        alertInfo("You are logged out of Github.");
    });
}
function _importProjectFromGithub(e) {
    var modal = $("#importGithubModal");
    var btn = $("#importGithubButton");
    modal.modal('show');
    btn.off('click').on('click', function () {
        var githuburl = $("#importGithubURL").val() + "";
        modal.modal('hide');
        importProjectFromGithub(githuburl, false);
    });
}
function _publishProjectToGithub(e) {
    if (exports.repo_id) {
        if (!confirm("This project (" + exports.current_project.mainPath + ") is already bound to a Github repository. Do you want to re-publish to a new repository? (You can instead choose 'Push Changes' to update files in the existing repository.)"))
            return;
    }
    var modal = $("#publishGithubModal");
    var btn = $("#publishGithubButton");
    $("#githubRepoName").val(util_1.getFilenamePrefix(util_1.getFilenameForPath(exports.current_project.mainPath)));
    modal.modal('show');
    btn.off('click').on('click', function () {
        var name = $("#githubRepoName").val() + "";
        var desc = $("#githubRepoDesc").val() + "";
        var priv = $("#githubRepoPrivate").val() == 'private';
        var license = $("#githubRepoLicense").val() + "";
        var sess;
        if (!name) {
            alertError("You did not enter a project name.");
            return;
        }
        modal.modal('hide');
        setWaitDialog(true);
        getGithubService().login().then(function () {
            setWaitProgress(0.25);
            return getGithubService().publish(name, desc, license, priv);
        }).then(function (_sess) {
            sess = _sess;
            setWaitProgress(0.5);
            exports.repo_id = exports.qs['repo'] = sess.repopath;
            return pushChangesToGithub('initial import from 8bitworkshop.com');
        }).then(function () {
            gaEvent('sync', 'publish', priv ? "" : name);
            importProjectFromGithub(sess.url, false);
        }).catch(function (e) {
            setWaitDialog(false);
            console.log(e);
            alertError("Could not publish GitHub repository: " + e);
        });
    });
}
function _pushProjectToGithub(e) {
    var ghurl = getBoundGithubURL();
    if (!ghurl)
        return;
    var modal = $("#pushGithubModal");
    var btn = $("#pushGithubButton");
    modal.modal('show');
    btn.off('click').on('click', function () {
        var commitMsg = $("#githubCommitMsg").val() + "";
        modal.modal('hide');
        pushChangesToGithub(commitMsg);
    });
}
function _pullProjectFromGithub(e) {
    var ghurl = getBoundGithubURL();
    if (!ghurl)
        return;
    bootbox.confirm("Pull from repository and replace all local files? Any changes you've made will be overwritten.", function (ok) {
        if (ok) {
            setWaitDialog(true);
            getGithubService().pull(ghurl).then(function (sess) {
                setWaitDialog(false);
                exports.projectWindows.updateAllOpenWindows(store);
            });
        }
    });
}
function confirmCommit(sess) {
    return new Promise(function (resolve, reject) {
        var files = sess.commit.files;
        console.log(files);
        // anything changed?
        if (files.length == 0) {
            setWaitDialog(false);
            bootbox.alert("No files changed.");
            return;
        }
        // build commit confirm message
        var msg = "";
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var f = files_1[_i];
            msg += f.filename + ": " + f.status;
            if (f.additions || f.deletions || f.changes) {
                msg += " (" + f.additions + " additions, " + f.deletions + " deletions, " + f.changes + " changes)";
            }
            ;
            msg += "<br/>";
        }
        // show dialog, continue when yes
        bootbox.confirm(msg, function (ok) {
            if (ok) {
                resolve(sess);
            }
            else {
                setWaitDialog(false);
            }
        });
    });
}
function pushChangesToGithub(message) {
    var ghurl = getBoundGithubURL();
    if (!ghurl)
        return;
    // build file list for push
    var files = [];
    for (var path in exports.current_project.filedata) {
        var newpath = exports.current_project.stripLocalPath(path);
        var data = exports.current_project.filedata[path];
        if (newpath && data) {
            files.push({ path: newpath, data: data });
        }
    }
    // include built ROM file in bin/[mainfile].rom
    if (current_output instanceof Uint8Array) {
        var binpath = "bin/" + getCurrentMainFilename() + ".rom";
        files.push({ path: binpath, data: current_output });
    }
    // push files
    setWaitDialog(true);
    return getGithubService().login().then(function () {
        setWaitProgress(0.5);
        return getGithubService().commit(ghurl, message, files);
    }).then(function (sess) {
        return confirmCommit(sess);
    }).then(function (sess) {
        return getGithubService().push(sess);
    }).then(function (sess) {
        setWaitDialog(false);
        alertInfo("Pushed files to " + ghurl);
        return sess;
    }).catch(function (e) {
        setWaitDialog(false);
        console.log(e);
        alertError("Could not push GitHub repository: " + e);
    });
}
function _deleteRepository() {
    var ghurl = getBoundGithubURL();
    if (!ghurl)
        return;
    bootbox.prompt("<p>Are you sure you want to delete this repository (" + ghurl + ") from browser storage?</p><p>All changes since last commit will be lost.</p><p>Type DELETE to proceed.<p>", function (yes) {
        if (yes.trim().toUpperCase() == "DELETE") {
            deleteRepository();
        }
    });
}
function deleteRepository() {
    var ghurl = getBoundGithubURL();
    var gh;
    setWaitDialog(true);
    // delete all keys in storage
    store.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
            return store.removeItem(key);
        }));
    }).then(function () {
        gh = getGithubService();
        return gh.getGithubSession(ghurl);
    }).then(function (sess) {
        // un-bind repo from list
        gh.bind(sess, false);
    }).then(function () {
        setWaitDialog(false);
        // leave repository
        exports.qs = { repo: '/' };
        gotoNewLocation();
    });
}
function _shareEmbedLink(e) {
    if (current_output == null) {
        alertError("Please fix errors before sharing.");
        return true;
    }
    if (!(current_output instanceof Uint8Array)) {
        alertError("Can't share a Verilog executable yet. (It's not actually a ROM...)");
        return true;
    }
    loadClipboardLibrary();
    loadScript('lib/liblzg.js').then(function () {
        // TODO: Module is bad var name (conflicts with MAME)
        var lzgrom = util_1.compressLZG(window['Module'], Array.from(current_output));
        window['Module'] = null; // so we load it again next time
        var lzgb64 = btoa(util_1.byteArrayToString(lzgrom));
        var embed = {
            p: exports.platform_id,
            //n: current_project.mainPath,
            r: lzgb64
        };
        var linkqs = $.param(embed);
        var fulllink = get8bitworkshopLink(linkqs, 'embed.html');
        var iframelink = '<iframe width=640 height=600 src="' + fulllink + '">';
        $("#embedLinkTextarea").text(fulllink);
        $("#embedIframeTextarea").text(iframelink);
        $("#embedLinkModal").modal('show');
        $("#embedAdviceWarnAll").hide();
        $("#embedAdviceWarnIE").hide();
        if (fulllink.length >= 65536)
            $("#embedAdviceWarnAll").show();
        else if (fulllink.length >= 5120)
            $("#embedAdviceWarnIE").show();
    });
    return true;
}
function loadClipboardLibrary() {
    loadScript('lib/clipboard.min.js').then(function () {
        var ClipboardJS = exports['ClipboardJS'];
        new ClipboardJS(".btn");
    });
}
function get8bitworkshopLink(linkqs, fn) {
    console.log(linkqs);
    var loc = window.location;
    var prefix = loc.pathname.replace('index.html', '');
    var protocol = (loc.host == '8bitworkshop.com') ? 'https:' : loc.protocol;
    var fulllink = protocol + '//' + loc.host + prefix + fn + '?' + linkqs;
    return fulllink;
}
function _downloadCassetteFile_apple2(e) {
    var addr = exports.compparams && exports.compparams.code_start;
    loadScript('lib/c2t.js').then(function () {
        var stdout = '';
        var print_fn = function (s) { stdout += s + "\n"; };
        var c2t = window['c2t']({
            noInitialRun: true,
            print: print_fn,
            printErr: print_fn
        });
        var FS = c2t['FS'];
        var rompath = getCurrentMainFilename() + ".bin";
        var audpath = getCurrentMainFilename() + ".wav";
        FS.writeFile(rompath, current_output, { encoding: 'binary' });
        var args = ["-2bc", rompath + ',' + addr.toString(16), audpath];
        c2t.callMain(args);
        var audout = FS.readFile(audpath, { 'encoding': 'binary' });
        if (audout) {
            var blob = new Blob([audout], { type: "audio/wav" });
            saveAs(blob, audpath);
            stdout += "Then connect your audio output to the cassette input, turn up the volume, and play the audio file.";
            alertInfo('<pre style="white-space: pre-wrap">' + stdout + '</pre>');
        }
    });
}
function _downloadCassetteFile_vcs(e) {
    loadScript('lib/makewav.js').then(function () {
        var stdout = '';
        var print_fn = function (s) { stdout += s + "\n"; };
        var prefix = util_1.getFilenamePrefix(getCurrentMainFilename());
        var rompath = prefix + ".bin";
        var audpath = prefix + ".wav";
        var _makewav = window['makewav']({
            noInitialRun: false,
            print: print_fn,
            printErr: print_fn,
            arguments: ['-ts', '-f0', '-v10', rompath],
            preRun: function (mod) {
                var FS = mod['FS'];
                FS.writeFile(rompath, current_output, { encoding: 'binary' });
            }
        });
        _makewav.ready.then(function (makewav) {
            var args = [rompath];
            makewav.run(args);
            console.log(stdout);
            var FS = makewav['FS'];
            var audout = FS.readFile(audpath, { 'encoding': 'binary' });
            if (audout) {
                var blob = new Blob([audout], { type: "audio/wav" });
                saveAs(blob, audpath);
                stdout += "\nConnect your audio output to the SuperCharger input, turn up the volume, and play the audio file.";
                alertInfo('<pre style="white-space: pre-wrap">' + stdout + '</pre>');
            }
        });
    });
}
function _downloadCassetteFile(e) {
    if (current_output == null) {
        alertError("Please fix errors before exporting.");
        return true;
    }
    var fn = window['_downloadCassetteFile_' + util_1.getBasePlatform(exports.platform_id)];
    if (fn === undefined) {
        alertError("Cassette export is not supported on this platform.");
        return true;
    }
    fn(e);
}
function _revertFile(e) {
    var wnd = exports.projectWindows.getActive();
    if (wnd && wnd.setText) {
        var fn = exports.projectWindows.getActiveID();
        $.get("presets/" + util_1.getBasePlatform(exports.platform_id) + "/" + fn, function (text) {
            bootbox.confirm("Reset '" + fn + "' to default?", function (ok) {
                if (ok) {
                    wnd.setText(text);
                }
            });
        }, 'text')
            .fail(function () {
            if (exports.repo_id)
                alertError("Can only revert built-in examples. If you want to revert all files, You can pull from the repository.");
            else
                alertError("Can only revert built-in examples.");
        });
    }
    else {
        alertError("Cannot revert the active window. Please choose a text file.");
    }
}
function _deleteFile(e) {
    var wnd = exports.projectWindows.getActive();
    if (wnd && wnd.getPath) {
        var fn = exports.projectWindows.getActiveID();
        bootbox.confirm("Delete '" + fn + "'?", function (ok) {
            if (ok) {
                store.removeItem(fn).then(function () {
                    // if we delete what is selected
                    if (exports.qs['file'] == fn) {
                        unsetLastPreset();
                        gotoNewLocation();
                    }
                    else {
                        updateSelector();
                        alertInfo("Deleted " + fn);
                    }
                });
            }
        });
    }
    else {
        alertError("Cannot delete the active window.");
    }
}
function _renameFile(e) {
    var wnd = exports.projectWindows.getActive();
    if (wnd && wnd.getPath && exports.current_project.getFile(wnd.getPath())) {
        var fn = exports.projectWindows.getActiveID();
        bootbox.prompt({
            title: "Rename '" + fn + "' to?",
            value: fn,
            callback: function (newfn) {
                var data = exports.current_project.getFile(wnd.getPath());
                if (newfn && newfn != fn && data) {
                    if (!checkEnteredFilename(newfn))
                        return;
                    store.removeItem(fn).then(function () {
                        return store.setItem(newfn, data);
                    }).then(function () {
                        updateSelector();
                        alert("Renamed " + fn + " to " + newfn); // need alert() so it pauses
                        if (fn == exports.current_project.mainPath) {
                            reloadProject(newfn);
                        }
                    });
                }
            }
        });
    }
    else {
        alertError("Cannot rename the active window.");
    }
}
function _downloadROMImage(e) {
    if (current_output == null) {
        alertError("Please finish compiling with no errors before downloading ROM.");
        return true;
    }
    var prefix = util_1.getFilenamePrefix(getCurrentMainFilename());
    if (current_output instanceof Uint8Array) {
        var blob = new Blob([current_output], { type: "application/octet-stream" });
        var suffix = (exports.platform.getROMExtension && exports.platform.getROMExtension(current_output))
            || "-" + util_1.getBasePlatform(exports.platform_id) + ".bin";
        saveAs(blob, prefix + suffix);
    }
    else if (current_output.code != null) {
        var blob = new Blob([current_output.code], { type: "text/plain" });
        saveAs(blob, prefix + ".js");
    }
    else {
        alertError("The \"" + exports.platform_id + "\" platform doesn't have downloadable ROMs.");
    }
}
function _downloadSourceFile(e) {
    var text = exports.projectWindows.getCurrentText();
    if (!text)
        return false;
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, getCurrentEditorFilename(), { autoBom: false });
}
function _downloadProjectZipFile(e) {
    loadScript('lib/jszip.min.js').then(function () {
        var zip = new JSZip();
        exports.current_project.iterateFiles(function (id, data) {
            if (data) {
                zip.file(util_1.getFilenameForPath(id), data);
            }
        });
        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, getCurrentMainFilename() + "-" + util_1.getBasePlatform(exports.platform_id) + ".zip");
        });
    });
}
function _downloadAllFilesZipFile(e) {
    loadScript('lib/jszip.min.js').then(function () {
        var zip = new JSZip();
        store.keys(function (err, keys) {
            return Promise.all(keys.map(function (path) {
                return store.getItem(path).then(function (text) {
                    if (text) {
                        zip.file(path, text);
                    }
                });
            })).then(function () {
                return zip.generateAsync({ type: "blob" });
            }).then(function (content) {
                return saveAs(content, util_1.getBasePlatform(exports.platform_id) + "-all.zip");
            });
        });
    });
}
function populateExamples(sel) {
    var files = {};
    sel.append($("<option />").text("--------- Examples ---------").attr('disabled', 'true'));
    for (var i = 0; i < PRESETS.length; i++) {
        var preset = PRESETS[i];
        var name = preset.chapter ? (preset.chapter + ". " + preset.name) : preset.name;
        var isCurrentPreset = preset.id == exports.current_project.mainPath;
        sel.append($("<option />").val(preset.id).text(name).attr('selected', isCurrentPreset ? 'selected' : null));
        if (isCurrentPreset)
            current_preset = preset;
        files[preset.id] = name;
    }
    return files;
}
function populateRepos(sel) {
    if (hasLocalStorage && !isElectron) {
        var n = 0;
        var repos = services_1.getRepos();
        if (repos) {
            for (var repopath in repos) {
                var repo = repos[repopath];
                if (repo.platform_id && util_1.getBasePlatform(repo.platform_id) == util_1.getBasePlatform(exports.platform_id)) {
                    if (n++ == 0)
                        sel.append($("<option />").text("------ Repositories ------").attr('disabled', 'true'));
                    sel.append($("<option />").val(repo.url).text(repo.url.substring(repo.url.indexOf('/'))));
                }
            }
        }
    }
}
function populateFiles(sel, category, prefix, foundFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var keys, numFound, i, key, name;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, store.keys()];
                case 1:
                    keys = _a.sent();
                    numFound = 0;
                    if (!keys)
                        keys = [];
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        if (key.startsWith(prefix) && !foundFiles[key]) {
                            if (numFound++ == 0)
                                sel.append($("<option />").text("------- " + category + " -------").attr('disabled', 'true'));
                            name = key.substring(prefix.length);
                            sel.append($("<option />").val(key).text(name).attr('selected', (key == exports.current_project.mainPath) ? 'selected' : null));
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function finishSelector(sel) {
    sel.css('visibility', 'visible');
    // create option if not selected
    var main = exports.current_project.mainPath;
    if (sel.val() != main) {
        sel.append($("<option />").val(main).text(main).attr('selected', 'selected'));
    }
}
function updateSelector() {
    return __awaiter(this, void 0, void 0, function () {
        var sel, foundFiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sel = $("#preset_select").empty();
                    if (!!exports.repo_id) return [3 /*break*/, 2];
                    // normal: populate repos, examples, and local files
                    populateRepos(sel);
                    foundFiles = populateExamples(sel);
                    return [4 /*yield*/, populateFiles(sel, "Local Files", "", foundFiles)];
                case 1:
                    _a.sent();
                    finishSelector(sel);
                    return [3 /*break*/, 4];
                case 2:
                    if (!isElectronWorkspace) {
                        sel.append($("<option />").val('/').text('Leave Repository'));
                    }
                    $("#repo_name").text(util_1.getFilenameForPath(exports.repo_id) + '/').show();
                    // repo: populate all files
                    return [4 /*yield*/, populateFiles(sel, exports.repo_id, "", {})];
                case 3:
                    // repo: populate all files
                    _a.sent();
                    finishSelector(sel);
                    _a.label = 4;
                case 4:
                    // set click handlers
                    sel.off('change').change(function (e) {
                        reloadProject($(this).val().toString());
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function getErrorElement(err) {
    var span = $('<p/>');
    if (err.path != null) {
        var s = err.line ? err.label ? "(" + err.path + " @ " + err.label + ")" : "(" + err.path + ":" + err.line + ")" : "(" + err.path + ")";
        var link = $('<a/>').text(s);
        var path = err.path;
        // TODO: hack because examples/foo.a only gets listed as foo.a
        if (path == getCurrentMainFilename())
            path = exports.current_project.mainPath;
        // click link to open file, if it's available...
        if (exports.projectWindows.isWindow(path)) {
            link.click(function (ev) {
                var wnd = exports.projectWindows.createOrShow(path);
                if (wnd instanceof Views.SourceEditor) {
                    wnd.setCurrentLine(err, true);
                }
            });
        }
        span.append(link);
        span.append('&nbsp;');
    }
    span.append($('<span/>').text(err.msg));
    return span;
}
function hideErrorAlerts() {
    $("#error_alert").hide();
}
function showErrorAlert(errors) {
    var div = $("#error_alert_msg").empty();
    for (var _i = 0, _a = errors.slice(0, 10); _i < _a.length; _i++) {
        var err = _a[_i];
        div.append(getErrorElement(err));
    }
    $("#error_alert").show();
}
function showExceptionAsError(err, msg) {
    var werr = { msg: msg, line: 0 };
    if (err instanceof emu_1.EmuHalt && err.$loc) {
        werr = Object.create(err.$loc);
        werr.msg = msg;
        console.log(werr);
        exports.projectWindows.refresh(false);
    }
    showErrorAlert([werr]);
}
var measureTimeStart = new Date();
var measureTimeLoad;
function measureBuildTime() {
    if (window['ga'] && measureTimeLoad) {
        var measureTimeBuild = new Date();
        ga('send', 'timing', 'load', exports.platform_id, (measureTimeLoad.getTime() - measureTimeStart.getTime()));
        ga('send', 'timing', 'build', exports.platform_id, (measureTimeBuild.getTime() - measureTimeLoad.getTime()));
        measureTimeLoad = null; // only measure once
    }
    //gaEvent('build', platform_id);
}
function setCompileOutput(data) {
    // errors? mark them in editor
    if (data && data.errors && data.errors.length > 0) {
        toolbar.addClass("has-errors");
        exports.projectWindows.setErrors(data.errors);
        showErrorAlert(data.errors);
    }
    else {
        toolbar.removeClass("has-errors"); // may be added in next callback
        exports.projectWindows.setErrors(null);
        hideErrorAlerts();
        // exit if compile output unchanged
        if (data == null || data.unchanged)
            return;
        // process symbol map
        exports.platform.debugSymbols = new baseplatform_1.DebugSymbols(data.symbolmap, data.debuginfo);
        exports.compparams = data.params;
        // load ROM
        var rom = data.output;
        if (rom) {
            try {
                clearBreakpoint(); // so we can replace memory (TODO: change toolbar btn)
                _resetRecording();
                exports.platform.loadROM(getCurrentPresetTitle(), rom);
                current_output = rom;
                if (!userPaused)
                    _resume();
                measureBuildTime();
                writeOutputROMFile();
            }
            catch (e) {
                console.log(e);
                toolbar.addClass("has-errors");
                showExceptionAsError(e, e + "");
                current_output = null;
                return;
            }
        }
        // update all windows (listings)
        refreshWindowList();
        exports.projectWindows.refresh(false);
    }
}
function loadBIOSFromProject() {
    return __awaiter(this, void 0, void 0, function () {
        var biospath, biosdata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!exports.platform.loadBIOS) return [3 /*break*/, 2];
                    biospath = exports.platform_id + '.rom';
                    return [4 /*yield*/, store.getItem(biospath)];
                case 1:
                    biosdata = _a.sent();
                    if (biosdata instanceof Uint8Array) {
                        console.log('loading BIOS', biospath, biosdata.length + " bytes");
                        exports.platform.loadBIOS(biospath, biosdata);
                    }
                    else {
                        console.log('BIOS file must be binary');
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function showDebugInfo(state) {
    if (!baseplatform_1.isDebuggable(exports.platform))
        return;
    var meminfo = $("#mem_info");
    var allcats = exports.platform.getDebugCategories();
    if (allcats && !debugCategory)
        debugCategory = allcats[0];
    var s = state && exports.platform.getDebugInfo(debugCategory, state);
    if (s) {
        var hs = lastDebugInfo ? util_1.highlightDifferences(lastDebugInfo, s) : s;
        meminfo.show().html(hs);
        var catspan = $('<div class="mem_info_links">');
        var addCategoryLink = function (cat) {
            var catlink = $('<a>' + cat + '</a>');
            if (cat == debugCategory)
                catlink.addClass('selected');
            catlink.click(function (e) {
                debugCategory = cat;
                lastDebugInfo = null;
                showDebugInfo(exports.lastDebugState);
            });
            catspan.append(catlink);
            catspan.append('<span> </span>');
        };
        for (var _i = 0, allcats_1 = allcats; _i < allcats_1.length; _i++) {
            var cat = allcats_1[_i];
            addCategoryLink(cat);
        }
        meminfo.append('<br>');
        meminfo.append(catspan);
        lastDebugInfo = s;
    }
    else {
        meminfo.hide();
        lastDebugInfo = null;
    }
}
function setDebugButtonState(btnid, btnstate) {
    $("#debug_bar, #run_bar").find("button").removeClass("btn_active").removeClass("btn_stopped");
    $("#dbg_" + btnid).addClass("btn_" + btnstate);
}
function checkRunReady() {
    if (current_output == null) {
        alertError("Can't do this until build successfully completes.");
        return false;
    }
    else
        return true;
}
function openRelevantListing(state) {
    // if we clicked on another window, retain it
    if (lastViewClicked != null)
        return;
    // has to support disassembly, at least
    if (!exports.platform.disassemble)
        return;
    // search through listings
    var listings = exports.current_project.getListings();
    var bestid = "#disasm";
    var bestscore = 32;
    if (listings) {
        var pc = state.c ? (state.c.EPC || state.c.PC) : 0;
        for (var lstfn in listings) {
            var lst = listings[lstfn];
            var file = lst.assemblyfile || lst.sourcefile;
            // pick either listing or source file
            var wndid = exports.current_project.filename2path[lstfn] || lstfn;
            if (file == lst.sourcefile)
                wndid = exports.projectWindows.findWindowWithFilePrefix(lstfn);
            // does this window exist?
            if (exports.projectWindows.isWindow(wndid)) {
                var res = file && file.findLineForOffset(pc, 32); // TODO: const
                if (res && pc - res.offset < bestscore) {
                    bestid = wndid;
                    bestscore = pc - res.offset;
                }
                //console.log(hex(pc,4), wndid, lstfn, bestid, bestscore);
            }
        }
    }
    // if no appropriate listing found, use disassembly view
    exports.projectWindows.createOrShow(bestid, true);
}
function uiDebugCallback(state) {
    exports.lastDebugState = state;
    showDebugInfo(state);
    openRelevantListing(state);
    exports.projectWindows.refresh(true); // move cursor
    debugTickPaused = true;
}
function setupDebugCallback(btnid) {
    if (exports.platform.setupDebug)
        exports.platform.setupDebug(function (state, msg) {
            uiDebugCallback(state);
            setDebugButtonState(btnid || "pause", "stopped");
            msg && showErrorAlert([{ msg: "STOPPED: " + msg, line: 0 }]);
        });
}
function setupBreakpoint(btnid) {
    if (!checkRunReady())
        return;
    _disableRecording();
    setupDebugCallback(btnid);
    if (btnid)
        setDebugButtonState(btnid, "active");
}
function _pause() {
    if (exports.platform && exports.platform.isRunning()) {
        exports.platform.pause();
        console.log("Paused");
    }
    setDebugButtonState("pause", "stopped");
}
function pause() {
    clearBreakpoint();
    _pause();
    userPaused = true;
}
function _resume() {
    if (!checkRunReady())
        return;
    if (!exports.platform.isRunning()) {
        exports.platform.resume();
        console.log("Resumed");
    }
    setDebugButtonState("go", "active");
    // TODO: hide alerts, but only if exception generated them
}
function resume() {
    clearBreakpoint();
    if (!exports.platform.isRunning()) {
        exports.projectWindows.refresh(false);
    }
    _resume();
    userPaused = false;
    lastViewClicked = null;
}
function togglePause() {
    if (exports.platform.isRunning())
        pause();
    else
        resume();
}
function singleStep() {
    if (!checkRunReady())
        return;
    setupBreakpoint("step");
    exports.platform.step();
}
function stepOver() {
    if (!checkRunReady())
        return;
    setupBreakpoint("stepover");
    exports.platform.stepOver();
}
function singleFrameStep() {
    if (!checkRunReady())
        return;
    setupBreakpoint("tovsync");
    exports.platform.runToVsync();
}
function getEditorPC() {
    var wnd = exports.projectWindows.getActive();
    return wnd && wnd.getCursorPC && wnd.getCursorPC();
}
function runToPC(pc) {
    if (!checkRunReady() || !(pc >= 0))
        return;
    setupBreakpoint("toline");
    console.log("Run to", pc.toString(16));
    if (exports.platform.runToPC) {
        exports.platform.runToPC(pc);
    }
    else {
        exports.platform.runEval(function (c) {
            return c.PC == pc;
        });
    }
}
exports.runToPC = runToPC;
function restartAtCursor() {
    if (exports.platform.restartAtPC(getEditorPC())) {
        resume();
    }
    else
        alertError("Could not restart program at selected line.");
}
function runToCursor() {
    runToPC(getEditorPC());
}
function runUntilReturn() {
    if (!checkRunReady())
        return;
    setupBreakpoint("stepout");
    exports.platform.runUntilReturn();
}
function runStepBackwards() {
    if (!checkRunReady())
        return;
    setupBreakpoint("stepback");
    exports.platform.stepBack();
}
function clearBreakpoint() {
    exports.lastDebugState = null;
    if (exports.platform.clearDebug)
        exports.platform.clearDebug();
    setupDebugCallback(); // in case of BRK/trap
    showDebugInfo();
}
function resetPlatform() {
    exports.platform.reset();
}
function resetAndRun() {
    if (!checkRunReady())
        return;
    clearBreakpoint();
    resetPlatform();
    _resume();
}
function resetAndDebug() {
    if (!checkRunReady())
        return;
    var wasRecording = recorderActive;
    _disableRecording();
    if (exports.platform.setupDebug && exports.platform.runEval) { // TODO??
        clearBreakpoint();
        _resume();
        resetPlatform();
        setupBreakpoint("restart");
        exports.platform.runEval(function (c) { return true; }); // break immediately
    }
    else {
        resetPlatform();
        _resume();
    }
    if (wasRecording)
        _enableRecording();
}
function _breakExpression() {
    var modal = $("#debugExprModal");
    var btn = $("#debugExprSubmit");
    $("#debugExprInput").val(lastBreakExpr);
    $("#debugExprExamples").text(getDebugExprExamples());
    modal.modal('show');
    btn.off('click').on('click', function () {
        var exprs = $("#debugExprInput").val() + "";
        modal.modal('hide');
        breakExpression(exprs);
    });
}
function getDebugExprExamples() {
    var state = exports.platform.saveState && exports.platform.saveState();
    var cpu = state.c;
    console.log(cpu, state);
    var s = '';
    if (cpu.PC)
        s += "c.PC == 0x" + util_1.hex(cpu.PC) + "\n";
    if (cpu.SP)
        s += "c.SP < 0x" + util_1.hex(cpu.SP) + "\n";
    if (cpu['HL'])
        s += "c.HL == 0x4000\n";
    if (exports.platform.readAddress)
        s += "this.readAddress(0x1234) == 0x0\n";
    if (exports.platform.readVRAMAddress)
        s += "this.readVRAMAddress(0x1234) != 0x80\n";
    if (exports.platform['getRasterScanline'])
        s += "this.getRasterScanline() > 222\n";
    return s;
}
function breakExpression(exprs) {
    var fn = new Function('c', 'return (' + exprs + ');').bind(exports.platform);
    setupBreakpoint();
    exports.platform.runEval(fn);
    lastBreakExpr = exprs;
}
function updateDebugWindows() {
    if (exports.platform.isRunning()) {
        exports.projectWindows.tick();
        debugTickPaused = false;
    }
    else if (!debugTickPaused) { // final tick after pausing
        exports.projectWindows.tick();
        debugTickPaused = true;
    }
    setTimeout(updateDebugWindows, 100);
}
function setWaitDialog(b) {
    if (b) {
        setWaitProgress(0);
        $("#pleaseWaitModal").modal('show');
    }
    else {
        setWaitProgress(1);
        $("#pleaseWaitModal").modal('hide');
    }
}
function setWaitProgress(prog) {
    $("#pleaseWaitProgressBar").css('width', (prog * 100) + '%').show();
}
var recordingVideo = false;
function _recordVideo() {
    if (recordingVideo)
        return;
    loadScript("lib/gif.js").then(function () {
        var canvas = $("#emulator").find("canvas")[0];
        if (!canvas) {
            alertError("Could not find canvas element to record video!");
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
            workerScript: 'lib/gif.worker.js',
            workers: 4,
            quality: 10,
            rotate: rotate
        });
        var img = $('#videoPreviewImage');
        gif.on('progress', function (prog) {
            setWaitProgress(prog);
        });
        gif.on('finished', function (blob) {
            img.attr('src', URL.createObjectURL(blob));
            setWaitDialog(false);
            _resume();
            $("#videoPreviewModal").modal('show');
        });
        var intervalMsec = 33;
        var maxFrames = 200;
        var nframes = 0;
        console.log("Recording video", canvas);
        $("#emulator").css('backgroundColor', '#cc3333');
        var f = function () {
            if (nframes++ > maxFrames) {
                console.log("Rendering video");
                $("#emulator").css('backgroundColor', 'inherit');
                setWaitDialog(true);
                _pause();
                gif.render();
                recordingVideo = false;
            }
            else {
                gif.addFrame(canvas, { delay: intervalMsec, copy: true });
                setTimeout(f, intervalMsec);
                recordingVideo = true;
            }
        };
        f();
    });
}
function setFrameRateUI(fps) {
    exports.platform.setFrameRate(fps);
    if (fps > 0.01)
        $("#fps_label").text(fps.toFixed(2));
    else
        $("#fps_label").text("1/" + Math.round(1 / fps));
}
exports.setFrameRateUI = setFrameRateUI;
function _slowerFrameRate() {
    var fps = exports.platform.getFrameRate();
    fps = fps / 2;
    if (fps > 0.00001)
        setFrameRateUI(fps);
}
function _fasterFrameRate() {
    var fps = exports.platform.getFrameRate();
    fps = Math.min(60, fps * 2);
    setFrameRateUI(fps);
}
function _slowestFrameRate() {
    setFrameRateUI(60 / 65536);
}
function _fastestFrameRate() {
    _resume();
    setFrameRateUI(60);
}
function traceTiming() {
    exports.projectWindows.refresh(false);
    var wnd = exports.projectWindows.getActive();
    if (wnd.getSourceFile && wnd.setTimingResult) { // is editor active?
        var analyzer = exports.platform.newCodeAnalyzer();
        analyzer.showLoopTimingForPC(0);
        wnd.setTimingResult(analyzer);
    }
}
function _disableRecording() {
    if (recorderActive) {
        exports.platform.setRecorder(null);
        $("#dbg_record").removeClass("btn_recording");
        $("#replaydiv").hide();
        recorderActive = false;
    }
}
function _resetRecording() {
    if (recorderActive) {
        stateRecorder.reset();
    }
}
function _enableRecording() {
    stateRecorder.reset();
    exports.platform.setRecorder(stateRecorder);
    $("#dbg_record").addClass("btn_recording");
    $("#replaydiv").show();
    recorderActive = true;
}
function _toggleRecording() {
    if (recorderActive) {
        _disableRecording();
    }
    else {
        _enableRecording();
    }
}
function _lookupHelp() {
    if (exports.platform.showHelp) {
        var tool = exports.platform.getToolForFilename(exports.current_project.mainPath);
        exports.platform.showHelp(tool); // TODO: tool, identifier
    }
}
function addFileToProject(type, ext, linefn) {
    var wnd = exports.projectWindows.getActive();
    if (wnd && wnd.insertText) {
        bootbox.prompt({
            title: "Add " + type + " File to Project",
            value: "filename" + ext,
            callback: function (filename) {
                if (filename && filename.trim().length > 0) {
                    if (!checkEnteredFilename(filename))
                        return;
                    var path = filename;
                    var newline = "\n" + linefn(filename) + "\n";
                    exports.current_project.loadFiles([path]).then(function (result) {
                        if (result && result.length) {
                            alertError(filename + " already exists; including anyway");
                        }
                        else {
                            exports.current_project.updateFile(path, "\n");
                        }
                        wnd.insertText(newline);
                        refreshWindowList();
                    });
                }
            }
        });
    }
    else {
        alertError("Can't insert text in this window -- switch back to main file");
    }
}
// TODO: lwtools and smaller c
function _addIncludeFile() {
    var fn = getCurrentMainFilename();
    var tool = exports.platform.getToolForFilename(fn);
    if (fn.endsWith(".c") || tool == 'sdcc' || tool == 'cc65' || tool == 'cmoc' || tool == 'smlrc')
        addFileToProject("Header", ".h", function (s) { return '#include "' + s + '"'; });
    else if (tool == 'dasm' || tool == 'zmac')
        addFileToProject("Include File", ".inc", function (s) { return '\tinclude "' + s + '"'; });
    else if (tool == 'ca65' || tool == 'sdasz80')
        addFileToProject("Include File", ".inc", function (s) { return '\t.include "' + s + '"'; });
    else if (tool == 'verilator')
        addFileToProject("Verilog File", ".v", function (s) { return '`include "' + s + '"'; });
    else
        alertError("Can't add include file to this project type (" + tool + ")");
}
function _addLinkFile() {
    var fn = getCurrentMainFilename();
    var tool = exports.platform.getToolForFilename(fn);
    if (fn.endsWith(".c") || tool == 'sdcc' || tool == 'cc65' || tool == 'cmoc' || tool == 'smlrc')
        addFileToProject("Linked C (or .s)", ".c", function (s) { return '//#link "' + s + '"'; });
    else if (fn.endsWith("asm") || fn.endsWith(".s") || tool == 'ca65' || tool == 'lwasm')
        addFileToProject("Linked ASM", ".inc", function (s) { return ';#link "' + s + '"'; });
    else
        alertError("Can't add linked file to this project type (" + tool + ")");
}
function setupDebugControls() {
    // create toolbar buttons
    uitoolbar = new emu_1.Toolbar($("#toolbar")[0], null);
    uitoolbar.grp.prop('id', 'run_bar');
    uitoolbar.add('ctrl+alt+r', 'Reset', 'glyphicon-refresh', resetAndRun).prop('id', 'dbg_reset');
    uitoolbar.add('ctrl+alt+,', 'Pause', 'glyphicon-pause', pause).prop('id', 'dbg_pause');
    uitoolbar.add('ctrl+alt+.', 'Resume', 'glyphicon-play', resume).prop('id', 'dbg_go');
    if (exports.platform.restartAtPC) {
        uitoolbar.add('ctrl+alt+/', 'Restart at Cursor', 'glyphicon-play-circle', restartAtCursor).prop('id', 'dbg_restartatline');
    }
    uitoolbar.newGroup();
    uitoolbar.grp.prop('id', 'debug_bar');
    if (exports.platform.runEval) {
        uitoolbar.add('ctrl+alt+e', 'Reset and Debug', 'glyphicon-fast-backward', resetAndDebug).prop('id', 'dbg_restart');
    }
    if (exports.platform.stepBack) {
        uitoolbar.add('ctrl+alt+b', 'Step Backwards', 'glyphicon-step-backward', runStepBackwards).prop('id', 'dbg_stepback');
    }
    if (exports.platform.step) {
        uitoolbar.add('ctrl+alt+s', 'Single Step', 'glyphicon-step-forward', singleStep).prop('id', 'dbg_step');
    }
    if (exports.platform.stepOver) {
        uitoolbar.add('ctrl+alt+t', 'Step Over', 'glyphicon-hand-right', stepOver).prop('id', 'dbg_stepover');
    }
    if (exports.platform.runUntilReturn) {
        uitoolbar.add('ctrl+alt+o', 'Step Out of Subroutine', 'glyphicon-hand-up', runUntilReturn).prop('id', 'dbg_stepout');
    }
    if (exports.platform.runToVsync) {
        uitoolbar.add('ctrl+alt+n', 'Next Frame/Interrupt', 'glyphicon-forward', singleFrameStep).prop('id', 'dbg_tovsync');
    }
    if ((exports.platform.runEval || exports.platform.runToPC) && !exports.platform_id.startsWith('verilog')) {
        uitoolbar.add('ctrl+alt+l', 'Run To Line', 'glyphicon-save', runToCursor).prop('id', 'dbg_toline');
    }
    uitoolbar.newGroup();
    uitoolbar.grp.prop('id', 'xtra_bar');
    // add menu clicks
    $(".dropdown-menu").collapse({ toggle: false });
    $("#item_new_file").click(_createNewFile);
    $("#item_upload_file").click(_uploadNewFile);
    $("#item_github_login").click(_loginToGithub);
    $("#item_github_logout").click(_logoutOfGithub);
    $("#item_github_import").click(_importProjectFromGithub);
    $("#item_github_publish").click(_publishProjectToGithub);
    $("#item_github_push").click(_pushProjectToGithub);
    $("#item_github_pull").click(_pullProjectFromGithub);
    $("#item_repo_delete").click(_deleteRepository);
    $("#item_share_file").click(_shareEmbedLink);
    $("#item_reset_file").click(_revertFile);
    $("#item_rename_file").click(_renameFile);
    $("#item_delete_file").click(_deleteFile);
    if (exports.platform.runEval)
        $("#item_debug_expr").click(_breakExpression).show();
    else
        $("#item_debug_expr").hide();
    $("#item_download_rom").click(_downloadROMImage);
    $("#item_download_file").click(_downloadSourceFile);
    $("#item_download_zip").click(_downloadProjectZipFile);
    $("#item_download_allzip").click(_downloadAllFilesZipFile);
    $("#item_record_video").click(_recordVideo);
    if (exports.platform_id.startsWith('apple2') || exports.platform_id.startsWith('vcs')) // TODO: look for function
        $("#item_export_cassette").click(_downloadCassetteFile);
    else
        $("#item_export_cassette").hide();
    if (exports.platform.setFrameRate && exports.platform.getFrameRate) {
        $("#dbg_slower").click(_slowerFrameRate);
        $("#dbg_faster").click(_fasterFrameRate);
        $("#dbg_slowest").click(_slowestFrameRate);
        $("#dbg_fastest").click(_fastestFrameRate);
    }
    $("#item_addfile_include").click(_addIncludeFile);
    $("#item_addfile_link").click(_addLinkFile);
    $("#item_request_persist").click(function () { return requestPersistPermission(true, false); });
    updateDebugWindows();
    // show help button?
    if (exports.platform.showHelp) {
        uitoolbar.add('ctrl+alt+?', 'Show Help', 'glyphicon-question-sign', _lookupHelp);
    }
    if (exports.platform.newCodeAnalyzer) {
        uitoolbar.add(null, 'Analyze CPU Timing', 'glyphicon-time', traceTiming);
    }
    // setup replay slider
    if (exports.platform.setRecorder && exports.platform.advance) {
        setupReplaySlider();
    }
}
function setupReplaySlider() {
    var replayslider = $("#replayslider");
    var clockslider = $("#clockslider");
    var replayframeno = $("#replay_frame");
    var clockno = $("#replay_clock");
    if (!exports.platform.advanceFrameClock)
        $("#clockdiv").hide(); // TODO: put this test in recorder?
    var updateFrameNo = function () {
        replayframeno.text(stateRecorder.lastSeekFrame + "");
        clockno.text(stateRecorder.lastSeekStep + "");
    };
    var sliderChanged = function (e) {
        _pause();
        var frame = parseInt(replayslider.val().toString());
        var step = parseInt(clockslider.val().toString());
        if (stateRecorder.loadFrame(frame, step) >= 0) {
            clockslider.attr('min', 0);
            clockslider.attr('max', stateRecorder.lastStepCount);
            updateFrameNo();
            uiDebugCallback(exports.platform.saveState());
        }
    };
    var setFrameTo = function (frame) {
        _pause();
        if (stateRecorder.loadFrame(frame) >= 0) {
            replayslider.val(frame);
            updateFrameNo();
            uiDebugCallback(exports.platform.saveState());
        }
    };
    var setClockTo = function (clock) {
        _pause();
        var frame = parseInt(replayslider.val().toString());
        if (stateRecorder.loadFrame(frame, clock) >= 0) {
            clockslider.val(clock);
            updateFrameNo();
            uiDebugCallback(exports.platform.saveState());
        }
    };
    stateRecorder.callbackStateChanged = function () {
        replayslider.attr('min', 0);
        replayslider.attr('max', stateRecorder.numFrames());
        replayslider.val(stateRecorder.currentFrame());
        clockslider.val(stateRecorder.currentStep());
        updateFrameNo();
        showDebugInfo(exports.platform.saveState());
    };
    replayslider.on('input', sliderChanged);
    clockslider.on('input', sliderChanged);
    //replayslider.on('change', sliderChanged);
    $("#replay_min").click(function () { setFrameTo(1); });
    $("#replay_max").click(function () { setFrameTo(stateRecorder.numFrames()); });
    $("#replay_back").click(function () { setFrameTo(parseInt(replayslider.val().toString()) - 1); });
    $("#replay_fwd").click(function () { setFrameTo(parseInt(replayslider.val().toString()) + 1); });
    $("#clock_back").click(function () { setClockTo(parseInt(clockslider.val().toString()) - 1); });
    $("#clock_fwd").click(function () { setClockTo(parseInt(clockslider.val().toString()) + 1); });
    $("#replay_bar").show();
    uitoolbar.add('ctrl+alt+0', 'Start/Stop Replay Recording', 'glyphicon-record', _toggleRecording).prop('id', 'dbg_record');
}
function isLandscape() {
    try {
        var object = window.screen['orientation'] || window.screen['msOrientation'] || window.screen['mozOrientation'] || null;
        if (object) {
            if (object.type.indexOf('landscape') !== -1) {
                return true;
            }
            if (object.type.indexOf('portrait') !== -1) {
                return false;
            }
        }
        if ('orientation' in window) {
            var value = window.orientation;
            if (value === 0 || value === 180) {
                return false;
            }
            else if (value === 90 || value === 270) {
                return true;
            }
        }
    }
    catch (e) { }
    // fallback to comparing width to height
    return window.innerWidth > window.innerHeight;
}
function showWelcomeMessage() {
    if (hasLocalStorage && !localStorage.getItem("8bitworkshop.hello")) {
        // Instance the tour
        var is_vcs = exports.platform_id.startsWith('vcs');
        var steps = [
            {
                element: "#platformsMenuButton",
                placement: 'right',
                title: "Platform Selector",
                content: "You're currently on the \"<b>" + exports.platform_id + "</b>\" platform. You can choose a different one from the menu."
            },
            {
                element: "#preset_select",
                title: "Project Selector",
                content: "You can choose different code examples, create your own files, or import projects from GitHub."
            },
            {
                element: "#workspace",
                title: "Code Editor",
                content: is_vcs ? "Type your 6502 assembly code into the editor, and it'll be assembled in real-time."
                    : "Type your source code into the editor, and it'll be compiled in real-time."
            },
            {
                element: "#emulator",
                placement: 'left',
                title: "Emulator",
                content: "We'll load your compiled code into the emulator whenever you make changes."
            },
            {
                element: "#debug_bar",
                placement: 'bottom',
                title: "Debug Tools",
                content: "Use these buttons to set breakpoints, single step through code, pause/resume, and use debugging tools."
            },
            {
                element: "#dropdownMenuButton",
                title: "Main Menu",
                content: "Click the menu to create new files, download your code, or share your work with others."
            },
            {
                element: "#sidebar",
                title: "Sidebar",
                content: "Pull right to expose the sidebar. It lets you switch between source files, view assembly listings, and use other tools like Disassembler, Memory Browser, and Asset Editor."
            }
        ];
        if (!isLandscape()) {
            steps.unshift({
                element: "#controls_top",
                placement: 'bottom',
                title: "Portrait mode detected",
                content: "This site works best on desktop browsers. For best results, rotate your device to landscape orientation."
            });
        }
        if (window.location.host.endsWith('8bitworkshop.com')) {
            steps.unshift({
                element: "#dropdownMenuButton",
                placement: 'right',
                title: "Cookie Consent",
                content: 'Before we start, we should tell you that this website stores cookies and other data in your browser. You can review our <a href="/privacy.html" target="_new">privacy policy</a>.'
            });
            steps.push({
                element: "#booksMenuButton",
                placement: 'left',
                title: "Books",
                content: "Get some books that explain how to program all of this stuff, and write some games!"
            });
        }
        var tour = new Tour({
            autoscroll: false,
            //storage:false,
            steps: steps,
            onEnd: function () {
                //requestPersistPermission(false, true);
            }
        });
        setTimeout(function () { tour.start(); }, 2000);
    }
}
///////////////////////////////////////////////////
exports.qs = (function (a) {
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
var isElectronWorkspace = exports.qs['electron_ws'];
var isElectron = exports.qs['electron'] || isElectronWorkspace;
function globalErrorHandler(msgevent) {
    var msg = (msgevent.message || msgevent.error || msgevent) + "";
    // storage quota full? (Chrome) try to expand it
    if (msg.indexOf("QuotaExceededError") >= 0) {
        requestPersistPermission(false, false);
    }
    else {
        var err = msgevent.error || msgevent.reason;
        if (err != null && err instanceof emu_1.EmuHalt) {
            haltEmulation(err);
        }
    }
}
function haltEmulation(err) {
    console.log("haltEmulation");
    _pause();
    emulationHalted(err);
    // TODO: reset platform?
}
exports.haltEmulation = haltEmulation;
// catch errors
function installErrorHandler() {
    window.addEventListener('error', globalErrorHandler);
    window.addEventListener('unhandledrejection', globalErrorHandler);
}
function uninstallErrorHandler() {
    window.removeEventListener('error', globalErrorHandler);
    window.removeEventListener('unhandledrejection', globalErrorHandler);
}
function gotoNewLocation(replaceHistory) {
    uninstallErrorHandler();
    if (replaceHistory)
        window.location.replace("?" + $.param(exports.qs));
    else
        window.location.href = "?" + $.param(exports.qs);
}
function replaceURLState() {
    if (exports.platform_id)
        exports.qs['platform'] = exports.platform_id;
    delete exports.qs['']; // remove null parameter
    history.replaceState({}, "", "?" + $.param(exports.qs));
}
function addPageFocusHandlers() {
    var hidden = false;
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState == 'hidden' && exports.platform && exports.platform.isRunning()) {
            _pause();
            hidden = true;
        }
        else if (document.visibilityState == 'visible' && hidden) {
            _resume();
            hidden = false;
        }
    });
    $(window).on("focus", function () {
        if (hidden) {
            _resume();
            hidden = false;
        }
    });
    $(window).on("blur", function () {
        if (exports.platform && exports.platform.isRunning()) {
            _pause();
            hidden = true;
        }
    });
    $(window).on("orientationchange", function () {
        if (exports.platform && exports.platform.resize)
            setTimeout(exports.platform.resize.bind(exports.platform), 200);
    });
}
// TODO: merge w/ embed.html somehow?
function showInstructions() {
    var div = $(document).find(".emucontrols-" + util_1.getRootBasePlatform(exports.platform_id));
    if (exports.platform_id.endsWith(".mame"))
        div.show(); // TODO: MAME seems to eat the focus() event
    var vcanvas = $("#emulator").find("canvas");
    if (vcanvas) {
        vcanvas.on('focus', function () {
            if (exports.platform.isRunning()) {
                div.fadeIn(200);
                // toggle sound for browser autoplay
                exports.platform.resume();
            }
        });
        vcanvas.on('blur', function () {
            div.fadeOut(200);
        });
    }
}
function installGAHooks() {
    if (window['ga']) {
        $(".dropdown-item").click(function (e) {
            if (e.target && e.target.id) {
                gaEvent('menu', e.target.id);
            }
        });
        ga('send', 'pageview', location.pathname + '?platform=' + exports.platform_id + (exports.repo_id ? ('&repo=' + exports.repo_id) : ('&file=' + exports.qs['file'])));
    }
}
function startPlatform() {
    return __awaiter(this, void 0, void 0, function () {
        var lastid, defaultfile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!emu_1.PLATFORMS[exports.platform_id])
                        throw Error("Invalid platform '" + exports.platform_id + "'.");
                    exports.platform = new emu_1.PLATFORMS[exports.platform_id]($("#emuscreen")[0]);
                    setPlatformUI();
                    stateRecorder = new recorder_1.StateRecorderImpl(exports.platform);
                    PRESETS = exports.platform.getPresets();
                    if (!exports.qs['file']) {
                        if (hasLocalStorage) {
                            lastid = localStorage.getItem("__lastid_" + exports.store_id);
                        }
                        defaultfile = lastid || (exports.repo_id ? null : PRESETS[0].id);
                        exports.qs['file'] = defaultfile || 'DEFAULT';
                        if (!defaultfile) {
                            alertError("There is no default main file for this project. Try selecting one from the pulldown.");
                        }
                    }
                    // legacy vcs stuff
                    if (exports.platform_id == 'vcs' && exports.qs['file'].startsWith('examples/') && !exports.qs['file'].endsWith('.a')) {
                        exports.qs['file'] += '.a';
                    }
                    // start platform and load file
                    replaceURLState();
                    installErrorHandler();
                    installGAHooks();
                    return [4 /*yield*/, exports.platform.start()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadBIOSFromProject()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, initProject()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, loadProject(exports.qs['file'])];
                case 4:
                    _a.sent();
                    setupDebugControls();
                    addPageFocusHandlers();
                    showInstructions();
                    if (exports.qs['embed']) {
                        hideControlsForEmbed();
                    }
                    else {
                        updateSelector();
                        updateBooksMenu();
                        showWelcomeMessage();
                    }
                    revealTopBar();
                    return [2 /*return*/];
            }
        });
    });
}
function hideControlsForEmbed() {
    $('#dropdownMenuButton').hide();
    $('#platformsMenuButton').hide();
    $('#booksMenuButton').hide();
}
function updateBooksMenu() {
    if (util_1.getRootBasePlatform(exports.platform_id) == 'nes')
        $(".book-nes").addClass("book-active");
    else if (util_1.getRootBasePlatform(exports.platform_id) == 'vcs')
        $(".book-vcs").addClass("book-active");
    else if (util_1.getRootBasePlatform(exports.platform_id) == 'verilog')
        $(".book-verilog").addClass("book-active");
    else if (exports.platform.getToolForFilename(getCurrentMainFilename()) == 'sdcc')
        $(".book-arcade").addClass("book-active");
}
function revealTopBar() {
    setTimeout(function () { $("#controls_dynamic").css('visibility', 'inherit'); }, 250);
}
function setupSplits() {
    var splitName = 'workspace-split3-' + exports.platform_id;
    var sizes;
    if (exports.platform_id.startsWith('vcs'))
        sizes = [0, 50, 50];
    else if (exports.qs['embed'] || Views.isMobileDevice)
        sizes = [0, 60, 40];
    else
        sizes = [12, 44, 44];
    var sizesStr = hasLocalStorage && localStorage.getItem(splitName);
    if (sizesStr) {
        try {
            sizes = JSON.parse(sizesStr);
        }
        catch (e) {
            console.log(e);
        }
    }
    var split = Split(['#sidebar', '#workspace', '#emulator'], {
        sizes: sizes,
        minSize: [0, 250, 250],
        onDrag: function () {
            if (exports.platform && exports.platform.resize)
                exports.platform.resize();
        },
        onDragEnd: function () {
            if (hasLocalStorage)
                localStorage.setItem(splitName, JSON.stringify(split.getSizes()));
            if (exports.projectWindows)
                exports.projectWindows.resize();
        },
    });
}
exports.setupSplits = setupSplits;
function loadImportedURL(url) {
    // TODO: zip file?
    setWaitDialog(true);
    util_1.getWithBinary(url, function (data) {
        if (data) {
            var path = 'shared/' + util_1.getFilenameForPath(url);
            console.log("Importing " + data.length + " bytes as " + path);
            store.getItem(path, function (err, olddata) {
                setWaitDialog(false);
                if (!olddata || confirm("Replace existing file '" + path + "'?")) {
                    store.setItem(path, data, function (err, result) {
                        if (err)
                            alert(err + ""); // need to wait
                        if (result != null) {
                            delete exports.qs['importURL'];
                            exports.qs['file'] = path;
                            replaceURLState();
                            loadAndStartPlatform();
                        }
                    });
                }
            });
        }
        else {
            alertError("Could not load source code from URL: " + url);
            setWaitDialog(false);
        }
    }, 'text');
}
function loadFormDataUpload() {
    return __awaiter(this, void 0, void 0, function () {
        var ignore, force, i, path, dataenc, olddata, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ignore = !!exports.qs['ignore'];
                    force = !!exports.qs['force'];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 20)) return [3 /*break*/, 6];
                    path = exports.qs['file' + i + '_name'];
                    dataenc = exports.qs['file' + i + '_data'];
                    if (path == null || dataenc == null)
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, store.getItem(path)];
                case 2:
                    olddata = _a.sent();
                    if (!!(ignore && olddata)) return [3 /*break*/, 4];
                    value = dataenc;
                    if (exports.qs['file' + i + '_type'] == 'binary') {
                        value = util_1.stringToByteArray(atob(value));
                    }
                    if (!(!olddata || force || confirm("Replace existing file '" + path + "'?"))) return [3 /*break*/, 4];
                    return [4 /*yield*/, store.setItem(path, value)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (i == 0) {
                        exports.qs['file'] = path;
                    } // set main filename
                    delete exports.qs['file' + i + '_name'];
                    delete exports.qs['file' + i + '_data'];
                    delete exports.qs['file' + i + '_type'];
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    delete exports.qs['ignore'];
                    delete exports.qs['force'];
                    replaceURLState();
                    return [2 /*return*/];
            }
        });
    });
}
function setPlatformUI() {
    var name = exports.platform.getPlatformName && exports.platform.getPlatformName();
    var menuitem = $('a[href="?platform=' + exports.platform_id + '"]');
    if (menuitem.length) {
        menuitem.addClass("dropdown-item-checked");
        name = name || menuitem.text() || name;
    }
    $(".platform_name").text(name || exports.platform_id);
}
// start
function startUI() {
    return __awaiter(this, void 0, void 0, function () {
        var repo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // import from github?
                    if (exports.qs['githubURL']) {
                        importProjectFromGithub(exports.qs['githubURL'], true);
                        return [2 /*return*/];
                    }
                    // add default platform?
                    exports.platform_id = exports.qs['platform'] || (hasLocalStorage && localStorage.getItem("__lastplatform"));
                    if (!exports.platform_id) {
                        exports.platform_id = exports.qs['platform'] = "vcs";
                    }
                    // lookup repository for this platform
                    exports.repo_id = exports.qs['repo'] || (hasLocalStorage && localStorage.getItem("__lastrepo_" + exports.platform_id));
                    if (hasLocalStorage && exports.repo_id && exports.repo_id !== '/') {
                        repo = services_1.getRepos()[exports.repo_id];
                        if (repo) {
                            exports.qs['repo'] = exports.repo_id;
                            if (repo.platform_id)
                                exports.qs['platform'] = exports.platform_id = repo.platform_id;
                            if (!exports.qs['file'])
                                exports.qs['file'] = repo.mainPath;
                            requestPersistPermission(true, true);
                        }
                    }
                    else {
                        exports.repo_id = '';
                        delete exports.qs['repo'];
                    }
                    setupSplits();
                    // create store
                    exports.store_id = exports.repo_id || util_1.getBasePlatform(exports.platform_id);
                    store = store_1.createNewPersistentStore(exports.store_id);
                    // is this an importURL?
                    if (exports.qs['importURL']) {
                        loadImportedURL(exports.qs['importURL']);
                        return [2 /*return*/]; // TODO: make async
                    }
                    if (!exports.qs['file0_name']) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadFormDataUpload()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    // load and start platform object
                    loadAndStartPlatform();
                    return [2 /*return*/];
            }
        });
    });
}
exports.startUI = startUI;
function loadAndStartPlatform() {
    return __awaiter(this, void 0, void 0, function () {
        var platformfn, machinefn, e_2, e_3, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    e_2 = _a.sent();
                    console.log(e_2);
                    alertError('Platform "' + exports.platform_id + '" not supported.');
                    return [2 /*return*/];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, loadScript(machinefn)];
                case 5:
                    _a.sent(); // load machine file
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _a.sent();
                    console.log('skipped', machinefn); // optional file skipped
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 12, , 13]);
                    console.log("starting platform", exports.platform_id); // loaded required <platform_id>.js file
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, , 10, 11]);
                    return [4 /*yield*/, startPlatform()];
                case 9:
                    _a.sent();
                    document.title = document.title + " [" + exports.platform_id + "] - " + (exports.repo_id ? ('[' + exports.repo_id + '] - ') : '') + exports.current_project.mainPath;
                    return [3 /*break*/, 11];
                case 10:
                    revealTopBar();
                    return [7 /*endfinally*/];
                case 11: return [3 /*break*/, 13];
                case 12:
                    e_4 = _a.sent();
                    console.log(e_4);
                    alertError('Platform "' + exports.platform_id + '" failed to load.');
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// HTTPS REDIRECT
var useHTTPSCookieName = "__use_https";
function setHTTPSCookie(val) {
    document.cookie = useHTTPSCookieName + "=" + val + ";domain=8bitworkshop.com;path=/;max-age=315360000";
}
function shouldRedirectHTTPS() {
    // cookie set? either true or false
    var shouldRedir = getCookie(useHTTPSCookieName);
    if (typeof shouldRedir === 'string') {
        return !!shouldRedir; // convert to bool
    }
    // set a 10yr cookie, value depends on if it's our first time here
    var val = hasLocalStorage && !localStorage.getItem("__lastplatform") ? 1 : 0;
    setHTTPSCookie(val);
    return !!val;
}
function _switchToHTTPS() {
    bootbox.confirm('<p>Do you want to force the browser to use HTTPS from now on?</p>' +
        '<p>WARNING: This will make all of your local files unavailable, so you should "Download All Changes" first for each platform where you have done work.</p>' +
        '<p>You can go back to HTTP by setting the "' + useHTTPSCookieName + '" cookie to 0.</p>', function (ok) {
        if (ok) {
            setHTTPSCookie(1);
            redirectToHTTPS();
        }
    });
}
function redirectToHTTPS() {
    if (window.location.protocol == 'http:' && window.location.host == '8bitworkshop.com') {
        if (shouldRedirectHTTPS()) {
            uninstallErrorHandler();
            window.location.replace(window.location.href.replace(/^http:/, 'https:'));
        }
        else {
            $("#item_switch_https").click(_switchToHTTPS).show();
        }
    }
}
// redirect to HTTPS after script loads?
redirectToHTTPS();
//// ELECTRON STUFF
function setTestInput(path, data) {
    exports.platform.writeFile(path, data);
}
exports.setTestInput = setTestInput;
function getTestOutput(path) {
    return exports.platform.readFile(path);
}
exports.getTestOutput = getTestOutput;
function getSaveState() {
    return exports.platform.saveState();
}
exports.getSaveState = getSaveState;
function emulationHalted(err) {
    var msg = (err && err.message) || msg;
    showExceptionAsError(err, msg);
}
exports.emulationHalted = emulationHalted;
function getElectronFile(url, success, datatype) {
    // TODO: we have to split() to strip off presets/platform, yukky
    var contents = getWorkspaceFile(url.split('/', 3)[2], datatype);
    if (contents != null) {
        success(contents); // return result
    }
    else {
        util_1.getWithBinary(url, success, datatype); // try to load from presets/platform via GET
    }
}
exports.getElectronFile = getElectronFile;
function reloadWorkspaceFile(path) {
    var oldval = exports.current_project.filedata[path];
    if (oldval != null) {
        var datatype = typeof oldval == 'string' ? 'text' : 'arraybuffer';
        exports.projectWindows.updateFile(path, getWorkspaceFile(path, datatype));
    }
}
exports.reloadWorkspaceFile = reloadWorkspaceFile;
function writeOutputROMFile() {
    if (isElectronWorkspace && current_output instanceof Uint8Array) {
        var prefix = util_1.getFilenamePrefix(getCurrentMainFilename());
        var suffix = (exports.platform.getROMExtension && exports.platform.getROMExtension(current_output))
            || "-" + util_1.getBasePlatform(exports.platform_id) + ".bin";
        putWorkspaceFile("bin/" + prefix + suffix, current_output);
    }
}
function highlightSearch(query) {
    var wnd = exports.projectWindows.getActive();
    if (wnd instanceof Views.SourceEditor) {
        var sc = wnd.editor.getSearchCursor(query);
        if (sc.findNext()) {
            wnd.editor.setSelection(sc.pos.to, sc.pos.from);
        }
    }
}
exports.highlightSearch = highlightSearch;
//# sourceMappingURL=ui.js.map