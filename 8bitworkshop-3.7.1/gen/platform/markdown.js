"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var emu_1 = require("../common/emu");
var MarkdownPlatform = /** @class */ (function () {
    function MarkdownPlatform(mainElement) {
        this.mainElement = mainElement;
        this.iframe = $('<iframe sandbox="allow-same-origin" width="100%" height="100%"/>').appendTo(mainElement)[0];
        this.iframe.style.backgroundColor = 'white';
        mainElement.classList.add("vertical-scroll"); //100% height
        mainElement.style.overflowY = 'auto';
    }
    MarkdownPlatform.prototype.start = function () {
    };
    MarkdownPlatform.prototype.reset = function () {
    };
    MarkdownPlatform.prototype.pause = function () {
    };
    MarkdownPlatform.prototype.resume = function () {
    };
    MarkdownPlatform.prototype.loadROM = function (title, data) {
        $(this.iframe).contents().find('body').html(data);
    };
    MarkdownPlatform.prototype.isRunning = function () {
        return false;
    };
    MarkdownPlatform.prototype.isDebugging = function () {
        return false;
    };
    MarkdownPlatform.prototype.getToolForFilename = function (fn) {
        return "markdown";
    };
    MarkdownPlatform.prototype.getDefaultExtension = function () {
        return ".md";
    };
    MarkdownPlatform.prototype.getPresets = function () {
        return [
            { id: 'hello.md', name: 'Hello' },
        ];
    };
    MarkdownPlatform.prototype.showHelp = function () {
        window.open("https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax", "_help");
    };
    return MarkdownPlatform;
}());
emu_1.PLATFORMS['markdown'] = MarkdownPlatform;
//# sourceMappingURL=markdown.js.map