/******/ var __webpack_modules__ = ({

/***/ 945:
/***/ ((module, exports, __webpack_require__) => {

// Save global object in a variable
var __global__ =
(typeof globalThis !== 'undefined' && globalThis) ||
(typeof self !== 'undefined' && self) ||
(typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g);
// Create an object that extends from __global__ without the fetch function
var __globalThis__ = (function () {
function F() {
this.fetch = false;
this.DOMException = __global__.DOMException
}
F.prototype = __global__; // Needed for feature detection on whatwg-fetch's code
return new F();
})();
// Wraps whatwg-fetch with a function scope to hijack the global object
// "globalThis" that's going to be patched
(function(globalThis) {

var irrelevant = (function (exports) {

  /* eslint-disable no-prototype-builtins */
  var g =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    // eslint-disable-next-line no-undef
    (typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g) ||
    {};

  var support = {
    searchParams: 'URLSearchParams' in g,
    iterable: 'Symbol' in g && 'iterator' in Symbol,
    blob:
      'FileReader' in g &&
      'Blob' in g &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in g,
    arrayBuffer: 'ArrayBuffer' in g
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name: "' + name + '"')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        if (header.length != 2) {
          throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
        }
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body._noBody) return
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
    var encoding = match ? match[1] : 'utf-8';
    reader.readAsText(blob, encoding);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      // eslint-disable-next-line no-self-assign
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._noBody = true;
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };
    }

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        var isConsumed = consumed(this);
        if (isConsumed) {
          return isConsumed
        } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(
            this._bodyArrayBuffer.buffer.slice(
              this._bodyArrayBuffer.byteOffset,
              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
            )
          )
        } else {
          return Promise.resolve(this._bodyArrayBuffer)
        }
      } else if (support.blob) {
        return this.blob().then(readBlobAsArrayBuffer)
      } else {
        throw new Error('could not read as ArrayBuffer')
      }
    };

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal || (function () {
      if ('AbortController' in g) {
        var ctrl = new AbortController();
        return ctrl.signal;
      }
    }());
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders
      .split('\r')
      .map(function(header) {
        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
      })
      .forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          try {
            headers.append(key, value);
          } catch (error) {
            console.warn('Response ' + error.message);
          }
        }
      });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    if (this.status < 200 || this.status > 599) {
      throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
    }
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 200, statusText: ''});
    response.ok = false;
    response.status = 0;
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = g.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        // This check if specifically for when a user fetches a file locally from the file system
        // Only if the status is out of a normal range
        if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
          options.status = 200;
        } else {
          options.status = xhr.status;
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request timed out'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && g.location.href ? g.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
        var names = [];
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          names.push(normalizeName(name));
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
        request.headers.forEach(function(value, name) {
          if (names.indexOf(name) === -1) {
            xhr.setRequestHeader(name, value);
          }
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!g.fetch) {
    g.fetch = fetch;
    g.Headers = Headers;
    g.Request = Request;
    g.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
})(__globalThis__);
// This is a ponyfill, so...
__globalThis__.fetch.ponyfill = true;
delete __globalThis__.fetch.polyfill;
// Choose between native implementation (__global__) or custom implementation (__globalThis__)
var ctx = __global__.fetch ? __global__ : __globalThis__;
exports = ctx.fetch // To enable: import fetch from 'cross-fetch'
exports["default"] = ctx.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = ctx.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = ctx.Headers
exports.Request = ctx.Request
exports.Response = ctx.Response
module.exports = exports


/***/ }),

/***/ 223:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 410:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 942:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 911:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFile: () => (/* binding */ getFile)
/* harmony export */ });
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(945);

async function getFile(uri) {
    let buffer;
    // let response = await fetch(uri)
    // if (response?.ok){
    //   buffer = await response.arrayBuffer();
    // } else {
    //   console.log("No file found "+ uri)
    //   return null
    // }
    try {
        const response = await cross_fetch__WEBPACK_IMPORTED_MODULE_0__(uri);
        if (response?.ok) {
            buffer = await response.arrayBuffer();
        }
        else {
            console.log("No file found " + uri);
            return null;
        }
    }
    catch (error) {
        console.error("Failed to fetch URI:", uri, "\nError:", error);
        return null;
    }
    return buffer;
}
//# sourceMappingURL=getFile.js.map

/***/ }),

/***/ 64:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getLocalFile: () => (/* binding */ getLocalFile)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(410);

// import path from 'path';
// import {fileURLToPath} from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
async function getLocalFile(path) {
    // let buffer: Buffer;
    try {
        const response = await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(path);
        if (response) {
            return response;
        }
        else {
            return null;
        }
        // buffer = await readFile(path);
    }
    catch (error) {
        console.error("Failed to read path:", path, "\nError:", error);
        return null;
    }
}
//# sourceMappingURL=getLocalFile.js.map

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/global */
/******/ (() => {
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  qd: () => (/* reexport */ AbstractProjection),
  lR: () => (/* reexport */ CoordsType),
  v4: () => (/* reexport */ HiPSFITS),
  lf: () => (/* reexport */ HiPSHelper),
  qb: () => (/* reexport */ HiPSProjection),
  er: () => (/* reexport */ ImagePixel_ImagePixel),
  Ne: () => (/* reexport */ MercatorProjection),
  wl: () => (/* reexport */ NumberType),
  bR: () => (/* reexport */ Point),
  kv: () => (/* reexport */ WCSLight),
  A1: () => (/* reexport */ astroToSpherical),
  jU: () => (/* reexport */ cartesianToSpherical),
  pu: () => (/* reexport */ degToRad),
  jc: () => (/* reexport */ fillAstro),
  NZ: () => (/* reexport */ fillSpherical),
  H: () => (/* reexport */ radToDeg),
  Mp: () => (/* reexport */ sphericalToAstro),
  lq: () => (/* reexport */ sphericalToCartesian)
});

// EXTERNAL MODULE: fs (ignored)
var fs_ignored_ = __webpack_require__(223);
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/FITSWriter.js
// import { FITSHeader } from "./model/FITSHeader.js"

class FITSWriter {
    static createFITS(fitsParsed) {
        const headerBytes = this.createHeader(fitsParsed.header);
        const dataBytes = this.createData(fitsParsed.data, fitsParsed.header);
        const fitsFile = new Uint8Array(headerBytes.length + dataBytes.length);
        fitsFile.set(headerBytes, 0);
        fitsFile.set(dataBytes, headerBytes.length);
        return fitsFile;
    }
    static createHeader(header) {
        const BLOCK = 2880;
        const CARD = 80;
        const MUST_INT = new Set(["BITPIX", "NAXIS", "PCOUNT", "GCOUNT"]);
        const IS_LOGICAL = new Set(["SIMPLE", "EXTEND"]);
        const items = header.getItems();
        function kw(s) {
            return (s ?? "").toUpperCase().padEnd(8, " ").slice(0, 8);
        }
        function card80(s) {
            return s.length >= CARD ? s.slice(0, CARD) : s.padEnd(CARD, " ");
        }
        // Emit COMMENT/HISTORY as multiple 72-char lines
        function makeCommentCards(kind, text) {
            const prefix = kw(kind); // "COMMENT " or "HISTORY "
            const width = CARD - prefix.length; // 72
            const t = (text ?? "").toString();
            if (!t.length)
                return [card80(prefix)]; // allow empty COMMENT/HISTORY line
            const out = [];
            for (let i = 0; i < t.length; i += width) {
                out.push(card80(prefix + t.slice(i, i + width)));
            }
            return out;
        }
        function quoteFitsString(s) {
            const unquoted = s.replace(/^'+|'+$/g, "");
            const escaped = unquoted.replace(/'/g, "''");
            return `'${escaped}'`;
        }
        // "= " + 20-char value field (or proper string)
        function valueField20(key, val) {
            let v = "";
            const K = key.toUpperCase();
            if (IS_LOGICAL.has(K)) {
                const tf = (val === true || val === "T" || val === "t") ? "T" : "F";
                return `= ${tf.padStart(20, " ")}`;
            }
            if (MUST_INT.has(K) || /^NAXIS\d+$/.test(K)) {
                const n = Number(val);
                if (!Number.isFinite(n) || !Number.isInteger(n)) {
                    throw new Error(`FITS header: ${K} must be an integer, got ${val}`);
                }
                return `= ${String(n).padStart(20, " ")}`;
            }
            if (typeof val === "number") {
                let s = Number.isInteger(val) ? String(val) : val.toExponential(10).replace("e", "E");
                if (s.length > 20)
                    s = val.toExponential(8).replace("e", "E");
                return `= ${s.padStart(20, " ")}`;
            }
            if (typeof val === "string") {
                return `= ${quoteFitsString(val)}`; // strings can exceed 20-char field
            }
            return "";
        }
        // Build one keyword card, and (if needed) emit overflow as COMMENT cards
        function makeKeywordWithComment(key, value, comment) {
            const K = key.toUpperCase();
            if (K === "END")
                return [card80("END")];
            if (K === "COMMENT" || K === "HISTORY") {
                const text = (value ?? comment ?? "").toString();
                return makeCommentCards(K, text);
            }
            // Normal keyword
            let base = kw(K) + valueField20(K, value);
            // Attach trailing comment inside the same card if it fits
            if (comment && comment.length > 0) {
                const add = ` / ${comment}`;
                const spaceLeft = CARD - base.length;
                if (spaceLeft > 0) {
                    const inCard = add.slice(0, spaceLeft);
                    base = (base + inCard);
                    // spill any overflow into COMMENT cards (strip a leading " / " if it didn't fit)
                    const overflow = add.slice(spaceLeft).replace(/^\s*\/\s*/, "");
                    if (overflow.length > 0) {
                        return [card80(base), ...makeCommentCards("COMMENT", overflow)];
                    }
                }
                else {
                    // no room at all; put the whole comment in COMMENT lines
                    return [card80(base), ...makeCommentCards("COMMENT", comment)];
                }
            }
            return [card80(base)];
        }
        // Build all cards with mandatory order first
        const map = new Map(items.map(it => [it.key.toUpperCase(), it]));
        const cards = [];
        const simple = map.get("SIMPLE");
        if (!simple)
            throw new Error("Missing mandatory SIMPLE card");
        cards.push(...makeKeywordWithComment("SIMPLE", simple.value, simple.comment));
        const bitpix = map.get("BITPIX");
        if (!bitpix)
            throw new Error("Missing mandatory BITPIX card");
        cards.push(...makeKeywordWithComment("BITPIX", bitpix.value, bitpix.comment));
        const naxis = map.get("NAXIS");
        if (!naxis)
            throw new Error("Missing mandatory NAXIS card");
        const nAxes = Number(naxis.value) || 0;
        cards.push(...makeKeywordWithComment("NAXIS", nAxes, naxis.comment));
        for (let i = 1; i <= nAxes; i++) {
            const ki = `NAXIS${i}`;
            const it = map.get(ki);
            if (!it)
                throw new Error(`Missing mandatory ${ki} card`);
            cards.push(...makeKeywordWithComment(ki, it.value, it.comment));
        }
        const extend = map.get("EXTEND");
        if (extend)
            cards.push(...makeKeywordWithComment("EXTEND", extend.value, extend.comment));
        for (const it of items) {
            const K = it.key.toUpperCase();
            if (K === "SIMPLE" || K === "BITPIX" || K === "NAXIS" || /^NAXIS\d+$/.test(K) || K === "EXTEND" || K === "END")
                continue;
            cards.push(...makeKeywordWithComment(it.key, it.value, it.comment));
        }
        // END + pad to 2880
        cards.push(card80("END"));
        let headerString = cards.join("");
        const pad = headerString.length % BLOCK ? BLOCK - (headerString.length % BLOCK) : 0;
        if (pad)
            headerString += " ".repeat(pad);
        return new TextEncoder().encode(headerString);
    }
    static createData(data, header) {
        // concat
        const totalLength = data.reduce((s, c) => s + c.length, 0);
        // OPTIONAL: verify size from BITPIX/NAXIS
        const bitpix = Math.abs(Number(header.findById("BITPIX")?.value ?? 0));
        const naxis = Number(header.findById("NAXIS")?.value ?? 0);
        let elems = 1;
        for (let k = 1; k <= naxis; k++) {
            elems *= Number(header.findById(`NAXIS${k}`)?.value ?? 0);
        }
        const bytesPerElem = bitpix / 8;
        const expectedUnpadded = naxis > 0 ? elems * bytesPerElem : 0;
        if (expectedUnpadded && expectedUnpadded !== totalLength) {
            throw new Error(`Data length ${totalLength} does not match header expectation ${expectedUnpadded} (BITPIX=${bitpix}, NAXIS=${naxis})`);
        }
        // build and pad
        let dataBytes = new Uint8Array(totalLength);
        let off = 0;
        for (const chunk of data) {
            dataBytes.set(chunk, off);
            off += chunk.length;
        }
        const BLOCK = 2880;
        const remainder = dataBytes.length % BLOCK;
        if (remainder) {
            const pad = BLOCK - remainder;
            const padded = new Uint8Array(dataBytes.length + pad);
            padded.set(dataBytes);
            dataBytes = padded; // zeros already in new space
        }
        return dataBytes;
    }
    // static typedArrayToURL(fitsParsed: FITSParsed): string {
    //   const fitsFile = FITSWriter.createFITS(fitsParsed) as Uint8Array;
    //   const blob = new Blob([fitsFile], { type: "application/fits" });
    //   // console.log(`<html><body><img src='${URL.createObjectURL(b)}'</body></html>`);
    //   const url = URL.createObjectURL(blob);
    //   console.log(`Generated FITS file URL: ${url}`);
    //   return url;
    // }
    static writeFITSFile(fitsParsed, filePath) {
        const fitsFile = this.createFITS(fitsParsed);
        try {
            fs_ignored_.writeFileSync(filePath, fitsFile);
            console.log(`FITS file written successfully to: ${filePath}`);
        }
        catch (error) {
            console.error(`Error writing FITS file: ${error}`);
        }
    }
}
// const fitsParsed: FITSParsed = {
//   header: new FITSHeader(),
//   data: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])]
// };
// // Specify the file path
// const filePath = "/Users/fabriziogiordano/Desktop/PhD/code/new/FITSParser/output.fits";
// // Write the FITS file to the filesystem
// FITSWriter.writeFITSFile(fitsParsed, filePath);
//# sourceMappingURL=FITSWriter.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/model/FITSHeaderItem.js
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class FITSHeaderItem {
    _key = "";
    _value = "";
    _comment = "";
    constructor(key, value, comment) {
        this._key = key;
        this._value = value;
        this._comment = comment;
    }
    get key() {
        return this._key;
    }
    get comment() {
        return this._comment;
    }
    get value() {
        return this._value;
    }
}
//# sourceMappingURL=FITSHeaderItem.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/model/FITSHeaderManager.js

class FITSHeaderManager {
    static SIMPLE = "SIMPLE";
    static BITPIX = "BITPIX";
    static BZERO = "BZERO";
    static BSCALE = "BSCALE";
    static BLANK = "BLANK";
    static NAXIS = "NAXIS";
    static NAXIS1 = "NAXIS1";
    static NAXIS2 = "NAXIS2";
    static DATAMIN = "DATAMIN";
    static DATAMAX = "DATAMAX";
    static CRVAL1 = "CRVAL1";
    static CRVAL2 = "CRVAL2";
    static CTYPE1 = "CTYPE1";
    static CTYPE2 = "CTYPE2";
    static CRPIX1 = "CRPIX1";
    static CRPIX2 = "CRPIX2";
    static ORIGIN = "ORIGIN";
    static COMMENT = "COMMENT";
    items = [];
    constructor() {
        this.items[0] = new FITSHeaderItem(FITSHeaderManager.SIMPLE, 'T', '');
        this.items[1] = new FITSHeaderItem(FITSHeaderManager.BITPIX, '', '');
        this.items[2] = new FITSHeaderItem(FITSHeaderManager.NAXIS, 2, '');
        this.items[3] = new FITSHeaderItem(FITSHeaderManager.NAXIS1, '', '');
        this.items[4] = new FITSHeaderItem(FITSHeaderManager.NAXIS2, '', '');
    }
    // insert(item: FITSHeaderItem, position?: number): void {
    insert(item) {
        if (item.key === FITSHeaderManager.SIMPLE) {
            // this.items.splice(0, 0, item);
            this.items[0] = item;
        }
        else if (item.key === FITSHeaderManager.BITPIX) {
            // this.items.splice(1, 0, item);
            this.items[1] = item;
        }
        else if (item.key === FITSHeaderManager.NAXIS) {
            // this.items.splice(2, 0, item);
            this.items[2] = item;
        }
        else if (item.key === FITSHeaderManager.NAXIS1) {
            // this.items.splice(3, 0, item);
            this.items[3] = item;
        }
        else if (item.key === FITSHeaderManager.NAXIS2) {
            // this.items.splice(4, 0, item);
            this.items[4] = item;
        }
        else {
            this.items.push(item);
        }
        // if (position !== undefined && position >= 0 && position <= this.items.length) {
        //     this.items.splice(position, 0, item);
        // } else {
        //     this.items.push(item);
        // }
    }
    getItems() {
        return this.items;
    }
    remove(key) {
        this.items = this.items.filter(item => item.key !== key);
    }
    findById(key) {
        const item = this.items.find(item => item.key === key);
        if (!item) {
            return null;
        }
        return item;
    }
}
//# sourceMappingURL=FITSHeaderManager.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/ParseHeader.js
// import { FITSHeader } from "./model/FITSHeader.js";


/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class ParseHeader {
    static getFITSItemValue(header, key) {
        const item = header.findById(key);
        let VALUE = null;
        if (item) {
            VALUE = Number(item.value);
        }
        return VALUE;
    }
    static parse(rawdata) {
        // only one header block (2880) allowed atm.
        // TODO handle multiple header blocks
        // let headerByteData = new Uint8Array(rawdata, 0, 2880);
        const textDecoder = new TextDecoder('ascii');
        const headerSize = 2880; // FITS headers are in 2880-byte blocks
        const headerText = textDecoder.decode(rawdata.slice(0, headerSize));
        const header = new FITSHeaderManager();
        const lines = headerText.match(/.{1,80}/g) || [];
        for (const line of lines) {
            const key = line.slice(0, 8).trim();
            let value;
            let comment = "";
            if (key && key !== 'END') {
                const rawValue = line.slice(10).trim().split('/')[0].trim();
                if (isNaN(Number(rawValue))) {
                    value = rawValue;
                }
                else {
                    value = Number(rawValue);
                }
                if (line.includes('/')) {
                    comment = line.slice(10).trim().split('/')[1].trim();
                }
                const item = new FITSHeaderItem(key, value, comment);
                header.insert(item);
            }
        }
        return header;
    }
}
//# sourceMappingURL=ParseHeader.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/ParseUtils.js
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class ParseUtils {
    static getStringAt(data, offset, length) {
        const chars = [];
        for (let i = offset, j = 0; i < offset + length; i++, j++) {
            chars[j] = String.fromCharCode(data.charCodeAt(i) & 0xff);
        }
        return chars.join("");
    }
    static byteString(n) {
        if (n < 0 || n > 255 || n % 1 !== 0) {
            throw new Error(n + " does not fit in a byte");
        }
        return ("000000000" + n.toString(2)).substr(-8);
    }
    static parse32bitSinglePrecisionFloatingPoint(byte1, byte2, byte3, byte4) {
        let long = (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4;
        if (long < 0)
            long += 4294967296;
        const float = (1.0 + (long & 0x007fffff) / 0x0800000) *
            Math.pow(2, ((long & 0x7f800000) >> 23) - 127);
        return float;
    }
    static convertBlankToBytes(blank, nbytes) {
        let str = Math.abs(blank).toString(2);
        while (str.length / 8 < nbytes) {
            str += "0";
        }
        const buffer = new ArrayBuffer(nbytes);
        const uint8 = new Uint8Array(buffer);
        for (let i = 0; i < nbytes; i++) {
            uint8[i] = parseInt(str.substr(8 * i, 8 * (i + 1)), 2);
        }
        return uint8;
    }
    /** https://gist.github.com/Manouchehri/f4b41c8272db2d6423fa987e844dd9ac */
    static parseFloatingPointFormat(bytes, ebits, fbits) {
        // Bytes to bits
        const bits = [];
        for (let i = bytes.length; i; i -= 1) {
            let byte = bytes[i - 1];
            for (let j = 8; j; j -= 1) {
                bits.push(byte % 2 ? 1 : 0);
                byte = byte >> 1;
            }
        }
        bits.reverse();
        const str = bits.join("");
        // Unpack sign, exponent, fraction
        const bias = (1 << (ebits - 1)) - 1;
        const s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
        const e = parseInt(str.substring(1, 1 + ebits), 2);
        const f = parseInt(str.substring(1 + ebits), 2);
        // Produce number
        if (e === (1 << ebits) - 1) {
            return f !== 0 ? null : s * Infinity;
        }
        else if (e > 0) {
            return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
        }
        else if (f !== 0) {
            return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
        }
        else {
            return s * 0;
        }
    }
    static generate16bit2sComplement(val) {
        throw new TypeError("not implemented yet" + val);
    }
    static parse16bit2sComplement(byte1, byte2) {
        const unsigned = (byte1 << 8) | byte2;
        if (unsigned & 0x8000) {
            return unsigned | 0xffff0000;
        }
        else {
            return unsigned;
        }
    }
    static parse32bit2sComplement(byte1, byte2, byte3, byte4) {
        const unsigned = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4;
        const s = (unsigned & 0x80000000) >> 31;
        let res = unsigned & 0xffffffff;
        if (s) {
            res = (~unsigned & 0xffffffff) + 1;
            return -1 * res;
        }
        return res;
    }
    /**
     *
     * @param {*} data string?
     * @param {*} offset offset in the data
     * @returns returns an integer between 0 and 65535 representing the UTF-16 code unit at the given index.
     */
    static getByteAt(data, offset) {
        const dataOffset = 0;
        return data.charCodeAt(offset + dataOffset) & 0xff;
    }
    static extractPixelValue(offset, bytes, bitpix) {
        let px_val = null; // pixel value
        // let px_val1, px_val2, px_val3, px_val4;
        if (bitpix == 8) {
            px_val = bytes[0];
        }
        else if (bitpix == 16) {
            // 16-bit 2's complement binary integer
            px_val = ParseUtils.parse16bit2sComplement(bytes[offset], bytes[offset + 1]);
        }
        else if (bitpix == 32) {
            // IEEE 754 half precision (float16) ??
            px_val = ParseUtils.parse32bit2sComplement(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        }
        else if (bitpix == -32) {
            // 32-bit IEEE single-precision floating point
            // px_val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this._u8data[offset], this._u8data[offset+1], this._u8data[offset+2], this._u8data[offset+3]);
            px_val = ParseUtils.parseFloatingPointFormat(bytes.slice(offset, offset + 8), 8, 23);
        }
        else if (bitpix == 64) {
            // 64-bit 2's complement binary integer
            throw new Error("BITPIX=64 -> 64-bit 2's complement binary integer NOT supported yet.");
        }
        else if (bitpix == -64) {
            // 64-bit IEEE double-precision floating point
            //https://babbage.cs.qc.cuny.edu/ieee-754.old/Decimal.html
            px_val = ParseUtils.parseFloatingPointFormat(bytes.slice(offset, offset + 8), 11, 52);
        }
        return px_val;
    }
}
// export default ParseUtils;
//# sourceMappingURL=ParseUtils.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/ParsePayload.js
// "use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
// import { FITSHeader } from "./model/FITSHeader.js";




class ParsePayload {
    static computePhysicalMinAndMax(header, rawData) {
        const BITPIX = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BITPIX);
        if (BITPIX === null) {
            return null;
        }
        const NAXIS1 = ParseHeader.getFITSItemValue(header, FITSHeaderManager.NAXIS1);
        if (NAXIS1 === null) {
            return null;
        }
        const NAXIS2 = ParseHeader.getFITSItemValue(header, FITSHeaderManager.NAXIS2);
        if (NAXIS2 === null) {
            return null;
        }
        const DATAMIN = ParseHeader.getFITSItemValue(header, FITSHeaderManager.DATAMIN);
        const DATAMAX = ParseHeader.getFITSItemValue(header, FITSHeaderManager.DATAMAX);
        if (!BITPIX || !NAXIS1 || !NAXIS2) {
            return null; // return early if invalid data.
        }
        if (!DATAMAX || !DATAMIN) {
            const [min, max] = ParsePayload.computePhysicalValues(rawData, header);
            if (min && max) {
                const maxitem = new FITSHeaderItem("DATAMAX", min, "computed by jsfitsio");
                const minitem = new FITSHeaderItem("DATAMIN", max, "computed by jsfitsio");
                header.insert(maxitem);
                header.insert(minitem);
            }
        }
        const endItem = new FITSHeaderItem('END', "", "");
        header.insert(endItem);
        return header;
        // TODO: END tag shall be added here
    }
    static computePhysicalValues(rawData, header) {
        const BITPIX = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BITPIX);
        if (BITPIX === null || isNaN(BITPIX)) {
            return [null, null];
        }
        const BLANK = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BLANK);
        if (BLANK === null || isNaN(BITPIX)) {
            return [null, null];
        }
        let BZERO = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BZERO);
        if (BZERO === null) {
            BZERO = 0;
        }
        let BSCALE = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BSCALE);
        if (BSCALE === null) {
            BSCALE = 1;
        }
        let i = 0;
        const bytesXelem = Math.abs(BITPIX / 8);
        const pxLength = rawData.byteLength / bytesXelem;
        let min = null;
        let max = null;
        let physicalblank = null;
        if (BLANK) {
            physicalblank = ParsePayload.pixel2physicalValue(BLANK, BSCALE, BZERO);
        }
        while (i < pxLength) {
            let px_val = ParsePayload.extractPixelValue(rawData, bytesXelem * i, BITPIX);
            if (px_val === null) {
                i++;
                continue;
            }
            let ph_val = ParsePayload.pixel2physicalValue(px_val, BSCALE, BZERO);
            if (!min) {
                min = ph_val;
            }
            if (!max) {
                max = ph_val;
            }
            // check this block if it is still applicable
            if (physicalblank === null || physicalblank !== ph_val) {
                if (ph_val !== null && (ph_val < min || min === null)) {
                    min = ph_val;
                }
                if (ph_val !== null && (ph_val > max || max === null)) {
                    max = ph_val;
                }
            }
            i++;
        }
        return [min, max];
    }
    static pixel2physicalValue(pxval, BSCALE, BZERO) {
        if (BZERO === null || BSCALE === null) {
            throw new Error("Either BZERO or BSCALE is null");
        }
        return BZERO + BSCALE * pxval;
    }
    static extractPixelValue(rawData, offset, BITPIX) {
        let px_val = null; // pixel value
        if (BITPIX == 16) {
            // 16-bit 2's complement binary integer
            px_val = ParseUtils.parse16bit2sComplement(rawData[offset], rawData[offset + 1]);
        }
        else if (BITPIX == 32) {
            // IEEE 754 half precision (float16) ??
            px_val = ParseUtils.parse32bit2sComplement(rawData[offset], rawData[offset + 1], rawData[offset + 2], rawData[offset + 3]);
        }
        else if (BITPIX == -32) {
            // 32-bit IEEE single-precision floating point
            // px_val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this._u8data[offset], this._u8data[offset+1], this._u8data[offset+2], this._u8data[offset+3]);
            px_val = ParseUtils.parseFloatingPointFormat(rawData.slice(offset, offset + 4), 8, 23);
        }
        else if (BITPIX == 64) {
            // 64-bit 2's complement binary integer
            throw new Error("BITPIX=64 -> 64-bit 2's complement binary integer NOT supported yet.");
        }
        else if (BITPIX == -64) {
            // 64-bit IEEE double-precision floating point
            //https://babbage.cs.qc.cuny.edu/ieee-754.old/Decimal.html
            px_val = ParseUtils.parseFloatingPointFormat(rawData.slice(offset, offset + 8), 11, 52);
        }
        return px_val;
    }
}
//# sourceMappingURL=ParsePayload.js.map
;// CONCATENATED MODULE: ./node_modules/jsfitsio/lib-esm/FITSParser.js




class FITSParser {
    static async loadFITS(url) {
        try {
            const uint8data = await FITSParser.getFile(url);
            if (uint8data?.byteLength) {
                const fits = FITSParser.processFits(uint8data);
                return fits;
            }
        }
        catch (error) {
            console.error("Error loading FITS file:", error);
        }
        return null;
    }
    static processFits(rawdata) {
        const header = ParseHeader.parse(rawdata);
        const headerFinalised = ParsePayload.computePhysicalMinAndMax(header, rawdata);
        if (headerFinalised == null) {
            return null;
        }
        // Assuming no additional header blocks
        const dataOffset = 2880;
        const payloadBuffer = new Uint8Array(rawdata.slice(dataOffset));
        // --- pad payload to multiple of 2880 ---
        const paddedPayload = padTo2880(payloadBuffer);
        const payloadMatrix = FITSParser.createMatrix(paddedPayload, header);
        return {
            header: headerFinalised,
            data: payloadMatrix
        };
        // helper
        function padTo2880(buf) {
            const remainder = buf.length % 2880;
            if (remainder === 0)
                return buf;
            const padded = new Uint8Array(buf.length + (2880 - remainder));
            padded.set(buf);
            // the extra bytes are left as 0 (valid FITS padding)
            return padded;
        }
    }
    static createMatrix(payload, header) {
        const NAXIS1 = ParseHeader.getFITSItemValue(header, FITSHeaderManager.NAXIS1);
        if (NAXIS1 === null) {
            throw new Error("NAXIS1 not defined.");
        }
        const NAXIS2 = ParseHeader.getFITSItemValue(header, FITSHeaderManager.NAXIS2);
        if (NAXIS2 === null) {
            throw new Error("NAXIS2 not defined.");
        }
        const BITPIX = ParseHeader.getFITSItemValue(header, FITSHeaderManager.BITPIX);
        if (BITPIX === null) {
            throw new Error("BITPIX not defined.");
        }
        const bytesXelem = Math.abs(BITPIX / 8);
        // if (payload.length !== NAXIS1 * NAXIS2 * bytesXelem) {
        //   throw new Error("Payload size does not match the expected matrix dimensions.");
        // }
        // const matrix: Array<Uint8Array> = [];
        const matrix = [];
        for (let i = 0; i < NAXIS2; i++) {
            matrix.push(payload.slice(i * NAXIS1 * bytesXelem, (i + 1) * NAXIS1 * bytesXelem));
        }
        return matrix;
    }
    // static generateFITSForWeb(fitsParsed: FITSParsed) {
    //   return FITSWriter.typedArrayToURL(fitsParsed)
    // }
    static saveFITSLocally(fitsParsed, path) {
        return FITSWriter.writeFITSFile(fitsParsed, path);
    }
    static async getFile(uri) {
        if (!uri.substring(0, 5).toLowerCase().includes("http")) {
            const p = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 64));
            const rawData = await p.getLocalFile(uri);
            if (rawData?.length) {
                const uint8 = new Uint8Array(rawData);
                return uint8;
            }
            return new Uint8Array(0);
        }
        else {
            const p = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 911));
            const rawData = await p.getFile(uri);
            if (rawData?.byteLength) {
                const uint8 = new Uint8Array(rawData);
                return uint8;
            }
            return new Uint8Array(0);
        }
    }
}
// const url = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix47180.fits"
// FITSParser.loadFITS(url).then((fits) => {
//   if (fits == null) {
//     return null
//   }
//   const path = "./fitsTest1.fits"
//   console.log(fits.header)
//   FITSParser.saveFITSLocally(fits, path)
//   console.log("finished")
// })
// // const file = "/Users/fabriziogiordano/Desktop/PhD/code/new/FITSParser/tests/inputs/empty.fits"
// const file = "/Users/fabriziogiordano/Desktop/PhD/code/new/FITSParser/tests/inputs/Npix43348.fits"
// FITSParser.loadFITS(file).then((fits) => {
//   if (fits == null) {
//     return null
//   }
//   const path = "./fitsTest2.fits"
//   console.log(fits.header)
//   FITSParser.saveFITSLocally(fits, path)
//   console.log("finished")
// })
//# sourceMappingURL=FITSParser.js.map
;// CONCATENATED MODULE: ./src/projections/AbstractProjection.ts
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class AbstractProjection {
}

;// CONCATENATED MODULE: ./src/model/NumberType.ts
var NumberType;
(function (NumberType) {
    NumberType[NumberType["DEGREES"] = 0] = "DEGREES";
    NumberType[NumberType["RADIANS"] = 1] = "RADIANS";
    NumberType[NumberType["DECIMAL"] = 2] = "DECIMAL";
    NumberType[NumberType["HMS"] = 3] = "HMS";
    NumberType[NumberType["DMS"] = 4] = "DMS";
})(NumberType || (NumberType = {}));

;// CONCATENATED MODULE: ./src/model/Utils.ts
/**
 * @author Fabrizio Giordano (Fab)
 */
// import vec3 from 'gl-matrix';

function Utils() {
}
function cartesianToSpherical(xyz) {
    let dotXYZ = dot(xyz, xyz);
    let r = Math.sqrt(dotXYZ);
    let thetaRad = Math.acos(xyz.z / r);
    let thetaDeg = radToDeg(thetaRad);
    // NB: in atan(y/x) is written with params switched atan2(x, y)
    let phiRad = Math.atan2(xyz.y, xyz.x);
    let phiDeg = radToDeg(phiRad);
    if (phiDeg < 0) {
        phiDeg += 360;
    }
    return {
        phiDeg: phiDeg,
        thetaDeg: thetaDeg,
        phiRad: phiRad,
        thetaRad: thetaRad
    };
}
;
function sphericalToAstro(phiTheta) {
    let raDeg;
    let decDeg;
    raDeg = phiTheta.phiDeg;
    if (raDeg < 0) {
        raDeg += 360;
    }
    decDeg = 90 - phiTheta.thetaDeg;
    return {
        "raDeg": raDeg,
        "decDeg": decDeg,
        "raRad": degToRad(raDeg),
        "decRad": degToRad(decDeg)
    };
}
function astroToSpherical(raDec) {
    let phiDeg;
    let thetaDeg;
    phiDeg = raDec.raDeg;
    if (phiDeg < 0) {
        phiDeg += 360;
    }
    thetaDeg = 90 - raDec.decDeg;
    return {
        "phiDeg": phiDeg,
        "thetaDeg": thetaDeg,
        "phiRad": degToRad(phiDeg),
        "thetaRad": degToRad(thetaDeg),
    };
}
function sphericalToCartesian(phiTheta, r) {
    r = (r == undefined) ? 1 : r;
    var x = r * Math.sin(phiTheta.thetaRad) * Math.cos(phiTheta.phiRad);
    var y = r * Math.sin(phiTheta.thetaRad) * Math.sin(phiTheta.phiRad);
    var z = r * Math.cos(phiTheta.thetaRad);
    return {
        "x": x,
        "y": y,
        "z": z
    };
}
;
function fillAstro(ra, dec, unit) {
    if (unit == NumberType.DEGREES) {
        return {
            "raDeg": ra,
            "decDeg": dec,
            "raRad": degToRad(ra),
            "decRad": degToRad(dec)
        };
    }
    else if (unit == NumberType.RADIANS) {
        return {
            "raRad": ra,
            "decRad": dec,
            "raDeg": radToDeg(ra),
            "decDeg": radToDeg(dec)
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
        return null;
    }
}
function fillSpherical(phi, theta, unit) {
    if (unit == NumberType.DEGREES) {
        return {
            "phiDeg": phi,
            "thetaDeg": theta,
            "phiRad": degToRad(phi),
            "thetaRad": degToRad(theta)
        };
    }
    else if (unit == NumberType.RADIANS) {
        return {
            "phiDeg": radToDeg(phi),
            "thetaDeg": radToDeg(theta),
            "phiRad": phi,
            "thetaRad": theta
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
        return null;
    }
}
function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function colorHex2RGB(hexColor) {
    //	console.log(hexColor);
    var hex1 = hexColor.substring(1, 3);
    var hex2 = hexColor.substring(3, 5);
    var hex3 = hexColor.substring(5, 7);
    var dec1 = parseInt(hex1, 16);
    var dec2 = parseInt(hex2, 16);
    var dec3 = parseInt(hex3, 16);
    var rgb1 = (dec1 / 255).toFixed(2);
    var rgb2 = (dec2 / 255).toFixed(2);
    var rgb3 = (dec3 / 255).toFixed(2);
    return [parseFloat(rgb1), parseFloat(rgb2), parseFloat(rgb3)];
}
function degToRad(degrees) {
    return (degrees / 180) * Math.PI;
}
function radToDeg(radians) {
    return radians * 180 / Math.PI;
}
function raDegToHMS(raDeg) {
    var h = Math.floor(raDeg / 15);
    var m = Math.floor((raDeg / 15 - h) * 60);
    var s = (raDeg / 15 - h - m / 60) * 3600;
    return {
        h: h,
        m: m,
        s: s
    };
}
function decDegToDMS(decDeg) {
    var sign = 1;
    if (decDeg < 0) {
        sign = -1;
    }
    var decDeg_abs = Math.abs(decDeg);
    var d = Math.trunc(decDeg_abs);
    var m = Math.trunc((decDeg_abs - d) * 60);
    var s = (decDeg_abs - d - m / 60) * 3600;
    d = d * sign;
    return {
        d: d,
        m: m,
        s: s
    };
}
function dms2DecDeg(decDMS) {
    var sign = Math.sign(decDMS.d);
    var deg = (decDMS.d) + sign * (decDMS.m / 60) + sign * (decDMS.s / 3600);
    return deg;
}
function hms2RaDeg(raHMS) {
    var sign = Math.sign(raHMS.h);
    var deg = (raHMS.h + sign * (raHMS.m / 60) + sign * (raHMS.s / 3600)) * 15;
    return deg;
}
function worldToModel(xy, radius) {
    var x = xy[0];
    var y = xy[1];
    var z = Math.sqrt(radius * radius - xy[0] * xy[0] - xy[1] * xy[1]);
    return [x, y, z];
}

;// CONCATENATED MODULE: ./src/model/CoordsType.ts
/**
 * @author Fabrizio Giordano (Fab77)
 * Enum for coordinate types.
 * @readonly
 * @enum {{name: string, hex: string}}
 */
var CoordsType;
(function (CoordsType) {
    CoordsType["CARTESIAN"] = "cartesian";
    CoordsType["SPHERICAL"] = "spherical";
    CoordsType["ASTRO"] = "astro";
})(CoordsType || (CoordsType = {}));

;// CONCATENATED MODULE: ./src/Config.ts
class Config {
    static MAX_DECIMALS = 12;
}

;// CONCATENATED MODULE: ./src/model/Point.ts
/**
 * @author Fabrizio Giordano (Fab77)
 */



const wrap360 = (deg) => ((deg % 360) + 360) % 360;
const clampDec = (deg) => Math.max(-90, Math.min(90, deg));
class Point {
    astro;
    spherical;
    cartesian;
    constructor(in_type, unit, ...coords) {
        if (in_type === CoordsType.CARTESIAN) {
            // Initialise cartesian first (avoid writing into undefined)
            this.cartesian = {
                x: parseFloat(coords[0].toFixed(Config.MAX_DECIMALS)),
                y: parseFloat(coords[1].toFixed(Config.MAX_DECIMALS)),
                z: parseFloat(coords[2].toFixed(Config.MAX_DECIMALS))
            };
            this.spherical = cartesianToSpherical(this.cartesian);
            this.astro = sphericalToAstro(this.spherical);
        }
        else if (in_type === CoordsType.ASTRO) {
            const c = fillAstro(coords[0], coords[1], unit);
            if (!c)
                throw new Error('Invalid Astro coordinates');
            this.astro = c;
            this.spherical = astroToSpherical(this.astro);
            this.cartesian = sphericalToCartesian(this.spherical, 1.0);
        }
        else if (in_type === CoordsType.SPHERICAL) {
            const s = fillSpherical(coords[0], coords[1], unit);
            if (!s)
                throw new Error('Invalid Spherical coordinates');
            this.spherical = s;
            this.cartesian = sphericalToCartesian(this.spherical, 1.0);
            this.astro = sphericalToAstro(this.spherical);
        }
        else {
            throw new Error(`CoordsType ${in_type} not recognised.`);
        }
        // --- Normalise & keep systems consistent ---
        // Robust wrap for RA/phi
        const raWrapped = wrap360(this.astro.raDeg);
        const phiWrapped = wrap360(this.spherical.phiDeg);
        // Only reassign if changed (avoids unnecessary recompute)
        if (raWrapped !== this.astro.raDeg) {
            this.astro.raDeg = raWrapped;
            // keep spherical/cartesian aligned with astro
            this.spherical = astroToSpherical(this.astro);
            this.cartesian = sphericalToCartesian(this.spherical, 1.0);
        }
        if (phiWrapped !== this.spherical.phiDeg) {
            this.spherical.phiDeg = phiWrapped;
            // keep astro/cartesian aligned with spherical
            this.cartesian = sphericalToCartesian(this.spherical, 1.0);
            this.astro = sphericalToAstro(this.spherical);
        }
        // Clamp Dec defensively and re-sync if it changed
        const decClamped = clampDec(this.astro.decDeg);
        if (decClamped !== this.astro.decDeg) {
            this.astro.decDeg = decClamped;
            this.spherical = astroToSpherical(this.astro);
            this.cartesian = sphericalToCartesian(this.spherical, 1.0);
        }
    }
    getSpherical() {
        return this.spherical;
    }
    getAstro() {
        return this.astro;
    }
    getCartesian() {
        return this.cartesian;
    }
}

;// CONCATENATED MODULE: ./src/projections/MinMaxValue.ts
class MinMaxValue {
    min;
    max;
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    getMinValue() {
        return this.min;
    }
    getMaxValue() {
        return this.max;
    }
}

;// CONCATENATED MODULE: ./src/projections/RADecMinMaxCentral.ts
class RADecMinMaxCentral {
    centralRA;
    centralDec;
    minRA;
    minDec;
    maxRA;
    maxDec;
    constructor(centralRA, centralDec, minRA, minDec, maxRA, maxDec) {
        this.centralDec = centralDec;
        this.centralRA = centralRA;
        this.maxDec = maxDec;
        this.maxRA = maxRA;
        this.minRA = minRA;
        this.minDec = minDec;
    }
    getMinRA() {
        return this.minRA;
    }
    getMinDec() {
        return this.minDec;
    }
    getMaxRA() {
        return this.maxRA;
    }
    getMaxDec() {
        return this.maxDec;
    }
    getCentralRA() {
        return this.centralRA;
    }
    getCentralDec() {
        return this.centralDec;
    }
    setMinRA(minRA) {
        this.minRA = minRA;
    }
    setMinDec(minDec) {
        this.minDec = minDec;
    }
    setMaxRA(maxRA) {
        this.maxRA = maxRA;
    }
    setMaxDec(maxDec) {
        this.maxDec = maxDec;
    }
    setCentralRA(cRA) {
        this.centralRA = cRA;
    }
    setCentralDec(cDec) {
        this.centralDec = cDec;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/TilesRaDecList2.ts


class TilesRaDecList2 {
    // hipsOrder: number
    tileList;
    imagePixelList;
    minPixelValue = null;
    maxPixelValue = null;
    BZERO = null;
    BSCALE = null;
    BLANK = null;
    // constructor(hipsOrder: number) {
    //     this.hipsOrder = hipsOrder
    constructor() {
        this.tileList = [];
        this.imagePixelList = new Array();
    }
    setBZERO(BZERO) {
        this.BZERO = BZERO;
    }
    setBSCALE(BSCALE) {
        this.BSCALE = BSCALE;
    }
    setBLANK(BLANK) {
        this.BLANK = BLANK;
    }
    getBZERO() {
        return this.BZERO;
    }
    getBSCALE() {
        return this.BSCALE;
    }
    getBLANK() {
        return this.BLANK;
    }
    findImagePixel(i, j) {
        return this.imagePixelList.find(p => p.i === i && p.j === j) || null;
    }
    getImagePixelsByTile(tileno) {
        return this.imagePixelList.filter(p => p.tileno === tileno);
    }
    getImagePixelList() {
        return this.imagePixelList;
    }
    getTilesList() {
        return this.tileList;
    }
    addImagePixel(imgpx) {
        this.imagePixelList.push(imgpx);
    }
    addTileNumber(tileno) {
        if (!this.tileList.includes(tileno)) {
            this.tileList.push(tileno);
        }
    }
    computeRADecMinMaxCentral() {
        if (this.imagePixelList.length === 0)
            return null;
        // Single pass, skip non-finite values
        let minRA = Infinity, maxRA = -Infinity;
        let minDec = Infinity, maxDec = -Infinity;
        for (const p of this.imagePixelList) {
            if (Number.isFinite(p.ra)) {
                if (p.ra < minRA)
                    minRA = p.ra;
                if (p.ra > maxRA)
                    maxRA = p.ra;
            }
            if (Number.isFinite(p.dec)) {
                if (p.dec < minDec)
                    minDec = p.dec;
                if (p.dec > maxDec)
                    maxDec = p.dec;
            }
        }
        // If all values were non-finite, bail out
        if (!Number.isFinite(minRA) || !Number.isFinite(maxRA) ||
            !Number.isFinite(minDec) || !Number.isFinite(maxDec)) {
            return null;
        }
        const cRA = minRA + (maxRA - minRA) / 2;
        const cDec = minDec + (maxDec - minDec) / 2;
        return new RADecMinMaxCentral(cRA, cDec, minRA, minDec, maxRA, maxDec);
    }
    setMinMaxValue(value) {
        if (!value)
            return;
        if (!this.minPixelValue) {
            this.minPixelValue = value;
        }
        else if (value < this.minPixelValue) {
            this.minPixelValue = value;
        }
        if (!this.maxPixelValue) {
            this.maxPixelValue = value;
        }
        else if (value > this.minPixelValue) {
            this.maxPixelValue = value;
        }
    }
    getMinMaxValues() {
        if (this.minPixelValue && this.maxPixelValue) {
            return new MinMaxValue(this.minPixelValue, this.maxPixelValue);
        }
        return null;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/ImagePixel.ts

class ImagePixel {
    i;
    j;
    ra;
    dec;
    tileno;
    uint8value = null;
    value = null;
    constructor(a, b, tileno) {
        this.tileno = tileno;
        // Heuristic: if `a` and `b` are integers, treat them as `i` and `j`
        if (Number.isInteger(a) && Number.isInteger(b)) {
            this.i = a;
            this.j = b;
            this.ra = NaN;
            this.dec = NaN;
        }
        else {
            this.ra = a;
            this.dec = b;
            this.i = -1;
            this.j = -1;
        }
    }
    geti() {
        return this.i;
    }
    getj() {
        return this.j;
    }
    getRADeg() {
        return this.ra;
    }
    getDecDeg() {
        return this.dec;
    }
    getUint8Value() {
        return this.uint8value;
    }
    getValue() {
        return this.value;
    }
    setValue(value, bitpix) {
        if (this.uint8value == undefined) {
            const bytesXelem = Math.abs(bitpix / 8);
            this.uint8value = new Uint8Array(bytesXelem);
        }
        this.uint8value = value;
        this.value = ParseUtils.extractPixelValue(0, value, bitpix);
    }
    setTileNumber(tileno) {
        this.tileno = tileno;
    }
    setij(i, j) {
        this.i = i;
        this.j = j;
    }
    setRADecDeg(ra, dec) {
        this.ra = ra;
        this.dec = dec;
    }
}

;// CONCATENATED MODULE: ./src/model/FITS.ts
class FITS {
    header;
    payload = [];
    constructor(header, data) {
        this.header = header;
        this.setData(data);
    }
    setData(data) {
        this.payload = Array.from(data.values()).flatMap(row => row);
    }
    getHeader() {
        return this.header;
    }
    getData() {
        return this.payload;
    }
}

;// CONCATENATED MODULE: ./src/Version.ts
// // src/version.ts
// let ver = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : undefined;
const APP_VERSION = "1.2.1";

;// CONCATENATED MODULE: ./src/projections/mercator/MercatorProjection.ts
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */








 // adjust path as needed
// import { HiPSProp } from '../hips/HiPSProp.js';
class MercatorProjection extends AbstractProjection {
    minra;
    mindec;
    naxis1;
    naxis2;
    bitpix;
    fitsheader;
    pxvalues;
    CTYPE1 = "'RA---CAR'";
    CTYPE2 = "'DEC--CAR'";
    craDeg;
    cdecDeg;
    pxsize;
    pxsize1;
    pxsize2;
    // _minphysicalval!: number;
    // _maxphysicalval!: number;
    _wcsname;
    constructor() {
        super();
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this.pxvalues = new Array();
        this.fitsheader = new FITSHeaderManager();
    }
    async initFromFile(infile) {
        const fits = await FITSParser.loadFITS(infile);
        if (!fits) {
            console.error("FITS is null");
            throw new Error("FITS is null");
        }
        this.pxvalues = fits.data;
        this.fitsheader = fits.header;
        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        this.bitpix = fits.header.findById("BITPIX")?.value;
        this.craDeg = fits.header.findById("CRVAL1")?.value;
        this.cdecDeg = fits.header.findById("CRVAL2")?.value;
        const pxsize1 = this.fitsheader.findById("CDELT1")?.value;
        const pxsize2 = this.fitsheader.findById("CDELT2")?.value;
        if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
            throw new Error("pxsize1 is not equal to pxsize2");
        }
        this.pxsize = pxsize1;
        this.minra = this.craDeg - this.pxsize * this.naxis1 / 2;
        if (this.minra < 0) {
            this.minra += 360;
        }
        // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
        this.mindec = this.cdecDeg - this.pxsize * this.naxis2 / 2;
        return fits;
    }
    getBytePerValue() {
        return Math.abs(this.bitpix / 8);
    }
    extractPhysicalValues(fits) {
        const bzero = Number(fits.header.findById("BZERO")?.value);
        const bscale = Number(fits.header.findById("BSCALE")?.value);
        const naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        const naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        const bitpix = Number(fits.header.findById("BITPIX")?.value);
        const bytesXelem = Math.abs(bitpix / 8);
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                const pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                if (pixval) {
                    let physicalVal = bzero + bscale * pixval;
                    physicalvalues[n2][n1] = physicalVal;
                }
            }
        }
        return physicalvalues;
    }
    prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue) {
        const fitsheader = new FITSHeaderManager();
        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
        fitsheader.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        fitsheader.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        fitsheader.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        fitsheader.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT1", pixelAngSize, "")); // ??? Pixel spacing along axis 1 ???
        fitsheader.insert(new FITSHeaderItem("CDELT2", pixelAngSize, "")); // ??? Pixel spacing along axis 2 ???
        fitsheader.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, "")); // central/reference pixel i along naxis1
        fitsheader.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, "")); // central/reference pixel j along naxis2
        fitsheader.insert(new FITSHeaderItem("CRVAL1", cRA, "")); // central/reference pixel RA
        fitsheader.insert(new FITSHeaderItem("CRVAL2", cDec, "")); // central/reference pixel Dec
        const min = BZERO + BSCALE * minValue;
        const max = BZERO + BSCALE * maxValue;
        fitsheader.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
        fitsheader.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value
        fitsheader.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
        fitsheader.insert(new FITSHeaderItem("END", "", ""));
        return fitsheader;
    }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getFITSHeader() {
        return this.fitsheader;
    }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getCommonFitsHeaderParams() {
        let header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                const value = item.value;
                header.insert(new FITSHeaderItem(key, value, ""));
            }
        }
        return header;
    }
    computeNaxisWidth(radius, pxsize) {
        return Math.ceil(2 * radius / pxsize);
    }
    getImageRADecList(center, radius, pxsize, naxisWidth) {
        const naxis1 = naxisWidth;
        const naxis2 = naxis1;
        let minra = center.getAstro().raDeg - radius;
        if (minra < 0) {
            minra += 360;
        }
        const mindec = center.getAstro().decDeg - radius;
        const tilesRaDecList = new TilesRaDecList2();
        // let radeclist: Array<[number, number]> = new Array<[number, number]>();
        // let centralRa, centralDec
        for (let d = 0; d < naxis2; d++) {
            for (let r = 0; r < naxis1; r++) {
                tilesRaDecList.addImagePixel(new ImagePixel(minra + (r * pxsize), mindec + (d * pxsize), undefined));
                // radeclist.push([minra + (r * pxsize), mindec + (d * pxsize)]);
            }
        }
        const centralImgpx = tilesRaDecList.getImagePixelList().length / 2 - 1;
        // let cidx = (naxis2 / 2) * naxis1 + naxis1 / 2;
        // if (naxis1 % 2 != 0) {
        //     cidx = Math.floor(radeclist.length / 2);
        // }
        // this._craDeg = radeclist[cidx][0];
        // this._cdecDeg = radeclist[cidx][1];
        // return radeclist
        return tilesRaDecList;
    }
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i, j, pxsize, minra, mindec) {
        let ra;
        let dec;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * pxsize + minra;
        dec = j * pxsize + mindec;
        let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];
    }
    setPixelValues(raDecList, header) {
        const BITPIX = header.findById("BITPIX")?.value;
        if (!Number.isFinite(BITPIX)) {
            throw new Error("BITPIX not found or invalid in header");
        }
        const bytesPerElem = Math.abs(BITPIX) / 8;
        const width = header.findById("NAXIS1")?.value;
        const height = header.findById("NAXIS2")?.value ?? width; // fallback if square
        if (!Number.isFinite(width) || width <= 0)
            throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0)
            throw new Error("NAXIS2 not found or invalid");
        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }
        // Map<rowIndex, Uint8Array[]>, each row has length = width
        const pxvalues = new Map();
        for (let r = 0; r < height; r++) {
            pxvalues.set(r, new Array(width));
        }
        // Fill in row-major order: for each linear index, compute (row, col)
        for (let idx = 0; idx < pixels.length; idx++) {
            const row = Math.floor(idx / width);
            const col = idx % width;
            const rowArr = pxvalues.get(row);
            let u8 = pixels[idx].getUint8Value();
            if (u8 == null) {
                // Your pipeline’s ImagePixel.setValue() should have set this already.
                // Throwing is safer than inventing packing (FITS expects specific endian/precision).
                throw new Error(`Pixel (${row},${col}) missing Uint8Array for BITPIX=${BITPIX}`);
            }
            if (u8.byteLength !== bytesPerElem) {
                throw new Error(`Pixel (${row},${col}) byteLength=${u8.byteLength} != expected ${bytesPerElem} (BITPIX=${BITPIX})`);
            }
            rowArr[col] = u8;
            // no need to pxvalues.set(row, rowArr); reference already updated
        }
        return new FITS(header, pxvalues);
    }
    generateFITSFile(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues) {
        const header = this.prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue);
        const fits = this.setPixelValues(raDecWithValues, header);
        return fits;
    }
    world2pix(raDecList) {
        const bytesXvalue = this.getBytePerValue();
        // TODO if I have the this.fitsheader available here, check if I can retrieve this.bitpix, this.pxsize, ... with this.fitsheader
        // and remove the attributes at object level (with this)
        const blank = Number(this.fitsheader.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);
        for (let imgPx of raDecList.getImagePixelList()) {
            // console.log("raDeclist.getImagePixelList().indexOf(imgPx) " + raDeclist.getImagePixelList().indexOf(imgPx))
            const ra = imgPx.getRADeg();
            const dec = imgPx.getDecDeg();
            const i = Math.floor((ra - this.minra) / this.pxsize);
            const j = Math.floor((dec - this.mindec) / this.pxsize);
            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                imgPx.setValue(blankBytes, this.bitpix);
            }
            else {
                const currentValue = this.pxvalues[j].slice(i * bytesXvalue, (i + 1) * bytesXvalue);
                imgPx.setValue(currentValue, this.bitpix);
            }
            raDecList.setMinMaxValue(imgPx.getValue());
        }
        return raDecList;
    }
}

;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Constants.js
class Constants {
}
//	static halfpi = Math.PI/2.;
Constants.halfpi = 1.5707963267948966;
Constants.inv_halfpi = 2. / Math.PI;
/** The Constant twopi. */
Constants.twopi = 2 * Math.PI;
Constants.inv_twopi = 1. / (2 * Math.PI);
//# sourceMappingURL=Constants.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Zphi.js
class Zphi {
    /** Creation from individual components */
    constructor(z_, phi_) {
        this.z = z_;
        this.phi = phi_;
    }
    ;
}
//# sourceMappingURL=Zphi.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Hploc.js


class Hploc {
    constructor(ptg) {
        Hploc.PI4_A = 0.7853981554508209228515625;
        Hploc.PI4_B = 0.794662735614792836713604629039764404296875e-8;
        Hploc.PI4_C = 0.306161699786838294306516483068750264552437361480769e-16;
        Hploc.M_1_PI = 0.3183098861837906715377675267450287;
        if (ptg) {
            this.sth = 0.0;
            this.have_sth = false;
            this.z = Hploc.cos(ptg.theta);
            this._phi = ptg.phi;
            if (Math.abs(this.z) > 0.99) {
                this.sth = Hploc.sin(ptg.theta);
                this.have_sth = true;
            }
        }
    }
    setZ(z) {
        this.z = z;
    }
    ;
    get phi() {
        return this._phi;
    }
    ;
    set phi(phi) {
        this._phi = phi;
    }
    ;
    setSth(sth) {
        this.sth = sth;
    }
    ;
    toVec3() {
        var st = this.have_sth ? this.sth : Math.sqrt((1.0 - this.z) * (1.0 + this.z));
        // var vector = new Vec3(st*Hploc.cos(this.phi),st*Hploc.sin(this.phi),this.z);
        var vector = new Vec3(st * Math.cos(this.phi), st * Math.sin(this.phi), this.z);
        return vector;
    }
    ;
    toZphi() {
        return new Zphi(this.z, this.phi);
    }
    static sin(d) {
        let u = d * Hploc.M_1_PI;
        let q = Math.floor(u < 0 ? u - 0.5 : u + 0.5);
        let x = 4.0 * q;
        d -= x * Hploc.PI4_A;
        d -= x * Hploc.PI4_B;
        d -= x * Hploc.PI4_C;
        if ((q & 1) != 0) {
            d = -d;
        }
        return this.sincoshelper(d);
    }
    ;
    static cos(d) {
        //		let u = d * Hploc.M_1_PI - 0.5;
        let u = d * Hploc.M_1_PI - 0.5;
        //		u -= 0.5;
        let q = 1 + 2 * Math.floor(u < 0 ? u - 0.5 : u + 0.5);
        let x = 2.0 * q;
        let t = x * Hploc.PI4_A;
        d = d - t;
        d -= x * Hploc.PI4_B;
        d -= x * Hploc.PI4_C;
        if ((q & 2) == 0) {
            d = -d;
        }
        return Hploc.sincoshelper(d);
    }
    ;
    static sincoshelper(d) {
        let s = d * d;
        let u = -7.97255955009037868891952e-18;
        u = u * s + 2.81009972710863200091251e-15;
        u = u * s - 7.64712219118158833288484e-13;
        u = u * s + 1.60590430605664501629054e-10;
        u = u * s - 2.50521083763502045810755e-08;
        u = u * s + 2.75573192239198747630416e-06;
        u = u * s - 0.000198412698412696162806809;
        u = u * s + 0.00833333333333332974823815;
        u = u * s - 0.166666666666666657414808;
        return s * u * d + d;
    }
    ;
    /** This method calculates the arc sine of x in radians. The return
    value is in the range [-pi/2, pi/2]. The results may have
    maximum error of 3 ulps. */
    static asin(d) {
        return Hploc.mulsign(Hploc.atan2k(Math.abs(d), Math.sqrt((1 + d) * (1 - d))), d);
    }
    ;
    /** This method calculates the arc cosine of x in radians. The
        return value is in the range [0, pi]. The results may have
        maximum error of 3 ulps. */
    static acos(d) {
        return Hploc.mulsign(Hploc.atan2k(Math.sqrt((1 + d) * (1 - d)), Math.abs(d)), d) + (d < 0 ? Math.PI : 0);
    }
    ;
    static mulsign(x, y) {
        let sign = Hploc.copySign(1, y);
        return sign * x;
    }
    ;
    static copySign(magnitude, sign) {
        return sign < 0 ? -Math.abs(magnitude) : Math.abs(magnitude);
        // let finalsign = 1;
        // if (Object.is(finalsign , -0)){
        // 	sign = -1;
        // }else if (Object.is(finalsign , 0)){
        // 	sign = 1;
        // }else {
        // 	sign = Math.sign(finalsign);
        // }
        // return finalsign * magnitude;
    }
    static atanhelper(s) {
        let t = s * s;
        let u = -1.88796008463073496563746e-05;
        u = u * t + (0.000209850076645816976906797);
        u = u * t + (-0.00110611831486672482563471);
        u = u * t + (0.00370026744188713119232403);
        u = u * t + (-0.00889896195887655491740809);
        u = u * t + (0.016599329773529201970117);
        u = u * t + (-0.0254517624932312641616861);
        u = u * t + (0.0337852580001353069993897);
        u = u * t + (-0.0407629191276836500001934);
        u = u * t + (0.0466667150077840625632675);
        u = u * t + (-0.0523674852303482457616113);
        u = u * t + (0.0587666392926673580854313);
        u = u * t + (-0.0666573579361080525984562);
        u = u * t + (0.0769219538311769618355029);
        u = u * t + (-0.090908995008245008229153);
        u = u * t + (0.111111105648261418443745);
        u = u * t + (-0.14285714266771329383765);
        u = u * t + (0.199999999996591265594148);
        u = u * t + (-0.333333333333311110369124);
        return u * t * s + s;
    }
    ;
    static atan2k(y, x) {
        let q = 0.;
        if (x < 0) {
            x = -x;
            q = -2.;
        }
        if (y > x) {
            let t = x;
            x = y;
            y = -t;
            q += 1.;
        }
        return Hploc.atanhelper(y / x) + q * (Math.PI / 2);
    }
    ;
    /** This method calculates the arc tangent of y/x in radians, using
    the signs of the two arguments to determine the quadrant of the
    result. The results may have maximum error of 2 ulps. */
    static atan2(y, x) {
        let r = Hploc.atan2k(Math.abs(y), x);
        r = Hploc.mulsign(r, x);
        if (Hploc.isinf(x) || x == 0) {
            r = Math.PI / 2 - (Hploc.isinf(x) ? (Hploc.copySign(1, x) * (Math.PI / 2)) : 0);
        }
        if (Hploc.isinf(y)) {
            r = Math.PI / 2 - (Hploc.isinf(x) ? (Hploc.copySign(1, x) * (Math.PI * 1 / 4)) : 0);
        }
        if (y == 0) {
            r = (Hploc.copySign(1, x) == -1 ? Math.PI : 0);
        }
        return Hploc.isnan(x) || Hploc.isnan(y) ? NaN : Hploc.mulsign(r, y);
    }
    ;
    /** Checks if the argument is a NaN or not. */
    static isnan(d) {
        return d != d;
    }
    ;
    /** Checks if the argument is either positive or negative infinity. */
    static isinf(d) {
        return Math.abs(d) === +Infinity;
    }
    ;
}
Hploc.PI4_A = 0.7853981554508209228515625;
Hploc.PI4_B = 0.794662735614792836713604629039764404296875e-8;
Hploc.PI4_C = 0.306161699786838294306516483068750264552437361480769e-16;
Hploc.M_1_PI = 0.3183098861837906715377675267450287;
//# sourceMappingURL=Hploc.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Pointing.js

class Pointing {
    /**
     *
     * @param {*} vec3 Vec3.js
     * @param {*} mirror
     * @param {*} in_theta radians
     * @param {*} in_phi radians
     */
    constructor(vec3, mirror, in_theta, in_phi) {
        if (vec3 != null) {
            this.theta = Hploc.atan2(Math.sqrt(vec3.x * vec3.x + vec3.y * vec3.y), vec3.z);
            if (mirror) {
                this.phi = -Hploc.atan2(vec3.y, vec3.x);
            }
            else {
                this.phi = Hploc.atan2(vec3.y, vec3.x);
            }
            if (this.phi < 0.0) {
                this.phi = this.phi + 2 * Math.PI;
            }
            if (this.phi >= 2 * Math.PI) {
                this.phi = this.phi - 2 * Math.PI;
            }
        }
        else {
            this.theta = in_theta;
            this.phi = in_phi;
        }
    }
}
//# sourceMappingURL=Pointing.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Vec3.js
/**
 * Partial porting to Javascript of Vec3.java from Healpix3.30
 */


class Vec3 {
    constructor(in_x, in_y, in_z) {
        if (in_x instanceof Pointing) {
            let ptg = in_x;
            let sth = Hploc.sin(ptg.theta);
            this.x = sth * Hploc.cos(ptg.phi);
            this.y = sth * Hploc.sin(ptg.phi);
            this.z = Hploc.cos(ptg.theta);
        }
        else {
            this.x = in_x;
            this.y = in_y;
            this.z = in_z;
        }
    }
    getX() {
        return this.x;
    }
    ;
    getY() {
        return this.y;
    }
    ;
    getZ() {
        return this.z;
    }
    ;
    /** Scale the vector by a given factor
    @param n the scale factor */
    scale(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
    }
    ;
    /** Vector cross product.
    @param v another vector
    @return the vector cross product between this vector and {@code v} */
    cross(v) {
        return new Vec3(this.y * v.z - v.y * this.z, this.z * v.x - v.z * this.x, this.x * v.y - v.x * this.y);
    }
    ;
    /** Vector addition
        * @param v the vector to be added
        * @return addition result */
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    ;
    /** Normalize the vector */
    normalize() {
        let d = 1. / this.length();
        this.x *= d;
        this.y *= d;
        this.z *= d;
    }
    ;
    /** Return normalized vector */
    norm() {
        let d = 1. / this.length();
        return new Vec3(this.x * d, this.y * d, this.z * d);
    }
    ;
    /** Vector length
    @return the length of the vector. */
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    ;
    /** Squared vector length
        @return the squared length of the vector. */
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    ;
    /** Computes the dot product of the this vector and {@code v1}.
     * @param v1 another vector
     * @return dot product */
    dot(v1) {
        return this.x * v1.x + this.y * v1.y + this.z * v1.z;
    }
    ;
    /** Vector subtraction
     * @param v the vector to be subtracted
     * @return subtraction result */
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    ;
    /** Angle between two vectors.
    @param v1 another vector
    @return the angle in radians between this vector and {@code v1};
      constrained to the range [0,PI]. */
    angle(v1) {
        return Hploc.atan2(this.cross(v1).length(), this.dot(v1));
    }
    /** Invert the signs of all components */
    flip() {
        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;
    }
    static pointing2Vec3(pointing) {
        let sth = Hploc.sin(pointing.theta);
        let x = sth * Hploc.cos(pointing.phi);
        let y = sth * Hploc.sin(pointing.phi);
        let z = Hploc.cos(pointing.theta);
        return new Vec3(x, y, z);
    }
    ;
}
//# sourceMappingURL=Vec3.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/CircleFinder.js

class CircleFinder {
    /**
     * @param point: Vec3
     */
    constructor(point) {
        let np = point.length;
        //HealpixUtils.check(np>=2,"too few points");
        if (!(np >= 2)) {
            console.log("too few points");
            return;
        }
        this.center = point[0].add(point[1]);
        this.center.normalize();
        this.cosrad = point[0].dot(this.center);
        for (let i = 2; i < np; ++i) {
            if (point[i].dot(this.center) < this.cosrad) { // point outside the current circle
                this.getCircle(point, i);
            }
        }
    }
    ;
    /**
     * @parm point: Vec3
     * @param q: int
     */
    getCircle(point, q) {
        this.center = point[0].add(point[q]);
        this.center.normalize();
        this.cosrad = point[0].dot(this.center);
        for (let i = 1; i < q; ++i) {
            if (point[i].dot(this.center) < this.cosrad) { // point outside the current circle
                this.getCircle2(point, i, q);
            }
        }
    }
    ;
    /**
     * @parm point: Vec3
     * @param q1: int
     * @param q2: int
     */
    getCircle2(point, q1, q2) {
        this.center = point[q1].add(point[q2]);
        this.center.normalize();
        this.cosrad = point[q1].dot(this.center);
        for (let i = 0; i < q1; ++i) {
            if (point[i].dot(this.center) < this.cosrad) { // point outside the current circle
                this.center = (point[q1].sub(point[i])).cross(point[q2].sub(point[i]));
                this.center.normalize();
                this.cosrad = point[i].dot(this.center);
                if (this.cosrad < 0) {
                    this.center.flip();
                    this.cosrad = -this.cosrad;
                }
            }
        }
    }
    ;
    getCenter() {
        return new Vec3(this.center.x, this.center.y, this.center.z);
    }
    getCosrad() {
        return this.cosrad;
    }
    ;
}
//# sourceMappingURL=CircleFinder.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Fxyf.js
/**
 * Partial porting to Javascript of Fxyf.java from Healpix3.30
 */

class Fxyf {
    constructor(x, y, f) {
        this.fx = x;
        this.fy = y;
        this.face = f;
        // coordinate of the lowest corner of each face
        this.jrll = new Uint8Array([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
        this.jpll = new Uint8Array([1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7]);
        this.halfpi = Math.PI / 2.;
    }
    toHploc() {
        let loc = new Hploc();
        let jr = this.jrll[this.face] - this.fx - this.fy;
        let nr;
        if (jr < 1) {
            nr = jr;
            let tmp = nr * nr / 3.;
            loc.z = 1 - tmp;
            if (loc.z > 0.99) {
                loc.sth = Math.sqrt(tmp * (2.0 - tmp));
                loc.have_sth = true;
            }
        }
        else if (jr > 3) {
            nr = 4 - jr;
            let tmp = nr * nr / 3.;
            loc.z = tmp - 1;
            if (loc.z < -0.99) {
                loc.sth = Math.sqrt(tmp * (2.0 - tmp));
                loc.have_sth = true;
            }
        }
        else {
            nr = 1;
            loc.z = (2 - jr) * 2.0 / 3.;
        }
        let tmp = this.jpll[this.face] * nr + this.fx - this.fy;
        if (tmp < 0) {
            tmp += 8;
        }
        if (tmp >= 8) {
            tmp -= 8;
        }
        loc.phi = (nr < 1e-15) ? 0 : (0.5 * this.halfpi * tmp) / nr;
        return loc;
    }
    ;
    toVec3() {
        return this.toHploc().toVec3();
    }
    ;
}
//# sourceMappingURL=Fxyf.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/pstack.js
class pstack {
    /** Creation from individual components */
    constructor(sz) {
        this.p = new Array(sz);
        this.o = new Int32Array(sz);
        this.s = 0;
        this.m = 0;
    }
    ;
    /**
     * @param p long
     * @param o int
     */
    push(p_, o_) {
        this.p[this.s] = p_;
        this.o[this.s] = o_;
        ++this.s;
    }
    ;
    pop() {
        --this.s;
    }
    ;
    popToMark() {
        this.s = this.m;
    }
    ;
    size() {
        return this.s;
    }
    ;
    mark() {
        this.m = this.s;
    }
    ;
    otop() {
        return this.o[this.s - 1];
    }
    ;
    ptop() {
        return this.p[this.s - 1];
    }
    ;
}
//# sourceMappingURL=pstack.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/RangeSet.js
class RangeSet {
    /**
     * @param int cap: initial capacity
     */
    constructor(cap) {
        if (cap < 0)
            console.error("capacity must be positive");
        this.r = new Int32Array(cap << 1);
        this.sz = 0;
    }
    ;
    /** Append a single-value range to the object.
    @param val value to append */
    append(val) {
        this.append1(val, val + 1);
    }
    ;
    /** Append a range to the object.
   @param a first long in range
   @param b one-after-last long in range */
    append1(a, b) {
        if (a >= b)
            return;
        if ((this.sz > 0) && (a <= this.r[this.sz - 1])) {
            if (a < this.r[this.sz - 2])
                console.error("bad append operation");
            if (b > this.r[this.sz - 1])
                this.r[this.sz - 1] = b;
            return;
        }
        // this.ensureCapacity(this.sz+2);
        let cap = this.sz + 2;
        if (this.r.length < cap) {
            let newsize = Math.max(2 * this.r.length, cap);
            let rnew = new Int32Array(newsize);
            rnew.set(this.r);
            this.r = rnew;
        }
        this.r[this.sz] = a;
        this.r[this.sz + 1] = b;
        this.sz += 2;
    }
    ;
    /** Make sure the object can hold at least the given number of entries.
     * @param cap int
     * */
    ensureCapacity(cap) {
        if (this.r.length < cap)
            this.resize(Math.max(2 * this.r.length, cap));
    }
    ;
    /**
     * @param newsize int
     */
    resize(newsize) {
        if (newsize < this.sz)
            console.error("requested array size too small");
        if (newsize == this.r.length)
            return;
        let rnew = new Int32Array(newsize);
        let sliced = this.r.slice(0, this.sz + 1);
        //		this.arrayCopy(this.r, 0, rnew, 0, this.sz);
        this.r = sliced;
    }
    ;
}
//# sourceMappingURL=RangeSet.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Xyf.js
/**
 * Partial porting to Javascript of Xyf.java from Healpix3.30
 */
class Xyf {
    constructor(x, y, f) {
        this.ix = x;
        this.iy = y;
        this.face = f;
    }
}
//# sourceMappingURL=Xyf.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/Healpix.js











/**
 * Partial porting to Javascript of HealpixBase.java from Healpix3.30
 */
// import Fxyf from './Fxyf.js';
// import Hploc from './Hploc.js';
// import Xyf from './Xyf.js';
// import Vec3 from './Vec3.js';
// import Pointing from './Pointing.js';
// import CircleFinder from './CircleFinder.js';
// import Zphi from './Zphi.js';
// import pstack from './pstack.js';
// import Constants from './Constants.js';
// import RangeSet from './RangeSet.js';
class Healpix {
    constructor(nside_in) {
        this.order_max = 29;
        this.inv_halfpi = 2.0 / Math.PI;
        this.twothird = 2.0 / 3.;
        // console.log("twothird "+this.twothird);
        // this.ns_max=1L<<order_max;
        this.ns_max = Math.pow(2, this.order_max);
        this.ctab = new Uint16Array([
            0, 1, 256, 257, 2, 3, 258, 259, 512, 513, 768, 769, 514, 515, 770, 771, 4, 5, 260, 261, 6, 7, 262,
            263, 516, 517, 772, 773, 518, 519, 774, 775, 1024, 1025, 1280, 1281, 1026, 1027, 1282, 1283,
            1536, 1537, 1792, 1793, 1538, 1539, 1794, 1795, 1028, 1029, 1284, 1285, 1030, 1031, 1286,
            1287, 1540, 1541, 1796, 1797, 1542, 1543, 1798, 1799, 8, 9, 264, 265, 10, 11, 266, 267, 520,
            521, 776, 777, 522, 523, 778, 779, 12, 13, 268, 269, 14, 15, 270, 271, 524, 525, 780, 781, 526,
            527, 782, 783, 1032, 1033, 1288, 1289, 1034, 1035, 1290, 1291, 1544, 1545, 1800, 1801, 1546,
            1547, 1802, 1803, 1036, 1037, 1292, 1293, 1038, 1039, 1294, 1295, 1548, 1549, 1804, 1805,
            1550, 1551, 1806, 1807, 2048, 2049, 2304, 2305, 2050, 2051, 2306, 2307, 2560, 2561, 2816,
            2817, 2562, 2563, 2818, 2819, 2052, 2053, 2308, 2309, 2054, 2055, 2310, 2311, 2564, 2565,
            2820, 2821, 2566, 2567, 2822, 2823, 3072, 3073, 3328, 3329, 3074, 3075, 3330, 3331, 3584,
            3585, 3840, 3841, 3586, 3587, 3842, 3843, 3076, 3077, 3332, 3333, 3078, 3079, 3334, 3335,
            3588, 3589, 3844, 3845, 3590, 3591, 3846, 3847, 2056, 2057, 2312, 2313, 2058, 2059, 2314,
            2315, 2568, 2569, 2824, 2825, 2570, 2571, 2826, 2827, 2060, 2061, 2316, 2317, 2062, 2063,
            2318, 2319, 2572, 2573, 2828, 2829, 2574, 2575, 2830, 2831, 3080, 3081, 3336, 3337, 3082,
            3083, 3338, 3339, 3592, 3593, 3848, 3849, 3594, 3595, 3850, 3851, 3084, 3085, 3340, 3341,
            3086, 3087, 3342, 3343, 3596, 3597, 3852, 3853, 3598, 3599, 3854, 3855
        ]);
        this.utab = new Uint16Array([0, 1, 4, 5, 16, 17, 20, 21, 64, 65, 68, 69, 80, 81, 84, 85, 256, 257, 260, 261, 272, 273, 276, 277,
            320, 321, 324, 325, 336, 337, 340, 341, 1024, 1025, 1028, 1029, 1040, 1041, 1044, 1045, 1088,
            1089, 1092, 1093, 1104, 1105, 1108, 1109, 1280, 1281, 1284, 1285, 1296, 1297, 1300, 1301,
            1344, 1345, 1348, 1349, 1360, 1361, 1364, 1365, 4096, 4097, 4100, 4101, 4112, 4113, 4116,
            4117, 4160, 4161, 4164, 4165, 4176, 4177, 4180, 4181, 4352, 4353, 4356, 4357, 4368, 4369,
            4372, 4373, 4416, 4417, 4420, 4421, 4432, 4433, 4436, 4437, 5120, 5121, 5124, 5125, 5136,
            5137, 5140, 5141, 5184, 5185, 5188, 5189, 5200, 5201, 5204, 5205, 5376, 5377, 5380, 5381,
            5392, 5393, 5396, 5397, 5440, 5441, 5444, 5445, 5456, 5457, 5460, 5461, 16384, 16385, 16388,
            16389, 16400, 16401, 16404, 16405, 16448, 16449, 16452, 16453, 16464, 16465, 16468, 16469,
            16640, 16641, 16644, 16645, 16656, 16657, 16660, 16661, 16704, 16705, 16708, 16709, 16720,
            16721, 16724, 16725, 17408, 17409, 17412, 17413, 17424, 17425, 17428, 17429, 17472, 17473,
            17476, 17477, 17488, 17489, 17492, 17493, 17664, 17665, 17668, 17669, 17680, 17681, 17684,
            17685, 17728, 17729, 17732, 17733, 17744, 17745, 17748, 17749, 20480, 20481, 20484, 20485,
            20496, 20497, 20500, 20501, 20544, 20545, 20548, 20549, 20560, 20561, 20564, 20565, 20736,
            20737, 20740, 20741, 20752, 20753, 20756, 20757, 20800, 20801, 20804, 20805, 20816, 20817,
            20820, 20821, 21504, 21505, 21508, 21509, 21520, 21521, 21524, 21525, 21568, 21569, 21572,
            21573, 21584, 21585, 21588, 21589, 21760, 21761, 21764, 21765, 21776, 21777, 21780, 21781,
            21824, 21825, 21828, 21829, 21840, 21841, 21844, 21845]);
        this.jrll = new Int16Array([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
        this.jpll = new Int16Array([1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7]);
        this.xoffset = new Int16Array([-1, -1, 0, 1, 1, 1, 0, -1]);
        this.yoffset = new Int16Array([0, 1, 1, 1, 0, -1, -1, -1]);
        this.facearray = [
            new Int16Array([8, 9, 10, 11, -1, -1, -1, -1, 10, 11, 8, 9]),
            new Int16Array([5, 6, 7, 4, 8, 9, 10, 11, 9, 10, 11, 8]),
            new Int16Array([-1, -1, -1, -1, 5, 6, 7, 4, -1, -1, -1, -1]),
            new Int16Array([4, 5, 6, 7, 11, 8, 9, 10, 11, 8, 9, 10]),
            new Int16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            new Int16Array([1, 2, 3, 0, 0, 1, 2, 3, 5, 6, 7, 4]),
            new Int16Array([-1, -1, -1, -1, 7, 4, 5, 6, -1, -1, -1, -1]),
            new Int16Array([3, 0, 1, 2, 3, 0, 1, 2, 4, 5, 6, 7]),
            new Int16Array([2, 3, 0, 1, -1, -1, -1, -1, 0, 1, 2, 3]) // N
        ];
        // questo forse deve essere un UInt8Array. Viene usato da neighbours
        this.swaparray = [
            new Int16Array([0, 0, 3]),
            new Int16Array([0, 0, 6]),
            new Int16Array([0, 0, 0]),
            new Int16Array([0, 0, 5]),
            new Int16Array([0, 0, 0]),
            new Int16Array([5, 0, 0]),
            new Int16Array([0, 0, 0]),
            new Int16Array([6, 0, 0]),
            new Int16Array([3, 0, 0]) // N
        ];
        if (nside_in <= this.ns_max && nside_in > 0) {
            this.nside = nside_in;
            this.npface = this.nside * this.nside;
            this.npix = 12 * this.npface;
            this.order = this.nside2order(this.nside);
            this.nl2 = 2 * this.nside;
            this.nl3 = 3 * this.nside;
            this.nl4 = 4 * this.nside;
            this.fact2 = 4.0 / this.npix;
            this.fact1 = (this.nside << 1) * this.fact2;
            this.ncap = 2 * this.nside * (this.nside - 1); // pixels in each polar cap
            // console.log("order: "+this.order);
            // console.log("nside: "+this.nside);
        }
        this.bn = [];
        this.mpr = [];
        this.cmpr = [];
        this.smpr = [];
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
        // Uncaught RangeError: Maximum call stack size exceeded
        // MOVED TO computeBn()
        //        for (let i=0; i <= this.order_max; ++i) {
        //        	this.bn[i]=new Healpix(1<<i);
        //        	this.mpr[i]=bn[i].maxPixrad();
        //        	this.cmpr[i]=Math.cos(mpr[i]);
        //        	this.smpr[i]=Math.sin(mpr[i]);
        //        }
    }
    computeBn() {
        for (let i = 0; i <= this.order_max; ++i) {
            this.bn[i] = new Healpix(1 << i);
            this.mpr[i] = this.bn[i].maxPixrad();
            this.cmpr[i] = Hploc.cos(this.mpr[i]);
            this.smpr[i] = Hploc.sin(this.mpr[i]);
        }
    }
    getNPix() {
        return this.npix;
    }
    ;
    getBoundaries(pix) {
        let points = new Array();
        let xyf = this.nest2xyf(pix);
        // console.log("PIXEL: "+pix);
        // console.log("XYF "+xyf.ix+" "+xyf.iy+" "+xyf.face);
        let dc = 0.5 / this.nside;
        let xc = (xyf.ix + 0.5) / this.nside;
        let yc = (xyf.iy + 0.5) / this.nside;
        // let d = 1.0/(this.nside);
        // console.log("------------------------");
        // console.log("xc, yc, dc "+xc+","+ yc+","+ dc);
        // console.log("xc+dc-d, yc+dc, xyf.face, d "+(xc+dc) +","+ (yc+dc)+","+
        // xyf.face+","+ d);
        points[0] = new Fxyf(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = new Fxyf(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = new Fxyf(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = new Fxyf(xc + dc, yc - dc, xyf.face).toVec3();
        // console.log("Points for npix: "+pix);
        // console.log(points);
        // if (pix > 750){
        // console.log("pix: "+pix);
        // console.log("dc: "+dc);
        // console.log("xyf.ix: "+xyf.ix);
        // console.log("xyf.iy: "+xyf.iy);
        // console.log("xc: "+xc);
        // console.log("yc: "+yc);
        // console.log("d: "+d);
        // }
        return points;
    }
    ;
    /** Returns a set of points along the boundary of the given pixel.
     * Step 1 gives 4 points on the corners. The first point corresponds
     * to the northernmost corner, the subsequent points follow the pixel
     * boundary through west, south and east corners.
     *
     * @param pix pixel index number
     * @param step the number of returned points is 4*step
     * @return {@link Vec3} for each point
     */
    getBoundariesWithStep(pix, step) {
        // var points = new Array(); 
        let points = new Array();
        let xyf = this.nest2xyf(pix);
        let dc = 0.5 / this.nside;
        let xc = (xyf.ix + 0.5) / this.nside;
        let yc = (xyf.iy + 0.5) / this.nside;
        let d = 1.0 / (this.nside * step);
        for (let i = 0; i < step; i++) {
            points[i] = new Fxyf(xc + dc - i * d, yc + dc, xyf.face).toVec3();
            points[i + step] = new Fxyf(xc - dc, yc + dc - i * d, xyf.face).toVec3();
            points[i + 2 * step] = new Fxyf(xc - dc + i * d, yc - dc, xyf.face).toVec3();
            points[i + 3 * step] = new Fxyf(xc + dc, yc - dc + i * d, xyf.face).toVec3();
        }
        return points;
    }
    ;
    getPointsForXyfNoStep(x, y, face) {
        let nside = Math.pow(2, this.order);
        let points = new Array();
        let xyf = new Xyf(x, y, face);
        let dc = 0.5 / nside;
        let xc = (xyf.ix + 0.5) / nside;
        let yc = (xyf.iy + 0.5) / nside;
        points[0] = new Fxyf(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = new Fxyf(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = new Fxyf(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = new Fxyf(xc + dc, yc - dc, xyf.face).toVec3();
        return points;
    }
    getPointsForXyf(x, y, step, face) {
        let nside = step * Math.pow(2, this.order);
        let points = new Array();
        let xyf = new Xyf(x, y, face);
        let dc = 0.5 / nside;
        let xc = (xyf.ix + 0.5) / nside;
        let yc = (xyf.iy + 0.5) / nside;
        points[0] = new Fxyf(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = new Fxyf(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = new Fxyf(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = new Fxyf(xc + dc, yc - dc, xyf.face).toVec3();
        return points;
    }
    /** Returns the neighboring pixels of ipix.
    This method works in both RING and NEST schemes, but is
    considerably faster in the NEST scheme.
    @param ipix the requested pixel number.
    @return array with indices of the neighboring pixels.
      The returned array contains (in this order)
      the pixel numbers of the SW, W, NW, N, NE, E, SE and S neighbor
      of ipix. If a neighbor does not exist (this can only happen
      for the W, N, E and S neighbors), its entry is set to -1. */
    neighbours(ipix) {
        let result = new Int32Array(8);
        let xyf = this.nest2xyf(ipix);
        let ix = xyf.ix;
        let iy = xyf.iy;
        let face_num = xyf.face;
        var nsm1 = this.nside - 1;
        if ((ix > 0) && (ix < nsm1) && (iy > 0) && (iy < nsm1)) {
            let fpix = Math.floor(face_num << (2 * this.order));
            let px0 = this.spread_bits(ix);
            let py0 = this.spread_bits(iy) << 1;
            let pxp = this.spread_bits(ix + 1);
            let pyp = this.spread_bits(iy + 1) << 1;
            let pxm = this.spread_bits(ix - 1);
            let pym = this.spread_bits(iy - 1) << 1;
            result[0] = fpix + pxm + py0;
            result[1] = fpix + pxm + pyp;
            result[2] = fpix + px0 + pyp;
            result[3] = fpix + pxp + pyp;
            result[4] = fpix + pxp + py0;
            result[5] = fpix + pxp + pym;
            result[6] = fpix + px0 + pym;
            result[7] = fpix + pxm + pym;
        }
        else {
            for (let i = 0; i < 8; ++i) {
                let x = ix + this.xoffset[i];
                let y = iy + this.yoffset[i];
                let nbnum = 4;
                if (x < 0) {
                    x += this.nside;
                    nbnum -= 1;
                }
                else if (x >= this.nside) {
                    x -= this.nside;
                    nbnum += 1;
                }
                if (y < 0) {
                    y += this.nside;
                    nbnum -= 3;
                }
                else if (y >= this.nside) {
                    y -= this.nside;
                    nbnum += 3;
                }
                let f = this.facearray[nbnum][face_num];
                if (f >= 0) {
                    let bits = this.swaparray[nbnum][face_num >>> 2];
                    if ((bits & 1) > 0) {
                        x = Math.floor(this.nside - x - 1);
                    }
                    if ((bits & 2) > 0) {
                        y = Math.floor(this.nside - y - 1);
                    }
                    if ((bits & 4) > 0) {
                        let tint = x;
                        x = y;
                        y = tint;
                    }
                    result[i] = this.xyf2nest(x, y, f);
                }
                else {
                    result[i] = -1;
                }
            }
        }
        return result;
    }
    ;
    nside2order(nside) {
        return ((nside & (nside - 1)) != 0) ? -1 : Math.log2(nside);
    }
    ;
    nest2xyf(ipix) {
        let pix = Math.floor(ipix & (this.npface - 1));
        let xyf = new Xyf(this.compress_bits(pix), this.compress_bits(pix >> 1), Math.floor((ipix >> (2 * this.order))));
        return xyf;
    }
    ;
    xyf2nest(ix, iy, face_num) {
        return Math.floor(face_num << (2 * this.order))
            + this.spread_bits(ix) + (this.spread_bits(iy) << 1);
    }
    ;
    loc2pix(hploc) {
        let z = hploc.z;
        let phi = hploc.phi;
        let za = Math.abs(z);
        let tt = this.fmodulo((phi * this.inv_halfpi), 4.0); // in [0,4)
        let pixNo;
        if (za <= this.twothird) { // Equatorial region
            let temp1 = this.nside * (0.5 + tt);
            let temp2 = this.nside * (z * 0.75);
            let jp = Math.floor(temp1 - temp2); // index of ascending edge line
            let jm = Math.floor(temp1 + temp2); // index of descending edge line
            let ifp = Math.floor(jp >>> this.order); // in {0,4}
            let ifm = Math.floor(jm >>> this.order);
            let face_num = Math.floor((ifp == ifm) ? (ifp | 4) : ((ifp < ifm) ? ifp : (ifm + 8)));
            let ix = Math.floor(jm & (this.nside - 1));
            let iy = Math.floor(this.nside - (jp & (this.nside - 1)) - 1);
            pixNo = this.xyf2nest(ix, iy, face_num);
        }
        else { // polar region, za > 2/3
            let ntt = Math.min(3, Math.floor(tt));
            let tp = tt - ntt;
            let tmp = ((za < 0.99) || (!hploc.have_sth)) ?
                this.nside * Math.sqrt(3 * (1 - za)) :
                this.nside * hploc.sth / Math.sqrt((1.0 + za) / 3.);
            let jp = Math.floor(tp * tmp); // increasing edge line index
            let jm = Math.floor((1.0 - tp) * tmp); // decreasing edge line index
            if (jp >= this.nside) {
                jp = this.nside - 1; // for points too close to the boundary
            }
            if (jm >= this.nside) {
                jm = this.nside - 1;
            }
            if (z >= 0) {
                pixNo = this.xyf2nest(Math.floor(this.nside - jm - 1), Math.floor(this.nside - jp - 1), ntt);
            }
            else {
                pixNo = this.xyf2nest(Math.floor(jp), Math.floor(jm), ntt + 8);
            }
        }
        return pixNo;
    }
    ;
    /** Returns the normalized 3-vector corresponding to the center of the
    supplied pixel.
    @param pix long the requested pixel number.
    @return the pixel's center coordinates. */
    pix2vec(pix) {
        return this.pix2loc(pix).toVec3();
    }
    ;
    /** Returns the Zphi corresponding to the center of the supplied pixel.
     @param pix the requested pixel number.
     @return the pixel's center coordinates. */
    pix2zphi(pix) {
        return this.pix2loc(pix).toZphi();
    }
    /**
     * @param pix long
     * @return Hploc
     */
    pix2loc(pix) {
        let loc = new Hploc(undefined);
        let xyf = this.nest2xyf(pix);
        let jr = ((this.jrll[xyf.face]) << this.order) - xyf.ix - xyf.iy - 1;
        let nr;
        if (jr < this.nside) {
            nr = jr;
            let tmp = (nr * nr) * this.fact2;
            loc.z = 1 - tmp;
            if (loc.z > 0.99) {
                loc.sth = Math.sqrt(tmp * (2. - tmp));
                loc.have_sth = true;
            }
        }
        else if (jr > this.nl3) {
            nr = this.nl4 - jr;
            let tmp = (nr * nr) * this.fact2;
            loc.z = tmp - 1;
            if (loc.z < -0.99) {
                loc.sth = Math.sqrt(tmp * (2. - tmp));
                loc.have_sth = true;
            }
        }
        else {
            nr = this.nside;
            loc.z = (this.nl2 - jr) * this.fact1;
        }
        let tmp = (this.jpll[xyf.face]) * nr + xyf.ix - xyf.iy;
        //      	assert(tmp<8*nr); // must not happen
        if (tmp < 0) {
            tmp += 8 * nr;
        }
        loc.phi = (nr == this.nside) ? 0.75 * Constants.halfpi * tmp * this.fact1 : (0.5 * Constants.halfpi * tmp) / nr;
        // loc.setPhi((nr == this.nside) ? 0.75 * Constants.halfpi * tmp * this.fact1 : (0.5 * Constants.halfpi * tmp)/nr);
        return loc;
    }
    ;
    ang2pix(ptg, mirror) {
        return this.loc2pix(new Hploc(ptg));
    }
    ;
    fmodulo(v1, v2) {
        if (v1 >= 0) {
            return (v1 < v2) ? v1 : v1 % v2;
        }
        var tmp = v1 % v2 + v2;
        return (tmp === v2) ? 0.0 : tmp;
    }
    ;
    compress_bits(v) {
        var raw = Math.floor((v & 0x5555)) | Math.floor(((v & 0x55550000) >>> 15));
        var compressed = this.ctab[raw & 0xff] | (this.ctab[raw >>> 8] << 4);
        return compressed;
    }
    ;
    spread_bits(v) {
        return Math.floor(this.utab[v & 0xff]) | Math.floor((this.utab[(v >>> 8) & 0xff] << 16))
            | Math.floor((this.utab[(v >>> 16) & 0xff] << 32)) | Math.floor((this.utab[(v >>> 24) & 0xff] << 48));
    }
    ;
    /**
     * Returns a range set of pixels that overlap with the convex polygon
     * defined by the {@code vertex} array.
     * <p>
     * This method is more efficient in the RING scheme.
     * <p>
     * This method may return some pixels which don't overlap with the polygon
     * at all. The higher {@code fact} is chosen, the fewer false positives are
     * returned, at the cost of increased run time.
     *
     * @param vertex
     *            an array containing the vertices of the requested convex
     *            polygon.
     * @param fact
     *            The overlapping test will be done at the resolution
     *            {@code fact*nside}. For NESTED ordering, {@code fact} must be
     *            a power of 2, else it can be any positive integer. A typical
     *            choice would be 4.
     * @return the requested set of pixel number ranges
     */
    queryPolygonInclusive(vertex, fact) {
        let inclusive = (fact != 0);
        let nv = vertex.length;
        //        let ncirc = inclusive ? nv+1 : nv;
        if (!(nv >= 3)) {
            console.log("not enough vertices in polygon");
            return;
        }
        let vv = new Array();
        for (let i = 0; i < nv; ++i) {
            vv[i] = Vec3.pointing2Vec3(vertex[i]);
        }
        let normal = new Array();
        let flip = 0;
        let index = 0;
        let back = false;
        while (index < vv.length) {
            let first = vv[index];
            let medium = null;
            let last = null;
            if (index == vv.length - 1) {
                last = vv[1];
                medium = vv[0];
            }
            else if (index == vv.length - 2) {
                last = vv[0];
                medium = vv[index + 1];
            }
            else {
                medium = vv[index + 1];
                last = vv[index + 2];
            }
            normal[index] = first.cross(medium).norm();
            let hnd = normal[index].dot(last);
            if (index == 0) {
                flip = (hnd < 0.) ? -1 : 1;
                let tmp = new Pointing(first); // TODO not used
                back = false;
            }
            else {
                let flipThnd = flip * hnd;
                if (flipThnd < 0) {
                    let tmp = new Pointing(medium);
                    vv.splice(index + 1, 1);
                    normal.splice(index, 1);
                    back = true;
                    index -= 1;
                    continue;
                }
                else {
                    let tmp = new Pointing(first);
                    back = false;
                }
            }
            normal[index].scale(flip);
            index += 1;
        }
        nv = vv.length;
        let ncirc = inclusive ? nv + 1 : nv;
        let rad = new Array(ncirc);
        rad = rad.fill(Constants.halfpi);
        //        rad = rad.fill(1.5707963267948966);
        //        let p = "1.5707963267948966";
        //        rad = rad.fill(parseFloat(p));
        if (inclusive) {
            let cf = new CircleFinder(vv);
            normal[nv] = cf.getCenter();
            rad[nv] = Hploc.acos(cf.getCosrad());
        }
        return this.queryMultiDisc(normal, rad, fact);
    }
    ;
    /**
     * For NEST schema only
     *
     * @param normal:
     *            Vec3[]
     * @param rad:
     *            Float32Array
     * @param fact:
     *            The overlapping test will be done at the resolution
     *            {@code fact*nside}. For NESTED ordering, {@code fact} must be
     *            a power of 2, else it can be any positive integer. A typical
     *            choice would be 4.
     * @return RangeSet the requested set of pixel number ranges
     */
    queryMultiDisc(norm, rad, fact) {
        this.computeBn();
        let inclusive = (fact != 0);
        let nv = norm.length;
        // HealpixUtils.check(nv==rad.lengt0,"inconsistent input arrays");
        if (!(nv == rad.length)) {
            console.error("inconsistent input arrays");
            return;
        }
        let res = new RangeSet(4 << 1);
        // Removed code for Scheme.RING
        let oplus = 0;
        if (inclusive) {
            if (!(Math.pow(2, this.order_max - this.order) >= fact)) {
                console.error("invalid oversampling factor");
            }
            if (!((fact & (fact - 1)) == 0)) {
                console.error("oversampling factor must be a power of 2");
            }
            oplus = this.ilog2(fact);
        }
        let omax = this.order + oplus; // the order up to which we test
        // TODO: ignore all disks with radius>=pi
        //        let crlimit = new Float32Array[omax+1][nv][3];
        let crlimit = new Array(omax + 1);
        let o;
        let i;
        for (o = 0; o <= omax; ++o) { // prepare data at the required orders
            crlimit[o] = new Array(nv);
            let dr = this.bn[o].maxPixrad(); // safety distance
            for (i = 0; i < nv; ++i) {
                crlimit[o][i] = new Float64Array(3);
                crlimit[o][i][0] = (rad[i] + dr > Math.PI) ? -1 : Hploc.cos(rad[i] + dr);
                crlimit[o][i][1] = (o == 0) ? Hploc.cos(rad[i]) : crlimit[0][i][1];
                crlimit[o][i][2] = (rad[i] - dr < 0.) ? 1. : Hploc.cos(rad[i] - dr);
            }
        }
        let stk = new pstack(12 + 3 * omax);
        for (let i = 0; i < 12; i++) { // insert the 12 base pixels in reverse
            // order
            stk.push(11 - i, 0);
        }
        while (stk.size() > 0) { // as long as there are pixels on the stack
            // pop current pixel number and order from the stack
            let pix = stk.ptop();
            let o = stk.otop();
            stk.pop();
            let pv = this.bn[o].pix2vec(pix);
            let zone = 3;
            for (let i = 0; (i < nv) && (zone > 0); ++i) {
                let crad = pv.dot(norm[i]);
                for (let iz = 0; iz < zone; ++iz) {
                    if (crad < crlimit[o][i][iz]) {
                        zone = iz;
                    }
                }
            }
            if (zone > 0) {
                this.check_pixel(o, omax, zone, res, pix, stk, inclusive);
            }
        }
        return res;
    }
    ;
    /** Integer base 2 logarithm.
    @param arg
    @return the largest integer {@code n} that fulfills {@code 2^n<=arg}.
    For negative arguments and zero, 0 is returned. */
    ilog2(arg) {
        let max = Math.max(arg, 1);
        return 31 - Math.clz32(max);
    }
    ;
    /** Computes the cosine of the angular distance between two z, phi positions
      on the unit sphere. */
    cosdist_zphi(z1, phi1, z2, phi2) {
        return z1 * z2 + Hploc.cos(phi1 - phi2) * Math.sqrt((1.0 - z1 * z1) * (1.0 - z2 * z2));
    }
    /**
     * @param int o
     * @param int omax
     * @param int zone
     * @param RangeSet pixset
     * @param long pix
     * @param pstack stk
     * @param boolean inclusive
     */
    check_pixel(o, omax, zone, pixset, pix, stk, inclusive) {
        if (zone == 0)
            return;
        if (o < this.order) {
            if (zone >= 3) { // output all subpixels
                let sdist = 2 * (this.order - o); // the "bit-shift distance" between map orders
                pixset.append1(pix << sdist, ((pix + 1) << sdist));
            }
            else { // (zone>=1)
                for (let i = 0; i < 4; ++i) {
                    stk.push(4 * pix + 3 - i, o + 1); // add children
                }
            }
        }
        else if (o > this.order) { // this implies that inclusive==true
            if (zone >= 2) { // pixel center in shape
                pixset.append(pix >>> (2 * (o - this.order))); // output the parent pixel at order
                stk.popToMark(); // unwind the stack
            }
            else { // (zone>=1): pixel center in safety range
                if (o < omax) { // check sublevels
                    for (let i = 0; i < 4; ++i) { // add children in reverse order
                        stk.push(4 * pix + 3 - i, o + 1); // add children
                    }
                }
                else { // at resolution limit
                    pixset.append(pix >>> (2 * (o - this.order))); // output the parent pixel at order
                    stk.popToMark(); // unwind the stack
                }
            }
        }
        else { // o==order
            if (zone >= 2) {
                pixset.append(pix);
            }
            else if (inclusive) { // and (zone>=1)
                if (this.order < omax) { // check sublevels
                    stk.mark(); // remember current stack position
                    for (let i = 0; i < 4; ++i) { // add children in reverse order
                        stk.push(4 * pix + 3 - i, o + 1); // add children
                    }
                }
                else { // at resolution limit
                    pixset.append(pix); // output the pixel
                }
            }
        }
    }
    /** Returns the maximum angular distance between a pixel center and its
    corners.
    @return maximum angular distance between a pixel center and its
      corners. */
    maxPixrad() {
        let zphia = new Zphi(2. / 3., Math.PI / this.nl4);
        let xyz1 = this.convertZphi2xyz(zphia);
        let va = new Vec3(xyz1[0], xyz1[1], xyz1[2]);
        let t1 = 1. - 1. / this.nside;
        t1 *= t1;
        let zphib = new Zphi(1 - t1 / 3, 0);
        let xyz2 = this.convertZphi2xyz(zphib);
        let vb = new Vec3(xyz2[0], xyz2[1], xyz2[2]);
        return va.angle(vb);
    }
    ;
    /**
     * this is a workaround replacing the Vec3(Zphi) constructor.
     */
    convertZphi2xyz(zphi) {
        let sth = Math.sqrt((1.0 - zphi.z) * (1.0 + zphi.z));
        let x = sth * Hploc.cos(zphi.phi);
        let y = sth * Hploc.sin(zphi.phi);
        let z = zphi.z;
        return [x, y, z];
    }
    ;
    /** Returns a range set of pixels which overlap with a given disk. <p>
      This method is more efficient in the RING scheme. <p>
      This method may return some pixels which don't overlap with
      the polygon at all. The higher {@code fact} is chosen, the fewer false
      positives are returned, at the cost of increased run time.
      @param ptg the angular coordinates of the disk center
      @param radius the radius (in radians) of the disk
      @param fact The overlapping test will be done at the resolution
        {@code fact*nside}. For NESTED ordering, {@code fact} must be a power
        of 2, else it can be any positive integer. A typical choice would be 4.
      @return the requested set of pixel number ranges  */
    queryDiscInclusive(ptg, radius, fact) {
        this.computeBn();
        let inclusive = (fact != 0);
        let pixset = new RangeSet();
        if (radius >= Math.PI) { // disk covers the whole sphere
            pixset.append1(0, this.npix);
            return pixset;
        }
        let oplus = 0;
        if (inclusive) {
            // HealpixUtils.check ((1L<<order_max)>=fact,"invalid oversampling factor");
            if (!((fact & (fact - 1)) == 0)) {
                console.error("oversampling factor must be a power of 2");
            }
            oplus = this.ilog2(fact);
        }
        let omax = Math.min(this.order_max, this.order + oplus); // the order up to which we test
        let vptg = Vec3.pointing2Vec3(ptg);
        let crpdr = new Array(omax + 1);
        let crmdr = new Array(omax + 1);
        let cosrad = Hploc.cos(radius);
        let sinrad = Hploc.sin(radius);
        for (let o = 0; o <= omax; o++) { // prepare data at the required orders
            let dr = this.mpr[o]; // safety distance
            let cdr = this.cmpr[o];
            let sdr = this.smpr[o];
            crpdr[o] = (radius + dr > Math.PI) ? -1. : cosrad * cdr - sinrad * sdr;
            crmdr[o] = (radius - dr < 0.) ? 1. : cosrad * cdr + sinrad * sdr;
        }
        let stk = new pstack(12 + 3 * omax);
        for (let i = 0; i < 12; i++) { // insert the 12 base pixels in reverse order
            stk.push(11 - i, 0);
        }
        while (stk.size() > 0) { // as long as there are pixels on the stack
            // pop current pixel number and order from the stack
            let pix = stk.ptop();
            let curro = stk.otop();
            stk.pop();
            let pos = this.bn[curro].pix2zphi(pix);
            // cosine of angular distance between pixel center and disk center
            let cangdist = this.cosdist_zphi(vptg.z, ptg.phi, pos.z, pos.phi);
            if (cangdist > crpdr[curro]) {
                let zone = (cangdist < cosrad) ? 1 : ((cangdist <= crmdr[curro]) ? 2 : 3);
                this.check_pixel(curro, omax, zone, pixset, pix, stk, inclusive);
            }
        }
        return pixset;
    }
}
//# sourceMappingURL=Healpix.js.map
;// CONCATENATED MODULE: ./node_modules/healpixjs/lib-esm/index.js











//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./src/projections/hips/HiPSIntermediateProj.ts
//HiPSIntermediateProj.ts





class HiPSIntermediateProj {
    static RES_ORDER_0 = 58.6;
    static H = 4;
    static K = 3;
    static THETAX = Hploc.asin((HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.K);
    // static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace {
    //     let xyGridProj: HEALPixXYSpace = {
    //         "min_y": NaN,
    //         "max_y": NaN,
    //         "min_x": NaN,
    //         "max_x": NaN,
    //         "gridPointsDeg": []
    //     }
    //     let cornersVec3 = hp.getBoundariesWithStep(tileno, 1);
    //     let pointings = [];
    //     for (let i = 0; i < cornersVec3.length; i++) {
    //         pointings[i] = new Pointing(cornersVec3[i]);
    //         if (i >= 1) {
    //             let a = pointings[i - 1].phi;
    //             let b = pointings[i].phi;
    //             // case when RA is just crossing the origin (e.g. 357deg - 3deg)
    //             if (Math.abs(a - b) > Math.PI) {
    //                 if (pointings[i - 1].phi < pointings[i].phi) {
    //                     pointings[i - 1].phi += 2 * Math.PI;
    //                 } else {
    //                     pointings[i].phi += 2 * Math.PI;
    //                 }
    //             }
    //         }
    //     }
    //     for (let j = 0; j < pointings.length; j++) {
    //         let coThetaRad = pointings[j].theta;
    //         // HEALPix works with colatitude (0 North Pole, 180 South Pole)
    //         // converting the colatitude in latitude (dec)
    //         let decRad = Math.PI / 2 - coThetaRad;
    //         let raRad = pointings[j].phi;
    //         // projection on healpix grid
    //         // let p = new Point(CoordsType.ASTRO, NumberType.RADIANS, raRad, decRad);
    //         // let xyDeg = HiPSIntermediateProj.world2intermediate(p.getAstro());
    //         // Build a tiny AstroCoords inline to avoid Point’s RA wrap:
    //         const ac: AstroCoords = {
    //             raDeg: radToDeg(raRad), raRad,
    //             decDeg: radToDeg(decRad), decRad
    //         } as AstroCoords;
    //         const [xDeg, yDeg] = HiPSIntermediateProj.world2intermediate(ac);  // ✅ no RA re-wrap
    //         xyGridProj.gridPointsDeg[j * 2] = xDeg;
    //         xyGridProj.gridPointsDeg[j * 2 + 1] = yDeg;
    //         if (isNaN(xyGridProj.max_y) || yDeg > xyGridProj.max_y) {
    //             xyGridProj.max_y = yDeg;
    //         }
    //         if (isNaN(xyGridProj.min_y) || yDeg < xyGridProj.min_y) {
    //             xyGridProj.min_y = yDeg;
    //         }
    //         if (isNaN(xyGridProj.max_x) || xDeg > xyGridProj.max_x) {
    //             xyGridProj.max_x = xDeg;
    //         }
    //         if (isNaN(xyGridProj.min_x) || xDeg < xyGridProj.min_x) {
    //             xyGridProj.min_x = xDeg;
    //         }
    //     }
    //     return xyGridProj;
    // }
    static setupByTile(tileno, hp) {
        const xy = { min_y: NaN, max_y: NaN, min_x: NaN, max_x: NaN, gridPointsDeg: [] };
        const corners = hp.getBoundariesWithStep(tileno, 1);
        const pts = [];
        // 1) enforce φ continuity in radians
        for (let i = 0; i < corners.length; i++) {
            pts[i] = new Pointing(corners[i]);
            if (i >= 1) {
                const a = pts[i - 1].phi, b = pts[i].phi;
                if (Math.abs(a - b) > Math.PI) {
                    if (a < b)
                        pts[i - 1].phi += 2 * Math.PI;
                    else
                        pts[i].phi += 2 * Math.PI;
                }
            }
        }
        // 2) project all boundary samples (WITHOUT Point to avoid RA wrap)
        const xs = [];
        const ys = [];
        for (let j = 0; j < pts.length; j++) {
            const coTheta = pts[j].theta;
            const decRad = Math.PI / 2 - coTheta;
            const raRad = pts[j].phi;
            const ac = {
                raDeg: radToDeg(raRad), raRad,
                decDeg: radToDeg(decRad), decRad
            };
            const [xDeg, yDeg] = HiPSIntermediateProj.world2intermediate(ac);
            xs.push(xDeg);
            ys.push(yDeg);
        }
        // 3) Y-extrema are reliable: set min_y / max_y from them
        let minY = +Infinity, maxY = -Infinity;
        for (const y of ys) {
            if (y < minY)
                minY = y;
            if (y > maxY)
                maxY = y;
        }
        const yMid = 0.5 * (minY + maxY);
        // 4) pick ONLY boundary samples near the mid-Y line to find left/right X
        //    (this avoids sector-hop outliers in X)
        const tol = Math.max(1e-6, 0.02 * (maxY - minY)); // 2% of Y span
        let minX = +Infinity, maxX = -Infinity;
        for (let k = 0; k < xs.length; k++) {
            if (Math.abs(ys[k] - yMid) <= tol) {
                if (xs[k] < minX)
                    minX = xs[k];
                if (xs[k] > maxX)
                    maxX = xs[k];
            }
        }
        // Fallback: if the midline filter caught nothing (rare), use a filtered percentile
        if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
            const pairs = xs.map((x, i) => ({ x, y: ys[i] }))
                .sort((a, b) => Math.abs(a.y - yMid) - Math.abs(b.y - yMid));
            const take = Math.max(4, Math.floor(pairs.length * 0.1)); // closest 10%
            minX = +Infinity;
            maxX = -Infinity;
            for (let i = 0; i < take; i++) {
                const x = pairs[i].x;
                if (x < minX)
                    minX = x;
                if (x > maxX)
                    maxX = x;
            }
        }
        // 5) Save the unmodified projected samples and envelope
        xy.min_y = minY;
        xy.max_y = maxY;
        xy.min_x = minX;
        xy.max_x = maxX;
        for (let i = 0; i < xs.length; i++) {
            xy.gridPointsDeg[2 * i] = xs[i];
            xy.gridPointsDeg[2 * i + 1] = ys[i];
        }
        return xy;
    }
    // private static unwrapProjectedX(xs: number[], thresholdDeg = 120): number[] {
    //     if (xs.length === 0) return xs;
    //     const out = [xs[0]];
    //     for (let k = 1; k < xs.length; k++) {
    //         let curr = xs[k];
    //         const prev = out[k - 1];
    //         while (curr - prev > thresholdDeg) curr -= 360;
    //         while (curr - prev < -thresholdDeg) curr += 360;
    //         out.push(curr);
    //     }
    //     // close polygon consistency (last vs first)
    //     const first = out[0], last = out[out.length - 1];
    //     if (Math.abs(last - first) > thresholdDeg) {
    //         out[out.length - 1] += (last > first) ? -360 : 360;
    //     }
    //     return out;
    // }
    static world2intermediate(ac) {
        let x_grid = NaN;
        let y_grid = NaN;
        if (Math.abs(ac.decRad) <= HiPSIntermediateProj.THETAX) { // equatorial belts
            x_grid = ac.raDeg;
            y_grid = Hploc.sin(ac.decRad) * HiPSIntermediateProj.K * 90 / HiPSIntermediateProj.H;
        }
        else if (Math.abs(ac.decRad) > HiPSIntermediateProj.THETAX) { // polar zones
            let raDeg = ac.raDeg;
            let w = 0; // omega
            if (HiPSIntermediateProj.K % 2 !== 0 || ac.decRad > 0) { // K odd or thetax > 0
                w = 1;
            }
            let sigma = Math.sqrt(HiPSIntermediateProj.K * (1 - Math.abs(Hploc.sin(ac.decRad))));
            let phi_c = -180 + (2 * Math.floor(((ac.raDeg + 180) * HiPSIntermediateProj.H / 360) + ((1 - w) / 2)) + w) * (180 / HiPSIntermediateProj.H);
            x_grid = phi_c + (raDeg - phi_c) * sigma;
            y_grid = (180 / HiPSIntermediateProj.H) * (((HiPSIntermediateProj.K + 1) / 2) - sigma);
            if (ac.decRad < 0) {
                y_grid *= -1;
            }
        }
        return [x_grid, y_grid];
    }
    static intermediate2pix(x, y, xyGridProj, pxXtile) {
        const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
        const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);
        // let i_norm: number;
        // let j_norm: number;
        // if ((xyGridProj.min_x > 360 || xyGridProj.max_x > 360) && x < xyGridProj.min_x) {
        //     i_norm = (x + 360 - xyGridProj.min_x) / xInterval;
        // } else {
        //     i_norm = (x - xyGridProj.min_x) / xInterval;
        // }
        // j_norm = (y - xyGridProj.min_y) / yInterval;
        // let i = 0.5 - (i_norm - j_norm);
        // let j = (i_norm + j_norm) - 0.5;
        // // TODO CHECK THE FOLLOWING. BEFORE IT WAS i = Math.floor(i * HiPSHelper.pxXtile);
        // // pxXtile
        // // i = Math.floor(i * HiPSHelper.DEFAULT_Naxis1_2);
        // // j = Math.floor(j * HiPSHelper.DEFAULT_Naxis1_2);
        // // return [i, HiPSHelper.DEFAULT_Naxis1_2 - j - 1];
        // i = Math.floor(i * pxXtile);
        // j = Math.floor(j * pxXtile);
        // return [i, pxXtile - j - 1];
        // Bring x into [min_x, max_x) considering 360° wrap
        let xAdj = x;
        if (xInterval < 360) {
            if (xyGridProj.min_x < 0 && xAdj > xyGridProj.max_x)
                xAdj -= 360;
            if (xyGridProj.max_x > 360 && xAdj < xyGridProj.min_x)
                xAdj += 360;
            if (xAdj < xyGridProj.min_x)
                xAdj += 360;
            if (xAdj >= xyGridProj.max_x)
                xAdj -= 360;
        }
        const i_norm = (xAdj - xyGridProj.min_x) / xInterval;
        const j_norm = (y - xyGridProj.min_y) / yInterval;
        let i = 0.5 - (i_norm - j_norm);
        let j = (i_norm + j_norm) - 0.5;
        i = Math.floor(i * pxXtile);
        j = Math.floor(j * pxXtile);
        return [i, pxXtile - j - 1];
    }
    static pix2intermediate(i, j, xyGridProj, naxis1, naxis2) {
        /**
                   * (i_norm,w_pixel) = (0,0) correspond to the lower-left corner of the facet in the image
                 * (i_norm,w_pixel) = (1,1) is the upper right corner
                 * dimamond in figure 1 from "Mapping on the HEalpix grid" paper
                 * (0,0) leftmost corner
                 * (1,0) upper corner
                 * (0,1) lowest corner
                 * (1,1) rightmost corner
                 * Thanks YAGO! :p
                 */
        // let cnaxis1 = HiPSHelper.pxXtile;
        // let cnaxis2 = HiPSHelper.pxXtile;
        let cnaxis1 = naxis1;
        let cnaxis2 = naxis2;
        if (naxis1) {
            cnaxis1 = naxis1;
        }
        if (naxis2) {
            cnaxis2 = naxis2;
        }
        const i_norm = (i + 0.5) / cnaxis1;
        const j_norm = (j + 0.5) / cnaxis2;
        const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x) / 2.0;
        const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y) / 2.0;
        const yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;
        // bi-linear interpolation
        // const x = xyGridProj.max_x - xInterval * (i_norm + j_norm);
        const x = xyGridProj.min_x + xInterval * (i_norm + j_norm);
        const y = yMean - yInterval * (j_norm - i_norm);
        return [x, y];
    }
    // Ithink here I am passing RA and Dec becasue probably in the xyGridProj I am storing RA and Dec
    static intermediate2world(x, y) {
        let raDeg = NaN;
        let decDeg = NaN;
        const Yx = 90 * (HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.H; // = 45° for H=4,K=3
        if (Math.abs(y) <= Yx) { // equatorial belts
            // === Equatorial inverse ===
            // φ = x ;  sin(Dec) = y * H / (90 K)
            // raDeg = x
            // decDeg = radToDeg(Math.asin((y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K)))
            raDeg = x;
            const s = (y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K);
            const sClamped = Math.max(-1, Math.min(1, s));
            decDeg = radToDeg(Math.asin(sClamped));
        }
        else { // polar regions
            // === Polar inverse ===
            // σ = (K+1)/2 − |y| H / 180
            const sigma = (HiPSIntermediateProj.K + 1) / 2 - (Math.abs(y) * HiPSIntermediateProj.H) / 180;
            // Recover z = sin(Dec) with hemisphere from y
            const zAbs = 1 - (sigma * sigma) / HiPSIntermediateProj.K; // |sin(Dec)|
            const z = (y >= 0 ? 1 : -1) * zAbs;
            const zClamped = Math.max(-1, Math.min(1, z));
            decDeg = radToDeg(Math.asin(zClamped));
            // const thetaRad = Hploc.asin(1 - (sigma * sigma) / HiPSIntermediateProj.K)
            // let w = 0 // omega
            // if (HiPSIntermediateProj.K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
            //     w = 1
            // }
            // ω from hemisphere (use y), or K odd
            const w = (HiPSIntermediateProj.K % 2 !== 0 || y > 0) ? 1 : 0; // ✅ use hemisphere from y
            // Sector centre and RA
            const x_c = -180 + (2 * Math.floor((x + 180) * HiPSIntermediateProj.H / 360 + (1 - w) / 2) + w) * (180 / HiPSIntermediateProj.H);
            raDeg = x_c + (x - x_c) / (sigma || 1); // guard σ=0 at the pole
            // Optional: wrap RA to [0,360)
            raDeg = ((raDeg % 360) + 360) % 360;
            // decDeg = radToDeg(thetaRad)
            // if (y <= 0) {
            //     decDeg *= -1
            // }
        }
        // return [phiDeg, thetaDeg];
        // TODO CHECK THIS!
        // let p = new Point(CoordsType.SPHERICAL, NumberType.DEGREES, phiDeg, thetaDeg);
        const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, raDeg, decDeg);
        return p;
    }
}

;// CONCATENATED MODULE: ./src/projections/HiPSHelper.ts
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */



class HiPSHelper {
    // static pxXtile: number = 512; // TODO in some cases it is different
    static DEFAULT_Naxis1_2 = 512;
    // static RES_ORDER_0: number = 58.6 / HiPSHelper.pxXtile;
    static RES_ORDER_0 = 58.6;
    static H = 4;
    static K = 3;
    static THETAX = Hploc.asin((HiPSHelper.K - 1) / HiPSHelper.K);
    /**
     * Table 1 - ref paper HEALPix — a Framework for High Resolution Discretization,
     * and Fast Analysis of Data Distributed on the Sphere
     * K. M. G´orski1,2, E. Hivon3,4, A. J. Banday5, B. D. Wandelt6,7, F. K. Hansen8, M.
     * Reinecke5, M. Bartelman9
     */
    /**
     *
     * @param {decimal degrees} pxsize
     * @returns {int} nside
     */
    // static computeHiPSOrder(pxsize: number, pxXtile: number): number {
    // 	/**
    // 	 * with same order k (table 1), HIPS angular resolution is higher of order of 512 (2^9) pixels than 
    // 	 * the HEALPix. This is because each tile in a HiPS is represented by default by 512x512 pixels.\
    // 	 * Angular resolution of different HEALPix orders in respect to the order 0, can be calculated this
    // 	 * way:
    // 	 * 
    // 	 * 	L(k) = L(0) / 2^k = 58.6 / 2^k
    // 	 * 
    // 	 * Therefore, in the case of HiPS we need to take into account the extra resolution given by the 
    // 	 * 512x512 (2^9) tiles. In this case the above becomes:
    // 	 * 	
    // 	 * 	L(k) = L(0) / (2^k * 2^9) 
    // 	 * 
    // 	 * Though, in order to compute the required order starting from the pxsize desired (in input) we
    // 	 * need to perform these steps:
    // 	 * 
    // 	 * 	pxsize = L(k) = L(0) / (2^k * 2^9)
    // 	 * 	2^k = L(0) / (pxsize * 2^9)
    // 	 *  k * Log2 2 = Log2 L(0) - Log2 (pxsize * 2^9)
    // 	 * 	k = Log2 L(0) - Log2 (pxsize * 2^9)
    // 	 * 
    // 	 */
    // 	let k = Math.log2( (HiPSHelper.RES_ORDER_0 / pxXtile) / pxsize);
    // 	// let k = Math.log2(HiPSHelper.RES_ORDER_0 / (pxXtile * pxsize));
    // 	k = Math.round(k);
    // 	// let theta0px = HiPSHelper.RES_ORDER_0;
    // 	// let k = Math.log2(theta0px) - Math.log2(pxsize * 2**9);
    // 	// k = Match.round(k);
    // 	// let nside = 2**k;
    // 	// return {
    // 	//     "nside" : nside,
    // 	//     "norder" : k
    // 	// };
    // 	return k;
    // }
    // static computeHiPSOrder2(pxsize: number, pxXtile: number): number {
    // 	const k = Math.log2( Math.sqrt(Math.PI/ 3) / ( pxsize * pxXtile) )
    // 	const order = Math.round(k);
    // 	console.warn(k)
    // 	return order;
    // }
    // based on "HiPS – Hierarchical Progressive Survey" IVOA recomandation (formula on table 5)
    static computeOrder(pxAngSizeDeg, pxTileWidth) {
        console.log(`Computing HiPS order having pixel angular size of ${pxAngSizeDeg} in degrees`);
        const deg2rad = Math.PI / 180;
        const pxAngSizeRad = pxAngSizeDeg * deg2rad;
        console.log(`pixel angular res in radians ${pxAngSizeRad}`);
        const computedOrder = 0.5 * Math.log2(Math.PI / (3 * pxAngSizeRad * pxAngSizeRad * pxTileWidth * pxTileWidth));
        console.log(`Order ${computedOrder}`);
        if (computedOrder < 0) {
            return 0;
        }
        return Math.floor(computedOrder);
    }
    static getHelpixByOrder(order) {
        const nside = 2 ** order;
        const healpix = new Healpix(nside);
        return healpix;
    }
    static getHelpixBypxAngSize(pixelAngulaSize, TILE_WIDTH, hipsMaxOrder = null) {
        let healpixOrder = HiPSHelper.computeOrder(pixelAngulaSize, TILE_WIDTH);
        if (hipsMaxOrder && hipsMaxOrder > 0) {
            if (healpixOrder > hipsMaxOrder) {
                healpixOrder = hipsMaxOrder;
            }
        }
        const nside = 2 ** healpixOrder;
        const healpix = new Healpix(nside);
        return healpix;
    }
    // based on "HiPS – Hierarchical Progressive Survey" IVOA recomandation (formula on table 5)
    static computePxAngularSize(pxTileWidth, order) {
        const computedPxAngSizeRadiant = Math.sqrt(4 * Math.PI / (12 * (pxTileWidth * (2 ** order)) ** 2));
        console.log(`Computing Pixel size with tile of ${pxTileWidth} pixels and order ${order}`);
        const rad2deg = 180 / Math.PI;
        const deg = computedPxAngSizeRadiant * rad2deg;
        const arcmin = computedPxAngSizeRadiant * rad2deg * 60;
        const arcsec = computedPxAngSizeRadiant * rad2deg * 3600;
        console.log("Pixel size in radiant:" + computedPxAngSizeRadiant);
        console.log("Pixel size in degrees:" + deg);
        console.log("Pixel size in arcmin:" + arcmin);
        console.log("Pixel size in arcsec:" + arcsec);
        return {
            "rad": computedPxAngSizeRadiant,
            "deg": deg,
            "arcmin": arcmin,
            "arcsec": arcsec
        };
    }
    /**
     * Reference: HiPS – Hierarchical Progressive Survey page 11
     * pxsize =~ sqrt[4 * PI / (12 * (512 * 2^order)^2)]
     * @param {*} order
     */
    static computePxSize(order, pxXtile) {
        // TODO CHECK IT
        // let pxsize = 1 / (512 * 2 ** order) * Math.sqrt(Math.PI / 3);
        let pxsize = 1 / (pxXtile * 2 ** order) * Math.sqrt(Math.PI / 3);
        return pxsize;
    }
    // /**
    //  * 
    //  * @param {Object {ra, dec}} point  decimal degrees
    //  * @returns {Object {phi_rad, theta_rad}} in radians
    //  */
    // static convert2PhiTheta (point: Point) {
    // 	let phitheta_rad = {};
    // 	let phiTheta_deg = HiPSHelper.astroDegToSpherical(point.ra, point.dec);
    // 	phitheta_rad.phi_rad = HiPSHelper.degToRad(phiTheta_deg.phi);
    //     phitheta_rad.theta_rad = HiPSHelper.degToRad(phiTheta_deg.theta);
    // 	return phitheta_rad;
    // }
    // static astroDegToSphericalRad(raDeg: number, decDeg: number) {
    // 	let phiThetaDeg = HiPSHelper.astroDegToSpherical(raDeg, decDeg);
    // 	let phiThetaRad = {
    // 		phi_rad: HiPSHelper.degToRad(phiThetaDeg.phi),
    // 		theta_rad: HiPSHelper.degToRad(phiThetaDeg.theta)
    // 	}
    // 	return phiThetaRad;
    // }
    // static degToRad(degrees: number): number {
    // 	return (degrees / 180 ) * Math.PI ;
    // }
    // static radToDeg(rad: number): number {
    // 	return (rad / Math.PI ) * 180 ;
    // }
    // static astroDegToSpherical(raDeg: number, decDeg: number): Point{
    // 	let phiDeg: number;
    // 	let thetaDeg: number;
    // 	phiDeg = raDeg;
    // 	if (phiDeg < 0){
    // 		phiDeg += 360;
    // 	}
    // 	thetaDeg = 90 - decDeg;
    // 	return {
    // 		phi: phiDeg,
    // 		theta: thetaDeg
    // 	};
    // }
    /**
     *
     * @param {Object {phi_rad, theta_rad}} phiTheta_rad Center of the circle in radians
     * @param {decimal} r Radius of the circle in radians
     * @returns
     */
    static computeBbox(point, r) {
        let bbox = [];
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad - r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad + r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad + r, point.getSpherical().phiRad + r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad - r));
        return bbox;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/HiPSProperties.ts
class HiPSProperties {
    static TILE_WIDTH = "hips_tile_width";
    static FRAME = "hips_frame";
    static ORDER = "hips_order";
    static GALACTIC = "galactic";
    static SCALE = "hips_pixel_scale";
    static BITPIX = "hips_pixel_bitpix";
    itemMap = new Map();
    constructor() { }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
    isGalactic() {
        return this.itemMap.get(HiPSProperties.FRAME) == HiPSProperties.GALACTIC;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/HiPSFITS.ts







class HiPSFITS {
    payload = [];
    header;
    tileno;
    order;
    tileWidth;
    healpix;
    intermediateXYGrid;
    min = NaN;
    max = NaN;
    static CTYPE1 = "RA---HPX";
    static CTYPE2 = "DEC--HPX";
    static NPIX = "NPIX";
    constructor(fitsParsed, tileno, hipsProp) {
        if (fitsParsed) {
            this.initFromFITSParsed(fitsParsed);
        }
        else if (!tileno || !hipsProp) {
            console.error("tileno or hipsProp are not defined");
            throw new Error("tileno or hipsProp are not defined");
        }
        else {
            this.order = hipsProp.getItem(HiPSProperties.ORDER);
            const naxis1 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
            const naxis2 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
            this.tileno = tileno;
            if (naxis1 != naxis2) {
                console.error("NAXIS1 and NAXIS2 do not match.");
                throw new Error("NAXIS1 and NAXIS2 do not match.");
            }
            this.tileWidth = naxis1;
            this.tileno = tileno;
            this.healpix = HiPSHelper.getHelpixByOrder(this.order);
            this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(this.tileno, this.healpix);
        }
    }
    initFromUint8Array(imagePixelList, fitsHeaderParams, tileWidth) {
        this.setPayload(imagePixelList, fitsHeaderParams, tileWidth);
        this.setHeader(fitsHeaderParams);
    }
    // initFromUint8Array(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager) {
    //     this.setPayload(raDecList, originalValues, fitsHeaderParams)
    //     this.setHeader(fitsHeaderParams)
    // }
    getHeader() {
        return this.header;
    }
    getPayload() {
        return this.payload;
    }
    initFromFITSParsed(fitsParsed) {
        this.payload = fitsParsed.data;
        this.order = Number(fitsParsed.header.findById(HiPSProperties.ORDER)?.value);
        const naxis1 = Number(fitsParsed.header.findById(FITSHeaderManager.NAXIS1)?.value);
        const naxis2 = Number(fitsParsed.header.findById(FITSHeaderManager.NAXIS2)?.value);
        this.tileno = Number(fitsParsed.header.findById(HiPSFITS.NPIX)?.value);
        if (isNaN(this.order) || isNaN(naxis1) || isNaN(naxis2) || isNaN(this.tileno)) {
            console.warn("ORDER, NAXIS1 or NAXIS2 not defined");
            throw new Error("ORDER, NAXIS1 or NAXIS2 not defined");
        }
        if (naxis1 != naxis2) {
            console.error("NAXIS1 and NAXIS2 do not match.");
            throw new Error("NAXIS1 and NAXIS2 do not match.");
        }
        this.tileWidth = naxis1;
        this.computeMinMax(fitsParsed);
        this.setHeader(fitsParsed.header);
    }
    getTileno() {
        return this.tileno;
    }
    computeMinMax(fitsParsed) {
        const bitpix = Number(fitsParsed.header.findById(FITSHeaderManager.BITPIX)?.value);
        const bzero = Number(fitsParsed.header.findById(FITSHeaderManager.BZERO)?.value);
        const bscale = Number(fitsParsed.header.findById(FITSHeaderManager.BSCALE)?.value);
        const bytesXelem = Math.abs(bitpix / 8);
        for (let ridx = 0; ridx < fitsParsed.data.length; ridx++) {
            const row = fitsParsed.data[ridx];
            for (let cidx = 0; cidx < row.length; cidx++) {
                const valpixb = ParseUtils.extractPixelValue(0, this.payload[ridx].slice(cidx * bytesXelem, cidx * bytesXelem + bytesXelem), bitpix);
                if (valpixb == null) {
                    continue;
                }
                const valphysical = bzero + bscale * valpixb;
                if (valphysical < this.min || isNaN(this.min)) {
                    this.min = valphysical;
                }
                else if (valphysical > this.max || isNaN(this.max)) {
                    this.max = valphysical;
                }
            }
        }
    }
    static async downloadFITSFile(path) {
        const fits = await FITSParser.loadFITS(path);
        if (fits == null) {
            console.warn(`fits ${path} doesn't exist`);
            return null;
        }
        return fits;
    }
    getFITS() {
        return { header: this.header, data: this.payload };
    }
    setPayload(imagePixelList, fitsHeaderParams, tileWidth) {
        const bitpix = Number(fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value);
        const bzero = Number(fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value);
        const bscale = Number(fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value);
        const bytesXelem = Math.abs(bitpix / 8);
        if (!bytesXelem) {
            console.error("BITPIX not defined");
            throw new Error("BITPIX not defined");
        }
        this.payload = new Array(tileWidth);
        for (let row = 0; row < tileWidth; row++) {
            this.payload[row] = new Uint8Array(tileWidth * bytesXelem);
        }
        imagePixelList.forEach((imgpx) => {
            const ra = imgpx.getRADeg();
            const dec = imgpx.getDecDeg();
            const ac = fillAstro(ra, dec, NumberType.DEGREES);
            if (ac == null) {
                console.error(`Error converting ${ra}, ${dec} into AstroCoords object`);
                return;
            }
            const xy = HiPSIntermediateProj.world2intermediate(ac);
            const [col, row] = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, tileWidth);
            if (row < 0 || row >= tileWidth || col < 0 || col >= tileWidth)
                return;
            const valueBytes = imgpx.getUint8Value();
            if (!valueBytes)
                return; // or continue, depending on context
            for (let b = 0; b < bytesXelem; b++) {
                this.payload[row][col * bytesXelem + b] = valueBytes[b];
            }
            const valpixb = ParseUtils.extractPixelValue(0, valueBytes, bitpix);
            if (valpixb == null)
                return;
            const valphysical = bzero + bscale * valpixb;
            if (isNaN(this.min) || valphysical < this.min)
                this.min = valphysical;
            if (isNaN(this.max) || valphysical > this.max)
                this.max = valphysical;
        });
    }
    // private setPayload(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager) {
    //     const bitpix = Number(fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value)
    //     const bzero = Number(fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value)
    //     const bscale = Number(fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value)
    //     const bytesXelem = Math.abs(bitpix / 8)
    //     if (!bytesXelem) {
    //         console.error("BITPIX not defined")
    //         throw new Error("BITPIX not defined")
    //     }
    //     this.payload = new Array(this.tileWidth)
    //     for (let row = 0; row < this.tileWidth; row++) {
    //         this.payload[row] = new Uint8Array(this.tileWidth * bytesXelem)
    //     }
    //     for (let rdidx = 0; rdidx < raDecList.length; rdidx++) {
    //         const [ra, dec] = raDecList[rdidx]
    //         const ac = fillAstro(ra, dec, NumberType.DEGREES)
    //         if (ac == null) {
    //             console.error(`Error converting ${ra}, ${dec} into AstroCoords object`)
    //             continue
    //         }
    //         const sc = astroToSpherical(ac)
    //         const ptg = new Pointing(null, false, sc.thetaRad, sc.phiRad)
    //         const pixtileno: number = this.healpix.ang2pix(ptg)
    //         if (pixtileno != this.tileno) {
    //             continue
    //         }
    //         const xy = HiPSIntermediateProj.world2intermediate(ac);
    //         let ij = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, this.tileWidth);
    //         const col = ij[0];
    //         const row = ij[1];
    //         for (let b = 0; b < bytesXelem; b++) {
    //             const byte = originalValues[rdidx * bytesXelem + b];
    //             this.payload[row][col * bytesXelem + b] = byte
    //             // TODO check what's nodata!
    //             // if (nodata.get("" + pixtileno + "")) {
    //             // 	if (byte != 0) {
    //             // 		nodata.set("" + pixtileno + "", false);
    //             // 	}
    //             // }
    //             const valpixb = ParseUtils.extractPixelValue(0, this.payload[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), bitpix);
    //             if (valpixb == null) {
    //                 continue
    //             }
    //             const valphysical = bzero + bscale * valpixb;
    //             if (valphysical < this.min || isNaN(this.min)) {
    //                 this.min = valphysical;
    //             } else if (valphysical > this.max || isNaN(this.max)) {
    //                 this.max = valphysical;
    //             }
    //         }
    //     }
    // }
    addMandatoryItemToHeader(key, fitsHeaderParams) {
        const value = fitsHeaderParams.findById(key)?.value;
        if (value === undefined || value == null) {
            console.error(`${key} not defined`);
            throw new Error(key + " is not defined");
        }
        const item = new FITSHeaderItem(key, value, "");
        this.header.insert(item);
    }
    addItemToHeader(key, fitsHeaderParams) {
        const value = fitsHeaderParams.findById(key)?.value;
        if (value !== undefined || value != null) {
            const item = new FITSHeaderItem(key, value, "");
            this.header.insert(item);
        }
    }
    setHeader(fitsHeaderParams) {
        this.header = new FITSHeaderManager();
        this.addMandatoryItemToHeader(FITSHeaderManager.SIMPLE, fitsHeaderParams);
        this.addMandatoryItemToHeader(FITSHeaderManager.BITPIX, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BLANK, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BSCALE, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BZERO, fitsHeaderParams);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS, Number(2), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS1, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS2, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMIN, this.min, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMAX, this.min, ""));
        this.header.insert(new FITSHeaderItem(HiPSProperties.ORDER, Number(this.order), ""));
        this.header.insert(new FITSHeaderItem(HiPSFITS.NPIX, Number(this.tileno), ""));
        const crpix = this.tileno / 2;
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX1, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX2, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.ORIGIN, "WCSLight v.0.x", ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.COMMENT, "", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        let vec3 = this.healpix.pix2vec(this.tileno);
        let ptg = new Pointing(vec3);
        let crval1 = radToDeg(ptg.phi);
        let crval2 = 90 - radToDeg(ptg.theta);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL1, crval1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL2, crval2, ""));
        this.header.insert(new FITSHeaderItem("END", "", ""));
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/FITSList.ts


class FITSList {
    fitslist = new Map();
    constructor() { }
    getFITSList() {
        return this.fitslist;
    }
    getFITS(tileno) {
        const fits = this.fitslist.get(tileno);
        return fits === undefined ? null : fits;
    }
    async addFITSByURL(url) {
        const fits = await FITSParser.loadFITS(url);
        const hipsFits = new HiPSFITS(fits, null, null);
        this.fitslist.set(hipsFits.getTileno(), hipsFits);
    }
    addFITS(fits) {
        const tileno = fits.getTileno();
        this.fitslist.set(tileno, fits);
    }
}

// EXTERNAL MODULE: node:fs/promises (ignored)
var promises_ignored_ = __webpack_require__(942);
;// CONCATENATED MODULE: ./src/projections/hips/HiPSPropManager.ts


class HiPSPropManager {
    static async parsePropertyFile(baseURL) {
        let hipsPropText = "";
        if (baseURL.includes("http")) { // HiPS from web
            hipsPropText = await HiPSPropManager.getPorpertyFromWeb(baseURL);
        }
        else { // local HiPS
            hipsPropText = await HiPSPropManager.getPorpertyFromFS(baseURL);
        }
        const hipsProp = HiPSPropManager.parseHiPSPropertiesBody(hipsPropText);
        return hipsProp;
    }
    static async getPorpertyFromWeb(baseHiPSPath) {
        const response = await fetch(baseHiPSPath + "/properties");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        else {
            const propFile = await response.text();
            return propFile;
        }
        // let propFile: string
        // if (response instanceof ArrayBuffer) {
        //     const textDecoder = new TextDecoder("iso-8859-1")
        //     propFile = textDecoder.decode(new Uint8Array(response))
        // } else {
        //     propFile = response.toString()
        // }
        // return propFile
    }
    static async getPorpertyFromFS(baseHiPSPath) {
        const propPath = baseHiPSPath + "/properties";
        const rawData = await (0,promises_ignored_.readFile)(propPath);
        const uint8 = new Uint8Array(rawData);
        const textDecoder = new TextDecoder('ascii');
        const propFile = textDecoder.decode(uint8);
        return propFile;
    }
    static parseHiPSPropertiesBody(hipsPropText) {
        let hipsProp = new HiPSProperties();
        const txtArr = hipsPropText.split('\n');
        for (let line of txtArr) {
            if (!line.includes("=")) {
                continue;
            }
            const tokens = line.split("=");
            if (tokens[1] === undefined) {
                continue;
            }
            const key = tokens[0].trim();
            const val = tokens[1].trim();
            let value = val;
            if (key == HiPSProperties.ORDER || key == HiPSProperties.TILE_WIDTH || key == HiPSProperties.SCALE || key == HiPSProperties.BITPIX) {
                value = parseInt(val);
            }
            hipsProp.addItem(key, value);
        }
        return hipsProp;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/HiPSProjection.ts














class HiPSProjection {
    baseURL;
    healpix = null;
    hipsProp = null;
    constructor(baseHiPSPath) {
        this.baseURL = baseHiPSPath;
        this.init();
        if (this.healpix == null) {
            console.warn("healpix is null");
            throw new Error("healpix is null");
        }
        if (this.hipsProp == null) {
            console.warn("HiPSProp is null");
            throw new Error("HiPSProp is null");
        }
    }
    async init() {
        const hipsProp = await this.parsePropertyFile();
        const order = hipsProp.getItem(HiPSProperties.ORDER);
        this.healpix = HiPSHelper.getHelpixByOrder(order);
    }
    async parsePropertyFile() {
        const hipsProp = HiPSPropManager.parsePropertyFile(this.baseURL);
        return hipsProp;
    }
    static getImageRADecList(center, radiusDeg, pixelAngSize, TILE_WIDTH) {
        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);
        // let tilesRaDecList2 = new TilesRaDecList2(healpix.order)
        let tilesRaDecList2 = new TilesRaDecList2();
        const ptg = new Pointing(null, false, center.getSpherical().thetaRad, center.getSpherical().phiRad);
        const radius_rad = degToRad(radiusDeg);
        // ??? with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        const rangeset = healpix.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
        // TODO try to replace tileslist with FITSList!!!
        // const tileslist: Array<number> = [];
        for (let p = 0; p < rangeset.r.length; p++) {
            // if (!tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
            //     tileslist.push(rangeset.r[p]);
            // }
            if (!tilesRaDecList2.getTilesList().includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                tilesRaDecList2.addTileNumber(rangeset.r[p]);
                // tileslist.push(rangeset.r[p]);
            }
        }
        const cpix = healpix.ang2pix(ptg);
        // if (!tileslist.includes(cpix)) {
        //     tileslist.push(cpix);
        // }
        if (!tilesRaDecList2.getTilesList().includes(cpix)) {
            tilesRaDecList2.getTilesList().push(cpix);
        }
        // let raDecList: Array<[number, number]> = []
        let minra = center.getAstro().raDeg - radiusDeg;
        let maxra = center.getAstro().raDeg + radiusDeg;
        let mindec = center.getAstro().decDeg - radiusDeg;
        let maxdec = center.getAstro().decDeg + radiusDeg;
        tilesRaDecList2.getTilesList().forEach((tileno) => {
            // tileslist.forEach((tileno: number) => {
            for (let j = 0; j < TILE_WIDTH; j++) {
                for (let i = 0; i < TILE_WIDTH; i++) {
                    const point = HiPSProjection.pix2world(i, j, tileno, healpix, TILE_WIDTH);
                    if (point == null)
                        continue;
                    if (point.getAstro().raDeg < minra || point.getAstro().raDeg > maxra ||
                        point.getAstro().decDeg < mindec || point.getAstro().decDeg > maxdec) {
                        continue;
                    }
                    tilesRaDecList2.addImagePixel(new ImagePixel(point.getAstro().raDeg, point.getAstro().decDeg, tileno));
                    // raDecList.push([point.getAstro().raDeg, point.getAstro().decDeg]);
                }
            }
        });
        // const tilesRaDecList = new TilesRaDecList(raDecList, tileslist)
        // return tilesRaDecList
        return tilesRaDecList2;
    }
    static _xyGridCache = new Map();
    static pix2world(i, j, tileno, healpix, TILE_WIDTH) {
        const order = healpix.order ?? Math.log2(healpix.nside); // adapt to your healpixjs
        const cacheKey = `${order}:${tileno}`;
        let xyGridProj = HiPSProjection._xyGridCache.get(cacheKey);
        if (!xyGridProj) {
            xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
            const Dx = xyGridProj.max_x - xyGridProj.min_x;
            const Dy = xyGridProj.max_y - xyGridProj.min_y;
            console.log(`deltaX: ${Dx}, deltaY ${Dy} order ${order} tileno ${tileno}`);
            HiPSProjection._xyGridCache.set(cacheKey, xyGridProj);
        }
        if (!healpix)
            return null;
        // const xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
        const [x, y] = HiPSIntermediateProj.pix2intermediate(i, j, xyGridProj, TILE_WIDTH, TILE_WIDTH);
        if (!Number.isFinite(x) || !Number.isFinite(y))
            return null;
        const p = HiPSIntermediateProj.intermediate2world(x, y);
        const ra = p.getAstro().raDeg;
        const dec = p.getAstro().decDeg;
        if (!Number.isFinite(ra) || !Number.isFinite(dec))
            return null;
        return p;
    }
    // static getFITSFiles(inputValues: Uint8Array, tilesRaDecList: TilesRaDecList, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH?: number): FITSList {
    static getFITSFiles(tilesRaDecList, fitsHeaderParams, pixelAngSize, TILE_WIDTH) {
        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);
        let fitsList = new FITSList();
        tilesRaDecList.getTilesList().forEach((tileno) => {
            let hipsProp = new HiPSProperties();
            hipsProp.addItem(HiPSProperties.ORDER, healpix.order);
            hipsProp.addItem(HiPSProperties.TILE_WIDTH, TILE_WIDTH);
            const hipsFits = new HiPSFITS(null, tileno, hipsProp);
            const imagePixelsByTilesNo = tilesRaDecList.getImagePixelsByTile(tileno);
            hipsFits.initFromUint8Array(imagePixelsByTilesNo, fitsHeaderParams, TILE_WIDTH);
            fitsList.addFITS(hipsFits);
        });
        return fitsList;
    }
    static async world2pix(radeclist, hipsOrder, isGalactic, TILE_WIDTH, baseHiPSURL) {
        const healpix = HiPSHelper.getHelpixByOrder(hipsOrder);
        let tileno;
        let prevTileno = null;
        /* if HiPS in galactic => convert the full list of (RA, Dec) to Galactic  (l, b) */
        if (isGalactic) {
            HiPSProjection.convertToGalactic(radeclist);
        }
        let xyGridProj = null;
        radeclist.getImagePixelList().forEach((imgpx) => {
            const ra = imgpx.getRADeg();
            const dec = imgpx.getDecDeg();
            const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
            const ptg = new Pointing(null, false, p.getSpherical().thetaRad, p.getSpherical().phiRad);
            tileno = healpix.ang2pix(ptg);
            if (prevTileno !== tileno || prevTileno == null) {
                xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
                prevTileno = tileno;
            }
            if (xyGridProj) {
                const xy = HiPSIntermediateProj.world2intermediate(p.getAstro());
                const ij = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], xyGridProj, TILE_WIDTH);
                imgpx.setij(ij[0], ij[1]);
                imgpx.setTileNumber(tileno);
            }
            radeclist.addTileNumber(tileno);
        });
        let result = await HiPSProjection.getPixelValues(radeclist, baseHiPSURL, hipsOrder);
        return result;
    }
    // TODO move this to Utils.js
    static convertToGalactic(radeclist) {
        // let finalradeclist: number[][] = [];
        const deg2rad = Math.PI / 180;
        const rad2deg = 180 / Math.PI;
        const l_NCP = deg2rad * 122.930;
        const d_NGP = deg2rad * 27.1284;
        const a_NGP = deg2rad * 192.8595;
        radeclist.getImagePixelList().forEach((imgpx) => {
            const ra = imgpx.getRADeg();
            const dec = imgpx.getDecDeg();
            const ra_rad = deg2rad * ra;
            const dec_rad = deg2rad * dec;
            // sin(b)
            const sin_b = Math.sin(d_NGP) * Math.sin(dec_rad) +
                Math.cos(d_NGP) * Math.cos(dec_rad) * Math.cos(ra_rad - a_NGP);
            const b = Math.asin(sin_b);
            const b_deg = b * rad2deg;
            // l_NCP - l
            const lNCP_minus_l = Math.atan((Math.cos(dec_rad) * Math.sin(ra_rad - a_NGP)) /
                (Math.sin(dec_rad) * Math.cos(d_NGP) - Math.cos(dec_rad) * Math.sin(d_NGP) * Math.cos(ra_rad - a_NGP)));
            const l = l_NCP - lNCP_minus_l;
            const l_deg = l * rad2deg;
            imgpx.setRADecDeg(l_deg, b_deg);
            // finalradeclist.push([l_deg, b_deg])
        });
        // return finalradeclist;
    }
    static async getPixelValues(raDecList, baseHiPSURL, hipsOrder) {
        const tilesset = raDecList.getTilesList();
        let promises = [];
        for (let hipstileno of tilesset) {
            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            console.log(`Identified source file ${fitsurl}`);
            // TODO change the code below to used HiPSFITS and FITSList instead!
            promises.push(FITSParser.loadFITS(fitsurl).then((fitsParsed) => {
                if (fitsParsed) {
                    const bitpix = Number(fitsParsed.header.findById("BITPIX")?.value);
                    const naxis1 = Number(fitsParsed.header.findById("NAXIS1")?.value);
                    const naxis2 = Number(fitsParsed.header.findById("NAXIS2")?.value);
                    if (!bitpix || !naxis1 || !naxis2) {
                        console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`);
                        return;
                    }
                    if (raDecList.getBLANK() == null) {
                        const blankStr = fitsParsed.header.findById("BLANK")?.value;
                        if (blankStr) {
                            const blank = Number(blankStr);
                            if (!isNaN(blank)) {
                                raDecList.setBLANK(blank);
                            }
                        }
                    }
                    if (raDecList.getBSCALE() == null) {
                        const bscaleStr = fitsParsed.header.findById("BSCALE")?.value;
                        if (bscaleStr) {
                            const bscale = Number(bscaleStr);
                            if (!isNaN(bscale)) {
                                raDecList.setBSCALE(bscale);
                            }
                        }
                    }
                    if (raDecList.getBZERO() == null) {
                        const bzeroStr = fitsParsed.header.findById("BZERO")?.value;
                        if (bzeroStr) {
                            const bzero = Number(bzeroStr);
                            if (!isNaN(bzero)) {
                                raDecList.setBZERO(bzero);
                            }
                        }
                    }
                    // if (naxis1 * naxis2 * Math.abs(bitpix / 8) != fitsParsed.data.length) {
                    //     console.error(`fits data length ${fitsParsed.data.length} does not match expected size ${naxis1 * naxis2 * Math.abs(bitpix / 8)} for fits file ${fitsurl}`)
                    //     return
                    // }
                    const bytesXelem = Math.abs(bitpix / 8);
                    raDecList.getImagePixelsByTile(hipstileno).forEach((imgpx) => {
                        const valueBytes = new Uint8Array(bytesXelem);
                        if (fitsParsed.data[imgpx.getj()] == undefined) {
                            console.warn(`j index ${imgpx.getj()} is outside the image range 0-${naxis2 - 1} for fits file ${fitsurl}`);
                            return;
                        }
                        if ((imgpx.geti() * bytesXelem + bytesXelem) > fitsParsed.data[imgpx.getj()].length) {
                            console.warn(`i index ${imgpx.geti()} is outside the image range 0-${(fitsParsed.data[imgpx.getj()].length / bytesXelem) - 1} for fits file ${fitsurl}`);
                            return;
                        }
                        for (let b = 0; b < bytesXelem; b++) {
                            valueBytes[b] = fitsParsed.data[imgpx.getj()][imgpx.geti() * bytesXelem + b];
                        }
                        imgpx.setValue(valueBytes, bitpix);
                        raDecList.setMinMaxValue(imgpx.getValue());
                    });
                }
            }));
        }
        await Promise.all(promises);
        if (raDecList.getBSCALE() == null) {
            raDecList.setBSCALE(1);
        }
        if (raDecList.getBZERO() == null) {
            raDecList.setBZERO(0);
        }
        if (raDecList.getBLANK() == null) {
            raDecList.setBLANK(0);
        }
        return raDecList;
    }
}

;// CONCATENATED MODULE: ./src/projections/hips/CutoutResult.ts
class CutoutResult {
    fits;
    fitsused;
    projection;
    raDecMinMaxCentral;
    pxsize;
    constructor(fits, fitsused, projection, raDecMinMaxCentral, pxsize) {
        this.fits = fits;
        this.fitsused = fitsused;
        this.projection = projection;
        this.raDecMinMaxCentral = raDecMinMaxCentral;
        this.pxsize = pxsize;
    }
}

;// CONCATENATED MODULE: ./src/WCSLight.ts
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */







class WCSLight {
    /**
     * This function receives a FITS and generate a cutout on HiPS FITS.
     * @param center of the cutout in degrees
     * @param radius of the cutout in degrees
     * @param pxsize of the cutout in degrees
     * @param filePath of the input FITS file
     * @returns fitsList of FITS in HiPS format
     */
    static async fitsCutoutToHiPS(center, radius, pxsize, filePath) {
        const HiPS_TILE_WIDTH = 512;
        // 0. here is missing the validation/check that the input file used to get the value, contains the center ...
        // 1. open input fits file and understand the projection and set up in inprojection details like NAXIS1-2, CDELT1-2, CRVAL1-2, minRa and minDec
        const inProjection = await WCSLight.extractProjectionType(filePath);
        if (!inProjection)
            return null;
        // const bitpix = inProjection.getBitpix()
        // 2. from HiPS output projection, compute the list of RA,Dec and related tileno based on center, radius, pxsize, and tilewidth forced to 512
        const outTilesRaDecList = HiPSProjection.getImageRADecList(center, radius, pxsize, HiPS_TILE_WIDTH);
        if (!outTilesRaDecList) {
            return null;
        }
        // 3. by using the list of RA and Dec on point 2., convert RA,Dec into i,j used in the input projection to get pixel values (try to merge the 2 calls below in one single method)
        inProjection.world2pix(outTilesRaDecList);
        // const invalues = await inProjection.getPixValues(tilesRaDecList)
        // 4. collect the details required to construct the output HiPS projection header 
        // const fitsHeaderParams = inProjection.getCommonFitsHeaderParams();
        // here pass inProjection.getFITSHeader()
        // 5. generate output HiPS FITS file(s)
        const fitsFileList = HiPSProjection.getFITSFiles(outTilesRaDecList, inProjection.getFITSHeader(), pxsize, HiPS_TILE_WIDTH);
        for (let hipsFitsEntry of fitsFileList.getFITSList()) {
            const tileno = hipsFitsEntry[0];
            const hipsFits = hipsFitsEntry[1];
            const data = hipsFits.getPayload();
            const header = hipsFits.getHeader();
            const FITS_FILE_PATH = `./hips_${tileno}.fits`;
            const fitsParsed = { header: header, data: data };
            FITSParser.saveFITSLocally(fitsParsed, FITS_FILE_PATH);
        }
        return fitsFileList;
    }
    // only MERCATOR supported at the moment
    static async extractProjectionType(filePath) {
        let fits = await FITSParser.loadFITS(filePath);
        if (!fits)
            return null;
        const ctype = String(fits.header.findById("CTYPE1")?.value);
        if (ctype.includes("MER")) {
            let projection = new MercatorProjection();
            await projection.initFromFile(filePath);
            return projection;
        }
        return null;
    }
    // TODO: instead of using AbstractProjection, use a constant file with supported projection names
    static async hipsCutoutToFITS(center, radius, pixelAngSize, baseHiPSURL, outproj, hipsOrder = null) {
        const hipsProp = await HiPSPropManager.parsePropertyFile(baseHiPSURL);
        const hipsMaxOrder = hipsProp.getItem(HiPSProperties.ORDER);
        const hipsFrame = hipsProp.getItem(HiPSProperties.FRAME);
        const TILE_WIDTH = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
        let isGalactic = false;
        if (hipsFrame.toLowerCase() == 'galactic') {
            isGalactic = true;
        }
        if (!hipsOrder) {
            const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH, hipsMaxOrder);
            hipsOrder = Number(healpix.order);
        }
        /*
        below how naxis are computed
        outproj.getImageRADecList -> computeSquaredNaxes -> set naxis1 and naxis2
        */
        const naxisWidth = outproj.computeNaxisWidth(radius, pixelAngSize);
        const outRADecList = outproj.getImageRADecList(center, radius, pixelAngSize, naxisWidth);
        if (!outRADecList)
            return null;
        const raDecMinMaxCentral = outRADecList.computeRADecMinMaxCentral();
        if (raDecMinMaxCentral == null)
            return null;
        const cRA = raDecMinMaxCentral?.getCentralRA();
        const cDec = raDecMinMaxCentral?.getCentralDec();
        if (cRA === undefined || cDec === undefined)
            return null;
        // TODO check if possible to compute in the word2pix, when iterating onver ImagePixels, the min and max value.
        const raDecWithValues = await HiPSProjection.world2pix(outRADecList, hipsOrder, isGalactic, TILE_WIDTH, baseHiPSURL);
        if (!raDecWithValues)
            return null;
        const minValue = raDecWithValues.getMinMaxValues()?.getMinValue();
        const maxValue = raDecWithValues.getMinMaxValues()?.getMaxValue();
        if (minValue === undefined || maxValue === undefined)
            return null;
        /** info required:
         * SIMPLE  = T
            BITPIX  = -64
            NAXIS   = 2
            NAXIS1  = 512
            NAXIS2  = 512
            BSCALE  = 1
            BZERO   = 0
            CTYPE1  = RA---HPX
            CTYPE2  = DEC--HPX
            DATAMIN = 0
            DATAMAX = 0
            hips_order= 7
            NPIX    = 113056
            CRPIX1  = 56528
            CRPIX2  = 56528
            ORIGIN  = WCSLight v.0.x
            COMMENT =  / WCSLight v0.x developed by F.Giordano and Y.Ascasibar
            CRVAL1  = 170.15625
            CRVAL2  = 18.5243910738658
            END
         */
        // TODO BLANK, BZERO, BSCALE must be taken from the FITS tiles and not from the HiPS metadata.
        const BLANK = raDecWithValues.getBLANK();
        const BZERO = raDecWithValues.getBZERO();
        const BSCALE = raDecWithValues.getBSCALE();
        if (BLANK === null || BZERO === null || BSCALE === null)
            return null;
        console.log(`BLANK: ${BLANK}, BZERO: ${BZERO}, BSCALE: ${BSCALE}`);
        // validate BITPIX
        const BITPIX = parseInt(hipsProp.getItem(HiPSProperties.BITPIX));
        if (BITPIX != 8 && BITPIX != 16 && BITPIX != 32 && BITPIX != -32 && BITPIX != -64) {
            throw new Error("unsupported BITPIX value");
        }
        const fits = outproj.generateFITSFile(pixelAngSize, hipsProp.getItem(HiPSProperties.BITPIX), naxisWidth, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues);
        console.log(fits);
        const FITS_FILE_PATH = `./cartesian2.fits`;
        const fitsParsed = { header: fits.getHeader(), data: fits.getData() };
        FITSParser.saveFITSLocally(fitsParsed, FITS_FILE_PATH);
        let hipsUsed = Array();
        raDecWithValues.getTilesList().forEach((hipstileno) => {
            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            hipsUsed.push(fitsurl);
        });
        const result = new CutoutResult(fits, hipsUsed, outproj, raDecMinMaxCentral, pixelAngSize);
        return result;
    }
    static hipsFITSChangeProjection() {
        return null;
    }
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    // static generateFITS(fitsheader: any, fitsdata: any): string {
    //     const fitsParsed = {
    //         header: fitsheader,
    //         data: fitsdata
    //     }
    //     // const blobUrl = FITSParser.generateFITSForWeb(fitsheader, fitsdata);
    //     const blobUrl = FITSParser.generateFITSForWeb(fitsParsed);
    //     return blobUrl;
    // }
    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }
}

;// CONCATENATED MODULE: ./src/model/ImagePixel.ts
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class ImagePixel_ImagePixel {
    _i; // int i of input projection
    _j; // int j of input projection
    _tileno; // int
    constructor(i, j, tileno = NaN) {
        this._i = i;
        this._j = j;
        this._tileno = tileno;
    }
    geti() {
        return this._i;
    }
    getj() {
        return this._j;
    }
    get tileno() {
        return this._tileno;
    }
}

;// CONCATENATED MODULE: ./src/index.ts












})();

var __webpack_exports__AbstractProjection = __webpack_exports__.qd;
var __webpack_exports__CoordsType = __webpack_exports__.lR;
var __webpack_exports__HiPSFITS = __webpack_exports__.v4;
var __webpack_exports__HiPSHelper = __webpack_exports__.lf;
var __webpack_exports__HiPSProjection = __webpack_exports__.qb;
var __webpack_exports__ImagePixel = __webpack_exports__.er;
var __webpack_exports__MercatorProjection = __webpack_exports__.Ne;
var __webpack_exports__NumberType = __webpack_exports__.wl;
var __webpack_exports__Point = __webpack_exports__.bR;
var __webpack_exports__WCSLight = __webpack_exports__.kv;
var __webpack_exports__astroToSpherical = __webpack_exports__.A1;
var __webpack_exports__cartesianToSpherical = __webpack_exports__.jU;
var __webpack_exports__degToRad = __webpack_exports__.pu;
var __webpack_exports__fillAstro = __webpack_exports__.jc;
var __webpack_exports__fillSpherical = __webpack_exports__.NZ;
var __webpack_exports__radToDeg = __webpack_exports__.H;
var __webpack_exports__sphericalToAstro = __webpack_exports__.Mp;
var __webpack_exports__sphericalToCartesian = __webpack_exports__.lq;
export { __webpack_exports__AbstractProjection as AbstractProjection, __webpack_exports__CoordsType as CoordsType, __webpack_exports__HiPSFITS as HiPSFITS, __webpack_exports__HiPSHelper as HiPSHelper, __webpack_exports__HiPSProjection as HiPSProjection, __webpack_exports__ImagePixel as ImagePixel, __webpack_exports__MercatorProjection as MercatorProjection, __webpack_exports__NumberType as NumberType, __webpack_exports__Point as Point, __webpack_exports__WCSLight as WCSLight, __webpack_exports__astroToSpherical as astroToSpherical, __webpack_exports__cartesianToSpherical as cartesianToSpherical, __webpack_exports__degToRad as degToRad, __webpack_exports__fillAstro as fillAstro, __webpack_exports__fillSpherical as fillSpherical, __webpack_exports__radToDeg as radToDeg, __webpack_exports__sphericalToAstro as sphericalToAstro, __webpack_exports__sphericalToCartesian as sphericalToCartesian };

//# sourceMappingURL=wcslight.esm.js.map