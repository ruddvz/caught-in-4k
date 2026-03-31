/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 70620:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(28161);
var _regenerator = _interopRequireDefault(__webpack_require__(49507));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(68048));
function getId() {
  return Math.random().toString(32).slice(2);
}
function Bridge(scope, handler) {
  handler.addEventListener('message', /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref) {
      var request, id, path, args, value, data, thisArg;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            request = _ref.data.request;
            if (request) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return");
          case 3:
            id = request.id, path = request.path, args = request.args;
            _context.prev = 4;
            value = path.reduce(function (value, prop) {
              return value[prop];
            }, scope);
            if (!(typeof value === 'function')) {
              _context.next = 13;
              break;
            }
            thisArg = path.slice(0, path.length - 1).reduce(function (value, prop) {
              return value[prop];
            }, scope);
            _context.next = 10;
            return value.apply(thisArg, args);
          case 10:
            data = _context.sent;
            _context.next = 16;
            break;
          case 13:
            _context.next = 15;
            return value;
          case 15:
            data = _context.sent;
          case 16:
            handler.postMessage({
              response: {
                id: id,
                result: {
                  data: data
                }
              }
            });
            _context.next = 22;
            break;
          case 19:
            _context.prev = 19;
            _context.t0 = _context["catch"](4);
            handler.postMessage({
              response: {
                id: id,
                result: {
                  error: _context.t0
                }
              }
            });
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[4, 19]]);
    }));
    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());
  this.call = /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(path, args) {
      var id;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            id = getId();
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var onMessage = function onMessage(_ref4) {
                var response = _ref4.data.response;
                if (!response || response.id !== id) return;
                handler.removeEventListener('message', onMessage);
                if ('error' in response.result) {
                  reject(response.result.error);
                } else {
                  resolve(response.result.data);
                }
              };
              handler.addEventListener('message', onMessage);
              handler.postMessage({
                request: {
                  id: id,
                  path: path,
                  args: args
                }
              });
            }));
          case 2:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2, _x3) {
      return _ref3.apply(this, arguments);
    };
  }();
}
module.exports = Bridge;


/***/ }),

/***/ 83621:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(28161);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.analytics = analytics;
exports.decode_stream = decode_stream;
exports["default"] = void 0;
exports.dispatch = dispatch;
exports.get_state = get_state;
exports.initialize_runtime = initialize_runtime;
exports.start = start;
var _regenerator = _interopRequireDefault(__webpack_require__(49507));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(68048));
var _typeof2 = _interopRequireDefault(__webpack_require__(56811));
var importMeta = {
  url: new URL('/stremio_core_web.js', document.baseURI).href
};
var wasm;
var heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);
function getObject(idx) {
  return heap[idx];
}
var WASM_VECTOR_LEN = 0;
var cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}
var cachedTextEncoder = new TextEncoder('utf-8');
var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function (arg, view) {
  var buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    var buf = cachedTextEncoder.encode(arg);
    var _ptr = malloc(buf.length);
    getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return _ptr;
  }
  var len = arg.length;
  var ptr = malloc(len);
  var mem = getUint8Memory0();
  var offset = 0;
  for (; offset < len; offset++) {
    var code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    var ret = encodeString(arg, view);
    offset += ret.written;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function isLikeNone(x) {
  return x === undefined || x === null;
}
var cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}
var heap_next = heap.length;
function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}
function takeObject(idx) {
  var ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  var idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
function debugString(val) {
  // primitive types
  var type = (0, _typeof2["default"])(val);
  if (type == 'number' || type == 'boolean' || val == null) {
    return "".concat(val);
  }
  if (type == 'string') {
    return "\"".concat(val, "\"");
  }
  if (type == 'symbol') {
    var description = val.description;
    if (description == null) {
      return 'Symbol';
    } else {
      return "Symbol(".concat(description, ")");
    }
  }
  if (type == 'function') {
    var name = val.name;
    if (typeof name == 'string' && name.length > 0) {
      return "Function(".concat(name, ")");
    } else {
      return 'Function';
    }
  }
  // objects
  if (Array.isArray(val)) {
    var length = val.length;
    var debug = '[';
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (var i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }
    debug += ']';
    return debug;
  }
  // Test for built-in
  var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  var className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')';
    } catch (_) {
      return 'Object';
    }
  }
  // errors
  if (val instanceof Error) {
    return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}
function makeMutClosure(arg0, arg1, dtor, f) {
  var state = {
    a: arg0,
    b: arg1,
    cnt: 1,
    dtor: dtor
  };
  var real = function real() {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    var a = state.a;
    state.a = 0;
    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return f.apply(void 0, [a, state.b].concat(args));
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;
  return real;
}
function __wbg_adapter_30(arg0, arg1) {
  wasm.wasm_bindgen__convert__closures__invoke0_mut__h1d03802ed6ee3b98(arg0, arg1);
}
function __wbg_adapter_33(arg0, arg1, arg2) {
  wasm.wasm_bindgen__convert__closures__invoke1_mut__h287d35c01be7cb49(arg0, arg1, addHeapObject(arg2));
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
/**
*/
function start() {
  wasm.start();
}

/**
* @param {Function} emit_to_ui
* @returns {Promise<void>}
*/
function initialize_runtime(emit_to_ui) {
  var ret = wasm.initialize_runtime(addHeapObject(emit_to_ui));
  return takeObject(ret);
}

/**
* @param {any} field
* @returns {any}
*/
function get_state(field) {
  var ret = wasm.get_state(addHeapObject(field));
  return takeObject(ret);
}

/**
* @param {any} action
* @param {any} field
* @param {any} location_hash
*/
function dispatch(action, field, location_hash) {
  wasm.dispatch(addHeapObject(action), addHeapObject(field), addHeapObject(location_hash));
}

/**
* @param {any} event
* @param {any} location_hash
*/
function analytics(event, location_hash) {
  wasm.analytics(addHeapObject(event), addHeapObject(location_hash));
}

/**
* @param {any} stream
* @returns {any}
*/
function decode_stream(stream) {
  var ret = wasm.decode_stream(addHeapObject(stream));
  return takeObject(ret);
}
function __wbg_adapter_118(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__hae5b9d44fd620b1a(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}
function load(_x, _x2) {
  return _load.apply(this, arguments);
}
function _load() {
  _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(module, imports) {
    var bytes, instance;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(typeof Response === 'function' && module instanceof Response)) {
            _context.next = 23;
            break;
          }
          if (!(typeof WebAssembly.instantiateStreaming === 'function')) {
            _context.next = 15;
            break;
          }
          _context.prev = 2;
          _context.next = 5;
          return WebAssembly.instantiateStreaming(module, imports);
        case 5:
          return _context.abrupt("return", _context.sent);
        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](2);
          if (!(module.headers.get('Content-Type') != 'application/wasm')) {
            _context.next = 14;
            break;
          }
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", _context.t0);
          _context.next = 15;
          break;
        case 14:
          throw _context.t0;
        case 15:
          _context.next = 17;
          return module.arrayBuffer();
        case 17:
          bytes = _context.sent;
          _context.next = 20;
          return WebAssembly.instantiate(bytes, imports);
        case 20:
          return _context.abrupt("return", _context.sent);
        case 23:
          _context.next = 25;
          return WebAssembly.instantiate(module, imports);
        case 25:
          instance = _context.sent;
          if (!(instance instanceof WebAssembly.Instance)) {
            _context.next = 30;
            break;
          }
          return _context.abrupt("return", {
            instance: instance,
            module: module
          });
        case 30:
          return _context.abrupt("return", instance);
        case 31:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[2, 8]]);
  }));
  return _load.apply(this, arguments);
}
function init(_x3) {
  return _init.apply(this, arguments);
}
function _init() {
  _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(input) {
    var imports, _yield$load, instance, module;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (typeof input === 'undefined') {
            input = new URL('stremio_core_web_bg.wasm', importMeta.url);
          }
          imports = {};
          imports.wbg = {};
          imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
            var obj = getObject(arg1);
            var ret = typeof obj === 'string' ? obj : undefined;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
            takeObject(arg0);
          };
          imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
            var ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
            var ret = getObject(arg0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_static_accessor_APP_VERSION_626ea850f08d4f7f = function (arg0) {
            var ret = self.app_version;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_static_accessor_SHELL_VERSION_a78356a69c7fc646 = function (arg0) {
            var ret = self.shell_version;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_is_undefined = function (arg0) {
            var ret = getObject(arg0) === undefined;
            return ret;
          };
          imports.wbg.__wbg_localstoragegetitem_f889a6b8d3100ef4 = function () {
            return handleError(function (arg0, arg1) {
              try {
                var ret = self.local_storage_get_item(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
              }
            }, arguments);
          };
          imports.wbg.__wbg_getlocationhash_3f7594ef15034e54 = function () {
            return handleError(function () {
              var ret = self.get_location_hash();
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_localstorageremoveitem_14a054ba39679677 = function () {
            return handleError(function (arg0, arg1) {
              try {
                var ret = self.local_storage_remove_item(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
              }
            }, arguments);
          };
          imports.wbg.__wbg_localstoragesetitem_b419d8cd94aebda3 = function () {
            return handleError(function (arg0, arg1, arg2, arg3) {
              try {
                var ret = self.local_storage_set_item(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
                wasm.__wbindgen_free(arg2, arg3);
              }
            }, arguments);
          };
          imports.wbg.__wbg_new_693216e109162396 = function () {
            var ret = new Error();
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function (arg0, arg1) {
            var ret = getObject(arg1).stack;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_error_09919627ac0992f5 = function (arg0, arg1) {
            try {
              console.error(getStringFromWasm0(arg0, arg1));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_crypto_1dc1c51d9d27e0dd = function (arg0) {
            var ret = getObject(arg0).crypto;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_object = function (arg0) {
            var val = getObject(arg0);
            var ret = (0, _typeof2["default"])(val) === 'object' && val !== null;
            return ret;
          };
          imports.wbg.__wbg_process_65edac0b2f0a8427 = function (arg0) {
            var ret = getObject(arg0).process;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_versions_0d0eed1c1b42b216 = function (arg0) {
            var ret = getObject(arg0).versions;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_node_82761bdd6eaac7e7 = function (arg0) {
            var ret = getObject(arg0).node;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_string = function (arg0) {
            var ret = typeof getObject(arg0) === 'string';
            return ret;
          };
          imports.wbg.__wbg_require_3f60396135018b0f = function () {
            return handleError(function () {
              var ret = module.require;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_msCrypto_4ef1b0e1cd4cedbb = function (arg0) {
            var ret = getObject(arg0).msCrypto;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_randomFillSync_d84d19ffc1d700ed = function () {
            return handleError(function (arg0, arg1) {
              getObject(arg0).randomFillSync(takeObject(arg1));
            }, arguments);
          };
          imports.wbg.__wbg_getRandomValues_3293819ebec805bc = function () {
            return handleError(function (arg0, arg1) {
              getObject(arg0).getRandomValues(getObject(arg1));
            }, arguments);
          };
          imports.wbg.__wbg_log_02e20a3c32305fb7 = function (arg0, arg1) {
            try {
              console.log(getStringFromWasm0(arg0, arg1));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_log_5c7513aa8c164502 = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            try {
              console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_mark_abc7631bdced64f0 = function (arg0, arg1) {
            performance.mark(getStringFromWasm0(arg0, arg1));
          };
          imports.wbg.__wbg_measure_c528ff64085b7146 = function () {
            return handleError(function (arg0, arg1, arg2, arg3) {
              try {
                performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
                wasm.__wbindgen_free(arg2, arg3);
              }
            }, arguments);
          };
          imports.wbg.__wbindgen_cb_drop = function (arg0) {
            var obj = takeObject(arg0).original;
            if (obj.cnt-- == 1) {
              obj.a = 0;
              return true;
            }
            var ret = false;
            return ret;
          };
          imports.wbg.__wbg_newwithstrandinit_9b0fa00478c37287 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_instanceof_Response_e1b11afbefa5b563 = function (arg0) {
            var ret = getObject(arg0) instanceof Response;
            return ret;
          };
          imports.wbg.__wbg_status_6d8bb444ddc5a7b2 = function (arg0) {
            var ret = getObject(arg0).status;
            return ret;
          };
          imports.wbg.__wbg_text_8279d34d73e43c68 = function () {
            return handleError(function (arg0) {
              var ret = getObject(arg0).text();
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_language_cd6e22892ba36a1f = function (arg0, arg1) {
            var ret = getObject(arg1).language;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_instanceof_WorkerGlobalScope_f191ca0158f5637b = function (arg0) {
            var ret = getObject(arg0) instanceof WorkerGlobalScope;
            return ret;
          };
          imports.wbg.__wbg_navigator_8bc0889cda8f8500 = function (arg0) {
            var ret = getObject(arg0).navigator;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_fetch_b4e81012e07ff95a = function (arg0, arg1) {
            var ret = getObject(arg0).fetch(getObject(arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_setInterval_a02797f5ab1c7eb1 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = getObject(arg0).setInterval(getObject(arg1), arg2);
              return ret;
            }, arguments);
          };
          imports.wbg.__wbindgen_number_new = function (arg0) {
            var ret = arg0;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_function = function (arg0) {
            var ret = typeof getObject(arg0) === 'function';
            return ret;
          };
          imports.wbg.__wbg_newnoargs_be86524d73f67598 = function (arg0, arg1) {
            var ret = new Function(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_call_888d259a5fefc347 = function () {
            return handleError(function (arg0, arg1) {
              var ret = getObject(arg0).call(getObject(arg1));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_new_0b83d3df67ecb33e = function () {
            var ret = new Object();
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_self_c6fbdfc2918d5e58 = function () {
            return handleError(function () {
              var ret = self.self;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_window_baec038b5ab35c54 = function () {
            return handleError(function () {
              var ret = window.window;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_globalThis_3f735a5746d41fbd = function () {
            return handleError(function () {
              var ret = globalThis.globalThis;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_global_1bc0b39582740e95 = function () {
            return handleError(function () {
              var ret = __webpack_require__.g.global;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_instanceof_Error_561efcb1265706d8 = function (arg0) {
            var ret = getObject(arg0) instanceof Error;
            return ret;
          };
          imports.wbg.__wbg_message_9f7d15ff97fc4102 = function (arg0) {
            var ret = getObject(arg0).message;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_call_346669c262382ad7 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_getTimezoneOffset_d3e5a22a1b7fb1d8 = function (arg0) {
            var ret = getObject(arg0).getTimezoneOffset();
            return ret;
          };
          imports.wbg.__wbg_new_f11872bb9bb9d781 = function (arg0) {
            var ret = new Date(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_now_af172eabe2e041ad = function () {
            var ret = Date.now();
            return ret;
          };
          imports.wbg.__wbg_new_b1d61b5687f5e73a = function (arg0, arg1) {
            try {
              var state0 = {
                a: arg0,
                b: arg1
              };
              var cb0 = function cb0(arg0, arg1) {
                var a = state0.a;
                state0.a = 0;
                try {
                  return __wbg_adapter_118(a, state0.b, arg0, arg1);
                } finally {
                  state0.a = a;
                }
              };
              var ret = new Promise(cb0);
              return addHeapObject(ret);
            } finally {
              state0.a = state0.b = 0;
            }
          };
          imports.wbg.__wbg_resolve_d23068002f584f22 = function (arg0) {
            var ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_then_2fcac196782070cc = function (arg0, arg1) {
            var ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_then_8c2d62e8ae5978f7 = function (arg0, arg1, arg2) {
            var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_buffer_397eaa4d72ee94dd = function (arg0) {
            var ret = getObject(arg0).buffer;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_newwithbyteoffsetandlength_4b9b8c4e3f5adbff = function (arg0, arg1, arg2) {
            var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_new_a7ce447f15ff496f = function (arg0) {
            var ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_set_969ad0a60e51d320 = function (arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
          };
          imports.wbg.__wbg_newwithlength_929232475839a482 = function (arg0) {
            var ret = new Uint8Array(arg0 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_subarray_8b658422a224f479 = function (arg0, arg1, arg2) {
            var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_set_82a4e8a85e31ac42 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
              return ret;
            }, arguments);
          };
          imports.wbg.__wbg_parse_ccb2cd4fe8ead0cb = function () {
            return handleError(function (arg0, arg1) {
              var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_stringify_d4507a59932eed0c = function () {
            return handleError(function (arg0) {
              var ret = JSON.stringify(getObject(arg0));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
            var ret = debugString(getObject(arg1));
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_throw = function (arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
          };
          imports.wbg.__wbindgen_rethrow = function (arg0) {
            throw takeObject(arg0);
          };
          imports.wbg.__wbindgen_memory = function () {
            var ret = wasm.memory;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_closure_wrapper4042 = function (arg0, arg1, arg2) {
            var ret = makeMutClosure(arg0, arg1, 435, __wbg_adapter_30);
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_closure_wrapper8111 = function (arg0, arg1, arg2) {
            var ret = makeMutClosure(arg0, arg1, 1010, __wbg_adapter_33);
            return addHeapObject(ret);
          };
          if (typeof input === 'string' || typeof Request === 'function' && input instanceof Request || typeof URL === 'function' && input instanceof URL) {
            input = fetch(input);
          }
          _context2.t0 = load;
          _context2.next = 79;
          return input;
        case 79:
          _context2.t1 = _context2.sent;
          _context2.t2 = imports;
          _context2.next = 83;
          return (0, _context2.t0)(_context2.t1, _context2.t2);
        case 83:
          _yield$load = _context2.sent;
          instance = _yield$load.instance;
          module = _yield$load.module;
          wasm = instance.exports;
          init.__wbindgen_wasm_module = module;
          wasm.__wbindgen_start();
          return _context2.abrupt("return", wasm);
        case 90:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _init.apply(this, arguments);
}
var _default = exports["default"] = init;


/***/ }),

/***/ 34095:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "c31017ccad37e84600a6f51fc605d69d2220ec9e/binaries/stremio_core_web_bg.wasm";

/***/ }),

/***/ 68048:
/***/ ((module) => {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 28161:
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 79556:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(56811)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 56811:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 49507:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(79556)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/caught-in-4k/";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";


var _interopRequireDefault = __webpack_require__(28161);
var _regenerator = _interopRequireDefault(__webpack_require__(49507));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(68048));
var Bridge = __webpack_require__(70620);
var bridge = new Bridge(self, self);
self.init = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref) {
    var appVersion, shellVersion, _require, initialize_api, initialize_runtime, get_state, get_debug_state, dispatch, analytics, decode_stream;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          appVersion = _ref.appVersion, shellVersion = _ref.shellVersion;
          // TODO remove the document shim when this PR is merged
          // https://github.com/cfware/babel-plugin-bundled-import-meta/pull/26
          self.document = {
            baseURI: self.location.href
          };
          self.app_version = appVersion;
          self.shell_version = shellVersion;
          self.get_location_hash = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", bridge.call(['location', 'hash'], []));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          self.local_storage_get_item = /*#__PURE__*/function () {
            var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(key) {
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt("return", bridge.call(['localStorage', 'getItem'], [key]));
                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2);
            }));
            return function (_x2) {
              return _ref4.apply(this, arguments);
            };
          }();
          self.local_storage_set_item = /*#__PURE__*/function () {
            var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(key, value) {
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt("return", bridge.call(['localStorage', 'setItem'], [key, value]));
                  case 1:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3);
            }));
            return function (_x3, _x4) {
              return _ref5.apply(this, arguments);
            };
          }();
          self.local_storage_remove_item = /*#__PURE__*/function () {
            var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(key) {
              return _regenerator["default"].wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt("return", bridge.call(['localStorage', 'removeItem'], [key]));
                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return function (_x5) {
              return _ref6.apply(this, arguments);
            };
          }();
          _require = __webpack_require__(83621), initialize_api = _require["default"], initialize_runtime = _require.initialize_runtime, get_state = _require.get_state, get_debug_state = _require.get_debug_state, dispatch = _require.dispatch, analytics = _require.analytics, decode_stream = _require.decode_stream;
          self.getState = get_state;
          self.getDebugState = get_debug_state;
          self.dispatch = dispatch;
          self.analytics = analytics;
          self.decodeStream = decode_stream;
          _context5.next = 16;
          return initialize_api(__webpack_require__(34095));
        case 16:
          _context5.next = 18;
          return initialize_runtime(function (event) {
            return bridge.call(['onCoreEvent'], [event]);
          });
        case 18:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

})();

/******/ })()
;
//# sourceMappingURL=worker.js.map