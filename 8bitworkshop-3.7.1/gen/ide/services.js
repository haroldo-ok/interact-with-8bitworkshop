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
exports.GithubService = exports.parseGithubURL = exports.getRepos = void 0;
var util_1 = require("../common/util");
var README_md_template = "$NAME\n=====\n\n[Open this project in 8bitworkshop](http://8bitworkshop.com/redir.html?platform=$PLATFORM&githubURL=$GITHUBURL&file=$MAINFILE).\n";
function getRepos() {
    var repos = {};
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('__repo__')) {
            var repodata = JSON.parse(localStorage.getItem(key));
            var path = key.substring('__repo__'.length);
            repos[path] = repodata;
        }
    }
    return repos;
}
exports.getRepos = getRepos;
function parseGithubURL(ghurl) {
    var toks = ghurl.split('/', 8);
    if (toks.length < 5)
        return null;
    if (toks[0] != 'https:')
        return null;
    if (toks[2] != 'github.com')
        return null;
    if (toks[5] && toks[5] != 'tree')
        return null;
    return { user: toks[3], repo: toks[4], repopath: toks[3] + '/' + toks[4], branch: toks[6], subtreepath: toks[7] };
}
exports.parseGithubURL = parseGithubURL;
var GithubService = /** @class */ (function () {
    function GithubService(githubCons, githubToken, store, project) {
        this.githubCons = githubCons;
        this.githubToken = githubToken;
        this.store = store;
        this.project = project;
        this.recreateGithub();
    }
    GithubService.prototype.recreateGithub = function () {
        this.github = new this.githubCons({ token: this.githubToken });
    };
    GithubService.prototype.login = function () {
        var _this = this;
        // already logged in? return immediately
        if (this.githubToken && this.githubToken.length) {
            return new Promise(function (yes, no) {
                yes();
            });
        }
        // login via popup
        var provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('repo');
        return firebase.auth().signInWithPopup(provider).then(function (result) {
            _this.githubToken = result.credential.accessToken;
            var user = result.user;
            _this.recreateGithub();
            document.cookie = "__github_key=" + _this.githubToken + ";path=/;max-age=31536000";
            console.log("Stored GitHub OAUTH key");
        });
    };
    GithubService.prototype.logout = function () {
        var _this = this;
        // already logged out? return immediately
        if (!(this.githubToken && this.githubToken.length)) {
            return new Promise(function (yes, no) {
                yes();
            });
        }
        // logout
        return firebase.auth().signOut().then(function () {
            document.cookie = "__github_key=;path=/;max-age=0";
            _this.githubToken = null;
            _this.recreateGithub();
        });
    };
    GithubService.prototype.isFileIgnored = function (s) {
        s = s.toUpperCase();
        if (s.startsWith("LICENSE"))
            return true;
        if (s.startsWith("README"))
            return true;
        if (s.startsWith("."))
            return true;
        return false;
    };
    GithubService.prototype.getGithubSession = function (ghurl) {
        return __awaiter(this, void 0, void 0, function () {
            var urlparse, saved, branch, repo, e_1, sess;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlparse = parseGithubURL(ghurl);
                        if (!urlparse) {
                            throw new Error("Please enter a valid GitHub URL.");
                        }
                        saved = getRepos()[urlparse.repopath];
                        branch = urlparse.branch || (saved && saved.branch);
                        repo = this.github.repos(urlparse.user, urlparse.repo);
                        if (!(1 || branch == null)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, repo.fetch()];
                    case 2:
                        branch = (_a.sent()).defaultBranch || "master";
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log("could not fetch default branch: " + e_1);
                        branch = "main";
                        return [3 /*break*/, 4];
                    case 4:
                        console.log("branch =", branch);
                        _a.label = 5;
                    case 5:
                        sess = {
                            url: ghurl,
                            user: urlparse.user,
                            reponame: urlparse.repo,
                            repopath: urlparse.repopath,
                            branch: branch,
                            subtreepath: urlparse.subtreepath,
                            prefix: '',
                            repo: repo,
                            platform_id: this.project ? this.project.platform_id : (saved ? saved.platform_id : null)
                        };
                        //console.log(sess);
                        return [2 /*return*/, sess];
                }
            });
        });
    };
    GithubService.prototype.getGithubHEADTree = function (ghurl) {
        var sess;
        return this.getGithubSession(ghurl).then(function (session) {
            sess = session;
            return sess.repo.git.refs.heads(sess.branch).fetch();
        })
            .then(function (head) {
            sess.head = head;
            sess.sha = head.object.sha;
            return sess.repo.git.trees(sess.sha).fetch();
        })
            .then(function (tree) {
            if (sess.subtreepath) {
                for (var _i = 0, _a = tree.tree; _i < _a.length; _i++) {
                    var subtree = _a[_i];
                    if (subtree.type == 'tree' && subtree.path == sess.subtreepath && subtree.sha) {
                        return sess.repo.git.trees(subtree.sha).fetch();
                    }
                }
                throw Error("Cannot find subtree '" + sess.subtreepath + "' in tree " + tree.sha);
            }
            return tree;
        })
            .then(function (tree) {
            sess.tree = tree;
            return sess;
        });
    };
    GithubService.prototype.bind = function (sess, dobind) {
        var key = '__repo__' + sess.repopath;
        if (dobind) {
            var repodata = {
                url: sess.url,
                branch: sess.branch,
                platform_id: sess.platform_id,
                mainPath: sess.mainPath,
                sha: sess.sha
            };
            console.log('storing', repodata);
            localStorage.setItem(key, JSON.stringify(repodata));
        }
        else {
            localStorage.removeItem(key);
        }
    };
    GithubService.prototype.import = function (ghurl) {
        var _this = this;
        var sess;
        return this.getGithubSession(ghurl).then(function (session) {
            sess = session;
            // load README
            return sess.repo.contents('README.md').read();
        })
            .catch(function (e) {
            console.log(e);
            console.log('no README.md found');
            // make user repo exists
            return sess.repo.fetch().then(function (_repo) {
                return ''; // empty README
            });
        })
            .then(function (readme) {
            var m;
            // check README for main file
            var re8main = /8bitworkshop.com[^)]+file=([^)&]+)/;
            m = re8main.exec(readme);
            if (m && m[1]) {
                console.log("main path: '" + m[1] + "'");
                sess.mainPath = m[1];
            }
            // check README for proper platform
            // unless we use githubURL=
            var re8plat = /8bitworkshop.com[^)]+platform=([A-Za-z0-9._\-]+)/;
            m = re8plat.exec(readme);
            if (m) {
                console.log("platform id: '" + m[1] + "'");
                if (sess.platform_id && !sess.platform_id.startsWith(m[1]))
                    throw Error("Platform mismatch: Repository is " + m[1] + ", you have " + _this.project.platform_id + " selected.");
                sess.platform_id = m[1];
            }
            // bind to repository
            _this.bind(sess, true);
            // get head commit
            return sess;
        });
    };
    GithubService.prototype.pull = function (ghurl, deststore) {
        var _this = this;
        var sess;
        return this.getGithubHEADTree(ghurl).then(function (session) {
            sess = session;
            var blobreads = [];
            sess.paths = [];
            sess.tree.tree.forEach(function (item) {
                console.log(item.path, item.type, item.size);
                sess.paths.push(item.path);
                if (item.type == 'blob' && !_this.isFileIgnored(item.path)) {
                    var read = sess.repo.git.blobs(item.sha).fetch().then(function (blob) {
                        var path = sess.prefix + item.path;
                        var size = item.size;
                        var encoding = blob.encoding;
                        var data = blob.content;
                        if (blob.encoding == 'base64') {
                            var bindata = util_1.stringToByteArray(atob(data));
                            var isBinary = util_1.isProbablyBinary(item.path, bindata);
                            data = isBinary ? bindata : util_1.byteArrayToUTF8(bindata);
                        }
                        if (blob.size != data.length) {
                            data = data.slice(0, blob.size);
                        }
                        return (deststore || _this.store).setItem(path, data);
                    });
                    blobreads.push(read);
                }
                else {
                    console.log("ignoring " + item.path);
                }
            });
            return Promise.all(blobreads);
        })
            .then(function (blobs) {
            return sess;
        });
    };
    GithubService.prototype.importAndPull = function (ghurl) {
        var _this = this;
        return this.import(ghurl).then(function (sess) {
            return _this.pull(ghurl);
        });
    };
    GithubService.prototype.publish = function (reponame, desc, license, isprivate) {
        var _this = this;
        var repo;
        var platform_id = this.project.platform_id;
        var mainPath = this.project.stripLocalPath(this.project.mainPath);
        return this.github.user.repos.create({
            name: reponame,
            description: desc,
            private: isprivate,
            auto_init: false,
            license_template: license
        })
            .then(function (_repo) {
            repo = _repo;
            // create README.md
            var s = README_md_template;
            s = s.replace(/\$NAME/g, encodeURIComponent(reponame));
            s = s.replace(/\$PLATFORM/g, encodeURIComponent(platform_id));
            s = s.replace(/\$GITHUBURL/g, encodeURIComponent(repo.htmlUrl));
            s = s.replace(/\$MAINFILE/g, encodeURIComponent(mainPath));
            var config = {
                message: '8bitworkshop: updated metadata in README.md',
                content: btoa(s)
            };
            return repo.contents('README.md').add(config);
        }).then(function () {
            return _this.getGithubSession(repo.htmlUrl);
        });
    };
    GithubService.prototype.commit = function (ghurl, message, files) {
        var sess;
        if (!message) {
            message = "updated from 8bitworkshop.com";
        }
        return this.getGithubHEADTree(ghurl).then(function (session) {
            sess = session;
            if (sess.subtreepath) {
                throw Error("Sorry, right now you can only commit files to the root directory of a repository.");
            }
            return Promise.all(files.map(function (file) {
                if (typeof file.data === 'string') {
                    return sess.repo.git.blobs.create({
                        content: file.data,
                        encoding: 'utf-8'
                    });
                }
                else {
                    return sess.repo.git.blobs.create({
                        content: btoa(util_1.byteArrayToString(file.data)),
                        encoding: 'base64'
                    });
                }
            }));
        }).then(function (blobs) {
            return sess.repo.git.trees.create({
                tree: files.map(function (file, index) {
                    return {
                        path: file.path,
                        mode: '100644',
                        type: 'blob',
                        sha: blobs[index]['sha']
                    };
                }),
                base_tree: sess.tree.sha
            });
        }).then(function (newtree) {
            return sess.repo.git.commits.create({
                message: message,
                tree: newtree.sha,
                parents: [
                    sess.head.object.sha
                ]
            });
        }).then(function (commit1) {
            return sess.repo.commits(commit1.sha).fetch();
        }).then(function (commit) {
            sess.commit = commit;
            return sess;
        });
    };
    GithubService.prototype.push = function (sess) {
        return sess.head.update({
            sha: sess.commit.sha
        }).then(function (update) {
            return sess;
        });
    };
    GithubService.prototype.deleteRepository = function (ghurl) {
        return this.getGithubSession(ghurl).then(function (session) {
            return session.repo.remove();
        });
    };
    return GithubService;
}());
exports.GithubService = GithubService;
//# sourceMappingURL=services.js.map