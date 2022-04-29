var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = function(status, toThrow) {
    throw toThrow
};
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (Module["ENVIRONMENT"]) {
    throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)")
}
var scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}
var read_, readAsync, readBinary, setWindowTitle;
var nodeFS;
var nodePath;
if (ENVIRONMENT_IS_NODE) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = require("path").dirname(scriptDirectory) + "/"
    } else {
        scriptDirectory = __dirname + "/"
    }
    read_ = function shell_read(filename, binary) {
        if (!nodeFS) nodeFS = require("fs");
        if (!nodePath) nodePath = require("path");
        filename = nodePath["normalize"](filename);
        return nodeFS["readFileSync"](filename, binary ? null : "utf8")
    };
    readBinary = function readBinary(filename) {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/")
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    // process["on"]("uncaughtException", function(ex) {
    //     if (!(ex instanceof ExitStatus)) {
    //         throw ex
    //     }
    // });
    // process["on"]("unhandledRejection", abort);
    quit_ = function(status) {
        process["exit"](status)
    };
    Module["inspect"] = function() {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        read_ = function shell_read(f) {
            return read(f)
        }
    }
    readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    };
    if (typeof scriptArgs != "undefined") {
        arguments_ = scriptArgs
    } else if (typeof arguments != "undefined") {
        arguments_ = arguments
    }
    if (typeof quit === "function") {
        quit_ = function(status) {
            quit(status)
        }
    }
    if (typeof print !== "undefined") {
        if (typeof console === "undefined") console = {};
        console.log = print;
        console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (typeof document !== "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    } {
        read_ = function(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = function(url) {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            }
        }
        readAsync = function(url, onload, onerror) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    onload(xhr.response);
                    return
                }
                onerror()
            };
            xhr.onerror = onerror;
            xhr.send(null)
        }
    }
    setWindowTitle = function(title) {
        document.title = title
    }
} else {
    throw new Error("environment detection error")
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (!Object.getOwnPropertyDescriptor(Module, "arguments")) {
    Object.defineProperty(Module, "arguments", {
        configurable: true,
        get: function() {
            abort("Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
if (!Object.getOwnPropertyDescriptor(Module, "thisProgram")) {
    Object.defineProperty(Module, "thisProgram", {
        configurable: true,
        get: function() {
            abort("Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (Module["quit"]) quit_ = Module["quit"];
if (!Object.getOwnPropertyDescriptor(Module, "quit")) {
    Object.defineProperty(Module, "quit", {
        configurable: true,
        get: function() {
            abort("Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");
assert(typeof Module["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
assert(typeof Module["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
assert(typeof Module["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
assert(typeof Module["TOTAL_MEMORY"] === "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
if (!Object.getOwnPropertyDescriptor(Module, "read")) {
    Object.defineProperty(Module, "read", {
        configurable: true,
        get: function() {
            abort("Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (!Object.getOwnPropertyDescriptor(Module, "readAsync")) {
    Object.defineProperty(Module, "readAsync", {
        configurable: true,
        get: function() {
            abort("Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (!Object.getOwnPropertyDescriptor(Module, "readBinary")) {
    Object.defineProperty(Module, "readBinary", {
        configurable: true,
        get: function() {
            abort("Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (!Object.getOwnPropertyDescriptor(Module, "setWindowTitle")) {
    Object.defineProperty(Module, "setWindowTitle", {
        configurable: true,
        get: function() {
            abort("Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
var STACK_ALIGN = 16;

function alignMemory(size, factor) {
    if (!factor) factor = STACK_ALIGN;
    return Math.ceil(size / factor) * factor
}

function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}

function convertJsFunctionToWasm(func, sig) {
    if (typeof WebAssembly.Function === "function") {
        var typeNames = {
            "i": "i32",
            "j": "i64",
            "f": "f32",
            "d": "f64"
        };
        var type = {
            parameters: [],
            results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
        };
        for (var i = 1; i < sig.length; ++i) {
            type.parameters.push(typeNames[sig[i]])
        }
        return new WebAssembly.Function(type, func)
    }
    var typeSection = [1, 0, 1, 96];
    var sigRet = sig.slice(0, 1);
    var sigParam = sig.slice(1);
    var typeCodes = {
        "i": 127,
        "j": 126,
        "f": 125,
        "d": 124
    };
    typeSection.push(sigParam.length);
    for (var i = 0; i < sigParam.length; ++i) {
        typeSection.push(typeCodes[sigParam[i]])
    }
    if (sigRet == "v") {
        typeSection.push(0)
    } else {
        typeSection = typeSection.concat([1, typeCodes[sigRet]])
    }
    typeSection[1] = typeSection.length - 2;
    var bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]));
    var module = new WebAssembly.Module(bytes);
    var instance = new WebAssembly.Instance(module, {
        "e": {
            "f": func
        }
    });
    var wrappedFunc = instance.exports["f"];
    return wrappedFunc
}
var freeTableIndexes = [];
var functionsInTableMap;

function getEmptyTableSlot() {
    if (freeTableIndexes.length) {
        return freeTableIndexes.pop()
    }
    try {
        wasmTable.grow(1)
    } catch (err) {
        if (!(err instanceof RangeError)) {
            throw err
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH."
    }
    return wasmTable.length - 1
}

function addFunctionWasm(func, sig) {
    if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap;
        for (var i = 0; i < wasmTable.length; i++) {
            var item = wasmTable.get(i);
            if (item) {
                functionsInTableMap.set(item, i)
            }
        }
    }
    if (functionsInTableMap.has(func)) {
        return functionsInTableMap.get(func)
    }
    var ret = getEmptyTableSlot();
    try {
        wasmTable.set(ret, func)
    } catch (err) {
        if (!(err instanceof TypeError)) {
            throw err
        }
        assert(typeof sig !== "undefined", "Missing signature argument to addFunction: " + func);
        var wrapped = convertJsFunctionToWasm(func, sig);
        wasmTable.set(ret, wrapped)
    }
    functionsInTableMap.set(func, ret);
    return ret
}
var tempRet0 = 0;
var setTempRet0 = function(value) {
    tempRet0 = value
};
var getTempRet0 = function() {
    return tempRet0
};
var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
if (!Object.getOwnPropertyDescriptor(Module, "wasmBinary")) {
    Object.defineProperty(Module, "wasmBinary", {
        configurable: true,
        get: function() {
            abort("Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
var noExitRuntime = Module["noExitRuntime"] || true;
if (!Object.getOwnPropertyDescriptor(Module, "noExitRuntime")) {
    Object.defineProperty(Module, "noExitRuntime", {
        configurable: true,
        get: function() {
            abort("Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
if (typeof WebAssembly !== "object") {
    abort("no native wasm support detected")
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;

function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}

function getCFunc(ident) {
    var func = Module["_" + ident];
    assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
    return func
}

function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        "string": function(str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len)
            }
            return ret
        },
        "array": function(arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret
        }
    };

    function convertReturnValue(ret) {
        if (returnType === "string") return UTF8ToString(ret);
        if (returnType === "boolean") return Boolean(ret);
        return ret
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== "array", 'Return type should not be "array".');
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0) stack = stackSave();
                cArgs[i] = converter(args[i])
            } else {
                cArgs[i] = args[i]
            }
        }
    }
    var ret = func.apply(null, cArgs);
    ret = convertReturnValue(ret);
    if (stack !== 0) stackRestore(stack);
    return ret
}

function cwrap(ident, returnType, argTypes, opts) {
    return function() {
        return ccall(ident, returnType, argTypes, arguments, opts)
    }
}
var ALLOC_STACK = 1;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(heap, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr))
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = heap[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            var u1 = heap[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            var u2 = heap[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
    return str
}

function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x1FFFFF).");
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63
        }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}

function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4
    }
    return len
}
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}

function writeArrayToMemory(array, buffer) {
    assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
    HEAP8.set(array, buffer)
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0
}

function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - x % multiple
    }
    return x
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
}
var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
if (!Object.getOwnPropertyDescriptor(Module, "INITIAL_MEMORY")) {
    Object.defineProperty(Module, "INITIAL_MEMORY", {
        configurable: true,
        get: function() {
            abort("Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")
        }
    })
}
assert(INITIAL_MEMORY >= TOTAL_STACK, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
assert(!Module["wasmMemory"], "Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally");
assert(INITIAL_MEMORY == 16777216, "Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically");
var wasmTable;

function writeStackCookie() {
    var max = _emscripten_stack_get_end();
    assert((max & 3) == 0);
    HEAPU32[(max >> 2) + 1] = 34821223;
    HEAPU32[(max >> 2) + 2] = 2310721022;
    HEAP32[0] = 1668509029
}

function checkStackCookie() {
    if (ABORT) return;
    var max = _emscripten_stack_get_end();
    var cookie1 = HEAPU32[(max >> 2) + 1];
    var cookie2 = HEAPU32[(max >> 2) + 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16))
    }
    if (HEAP32[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!")
}(function() {
    var h16 = new Int16Array(1);
    var h8 = new Int8Array(h16.buffer);
    h16[0] = 25459;
    if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -s SUPPORT_BIG_ENDIAN=1 to bypass)"
})();
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}

function initRuntime() {
    checkStackCookie();
    assert(!runtimeInitialized);
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    FS.ignorePermissions = false;
    TTY.init();
    callRuntimeCallbacks(__ATINIT__)
}

function exitRuntime() {
    checkStackCookie();
    runtimeExited = true
}

function postRun() {
    checkStackCookie();
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}

function addOnInit(cb) {
    __ATINIT__.unshift(cb)
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
    var orig = id;
    while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random()
    }
}

function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
            runDependencyWatcher = setInterval(function() {
                if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                    if (!shown) {
                        shown = true;
                        err("still waiting on run dependencies:")
                    }
                    err("dependency: " + dep)
                }
                if (shown) {
                    err("(end of list)")
                }
            }, 1e4)
        }
    } else {
        err("warning: run dependency added without ID")
    }
}

function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id]
    } else {
        err("warning: run dependency removed without ID")
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};

function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    what += "";
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    var output = "abort(" + what + ") at " + stackTrace();
    what = output;
    var e = new WebAssembly.RuntimeError(what);
    throw e
}
var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
    return filename.startsWith(dataURIPrefix)
}

function isFileURI(filename) {
    return filename.startsWith("file://")
}

function createExportWrapper(name, fixedasm) {
    return function() {
        var displayName = name;
        var asm = fixedasm;
        if (!fixedasm) {
            asm = Module["asm"]
        }
        assert(runtimeInitialized, "native function `" + displayName + "` called before runtime initialization");
        assert(!runtimeExited, "native function `" + displayName + "` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
        if (!asm[name]) {
            assert(asm[name], "exported native function `" + displayName + "` not found")
        }
        return asm[name].apply(null, arguments)
    }
}
var wasmBinaryFile;
wasmBinaryFile = "pdfium.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}

function getBinary(file) {
    try {
        if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary)
        }
        if (readBinary) {
            return readBinary(file)
        } else {
            throw "both async and sync fetching of the wasm failed"
        }
    } catch (err) {
        abort(err)
    }
}

function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch === "function" && !isFileURI(wasmBinaryFile)) {
            return fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then(function(response) {
                if (!response["ok"]) {
                    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                }
                return response["arrayBuffer"]()
            }).catch(function() {
                return getBinary(wasmBinaryFile)
            })
        } else {
            if (readAsync) {
                return new Promise(function(resolve, reject) {
                    readAsync(wasmBinaryFile, function(response) {
                        resolve(new Uint8Array(response))
                    }, reject)
                })
            }
        }
    }
    return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile)
    })
}

function createWasm() {
    var info = {
        "env": asmLibraryArg,
        "wasi_snapshot_preview1": asmLibraryArg
    };

    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmMemory = Module["asm"]["memory"];
        assert(wasmMemory, "memory not found in wasm exports");
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module["asm"]["__indirect_function_table"];
        assert(wasmTable, "table not found in wasm exports");
        addOnInit(Module["asm"]["__wasm_call_ctors"]);
        removeRunDependency("wasm-instantiate")
    }
    addRunDependency("wasm-instantiate");
    var trueModule = Module;

    function receiveInstantiationResult(result) {
        assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
        trueModule = null;
        receiveInstance(result["instance"])
    }

    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function(binary) {
            var result = WebAssembly.instantiate(binary, info);
            return result
        }).then(receiver, function(reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            if (isFileURI(wasmBinaryFile)) {
                err("warning: Loading from a file URI (" + wasmBinaryFile + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing")
            }
            abort(reason)
        })
    }

    function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
            return fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then(function(response) {
                var result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiationResult, function(reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    return instantiateArrayBuffer(receiveInstantiationResult)
                })
            })
        } else {
            return instantiateArrayBuffer(receiveInstantiationResult)
        }
    }
    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false
        }
    }
    instantiateAsync();
    return {}
}
var tempDouble;
var tempI64;

function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback(Module);
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                wasmTable.get(func)()
            } else {
                wasmTable.get(func)(callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}

function demangle(func) {
    demangle.recursionGuard = (demangle.recursionGuard | 0) + 1;
    if (demangle.recursionGuard > 1) return func;
    var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
    assert(__cxa_demangle_func);
    var stackTop = stackSave();
    try {
        var s = func;
        if (s.startsWith("__Z")) s = s.substr(1);
        var len = lengthBytesUTF8(s) + 1;
        var buf = stackAlloc(len);
        stringToUTF8(s, buf, len);
        var status = stackAlloc(4);
        var ret = __cxa_demangle_func(buf, 0, 0, status);
        if (HEAP32[status >> 2] === 0 && ret) {
            return UTF8ToString(ret)
        }
    } catch (e) {} finally {
        _free(ret);
        stackRestore(stackTop);
        if (demangle.recursionGuard < 2) --demangle.recursionGuard
    }
    return func
}

function demangleAll(text) {
    var regex = /\b_Z[\w\d_]+/g;
    return text.replace(regex, function(x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]"
    })
}

function jsStackTrace() {
    var error = new Error;
    if (!error.stack) {
        try {
            throw new Error
        } catch (e) {
            error = e
        }
        if (!error.stack) {
            return "(no stack trace available)"
        }
    }
    return error.stack.toString()
}
var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
    return noExitRuntime || runtimeKeepaliveCounter > 0
}

function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}

function _atexit(func, arg) {}

function ___cxa_atexit(a0, a1) {
    return _atexit(a0, a1)
}

function _gmtime_r(time, tmPtr) {
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
    HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
    HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
    HEAP32[tmPtr + 36 >> 2] = 0;
    HEAP32[tmPtr + 32 >> 2] = 0;
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    if (!_gmtime_r.GMTString) _gmtime_r.GMTString = allocateUTF8("GMT");
    HEAP32[tmPtr + 40 >> 2] = _gmtime_r.GMTString;
    return tmPtr
}

function ___gmtime_r(a0, a1) {
    return _gmtime_r(a0, a1)
}

function _tzset() {
    if (_tzset.called) return;
    _tzset.called = true;
    var currentYear = (new Date).getFullYear();
    var winter = new Date(currentYear, 0, 1);
    var summer = new Date(currentYear, 6, 1);
    var winterOffset = winter.getTimezoneOffset();
    var summerOffset = summer.getTimezoneOffset();
    var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
    HEAP32[__get_timezone() >> 2] = stdTimezoneOffset * 60;
    HEAP32[__get_daylight() >> 2] = Number(winterOffset != summerOffset);

    function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT"
    }
    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = allocateUTF8(winterName);
    var summerNamePtr = allocateUTF8(summerName);
    if (summerOffset < winterOffset) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr
    } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr
    }
}

function _localtime_r(time, tmPtr) {
    _tzset();
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getHours();
    HEAP32[tmPtr + 12 >> 2] = date.getDate();
    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var start = new Date(date.getFullYear(), 0, 1);
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[tmPtr + 32 >> 2] = dst;
    var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
    HEAP32[tmPtr + 40 >> 2] = zonePtr;
    return tmPtr
}

function ___localtime_r(a0, a1) {
    return _localtime_r(a0, a1)
}

function setErrNo(value) {
    HEAP32[___errno_location() >> 2] = value;
    return value
}
var PATH = {
    splitPath: function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    },
    normalizeArray: function(parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    },
    normalize: function(path) {
        var isAbsolute = path.charAt(0) === "/",
            trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function(p) {
            return !!p
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    },
    dirname: function(path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    },
    basename: function(path) {
        if (path === "/") return "/";
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1)
    },
    extname: function(path) {
        return PATH.splitPath(path)[3]
    },
    join: function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    },
    join2: function(l, r) {
        return PATH.normalize(l + "/" + r)
    }
};

function getRandomDevice() {
    if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
        var randomBuffer = new Uint8Array(1);
        return function() {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0]
        }
    } else if (ENVIRONMENT_IS_NODE) {
        try {
            var crypto_module = require("crypto");
            return function() {
                return crypto_module["randomBytes"](1)[0]
            }
        } catch (e) {}
    }
    return function() {
        abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")
    }
}
var PATH_FS = {
    resolve: function() {
        var resolvedPath = "",
            resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/"
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
            return !!p
        }), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    },
    relative: function(from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);

        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") break
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") break
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1)
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
};
var TTY = {
    ttys: [],
    init: function() {},
    shutdown: function() {},
    register: function(dev, ops) {
        TTY.ttys[dev] = {
            input: [],
            output: [],
            ops: ops
        };
        FS.registerDevice(dev, TTY.stream_ops)
    },
    stream_ops: {
        open: function(stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43)
            }
            stream.tty = tty;
            stream.seekable = false
        },
        close: function(stream) {
            stream.tty.ops.flush(stream.tty)
        },
        flush: function(stream) {
            stream.tty.ops.flush(stream.tty)
        },
        read: function(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60)
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty)
                } catch (e) {
                    throw new FS.ErrnoError(29)
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6)
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now()
            }
            return bytesRead
        },
        write: function(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60)
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                }
            } catch (e) {
                throw new FS.ErrnoError(29)
            }
            if (length) {
                stream.node.timestamp = Date.now()
            }
            return i
        }
    },
    default_tty_ops: {
        get_char: function(tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                    var bytesRead = 0;
                    try {
                        bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
                    } catch (e) {
                        if (e.toString().includes("EOF")) bytesRead = 0;
                        else throw e
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8")
                    } else {
                        result = null
                    }
                } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n"
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n"
                    }
                }
                if (!result) {
                    return null
                }
                tty.input = intArrayFromString(result, true)
            }
            return tty.input.shift()
        },
        put_char: function(tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        flush: function(tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    },
    default_tty1_ops: {
        put_char: function(tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        flush: function(tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }
};

function mmapAlloc(size) {
    var alignedSize = alignMemory(size, 65536);
    var ptr = _malloc(alignedSize);
    while (size < alignedSize) HEAP8[ptr + size++] = 0;
    return ptr
}
var MEMFS = {
    ops_table: null,
    mount: function(mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0)
    },
    createNode: function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63)
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek
                    }
                },
                file: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync
                    }
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink
                    },
                    stream: {}
                },
                chrdev: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: FS.chrdev_stream_ops
                }
            }
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {}
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp
        }
        return node
    },
    getFileDataAsTypedArray: function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents)
    },
    expandFileStorage: function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
    },
    resizeFileStorage: function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0
        } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
            }
            node.usedBytes = newSize
        }
    },
    node_ops: {
        getattr: function(node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length
            } else {
                attr.size = 0
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr
        },
        setattr: function(node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size)
            }
        },
        lookup: function(parent, name) {
            throw FS.genericErrors[44]
        },
        mknod: function(parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev)
        },
        rename: function(old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name)
                } catch (e) {}
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(55)
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir
        },
        unlink: function(parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now()
        },
        rmdir: function(parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(55)
            }
            delete parent.contents[name];
            parent.timestamp = Date.now()
        },
        readdir: function(node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        },
        symlink: function(parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node
        },
        readlink: function(node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28)
            }
            return node.link
        }
    },
    stream_ops: {
        read: function(stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            assert(size >= 0);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset)
            } else {
                for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
            }
            return size
        },
        write: function(stream, buffer, offset, length, position, canOwn) {
            assert(!(buffer instanceof ArrayBuffer));
            if (buffer.buffer === HEAP8.buffer) {
                canOwn = false
            }
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    assert(position === 0, "canOwn must imply no weird position inside the file");
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = buffer.slice(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
                node.contents.set(buffer.subarray(offset, offset + length), position)
            } else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i]
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length
        },
        llseek: function(stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28)
            }
            return position
        },
        allocate: function(stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
        },
        mmap: function(stream, address, length, position, prot, flags) {
            if (address !== 0) {
                throw new FS.ErrnoError(28)
            }
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
                allocated = false;
                ptr = contents.byteOffset
            } else {
                if (position > 0 || position + length < contents.length) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length)
                    } else {
                        contents = Array.prototype.slice.call(contents, position, position + length)
                    }
                }
                allocated = true;
                ptr = mmapAlloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48)
                }
                HEAP8.set(contents, ptr)
            }
            return {
                ptr: ptr,
                allocated: allocated
            }
        },
        msync: function(stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            if (mmapFlags & 2) {
                return 0
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0
        }
    }
};
var ERRNO_MESSAGES = {
    0: "Success",
    1: "Arg list too long",
    2: "Permission denied",
    3: "Address already in use",
    4: "Address not available",
    5: "Address family not supported by protocol family",
    6: "No more processes",
    7: "Socket already connected",
    8: "Bad file number",
    9: "Trying to read unreadable message",
    10: "Mount device busy",
    11: "Operation canceled",
    12: "No children",
    13: "Connection aborted",
    14: "Connection refused",
    15: "Connection reset by peer",
    16: "File locking deadlock error",
    17: "Destination address required",
    18: "Math arg out of domain of func",
    19: "Quota exceeded",
    20: "File exists",
    21: "Bad address",
    22: "File too large",
    23: "Host is unreachable",
    24: "Identifier removed",
    25: "Illegal byte sequence",
    26: "Connection already in progress",
    27: "Interrupted system call",
    28: "Invalid argument",
    29: "I/O error",
    30: "Socket is already connected",
    31: "Is a directory",
    32: "Too many symbolic links",
    33: "Too many open files",
    34: "Too many links",
    35: "Message too long",
    36: "Multihop attempted",
    37: "File or path name too long",
    38: "Network interface is not configured",
    39: "Connection reset by network",
    40: "Network is unreachable",
    41: "Too many open files in system",
    42: "No buffer space available",
    43: "No such device",
    44: "No such file or directory",
    45: "Exec format error",
    46: "No record locks available",
    47: "The link has been severed",
    48: "Not enough core",
    49: "No message of desired type",
    50: "Protocol not available",
    51: "No space left on device",
    52: "Function not implemented",
    53: "Socket is not connected",
    54: "Not a directory",
    55: "Directory not empty",
    56: "State not recoverable",
    57: "Socket operation on non-socket",
    59: "Not a typewriter",
    60: "No such device or address",
    61: "Value too large for defined data type",
    62: "Previous owner died",
    63: "Not super-user",
    64: "Broken pipe",
    65: "Protocol error",
    66: "Unknown protocol",
    67: "Protocol wrong type for socket",
    68: "Math result not representable",
    69: "Read only file system",
    70: "Illegal seek",
    71: "No such process",
    72: "Stale file handle",
    73: "Connection timed out",
    74: "Text file busy",
    75: "Cross-device link",
    100: "Device not a stream",
    101: "Bad font file fmt",
    102: "Invalid slot",
    103: "Invalid request code",
    104: "No anode",
    105: "Block device required",
    106: "Channel number out of range",
    107: "Level 3 halted",
    108: "Level 3 reset",
    109: "Link number out of range",
    110: "Protocol driver not attached",
    111: "No CSI structure available",
    112: "Level 2 halted",
    113: "Invalid exchange",
    114: "Invalid request descriptor",
    115: "Exchange full",
    116: "No data (for no delay io)",
    117: "Timer expired",
    118: "Out of streams resources",
    119: "Machine is not on the network",
    120: "Package not installed",
    121: "The object is remote",
    122: "Advertise error",
    123: "Srmount error",
    124: "Communication error on send",
    125: "Cross mount point (not really error)",
    126: "Given log. name not unique",
    127: "f.d. invalid for this operation",
    128: "Remote address changed",
    129: "Can   access a needed shared lib",
    130: "Accessing a corrupted shared lib",
    131: ".lib section in a.out corrupted",
    132: "Attempting to link in too many libs",
    133: "Attempting to exec a shared library",
    135: "Streams pipe error",
    136: "Too many users",
    137: "Socket type not supported",
    138: "Not supported",
    139: "Protocol family not supported",
    140: "Can't send after socket shutdown",
    141: "Too many references",
    142: "Host is down",
    148: "No medium (in tape drive)",
    156: "Level 2 not synchronized"
};
var ERRNO_CODES = {
    EPERM: 63,
    ENOENT: 44,
    ESRCH: 71,
    EINTR: 27,
    EIO: 29,
    ENXIO: 60,
    E2BIG: 1,
    ENOEXEC: 45,
    EBADF: 8,
    ECHILD: 12,
    EAGAIN: 6,
    EWOULDBLOCK: 6,
    ENOMEM: 48,
    EACCES: 2,
    EFAULT: 21,
    ENOTBLK: 105,
    EBUSY: 10,
    EEXIST: 20,
    EXDEV: 75,
    ENODEV: 43,
    ENOTDIR: 54,
    EISDIR: 31,
    EINVAL: 28,
    ENFILE: 41,
    EMFILE: 33,
    ENOTTY: 59,
    ETXTBSY: 74,
    EFBIG: 22,
    ENOSPC: 51,
    ESPIPE: 70,
    EROFS: 69,
    EMLINK: 34,
    EPIPE: 64,
    EDOM: 18,
    ERANGE: 68,
    ENOMSG: 49,
    EIDRM: 24,
    ECHRNG: 106,
    EL2NSYNC: 156,
    EL3HLT: 107,
    EL3RST: 108,
    ELNRNG: 109,
    EUNATCH: 110,
    ENOCSI: 111,
    EL2HLT: 112,
    EDEADLK: 16,
    ENOLCK: 46,
    EBADE: 113,
    EBADR: 114,
    EXFULL: 115,
    ENOANO: 104,
    EBADRQC: 103,
    EBADSLT: 102,
    EDEADLOCK: 16,
    EBFONT: 101,
    ENOSTR: 100,
    ENODATA: 116,
    ETIME: 117,
    ENOSR: 118,
    ENONET: 119,
    ENOPKG: 120,
    EREMOTE: 121,
    ENOLINK: 47,
    EADV: 122,
    ESRMNT: 123,
    ECOMM: 124,
    EPROTO: 65,
    EMULTIHOP: 36,
    EDOTDOT: 125,
    EBADMSG: 9,
    ENOTUNIQ: 126,
    EBADFD: 127,
    EREMCHG: 128,
    ELIBACC: 129,
    ELIBBAD: 130,
    ELIBSCN: 131,
    ELIBMAX: 132,
    ELIBEXEC: 133,
    ENOSYS: 52,
    ENOTEMPTY: 55,
    ENAMETOOLONG: 37,
    ELOOP: 32,
    EOPNOTSUPP: 138,
    EPFNOSUPPORT: 139,
    ECONNRESET: 15,
    ENOBUFS: 42,
    EAFNOSUPPORT: 5,
    EPROTOTYPE: 67,
    ENOTSOCK: 57,
    ENOPROTOOPT: 50,
    ESHUTDOWN: 140,
    ECONNREFUSED: 14,
    EADDRINUSE: 3,
    ECONNABORTED: 13,
    ENETUNREACH: 40,
    ENETDOWN: 38,
    ETIMEDOUT: 73,
    EHOSTDOWN: 142,
    EHOSTUNREACH: 23,
    EINPROGRESS: 26,
    EALREADY: 7,
    EDESTADDRREQ: 17,
    EMSGSIZE: 35,
    EPROTONOSUPPORT: 66,
    ESOCKTNOSUPPORT: 137,
    EADDRNOTAVAIL: 4,
    ENETRESET: 39,
    EISCONN: 30,
    ENOTCONN: 53,
    ETOOMANYREFS: 141,
    EUSERS: 136,
    EDQUOT: 19,
    ESTALE: 72,
    ENOTSUP: 138,
    ENOMEDIUM: 148,
    EILSEQ: 25,
    EOVERFLOW: 61,
    ECANCELED: 11,
    ENOTRECOVERABLE: 56,
    EOWNERDEAD: 62,
    ESTRPIPE: 135
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    trackingDelegate: {},
    tracking: {
        openFlags: {
            READ: 1,
            WRITE: 2
        }
    },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    lookupPath: function(path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path) return {
            path: "",
            node: null
        };
        var defaults = {
            follow_mount: true,
            recurse_count: 0
        };
        for (var key in defaults) {
            if (opts[key] === undefined) {
                opts[key] = defaults[key]
            }
        }
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32)
        }
        var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
            return !!p
        }), false);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32)
                    }
                }
            }
        }
        return {
            path: current_path,
            node: current
        }
    },
    getPath: function(node) {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent
        }
    },
    hashName: function(parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0
        }
        return (parentid + hash >>> 0) % FS.nameTable.length
    },
    hashAddNode: function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node
    },
    hashRemoveNode: function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break
                }
                current = current.name_next
            }
        }
    },
    lookupNode: function(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
            throw new FS.ErrnoError(errCode, parent)
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node
            }
        }
        return FS.lookup(parent, name)
    },
    createNode: function(parent, name, mode, rdev) {
        assert(typeof parent === "object");
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node
    },
    destroyNode: function(node) {
        FS.hashRemoveNode(node)
    },
    isRoot: function(node) {
        return node === node.parent
    },
    isMountpoint: function(node) {
        return !!node.mounted
    },
    isFile: function(mode) {
        return (mode & 61440) === 32768
    },
    isDir: function(mode) {
        return (mode & 61440) === 16384
    },
    isLink: function(mode) {
        return (mode & 61440) === 40960
    },
    isChrdev: function(mode) {
        return (mode & 61440) === 8192
    },
    isBlkdev: function(mode) {
        return (mode & 61440) === 24576
    },
    isFIFO: function(mode) {
        return (mode & 61440) === 4096
    },
    isSocket: function(mode) {
        return (mode & 49152) === 49152
    },
    flagModes: {
        "r": 0,
        "r+": 2,
        "w": 577,
        "w+": 578,
        "a": 1089,
        "a+": 1090
    },
    modeStringToFlags: function(str) {
        var flags = FS.flagModes[str];
        if (typeof flags === "undefined") {
            throw new Error("Unknown file open mode: " + str)
        }
        return flags
    },
    flagsToPermissionString: function(flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w"
        }
        return perms
    },
    nodePermissions: function(node, perms) {
        if (FS.ignorePermissions) {
            return 0
        }
        if (perms.includes("r") && !(node.mode & 292)) {
            return 2
        } else if (perms.includes("w") && !(node.mode & 146)) {
            return 2
        } else if (perms.includes("x") && !(node.mode & 73)) {
            return 2
        }
        return 0
    },
    mayLookup: function(dir) {
        var errCode = FS.nodePermissions(dir, "x");
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0
    },
    mayCreate: function(dir, name) {
        try {
            var node = FS.lookupNode(dir, name);
            return 20
        } catch (e) {}
        return FS.nodePermissions(dir, "wx")
    },
    mayDelete: function(dir, name, isdir) {
        var node;
        try {
            node = FS.lookupNode(dir, name)
        } catch (e) {
            return e.errno
        }
        var errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
            return errCode
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31
            }
        }
        return 0
    },
    mayOpen: function(node, flags) {
        if (!node) {
            return 44
        }
        if (FS.isLink(node.mode)) {
            return 32
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 31
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function(fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd
            }
        }
        throw new FS.ErrnoError(33)
    },
    getStream: function(fd) {
        return FS.streams[fd]
    },
    createStream: function(stream, fd_start, fd_end) {
        if (!FS.FSStream) {
            FS.FSStream = function() {};
            FS.FSStream.prototype = {
                object: {
                    get: function() {
                        return this.node
                    },
                    set: function(val) {
                        this.node = val
                    }
                },
                isRead: {
                    get: function() {
                        return (this.flags & 2097155) !== 1
                    }
                },
                isWrite: {
                    get: function() {
                        return (this.flags & 2097155) !== 0
                    }
                },
                isAppend: {
                    get: function() {
                        return this.flags & 1024
                    }
                }
            }
        }
        var newStream = new FS.FSStream;
        for (var p in stream) {
            newStream[p] = stream[p]
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream
    },
    closeStream: function(fd) {
        FS.streams[fd] = null
    },
    chrdev_stream_ops: {
        open: function(stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream)
            }
        },
        llseek: function() {
            throw new FS.ErrnoError(70)
        }
    },
    major: function(dev) {
        return dev >> 8
    },
    minor: function(dev) {
        return dev & 255
    },
    makedev: function(ma, mi) {
        return ma << 8 | mi
    },
    registerDevice: function(dev, ops) {
        FS.devices[dev] = {
            stream_ops: ops
        }
    },
    getDevice: function(dev) {
        return FS.devices[dev]
    },
    getMounts: function(mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts)
        }
        return mounts
    },
    syncfs: function(populate, callback) {
        if (typeof populate === "function") {
            callback = populate;
            populate = false
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;

        function doCallback(errCode) {
            assert(FS.syncFSRequests > 0);
            FS.syncFSRequests--;
            return callback(errCode)
        }

        function done(errCode) {
            if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode)
                }
                return
            }
            if (++completed >= mounts.length) {
                doCallback(null)
            }
        }
        mounts.forEach(function(mount) {
            if (!mount.type.syncfs) {
                return done(null)
            }
            mount.type.syncfs(mount, populate, done)
        })
    },
    mount: function(type, opts, mountpoint) {
        if (typeof type === "string") {
            throw type
        }
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10)
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, {
                follow_mount: false
            });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10)
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54)
            }
        }
        var mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount)
            }
        }
        return mountRoot
    },
    unmount: function(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, {
            follow_mount: false
        });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28)
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function(hash) {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.includes(current.mount)) {
                    FS.destroyNode(current)
                }
                current = next
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1)
    },
    lookup: function(parent, name) {
        return parent.node_ops.lookup(parent, name)
    },
    mknod: function(path, mode, dev) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(28)
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.mknod(parent, name, mode, dev)
    },
    create: function(path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0)
    },
    mkdir: function(path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0)
    },
    mkdirTree: function(path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode)
            } catch (e) {
                if (e.errno != 20) throw e
            }
        }
    },
    mkdev: function(path, mode, dev) {
        if (typeof dev === "undefined") {
            dev = mode;
            mode = 438
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev)
    },
    symlink: function(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44)
        }
        var lookup = FS.lookupPath(newpath, {
            parent: true
        });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44)
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.symlink(parent, newname, oldpath)
    },
    rename: function(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, {
            parent: true
        });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, {
            parent: true
        });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75)
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(28)
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(55)
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {}
        if (old_node === new_node) {
            return
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(10)
        }
        if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, "w");
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
        }
        try {
            if (FS.trackingDelegate["willMovePath"]) {
                FS.trackingDelegate["willMovePath"](old_path, new_path)
            }
        } catch (e) {
            err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name)
        } catch (e) {
            throw e
        } finally {
            FS.hashAddNode(old_node)
        }
        try {
            if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
        } catch (e) {
            err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
    },
    rmdir: function(path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readdir: function(path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54)
        }
        return node.node_ops.readdir(node)
    },
    unlink: function(path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readlink: function(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44)
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28)
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
    },
    stat: function(path, dontFollow) {
        var lookup = FS.lookupPath(path, {
            follow: !dontFollow
        });
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63)
        }
        return node.node_ops.getattr(node)
    },
    lstat: function(path) {
        return FS.stat(path, true)
    },
    chmod: function(path, mode, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            mode: mode & 4095 | node.mode & ~4095,
            timestamp: Date.now()
        })
    },
    lchmod: function(path, mode) {
        FS.chmod(path, mode, true)
    },
    fchmod: function(fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        FS.chmod(stream.node, mode)
    },
    chown: function(path, uid, gid, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            timestamp: Date.now()
        })
    },
    lchown: function(path, uid, gid) {
        FS.chown(path, uid, gid, true)
    },
    fchown: function(fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        FS.chown(stream.node, uid, gid)
    },
    truncate: function(path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(28)
        }
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: true
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28)
        }
        var errCode = FS.nodePermissions(node, "w");
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
        })
    },
    ftruncate: function(fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28)
        }
        FS.truncate(stream.node, len)
    },
    utime: function(path, atime, mtime) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
        })
    },
    open: function(path, flags, mode, fd_start, fd_end) {
        if (path === "") {
            throw new FS.ErrnoError(44)
        }
        flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = mode & 4095 | 32768
        } else {
            mode = 0
        }
        var node;
        if (typeof path === "object") {
            node = path
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, {
                    follow: !(flags & 131072)
                });
                node = lookup.node
            } catch (e) {}
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20)
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54)
        }
        if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
        }
        if (flags & 512) {
            FS.truncate(node, 0)
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
        }, fd_start, fd_end);
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream)
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                err("FS.trackingDelegate error on read file: " + path)
            }
        }
        try {
            if (FS.trackingDelegate["onOpenFile"]) {
                var trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE
                }
                FS.trackingDelegate["onOpenFile"](path, trackingFlags)
            }
        } catch (e) {
            err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
        }
        return stream
    },
    close: function(stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream)
            }
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(stream.fd)
        }
        stream.fd = null
    },
    isClosed: function(stream) {
        return stream.fd === null
    },
    llseek: function(stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70)
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28)
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position
    },
    read: function(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead
    },
    write: function(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28)
        }
        if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
            if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
        } catch (e) {
            err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
        }
        return bytesWritten
    },
    allocate: function(stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43)
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138)
        }
        stream.stream_ops.allocate(stream, offset, length)
    },
    mmap: function(stream, address, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2)
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43)
        }
        return stream.stream_ops.mmap(stream, address, length, position, prot, flags)
    },
    msync: function(stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
    },
    munmap: function(stream) {
        return 0
    },
    ioctl: function(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59)
        }
        return stream.stream_ops.ioctl(stream, cmd, arg)
    },
    readFile: function(path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"')
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0)
        } else if (opts.encoding === "binary") {
            ret = buf
        }
        FS.close(stream);
        return ret
    },
    writeFile: function(path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
        } else {
            throw new Error("Unsupported data type")
        }
        FS.close(stream)
    },
    cwd: function() {
        return FS.currentPath
    },
    chdir: function(path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44)
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54)
        }
        var errCode = FS.nodePermissions(lookup.node, "x");
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        FS.currentPath = lookup.path
    },
    createDefaultDirectories: function() {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function() {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: function() {
                return 0
            },
            write: function(stream, buffer, offset, length, pos) {
                return length
            }
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device = getRandomDevice();
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function() {
        FS.mkdir("/proc");
        var proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount: function() {
                var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup: function(parent, name) {
                        var fd = +name;
                        var stream = FS.getStream(fd);
                        if (!stream) throw new FS.ErrnoError(8);
                        var ret = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: function() {
                                    return stream.path
                                }
                            }
                        };
                        ret.parent = ret;
                        return ret
                    }
                };
                return node
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function() {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdin")
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdout")
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"])
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr")
        }
        var stdin = FS.open("/dev/stdin", 0);
        var stdout = FS.open("/dev/stdout", 1);
        var stderr = FS.open("/dev/stderr", 1);
        assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
        assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
        assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")")
    },
    ensureErrnoError: function() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function(errno) {
                this.errno = errno;
                for (var key in ERRNO_CODES) {
                    if (ERRNO_CODES[key] === errno) {
                        this.code = key;
                        break
                    }
                }
            };
            this.setErrno(errno);
            this.message = ERRNO_MESSAGES[errno];
            if (this.stack) {
                Object.defineProperty(this, "stack", {
                    value: (new Error).stack,
                    writable: true
                });
                this.stack = demangleAll(this.stack)
            }
        };
        FS.ErrnoError.prototype = new Error;
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach(function(code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>"
        })
    },
    staticInit: function() {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
            "MEMFS": MEMFS
        }
    },
    init: function(input, output, error) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams()
    },
    quit: function() {
        FS.init.initialized = false;
        var fflush = Module["_fflush"];
        if (fflush) fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue
            }
            FS.close(stream)
        }
    },
    getMode: function(canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode
    },
    findObject: function(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object
        } else {
            return null
        }
    },
    analyzePath: function(path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            path = lookup.path
        } catch (e) {}
        var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null
        };
        try {
            var lookup = FS.lookupPath(path, {
                parent: true
            });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/"
        } catch (e) {
            ret.error = e.errno
        }
        return ret
    },
    createPath: function(parent, path, canRead, canWrite) {
        parent = typeof parent === "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current)
            } catch (e) {}
            parent = current
        }
        return current
    },
    createFile: function(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode)
    },
    createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data === "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode)
        }
        return node
    },
    createDevice: function(parent, name, input, output) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function(stream) {
                stream.seekable = false
            },
            close: function(stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10)
                }
            },
            read: function(stream, buffer, offset, length, pos) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input()
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6)
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            },
            write: function(stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i])
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        });
        return FS.mkdev(path, mode, dev)
    },
    forceLoadFile: function(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest !== "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length
            } catch (e) {
                throw new FS.ErrnoError(29)
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.")
        }
    },
    createLazyFile: function(parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = idx / this.chunkSize | 0;
            return this.getter(chunkNum)[chunkOffset]
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest;
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined")
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || [])
                } else {
                    return intArrayFromString(xhr.responseText || "", true)
                }
            };
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end)
                }
                if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum]
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                out("LazyFiles on gzip forces download of the whole file when length is accessed")
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true
        };
        if (typeof XMLHttpRequest !== "undefined") {
            if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var lazyArray = new LazyUint8Array;
            Object.defineProperties(lazyArray, {
                length: {
                    get: function() {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._length
                    }
                },
                chunkSize: {
                    get: function() {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._chunkSize
                    }
                }
            });
            var properties = {
                isDevice: false,
                contents: lazyArray
            }
        } else {
            var properties = {
                isDevice: false,
                url: url
            }
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function() {
                    return this.contents.length
                }
            }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                FS.forceLoadFile(node);
                return fn.apply(null, arguments)
            }
        });
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            FS.forceLoadFile(node);
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            assert(size >= 0);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i]
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i)
                }
            }
            return size
        };
        node.stream_ops = stream_ops;
        return node
    },
    createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);

        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                }
                if (onload) onload();
                removeRunDependency(dep)
            }
            var handled = false;
            Module["preloadPlugins"].forEach(function(plugin) {
                if (handled) return;
                if (plugin["canHandle"](fullname)) {
                    plugin["handle"](byteArray, fullname, finish, function() {
                        if (onerror) onerror();
                        removeRunDependency(dep)
                    });
                    handled = true
                }
            });
            if (!handled) finish(byteArray)
        }
        addRunDependency(dep);
        if (typeof url == "string") {
            Browser.asyncLoad(url, function(byteArray) {
                processData(byteArray)
            }, onerror)
        } else {
            processData(url)
        }
    },
    indexedDB: function() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function() {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function(paths, onload, onerror) {
        onload = onload || function() {};
        onerror = onerror || function() {};
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            out("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME)
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror()
            }
            paths.forEach(function(path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function putRequest_onsuccess() {
                    ok++;
                    if (ok + fail == total) finish()
                };
                putRequest.onerror = function putRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    },
    loadFilesFromDB: function(paths, onload, onerror) {
        onload = onload || function() {};
        onerror = onerror || function() {};
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                onerror(e);
                return
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror()
            }
            paths.forEach(function(path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function getRequest_onsuccess() {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path)
                    }
                    FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                    ok++;
                    if (ok + fail == total) finish()
                };
                getRequest.onerror = function getRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    },
    absolutePath: function() {
        abort("FS.absolutePath has been removed; use PATH_FS.resolve instead")
    },
    createFolder: function() {
        abort("FS.createFolder has been removed; use FS.mkdir instead")
    },
    createLink: function() {
        abort("FS.createLink has been removed; use FS.symlink instead")
    },
    joinPath: function() {
        abort("FS.joinPath has been removed; use PATH.join instead")
    },
    mmapAlloc: function() {
        abort("FS.mmapAlloc has been replaced by the top level function mmapAlloc")
    },
    standardizePath: function() {
        abort("FS.standardizePath has been removed; use PATH.normalize instead")
    }
};
var SYSCALLS = {
    mappings: {},
    DEFAULT_POLLMASK: 5,
    umask: 511,
    calculateAt: function(dirfd, path, allowEmpty) {
        if (path[0] === "/") {
            return path
        }
        var dir;
        if (dirfd === -100) {
            dir = FS.cwd()
        } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(8);
            dir = dirstream.path
        }
        if (path.length == 0) {
            if (!allowEmpty) {
                throw new FS.ErrnoError(44)
            }
            return dir
        }
        return PATH.join2(dir, path)
    },
    doStat: function(func, path, buf) {
        try {
            var stat = func(path)
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -54
            }
            throw e
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = 0;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        HEAP32[buf + 32 >> 2] = 0;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAP32[buf + 48 >> 2] = 4096;
        HEAP32[buf + 52 >> 2] = stat.blocks;
        HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
        HEAP32[buf + 60 >> 2] = 0;
        HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
        HEAP32[buf + 68 >> 2] = 0;
        HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
        HEAP32[buf + 76 >> 2] = 0;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
        return 0
    },
    doMsync: function(addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags)
    },
    doMkdir: function(path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0
    },
    doMknod: function(path, mode, dev) {
        switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
                break;
            default:
                return -28
        }
        FS.mknod(path, mode, dev);
        return 0
    },
    doReadlink: function(path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len
    },
    doAccess: function(path, amode) {
        if (amode & ~7) {
            return -28
        }
        var node;
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        node = lookup.node;
        if (!node) {
            return -44
        }
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -2
        }
        return 0
    },
    doDup: function(path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd
    },
    doReadv: function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
            if (curr < len) break
        }
        return ret
    },
    doWritev: function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr
        }
        return ret
    },
    varargs: undefined,
    get: function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    },
    getStr: function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret
    },
    getStreamFromFD: function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream
    },
    get64: function(low, high) {
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low
    }
};

function ___sys_fcntl64(fd, cmd, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
            case 0: {
                var arg = SYSCALLS.get();
                if (arg < 0) {
                    return -28
                }
                var newStream;
                newStream = FS.open(stream.path, stream.flags, 0, arg);
                return newStream.fd
            }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4: {
                var arg = SYSCALLS.get();
                stream.flags |= arg;
                return 0
            }
            case 12: {
                var arg = SYSCALLS.get();
                var offset = 0;
                HEAP16[arg + offset >> 1] = 2;
                return 0
            }
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -28;
            case 9:
                setErrNo(28);
                return -1;
            default: {
                return -28
            }
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_fstat64(fd, buf) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.doStat(FS.stat, stream.path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_ftruncate64(fd, zero, low, high) {
    try {
        var length = SYSCALLS.get64(low, high);
        FS.ftruncate(fd, length);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_getdents64(fd, dirp, count) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (!stream.getdents) {
            stream.getdents = FS.readdir(stream.path)
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
            var id;
            var type;
            var name = stream.getdents[idx];
            if (name[0] === ".") {
                id = 1;
                type = 4
            } else {
                var child = FS.lookupNode(stream.node, name);
                id = child.id;
                type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
            }
            tempI64 = [id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
            tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
            HEAP16[dirp + pos + 16 >> 1] = 280;
            HEAP8[dirp + pos + 18 >> 0] = type;
            stringToUTF8(name, dirp + pos + 19, 256);
            pos += struct_size;
            idx += 1
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_getpid() {
    return 42
}

function ___sys_ioctl(fd, op, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
            case 21509:
            case 21505: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21519: {
                if (!stream.tty) return -59;
                var argp = SYSCALLS.get();
                HEAP32[argp >> 2] = 0;
                return 0
            }
            case 21520: {
                if (!stream.tty) return -59;
                return -28
            }
            case 21531: {
                var argp = SYSCALLS.get();
                return FS.ioctl(stream, op, argp)
            }
            case 21523: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21524: {
                if (!stream.tty) return -59;
                return 0
            }
            default:
                abort("bad ioctl syscall " + op)
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_madvise1(addr, length, advice) {
    return 0
}

function syscallMmap2(addr, len, prot, flags, fd, off) {
    off <<= 12;
    var ptr;
    var allocated = false;
    if ((flags & 16) !== 0 && addr % 65536 !== 0) {
        return -28
    }
    if ((flags & 32) !== 0) {
        ptr = _memalign(65536, len);
        if (!ptr) return -48;
        _memset(ptr, 0, len);
        allocated = true
    } else {
        var info = FS.getStream(fd);
        if (!info) return -8;
        var res = FS.mmap(info, addr, len, off, prot, flags);
        ptr = res.ptr;
        allocated = res.allocated
    }
    SYSCALLS.mappings[ptr] = {
        malloc: ptr,
        len: len,
        allocated: allocated,
        fd: fd,
        prot: prot,
        flags: flags,
        offset: off
    };
    return ptr
}

function ___sys_mmap2(addr, len, prot, flags, fd, off) {
    try {
        return syscallMmap2(addr, len, prot, flags, fd, off)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_mprotect(addr, len, size) {
    return 0
}

function syscallMunmap(addr, len) {
    if ((addr | 0) === -1 || len === 0) {
        return -28
    }
    var info = SYSCALLS.mappings[addr];
    if (!info) return 0;
    if (len === info.len) {
        var stream = FS.getStream(info.fd);
        if (stream) {
            if (info.prot & 2) {
                SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset)
            }
            FS.munmap(stream)
        }
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
            _free(info.malloc)
        }
    }
    return 0
}

function ___sys_munmap(addr, len) {
    try {
        return syscallMunmap(addr, len)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_open(path, flags, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var pathname = SYSCALLS.getStr(path);
        var mode = varargs ? SYSCALLS.get() : 0;
        var stream = FS.open(pathname, flags, mode);
        return stream.fd
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_rmdir(path) {
    try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_stat64(path, buf) {
    try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___sys_unlink(path) {
    try {
        path = SYSCALLS.getStr(path);
        FS.unlink(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function __emscripten_throw_longjmp() {
    throw "longjmp"
}

function _abort() {
    abort()
}

function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num)
}

function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1
    } catch (e) {
        console.error("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e)
    }
}

function _emscripten_resize_heap(requestedSize) {
    var oldSize = HEAPU8.length;
    requestedSize = requestedSize >>> 0;
    assert(requestedSize > oldSize);
    var maxHeapSize = 2147483648;
    if (requestedSize > maxHeapSize) {
        err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
        return false
    }
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true
        }
    }
    err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
    return false
}
var ENV = {};

function getExecutableName() {
    return thisProgram || "./this.program"
}

function getEnvStrings() {
    if (!getEnvStrings.strings) {
        var lang = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = {
            "USER": "web_user",
            "LOGNAME": "web_user",
            "PATH": "/",
            "PWD": "/",
            "HOME": "/home/web_user",
            "LANG": lang,
            "_": getExecutableName()
        };
        for (var x in ENV) {
            if (ENV[x] === undefined) delete env[x];
            else env[x] = ENV[x]
        }
        var strings = [];
        for (var x in env) {
            strings.push(x + "=" + env[x])
        }
        getEnvStrings.strings = strings
    }
    return getEnvStrings.strings
}

function _environ_get(__environ, environ_buf) {
    try {
        var bufSize = 0;
        getEnvStrings().forEach(function(string, i) {
            var ptr = environ_buf + bufSize;
            HEAP32[__environ + i * 4 >> 2] = ptr;
            writeAsciiToMemory(string, ptr);
            bufSize += string.length + 1
        });
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _environ_sizes_get(penviron_count, penviron_buf_size) {
    try {
        var strings = getEnvStrings();
        HEAP32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function(string) {
            bufSize += string.length + 1
        });
        HEAP32[penviron_buf_size >> 2] = bufSize;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_close(fd) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_fdstat_get(fd, pbuf) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        HEAP8[pbuf >> 0] = type;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_read(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return -61
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_sync(fd) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (stream.stream_ops && stream.stream_ops.fsync) {
            return -stream.stream_ops.fsync(stream)
        }
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _getTempRet0() {
    return getTempRet0()
}

function _gettimeofday(ptr) {
    var now = Date.now();
    HEAP32[ptr >> 2] = now / 1e3 | 0;
    HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
    return 0
}

function _setTempRet0(val) {
    setTempRet0(val)
}

function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++]) {}
    return sum
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1)
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1)
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate
        }
    }
    return newDate
}

function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[tm + 4 >> 2],
        tm_hour: HEAP32[tm + 8 >> 2],
        tm_mday: HEAP32[tm + 12 >> 2],
        tm_mon: HEAP32[tm + 16 >> 2],
        tm_year: HEAP32[tm + 20 >> 2],
        tm_wday: HEAP32[tm + 24 >> 2],
        tm_yday: HEAP32[tm + 28 >> 2],
        tm_isdst: HEAP32[tm + 32 >> 2],
        tm_gmtoff: HEAP32[tm + 36 >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
    };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str
        }
        return str
    }

    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0")
    }

    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate())
            }
        }
        return compare
    }

    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
    }

    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1
            } else {
                return thisDate.getFullYear()
            }
        } else {
            return thisDate.getFullYear() - 1
        }
    }
    var EXPANSION_RULES_2 = {
        "%a": function(date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3)
        },
        "%A": function(date) {
            return WEEKDAYS[date.tm_wday]
        },
        "%b": function(date) {
            return MONTHS[date.tm_mon].substring(0, 3)
        },
        "%B": function(date) {
            return MONTHS[date.tm_mon]
        },
        "%C": function(date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2)
        },
        "%d": function(date) {
            return leadingNulls(date.tm_mday, 2)
        },
        "%e": function(date) {
            return leadingSomething(date.tm_mday, 2, " ")
        },
        "%g": function(date) {
            return getWeekBasedYear(date).toString().substring(2)
        },
        "%G": function(date) {
            return getWeekBasedYear(date)
        },
        "%H": function(date) {
            return leadingNulls(date.tm_hour, 2)
        },
        "%I": function(date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
        },
        "%j": function(date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
        },
        "%m": function(date) {
            return leadingNulls(date.tm_mon + 1, 2)
        },
        "%M": function(date) {
            return leadingNulls(date.tm_min, 2)
        },
        "%n": function() {
            return "\n"
        },
        "%p": function(date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM"
            } else {
                return "PM"
            }
        },
        "%S": function(date) {
            return leadingNulls(date.tm_sec, 2)
        },
        "%t": function() {
            return "\t"
        },
        "%u": function(date) {
            return date.tm_wday || 7
        },
        "%U": function(date) {
            var janFirst = new Date(date.tm_year + 1900, 0, 1);
            var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
        },
        "%V": function(date) {
            var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
            var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return "53"
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return "01"
            }
            var daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2)
        },
        "%w": function(date) {
            return date.tm_wday
        },
        "%W": function(date) {
            var janFirst = new Date(date.tm_year, 0, 1);
            var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
        },
        "%y": function(date) {
            return (date.tm_year + 1900).toString().substring(2)
        },
        "%Y": function(date) {
            return date.tm_year + 1900
        },
        "%z": function(date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
        },
        "%Z": function(date) {
            return date.tm_zone
        },
        "%%": function() {
            return "%"
        }
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
        }
    }
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1
}

function _strftime_l(s, maxsize, format, tm) {
    return _strftime(s, maxsize, format, tm)
}

function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;
    if (ptr) {
        HEAP32[ptr >> 2] = ret
    }
    return ret
}
var FSNode = function(parent, name, mode, rdev) {
    if (!parent) {
        parent = this
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
    read: {
        get: function() {
            return (this.mode & readMode) === readMode
        },
        set: function(val) {
            val ? this.mode |= readMode : this.mode &= ~readMode
        }
    },
    write: {
        get: function() {
            return (this.mode & writeMode) === writeMode
        },
        set: function(val) {
            val ? this.mode |= writeMode : this.mode &= ~writeMode
        }
    },
    isFolder: {
        get: function() {
            return FS.isDir(this.mode)
        }
    },
    isDevice: {
        get: function() {
            return FS.isChrdev(this.mode)
        }
    }
});
FS.FSNode = FSNode;
FS.staticInit();
var ASSERTIONS = true;

function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array
}
var asmLibraryArg = {
    "__cxa_atexit": ___cxa_atexit,
    "__gmtime_r": ___gmtime_r,
    "__localtime_r": ___localtime_r,
    "__sys_fcntl64": ___sys_fcntl64,
    "__sys_fstat64": ___sys_fstat64,
    "__sys_ftruncate64": ___sys_ftruncate64,
    "__sys_getdents64": ___sys_getdents64,
    "__sys_getpid": ___sys_getpid,
    "__sys_ioctl": ___sys_ioctl,
    "__sys_madvise1": ___sys_madvise1,
    "__sys_mmap2": ___sys_mmap2,
    "__sys_mprotect": ___sys_mprotect,
    "__sys_munmap": ___sys_munmap,
    "__sys_open": ___sys_open,
    "__sys_rmdir": ___sys_rmdir,
    "__sys_stat64": ___sys_stat64,
    "__sys_unlink": ___sys_unlink,
    "_emscripten_throw_longjmp": __emscripten_throw_longjmp,
    "abort": _abort,
    "emscripten_memcpy_big": _emscripten_memcpy_big,
    "emscripten_resize_heap": _emscripten_resize_heap,
    "environ_get": _environ_get,
    "environ_sizes_get": _environ_sizes_get,
    "fd_close": _fd_close,
    "fd_fdstat_get": _fd_fdstat_get,
    "fd_read": _fd_read,
    "fd_seek": _fd_seek,
    "fd_sync": _fd_sync,
    "fd_write": _fd_write,
    "getTempRet0": _getTempRet0,
    "gettimeofday": _gettimeofday,
    "invoke_ii": invoke_ii,
    "invoke_iii": invoke_iii,
    "invoke_iiii": invoke_iiii,
    "invoke_iiiii": invoke_iiiii,
    "invoke_v": invoke_v,
    "invoke_vi": invoke_vi,
    "invoke_viii": invoke_viii,
    "invoke_viiii": invoke_viiii,
    "localtime_r": _localtime_r,
    "setTempRet0": _setTempRet0,
    "strftime_l": _strftime_l,
    "time": _time
};
var asm = createWasm();
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");
var _PDFium_Init = Module["_PDFium_Init"] = createExportWrapper("PDFium_Init");
var _FPDF_InitLibraryWithConfig = Module["_FPDF_InitLibraryWithConfig"] = createExportWrapper("FPDF_InitLibraryWithConfig");
var _FPDFAnnot_IsSupportedSubtype = Module["_FPDFAnnot_IsSupportedSubtype"] = createExportWrapper("FPDFAnnot_IsSupportedSubtype");
var _FPDFPage_CreateAnnot = Module["_FPDFPage_CreateAnnot"] = createExportWrapper("FPDFPage_CreateAnnot");
var _FPDFPage_GetAnnotCount = Module["_FPDFPage_GetAnnotCount"] = createExportWrapper("FPDFPage_GetAnnotCount");
var _FPDFPage_GetAnnot = Module["_FPDFPage_GetAnnot"] = createExportWrapper("FPDFPage_GetAnnot");
var _FPDFPage_GetAnnotIndex = Module["_FPDFPage_GetAnnotIndex"] = createExportWrapper("FPDFPage_GetAnnotIndex");
var _FPDFPage_CloseAnnot = Module["_FPDFPage_CloseAnnot"] = createExportWrapper("FPDFPage_CloseAnnot");
var _FPDFPage_RemoveAnnot = Module["_FPDFPage_RemoveAnnot"] = createExportWrapper("FPDFPage_RemoveAnnot");
var _FPDFAnnot_GetSubtype = Module["_FPDFAnnot_GetSubtype"] = createExportWrapper("FPDFAnnot_GetSubtype");
var _FPDFAnnot_IsObjectSupportedSubtype = Module["_FPDFAnnot_IsObjectSupportedSubtype"] = createExportWrapper("FPDFAnnot_IsObjectSupportedSubtype");
var _FPDFAnnot_UpdateObject = Module["_FPDFAnnot_UpdateObject"] = createExportWrapper("FPDFAnnot_UpdateObject");
var _FPDFAnnot_AddInkStroke = Module["_FPDFAnnot_AddInkStroke"] = createExportWrapper("FPDFAnnot_AddInkStroke");
var _FPDFAnnot_RemoveInkList = Module["_FPDFAnnot_RemoveInkList"] = createExportWrapper("FPDFAnnot_RemoveInkList");
var _FPDFAnnot_AppendObject = Module["_FPDFAnnot_AppendObject"] = createExportWrapper("FPDFAnnot_AppendObject");
var _FPDFAnnot_GetObjectCount = Module["_FPDFAnnot_GetObjectCount"] = createExportWrapper("FPDFAnnot_GetObjectCount");
var _FPDFAnnot_GetObject = Module["_FPDFAnnot_GetObject"] = createExportWrapper("FPDFAnnot_GetObject");
var _FPDFAnnot_RemoveObject = Module["_FPDFAnnot_RemoveObject"] = createExportWrapper("FPDFAnnot_RemoveObject");
var _FPDFAnnot_SetColor = Module["_FPDFAnnot_SetColor"] = createExportWrapper("FPDFAnnot_SetColor");
var _FPDFAnnot_GetColor = Module["_FPDFAnnot_GetColor"] = createExportWrapper("FPDFAnnot_GetColor");
var _FPDFAnnot_HasAttachmentPoints = Module["_FPDFAnnot_HasAttachmentPoints"] = createExportWrapper("FPDFAnnot_HasAttachmentPoints");
var _FPDFAnnot_SetAttachmentPoints = Module["_FPDFAnnot_SetAttachmentPoints"] = createExportWrapper("FPDFAnnot_SetAttachmentPoints");
var _FPDFAnnot_AppendAttachmentPoints = Module["_FPDFAnnot_AppendAttachmentPoints"] = createExportWrapper("FPDFAnnot_AppendAttachmentPoints");
var _FPDFAnnot_CountAttachmentPoints = Module["_FPDFAnnot_CountAttachmentPoints"] = createExportWrapper("FPDFAnnot_CountAttachmentPoints");
var _FPDFAnnot_GetAttachmentPoints = Module["_FPDFAnnot_GetAttachmentPoints"] = createExportWrapper("FPDFAnnot_GetAttachmentPoints");
var _FPDFAnnot_SetRect = Module["_FPDFAnnot_SetRect"] = createExportWrapper("FPDFAnnot_SetRect");
var _FPDFAnnot_GetRect = Module["_FPDFAnnot_GetRect"] = createExportWrapper("FPDFAnnot_GetRect");
var _FPDFAnnot_GetVertices = Module["_FPDFAnnot_GetVertices"] = createExportWrapper("FPDFAnnot_GetVertices");
var _FPDFAnnot_GetInkListCount = Module["_FPDFAnnot_GetInkListCount"] = createExportWrapper("FPDFAnnot_GetInkListCount");
var _FPDFAnnot_GetInkListPath = Module["_FPDFAnnot_GetInkListPath"] = createExportWrapper("FPDFAnnot_GetInkListPath");
var _FPDFAnnot_GetLine = Module["_FPDFAnnot_GetLine"] = createExportWrapper("FPDFAnnot_GetLine");
var _FPDFAnnot_SetBorder = Module["_FPDFAnnot_SetBorder"] = createExportWrapper("FPDFAnnot_SetBorder");
var _FPDFAnnot_GetBorder = Module["_FPDFAnnot_GetBorder"] = createExportWrapper("FPDFAnnot_GetBorder");
var _FPDFAnnot_HasKey = Module["_FPDFAnnot_HasKey"] = createExportWrapper("FPDFAnnot_HasKey");
var _FPDFAnnot_GetValueType = Module["_FPDFAnnot_GetValueType"] = createExportWrapper("FPDFAnnot_GetValueType");
var _FPDFAnnot_SetStringValue = Module["_FPDFAnnot_SetStringValue"] = createExportWrapper("FPDFAnnot_SetStringValue");
var _FPDFAnnot_GetStringValue = Module["_FPDFAnnot_GetStringValue"] = createExportWrapper("FPDFAnnot_GetStringValue");
var _FPDFAnnot_GetNumberValue = Module["_FPDFAnnot_GetNumberValue"] = createExportWrapper("FPDFAnnot_GetNumberValue");
var _FPDFAnnot_SetAP = Module["_FPDFAnnot_SetAP"] = createExportWrapper("FPDFAnnot_SetAP");
var _FPDFAnnot_GetAP = Module["_FPDFAnnot_GetAP"] = createExportWrapper("FPDFAnnot_GetAP");
var _FPDFAnnot_GetLinkedAnnot = Module["_FPDFAnnot_GetLinkedAnnot"] = createExportWrapper("FPDFAnnot_GetLinkedAnnot");
var _FPDFAnnot_GetFlags = Module["_FPDFAnnot_GetFlags"] = createExportWrapper("FPDFAnnot_GetFlags");
var _FPDFAnnot_SetFlags = Module["_FPDFAnnot_SetFlags"] = createExportWrapper("FPDFAnnot_SetFlags");
var _FPDFAnnot_GetFormFieldFlags = Module["_FPDFAnnot_GetFormFieldFlags"] = createExportWrapper("FPDFAnnot_GetFormFieldFlags");
var _FPDFAnnot_GetFormFieldAtPoint = Module["_FPDFAnnot_GetFormFieldAtPoint"] = createExportWrapper("FPDFAnnot_GetFormFieldAtPoint");
var _FPDFAnnot_GetFormFieldName = Module["_FPDFAnnot_GetFormFieldName"] = createExportWrapper("FPDFAnnot_GetFormFieldName");
var _FPDFAnnot_GetFormFieldType = Module["_FPDFAnnot_GetFormFieldType"] = createExportWrapper("FPDFAnnot_GetFormFieldType");
var _FPDFAnnot_GetFormFieldValue = Module["_FPDFAnnot_GetFormFieldValue"] = createExportWrapper("FPDFAnnot_GetFormFieldValue");
var _FPDFAnnot_GetOptionCount = Module["_FPDFAnnot_GetOptionCount"] = createExportWrapper("FPDFAnnot_GetOptionCount");
var _FPDFAnnot_GetOptionLabel = Module["_FPDFAnnot_GetOptionLabel"] = createExportWrapper("FPDFAnnot_GetOptionLabel");
var _FPDFAnnot_IsOptionSelected = Module["_FPDFAnnot_IsOptionSelected"] = createExportWrapper("FPDFAnnot_IsOptionSelected");
var _FPDFAnnot_GetFontSize = Module["_FPDFAnnot_GetFontSize"] = createExportWrapper("FPDFAnnot_GetFontSize");
var _FPDFAnnot_IsChecked = Module["_FPDFAnnot_IsChecked"] = createExportWrapper("FPDFAnnot_IsChecked");
var _FPDFAnnot_SetFocusableSubtypes = Module["_FPDFAnnot_SetFocusableSubtypes"] = createExportWrapper("FPDFAnnot_SetFocusableSubtypes");
var _FPDFAnnot_GetFocusableSubtypesCount = Module["_FPDFAnnot_GetFocusableSubtypesCount"] = createExportWrapper("FPDFAnnot_GetFocusableSubtypesCount");
var _FPDFAnnot_GetFocusableSubtypes = Module["_FPDFAnnot_GetFocusableSubtypes"] = createExportWrapper("FPDFAnnot_GetFocusableSubtypes");
var _FPDFAnnot_GetLink = Module["_FPDFAnnot_GetLink"] = createExportWrapper("FPDFAnnot_GetLink");
var _FPDFAnnot_GetFormControlCount = Module["_FPDFAnnot_GetFormControlCount"] = createExportWrapper("FPDFAnnot_GetFormControlCount");
var _FPDFAnnot_GetFormControlIndex = Module["_FPDFAnnot_GetFormControlIndex"] = createExportWrapper("FPDFAnnot_GetFormControlIndex");
var _FPDFAnnot_GetFormFieldExportValue = Module["_FPDFAnnot_GetFormFieldExportValue"] = createExportWrapper("FPDFAnnot_GetFormFieldExportValue");
var _FPDFAnnot_SetURI = Module["_FPDFAnnot_SetURI"] = createExportWrapper("FPDFAnnot_SetURI");
var _FPDFDoc_GetAttachmentCount = Module["_FPDFDoc_GetAttachmentCount"] = createExportWrapper("FPDFDoc_GetAttachmentCount");
var _FPDFDoc_AddAttachment = Module["_FPDFDoc_AddAttachment"] = createExportWrapper("FPDFDoc_AddAttachment");
var _FPDFDoc_GetAttachment = Module["_FPDFDoc_GetAttachment"] = createExportWrapper("FPDFDoc_GetAttachment");
var _FPDFDoc_DeleteAttachment = Module["_FPDFDoc_DeleteAttachment"] = createExportWrapper("FPDFDoc_DeleteAttachment");
var _FPDFAttachment_GetName = Module["_FPDFAttachment_GetName"] = createExportWrapper("FPDFAttachment_GetName");
var _FPDFAttachment_HasKey = Module["_FPDFAttachment_HasKey"] = createExportWrapper("FPDFAttachment_HasKey");
var _FPDFAttachment_GetValueType = Module["_FPDFAttachment_GetValueType"] = createExportWrapper("FPDFAttachment_GetValueType");
var _FPDFAttachment_SetStringValue = Module["_FPDFAttachment_SetStringValue"] = createExportWrapper("FPDFAttachment_SetStringValue");
var _FPDFAttachment_GetStringValue = Module["_FPDFAttachment_GetStringValue"] = createExportWrapper("FPDFAttachment_GetStringValue");
var _FPDFAttachment_SetFile = Module["_FPDFAttachment_SetFile"] = createExportWrapper("FPDFAttachment_SetFile");
var _FPDFAttachment_GetFile = Module["_FPDFAttachment_GetFile"] = createExportWrapper("FPDFAttachment_GetFile");
var _FPDFCatalog_IsTagged = Module["_FPDFCatalog_IsTagged"] = createExportWrapper("FPDFCatalog_IsTagged");
var _FPDFAvail_Create = Module["_FPDFAvail_Create"] = createExportWrapper("FPDFAvail_Create");
var _FPDFAvail_Destroy = Module["_FPDFAvail_Destroy"] = createExportWrapper("FPDFAvail_Destroy");
var _FPDFAvail_IsDocAvail = Module["_FPDFAvail_IsDocAvail"] = createExportWrapper("FPDFAvail_IsDocAvail");
var _FPDFAvail_GetDocument = Module["_FPDFAvail_GetDocument"] = createExportWrapper("FPDFAvail_GetDocument");
var _FPDFAvail_GetFirstPageNum = Module["_FPDFAvail_GetFirstPageNum"] = createExportWrapper("FPDFAvail_GetFirstPageNum");
var _FPDFAvail_IsPageAvail = Module["_FPDFAvail_IsPageAvail"] = createExportWrapper("FPDFAvail_IsPageAvail");
var _FPDFAvail_IsFormAvail = Module["_FPDFAvail_IsFormAvail"] = createExportWrapper("FPDFAvail_IsFormAvail");
var _FPDFAvail_IsLinearized = Module["_FPDFAvail_IsLinearized"] = createExportWrapper("FPDFAvail_IsLinearized");
var _FPDFBookmark_GetFirstChild = Module["_FPDFBookmark_GetFirstChild"] = createExportWrapper("FPDFBookmark_GetFirstChild");
var _FPDFBookmark_GetNextSibling = Module["_FPDFBookmark_GetNextSibling"] = createExportWrapper("FPDFBookmark_GetNextSibling");
var _FPDFBookmark_GetTitle = Module["_FPDFBookmark_GetTitle"] = createExportWrapper("FPDFBookmark_GetTitle");
var _FPDFBookmark_Find = Module["_FPDFBookmark_Find"] = createExportWrapper("FPDFBookmark_Find");
var _FPDFBookmark_GetDest = Module["_FPDFBookmark_GetDest"] = createExportWrapper("FPDFBookmark_GetDest");
var _FPDFBookmark_GetAction = Module["_FPDFBookmark_GetAction"] = createExportWrapper("FPDFBookmark_GetAction");
var _FPDFAction_GetType = Module["_FPDFAction_GetType"] = createExportWrapper("FPDFAction_GetType");
var _FPDFAction_GetDest = Module["_FPDFAction_GetDest"] = createExportWrapper("FPDFAction_GetDest");
var _FPDFAction_GetFilePath = Module["_FPDFAction_GetFilePath"] = createExportWrapper("FPDFAction_GetFilePath");
var _FPDFAction_GetURIPath = Module["_FPDFAction_GetURIPath"] = createExportWrapper("FPDFAction_GetURIPath");
var _FPDFDest_GetDestPageIndex = Module["_FPDFDest_GetDestPageIndex"] = createExportWrapper("FPDFDest_GetDestPageIndex");
var _FPDFDest_GetView = Module["_FPDFDest_GetView"] = createExportWrapper("FPDFDest_GetView");
var _FPDFDest_GetLocationInPage = Module["_FPDFDest_GetLocationInPage"] = createExportWrapper("FPDFDest_GetLocationInPage");
var _FPDFLink_GetLinkAtPoint = Module["_FPDFLink_GetLinkAtPoint"] = createExportWrapper("FPDFLink_GetLinkAtPoint");
var _FPDFLink_GetLinkZOrderAtPoint = Module["_FPDFLink_GetLinkZOrderAtPoint"] = createExportWrapper("FPDFLink_GetLinkZOrderAtPoint");
var _FPDFLink_GetDest = Module["_FPDFLink_GetDest"] = createExportWrapper("FPDFLink_GetDest");
var _FPDFLink_GetAction = Module["_FPDFLink_GetAction"] = createExportWrapper("FPDFLink_GetAction");
var _FPDFLink_Enumerate = Module["_FPDFLink_Enumerate"] = createExportWrapper("FPDFLink_Enumerate");
var _FPDFLink_GetAnnot = Module["_FPDFLink_GetAnnot"] = createExportWrapper("FPDFLink_GetAnnot");
var _FPDFLink_GetAnnotRect = Module["_FPDFLink_GetAnnotRect"] = createExportWrapper("FPDFLink_GetAnnotRect");
var _FPDFLink_CountQuadPoints = Module["_FPDFLink_CountQuadPoints"] = createExportWrapper("FPDFLink_CountQuadPoints");
var _FPDFLink_GetQuadPoints = Module["_FPDFLink_GetQuadPoints"] = createExportWrapper("FPDFLink_GetQuadPoints");
var _FPDF_GetPageAAction = Module["_FPDF_GetPageAAction"] = createExportWrapper("FPDF_GetPageAAction");
var _FPDF_GetFileIdentifier = Module["_FPDF_GetFileIdentifier"] = createExportWrapper("FPDF_GetFileIdentifier");
var _FPDF_GetMetaText = Module["_FPDF_GetMetaText"] = createExportWrapper("FPDF_GetMetaText");
var _FPDF_GetPageLabel = Module["_FPDF_GetPageLabel"] = createExportWrapper("FPDF_GetPageLabel");
var _FPDFPageObj_NewImageObj = Module["_FPDFPageObj_NewImageObj"] = createExportWrapper("FPDFPageObj_NewImageObj");
var _FPDFImageObj_LoadJpegFile = Module["_FPDFImageObj_LoadJpegFile"] = createExportWrapper("FPDFImageObj_LoadJpegFile");
var _FPDFImageObj_LoadJpegFileInline = Module["_FPDFImageObj_LoadJpegFileInline"] = createExportWrapper("FPDFImageObj_LoadJpegFileInline");
var _FPDFImageObj_SetMatrix = Module["_FPDFImageObj_SetMatrix"] = createExportWrapper("FPDFImageObj_SetMatrix");
var _FPDFImageObj_SetBitmap = Module["_FPDFImageObj_SetBitmap"] = createExportWrapper("FPDFImageObj_SetBitmap");
var _FPDFImageObj_GetBitmap = Module["_FPDFImageObj_GetBitmap"] = createExportWrapper("FPDFImageObj_GetBitmap");
var _FPDFImageObj_GetRenderedBitmap = Module["_FPDFImageObj_GetRenderedBitmap"] = createExportWrapper("FPDFImageObj_GetRenderedBitmap");
var _FPDFImageObj_GetImageDataDecoded = Module["_FPDFImageObj_GetImageDataDecoded"] = createExportWrapper("FPDFImageObj_GetImageDataDecoded");
var _FPDFImageObj_GetImageDataRaw = Module["_FPDFImageObj_GetImageDataRaw"] = createExportWrapper("FPDFImageObj_GetImageDataRaw");
var _FPDFImageObj_GetImageFilterCount = Module["_FPDFImageObj_GetImageFilterCount"] = createExportWrapper("FPDFImageObj_GetImageFilterCount");
var _FPDFImageObj_GetImageFilter = Module["_FPDFImageObj_GetImageFilter"] = createExportWrapper("FPDFImageObj_GetImageFilter");
var _FPDFImageObj_GetImageMetadata = Module["_FPDFImageObj_GetImageMetadata"] = createExportWrapper("FPDFImageObj_GetImageMetadata");
var _FPDF_CreateNewDocument = Module["_FPDF_CreateNewDocument"] = createExportWrapper("FPDF_CreateNewDocument");
var _FPDFPage_Delete = Module["_FPDFPage_Delete"] = createExportWrapper("FPDFPage_Delete");
var _FPDFPage_New = Module["_FPDFPage_New"] = createExportWrapper("FPDFPage_New");
var _FPDFPage_GetRotation = Module["_FPDFPage_GetRotation"] = createExportWrapper("FPDFPage_GetRotation");
var _FPDFPage_InsertObject = Module["_FPDFPage_InsertObject"] = createExportWrapper("FPDFPage_InsertObject");
var _FPDFPage_RemoveObject = Module["_FPDFPage_RemoveObject"] = createExportWrapper("FPDFPage_RemoveObject");
var _FPDFPage_CountObjects = Module["_FPDFPage_CountObjects"] = createExportWrapper("FPDFPage_CountObjects");
var _FPDFPage_GetObject = Module["_FPDFPage_GetObject"] = createExportWrapper("FPDFPage_GetObject");
var _FPDFPage_HasTransparency = Module["_FPDFPage_HasTransparency"] = createExportWrapper("FPDFPage_HasTransparency");
var _FPDFPageObj_Destroy = Module["_FPDFPageObj_Destroy"] = createExportWrapper("FPDFPageObj_Destroy");
var _FPDFPageObj_CountMarks = Module["_FPDFPageObj_CountMarks"] = createExportWrapper("FPDFPageObj_CountMarks");
var _FPDFPageObj_GetMark = Module["_FPDFPageObj_GetMark"] = createExportWrapper("FPDFPageObj_GetMark");
var _FPDFPageObj_AddMark = Module["_FPDFPageObj_AddMark"] = createExportWrapper("FPDFPageObj_AddMark");
var _FPDFPageObj_RemoveMark = Module["_FPDFPageObj_RemoveMark"] = createExportWrapper("FPDFPageObj_RemoveMark");
var _FPDFPageObjMark_GetName = Module["_FPDFPageObjMark_GetName"] = createExportWrapper("FPDFPageObjMark_GetName");
var _FPDFPageObjMark_CountParams = Module["_FPDFPageObjMark_CountParams"] = createExportWrapper("FPDFPageObjMark_CountParams");
var _FPDFPageObjMark_GetParamKey = Module["_FPDFPageObjMark_GetParamKey"] = createExportWrapper("FPDFPageObjMark_GetParamKey");
var _FPDFPageObjMark_GetParamValueType = Module["_FPDFPageObjMark_GetParamValueType"] = createExportWrapper("FPDFPageObjMark_GetParamValueType");
var _FPDFPageObjMark_GetParamIntValue = Module["_FPDFPageObjMark_GetParamIntValue"] = createExportWrapper("FPDFPageObjMark_GetParamIntValue");
var _FPDFPageObjMark_GetParamStringValue = Module["_FPDFPageObjMark_GetParamStringValue"] = createExportWrapper("FPDFPageObjMark_GetParamStringValue");
var _FPDFPageObjMark_GetParamBlobValue = Module["_FPDFPageObjMark_GetParamBlobValue"] = createExportWrapper("FPDFPageObjMark_GetParamBlobValue");
var _FPDFPageObj_HasTransparency = Module["_FPDFPageObj_HasTransparency"] = createExportWrapper("FPDFPageObj_HasTransparency");
var _FPDFPageObjMark_SetIntParam = Module["_FPDFPageObjMark_SetIntParam"] = createExportWrapper("FPDFPageObjMark_SetIntParam");
var _FPDFPageObjMark_SetStringParam = Module["_FPDFPageObjMark_SetStringParam"] = createExportWrapper("FPDFPageObjMark_SetStringParam");
var _FPDFPageObjMark_SetBlobParam = Module["_FPDFPageObjMark_SetBlobParam"] = createExportWrapper("FPDFPageObjMark_SetBlobParam");
var _FPDFPageObjMark_RemoveParam = Module["_FPDFPageObjMark_RemoveParam"] = createExportWrapper("FPDFPageObjMark_RemoveParam");
var _FPDFPageObj_GetType = Module["_FPDFPageObj_GetType"] = createExportWrapper("FPDFPageObj_GetType");
var _FPDFPage_GenerateContent = Module["_FPDFPage_GenerateContent"] = createExportWrapper("FPDFPage_GenerateContent");
var _FPDFPageObj_Transform = Module["_FPDFPageObj_Transform"] = createExportWrapper("FPDFPageObj_Transform");
var _FPDFPageObj_GetMatrix = Module["_FPDFPageObj_GetMatrix"] = createExportWrapper("FPDFPageObj_GetMatrix");
var _FPDFPageObj_SetMatrix = Module["_FPDFPageObj_SetMatrix"] = createExportWrapper("FPDFPageObj_SetMatrix");
var _FPDFPageObj_SetBlendMode = Module["_FPDFPageObj_SetBlendMode"] = createExportWrapper("FPDFPageObj_SetBlendMode");
var _FPDFPage_TransformAnnots = Module["_FPDFPage_TransformAnnots"] = createExportWrapper("FPDFPage_TransformAnnots");
var _FPDFPage_SetRotation = Module["_FPDFPage_SetRotation"] = createExportWrapper("FPDFPage_SetRotation");
var _FPDFPageObj_SetFillColor = Module["_FPDFPageObj_SetFillColor"] = createExportWrapper("FPDFPageObj_SetFillColor");
var _FPDFPageObj_GetFillColor = Module["_FPDFPageObj_GetFillColor"] = createExportWrapper("FPDFPageObj_GetFillColor");
var _FPDFPageObj_GetBounds = Module["_FPDFPageObj_GetBounds"] = createExportWrapper("FPDFPageObj_GetBounds");
var _FPDFPageObj_SetStrokeColor = Module["_FPDFPageObj_SetStrokeColor"] = createExportWrapper("FPDFPageObj_SetStrokeColor");
var _FPDFPageObj_GetStrokeColor = Module["_FPDFPageObj_GetStrokeColor"] = createExportWrapper("FPDFPageObj_GetStrokeColor");
var _FPDFPageObj_SetStrokeWidth = Module["_FPDFPageObj_SetStrokeWidth"] = createExportWrapper("FPDFPageObj_SetStrokeWidth");
var _FPDFPageObj_GetStrokeWidth = Module["_FPDFPageObj_GetStrokeWidth"] = createExportWrapper("FPDFPageObj_GetStrokeWidth");
var _FPDFPageObj_GetLineJoin = Module["_FPDFPageObj_GetLineJoin"] = createExportWrapper("FPDFPageObj_GetLineJoin");
var _FPDFPageObj_SetLineJoin = Module["_FPDFPageObj_SetLineJoin"] = createExportWrapper("FPDFPageObj_SetLineJoin");
var _FPDFPageObj_GetLineCap = Module["_FPDFPageObj_GetLineCap"] = createExportWrapper("FPDFPageObj_GetLineCap");
var _FPDFPageObj_SetLineCap = Module["_FPDFPageObj_SetLineCap"] = createExportWrapper("FPDFPageObj_SetLineCap");
var _FPDFPageObj_GetDashPhase = Module["_FPDFPageObj_GetDashPhase"] = createExportWrapper("FPDFPageObj_GetDashPhase");
var _FPDFPageObj_SetDashPhase = Module["_FPDFPageObj_SetDashPhase"] = createExportWrapper("FPDFPageObj_SetDashPhase");
var _FPDFPageObj_GetDashCount = Module["_FPDFPageObj_GetDashCount"] = createExportWrapper("FPDFPageObj_GetDashCount");
var _FPDFPageObj_GetDashArray = Module["_FPDFPageObj_GetDashArray"] = createExportWrapper("FPDFPageObj_GetDashArray");
var _FPDFPageObj_SetDashArray = Module["_FPDFPageObj_SetDashArray"] = createExportWrapper("FPDFPageObj_SetDashArray");
var _FPDFFormObj_CountObjects = Module["_FPDFFormObj_CountObjects"] = createExportWrapper("FPDFFormObj_CountObjects");
var _FPDFFormObj_GetObject = Module["_FPDFFormObj_GetObject"] = createExportWrapper("FPDFFormObj_GetObject");
var _FPDFPageObj_CreateNewPath = Module["_FPDFPageObj_CreateNewPath"] = createExportWrapper("FPDFPageObj_CreateNewPath");
var _FPDFPageObj_CreateNewRect = Module["_FPDFPageObj_CreateNewRect"] = createExportWrapper("FPDFPageObj_CreateNewRect");
var _FPDFPath_CountSegments = Module["_FPDFPath_CountSegments"] = createExportWrapper("FPDFPath_CountSegments");
var _FPDFPath_GetPathSegment = Module["_FPDFPath_GetPathSegment"] = createExportWrapper("FPDFPath_GetPathSegment");
var _FPDFPath_MoveTo = Module["_FPDFPath_MoveTo"] = createExportWrapper("FPDFPath_MoveTo");
var _FPDFPath_LineTo = Module["_FPDFPath_LineTo"] = createExportWrapper("FPDFPath_LineTo");
var _FPDFPath_BezierTo = Module["_FPDFPath_BezierTo"] = createExportWrapper("FPDFPath_BezierTo");
var _FPDFPath_Close = Module["_FPDFPath_Close"] = createExportWrapper("FPDFPath_Close");
var _FPDFPath_SetDrawMode = Module["_FPDFPath_SetDrawMode"] = createExportWrapper("FPDFPath_SetDrawMode");
var _FPDFPath_GetDrawMode = Module["_FPDFPath_GetDrawMode"] = createExportWrapper("FPDFPath_GetDrawMode");
var _FPDFPathSegment_GetPoint = Module["_FPDFPathSegment_GetPoint"] = createExportWrapper("FPDFPathSegment_GetPoint");
var _FPDFPathSegment_GetType = Module["_FPDFPathSegment_GetType"] = createExportWrapper("FPDFPathSegment_GetType");
var _FPDFPathSegment_GetClose = Module["_FPDFPathSegment_GetClose"] = createExportWrapper("FPDFPathSegment_GetClose");
var _FPDFPageObj_NewTextObj = Module["_FPDFPageObj_NewTextObj"] = createExportWrapper("FPDFPageObj_NewTextObj");
var _FPDFText_SetText = Module["_FPDFText_SetText"] = createExportWrapper("FPDFText_SetText");
var _FPDFText_SetCharcodes = Module["_FPDFText_SetCharcodes"] = createExportWrapper("FPDFText_SetCharcodes");
var _FPDFText_LoadFont = Module["_FPDFText_LoadFont"] = createExportWrapper("FPDFText_LoadFont");
var _FPDFText_LoadStandardFont = Module["_FPDFText_LoadStandardFont"] = createExportWrapper("FPDFText_LoadStandardFont");
var _FPDFTextObj_GetFontSize = Module["_FPDFTextObj_GetFontSize"] = createExportWrapper("FPDFTextObj_GetFontSize");
var _FPDFTextObj_GetText = Module["_FPDFTextObj_GetText"] = createExportWrapper("FPDFTextObj_GetText");
var _FPDFFont_Close = Module["_FPDFFont_Close"] = createExportWrapper("FPDFFont_Close");
var _FPDFPageObj_CreateTextObj = Module["_FPDFPageObj_CreateTextObj"] = createExportWrapper("FPDFPageObj_CreateTextObj");
var _FPDFTextObj_GetTextRenderMode = Module["_FPDFTextObj_GetTextRenderMode"] = createExportWrapper("FPDFTextObj_GetTextRenderMode");
var _FPDFTextObj_SetTextRenderMode = Module["_FPDFTextObj_SetTextRenderMode"] = createExportWrapper("FPDFTextObj_SetTextRenderMode");
var _FPDFTextObj_GetFont = Module["_FPDFTextObj_GetFont"] = createExportWrapper("FPDFTextObj_GetFont");
var _FPDFFont_GetFontName = Module["_FPDFFont_GetFontName"] = createExportWrapper("FPDFFont_GetFontName");
var _FPDFFont_GetFlags = Module["_FPDFFont_GetFlags"] = createExportWrapper("FPDFFont_GetFlags");
var _FPDFFont_GetWeight = Module["_FPDFFont_GetWeight"] = createExportWrapper("FPDFFont_GetWeight");
var _FPDFFont_GetItalicAngle = Module["_FPDFFont_GetItalicAngle"] = createExportWrapper("FPDFFont_GetItalicAngle");
var _FPDFFont_GetAscent = Module["_FPDFFont_GetAscent"] = createExportWrapper("FPDFFont_GetAscent");
var _FPDFFont_GetDescent = Module["_FPDFFont_GetDescent"] = createExportWrapper("FPDFFont_GetDescent");
var _FPDFFont_GetGlyphWidth = Module["_FPDFFont_GetGlyphWidth"] = createExportWrapper("FPDFFont_GetGlyphWidth");
var _FPDFFont_GetGlyphPath = Module["_FPDFFont_GetGlyphPath"] = createExportWrapper("FPDFFont_GetGlyphPath");
var _FPDFGlyphPath_CountGlyphSegments = Module["_FPDFGlyphPath_CountGlyphSegments"] = createExportWrapper("FPDFGlyphPath_CountGlyphSegments");
var _FPDFGlyphPath_GetGlyphPathSegment = Module["_FPDFGlyphPath_GetGlyphPathSegment"] = createExportWrapper("FPDFGlyphPath_GetGlyphPathSegment");
var _FSDK_SetUnSpObjProcessHandler = Module["_FSDK_SetUnSpObjProcessHandler"] = createExportWrapper("FSDK_SetUnSpObjProcessHandler");
var _FSDK_SetTimeFunction = Module["_FSDK_SetTimeFunction"] = createExportWrapper("FSDK_SetTimeFunction");
var _FSDK_SetLocaltimeFunction = Module["_FSDK_SetLocaltimeFunction"] = createExportWrapper("FSDK_SetLocaltimeFunction");
var _FPDFDoc_GetPageMode = Module["_FPDFDoc_GetPageMode"] = createExportWrapper("FPDFDoc_GetPageMode");
var _FPDFPage_Flatten = Module["_FPDFPage_Flatten"] = createExportWrapper("FPDFPage_Flatten");
var _FPDFPage_HasFormFieldAtPoint = Module["_FPDFPage_HasFormFieldAtPoint"] = createExportWrapper("FPDFPage_HasFormFieldAtPoint");
var _FPDFPage_FormFieldZOrderAtPoint = Module["_FPDFPage_FormFieldZOrderAtPoint"] = createExportWrapper("FPDFPage_FormFieldZOrderAtPoint");
var _FPDFDOC_InitFormFillEnvironment = Module["_FPDFDOC_InitFormFillEnvironment"] = createExportWrapper("FPDFDOC_InitFormFillEnvironment");
var _FPDFDOC_ExitFormFillEnvironment = Module["_FPDFDOC_ExitFormFillEnvironment"] = createExportWrapper("FPDFDOC_ExitFormFillEnvironment");
var _FORM_OnMouseMove = Module["_FORM_OnMouseMove"] = createExportWrapper("FORM_OnMouseMove");
var _FORM_OnMouseWheel = Module["_FORM_OnMouseWheel"] = createExportWrapper("FORM_OnMouseWheel");
var _FORM_OnFocus = Module["_FORM_OnFocus"] = createExportWrapper("FORM_OnFocus");
var _FORM_OnLButtonDown = Module["_FORM_OnLButtonDown"] = createExportWrapper("FORM_OnLButtonDown");
var _FORM_OnLButtonUp = Module["_FORM_OnLButtonUp"] = createExportWrapper("FORM_OnLButtonUp");
var _FORM_OnLButtonDoubleClick = Module["_FORM_OnLButtonDoubleClick"] = createExportWrapper("FORM_OnLButtonDoubleClick");
var _FORM_OnRButtonDown = Module["_FORM_OnRButtonDown"] = createExportWrapper("FORM_OnRButtonDown");
var _FORM_OnRButtonUp = Module["_FORM_OnRButtonUp"] = createExportWrapper("FORM_OnRButtonUp");
var _FORM_OnKeyDown = Module["_FORM_OnKeyDown"] = createExportWrapper("FORM_OnKeyDown");
var _FORM_OnKeyUp = Module["_FORM_OnKeyUp"] = createExportWrapper("FORM_OnKeyUp");
var _FORM_OnChar = Module["_FORM_OnChar"] = createExportWrapper("FORM_OnChar");
var _FORM_GetFocusedText = Module["_FORM_GetFocusedText"] = createExportWrapper("FORM_GetFocusedText");
var _FORM_GetSelectedText = Module["_FORM_GetSelectedText"] = createExportWrapper("FORM_GetSelectedText");
var _FORM_ReplaceSelection = Module["_FORM_ReplaceSelection"] = createExportWrapper("FORM_ReplaceSelection");
var _FORM_SelectAllText = Module["_FORM_SelectAllText"] = createExportWrapper("FORM_SelectAllText");
var _FORM_CanUndo = Module["_FORM_CanUndo"] = createExportWrapper("FORM_CanUndo");
var _FORM_CanRedo = Module["_FORM_CanRedo"] = createExportWrapper("FORM_CanRedo");
var _FORM_Undo = Module["_FORM_Undo"] = createExportWrapper("FORM_Undo");
var _FORM_Redo = Module["_FORM_Redo"] = createExportWrapper("FORM_Redo");
var _FORM_ForceToKillFocus = Module["_FORM_ForceToKillFocus"] = createExportWrapper("FORM_ForceToKillFocus");
var _FORM_GetFocusedAnnot = Module["_FORM_GetFocusedAnnot"] = createExportWrapper("FORM_GetFocusedAnnot");
var _FORM_SetFocusedAnnot = Module["_FORM_SetFocusedAnnot"] = createExportWrapper("FORM_SetFocusedAnnot");
var _FPDF_FFLDraw = Module["_FPDF_FFLDraw"] = createExportWrapper("FPDF_FFLDraw");
var _FPDF_SetFormFieldHighlightColor = Module["_FPDF_SetFormFieldHighlightColor"] = createExportWrapper("FPDF_SetFormFieldHighlightColor");
var _FPDF_SetFormFieldHighlightAlpha = Module["_FPDF_SetFormFieldHighlightAlpha"] = createExportWrapper("FPDF_SetFormFieldHighlightAlpha");
var _FPDF_RemoveFormFieldHighlight = Module["_FPDF_RemoveFormFieldHighlight"] = createExportWrapper("FPDF_RemoveFormFieldHighlight");
var _FORM_OnAfterLoadPage = Module["_FORM_OnAfterLoadPage"] = createExportWrapper("FORM_OnAfterLoadPage");
var _FORM_OnBeforeClosePage = Module["_FORM_OnBeforeClosePage"] = createExportWrapper("FORM_OnBeforeClosePage");
var _FORM_DoDocumentJSAction = Module["_FORM_DoDocumentJSAction"] = createExportWrapper("FORM_DoDocumentJSAction");
var _FORM_DoDocumentOpenAction = Module["_FORM_DoDocumentOpenAction"] = createExportWrapper("FORM_DoDocumentOpenAction");
var _FORM_DoDocumentAAction = Module["_FORM_DoDocumentAAction"] = createExportWrapper("FORM_DoDocumentAAction");
var _FORM_DoPageAAction = Module["_FORM_DoPageAAction"] = createExportWrapper("FORM_DoPageAAction");
var _FORM_SetIndexSelected = Module["_FORM_SetIndexSelected"] = createExportWrapper("FORM_SetIndexSelected");
var _FORM_IsIndexSelected = Module["_FORM_IsIndexSelected"] = createExportWrapper("FORM_IsIndexSelected");
var _FPDFDoc_GetJavaScriptActionCount = Module["_FPDFDoc_GetJavaScriptActionCount"] = createExportWrapper("FPDFDoc_GetJavaScriptActionCount");
var _FPDFDoc_GetJavaScriptAction = Module["_FPDFDoc_GetJavaScriptAction"] = createExportWrapper("FPDFDoc_GetJavaScriptAction");
var _FPDFDoc_CloseJavaScriptAction = Module["_FPDFDoc_CloseJavaScriptAction"] = createExportWrapper("FPDFDoc_CloseJavaScriptAction");
var _FPDFJavaScriptAction_GetName = Module["_FPDFJavaScriptAction_GetName"] = createExportWrapper("FPDFJavaScriptAction_GetName");
var _FPDFJavaScriptAction_GetScript = Module["_FPDFJavaScriptAction_GetScript"] = createExportWrapper("FPDFJavaScriptAction_GetScript");
var _FPDF_ImportPagesByIndex = Module["_FPDF_ImportPagesByIndex"] = createExportWrapper("FPDF_ImportPagesByIndex");
var _FPDF_ImportPages = Module["_FPDF_ImportPages"] = createExportWrapper("FPDF_ImportPages");
var _FPDF_ImportNPagesToOne = Module["_FPDF_ImportNPagesToOne"] = createExportWrapper("FPDF_ImportNPagesToOne");
var _FPDF_NewXObjectFromPage = Module["_FPDF_NewXObjectFromPage"] = createExportWrapper("FPDF_NewXObjectFromPage");
var _FPDF_CloseXObject = Module["_FPDF_CloseXObject"] = createExportWrapper("FPDF_CloseXObject");
var _FPDF_NewFormObjectFromXObject = Module["_FPDF_NewFormObjectFromXObject"] = createExportWrapper("FPDF_NewFormObjectFromXObject");
var _FPDF_CopyViewerPreferences = Module["_FPDF_CopyViewerPreferences"] = createExportWrapper("FPDF_CopyViewerPreferences");
var _FPDF_RenderPageBitmapWithColorScheme_Start = Module["_FPDF_RenderPageBitmapWithColorScheme_Start"] = createExportWrapper("FPDF_RenderPageBitmapWithColorScheme_Start");
var _FPDF_RenderPageBitmap_Start = Module["_FPDF_RenderPageBitmap_Start"] = createExportWrapper("FPDF_RenderPageBitmap_Start");
var _FPDF_RenderPage_Continue = Module["_FPDF_RenderPage_Continue"] = createExportWrapper("FPDF_RenderPage_Continue");
var _FPDF_RenderPage_Close = Module["_FPDF_RenderPage_Close"] = createExportWrapper("FPDF_RenderPage_Close");
var _FPDF_SaveAsCopy = Module["_FPDF_SaveAsCopy"] = createExportWrapper("FPDF_SaveAsCopy");
var _FPDF_SaveWithVersion = Module["_FPDF_SaveWithVersion"] = createExportWrapper("FPDF_SaveWithVersion");
var _FPDFText_GetCharIndexFromTextIndex = Module["_FPDFText_GetCharIndexFromTextIndex"] = createExportWrapper("FPDFText_GetCharIndexFromTextIndex");
var _FPDFText_GetTextIndexFromCharIndex = Module["_FPDFText_GetTextIndexFromCharIndex"] = createExportWrapper("FPDFText_GetTextIndexFromCharIndex");
var _FPDF_GetSignatureCount = Module["_FPDF_GetSignatureCount"] = createExportWrapper("FPDF_GetSignatureCount");
var _FPDF_GetSignatureObject = Module["_FPDF_GetSignatureObject"] = createExportWrapper("FPDF_GetSignatureObject");
var _FPDFSignatureObj_GetContents = Module["_FPDFSignatureObj_GetContents"] = createExportWrapper("FPDFSignatureObj_GetContents");
var _FPDFSignatureObj_GetByteRange = Module["_FPDFSignatureObj_GetByteRange"] = createExportWrapper("FPDFSignatureObj_GetByteRange");
var _FPDFSignatureObj_GetSubFilter = Module["_FPDFSignatureObj_GetSubFilter"] = createExportWrapper("FPDFSignatureObj_GetSubFilter");
var _FPDFSignatureObj_GetReason = Module["_FPDFSignatureObj_GetReason"] = createExportWrapper("FPDFSignatureObj_GetReason");
var _FPDFSignatureObj_GetTime = Module["_FPDFSignatureObj_GetTime"] = createExportWrapper("FPDFSignatureObj_GetTime");
var _FPDFSignatureObj_GetDocMDPPermission = Module["_FPDFSignatureObj_GetDocMDPPermission"] = createExportWrapper("FPDFSignatureObj_GetDocMDPPermission");
var _FPDF_StructTree_GetForPage = Module["_FPDF_StructTree_GetForPage"] = createExportWrapper("FPDF_StructTree_GetForPage");
var _FPDF_StructTree_Close = Module["_FPDF_StructTree_Close"] = createExportWrapper("FPDF_StructTree_Close");
var _FPDF_StructTree_CountChildren = Module["_FPDF_StructTree_CountChildren"] = createExportWrapper("FPDF_StructTree_CountChildren");
var _FPDF_StructTree_GetChildAtIndex = Module["_FPDF_StructTree_GetChildAtIndex"] = createExportWrapper("FPDF_StructTree_GetChildAtIndex");
var _FPDF_StructElement_GetAltText = Module["_FPDF_StructElement_GetAltText"] = createExportWrapper("FPDF_StructElement_GetAltText");
var _FPDF_StructElement_GetActualText = Module["_FPDF_StructElement_GetActualText"] = createExportWrapper("FPDF_StructElement_GetActualText");
var _FPDF_StructElement_GetID = Module["_FPDF_StructElement_GetID"] = createExportWrapper("FPDF_StructElement_GetID");
var _FPDF_StructElement_GetLang = Module["_FPDF_StructElement_GetLang"] = createExportWrapper("FPDF_StructElement_GetLang");
var _FPDF_StructElement_GetAttributeCount = Module["_FPDF_StructElement_GetAttributeCount"] = createExportWrapper("FPDF_StructElement_GetAttributeCount");
var _FPDF_StructElement_GetAttributeAtIndex = Module["_FPDF_StructElement_GetAttributeAtIndex"] = createExportWrapper("FPDF_StructElement_GetAttributeAtIndex");
var _FPDF_StructElement_GetStringAttribute = Module["_FPDF_StructElement_GetStringAttribute"] = createExportWrapper("FPDF_StructElement_GetStringAttribute");
var _FPDF_StructElement_GetMarkedContentID = Module["_FPDF_StructElement_GetMarkedContentID"] = createExportWrapper("FPDF_StructElement_GetMarkedContentID");
var _FPDF_StructElement_GetType = Module["_FPDF_StructElement_GetType"] = createExportWrapper("FPDF_StructElement_GetType");
var _FPDF_StructElement_GetObjType = Module["_FPDF_StructElement_GetObjType"] = createExportWrapper("FPDF_StructElement_GetObjType");
var _FPDF_StructElement_GetTitle = Module["_FPDF_StructElement_GetTitle"] = createExportWrapper("FPDF_StructElement_GetTitle");
var _FPDF_StructElement_CountChildren = Module["_FPDF_StructElement_CountChildren"] = createExportWrapper("FPDF_StructElement_CountChildren");
var _FPDF_StructElement_GetChildAtIndex = Module["_FPDF_StructElement_GetChildAtIndex"] = createExportWrapper("FPDF_StructElement_GetChildAtIndex");
var _FPDF_StructElement_GetParent = Module["_FPDF_StructElement_GetParent"] = createExportWrapper("FPDF_StructElement_GetParent");
var _FPDF_StructElement_Attr_GetCount = Module["_FPDF_StructElement_Attr_GetCount"] = createExportWrapper("FPDF_StructElement_Attr_GetCount");
var _FPDF_StructElement_Attr_GetName = Module["_FPDF_StructElement_Attr_GetName"] = createExportWrapper("FPDF_StructElement_Attr_GetName");
var _FPDF_StructElement_Attr_GetType = Module["_FPDF_StructElement_Attr_GetType"] = createExportWrapper("FPDF_StructElement_Attr_GetType");
var _FPDF_StructElement_Attr_GetBooleanValue = Module["_FPDF_StructElement_Attr_GetBooleanValue"] = createExportWrapper("FPDF_StructElement_Attr_GetBooleanValue");
var _FPDF_StructElement_Attr_GetNumberValue = Module["_FPDF_StructElement_Attr_GetNumberValue"] = createExportWrapper("FPDF_StructElement_Attr_GetNumberValue");
var _FPDF_StructElement_Attr_GetStringValue = Module["_FPDF_StructElement_Attr_GetStringValue"] = createExportWrapper("FPDF_StructElement_Attr_GetStringValue");
var _FPDF_StructElement_Attr_GetBlobValue = Module["_FPDF_StructElement_Attr_GetBlobValue"] = createExportWrapper("FPDF_StructElement_Attr_GetBlobValue");
var _FPDF_StructElement_GetMarkedContentIdCount = Module["_FPDF_StructElement_GetMarkedContentIdCount"] = createExportWrapper("FPDF_StructElement_GetMarkedContentIdCount");
var _FPDF_StructElement_GetMarkedContentIdAtIndex = Module["_FPDF_StructElement_GetMarkedContentIdAtIndex"] = createExportWrapper("FPDF_StructElement_GetMarkedContentIdAtIndex");
var _FPDF_AddInstalledFont = Module["_FPDF_AddInstalledFont"] = createExportWrapper("FPDF_AddInstalledFont");
var _FPDF_SetSystemFontInfo = Module["_FPDF_SetSystemFontInfo"] = createExportWrapper("FPDF_SetSystemFontInfo");
var _FPDF_GetDefaultTTFMap = Module["_FPDF_GetDefaultTTFMap"] = createExportWrapper("FPDF_GetDefaultTTFMap");
var _FPDF_GetDefaultSystemFontInfo = Module["_FPDF_GetDefaultSystemFontInfo"] = createExportWrapper("FPDF_GetDefaultSystemFontInfo");
var _FPDF_FreeDefaultSystemFontInfo = Module["_FPDF_FreeDefaultSystemFontInfo"] = createExportWrapper("FPDF_FreeDefaultSystemFontInfo");
var _FPDFText_LoadPage = Module["_FPDFText_LoadPage"] = createExportWrapper("FPDFText_LoadPage");
var _FPDFText_ClosePage = Module["_FPDFText_ClosePage"] = createExportWrapper("FPDFText_ClosePage");
var _FPDFText_CountChars = Module["_FPDFText_CountChars"] = createExportWrapper("FPDFText_CountChars");
var _FPDFText_GetUnicode = Module["_FPDFText_GetUnicode"] = createExportWrapper("FPDFText_GetUnicode");
var _FPDFText_GetFontSize = Module["_FPDFText_GetFontSize"] = createExportWrapper("FPDFText_GetFontSize");
var _FPDFText_GetFontInfo = Module["_FPDFText_GetFontInfo"] = createExportWrapper("FPDFText_GetFontInfo");
var _FPDFText_GetFontWeight = Module["_FPDFText_GetFontWeight"] = createExportWrapper("FPDFText_GetFontWeight");
var _FPDFText_GetTextRenderMode = Module["_FPDFText_GetTextRenderMode"] = createExportWrapper("FPDFText_GetTextRenderMode");
var _FPDFText_GetFillColor = Module["_FPDFText_GetFillColor"] = createExportWrapper("FPDFText_GetFillColor");
var _FPDFText_GetStrokeColor = Module["_FPDFText_GetStrokeColor"] = createExportWrapper("FPDFText_GetStrokeColor");
var _FPDFText_GetCharAngle = Module["_FPDFText_GetCharAngle"] = createExportWrapper("FPDFText_GetCharAngle");
var _FPDFText_GetCharBox = Module["_FPDFText_GetCharBox"] = createExportWrapper("FPDFText_GetCharBox");
var _FPDFText_GetLooseCharBox = Module["_FPDFText_GetLooseCharBox"] = createExportWrapper("FPDFText_GetLooseCharBox");
var _FPDFText_GetMatrix = Module["_FPDFText_GetMatrix"] = createExportWrapper("FPDFText_GetMatrix");
var _FPDFText_GetCharOrigin = Module["_FPDFText_GetCharOrigin"] = createExportWrapper("FPDFText_GetCharOrigin");
var _FPDFText_GetCharIndexAtPos = Module["_FPDFText_GetCharIndexAtPos"] = createExportWrapper("FPDFText_GetCharIndexAtPos");
var _FPDFText_GetText = Module["_FPDFText_GetText"] = createExportWrapper("FPDFText_GetText");
var _FPDFText_CountRects = Module["_FPDFText_CountRects"] = createExportWrapper("FPDFText_CountRects");
var _FPDFText_GetRect = Module["_FPDFText_GetRect"] = createExportWrapper("FPDFText_GetRect");
var _FPDFText_GetBoundedText = Module["_FPDFText_GetBoundedText"] = createExportWrapper("FPDFText_GetBoundedText");
var _FPDFText_FindStart = Module["_FPDFText_FindStart"] = createExportWrapper("FPDFText_FindStart");
var _FPDFText_FindNext = Module["_FPDFText_FindNext"] = createExportWrapper("FPDFText_FindNext");
var _FPDFText_FindPrev = Module["_FPDFText_FindPrev"] = createExportWrapper("FPDFText_FindPrev");
var _FPDFText_GetSchResultIndex = Module["_FPDFText_GetSchResultIndex"] = createExportWrapper("FPDFText_GetSchResultIndex");
var _FPDFText_GetSchCount = Module["_FPDFText_GetSchCount"] = createExportWrapper("FPDFText_GetSchCount");
var _FPDFText_FindClose = Module["_FPDFText_FindClose"] = createExportWrapper("FPDFText_FindClose");
var _FPDFLink_LoadWebLinks = Module["_FPDFLink_LoadWebLinks"] = createExportWrapper("FPDFLink_LoadWebLinks");
var _FPDFLink_CountWebLinks = Module["_FPDFLink_CountWebLinks"] = createExportWrapper("FPDFLink_CountWebLinks");
var _FPDFLink_GetURL = Module["_FPDFLink_GetURL"] = createExportWrapper("FPDFLink_GetURL");
var _FPDFLink_CountRects = Module["_FPDFLink_CountRects"] = createExportWrapper("FPDFLink_CountRects");
var _FPDFLink_GetRect = Module["_FPDFLink_GetRect"] = createExportWrapper("FPDFLink_GetRect");
var _FPDFLink_GetTextRange = Module["_FPDFLink_GetTextRange"] = createExportWrapper("FPDFLink_GetTextRange");
var _FPDFLink_CloseWebLinks = Module["_FPDFLink_CloseWebLinks"] = createExportWrapper("FPDFLink_CloseWebLinks");
var _FPDFPage_GetDecodedThumbnailData = Module["_FPDFPage_GetDecodedThumbnailData"] = createExportWrapper("FPDFPage_GetDecodedThumbnailData");
var _FPDFPage_GetRawThumbnailData = Module["_FPDFPage_GetRawThumbnailData"] = createExportWrapper("FPDFPage_GetRawThumbnailData");
var _FPDFPage_GetThumbnailAsBitmap = Module["_FPDFPage_GetThumbnailAsBitmap"] = createExportWrapper("FPDFPage_GetThumbnailAsBitmap");
var _FPDFPage_SetMediaBox = Module["_FPDFPage_SetMediaBox"] = createExportWrapper("FPDFPage_SetMediaBox");
var _FPDFPage_SetCropBox = Module["_FPDFPage_SetCropBox"] = createExportWrapper("FPDFPage_SetCropBox");
var _FPDFPage_SetBleedBox = Module["_FPDFPage_SetBleedBox"] = createExportWrapper("FPDFPage_SetBleedBox");
var _FPDFPage_SetTrimBox = Module["_FPDFPage_SetTrimBox"] = createExportWrapper("FPDFPage_SetTrimBox");
var _FPDFPage_SetArtBox = Module["_FPDFPage_SetArtBox"] = createExportWrapper("FPDFPage_SetArtBox");
var _FPDFPage_GetMediaBox = Module["_FPDFPage_GetMediaBox"] = createExportWrapper("FPDFPage_GetMediaBox");
var _FPDFPage_GetCropBox = Module["_FPDFPage_GetCropBox"] = createExportWrapper("FPDFPage_GetCropBox");
var _FPDFPage_GetBleedBox = Module["_FPDFPage_GetBleedBox"] = createExportWrapper("FPDFPage_GetBleedBox");
var _FPDFPage_GetTrimBox = Module["_FPDFPage_GetTrimBox"] = createExportWrapper("FPDFPage_GetTrimBox");
var _FPDFPage_GetArtBox = Module["_FPDFPage_GetArtBox"] = createExportWrapper("FPDFPage_GetArtBox");
var _FPDFPage_TransFormWithClip = Module["_FPDFPage_TransFormWithClip"] = createExportWrapper("FPDFPage_TransFormWithClip");
var _FPDFPageObj_TransformClipPath = Module["_FPDFPageObj_TransformClipPath"] = createExportWrapper("FPDFPageObj_TransformClipPath");
var _FPDFPageObj_GetClipPath = Module["_FPDFPageObj_GetClipPath"] = createExportWrapper("FPDFPageObj_GetClipPath");
var _FPDFClipPath_CountPaths = Module["_FPDFClipPath_CountPaths"] = createExportWrapper("FPDFClipPath_CountPaths");
var _FPDFClipPath_CountPathSegments = Module["_FPDFClipPath_CountPathSegments"] = createExportWrapper("FPDFClipPath_CountPathSegments");
var _FPDFClipPath_GetPathSegment = Module["_FPDFClipPath_GetPathSegment"] = createExportWrapper("FPDFClipPath_GetPathSegment");
var _FPDF_CreateClipPath = Module["_FPDF_CreateClipPath"] = createExportWrapper("FPDF_CreateClipPath");
var _FPDF_DestroyClipPath = Module["_FPDF_DestroyClipPath"] = createExportWrapper("FPDF_DestroyClipPath");
var _FPDFPage_InsertClipPath = Module["_FPDFPage_InsertClipPath"] = createExportWrapper("FPDFPage_InsertClipPath");
var _FPDF_InitLibrary = Module["_FPDF_InitLibrary"] = createExportWrapper("FPDF_InitLibrary");
var _memset = Module["_memset"] = createExportWrapper("memset");
var _malloc = Module["_malloc"] = createExportWrapper("malloc");
var _saveSetjmp = Module["_saveSetjmp"] = createExportWrapper("saveSetjmp");
var _free = Module["_free"] = createExportWrapper("free");
var _FPDF_DestroyLibrary = Module["_FPDF_DestroyLibrary"] = createExportWrapper("FPDF_DestroyLibrary");
var _FPDF_SetSandBoxPolicy = Module["_FPDF_SetSandBoxPolicy"] = createExportWrapper("FPDF_SetSandBoxPolicy");
var _FPDF_LoadDocument = Module["_FPDF_LoadDocument"] = createExportWrapper("FPDF_LoadDocument");
var _FPDF_GetFormType = Module["_FPDF_GetFormType"] = createExportWrapper("FPDF_GetFormType");
var _FPDF_LoadXFA = Module["_FPDF_LoadXFA"] = createExportWrapper("FPDF_LoadXFA");
var _FPDF_LoadMemDocument = Module["_FPDF_LoadMemDocument"] = createExportWrapper("FPDF_LoadMemDocument");
var _FPDF_LoadMemDocument64 = Module["_FPDF_LoadMemDocument64"] = createExportWrapper("FPDF_LoadMemDocument64");
var _FPDF_LoadCustomDocument = Module["_FPDF_LoadCustomDocument"] = createExportWrapper("FPDF_LoadCustomDocument");
var _FPDF_GetFileVersion = Module["_FPDF_GetFileVersion"] = createExportWrapper("FPDF_GetFileVersion");
var _FPDF_DocumentHasValidCrossReferenceTable = Module["_FPDF_DocumentHasValidCrossReferenceTable"] = createExportWrapper("FPDF_DocumentHasValidCrossReferenceTable");
var _FPDF_GetDocPermissions = Module["_FPDF_GetDocPermissions"] = createExportWrapper("FPDF_GetDocPermissions");
var _FPDF_GetSecurityHandlerRevision = Module["_FPDF_GetSecurityHandlerRevision"] = createExportWrapper("FPDF_GetSecurityHandlerRevision");
var _FPDF_GetPageCount = Module["_FPDF_GetPageCount"] = createExportWrapper("FPDF_GetPageCount");
var _FPDF_LoadPage = Module["_FPDF_LoadPage"] = createExportWrapper("FPDF_LoadPage");
var _FPDF_GetPageWidthF = Module["_FPDF_GetPageWidthF"] = createExportWrapper("FPDF_GetPageWidthF");
var _FPDF_GetPageWidth = Module["_FPDF_GetPageWidth"] = createExportWrapper("FPDF_GetPageWidth");
var _FPDF_GetPageHeightF = Module["_FPDF_GetPageHeightF"] = createExportWrapper("FPDF_GetPageHeightF");
var _FPDF_GetPageHeight = Module["_FPDF_GetPageHeight"] = createExportWrapper("FPDF_GetPageHeight");
var _FPDF_GetPageBoundingBox = Module["_FPDF_GetPageBoundingBox"] = createExportWrapper("FPDF_GetPageBoundingBox");
var _FPDF_RenderPageBitmap = Module["_FPDF_RenderPageBitmap"] = createExportWrapper("FPDF_RenderPageBitmap");
var _FPDF_RenderPageBitmapWithMatrix = Module["_FPDF_RenderPageBitmapWithMatrix"] = createExportWrapper("FPDF_RenderPageBitmapWithMatrix");
var _FPDF_ClosePage = Module["_FPDF_ClosePage"] = createExportWrapper("FPDF_ClosePage");
var _FPDF_CloseDocument = Module["_FPDF_CloseDocument"] = createExportWrapper("FPDF_CloseDocument");
var _FPDF_GetLastError = Module["_FPDF_GetLastError"] = createExportWrapper("FPDF_GetLastError");
var _FPDF_DeviceToPage = Module["_FPDF_DeviceToPage"] = createExportWrapper("FPDF_DeviceToPage");
var _FPDF_PageToDevice = Module["_FPDF_PageToDevice"] = createExportWrapper("FPDF_PageToDevice");
var _FPDFBitmap_Create = Module["_FPDFBitmap_Create"] = createExportWrapper("FPDFBitmap_Create");
var _FPDFBitmap_CreateEx = Module["_FPDFBitmap_CreateEx"] = createExportWrapper("FPDFBitmap_CreateEx");
var _FPDFBitmap_GetFormat = Module["_FPDFBitmap_GetFormat"] = createExportWrapper("FPDFBitmap_GetFormat");
var _FPDFBitmap_FillRect = Module["_FPDFBitmap_FillRect"] = createExportWrapper("FPDFBitmap_FillRect");
var _FPDFBitmap_GetBuffer = Module["_FPDFBitmap_GetBuffer"] = createExportWrapper("FPDFBitmap_GetBuffer");
var _FPDFBitmap_GetWidth = Module["_FPDFBitmap_GetWidth"] = createExportWrapper("FPDFBitmap_GetWidth");
var _FPDFBitmap_GetHeight = Module["_FPDFBitmap_GetHeight"] = createExportWrapper("FPDFBitmap_GetHeight");
var _FPDFBitmap_GetStride = Module["_FPDFBitmap_GetStride"] = createExportWrapper("FPDFBitmap_GetStride");
var _FPDFBitmap_Destroy = Module["_FPDFBitmap_Destroy"] = createExportWrapper("FPDFBitmap_Destroy");
var _FPDF_GetPageSizeByIndexF = Module["_FPDF_GetPageSizeByIndexF"] = createExportWrapper("FPDF_GetPageSizeByIndexF");
var _FPDF_GetPageSizeByIndex = Module["_FPDF_GetPageSizeByIndex"] = createExportWrapper("FPDF_GetPageSizeByIndex");
var _FPDF_VIEWERREF_GetPrintScaling = Module["_FPDF_VIEWERREF_GetPrintScaling"] = createExportWrapper("FPDF_VIEWERREF_GetPrintScaling");
var _FPDF_VIEWERREF_GetNumCopies = Module["_FPDF_VIEWERREF_GetNumCopies"] = createExportWrapper("FPDF_VIEWERREF_GetNumCopies");
var _FPDF_VIEWERREF_GetPrintPageRange = Module["_FPDF_VIEWERREF_GetPrintPageRange"] = createExportWrapper("FPDF_VIEWERREF_GetPrintPageRange");
var _FPDF_VIEWERREF_GetPrintPageRangeCount = Module["_FPDF_VIEWERREF_GetPrintPageRangeCount"] = createExportWrapper("FPDF_VIEWERREF_GetPrintPageRangeCount");
var _FPDF_VIEWERREF_GetPrintPageRangeElement = Module["_FPDF_VIEWERREF_GetPrintPageRangeElement"] = createExportWrapper("FPDF_VIEWERREF_GetPrintPageRangeElement");
var _FPDF_VIEWERREF_GetDuplex = Module["_FPDF_VIEWERREF_GetDuplex"] = createExportWrapper("FPDF_VIEWERREF_GetDuplex");
var _FPDF_VIEWERREF_GetName = Module["_FPDF_VIEWERREF_GetName"] = createExportWrapper("FPDF_VIEWERREF_GetName");
var _FPDF_CountNamedDests = Module["_FPDF_CountNamedDests"] = createExportWrapper("FPDF_CountNamedDests");
var _FPDF_GetNamedDestByName = Module["_FPDF_GetNamedDestByName"] = createExportWrapper("FPDF_GetNamedDestByName");
var _FPDF_GetNamedDest = Module["_FPDF_GetNamedDest"] = createExportWrapper("FPDF_GetNamedDest");
var _FPDF_GetXFAPacketCount = Module["_FPDF_GetXFAPacketCount"] = createExportWrapper("FPDF_GetXFAPacketCount");
var _FPDF_GetXFAPacketName = Module["_FPDF_GetXFAPacketName"] = createExportWrapper("FPDF_GetXFAPacketName");
var _FPDF_GetXFAPacketContent = Module["_FPDF_GetXFAPacketContent"] = createExportWrapper("FPDF_GetXFAPacketContent");
var _FPDF_GetTrailerEnds = Module["_FPDF_GetTrailerEnds"] = createExportWrapper("FPDF_GetTrailerEnds");
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
    return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments)
};
var _fflush = Module["_fflush"] = createExportWrapper("fflush");
var __get_tzname = Module["__get_tzname"] = createExportWrapper("_get_tzname");
var __get_daylight = Module["__get_daylight"] = createExportWrapper("_get_daylight");
var __get_timezone = Module["__get_timezone"] = createExportWrapper("_get_timezone");
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
    return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments)
};
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
    return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments)
};
var _setThrew = Module["_setThrew"] = createExportWrapper("setThrew");
var ___cxa_demangle = Module["___cxa_demangle"] = createExportWrapper("__cxa_demangle");
var _memalign = Module["_memalign"] = createExportWrapper("memalign");
var _emscripten_builtin_malloc = Module["_emscripten_builtin_malloc"] = createExportWrapper("emscripten_builtin_malloc");
var _emscripten_builtin_free = Module["_emscripten_builtin_free"] = createExportWrapper("emscripten_builtin_free");
var _emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = createExportWrapper("emscripten_builtin_memalign");
var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji");
var dynCall_jij = Module["dynCall_jij"] = createExportWrapper("dynCall_jij");
var dynCall_iiiij = Module["dynCall_iiiij"] = createExportWrapper("dynCall_iiiij");
var dynCall_iij = Module["dynCall_iij"] = createExportWrapper("dynCall_iij");
var dynCall_iiiji = Module["dynCall_iiiji"] = createExportWrapper("dynCall_iiiji");
var dynCall_jji = Module["dynCall_jji"] = createExportWrapper("dynCall_jji");
var dynCall_iji = Module["dynCall_iji"] = createExportWrapper("dynCall_iji");
var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");
var dynCall_iiji = Module["dynCall_iiji"] = createExportWrapper("dynCall_iiji");
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");
var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");
var dynCall_viji = Module["dynCall_viji"] = createExportWrapper("dynCall_viji");

function invoke_viii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        wasmTable.get(index)(a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iii(index, a1, a2) {
    var sp = stackSave();
    try {
        return wasmTable.get(index)(a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_vi(index, a1) {
    var sp = stackSave();
    try {
        wasmTable.get(index)(a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_ii(index, a1) {
    var sp = stackSave();
    try {
        return wasmTable.get(index)(a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        return wasmTable.get(index)(a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        wasmTable.get(index)(a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        return wasmTable.get(index)(a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_v(index) {
    var sp = stackSave();
    try {
        wasmTable.get(index)()
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}
if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() {
    abort("'intArrayFromString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() {
    abort("'intArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function() {
    abort("'setValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getValue")) Module["getValue"] = function() {
    abort("'getValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function() {
    abort("'allocate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() {
    abort("'UTF8ArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() {
    abort("'UTF8ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() {
    abort("'stringToUTF8Array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() {
    abort("'stringToUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() {
    abort("'lengthBytesUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() {
    abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() {
    abort("'addOnPreRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() {
    abort("'addOnInit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() {
    abort("'addOnPreMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() {
    abort("'addOnExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() {
    abort("'addOnPostRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() {
    abort("'writeStringToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() {
    abort("'writeArrayToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() {
    abort("'writeAsciiToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function() {
    abort("'addRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function() {
    abort("'removeRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() {
    abort("'FS_createFolder' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function() {
    abort("'FS_createPath' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function() {
    abort("'FS_createDataFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function() {
    abort("'FS_createPreloadedFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function() {
    abort("'FS_createLazyFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() {
    abort("'FS_createLink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function() {
    abort("'FS_createDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function() {
    abort("'FS_unlink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() {
    abort("'getLEB' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() {
    abort("'getFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() {
    abort("'alignFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() {
    abort("'registerFunctions' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() {
    abort("'addFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() {
    abort("'removeFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() {
    abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() {
    abort("'prettyPrint' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() {
    abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() {
    abort("'getCompilerSetting' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() {
    abort("'print' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() {
    abort("'printErr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() {
    abort("'getTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() {
    abort("'setTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() {
    abort("'callMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() {
    abort("'abort' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToNewUTF8")) Module["stringToNewUTF8"] = function() {
    abort("'stringToNewUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setFileTime")) Module["setFileTime"] = function() {
    abort("'setFileTime' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "emscripten_realloc_buffer")) Module["emscripten_realloc_buffer"] = function() {
    abort("'emscripten_realloc_buffer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() {
    abort("'ENV' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_CODES")) Module["ERRNO_CODES"] = function() {
    abort("'ERRNO_CODES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_MESSAGES")) Module["ERRNO_MESSAGES"] = function() {
    abort("'ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setErrNo")) Module["setErrNo"] = function() {
    abort("'setErrNo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "inetPton4")) Module["inetPton4"] = function() {
    abort("'inetPton4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop4")) Module["inetNtop4"] = function() {
    abort("'inetNtop4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "inetPton6")) Module["inetPton6"] = function() {
    abort("'inetPton6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop6")) Module["inetNtop6"] = function() {
    abort("'inetNtop6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "readSockaddr")) Module["readSockaddr"] = function() {
    abort("'readSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeSockaddr")) Module["writeSockaddr"] = function() {
    abort("'writeSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "DNS")) Module["DNS"] = function() {
    abort("'DNS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getHostByName")) Module["getHostByName"] = function() {
    abort("'getHostByName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GAI_ERRNO_MESSAGES")) Module["GAI_ERRNO_MESSAGES"] = function() {
    abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "Protocols")) Module["Protocols"] = function() {
    abort("'Protocols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "Sockets")) Module["Sockets"] = function() {
    abort("'Sockets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getRandomDevice")) Module["getRandomDevice"] = function() {
    abort("'getRandomDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "traverseStack")) Module["traverseStack"] = function() {
    abort("'traverseStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UNWIND_CACHE")) Module["UNWIND_CACHE"] = function() {
    abort("'UNWIND_CACHE' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "withBuiltinMalloc")) Module["withBuiltinMalloc"] = function() {
    abort("'withBuiltinMalloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgsArray")) Module["readAsmConstArgsArray"] = function() {
    abort("'readAsmConstArgsArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgs")) Module["readAsmConstArgs"] = function() {
    abort("'readAsmConstArgs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "mainThreadEM_ASM")) Module["mainThreadEM_ASM"] = function() {
    abort("'mainThreadEM_ASM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_q")) Module["jstoi_q"] = function() {
    abort("'jstoi_q' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_s")) Module["jstoi_s"] = function() {
    abort("'jstoi_s' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getExecutableName")) Module["getExecutableName"] = function() {
    abort("'getExecutableName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "listenOnce")) Module["listenOnce"] = function() {
    abort("'listenOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "autoResumeAudioContext")) Module["autoResumeAudioContext"] = function() {
    abort("'autoResumeAudioContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "dynCallLegacy")) Module["dynCallLegacy"] = function() {
    abort("'dynCallLegacy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getDynCaller")) Module["getDynCaller"] = function() {
    abort("'getDynCaller' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() {
    abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "callRuntimeCallbacks")) Module["callRuntimeCallbacks"] = function() {
    abort("'callRuntimeCallbacks' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepaliveCounter")) Module["runtimeKeepaliveCounter"] = function() {
    abort("'runtimeKeepaliveCounter' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "keepRuntimeAlive")) Module["keepRuntimeAlive"] = function() {
    abort("'keepRuntimeAlive' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePush")) Module["runtimeKeepalivePush"] = function() {
    abort("'runtimeKeepalivePush' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePop")) Module["runtimeKeepalivePop"] = function() {
    abort("'runtimeKeepalivePop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "callUserCallback")) Module["callUserCallback"] = function() {
    abort("'callUserCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "maybeExit")) Module["maybeExit"] = function() {
    abort("'maybeExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "asmjsMangle")) Module["asmjsMangle"] = function() {
    abort("'asmjsMangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "reallyNegative")) Module["reallyNegative"] = function() {
    abort("'reallyNegative' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "unSign")) Module["unSign"] = function() {
    abort("'unSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "reSign")) Module["reSign"] = function() {
    abort("'reSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "formatString")) Module["formatString"] = function() {
    abort("'formatString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "PATH")) Module["PATH"] = function() {
    abort("'PATH' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "PATH_FS")) Module["PATH_FS"] = function() {
    abort("'PATH_FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SYSCALLS")) Module["SYSCALLS"] = function() {
    abort("'SYSCALLS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "syscallMmap2")) Module["syscallMmap2"] = function() {
    abort("'syscallMmap2' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "syscallMunmap")) Module["syscallMunmap"] = function() {
    abort("'syscallMunmap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getSocketFromFD")) Module["getSocketFromFD"] = function() {
    abort("'getSocketFromFD' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getSocketAddress")) Module["getSocketAddress"] = function() {
    abort("'getSocketAddress' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "JSEvents")) Module["JSEvents"] = function() {
    abort("'JSEvents' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerKeyEventCallback")) Module["registerKeyEventCallback"] = function() {
    abort("'registerKeyEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "specialHTMLTargets")) Module["specialHTMLTargets"] = function() {
    abort("'specialHTMLTargets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "maybeCStringToJsString")) Module["maybeCStringToJsString"] = function() {
    abort("'maybeCStringToJsString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "findEventTarget")) Module["findEventTarget"] = function() {
    abort("'findEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "findCanvasEventTarget")) Module["findCanvasEventTarget"] = function() {
    abort("'findCanvasEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getBoundingClientRect")) Module["getBoundingClientRect"] = function() {
    abort("'getBoundingClientRect' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillMouseEventData")) Module["fillMouseEventData"] = function() {
    abort("'fillMouseEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerMouseEventCallback")) Module["registerMouseEventCallback"] = function() {
    abort("'registerMouseEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerWheelEventCallback")) Module["registerWheelEventCallback"] = function() {
    abort("'registerWheelEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerUiEventCallback")) Module["registerUiEventCallback"] = function() {
    abort("'registerUiEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerFocusEventCallback")) Module["registerFocusEventCallback"] = function() {
    abort("'registerFocusEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceOrientationEventData")) Module["fillDeviceOrientationEventData"] = function() {
    abort("'fillDeviceOrientationEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceOrientationEventCallback")) Module["registerDeviceOrientationEventCallback"] = function() {
    abort("'registerDeviceOrientationEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceMotionEventData")) Module["fillDeviceMotionEventData"] = function() {
    abort("'fillDeviceMotionEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceMotionEventCallback")) Module["registerDeviceMotionEventCallback"] = function() {
    abort("'registerDeviceMotionEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "screenOrientation")) Module["screenOrientation"] = function() {
    abort("'screenOrientation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillOrientationChangeEventData")) Module["fillOrientationChangeEventData"] = function() {
    abort("'fillOrientationChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerOrientationChangeEventCallback")) Module["registerOrientationChangeEventCallback"] = function() {
    abort("'registerOrientationChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillFullscreenChangeEventData")) Module["fillFullscreenChangeEventData"] = function() {
    abort("'fillFullscreenChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerFullscreenChangeEventCallback")) Module["registerFullscreenChangeEventCallback"] = function() {
    abort("'registerFullscreenChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerRestoreOldStyle")) Module["registerRestoreOldStyle"] = function() {
    abort("'registerRestoreOldStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "hideEverythingExceptGivenElement")) Module["hideEverythingExceptGivenElement"] = function() {
    abort("'hideEverythingExceptGivenElement' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "restoreHiddenElements")) Module["restoreHiddenElements"] = function() {
    abort("'restoreHiddenElements' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setLetterbox")) Module["setLetterbox"] = function() {
    abort("'setLetterbox' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "currentFullscreenStrategy")) Module["currentFullscreenStrategy"] = function() {
    abort("'currentFullscreenStrategy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "restoreOldWindowedStyle")) Module["restoreOldWindowedStyle"] = function() {
    abort("'restoreOldWindowedStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "softFullscreenResizeWebGLRenderTarget")) Module["softFullscreenResizeWebGLRenderTarget"] = function() {
    abort("'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "doRequestFullscreen")) Module["doRequestFullscreen"] = function() {
    abort("'doRequestFullscreen' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillPointerlockChangeEventData")) Module["fillPointerlockChangeEventData"] = function() {
    abort("'fillPointerlockChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockChangeEventCallback")) Module["registerPointerlockChangeEventCallback"] = function() {
    abort("'registerPointerlockChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockErrorEventCallback")) Module["registerPointerlockErrorEventCallback"] = function() {
    abort("'registerPointerlockErrorEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "requestPointerLock")) Module["requestPointerLock"] = function() {
    abort("'requestPointerLock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillVisibilityChangeEventData")) Module["fillVisibilityChangeEventData"] = function() {
    abort("'fillVisibilityChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerVisibilityChangeEventCallback")) Module["registerVisibilityChangeEventCallback"] = function() {
    abort("'registerVisibilityChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerTouchEventCallback")) Module["registerTouchEventCallback"] = function() {
    abort("'registerTouchEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillGamepadEventData")) Module["fillGamepadEventData"] = function() {
    abort("'fillGamepadEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerGamepadEventCallback")) Module["registerGamepadEventCallback"] = function() {
    abort("'registerGamepadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerBeforeUnloadEventCallback")) Module["registerBeforeUnloadEventCallback"] = function() {
    abort("'registerBeforeUnloadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "fillBatteryEventData")) Module["fillBatteryEventData"] = function() {
    abort("'fillBatteryEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "battery")) Module["battery"] = function() {
    abort("'battery' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerBatteryEventCallback")) Module["registerBatteryEventCallback"] = function() {
    abort("'registerBatteryEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setCanvasElementSize")) Module["setCanvasElementSize"] = function() {
    abort("'setCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getCanvasElementSize")) Module["getCanvasElementSize"] = function() {
    abort("'getCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "polyfillSetImmediate")) Module["polyfillSetImmediate"] = function() {
    abort("'polyfillSetImmediate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "demangle")) Module["demangle"] = function() {
    abort("'demangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "demangleAll")) Module["demangleAll"] = function() {
    abort("'demangleAll' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "jsStackTrace")) Module["jsStackTrace"] = function() {
    abort("'jsStackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() {
    abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getEnvStrings")) Module["getEnvStrings"] = function() {
    abort("'getEnvStrings' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "checkWasiClock")) Module["checkWasiClock"] = function() {
    abort("'checkWasiClock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64")) Module["writeI53ToI64"] = function() {
    abort("'writeI53ToI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Clamped")) Module["writeI53ToI64Clamped"] = function() {
    abort("'writeI53ToI64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Signaling")) Module["writeI53ToI64Signaling"] = function() {
    abort("'writeI53ToI64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Clamped")) Module["writeI53ToU64Clamped"] = function() {
    abort("'writeI53ToU64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Signaling")) Module["writeI53ToU64Signaling"] = function() {
    abort("'writeI53ToU64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromI64")) Module["readI53FromI64"] = function() {
    abort("'readI53FromI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromU64")) Module["readI53FromU64"] = function() {
    abort("'readI53FromU64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "convertI32PairToI53")) Module["convertI32PairToI53"] = function() {
    abort("'convertI32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "convertU32PairToI53")) Module["convertU32PairToI53"] = function() {
    abort("'convertU32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "uncaughtExceptionCount")) Module["uncaughtExceptionCount"] = function() {
    abort("'uncaughtExceptionCount' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "exceptionLast")) Module["exceptionLast"] = function() {
    abort("'exceptionLast' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "exceptionCaught")) Module["exceptionCaught"] = function() {
    abort("'exceptionCaught' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfoAttrs")) Module["ExceptionInfoAttrs"] = function() {
    abort("'ExceptionInfoAttrs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfo")) Module["ExceptionInfo"] = function() {
    abort("'ExceptionInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "CatchInfo")) Module["CatchInfo"] = function() {
    abort("'CatchInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "exception_addRef")) Module["exception_addRef"] = function() {
    abort("'exception_addRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "exception_decRef")) Module["exception_decRef"] = function() {
    abort("'exception_decRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "Browser")) Module["Browser"] = function() {
    abort("'Browser' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "funcWrappers")) Module["funcWrappers"] = function() {
    abort("'funcWrappers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() {
    abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setMainLoop")) Module["setMainLoop"] = function() {
    abort("'setMainLoop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function() {
    abort("'FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "mmapAlloc")) Module["mmapAlloc"] = function() {
    abort("'mmapAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "MEMFS")) Module["MEMFS"] = function() {
    abort("'MEMFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "TTY")) Module["TTY"] = function() {
    abort("'TTY' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "PIPEFS")) Module["PIPEFS"] = function() {
    abort("'PIPEFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SOCKFS")) Module["SOCKFS"] = function() {
    abort("'SOCKFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "_setNetworkCallback")) Module["_setNetworkCallback"] = function() {
    abort("'_setNetworkCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "tempFixedLengthArray")) Module["tempFixedLengthArray"] = function() {
    abort("'tempFixedLengthArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "miniTempWebGLFloatBuffers")) Module["miniTempWebGLFloatBuffers"] = function() {
    abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "heapObjectForWebGLType")) Module["heapObjectForWebGLType"] = function() {
    abort("'heapObjectForWebGLType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "heapAccessShiftForWebGLHeap")) Module["heapAccessShiftForWebGLHeap"] = function() {
    abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() {
    abort("'GL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGet")) Module["emscriptenWebGLGet"] = function() {
    abort("'emscriptenWebGLGet' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "computeUnpackAlignedImageSize")) Module["computeUnpackAlignedImageSize"] = function() {
    abort("'computeUnpackAlignedImageSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetTexPixelData")) Module["emscriptenWebGLGetTexPixelData"] = function() {
    abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetUniform")) Module["emscriptenWebGLGetUniform"] = function() {
    abort("'emscriptenWebGLGetUniform' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "webglGetUniformLocation")) Module["webglGetUniformLocation"] = function() {
    abort("'webglGetUniformLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "webglPrepareUniformLocationsBeforeFirstUse")) Module["webglPrepareUniformLocationsBeforeFirstUse"] = function() {
    abort("'webglPrepareUniformLocationsBeforeFirstUse' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "webglGetLeftBracePos")) Module["webglGetLeftBracePos"] = function() {
    abort("'webglGetLeftBracePos' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetVertexAttrib")) Module["emscriptenWebGLGetVertexAttrib"] = function() {
    abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeGLArray")) Module["writeGLArray"] = function() {
    abort("'writeGLArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "AL")) Module["AL"] = function() {
    abort("'AL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SDL_unicode")) Module["SDL_unicode"] = function() {
    abort("'SDL_unicode' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SDL_ttfContext")) Module["SDL_ttfContext"] = function() {
    abort("'SDL_ttfContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SDL_audio")) Module["SDL_audio"] = function() {
    abort("'SDL_audio' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SDL")) Module["SDL"] = function() {
    abort("'SDL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "SDL_gfx")) Module["SDL_gfx"] = function() {
    abort("'SDL_gfx' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GLUT")) Module["GLUT"] = function() {
    abort("'GLUT' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "EGL")) Module["EGL"] = function() {
    abort("'EGL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GLFW_Window")) Module["GLFW_Window"] = function() {
    abort("'GLFW_Window' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GLFW")) Module["GLFW"] = function() {
    abort("'GLFW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "GLEW")) Module["GLEW"] = function() {
    abort("'GLEW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "IDBStore")) Module["IDBStore"] = function() {
    abort("'IDBStore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "runAndAbortIfError")) Module["runAndAbortIfError"] = function() {
    abort("'runAndAbortIfError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() {
    abort("'warnOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() {
    abort("'stackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() {
    abort("'stackRestore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() {
    abort("'stackAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() {
    abort("'AsciiToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() {
    abort("'stringToAscii' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() {
    abort("'UTF16ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() {
    abort("'stringToUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() {
    abort("'lengthBytesUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() {
    abort("'UTF32ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() {
    abort("'stringToUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() {
    abort("'lengthBytesUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() {
    abort("'allocateUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() {
    abort("'allocateUTF8OnStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
Module["writeStackCookie"] = writeStackCookie;
Module["checkStackCookie"] = checkStackCookie;
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", {
    configurable: true,
    get: function() {
        abort("'ALLOC_NORMAL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", {
    configurable: true,
    get: function() {
        abort("'ALLOC_STACK' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
var calledRun;

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller
};

function stackCheckInit() {
    _emscripten_stack_init();
    writeStackCookie()
}

function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return
    }
    stackCheckInit();
    preRun();
    if (runDependencies > 0) {
        return
    }

    function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
            setTimeout(function() {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
    checkStackCookie()
}
Module["run"] = run;

function checkUnflushedContent() {
    var oldOut = out;
    var oldErr = err;
    var has = false;
    out = err = function(x) {
        has = true
    };
    try {
        var flush = Module["_fflush"];
        if (flush) flush(0);
        ["stdout", "stderr"].forEach(function(name) {
            var info = FS.analyzePath("/dev/" + name);
            if (!info) return;
            var stream = info.object;
            var rdev = stream.rdev;
            var tty = TTY.ttys[rdev];
            if (tty && tty.output && tty.output.length) {
                has = true
            }
        })
    } catch (e) {}
    out = oldOut;
    err = oldErr;
    if (has) {
        warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.")
    }
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
run();