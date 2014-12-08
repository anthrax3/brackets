/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, appshell, $, window */

define(function (require, exports, module) {
    "use strict";
    
    var FileSystemError = require("filesystem/FileSystemError"),
        FileSystemStats = require("filesystem/FileSystemStats");
    
    
    function showOpenDialog(allowMultipleSelection, chooseDirectories, title, initialPath, fileTypes, callback) {
        // FIXME
        throw new Error();
    }
    
    function showSaveDialog(title, initialPath, proposedNewFilename, callback) {
        // FIXME
        throw new Error();
    }
    
    var demoContent = {
        "index.html": "<html>\n<head>\n    <title>Hello, world!</title>\n</head>\n<body>\n    Welcome to Brackets!\n</body>\n</html>",
        "main.css": ".hello {\n    content: 'world!';\n}"
    };
    
    function _stripTrailingSlash(path) {
        return path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
    }
    
    function _getDemoData(fullPath) {
        var prefix = "/Getting Started/";
        if (fullPath.substr(0, prefix.length) !== prefix) {
            return null;
        }
        var suffix = _stripTrailingSlash(fullPath.substr(prefix.length));
        if (!suffix) {
            return demoContent;
        }
        
        var segments = suffix.split("/");
        var dir = demoContent;
        var i;
        for (i = 0; i < segments.length; i++) {
            if (!dir) { return null; }
            dir = dir[segments[i]];
        }
        return dir;
    }
    
    function _makeStat(demoData) {
        var options = {
            isFile: typeof demoData === "string",
            mtime: new Date(0),
            hash: 0
        };
        if (options.isFile) {
            options.size = demoData.length;
        }
        return new FileSystemStats(options);
    }
    function _nameFromPath(path) {
        var segments = _stripTrailingSlash(path).split("/");
        return segments[segments.length - 1];
    }
    
    
    function stat(path, callback) {
        var result = _getDemoData(path);
        if (result || result === "") {
            callback(null, _makeStat(result));
        } else {
            callback(FileSystemError.NOT_FOUND);
        }
    }
    
    function exists(path, callback) {
        stat(path, function (err) {
            if (err) {
                callback(null, false);
            } else {
                callback(null, true);
            }
        });
    }
    
    function readdir(path, callback) {
        var storeData = _getDemoData(path);
        if (!storeData) {
            callback(FileSystemError.NOT_FOUND);
        } else if (typeof storeData === "string") {
            callback(FileSystemError.INVALID_PARAMS);
        } else {
            var names = Object.keys(storeData);
            var stats = [];
            names.forEach(function (name) {
                stats.push(_makeStat(storeData[name]));
            });
            callback(null, names, stats);
        }
    }
    
    function mkdir(path, mode, callback) {
        callback("Cannot modify folders on HTTP demo server");
    }
    
    function rename(oldPath, newPath, callback) {
        callback("Cannot modify files on HTTP demo server");
    }
    
    function readFile(path, options, callback) {
        console.log("Reading 'file': " + path);
        
        if (typeof options === "function") {
            callback = options;
        }
        
        var storeData = _getDemoData(path);
        if (!storeData && storeData !== "") {
            callback(FileSystemError.NOT_FOUND);
        } else if (typeof storeData !== "string") {
            callback(FileSystemError.INVALID_PARAMS);
        } else {
            var name = _nameFromPath(path);
            callback(null, storeData, _makeStat(storeData[name]));
        }
    }
    
    function writeFile(path, data, options, callback) {
        callback("Cannot save to HTTP demo server");
    }
    
    function unlink(path, callback) {
        callback("Cannot modify files on HTTP demo server");
    }
    
    function moveToTrash(path, callback) {
        callback("Cannot delete files on HTTP demo server");
    }
    
    function initWatchers(changeCallback, offlineCallback) {
        // Ignore - since this FS is immutable, we're never going to call these
    }
    
    function watchPath(path, callback) {
        console.warn("File watching is not supported on immutable HTTP demo server");
        callback();
    }
    
    function unwatchPath(path, callback) {
        callback();
    }
    
    function unwatchAll(callback) {
        callback();
    }
    
    // Export public API
    exports.showOpenDialog  = showOpenDialog;
    exports.showSaveDialog  = showSaveDialog;
    exports.exists          = exists;
    exports.readdir         = readdir;
    exports.mkdir           = mkdir;
    exports.rename          = rename;
    exports.stat            = stat;
    exports.readFile        = readFile;
    exports.writeFile       = writeFile;
    exports.unlink          = unlink;
    exports.moveToTrash     = moveToTrash;
    exports.initWatchers    = initWatchers;
    exports.watchPath       = watchPath;
    exports.unwatchPath     = unwatchPath;
    exports.unwatchAll      = unwatchAll;
    
    exports.recursiveWatch    = true;
    exports.normalizeUNCPaths = false;
});