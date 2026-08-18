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
  aC: () => (/* reexport */ CartesianProjection),
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
const APP_VERSION =  true ? "3.1.0-snapshot" : 0;

;// CONCATENATED MODULE: ./src/projections/cartesian/CartesianProjection.ts
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
class CartesianProjection extends AbstractProjection {
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
    _wcsname;
    constructor() {
        super();
        this._wcsname = "CAR"; // TODO check WCS standard and create ENUM
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
        const BLANK = Number(header.findById("BLANK")?.value ?? 0);
        const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);
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
                u8 = blankBytes.slice(0);
                pixels[idx].setValue(u8, BITPIX);
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

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/vec3.js
class Vec3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        if (![x, y, z].every(Number.isFinite)) {
            throw new RangeError("Vec3 coordinates must be finite numbers.");
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getZ() {
        return this.z;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    normalize() {
        const length = this.length();
        if (length === 0)
            throw new RangeError("Cannot normalize a zero-length vector.");
        return new Vec3(this.x / length, this.y / length, this.z / length);
    }
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
}

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/pointing.js

class Pointing {
    theta;
    phi;
    constructor(vec3, mirror = false, theta, phi) {
        if (vec3) {
            const unit = new Vec3(vec3.x, vec3.y, vec3.z).normalize();
            this.theta = Math.atan2(Math.sqrt(unit.x * unit.x + unit.y * unit.y), unit.z);
            this.phi = normalizePhi(mirror ? -Math.atan2(unit.y, unit.x) : Math.atan2(unit.y, unit.x));
            return;
        }
        if (!Number.isFinite(theta) || !Number.isFinite(phi)) {
            throw new RangeError("Pointing requires either a Vec3-like object or finite theta/phi radians.");
        }
        this.theta = theta;
        this.phi = normalizePhi(phi);
    }
    toVec3() {
        const sinTheta = Math.sin(this.theta);
        return new Vec3(sinTheta * Math.cos(this.phi), sinTheta * Math.sin(this.phi), Math.cos(this.theta));
    }
}
function normalizePhi(phi) {
    const twoPi = 2 * Math.PI;
    return ((phi % twoPi) + twoPi) % twoPi;
}

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/rangeset.js
class RangeSet {
    r = [];
    append(value) {
        this.appendRange(value, value + 1);
    }
    appendRange(startInclusive, endExclusive) {
        if (!Number.isInteger(startInclusive) || !Number.isInteger(endExclusive)) {
            throw new RangeError("RangeSet bounds must be integers.");
        }
        if (startInclusive >= endExclusive)
            return;
        for (let value = startInclusive; value < endExclusive; value += 1) {
            this.r.push(value);
        }
    }
    toArray() {
        return [...this.r];
    }
}

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/healpix.js



const TWO_THIRDS = 2 / 3;
const HALF_PI = Math.PI / 2;
const TWO_PI = 2 * Math.PI;
const MAX_SUPPORTED_ORDER = 26;
const DISC_EPSILON = 2e-7;
const JRLL = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
const JPLL = [1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7];
const X_OFFSET = [-1, -1, 0, 1, 1, 1, 0, -1];
const Y_OFFSET = [0, 1, 1, 1, 0, -1, -1, -1];
const FACE_ARRAY = [
    [8, 9, 10, 11, -1, -1, -1, -1, 10, 11, 8, 9],
    [5, 6, 7, 4, 8, 9, 10, 11, 9, 10, 11, 8],
    [-1, -1, -1, -1, 5, 6, 7, 4, -1, -1, -1, -1],
    [4, 5, 6, 7, 11, 8, 9, 10, 11, 8, 9, 10],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [1, 2, 3, 0, 0, 1, 2, 3, 5, 6, 7, 4],
    [-1, -1, -1, -1, 7, 4, 5, 6, -1, -1, -1, -1],
    [3, 0, 1, 2, 3, 0, 1, 2, 4, 5, 6, 7],
    [2, 3, 0, 1, -1, -1, -1, -1, 0, 1, 2, 3]
];
const SWAP_ARRAY = [
    [0, 0, 3],
    [0, 0, 6],
    [0, 0, 0],
    [0, 0, 5],
    [0, 0, 0],
    [5, 0, 0],
    [0, 0, 0],
    [6, 0, 0],
    [3, 0, 0]
];
class Healpix {
    nside;
    order;
    npix;
    constructor(nside) {
        if (!Number.isInteger(nside) || nside <= 0) {
            throw new RangeError("nside must be a positive integer.");
        }
        const order = Math.log2(nside);
        if (!Number.isInteger(order)) {
            throw new RangeError("nside must be a power of two.");
        }
        if (order > MAX_SUPPORTED_ORDER) {
            throw new RangeError(`nside order must be <= ${MAX_SUPPORTED_ORDER} for safe JavaScript integer arithmetic.`);
        }
        this.nside = nside;
        this.order = order;
        this.npix = 12 * nside * nside;
    }
    getNPix() {
        return this.npix;
    }
    nside2order(nside) {
        if (!Number.isInteger(nside) || nside <= 0)
            return -1;
        const order = Math.log2(nside);
        return Number.isInteger(order) ? order : -1;
    }
    nest2xyf(pixel) {
        this.assertPixel(pixel);
        const facePixelCount = this.nside * this.nside;
        const face = Math.floor(pixel / facePixelCount);
        const localPixel = pixel % facePixelCount;
        return {
            ix: compactBits(localPixel),
            iy: compactBits(localPixel >> 1),
            face
        };
    }
    xyf2nest(ix, iy, face) {
        if (!Number.isInteger(face) || face < 0 || face >= 12) {
            throw new RangeError("face must be an integer in [0, 11].");
        }
        if (!Number.isInteger(ix) || ix < 0 || ix >= this.nside) {
            throw new RangeError("ix must be an integer in [0, nside).");
        }
        if (!Number.isInteger(iy) || iy < 0 || iy >= this.nside) {
            throw new RangeError("iy must be an integer in [0, nside).");
        }
        return face * this.nside * this.nside + spreadBits(ix) + 2 * spreadBits(iy);
    }
    /**
     * Converts spherical coordinates to a HEALPix NESTED pixel index.
     *
     * Coordinates follow the HEALPix convention used by common implementations:
     * theta is colatitude in radians, with 0 at the north pole and pi at the
     * south pole; phi is longitude in radians and is normalized into [0, 2pi).
     *
     * Formula sources:
     * - K. M. Gorski et al., "HEALPix: A Framework for High-Resolution
     *   Discretization and Fast Analysis of Data Distributed on the Sphere",
     *   Astrophysical Journal 622, 2005.
     * - HEALPix Primer / documentation: equal-area iso-latitude sphere
     *   subdivision, NESTED ordering, polar caps and equatorial belt.
     * - Public HEALPix algorithm descriptions for NESTED indexing using
     *   z = cos(theta), tt = phi / (pi/2), and the |z| = 2/3 belt boundary.
     *
     * Reference URLs:
     * - https://healpix.sourceforge.io/
     * - https://healpix.jpl.nasa.gov/
     * - https://healpix-geo.readthedocs.io/en/stable/healpix/index.html
     *
     * Points exactly on HEALPix cell boundaries can be assigned differently by
     * different implementations due to floating-point and boundary conventions.
     * This implementation normalizes phi before indexing.
     */
    ang2pix(pointing, _mirror = false) {
        if (!Number.isFinite(pointing.theta) || !Number.isFinite(pointing.phi)) {
            throw new RangeError("pointing theta and phi must be finite radians.");
        }
        if (pointing.theta < 0 || pointing.theta > Math.PI) {
            throw new RangeError("pointing theta must be in [0, pi].");
        }
        const z = Math.cos(pointing.theta);
        const za = Math.abs(z);
        const tt = healpix_normalizePhi(pointing.phi) / HALF_PI;
        if (za <= TWO_THIRDS) {
            const temp1 = this.nside * (0.5 + tt);
            const temp2 = this.nside * z * 0.75;
            const jp = Math.floor(temp1 - temp2);
            const jm = Math.floor(temp1 + temp2);
            const ifp = Math.floor(jp / this.nside);
            const ifm = Math.floor(jm / this.nside);
            const face = ifp === ifm ? (ifp | 4) : ifp < ifm ? ifp : ifm + 8;
            const ix = modulo(jm, this.nside);
            const iy = this.nside - modulo(jp, this.nside) - 1;
            return this.xyf2nest(ix, iy, face);
        }
        const ntt = Math.min(3, Math.floor(tt));
        const tp = tt - ntt;
        const sinTheta = Math.sin(pointing.theta);
        const edgeDistance = za < 0.99
            ? this.nside * Math.sqrt(3 * (1 - za))
            : (this.nside * sinTheta) / Math.sqrt((1 + za) / 3);
        const jp = Math.min(this.nside - 1, Math.floor(tp * edgeDistance));
        const jm = Math.min(this.nside - 1, Math.floor((1 - tp) * edgeDistance));
        return z >= 0
            ? this.xyf2nest(this.nside - jm - 1, this.nside - jp - 1, ntt)
            : this.xyf2nest(jp, jm, ntt + 8);
    }
    /**
     * Returns the unit vector pointing to the center of a NESTED pixel.
     *
     * Formula sources are the same public HEALPix references used by ang2pix.
     * The inverse mapping starts from the NESTED face-local coordinates
     * `(ix, iy, face)`, reconstructs the iso-latitude ring via `jr`, and then
     * derives `z = cos(theta)` and `phi` for the pixel center.
     */
    pix2vec(pixel) {
        return this.pix2ang(pixel).toVec3();
    }
    /**
     * Converts a NESTED pixel index to spherical coordinates at the pixel center.
     *
     * Returned coordinates follow the HEALPix convention: theta is colatitude in
     * radians and phi is longitude in radians normalized into [0, 2pi).
     */
    pix2ang(pixel, mirror = false) {
        const { z, phi } = this.pix2zphi(pixel);
        const theta = Math.acos(clamp(z, -1, 1));
        return new Pointing(null, mirror, theta, phi);
    }
    /**
     * Returns the four corner unit vectors for a NESTED pixel.
     *
     * The corners are evaluated in HEALPix face-local coordinates and returned
     * in the same order used by common HEALPix implementations: north, west,
     * south, east around the diamond-shaped projected pixel.
     *
     * Formula sources:
     * - HEALPix public projection model: each base-resolution face is mapped
     *   from local `(x, y, face)` coordinates to `(z, phi)` on the sphere.
     * - HEALPix Primer / documentation for the north polar cap, equatorial
     *   belt and south polar cap equations.
     *
     * Reference URLs:
     * - https://healpix.sourceforge.io/
     * - https://healpix.jpl.nasa.gov/
     * - https://healpix-geo.readthedocs.io/en/stable/healpix/index.html
     */
    getBoundaries(pixel) {
        const { ix, iy, face } = this.nest2xyf(pixel);
        const delta = 0.5 / this.nside;
        const centerX = (ix + 0.5) / this.nside;
        const centerY = (iy + 0.5) / this.nside;
        return [
            this.faceLocalToVec3(centerX + delta, centerY + delta, face),
            this.faceLocalToVec3(centerX - delta, centerY + delta, face),
            this.faceLocalToVec3(centerX - delta, centerY - delta, face),
            this.faceLocalToVec3(centerX + delta, centerY - delta, face)
        ];
    }
    /**
     * Returns `4 * step` unit vectors sampled along a NESTED pixel boundary.
     *
     * `step = 1` is equivalent to `getBoundaries(pixel)`. Higher values sample
     * each projected edge before moving to the next one, preserving the same
     * north, west, south, east traversal order.
     */
    getBoundariesWithStep(pixel, step) {
        if (!Number.isInteger(step) || step <= 0) {
            throw new RangeError("step must be a positive integer.");
        }
        const { ix, iy, face } = this.nest2xyf(pixel);
        const delta = 0.5 / this.nside;
        const centerX = (ix + 0.5) / this.nside;
        const centerY = (iy + 0.5) / this.nside;
        const increment = 1 / (this.nside * step);
        const points = new Array(4 * step);
        for (let index = 0; index < step; index += 1) {
            points[index] = this.faceLocalToVec3(centerX + delta - index * increment, centerY + delta, face);
            points[index + step] = this.faceLocalToVec3(centerX - delta, centerY + delta - index * increment, face);
            points[index + 2 * step] = this.faceLocalToVec3(centerX - delta + index * increment, centerY - delta, face);
            points[index + 3 * step] = this.faceLocalToVec3(centerX + delta, centerY - delta + index * increment, face);
        }
        return points;
    }
    /**
     * Returns the four corner unit vectors for explicit face-local coordinates.
     *
     * This is the same geometry as `getBoundaries`, but it avoids first packing
     * `(x, y, face)` into a NESTED pixel. It is kept as a compatibility method
     * for tile renderers that already operate in face-local coordinates.
     */
    getPointsForXyfNoStep(x, y, face) {
        this.assertXyf(x, y, face);
        const delta = 0.5 / this.nside;
        const centerX = (x + 0.5) / this.nside;
        const centerY = (y + 0.5) / this.nside;
        return [
            this.faceLocalToVec3(centerX + delta, centerY + delta, face),
            this.faceLocalToVec3(centerX - delta, centerY + delta, face),
            this.faceLocalToVec3(centerX - delta, centerY - delta, face),
            this.faceLocalToVec3(centerX + delta, centerY - delta, face)
        ];
    }
    /**
     * Returns the eight neighboring NESTED pixels using the legacy HEALPix order.
     *
     * Missing cardinal neighbors at the poles are returned as `-1`. The face
     * transition tables encode the public HEALPix base-face topology; interior
     * pixels avoid table lookup and stay on the current face.
     */
    neighbours(pixel) {
        const { ix, iy, face } = this.nest2xyf(pixel);
        const result = new Int32Array(8);
        const maxIndex = this.nside - 1;
        if (ix > 0 && ix < maxIndex && iy > 0 && iy < maxIndex) {
            result[0] = this.xyf2nest(ix - 1, iy, face);
            result[1] = this.xyf2nest(ix - 1, iy + 1, face);
            result[2] = this.xyf2nest(ix, iy + 1, face);
            result[3] = this.xyf2nest(ix + 1, iy + 1, face);
            result[4] = this.xyf2nest(ix + 1, iy, face);
            result[5] = this.xyf2nest(ix + 1, iy - 1, face);
            result[6] = this.xyf2nest(ix, iy - 1, face);
            result[7] = this.xyf2nest(ix - 1, iy - 1, face);
            return result;
        }
        for (let index = 0; index < result.length; index += 1) {
            let x = ix + X_OFFSET[index];
            let y = iy + Y_OFFSET[index];
            let neighborCase = 4;
            if (x < 0) {
                x += this.nside;
                neighborCase -= 1;
            }
            else if (x >= this.nside) {
                x -= this.nside;
                neighborCase += 1;
            }
            if (y < 0) {
                y += this.nside;
                neighborCase -= 3;
            }
            else if (y >= this.nside) {
                y -= this.nside;
                neighborCase += 3;
            }
            const neighborFace = FACE_ARRAY[neighborCase][face];
            if (neighborFace < 0) {
                result[index] = -1;
                continue;
            }
            const swapBits = SWAP_ARRAY[neighborCase][Math.floor(face / 4)];
            if ((swapBits & 1) > 0) {
                x = this.nside - x - 1;
            }
            if ((swapBits & 2) > 0) {
                y = this.nside - y - 1;
            }
            if ((swapBits & 4) > 0) {
                const previousX = x;
                x = y;
                y = previousX;
            }
            result[index] = this.xyf2nest(x, y, neighborFace);
        }
        return result;
    }
    /**
     * Returns pixels that overlap a spherical disk.
     *
     * The inclusive mode follows the public HEALPix strategy of testing at
     * `fact * nside` resolution and mapping matching subpixels back to this
     * instance's order. For NESTED ordering, `fact` must be zero or a power of
     * two. `fact = 0` disables inclusive oversampling.
     */
    queryDiscInclusive(pointing, radiusRad, fact) {
        if (!Number.isFinite(pointing.theta) || !Number.isFinite(pointing.phi)) {
            throw new RangeError("pointing theta and phi must be finite radians.");
        }
        if (!Number.isFinite(radiusRad) || radiusRad < 0) {
            throw new RangeError("radiusRad must be a non-negative finite number.");
        }
        if (!Number.isInteger(fact) || fact < 0 || (fact > 0 && !isPowerOfTwo(fact))) {
            throw new RangeError("fact must be zero or a positive power of two.");
        }
        const result = new RangeSet();
        if (radiusRad >= Math.PI) {
            result.appendRange(0, this.npix);
            return result;
        }
        const inclusive = fact !== 0;
        const oversamplingOrder = inclusive ? Math.log2(fact) : 0;
        const maxOrder = Math.min(MAX_SUPPORTED_ORDER, this.order + oversamplingOrder);
        const center = pointing.toVec3();
        const cosRadius = Math.cos(radiusRad);
        const sinRadius = Math.sin(radiusRad);
        const cosRadiusPlusPixelRadius = [];
        const cosRadiusMinusPixelRadius = [];
        const healpixByOrder = new Map();
        const pixels = new Set();
        const stack = [];
        for (let order = 0; order <= maxOrder; order += 1) {
            const pixelRadius = maxPixelRadius(2 ** order);
            const cosPixelRadius = Math.cos(pixelRadius);
            const sinPixelRadius = Math.sin(pixelRadius);
            cosRadiusPlusPixelRadius[order] =
                radiusRad + pixelRadius > Math.PI ? -1 : cosRadius * cosPixelRadius - sinRadius * sinPixelRadius;
            cosRadiusMinusPixelRadius[order] =
                radiusRad - pixelRadius < 0 ? 1 : cosRadius * cosPixelRadius + sinRadius * sinPixelRadius;
        }
        for (let face = 11; face >= 0; face -= 1) {
            stack.push({ pixel: face, order: 0 });
        }
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current)
                break;
            let orderHealpix = healpixByOrder.get(current.order);
            if (!orderHealpix) {
                orderHealpix = current.order === this.order ? this : new Healpix(2 ** current.order);
                healpixByOrder.set(current.order, orderHealpix);
            }
            const pixelCenter = orderHealpix.pix2vec(current.pixel);
            const centerDistanceCosine = center.dot(pixelCenter);
            if (centerDistanceCosine + DISC_EPSILON <= cosRadiusPlusPixelRadius[current.order]) {
                continue;
            }
            const zone = centerDistanceCosine < cosRadius
                ? 1
                : centerDistanceCosine <= cosRadiusMinusPixelRadius[current.order]
                    ? 2
                    : 3;
            this.collectDiscPixel(current.order, maxOrder, zone, current.pixel, inclusive, stack, pixels);
        }
        for (const pixel of [...pixels].sort((a, b) => a - b)) {
            result.append(pixel);
        }
        return result;
    }
    /**
     * Returns pixels that overlap a convex spherical polygon.
     *
     * The vertices are interpreted as ordered polygon corners on the unit
     * sphere. The implementation converts polygon edges to half-space normals
     * and delegates to the same hierarchical multi-disc test used by public
     * HEALPix polygon queries.
     */
    queryPolygonInclusive(vertices, fact) {
        if (vertices.length < 3) {
            throw new RangeError("vertices must contain at least three points.");
        }
        const vertexVectors = vertices.map((vertex) => {
            if (!Number.isFinite(vertex.theta) || !Number.isFinite(vertex.phi)) {
                throw new RangeError("polygon vertex theta and phi must be finite radians.");
            }
            return vertex.toVec3();
        });
        const normals = [];
        let flip = 0;
        let index = 0;
        while (index < vertexVectors.length) {
            const first = vertexVectors[index];
            const medium = vertexVectors[(index + 1) % vertexVectors.length];
            const last = vertexVectors[(index + 2) % vertexVectors.length];
            const normal = normalizeVec(crossVec(first, medium));
            const handedness = normal.dot(last);
            if (index === 0) {
                flip = handedness < 0 ? -1 : 1;
            }
            else if (flip * handedness < 0) {
                vertexVectors.splice((index + 1) % vertexVectors.length, 1);
                normals.splice(index, 1);
                index = Math.max(0, index - 1);
                continue;
            }
            normals[index] = scaleVec(normal, flip);
            index += 1;
        }
        const radii = new Array(normals.length).fill(HALF_PI);
        if (fact !== 0) {
            const containingCircle = findContainingCircle(vertexVectors);
            normals.push(containingCircle.center);
            radii.push(Math.acos(clamp(containingCircle.cosRadius, -1, 1)));
        }
        return this.queryMultiDisc(normals, radii, fact);
    }
    /**
     * Returns pixels that overlap the intersection of spherical discs.
     *
     * Each `normal[i]` is the center vector of a disc and `radiusRad[i]` its
     * angular radius. This is primarily the engine behind polygon queries, but
     * is exposed for compatibility with HEALPix-style APIs.
     */
    queryMultiDisc(normals, radiusRad, fact) {
        if (normals.length !== radiusRad.length) {
            throw new RangeError("normals and radiusRad must have the same length.");
        }
        if (!Number.isInteger(fact) || fact < 0 || (fact > 0 && !isPowerOfTwo(fact))) {
            throw new RangeError("fact must be zero or a positive power of two.");
        }
        const inclusive = fact !== 0;
        const oversamplingOrder = inclusive ? Math.log2(fact) : 0;
        const maxOrder = Math.min(MAX_SUPPORTED_ORDER, this.order + oversamplingOrder);
        const result = new RangeSet();
        const pixels = new Set();
        const stack = [];
        const healpixByOrder = new Map();
        const cosineLimits = [];
        for (const radius of radiusRad) {
            if (!Number.isFinite(radius) || radius < 0) {
                throw new RangeError("radiusRad values must be non-negative finite numbers.");
            }
        }
        for (let order = 0; order <= maxOrder; order += 1) {
            const pixelRadius = maxPixelRadius(2 ** order);
            cosineLimits[order] = normals.map((_, normalIndex) => {
                const radius = radiusRad[normalIndex];
                return [
                    radius + pixelRadius > Math.PI ? -1 : Math.cos(radius + pixelRadius),
                    order === 0 ? Math.cos(radius) : cosineLimits[0][normalIndex][1],
                    radius - pixelRadius < 0 ? 1 : Math.cos(radius - pixelRadius)
                ];
            });
        }
        for (let face = 11; face >= 0; face -= 1) {
            stack.push({ pixel: face, order: 0 });
        }
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current)
                break;
            let orderHealpix = healpixByOrder.get(current.order);
            if (!orderHealpix) {
                orderHealpix = current.order === this.order ? this : new Healpix(2 ** current.order);
                healpixByOrder.set(current.order, orderHealpix);
            }
            const pixelCenter = orderHealpix.pix2vec(current.pixel);
            let zone = 3;
            for (let normalIndex = 0; normalIndex < normals.length && zone > 0; normalIndex += 1) {
                const centerDistanceCosine = pixelCenter.dot(normals[normalIndex]);
                for (let zoneIndex = 0; zoneIndex < zone; zoneIndex += 1) {
                    if (centerDistanceCosine < cosineLimits[current.order][normalIndex][zoneIndex]) {
                        zone = zoneIndex;
                    }
                }
            }
            if (zone > 0) {
                this.collectDiscPixel(current.order, maxOrder, zone, current.pixel, inclusive, stack, pixels);
            }
        }
        for (const pixel of [...pixels].sort((a, b) => a - b)) {
            result.append(pixel);
        }
        return result;
    }
    assertPixel(pixel) {
        if (!Number.isInteger(pixel) || pixel < 0 || pixel >= this.npix) {
            throw new RangeError("pixel must be an integer in [0, npix).");
        }
    }
    assertXyf(x, y, face) {
        if (!Number.isInteger(face) || face < 0 || face >= 12) {
            throw new RangeError("face must be an integer in [0, 11].");
        }
        if (!Number.isInteger(x) || x < 0 || x >= this.nside) {
            throw new RangeError("x must be an integer in [0, nside).");
        }
        if (!Number.isInteger(y) || y < 0 || y >= this.nside) {
            throw new RangeError("y must be an integer in [0, nside).");
        }
    }
    pix2zphi(pixel) {
        const { ix, iy, face } = this.nest2xyf(pixel);
        const fact2 = 1 / (3 * this.nside * this.nside);
        const fact1 = 2 / (3 * this.nside);
        const jr = JRLL[face] * this.nside - ix - iy - 1;
        let ringPixelCount;
        let z;
        if (jr < this.nside) {
            ringPixelCount = jr;
            z = 1 - ringPixelCount * ringPixelCount * fact2;
        }
        else if (jr > 3 * this.nside) {
            ringPixelCount = 4 * this.nside - jr;
            z = ringPixelCount * ringPixelCount * fact2 - 1;
        }
        else {
            ringPixelCount = this.nside;
            z = (2 * this.nside - jr) * fact1;
        }
        const phiIndex = modulo(JPLL[face] * ringPixelCount + ix - iy, 8 * ringPixelCount);
        const phi = ringPixelCount === this.nside
            ? 0.75 * HALF_PI * phiIndex * fact1
            : (0.5 * HALF_PI * phiIndex) / ringPixelCount;
        return { z, phi: healpix_normalizePhi(phi) };
    }
    faceLocalToVec3(x, y, face) {
        const jr = JRLL[face] - x - y;
        let ringScale;
        let z;
        if (jr < 1) {
            ringScale = jr;
            z = 1 - (ringScale * ringScale) / 3;
        }
        else if (jr > 3) {
            ringScale = 4 - jr;
            z = (ringScale * ringScale) / 3 - 1;
        }
        else {
            ringScale = 1;
            z = (2 - jr) * TWO_THIRDS;
        }
        const phiIndex = modulo(JPLL[face] * ringScale + x - y, 8 * ringScale);
        const phi = ringScale <= Number.EPSILON ? 0 : (0.5 * HALF_PI * phiIndex) / ringScale;
        const sinTheta = Math.sqrt(Math.max(0, (1 - z) * (1 + z)));
        return new Vec3(sinTheta * Math.cos(phi), sinTheta * Math.sin(phi), z);
    }
    collectDiscPixel(order, maxOrder, zone, pixel, inclusive, stack, pixels) {
        if (zone === 0)
            return;
        if (order < this.order) {
            if (zone >= 3) {
                const childCount = 4 ** (this.order - order);
                for (let child = pixel * childCount; child < (pixel + 1) * childCount; child += 1) {
                    pixels.add(child);
                }
            }
            else {
                pushChildren(stack, pixel, order);
            }
            return;
        }
        if (order > this.order) {
            const parentPixel = Math.floor(pixel / 4 ** (order - this.order));
            if (zone >= 2 || order >= maxOrder) {
                pixels.add(parentPixel);
            }
            else {
                pushChildren(stack, pixel, order);
            }
            return;
        }
        if (zone >= 2) {
            pixels.add(pixel);
        }
        else if (inclusive) {
            if (order < maxOrder) {
                pushChildren(stack, pixel, order);
            }
            else {
                pixels.add(pixel);
            }
        }
    }
}
function spreadBits(value) {
    let result = 0;
    for (let bit = 0; bit <= MAX_SUPPORTED_ORDER; bit += 1) {
        result += (Math.floor(value / 2 ** bit) % 2) * 2 ** (2 * bit);
    }
    return result;
}
function compactBits(value) {
    let result = 0;
    for (let bit = 0; bit <= MAX_SUPPORTED_ORDER; bit += 1) {
        result += (Math.floor(value / 2 ** (2 * bit)) % 2) * 2 ** bit;
    }
    return result;
}
function healpix_normalizePhi(phi) {
    return ((phi % TWO_PI) + TWO_PI) % TWO_PI;
}
function modulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function isPowerOfTwo(value) {
    return value > 0 && 2 ** Math.floor(Math.log2(value)) === value;
}
function maxPixelRadius(nside) {
    const equatorialZ = TWO_THIRDS;
    const equatorialPhi = Math.PI / (4 * nside);
    const equatorialSinTheta = Math.sqrt((1 - equatorialZ) * (1 + equatorialZ));
    const equatorialPoint = new Vec3(equatorialSinTheta * Math.cos(equatorialPhi), equatorialSinTheta * Math.sin(equatorialPhi), equatorialZ);
    const polarOffset = (1 - 1 / nside) ** 2;
    const polarZ = 1 - polarOffset / 3;
    const polarPoint = new Vec3(Math.sqrt((1 - polarZ) * (1 + polarZ)), 0, polarZ);
    return Math.acos(clamp(equatorialPoint.dot(polarPoint), -1, 1));
}
function pushChildren(stack, pixel, order) {
    for (let index = 3; index >= 0; index -= 1) {
        stack.push({ pixel: 4 * pixel + index, order: order + 1 });
    }
}
function addVec(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}
function subVec(a, b) {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}
function scaleVec(vec, factor) {
    return new Vec3(vec.x * factor, vec.y * factor, vec.z * factor);
}
function crossVec(a, b) {
    return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function normalizeVec(vec) {
    return vec.normalize();
}
function findContainingCircle(points) {
    if (points.length < 2) {
        throw new RangeError("at least two points are required to find a containing circle.");
    }
    let center = normalizeVec(addVec(points[0], points[1]));
    let cosRadius = points[0].dot(center);
    for (let index = 2; index < points.length; index += 1) {
        if (points[index].dot(center) < cosRadius) {
            ({ center, cosRadius } = findCircleThroughOnePoint(points, index));
        }
    }
    return { center, cosRadius };
}
function findCircleThroughOnePoint(points, q) {
    let center = normalizeVec(addVec(points[0], points[q]));
    let cosRadius = points[0].dot(center);
    for (let index = 1; index < q; index += 1) {
        if (points[index].dot(center) < cosRadius) {
            ({ center, cosRadius } = findCircleThroughTwoPoints(points, index, q));
        }
    }
    return { center, cosRadius };
}
function findCircleThroughTwoPoints(points, q1, q2) {
    let center = normalizeVec(addVec(points[q1], points[q2]));
    let cosRadius = points[q1].dot(center);
    for (let index = 0; index < q1; index += 1) {
        if (points[index].dot(center) < cosRadius) {
            center = normalizeVec(crossVec(subVec(points[q1], points[index]), subVec(points[q2], points[index])));
            cosRadius = points[index].dot(center);
            if (cosRadius < 0) {
                center = scaleVec(center, -1);
                cosRadius = -cosRadius;
            }
        }
    }
    return { center, cosRadius };
}

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/hploc.js


class Hploc {
    z;
    _phi;
    sth;
    have_sth;
    constructor(pointing) {
        this.z = pointing ? Math.cos(pointing.theta) : 0;
        this._phi = pointing ? pointing.phi : 0;
        this.sth = pointing ? Math.sin(pointing.theta) : 0;
        this.have_sth = Boolean(pointing && Math.abs(this.z) > 0.99);
    }
    get phi() {
        return this._phi;
    }
    set phi(phi) {
        this._phi = phi;
    }
    toPointing(mirror = false) {
        const sinTheta = this.have_sth ? this.sth : Math.sqrt((1 - this.z) * (1 + this.z));
        return new Pointing(null, mirror, Math.atan2(sinTheta, this.z), this._phi);
    }
    toVec3() {
        const sinTheta = this.have_sth ? this.sth : Math.sqrt((1 - this.z) * (1 + this.z));
        return new Vec3(sinTheta * Math.cos(this._phi), sinTheta * Math.sin(this._phi), this.z);
    }
    static sin(value) {
        return Math.sin(value);
    }
    static cos(value) {
        return Math.cos(value);
    }
    static asin(value) {
        return Math.asin(value);
    }
    static acos(value) {
        return Math.acos(value);
    }
    static atan2(y, x) {
        return Math.atan2(y, x);
    }
}

;// CONCATENATED MODULE: ./node_modules/astrospatial-core/lib-esm/healpix/index.js






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
        const xy = {
            min_y: NaN,
            max_y: NaN,
            min_x: NaN,
            max_x: NaN,
            gridPointsDeg: [],
        };
        const corners = hp.getBoundariesWithStep(tileno, 1);
        const pts = [];
        const phis = [];
        for (let i = 0; i < corners.length; i++) {
            pts[i] = new Pointing(corners[i]);
            phis[i] = pts[i].phi;
            if (i >= 1) {
                const a = phis[i - 1];
                const b = phis[i];
                if (Math.abs(a - b) > Math.PI) {
                    if (a < b)
                        phis[i - 1] = a + 2 * Math.PI;
                    else
                        phis[i] = b + 2 * Math.PI;
                }
            }
        }
        // 2) project all boundary samples (WITHOUT Point to avoid RA wrap)
        const xs = [];
        const ys = [];
        for (let j = 0; j < pts.length; j++) {
            const coTheta = pts[j].theta;
            const decRad = Math.PI / 2 - coTheta;
            //   const raRad = pts[j].phi;
            const raRad = phis[j];
            const ac = {
                raDeg: radToDeg(raRad),
                raRad,
                decDeg: radToDeg(decRad),
                decRad,
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
            const pairs = xs
                .map((x, i) => ({ x, y: ys[i] }))
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
    static world2intermediate(ac) {
        let x_grid = NaN;
        let y_grid = NaN;
        if (Math.abs(ac.decRad) <= HiPSIntermediateProj.THETAX) {
            // equatorial belts
            x_grid = ac.raDeg;
            y_grid =
                (Hploc.sin(ac.decRad) * HiPSIntermediateProj.K * 90) /
                    HiPSIntermediateProj.H;
        }
        else if (Math.abs(ac.decRad) > HiPSIntermediateProj.THETAX) {
            // polar zones
            let raDeg = ac.raDeg;
            let w = 0; // omega
            if (HiPSIntermediateProj.K % 2 !== 0 || ac.decRad > 0) {
                // K odd or thetax > 0
                w = 1;
            }
            let sigma = Math.sqrt(HiPSIntermediateProj.K * (1 - Math.abs(Hploc.sin(ac.decRad))));
            let phi_c = -180 +
                (2 *
                    Math.floor(((ac.raDeg + 180) * HiPSIntermediateProj.H) / 360 + (1 - w) / 2) +
                    w) *
                    (180 / HiPSIntermediateProj.H);
            x_grid = phi_c + (raDeg - phi_c) * sigma;
            y_grid =
                (180 / HiPSIntermediateProj.H) *
                    ((HiPSIntermediateProj.K + 1) / 2 - sigma);
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
        let j = i_norm + j_norm - 0.5;
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
        const Yx = (90 * (HiPSIntermediateProj.K - 1)) / HiPSIntermediateProj.H; // = 45° for H=4,K=3
        if (Math.abs(y) <= Yx) {
            // equatorial belts
            // === Equatorial inverse ===
            // φ = x ;  sin(Dec) = y * H / (90 K)
            // raDeg = x
            // decDeg = radToDeg(Math.asin((y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K)))
            raDeg = x;
            const s = (y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K);
            const sClamped = Math.max(-1, Math.min(1, s));
            decDeg = radToDeg(Math.asin(sClamped));
        }
        else {
            // polar regions
            // === Polar inverse ===
            // σ = (K+1)/2 − |y| H / 180
            const sigma = (HiPSIntermediateProj.K + 1) / 2 -
                (Math.abs(y) * HiPSIntermediateProj.H) / 180;
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
            const w = HiPSIntermediateProj.K % 2 !== 0 || y > 0 ? 1 : 0; // ✅ use hemisphere from y
            // Sector centre and RA
            const x_c = -180 +
                (2 *
                    Math.floor(((x + 180) * HiPSIntermediateProj.H) / 360 + (1 - w) / 2) +
                    w) *
                    (180 / HiPSIntermediateProj.H);
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
        const order = healpix.order ?? Math.log2(healpix.nside); // keep compatibility with Healpix implementations exposing order or nside
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
        let resolvedBitpix = null;
        for (let hipstileno of tilesset) {
            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            console.log(`Identified source file ${fitsurl}`);
            // TODO change the code below to used HiPSFITS and FITSList instead!
            const fitsParsed = await FITSParser.loadFITS(fitsurl);
            if (fitsParsed) {
                const bitpix = Number(fitsParsed.header.findById("BITPIX")?.value);
                if (resolvedBitpix == null && Number.isFinite(bitpix)) {
                    resolvedBitpix = bitpix;
                }
                const naxis1 = Number(fitsParsed.header.findById("NAXIS1")?.value);
                const naxis2 = Number(fitsParsed.header.findById("NAXIS2")?.value);
                if (!bitpix || !naxis1 || !naxis2) {
                    console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`);
                    continue;
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
        }
        if (raDecList.getBSCALE() == null) {
            raDecList.setBSCALE(1);
        }
        if (raDecList.getBZERO() == null) {
            raDecList.setBZERO(0);
        }
        if (raDecList.getBLANK() == null) {
            raDecList.setBLANK(0);
        }
        if (resolvedBitpix != null) {
            const bytesXelem = Math.abs(resolvedBitpix / 8);
            const blankValue = raDecList.getBLANK() ?? 0;
            const blankBytes = ParseUtils.convertBlankToBytes(blankValue, bytesXelem);
            raDecList.getImagePixelList().forEach((imgpx) => {
                if (imgpx.getUint8Value() == null) {
                    imgpx.setValue(blankBytes.slice(0), resolvedBitpix);
                }
            });
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

;// CONCATENATED MODULE: ./src/projections/mercator/MercatorProjection.ts
/**
 * Mercator projection (RA---MER / DEC--MER)
 *
 * Implements AbstractProjection with Mercator forward/inverse transforms.
 * Vertical coordinate is Mercator-projected Y in degrees.
 *
 * @author Fabrizio
 */









const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const MAX_MERC_LAT = 85.0;
/** Forward Mercator: y(deg) from latitude φ(deg) */
function mercatorYdegFromLatDeg(phiDeg) {
    const clamped = Math.max(-MAX_MERC_LAT, Math.min(MAX_MERC_LAT, phiDeg));
    const phi = clamped * DEG2RAD;
    const y = Math.log(Math.tan(Math.PI / 4 + phi / 2));
    return y * RAD2DEG;
}
/** Inverse Mercator: latitude φ(deg) from y(deg) */
function latDegFromMercatorYdeg(yDeg) {
    const y = yDeg * DEG2RAD;
    const phi = 2 * Math.atan(Math.exp(y)) - Math.PI / 2;
    const phiDeg = phi * RAD2DEG;
    return Math.max(-MAX_MERC_LAT, Math.min(MAX_MERC_LAT, phiDeg));
}
class MercatorProjection extends AbstractProjection {
    minra;
    mindec; // actually stores minYdeg
    naxis1;
    naxis2;
    bitpix;
    fitsheader;
    pxvalues;
    CTYPE1 = "'RA---MER'";
    CTYPE2 = "'DEC--MER'";
    craDeg;
    cdecDeg;
    pxsize;
    _wcsname;
    constructor() {
        super();
        this._wcsname = "MER";
        this.pxvalues = [];
        this.fitsheader = new FITSHeaderManager();
    }
    /** ----------------------------------------------------------------------
     * Required implementations of AbstractProjection
     * ---------------------------------------------------------------------- */
    async initFromFile(infile) {
        const fits = await FITSParser.loadFITS(infile);
        if (!fits)
            throw new Error("FITS is null");
        this.pxvalues = fits.data;
        this.fitsheader = fits.header;
        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        this.bitpix = Number(fits.header.findById("BITPIX")?.value);
        this.craDeg = Number(fits.header.findById("CRVAL1")?.value);
        this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);
        const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
        const pxsize2 = Number(fits.header.findById("CDELT2")?.value);
        if (pxsize1 !== pxsize2 || isNaN(pxsize1) || isNaN(pxsize2)) {
            throw new Error("Invalid or inconsistent CDELT1/CDELT2");
        }
        this.pxsize = pxsize1;
        this.minra = this.craDeg - this.pxsize * this.naxis1 / 2;
        if (this.minra < 0)
            this.minra += 360;
        const cYdeg = mercatorYdegFromLatDeg(this.cdecDeg);
        this.mindec = cYdeg - this.pxsize * this.naxis2 / 2;
        return fits;
    }
    getBytePerValue() {
        return Math.abs(this.bitpix / 8);
    }
    getFITSHeader() {
        return this.fitsheader;
    }
    getCommonFitsHeaderParams() {
        const header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK"].includes(key)) {
                header.insert(new FITSHeaderItem(key, item.value, ""));
            }
        }
        return header;
    }
    getImageRADecList(center, radius, pxsize, naxisWidth) {
        const naxis1 = naxisWidth;
        const naxis2 = naxisWidth;
        let minra = center.getAstro().raDeg - radius;
        if (minra < 0)
            minra += 360;
        const cYdeg = mercatorYdegFromLatDeg(center.getAstro().decDeg);
        const minYdeg = cYdeg - radius;
        const tilesRaDecList = new TilesRaDecList2();
        for (let j = 0; j < naxis2; j++) {
            const yDeg = minYdeg + j * pxsize;
            const dec = latDegFromMercatorYdeg(yDeg);
            for (let i = 0; i < naxis1; i++) {
                let ra = minra + i * pxsize;
                if (ra >= 360)
                    ra -= 360;
                tilesRaDecList.addImagePixel(new ImagePixel(ra, dec, undefined));
            }
        }
        return tilesRaDecList;
    }
    computeNaxisWidth(radius, pxsize) {
        return Math.ceil(2 * radius / pxsize);
    }
    pix2world(i, j, pxsize, minra, mindec) {
        const ra = i * pxsize + minra;
        const yDeg = j * pxsize + mindec;
        const dec = latDegFromMercatorYdeg(yDeg);
        return new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
    }
    world2pix(raDecList) {
        const bytesXvalue = this.getBytePerValue();
        const blank = Number(this.fitsheader.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);
        for (const imgPx of raDecList.getImagePixelList()) {
            const ra = imgPx.getRADeg();
            const dec = imgPx.getDecDeg();
            const yDeg = mercatorYdegFromLatDeg(dec);
            const i = Math.floor((ra - this.minra) / this.pxsize);
            const j = Math.floor((yDeg - this.mindec) / this.pxsize);
            imgPx.setij(i, j);
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
    // And keep generateFITSFile(...) returning a FITS instance (not an object literal)
    generateFITSFile(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues) {
        const header = this.prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue);
        return this.setPixelValues(raDecWithValues, header);
    }
    /** ----------------------------------------------------------------------
     * FITS header & data handling
     * ---------------------------------------------------------------------- */
    prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue) {
        const fitsheader = new FITSHeaderManager();
        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        fitsheader.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        fitsheader.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        fitsheader.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT1", pixelAngSize, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT2", pixelAngSize, ""));
        fitsheader.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, ""));
        fitsheader.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, ""));
        fitsheader.insert(new FITSHeaderItem("CRVAL1", cRA, ""));
        fitsheader.insert(new FITSHeaderItem("CRVAL2", cDec, ""));
        fitsheader.insert(new FITSHeaderItem("DATAMIN", BZERO + BSCALE * minValue, ""));
        fitsheader.insert(new FITSHeaderItem("DATAMAX", BZERO + BSCALE * maxValue, ""));
        fitsheader.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
        fitsheader.insert(new FITSHeaderItem("END", "", ""));
        return fitsheader;
    }
    setPixelValues(raDecList, header) {
        const BITPIX = Number(header.findById("BITPIX")?.value);
        if (!Number.isFinite(BITPIX))
            throw new Error("BITPIX not found or invalid in header");
        const bytesPerElem = Math.abs(BITPIX) / 8;
        const width = Number(header.findById("NAXIS1")?.value);
        const height = Number(header.findById("NAXIS2")?.value);
        if (!Number.isFinite(width) || width <= 0)
            throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0)
            throw new Error("NAXIS2 not found or invalid");
        const BLANK = Number(header.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);
        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }
        // Build Map<rowIndex, Array<Uint8Array>> where each inner array contains per-pixel byte arrays
        const rowsMap = new Map();
        for (let j = 0; j < height; j++) {
            rowsMap.set(j, new Array(width));
        }
        for (let k = 0; k < pixels.length; k++) {
            const row = Math.floor(k / width);
            const col = k % width;
            const u8 = pixels[k].getUint8Value();
            // Ensure each cell gets its own buffer (avoid sharing the same BLANK buffer)
            rowsMap.get(row)[col] = u8 ? u8 : new Uint8Array(blankBytes);
        }
        // Return your FITS class instance
        return new FITS(header, rowsMap);
    }
}

;// CONCATENATED MODULE: ./src/projections/sin/SinProjection.ts
/**
 * SIN (Slant/Orthographic) projection for FITS WCS ('SIN')
 * CTYPE1='RA---SIN', CTYPE2='DEC--SIN'
 *
 * Piano in "gradi proiettivi": convertiamo (x_rad,y_rad) -> (x_deg,y_deg) con RAD2DEG
 * così che CDELT resti in deg/pixel come nelle altre proiezioni.
 */









const SinProjection_DEG2RAD = Math.PI / 180;
const SinProjection_RAD2DEG = 180 / Math.PI;
const EPS = 1e-12;
function SinProjection_clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function normalize2pi(a) { a %= 2 * Math.PI; return a < 0 ? a + 2 * Math.PI : a; }
function normalizePi(a) { a = (a + Math.PI) % (2 * Math.PI); return a < 0 ? a + 2 * Math.PI - Math.PI : a - Math.PI; }
// —————————————————————————————————————————————————————————————
// Rotazioni sfera: coord. centrate rispetto a (ra0,dec0)
function toCenteredLonLat(ra, dec, ra0, dec0) {
    const dlam = normalizePi(ra - ra0); // [-pi,pi)
    const sinφ = Math.sin(dec), cosφ = Math.cos(dec);
    const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);
    const sinφp = SinProjection_clamp(sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(dlam), -1, 1);
    const φp = Math.asin(sinφp);
    const y = cosφ * Math.sin(dlam);
    const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(dlam);
    const λp = Math.atan2(y, x);
    return { lam: λp, phi: φp };
}
function fromCenteredLonLat(lam, phi, ra0, dec0) {
    const sinφ = Math.sin(phi), cosφ = Math.cos(phi);
    const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);
    const dec = Math.asin(SinProjection_clamp(sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(lam), -1, 1));
    const y = Math.sin(lam) * cosφ;
    const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(lam);
    let ra = ra0 + Math.atan2(y, x);
    ra = normalize2pi(ra);
    return { ra, dec };
}
// —————————————————————————————————————————————————————————————
// SIN (orthographic) forward/inverse su sfera unitaria (in radianti)
// Forward: x = cosφ * sinΔλ;  y = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ
function sinForward(lam, phi, phi0) {
    const cφ = Math.cos(phi), sφ = Math.sin(phi);
    const sφ0 = Math.sin(phi0), cφ0 = Math.cos(phi0);
    const sΔ = Math.sin(lam), cΔ = Math.cos(lam);
    const x = cφ * sΔ;
    const y = cφ0 * sφ - sφ0 * cφ * cΔ;
    // visibile se fronte emisfero: sinφ0 sinφ + cosφ0 cosφ cosΔλ >= 0
    const cos_c = sφ0 * sφ + cφ0 * cφ * cΔ;
    return { x, y, visible: cos_c >= -1e-14 }; // tolleranza numerica
}
// Inverse (azimuthal family con ρ = sin c -> c = asin ρ)
function sinInverse(x, y, phi0) {
    const ρ = Math.sqrt(x * x + y * y);
    if (ρ > 1 + 1e-12)
        return null; // fuori dal disco
    const c = Math.asin(Math.min(1, ρ));
    if (ρ < EPS) {
        // centro proiezione
        return { lam: 0, phi: phi0 };
    }
    const sc = Math.sin(c), cc = Math.cos(c);
    const sφ0 = Math.sin(phi0), cφ0 = Math.cos(phi0);
    const phi = Math.asin(SinProjection_clamp(cc * sφ0 + (y * sc * cφ0) / ρ, -1, 1));
    const lam = Math.atan2(x * sc, ρ * cφ0 * cc - y * sφ0 * sc);
    if (!Number.isFinite(lam) || !Number.isFinite(phi))
        return null;
    return { lam, phi };
}
// Conversioni piano <-> radianti (unità piano in gradi)
function planeDegToRad(xdeg, ydeg) {
    return { xr: xdeg * SinProjection_DEG2RAD, yr: ydeg * SinProjection_DEG2RAD };
}
function planeRadToDeg(xr, yr) {
    return { xd: xr * SinProjection_RAD2DEG, yd: yr * SinProjection_RAD2DEG };
}
// —————————————————————————————————————————————————————————————
class SinProjection extends AbstractProjection {
    // minra/mindec = minXdeg/minYdeg del piano
    minra;
    mindec;
    naxis1;
    naxis2;
    bitpix;
    fitsheader;
    pxvalues;
    CTYPE1 = "'RA---SIN'";
    CTYPE2 = "'DEC--SIN'";
    craDeg; // CRVAL1
    cdecDeg; // CRVAL2
    pxsize; // CDELT (deg/pixel)
    _wcsname;
    constructor() {
        super();
        this._wcsname = "SIN";
        this.pxvalues = [];
        this.fitsheader = new FITSHeaderManager();
    }
    // ——— AbstractProjection: init ———
    async initFromFile(infile) {
        const fits = await FITSParser.loadFITS(infile);
        if (!fits)
            throw new Error("FITS is null");
        this.pxvalues = fits.data;
        this.fitsheader = fits.header;
        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        this.bitpix = Number(fits.header.findById("BITPIX")?.value);
        this.craDeg = Number(fits.header.findById("CRVAL1")?.value);
        this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);
        const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
        const pxsize2 = Number(fits.header.findById("CDELT2")?.value);
        if (pxsize1 !== pxsize2 || isNaN(pxsize1) || isNaN(pxsize2)) {
            throw new Error("Invalid or inconsistent CDELT1/CDELT2");
        }
        this.pxsize = pxsize1;
        // Il centro proiezione (CRVAL1/2) mappa nell'origine (0,0) del piano SIN:
        // impostiamo minX/minY simmetrici rispetto al centro.
        this.minra = -this.pxsize * this.naxis1 / 2; // minXdeg
        this.mindec = -this.pxsize * this.naxis2 / 2; // minYdeg
        return fits;
    }
    getBytePerValue() {
        return Math.abs(this.bitpix / 8);
    }
    // ——— AbstractProjection: header accessors ———
    getFITSHeader() {
        return this.fitsheader;
    }
    getCommonFitsHeaderParams() {
        const header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(key)) {
                header.insert(new FITSHeaderItem(key, item.value, ""));
            }
        }
        return header;
    }
    // ——— AbstractProjection: grid builder ———
    getImageRADecList(center, radius, pxsize, naxisWidth) {
        const naxis1 = naxisWidth;
        const naxis2 = naxisWidth;
        const ra0 = center.getAstro().raDeg * SinProjection_DEG2RAD;
        const dec0 = center.getAstro().decDeg * SinProjection_DEG2RAD;
        const minXdeg = -radius;
        const minYdeg = -radius;
        const list = new TilesRaDecList2();
        for (let j = 0; j < naxis2; j++) {
            const yDeg = minYdeg + j * pxsize;
            const { yr } = planeDegToRad(0, yDeg);
            for (let i = 0; i < naxis1; i++) {
                const xDeg = minXdeg + i * pxsize;
                const { xr } = planeDegToRad(xDeg, 0);
                const inv = sinInverse(xr, yr, dec0);
                if (!inv) {
                    list.addImagePixel(new ImagePixel(Number.NaN, Number.NaN, undefined));
                    continue;
                }
                const { lam, phi } = inv; // coord. centrate
                const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
                list.addImagePixel(new ImagePixel(ra * SinProjection_RAD2DEG, dec * SinProjection_RAD2DEG, undefined));
            }
        }
        return list;
    }
    computeNaxisWidth(radius, pxsize) {
        return Math.ceil(2 * radius / pxsize);
    }
    // ——— AbstractProjection: pixel <-> world ———
    pix2world(i, j, pxsize, minPlaneXdeg, minPlaneYdeg) {
        const xDeg = i * pxsize + minPlaneXdeg;
        const yDeg = j * pxsize + minPlaneYdeg;
        const { xr, yr } = planeDegToRad(xDeg, yDeg);
        const ra0 = this.craDeg * SinProjection_DEG2RAD;
        const dec0 = this.cdecDeg * SinProjection_DEG2RAD;
        const inv = sinInverse(xr, yr, dec0);
        if (!inv)
            return new Point(CoordsType.ASTRO, NumberType.DEGREES, Number.NaN, Number.NaN);
        const { lam, phi } = inv;
        const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
        return new Point(CoordsType.ASTRO, NumberType.DEGREES, ra * SinProjection_RAD2DEG, dec * SinProjection_RAD2DEG);
    }
    world2pix(raDecList) {
        const bytesXvalue = this.getBytePerValue();
        const blank = Number(this.fitsheader.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);
        const ra0 = this.craDeg * SinProjection_DEG2RAD;
        const dec0 = this.cdecDeg * SinProjection_DEG2RAD;
        for (const px of raDecList.getImagePixelList()) {
            const raDeg = px.getRADeg();
            const decDeg = px.getDecDeg();
            if (!Number.isFinite(raDeg) || !Number.isFinite(decDeg)) {
                px.setij(-1, -1);
                px.setValue(blankBytes, this.bitpix);
                continue;
            }
            const { lam, phi } = toCenteredLonLat(raDeg * SinProjection_DEG2RAD, decDeg * SinProjection_DEG2RAD, ra0, dec0);
            const fwd = sinForward(lam, phi, dec0);
            if (!fwd.visible) {
                px.setij(-1, -1);
                px.setValue(blankBytes, this.bitpix);
                continue;
            }
            const { xd, yd } = planeRadToDeg(fwd.x, fwd.y);
            const i = Math.floor((xd - this.minra) / this.pxsize);
            const j = Math.floor((yd - this.mindec) / this.pxsize);
            px.setij(i, j);
            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                px.setValue(blankBytes, this.bitpix);
            }
            else {
                const row = this.pxvalues[j];
                const slice = row.slice(i * bytesXvalue, (i + 1) * bytesXvalue);
                px.setValue(slice, this.bitpix);
            }
            raDecList.setMinMaxValue(px.getValue());
        }
        return raDecList;
    }
    // ——— FITS writer ———
    generateFITSFile(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues) {
        const header = this.prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue);
        return this.setPixelValues(raDecWithValues, header);
    }
    prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue) {
        const h = new FITSHeaderManager();
        h.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        h.insert(new FITSHeaderItem("NAXIS", 2, ""));
        h.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        h.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        h.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        h.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        h.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        h.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        h.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        h.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        h.insert(new FITSHeaderItem("CDELT1", pixelAngSize, ""));
        h.insert(new FITSHeaderItem("CDELT2", pixelAngSize, ""));
        h.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, ""));
        h.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, ""));
        h.insert(new FITSHeaderItem("CRVAL1", cRA, ""));
        h.insert(new FITSHeaderItem("CRVAL2", cDec, ""));
        h.insert(new FITSHeaderItem("DATAMIN", BZERO + BSCALE * minValue, ""));
        h.insert(new FITSHeaderItem("DATAMAX", BZERO + BSCALE * maxValue, ""));
        h.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
        h.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
        h.insert(new FITSHeaderItem("END", "", ""));
        return h;
    }
    setPixelValues(raDecList, header) {
        const BITPIX = Number(header.findById("BITPIX")?.value);
        if (!Number.isFinite(BITPIX))
            throw new Error("BITPIX not found or invalid");
        const bytesPerElem = Math.abs(BITPIX) / 8;
        const width = Number(header.findById("NAXIS1")?.value);
        const height = Number(header.findById("NAXIS2")?.value);
        if (!Number.isFinite(width) || width <= 0)
            throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0)
            throw new Error("NAXIS2 not found or invalid");
        const BLANK = Number(header.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);
        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }
        const rows = new Map();
        for (let j = 0; j < height; j++)
            rows.set(j, new Array(width));
        for (let k = 0; k < pixels.length; k++) {
            const row = Math.floor(k / width);
            const col = k % width;
            const u8 = pixels[k].getUint8Value();
            rows.get(row)[col] = u8 ? u8 : new Uint8Array(blankBytes);
        }
        return new FITS(header, rows);
    }
}

;// CONCATENATED MODULE: ./src/projections/aitoff/AitoffProjection.ts
/**
 * Aitoff (Hammer–Aitoff) projection for FITS WCS ('AIT')
 * CTYPE1='RA---AIT', CTYPE2='DEC--AIT'
 *
 * The pixel plane is in "projected degrees": we convert between
 * (RA,Dec) <-> (x_deg,y_deg) where x_deg,y_deg are the Hammer–Aitoff
 * projected coordinates scaled to degrees so that CDELT remains deg/pixel.
 */









const AitoffProjection_DEG2RAD = Math.PI / 180;
const AitoffProjection_RAD2DEG = 180 / Math.PI;
// ───────────────────────────────────────────────────────────────────────────────
// Spherical helpers (all angles in *radians* here)
// Center-relative long/lat (λ', φ') from absolute (α, δ) and center (α0, δ0)
function AitoffProjection_toCenteredLonLat(ra, dec, ra0, dec0) {
    const dlam = AitoffProjection_normalizePi(ra - ra0); // [-pi, pi)
    const sinφ = Math.sin(dec), cosφ = Math.cos(dec);
    const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);
    const sinφp = sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(dlam);
    const φp = Math.asin(AitoffProjection_clamp(sinφp, -1, 1));
    const y = cosφ * Math.sin(dlam);
    const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(dlam);
    const λp = Math.atan2(y, x); // centered longitude
    return { lam: λp, phi: φp };
}
// Absolute (α, δ) from centered (λ', φ') and center (α0, δ0)
function AitoffProjection_fromCenteredLonLat(lam, phi, ra0, dec0) {
    const sinφ = Math.sin(phi), cosφ = Math.cos(phi);
    const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);
    const dec = Math.asin(AitoffProjection_clamp(sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(lam), -1, 1));
    const y = Math.sin(lam) * cosφ;
    const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(lam);
    let ra = ra0 + Math.atan2(y, x);
    ra = AitoffProjection_normalize2pi(ra);
    return { ra, dec };
}
function AitoffProjection_clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function AitoffProjection_normalize2pi(a) { a %= 2 * Math.PI; return a < 0 ? a + 2 * Math.PI : a; }
function AitoffProjection_normalizePi(a) { a = (a + Math.PI) % (2 * Math.PI); return a < 0 ? a + 2 * Math.PI - Math.PI : a - Math.PI; }
// ───────────────────────────────────────────────────────────────────────────────
// Hammer–Aitoff forward/inverse (λ', φ') <-> (x, y)
// Uses the canonical √2 scaling. x,y returned in *radians-of-radius*.
function aitForward(lam, phi) {
    // D = sqrt(1 + cosφ cos(λ/2))
    const cφ = Math.cos(phi), sφ = Math.sin(phi);
    const half = lam / 2;
    const D = Math.sqrt(1 + cφ * Math.cos(half));
    if (D === 0)
        return { x: 0, y: 0 };
    const x = (2 * Math.SQRT2 * cφ * Math.sin(half)) / D;
    const y = (Math.SQRT2 * sφ) / D;
    return { x, y };
}
function aitInverse(x, y) {
    // Inverse per Snyder/WCS:
    // z = sqrt(1 - (x^2 + y^2)/8)
    const r2 = x * x + y * y;
    const z = Math.sqrt(Math.max(0, 1 - r2 / 8));
    // φ' = arcsin( y * z * sqrt(2) )
    const sinφ = AitoffProjection_clamp(y * z * Math.SQRT2, -1, 1);
    const phi = Math.asin(sinφ);
    // λ' = 2 * atan2( z * x, 2 z^2 - 1 )
    const lam = 2 * Math.atan2(z * x, 2 * z * z - 1);
    if (!Number.isFinite(lam) || !Number.isFinite(phi))
        return null;
    return { lam, phi };
}
// Convert AIT plane (x_deg,y_deg) <-> radians for the math above
function AitoffProjection_planeDegToRad(xdeg, ydeg) {
    return { xr: xdeg * AitoffProjection_DEG2RAD, yr: ydeg * AitoffProjection_DEG2RAD };
}
function AitoffProjection_planeRadToDeg(xr, yr) {
    return { xd: xr * AitoffProjection_RAD2DEG, yd: yr * AitoffProjection_RAD2DEG };
}
// ───────────────────────────────────────────────────────────────────────────────
class AitoffProjection extends AbstractProjection {
    // Note: minra/mindec store minXdeg/minYdeg of the projected plane
    minra;
    mindec;
    naxis1;
    naxis2;
    bitpix;
    fitsheader;
    pxvalues;
    CTYPE1 = "'RA---AIT'";
    CTYPE2 = "'DEC--AIT'";
    craDeg; // CRVAL1 center RA (deg)
    cdecDeg; // CRVAL2 center Dec (deg)
    pxsize; // CDELT (deg/pixel)
    _wcsname;
    constructor() {
        super();
        this._wcsname = "AIT";
        this.pxvalues = [];
        this.fitsheader = new FITSHeaderManager();
    }
    // ── AbstractProjection: init ────────────────────────────────────────────────
    async initFromFile(infile) {
        const fits = await FITSParser.loadFITS(infile);
        if (!fits)
            throw new Error("FITS is null");
        this.pxvalues = fits.data;
        this.fitsheader = fits.header;
        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        this.bitpix = Number(fits.header.findById("BITPIX")?.value);
        this.craDeg = Number(fits.header.findById("CRVAL1")?.value);
        this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);
        const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
        const pxsize2 = Number(fits.header.findById("CDELT2")?.value);
        if (pxsize1 !== pxsize2 || isNaN(pxsize1) || isNaN(pxsize2)) {
            throw new Error("Invalid or inconsistent CDELT1/CDELT2");
        }
        this.pxsize = pxsize1;
        // Compute projective center (x0,y0) for (cra,cdec), then set min plane coords.
        const { x: xr0, y: yr0 } = aitForward(0, // centered lon=0
        0 // after we rotate sphere, the center maps to (0,0) in AIT
        );
        // The above is always (0,0) by definition; but we keep the pattern for clarity.
        // So min plane coordinates are just (-width/2 * pxsize, -height/2 * pxsize) around center.
        this.minra = -this.pxsize * this.naxis1 / 2; // minXdeg
        this.mindec = -this.pxsize * this.naxis2 / 2; // minYdeg
        return fits;
    }
    getBytePerValue() {
        return Math.abs(this.bitpix / 8);
    }
    // ── AbstractProjection: WCS header accessors ───────────────────────────────
    getFITSHeader() {
        return this.fitsheader;
    }
    getCommonFitsHeaderParams() {
        const header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(key)) {
                header.insert(new FITSHeaderItem(key, item.value, ""));
            }
        }
        return header;
    }
    // ── AbstractProjection: grid builder ───────────────────────────────────────
    getImageRADecList(center, radius, pxsize, naxisWidth) {
        const naxis1 = naxisWidth;
        const naxis2 = naxisWidth;
        const ra0 = center.getAstro().raDeg * AitoffProjection_DEG2RAD;
        const dec0 = center.getAstro().decDeg * AitoffProjection_DEG2RAD;
        const minXdeg = -radius;
        const minYdeg = -radius;
        const list = new TilesRaDecList2();
        for (let j = 0; j < naxis2; j++) {
            const yDeg = minYdeg + j * pxsize;
            const { yr } = AitoffProjection_planeDegToRad(0, yDeg);
            for (let i = 0; i < naxis1; i++) {
                const xDeg = minXdeg + i * pxsize;
                const { xr } = AitoffProjection_planeDegToRad(xDeg, 0);
                const inv = aitInverse(xr, yr);
                if (!inv) {
                    // Outside valid ellipse; set BLANK later during sampling
                    list.addImagePixel(new ImagePixel(Number.NaN, Number.NaN, undefined));
                    continue;
                }
                const { lam, phi } = inv; // centered lon/lat
                const { ra, dec } = AitoffProjection_fromCenteredLonLat(lam, phi, ra0, dec0);
                const raDeg = ra * AitoffProjection_RAD2DEG;
                const decDeg = dec * AitoffProjection_RAD2DEG;
                list.addImagePixel(new ImagePixel(raDeg, decDeg, undefined));
            }
        }
        return list;
    }
    computeNaxisWidth(radius, pxsize) {
        return Math.ceil(2 * radius / pxsize);
    }
    // ── AbstractProjection: pixel<->world ──────────────────────────────────────
    pix2world(i, j, pxsize, minPlaneXdeg, minPlaneYdeg) {
        // plane coords (degrees) relative to the projection center
        const xDeg = i * pxsize + minPlaneXdeg;
        const yDeg = j * pxsize + minPlaneYdeg;
        const { xr, yr } = AitoffProjection_planeDegToRad(xDeg, yDeg);
        const inv = aitInverse(xr, yr);
        // Use the class center (CRVAL1/2)
        const ra0 = this.craDeg * AitoffProjection_DEG2RAD;
        const dec0 = this.cdecDeg * AitoffProjection_DEG2RAD;
        if (!inv) {
            return new Point(CoordsType.ASTRO, NumberType.DEGREES, Number.NaN, Number.NaN);
        }
        const { lam, phi } = inv;
        const { ra, dec } = AitoffProjection_fromCenteredLonLat(lam, phi, ra0, dec0);
        return new Point(CoordsType.ASTRO, NumberType.DEGREES, ra * AitoffProjection_RAD2DEG, dec * AitoffProjection_RAD2DEG);
    }
    world2pix(raDecList) {
        const bytesXvalue = this.getBytePerValue();
        const blank = Number(this.fitsheader.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);
        const ra0 = this.craDeg * AitoffProjection_DEG2RAD;
        const dec0 = this.cdecDeg * AitoffProjection_DEG2RAD;
        for (const px of raDecList.getImagePixelList()) {
            const raDeg = px.getRADeg();
            const decDeg = px.getDecDeg();
            if (!Number.isFinite(raDeg) || !Number.isFinite(decDeg)) {
                px.setij(-1, -1);
                px.setValue(blankBytes, this.bitpix);
                continue;
            }
            // Center-relative spherical coords
            const { lam, phi } = AitoffProjection_toCenteredLonLat(raDeg * AitoffProjection_DEG2RAD, decDeg * AitoffProjection_DEG2RAD, ra0, dec0);
            const { x, y } = aitForward(lam, phi);
            // plane x/y in degrees
            const { xd, yd } = AitoffProjection_planeRadToDeg(x, y);
            const i = Math.floor((xd - this.minra) / this.pxsize);
            const j = Math.floor((yd - this.mindec) / this.pxsize);
            px.setij(i, j);
            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                px.setValue(blankBytes, this.bitpix);
            }
            else {
                const row = this.pxvalues[j];
                const slice = row.slice(i * bytesXvalue, (i + 1) * bytesXvalue);
                px.setValue(slice, this.bitpix);
            }
            raDecList.setMinMaxValue(px.getValue());
        }
        return raDecList;
    }
    // ── FITS write path ────────────────────────────────────────────────────────
    generateFITSFile(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues) {
        const header = this.prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue);
        return this.setPixelValues(raDecWithValues, header);
    }
    prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue) {
        const h = new FITSHeaderManager();
        h.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        h.insert(new FITSHeaderItem("NAXIS", 2, ""));
        h.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        h.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        h.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        h.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        h.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        h.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        h.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        h.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        h.insert(new FITSHeaderItem("CDELT1", pixelAngSize, ""));
        h.insert(new FITSHeaderItem("CDELT2", pixelAngSize, ""));
        h.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, ""));
        h.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, ""));
        h.insert(new FITSHeaderItem("CRVAL1", cRA, ""));
        h.insert(new FITSHeaderItem("CRVAL2", cDec, ""));
        h.insert(new FITSHeaderItem("DATAMIN", BZERO + BSCALE * minValue, ""));
        h.insert(new FITSHeaderItem("DATAMAX", BZERO + BSCALE * maxValue, ""));
        h.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
        h.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
        h.insert(new FITSHeaderItem("END", "", ""));
        return h;
    }
    setPixelValues(raDecList, header) {
        const BITPIX = Number(header.findById("BITPIX")?.value);
        if (!Number.isFinite(BITPIX))
            throw new Error("BITPIX not found or invalid");
        const bytesPerElem = Math.abs(BITPIX) / 8;
        const width = Number(header.findById("NAXIS1")?.value);
        const height = Number(header.findById("NAXIS2")?.value);
        if (!Number.isFinite(width) || width <= 0)
            throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0)
            throw new Error("NAXIS2 not found or invalid");
        const BLANK = Number(header.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);
        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }
        // Build Map<row, Array<Uint8Array>> per your FITS class constructor
        const rows = new Map();
        for (let j = 0; j < height; j++)
            rows.set(j, new Array(width));
        for (let k = 0; k < pixels.length; k++) {
            const row = Math.floor(k / width);
            const col = k % width;
            const u8 = pixels[k].getUint8Value();
            rows.get(row)[col] = u8 ? u8 : new Uint8Array(blankBytes);
        }
        return new FITS(header, rows);
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
        if (ctype.includes("CAR")) {
            let projection = new CartesianProjection();
            await projection.initFromFile(filePath);
            return projection;
        }
        if (ctype.includes("SIN")) {
            let projection = new SinProjection();
            await projection.initFromFile(filePath);
            return projection;
        }
        if (ctype.includes("AIT")) {
            let projection = new AitoffProjection();
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
var __webpack_exports__CartesianProjection = __webpack_exports__.aC;
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
export { __webpack_exports__AbstractProjection as AbstractProjection, __webpack_exports__CartesianProjection as CartesianProjection, __webpack_exports__CoordsType as CoordsType, __webpack_exports__HiPSFITS as HiPSFITS, __webpack_exports__HiPSHelper as HiPSHelper, __webpack_exports__HiPSProjection as HiPSProjection, __webpack_exports__ImagePixel as ImagePixel, __webpack_exports__MercatorProjection as MercatorProjection, __webpack_exports__NumberType as NumberType, __webpack_exports__Point as Point, __webpack_exports__WCSLight as WCSLight, __webpack_exports__astroToSpherical as astroToSpherical, __webpack_exports__cartesianToSpherical as cartesianToSpherical, __webpack_exports__degToRad as degToRad, __webpack_exports__fillAstro as fillAstro, __webpack_exports__fillSpherical as fillSpherical, __webpack_exports__radToDeg as radToDeg, __webpack_exports__sphericalToAstro as sphericalToAstro, __webpack_exports__sphericalToCartesian as sphericalToCartesian };

//# sourceMappingURL=wcslight.esm.js.map