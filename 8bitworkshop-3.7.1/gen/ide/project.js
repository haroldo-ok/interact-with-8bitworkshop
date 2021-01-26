"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeProject = void 0;
var workertypes_1 = require("../common/workertypes");
var util_1 = require("../common/util");
function isEmptyString(text) {
    return typeof text == 'string' && text.trim && text.trim().length == 0;
}
var CodeProject = /** @class */ (function () {
    function CodeProject(worker, platform_id, platform, store) {
        var _this = this;
        this.filedata = {};
        this.pendingWorkerMessages = 0;
        this.tools_preloaded = {};
        this.isCompiling = false;
        this.filename2path = {}; // map stripped paths to full paths
        this.persistent = true; // set to true and won't modify store
        this.worker = worker;
        this.platform_id = platform_id;
        this.platform = platform;
        this.store = store;
        worker.onmessage = function (e) {
            _this.receiveWorkerMessage(e.data);
        };
    }
    CodeProject.prototype.receiveWorkerMessage = function (data) {
        var notfinal = this.pendingWorkerMessages > 1;
        if (notfinal) {
            this.sendBuild();
            this.pendingWorkerMessages = 1;
        }
        else {
            if (this.callbackBuildStatus)
                this.callbackBuildStatus(false);
            if (!this.isCompiling) {
                console.log(this.pendingWorkerMessages);
                console.trace();
            } // debug compile problems
            this.isCompiling = false;
            this.pendingWorkerMessages = 0;
        }
        if (data && !data.unchanged) {
            this.processBuildResult(data);
        }
        this.callbackBuildResult(data);
    };
    CodeProject.prototype.preloadWorker = function (path) {
        var tool = this.platform.getToolForFilename(path);
        if (tool && !this.tools_preloaded[tool]) {
            this.worker.postMessage({ preload: tool, platform: this.platform_id });
            this.tools_preloaded[tool] = true;
        }
    };
    CodeProject.prototype.pushAllFiles = function (files, fn) {
        // look for local and preset files
        files.push(fn);
        // look for files in current (main file) folder
        var dir = util_1.getFolderForPath(this.mainPath);
        if (dir.length > 0 && dir != 'local') // TODO
            files.push(dir + '/' + fn);
    };
    CodeProject.prototype.parseIncludeDependencies = function (text) {
        var files = [];
        var m;
        if (this.platform_id.startsWith('verilog')) {
            // include verilog includes
            var re1 = /^\s*(`include|[.]include)\s+"(.+?)"/gmi;
            while (m = re1.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
            // for Silice
            var re1a = /^\s*\$(include|\$dofile|\$write_image_in_table)\('(.+?)'/gmi;
            while (m = re1a.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
            // include .arch (json) statements
            var re2 = /^\s*([.]arch)\s+(\w+)/gmi;
            while (m = re2.exec(text)) {
                this.pushAllFiles(files, m[2] + ".json");
            }
            // include $readmem[bh] (TODO)
            var re3 = /\$readmem[bh]\("(.+?)"/gmi;
            while (m = re3.exec(text)) {
                this.pushAllFiles(files, m[1]);
            }
        }
        else {
            // for .asm -- [.%]include "file"
            // for .c -- #include "file"
            var re2 = /^\s*[.#%]?(include|incbin)\s+"(.+?)"/gmi;
            while (m = re2.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
            // for .c -- //#resource "file" (or ;resource or #resource)
            var re3 = /^\s*([;']|[/][/])#resource\s+"(.+?)"/gm;
            while (m = re3.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
            // for XASM only (USE include.ext)
            // for merlin32 (ASM include.ext)
            var re4 = /^\s+(USE|ASM)\s+(\S+[.]\S+)/gm;
            while (m = re4.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
        }
        return files;
    };
    CodeProject.prototype.parseLinkDependencies = function (text) {
        var files = [];
        var m;
        if (this.platform_id.startsWith('verilog')) {
            //
        }
        else {
            // for .c -- //#link "file" (or ;link or #link)
            var re = /^\s*([;]|[/][/])#link\s+"(.+?)"/gm;
            while (m = re.exec(text)) {
                this.pushAllFiles(files, m[2]);
            }
        }
        return files;
    };
    CodeProject.prototype.loadFileDependencies = function (text) {
        var includes = this.parseIncludeDependencies(text);
        var linkfiles = this.parseLinkDependencies(text);
        var allfiles = includes.concat(linkfiles);
        return this.loadFiles(allfiles).then(function (result) {
            // set 'link' property on files that are link dependencies (must match filename)
            if (result) {
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var dep = result_1[_i];
                    dep.link = linkfiles.indexOf(dep.path) >= 0;
                }
            }
            return result;
        });
    };
    CodeProject.prototype.okToSend = function () {
        return this.pendingWorkerMessages++ == 0;
    };
    CodeProject.prototype.updateFileInStore = function (path, text) {
        // protect against accidential whole-file deletion
        if (this.persistent && !isEmptyString(text)) {
            this.store.setItem(path, text);
        }
        if (this.callbackStoreFile != null) {
            this.callbackStoreFile(path, text);
        }
    };
    // TODO: test duplicate files, local paths mixed with presets
    CodeProject.prototype.buildWorkerMessage = function (depends) {
        this.preloadWorker(this.mainPath);
        var msg = { updates: [], buildsteps: [] };
        // TODO: add preproc directive for __MAINFILE__
        var mainfilename = this.stripLocalPath(this.mainPath);
        var maintext = this.getFile(this.mainPath);
        var depfiles = [];
        msg.updates.push({ path: mainfilename, data: maintext });
        this.filename2path[mainfilename] = this.mainPath;
        for (var _i = 0, depends_1 = depends; _i < depends_1.length; _i++) {
            var dep = depends_1[_i];
            if (!dep.link) {
                msg.updates.push({ path: dep.filename, data: dep.data });
                depfiles.push(dep.filename);
            }
            this.filename2path[dep.filename] = dep.path;
        }
        msg.buildsteps.push({
            path: mainfilename,
            files: [mainfilename].concat(depfiles),
            platform: this.platform_id,
            tool: this.platform.getToolForFilename(this.mainPath),
            mainfile: true
        });
        for (var _a = 0, depends_2 = depends; _a < depends_2.length; _a++) {
            var dep = depends_2[_a];
            if (dep.data && dep.link) {
                this.preloadWorker(dep.filename);
                msg.updates.push({ path: dep.filename, data: dep.data });
                msg.buildsteps.push({
                    path: dep.filename,
                    files: [dep.filename].concat(depfiles),
                    platform: this.platform_id,
                    tool: this.platform.getToolForFilename(dep.path)
                });
            }
        }
        return msg;
    };
    // TODO: get local file as well as presets?
    CodeProject.prototype.loadFiles = function (paths) {
        var _this = this;
        return new Promise(function (yes, no) {
            var result = [];
            var addResult = function (path, data) {
                result.push({
                    path: path,
                    filename: _this.stripLocalPath(path),
                    link: true,
                    data: data
                });
            };
            var loadNext = function () {
                var path = paths.shift();
                if (!path) {
                    // finished loading all files; return result
                    yes(result);
                }
                else {
                    // look in cache
                    if (path in _this.filedata) { // found in cache?
                        var data = _this.filedata[path];
                        if (data)
                            addResult(path, data);
                        loadNext();
                    }
                    else {
                        // look in store
                        _this.store.getItem(path, function (err, value) {
                            if (err) { // err fetching from store
                                no(err);
                            }
                            else if (value) { // found in store?
                                _this.filedata[path] = value; // do not update store, just cache
                                addResult(path, value);
                                loadNext();
                            }
                            else {
                                // found on remote fetch?
                                var preset_id = _this.platform_id;
                                preset_id = util_1.getBasePlatform(preset_id); // remove .suffix from preset name
                                var webpath = "presets/" + preset_id + "/" + path;
                                // try to GET file, use file ext to determine text/binary
                                _this.callbackGetRemote(webpath, function (data) {
                                    if (data == null) {
                                        console.log("Could not load preset file", path);
                                        _this.filedata[path] = null; // mark cache entry as invalid
                                    }
                                    else {
                                        if (data instanceof ArrayBuffer)
                                            data = new Uint8Array(data); // convert to typed array
                                        console.log("read", webpath, data.length, 'bytes');
                                        _this.filedata[path] = data; // do not update store, just cache
                                        addResult(path, data);
                                    }
                                    loadNext();
                                }, util_1.isProbablyBinary(path) ? 'arraybuffer' : 'text');
                            }
                        });
                    }
                }
            };
            loadNext(); // load first file
        });
    };
    CodeProject.prototype.getFile = function (path) {
        return this.filedata[path];
    };
    // TODO: purge files not included in latest build?
    CodeProject.prototype.iterateFiles = function (callback) {
        for (var path in this.filedata) {
            callback(path, this.getFile(path));
        }
    };
    CodeProject.prototype.sendBuild = function () {
        var _this = this;
        if (!this.mainPath)
            throw Error("need to call setMainFile first");
        var maindata = this.getFile(this.mainPath);
        // if binary blob, just return it as ROM
        if (maindata instanceof Uint8Array) {
            this.isCompiling = true;
            this.receiveWorkerMessage({
                output: maindata,
                errors: [],
                listings: null,
                symbolmap: null,
                params: {}
            });
            return;
        }
        // otherwise, make it a string
        var text = typeof maindata === "string" ? maindata : '';
        // TODO: load dependencies of non-main files
        return this.loadFileDependencies(text).then(function (depends) {
            if (!depends)
                depends = [];
            var workermsg = _this.buildWorkerMessage(depends);
            _this.worker.postMessage(workermsg);
            _this.isCompiling = true;
        });
    };
    CodeProject.prototype.updateFile = function (path, text) {
        if (this.filedata[path] == text)
            return; // unchanged, don't update
        this.updateFileInStore(path, text); // TODO: isBinary
        this.filedata[path] = text;
        if (this.okToSend() && this.mainPath) {
            if (this.callbackBuildStatus)
                this.callbackBuildStatus(true);
            this.sendBuild();
        }
    };
    ;
    CodeProject.prototype.setMainFile = function (path) {
        this.mainPath = path;
        if (this.callbackBuildStatus)
            this.callbackBuildStatus(true);
        this.sendBuild();
    };
    CodeProject.prototype.processBuildResult = function (data) {
        // TODO: link listings with source files
        if (data.listings) {
            this.listings = data.listings;
            for (var lstname in this.listings) {
                var lst = this.listings[lstname];
                if (lst.lines)
                    lst.sourcefile = new workertypes_1.SourceFile(lst.lines, lst.text);
                if (lst.asmlines)
                    lst.assemblyfile = new workertypes_1.SourceFile(lst.asmlines, lst.text);
            }
        }
        // save and sort segment list
        var segs = (this.platform.getMemoryMap && this.platform.getMemoryMap()["main"]) || [];
        if (data.segments) {
            segs = segs.concat(data.segments || []);
        }
        segs.sort(function (a, b) { return a.start - b.start; });
        this.segments = segs;
    };
    CodeProject.prototype.getListings = function () {
        return this.listings;
    };
    // returns first listing in format [prefix].lst (TODO: could be better)
    CodeProject.prototype.getListingForFile = function (path) {
        // ignore include files (TODO)
        if (path.toLowerCase().endsWith('.h') || path.toLowerCase().endsWith('.inc'))
            return;
        var fnprefix = util_1.getFilenamePrefix(this.stripLocalPath(path));
        var listings = this.getListings();
        for (var lstfn in listings) {
            if (util_1.getFilenamePrefix(lstfn) == fnprefix) {
                return listings[lstfn];
            }
        }
    };
    CodeProject.prototype.stripLocalPath = function (path) {
        if (this.mainPath) {
            var folder = util_1.getFolderForPath(this.mainPath);
            if (folder != '' && path.startsWith(folder)) {
                path = path.substring(folder.length + 1);
            }
        }
        return path;
    };
    return CodeProject;
}());
exports.CodeProject = CodeProject;
//# sourceMappingURL=project.js.map