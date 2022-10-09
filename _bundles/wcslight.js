(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("wcslight", [], factory);
	else if(typeof exports === 'object')
		exports["wcslight"] = factory();
	else
		root["wcslight"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../FITSParser/node_modules/blob-polyfill/Blob.js":
/*!********************************************************!*\
  !*** ../FITSParser/node_modules/blob-polyfill/Blob.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* Blob.js
 * A Blob, File, FileReader & URL implementation.
 * 2020-02-01
 *
 * By Eli Grey, https://eligrey.com
 * By Jimmy Wärting, https://github.com/jimmywarting
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

(function(global) {
	(function (factory) {
		if (true) {
			// AMD. Register as an anonymous module.
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {}
	})(function (exports) {
		"use strict";

		var BlobBuilder = global.BlobBuilder
			|| global.WebKitBlobBuilder
			|| global.MSBlobBuilder
			|| global.MozBlobBuilder;

		var URL = global.URL || global.webkitURL || function (href, a) {
			a = document.createElement("a");
			a.href = href;
			return a;
		};

		var origBlob = global.Blob;
		var createObjectURL = URL.createObjectURL;
		var revokeObjectURL = URL.revokeObjectURL;
		var strTag = global.Symbol && global.Symbol.toStringTag;
		var blobSupported = false;
		var blobSupportsArrayBufferView = false;
		var blobBuilderSupported = BlobBuilder
			&& BlobBuilder.prototype.append
			&& BlobBuilder.prototype.getBlob;

		try {
			// Check if Blob constructor is supported
			blobSupported = new Blob(["ä"]).size === 2;

			// Check if Blob constructor supports ArrayBufferViews
			// Fails in Safari 6, so we need to map to ArrayBuffers there.
			blobSupportsArrayBufferView = new Blob([new Uint8Array([1, 2])]).size === 2;
		} catch (e) {/**/}


		// Helper function that maps ArrayBufferViews to ArrayBuffers
		// Used by BlobBuilder constructor and old browsers that didn't
		// support it in the Blob constructor.
		function mapArrayBufferViews (ary) {
			return ary.map(function (chunk) {
				if (chunk.buffer instanceof ArrayBuffer) {
					var buf = chunk.buffer;

					// if this is a subarray, make a copy so we only
					// include the subarray region from the underlying buffer
					if (chunk.byteLength !== buf.byteLength) {
						var copy = new Uint8Array(chunk.byteLength);
						copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
						buf = copy.buffer;
					}

					return buf;
				}

				return chunk;
			});
		}

		function BlobBuilderConstructor (ary, options) {
			options = options || {};

			var bb = new BlobBuilder();
			mapArrayBufferViews(ary).forEach(function (part) {
				bb.append(part);
			});

			return options.type ? bb.getBlob(options.type) : bb.getBlob();
		}

		function BlobConstructor (ary, options) {
			return new origBlob(mapArrayBufferViews(ary), options || {});
		}

		if (global.Blob) {
			BlobBuilderConstructor.prototype = Blob.prototype;
			BlobConstructor.prototype = Blob.prototype;
		}

		/********************************************************/
		/*               String Encoder fallback                */
		/********************************************************/
		function stringEncode (string) {
			var pos = 0;
			var len = string.length;
			var Arr = global.Uint8Array || Array; // Use byte array when possible

			var at = 0; // output position
			var tlen = Math.max(32, len + (len >> 1) + 7); // 1.5x size
			var target = new Arr((tlen >> 3) << 3); // ... but at 8 byte offset

			while (pos < len) {
				var value = string.charCodeAt(pos++);
				if (value >= 0xd800 && value <= 0xdbff) {
					// high surrogate
					if (pos < len) {
						var extra = string.charCodeAt(pos);
						if ((extra & 0xfc00) === 0xdc00) {
							++pos;
							value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
						}
					}
					if (value >= 0xd800 && value <= 0xdbff) {
						continue; // drop lone surrogate
					}
				}

				// expand the buffer if we couldn't write 4 bytes
				if (at + 4 > target.length) {
					tlen += 8; // minimum extra
					tlen *= (1.0 + (pos / string.length) * 2); // take 2x the remaining
					tlen = (tlen >> 3) << 3; // 8 byte offset

					var update = new Uint8Array(tlen);
					update.set(target);
					target = update;
				}

				if ((value & 0xffffff80) === 0) { // 1-byte
					target[at++] = value; // ASCII
					continue;
				} else if ((value & 0xfffff800) === 0) { // 2-byte
					target[at++] = ((value >> 6) & 0x1f) | 0xc0;
				} else if ((value & 0xffff0000) === 0) { // 3-byte
					target[at++] = ((value >> 12) & 0x0f) | 0xe0;
					target[at++] = ((value >> 6) & 0x3f) | 0x80;
				} else if ((value & 0xffe00000) === 0) { // 4-byte
					target[at++] = ((value >> 18) & 0x07) | 0xf0;
					target[at++] = ((value >> 12) & 0x3f) | 0x80;
					target[at++] = ((value >> 6) & 0x3f) | 0x80;
				} else {
					// FIXME: do we care
					continue;
				}

				target[at++] = (value & 0x3f) | 0x80;
			}

			return target.slice(0, at);
		}

		/********************************************************/
		/*               String Decoder fallback                */
		/********************************************************/
		function stringDecode (buf) {
			var end = buf.length;
			var res = [];

			var i = 0;
			while (i < end) {
				var firstByte = buf[i];
				var codePoint = null;
				var bytesPerSequence = (firstByte > 0xEF) ? 4
					: (firstByte > 0xDF) ? 3
						: (firstByte > 0xBF) ? 2
							: 1;

				if (i + bytesPerSequence <= end) {
					var secondByte, thirdByte, fourthByte, tempCodePoint;

					switch (bytesPerSequence) {
					case 1:
						if (firstByte < 0x80) {
							codePoint = firstByte;
						}
						break;
					case 2:
						secondByte = buf[i + 1];
						if ((secondByte & 0xC0) === 0x80) {
							tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
							if (tempCodePoint > 0x7F) {
								codePoint = tempCodePoint;
							}
						}
						break;
					case 3:
						secondByte = buf[i + 1];
						thirdByte = buf[i + 2];
						if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
							tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
							if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
								codePoint = tempCodePoint;
							}
						}
						break;
					case 4:
						secondByte = buf[i + 1];
						thirdByte = buf[i + 2];
						fourthByte = buf[i + 3];
						if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
							tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
							if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
								codePoint = tempCodePoint;
							}
						}
					}
				}

				if (codePoint === null) {
					// we did not generate a valid codePoint so insert a
					// replacement char (U+FFFD) and advance only 1 byte
					codePoint = 0xFFFD;
					bytesPerSequence = 1;
				} else if (codePoint > 0xFFFF) {
					// encode to utf16 (surrogate pair dance)
					codePoint -= 0x10000;
					res.push(codePoint >>> 10 & 0x3FF | 0xD800);
					codePoint = 0xDC00 | codePoint & 0x3FF;
				}

				res.push(codePoint);
				i += bytesPerSequence;
			}

			var len = res.length;
			var str = "";
			var j = 0;

			while (j < len) {
				str += String.fromCharCode.apply(String, res.slice(j, j += 0x1000));
			}

			return str;
		}

		// string -> buffer
		var textEncode = typeof TextEncoder === "function"
			? TextEncoder.prototype.encode.bind(new TextEncoder())
			: stringEncode;

		// buffer -> string
		var textDecode = typeof TextDecoder === "function"
			? TextDecoder.prototype.decode.bind(new TextDecoder())
			: stringDecode;

		function FakeBlobBuilder () {
			function bufferClone (buf) {
				var view = new Array(buf.byteLength);
				var array = new Uint8Array(buf);
				var i = view.length;
				while (i--) {
					view[i] = array[i];
				}
				return view;
			}
			function array2base64 (input) {
				var byteToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

				var output = [];

				for (var i = 0; i < input.length; i += 3) {
					var byte1 = input[i];
					var haveByte2 = i + 1 < input.length;
					var byte2 = haveByte2 ? input[i + 1] : 0;
					var haveByte3 = i + 2 < input.length;
					var byte3 = haveByte3 ? input[i + 2] : 0;

					var outByte1 = byte1 >> 2;
					var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
					var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
					var outByte4 = byte3 & 0x3F;

					if (!haveByte3) {
						outByte4 = 64;

						if (!haveByte2) {
							outByte3 = 64;
						}
					}

					output.push(
						byteToCharMap[outByte1], byteToCharMap[outByte2],
						byteToCharMap[outByte3], byteToCharMap[outByte4]
					);
				}

				return output.join("");
			}

			var create = Object.create || function (a) {
				function c () {}
				c.prototype = a;
				return new c();
			};

			function getObjectTypeName (o) {
				return Object.prototype.toString.call(o).slice(8, -1);
			}

			function isPrototypeOf(c, o) {
				return typeof c === "object" && Object.prototype.isPrototypeOf.call(c.prototype, o);
			}

			function isDataView (o) {
				return getObjectTypeName(o) === "DataView" || isPrototypeOf(global.DataView, o);
			}

			var arrayBufferClassNames = [
				"Int8Array",
				"Uint8Array",
				"Uint8ClampedArray",
				"Int16Array",
				"Uint16Array",
				"Int32Array",
				"Uint32Array",
				"Float32Array",
				"Float64Array",
				"ArrayBuffer"
			];

			function includes(a, v) {
				return a.indexOf(v) !== -1;
			}

			function isArrayBuffer(o) {
				return includes(arrayBufferClassNames, getObjectTypeName(o)) || isPrototypeOf(global.ArrayBuffer, o);
			}

			function concatTypedarrays (chunks) {
				var size = 0;
				var j = chunks.length;
				while (j--) { size += chunks[j].length; }
				var b = new Uint8Array(size);
				var offset = 0;
				for (var i = 0; i < chunks.length; i++) {
					var chunk = chunks[i];
					b.set(chunk, offset);
					offset += chunk.byteLength || chunk.length;
				}

				return b;
			}

			/********************************************************/
			/*                   Blob constructor                   */
			/********************************************************/
			function Blob (chunks, opts) {
				chunks = chunks ? chunks.slice() : [];
				opts = opts == null ? {} : opts;
				for (var i = 0, len = chunks.length; i < len; i++) {
					var chunk = chunks[i];
					if (chunk instanceof Blob) {
						chunks[i] = chunk._buffer;
					} else if (typeof chunk === "string") {
						chunks[i] = textEncode(chunk);
					} else if (isDataView(chunk)) {
						chunks[i] = bufferClone(chunk.buffer);
					} else if (isArrayBuffer(chunk)) {
						chunks[i] = bufferClone(chunk);
					} else {
						chunks[i] = textEncode(String(chunk));
					}
				}

				this._buffer = global.Uint8Array
					? concatTypedarrays(chunks)
					: [].concat.apply([], chunks);
				this.size = this._buffer.length;

				this.type = opts.type || "";
				if (/[^\u0020-\u007E]/.test(this.type)) {
					this.type = "";
				} else {
					this.type = this.type.toLowerCase();
				}
			}

			Blob.prototype.arrayBuffer = function () {
				return Promise.resolve(this._buffer.buffer || this._buffer);
			};

			Blob.prototype.text = function () {
				return Promise.resolve(textDecode(this._buffer));
			};

			Blob.prototype.slice = function (start, end, type) {
				var slice = this._buffer.slice(start || 0, end || this._buffer.length);
				return new Blob([slice], {type: type});
			};

			Blob.prototype.toString = function () {
				return "[object Blob]";
			};

			/********************************************************/
			/*                   File constructor                   */
			/********************************************************/
			function File (chunks, name, opts) {
				opts = opts || {};
				var a = Blob.call(this, chunks, opts) || this;
				a.name = name.replace(/\//g, ":");
				a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
				a.lastModified = +a.lastModifiedDate;

				return a;
			}

			File.prototype = create(Blob.prototype);
			File.prototype.constructor = File;

			if (Object.setPrototypeOf) {
				Object.setPrototypeOf(File, Blob);
			} else {
				try {
					File.__proto__ = Blob;
				} catch (e) {/**/}
			}

			File.prototype.toString = function () {
				return "[object File]";
			};

			/********************************************************/
			/*                FileReader constructor                */
			/********************************************************/
			function FileReader () {
				if (!(this instanceof FileReader)) {
					throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
				}

				var delegate = document.createDocumentFragment();
				this.addEventListener = delegate.addEventListener;
				this.dispatchEvent = function (evt) {
					var local = this["on" + evt.type];
					if (typeof local === "function") local(evt);
					delegate.dispatchEvent(evt);
				};
				this.removeEventListener = delegate.removeEventListener;
			}

			function _read (fr, blob, kind) {
				if (!(blob instanceof Blob)) {
					throw new TypeError("Failed to execute '" + kind + "' on 'FileReader': parameter 1 is not of type 'Blob'.");
				}

				fr.result = "";

				setTimeout(function () {
					this.readyState = FileReader.LOADING;
					fr.dispatchEvent(new Event("load"));
					fr.dispatchEvent(new Event("loadend"));
				});
			}

			FileReader.EMPTY = 0;
			FileReader.LOADING = 1;
			FileReader.DONE = 2;
			FileReader.prototype.error = null;
			FileReader.prototype.onabort = null;
			FileReader.prototype.onerror = null;
			FileReader.prototype.onload = null;
			FileReader.prototype.onloadend = null;
			FileReader.prototype.onloadstart = null;
			FileReader.prototype.onprogress = null;

			FileReader.prototype.readAsDataURL = function (blob) {
				_read(this, blob, "readAsDataURL");
				this.result = "data:" + blob.type + ";base64," + array2base64(blob._buffer);
			};

			FileReader.prototype.readAsText = function (blob) {
				_read(this, blob, "readAsText");
				this.result = textDecode(blob._buffer);
			};

			FileReader.prototype.readAsArrayBuffer = function (blob) {
				_read(this, blob, "readAsText");
				// return ArrayBuffer when possible
				this.result = (blob._buffer.buffer || blob._buffer).slice();
			};

			FileReader.prototype.abort = function () {};

			/********************************************************/
			/*                         URL                          */
			/********************************************************/
			URL.createObjectURL = function (blob) {
				return blob instanceof Blob
					? "data:" + blob.type + ";base64," + array2base64(blob._buffer)
					: createObjectURL.call(URL, blob);
			};

			URL.revokeObjectURL = function (url) {
				revokeObjectURL && revokeObjectURL.call(URL, url);
			};

			/********************************************************/
			/*                         XHR                          */
			/********************************************************/
			var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send;
			if (_send) {
				XMLHttpRequest.prototype.send = function (data) {
					if (data instanceof Blob) {
						this.setRequestHeader("Content-Type", data.type);
						_send.call(this, textDecode(data._buffer));
					} else {
						_send.call(this, data);
					}
				};
			}

			exports.Blob = Blob;
			exports.File = File;
			exports.FileReader = FileReader;
			exports.URL = URL;
		}

		function fixFileAndXHR () {
			var isIE = !!global.ActiveXObject || (
				"-ms-scroll-limit" in document.documentElement.style &&
				"-ms-ime-align" in document.documentElement.style
			);

			// Monkey patched
			// IE doesn't set Content-Type header on XHR whose body is a typed Blob
			// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/6047383
			var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send;
			if (isIE && _send) {
				XMLHttpRequest.prototype.send = function (data) {
					if (data instanceof Blob) {
						this.setRequestHeader("Content-Type", data.type);
						_send.call(this, data);
					} else {
						_send.call(this, data);
					}
				};
			}

			try {
				new File([], "");
				exports.File = global.File;
				exports.FileReader = global.FileReader;
			} catch (e) {
				try {
					exports.File = new Function("class File extends Blob {" +
						"constructor(chunks, name, opts) {" +
							"opts = opts || {};" +
							"super(chunks, opts || {});" +
							"this.name = name.replace(/\\//g, \":\");" +
							"this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();" +
							"this.lastModified = +this.lastModifiedDate;" +
						"}};" +
						"return new File([], \"\"), File"
					)();
				} catch (e) {
					exports.File = function (b, d, c) {
						var blob = new Blob(b, c);
						var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date();

						blob.name = d.replace(/\//g, ":");
						blob.lastModifiedDate = t;
						blob.lastModified = +t;
						blob.toString = function () {
							return "[object File]";
						};

						if (strTag) {
							blob[strTag] = "File";
						}

						return blob;
					};
				}
			}
		}

		if (blobSupported) {
			fixFileAndXHR();
			exports.Blob = blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
		} else if (blobBuilderSupported) {
			fixFileAndXHR();
			exports.Blob = BlobBuilderConstructor;
		} else {
			FakeBlobBuilder();
		}

		if (strTag) {
			if (!exports.File.prototype[strTag]) exports.File.prototype[strTag] = "File";
			if (!exports.Blob.prototype[strTag]) exports.Blob.prototype[strTag] = "Blob";
			if (!exports.FileReader.prototype[strTag]) exports.FileReader.prototype[strTag] = "FileReader";
		}

		var blob = exports.Blob.prototype;
		var stream;

		try {
			new ReadableStream({ type: "bytes" });
			stream = function stream() {
				var position = 0;
				var blob = this;

				return new ReadableStream({
					type: "bytes",
					autoAllocateChunkSize: 524288,

					pull: function (controller) {
						var v = controller.byobRequest.view;
						var chunk = blob.slice(position, position + v.byteLength);
						return chunk.arrayBuffer()
							.then(function (buffer) {
								var uint8array = new Uint8Array(buffer);
								var bytesRead = uint8array.byteLength;

								position += bytesRead;
								v.set(uint8array);
								controller.byobRequest.respond(bytesRead);

								if(position >= blob.size)
									controller.close();
							});
					}
				});
			};
		} catch (e) {
			try {
				new ReadableStream({});
				stream = function stream(blob){
					var position = 0;

					return new ReadableStream({
						pull: function (controller) {
							var chunk = blob.slice(position, position + 524288);

							return chunk.arrayBuffer().then(function (buffer) {
								position += buffer.byteLength;
								var uint8array = new Uint8Array(buffer);
								controller.enqueue(uint8array);

								if (position == blob.size)
									controller.close();
							});
						}
					});
				};
			} catch (e) {
				try {
					new Response("").body.getReader().read();
					stream = function stream() {
						return (new Response(this)).body;
					};
				} catch (e) {
					stream = function stream() {
						throw new Error("Include https://github.com/MattiasBuelens/web-streams-polyfill");
					};
				}
			}
		}

		function promisify(obj) {
			return new Promise(function(resolve, reject) {
				obj.onload = obj.onerror = function(evt) {
					obj.onload = obj.onerror = null;

					evt.type === "load" ?
						resolve(obj.result || obj) :
						reject(new Error("Failed to read the blob/file"));
				};
			});
		}

		if (!blob.arrayBuffer) {
			blob.arrayBuffer = function arrayBuffer() {
				var fr = new FileReader();
				fr.readAsArrayBuffer(this);
				return promisify(fr);
			};
		}

		if (!blob.text) {
			blob.text = function text() {
				var fr = new FileReader();
				fr.readAsText(this);
				return promisify(fr);
			};
		}

		if (!blob.stream) {
			blob.stream = stream;
		}
	});
})(
	typeof self !== "undefined" && self ||
		typeof window !== "undefined" && window ||
		typeof __webpack_require__.g !== "undefined" && __webpack_require__.g ||
		this
);


/***/ }),

/***/ "./src/WCSLight.ts":
/*!*************************!*\
  !*** ./src/WCSLight.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WCSLight": () => (/* binding */ WCSLight)
/* harmony export */ });
/* harmony import */ var jsfitsio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsfitsio */ "../FITSParser/lib-esm/index.js");
/* harmony import */ var _projections_MercatorProjection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./projections/MercatorProjection.js */ "./src/projections/MercatorProjection.ts");
/* harmony import */ var _projections_HiPSProjection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./projections/HiPSProjection.js */ "./src/projections/HiPSProjection.ts");
/* harmony import */ var _projections_HEALPixProjection_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./projections/HEALPixProjection.js */ "./src/projections/HEALPixProjection.ts");
/* harmony import */ var _projections_GnomonicProjection_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./projections/GnomonicProjection.js */ "./src/projections/GnomonicProjection.ts");
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





class WCSLight {
    /** @constructs WCSLight */
    constructor() { }
    static cutout(center, radius, pxsize, inproj, outproj) {
        return __awaiter(this, void 0, void 0, function* () {
            const outRADecList = outproj.getImageRADecList(center, radius, pxsize);
            if (outRADecList.length == 0) {
                const res = {
                    fitsheader: null,
                    fitsdata: null,
                    inproj: inproj,
                    outproj: outproj
                };
                return res;
            }
            const inputPixelsList = inproj.world2pix(outRADecList);
            try {
                const invalues = yield inproj.getPixValues(inputPixelsList);
                const fitsHeaderParams = inproj.getCommonFitsHeaderParams();
                if (invalues !== undefined) {
                    const fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
                    const fitsheader = outproj.getFITSHeader();
                    // let canvas2d = outproj.getCanvas2d();
                    const res = {
                        fitsheader: fitsheader,
                        fitsdata: fitsdata,
                        inproj: inproj,
                        outproj: outproj
                    };
                    return res;
                }
                else {
                    const res = {
                        fitsheader: null,
                        fitsdata: null,
                        inproj: inproj,
                        outproj: outproj
                    };
                    return res;
                }
            }
            catch (err) {
                console.error("[WCSLight] ERROR: " + err);
            }
        });
    }
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static generateFITS(fitsheader, fitsdata) {
        const blobUrl = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser.generateFITS(fitsheader, fitsdata);
        return blobUrl;
    }
    static changeProjection(filepath, outprojname) {
        // TODO
    }
    static getProjection(projectionName) {
        if (projectionName === "Mercator") {
            return new _projections_MercatorProjection_js__WEBPACK_IMPORTED_MODULE_1__.MercatorProjection();
        }
        else if (projectionName === "HiPS") {
            return new _projections_HiPSProjection_js__WEBPACK_IMPORTED_MODULE_2__.HiPSProjection();
        }
        else if (projectionName === "HEALPix") {
            return new _projections_HEALPixProjection_js__WEBPACK_IMPORTED_MODULE_3__.HEALPixProjection();
        }
        else if (projectionName === "Gnomonic") {
            return new _projections_GnomonicProjection_js__WEBPACK_IMPORTED_MODULE_4__.GnomonicProjection();
        }
        else {
            return null;
            // throw new ProjectionNotFound(projectionName);
        }
    }
    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }
}


/***/ }),

/***/ "./src/model/CoordsType.ts":
/*!*********************************!*\
  !*** ./src/model/CoordsType.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CoordsType": () => (/* binding */ CoordsType)
/* harmony export */ });
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


/***/ }),

/***/ "./src/model/ImagePixel.ts":
/*!*********************************!*\
  !*** ./src/model/ImagePixel.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImagePixel": () => (/* binding */ ImagePixel)
/* harmony export */ });
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class ImagePixel {
    constructor(i = null, j = null, tileno = null) {
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


/***/ }),

/***/ "./src/model/NumberType.ts":
/*!*********************************!*\
  !*** ./src/model/NumberType.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NumberType": () => (/* binding */ NumberType)
/* harmony export */ });
var NumberType;
(function (NumberType) {
    NumberType[NumberType["DEGREES"] = 0] = "DEGREES";
    NumberType[NumberType["RADIANS"] = 1] = "RADIANS";
    NumberType[NumberType["DECIMAL"] = 2] = "DECIMAL";
    NumberType[NumberType["HMS"] = 3] = "HMS";
    NumberType[NumberType["DMS"] = 4] = "DMS";
})(NumberType || (NumberType = {}));


/***/ }),

/***/ "./src/model/Point.ts":
/*!****************************!*\
  !*** ./src/model/Point.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Point": () => (/* binding */ Point)
/* harmony export */ });
/* harmony import */ var _Utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utils.js */ "./src/model/Utils.ts");
/* harmony import */ var _CoordsType_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CoordsType.js */ "./src/model/CoordsType.ts");
/**
 * @author Fabrizio Giordano (Fab77)
 */
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Point_astro, _Point_spherical, _Point_cartesian;


class Point {
    constructor(in_type, unit, ...coords) {
        _Point_astro.set(this, void 0);
        // #equatorial: EquatorialCoords;
        // #galactic: GalacticCoords;
        _Point_spherical.set(this, void 0);
        _Point_cartesian.set(this, void 0);
        if (in_type == _CoordsType_js__WEBPACK_IMPORTED_MODULE_1__.CoordsType.CARTESIAN) {
            __classPrivateFieldGet(this, _Point_cartesian, "f").x = parseFloat(coords[0].toFixed(__webpack_require__.g.MAX_DECIMALS));
            __classPrivateFieldGet(this, _Point_cartesian, "f").y = parseFloat(coords[1].toFixed(__webpack_require__.g.MAX_DECIMALS));
            __classPrivateFieldGet(this, _Point_cartesian, "f").z = parseFloat(coords[2].toFixed(__webpack_require__.g.MAX_DECIMALS));
            __classPrivateFieldSet(this, _Point_spherical, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.cartesianToSpherical)(__classPrivateFieldGet(this, _Point_cartesian, "f")), "f");
            __classPrivateFieldSet(this, _Point_astro, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.sphericalToAstro)(__classPrivateFieldGet(this, _Point_spherical, "f")), "f");
        }
        else if (in_type == _CoordsType_js__WEBPACK_IMPORTED_MODULE_1__.CoordsType.ASTRO) {
            __classPrivateFieldSet(this, _Point_astro, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.fillAstro)(coords[0], coords[1], unit), "f");
            __classPrivateFieldSet(this, _Point_spherical, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.astroToSpherical)(__classPrivateFieldGet(this, _Point_astro, "f")), "f");
            __classPrivateFieldSet(this, _Point_cartesian, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.sphericalToCartesian)(__classPrivateFieldGet(this, _Point_spherical, "f"), 1.0), "f"); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
        }
        else if (in_type == _CoordsType_js__WEBPACK_IMPORTED_MODULE_1__.CoordsType.SPHERICAL) {
            __classPrivateFieldSet(this, _Point_spherical, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.fillSpherical)(coords[0], coords[1], unit), "f");
            __classPrivateFieldSet(this, _Point_cartesian, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.sphericalToCartesian)(__classPrivateFieldGet(this, _Point_spherical, "f"), 1.0), "f"); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
            __classPrivateFieldSet(this, _Point_astro, (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.sphericalToAstro)(__classPrivateFieldGet(this, _Point_spherical, "f")), "f");
        }
        else {
            console.error("CoordsType " + in_type + " not recognised.");
        }
        if (__classPrivateFieldGet(this, _Point_spherical, "f").phiDeg > 360) {
            __classPrivateFieldGet(this, _Point_spherical, "f").phiDeg -= 360;
        }
        if (__classPrivateFieldGet(this, _Point_astro, "f").raDeg > 360) {
            __classPrivateFieldGet(this, _Point_astro, "f").raDeg -= 360;
        }
    }
    // constructor(in_options: ICoordsFormat, in_type: CoordsType){
    // 	if (in_type == CoordsType.CARTESIAN){
    // 		this.#cartesian.x = parseFloat((in_options as CartesianCoords).x.toFixed(global.MAX_DECIMALS));
    // 		this.#cartesian.y = parseFloat((in_options as CartesianCoords).y.toFixed(global.MAX_DECIMALS));
    // 		this.#cartesian.z = parseFloat((in_options as CartesianCoords).z.toFixed(global.MAX_DECIMALS));
    // 		this.#spherical = cartesianToSpherical(this.#cartesian);
    // 		this.#astro = sphericalToAstro(this.#spherical);
    // 	}else if (in_type == CoordsType.ASTRO){
    // 		if ((in_options as AstroCoords).raDeg && (in_options as AstroCoords).decDeg) {
    // 			this.#astro = radegDecdegToAstro((in_options as AstroCoords).raDeg,  (in_options as AstroCoords).decDeg );
    // 		} else if ((in_options as AstroCoords).raRad && (in_options as AstroCoords).decRad) {
    // 			this.#astro = raradDecradToAstro((in_options as AstroCoords).raRad,  (in_options as AstroCoords).decRad );
    // 		} else {
    // 			console.error("AstroCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.#spherical = astroToSpherical(this.#astro);
    // 		this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 	}else if (in_type == CoordsType.SPHERICAL){
    // 		if ((in_options as SphericalCoords).phiDeg && (in_options as SphericalCoords).thetaDeg) {
    // 			this.#spherical = phidegThetadegToSpherical((in_options as SphericalCoords).phiDeg,  (in_options as SphericalCoords).thetaDeg );
    // 		} else if ((in_options as SphericalCoords).phiRad && (in_options as SphericalCoords).thetaRad) {
    // 			this.#spherical = phiradThetaradToSpherical((in_options as SphericalCoords).phiRad,  (in_options as SphericalCoords).thetaRad );
    // 		} else {
    // 			console.error("SphericalCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 		this.#astro = sphericalToAstro(this.#spherical);
    // 	}else{
    // 		console.error("CoordsType "+in_type+" not recognised.");
    // 	}
    // }
    get spherical() {
        return __classPrivateFieldGet(this, _Point_spherical, "f");
    }
    get astro() {
        return __classPrivateFieldGet(this, _Point_astro, "f");
    }
    get cartesian() {
        return __classPrivateFieldGet(this, _Point_cartesian, "f");
    }
}
_Point_astro = new WeakMap(), _Point_spherical = new WeakMap(), _Point_cartesian = new WeakMap();


/***/ }),

/***/ "./src/model/Utils.ts":
/*!****************************!*\
  !*** ./src/model/Utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "astroToSpherical": () => (/* binding */ astroToSpherical),
/* harmony export */   "cartesianToSpherical": () => (/* binding */ cartesianToSpherical),
/* harmony export */   "colorHex2RGB": () => (/* binding */ colorHex2RGB),
/* harmony export */   "decDegToDMS": () => (/* binding */ decDegToDMS),
/* harmony export */   "degToRad": () => (/* binding */ degToRad),
/* harmony export */   "fillAstro": () => (/* binding */ fillAstro),
/* harmony export */   "fillSpherical": () => (/* binding */ fillSpherical),
/* harmony export */   "raDegToHMS": () => (/* binding */ raDegToHMS),
/* harmony export */   "radToDeg": () => (/* binding */ radToDeg),
/* harmony export */   "sphericalToAstro": () => (/* binding */ sphericalToAstro),
/* harmony export */   "sphericalToCartesian": () => (/* binding */ sphericalToCartesian)
/* harmony export */ });
/* harmony import */ var _NumberType_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NumberType.js */ "./src/model/NumberType.ts");
/**
 * @author Fabrizio Giordano (Fab)
 */
// import vec3 from 'gl-matrix';

function Utils() {
}
function cartesianToSpherical(xyz) {
    let dotXYZ = dot(xyz, xyz);
    let r = Math.sqrt(dotXYZ);
    let thetaRad = Math.acos(xyz[2] / r);
    let thetaDeg = radToDeg(thetaRad);
    // NB: in atan(y/x) is written with params switched atan2(x, y)
    let phiRad = Math.atan2(xyz[1], xyz[0]);
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
    if (unit == _NumberType_js__WEBPACK_IMPORTED_MODULE_0__.NumberType.DEGREES) {
        return {
            "raDeg": ra,
            "decDeg": dec,
            "raRad": degToRad(ra),
            "decRad": degToRad(dec)
        };
    }
    else if (unit == _NumberType_js__WEBPACK_IMPORTED_MODULE_0__.NumberType.RADIANS) {
        return {
            "raRad": ra,
            "decRad": dec,
            "raDeg": radToDeg(ra),
            "decDeg": radToDeg(dec)
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
    }
}
function fillSpherical(phi, theta, unit) {
    if (unit == _NumberType_js__WEBPACK_IMPORTED_MODULE_0__.NumberType.DEGREES) {
        return {
            "phiDeg": phi,
            "thetaDeg": theta,
            "phiRad": degToRad(phi),
            "thetaRad": degToRad(theta)
        };
    }
    else if (unit == _NumberType_js__WEBPACK_IMPORTED_MODULE_0__.NumberType.RADIANS) {
        return {
            "phiDeg": radToDeg(phi),
            "thetaDeg": radToDeg(theta),
            "phiRad": phi,
            "thetaRad": theta
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
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


/***/ }),

/***/ "./src/projections/AbstractProjection.ts":
/*!***********************************************!*\
  !*** ./src/projections/AbstractProjection.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractProjection": () => (/* binding */ AbstractProjection)
/* harmony export */ });
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


/***/ }),

/***/ "./src/projections/GnomonicProjection.ts":
/*!***********************************************!*\
  !*** ./src/projections/GnomonicProjection.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GnomonicProjection": () => (/* binding */ GnomonicProjection)
/* harmony export */ });
/* harmony import */ var _AbstractProjection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractProjection.js */ "./src/projections/AbstractProjection.ts");
/* harmony import */ var jsfitsio__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jsfitsio */ "../FITSParser/lib-esm/index.js");

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */





class GnomonicProjection extends _AbstractProjection_js__WEBPACK_IMPORTED_MODULE_0__.AbstractProjection {
    constructor(infile) {
        super();
        this._ctype1 = "RA---TAN";
        this._ctype2 = "DEC--TAN";
        if (infile) {
            this._inflie = infile;
        }
    }
    initFromFile(infile) {
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSParser(infile);
            let promise = fp.loadFITS().then(fits => {
                // console.log(fits.header);
                this._pxvalues.set(0, fits.data);
                this._fitsheader[0] = fits.header;
                this._naxis1 = fits.header.get("NAXIS1");
                this._naxis2 = fits.header.get("NAXIS2");
                this._craDeg = fits.header.getItemListOf("CRVAL1")[0].value;
                this._cdecDeg = fits.header.getItemListOf("CRVAL2")[0].value;
                // TODO CDELT could not be present. In this is the case, 
                // there should be CDi_ja, but I am not handling them atm
                // [Ref. Representation of celestial coordinates in FITS - equation (1)]
                this._pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value;
                this._pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value;
                this._minra = this._craDeg - this._pxsize1 * this._naxis1 / 2;
                if (this._minra < 0) {
                    this._minra += 360;
                }
                this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
                return fits;
            });
            yield promise;
            return promise;
        });
    }
    extractPhysicalValues(fits) {
        let bzero = fits.header.get("BZERO");
        let bscale = fits.header.get("BSCALE");
        let naxis1 = fits.header.get("NAXIS1");
        let naxis2 = fits.header.get("NAXIS2");
        let bitpix = fits.header.get("BITPIX");
        let bytesXelem = Math.abs(bitpix / 8);
        let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // TODO => ??????? Im not using it. it should be used!
        // let physicalvalues = new Array[naxis2][naxis1];
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                let pixval = jsfitsio__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                let physicalVal = bzero + bscale * pixval;
                physicalvalues[n2][n1] = physicalVal;
            }
        }
        return physicalvalues;
    }
    prepareFITSHeader(fitsHeaderParams) {
        this._fitsheader[0] = new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeader();
        this._fitsheader[0].addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
        this._fitsheader[0].addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));
        if (fitsHeaderParams.get("BLANK") !== undefined) {
            this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
        }
        let bscale = 1.0;
        if (fitsHeaderParams.get("BSCALE") !== undefined) {
            bscale = fitsHeaderParams.get("BSCALE");
        }
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("BSCALE", bscale));
        let bzero = 0.0;
        if (fitsHeaderParams.get("BZERO") !== undefined) {
            bzero = fitsHeaderParams.get("BZERO");
        }
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("BZERO", bzero));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("NAXIS", 2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("NAXIS1", this._naxis1));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("NAXIS2", this._naxis2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CTYPE1", this._ctype1));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CTYPE2", this._ctype2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CDELT1", this._pxsize)); // ??? Pixel spacing along axis 1 ???
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CDELT2", this._pxsize)); // ??? Pixel spacing along axis 2 ???
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CRPIX1", this._naxis1 / 2)); // central/reference pixel i along naxis1
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CRPIX2", this._naxis2 / 2)); // central/reference pixel j along naxis2
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CRVAL1", this._craDeg)); // central/reference pixel RA
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("CRVAL2", this._cdecDeg)); // central/reference pixel Dec
        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("DATAMIN", min)); // min data value
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("DATAMAX", max)); // max data value
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("END"));
        return this._fitsheader;
    }
    getFITSHeader() {
        return this._fitsheader;
    }
    getCommonFitsHeaderParams() {
        let header = new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeader();
        for (const [key, value] of this._fitsheader[0]) {
            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                // header.set(key, value);
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem(key, value));
            }
        }
        return header;
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = new Promise((resolve, reject) => {
                try {
                    let bytesXelem = Math.abs(this._fitsheader[0].get("BITPIX") / 8);
                    let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.convertBlankToBytes(this._fitsheader[0].get("BLANK"), bytesXelem);
                    let pixcount = inputPixelsList.length;
                    let values = new Uint8Array(pixcount * bytesXelem);
                    for (let p = 0; p < pixcount; p++) {
                        let imgpx = inputPixelsList[p];
                        // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                        // TODO why I am getting negative i and j? check world2pix!!!
                        if ((imgpx._j) < 0 || (imgpx._j) >= this._naxis2 ||
                            (imgpx._i) < 0 || (imgpx._i) >= this._naxis1) {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = blankBytes[b];
                            }
                        }
                        else {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = (this._pxvalues.get(0))[imgpx._j][(imgpx._i) * bytesXelem + b];
                            }
                        }
                    }
                    resolve(values);
                }
                catch (err) {
                    reject("[MercatorProjection] ERROR: " + err);
                }
            });
            return promise;
        });
    }
    computeSquaredNaxes(d, ps) {
        // first aprroximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
    setPxsValue(values, fitsHeaderParams) {
        // let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        // let minpixb = ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), fitsHeaderParams.get("BITPIX"));
        // let maxpixb = minpixb;
        // let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        // let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        // this._minphysicalval = bzero + bscale * minpixb;
        // this._maxphysicalval = bzero + bscale * maxpixb;
        // this._pxvalues = new Array(this._naxis2);
        // for (let r = 0; r < this._naxis2; r++) {
        //     this._pxvalues[r] = new Uint8Array(this._naxis1 * bytesXelem);
        // }
        // TODO ...
        return null;
    }
    getImageRADecList(center, radius, pxsize) {
        // let promise = new Promise((resolve, reject) => {
        //     this.computeSquaredNaxes(2 * radius, pxsize); // compute naxis[1, 2]
        //     this._pxsize = pxsize;
        //     this._minra = center.ra - radius;
        //     if (this._minra < 0) {
        //         this._minra += 360;
        //     }
        //     this._mindec = center.dec - radius;
        //     let radeclist = [];
        //     let pra, pdec;
        // TODO ...
        /*
        basing on naxis1 and naxis2 call pix2world!!!
        */
        /*
        

        mindec = center.dec - radius;
        maxdec = center.dec + radius;
        below pixel size should  depend on the distance from the center
        let l =  0;
        let factor = 1;
        
        for (let d = mindec; d < maxdec; d+=pxsize) { <--ERROR the external loop must be over RA
            factor = 1 + 2**l;
            rapxsize = pxsize/factor;
            for (let r = 0; r < 360; r+=rapxsize) {
                radeclist.push(r, d);
            }
            l++;
        }
        */
        // let cidx = (this._naxis2 / 2 - 1) * this._naxis1 + this._naxis1 / 2;
        // this._cra = radeclist[cidx][0];
        // this._cdec = radeclist[cidx][1];
        // resolve(radeclist);
        // });
        // return promise;
        return null;
    }
    pix2world(i, j) {
        // TODO ...
        let x, y;
        let CDELT1 = this._fitsheader[0].getItemListOf("CDELT1")[0];
        let CDELT2 = this._fitsheader[0].getItemListOf("CDELT2")[0];
        let PC1_1 = this._fitsheader[0].getItemListOf("PC1_1")[0];
        let PC1_2 = this._fitsheader[0].getItemListOf("PC1_2")[0];
        let PC2_1 = this._fitsheader[0].getItemListOf("PC2_1")[0];
        let PC2_2 = this._fitsheader[0].getItemListOf("PC2_2")[0];
        let CD1_1 = this._fitsheader[0].getItemListOf("CD1_1")[0];
        let CD1_2 = this._fitsheader[0].getItemListOf("CD1_2")[0];
        let CD2_1 = this._fitsheader[0].getItemListOf("CD2_1")[0];
        let CD2_2 = this._fitsheader[0].getItemListOf("CD2_2")[0];
        let CRPIX1 = this._fitsheader[0].getItemListOf("CRPIX1")[0];
        let CRPIX2 = this._fitsheader[0].getItemListOf("CRPIX2")[0];
        if (CDELT1 !== undefined && CDELT2 !== undefined &&
            PC1_1 !== undefined && PC1_2 !== undefined &&
            PC2_1 !== undefined && PC2_2 !== undefined) { // if CDELTia and PCi_ja notation
            x = CDELT1 * (PC1_1 * (i - CRPIX1) + PC1_2 * (j - CRPIX2));
            y = CDELT2 * (PC2_1 * (i - CRPIX1) + PC2_2 * (j - CRPIX2));
        }
        else { // else CDi_ja notation
            x = CD1_1 * (i - CRPIX1) + CD1_2 * (j - CRPIX2);
            y = CD2_1 * (i - CRPIX1) + CD2_2 * (j - CRPIX2);
        }
        // let phi = math.arg(-y / x);
        // let R_theta = Math.sqrt(x * x + y * y);
        // let theta = Math.atan2(180 / (Math.PI * R_theta));
        // let ra, dec;
        // ra = phi;
        // dec = theta;
        // // TODO check if phi, theta match with ra, dec or they need to be (linearly) converted 
        // return [ra, dec];
        return null;
    }
    world2pix(radeclist) {
        let imgpxlist = [];
        let CDELT1 = (this._fitsheader[0].getItemListOf("CDELT1").length > 0) ? this._fitsheader[0].getItemListOf("CDELT1")[0] : undefined;
        let CDELT2 = (this._fitsheader[0].getItemListOf("CDELT2").length > 0) ? this._fitsheader[0].getItemListOf("CDELT2")[0] : undefined;
        let PC1_1 = (this._fitsheader[0].getItemListOf("PC1_1").length > 0) ? this._fitsheader[0].getItemListOf("PC1_1")[0] : undefined;
        let PC1_2 = (this._fitsheader[0].getItemListOf("PC1_2").length > 0) ? this._fitsheader[0].getItemListOf("PC1_2")[0] : undefined;
        let PC2_1 = (this._fitsheader[0].getItemListOf("PC2_1").length > 0) ? this._fitsheader[0].getItemListOf("PC2_1")[0] : undefined;
        let PC2_2 = (this._fitsheader[0].getItemListOf("PC2_2").length > 0) ? this._fitsheader[0].getItemListOf("PC2_2")[0] : undefined;
        let CD1_1 = (this._fitsheader[0].getItemListOf("CD1_1").length > 0) ? this._fitsheader[0].getItemListOf("CD1_1")[0] : undefined;
        let CD1_2 = (this._fitsheader[0].getItemListOf("CD1_2").length > 0) ? this._fitsheader[0].getItemListOf("CD1_2")[0] : undefined;
        let CD2_1 = (this._fitsheader[0].getItemListOf("CD2_1").length > 0) ? this._fitsheader[0].getItemListOf("CD2_1")[0] : undefined;
        let CD2_2 = (this._fitsheader[0].getItemListOf("CD2_2").length > 0) ? this._fitsheader[0].getItemListOf("CD2_2")[0] : undefined;
        let CRPIX1 = (this._fitsheader[0].getItemListOf("CRPIX1").length > 0) ? this._fitsheader[0].getItemListOf("CRPIX1")[0] : undefined;
        let CRPIX2 = (this._fitsheader[0].getItemListOf("CRPIX2").length > 0) ? this._fitsheader[0].getItemListOf("CRPIX2")[0] : undefined;
        radeclist.forEach(([ra, dec]) => {
            // TODO ...
            // let i, j;
            // // (linearly) convert ra, dec into phi, theta
            // let theta = dec;
            // let phi = ra;
            // let R_theta = (180 / Math.PI) * math.cot(theta);
            // let x = R_theta * Math.sin(phi);
            // let y = - R_theta * Math.cos(phi);
            // if (CDELT1 !== undefined && CDELT2 !== undefined &&
            //     PC1_1 !== undefined && PC1_2 !== undefined &&
            //     PC2_1 !== undefined && PC2_2 !== undefined
            // ) { // if CDELTia and PCi_ja notation
            //     j = y * CDELT1 * PC1_1 / (CDELT1 * CDELT2 * (PC1_1 * PC2_2 - PC2_1 * PC1_2)) + PC1_1 * CRPIX2 * (PC2_2 - PC2_1) / (PC1_1 * PC2_2 - PC2_1 * PC1_2);
            //     i = x / (CDELT1 * PC1_1) + CRPIX1 - j * PC1_2 / PC1_1 + CRPIX2 * PC1_2 / PC1_1;
            // } else { // else CDi_ja notation
            //     j = y * CD1_1 / (CD1_1 * CD2_2 - CD1_2 * CD2_1) + CRPIX2 * CD1_1 * (CD2_2 - CD2_1) / (CD1_1 * CD2_2 - CD1_2 * CD2_1);
            //     i = (x + CD1_1 * CRPIX1 - CD1_2 * j + CD1_2 * CRPIX2) / CD1_1;
            // }
            // imgpxlist.push(new ImagePixel(i, j));
        });
        return imgpxlist;
    }
}


/***/ }),

/***/ "./src/projections/HEALPixProjection.ts":
/*!**********************************************!*\
  !*** ./src/projections/HEALPixProjection.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HEALPixProjection": () => (/* binding */ HEALPixProjection)
/* harmony export */ });
/* harmony import */ var _AbstractProjection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractProjection.js */ "./src/projections/AbstractProjection.ts");

class HEALPixProjection extends _AbstractProjection_js__WEBPACK_IMPORTED_MODULE_0__.AbstractProjection {
    initFromFile(fitsfilepath, hipsURI, pxsize, order) {
        throw new Error('Method not implemented.');
    }
    prepareFITSHeader(fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getFITSHeader() {
        throw new Error('Method not implemented.');
    }
    getCommonFitsHeaderParams() {
        throw new Error('Method not implemented.');
    }
    extractPhysicalValues(fits) {
        throw new Error('Method not implemented.');
    }
    getPixValues(inputPixelsList) {
        throw new Error('Method not implemented.');
    }
    computeSquaredNaxes(d, ps) {
        throw new Error('Method not implemented.');
    }
    setPxsValue(values, fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getImageRADecList(center, radius, pxsize) {
        throw new Error('Method not implemented.');
    }
    pix2world(i, j) {
        throw new Error('Method not implemented.');
    }
    world2pix(radeclist) {
        throw new Error('Method not implemented.');
    }
}


/***/ }),

/***/ "./src/projections/HiPSHelper.ts":
/*!***************************************!*\
  !*** ./src/projections/HiPSHelper.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HiPSHelper": () => (/* binding */ HiPSHelper)
/* harmony export */ });
/* harmony import */ var healpixjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! healpixjs */ "./node_modules/healpixjs/lib-esm/index.js");
/* harmony import */ var _model_Utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/Utils.js */ "./src/model/Utils.ts");
/* harmony import */ var _model_CoordsType_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../model/CoordsType.js */ "./src/model/CoordsType.ts");
/* harmony import */ var _model_Point_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/Point.js */ "./src/model/Point.ts");
/* harmony import */ var _model_NumberType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../model/NumberType.js */ "./src/model/NumberType.ts");
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


 // TODO change package



class HiPSHelper {
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
    static computeHiPSOrder(pxsize, pxXtile) {
        /**
         * with same order k (table 1), HIPS angular resolution is higher of order of 512 (2^9) pixels than
         * the HEALPix. This is because each tile in a HiPS is represented by default by 512x512 pixels.\
         * Angular resolution of different HEALPix orders in respect to the order 0, can be calculated this
         * way:
         *
         * 	L(k) = L(0) / 2^k = 58.6 / 2^k
         *
         * Therefore, in the case of HiPS we need to take into account the extra resolution given by the
         * 512x512 (2^9) tiles. In this case the above becomes:
         *
         * 	L(k) = L(0) / (2^k * 2^9)
         *
         * Though, in order to compute the required order starting from the pxsize desired (in input) we
         * need to perform these steps:
         *
         * 	pxsize = L(k) = L(0) / (2^k * 2^9)
         * 	2^k = L(0) / (pxsize * 2^9)
         *  k * Log2 2 = Log2 L(0) - Log2 (pxsize * 2^9)
         * 	k = Log2 L(0) - Log2 (pxsize * 2^9)
         *
         */
        let k = Math.log2((HiPSHelper.RES_ORDER_0 / pxXtile) / pxsize);
        k = Math.round(k);
        // let theta0px = HiPSHelper.RES_ORDER_0;
        // let k = Math.log2(theta0px) - Math.log2(pxsize * 2**9);
        // k = Match.round(k);
        // let nside = 2**k;
        // return {
        //     "nside" : nside,
        //     "norder" : k
        // };
        return k;
    }
    /**
     * Reference: HiPS – Hierarchical Progressive Survey page 11
     * pxsize =~ sqrt[4 * PI / (12 * (512 * 2^order)^2)]
     * @param {*} order
     */
    static computePxSize(order, pxXtile) {
        // TODO CHECK IT
        // let pxsize = 1 / (512 * 2 ** order) * Math.sqrt(Math.PI / 3);
        let pxsize = 1 / (pxXtile * Math.pow(2, order)) * Math.sqrt(Math.PI / 3);
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
        bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_0__.Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad - r));
        bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_0__.Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad + r));
        bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_0__.Pointing(null, false, point.spherical.thetaRad + r, point.spherical.phiRad + r));
        bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_0__.Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad - r));
        return bbox;
    }
    static setupByTile(tileno, hp) {
        let xyGridProj = {
            "min_y": NaN,
            "max_y": NaN,
            "min_x": NaN,
            "max_x": NaN,
            "gridPointsDeg": []
        };
        let cornersVec3 = hp.getBoundariesWithStep(tileno, 1);
        let pointings = [];
        for (let i = 0; i < cornersVec3.length; i++) {
            pointings[i] = new healpixjs__WEBPACK_IMPORTED_MODULE_0__.Pointing(cornersVec3[i]);
            if (i >= 1) {
                let a = pointings[i - 1].phi;
                let b = pointings[i].phi;
                // case when RA is just crossing the origin (e.g. 357deg - 3deg)
                if (Math.abs(a - b) > Math.PI) {
                    if (pointings[i - 1].phi < pointings[i].phi) {
                        pointings[i - 1].phi += 2 * Math.PI;
                    }
                    else {
                        pointings[i].phi += 2 * Math.PI;
                    }
                }
            }
        }
        for (let j = 0; j < pointings.length; j++) {
            let coThetaRad = pointings[j].theta;
            // HEALPix works with colatitude (0 North Pole, 180 South Pole)
            // converting the colatitude in latitude (dec)
            let decRad = Math.PI / 2 - coThetaRad;
            let raRad = pointings[j].phi;
            // projection on healpix grid
            let p = new _model_Point_js__WEBPACK_IMPORTED_MODULE_3__.Point(_model_CoordsType_js__WEBPACK_IMPORTED_MODULE_2__.CoordsType.ASTRO, _model_NumberType_js__WEBPACK_IMPORTED_MODULE_4__.NumberType.RADIANS, raRad, decRad);
            let xyDeg = HiPSHelper.world2intermediate(p.astro);
            xyGridProj.gridPointsDeg[j * 2] = xyDeg[0];
            xyGridProj.gridPointsDeg[j * 2 + 1] = xyDeg[1];
            if (isNaN(xyGridProj.max_y) || xyDeg[1] > xyGridProj.max_y) {
                xyGridProj.max_y = xyDeg[1];
            }
            if (isNaN(xyGridProj.min_y) || xyDeg[1] < xyGridProj.min_y) {
                xyGridProj.min_y = xyDeg[1];
            }
            if (isNaN(xyGridProj.max_x) || xyDeg[0] > xyGridProj.max_x) {
                xyGridProj.max_x = xyDeg[0];
            }
            if (isNaN(xyGridProj.min_x) || xyDeg[0] < xyGridProj.min_x) {
                xyGridProj.min_x = xyDeg[0];
            }
        }
        return xyGridProj;
    }
    static world2intermediate(ac) {
        let x_grid;
        let y_grid;
        if (Math.abs(ac.decRad) <= HiPSHelper.THETAX) { // equatorial belts
            x_grid = ac.raDeg;
            y_grid = healpixjs__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(ac.decRad) * HiPSHelper.K * 90 / HiPSHelper.H;
        }
        else if (Math.abs(ac.decRad) > HiPSHelper.THETAX) { // polar zones
            let raDeg = ac.raDeg;
            let w = 0; // omega
            if (HiPSHelper.K % 2 !== 0 || ac.decRad > 0) { // K odd or thetax > 0
                w = 1;
            }
            let sigma = Math.sqrt(HiPSHelper.K * (1 - Math.abs(healpixjs__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(ac.decRad))));
            let phi_c = -180 + (2 * Math.floor(((ac.raDeg + 180) * HiPSHelper.H / 360) + ((1 - w) / 2)) + w) * (180 / HiPSHelper.H);
            x_grid = phi_c + (raDeg - phi_c) * sigma;
            y_grid = (180 / HiPSHelper.H) * (((HiPSHelper.K + 1) / 2) - sigma);
            if (ac.decRad < 0) {
                y_grid *= -1;
            }
        }
        return [x_grid, y_grid];
    }
    // static world2intermediate(sc: SphericalCoords): [number, number] {
    //     let x_grid: number;
    // 	let y_grid: number;
    // 	if ( Math.abs(sc.thetaRad) <= HiPSHelper.THETAX) { // equatorial belts
    // 		x_grid = sc.phiDeg;
    // 		y_grid = Hploc.sin(sc.thetaRad) * HiPSHelper.K * 90 / HiPSHelper.H;
    // 	} else if ( Math.abs(sc.thetaRad) > HiPSHelper.THETAX) { // polar zones
    // 		let phiDeg = sc.phiDeg;
    // 		let w = 0; // omega
    // 		if (HiPSHelper.K % 2 !== 0 || sc.thetaRad > 0) { // K odd or thetax > 0
    // 			w = 1;
    // 		}
    // 		let sigma = Math.sqrt( HiPSHelper.K * (1 - Math.abs(Hploc.sin(sc.thetaRad)) ) );
    // 		let phi_c = - 180 + ( 2 * Math.floor( ((sc.phiRad + 180) * HiPSHelper.H/360) + ((1 - w)/2) ) + w ) * ( 180 / HiPSHelper.H );
    // 		x_grid = phi_c + (phiDeg - phi_c) * sigma;
    // 		y_grid = (180  / HiPSHelper.H) * ( ((HiPSHelper.K + 1)/2) - sigma);
    // 		if (sc.thetaRad < 0) {
    // 			y_grid *= -1;
    // 		}
    // 	}
    // 	return [x_grid, y_grid];
    // }
    static intermediate2pix(x, y, xyGridProj, pxXtile) {
        let xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
        let yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);
        let i_norm;
        let j_norm;
        if ((xyGridProj.min_x > 360 || xyGridProj.max_x > 360) && x < xyGridProj.min_x) {
            i_norm = (x + 360 - xyGridProj.min_x) / xInterval;
        }
        else {
            i_norm = (x - xyGridProj.min_x) / xInterval;
        }
        j_norm = (y - xyGridProj.min_y) / yInterval;
        let i = 0.5 - (i_norm - j_norm);
        let j = (i_norm + j_norm) - 0.5;
        // TODO CHECK THE FOLLOWING. BEFORE IT WAS i = Math.floor(i * HiPSHelper.pxXtile);
        pxXtile;
        // i = Math.floor(i * HiPSHelper.DEFAULT_Naxis1_2);
        // j = Math.floor(j * HiPSHelper.DEFAULT_Naxis1_2);
        // return [i, HiPSHelper.DEFAULT_Naxis1_2 - j - 1];
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
        let i_norm = (i + 0.5) / cnaxis1;
        let j_norm = (j + 0.5) / cnaxis2;
        let xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x) / 2.0;
        let yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y) / 2.0;
        let yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;
        // bi-linear interpolation
        let x = xyGridProj.max_x - xInterval * (i_norm + j_norm);
        let y = yMean - yInterval * (j_norm - i_norm);
        return [x, y];
    }
    static intermediate2world(x, y) {
        let phiDeg;
        let thetaDeg;
        let Yx = 90 * (HiPSHelper.K - 1) / HiPSHelper.H;
        if (Math.abs(y) <= Yx) { // equatorial belts
            phiDeg = x;
            thetaDeg = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_1__.radToDeg)(Math.asin((y * HiPSHelper.H) / (90 * HiPSHelper.K)));
        }
        else if (Math.abs(y) > Yx) { // polar regions
            let sigma = (HiPSHelper.K + 1) / 2 - Math.abs(y * HiPSHelper.H) / 180;
            let thetaRad = healpixjs__WEBPACK_IMPORTED_MODULE_0__.Hploc.asin(1 - (sigma * sigma) / HiPSHelper.K);
            let w = 0; // omega
            if (HiPSHelper.K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
                w = 1;
            }
            let x_c = -180 + (2 * Math.floor((x + 180) * HiPSHelper.H / 360 + (1 - w) / 2) + w) * (180 / HiPSHelper.H);
            phiDeg = x_c + (x - x_c) / sigma;
            thetaDeg = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_1__.radToDeg)(thetaRad);
            if (y <= 0) {
                thetaDeg *= -1;
            }
        }
        // return [phiDeg, thetaDeg];
        // TODO CHECK THIS!
        // let p = new Point(CoordsType.SPHERICAL, NumberType.DEGREES, phiDeg, thetaDeg);
        let p = new _model_Point_js__WEBPACK_IMPORTED_MODULE_3__.Point(_model_CoordsType_js__WEBPACK_IMPORTED_MODULE_2__.CoordsType.ASTRO, _model_NumberType_js__WEBPACK_IMPORTED_MODULE_4__.NumberType.DEGREES, phiDeg, thetaDeg);
        return p;
    }
}
// static pxXtile: number = 512; // TODO in some cases it is different
HiPSHelper.DEFAULT_Naxis1_2 = 512;
// static RES_ORDER_0: number = 58.6 / HiPSHelper.pxXtile;
HiPSHelper.RES_ORDER_0 = 58.6;
HiPSHelper.H = 4;
HiPSHelper.K = 3;
HiPSHelper.THETAX = healpixjs__WEBPACK_IMPORTED_MODULE_0__.Hploc.asin((HiPSHelper.K - 1) / HiPSHelper.K);


/***/ }),

/***/ "./src/projections/HiPSProjection.ts":
/*!*******************************************!*\
  !*** ./src/projections/HiPSProjection.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HiPSProjection": () => (/* binding */ HiPSProjection)
/* harmony export */ });
/* harmony import */ var jsfitsio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsfitsio */ "../FITSParser/lib-esm/index.js");
/* harmony import */ var healpixjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! healpixjs */ "./node_modules/healpixjs/lib-esm/index.js");
/* harmony import */ var _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./HiPSHelper.js */ "./src/projections/HiPSHelper.ts");
/* harmony import */ var _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/ImagePixel.js */ "./src/model/ImagePixel.ts");
/* harmony import */ var _model_Utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../model/Utils.js */ "./src/model/Utils.ts");
/* harmony import */ var _model_Point_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../model/Point.js */ "./src/model/Point.ts");
/* harmony import */ var _model_CoordsType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../model/CoordsType.js */ "./src/model/CoordsType.ts");
/* harmony import */ var _model_NumberType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../model/NumberType.js */ "./src/model/NumberType.ts");

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */












class HiPSProjection {
    /**
     *
     * * ex with single local file:
     * let hp = new HiPSProjection('/mylocaldir/myfile.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with single remote file:
     * let hp = new HiPSProjection('http://<hips-server>/Norder7/DirN/NpixXYZ.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with HiPS server base local dir:
     * let hp = new HiPSProjection(null, <hips-local-root-dir>, pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     * * ex with HiPS server base URL:
     * let hp = new HiPSProjection(null, 'http://<hips-server>/<hips-root-dir>', pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     */
    //  constructor(fitsfilepath?: string, hipsBaseURI?: string, pxsize?: number, order?: number) {
    constructor() {
        this._wcsname = "HPX"; // TODO check WCS standard
        this._ctype1 = "RA---HPX";
        this._ctype2 = "DEC--HPX";
        this._pxvalues = new Map();
        this._fitsheaderlist = new Array();
        this._radeclist = new Array();
    }
    parsePropertiesFile(baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser(null);
            const promise = fp.getFile(baseUrl + "/properties").then((propFile) => {
                let prop;
                if (propFile instanceof ArrayBuffer) {
                    const textDecoder = new TextDecoder("iso-8859-1");
                    prop = textDecoder.decode(new Uint8Array(propFile));
                }
                else {
                    prop = propFile.toString('utf8');
                }
                const txtArr = prop.split('\n');
                for (let line of txtArr) {
                    if (line.includes("hips_tile_width")) {
                        console.log(line);
                        let val = line.split("=")[1].trim();
                        this._HIPS_TILE_WIDTH = parseInt(val);
                        this._naxis1 = this._HIPS_TILE_WIDTH;
                        this._naxis2 = this._HIPS_TILE_WIDTH;
                        console.log(`val is ${val}`);
                        break;
                    }
                }
                return propFile;
            });
            yield promise;
            return promise;
        });
    }
    initFromFile(fitsfilepath) {
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser(fitsfilepath);
            let promise = fp.loadFITS().then(fits => {
                this._pxvalues.set(0, fits.data);
                this._fitsheaderlist[0] = fits.header;
                let order = fits.header.get("ORDER");
                this.init(order);
                this._naxis1 = fits.header.get("NAXIS1");
                this._naxis2 = fits.header.get("NAXIS2");
                this._HIPS_TILE_WIDTH = this._naxis1;
                this._pixno = fits.header.get("NPIX");
                this._xyGridProj = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.setupByTile(this._pixno, this._hp);
                return fits;
            });
            yield promise;
            return promise;
        });
    }
    initFromHiPSLocationAndPxSize(baseUrl, pxsize) {
        this._hipsBaseURI = baseUrl;
        this._pxsize = pxsize;
        if (this._HIPS_TILE_WIDTH === undefined) {
            this.parsePropertiesFile(baseUrl);
        }
        let order = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.computeHiPSOrder(pxsize, this._HIPS_TILE_WIDTH);
        this.init(order);
    }
    initFromHiPSLocationAndOrder(baseUrl, order) {
        this._hipsBaseURI = baseUrl;
        if (this._HIPS_TILE_WIDTH === undefined) {
            this.parsePropertiesFile(baseUrl);
        }
        this._pxsize = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.computePxSize(order, this._HIPS_TILE_WIDTH);
        this.init(order);
    }
    init(order) {
        this._norder = order;
        this._nside = Math.pow(2, order);
        this._hp = new healpixjs__WEBPACK_IMPORTED_MODULE_1__.Healpix(this._nside);
    }
    prepareFITSHeader(fitsHeaderParams) {
        for (let header of this._fitsheaderlist) {
            header.addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
            header.addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));
            if (fitsHeaderParams.get("BLANK") !== undefined) {
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
            }
            let bscale = 1.0;
            if (fitsHeaderParams.get("BSCALE") !== undefined) {
                bscale = fitsHeaderParams.get("BSCALE");
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BSCALE", bscale));
            }
            let bzero = 0.0;
            if (fitsHeaderParams.get("BZERO") !== undefined) {
                bzero = fitsHeaderParams.get("BZERO");
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BZERO", bzero));
            }
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS", 2));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS1", _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.DEFAULT_Naxis1_2));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS2", _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.DEFAULT_Naxis1_2));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("ORDER", this._norder));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CTYPE1", this._ctype1));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CTYPE2", this._ctype2));
            // header.addItem(new FITSHeaderItem("CRPIX1", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel i along naxis1
            // header.addItem(new FITSHeaderItem("CRPIX2", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel j along naxis2
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
            header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        }
        return this._fitsheaderlist;
    }
    getFITSHeader() {
        return this._fitsheaderlist;
    }
    getCommonFitsHeaderParams() {
        return this._fh_common;
    }
    extractPhysicalValues(fits) {
        let bzero = fits.header.get("BZERO");
        let bscale = fits.header.get("BSCALE");
        let naxis1 = fits.header.get("NAXIS1");
        let naxis2 = fits.header.get("NAXIS2");
        let bitpix = fits.header.get("BITPIX");
        let bytesXelem = Math.abs(bitpix / 8);
        let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // TODO => ??????? Im not using it. it should be used!
        // let physicalvalues = new Array[naxis2][naxis1];
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                let pixval = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                let physicalVal = bzero + bscale * pixval;
                physicalvalues[n2][n1] = physicalVal;
            }
        }
        return physicalvalues;
    }
    getFITSFiles(inputPixelsList, destPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitsFilesGenerated = new Map();
            let promises = [];
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            for (let hipstileno of tilesset) {
                let tileno = hipstileno;
                let dir = Math.floor(tileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + tileno + ".fits";
                let fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser(fitsurl);
                promises.push(fp.loadFITS().then((fits) => {
                    if (fits !== null) {
                        let pixno = (fits.header.get("NPIX") !== undefined) ? fits.header.get("NPIX") : tileno;
                        // FITSParser.writeFITS(fits.header, fits.data, destPath+"/Npix"+pixno+".fits");
                        // fitsFilesGenerated.set(destPath+"/Npix"+pixno+".fits",FITSParser.generateFITS(fits.header, fits.data) );
                        fitsFilesGenerated.set(destPath + "/Npix" + pixno + ".fits", fits);
                    }
                }));
            }
            yield Promise.all(promises);
            return fitsFilesGenerated;
        });
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            let pixcount = inputPixelsList.length;
            let values = undefined;
            let fitsheaderlist = [];
            let promises = [];
            for (let hipstileno of tilesset) {
                let dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
                console.log(`Identified source file ${fitsurl}`);
                let fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser(fitsurl);
                promises.push(fp.loadFITS().then((fits) => {
                    if (fits === null) {
                        fitsheaderlist.push(undefined);
                    }
                    else {
                        let bytesXelem = Math.abs(fits.header.get("BITPIX") / 8);
                        let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // => ???????
                        if (values === undefined) {
                            values = new Uint8Array(pixcount * bytesXelem);
                        }
                        // console.log(fitsurl + " loaded");
                        fitsheaderlist.push(fits.header);
                        for (let p = 0; p < pixcount; p++) {
                            let imgpx = inputPixelsList[p];
                            if (imgpx.tileno === hipstileno) {
                                // if (imgpx._j < HiPSHelper.DEFAULT_Naxis1_2 && imgpx._i < HiPSHelper.DEFAULT_Naxis1_2) {
                                if (imgpx._j < fits.header.get("NAXIS1") && imgpx._i < fits.header.get("NAXIS2")) {
                                    for (let b = 0; b < bytesXelem; b++) {
                                        values[p * bytesXelem + b] = fits.data[imgpx._j][imgpx._i * bytesXelem + b];
                                    }
                                }
                            }
                        }
                    }
                }));
            }
            yield Promise.all(promises);
            if (fitsheaderlist !== undefined) {
                this.prepareCommonHeader(fitsheaderlist);
            }
            return values;
        });
    }
    computeSquaredNaxes(d, ps) {
        // first aprroximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
    prepareCommonHeader(fitsheaderlist) {
        if (fitsheaderlist === undefined) {
            return;
        }
        if (!this._fh_common) {
            this._fh_common = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
        }
        for (let i = 0; i < fitsheaderlist.length; i++) {
            let header = fitsheaderlist[i];
            if (header !== undefined) {
                for (let item of header.getItemList()) {
                    if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(item.key)) {
                        if (!this._fh_common.getItemListOf(item.key)[0]) {
                            this._fh_common.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem(item.key, item.value));
                        }
                        else if (this._fh_common.getItemListOf(item.key)[0].value !== item.value) { // this should not happen 
                            throw new Error("Error parsing headers. " + item.key + " was " + this._fh_common.getItemListOf(item.key)[0] + " and now is " + item.value);
                        }
                    }
                }
            }
        }
    }
    // // TODO MOVE THIS IN AN UTILITY FILE
    // pixel2Physical(value, bzero, bscale) {
    // 	let pval = bzero + bscale * value;
    // 	return pval;
    // }
    setPxsValue(values, fitsHeaderParams) {
        // let vidx = 0; // <------ ERROR!!!!! pixel are not organized by tile!!!
        // let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;
        let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        if (bytesXelem === undefined || bscale === undefined || bzero === undefined) {
            throw new Error("BITPIX, BSCALE or BZERO are undefined");
        }
        // let minmaxmap = new Array();
        let minmaxmap = new Map();
        let nodata = new Map();
        this._tileslist.forEach((tileno) => {
            // this._pxvalues.set(tileno, new Array(HiPSHelper.DEFAULT_Naxis1_2));  // <- bidimensional
            // for (let row = 0; row < HiPSHelper.DEFAULT_Naxis1_2; row++) {
            this._pxvalues.set(tileno, new Array(this._HIPS_TILE_WIDTH)); // <- bidimensional
            for (let row = 0; row < this._HIPS_TILE_WIDTH; row++) {
                if (this._pxvalues.has(tileno)) {
                    let p = this._pxvalues.get(tileno);
                    if (p !== undefined) {
                        // p[row] = new Uint8Array(HiPSHelper.DEFAULT_Naxis1_2 * bytesXelem);
                        p[row] = new Uint8Array(this._HIPS_TILE_WIDTH * bytesXelem);
                    }
                }
            }
            minmaxmap.set("" + tileno + "", new Array(2));
            nodata.set("" + tileno + "", true);
        });
        let ra;
        let dec;
        let col;
        let row;
        for (let rdidx = 0; rdidx < this._radeclist.length; rdidx++) {
            [ra, dec] = this._radeclist[rdidx];
            let ac = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_4__.fillAstro)(ra, dec, _model_NumberType_js__WEBPACK_IMPORTED_MODULE_7__.NumberType.DEGREES);
            let sc = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_4__.astroToSpherical)(ac);
            let ptg = new healpixjs__WEBPACK_IMPORTED_MODULE_1__.Pointing(null, false, sc.thetaRad, sc.phiRad);
            let pixtileno = this._hp.ang2pix(ptg);
            let xyGridProj = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.setupByTile(pixtileno, this._hp);
            // let rarad = degToRad(ra);
            // let decrad = degToRad(dec);
            // TODO CHECK THIS POINT before it was with ra and dec in radians
            let xy = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.world2intermediate(ac);
            if (this._HIPS_TILE_WIDTH === undefined) {
                throw new Error("this._HIPS_TILE_WIDTH undefined");
            }
            let ij = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.intermediate2pix(xy[0], xy[1], xyGridProj, this._HIPS_TILE_WIDTH);
            col = ij[0];
            row = ij[1];
            for (let b = 0; b < bytesXelem; b++) {
                let byte = values[rdidx * bytesXelem + b];
                // this._pxvalues.get(pixtileno)[row][col * bytesXelem + b] = byte	// <- bidimensional
                if (this._pxvalues.has(pixtileno)) {
                    let p = this._pxvalues.get(pixtileno);
                    if (p !== undefined) {
                        p[row][col * bytesXelem + b] = byte; // <- bidimensional
                    }
                }
                if (nodata.get("" + pixtileno + "")) {
                    if (byte != 0) {
                        nodata.set("" + pixtileno + "", false);
                    }
                }
            }
            let min = minmaxmap.get("" + pixtileno + "")[0];
            let max = minmaxmap.get("" + pixtileno + "")[1];
            if (this._pxvalues.has(pixtileno)) {
                let p = this._pxvalues.get(pixtileno);
                if (p !== undefined) {
                    let valpixb = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.extractPixelValue(0, p[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), fitsHeaderParams.get("BITPIX"));
                    let valphysical = bzero + bscale * valpixb;
                    if (valphysical < min || isNaN(min)) {
                        minmaxmap.get("" + pixtileno + "")[0] = valphysical;
                    }
                    else if (valphysical > max || isNaN(max)) {
                        minmaxmap.get("" + pixtileno + "")[1] = valphysical;
                    }
                }
            }
        }
        // Object.keys(this._pxvalues.keys()).forEach((tileno) => {
        const fhKeys = Array.from(this._pxvalues.keys());
        fhKeys.forEach((tileno) => {
            if (nodata.get("" + tileno + "") == false) { // there are data
                // tileno = parseInt(tileno);
                let header = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
                header.set("NPIX", tileno);
                // TODO CONVERT minval and maxval to physical values!
                // header.addItem(new FITSHeaderItem("DATAMIN", minmaxmap["" + tileno + ""][0]));
                // header.addItem(new FITSHeaderItem("DATAMAX", minmaxmap["" + tileno + ""][1]));
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMIN", minmaxmap.get("" + tileno + "")[0]));
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMAX", minmaxmap.get("" + tileno + "")[1]));
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NPIX", tileno));
                let vec3 = this._hp.pix2vec(tileno);
                let ptg = new healpixjs__WEBPACK_IMPORTED_MODULE_1__.Pointing(vec3);
                let crval1 = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_4__.radToDeg)(ptg.phi);
                let crval2 = 90 - (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_4__.radToDeg)(ptg.theta);
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRVAL1", crval1));
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRVAL2", crval2));
                this._fitsheaderlist.push(header);
            }
            else { // no data
                // this._pxvalues.delete(parseInt(tileno));
                this._pxvalues.delete(tileno);
                // delete this._pxvalues["" + tileno + ""];
            }
        });
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;
    }
    getImageRADecList(center, radiusDeg) {
        let ptg = new healpixjs__WEBPACK_IMPORTED_MODULE_1__.Pointing(null, false, center.spherical.thetaRad, center.spherical.phiRad);
        let radius_rad = (0,_model_Utils_js__WEBPACK_IMPORTED_MODULE_4__.degToRad)(radiusDeg);
        // with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        let rangeset = this._hp.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
        this._tileslist = [];
        for (let p = 0; p < rangeset.r.length; p++) {
            if (!this._tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                this._tileslist.push(rangeset.r[p]);
            }
        }
        let cpix = this._hp.ang2pix(ptg);
        if (!this._tileslist.includes(cpix)) {
            this._tileslist.push(cpix);
        }
        let minra = center.astro.raDeg - radiusDeg;
        let maxra = center.astro.raDeg + radiusDeg;
        let mindec = center.astro.decDeg - radiusDeg;
        let maxdec = center.astro.decDeg + radiusDeg;
        this._tileslist.forEach((tileno) => {
            this._xyGridProj = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.setupByTile(tileno, this._hp);
            // for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
            // 	for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
            for (let j = 0; j < this._HIPS_TILE_WIDTH; j++) {
                for (let i = 0; i < this._HIPS_TILE_WIDTH; i++) {
                    let p = this.pix2world(i, j);
                    if (p.astro.raDeg < minra || p.astro.raDeg > maxra ||
                        p.astro.decDeg < mindec || p.astro.decDeg > maxdec) {
                        continue;
                    }
                    this._radeclist.push([p.astro.raDeg, p.astro.decDeg]);
                }
            }
        });
        return this._radeclist;
    }
    pix2world(i, j) {
        let xy = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.pix2intermediate(i, j, this._xyGridProj, this._naxis1, this._naxis2);
        // TODO CHECK BELOW before it was only which is supposed to be wrong since intermediate2world returns SphericalCoords, not AstroCoords
        /**
        let raDecDeg = HiPSHelper.intermediate2world(xy[0], xy[1]);
        if (raDecDeg[0] > 360){
            raDecDeg[0] -= 360;
        }
        return raDecDeg;
        */
        let p = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.intermediate2world(xy[0], xy[1]);
        // if (p.spherical.phiDeg > 360){
        // 	sc.phiDeg -= 360;
        // }
        return p;
    }
    world2pix(radeclist) {
        // let imgpxlist = new ImagePixel[radeclist.length];
        let imgpxlist = [];
        let tileno;
        let prevTileno = undefined;
        // let k = 0;
        radeclist.forEach(([ra, dec]) => {
            let p = new _model_Point_js__WEBPACK_IMPORTED_MODULE_5__.Point(_model_CoordsType_js__WEBPACK_IMPORTED_MODULE_6__.CoordsType.ASTRO, _model_NumberType_js__WEBPACK_IMPORTED_MODULE_7__.NumberType.DEGREES, ra, dec);
            // let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
            let ptg = new healpixjs__WEBPACK_IMPORTED_MODULE_1__.Pointing(null, false, p.spherical.thetaRad, p.spherical.phiRad);
            tileno = this._hp.ang2pix(ptg);
            if (prevTileno !== tileno || prevTileno === undefined) {
                this._xyGridProj = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.setupByTile(tileno, this._hp);
                prevTileno = tileno;
            }
            // let rarad =  HiPSHelper.degToRad(ra);
            // let decrad = HiPSHelper.degToRad(dec);
            let xy = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.world2intermediate(p.astro);
            if (this._HIPS_TILE_WIDTH === undefined) {
                throw new Error("this._HIPS_TILE_WIDTH undefined");
            }
            let ij = _HiPSHelper_js__WEBPACK_IMPORTED_MODULE_2__.HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj, this._HIPS_TILE_WIDTH);
            imgpxlist.push(new _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_3__.ImagePixel(ij[0], ij[1], tileno));
        });
        return imgpxlist;
    }
}


/***/ }),

/***/ "./src/projections/MercatorProjection.ts":
/*!***********************************************!*\
  !*** ./src/projections/MercatorProjection.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MercatorProjection": () => (/* binding */ MercatorProjection)
/* harmony export */ });
/* harmony import */ var jsfitsio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsfitsio */ "../FITSParser/lib-esm/index.js");
/* harmony import */ var _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/ImagePixel.js */ "./src/model/ImagePixel.ts");
/* harmony import */ var _model_Point_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../model/Point.js */ "./src/model/Point.ts");
/* harmony import */ var _model_CoordsType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/CoordsType.js */ "./src/model/CoordsType.ts");
/* harmony import */ var _model_NumberType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../model/NumberType.js */ "./src/model/NumberType.ts");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! process */ "?2937");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(process__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};









class MercatorProjection {
    constructor() {
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        this._pxvalues = new Map();
        this._fitsheader = new Array();
    }
    initFromFile(infile) {
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser(infile);
            this._infile = infile;
            let promise = fp.loadFITS().then(fits => {
                // console.log(fits.header);
                this._pxvalues.set(0, fits.data);
                this._fitsheader[0] = fits.header;
                this._naxis1 = fits.header.get("NAXIS1");
                this._naxis2 = fits.header.get("NAXIS2");
                this._craDeg = fits.header.getItemListOf("CRVAL1")[0].value;
                this._cdecDeg = fits.header.getItemListOf("CRVAL2")[0].value;
                // TODO CDELT could not be present. In this is the case, 
                // there should be CDi_ja, but I am not handling them atm
                // [Ref. Representation of celestial coordinates in FITS - equation (1)]
                // this._pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value as number;
                // this._pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value as number;
                const pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value;
                const pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value;
                if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
                    throw new Error("pxsize1 is not equal to pxsize2");
                    process__WEBPACK_IMPORTED_MODULE_5__.exit;
                }
                this._pxsize = pxsize1;
                // this._minra = this._craDeg - this._pxsize1 * this._naxis1 / 2;
                this._minra = this._craDeg - this._pxsize * this._naxis1 / 2;
                if (this._minra < 0) {
                    this._minra += 360;
                }
                // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
                this._mindec = this._cdecDeg - this._pxsize * this._naxis2 / 2;
                return fits;
            });
            yield promise;
            return promise;
        });
    }
    extractPhysicalValues(fits) {
        let bzero = fits.header.get("BZERO");
        let bscale = fits.header.get("BSCALE");
        let naxis1 = fits.header.get("NAXIS1");
        let naxis2 = fits.header.get("NAXIS2");
        let bitpix = fits.header.get("BITPIX");
        let bytesXelem = Math.abs(bitpix / 8);
        let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // TODO => ??????? Im not using it. it should be used!
        // let physicalvalues = new Array[naxis2][naxis1];
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                let pixval = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                let physicalVal = bzero + bscale * pixval;
                physicalvalues[n2][n1] = physicalVal;
            }
        }
        return physicalvalues;
    }
    prepareFITSHeader(fitsHeaderParams) {
        this._fitsheader[0] = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
        this._fitsheader[0].addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
        this._fitsheader[0].addItemAtTheBeginning(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));
        if (fitsHeaderParams.get("BLANK") !== undefined) {
            this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
        }
        let bscale = 1.0;
        if (fitsHeaderParams.get("BSCALE") !== undefined) {
            bscale = fitsHeaderParams.get("BSCALE");
        }
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BSCALE", bscale));
        let bzero = 0.0;
        if (fitsHeaderParams.get("BZERO") !== undefined) {
            bzero = fitsHeaderParams.get("BZERO");
        }
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("BZERO", bzero));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS", 2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS1", this._naxis1));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("NAXIS2", this._naxis2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CTYPE1", this._ctype1));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CTYPE2", this._ctype2));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CDELT1", this._pxsize)); // ??? Pixel spacing along axis 1 ???
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CDELT2", this._pxsize)); // ??? Pixel spacing along axis 2 ???
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRPIX1", this._naxis1 / 2)); // central/reference pixel i along naxis1
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRPIX2", this._naxis2 / 2)); // central/reference pixel j along naxis2
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRVAL1", this._craDeg)); // central/reference pixel RA
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("CRVAL2", this._cdecDeg)); // central/reference pixel Dec
        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMIN", min)); // min data value
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMAX", max)); // max data value
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        this._fitsheader[0].addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("END"));
        return this._fitsheader;
    }
    getFITSHeader() {
        return this._fitsheader;
    }
    getCommonFitsHeaderParams() {
        let header = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
        for (const [key, value] of this._fitsheader[0]) {
            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                header.addItem(new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem(key, value));
            }
        }
        return header;
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = new Promise((resolve, reject) => {
                try {
                    let bytesXelem = Math.abs(this._fitsheader[0].get("BITPIX") / 8);
                    let blankBytes = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.convertBlankToBytes(this._fitsheader[0].get("BLANK"), bytesXelem);
                    let pixcount = inputPixelsList.length;
                    let values = new Uint8Array(pixcount * bytesXelem);
                    for (let p = 0; p < pixcount; p++) {
                        let imgpx = inputPixelsList[p];
                        // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                        // TODO why I am getting negative i and j? check world2pix!!!
                        if ((imgpx._j) < 0 || (imgpx._j) >= this._naxis2 ||
                            (imgpx._i) < 0 || (imgpx._i) >= this._naxis1) {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = blankBytes[b];
                            }
                        }
                        else {
                            let pv = this._pxvalues.get(0);
                            if (pv !== undefined) {
                                for (let b = 0; b < bytesXelem; b++) {
                                    values[p * bytesXelem + b] = pv[imgpx._j][(imgpx._i) * bytesXelem + b];
                                }
                            }
                        }
                    }
                    resolve(values);
                }
                catch (err) {
                    reject("[MercatorProjection] ERROR: " + err);
                }
            });
            return promise;
        });
    }
    computeSquaredNaxes(d, ps) {
        // first aprroximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
    setPxsValue(values, fitsHeaderParams) {
        let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        let minpixb = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), fitsHeaderParams.get("BITPIX"));
        let maxpixb = minpixb;
        let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        this._minphysicalval = bzero + bscale * minpixb;
        this._maxphysicalval = bzero + bscale * maxpixb;
        // this._pxvalues = new Array(this._naxis2);
        // for (let r = 0; r < this._naxis2; r++) {
        //     this._pxvalues[r] = new Uint8Array(this._naxis1 * bytesXelem);
        // }
        // this._pxvalues.set(0, new Uint8Array[this._naxis2][this._naxis1 * bytesXelem]);
        this._pxvalues.set(0, new Array(this._naxis2));
        let pv = this._pxvalues.get(0);
        if (pv !== undefined) {
            for (let r = 0; r < this._naxis2; r++) {
                pv[r] = new Uint8Array(this._naxis1 * bytesXelem);
            }
            let r;
            let c;
            let b;
            for (let p = 0; (p * bytesXelem) < values.length; p++) {
                // console.log("processing "+p + " of "+ (values.length / bytesXelem));
                try {
                    r = Math.floor(p / this._naxis1);
                    c = (p - r * this._naxis1) * bytesXelem;
                    for (b = 0; b < bytesXelem; b++) {
                        pv[r][c + b] = values[p * bytesXelem + b];
                    }
                    let valpixb = jsfitsio__WEBPACK_IMPORTED_MODULE_0__.ParseUtils.extractPixelValue(0, values.slice(p * bytesXelem, (p * bytesXelem) + bytesXelem), fitsHeaderParams.get("BITPIX"));
                    let valphysical = bzero + bscale * valpixb;
                    if (valphysical < this._minphysicalval || isNaN(this._minphysicalval)) {
                        this._minphysicalval = valphysical;
                    }
                    else if (valphysical > this._maxphysicalval || isNaN(this._maxphysicalval)) {
                        this._maxphysicalval = valphysical;
                    }
                }
                catch (err) {
                    console.log(err);
                    console.log("p " + p);
                    console.log("r %, c %, b %" + r, c, b);
                    console.log("this._pxvalues[r][c + b] " + pv[r][c + b]);
                    console.log("values[p * bytesXelem + b] " + values[p * bytesXelem + b]);
                }
            }
        }
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;
    }
    getImageRADecList(center, radius, pxsize) {
        this.computeSquaredNaxes(2 * radius, pxsize); // compute naxis[1, 2]
        this._pxsize = pxsize;
        this._minra = center.astro.raDeg - radius;
        if (this._minra < 0) {
            this._minra += 360;
        }
        this._mindec = center.astro.decDeg - radius;
        let radeclist = new Array();
        for (let d = 0; d < this._naxis2; d++) {
            for (let r = 0; r < this._naxis1; r++) {
                radeclist.push([this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
            }
        }
        let cidx = (this._naxis2 / 2 - 1) * this._naxis1 + this._naxis1 / 2;
        this._craDeg = radeclist[cidx][0];
        this._cdecDeg = radeclist[cidx][1];
        return radeclist;
    }
    // getImageRADecList(center: AstroCoords, radius: number, pxsize: number): Promise<number[][]> {
    //     let promise = new Promise<[]> ( (resolve, reject) => {
    //         this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]
    //         this._pxsize = pxsize;
    //         this._minra = center.raDeg - radius;
    //         if (this._minra < 0) {
    //             this._minra += 360;
    //         }
    //         this._mindec = center.decDeg - radius;
    //         let radeclist:number[][] = new Array<Array<number>>();
    //         for (let d = 0; d < this._naxis2; d++) {
    //             for (let r = 0; r < this._naxis1; r++) {
    //                 radeclist.push([ this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
    //             }    
    //         }
    //         let cidx = (this._naxis2/2 - 1) * this._naxis1 +  this._naxis1/2;
    //         this._craDeg = radeclist[ cidx ][0];
    //         this._cdecDeg = radeclist[ cidx ][1];
    //         resolve(radeclist);
    //     });
    //     return promise;
    // }
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i, j) {
        let ra;
        let dec;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * this._pxsize + this._minra;
        dec = j * this._pxsize + this._mindec;
        let p = new _model_Point_js__WEBPACK_IMPORTED_MODULE_2__.Point(_model_CoordsType_js__WEBPACK_IMPORTED_MODULE_3__.CoordsType.ASTRO, _model_NumberType_js__WEBPACK_IMPORTED_MODULE_4__.NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];
    }
    // world2pix (radeclist: number[][]): Promise<ImagePixel[]> {
    //     let promise = new Promise<ImagePixel[]> ( (resolve, reject) => {
    //         this.initFromFile(this._infile).then( (data) => {
    //             let imgpxlist = [];
    //             for (let radecItem of radeclist) {
    //                 let ra = radecItem[0];
    //                 let dec = radecItem[1];
    //                 let i = Math.floor((ra - this._minra) / this._pxsize1);
    //                 let j = Math.floor((dec - this._mindec) / this._pxsize2);
    //                 imgpxlist.push(new ImagePixel(i, j));
    //             }
    //             resolve(imgpxlist);
    //         });
    //     });
    //     return promise;
    // }
    world2pix(radeclist) {
        let imgpxlist = [];
        for (let radecItem of radeclist) {
            let ra = radecItem[0];
            let dec = radecItem[1];
            // let i = Math.floor((ra - this._minra) / this._pxsize1);
            // let j = Math.floor((dec - this._mindec) / this._pxsize2);
            let i = Math.floor((ra - this._minra) / this._pxsize);
            let j = Math.floor((dec - this._mindec) / this._pxsize);
            imgpxlist.push(new _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_1__.ImagePixel(i, j));
        }
        return imgpxlist;
    }
}


/***/ }),

/***/ "./src/projections/TestProj.ts":
/*!*************************************!*\
  !*** ./src/projections/TestProj.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TestProj": () => (/* binding */ TestProj)
/* harmony export */ });
/* harmony import */ var jsfitsio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsfitsio */ "../FITSParser/lib-esm/index.js");
// import { FITSParser } from 'fitsparser/FITSParser-node';
// import { FITSHeader } from 'fitsparser/model/FITSHeader';
// import { FITSHeaderItem } from 'fitsparser/model/FITSHeaderItem';
// import { FITSParsed } from 'fitsparser/model/FITSParsed';



class TestProj {
    constructor() {
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        this._pxvalues = new Map();
        const fh = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
        const fp = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSParser("./notexistent/");
        const fhi = new jsfitsio__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("mykey", "myvalue", "mycomment");
    }
    initFromFile(fitsfilepath, hipsURI, pxsize, order) {
        throw new Error('Method not implemented.');
    }
    prepareFITSHeader(fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getFITSHeader() {
        throw new Error('Method not implemented.');
    }
    getCommonFitsHeaderParams() {
        throw new Error('Method not implemented.');
    }
    extractPhysicalValues(fits) {
        throw new Error('Method not implemented.');
    }
    getPixValues(inputPixelsList) {
        throw new Error('Method not implemented.');
    }
    computeSquaredNaxes(d, ps) {
        throw new Error('Method not implemented.');
    }
    setPxsValue(values, fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getImageRADecList(center, radius, pxsize) {
        throw new Error('Method not implemented.');
    }
    pix2world(i, j) {
        throw new Error('Method not implemented.');
    }
    world2pix(radeclist) {
        throw new Error('Method not implemented.');
    }
}


/***/ }),

/***/ "?2937":
/*!*************************!*\
  !*** process (ignored) ***!
  \*************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "../FITSParser/lib-esm/FITSParser.js":
/*!*******************************************!*\
  !*** ../FITSParser/lib-esm/FITSParser.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FITSParser": () => (/* binding */ FITSParser)
/* harmony export */ });
/* harmony import */ var _FITSWriter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FITSWriter.js */ "../FITSParser/lib-esm/FITSWriter.js");
/* harmony import */ var _ParsePayload_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ParsePayload.js */ "../FITSParser/lib-esm/ParsePayload.js");
/* harmony import */ var _ParseHeader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ParseHeader.js */ "../FITSParser/lib-esm/ParseHeader.js");
/**

 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



// import fetch from 'cross-fetch';
// import { readFile } from "node:fs/promises";
class FITSParser {
    constructor(url) {
        this._url = url;
    }
    loadFITS() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getFile(this._url)
                .then((rawdata) => {
                if (rawdata !== null && rawdata.byteLength > 0) {
                    const uint8 = new Uint8Array(rawdata);
                    const fits = this.processFits(uint8);
                    return fits;
                }
                return null;
            })
                .catch((error) => {
                var _a, _b;
                if ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) {
                    throw new Error("[FITSParser->loadFITS] " + error.response.data.message);
                }
                throw error;
            });
        });
    }
    processFits(rawdata) {
        const header = _ParseHeader_js__WEBPACK_IMPORTED_MODULE_2__.ParseHeader.parse(rawdata);
        const payloadParser = new _ParsePayload_js__WEBPACK_IMPORTED_MODULE_1__.ParsePayload(header, rawdata);
        const pixelvalues = payloadParser.parse();
        // if (rawdata.length > (header.getNumRows() + (pixelvalues.length * pixelvalues[0].length))) {
        // let leftover = rawdata.length - (header.getNumRows() + (pixelvalues.length * pixelvalues[0].length));
        // 	throw new Error("[FITSParser->processFits] It seems that there's at least one more HDU since there are " + leftover + " bytes not processed.");
        // 	console.warn("It seems that there's at least one more HDU since there are " + leftover + " bytes not processed.")
        // }
        return {
            header: header,
            data: pixelvalues,
        };
    }
    static generateFITS(header, rawdata) {
        const writer = new _FITSWriter_js__WEBPACK_IMPORTED_MODULE_0__.FITSWriter();
        writer.run(header, rawdata);
        return writer.typedArrayToURL();
    }
    getFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            if (!uri.substring(0, 5).toLowerCase().includes("http")) {
                let p = yield __webpack_require__.e(/*! import() */ "FITSParser_lib-esm_getLocalFile_js").then(__webpack_require__.bind(__webpack_require__, /*! ./getLocalFile.js */ "../FITSParser/lib-esm/getLocalFile.js"));
                data = yield p.getLocalFile(uri);
            }
            else {
                let p = yield Promise.all(/*! import() */[__webpack_require__.e("vendors-FITSParser_node_modules_cross-fetch_dist_browser-ponyfill_js"), __webpack_require__.e("FITSParser_lib-esm_getFile_js")]).then(__webpack_require__.bind(__webpack_require__, /*! ./getFile.js */ "../FITSParser/lib-esm/getFile.js"));
                data = yield p.getFile(uri);
            }
            return data;
        });
    }
}
//# sourceMappingURL=FITSParser.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/FITSWriter.js":
/*!*******************************************!*\
  !*** ../FITSParser/lib-esm/FITSWriter.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FITSWriter": () => (/* binding */ FITSWriter)
/* harmony export */ });
/* harmony import */ var blob_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! blob-polyfill */ "../FITSParser/node_modules/blob-polyfill/Blob.js");
/* harmony import */ var _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/FITSHeaderItem.js */ "../FITSParser/lib-esm/model/FITSHeaderItem.js");
/* harmony import */ var _ParseUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ParseUtils.js */ "../FITSParser/lib-esm/ParseUtils.js");
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * import GnomonicProjection from './GnomonicProjection';
 * BITPIX definition from https://archive.stsci.edu/fits/fits_standard/node39.html
 * and "Definition of the Flexible Image Transport System (FITS)" standard document
 * defined by FITS Working Group from the International Astronomical Union
 * http://fits.gsfc.nasa.gov/iaufwg/
 * 8	8-bit Character or unsigned binary integer
 * 16	16-bit twos-complement binary integer
 * 32	32-bit twos-complement binary integer
 * -32	32-bit IEEE single precision floating point
 * -64	64-bit IEEE double precision floating point
 *
 */



// import fs from 'node:fs/promises';
class FITSWriter {
    constructor() {
        this._headerArray = new Uint8Array();
        this._payloadArray = new Array();
        this._fitsData = new Uint8Array();
    }
    run(header, rawdata) {
        this.prepareHeader(header);
        this._payloadArray = rawdata;
        this.prepareFITS();
    }
    prepareHeader(headerDetails) {
        const item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("END");
        headerDetails.addItem(item);
        let str = "";
        for (let i = 0; i < headerDetails.getItemList().length; i++) {
            const item = headerDetails.getItemList()[i];
            let s = this.formatHeaderLine(item);
            if (s !== undefined) {
                str += s;
            }
        }
        const strBytelen = new TextEncoder().encode(str).length;
        const nhdu = Math.ceil(strBytelen / 2880);
        const offset = nhdu * 2880;
        for (let j = 0; j < offset - strBytelen; j++) {
            str += " ";
        }
        const ab = new ArrayBuffer(str.length);
        // Javascript character occupies 2 16-bit -> reducing it to 1 byte
        this._headerArray = new Uint8Array(ab);
        for (let i = 0; i < str.length; i++) {
            this._headerArray[i] = _ParseUtils_js__WEBPACK_IMPORTED_MODULE_2__.ParseUtils.getByteAt(str, i);
        }
    }
    // formatHeaderLine(item: string | undefined, value: string | number, comment: string) {
    formatHeaderLine(item) {
        let str;
        let keyword = item.key;
        let value = item.value;
        let comment = item.comment;
        if (keyword !== null && keyword !== undefined) {
            str = keyword;
            if (keyword == "END") {
                for (let j = 80; j > keyword.length; j--) {
                    str += " ";
                }
                return str;
            }
            if (keyword == "COMMENT" || keyword == "HISTORY") {
                for (let i = 0; i < 10 - keyword.length; i++) {
                    str += " ";
                }
                str += value;
                const len = str.length;
                for (let j = 80; j > len; j--) {
                    str += " ";
                }
                return str;
            }
            for (let i = 0; i < 8 - keyword.length; i++) {
                str += " ";
            }
            str += "= ";
            if (value !== null && value !== undefined) {
                // value
                str += value;
                if (comment !== null && comment !== undefined) {
                    str += comment;
                }
                const len = str.length;
                for (let j = 80; j > len; j--) {
                    str += " ";
                }
            }
            else {
                if (comment !== null && comment !== undefined) {
                    str += comment;
                }
                const len = str.length;
                for (let j = 80; j > len; j--) {
                    str += " ";
                }
            }
        }
        else {
            // keyword null
            str = "";
            for (let j = 0; j < 18; j++) {
                str += " ";
            }
            if (comment !== null && comment !== undefined) {
                str += comment;
                const len = str.length;
                for (let j = 80; j > len; j--) {
                    str += " ";
                }
            }
            else {
                str = "";
                for (let j = 80; j > 0; j--) {
                    str += " ";
                }
            }
        }
        return str;
    }
    prepareFITS() {
        const bytes = new Uint8Array(this._headerArray.length +
            this._payloadArray[0].length * this._payloadArray.length);
        bytes.set(this._headerArray, 0);
        for (let i = 0; i < this._payloadArray.length; i++) {
            const uint8 = this._payloadArray[i];
            bytes.set(uint8, this._headerArray.length + i * uint8.length);
        }
        this._fitsData = bytes;
    }
    // writeFITS(fileuri: string) {
    //   // const dirname = path.dirname(fileuri);
    //   // fs.mkdir(dirname, { recursive: true });
    //   fs.writeFile(fileuri, this._fitsData);
    //   // if (fs.existsSync(dirname)) {
    //   //   fs.writeFileSync(fileuri, this._fitsData);
    //   // } else {
    //   //   console.error(dirname + " doesn't exist");
    //   // }
    // }
    typedArrayToURL() {
        const b = new blob_polyfill__WEBPACK_IMPORTED_MODULE_0__.Blob([this._fitsData], { type: "application/fits" });
        // console.log(`<html><body><img src='${URL.createObjectURL(b)}'</body></html>`);
        return URL.createObjectURL(b);
    }
}
//# sourceMappingURL=FITSWriter.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/ParseHeader.js":
/*!********************************************!*\
  !*** ../FITSParser/lib-esm/ParseHeader.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParseHeader": () => (/* binding */ ParseHeader)
/* harmony export */ });
/* harmony import */ var _model_FITSHeader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/FITSHeader.js */ "../FITSParser/lib-esm/model/FITSHeader.js");
/* harmony import */ var _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/FITSHeaderItem.js */ "../FITSParser/lib-esm/model/FITSHeaderItem.js");


/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class ParseHeader {
    static parse(rawdata) {
        // only one header block (2880) allowed atm.
        // TODO handle multiple header blocks
        // let headerByteData = new Uint8Array(rawdata, 0, 2880);
        const textDecoder = new TextDecoder("iso-8859-1");
        const header = new _model_FITSHeader_js__WEBPACK_IMPORTED_MODULE_0__.FITSHeader();
        let nline = 0;
        let key = "";
        let val;
        let u8line;
        let u8key;
        let u8val;
        let u8ind;
        // let ind: string;
        let item;
        let fitsLine;
        item = null;
        while (key !== "END" && rawdata.length > 0) {
            // line 80 characters
            u8line = new Uint8Array(rawdata.slice(nline * 80, nline * 80 + 80));
            nline++;
            // key
            u8key = new Uint8Array(u8line.slice(0, 8));
            key = textDecoder.decode(u8key).trim();
            // value indicator
            u8ind = new Uint8Array(u8line.slice(8, 10));
            // ind = textDecoder.decode(u8ind);
            // reading value
            u8val = new Uint8Array(u8line.slice(10, 80));
            val = textDecoder.decode(u8val).trim();
            if (u8ind[0] == 61 && u8ind[1] == 32) {
                let firstchar = 32;
                for (let i = 0; i < u8val.length; i++) {
                    if (u8val[i] != 32) {
                        firstchar = u8val[i];
                        break;
                    }
                }
                if (firstchar == 39 || !Number(val)) {
                    // value starts with '
                    // [ival, icomment]
                    fitsLine = ParseHeader.parseStringValue(u8val);
                }
                else {
                    if (firstchar == 84 || firstchar == 70) {
                        // T or F
                        fitsLine = ParseHeader.parseLogicalValue(u8val);
                    }
                    else {
                        val = textDecoder.decode(u8val).trim();
                        if (val.includes(".")) {
                            fitsLine = ParseHeader.parseFloatValue(u8val);
                        }
                        else {
                            fitsLine = ParseHeader.parseIntValue(u8val);
                        }
                    }
                }
                item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem(key, fitsLine.val, fitsLine.comment);
            }
            else {
                if (key == "COMMENT" || key == "HISTORY") {
                    item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem(key, undefined, val);
                }
                else {
                    let firstchar = 32;
                    for (let i = 0; i < u8val.length; i++) {
                        if (u8val[i] != 32) {
                            firstchar = u8val[i];
                            break;
                        }
                    }
                    if (firstchar == 47) {
                        // single / this is the case when no key nor value indicator is defined
                        item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem(undefined, undefined, val);
                    }
                    else if (firstchar == 32) {
                        // case when there's a line with only spaces
                        item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem(undefined, undefined, undefined);
                    }
                }
            }
            if (item != null) {
                header.addItem(item);
            }
        }
        item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("COMMENT", "FITS generated with FITSParser on ", undefined);
        header.addItem(item);
        const now = new Date();
        item = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeaderItem("COMMENT", now.toString());
        header.addItem(item);
        const nblock = Math.ceil(nline / 36);
        const offset = nblock * 2880;
        header.offset = offset;
        return header;
    }
    static parseStringValue(u8buffer) {
        const textDecoder = new TextDecoder("iso-8859-1");
        const decoded = textDecoder.decode(u8buffer).trim();
        const idx = decoded.lastIndexOf("/");
        const val = decoded.substring(0, idx);
        let comment = decoded.substring(idx);
        // if (comment === undefined) {
        //   comment = null;
        // }
        return {
            val: val,
            comment: comment,
        };
    }
    static parseLogicalValue(u8buffer) {
        const textDecoder = new TextDecoder("iso-8859-1");
        const val = textDecoder.decode(u8buffer).trim();
        const tokens = val.split("/");
        if (tokens[1] === undefined) {
            return {
                val: tokens[0].trim(),
                comment: undefined,
            };
        }
        return {
            val: tokens[0].trim(),
            comment: " /" + tokens[1],
        };
    }
    static parseIntValue(u8buffer) {
        const textDecoder = new TextDecoder("iso-8859-1");
        const val = textDecoder.decode(u8buffer).trim();
        const tokens = val.split("/");
        if (tokens[1] === undefined) {
            return {
                val: parseInt(tokens[0].trim()),
                comment: undefined,
            };
        }
        return {
            val: parseInt(tokens[0].trim()),
            comment: " /" + tokens[1],
        };
    }
    static parseFloatValue(u8buffer) {
        const textDecoder = new TextDecoder("iso-8859-1");
        const val = textDecoder.decode(u8buffer).trim();
        const tokens = val.split("/");
        if (tokens[1] === undefined) {
            return {
                val: parseFloat(tokens[0].trim()),
                comment: undefined,
            };
        }
        return {
            val: parseFloat(tokens[0].trim()),
            comment: " /" + tokens[1],
        };
    }
}
//# sourceMappingURL=ParseHeader.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/ParsePayload.js":
/*!*********************************************!*\
  !*** ../FITSParser/lib-esm/ParsePayload.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParsePayload": () => (/* binding */ ParsePayload)
/* harmony export */ });
/* harmony import */ var _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/FITSHeaderItem.js */ "../FITSParser/lib-esm/model/FITSHeaderItem.js");
/* harmony import */ var _ParseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ParseUtils.js */ "../FITSParser/lib-esm/ParseUtils.js");
// "use strict";


// let colorsMap = new Map();
// colorsMap.set("grayscale","grayscale");
// colorsMap.set("planck","planck");
// colorsMap.set("eosb","eosb");
// colorsMap.set("rainbow","rainbow");
// colorsMap.set("cmb","cmb");
// colorsMap.set("cubehelix","cubehelix");
class ParsePayload {
    constructor(fitsheader, rawdata) {
        this._u8data = new Uint8Array();
        this._BZERO = undefined;
        this._BSCALE = undefined;
        this._BLANK = undefined;
        this._BITPIX = undefined;
        this._NAXIS1 = undefined;
        this._NAXIS2 = undefined;
        this._DATAMIN = undefined;
        this._DATAMAX = undefined;
        this._physicalblank = undefined;
        const buffer = rawdata.slice(fitsheader.offset);
        this._u8data = new Uint8Array(buffer);
        this.init(fitsheader);
    }
    init(fitsheader) {
        this._BZERO = fitsheader.get("BZERO");
        if (this._BZERO === undefined) {
            this._BZERO = 0;
        }
        this._BSCALE = fitsheader.get("BSCALE");
        if (this._BSCALE === undefined) {
            this._BSCALE = 1;
        }
        this._BLANK = fitsheader.get("BLANK"); // undefined in case it's not present in the header
        // this._BLANK_pv = this._BZERO + this._BSCALE * this._BLANK || undefined;
        this._BITPIX = fitsheader.get("BITPIX");
        this._NAXIS1 = fitsheader.get("NAXIS1");
        this._NAXIS2 = fitsheader.get("NAXIS2");
        this._DATAMIN = fitsheader.get("DATAMIN");
        this._DATAMAX = fitsheader.get("DATAMAX");
        this._physicalblank = undefined;
        if (this._DATAMAX === undefined || this._DATAMIN === undefined) {
            const [min, max] = this.computePhysicalMinAndMax();
            this._DATAMAX = max;
            this._DATAMIN = min;
            const maxitem = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMAX", max, " / computed with FITSParser");
            const minitem = new _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem("DATAMIN", min, " / computed with FITSParser");
            fitsheader.addItem(maxitem);
            fitsheader.addItem(minitem);
            // fitsheader.set("DATAMAX", max);
            // fitsheader.set("DATAMIN", min);
        }
        // let item = new FITSHeaderItem("END", null, null);
        // fitsheader.addItem(item);
    }
    computePhysicalMinAndMax() {
        let i = 0;
        if (this._BITPIX === undefined) {
            throw new Error("BITPIX is not defined");
        }
        const bytesXelem = Math.abs(this._BITPIX / 8);
        const pxLength = this._u8data.byteLength / bytesXelem;
        let px_val, ph_val;
        let min = undefined;
        let max = undefined;
        if (this._BLANK !== undefined) {
            this._physicalblank = this.pixel2physicalValue(this._BLANK);
        }
        while (i < pxLength) {
            // px_val = this.extractPixelValue(bytesXelem*i);
            px_val = this.extractPixelValue(bytesXelem * i);
            if (px_val === undefined) {
                i++;
                continue;
            }
            ph_val = this.pixel2physicalValue(px_val);
            if (min === undefined) {
                min = ph_val;
            }
            if (max === undefined) {
                max = ph_val;
            }
            //TODO check below if
            if (this._physicalblank === undefined || this._physicalblank !== ph_val) {
                if (ph_val !== undefined && (ph_val < min || min === undefined)) {
                    min = ph_val;
                }
                if (ph_val !== undefined && (ph_val > max || max === undefined)) {
                    max = ph_val;
                }
            }
            i++;
        }
        return [min, max];
    }
    parse() {
        // let px_val; // pixel array value
        // let ph_val = undefined; // pixel physical value
        if (this._BITPIX === undefined) {
            throw new Error("BITPIX is undefined");
        }
        if (this._NAXIS1 === undefined) {
            throw new Error("NAXIS1 is undefined");
        }
        if (this._NAXIS2 === undefined) {
            throw new Error("NAXIS2 is undefined");
        }
        const bytesXelem = Math.abs(this._BITPIX / 8);
        let pxLength = this._u8data.byteLength / bytesXelem;
        pxLength = this._NAXIS1 * this._NAXIS2;
        let k = 0;
        let c, r;
        const pixelvalues = [];
        //  let pixv, pv;
        while (k < pxLength) {
            r = Math.floor(k / this._NAXIS1); // row
            c = (k - r * this._NAXIS1) * bytesXelem; // col
            if (c === 0) {
                pixelvalues[r] = new Uint8Array(this._NAXIS1 * bytesXelem);
            }
            // px_val = this.extractPixelValue(bytesXelem * k);
            // ph_val = this.pixel2physicalValue(px_val);
            // TODO check if ph_val == blank
            // if not then use ph_val to compute datamin and datamax
            for (let i = 0; i < bytesXelem; i++) {
                pixelvalues[r][c + i] = this._u8data[k * bytesXelem + i];
            }
            // if (k == 232) {
            // 	pixv = this.extractPixelValue(k * bytesXelem);
            // 	pv = this._BZERO + this._BSCALE * pixv;
            // }
            k++;
        }
        return pixelvalues;
    }
    /** this can be deleted */
    extractPixelValue(offset) {
        let px_val = undefined; // pixel value
        if (this._BITPIX == 16) {
            // 16-bit 2's complement binary integer
            px_val = _ParseUtils_js__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.parse16bit2sComplement(this._u8data[offset], this._u8data[offset + 1]);
        }
        else if (this._BITPIX == 32) {
            // IEEE 754 half precision (float16) ??
            px_val = _ParseUtils_js__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.parse32bit2sComplement(this._u8data[offset], this._u8data[offset + 1], this._u8data[offset + 2], this._u8data[offset + 3]);
        }
        else if (this._BITPIX == -32) {
            // 32-bit IEEE single-precision floating point
            // px_val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this._u8data[offset], this._u8data[offset+1], this._u8data[offset+2], this._u8data[offset+3]);
            px_val = _ParseUtils_js__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.parseFloatingPointFormat(this._u8data.slice(offset, offset + 4), 8, 23);
        }
        else if (this._BITPIX == 64) {
            // 64-bit 2's complement binary integer
            throw new Error("BITPIX=64 -> 64-bit 2's complement binary integer NOT supported yet.");
        }
        else if (this._BITPIX == -64) {
            // 64-bit IEEE double-precision floating point
            //https://babbage.cs.qc.cuny.edu/ieee-754.old/Decimal.html
            px_val = _ParseUtils_js__WEBPACK_IMPORTED_MODULE_1__.ParseUtils.parseFloatingPointFormat(this._u8data.slice(offset, offset + 8), 11, 52);
        }
        return px_val;
    }
    pixel2physicalValue(pxval) {
        if (this._BZERO === undefined || this._BSCALE === undefined) {
            throw new Error("Either BZERO or BSCALE is undefined");
        }
        return this._BZERO + this._BSCALE * pxval;
    }
}
//# sourceMappingURL=ParsePayload.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/ParseUtils.js":
/*!*******************************************!*\
  !*** ../FITSParser/lib-esm/ParseUtils.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParseUtils": () => (/* binding */ ParseUtils)
/* harmony export */ });
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
            return f !== 0 ? undefined : s * Infinity;
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
        let px_val = undefined; // pixel value
        // let px_val1, px_val2, px_val3, px_val4;
        if (bitpix == 16) {
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

/***/ }),

/***/ "../FITSParser/lib-esm/index.js":
/*!**************************************!*\
  !*** ../FITSParser/lib-esm/index.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FITSHeader": () => (/* reexport safe */ _model_FITSHeader_js__WEBPACK_IMPORTED_MODULE_1__.FITSHeader),
/* harmony export */   "FITSHeaderItem": () => (/* reexport safe */ _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_0__.FITSHeaderItem),
/* harmony export */   "FITSParser": () => (/* reexport safe */ _FITSParser_js__WEBPACK_IMPORTED_MODULE_2__.FITSParser),
/* harmony export */   "FITSWriter": () => (/* reexport safe */ _FITSWriter_js__WEBPACK_IMPORTED_MODULE_3__.FITSWriter),
/* harmony export */   "ParseHeader": () => (/* reexport safe */ _ParseHeader_js__WEBPACK_IMPORTED_MODULE_4__.ParseHeader),
/* harmony export */   "ParsePayload": () => (/* reexport safe */ _ParsePayload_js__WEBPACK_IMPORTED_MODULE_5__.ParsePayload),
/* harmony export */   "ParseUtils": () => (/* reexport safe */ _ParseUtils_js__WEBPACK_IMPORTED_MODULE_6__.ParseUtils)
/* harmony export */ });
/* harmony import */ var _model_FITSHeaderItem_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/FITSHeaderItem.js */ "../FITSParser/lib-esm/model/FITSHeaderItem.js");
/* harmony import */ var _model_FITSHeader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/FITSHeader.js */ "../FITSParser/lib-esm/model/FITSHeader.js");
/* harmony import */ var _FITSParser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FITSParser.js */ "../FITSParser/lib-esm/FITSParser.js");
/* harmony import */ var _FITSWriter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./FITSWriter.js */ "../FITSParser/lib-esm/FITSWriter.js");
/* harmony import */ var _ParseHeader_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ParseHeader.js */ "../FITSParser/lib-esm/ParseHeader.js");
/* harmony import */ var _ParsePayload_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ParsePayload.js */ "../FITSParser/lib-esm/ParsePayload.js");
/* harmony import */ var _ParseUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ParseUtils.js */ "../FITSParser/lib-esm/ParseUtils.js");







//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/model/FITSHeader.js":
/*!*************************************************!*\
  !*** ../FITSParser/lib-esm/model/FITSHeader.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FITSHeader": () => (/* binding */ FITSHeader)
/* harmony export */ });
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
// reference FTIS standard doc https://heasarc.gsfc.nasa.gov/docs/fcg/standard_dict.html
class FITSHeader extends Map {
    constructor() {
        super();
        this._offset = undefined;
        this._items = [];
    }
    set offset(offset) {
        this._offset = offset;
    }
    get offset() {
        return this._offset;
    }
    getItemList() {
        return this._items;
    }
    getItemListOf(key) {
        const res = [];
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.key == key) {
                res.push(item);
            }
        }
        return res;
    }
    addItemAtTheBeginning(item) {
        if (item.key !== undefined) {
            if ([
                "SIMPLE",
                "BITPIX",
                "NAXIS",
                "NAXIS1",
                "NAXIS2",
                "BLANK",
                "BZERO",
                "BSCALE",
                "DATAMIN",
                "DATAMAX",
                "NPIX",
                "ORDER",
                "CRPIX1",
                "CRPIX2",
                "CDELT1",
                "CDELT2",
            ].includes(item.key)) {
                this.set(item.key, item.value);
            }
        }
        const newitemlist = [item].concat(this._items);
        this._items = newitemlist;
    }
    addItem(item) {
        if (item.key !== undefined) {
            if ([
                "SIMPLE",
                "BITPIX",
                "NAXIS",
                "NAXIS1",
                "NAXIS2",
                "BLANK",
                "BZERO",
                "BSCALE",
                "DATAMIN",
                "DATAMAX",
                "NPIX",
                "ORDER",
                "CRPIX1",
                "CRPIX2",
                "CDELT1",
                "CDELT2",
            ].includes(item.key)) {
                this.set(item.key, item.value);
            }
        }
        this._items.push(item);
    }
    getNumRows() {
        return this._items.length;
    }
}
//# sourceMappingURL=FITSHeader.js.map

/***/ }),

/***/ "../FITSParser/lib-esm/model/FITSHeaderItem.js":
/*!*****************************************************!*\
  !*** ../FITSParser/lib-esm/model/FITSHeaderItem.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FITSHeaderItem": () => (/* binding */ FITSHeaderItem)
/* harmony export */ });
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/FITSParser
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
class FITSHeaderItem {
    constructor(key, value, comment) {
        this._key = key !== undefined ? key : undefined;
        this._value = value !== undefined ? value : undefined;
        this._comment = comment !== undefined ? comment : undefined;
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/CircleFinder.js":
/*!********************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/CircleFinder.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CircleFinder": () => (/* binding */ CircleFinder)
/* harmony export */ });
/* harmony import */ var _Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vec3.js */ "./node_modules/healpixjs/lib-esm/Vec3.js");

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
        return new _Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(this.center.x, this.center.y, this.center.z);
    }
    getCosrad() {
        return this.cosrad;
    }
    ;
}
//# sourceMappingURL=CircleFinder.js.map

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Constants.js":
/*!*****************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Constants.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Constants": () => (/* binding */ Constants)
/* harmony export */ });
class Constants {
}
//	static halfpi = Math.PI/2.;
Constants.halfpi = 1.5707963267948966;
Constants.inv_halfpi = 2. / Math.PI;
/** The Constant twopi. */
Constants.twopi = 2 * Math.PI;
Constants.inv_twopi = 1. / (2 * Math.PI);
//# sourceMappingURL=Constants.js.map

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Fxyf.js":
/*!************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Fxyf.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Fxyf": () => (/* binding */ Fxyf)
/* harmony export */ });
/* harmony import */ var _Hploc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc.js */ "./node_modules/healpixjs/lib-esm/Hploc.js");
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
        let loc = new _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc();
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Healpix.js":
/*!***************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Healpix.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Healpix": () => (/* binding */ Healpix)
/* harmony export */ });
/* harmony import */ var _CircleFinder_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CircleFinder.js */ "./node_modules/healpixjs/lib-esm/CircleFinder.js");
/* harmony import */ var _Constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Constants.js */ "./node_modules/healpixjs/lib-esm/Constants.js");
/* harmony import */ var _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Fxyf.js */ "./node_modules/healpixjs/lib-esm/Fxyf.js");
/* harmony import */ var _Hploc_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Hploc.js */ "./node_modules/healpixjs/lib-esm/Hploc.js");
/* harmony import */ var _Pointing_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Pointing.js */ "./node_modules/healpixjs/lib-esm/Pointing.js");
/* harmony import */ var _pstack_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pstack.js */ "./node_modules/healpixjs/lib-esm/pstack.js");
/* harmony import */ var _RangeSet_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./RangeSet.js */ "./node_modules/healpixjs/lib-esm/RangeSet.js");
/* harmony import */ var _Vec3_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Vec3.js */ "./node_modules/healpixjs/lib-esm/Vec3.js");
/* harmony import */ var _Xyf_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Xyf.js */ "./node_modules/healpixjs/lib-esm/Xyf.js");
/* harmony import */ var _Zphi_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Zphi.js */ "./node_modules/healpixjs/lib-esm/Zphi.js");











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
            this.cmpr[i] = _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(this.mpr[i]);
            this.smpr[i] = _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.sin(this.mpr[i]);
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
        let d = 1.0 / (this.nside);
        // console.log("------------------------");
        // console.log("xc, yc, dc "+xc+","+ yc+","+ dc);
        // console.log("xc+dc-d, yc+dc, xyf.face, d "+(xc+dc) +","+ (yc+dc)+","+
        // xyf.face+","+ d);
        points[0] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc, yc - dc, xyf.face).toVec3();
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
            points[i] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc - i * d, yc + dc, xyf.face).toVec3();
            points[i + step] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc, yc + dc - i * d, xyf.face).toVec3();
            points[i + 2 * step] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc + i * d, yc - dc, xyf.face).toVec3();
            points[i + 3 * step] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc, yc - dc + i * d, xyf.face).toVec3();
        }
        return points;
    }
    ;
    getPointsForXyf(x, y, step, face) {
        let nside = step * Math.pow(2, this.order);
        let points = new Array();
        let xyf = new _Xyf_js__WEBPACK_IMPORTED_MODULE_8__.Xyf(x, y, face);
        let dc = 0.5 / nside;
        let xc = (xyf.ix + 0.5) / nside;
        let yc = (xyf.iy + 0.5) / nside;
        points[0] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = new _Fxyf_js__WEBPACK_IMPORTED_MODULE_2__.Fxyf(xc + dc, yc - dc, xyf.face).toVec3();
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
        let xyf = new _Xyf_js__WEBPACK_IMPORTED_MODULE_8__.Xyf(this.compress_bits(pix), this.compress_bits(pix >> 1), Math.floor((ipix >> (2 * this.order))));
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
        let loc = new _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc(undefined);
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
        loc.phi = (nr == this.nside) ? 0.75 * _Constants_js__WEBPACK_IMPORTED_MODULE_1__.Constants.halfpi * tmp * this.fact1 : (0.5 * _Constants_js__WEBPACK_IMPORTED_MODULE_1__.Constants.halfpi * tmp) / nr;
        // loc.setPhi((nr == this.nside) ? 0.75 * Constants.halfpi * tmp * this.fact1 : (0.5 * Constants.halfpi * tmp)/nr);
        return loc;
    }
    ;
    ang2pix(ptg, mirror) {
        return this.loc2pix(new _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc(ptg));
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
            vv[i] = _Vec3_js__WEBPACK_IMPORTED_MODULE_7__.Vec3.pointing2Vec3(vertex[i]);
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
                let tmp = new _Pointing_js__WEBPACK_IMPORTED_MODULE_4__.Pointing(first); // TODO not used
                back = false;
            }
            else {
                let flipThnd = flip * hnd;
                if (flipThnd < 0) {
                    let tmp = new _Pointing_js__WEBPACK_IMPORTED_MODULE_4__.Pointing(medium);
                    vv.splice(index + 1, 1);
                    normal.splice(index, 1);
                    back = true;
                    index -= 1;
                    continue;
                }
                else {
                    let tmp = new _Pointing_js__WEBPACK_IMPORTED_MODULE_4__.Pointing(first);
                    back = false;
                }
            }
            normal[index].scale(flip);
            index += 1;
        }
        nv = vv.length;
        let ncirc = inclusive ? nv + 1 : nv;
        let rad = new Array(ncirc);
        rad = rad.fill(_Constants_js__WEBPACK_IMPORTED_MODULE_1__.Constants.halfpi);
        //        rad = rad.fill(1.5707963267948966);
        //        let p = "1.5707963267948966";
        //        rad = rad.fill(parseFloat(p));
        if (inclusive) {
            let cf = new _CircleFinder_js__WEBPACK_IMPORTED_MODULE_0__.CircleFinder(vv);
            normal[nv] = cf.getCenter();
            rad[nv] = _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.acos(cf.getCosrad());
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
        let res = new _RangeSet_js__WEBPACK_IMPORTED_MODULE_6__.RangeSet(4 << 1);
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
                crlimit[o][i][0] = (rad[i] + dr > Math.PI) ? -1 : _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(rad[i] + dr);
                crlimit[o][i][1] = (o == 0) ? _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(rad[i]) : crlimit[0][i][1];
                crlimit[o][i][2] = (rad[i] - dr < 0.) ? 1. : _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(rad[i] - dr);
            }
        }
        let stk = new _pstack_js__WEBPACK_IMPORTED_MODULE_5__.pstack(12 + 3 * omax);
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
        return z1 * z2 + _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(phi1 - phi2) * Math.sqrt((1.0 - z1 * z1) * (1.0 - z2 * z2));
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
        let zphia = new _Zphi_js__WEBPACK_IMPORTED_MODULE_9__.Zphi(2. / 3., Math.PI / this.nl4);
        let xyz1 = this.convertZphi2xyz(zphia);
        let va = new _Vec3_js__WEBPACK_IMPORTED_MODULE_7__.Vec3(xyz1[0], xyz1[1], xyz1[2]);
        let t1 = 1. - 1. / this.nside;
        t1 *= t1;
        let zphib = new _Zphi_js__WEBPACK_IMPORTED_MODULE_9__.Zphi(1 - t1 / 3, 0);
        let xyz2 = this.convertZphi2xyz(zphib);
        let vb = new _Vec3_js__WEBPACK_IMPORTED_MODULE_7__.Vec3(xyz2[0], xyz2[1], xyz2[2]);
        return va.angle(vb);
    }
    ;
    /**
     * this is a workaround replacing the Vec3(Zphi) constructor.
     */
    convertZphi2xyz(zphi) {
        let sth = Math.sqrt((1.0 - zphi.z) * (1.0 + zphi.z));
        let x = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(zphi.phi);
        let y = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.sin(zphi.phi);
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
        let pixset = new _RangeSet_js__WEBPACK_IMPORTED_MODULE_6__.RangeSet();
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
        let vptg = _Vec3_js__WEBPACK_IMPORTED_MODULE_7__.Vec3.pointing2Vec3(ptg);
        let crpdr = new Array(omax + 1);
        let crmdr = new Array(omax + 1);
        let cosrad = _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.cos(radius);
        let sinrad = _Hploc_js__WEBPACK_IMPORTED_MODULE_3__.Hploc.sin(radius);
        for (let o = 0; o <= omax; o++) { // prepare data at the required orders
            let dr = this.mpr[o]; // safety distance
            let cdr = this.cmpr[o];
            let sdr = this.smpr[o];
            crpdr[o] = (radius + dr > Math.PI) ? -1. : cosrad * cdr - sinrad * sdr;
            crmdr[o] = (radius - dr < 0.) ? 1. : cosrad * cdr + sinrad * sdr;
        }
        let stk = new _pstack_js__WEBPACK_IMPORTED_MODULE_5__.pstack(12 + 3 * omax);
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Hploc.js":
/*!*************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Hploc.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hploc": () => (/* binding */ Hploc)
/* harmony export */ });
/* harmony import */ var _Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vec3.js */ "./node_modules/healpixjs/lib-esm/Vec3.js");
/* harmony import */ var _Zphi_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Zphi.js */ "./node_modules/healpixjs/lib-esm/Zphi.js");


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
        var vector = new _Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(st * Hploc.cos(this.phi), st * Hploc.sin(this.phi), this.z);
        //	var vector = new Vec3(st*Math.cos(this.phi),st*Math.sin(this.phi),this.z);
        return vector;
    }
    ;
    toZphi() {
        return new _Zphi_js__WEBPACK_IMPORTED_MODULE_1__.Zphi(this.z, this.phi);
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Pointing.js":
/*!****************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Pointing.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Pointing": () => (/* binding */ Pointing)
/* harmony export */ });
/* harmony import */ var _Hploc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc.js */ "./node_modules/healpixjs/lib-esm/Hploc.js");

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
            this.theta = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.atan2(Math.sqrt(vec3.x * vec3.x + vec3.y * vec3.y), vec3.z);
            if (mirror) {
                this.phi = -_Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.atan2(vec3.y, vec3.x);
            }
            else {
                this.phi = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.atan2(vec3.y, vec3.x);
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/RangeSet.js":
/*!****************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/RangeSet.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RangeSet": () => (/* binding */ RangeSet)
/* harmony export */ });
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Vec3.js":
/*!************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Vec3.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vec3": () => (/* binding */ Vec3)
/* harmony export */ });
/* harmony import */ var _Hploc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc.js */ "./node_modules/healpixjs/lib-esm/Hploc.js");
/* harmony import */ var _Pointing_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Pointing.js */ "./node_modules/healpixjs/lib-esm/Pointing.js");
/**
 * Partial porting to Javascript of Vec3.java from Healpix3.30
 */


class Vec3 {
    constructor(in_x, in_y, in_z) {
        if (in_x instanceof _Pointing_js__WEBPACK_IMPORTED_MODULE_1__.Pointing) {
            let ptg = in_x;
            let sth = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(ptg.theta);
            this.x = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.cos(ptg.phi);
            this.y = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(ptg.phi);
            this.z = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.cos(ptg.theta);
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
        return _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.atan2(this.cross(v1).length(), this.dot(v1));
    }
    /** Invert the signs of all components */
    flip() {
        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;
    }
    static pointing2Vec3(pointing) {
        let sth = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(pointing.theta);
        let x = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.cos(pointing.phi);
        let y = sth * _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.sin(pointing.phi);
        let z = _Hploc_js__WEBPACK_IMPORTED_MODULE_0__.Hploc.cos(pointing.theta);
        return new Vec3(x, y, z);
    }
    ;
}
//# sourceMappingURL=Vec3.js.map

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Xyf.js":
/*!***********************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Xyf.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Xyf": () => (/* binding */ Xyf)
/* harmony export */ });
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

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/Zphi.js":
/*!************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/Zphi.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Zphi": () => (/* binding */ Zphi)
/* harmony export */ });
class Zphi {
    /** Creation from individual components */
    constructor(z_, phi_) {
        this.z = z_;
        this.phi = phi_;
    }
    ;
}
//# sourceMappingURL=Zphi.js.map

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/index.js":
/*!*************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CircleFinder": () => (/* reexport safe */ _CircleFinder_js__WEBPACK_IMPORTED_MODULE_2__.CircleFinder),
/* harmony export */   "Constants": () => (/* reexport safe */ _Constants_js__WEBPACK_IMPORTED_MODULE_0__.Constants),
/* harmony export */   "Fxyf": () => (/* reexport safe */ _Fxyf_js__WEBPACK_IMPORTED_MODULE_3__.Fxyf),
/* harmony export */   "Healpix": () => (/* reexport safe */ _Healpix_js__WEBPACK_IMPORTED_MODULE_4__.Healpix),
/* harmony export */   "Hploc": () => (/* reexport safe */ _Hploc_js__WEBPACK_IMPORTED_MODULE_10__.Hploc),
/* harmony export */   "Pointing": () => (/* reexport safe */ _Pointing_js__WEBPACK_IMPORTED_MODULE_5__.Pointing),
/* harmony export */   "RangeSet": () => (/* reexport safe */ _RangeSet_js__WEBPACK_IMPORTED_MODULE_6__.RangeSet),
/* harmony export */   "Vec3": () => (/* reexport safe */ _Vec3_js__WEBPACK_IMPORTED_MODULE_7__.Vec3),
/* harmony export */   "Xyf": () => (/* reexport safe */ _Xyf_js__WEBPACK_IMPORTED_MODULE_8__.Xyf),
/* harmony export */   "Zphi": () => (/* reexport safe */ _Zphi_js__WEBPACK_IMPORTED_MODULE_9__.Zphi),
/* harmony export */   "pstack": () => (/* reexport safe */ _pstack_js__WEBPACK_IMPORTED_MODULE_1__.pstack)
/* harmony export */ });
/* harmony import */ var _Constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Constants.js */ "./node_modules/healpixjs/lib-esm/Constants.js");
/* harmony import */ var _pstack_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pstack.js */ "./node_modules/healpixjs/lib-esm/pstack.js");
/* harmony import */ var _CircleFinder_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CircleFinder.js */ "./node_modules/healpixjs/lib-esm/CircleFinder.js");
/* harmony import */ var _Fxyf_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Fxyf.js */ "./node_modules/healpixjs/lib-esm/Fxyf.js");
/* harmony import */ var _Healpix_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Healpix.js */ "./node_modules/healpixjs/lib-esm/Healpix.js");
/* harmony import */ var _Pointing_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Pointing.js */ "./node_modules/healpixjs/lib-esm/Pointing.js");
/* harmony import */ var _RangeSet_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./RangeSet.js */ "./node_modules/healpixjs/lib-esm/RangeSet.js");
/* harmony import */ var _Vec3_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Vec3.js */ "./node_modules/healpixjs/lib-esm/Vec3.js");
/* harmony import */ var _Xyf_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Xyf.js */ "./node_modules/healpixjs/lib-esm/Xyf.js");
/* harmony import */ var _Zphi_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Zphi.js */ "./node_modules/healpixjs/lib-esm/Zphi.js");
/* harmony import */ var _Hploc_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Hploc.js */ "./node_modules/healpixjs/lib-esm/Hploc.js");











//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/healpixjs/lib-esm/pstack.js":
/*!**************************************************!*\
  !*** ./node_modules/healpixjs/lib-esm/pstack.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pstack": () => (/* binding */ pstack)
/* harmony export */ });
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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "wcslight:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			;
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"wcslight": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkwcslight"] = self["webpackChunkwcslight"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractProjection": () => (/* reexport safe */ _projections_AbstractProjection_js__WEBPACK_IMPORTED_MODULE_6__.AbstractProjection),
/* harmony export */   "CoordsType": () => (/* reexport safe */ _model_CoordsType_js__WEBPACK_IMPORTED_MODULE_1__.CoordsType),
/* harmony export */   "GnomonicProjection": () => (/* reexport safe */ _projections_GnomonicProjection_js__WEBPACK_IMPORTED_MODULE_7__.GnomonicProjection),
/* harmony export */   "HEALPixProjection": () => (/* reexport safe */ _projections_HEALPixProjection_js__WEBPACK_IMPORTED_MODULE_8__.HEALPixProjection),
/* harmony export */   "HiPSHelper": () => (/* reexport safe */ _projections_HiPSHelper_js__WEBPACK_IMPORTED_MODULE_9__.HiPSHelper),
/* harmony export */   "HiPSProjection": () => (/* reexport safe */ _projections_HiPSProjection_js__WEBPACK_IMPORTED_MODULE_10__.HiPSProjection),
/* harmony export */   "ImagePixel": () => (/* reexport safe */ _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_2__.ImagePixel),
/* harmony export */   "MercatorProjection": () => (/* reexport safe */ _projections_MercatorProjection_js__WEBPACK_IMPORTED_MODULE_11__.MercatorProjection),
/* harmony export */   "NumberType": () => (/* reexport safe */ _model_NumberType_js__WEBPACK_IMPORTED_MODULE_3__.NumberType),
/* harmony export */   "Point": () => (/* reexport safe */ _model_Point_js__WEBPACK_IMPORTED_MODULE_4__.Point),
/* harmony export */   "TestProj": () => (/* reexport safe */ _projections_TestProj_js__WEBPACK_IMPORTED_MODULE_12__.TestProj),
/* harmony export */   "WCSLight": () => (/* reexport safe */ _WCSLight_js__WEBPACK_IMPORTED_MODULE_0__.WCSLight),
/* harmony export */   "astroToSpherical": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.astroToSpherical),
/* harmony export */   "cartesianToSpherical": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.cartesianToSpherical),
/* harmony export */   "degToRad": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.degToRad),
/* harmony export */   "fillAstro": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.fillAstro),
/* harmony export */   "fillSpherical": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.fillSpherical),
/* harmony export */   "radToDeg": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.radToDeg),
/* harmony export */   "sphericalToAstro": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.sphericalToAstro),
/* harmony export */   "sphericalToCartesian": () => (/* reexport safe */ _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__.sphericalToCartesian)
/* harmony export */ });
/* harmony import */ var _WCSLight_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WCSLight.js */ "./src/WCSLight.ts");
/* harmony import */ var _model_CoordsType_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/CoordsType.js */ "./src/model/CoordsType.ts");
/* harmony import */ var _model_ImagePixel_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model/ImagePixel.js */ "./src/model/ImagePixel.ts");
/* harmony import */ var _model_NumberType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./model/NumberType.js */ "./src/model/NumberType.ts");
/* harmony import */ var _model_Point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./model/Point.js */ "./src/model/Point.ts");
/* harmony import */ var _model_Utils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./model/Utils.js */ "./src/model/Utils.ts");
/* harmony import */ var _projections_AbstractProjection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./projections/AbstractProjection.js */ "./src/projections/AbstractProjection.ts");
/* harmony import */ var _projections_GnomonicProjection_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./projections/GnomonicProjection.js */ "./src/projections/GnomonicProjection.ts");
/* harmony import */ var _projections_HEALPixProjection_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./projections/HEALPixProjection.js */ "./src/projections/HEALPixProjection.ts");
/* harmony import */ var _projections_HiPSHelper_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./projections/HiPSHelper.js */ "./src/projections/HiPSHelper.ts");
/* harmony import */ var _projections_HiPSProjection_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./projections/HiPSProjection.js */ "./src/projections/HiPSProjection.ts");
/* harmony import */ var _projections_MercatorProjection_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./projections/MercatorProjection.js */ "./src/projections/MercatorProjection.ts");
/* harmony import */ var _projections_TestProj_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./projections/TestProj.js */ "./src/projections/TestProj.ts");














})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=wcslight.js.map