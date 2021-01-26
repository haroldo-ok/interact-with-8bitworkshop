"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectWindows = void 0;
var $ = require("jquery");
var util_1 = require("../common/util");
var ProjectWindows = /** @class */ (function () {
    function ProjectWindows(containerdiv, project) {
        this.id2window = {};
        this.id2createfn = {};
        this.id2showfn = {};
        this.id2div = {};
        this.containerdiv = containerdiv;
        this.project = project;
        this.undofiles = [];
    }
    // TODO: delete windows ever?
    ProjectWindows.prototype.isWindow = function (id) {
        return this.id2createfn[id] != null;
    };
    ProjectWindows.prototype.setCreateFunc = function (id, createfn) {
        this.id2createfn[id] = createfn;
    };
    ProjectWindows.prototype.setShowFunc = function (id, showfn) {
        this.id2showfn[id] = showfn;
    };
    ProjectWindows.prototype.create = function (id) {
        var wnd = this.id2window[id];
        if (!wnd) {
            console.log("creating window", id);
            wnd = this.id2window[id] = this.id2createfn[id](id);
        }
        var div = this.id2div[id];
        if (!div) {
            div = this.id2div[id] = wnd.createDiv(this.containerdiv);
            $(div).hide();
        }
        return wnd;
    };
    ProjectWindows.prototype.createOrShow = function (id, moveCursor) {
        var wnd = this.create(id);
        var div = this.id2div[id];
        if (this.activewnd != wnd) {
            this.activediv && $(this.activediv).hide();
            this.activewnd && this.activewnd.setVisible && this.activewnd.setVisible(false);
            this.activediv = div;
            this.activewnd = wnd;
            $(div).show();
            this.refresh(true); // needed to tell asset editor 1st time running, but that's bad
            this.refreshErrors();
            wnd.setVisible && wnd.setVisible(true);
            this.id2showfn[id] && this.id2showfn[id](id, wnd);
        }
        else {
            this.refresh(moveCursor);
        }
        this.activeid = id;
        return wnd;
    };
    ProjectWindows.prototype.put = function (id, window) {
        this.id2window[id] = window;
    };
    ProjectWindows.prototype.refresh = function (moveCursor) {
        // refresh current window
        if (this.activewnd && this.activewnd.refresh)
            this.activewnd.refresh(moveCursor);
    };
    ProjectWindows.prototype.tick = function () {
        if (this.activewnd && this.activewnd.tick)
            this.activewnd.tick();
    };
    ProjectWindows.prototype.setErrors = function (errors) {
        this.lasterrors = errors;
        this.refreshErrors();
    };
    ProjectWindows.prototype.refreshErrors = function () {
        if (this.activewnd && this.activewnd.markErrors) {
            if (this.lasterrors && this.lasterrors.length)
                this.activewnd.markErrors(this.lasterrors);
            else
                this.activewnd.clearErrors();
        }
    };
    ProjectWindows.prototype.getActive = function () { return this.activewnd; };
    ProjectWindows.prototype.getActiveID = function () { return this.activeid; };
    ProjectWindows.prototype.getCurrentText = function () {
        if (this.activewnd && this.activewnd.getValue)
            return this.activewnd.getValue();
        else
            bootbox.alert("Please switch to an editor window.");
    };
    ProjectWindows.prototype.resize = function () {
        if (this.activeid && this.activewnd && this.activewnd.recreateOnResize) {
            this.activewnd = null;
            this.id2window[this.activeid] = null;
            this.id2div[this.activeid] = null;
            this.createOrShow(this.activeid);
        }
    };
    ProjectWindows.prototype.updateFile = function (fileid, data) {
        // is there an editor? if so, use it
        var wnd = this.id2window[fileid];
        if (wnd && wnd.setText && typeof data === 'string') {
            wnd.setText(data);
            this.undofiles.push(fileid);
        }
        else {
            this.project.updateFile(fileid, data);
        }
    };
    ProjectWindows.prototype.undoStep = function () {
        var fileid = this.undofiles.pop();
        var wnd = this.id2window[fileid];
        if (wnd && wnd.undoStep) {
            wnd.undoStep();
        }
        else {
            bootbox.alert("No more steps to undo.");
        }
    };
    ProjectWindows.prototype.updateAllOpenWindows = function (store) {
        var _this = this;
        for (var fileid in this.id2window) {
            var wnd = this.id2window[fileid];
            if (wnd && wnd.setText) {
                store.getItem(fileid).then(function (data) {
                    _this.updateFile(fileid, data);
                });
            }
        }
    };
    ProjectWindows.prototype.findWindowWithFilePrefix = function (filename) {
        filename = util_1.getFilenameForPath(util_1.getFilenamePrefix(filename));
        for (var fileid in this.id2createfn) {
            // ignore include files (TODO)
            if (fileid.toLowerCase().endsWith('.h') || fileid.toLowerCase().endsWith('.inc') || fileid.toLowerCase().endsWith('.bas'))
                continue;
            if (util_1.getFilenameForPath(util_1.getFilenamePrefix(fileid)) == filename)
                return fileid;
        }
        return null;
    };
    return ProjectWindows;
}());
exports.ProjectWindows = ProjectWindows;
;
//# sourceMappingURL=windows.js.map