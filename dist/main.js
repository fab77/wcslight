"use strict";
var wcslight;
(self["webpackChunkwcslight"] = self["webpackChunkwcslight"] || []).push([["main"],{

/***/ "../healpixjs/src/CircleFinder.js":
/*!****************************************!*\
  !*** ../healpixjs/src/CircleFinder.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vec3 */ "../healpixjs/src/Vec3.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


"use strict";

var CircleFinder = /*#__PURE__*/function () {
  // Vec3
  // double

  /**
   * @param point: Vec3
   */
  function CircleFinder(point) {
    _classCallCheck(this, CircleFinder);

    _defineProperty(this, "center", void 0);

    _defineProperty(this, "cosrad", void 0);

    var np = point.length; //HealpixUtils.check(np>=2,"too few points");

    if (!(np >= 2)) {
      console.log("too few points");
      return;
    }

    this.center = point[0].add(point[1]);
    this.center.normalize();
    this.cosrad = point[0].dot(this.center);

    for (var i = 2; i < np; ++i) {
      if (point[i].dot(this.center) < this.cosrad) {
        // point outside the current circle
        this.getCircle(point, i);
      }
    }
  }

  _createClass(CircleFinder, [{
    key: "getCircle",
    value:
    /**
     * @parm point: Vec3
     * @param q: int
     */
    function getCircle(point, q) {
      this.center = point[0].add(point[q]);
      this.center.normalize();
      this.cosrad = point[0].dot(this.center);

      for (var i = 1; i < q; ++i) {
        if (point[i].dot(this.center) < this.cosrad) {
          // point outside the current circle
          this.getCircle2(point, i, q);
        }
      }
    }
  }, {
    key: "getCircle2",
    value:
    /**
     * @parm point: Vec3
     * @param q1: int
     * @param q2: int
     */
    function getCircle2(point, q1, q2) {
      this.center = point[q1].add(point[q2]);
      this.center.normalize();
      this.cosrad = point[q1].dot(this.center);

      for (var i = 0; i < q1; ++i) {
        if (point[i].dot(this.center) < this.cosrad) {
          // point outside the current circle
          this.center = point[q1].sub(point[i]).cross(point[q2].sub(point[i]));
          this.center.normalize();
          this.cosrad = point[i].dot(this.center);

          if (this.cosrad < 0) {
            this.center.flip();
            this.cosrad = -this.cosrad;
          }
        }
      }
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      return new _Vec3__WEBPACK_IMPORTED_MODULE_0__["default"](this.center.x, this.center.y, this.center.z);
    }
  }, {
    key: "getCosrad",
    value: function getCosrad() {
      return this.cosrad;
    }
  }]);

  return CircleFinder;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CircleFinder);

/***/ }),

/***/ "../healpixjs/src/Constants.js":
/*!*************************************!*\
  !*** ../healpixjs/src/Constants.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Constants = function Constants() {
  _classCallCheck(this, Constants);
};

_defineProperty(Constants, "halfpi", 1.5707963267948966);

_defineProperty(Constants, "inv_halfpi", 2. / Math.PI);

_defineProperty(Constants, "twopi", 2 * Math.PI);

_defineProperty(Constants, "inv_twopi", 1. / (2 * Math.PI));

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Constants);

/***/ }),

/***/ "../healpixjs/src/Fxyf.js":
/*!********************************!*\
  !*** ../healpixjs/src/Fxyf.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Hploc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc */ "../healpixjs/src/Hploc.js");
/**
 * Partial porting to Javascript of Fxyf.java from Healpix3.30
 */


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var Fxyf = /*#__PURE__*/function () {
  function Fxyf(x, y, f) {
    _classCallCheck(this, Fxyf);

    this.fx = x;
    this.fy = y;
    this.face = f; // coordinate of the lowest corner of each face

    this.jrll = new Uint8Array([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
    this.jpll = new Uint8Array([1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7]);
    this.halfpi = Math.PI / 2.;
  }

  _createClass(Fxyf, [{
    key: "toHploc",
    value: function toHploc() {
      var loc = new _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"]();
      var jr = this.jrll[this.face] - this.fx - this.fy; //	console.log("JR: "+jr+" fx: "+this.fx+" fy: "+this.fy);
      //	console.log("this.face: "+this.face);
      //	console.log("this.jrll[this.face]: "+this.jrll[this.face]);

      var nr; //	var tmp;

      if (jr < 1) {
        nr = jr;
        var tmp = nr * nr / 3.;
        loc.z = 1 - tmp;

        if (loc.z > 0.99) {
          loc.sth = Math.sqrt(tmp * (2.0 - tmp));
          loc.have_sth = true;
        }
      } else if (jr > 3) {
        nr = 4 - jr;
        var tmp = nr * nr / 3.;
        loc.z = tmp - 1;

        if (loc.z < -0.99) {
          loc.sth = Math.sqrt(tmp * (2.0 - tmp));
          loc.have_sth = true;
        }
      } else {
        nr = 1;
        loc.z = (2 - jr) * 2.0 / 3.;
      }

      var tmp = this.jpll[this.face] * nr + this.fx - this.fy;

      if (tmp < 0) {
        tmp += 8;
      }

      if (tmp >= 8) {
        tmp -= 8;
      }

      loc.phi = nr < 1e-15 ? 0 : 0.5 * this.halfpi * tmp / nr; // loc.setPhi((nr<1e-15) ? 0 : (0.5*this.halfpi*tmp)/nr);
      //    console.log(loc);

      return loc;
    }
  }, {
    key: "toVec3",
    value: function toVec3() {
      return this.toHploc().toVec3();
    }
  }]);

  return Fxyf;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fxyf);

/***/ }),

/***/ "../healpixjs/src/Healpix.js":
/*!***********************************!*\
  !*** ../healpixjs/src/Healpix.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Fxyf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Fxyf */ "../healpixjs/src/Fxyf.js");
/* harmony import */ var _Hploc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc */ "../healpixjs/src/Hploc.js");
/* harmony import */ var _Xyf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Xyf */ "../healpixjs/src/Xyf.js");
/* harmony import */ var _Vec3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Vec3 */ "../healpixjs/src/Vec3.js");
/* harmony import */ var _Pointing__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Pointing */ "../healpixjs/src/Pointing.js");
/* harmony import */ var _CircleFinder__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CircleFinder */ "../healpixjs/src/CircleFinder.js");
/* harmony import */ var _Zphi__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Zphi */ "../healpixjs/src/Zphi.js");
/* harmony import */ var _pstack__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pstack */ "../healpixjs/src/pstack.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Constants */ "../healpixjs/src/Constants.js");
/* harmony import */ var _RangeSet__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./RangeSet */ "../healpixjs/src/RangeSet.js");

/**
 * Partial porting to Javascript of HealpixBase.java from Healpix3.30
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }












var Healpix = /*#__PURE__*/function () {
  // pixel
  function Healpix(nside_in) {
    _classCallCheck(this, Healpix);

    _defineProperty(this, "order_max", void 0);

    _defineProperty(this, "inv_halfpi", void 0);

    _defineProperty(this, "twothird", void 0);

    _defineProperty(this, "ns_max", void 0);

    _defineProperty(this, "ctab", void 0);

    _defineProperty(this, "utab", void 0);

    _defineProperty(this, "xoffset", void 0);

    _defineProperty(this, "yoffset", void 0);

    _defineProperty(this, "facearray", void 0);

    _defineProperty(this, "swaparray", void 0);

    _defineProperty(this, "nside", void 0);

    _defineProperty(this, "npface", void 0);

    _defineProperty(this, "npix", void 0);

    _defineProperty(this, "order", void 0);

    _defineProperty(this, "nl2", void 0);

    _defineProperty(this, "nl3", void 0);

    _defineProperty(this, "nl4", void 0);

    _defineProperty(this, "fact2", void 0);

    _defineProperty(this, "fact1", void 0);

    _defineProperty(this, "ncap", void 0);

    _defineProperty(this, "bn", void 0);

    _defineProperty(this, "mpr", void 0);

    _defineProperty(this, "cmpr", void 0);

    _defineProperty(this, "smpr", void 0);

    this.order_max = 29;
    this.inv_halfpi = 2.0 / Math.PI;
    this.twothird = 2.0 / 3.; // console.log("twothird "+this.twothird);
    // this.ns_max=1L<<order_max;

    this.ns_max = Math.pow(2, this.order_max);
    this.ctab = new Uint16Array([0, 1, 256, 257, 2, 3, 258, 259, 512, 513, 768, 769, 514, 515, 770, 771, 4, 5, 260, 261, 6, 7, 262, 263, 516, 517, 772, 773, 518, 519, 774, 775, 1024, 1025, 1280, 1281, 1026, 1027, 1282, 1283, 1536, 1537, 1792, 1793, 1538, 1539, 1794, 1795, 1028, 1029, 1284, 1285, 1030, 1031, 1286, 1287, 1540, 1541, 1796, 1797, 1542, 1543, 1798, 1799, 8, 9, 264, 265, 10, 11, 266, 267, 520, 521, 776, 777, 522, 523, 778, 779, 12, 13, 268, 269, 14, 15, 270, 271, 524, 525, 780, 781, 526, 527, 782, 783, 1032, 1033, 1288, 1289, 1034, 1035, 1290, 1291, 1544, 1545, 1800, 1801, 1546, 1547, 1802, 1803, 1036, 1037, 1292, 1293, 1038, 1039, 1294, 1295, 1548, 1549, 1804, 1805, 1550, 1551, 1806, 1807, 2048, 2049, 2304, 2305, 2050, 2051, 2306, 2307, 2560, 2561, 2816, 2817, 2562, 2563, 2818, 2819, 2052, 2053, 2308, 2309, 2054, 2055, 2310, 2311, 2564, 2565, 2820, 2821, 2566, 2567, 2822, 2823, 3072, 3073, 3328, 3329, 3074, 3075, 3330, 3331, 3584, 3585, 3840, 3841, 3586, 3587, 3842, 3843, 3076, 3077, 3332, 3333, 3078, 3079, 3334, 3335, 3588, 3589, 3844, 3845, 3590, 3591, 3846, 3847, 2056, 2057, 2312, 2313, 2058, 2059, 2314, 2315, 2568, 2569, 2824, 2825, 2570, 2571, 2826, 2827, 2060, 2061, 2316, 2317, 2062, 2063, 2318, 2319, 2572, 2573, 2828, 2829, 2574, 2575, 2830, 2831, 3080, 3081, 3336, 3337, 3082, 3083, 3338, 3339, 3592, 3593, 3848, 3849, 3594, 3595, 3850, 3851, 3084, 3085, 3340, 3341, 3086, 3087, 3342, 3343, 3596, 3597, 3852, 3853, 3598, 3599, 3854, 3855]);
    this.utab = new Uint16Array([0, 1, 4, 5, 16, 17, 20, 21, 64, 65, 68, 69, 80, 81, 84, 85, 256, 257, 260, 261, 272, 273, 276, 277, 320, 321, 324, 325, 336, 337, 340, 341, 1024, 1025, 1028, 1029, 1040, 1041, 1044, 1045, 1088, 1089, 1092, 1093, 1104, 1105, 1108, 1109, 1280, 1281, 1284, 1285, 1296, 1297, 1300, 1301, 1344, 1345, 1348, 1349, 1360, 1361, 1364, 1365, 4096, 4097, 4100, 4101, 4112, 4113, 4116, 4117, 4160, 4161, 4164, 4165, 4176, 4177, 4180, 4181, 4352, 4353, 4356, 4357, 4368, 4369, 4372, 4373, 4416, 4417, 4420, 4421, 4432, 4433, 4436, 4437, 5120, 5121, 5124, 5125, 5136, 5137, 5140, 5141, 5184, 5185, 5188, 5189, 5200, 5201, 5204, 5205, 5376, 5377, 5380, 5381, 5392, 5393, 5396, 5397, 5440, 5441, 5444, 5445, 5456, 5457, 5460, 5461, 16384, 16385, 16388, 16389, 16400, 16401, 16404, 16405, 16448, 16449, 16452, 16453, 16464, 16465, 16468, 16469, 16640, 16641, 16644, 16645, 16656, 16657, 16660, 16661, 16704, 16705, 16708, 16709, 16720, 16721, 16724, 16725, 17408, 17409, 17412, 17413, 17424, 17425, 17428, 17429, 17472, 17473, 17476, 17477, 17488, 17489, 17492, 17493, 17664, 17665, 17668, 17669, 17680, 17681, 17684, 17685, 17728, 17729, 17732, 17733, 17744, 17745, 17748, 17749, 20480, 20481, 20484, 20485, 20496, 20497, 20500, 20501, 20544, 20545, 20548, 20549, 20560, 20561, 20564, 20565, 20736, 20737, 20740, 20741, 20752, 20753, 20756, 20757, 20800, 20801, 20804, 20805, 20816, 20817, 20820, 20821, 21504, 21505, 21508, 21509, 21520, 21521, 21524, 21525, 21568, 21569, 21572, 21573, 21584, 21585, 21588, 21589, 21760, 21761, 21764, 21765, 21776, 21777, 21780, 21781, 21824, 21825, 21828, 21829, 21840, 21841, 21844, 21845]);
    this.jrll = new Int16Array([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
    this.jpll = new Int16Array([1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7]);
    this.xoffset = new Int16Array([-1, -1, 0, 1, 1, 1, 0, -1]);
    this.yoffset = new Int16Array([0, 1, 1, 1, 0, -1, -1, -1]);
    this.facearray = [new Int16Array([8, 9, 10, 11, -1, -1, -1, -1, 10, 11, 8, 9]), // S
    new Int16Array([5, 6, 7, 4, 8, 9, 10, 11, 9, 10, 11, 8]), // SE
    new Int16Array([-1, -1, -1, -1, 5, 6, 7, 4, -1, -1, -1, -1]), // E
    new Int16Array([4, 5, 6, 7, 11, 8, 9, 10, 11, 8, 9, 10]), // SW
    new Int16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), // center
    new Int16Array([1, 2, 3, 0, 0, 1, 2, 3, 5, 6, 7, 4]), // NE
    new Int16Array([-1, -1, -1, -1, 7, 4, 5, 6, -1, -1, -1, -1]), // W
    new Int16Array([3, 0, 1, 2, 3, 0, 1, 2, 4, 5, 6, 7]), // NW
    new Int16Array([2, 3, 0, 1, -1, -1, -1, -1, 0, 1, 2, 3]) // N
    ]; // questo forse deve essere un UInt8Array. Viene usato da neighbours

    this.swaparray = [new Int16Array([0, 0, 3]), // S
    new Int16Array([0, 0, 6]), // SE
    new Int16Array([0, 0, 0]), // E
    new Int16Array([0, 0, 5]), // SW
    new Int16Array([0, 0, 0]), // center
    new Int16Array([5, 0, 0]), // NE
    new Int16Array([0, 0, 0]), // W
    new Int16Array([6, 0, 0]), // NW
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
    this.smpr = []; // TODO INFINITE LOOP!!!!!! FIX ITTTTTTTTTT
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

  _createClass(Healpix, [{
    key: "computeBn",
    value: function computeBn() {
      for (var i = 0; i <= this.order_max; ++i) {
        this.bn[i] = new Healpix(1 << i);
        this.mpr[i] = this.bn[i].maxPixrad();
        this.cmpr[i] = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(this.mpr[i]);
        this.smpr[i] = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].sin(this.mpr[i]);
      }
    }
  }, {
    key: "getNPix",
    value: function getNPix() {
      return this.npix;
    }
  }, {
    key: "getBoundaries",
    value: function getBoundaries(pix) {
      var points = new Array();
      var xyf = this.nest2xyf(pix); // console.log("PIXEL: "+pix);
      // console.log("XYF "+xyf.ix+" "+xyf.iy+" "+xyf.face);

      var dc = 0.5 / this.nside;
      var xc = (xyf.ix + 0.5) / this.nside;
      var yc = (xyf.iy + 0.5) / this.nside;
      var d = 1.0 / this.nside; // console.log("------------------------");
      // console.log("xc, yc, dc "+xc+","+ yc+","+ dc);
      // console.log("xc+dc-d, yc+dc, xyf.face, d "+(xc+dc) +","+ (yc+dc)+","+
      // xyf.face+","+ d);

      points[0] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc, yc + dc, xyf.face).toVec3();
      points[1] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc, yc + dc, xyf.face).toVec3();
      points[2] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc, yc - dc, xyf.face).toVec3();
      points[3] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc, yc - dc, xyf.face).toVec3(); // console.log("Points for npix: "+pix);
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
  }, {
    key: "getBoundariesWithStep",
    value:
    /** Returns a set of points along the boundary of the given pixel.
     * Step 1 gives 4 points on the corners. The first point corresponds
     * to the northernmost corner, the subsequent points follow the pixel
     * boundary through west, south and east corners.
     *
     * @param pix pixel index number
     * @param step the number of returned points is 4*step
     * @return {@link Vec3} for each point
     */
    function getBoundariesWithStep(pix, step) {
      var points = new Array();
      var xyf = this.nest2xyf(pix);
      var dc = 0.5 / this.nside;
      var xc = (xyf.ix + 0.5) / this.nside;
      var yc = (xyf.iy + 0.5) / this.nside;
      var d = 1.0 / (this.nside * step);

      for (var i = 0; i < step; i++) {
        points[i] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc - i * d, yc + dc, xyf.face).toVec3();
        points[i + step] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc, yc + dc - i * d, xyf.face).toVec3();
        points[i + 2 * step] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc + i * d, yc - dc, xyf.face).toVec3();
        points[i + 3 * step] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc, yc - dc + i * d, xyf.face).toVec3();
      }

      return points;
    }
  }, {
    key: "getPointsForXyf",
    value: function getPointsForXyf(x, y, step, face) {
      var nside = step * Math.pow(2, this.order);
      var points = new Array();
      var xyf = new _Xyf__WEBPACK_IMPORTED_MODULE_2__["default"](x, y, face);
      var dc = 0.5 / nside;
      var xc = (xyf.ix + 0.5) / nside;
      var yc = (xyf.iy + 0.5) / nside;
      points[0] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc, yc + dc, xyf.face).toVec3();
      points[1] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc, yc + dc, xyf.face).toVec3();
      points[2] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc - dc, yc - dc, xyf.face).toVec3();
      points[3] = new _Fxyf__WEBPACK_IMPORTED_MODULE_1__["default"](xc + dc, yc - dc, xyf.face).toVec3();
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

  }, {
    key: "neighbours",
    value: function neighbours(ipix) {
      var result = new Int32Array(8);
      var xyf = this.nest2xyf(ipix);
      var ix = xyf.ix;
      var iy = xyf.iy;
      var face_num = xyf.face;
      var nsm1 = this.nside - 1;

      if (ix > 0 && ix < nsm1 && iy > 0 && iy < nsm1) {
        var fpix = Math.floor(face_num << 2 * this.order);
        var px0 = this.spread_bits(ix);
        var py0 = this.spread_bits(iy) << 1;
        var pxp = this.spread_bits(ix + 1);
        var pyp = this.spread_bits(iy + 1) << 1;
        var pxm = this.spread_bits(ix - 1);
        var pym = this.spread_bits(iy - 1) << 1;
        result[0] = fpix + pxm + py0;
        result[1] = fpix + pxm + pyp;
        result[2] = fpix + px0 + pyp;
        result[3] = fpix + pxp + pyp;
        result[4] = fpix + pxp + py0;
        result[5] = fpix + pxp + pym;
        result[6] = fpix + px0 + pym;
        result[7] = fpix + pxm + pym;
      } else {
        for (var i = 0; i < 8; ++i) {
          var x = ix + this.xoffset[i];
          var y = iy + this.yoffset[i];
          var nbnum = 4;

          if (x < 0) {
            x += this.nside;
            nbnum -= 1;
          } else if (x >= this.nside) {
            x -= this.nside;
            nbnum += 1;
          }

          if (y < 0) {
            y += this.nside;
            nbnum -= 3;
          } else if (y >= this.nside) {
            y -= this.nside;
            nbnum += 3;
          }

          var f = this.facearray[nbnum][face_num];

          if (f >= 0) {
            var bits = this.swaparray[nbnum][face_num >>> 2];

            if ((bits & 1) > 0) {
              x = Math.floor(this.nside - x - 1);
            }

            if ((bits & 2) > 0) {
              y = Math.floor(this.nside - y - 1);
            }

            if ((bits & 4) > 0) {
              var tint = x;
              x = y;
              y = tint;
            }

            result[i] = this.xyf2nest(x, y, f);
          } else {
            result[i] = -1;
          }
        }
      }

      return result;
    }
  }, {
    key: "nside2order",
    value: function nside2order(nside) {
      return (nside & nside - 1) != 0 ? -1 : Math.log2(nside);
    }
  }, {
    key: "nest2xyf",
    value: function nest2xyf(ipix) {
      var pix = Math.floor(ipix & this.npface - 1);
      var xyf = new _Xyf__WEBPACK_IMPORTED_MODULE_2__["default"](this.compress_bits(pix), this.compress_bits(pix >> 1), Math.floor(ipix >> 2 * this.order));
      return xyf;
    }
  }, {
    key: "xyf2nest",
    value: function xyf2nest(ix, iy, face_num) {
      return Math.floor(face_num << 2 * this.order) + this.spread_bits(ix) + (this.spread_bits(iy) << 1);
    }
  }, {
    key: "loc2pix",
    value: function loc2pix(hploc) {
      var z = hploc.z;
      var phi = hploc.phi;
      var za = Math.abs(z);
      var tt = this.fmodulo(phi * this.inv_halfpi, 4.0); // in [0,4)

      var pixNo;

      if (za <= this.twothird) {
        // Equatorial region
        var temp1 = this.nside * (0.5 + tt);
        var temp2 = this.nside * (z * 0.75);
        var jp = Math.floor(temp1 - temp2); // index of ascending edge line

        var jm = Math.floor(temp1 + temp2); // index of descending edge line

        var ifp = Math.floor(jp >>> this.order); // in {0,4}

        var ifm = Math.floor(jm >>> this.order);
        var face_num = Math.floor(ifp == ifm ? ifp | 4 : ifp < ifm ? ifp : ifm + 8);
        var ix = Math.floor(jm & this.nside - 1);
        var iy = Math.floor(this.nside - (jp & this.nside - 1) - 1);
        pixNo = this.xyf2nest(ix, iy, face_num);
      } else {
        // polar region, za > 2/3
        var ntt = Math.min(3, Math.floor(tt));
        var tp = tt - ntt;
        var tmp = za < 0.99 || !hploc.have_sth ? this.nside * Math.sqrt(3 * (1 - za)) : this.nside * hploc.sth / Math.sqrt((1.0 + za) / 3.);
        var jp = Math.floor(tp * tmp); // increasing edge line index

        var jm = Math.floor((1.0 - tp) * tmp); // decreasing edge line index

        if (jp >= this.nside) {
          jp = this.nside - 1; // for points too close to the boundary
        }

        if (jm >= this.nside) {
          jm = this.nside - 1;
        }

        if (z >= 0) {
          pixNo = this.xyf2nest(Math.floor(this.nside - jm - 1), Math.floor(this.nside - jp - 1), ntt);
        } else {
          pixNo = this.xyf2nest(Math.floor(jp), Math.floor(jm), ntt + 8);
        }
      }

      return pixNo;
    }
  }, {
    key: "pix2vec",
    value:
    /** Returns the normalized 3-vector corresponding to the center of the
    supplied pixel.
    @param pix long the requested pixel number.
    @return the pixel's center coordinates. */
    function pix2vec(pix) {
      return this.pix2loc(pix).toVec3();
    }
  }, {
    key: "pix2zphi",
    value:
    /** Returns the Zphi corresponding to the center of the supplied pixel.
     @param pix the requested pixel number.
     @return the pixel's center coordinates. */
    function pix2zphi(pix) {
      return this.pix2loc(pix).toZphi();
    }
    /**
     * @param pix long
     * @return Hploc
     */

  }, {
    key: "pix2loc",
    value: function pix2loc(pix) {
      var loc = new _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"](undefined);
      var xyf = this.nest2xyf(pix);
      var jr = (this.jrll[xyf.face] << this.order) - xyf.ix - xyf.iy - 1;
      var nr;

      if (jr < this.nside) {
        nr = jr;

        var _tmp = nr * nr * this.fact2;

        loc.z = 1 - _tmp;

        if (loc.z > 0.99) {
          loc.sth = Math.sqrt(_tmp * (2. - _tmp));
          loc.have_sth = true;
        }
      } else if (jr > this.nl3) {
        nr = this.nl4 - jr;

        var _tmp2 = nr * nr * this.fact2;

        loc.z = _tmp2 - 1;

        if (loc.z < -0.99) {
          loc.sth = Math.sqrt(_tmp2 * (2. - _tmp2));
          loc.have_sth = true;
        }
      } else {
        nr = this.nside;
        loc.z = (this.nl2 - jr) * this.fact1;
      }

      var tmp = this.jpll[xyf.face] * nr + xyf.ix - xyf.iy; //      	assert(tmp<8*nr); // must not happen

      if (tmp < 0) {
        tmp += 8 * nr;
      }

      loc.phi = nr == this.nside ? 0.75 * _Constants__WEBPACK_IMPORTED_MODULE_3__["default"].halfpi * tmp * this.fact1 : 0.5 * _Constants__WEBPACK_IMPORTED_MODULE_3__["default"].halfpi * tmp / nr; // loc.setPhi((nr == this.nside) ? 0.75 * Constants.halfpi * tmp * this.fact1 : (0.5 * Constants.halfpi * tmp)/nr);

      return loc;
    }
  }, {
    key: "ang2pix",
    value: function ang2pix(ptg, mirror) {
      return this.loc2pix(new _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"](ptg, mirror));
    }
  }, {
    key: "fmodulo",
    value: function fmodulo(v1, v2) {
      if (v1 >= 0) {
        return v1 < v2 ? v1 : v1 % v2;
      }

      var tmp = v1 % v2 + v2;
      return tmp === v2 ? 0.0 : tmp;
    }
  }, {
    key: "compress_bits",
    value: function compress_bits(v) {
      var raw = Math.floor(v & 0x5555) | Math.floor((v & 0x55550000) >>> 15);
      var compressed = this.ctab[raw & 0xff] | this.ctab[raw >>> 8] << 4;
      return compressed;
    }
  }, {
    key: "spread_bits",
    value: function spread_bits(v) {
      return Math.floor(this.utab[v & 0xff]) | Math.floor(this.utab[v >>> 8 & 0xff] << 16) | Math.floor(this.utab[v >>> 16 & 0xff] << 32) | Math.floor(this.utab[v >>> 24 & 0xff] << 48);
    }
  }, {
    key: "queryPolygonInclusive",
    value:
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
    function queryPolygonInclusive(vertex, fact) {
      var inclusive = fact != 0;
      var nv = vertex.length; //        let ncirc = inclusive ? nv+1 : nv;

      if (!(nv >= 3)) {
        console.log("not enough vertices in polygon");
        return;
      }

      var vv = [];

      for (var i = 0; i < nv; ++i) {
        vv[i] = _Vec3__WEBPACK_IMPORTED_MODULE_4__["default"].pointing2Vec3(vertex[i]);
      }

      var normal = [];
      var flip = 0;
      var index = 0;
      var back = false;

      while (index < vv.length) {
        var first = vv[index];
        var medium = null;
        var last = null;

        if (index == vv.length - 1) {
          last = vv[1];
          medium = vv[0];
        } else if (index == vv.length - 2) {
          last = vv[0];
          medium = vv[index + 1];
        } else {
          medium = vv[index + 1];
          last = vv[index + 2];
        }

        normal[index] = first.cross(medium).norm();
        var hnd = normal[index].dot(last);

        if (index == 0) {
          flip = hnd < 0. ? -1 : 1;
          var tmp = new _Pointing__WEBPACK_IMPORTED_MODULE_5__["default"](first);
          back = false;
        } else {
          var flipThnd = flip * hnd;

          if (flipThnd < 0) {
            var _tmp3 = new _Pointing__WEBPACK_IMPORTED_MODULE_5__["default"](medium);

            vv.splice(index + 1, 1);
            normal.splice(index, 1);
            back = true;
            index -= 1;
            continue;
          } else {
            var _tmp4 = new _Pointing__WEBPACK_IMPORTED_MODULE_5__["default"](first);

            back = false;
          }
        }

        normal[index].scale(flip);
        index += 1;
      }

      nv = vv.length;
      var ncirc = inclusive ? nv + 1 : nv;
      var rad = new Array(ncirc);
      rad = rad.fill(_Constants__WEBPACK_IMPORTED_MODULE_3__["default"].halfpi); //        rad = rad.fill(1.5707963267948966);
      //        let p = "1.5707963267948966";
      //        rad = rad.fill(parseFloat(p));

      if (inclusive) {
        var cf = new _CircleFinder__WEBPACK_IMPORTED_MODULE_6__["default"](vv);
        normal[nv] = cf.getCenter();
        rad[nv] = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].acos(cf.getCosrad());
      }

      return this.queryMultiDisc(normal, rad, fact);
    }
  }, {
    key: "queryMultiDisc",
    value:
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
    function queryMultiDisc(norm, rad, fact) {
      this.computeBn();
      var inclusive = fact != 0;
      var nv = norm.length; // HealpixUtils.check(nv==rad.lengt0,"inconsistent input arrays");

      if (!(nv == rad.length)) {
        console.error("inconsistent input arrays");
        return;
      }

      var res = new _RangeSet__WEBPACK_IMPORTED_MODULE_7__["default"](4 << 1); // Removed code for Scheme.RING

      var oplus = 0;

      if (inclusive) {
        if (!(Math.pow(2, this.order_max - this.order) >= fact)) {
          console.error("invalid oversampling factor");
        }

        if (!((fact & fact - 1) == 0)) {
          console.error("oversampling factor must be a power of 2");
        }

        oplus = this.ilog2(fact);
      }

      var omax = this.order + oplus; // the order up to which we test
      // TODO: ignore all disks with radius>=pi
      //        let crlimit = new Float32Array[omax+1][nv][3];

      var crlimit = new Array(omax + 1);
      var o;
      var i;

      for (o = 0; o <= omax; ++o) {
        // prepare data at the required orders
        crlimit[o] = new Array(nv);
        var dr = this.bn[o].maxPixrad(); // safety distance

        for (i = 0; i < nv; ++i) {
          crlimit[o][i] = new Float64Array(3);
          crlimit[o][i][0] = rad[i] + dr > Math.PI ? -1 : _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(rad[i] + dr);
          crlimit[o][i][1] = o == 0 ? _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(rad[i]) : crlimit[0][i][1];
          crlimit[o][i][2] = rad[i] - dr < 0. ? 1. : _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(rad[i] - dr);
        }
      }

      var stk = new _pstack__WEBPACK_IMPORTED_MODULE_8__["default"](12 + 3 * omax);

      for (var _i = 0; _i < 12; _i++) {
        // insert the 12 base pixels in reverse
        // order
        stk.push(11 - _i, 0);
      }

      while (stk.size() > 0) {
        // as long as there are pixels on the stack
        // pop current pixel number and order from the stack
        var pix = stk.ptop();

        var _o = stk.otop();

        stk.pop();

        var pv = this.bn[_o].pix2vec(pix);

        var zone = 3;

        for (var _i2 = 0; _i2 < nv && zone > 0; ++_i2) {
          var crad = pv.dot(norm[_i2]);

          for (var iz = 0; iz < zone; ++iz) {
            if (crad < crlimit[_o][_i2][iz]) {
              zone = iz;
            }
          }
        }

        if (zone > 0) {
          this.check_pixel(_o, omax, zone, res, pix, stk, inclusive);
        }
      }

      return res;
    }
  }, {
    key: "ilog2",
    value:
    /** Integer base 2 logarithm.
    @param arg
    @return the largest integer {@code n} that fulfills {@code 2^n<=arg}.
    For negative arguments and zero, 0 is returned. */
    function ilog2(arg) {
      var max = Math.max(arg, 1);
      return 31 - Math.clz32(max);
    }
  }, {
    key: "cosdist_zphi",
    value:
    /** Computes the cosine of the angular distance between two z, phi positions
      on the unit sphere. */
    function cosdist_zphi(z1, phi1, z2, phi2) {
      return z1 * z2 + _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(phi1 - phi2) * Math.sqrt((1.0 - z1 * z1) * (1.0 - z2 * z2));
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

  }, {
    key: "check_pixel",
    value: function check_pixel(o, omax, zone, pixset, pix, stk, inclusive) {
      if (zone == 0) return;

      if (o < this.order) {
        if (zone >= 3) {
          // output all subpixels
          var sdist = 2 * (this.order - o); // the "bit-shift distance" between map orders

          pixset.append(pix << sdist, pix + 1 << sdist);
        } else {
          // (zone>=1)
          for (var i = 0; i < 4; ++i) {
            stk.push(4 * pix + 3 - i, o + 1); // add children
          }
        }
      } else if (o > this.order) {
        // this implies that inclusive==true
        if (zone >= 2) {
          // pixel center in shape
          pixset.append(pix >>> 2 * (o - this.order)); // output the parent pixel at order

          stk.popToMark(); // unwind the stack
        } else {
          // (zone>=1): pixel center in safety range
          if (o < omax) {
            // check sublevels
            for (var _i3 = 0; _i3 < 4; ++_i3) {
              // add children in reverse order
              stk.push(4 * pix + 3 - _i3, o + 1); // add children
            }
          } else {
            // at resolution limit
            pixset.append(pix >>> 2 * (o - this.order)); // output the parent pixel at order

            stk.popToMark(); // unwind the stack
          }
        }
      } else {
        // o==order
        if (zone >= 2) {
          pixset.append(pix);
        } else if (inclusive) {
          // and (zone>=1)
          if (this.order < omax) {
            // check sublevels
            stk.mark(); // remember current stack position

            for (var _i4 = 0; _i4 < 4; ++_i4) {
              // add children in reverse order
              stk.push(4 * pix + 3 - _i4, o + 1); // add children
            }
          } else {
            // at resolution limit
            pixset.append(pix); // output the pixel
          }
        }
      }
    }
    /** Returns the maximum angular distance between a pixel center and its
    corners.
    @return maximum angular distance between a pixel center and its
      corners. */

  }, {
    key: "maxPixrad",
    value: function maxPixrad() {
      var zphia = new _Zphi__WEBPACK_IMPORTED_MODULE_9__["default"](2. / 3., Math.PI / this.nl4);
      var xyz1 = this.convertZphi2xyz(zphia);
      var va = new _Vec3__WEBPACK_IMPORTED_MODULE_4__["default"](xyz1[0], xyz1[1], xyz1[2]);
      var t1 = 1. - 1. / this.nside;
      t1 *= t1;
      var zphib = new _Zphi__WEBPACK_IMPORTED_MODULE_9__["default"](1 - t1 / 3, 0);
      var xyz2 = this.convertZphi2xyz(zphib);
      var vb = new _Vec3__WEBPACK_IMPORTED_MODULE_4__["default"](xyz2[0], xyz2[1], xyz2[2]);
      return va.angle(vb);
    }
  }, {
    key: "convertZphi2xyz",
    value:
    /**
     * this is a workaround replacing the Vec3(Zphi) constructor.
     */
    function convertZphi2xyz(zphi) {
      var sth = Math.sqrt((1.0 - zphi.z) * (1.0 + zphi.z));
      var x = sth * _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(zphi.phi);
      var y = sth * _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].sin(zphi.phi);
      var z = zphi.z;
      return [x, y, z];
    }
  }, {
    key: "queryDiscInclusive",
    value:
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
    function queryDiscInclusive(ptg, radius, fact) {
      this.computeBn();
      var inclusive = fact != 0;
      var pixset = new _RangeSet__WEBPACK_IMPORTED_MODULE_7__["default"]();

      if (radius >= Math.PI) {
        // disk covers the whole sphere
        pixset.append(0, npix);
        return pixset;
      }

      var oplus = 0;

      if (inclusive) {
        // HealpixUtils.check ((1L<<order_max)>=fact,"invalid oversampling factor");
        if (!(fact & fact - 1) == 0) {
          console.error("oversampling factor must be a power of 2");
        }

        oplus = this.ilog2(fact);
      }

      var omax = Math.min(this.order_max, this.order + oplus); // the order up to which we test

      var vptg = _Vec3__WEBPACK_IMPORTED_MODULE_4__["default"].pointing2Vec3(ptg);
      var crpdr = new Array(omax + 1);
      var crmdr = new Array(omax + 1);
      var cosrad = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].cos(radius);
      var sinrad = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].sin(radius);

      for (var o = 0; o <= omax; o++) {
        // prepare data at the required orders
        var dr = this.mpr[o]; // safety distance

        var cdr = this.cmpr[o];
        var sdr = this.smpr[o];
        crpdr[o] = radius + dr > Math.PI ? -1. : cosrad * cdr - sinrad * sdr;
        crmdr[o] = radius - dr < 0. ? 1. : cosrad * cdr + sinrad * sdr;
      }

      var stk = new _pstack__WEBPACK_IMPORTED_MODULE_8__["default"](12 + 3 * omax);

      for (var i = 0; i < 12; i++) {
        // insert the 12 base pixels in reverse order
        stk.push(11 - i, 0);
      }

      while (stk.size() > 0) {
        // as long as there are pixels on the stack
        // pop current pixel number and order from the stack
        var pix = stk.ptop();
        var curro = stk.otop();
        stk.pop();
        var pos = this.bn[curro].pix2zphi(pix); // cosine of angular distance between pixel center and disk center

        var cangdist = this.cosdist_zphi(vptg.z, ptg.phi, pos.z, pos.phi);

        if (cangdist > crpdr[curro]) {
          var zone = cangdist < cosrad ? 1 : cangdist <= crmdr[curro] ? 2 : 3;
          this.check_pixel(curro, omax, zone, pixset, pix, stk, inclusive);
        }
      }

      return pixset;
    }
  }]);

  return Healpix;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Healpix);


/***/ }),

/***/ "../healpixjs/src/Hploc.js":
/*!*********************************!*\
  !*** ../healpixjs/src/Hploc.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vec3 */ "../healpixjs/src/Vec3.js");
/* harmony import */ var _Zphi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Zphi */ "../healpixjs/src/Zphi.js");
/**
 * 
 */


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var Hploc = /*#__PURE__*/function () {
  function Hploc(ptg) {
    _classCallCheck(this, Hploc);

    this.PI4_A = 0.7853981554508209228515625;
    this.PI4_B = 0.794662735614792836713604629039764404296875e-8;
    this.PI4_C = 0.306161699786838294306516483068750264552437361480769e-16;
    this.M_1_PI = 0.3183098861837906715377675267450287;

    if (undefined != ptg) {
      //			if(  !( (ptg.theta>=0.0)&&(ptg.theta<=Math.PI))){
      //				console.warn("Hploc invalid theta value"+ ptg.theta);
      //				console.warn("[phi, theta] = ["+ ptg.phi+", "+ptg.theta+"]");
      //			}
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

  _createClass(Hploc, [{
    key: "setZ",
    value: function setZ(z) {
      this.z = z;
    }
  }, {
    key: "phi",
    get: function get() {
      return this._phi;
    },
    set: function set(phi) {
      this._phi = phi;
    }
  }, {
    key: "setSth",
    value: function setSth(sth) {
      this.sth = sth;
    }
  }, {
    key: "toVec3",
    value: function toVec3() {
      var st = this.have_sth ? this.sth : Math.sqrt((1.0 - this.z) * (1.0 + this.z));
      var vector = new _Vec3__WEBPACK_IMPORTED_MODULE_0__["default"](st * Hploc.cos(this.phi), st * Hploc.sin(this.phi), this.z); //	var vector = new Vec3(st*Math.cos(this.phi),st*Math.sin(this.phi),this.z);

      return vector;
    }
  }, {
    key: "toZphi",
    value: function toZphi() {
      return new _Zphi__WEBPACK_IMPORTED_MODULE_1__["default"](this.z, this.phi);
    }
  }], [{
    key: "sin",
    value: function sin(d) {
      var u = d * Hploc.M_1_PI;
      var q = Math.floor(u < 0 ? u - 0.5 : u + 0.5);
      var x = 4.0 * q;
      d -= x * Hploc.PI4_A;
      d -= x * Hploc.PI4_B;
      d -= x * Hploc.PI4_C;

      if ((q & 1) != 0) {
        d = -d;
      }

      return this.sincoshelper(d);
    }
  }, {
    key: "cos",
    value: function cos(d) {
      //		let u = d * Hploc.M_1_PI - 0.5;
      var u = d * Hploc.M_1_PI - 0.5; //		u -= 0.5;

      var q = 1 + 2 * Math.floor(u < 0 ? u - 0.5 : u + 0.5);
      var x = 2.0 * q;
      var t = x * Hploc.PI4_A;
      d = d - t;
      d -= x * Hploc.PI4_B;
      d -= x * Hploc.PI4_C;

      if ((q & 2) == 0) {
        d = -d;
      }

      return Hploc.sincoshelper(d);
    }
  }, {
    key: "sincoshelper",
    value: function sincoshelper(d) {
      var s = d * d;
      var u = -7.97255955009037868891952e-18;
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
  }, {
    key: "asin",
    value:
    /** This method calculates the arc sine of x in radians. The return
       value is in the range [-pi/2, pi/2]. The results may have
       maximum error of 3 ulps. */
    function asin(d) {
      return Hploc.mulsign(Hploc.atan2k(Math.abs(d), Math.sqrt((1 + d) * (1 - d))), d);
    }
  }, {
    key: "acos",
    value:
    /** This method calculates the arc cosine of x in radians. The
        return value is in the range [0, pi]. The results may have
        maximum error of 3 ulps. */
    function acos(d) {
      return Hploc.mulsign(Hploc.atan2k(Math.sqrt((1 + d) * (1 - d)), Math.abs(d)), d) + (d < 0 ? Math.PI : 0);
    }
  }, {
    key: "mulsign",
    value: function mulsign(x, y) {
      var sign = Hploc.copySign(1, y);
      return sign * x;
    }
  }, {
    key: "copySign",
    value: function copySign(magnitude, sign) {
      return sign < 0 ? -Math.abs(magnitude) : Math.abs(magnitude); // let finalsign = 1;
      // if (Object.is(finalsign , -0)){
      // 	sign = -1;
      // }else if (Object.is(finalsign , 0)){
      // 	sign = 1;
      // }else {
      // 	sign = Math.sign(finalsign);
      // }
      // return finalsign * magnitude;
    }
  }, {
    key: "atanhelper",
    value: function atanhelper(s) {
      var t = s * s;
      var u = -1.88796008463073496563746e-05;
      u = u * t + 0.000209850076645816976906797;
      u = u * t + -0.00110611831486672482563471;
      u = u * t + 0.00370026744188713119232403;
      u = u * t + -0.00889896195887655491740809;
      u = u * t + 0.016599329773529201970117;
      u = u * t + -0.0254517624932312641616861;
      u = u * t + 0.0337852580001353069993897;
      u = u * t + -0.0407629191276836500001934;
      u = u * t + 0.0466667150077840625632675;
      u = u * t + -0.0523674852303482457616113;
      u = u * t + 0.0587666392926673580854313;
      u = u * t + -0.0666573579361080525984562;
      u = u * t + 0.0769219538311769618355029;
      u = u * t + -0.090908995008245008229153;
      u = u * t + 0.111111105648261418443745;
      u = u * t + -0.14285714266771329383765;
      u = u * t + 0.199999999996591265594148;
      u = u * t + -0.333333333333311110369124;
      return u * t * s + s;
    }
  }, {
    key: "atan2k",
    value: function atan2k(y, x) {
      var q = 0.;

      if (x < 0) {
        x = -x;
        q = -2.;
      }

      if (y > x) {
        var t = x;
        x = y;
        y = -t;
        q += 1.;
      }

      return Hploc.atanhelper(y / x) + q * (Math.PI / 2);
    }
  }, {
    key: "atan2",
    value:
    /** This method calculates the arc tangent of y/x in radians, using
    the signs of the two arguments to determine the quadrant of the
    result. The results may have maximum error of 2 ulps. */
    function atan2(y, x) {
      var r = Hploc.atan2k(Math.abs(y), x);
      r = Hploc.mulsign(r, x);

      if (Hploc.isinf(x) || x == 0) {
        r = Math.PI / 2 - (Hploc.isinf(x) ? Hploc.copySign(1, x) * (Math.PI / 2) : 0);
      }

      if (Hploc.isinf(y)) {
        r = Math.PI / 2 - (Hploc.isinf(x) ? Hploc.copySign(1, x) * (Math.PI * 1 / 4) : 0);
      }

      if (y == 0) {
        r = Hploc.copySign(1, x) == -1 ? Math.PI : 0;
      }

      return Hploc.isnan(x) || Hploc.isnan(y) ? NaN : Hploc.mulsign(r, y);
    }
  }, {
    key: "isnan",
    value:
    /** Checks if the argument is a NaN or not. */
    function isnan(d) {
      return d != d;
    }
  }, {
    key: "isinf",
    value:
    /** Checks if the argument is either positive or negative infinity. */
    function isinf(d) {
      return Math.abs(d) === +Infinity;
    }
  }]);

  return Hploc;
}();

_defineProperty(Hploc, "PI4_A", 0.7853981554508209228515625);

_defineProperty(Hploc, "PI4_B", 0.794662735614792836713604629039764404296875e-8);

_defineProperty(Hploc, "PI4_C", 0.306161699786838294306516483068750264552437361480769e-16);

_defineProperty(Hploc, "M_1_PI", 0.3183098861837906715377675267450287);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Hploc);

/***/ }),

/***/ "../healpixjs/src/Pointing.js":
/*!************************************!*\
  !*** ../healpixjs/src/Pointing.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Hploc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Hploc */ "../healpixjs/src/Hploc.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 
 */

"use strict";

var Pointing =
/**
 * 
 * @param {*} vec3 Vec3.js
 * @param {*} mirror 
 * @param {*} in_theta radians
 * @param {*} in_phi radians
 */
function Pointing(vec3, mirror) {
  var in_theta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var in_phi = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

  _classCallCheck(this, Pointing);

  if (vec3 != null) {
    this.theta = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].atan2(Math.sqrt(vec3.x * vec3.x + vec3.y * vec3.y), vec3.z);

    if (mirror) {
      this.phi = -_Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].atan2(vec3.y, vec3.x);
    } else {
      this.phi = _Hploc__WEBPACK_IMPORTED_MODULE_0__["default"].atan2(vec3.y, vec3.x);
    }

    if (this.phi < 0.0) {
      this.phi = this.phi + 2 * Math.PI;
    }

    if (this.phi >= 2 * Math.PI) {
      this.phi = this.phi - 2 * Math.PI;
    }
  } else {
    this.theta = in_theta;
    this.phi = in_phi;
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Pointing);

/***/ }),

/***/ "../healpixjs/src/RangeSet.js":
/*!************************************!*\
  !*** ../healpixjs/src/RangeSet.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RangeSet = /*#__PURE__*/function () {
  /**
   * @param int cap: initial capacity
   */
  function RangeSet(cap) {
    _classCallCheck(this, RangeSet);

    if (cap < 0) console.error("capacity must be positive");
    this.r = new Int32Array(cap << 1);
    this.sz = 0;
  }

  _createClass(RangeSet, [{
    key: "append",
    value:
    /** Append a single-value range to the object.
       @param val value to append */
    function append(val) {
      this.append1(val, val + 1);
    }
  }, {
    key: "append1",
    value:
    /** Append a range to the object.
      @param a first long in range
      @param b one-after-last long in range */
    function append1(a, b) {
      if (a >= b) return;

      if (this.sz > 0 && a <= this.r[this.sz - 1]) {
        if (a < this.r[this.sz - 2]) console.error("bad append operation");
        if (b > this.r[this.sz - 1]) this.r[this.sz - 1] = b;
        return;
      } // this.ensureCapacity(this.sz+2);


      var cap = this.sz + 2;

      if (this.r.length < cap) {
        var newsize = Math.max(2 * this.r.length, cap);
        var rnew = new Int32Array(newsize);
        rnew.set(this.r);
        this.r = rnew;
      }

      this.r[this.sz] = a;
      this.r[this.sz + 1] = b;
      this.sz += 2;
    }
  }, {
    key: "ensureCapacity",
    value:
    /** Make sure the object can hold at least the given number of entries. 
     * @param cap int
     * */
    function ensureCapacity(cap) {
      if (this.r.length < cap) this.resize(Math.max(2 * this.r.length, cap));
    }
  }, {
    key: "resize",
    value:
    /**
     * @param newsize int
     */
    function resize(newsize) {
      if (newsize < this.sz) console.error("requested array size too small");
      if (newsize == this.r.length) return;
      var rnew = new Int32Array(newsize);
      var sliced = this.r.slice(0, this.sz + 1); //		this.arrayCopy(this.r, 0, rnew, 0, this.sz);

      this.r = sliced;
    }
  }]);

  return RangeSet;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RangeSet);

/***/ }),

/***/ "../healpixjs/src/Vec3.js":
/*!********************************!*\
  !*** ../healpixjs/src/Vec3.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Hploc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Hploc */ "../healpixjs/src/Hploc.js");
/* harmony import */ var _Pointing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Pointing */ "../healpixjs/src/Pointing.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Partial porting to Javascript of Vec3.java from Healpix3.30  
 */


"use strict";

var Vec3 = /*#__PURE__*/function () {
  function Vec3(x, y, z) {
    _classCallCheck(this, Vec3);

    _defineProperty(this, "x", void 0);

    _defineProperty(this, "y", void 0);

    _defineProperty(this, "z", void 0);

    if (_typeof(x) === _Pointing__WEBPACK_IMPORTED_MODULE_0__["default"]) {
      var sth = _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].sin(ptg.theta);
      this.x = sth * _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].cos(ptg.phi);
      this.y = sth * _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].sin(ptg.phi);
      this.z = _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].cos(ptg.theta);
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  _createClass(Vec3, [{
    key: "getX",
    value: function getX() {
      return this.x;
    }
  }, {
    key: "getY",
    value: function getY() {
      return this.y;
    }
  }, {
    key: "getZ",
    value: function getZ() {
      return this.z;
    }
  }, {
    key: "scale",
    value:
    /** Scale the vector by a given factor
       @param n the scale factor */
    function scale(n) {
      this.x *= n;
      this.y *= n;
      this.z *= n;
    }
  }, {
    key: "cross",
    value:
    /** Vector cross product.
    @param v another vector
    @return the vector cross product between this vector and {@code v} */
    function cross(v) {
      return new Vec3(this.y * v.z - v.y * this.z, this.z * v.x - v.z * this.x, this.x * v.y - v.x * this.y);
    }
  }, {
    key: "add",
    value:
    /** Vector addition
        * @param v the vector to be added
        * @return addition result */
    function add(v) {
      return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
  }, {
    key: "normalize",
    value:
    /** Normalize the vector */
    function normalize() {
      var d = 1. / this.length();
      this.x *= d;
      this.y *= d;
      this.z *= d;
    }
  }, {
    key: "norm",
    value:
    /** Return normalized vector */
    function norm() {
      var d = 1. / this.length();
      return new Vec3(this.x * d, this.y * d, this.z * d);
    }
  }, {
    key: "length",
    value:
    /** Vector length
       @return the length of the vector. */
    function length() {
      return Math.sqrt(this.lengthSquared());
    }
  }, {
    key: "lengthSquared",
    value:
    /** Squared vector length
        @return the squared length of the vector. */
    function lengthSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
  }, {
    key: "dot",
    value:
    /** Computes the dot product of the this vector and {@code v1}.
      * @param v1 another vector
      * @return dot product */
    function dot(v1) {
      return this.x * v1.x + this.y * v1.y + this.z * v1.z;
    }
  }, {
    key: "sub",
    value:
    /** Vector subtraction
     * @param v the vector to be subtracted
     * @return subtraction result */
    function sub(v) {
      return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
  }, {
    key: "angle",
    value:
    /** Angle between two vectors.
    @param v1 another vector
    @return the angle in radians between this vector and {@code v1};
      constrained to the range [0,PI]. */
    function angle(v1) {
      return _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].atan2(this.cross(v1).length(), this.dot(v1));
    }
    /** Invert the signs of all components */

  }, {
    key: "flip",
    value: function flip() {
      this.x *= -1.0;
      this.y *= -1.0;
      this.z *= -1.0;
    }
  }], [{
    key: "pointing2Vec3",
    value: function pointing2Vec3(pointing) {
      var sth = _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].sin(pointing.theta);
      var x = sth * _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].cos(pointing.phi);
      var y = sth * _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].sin(pointing.phi);
      var z = _Hploc__WEBPACK_IMPORTED_MODULE_1__["default"].cos(pointing.theta);
      return new Vec3(x, y, z);
    }
  }]);

  return Vec3;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vec3);

/***/ }),

/***/ "../healpixjs/src/Xyf.js":
/*!*******************************!*\
  !*** ../healpixjs/src/Xyf.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Partial porting to Javascript of Xyf.java from Healpix3.30  
 */


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Xyf = function Xyf(x, y, f) {
  _classCallCheck(this, Xyf);

  this.ix = x;
  this.iy = y;
  this.face = f;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Xyf);

/***/ }),

/***/ "../healpixjs/src/Zphi.js":
/*!********************************!*\
  !*** ../healpixjs/src/Zphi.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Zphi =
/** Creation from individual components */
function Zphi(z_, phi_) {
  _classCallCheck(this, Zphi);

  _defineProperty(this, "z", void 0);

  _defineProperty(this, "phi", void 0);

  this.z = z_;
  this.phi = phi_;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Zphi);

/***/ }),

/***/ "../healpixjs/src/pstack.js":
/*!**********************************!*\
  !*** ../healpixjs/src/pstack.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pstack = /*#__PURE__*/function () {
  /** Creation from individual components */
  function pstack(sz) {
    _classCallCheck(this, pstack);

    _defineProperty(this, "p", void 0);

    _defineProperty(this, "o", void 0);

    _defineProperty(this, "s", void 0);

    _defineProperty(this, "m", void 0);

    this.p = new Array(sz);
    this.o = new Int32Array(sz);
    this.s = 0;
    this.m = 0;
  }

  _createClass(pstack, [{
    key: "push",
    value:
    /**
     * @param p long
     * @param o int
     */
    function push(p_, o_) {
      this.p[this.s] = p_;
      this.o[this.s] = o_;
      ++this.s;
    }
  }, {
    key: "pop",
    value: function pop() {
      --this.s;
    }
  }, {
    key: "popToMark",
    value: function popToMark() {
      this.s = this.m;
    }
  }, {
    key: "size",
    value: function size() {
      return this.s;
    }
  }, {
    key: "mark",
    value: function mark() {
      this.m = this.s;
    }
  }, {
    key: "otop",
    value: function otop() {
      return this.o[this.s - 1];
    }
  }, {
    key: "ptop",
    value: function ptop() {
      return this.p[this.s - 1];
    }
  }]);

  return pstack;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pstack);

/***/ }),

/***/ "./src/WCSLight.js":
/*!*************************!*\
  !*** ./src/WCSLight.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _projections_ProjFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./projections/ProjFactory */ "./src/projections/ProjFactory.js");
/* harmony import */ var _projections_HEALPixProjection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./projections/HEALPixProjection */ "./src/projections/HEALPixProjection.js");
/* harmony import */ var _exceptions_HPXTilesMapNotDefined__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./exceptions/HPXTilesMapNotDefined */ "./src/exceptions/HPXTilesMapNotDefined.js");

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





var WCSLight = /*#__PURE__*/function () {
  // used only when HEALPix is the input projection. Map of (RA, Dec, outp_i, outp_j) points organised per tile.

  /**
   * 
   * @param {*} center {"ra":,"dec"} in degrees
   * @param {*} radius decimal deg
   * @param {*} pxsize decimal deg
   * @param {*} projection from constant?
   */
  function WCSLight(center, radius, pxsize, outProjectionName, inProjectionName) {
    _classCallCheck(this, WCSLight);

    _defineProperty(this, "_inprojection", void 0);

    _defineProperty(this, "_outprojection", void 0);

    _defineProperty(this, "_tilesMap", void 0);

    this._tilesMap = undefined;

    try {
      this._outprojection = _projections_ProjFactory__WEBPACK_IMPORTED_MODULE_0__["default"].get(center, radius, pxsize, outProjectionName);
      this._inprojection = _projections_ProjFactory__WEBPACK_IMPORTED_MODULE_0__["default"].get(center, radius, pxsize, inProjectionName);

      this._outprojection.generatePxMatrix();

      if (this._inprojection instanceof _projections_HEALPixProjection__WEBPACK_IMPORTED_MODULE_1__["default"]) {
        this._tilesMap = this._inprojection.generateTilesMap(this._outprojection.getPxMap()); // the program calling WCSLight must iterate over tilesMap and:
        //  - retrieve the FITS file and extract the data (pixels values)
        //  - call WCS process(data, tilesMap[n]) which fills the values in the output for the given input tile
      }
    } catch (e) {
      console.error(e.getError());
      exit(-1);
    }
  }

  _createClass(WCSLight, [{
    key: "processData",
    value: function processData(inData, tileno) {// foreach ImageItem ii in this._tilesMap[tileno]:
      //  - pxval = this._inprojection.world2pix(ii.ra, ii.dec)
      //  - this._outprojection._pxmap[ii.i][ii.j] = pxval
    }
    /**
     * It should be called only when HEALPix is used as input projection. 
     */

  }, {
    key: "getHEALPixTilesMap",
    value: function getHEALPixTilesMap() {
      if (this._tilesMap === undefined) {
        throw new _exceptions_HPXTilesMapNotDefined__WEBPACK_IMPORTED_MODULE_2__["default"]();
      }

      return this._tilesMap;
    }
  }]);

  return WCSLight;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WCSLight);

/***/ }),

/***/ "./src/exceptions/HPXTilesMapNotDefined.js":
/*!*************************************************!*\
  !*** ./src/exceptions/HPXTilesMapNotDefined.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var HPXTilesMapNotDefined = /*#__PURE__*/function () {
  function HPXTilesMapNotDefined(projection) {
    _classCallCheck(this, HPXTilesMapNotDefined);

    _defineProperty(this, "_error", void 0);

    this._error = "HEALPix tiles map not defined. Check if HEALPix is used as input projection.";
  }

  _createClass(HPXTilesMapNotDefined, [{
    key: "getError",
    value: function getError() {
      return this._error;
    }
  }]);

  return HPXTilesMapNotDefined;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HPXTilesMapNotDefined);

/***/ }),

/***/ "./src/exceptions/ProjectionNotFound.js":
/*!**********************************************!*\
  !*** ./src/exceptions/ProjectionNotFound.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ProjectionNotFound = /*#__PURE__*/function () {
  function ProjectionNotFound(projection) {
    _classCallCheck(this, ProjectionNotFound);

    _defineProperty(this, "_error", void 0);

    this._error = "Projection " + projection + " not found";
  }

  _createClass(ProjectionNotFound, [{
    key: "getError",
    value: function getError() {
      return this._error;
    }
  }]);

  return ProjectionNotFound;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProjectionNotFound);

/***/ }),

/***/ "./src/model/ImageItem.js":
/*!********************************!*\
  !*** ./src/model/ImageItem.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ImageItem = /*#__PURE__*/function () {
  // decimal degrees
  // decimal degrees
  // int
  // int

  /**
   * 
   * @param {*} ra world coordinate
   * @param {*} dec world coordinate
   * @param {*} i pixel coordinate in FITS
   * @param {*} j pixel coordinate in FITS
   */
  function ImageItem(ra, dec, i, j) {
    _classCallCheck(this, ImageItem);

    _defineProperty(this, "_ra", void 0);

    _defineProperty(this, "_dec", void 0);

    _defineProperty(this, "_i", void 0);

    _defineProperty(this, "_j", void 0);

    _defineProperty(this, "_value", void 0);

    this._ra = ra;
    this._dec = dec;
    this._i = i;
    this._j = j;
  }
  /**
   * @param {any} val
   */


  _createClass(ImageItem, [{
    key: "value",
    set: function set(val) {
      this._value = val;
    }
  }, {
    key: "getRA",
    value: function getRA() {
      return this._ra;
    }
  }, {
    key: "getDec",
    value: function getDec() {
      return this._dec;
    }
  }, {
    key: "geti",
    value: function geti() {
      return this._i;
    }
  }, {
    key: "getj",
    value: function getj() {
      return this._j;
    }
  }]);

  return ImageItem;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImageItem);

/***/ }),

/***/ "./src/projections/AbstractProjection.js":
/*!***********************************************!*\
  !*** ./src/projections/AbstractProjection.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbstractProjection = function AbstractProjection() {
  _classCallCheck(this, AbstractProjection);

  if ((this instanceof AbstractProjection ? this.constructor : void 0) === AbstractProjection) {
    throw new TypeError("Abstract class cannot be instantiated.");
  }

  if (this.prepareFITSHeader === undefined) {
    throw new TypeError("Must override prepareFITSHeader()");
  }

  if (this.generatePxMatrix === undefined) {
    throw new TypeError("Must override generateMatrix()");
  }
  /**
   * 
   * @param {double} i 
   * @param {double} j 
   * @returns RA, Dec
   */


  if (this.pix2world === undefined) {
    throw new TypeError("Must override pix2world(i, j)");
  }
  /**
   * 
   * @param {double} ra 
   * @param {double} dec 
   * @returns [X, Y] projection on the cartesian plane of RA and Dec
   */


  if (this.world2pix === undefined) {
    throw new TypeError("Must override world2pix(ra, dec)");
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AbstractProjection);

/***/ }),

/***/ "./src/projections/HEALPixProjection.js":
/*!**********************************************!*\
  !*** ./src/projections/HEALPixProjection.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _AbstractProjection__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AbstractProjection */ "./src/projections/AbstractProjection.js");
/* harmony import */ var healpixjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! healpixjs */ "../healpixjs/src/Hploc.js");
/* harmony import */ var healpixjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! healpixjs */ "../healpixjs/src/Pointing.js");
/* harmony import */ var healpixjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! healpixjs */ "../healpixjs/src/Healpix.js");

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var RAD2DEG = 180 / Math.PI;
var DEG2RAD = Math.PI / 180;
var H = 4;
var K = 3;
var healpixResMapK0 = [58.6, 0, 1];
var pxXtile = 512;

var HEALPixProjection = /*#__PURE__*/function (_AbstractProjection) {
  _inherits(HEALPixProjection, _AbstractProjection);

  var _super = _createSuper(HEALPixProjection);

  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  //NOT USED
  // _pxsize;
  // _radius;

  /** 
   * the conversion from RA, Deg to pixel (i, j) goes in this way:
   * convert (RA, Dec) to to intermediate coordinates (X, Y) World2Intermediate
   * convert (X, Y) to pixel coordinates (i, j)
   */
  // intermediate coordinates in the X, Y plane

  /**
   * 
   * @param {*} center {ra, dec} in decimal degrees
   * @param {*} radius decimal degrees
   * @param {*} pxsize decimal degrees
   */
  function HEALPixProjection(center, radius, pxsize) {
    var _this;

    _classCallCheck(this, HEALPixProjection);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "_deltara", void 0);

    _defineProperty(_assertThisInitialized(_this), "_deltadec", void 0);

    _defineProperty(_assertThisInitialized(_this), "_minra", void 0);

    _defineProperty(_assertThisInitialized(_this), "_mindec", void 0);

    _defineProperty(_assertThisInitialized(_this), "_stepra", void 0);

    _defineProperty(_assertThisInitialized(_this), "_stepdec", void 0);

    _defineProperty(_assertThisInitialized(_this), "_np1", void 0);

    _defineProperty(_assertThisInitialized(_this), "_np2", void 0);

    _defineProperty(_assertThisInitialized(_this), "_scale", void 0);

    _defineProperty(_assertThisInitialized(_this), "_fotw", void 0);

    _defineProperty(_assertThisInitialized(_this), "_naxis1", void 0);

    _defineProperty(_assertThisInitialized(_this), "_naxis2", void 0);

    _defineProperty(_assertThisInitialized(_this), "_pixno", void 0);

    _defineProperty(_assertThisInitialized(_this), "THETAX", void 0);

    _defineProperty(_assertThisInitialized(_this), "MAX_TILES", 20);

    _defineProperty(_assertThisInitialized(_this), "_HIPSResMapK0", [58.6 / pxXtile, 0, 1]);

    _defineProperty(_assertThisInitialized(_this), "_tilesSet", void 0);

    _defineProperty(_assertThisInitialized(_this), "_hp", void 0);

    _defineProperty(_assertThisInitialized(_this), "_xyGridProj", void 0);

    _this.THETAX = healpixjs__WEBPACK_IMPORTED_MODULE_0__["default"].asin((K - 1) / K);

    var nside = _this.computeNside(pxsize);

    _this._hp = new healpixjs__WEBPACK_IMPORTED_MODULE_1__["default"](nside);

    var phiTheta_rad = _this.convert2PhiTheta(center);

    var bbox = _this.computeBbox(phiTheta_rad, _this.degToRad(radius));

    _this._tilesSet = hp.queryPolygonInclusive(bbox, 32);
    return _this;
  }
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


  _createClass(HEALPixProjection, [{
    key: "computeNside",
    value: function computeNside(pxsize) {
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
       *  k * Log 2 = Log L(0) - Log (pxsize * 2^9)
       * 	k = Log (L(0)/2) - Log (pxsize * 2^8)
       * 
       */
      var theta0px = this._HIPSResMapK0[0];
      var k = Math.log(theta0px / 2) - Math.log(pxsize * Math.pow(2, 8));
      k = Match.round(k);
      var nside = Math.pow(2, k);
      return nside;
    }
    /**
     * 
     * @param {Object {ra, dec}} point  decimal degrees
     * @returns {Object {phi_rad, theta_rad}} in radians
     */

  }, {
    key: "convert2PhiTheta",
    value: function convert2PhiTheta(point) {
      var phitheta_rad = {};
      var phiTheta_deg = this.astroDegToSpherical(point.ra, point.dec);
      phitheta_rad.phi_rad = this.degToRad(phiTheta_deg.phi);
      phitheta_rad.theta_rad = this.degToRad(phiTheta_deg.theta);
      return phitheta_rad;
    }
  }, {
    key: "astroDegToSphericalRad",
    value: function astroDegToSphericalRad(raDeg, decDeg) {
      var phiThetaDeg = this.astroDegToSpherical(raDeg, decDeg);
      var phiThetaRad = {
        phi_rad: degToRad(phiThetaDeg.phiDeg),
        theta_rad: degToRad(phiThetaDeg.thetaDeg)
      };
      return phiThetaRad;
    }
  }, {
    key: "degToRad",
    value: function degToRad(degrees) {
      return degrees / 180 * Math.PI;
    }
  }, {
    key: "astroDegToSpherical",
    value: function astroDegToSpherical(raDeg, decDeg) {
      var phiDeg, thetaDeg;
      phiDeg = raDeg;

      if (phiDeg < 0) {
        phiDeg += 360;
      }

      thetaDeg = 90 - decDeg;
      return {
        phi: phiDeg,
        theta: thetaDeg
      };
    }
    /**
     * 
     * @param {Object {phi_rad, theta_rad}} phiTheta_rad Center of the circle in radians
     * @param {decimal} radius_rad Radius of the circle in radians
     * @returns 
     */

  }, {
    key: "computeBbox",
    value: function computeBbox(phiTheta_rad, radius_rad) {
      var bbox = [];
      bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad - r));
      bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad + r));
      bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](null, false, phiTheta_rad.theta_rad + r, phiTheta_rad.phi_rad + r));
      bbox.push(new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad - r));
      return bbox;
    }
    /**
     * Generates an array where the key is the HPX tile number and the value is an array of {ImageItem.js} from the output projected image
     * @param {Array[Array[ImageItem]]} raDecMap Map of RA Dec generated in the OUTPUT projection with generatePxMatrix()
     * @returns {} tilesMap
     */

  }, {
    key: "generateTilesMap",
    value: function generateTilesMap(raDecMap) {
      var tilesMap = []; // rows

      for (var i = 0; i < raDecMap.length; i++) {
        // cols
        for (var j = 0; j < raDecMap[i].length; j++) {
          var item = raDecMap[i][j];
          var phiTheta_rad = astroDegToSphericalRad(item.getRA(), item.getDec());
          var ptg = new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](null, false, phiTheta_rad.theta_rad, phiTheta_rad.phiRad);

          var tile = this._hp.ang2pix(ptg);

          if (tilesMap[tile].length == 0) {
            tilesMap[tile] = [];
          }

          tilesMap[tile].push(item);
        }
      }

      return tilesMap;
    }
  }, {
    key: "init",
    value: function init(nside, pixno, naxis1, naxis2) {
      this._naxis1 = naxis1;
      this._naxis2 = naxis2;
      this._pixno = pixno;
      this._xyGridProj = {
        "min_y": NaN,
        "max_y": NaN,
        "min_x": NaN,
        "max_x": NaN,
        "gridPointsDeg": []
      };

      if (isNaN(nside)) {
        throw new EvalError("nside not set");
      }

      var healpix = new healpixjs__WEBPACK_IMPORTED_MODULE_1__["default"](nside);
      var cornersVec3 = healpix.getBoundariesWithStep(this._pixno, 1);
      var pointings = [];

      for (var i = 0; i < cornersVec3.length; i++) {
        pointings[i] = new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](cornersVec3[i]);

        if (i >= 1) {
          var a = pointings[i - 1].phi;
          var b = pointings[i].phi; // case when RA is just crossing the origin (e.g. 357deg - 3deg)

          if (Math.abs(a - b) > Math.PI) {
            if (pointings[i - 1].phi < pointings[i].phi) {
              pointings[i - 1].phi += 2 * Math.PI;
            } else {
              pointings[i].phi += 2 * Math.PI;
            }
          }
        }
      }

      for (var j = 0; j < pointings.length; j++) {
        var coThetaRad = pointings[j].theta; // HEALPix works with colatitude (0 North Pole, 180 South Pole)
        // converting the colatitude in latitude (dec)

        var decRad = Math.PI / 2 - coThetaRad;
        var raRad = pointings[j].phi; // projection on healpix grid

        var xyDeg = this.world2intermediate(raRad, decRad);
        this._xyGridProj.gridPointsDeg[j * 2] = xyDeg[0];
        this._xyGridProj.gridPointsDeg[j * 2 + 1] = xyDeg[1];

        if (isNaN(this._xyGridProj.max_y) || xyDeg[1] > this._xyGridProj.max_y) {
          this._xyGridProj.max_y = xyDeg[1];
        }

        if (isNaN(this._xyGridProj.min_y) || xyDeg[1] < this._xyGridProj.min_y) {
          this._xyGridProj.min_y = xyDeg[1];
        }

        if (isNaN(this._xyGridProj.max_x) || xyDeg[0] > this._xyGridProj.max_x) {
          this._xyGridProj.max_x = xyDeg[0];
        }

        if (isNaN(this._xyGridProj.min_x) || xyDeg[0] < this._xyGridProj.min_x) {
          this._xyGridProj.min_x = xyDeg[0];
        }
      }
    }
  }, {
    key: "pix2world",
    value: function pix2world(i, j) {
      var result = {
        "skyCoords": [],
        "xyCoords": []
      };
      var xy = this.pix2intermediate(i, j);
      var raDecDeg = this.intermediate2world(xy[0], xy[1]);

      if (raDecDeg[0] > 360) {
        raDecDeg[0] -= 360;
      }

      result.xyCoords = xy;
      result.skyCoords = raDecDeg;
      return result; // return {
      // 	"skyCoords": [raDecDeg[0], raDecDeg[1]],
      // 	"xyCoords": [x, y]
      // };
    }
  }, {
    key: "pix2intermediate",
    value: function pix2intermediate(i, j) {
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
      var i_norm = (i + 0.5) / this._naxis1;
      var j_norm = (j + 0.5) / this._naxis2;
      var xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x) / 2.0;
      var yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y) / 2.0;
      var yMean = (this._xyGridProj.max_y + this._xyGridProj.min_y) / 2.0; // bi-linear interpolation

      var x = this._xyGridProj.max_x - xInterval * (i_norm + j_norm);
      var y = yMean - yInterval * (j_norm - i_norm);
      return [x, y];
    }
  }, {
    key: "intermediate2world",
    value: function intermediate2world(x, y) {
      var phiDeg, thetaDeg;
      var Yx = 90 * (K - 1) / H;

      if (Math.abs(y) <= Yx) {
        // equatorial belts
        phiDeg = x;
        thetaDeg = Math.asin(y * H / (90 * K)) * RAD2DEG;
      } else if (Math.abs(y) > Yx) {
        // polar regions
        var sigma = (K + 1) / 2 - Math.abs(y * H) / 180;
        var w = 0; // omega

        if (K % 2 !== 0 || thetaRad > 0) {
          // K odd or thetax > 0
          w = 1;
        }

        var x_c = -180 + (2 * Math.floor((x + 180) * H / 360 + (1 - w) / 2) + w) * (180 / H);
        phiDeg = x_c + (x - x_c) / sigma;
        var thetaRad = healpixjs__WEBPACK_IMPORTED_MODULE_0__["default"].asin(1 - sigma * sigma / K);
        thetaDeg = thetaRad * RAD2DEG;

        if (y <= 0) {
          thetaDeg *= -1;
        }
      }

      return [phiDeg, thetaDeg];
    }
    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */

  }, {
    key: "world2pix",
    value: function world2pix(radeg, decdeg) {
      var phirad = radeg * DEG2RAD;
      var thetarad = decdeg * DEG2RAD;
      var xy = this.world2intermediate(phirad, thetarad);
      var ij = this.intermediate2pix(xy[0], xy[1]);
      return ij;
    }
    /**
     * Projection of the World coordinates into the intermediate coordinates plane (Paper .....)
     * @param {*} phiRad 
     * @param {*} thetaRad 
     * @returns 
     */

  }, {
    key: "world2intermediate",
    value: function world2intermediate(phiRad, thetaRad) {
      var x_grid, y_grid;

      if (Math.abs(thetaRad) <= this.THETAX) {
        // equatorial belts
        x_grid = phiRad * RAD2DEG;
        y_grid = healpixjs__WEBPACK_IMPORTED_MODULE_0__["default"].sin(thetaRad) * K * 90 / H;
      } else if (Math.abs(thetaRad) > this.THETAX) {
        // polar zones
        var phiDeg = phiRad * RAD2DEG;
        var w = 0; // omega

        if (K % 2 !== 0 || thetaRad > 0) {
          // K odd or thetax > 0
          w = 1;
        }

        var sigma = Math.sqrt(K * (1 - Math.abs(healpixjs__WEBPACK_IMPORTED_MODULE_0__["default"].sin(thetaRad))));
        var phi_c = -180 + (2 * Math.floor((phiRad + 180) * H / 360 + (1 - w) / 2) + w) * (180 / H);
        x_grid = phi_c + (phiDeg - phi_c) * sigma;
        y_grid = 180 / H * ((K + 1) / 2 - sigma);

        if (thetaRad < 0) {
          y_grid *= -1;
        }
      }

      return [x_grid, y_grid];
    }
  }, {
    key: "intermediate2pix",
    value: function intermediate2pix(x, y) {
      var xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x);
      var yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y);
      var i_norm, j_norm;

      if ((this._xyGridProj.min_x > 360 || this._xyGridProj.max_x > 360) && x < this._xyGridProj.min_x) {
        i_norm = (x + 360 - this._xyGridProj.min_x) / xInterval;
      } else {
        i_norm = (x - this._xyGridProj.min_x) / xInterval;
      }

      j_norm = (y - this._xyGridProj.min_y) / yInterval;
      var i = 0.5 - (i_norm - j_norm);
      var j = i_norm + j_norm - 0.5;
      i = Math.floor(i * 512);
      j = Math.floor(j * 512) + 1;
      return [i, j];
    }
  }, {
    key: "generatePxMatrix",
    value: function generatePxMatrix(minra, mindec, deltara, deltadec, fotw, pxscale) {}
    /**
    * compute boundaries of the current facet and compute max and min theta and phi projected on the HEALPix grid
    * @param {} nside optional
    * @returns result: object containing facet's corners coordinates and min and max theta and phi
    */

  }, {
    key: "getFacetProjectedCoordinates",
    value: function getFacetProjectedCoordinates(nside) {
      // nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
      if (isNaN(this._nside)) {
        throw new EvalError("nside not set");
      }

      var pix = this.pixno;
      var healpix = new healpixjs__WEBPACK_IMPORTED_MODULE_1__["default"](this._nside);
      var cornersVec3 = healpix.getBoundariesWithStep(pix, 1);
      var pointings = [];

      for (var i = 0; i < cornersVec3.length; i++) {
        pointings[i] = new healpixjs__WEBPACK_IMPORTED_MODULE_2__["default"](cornersVec3[i]);

        if (i >= 1) {
          var a = pointings[i - 1].phi;
          var b = pointings[i].phi; // case when RA is just crossing the origin (e.g. 357deg - 3deg)

          if (Math.abs(a - b) > Math.PI) {
            if (pointings[i - 1].phi < pointings[i].phi) {
              pointings[i - 1].phi += 2 * Math.PI;
            } else {
              pointings[i].phi += 2 * Math.PI;
            }
          }
        }
      } // // case when RA is just crossing the origin (e.g. 357deg - 3deg)
      // for (let i = 0; i < pointings.length - 1; i++) {
      // 	let a = pointings[i].phi;
      // 	let b = pointings[i+1].phi;
      // 	if (Math.abs(a - b) > Math.PI) {
      // 		if (pointings[i].phi < pointings[i+1].phi) {
      // 			pointings[i].phi += 2 * Math.PI;
      // 		}else{
      // 			pointings[i+1].phi += 2 * Math.PI;
      // 		}
      // 	} 
      // }


      var result = {
        "min_y": NaN,
        "max_y": NaN,
        "min_x": NaN,
        "max_x": NaN,
        "gridPointsDeg": []
      };

      for (var j = 0; j < pointings.length; j++) {
        var coThetaRad = pointings[j].theta;
        var thetaRad = Math.PI / 2 - coThetaRad;
        var phiRad = pointings[j].phi; // projection on healpix grid

        var xyDeg = this.projectOnHPXGrid(phiRad, thetaRad);
        result.gridPointsDeg[j * 2] = xyDeg[0];
        result.gridPointsDeg[j * 2 + 1] = xyDeg[1];

        if (isNaN(result.max_y) || xyDeg[1] > result.max_y) {
          result.max_y = xyDeg[1];
        }

        if (isNaN(result.min_y) || xyDeg[1] < result.min_y) {
          result.min_y = xyDeg[1];
        }

        if (isNaN(result.max_x) || xyDeg[0] > result.max_x) {
          result.max_x = xyDeg[0];
        }

        if (isNaN(result.min_x) || xyDeg[0] < result.min_x) {
          result.min_x = xyDeg[0];
        }
      }

      return result;
    }
  }]);

  return HEALPixProjection;
}(_AbstractProjection__WEBPACK_IMPORTED_MODULE_3__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HEALPixProjection);

/***/ }),

/***/ "./src/projections/MercatorProjection.js":
/*!***********************************************!*\
  !*** ./src/projections/MercatorProjection.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _AbstractProjection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractProjection */ "./src/projections/AbstractProjection.js");
/* harmony import */ var _model_ImageItem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../model/ImageItem */ "./src/model/ImageItem.js");

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // import ParseUtils from '../ParseUtils';



var MercatorProjection = /*#__PURE__*/function (_AbstractProjection) {
  _inherits(MercatorProjection, _AbstractProjection);

  var _super = _createSuper(MercatorProjection);

  /**
   * 
   * @param {*} center {ra, dec} in decimal degrees
   * @param {*} radius decimal degrees
   * @param {*} pxsize decimal degrees
   */
  function MercatorProjection(center, radius, pxsize) {
    var _this;

    _classCallCheck(this, MercatorProjection);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "_minra", void 0);

    _defineProperty(_assertThisInitialized(_this), "_mindec", void 0);

    _defineProperty(_assertThisInitialized(_this), "_naxis1", void 0);

    _defineProperty(_assertThisInitialized(_this), "_naxis2", void 0);

    _defineProperty(_assertThisInitialized(_this), "_pxsize", void 0);

    _defineProperty(_assertThisInitialized(_this), "_pxmap", void 0);

    _defineProperty(_assertThisInitialized(_this), "_fitsheader", void 0);

    _this.computeSquare(2 * radius, pxsize);

    _this._minra = center.raDeg - radius;

    if (_this._minra < 0) {
      _this._minra += 360;
    }

    _this._mindec = center.decDeg - radius;
    _this._pxsize = pxsize;

    _this.prepareFITSHeader();

    return _this;
  }

  _createClass(MercatorProjection, [{
    key: "prepareFITSHeader",
    value: function prepareFITSHeader() {
      // TODO
      this._fitsheader = "";
    }
  }, {
    key: "computeSquare",
    value: function computeSquare(d, ps) {
      this._naxis1 = d / ps;
      this._naxis2 = this._naxis1;
    }
    /** TODO !!! check and handle RA passing through 360-0 */

  }, {
    key: "pix2world",
    value: function pix2world(i, j) {
      var ra, dec;
      ra = i * this._stepra + this._minra;
      dec = j * this._stepdec + this._mindec;
      return [ra, dec];
    }
    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */

  }, {
    key: "world2pix",
    value: function world2pix(radeg, decdeg) {}
    /**
     * @return an empty array of (ImageItem.js} representing the output image/FITS. 
     * It will be filled with pixels values in another method.
     */

  }, {
    key: "generatePxMatrix",
    value: function generatePxMatrix() {
      this._pxmap = [];

      for (var i = 0; i < this._naxis1; i++) {
        // rows
        var row = new Array(this._naxis2);

        for (var j = 0; j < this._naxis2; j++) {
          // cols
          if (this._minra > 360) {
            this._minra -= 360;
          }

          var ii = new _model_ImageItem__WEBPACK_IMPORTED_MODULE_0__["default"](this._minra + this._pxsize * j, this._mindec + this._pxsize * i, i, j);
          row[j] = ii;
        }

        this._pxmap.push(row); // row based

      }
    }
  }, {
    key: "getPxMap",
    value: function getPxMap() {
      return this._pxmap;
    }
  }]);

  return MercatorProjection;
}(_AbstractProjection__WEBPACK_IMPORTED_MODULE_1__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MercatorProjection);

/***/ }),

/***/ "./src/projections/ProjFactory.js":
/*!****************************************!*\
  !*** ./src/projections/ProjFactory.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _HEALPixProjection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HEALPixProjection */ "./src/projections/HEALPixProjection.js");
/* harmony import */ var _MercatorProjection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MercatorProjection */ "./src/projections/MercatorProjection.js");
/* harmony import */ var _exceptions_ProjectionNotFound__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../exceptions/ProjectionNotFound */ "./src/exceptions/ProjectionNotFound.js");

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var ProjFactory = /*#__PURE__*/function () {
  function ProjFactory() {
    _classCallCheck(this, ProjFactory);
  }

  _createClass(ProjFactory, null, [{
    key: "getProjection",
    value: function getProjection(center, radius, pxsize, projectionName) {
      if (projectionName === "Mercator") {
        return new _MercatorProjection__WEBPACK_IMPORTED_MODULE_0__["default"](center, radius, pxsize);
      } else if (projectionName === "HEALPix") {
        return new _HEALPixProjection__WEBPACK_IMPORTED_MODULE_1__["default"](center, radius, pxsize);
      } else {
        throw new _exceptions_ProjectionNotFound__WEBPACK_IMPORTED_MODULE_2__["default"](projectionName);
      }
    }
  }]);

  return ProjFactory;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProjFactory);

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/WCSLight.js"));
/******/ wcslight = __webpack_exports__;
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLDRCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsNEJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDRCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMEJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDJCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMkJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDJCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMkJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDJCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMkJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDJCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMkJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDBCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMEJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLHlCQUFkO0FBQ0FGLE1BQUFBLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxDQUFKLEdBQVMsMEJBQWI7QUFDQUYsTUFBQUEsQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLENBQUosR0FBUyxDQUFDLDBCQUFkO0FBRUEsYUFBT0YsQ0FBQyxHQUFHRSxDQUFKLEdBQVFDLENBQVIsR0FBWUEsQ0FBbkI7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QUFZL08sSUFBWixDQUFpQmdQLEdBQWpCLEVBWm9DLENBWWI7O0FBRTFCO0FBQ0o7OztXQUVELG9CQUFXO0FBQ1AsYUFBTyxLQUFLRCxNQUFaO0FBQ0g7Ozs7RUF4RjRCbkg7O0FBMkZqQyxpRUFBZTBHLGtCQUFmOzs7Ozs7Ozs7Ozs7Ozs7O0FDMUdhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7O0lBRU16STs7Ozs7OztXQUVGLHVCQUFxQnpRLE1BQXJCLEVBQTZCNk0sTUFBN0IsRUFBcUNnRSxNQUFyQyxFQUE2Q2lKLGNBQTdDLEVBQTZEO0FBQ3pELFVBQUlBLGNBQWMsS0FBSyxVQUF2QixFQUFtQztBQUMvQixlQUFPLElBQUlaLDJEQUFKLENBQXVCbFosTUFBdkIsRUFBK0I2TSxNQUEvQixFQUF1Q2dFLE1BQXZDLENBQVA7QUFDSCxPQUZELE1BRVEsSUFBSWlKLGNBQWMsS0FBSyxTQUF2QixFQUFrQztBQUN0QyxlQUFPLElBQUtwSiwwREFBTCxDQUF1QjFRLE1BQXZCLEVBQStCNk0sTUFBL0IsRUFBdUNnRSxNQUF2QyxDQUFQO0FBQ0gsT0FGTyxNQUVEO0FBQ0gsY0FBTSxJQUFJaUIsc0VBQUosQ0FBdUJnSSxjQUF2QixDQUFOO0FBQ0g7QUFDSjs7Ozs7O0FBR0wsaUVBQWVySixXQUFmIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9DaXJjbGVGaW5kZXIuanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9Db25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9GeHlmLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4uL2hlYWxwaXhqcy9zcmMvSGVhbHBpeC5qcyIsIndlYnBhY2s6Ly93Y3NsaWdodC8uLi9oZWFscGl4anMvc3JjL0hwbG9jLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4uL2hlYWxwaXhqcy9zcmMvUG9pbnRpbmcuanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9SYW5nZVNldC5qcyIsIndlYnBhY2s6Ly93Y3NsaWdodC8uLi9oZWFscGl4anMvc3JjL1ZlYzMuanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9YeWYuanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi4vaGVhbHBpeGpzL3NyYy9acGhpLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4uL2hlYWxwaXhqcy9zcmMvcHN0YWNrLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4vc3JjL1dDU0xpZ2h0LmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4vc3JjL2V4Y2VwdGlvbnMvSFBYVGlsZXNNYXBOb3REZWZpbmVkLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4vc3JjL2V4Y2VwdGlvbnMvUHJvamVjdGlvbk5vdEZvdW5kLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4vc3JjL21vZGVsL0ltYWdlSXRlbS5qcyIsIndlYnBhY2s6Ly93Y3NsaWdodC8uL3NyYy9wcm9qZWN0aW9ucy9BYnN0cmFjdFByb2plY3Rpb24uanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi9zcmMvcHJvamVjdGlvbnMvSEVBTFBpeFByb2plY3Rpb24uanMiLCJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi9zcmMvcHJvamVjdGlvbnMvTWVyY2F0b3JQcm9qZWN0aW9uLmpzIiwid2VicGFjazovL3djc2xpZ2h0Ly4vc3JjL3Byb2plY3Rpb25zL1Byb2pGYWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IFZlYzMgZnJvbSAnLi9WZWMzJztcblxuXCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBDaXJjbGVGaW5kZXJ7XG5cdFxuXHRjZW50ZXI7XHQvLyBWZWMzXG5cdGNvc3JhZDtcdC8vIGRvdWJsZVxuXHRcbi8qKlxuICogQHBhcmFtIHBvaW50OiBWZWMzXG4gKi9cblx0Y29uc3RydWN0b3IocG9pbnQpe1xuXHRcdFxuXHRcdGxldCBucCA9IHBvaW50Lmxlbmd0aDtcblx0ICAgIC8vSGVhbHBpeFV0aWxzLmNoZWNrKG5wPj0yLFwidG9vIGZldyBwb2ludHNcIik7XG5cdCAgICBpZiAoIShucD49Mikpe1xuXHQgICAgXHRjb25zb2xlLmxvZyhcInRvbyBmZXcgcG9pbnRzXCIpO1xuXHQgICAgXHRyZXR1cm47XG5cdCAgICB9XG5cdCAgICB0aGlzLmNlbnRlciA9IHBvaW50WzBdLmFkZChwb2ludFsxXSk7IFxuXHQgICAgdGhpcy5jZW50ZXIubm9ybWFsaXplKCk7XG5cdCAgICB0aGlzLmNvc3JhZCA9IHBvaW50WzBdLmRvdCh0aGlzLmNlbnRlcik7XG5cdCAgICBmb3IgKGxldCBpPTI7IGk8bnA7ICsraSl7XG5cdCAgICBcdGlmIChwb2ludFtpXS5kb3QodGhpcy5jZW50ZXIpPHRoaXMuY29zcmFkKXsgLy8gcG9pbnQgb3V0c2lkZSB0aGUgY3VycmVudCBjaXJjbGVcblx0XHQgICAgICAgIHRoaXMuZ2V0Q2lyY2xlKHBvaW50LGkpO1x0XG5cdCAgICBcdH1cblx0ICAgIH1cblx0ICAgICAgXG5cdH07XG5cdFxuXHQvKipcblx0ICogQHBhcm0gcG9pbnQ6IFZlYzNcblx0ICogQHBhcmFtIHE6IGludFxuXHQgKi9cblx0Z2V0Q2lyY2xlIChwb2ludCwgcSl7XG5cdFx0dGhpcy5jZW50ZXIgPSBwb2ludFswXS5hZGQocG9pbnRbcV0pOyBcblx0XHR0aGlzLmNlbnRlci5ub3JtYWxpemUoKTtcblx0XHR0aGlzLmNvc3JhZCA9IHBvaW50WzBdLmRvdCh0aGlzLmNlbnRlcik7XG5cdFx0Zm9yIChsZXQgaT0xOyBpPHE7ICsraSl7XG5cdFx0XHRpZiAocG9pbnRbaV0uZG90KHRoaXMuY2VudGVyKTx0aGlzLmNvc3JhZCl7IC8vIHBvaW50IG91dHNpZGUgdGhlIGN1cnJlbnQgY2lyY2xlXG5cdFx0XHRcdHRoaXMuZ2V0Q2lyY2xlMihwb2ludCxpLHEpO1xuXHRcdFx0fVxuXHRcdH1cbiAgICB9O1xuXHRcblx0LyoqXG5cdCAqIEBwYXJtIHBvaW50OiBWZWMzXG5cdCAqIEBwYXJhbSBxMTogaW50XG5cdCAqIEBwYXJhbSBxMjogaW50XG5cdCAqL1xuXHRnZXRDaXJjbGUyIChwb2ludCwgcTEsIHEyKXtcblx0XHR0aGlzLmNlbnRlciA9IHBvaW50W3ExXS5hZGQocG9pbnRbcTJdKTsgXG5cdFx0dGhpcy5jZW50ZXIubm9ybWFsaXplKCk7XG5cdFx0dGhpcy5jb3NyYWQgPSBwb2ludFtxMV0uZG90KHRoaXMuY2VudGVyKTtcblx0XHRmb3IgKGxldCBpPTA7IGk8cTE7ICsraSl7XG5cdFx0XHRpZiAocG9pbnRbaV0uZG90KHRoaXMuY2VudGVyKTx0aGlzLmNvc3JhZCl7Ly8gcG9pbnQgb3V0c2lkZSB0aGUgY3VycmVudCBjaXJjbGVcblx0ICAgICAgICBcblx0XHRcdFx0dGhpcy5jZW50ZXI9KHBvaW50W3ExXS5zdWIocG9pbnRbaV0pKS5jcm9zcyhwb2ludFtxMl0uc3ViKHBvaW50W2ldKSk7XG5cdFx0XHRcdHRoaXMuY2VudGVyLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHR0aGlzLmNvc3JhZD1wb2ludFtpXS5kb3QodGhpcy5jZW50ZXIpO1xuXHRcdFx0XHRpZiAodGhpcy5jb3NyYWQ8MCl7IFxuXHRcdFx0XHRcdHRoaXMuY2VudGVyLmZsaXAoKTsgXG5cdFx0XHRcdFx0dGhpcy5jb3NyYWQ9LXRoaXMuY29zcmFkOyBcblx0XHRcdFx0fVxuXHQgICAgICAgIH1cblx0XHR9XG4gICAgfTtcbiAgICBcbiAgICBnZXRDZW50ZXIoKSB7IFxuICAgIFx0cmV0dXJuIG5ldyBWZWMzKHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnksIHRoaXMuY2VudGVyLnopOyBcbiAgICB9XG4gICAgXG4gICAgZ2V0Q29zcmFkKCkgeyBcbiAgICBcdHJldHVybiB0aGlzLmNvc3JhZDsgXG4gICAgfTtcblx0XG59XG5cbmV4cG9ydCBkZWZhdWx0IENpcmNsZUZpbmRlcjtcbiIsIlxuXCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBDb25zdGFudHN7XG4gIFxuICBcbi8vXHRzdGF0aWMgaGFsZnBpID0gTWF0aC5QSS8yLjtcblx0c3RhdGljIGhhbGZwaSA9IDEuNTcwNzk2MzI2Nzk0ODk2Njtcblx0XG5cblx0c3RhdGljIGludl9oYWxmcGkgPSAyLi9NYXRoLlBJO1xuXHRcblx0ICAvKiogVGhlIENvbnN0YW50IHR3b3BpLiAqL1xuXHRzdGF0aWMgdHdvcGkgPSAyKk1hdGguUEk7XG5cdHN0YXRpYyBpbnZfdHdvcGkgPSAxLi8oMipNYXRoLlBJKTtcblxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25zdGFudHM7XG4iLCIvKipcbiAqIFBhcnRpYWwgcG9ydGluZyB0byBKYXZhc2NyaXB0IG9mIEZ4eWYuamF2YSBmcm9tIEhlYWxwaXgzLjMwXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgSHBsb2MgZnJvbSAnLi9IcGxvYyc7XG5cbmNsYXNzIEZ4eWZ7IFxuXHRjb25zdHJ1Y3Rvcih4LCB5LCBmKXtcblx0XHR0aGlzLmZ4PXg7IFxuXHRcdHRoaXMuZnk9eTsgXG5cdFx0dGhpcy5mYWNlPWY7IFxuXHRcdC8vIGNvb3JkaW5hdGUgb2YgdGhlIGxvd2VzdCBjb3JuZXIgb2YgZWFjaCBmYWNlXG5cdFx0dGhpcy5qcmxsID0gbmV3IFVpbnQ4QXJyYXkoWyAyLCAyLCAyLCAyLCAzLCAzLCAzLCAzLCA0LCA0LCA0LCA0IF0pO1xuXHRcdHRoaXMuanBsbCA9IG5ldyBVaW50OEFycmF5KFsgMSwgMywgNSwgNywgMCwgMiwgNCwgNiwgMSwgMywgNSwgNyBdKTtcblx0XHR0aGlzLmhhbGZwaSA9IE1hdGguUEkvMi47XG5cdH1cblxuXHR0b0hwbG9jKCl7XHRcblx0XHR2YXIgbG9jID0gbmV3IEhwbG9jKCk7XG5cdFx0XG5cdFx0dmFyIGpyID0gdGhpcy5qcmxsW3RoaXMuZmFjZV0gLSB0aGlzLmZ4IC0gdGhpcy5meTtcblx0Ly9cdGNvbnNvbGUubG9nKFwiSlI6IFwiK2pyK1wiIGZ4OiBcIit0aGlzLmZ4K1wiIGZ5OiBcIit0aGlzLmZ5KTtcblx0Ly9cdGNvbnNvbGUubG9nKFwidGhpcy5mYWNlOiBcIit0aGlzLmZhY2UpO1xuXHQvL1x0Y29uc29sZS5sb2coXCJ0aGlzLmpybGxbdGhpcy5mYWNlXTogXCIrdGhpcy5qcmxsW3RoaXMuZmFjZV0pO1xuXHRcdFxuXHRcdHZhciBucjtcblx0Ly9cdHZhciB0bXA7XG5cdFx0aWYgKGpyPDEpe1xuXHRcdFx0ICBuciA9IGpyO1xuXHRcdFx0ICB2YXIgdG1wID0gbnIqbnIvMy47XG5cdFx0XHQgIGxvYy56ID0gMSAtIHRtcDtcblx0XHRcdCAgaWYgKGxvYy56PjAuOTkpIHsgXG5cdFx0XHRcdCAgbG9jLnN0aD1NYXRoLnNxcnQodG1wKigyLjAtdG1wKSk7IFxuXHRcdFx0XHQgIGxvYy5oYXZlX3N0aD10cnVlOyBcblx0XHRcdCAgfVxuXHRcdH1lbHNlIGlmIChqcj4zKXtcblx0XHRcdCAgbnIgPSA0LWpyO1xuXHRcdFx0ICB2YXIgdG1wID0gbnIqbnIvMy47XG5cdFx0XHQgIGxvYy56ID0gdG1wIC0gMTtcblx0XHRcdCAgaWYgKGxvYy56PC0wLjk5KSB7IFxuXHRcdFx0XHQgIGxvYy5zdGg9TWF0aC5zcXJ0KHRtcCooMi4wLXRtcCkpOyBcblx0XHRcdFx0ICBsb2MuaGF2ZV9zdGg9dHJ1ZTsgXG5cdFx0XHQgIH1cblx0XHR9ZWxzZXtcblx0XHRcdCAgbnIgPSAxO1xuXHRcdFx0ICBsb2MueiA9ICgyLWpyKSoyLjAvMy47XG5cdFx0fVxuXHRcblx0XHR2YXIgdG1wPSB0aGlzLmpwbGxbdGhpcy5mYWNlXSpucit0aGlzLmZ4LXRoaXMuZnk7XG5cdFx0aWYgKHRtcDwwKSB7XG5cdFx0XHR0bXAgKz0gODtcblx0XHR9XG5cdFx0aWYgKHRtcD49OCkge1xuXHRcdFx0dG1wIC09IDg7XG5cdFx0fVxuXHRcdGxvYy5waGkgPSAobnI8MWUtMTUpID8gMCA6ICgwLjUqdGhpcy5oYWxmcGkqdG1wKS9ucjtcblx0XHQvLyBsb2Muc2V0UGhpKChucjwxZS0xNSkgPyAwIDogKDAuNSp0aGlzLmhhbGZwaSp0bXApL25yKTtcblx0Ly8gICAgY29uc29sZS5sb2cobG9jKTtcblx0XHRyZXR1cm4gbG9jO1xuXHR9O1xuXHRcblx0XG5cdHRvVmVjMygpeyBcblx0XHRyZXR1cm4gdGhpcy50b0hwbG9jKCkudG9WZWMzKCk7IFxuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBGeHlmO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIFBhcnRpYWwgcG9ydGluZyB0byBKYXZhc2NyaXB0IG9mIEhlYWxwaXhCYXNlLmphdmEgZnJvbSBIZWFscGl4My4zMFxyXG4gKi9cclxuXHJcbmltcG9ydCBGeHlmIGZyb20gJy4vRnh5Zic7XHJcbmltcG9ydCBIcGxvYyBmcm9tICcuL0hwbG9jJztcclxuaW1wb3J0IFh5ZiBmcm9tICcuL1h5Zic7XHJcbmltcG9ydCBWZWMzIGZyb20gJy4vVmVjMyc7XHJcbmltcG9ydCBQb2ludGluZyBmcm9tICcuL1BvaW50aW5nJztcclxuaW1wb3J0IENpcmNsZUZpbmRlciBmcm9tICcuL0NpcmNsZUZpbmRlcic7XHJcbmltcG9ydCBacGhpIGZyb20gJy4vWnBoaSc7XHJcbmltcG9ydCBwc3RhY2sgZnJvbSAnLi9wc3RhY2snO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFJhbmdlU2V0IGZyb20gJy4vUmFuZ2VTZXQnO1xyXG5cclxuXHJcbmNsYXNzIEhlYWxwaXh7XHJcblx0XHJcblx0b3JkZXJfbWF4O1xyXG4gICAgaW52X2hhbGZwaTtcclxuICAgIHR3b3RoaXJkO1xyXG4gICAgbnNfbWF4O1xyXG4gICAgY3RhYjtcclxuICAgIHV0YWI7XHJcbiAgICB4b2Zmc2V0O1xyXG4gICAgeW9mZnNldDtcclxuICAgIGZhY2VhcnJheTtcclxuICAgIHN3YXBhcnJheTtcclxuXHRuc2lkZTtcclxuICAgIG5wZmFjZTtcclxuICAgIG5waXg7XHJcbiAgICBvcmRlcjtcclxuICAgIG5sMjtcclxuICAgIG5sMztcclxuICAgIG5sNDtcclxuICAgIGZhY3QyO1xyXG4gICAgZmFjdDE7XHJcbiAgICBuY2FwOyAvLyBwaXhlbFxyXG4gICAgYm47XHJcbiAgICBtcHI7XHJcbiAgICBjbXByO1xyXG4gICAgc21wcjtcclxuXHRcclxuICAgIGNvbnN0cnVjdG9yKG5zaWRlX2luKXtcclxuICAgICAgICB0aGlzLm9yZGVyX21heD0yOTtcclxuICAgICAgICB0aGlzLmludl9oYWxmcGkgPSAyLjAvTWF0aC5QSTtcclxuICAgICAgICB0aGlzLnR3b3RoaXJkID0gMi4wLzMuO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJ0d290aGlyZCBcIit0aGlzLnR3b3RoaXJkKTtcclxuICAgICAgICAvLyB0aGlzLm5zX21heD0xTDw8b3JkZXJfbWF4O1xyXG4gICAgICAgIHRoaXMubnNfbWF4PU1hdGgucG93KDIsIHRoaXMub3JkZXJfbWF4KTtcclxuICAgICAgICB0aGlzLmN0YWI9bmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIDAsMSwyNTYsMjU3LDIsMywyNTgsMjU5LDUxMiw1MTMsNzY4LDc2OSw1MTQsNTE1LDc3MCw3NzEsNCw1LDI2MCwyNjEsNiw3LDI2MixcclxuICAgICAgICAgICAgICAyNjMsNTE2LDUxNyw3NzIsNzczLDUxOCw1MTksNzc0LDc3NSwxMDI0LDEwMjUsMTI4MCwxMjgxLDEwMjYsMTAyNywxMjgyLDEyODMsXHJcbiAgICAgICAgICAgICAgMTUzNiwxNTM3LDE3OTIsMTc5MywxNTM4LDE1MzksMTc5NCwxNzk1LDEwMjgsMTAyOSwxMjg0LDEyODUsMTAzMCwxMDMxLDEyODYsXHJcbiAgICAgICAgICAgICAgMTI4NywxNTQwLDE1NDEsMTc5NiwxNzk3LDE1NDIsMTU0MywxNzk4LDE3OTksOCw5LDI2NCwyNjUsMTAsMTEsMjY2LDI2Nyw1MjAsXHJcbiAgICAgICAgICAgICAgNTIxLDc3Niw3NzcsNTIyLDUyMyw3NzgsNzc5LDEyLDEzLDI2OCwyNjksMTQsMTUsMjcwLDI3MSw1MjQsNTI1LDc4MCw3ODEsNTI2LFxyXG4gICAgICAgICAgICAgIDUyNyw3ODIsNzgzLDEwMzIsMTAzMywxMjg4LDEyODksMTAzNCwxMDM1LDEyOTAsMTI5MSwxNTQ0LDE1NDUsMTgwMCwxODAxLDE1NDYsXHJcbiAgICAgICAgICAgICAgMTU0NywxODAyLDE4MDMsMTAzNiwxMDM3LDEyOTIsMTI5MywxMDM4LDEwMzksMTI5NCwxMjk1LDE1NDgsMTU0OSwxODA0LDE4MDUsXHJcbiAgICAgICAgICAgICAgMTU1MCwxNTUxLDE4MDYsMTgwNywyMDQ4LDIwNDksMjMwNCwyMzA1LDIwNTAsMjA1MSwyMzA2LDIzMDcsMjU2MCwyNTYxLDI4MTYsXHJcbiAgICAgICAgICAgICAgMjgxNywyNTYyLDI1NjMsMjgxOCwyODE5LDIwNTIsMjA1MywyMzA4LDIzMDksMjA1NCwyMDU1LDIzMTAsMjMxMSwyNTY0LDI1NjUsXHJcbiAgICAgICAgICAgICAgMjgyMCwyODIxLDI1NjYsMjU2NywyODIyLDI4MjMsMzA3MiwzMDczLDMzMjgsMzMyOSwzMDc0LDMwNzUsMzMzMCwzMzMxLDM1ODQsXHJcbiAgICAgICAgICAgICAgMzU4NSwzODQwLDM4NDEsMzU4NiwzNTg3LDM4NDIsMzg0MywzMDc2LDMwNzcsMzMzMiwzMzMzLDMwNzgsMzA3OSwzMzM0LDMzMzUsXHJcbiAgICAgICAgICAgICAgMzU4OCwzNTg5LDM4NDQsMzg0NSwzNTkwLDM1OTEsMzg0NiwzODQ3LDIwNTYsMjA1NywyMzEyLDIzMTMsMjA1OCwyMDU5LDIzMTQsXHJcbiAgICAgICAgICAgICAgMjMxNSwyNTY4LDI1NjksMjgyNCwyODI1LDI1NzAsMjU3MSwyODI2LDI4MjcsMjA2MCwyMDYxLDIzMTYsMjMxNywyMDYyLDIwNjMsXHJcbiAgICAgICAgICAgICAgMjMxOCwyMzE5LDI1NzIsMjU3MywyODI4LDI4MjksMjU3NCwyNTc1LDI4MzAsMjgzMSwzMDgwLDMwODEsMzMzNiwzMzM3LDMwODIsXHJcbiAgICAgICAgICAgICAgMzA4MywzMzM4LDMzMzksMzU5MiwzNTkzLDM4NDgsMzg0OSwzNTk0LDM1OTUsMzg1MCwzODUxLDMwODQsMzA4NSwzMzQwLDMzNDEsXHJcbiAgICAgICAgICAgICAgMzA4NiwzMDg3LDMzNDIsMzM0MywzNTk2LDM1OTcsMzg1MiwzODUzLDM1OTgsMzU5OSwzODU0LDM4NTUgXSk7XHJcbiAgICAgICAgdGhpcy51dGFiPW5ldyBVaW50MTZBcnJheShbMCwxLDQsNSwxNiwxNywyMCwyMSw2NCw2NSw2OCw2OSw4MCw4MSw4NCw4NSwyNTYsMjU3LDI2MCwyNjEsMjcyLDI3MywyNzYsMjc3LFxyXG4gICAgICAgICAgICAgICAgICAzMjAsMzIxLDMyNCwzMjUsMzM2LDMzNywzNDAsMzQxLDEwMjQsMTAyNSwxMDI4LDEwMjksMTA0MCwxMDQxLDEwNDQsMTA0NSwxMDg4LFxyXG4gICAgICAgICAgICAgICAgICAxMDg5LDEwOTIsMTA5MywxMTA0LDExMDUsMTEwOCwxMTA5LDEyODAsMTI4MSwxMjg0LDEyODUsMTI5NiwxMjk3LDEzMDAsMTMwMSxcclxuICAgICAgICAgICAgICAgICAgMTM0NCwxMzQ1LDEzNDgsMTM0OSwxMzYwLDEzNjEsMTM2NCwxMzY1LDQwOTYsNDA5Nyw0MTAwLDQxMDEsNDExMiw0MTEzLDQxMTYsXHJcbiAgICAgICAgICAgICAgICAgIDQxMTcsNDE2MCw0MTYxLDQxNjQsNDE2NSw0MTc2LDQxNzcsNDE4MCw0MTgxLDQzNTIsNDM1Myw0MzU2LDQzNTcsNDM2OCw0MzY5LFxyXG4gICAgICAgICAgICAgICAgICA0MzcyLDQzNzMsNDQxNiw0NDE3LDQ0MjAsNDQyMSw0NDMyLDQ0MzMsNDQzNiw0NDM3LDUxMjAsNTEyMSw1MTI0LDUxMjUsNTEzNixcclxuICAgICAgICAgICAgICAgICAgNTEzNyw1MTQwLDUxNDEsNTE4NCw1MTg1LDUxODgsNTE4OSw1MjAwLDUyMDEsNTIwNCw1MjA1LDUzNzYsNTM3Nyw1MzgwLDUzODEsXHJcbiAgICAgICAgICAgICAgICAgIDUzOTIsNTM5Myw1Mzk2LDUzOTcsNTQ0MCw1NDQxLDU0NDQsNTQ0NSw1NDU2LDU0NTcsNTQ2MCw1NDYxLDE2Mzg0LDE2Mzg1LDE2Mzg4LFxyXG4gICAgICAgICAgICAgICAgICAxNjM4OSwxNjQwMCwxNjQwMSwxNjQwNCwxNjQwNSwxNjQ0OCwxNjQ0OSwxNjQ1MiwxNjQ1MywxNjQ2NCwxNjQ2NSwxNjQ2OCwxNjQ2OSxcclxuICAgICAgICAgICAgICAgICAgMTY2NDAsMTY2NDEsMTY2NDQsMTY2NDUsMTY2NTYsMTY2NTcsMTY2NjAsMTY2NjEsMTY3MDQsMTY3MDUsMTY3MDgsMTY3MDksMTY3MjAsXHJcbiAgICAgICAgICAgICAgICAgIDE2NzIxLDE2NzI0LDE2NzI1LDE3NDA4LDE3NDA5LDE3NDEyLDE3NDEzLDE3NDI0LDE3NDI1LDE3NDI4LDE3NDI5LDE3NDcyLDE3NDczLFxyXG4gICAgICAgICAgICAgICAgICAxNzQ3NiwxNzQ3NywxNzQ4OCwxNzQ4OSwxNzQ5MiwxNzQ5MywxNzY2NCwxNzY2NSwxNzY2OCwxNzY2OSwxNzY4MCwxNzY4MSwxNzY4NCxcclxuICAgICAgICAgICAgICAgICAgMTc2ODUsMTc3MjgsMTc3MjksMTc3MzIsMTc3MzMsMTc3NDQsMTc3NDUsMTc3NDgsMTc3NDksMjA0ODAsMjA0ODEsMjA0ODQsMjA0ODUsXHJcbiAgICAgICAgICAgICAgICAgIDIwNDk2LDIwNDk3LDIwNTAwLDIwNTAxLDIwNTQ0LDIwNTQ1LDIwNTQ4LDIwNTQ5LDIwNTYwLDIwNTYxLDIwNTY0LDIwNTY1LDIwNzM2LFxyXG4gICAgICAgICAgICAgICAgICAyMDczNywyMDc0MCwyMDc0MSwyMDc1MiwyMDc1MywyMDc1NiwyMDc1NywyMDgwMCwyMDgwMSwyMDgwNCwyMDgwNSwyMDgxNiwyMDgxNyxcclxuICAgICAgICAgICAgICAgICAgMjA4MjAsMjA4MjEsMjE1MDQsMjE1MDUsMjE1MDgsMjE1MDksMjE1MjAsMjE1MjEsMjE1MjQsMjE1MjUsMjE1NjgsMjE1NjksMjE1NzIsXHJcbiAgICAgICAgICAgICAgICAgIDIxNTczLDIxNTg0LDIxNTg1LDIxNTg4LDIxNTg5LDIxNzYwLDIxNzYxLDIxNzY0LDIxNzY1LDIxNzc2LDIxNzc3LDIxNzgwLDIxNzgxLFxyXG4gICAgICAgICAgICAgICAgICAyMTgyNCwyMTgyNSwyMTgyOCwyMTgyOSwyMTg0MCwyMTg0MSwyMTg0NCwyMTg0NSBdKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmpybGwgPSBuZXcgSW50MTZBcnJheShbMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNF0pO1xyXG4gICAgICAgIHRoaXMuanBsbCA9IG5ldyBJbnQxNkFycmF5KFsgMSwgMywgNSwgNywgMCwgMiwgNCwgNiwgMSwgMywgNSwgN10pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueG9mZnNldCA9IG5ldyBJbnQxNkFycmF5KFsgLTEsLTEsIDAsIDEsIDEsIDEsIDAsLTEgXSk7XHJcbiAgICAgICAgdGhpcy55b2Zmc2V0ID0gbmV3IEludDE2QXJyYXkoWyAwLCAxLCAxLCAxLCAwLC0xLC0xLC0xXSk7XHJcbiAgICAgICAgdGhpcy5mYWNlYXJyYXkgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFs4LCA5LDEwLDExLC0xLC0xLC0xLC0xLDEwLDExLCA4LCA5XSksLy8gU1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgSW50MTZBcnJheShbNSwgNiwgNywgNCwgOCwgOSwxMCwxMSwgOSwxMCwxMSwgOF0pLC8vIFNFXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFstMSwtMSwtMSwtMSwgNSwgNiwgNywgNCwtMSwtMSwtMSwtMV0pLC8vIEVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWzQsIDUsIDYsIDcsMTEsIDgsIDksMTAsMTEsIDgsIDksMTBdKSwgLy8gU1dcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksMTAsMTFdKSwvLyBjZW50ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWzEsIDIsIDMsIDAsIDAsIDEsIDIsIDMsIDUsIDYsIDcsIDRdKSwvLyBORVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgSW50MTZBcnJheShbLTEsLTEsLTEsLTEsIDcsIDQsIDUsIDYsLTEsLTEsLTEsLTFdKSwvLyBXXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFszLCAwLCAxLCAyLCAzLCAwLCAxLCAyLCA0LCA1LCA2LCA3XSksLy8gTldcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWzIsIDMsIDAsIDEsLTEsLTEsLTEsLTEsIDAsIDEsIDIsIDNdKS8vIE5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAvLyBxdWVzdG8gZm9yc2UgZGV2ZSBlc3NlcmUgdW4gVUludDhBcnJheS4gVmllbmUgdXNhdG8gZGEgbmVpZ2hib3Vyc1xyXG4gICAgICAgICAgdGhpcy5zd2FwYXJyYXkgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWyAwLDAsMyBdKSwvLyBTXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFsgMCwwLDYgXSksLy8gU0VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWyAwLDAsMCBdKSwvLyBFXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFsgMCwwLDUgXSksIC8vIFNXXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFsgMCwwLDAgXSksLy8gY2VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFsgNSwwLDAgXSksLy8gTkVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWyAwLDAsMCBdKSwvLyBXXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnQxNkFycmF5KFsgNiwwLDAgXSksLy8gTldcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludDE2QXJyYXkoWyAzLDAsMCBdKS8vIE5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICBpZiAobnNpZGVfaW4gPD0gdGhpcy5uc19tYXggJiYgbnNpZGVfaW4gPiAwKXtcclxuICAgICAgICAgICAgdGhpcy5uc2lkZSA9IG5zaWRlX2luO1xyXG4gICAgICAgICAgICB0aGlzLm5wZmFjZSA9IHRoaXMubnNpZGUqdGhpcy5uc2lkZTtcclxuICAgICAgICAgICAgdGhpcy5ucGl4ID0gMTIqdGhpcy5ucGZhY2U7XHJcbiAgICAgICAgICAgIHRoaXMub3JkZXIgPSB0aGlzLm5zaWRlMm9yZGVyKHRoaXMubnNpZGUpO1xyXG4gICAgICAgICAgICB0aGlzLm5sMiA9IDIqdGhpcy5uc2lkZTtcclxuICAgICAgICAgICAgdGhpcy5ubDMgPSAzKnRoaXMubnNpZGU7XHJcbiAgICAgICAgICAgIHRoaXMubmw0ID0gNCp0aGlzLm5zaWRlO1xyXG4gICAgICAgICAgICB0aGlzLmZhY3QyID0gNC4wL3RoaXMubnBpeDtcclxuICAgICAgICAgICAgdGhpcy5mYWN0MSA9ICh0aGlzLm5zaWRlPDwxKSp0aGlzLmZhY3QyO1xyXG4gICAgICAgICAgICB0aGlzLm5jYXAgPSAyKnRoaXMubnNpZGUqKHRoaXMubnNpZGUtMSk7IC8vIHBpeGVscyBpbiBlYWNoIHBvbGFyIGNhcFxyXG4gICAgLy8gY29uc29sZS5sb2coXCJvcmRlcjogXCIrdGhpcy5vcmRlcik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm5zaWRlOiBcIit0aGlzLm5zaWRlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYm4gPSBbXTtcclxuICAgICAgICB0aGlzLm1wciA9IFtdO1xyXG4gICAgICAgIHRoaXMuY21wciA9IFtdO1xyXG4gICAgICAgIHRoaXMuc21wciA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgIC8vIFRPRE8gSU5GSU5JVEUgTE9PUCEhISEhISBGSVggSVRUVFRUVFRUVFRcclxuICAgICAvLyBUT0RPIElORklOSVRFIExPT1AhISEhISEgRklYIElUVFRUVFRUVFRUXHJcbiAgICAgLy8gVE9ETyBJTkZJTklURSBMT09QISEhISEhIEZJWCBJVFRUVFRUVFRUVFxyXG4gICAgIC8vIFRPRE8gSU5GSU5JVEUgTE9PUCEhISEhISBGSVggSVRUVFRUVFRUVFRcclxuICAgICAvLyBUT0RPIElORklOSVRFIExPT1AhISEhISEgRklYIElUVFRUVFRUVFRUXHJcbiAgICAgLy8gVE9ETyBJTkZJTklURSBMT09QISEhISEhIEZJWCBJVFRUVFRUVFRUVFxyXG4gICAgIC8vIFRPRE8gSU5GSU5JVEUgTE9PUCEhISEhISBGSVggSVRUVFRUVFRUVFRcclxuICAgIC8vIFVuY2F1Z2h0IFJhbmdlRXJyb3I6IE1heGltdW0gY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXHJcbiAgICAgICAgLy8gTU9WRUQgVE8gY29tcHV0ZUJuKClcclxuLy8gICAgICAgIGZvciAobGV0IGk9MDsgaSA8PSB0aGlzLm9yZGVyX21heDsgKytpKSB7XHJcbi8vICAgICAgICBcdHRoaXMuYm5baV09bmV3IEhlYWxwaXgoMTw8aSk7XHJcbi8vICAgICAgICBcdHRoaXMubXByW2ldPWJuW2ldLm1heFBpeHJhZCgpO1xyXG4vLyAgICAgICAgXHR0aGlzLmNtcHJbaV09TWF0aC5jb3MobXByW2ldKTtcclxuLy8gICAgICAgIFx0dGhpcy5zbXByW2ldPU1hdGguc2luKG1wcltpXSk7XHJcbi8vICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29tcHV0ZUJuKCl7XHJcbiAgICBcdGZvciAobGV0IGk9MDsgaSA8PSB0aGlzLm9yZGVyX21heDsgKytpKSB7XHJcbiAgICAgICAgXHR0aGlzLmJuW2ldID0gbmV3IEhlYWxwaXgoMTw8aSk7XHJcbiAgICAgICAgXHR0aGlzLm1wcltpXSA9IHRoaXMuYm5baV0ubWF4UGl4cmFkKCk7XHJcbiAgICAgICAgXHR0aGlzLmNtcHJbaV0gPSBIcGxvYy5jb3ModGhpcy5tcHJbaV0pO1xyXG4gICAgICAgIFx0dGhpcy5zbXByW2ldID0gSHBsb2Muc2luKHRoaXMubXByW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldE5QaXgoKXtcclxuICAgIFx0cmV0dXJuIHRoaXMubnBpeDtcclxuICAgIH07XHJcbiAgICBcclxuICAgIFxyXG4gICAgZ2V0Qm91bmRhcmllcyhwaXgpe1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICAgICAgdmFyIHh5ZiA9IHRoaXMubmVzdDJ4eWYocGl4KTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiUElYRUw6IFwiK3BpeCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIlhZRiBcIit4eWYuaXgrXCIgXCIreHlmLml5K1wiIFwiK3h5Zi5mYWNlKTtcclxuICAgICAgICB2YXIgZGM9MC41L3RoaXMubnNpZGU7XHJcbiAgICAgICAgdmFyIHhjPSh4eWYuaXgrMC41KS90aGlzLm5zaWRlOyBcclxuICAgICAgICB2YXIgeWM9KHh5Zi5peSswLjUpL3RoaXMubnNpZGU7XHJcbiAgICAgICAgdmFyIGQgPSAxLjAvKHRoaXMubnNpZGUpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInhjLCB5YywgZGMgXCIreGMrXCIsXCIrIHljK1wiLFwiKyBkYyk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInhjK2RjLWQsIHljK2RjLCB4eWYuZmFjZSwgZCBcIisoeGMrZGMpICtcIixcIisgKHljK2RjKStcIixcIitcclxuXHQvLyB4eWYuZmFjZStcIixcIisgZCk7XHJcbiAgICAgICAgcG9pbnRzWzBdPW5ldyBGeHlmKHhjK2RjLCB5YytkYywgeHlmLmZhY2UpLnRvVmVjMygpO1xyXG4gICAgICAgIHBvaW50c1sxXT1uZXcgRnh5Zih4Yy1kYywgeWMrZGMsIHh5Zi5mYWNlKS50b1ZlYzMoKTtcclxuICAgICAgICBwb2ludHNbMl09bmV3IEZ4eWYoeGMtZGMsIHljLWRjLCB4eWYuZmFjZSkudG9WZWMzKCk7XHJcbiAgICAgICAgcG9pbnRzWzNdPW5ldyBGeHlmKHhjK2RjLCB5Yy1kYywgeHlmLmZhY2UpLnRvVmVjMygpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJQb2ludHMgZm9yIG5waXg6IFwiK3BpeCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhwb2ludHMpO1xyXG4gICAgLy8gaWYgKHBpeCA+IDc1MCl7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInBpeDogXCIrcGl4KTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZGM6IFwiK2RjKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwieHlmLml4OiBcIit4eWYuaXgpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJ4eWYuaXk6IFwiK3h5Zi5peSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInhjOiBcIit4Yyk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInljOiBcIit5Yyk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImQ6IFwiK2QpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBwb2ludHM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8qKiBSZXR1cm5zIGEgc2V0IG9mIHBvaW50cyBhbG9uZyB0aGUgYm91bmRhcnkgb2YgdGhlIGdpdmVuIHBpeGVsLlxyXG4gICAgICogU3RlcCAxIGdpdmVzIDQgcG9pbnRzIG9uIHRoZSBjb3JuZXJzLiBUaGUgZmlyc3QgcG9pbnQgY29ycmVzcG9uZHNcclxuICAgICAqIHRvIHRoZSBub3J0aGVybm1vc3QgY29ybmVyLCB0aGUgc3Vic2VxdWVudCBwb2ludHMgZm9sbG93IHRoZSBwaXhlbFxyXG4gICAgICogYm91bmRhcnkgdGhyb3VnaCB3ZXN0LCBzb3V0aCBhbmQgZWFzdCBjb3JuZXJzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwaXggcGl4ZWwgaW5kZXggbnVtYmVyXHJcbiAgICAgKiBAcGFyYW0gc3RlcCB0aGUgbnVtYmVyIG9mIHJldHVybmVkIHBvaW50cyBpcyA0KnN0ZXBcclxuICAgICAqIEByZXR1cm4ge0BsaW5rIFZlYzN9IGZvciBlYWNoIHBvaW50XHJcbiAgICAgKi9cclxuICAgIGdldEJvdW5kYXJpZXNXaXRoU3RlcChwaXgsIHN0ZXApe1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICAgICAgdmFyIHh5ZiA9IHRoaXMubmVzdDJ4eWYocGl4KTtcclxuICAgICAgICB2YXIgZGM9MC41L3RoaXMubnNpZGU7XHJcbiAgICAgICAgdmFyIHhjPSh4eWYuaXgrMC41KS90aGlzLm5zaWRlOyBcclxuICAgICAgICB2YXIgeWM9KHh5Zi5peSswLjUpL3RoaXMubnNpZGU7XHJcbiAgICAgICAgdmFyIGQgPSAxLjAvKHRoaXMubnNpZGUgKiBzdGVwKTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN0ZXA7IGkrKyl7XHJcbiAgICAgICAgICAgIHBvaW50c1tpXT1uZXcgRnh5Zih4YytkYyAtIGkgKiBkLCB5YytkYywgeHlmLmZhY2UpLnRvVmVjMygpO1xyXG4gICAgICAgICAgICBwb2ludHNbaSArIHN0ZXBdPW5ldyBGeHlmKHhjLWRjLCB5YytkYyAtIGkgKiBkLCB4eWYuZmFjZSkudG9WZWMzKCk7XHJcbiAgICAgICAgICAgIHBvaW50c1tpICsgMiAqIHN0ZXBdPW5ldyBGeHlmKHhjLWRjICsgaSAqIGQsIHljLWRjLCB4eWYuZmFjZSkudG9WZWMzKCk7XHJcbiAgICAgICAgICAgIHBvaW50c1tpICsgMyAqIHN0ZXBdPW5ldyBGeHlmKHhjK2RjLCB5Yy1kYyArIGkgKiBkLCB4eWYuZmFjZSkudG9WZWMzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludHM7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldFBvaW50c0Zvclh5Zih4LCB5LCBzdGVwLCBmYWNlKXtcclxuICAgICAgICBsZXQgbnNpZGUgPSBzdGVwICogTWF0aC5wb3coMiwgdGhpcy5vcmRlcik7XHJcbiAgICAgICAgbGV0IHBvaW50cyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGxldCB4eWYgPSBuZXcgWHlmKHggLCB5ICwgZmFjZSk7XHJcblxyXG4gICAgICAgIGxldCBkYyA9IDAuNSAvIG5zaWRlO1xyXG4gICAgICAgIGxldCB4YyA9ICh4eWYuaXggKyAwLjUpIC8gbnNpZGU7XHJcbiAgICAgICAgbGV0IHljID0gKHh5Zi5peSArIDAuNSkgLyBuc2lkZTtcclxuXHJcbiAgICAgICAgcG9pbnRzWzBdID0gbmV3IEZ4eWYoeGMgKyBkYywgeWMgKyBkYywgeHlmLmZhY2UpLnRvVmVjMygpO1xyXG4gICAgICAgIHBvaW50c1sxXSA9IG5ldyBGeHlmKHhjIC0gZGMsIHljICsgZGMsIHh5Zi5mYWNlKS50b1ZlYzMoKTtcclxuICAgICAgICBwb2ludHNbMl0gPSBuZXcgRnh5Zih4YyAtIGRjLCB5YyAtIGRjLCB4eWYuZmFjZSkudG9WZWMzKCk7XHJcbiAgICAgICAgcG9pbnRzWzNdID0gbmV3IEZ4eWYoeGMgKyBkYywgeWMgLSBkYywgeHlmLmZhY2UpLnRvVmVjMygpO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9pbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm5zIHRoZSBuZWlnaGJvcmluZyBwaXhlbHMgb2YgaXBpeC5cclxuICAgIFRoaXMgbWV0aG9kIHdvcmtzIGluIGJvdGggUklORyBhbmQgTkVTVCBzY2hlbWVzLCBidXQgaXNcclxuICAgIGNvbnNpZGVyYWJseSBmYXN0ZXIgaW4gdGhlIE5FU1Qgc2NoZW1lLlxyXG4gICAgQHBhcmFtIGlwaXggdGhlIHJlcXVlc3RlZCBwaXhlbCBudW1iZXIuXHJcbiAgICBAcmV0dXJuIGFycmF5IHdpdGggaW5kaWNlcyBvZiB0aGUgbmVpZ2hib3JpbmcgcGl4ZWxzLlxyXG4gICAgICBUaGUgcmV0dXJuZWQgYXJyYXkgY29udGFpbnMgKGluIHRoaXMgb3JkZXIpXHJcbiAgICAgIHRoZSBwaXhlbCBudW1iZXJzIG9mIHRoZSBTVywgVywgTlcsIE4sIE5FLCBFLCBTRSBhbmQgUyBuZWlnaGJvclxyXG4gICAgICBvZiBpcGl4LiBJZiBhIG5laWdoYm9yIGRvZXMgbm90IGV4aXN0ICh0aGlzIGNhbiBvbmx5IGhhcHBlblxyXG4gICAgICBmb3IgdGhlIFcsIE4sIEUgYW5kIFMgbmVpZ2hib3JzKSwgaXRzIGVudHJ5IGlzIHNldCB0byAtMS4gKi9cclxuICAgIG5laWdoYm91cnMoaXBpeCl7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBJbnQzMkFycmF5KDgpO1xyXG4gICAgICAgIHZhciB4eWYgPSB0aGlzLm5lc3QyeHlmKGlwaXgpO1xyXG4gICAgICAgIHZhciBpeCA9IHh5Zi5peDtcclxuICAgICAgICB2YXIgaXk9eHlmLml5O1xyXG4gICAgICAgIHZhciBmYWNlX251bT14eWYuZmFjZTtcclxuICAgIFxyXG4gICAgICAgIHZhciBuc20xID0gdGhpcy5uc2lkZS0xO1xyXG4gICAgICAgIGlmICgoaXg+MCkmJihpeDxuc20xKSYmKGl5PjApJiYoaXk8bnNtMSkpe1xyXG4gICAgICAgICAgICB2YXIgZnBpeCA9IE1hdGguZmxvb3IoZmFjZV9udW08PCgyKnRoaXMub3JkZXIpKTtcclxuICAgICAgICAgICAgdmFyIHB4MCA9IHRoaXMuc3ByZWFkX2JpdHMoaXggICk7XHJcbiAgICAgICAgICAgIHZhciBweTAgPSB0aGlzLnNwcmVhZF9iaXRzKGl5ICApPDwxO1xyXG4gICAgICAgICAgICB2YXIgcHhwID0gdGhpcy5zcHJlYWRfYml0cyhpeCsxKTtcclxuICAgICAgICAgICAgdmFyIHB5cCA9IHRoaXMuc3ByZWFkX2JpdHMoaXkrMSk8PDE7XHJcbiAgICAgICAgICAgIHZhciBweG0gPSB0aGlzLnNwcmVhZF9iaXRzKGl4LTEpO1xyXG4gICAgICAgICAgICB2YXIgcHltID0gdGhpcy5zcHJlYWRfYml0cyhpeS0xKTw8MTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSBmcGl4K3B4bStweTA7IFxyXG4gICAgICAgICAgICByZXN1bHRbMV09ZnBpeCtweG0rcHlwO1xyXG4gICAgICAgICAgICByZXN1bHRbMl09ZnBpeCtweDArcHlwOyBcclxuICAgICAgICAgICAgcmVzdWx0WzNdPWZwaXgrcHhwK3B5cDtcclxuICAgICAgICAgICAgcmVzdWx0WzRdPWZwaXgrcHhwK3B5MDsgXHJcbiAgICAgICAgICAgIHJlc3VsdFs1XT1mcGl4K3B4cCtweW07XHJcbiAgICAgICAgICAgIHJlc3VsdFs2XT1mcGl4K3B4MCtweW07IFxyXG4gICAgICAgICAgICByZXN1bHRbN109ZnBpeCtweG0rcHltO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8IDg7ICsraSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgeD1peCt0aGlzLnhvZmZzZXRbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgeT1peSt0aGlzLnlvZmZzZXRbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbmJudW09NDtcclxuICAgICAgICAgICAgICAgIGlmICh4PDApeyBcclxuICAgICAgICAgICAgICAgICAgICB4Kz10aGlzLm5zaWRlOyBcclxuICAgICAgICAgICAgICAgICAgICBuYm51bS09MTsgXHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoeD49dGhpcy5uc2lkZSl7IFxyXG4gICAgICAgICAgICAgICAgICAgIHgtPXRoaXMubnNpZGU7IFxyXG4gICAgICAgICAgICAgICAgICAgIG5ibnVtKz0xOyBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh5PDApeyBcclxuICAgICAgICAgICAgICAgICAgICB5Kz10aGlzLm5zaWRlOyBcclxuICAgICAgICAgICAgICAgICAgICBuYm51bS09MzsgXHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoeT49dGhpcy5uc2lkZSl7IFxyXG4gICAgICAgICAgICAgICAgICAgIHktPXRoaXMubnNpZGU7IFxyXG4gICAgICAgICAgICAgICAgICAgIG5ibnVtKz0zOyBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIGYgPSB0aGlzLmZhY2VhcnJheVtuYm51bV1bZmFjZV9udW1dO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoZj49MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpdHMgPSB0aGlzLnN3YXBhcnJheVtuYm51bV1bZmFjZV9udW0+Pj4yXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKGJpdHMmMSk+MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg9TWF0aC5mbG9vcih0aGlzLm5zaWRlLXgtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoYml0cyYyKT4wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk9TWF0aC5mbG9vcih0aGlzLm5zaWRlLXktMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoYml0cyY0KT4wKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGludD14OyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgeD15OyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgeT10aW50OyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldID0gdGhpcy54eWYybmVzdCh4LHksZik7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV09LTE7XHJcbiAgICAgICAgICAgICAgICB9XHRcdCAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgbnNpZGUyb3JkZXIobnNpZGUpIHtcclxuICAgICAgICByZXR1cm4gKChuc2lkZSAmIChuc2lkZS0xKSkgIT0wICkgPyAtMSA6IE1hdGgubG9nMihuc2lkZSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBuZXN0Mnh5ZihpcGl4KSB7XHRcclxuICAgICAgICB2YXIgcGl4PU1hdGguZmxvb3IoaXBpeCYodGhpcy5ucGZhY2UtMSkpO1xyXG4gICAgICAgIHZhciB4eWYgPSBuZXcgWHlmICAodGhpcy5jb21wcmVzc19iaXRzKHBpeCksIHRoaXMuY29tcHJlc3NfYml0cyhwaXg+PjEpLFxyXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcigoaXBpeD4+KDIqdGhpcy5vcmRlcikpKSk7XHJcbiAgICAgICAgcmV0dXJuIHh5ZjtcclxuICAgIH07XHJcbiAgIFxyXG4gICAgXHJcbiAgICB4eWYybmVzdChpeCwgaXksIGZhY2VfbnVtKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGZhY2VfbnVtPDwoMip0aGlzLm9yZGVyKSkgXHJcbiAgICAgICAgKyB0aGlzLnNwcmVhZF9iaXRzKGl4KSArICh0aGlzLnNwcmVhZF9iaXRzKGl5KTw8MSk7IFxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgbG9jMnBpeChocGxvYyl7XHJcbiAgICAgICAgdmFyIHo9aHBsb2MuejtcclxuICAgICAgICB2YXIgcGhpPWhwbG9jLnBoaTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgemEgPSBNYXRoLmFicyh6KTtcclxuICAgICAgICB2YXIgdHQgPSB0aGlzLmZtb2R1bG8oKHBoaSp0aGlzLmludl9oYWxmcGkpLDQuMCk7Ly8gaW4gWzAsNClcclxuICAgICAgICB2YXIgcGl4Tm87XHJcbiAgICAgICAgaWYgKHphPD10aGlzLnR3b3RoaXJkKSB7Ly8gRXF1YXRvcmlhbCByZWdpb25cclxuICAgICAgICAgICAgdmFyIHRlbXAxID0gdGhpcy5uc2lkZSooMC41K3R0KTtcclxuICAgICAgICAgICAgdmFyIHRlbXAyID0gdGhpcy5uc2lkZSooeiowLjc1KTtcclxuICAgICAgICAgICAgdmFyIGpwID0gTWF0aC5mbG9vcih0ZW1wMS10ZW1wMik7IC8vIGluZGV4IG9mIGFzY2VuZGluZyBlZGdlIGxpbmVcclxuICAgICAgICAgICAgdmFyIGptID0gTWF0aC5mbG9vcih0ZW1wMSt0ZW1wMik7IC8vIGluZGV4IG9mIGRlc2NlbmRpbmcgZWRnZSBsaW5lXHJcbiAgICAgICAgICAgIHZhciBpZnAgPSBNYXRoLmZsb29yKGpwID4+PiB0aGlzLm9yZGVyKTsgIC8vIGluIHswLDR9XHJcbiAgICAgICAgICAgIHZhciBpZm0gPSBNYXRoLmZsb29yKGptID4+PiB0aGlzLm9yZGVyKTtcclxuICAgICAgICAgICAgdmFyIGZhY2VfbnVtID0gTWF0aC5mbG9vcigoaWZwPT1pZm0pID8gKGlmcHw0KSA6ICgoaWZwPGlmbSkgPyBpZnAgOiAoaWZtKzgpKSk7XHJcbiAgICAgICAgICAgIHZhciBpeCA9IE1hdGguZmxvb3Ioam0gJiAodGhpcy5uc2lkZS0xKSk7XHJcbiAgICAgICAgICAgIHZhciBpeSA9IE1hdGguZmxvb3IodGhpcy5uc2lkZSAtIChqcCAmICh0aGlzLm5zaWRlLTEpKSAtIDEpO1xyXG4gICAgICAgICAgICBwaXhObyA9IHRoaXMueHlmMm5lc3QoaXgsIGl5LCBmYWNlX251bSk7XHJcbiAgICAgICAgfWVsc2UgeyAvLyBwb2xhciByZWdpb24sIHphID4gMi8zXHJcbiAgICAgICAgICAgIHZhciBudHQgPSBNYXRoLm1pbigzLE1hdGguZmxvb3IodHQpKTtcclxuICAgICAgICAgICAgdmFyIHRwID0gdHQtbnR0O1xyXG4gICAgICAgICAgICB2YXIgdG1wID0gKCh6YTwwLjk5KXx8KCFocGxvYy5oYXZlX3N0aCkpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubnNpZGUqTWF0aC5zcXJ0KDMqKDEtemEpKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5zaWRlKmhwbG9jLnN0aC9NYXRoLnNxcnQoKDEuMCt6YSkvMy4pO1xyXG4gICAgICAgICAgICB2YXIganAgPSBNYXRoLmZsb29yKHRwKnRtcCk7IC8vIGluY3JlYXNpbmcgZWRnZSBsaW5lIGluZGV4XHJcbiAgICAgICAgICAgIHZhciBqbSA9IE1hdGguZmxvb3IoKDEuMC10cCkqdG1wKTsgLy8gZGVjcmVhc2luZyBlZGdlIGxpbmUgaW5kZXhcclxuICAgICAgICAgICAgaWYgKGpwPj10aGlzLm5zaWRlKXtcclxuICAgICAgICAgICAgICAgIGpwID0gdGhpcy5uc2lkZS0xOyAvLyBmb3IgcG9pbnRzIHRvbyBjbG9zZSB0byB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoam0+PXRoaXMubnNpZGUpe1xyXG4gICAgICAgICAgICAgICAgam0gPSB0aGlzLm5zaWRlLTE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6Pj0wKXtcclxuICAgICAgICAgICAgICAgIHBpeE5vID0gdGhpcy54eWYybmVzdChNYXRoLmZsb29yKHRoaXMubnNpZGUtam0gLTEpLE1hdGguZmxvb3IodGhpcy5uc2lkZS1qcC0xKSxudHQpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHBpeE5vID0gdGhpcy54eWYybmVzdChNYXRoLmZsb29yKGpwKSwgTWF0aC5mbG9vcihqbSksIG50dCs4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBpeE5vO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvKiogUmV0dXJucyB0aGUgbm9ybWFsaXplZCAzLXZlY3RvciBjb3JyZXNwb25kaW5nIHRvIHRoZSBjZW50ZXIgb2YgdGhlXHJcbiAgICBzdXBwbGllZCBwaXhlbC5cclxuICAgIEBwYXJhbSBwaXggbG9uZyB0aGUgcmVxdWVzdGVkIHBpeGVsIG51bWJlci5cclxuICAgIEByZXR1cm4gdGhlIHBpeGVsJ3MgY2VudGVyIGNvb3JkaW5hdGVzLiAqL1xyXG4gICAgcGl4MnZlYyhwaXgpIHsgXHJcbiAgICBcdHJldHVybiB0aGlzLnBpeDJsb2MocGl4KS50b1ZlYzMoKTsgXHJcbiAgICB9O1xyXG5cclxuICAgICAvKiogUmV0dXJucyB0aGUgWnBoaSBjb3JyZXNwb25kaW5nIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHN1cHBsaWVkIHBpeGVsLlxyXG4gICAgICBAcGFyYW0gcGl4IHRoZSByZXF1ZXN0ZWQgcGl4ZWwgbnVtYmVyLlxyXG4gICAgICBAcmV0dXJuIHRoZSBwaXhlbCdzIGNlbnRlciBjb29yZGluYXRlcy4gKi9cclxuICAgIHBpeDJ6cGhpIChwaXgpIHsgXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGl4MmxvYyhwaXgpLnRvWnBoaSgpOyBcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHBpeCBsb25nXHJcbiAgICAgKiBAcmV0dXJuIEhwbG9jXHJcbiAgICAgKi9cclxuICAgIHBpeDJsb2MgKHBpeCl7XHJcbiAgICBcdGxldCBsb2MgPSBuZXcgSHBsb2ModW5kZWZpbmVkKTtcclxuXHJcblxyXG4gICAgXHRsZXQgeHlmID0gdGhpcy5uZXN0Mnh5ZihwaXgpO1xyXG5cclxuICAgICAgXHRsZXQganIgPSAoKHRoaXMuanJsbFt4eWYuZmFjZV0pPDx0aGlzLm9yZGVyKSAteHlmLml4IC0geHlmLml5IC0gMTtcclxuXHJcbiAgICAgIFx0bGV0IG5yO1xyXG4gICAgICBcdGlmIChqciA8IHRoaXMubnNpZGUpIHtcclxuICAgICAgXHRcdG5yID0ganI7XHJcbiAgICAgIFx0XHRsZXQgdG1wID0gKG5yKm5yKSp0aGlzLmZhY3QyO1xyXG4gICAgICBcdFx0bG9jLnogPSAxIC0gdG1wO1xyXG4gICAgICBcdFx0aWYgKGxvYy56ID4gMC45OSkgeyBcclxuICAgICAgXHRcdFx0bG9jLnN0aCA9IE1hdGguc3FydCh0bXAgKiAoMi4tdG1wKSk7IFxyXG4gICAgICBcdFx0XHRsb2MuaGF2ZV9zdGggPSB0cnVlOyBcclxuICAgICAgXHRcdH1cclxuICAgICAgICB9IGVsc2UgaWYgKGpyPnRoaXMubmwzKSB7XHJcbiAgICAgICAgXHRuciA9IHRoaXMubmw0IC0ganI7XHJcbiAgICAgICAgXHRsZXQgdG1wID0gKG5yICogbnIpICogdGhpcy5mYWN0MjtcclxuICAgICAgICBcdGxvYy56ID0gdG1wIC0gMTtcclxuICAgICAgICBcdGlmIChsb2MueiA8IC0wLjk5KSB7IFxyXG4gICAgICAgIFx0XHRsb2Muc3RoPU1hdGguc3FydCh0bXAgKiAoMi4gLSB0bXApKTsgXHJcbiAgICAgICAgXHRcdGxvYy5oYXZlX3N0aCA9IHRydWU7IH1cclxuICAgICAgICBcdH0gZWxzZSB7XHJcbiAgICAgICAgXHRcdG5yID0gdGhpcy5uc2lkZTtcclxuICAgICAgICBcdFx0bG9jLnogPSAodGhpcy5ubDIgLSBqcikgKiB0aGlzLmZhY3QxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIFx0bGV0IHRtcD0gKHRoaXMuanBsbFt4eWYuZmFjZV0pICogbnIgKyB4eWYuaXggLSB4eWYuaXk7XHJcbi8vICAgICAgXHRhc3NlcnQodG1wPDgqbnIpOyAvLyBtdXN0IG5vdCBoYXBwZW5cclxuICAgICAgXHRpZiAodG1wIDwgMCkge1xyXG4gICAgICBcdFx0dG1wICs9IDggKiBucjtcclxuICAgICAgXHR9XHJcbiAgICAgIFx0bG9jLnBoaSA9IChuciA9PSB0aGlzLm5zaWRlKSA/IDAuNzUgKiBDb25zdGFudHMuaGFsZnBpICogdG1wICogdGhpcy5mYWN0MSA6ICgwLjUgKiBDb25zdGFudHMuaGFsZnBpICogdG1wKS9ucjtcclxuICAgICAgXHQvLyBsb2Muc2V0UGhpKChuciA9PSB0aGlzLm5zaWRlKSA/IDAuNzUgKiBDb25zdGFudHMuaGFsZnBpICogdG1wICogdGhpcy5mYWN0MSA6ICgwLjUgKiBDb25zdGFudHMuaGFsZnBpICogdG1wKS9ucik7XHJcbiAgICAgIFx0cmV0dXJuIGxvYztcclxuICAgIH07XHJcbiAgICBcclxuXHJcbiAgICBhbmcycGl4KHB0ZywgbWlycm9yKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5sb2MycGl4KG5ldyBIcGxvYyhwdGcsIG1pcnJvcikpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZm1vZHVsbyh2MSwgdjIpe1xyXG4gICAgICAgIGlmICh2MT49MCl7XHJcbiAgICAgICAgICAgIHJldHVybiAodjE8djIpID8gdjEgOiB2MSV2MjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRtcD12MSV2Mit2MjtcclxuICAgICAgICByZXR1cm4gKHRtcD09PXYyKSA/IDAuMCA6IHRtcDtcclxuICAgIH07XHJcblxyXG4gICAgY29tcHJlc3NfYml0cyh2KXsgICAgXHJcbiAgICAgICAgdmFyIHJhdyAgICAgICAgPSBNYXRoLmZsb29yKCh2ICYgMHg1NTU1KSkgfCBNYXRoLmZsb29yKCgodiAmIDB4NTU1NTAwMDApID4+PiAxNSkpO1xyXG4gICAgICAgIHZhciBjb21wcmVzc2VkID0gdGhpcy5jdGFiW3JhdyAmIDB4ZmZdIHwgKHRoaXMuXHRjdGFiW3JhdyA+Pj4gOF0gPDwgNCk7XHJcbiAgICAgICAgcmV0dXJuIGNvbXByZXNzZWQ7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBcclxuICAgIHNwcmVhZF9iaXRzKHYpe1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMudXRhYlt2ICYgMHhmZl0pIHwgTWF0aC5mbG9vcigodGhpcy51dGFiWyh2Pj4+IDgpJjB4ZmZdPDwxNikpIFxyXG4gICAgICAgIHwgTWF0aC5mbG9vcigodGhpcy51dGFiWyh2Pj4+MTYpJjB4ZmZdPDwzMikpfCBNYXRoLmZsb29yKCh0aGlzLnV0YWJbKHY+Pj4yNCkmMHhmZl08PDQ4KSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8qKlxyXG5cdCAqIFJldHVybnMgYSByYW5nZSBzZXQgb2YgcGl4ZWxzIHRoYXQgb3ZlcmxhcCB3aXRoIHRoZSBjb252ZXggcG9seWdvblxyXG5cdCAqIGRlZmluZWQgYnkgdGhlIHtAY29kZSB2ZXJ0ZXh9IGFycmF5LlxyXG5cdCAqIDxwPlxyXG5cdCAqIFRoaXMgbWV0aG9kIGlzIG1vcmUgZWZmaWNpZW50IGluIHRoZSBSSU5HIHNjaGVtZS5cclxuXHQgKiA8cD5cclxuXHQgKiBUaGlzIG1ldGhvZCBtYXkgcmV0dXJuIHNvbWUgcGl4ZWxzIHdoaWNoIGRvbid0IG92ZXJsYXAgd2l0aCB0aGUgcG9seWdvblxyXG5cdCAqIGF0IGFsbC4gVGhlIGhpZ2hlciB7QGNvZGUgZmFjdH0gaXMgY2hvc2VuLCB0aGUgZmV3ZXIgZmFsc2UgcG9zaXRpdmVzIGFyZVxyXG5cdCAqIHJldHVybmVkLCBhdCB0aGUgY29zdCBvZiBpbmNyZWFzZWQgcnVuIHRpbWUuXHJcblx0ICogXHJcblx0ICogQHBhcmFtIHZlcnRleFxyXG5cdCAqICAgICAgICAgICAgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgdmVydGljZXMgb2YgdGhlIHJlcXVlc3RlZCBjb252ZXhcclxuXHQgKiAgICAgICAgICAgIHBvbHlnb24uXHJcblx0ICogQHBhcmFtIGZhY3RcclxuXHQgKiAgICAgICAgICAgIFRoZSBvdmVybGFwcGluZyB0ZXN0IHdpbGwgYmUgZG9uZSBhdCB0aGUgcmVzb2x1dGlvblxyXG5cdCAqICAgICAgICAgICAge0Bjb2RlIGZhY3QqbnNpZGV9LiBGb3IgTkVTVEVEIG9yZGVyaW5nLCB7QGNvZGUgZmFjdH0gbXVzdCBiZVxyXG5cdCAqICAgICAgICAgICAgYSBwb3dlciBvZiAyLCBlbHNlIGl0IGNhbiBiZSBhbnkgcG9zaXRpdmUgaW50ZWdlci4gQSB0eXBpY2FsXHJcblx0ICogICAgICAgICAgICBjaG9pY2Ugd291bGQgYmUgNC5cclxuXHQgKiBAcmV0dXJuIHRoZSByZXF1ZXN0ZWQgc2V0IG9mIHBpeGVsIG51bWJlciByYW5nZXNcclxuXHQgKi9cclxuICAgIHF1ZXJ5UG9seWdvbkluY2x1c2l2ZSh2ZXJ0ZXgsIGZhY3Qpe1xyXG4gICAgXHRsZXQgaW5jbHVzaXZlID0gKGZhY3QhPTApO1xyXG4gICAgICAgIGxldCBudj12ZXJ0ZXgubGVuZ3RoO1xyXG4vLyAgICAgICAgbGV0IG5jaXJjID0gaW5jbHVzaXZlID8gbnYrMSA6IG52O1xyXG5cclxuICAgICAgICBpZiAoIShudj49Mykpe1xyXG4gICAgXHRcdGNvbnNvbGUubG9nKFwibm90IGVub3VnaCB2ZXJ0aWNlcyBpbiBwb2x5Z29uXCIpO1xyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0fVxyXG4gICAgICAgIGxldCB2diA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxudjsgKytpKXtcclxuICAgICAgICBcdHZ2W2ldID0gVmVjMy5wb2ludGluZzJWZWMzKHZlcnRleFtpXSk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbm9ybWFsID0gW107XHJcbiAgICAgICAgbGV0IGZsaXA9MDtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIGxldCBiYWNrID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IHZ2Lmxlbmd0aCl7XHJcbiAgICAgICAgXHRcclxuICAgICAgICBcdGxldCBmaXJzdCA9IHZ2W2luZGV4XTtcclxuICAgICAgICAgICAgbGV0IG1lZGl1bSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgXHJcblx0XHRcdGlmIChpbmRleCA9PSB2di5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0bGFzdCA9IHZ2WzFdO1xyXG5cdFx0XHRcdG1lZGl1bSA9IHZ2WzBdO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGluZGV4ID09IHZ2Lmxlbmd0aCAtIDIpIHtcclxuXHRcdFx0XHRsYXN0ID0gdnZbMF07XHJcblx0XHRcdFx0bWVkaXVtID0gdnZbaW5kZXggKyAxXTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtZWRpdW0gPSB2dltpbmRleCArIDFdO1xyXG5cdFx0XHRcdGxhc3QgPSB2dltpbmRleCArIDJdO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRub3JtYWxbaW5kZXhdID0gZmlyc3QuY3Jvc3MobWVkaXVtKS5ub3JtKCk7XHJcblx0XHRcdGxldCBobmQgPSBub3JtYWxbaW5kZXhdLmRvdChsYXN0KTtcclxuICAgICAgICBcdFxyXG4gICAgICAgIFx0aWYgKGluZGV4ID09IDApIHtcclxuXHRcdFx0XHRmbGlwID0gKGhuZCA8IDAuKSA/IC0xIDogMTtcclxuXHJcblx0XHRcdFx0bGV0IHRtcCA9IG5ldyBQb2ludGluZyhmaXJzdCk7XHJcblx0XHRcdFx0YmFjayA9IGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxldCBmbGlwVGhuZCA9IGZsaXAgKiBobmQ7XHJcblx0XHRcdFx0aWYgKGZsaXBUaG5kIDwgMCkge1xyXG5cdFx0XHRcdFx0bGV0IHRtcCA9IG5ldyBQb2ludGluZyhtZWRpdW0pO1xyXG5cdFx0XHRcdFx0dnYuc3BsaWNlKGluZGV4ICsgMSwgMSk7XHJcblx0XHRcdFx0XHRub3JtYWwuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0XHRcdGJhY2sgPSB0cnVlO1xyXG5cdFx0XHRcdFx0aW5kZXggLT0gMTtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRsZXQgdG1wID0gbmV3IFBvaW50aW5nKGZpcnN0KTtcclxuXHRcdFx0XHRcdGJhY2sgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRub3JtYWxbaW5kZXhdLnNjYWxlKGZsaXApO1xyXG5cdFx0XHRpbmRleCArPSAxO1xyXG4gICAgICAgIFx0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG52PXZ2Lmxlbmd0aDtcclxuICAgICAgICBsZXQgbmNpcmMgPSBpbmNsdXNpdmUgPyBudisxIDogbnY7XHJcblxyXG4gICAgICAgIGxldCByYWQgPSBuZXcgQXJyYXkobmNpcmMpO1xyXG4gICAgICAgIHJhZCA9IHJhZC5maWxsKENvbnN0YW50cy5oYWxmcGkpO1xyXG4vLyAgICAgICAgcmFkID0gcmFkLmZpbGwoMS41NzA3OTYzMjY3OTQ4OTY2KTtcclxuLy8gICAgICAgIGxldCBwID0gXCIxLjU3MDc5NjMyNjc5NDg5NjZcIjtcclxuLy8gICAgICAgIHJhZCA9IHJhZC5maWxsKHBhcnNlRmxvYXQocCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpbmNsdXNpdmUpe1xyXG4gICAgICAgIFx0bGV0IGNmID0gbmV3IENpcmNsZUZpbmRlcih2dik7XHJcbiAgICAgICAgXHRub3JtYWxbbnZdID0gY2YuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgXHRyYWRbbnZdID0gSHBsb2MuYWNvcyhjZi5nZXRDb3NyYWQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5TXVsdGlEaXNjKG5vcm1hbCwgcmFkLCBmYWN0KTtcclxuXHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuXHQgKiBGb3IgTkVTVCBzY2hlbWEgb25seVxyXG5cdCAqIFxyXG5cdCAqIEBwYXJhbSBub3JtYWw6XHJcblx0ICogICAgICAgICAgICBWZWMzW11cclxuXHQgKiBAcGFyYW0gcmFkOlxyXG5cdCAqICAgICAgICAgICAgRmxvYXQzMkFycmF5XHJcblx0ICogQHBhcmFtIGZhY3Q6XHJcblx0ICogICAgICAgICAgICBUaGUgb3ZlcmxhcHBpbmcgdGVzdCB3aWxsIGJlIGRvbmUgYXQgdGhlIHJlc29sdXRpb25cclxuXHQgKiAgICAgICAgICAgIHtAY29kZSBmYWN0Km5zaWRlfS4gRm9yIE5FU1RFRCBvcmRlcmluZywge0Bjb2RlIGZhY3R9IG11c3QgYmVcclxuXHQgKiAgICAgICAgICAgIGEgcG93ZXIgb2YgMiwgZWxzZSBpdCBjYW4gYmUgYW55IHBvc2l0aXZlIGludGVnZXIuIEEgdHlwaWNhbFxyXG5cdCAqICAgICAgICAgICAgY2hvaWNlIHdvdWxkIGJlIDQuXHJcblx0ICogQHJldHVybiBSYW5nZVNldCB0aGUgcmVxdWVzdGVkIHNldCBvZiBwaXhlbCBudW1iZXIgcmFuZ2VzXHJcblx0ICovXHJcbiAgICBxdWVyeU11bHRpRGlzYyhub3JtLCByYWQsIGZhY3QpIHtcclxuICAgIFx0dGhpcy5jb21wdXRlQm4oKTtcclxuICAgIFx0XHJcbiAgICBcdGxldCBpbmNsdXNpdmUgPSAoZmFjdCE9MCk7XHJcbiAgICAgICAgbGV0IG52PW5vcm0ubGVuZ3RoO1xyXG4gICAgICAgIC8vIEhlYWxwaXhVdGlscy5jaGVjayhudj09cmFkLmxlbmd0MCxcImluY29uc2lzdGVudCBpbnB1dCBhcnJheXNcIik7XHJcbiAgICAgICAgaWYgKCEobnY9PXJhZC5sZW5ndGgpKXtcclxuICAgICAgICBcdGNvbnNvbGUuZXJyb3IoXCJpbmNvbnNpc3RlbnQgaW5wdXQgYXJyYXlzXCIpO1xyXG4gICAgICAgIFx0cmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgcmVzID0gbmV3IFJhbmdlU2V0KDQ8PDEpO1xyXG4gICAgICAgIC8vIFJlbW92ZWQgY29kZSBmb3IgU2NoZW1lLlJJTkdcclxuICAgICAgICBsZXQgb3BsdXMgPSAwO1xyXG4gICAgICAgIGlmIChpbmNsdXNpdmUpIHtcclxuXHRcdFx0aWYgKCEoTWF0aC5wb3coMiwgdGhpcy5vcmRlcl9tYXgtdGhpcy5vcmRlcik+PWZhY3QpKXtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKFwiaW52YWxpZCBvdmVyc2FtcGxpbmcgZmFjdG9yXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghKChmYWN0JihmYWN0LTEpKT09MCkpe1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJvdmVyc2FtcGxpbmcgZmFjdG9yIG11c3QgYmUgYSBwb3dlciBvZiAyXCIpO1xyXG5cdFx0XHR9XHJcblxyXG4gICAgICAgIFx0b3BsdXMgPSB0aGlzLmlsb2cyKGZhY3QpO1xyXG4gICAgICAgIFx0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvbWF4ID0gdGhpcy5vcmRlciArIG9wbHVzOyAvLyB0aGUgb3JkZXIgdXAgdG8gd2hpY2ggd2UgdGVzdFxyXG5cclxuICAgICAgICAvLyBUT0RPOiBpZ25vcmUgYWxsIGRpc2tzIHdpdGggcmFkaXVzPj1waVxyXG5cclxuLy8gICAgICAgIGxldCBjcmxpbWl0ID0gbmV3IEZsb2F0MzJBcnJheVtvbWF4KzFdW252XVszXTtcclxuICAgICAgICBsZXQgY3JsaW1pdCA9IG5ldyBBcnJheShvbWF4KzEpO1xyXG4gICAgICAgIHZhciBvO1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIGZvciAobz0wOyBvPD1vbWF4OyArK28peyAvLyBwcmVwYXJlIGRhdGEgYXQgdGhlIHJlcXVpcmVkIG9yZGVyc1xyXG4gICAgICAgIFx0Y3JsaW1pdFtvXSA9IG5ldyBBcnJheShudik7XHJcbiAgICAgICAgXHRsZXQgZHI9dGhpcy5ibltvXS5tYXhQaXhyYWQoKTsgLy8gc2FmZXR5IGRpc3RhbmNlXHJcbiAgICAgICAgICAgIGZvciAoaT0wOyBpPG52OyArK2kpe1xyXG4gICAgICAgICAgICBcdFxyXG4gICAgICAgICAgICBcdGNybGltaXRbb11baV0gPSBuZXcgRmxvYXQ2NEFycmF5KDMpO1xyXG4gICAgICAgICAgICBcdGNybGltaXRbb11baV1bMF0gPSAocmFkW2ldK2RyPk1hdGguUEkpID8gLTE6IEhwbG9jLmNvcyhyYWRbaV0rZHIpO1xyXG4gICAgICAgICAgICBcdGNybGltaXRbb11baV1bMV0gPSAobz09MCkgPyBIcGxvYy5jb3MocmFkW2ldKSA6IGNybGltaXRbMF1baV1bMV07XHJcbiAgICAgICAgICAgIFx0Y3JsaW1pdFtvXVtpXVsyXSA9IChyYWRbaV0tZHI8MC4pID8gIDEuIDogSHBsb2MuY29zKHJhZFtpXS1kcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdGsgPSBuZXcgcHN0YWNrKDEyICsgMyAqIG9tYXgpO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTwxMjsgaSsrKXsgLy8gaW5zZXJ0IHRoZSAxMiBiYXNlIHBpeGVscyBpbiByZXZlcnNlXHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG9yZGVyXHJcbiAgICAgICAgXHRzdGsucHVzaCgxMS1pLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgXHR3aGlsZSAoc3RrLnNpemUoKSA+IDApIHsgLy8gYXMgbG9uZyBhcyB0aGVyZSBhcmUgcGl4ZWxzIG9uIHRoZSBzdGFja1xyXG4gICAgICAgICAgICAvLyBwb3AgY3VycmVudCBwaXhlbCBudW1iZXIgYW5kIG9yZGVyIGZyb20gdGhlIHN0YWNrXHJcbiAgICAgICAgICAgIGxldCBwaXggPSBzdGsucHRvcCgpO1xyXG4gICAgICAgICAgICBsZXQgbyA9IHN0ay5vdG9wKCk7XHJcbiAgICAgICAgICAgIHN0ay5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwdiA9IHRoaXMuYm5bb10ucGl4MnZlYyhwaXgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHpvbmUgPSAzO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpPTA7IChpPG52KSYmKHpvbmU+MCk7ICsraSkge1xyXG4gICAgICAgICAgICBcdGxldCBjcmFkID0gcHYuZG90KG5vcm1baV0pO1xyXG4gICAgICAgICAgICBcdGZvciAobGV0IGl6PTA7IGl6PHpvbmU7ICsraXope1xyXG4gICAgICAgICAgICBcdFx0aWYgKGNyYWQgPCBjcmxpbWl0W29dW2ldW2l6XSl7XHJcbiAgICAgICAgICAgIFx0XHRcdHpvbmUgPSBpejtcdFxyXG4gICAgICAgICAgICBcdFx0fVxyXG4gICAgICAgICAgICBcdH1cclxuICAgIFx0XHR9XHJcblxyXG4gICAgICAgICAgICBpZiAoem9uZT4wKSB7XHJcbiAgICAgICAgICAgIFx0dGhpcy5jaGVja19waXhlbCAobywgb21heCwgem9uZSwgcmVzLCBwaXgsIHN0aywgaW5jbHVzaXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqIEludGVnZXIgYmFzZSAyIGxvZ2FyaXRobS5cclxuICAgIEBwYXJhbSBhcmdcclxuICAgIEByZXR1cm4gdGhlIGxhcmdlc3QgaW50ZWdlciB7QGNvZGUgbn0gdGhhdCBmdWxmaWxscyB7QGNvZGUgMl5uPD1hcmd9LlxyXG4gICAgRm9yIG5lZ2F0aXZlIGFyZ3VtZW50cyBhbmQgemVybywgMCBpcyByZXR1cm5lZC4gKi9cclxuICAgIGlsb2cyKGFyZyl7XHJcbiAgICBcdGxldCBtYXggPSBNYXRoLm1heChhcmcsIDEpO1xyXG4gICAgXHRyZXR1cm4gMzEtTWF0aC5jbHozMihtYXgpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqIENvbXB1dGVzIHRoZSBjb3NpbmUgb2YgdGhlIGFuZ3VsYXIgZGlzdGFuY2UgYmV0d2VlbiB0d28geiwgcGhpIHBvc2l0aW9uc1xyXG4gICAgICBvbiB0aGUgdW5pdCBzcGhlcmUuICovXHJcbiAgICBjb3NkaXN0X3pwaGkgKHoxLCBwaGkxLCB6MiwgcGhpMikge1xyXG4gICAgICAgIHJldHVybiB6MSAqIHoyICsgSHBsb2MuY29zKHBoaTEtcGhpMikgKiBNYXRoLnNxcnQoKDEuMC16MSp6MSkqKDEuMC16Mip6MikpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBpbnQgb1xyXG4gICAgICogQHBhcmFtIGludCBvbWF4XHJcbiAgICAgKiBAcGFyYW0gaW50IHpvbmVcclxuICAgICAqIEBwYXJhbSBSYW5nZVNldCBwaXhzZXRcclxuICAgICAqIEBwYXJhbSBsb25nIHBpeFxyXG4gICAgICogQHBhcmFtIHBzdGFjayBzdGtcclxuICAgICAqIEBwYXJhbSBib29sZWFuIGluY2x1c2l2ZVxyXG4gICAgICovXHJcbiAgICBjaGVja19waXhlbCAobywgb21heCwgem9uZSwgcGl4c2V0LCBwaXgsIHN0aywgaW5jbHVzaXZlKSB7XHJcbiAgICBcdCAgICBcclxuICAgIFx0aWYgKHpvbmU9PTApIHJldHVybjtcclxuXHJcblx0ICAgIGlmIChvPHRoaXMub3JkZXIpIHtcclxuXHQgICAgXHRpZiAoem9uZT49Mykgey8vIG91dHB1dCBhbGwgc3VicGl4ZWxzXHJcblx0ICAgIFx0XHRsZXQgc2Rpc3QgPSAyICogKHRoaXMub3JkZXItbyk7IC8vIHRoZSBcImJpdC1zaGlmdCBkaXN0YW5jZVwiIGJldHdlZW4gbWFwIG9yZGVyc1xyXG4gICAgXHQgICAgICAgIHBpeHNldC5hcHBlbmQocGl4PDxzZGlzdCwoKHBpeCsxKTw8c2Rpc3QpKTtcclxuXHQgICAgXHR9ZWxzZSB7Ly8gKHpvbmU+PTEpXHJcbiAgICBcdCAgICAgICAgZm9yIChsZXQgaT0wOyBpPDQ7ICsraSl7XHJcbiAgICBcdCAgICAgICAgICBzdGsucHVzaCg0KnBpeCszLWksbysxKTsgLy8gYWRkIGNoaWxkcmVuXHJcbiAgICBcdCAgICAgICAgfVxyXG5cdCAgICBcdH1cclxuXHQgICAgfSBlbHNlIGlmIChvPnRoaXMub3JkZXIpIHsvLyB0aGlzIGltcGxpZXMgdGhhdCBpbmNsdXNpdmU9PXRydWVcclxuICAgIFx0ICAgICAgXHJcblx0ICAgIFx0aWYgKHpvbmU+PTIpIHsvLyBwaXhlbCBjZW50ZXIgaW4gc2hhcGVcclxuICAgIFx0ICAgICAgICBwaXhzZXQuYXBwZW5kKHBpeD4+PigyKihvLXRoaXMub3JkZXIpKSk7IC8vIG91dHB1dCB0aGUgcGFyZW50IHBpeGVsIGF0IG9yZGVyXHJcbiAgICBcdCAgICAgICAgc3RrLnBvcFRvTWFyaygpOyAvLyB1bndpbmQgdGhlIHN0YWNrXHJcblx0ICAgIFx0fSBlbHNlIHsvLyAoem9uZT49MSk6IHBpeGVsIGNlbnRlciBpbiBzYWZldHkgcmFuZ2VcclxuXHQgICAgXHRcdGlmIChvPG9tYXgpIHsvLyBjaGVjayBzdWJsZXZlbHNcclxuXHQgICAgXHRcdFx0Zm9yIChsZXQgaT0wOyBpPDQ7ICsraSl7IC8vIGFkZCBjaGlsZHJlbiBpbiByZXZlcnNlIG9yZGVyXHJcblx0ICAgIFx0XHRcdFx0c3RrLnB1c2goNCpwaXgrMy1pLG8rMSk7IC8vIGFkZCBjaGlsZHJlblxyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHR9ZWxzZSB7Ly8gYXQgcmVzb2x1dGlvbiBsaW1pdFxyXG5cdCAgICBcdFx0XHRwaXhzZXQuYXBwZW5kKHBpeD4+PigyKihvLXRoaXMub3JkZXIpKSk7Ly8gb3V0cHV0IHRoZSBwYXJlbnQgcGl4ZWwgYXQgb3JkZXJcclxuXHQgICAgXHRcdFx0c3RrLnBvcFRvTWFyaygpOyAvLyB1bndpbmQgdGhlIHN0YWNrXHJcblx0ICAgIFx0XHR9XHJcblx0ICAgIFx0fVxyXG5cdCAgICB9IGVsc2Ugey8vIG89PW9yZGVyXHJcblx0ICAgIFx0aWYgKHpvbmU+PTIpe1xyXG4gICAgXHQgICAgICAgIHBpeHNldC5hcHBlbmQocGl4KTtcclxuXHQgICAgXHR9IGVsc2UgaWYgKGluY2x1c2l2ZSkgey8vIGFuZCAoem9uZT49MSlcclxuXHQgICAgXHRcdGlmICh0aGlzLm9yZGVyPG9tYXgpIHsvLyBjaGVjayBzdWJsZXZlbHNcclxuXHQgICAgXHRcdFx0c3RrLm1hcmsoKTsgLy8gcmVtZW1iZXIgY3VycmVudCBzdGFjayBwb3NpdGlvblxyXG5cdCAgICBcdFx0XHRmb3IgKGxldCBpPTA7IGk8NDsgKytpKXsgLy8gYWRkIGNoaWxkcmVuIGluIHJldmVyc2Ugb3JkZXJcclxuXHQgICAgXHRcdFx0XHRzdGsucHVzaCg0KnBpeCszLWksbysxKTsgLy8gYWRkIGNoaWxkcmVuXHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdH0gZWxzZSB7Ly8gYXQgcmVzb2x1dGlvbiBsaW1pdFxyXG4gICAgXHQgICAgICAgICAgcGl4c2V0LmFwcGVuZChwaXgpOyAvLyBvdXRwdXQgdGhlIHBpeGVsXHJcblx0ICAgIFx0XHR9XHJcblx0ICAgIFx0fVxyXG5cdCAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKiBSZXR1cm5zIHRoZSBtYXhpbXVtIGFuZ3VsYXIgZGlzdGFuY2UgYmV0d2VlbiBhIHBpeGVsIGNlbnRlciBhbmQgaXRzXHJcbiAgICBjb3JuZXJzLlxyXG4gICAgQHJldHVybiBtYXhpbXVtIGFuZ3VsYXIgZGlzdGFuY2UgYmV0d2VlbiBhIHBpeGVsIGNlbnRlciBhbmQgaXRzXHJcbiAgICAgIGNvcm5lcnMuICovXHJcbiAgICBtYXhQaXhyYWQoKSB7XHJcbiAgICBcdFxyXG4gICAgXHRsZXQgenBoaWEgPSBuZXcgWnBoaSgyLi8zLiwgTWF0aC5QSS90aGlzLm5sNCk7XHJcbiAgICBcdGxldCB4eXoxID0gdGhpcy5jb252ZXJ0WnBoaTJ4eXooenBoaWEpO1xyXG4gICAgXHRcclxuICAgIFx0bGV0IHZhID0gbmV3IFZlYzMoeHl6MVswXSwgeHl6MVsxXSwgeHl6MVsyXSk7XHJcbiAgICBcdGxldCB0MSA9IDEuLTEuL3RoaXMubnNpZGU7XHJcbiAgICBcdHQxKj10MTtcclxuICAgIFx0XHJcbiAgICBcdFxyXG4gICAgXHRsZXQgenBoaWIgPSBuZXcgWnBoaSgxLXQxLzMsIDApO1xyXG4gICAgXHRsZXQgeHl6MiA9IHRoaXMuY29udmVydFpwaGkyeHl6KHpwaGliKTtcclxuICAgIFx0XHJcbiAgICBcdGxldCB2YiA9IG5ldyBWZWMzKHh5ejJbMF0sIHh5ejJbMV0sIHh5ejJbMl0pO1xyXG4gICAgXHRyZXR1cm4gdmEuYW5nbGUodmIpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogdGhpcyBpcyBhIHdvcmthcm91bmQgcmVwbGFjaW5nIHRoZSBWZWMzKFpwaGkpIGNvbnN0cnVjdG9yLlxyXG4gICAgICovXHJcbiAgICBjb252ZXJ0WnBoaTJ4eXooenBoaSl7XHJcbiAgICBcdFxyXG4gICAgXHRsZXQgc3RoID0gTWF0aC5zcXJ0KCgxLjAtenBoaS56KSooMS4wK3pwaGkueikpO1xyXG4gICAgICAgIGxldCB4PXN0aCpIcGxvYy5jb3MoenBoaS5waGkpO1xyXG4gICAgICAgIGxldCB5PXN0aCpIcGxvYy5zaW4oenBoaS5waGkpO1xyXG4gICAgICAgIGxldCB6PXpwaGkuejtcclxuICAgICAgICByZXR1cm4gW3gsIHksIHpdO1xyXG4gICAgXHRcclxuICAgIH07XHJcblxyXG4gICAgLyoqIFJldHVybnMgYSByYW5nZSBzZXQgb2YgcGl4ZWxzIHdoaWNoIG92ZXJsYXAgd2l0aCBhIGdpdmVuIGRpc2suIDxwPlxyXG4gICAgICBUaGlzIG1ldGhvZCBpcyBtb3JlIGVmZmljaWVudCBpbiB0aGUgUklORyBzY2hlbWUuIDxwPlxyXG4gICAgICBUaGlzIG1ldGhvZCBtYXkgcmV0dXJuIHNvbWUgcGl4ZWxzIHdoaWNoIGRvbid0IG92ZXJsYXAgd2l0aFxyXG4gICAgICB0aGUgcG9seWdvbiBhdCBhbGwuIFRoZSBoaWdoZXIge0Bjb2RlIGZhY3R9IGlzIGNob3NlbiwgdGhlIGZld2VyIGZhbHNlXHJcbiAgICAgIHBvc2l0aXZlcyBhcmUgcmV0dXJuZWQsIGF0IHRoZSBjb3N0IG9mIGluY3JlYXNlZCBydW4gdGltZS5cclxuICAgICAgQHBhcmFtIHB0ZyB0aGUgYW5ndWxhciBjb29yZGluYXRlcyBvZiB0aGUgZGlzayBjZW50ZXJcclxuICAgICAgQHBhcmFtIHJhZGl1cyB0aGUgcmFkaXVzIChpbiByYWRpYW5zKSBvZiB0aGUgZGlza1xyXG4gICAgICBAcGFyYW0gZmFjdCBUaGUgb3ZlcmxhcHBpbmcgdGVzdCB3aWxsIGJlIGRvbmUgYXQgdGhlIHJlc29sdXRpb25cclxuICAgICAgICB7QGNvZGUgZmFjdCpuc2lkZX0uIEZvciBORVNURUQgb3JkZXJpbmcsIHtAY29kZSBmYWN0fSBtdXN0IGJlIGEgcG93ZXJcclxuICAgICAgICBvZiAyLCBlbHNlIGl0IGNhbiBiZSBhbnkgcG9zaXRpdmUgaW50ZWdlci4gQSB0eXBpY2FsIGNob2ljZSB3b3VsZCBiZSA0LlxyXG4gICAgICBAcmV0dXJuIHRoZSByZXF1ZXN0ZWQgc2V0IG9mIHBpeGVsIG51bWJlciByYW5nZXMgICovXHJcbiAgICBxdWVyeURpc2NJbmNsdXNpdmUocHRnLCByYWRpdXMsIGZhY3QpIHtcclxuICAgICAgICB0aGlzLmNvbXB1dGVCbigpO1xyXG4gICAgICAgIGxldCBpbmNsdXNpdmUgPSAoZmFjdCE9MCk7XHJcbiAgICAgICAgbGV0IHBpeHNldCA9IG5ldyBSYW5nZVNldCgpO1xyXG5cclxuICAgICAgICBpZiAocmFkaXVzPj1NYXRoLlBJKSB7Ly8gZGlzayBjb3ZlcnMgdGhlIHdob2xlIHNwaGVyZVxyXG4gICAgICAgICAgICBwaXhzZXQuYXBwZW5kKDAsbnBpeCk7IHJldHVybiBwaXhzZXQ7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9wbHVzPTA7XHJcbiAgICAgICAgaWYgKGluY2x1c2l2ZSkge1xyXG4gICAgICAgICAgICAvLyBIZWFscGl4VXRpbHMuY2hlY2sgKCgxTDw8b3JkZXJfbWF4KT49ZmFjdCxcImludmFsaWQgb3ZlcnNhbXBsaW5nIGZhY3RvclwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGZhY3QgJiAoZmFjdC0xKSkgPT0gMCApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJvdmVyc2FtcGxpbmcgZmFjdG9yIG11c3QgYmUgYSBwb3dlciBvZiAyXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wbHVzID0gdGhpcy5pbG9nMihmYWN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG9tYXggPSBNYXRoLm1pbih0aGlzLm9yZGVyX21heCwgdGhpcy5vcmRlciArIG9wbHVzKTsgLy8gdGhlIG9yZGVyIHVwIHRvIHdoaWNoIHdlIHRlc3RcclxuICAgICAgICBsZXQgdnB0ZyA9IFZlYzMucG9pbnRpbmcyVmVjMyhwdGcpO1xyXG4gICAgICAgIGxldCBjcnBkciA9IG5ldyBBcnJheShvbWF4KzEpO1xyXG4gICAgICAgIGxldCBjcm1kciA9IG5ldyBBcnJheShvbWF4KzEpO1xyXG5cclxuICAgICAgICBsZXQgY29zcmFkID0gSHBsb2MuY29zKHJhZGl1cyk7XHJcbiAgICAgICAgbGV0IHNpbnJhZCA9IEhwbG9jLnNpbihyYWRpdXMpO1xyXG4gICAgICAgIGZvciAobGV0IG89MDsgbzw9b21heDsgbysrKSB7Ly8gcHJlcGFyZSBkYXRhIGF0IHRoZSByZXF1aXJlZCBvcmRlcnNcclxuICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkciA9IHRoaXMubXByW29dOyAvLyBzYWZldHkgZGlzdGFuY2VcclxuICAgICAgICAgICAgbGV0IGNkciA9IHRoaXMuY21wcltvXTtcclxuICAgICAgICAgICAgbGV0IHNkciA9IHRoaXMuc21wcltvXTtcclxuICAgICAgICAgICAgY3JwZHJbb10gPSAocmFkaXVzICsgZHIgPiBNYXRoLlBJKSA/IC0xLiA6IGNvc3JhZCAqIGNkciAtIHNpbnJhZCAqIHNkcjtcclxuICAgICAgICAgICAgY3JtZHJbb10gPSAocmFkaXVzIC0gZHIgPCAwLikgICAgICA/ICAxLiA6IGNvc3JhZCAqIGNkciArIHNpbnJhZCAqIHNkcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdGsgPSBuZXcgcHN0YWNrKDEyICsgMyAqIG9tYXgpO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTwxMjsgaSsrKSB7Ly8gaW5zZXJ0IHRoZSAxMiBiYXNlIHBpeGVscyBpbiByZXZlcnNlIG9yZGVyXHJcbiAgICAgICAgICAgIHN0ay5wdXNoKDExLWksMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aGlsZSAoc3RrLnNpemUoKT4wKSB7Ly8gYXMgbG9uZyBhcyB0aGVyZSBhcmUgcGl4ZWxzIG9uIHRoZSBzdGFja1xyXG4gICAgICAgICAgICAvLyBwb3AgY3VycmVudCBwaXhlbCBudW1iZXIgYW5kIG9yZGVyIGZyb20gdGhlIHN0YWNrXHJcbiAgICAgICAgICAgIGxldCBwaXggPSBzdGsucHRvcCgpO1xyXG4gICAgICAgICAgICBsZXQgY3Vycm8gPSBzdGsub3RvcCgpO1xyXG4gICAgICAgICAgICBzdGsucG9wKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ibltjdXJyb10ucGl4MnpwaGkocGl4KTtcclxuICAgICAgICAgICAgLy8gY29zaW5lIG9mIGFuZ3VsYXIgZGlzdGFuY2UgYmV0d2VlbiBwaXhlbCBjZW50ZXIgYW5kIGRpc2sgY2VudGVyXHJcbiAgICAgICAgICAgIGxldCBjYW5nZGlzdCA9IHRoaXMuY29zZGlzdF96cGhpKHZwdGcueiwgcHRnLnBoaSwgcG9zLnosIHBvcy5waGkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNhbmdkaXN0ID4gY3JwZHJbY3Vycm9dKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgem9uZSA9IChjYW5nZGlzdDxjb3NyYWQpID8gMSA6ICgoY2FuZ2Rpc3Q8PWNybWRyW2N1cnJvXSkgPyAyIDogMyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrX3BpeGVsIChjdXJybywgb21heCwgem9uZSwgcGl4c2V0LCBwaXgsIHN0aywgaW5jbHVzaXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGl4c2V0O1xyXG4gICAgfVxyXG5cclxufSBcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhlYWxwaXg7XHJcbmV4cG9ydCB7SHBsb2MsIFZlYzMsIFBvaW50aW5nfTsiLCIvKipcbiAqIFxuICovXG5cblxuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IFZlYzMgZnJvbSAnLi9WZWMzJztcbmltcG9ydCBacGhpIGZyb20gJy4vWnBoaSc7XG5cbmNsYXNzIEhwbG9je1xuXHRzdGF0aWMgUEk0X0EgPSAwLjc4NTM5ODE1NTQ1MDgyMDkyMjg1MTU2MjU7XG5cdHN0YXRpYyBQSTRfQiA9IDAuNzk0NjYyNzM1NjE0NzkyODM2NzEzNjA0NjI5MDM5NzY0NDA0Mjk2ODc1ZS04O1xuXHRzdGF0aWMgUEk0X0MgPSAwLjMwNjE2MTY5OTc4NjgzODI5NDMwNjUxNjQ4MzA2ODc1MDI2NDU1MjQzNzM2MTQ4MDc2OWUtMTY7XG5cdHN0YXRpYyBNXzFfUEkgPSAwLjMxODMwOTg4NjE4Mzc5MDY3MTUzNzc2NzUyNjc0NTAyODc7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdGcpe1xuXHRcdHRoaXMuUEk0X0EgPSAwLjc4NTM5ODE1NTQ1MDgyMDkyMjg1MTU2MjU7XG5cdFx0dGhpcy5QSTRfQiA9IDAuNzk0NjYyNzM1NjE0NzkyODM2NzEzNjA0NjI5MDM5NzY0NDA0Mjk2ODc1ZS04O1xuXHRcdHRoaXMuUEk0X0MgPSAwLjMwNjE2MTY5OTc4NjgzODI5NDMwNjUxNjQ4MzA2ODc1MDI2NDU1MjQzNzM2MTQ4MDc2OWUtMTY7XG5cdFx0dGhpcy5NXzFfUEkgPSAwLjMxODMwOTg4NjE4Mzc5MDY3MTUzNzc2NzUyNjc0NTAyODc7XG5cdFx0aWYgKHVuZGVmaW5lZCAhPSBwdGcgKXtcbi8vXHRcdFx0aWYoICAhKCAocHRnLnRoZXRhPj0wLjApJiYocHRnLnRoZXRhPD1NYXRoLlBJKSkpe1xuLy9cdFx0XHRcdGNvbnNvbGUud2FybihcIkhwbG9jIGludmFsaWQgdGhldGEgdmFsdWVcIisgcHRnLnRoZXRhKTtcbi8vXHRcdFx0XHRjb25zb2xlLndhcm4oXCJbcGhpLCB0aGV0YV0gPSBbXCIrIHB0Zy5waGkrXCIsIFwiK3B0Zy50aGV0YStcIl1cIik7XG4vL1x0XHRcdH1cblx0XHRcdHRoaXMuc3RoID0gMC4wO1xuXHRcdFx0dGhpcy5oYXZlX3N0aD1mYWxzZTtcblx0XHRcdHRoaXMueiA9IEhwbG9jLmNvcyhwdGcudGhldGEpO1xuXHRcdFx0dGhpcy5fcGhpID0gcHRnLnBoaTtcblx0XHRcdGlmIChNYXRoLmFicyh0aGlzLnopPjAuOTkpe1xuXHRcdFx0XHR0aGlzLnN0aCA9IEhwbG9jLnNpbihwdGcudGhldGEpO1xuXHRcdFx0XHR0aGlzLmhhdmVfc3RoPXRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2V0Wih6KXtcblx0XHR0aGlzLnogPSB6O1xuXHR9O1xuXHRcblx0Z2V0IHBoaSgpe1xuXHRcdHJldHVybiB0aGlzLl9waGk7XG5cdH07XG5cblx0c2V0IHBoaShwaGkpe1xuXHRcdHRoaXMuX3BoaSA9IHBoaTtcblx0fTtcblxuXHRzZXRTdGgoc3RoKXtcblx0XHR0aGlzLnN0aCA9IHN0aDtcblx0fTtcblx0XG5cdHRvVmVjMygpe1xuXHRcdHZhciBzdCA9IHRoaXMuaGF2ZV9zdGggPyB0aGlzLnN0aCA6IE1hdGguc3FydCgoMS4wLXRoaXMueikqKDEuMCt0aGlzLnopKTtcblx0XHR2YXIgdmVjdG9yID0gbmV3IFZlYzMoc3QqSHBsb2MuY29zKHRoaXMucGhpKSxzdCpIcGxvYy5zaW4odGhpcy5waGkpLHRoaXMueik7XG5cdC8vXHR2YXIgdmVjdG9yID0gbmV3IFZlYzMoc3QqTWF0aC5jb3ModGhpcy5waGkpLHN0Kk1hdGguc2luKHRoaXMucGhpKSx0aGlzLnopO1xuXHRcdHJldHVybiB2ZWN0b3I7XG5cdH07XG5cblx0dG9acGhpKCkgeyBcblx0XHRyZXR1cm4gbmV3IFpwaGkodGhpcy56LCB0aGlzLnBoaSk7IFxuXHR9XG5cblx0XG5cdHN0YXRpYyBzaW4oZCl7XG5cdFx0XG5cdFx0bGV0IHUgPSBkICogSHBsb2MuTV8xX1BJO1xuXHRcdGxldCBxID0gTWF0aC5mbG9vcih1IDwgMCA/IHUgLSAwLjUgOiB1ICsgMC41KTtcblx0XHRsZXQgeCA9IDQuMCAqIHE7XG5cdFx0ZCAtPSB4ICogSHBsb2MuUEk0X0E7XG5cdFx0ZCAtPSB4ICogSHBsb2MuUEk0X0I7XG5cdFx0ZCAtPSB4ICogSHBsb2MuUEk0X0M7XG5cdFx0aWYgKChxICYgMSkgIT0gMCkge1xuXHRcdFx0ZCA9IC1kO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zaW5jb3NoZWxwZXIoZCk7XG5cdH07XG5cdFxuXHRcblx0c3RhdGljIGNvcyhkKXtcblx0XHRcbi8vXHRcdGxldCB1ID0gZCAqIEhwbG9jLk1fMV9QSSAtIDAuNTtcblx0XHRsZXQgdSA9IGQgKiBIcGxvYy5NXzFfUEkgLSAwLjU7XG4vL1x0XHR1IC09IDAuNTtcblx0XHRsZXQgcSA9IDEgKyAyICogTWF0aC5mbG9vcih1IDwgMCA/IHUgLSAwLjUgOiB1ICsgMC41KTtcblx0XHRsZXQgeCA9IDIuMCAqIHE7XG5cdFx0XG5cdFx0bGV0IHQgPSB4ICogSHBsb2MuUEk0X0E7XG5cdFx0ZCA9IGQgLSB0O1xuXHRcdGQgLT0geCAqIEhwbG9jLlBJNF9CO1xuXHRcdGQgLT0geCAqIEhwbG9jLlBJNF9DO1xuXHRcdGlmICgocSAmIDIpID09IDApe1xuXHRcdFx0ZCA9IC1kO1xuXHRcdH1cblx0XHRyZXR1cm4gSHBsb2Muc2luY29zaGVscGVyKGQpO1xuXHR9O1xuXHRcblx0XG5cdHN0YXRpYyBzaW5jb3NoZWxwZXIoZCl7XG5cdFx0bGV0IHMgPSBkICogZDtcblx0XHRsZXQgdSA9IC03Ljk3MjU1OTU1MDA5MDM3ODY4ODkxOTUyZS0xODtcblx0XHR1ID0gdSAqIHMgKzIuODEwMDk5NzI3MTA4NjMyMDAwOTEyNTFlLTE1O1xuXHRcdHUgPSB1ICogcyAtNy42NDcxMjIxOTExODE1ODgzMzI4ODQ4NGUtMTM7XG4gIFx0XHR1ID0gdSAqIHMgKzEuNjA1OTA0MzA2MDU2NjQ1MDE2MjkwNTRlLTEwO1xuICBcdFx0dSA9IHUgKiBzIC0yLjUwNTIxMDgzNzYzNTAyMDQ1ODEwNzU1ZS0wODtcbiAgXHRcdHUgPSB1ICogcyArMi43NTU3MzE5MjIzOTE5ODc0NzYzMDQxNmUtMDY7XG4gIFx0XHR1ID0gdSAqIHMgLTAuMDAwMTk4NDEyNjk4NDEyNjk2MTYyODA2ODA5O1xuICBcdFx0dSA9IHUgKiBzICswLjAwODMzMzMzMzMzMzMzMzMyOTc0ODIzODE1O1xuICBcdFx0dSA9IHUgKiBzIC0wLjE2NjY2NjY2NjY2NjY2NjY1NzQxNDgwODtcblx0XHRyZXR1cm4gcyp1KmQgKyBkO1xuXHR9O1xuXHRcblx0LyoqIFRoaXMgbWV0aG9kIGNhbGN1bGF0ZXMgdGhlIGFyYyBzaW5lIG9mIHggaW4gcmFkaWFucy4gVGhlIHJldHVyblxuICAgIHZhbHVlIGlzIGluIHRoZSByYW5nZSBbLXBpLzIsIHBpLzJdLiBUaGUgcmVzdWx0cyBtYXkgaGF2ZVxuICAgIG1heGltdW0gZXJyb3Igb2YgMyB1bHBzLiAqL1xuXHRzdGF0aWMgYXNpbihkKXsgXG5cdFx0cmV0dXJuIEhwbG9jLm11bHNpZ24oSHBsb2MuYXRhbjJrKE1hdGguYWJzKGQpLCBNYXRoLnNxcnQoKDErZCkqKDEtZCkpKSwgZCk7IFxuXHR9O1xuXHRcbi8qKiBUaGlzIG1ldGhvZCBjYWxjdWxhdGVzIHRoZSBhcmMgY29zaW5lIG9mIHggaW4gcmFkaWFucy4gVGhlXG4gICAgcmV0dXJuIHZhbHVlIGlzIGluIHRoZSByYW5nZSBbMCwgcGldLiBUaGUgcmVzdWx0cyBtYXkgaGF2ZVxuICAgIG1heGltdW0gZXJyb3Igb2YgMyB1bHBzLiAqL1xuXHRzdGF0aWMgYWNvcyhkKSB7XG5cdFx0cmV0dXJuIEhwbG9jLm11bHNpZ24oSHBsb2MuYXRhbjJrKE1hdGguc3FydCgoMStkKSooMS1kKSksIE1hdGguYWJzKGQpKSwgZCkgKyAoZDwwID8gTWF0aC5QSSA6IDApO1xuXHR9O1xuXHRcblx0c3RhdGljIG11bHNpZ24oeCwgeSl7XG5cdFx0bGV0IHNpZ24gPSBIcGxvYy5jb3B5U2lnbigxLCB5KTtcblx0XHRyZXR1cm4gc2lnbiAqIHg7IFxuXHR9O1xuXHRcblx0c3RhdGljIGNvcHlTaWduKG1hZ25pdHVkZSwgc2lnbil7XG5cblx0XHRyZXR1cm4gc2lnbiA8IDAgPyAtTWF0aC5hYnMobWFnbml0dWRlKSA6IE1hdGguYWJzKG1hZ25pdHVkZSk7XG5cdFx0Ly8gbGV0IGZpbmFsc2lnbiA9IDE7XG5cdFx0Ly8gaWYgKE9iamVjdC5pcyhmaW5hbHNpZ24gLCAtMCkpe1xuXHRcdC8vIFx0c2lnbiA9IC0xO1xuXHRcdC8vIH1lbHNlIGlmIChPYmplY3QuaXMoZmluYWxzaWduICwgMCkpe1xuXHRcdC8vIFx0c2lnbiA9IDE7XG5cdFx0Ly8gfWVsc2Uge1xuXHRcdC8vIFx0c2lnbiA9IE1hdGguc2lnbihmaW5hbHNpZ24pO1xuXHRcdC8vIH1cblx0XHQvLyByZXR1cm4gZmluYWxzaWduICogbWFnbml0dWRlO1xuXHR9XG5cdFxuXHRzdGF0aWMgYXRhbmhlbHBlcihzKXtcblx0ICAgIGxldCB0ID0gcyAqIHM7XG5cdCAgICBsZXQgdSA9IC0xLjg4Nzk2MDA4NDYzMDczNDk2NTYzNzQ2ZS0wNTtcblx0ICAgIHUgPSB1ICogdCArICgwLjAwMDIwOTg1MDA3NjY0NTgxNjk3NjkwNjc5Nyk7XG5cdCAgICB1ID0gdSAqIHQgKyAoLTAuMDAxMTA2MTE4MzE0ODY2NzI0ODI1NjM0NzEpO1xuXHQgICAgdSA9IHUgKiB0ICsgKDAuMDAzNzAwMjY3NDQxODg3MTMxMTkyMzI0MDMpO1xuXHQgICAgdSA9IHUgKiB0ICsgKC0wLjAwODg5ODk2MTk1ODg3NjU1NDkxNzQwODA5KTtcblx0ICAgIHUgPSB1ICogdCArICgwLjAxNjU5OTMyOTc3MzUyOTIwMTk3MDExNyk7XG5cdCAgICB1ID0gdSAqIHQgKyAoLTAuMDI1NDUxNzYyNDkzMjMxMjY0MTYxNjg2MSk7XG5cdCAgICB1ID0gdSAqIHQgKyAoMC4wMzM3ODUyNTgwMDAxMzUzMDY5OTkzODk3KTtcblx0ICAgIHUgPSB1ICogdCArICgtMC4wNDA3NjI5MTkxMjc2ODM2NTAwMDAxOTM0KTtcblx0ICAgIHUgPSB1ICogdCArICgwLjA0NjY2NjcxNTAwNzc4NDA2MjU2MzI2NzUpO1xuXHQgICAgdSA9IHUgKiB0ICsgKC0wLjA1MjM2NzQ4NTIzMDM0ODI0NTc2MTYxMTMpO1xuXHQgICAgdSA9IHUgKiB0ICsgKDAuMDU4NzY2NjM5MjkyNjY3MzU4MDg1NDMxMyk7XG5cdCAgICB1ID0gdSAqIHQgKyAoLTAuMDY2NjU3MzU3OTM2MTA4MDUyNTk4NDU2Mik7XG5cdCAgICB1ID0gdSAqIHQgKyAoMC4wNzY5MjE5NTM4MzExNzY5NjE4MzU1MDI5KTtcblx0ICAgIHUgPSB1ICogdCArICgtMC4wOTA5MDg5OTUwMDgyNDUwMDgyMjkxNTMpO1xuXHQgICAgdSA9IHUgKiB0ICsgKDAuMTExMTExMTA1NjQ4MjYxNDE4NDQzNzQ1KTtcblx0ICAgIHUgPSB1ICogdCArICgtMC4xNDI4NTcxNDI2Njc3MTMyOTM4Mzc2NSk7XG5cdCAgICB1ID0gdSAqIHQgKyAoMC4xOTk5OTk5OTk5OTY1OTEyNjU1OTQxNDgpO1xuXHQgICAgdSA9IHUgKiB0ICsgKC0wLjMzMzMzMzMzMzMzMzMxMTExMDM2OTEyNCk7XG5cdFxuXHQgICAgcmV0dXJuIHUgKiB0ICogcyArIHM7XG4gICAgfTtcblxuICAgIHN0YXRpYyBhdGFuMmsoeSwgeCkge1xuXHQgICAgbGV0IHEgPSAwLjtcblx0XG5cdCAgICBpZiAoeCA8IDApIHsgXG5cdCAgICBcdHggPSAteDsgXG5cdCAgICBcdHEgPSAtMi47IFxuXHQgICAgfVxuXHQgICAgaWYgKHkgPiB4KSB7IFxuXHQgICAgXHRsZXQgdCA9IHg7IFxuXHQgICAgXHR4ID0geTsgXG5cdCAgICBcdHkgPSAtdDsgXG5cdCAgICBcdHEgKz0gMS47IFxuXHQgICAgfVxuXHQgICAgcmV0dXJuIEhwbG9jLmF0YW5oZWxwZXIoeS94KSArIHEqKE1hdGguUEkvMik7XG4gICAgfTtcblxuIC8qKiBUaGlzIG1ldGhvZCBjYWxjdWxhdGVzIHRoZSBhcmMgdGFuZ2VudCBvZiB5L3ggaW4gcmFkaWFucywgdXNpbmdcbiB0aGUgc2lnbnMgb2YgdGhlIHR3byBhcmd1bWVudHMgdG8gZGV0ZXJtaW5lIHRoZSBxdWFkcmFudCBvZiB0aGVcbiByZXN1bHQuIFRoZSByZXN1bHRzIG1heSBoYXZlIG1heGltdW0gZXJyb3Igb2YgMiB1bHBzLiAqL1xuXHQgc3RhdGljIGF0YW4yKHksIHgpIHtcblx0XHQgbGV0IHIgPSBIcGxvYy5hdGFuMmsoTWF0aC5hYnMoeSksIHgpO1xuXHRcdFx0XG5cdFx0IHIgPSBIcGxvYy5tdWxzaWduKHIsIHgpO1xuXHRcdCBpZiAoSHBsb2MuaXNpbmYoeCkgfHwgeCA9PSAwKXtcblx0XHRcdCByID0gTWF0aC5QSS8yIC0gKEhwbG9jLmlzaW5mKHgpID8gKEhwbG9jLmNvcHlTaWduKDEsIHgpICogKE1hdGguUEkgLzIpKSA6IDApO1xuXHRcdCB9XG5cdCAgICAgIFxuXHRcdCBpZiAoSHBsb2MuaXNpbmYoeSkpe1xuXHRcdFx0IHIgPSBNYXRoLlBJLzIgLSAoSHBsb2MuaXNpbmYoeCkgPyAoSHBsb2MuY29weVNpZ24oMSwgeCkgKiAoTWF0aC5QSSoxLzQpKSA6IDApO1xuXHRcdCB9XG5cdFx0XHQgICAgICBcblx0XHQgaWYgKHkgPT0gMCl7XG5cdFx0XHQgciA9IChIcGxvYy5jb3B5U2lnbigxLCB4KSA9PSAtMSA/IE1hdGguUEkgOiAwKTtcblx0XHQgfVxuXHRcdCByZXR1cm4gSHBsb2MuaXNuYW4oeCkgfHwgSHBsb2MuaXNuYW4oeSkgPyBOYU4gOiBIcGxvYy5tdWxzaWduKHIsIHkpO1xuXHQgfTtcbiAgICBcblx0IC8qKiBDaGVja3MgaWYgdGhlIGFyZ3VtZW50IGlzIGEgTmFOIG9yIG5vdC4gKi9cblx0IHN0YXRpYyBpc25hbihkKSB7XG5cdFx0IHJldHVybiBkICE9IGQ7XG5cdCB9O1xuXG4gICAgLyoqIENoZWNrcyBpZiB0aGUgYXJndW1lbnQgaXMgZWl0aGVyIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIGluZmluaXR5LiAqL1xuICAgIHN0YXRpYyBpc2luZihkKXsgXG4gICAgXHRyZXR1cm4gTWF0aC5hYnMoZCkgPT09ICtJbmZpbml0eTsgXG4gICAgfTtcblxuXG59XG5cblxuXG5leHBvcnQgZGVmYXVsdCBIcGxvYzsiLCIvKipcbiAqIFxuICovXG5pbXBvcnQgSHBsb2MgZnJvbSAnLi9IcGxvYyc7XG5cblxuXCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBQb2ludGluZ3tcblx0XG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHsqfSB2ZWMzIFZlYzMuanNcblx0ICogQHBhcmFtIHsqfSBtaXJyb3IgXG5cdCAqIEBwYXJhbSB7Kn0gaW5fdGhldGEgcmFkaWFuc1xuXHQgKiBAcGFyYW0geyp9IGluX3BoaSByYWRpYW5zXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih2ZWMzLCBtaXJyb3IsIGluX3RoZXRhID0gdW5kZWZpbmVkLCBpbl9waGkgPSB1bmRlZmluZWQpe1xuXHRcdFxuXHRcdGlmICh2ZWMzICE9IG51bGwpe1xuXHRcdFx0dGhpcy50aGV0YSA9IEhwbG9jLmF0YW4yKE1hdGguc3FydCh2ZWMzLngqdmVjMy54K3ZlYzMueSp2ZWMzLnkpLHZlYzMueik7XG5cdFx0XHRpZihtaXJyb3Ipe1xuXHRcdFx0XHR0aGlzLnBoaSA9IC0gSHBsb2MuYXRhbjIgKHZlYzMueSx2ZWMzLngpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5waGkgPSBIcGxvYy5hdGFuMiAodmVjMy55LHZlYzMueCk7XG5cdFx0XHR9XG5cblxuXHRcdCAgICBpZiAodGhpcy5waGk8MC4wKXtcblx0XHQgICAgXHR0aGlzLnBoaSA9IHRoaXMucGhpICsgMipNYXRoLlBJO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmICh0aGlzLnBoaT49MipNYXRoLlBJKXtcblx0XHQgICAgXHR0aGlzLnBoaSA9IHRoaXMucGhpIC0gMipNYXRoLlBJO1xuXHRcdCAgICB9XG5cdFxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy50aGV0YSA9IGluX3RoZXRhO1xuXHRcdFx0dGhpcy5waGkgPSBpbl9waGk7XG5cdFx0fVxuXHRcdFxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBvaW50aW5nO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNsYXNzIFJhbmdlU2V0e1xuXHRcblx0LyoqXG5cdCAqIEBwYXJhbSBpbnQgY2FwOiBpbml0aWFsIGNhcGFjaXR5XG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihjYXApe1xuXHRcdGlmIChjYXA8MCkgY29uc29sZS5lcnJvcihcImNhcGFjaXR5IG11c3QgYmUgcG9zaXRpdmVcIik7XG5cdCAgICB0aGlzLnIgPSBuZXcgSW50MzJBcnJheShjYXA8PDEpO1xuXHQgICAgdGhpcy5zej0wO1xuXHR9O1xuXHRcblx0XG5cdC8qKiBBcHBlbmQgYSBzaW5nbGUtdmFsdWUgcmFuZ2UgdG8gdGhlIG9iamVjdC5cbiAgICBAcGFyYW0gdmFsIHZhbHVlIHRvIGFwcGVuZCAqL1xuXHRhcHBlbmQgKHZhbCkgeyBcblx0XHR0aGlzLmFwcGVuZDEodmFsLHZhbCsxKTsgXG5cdH07XG5cdFxuXHRcblx0IC8qKiBBcHBlbmQgYSByYW5nZSB0byB0aGUgb2JqZWN0LlxuICAgIEBwYXJhbSBhIGZpcnN0IGxvbmcgaW4gcmFuZ2VcbiAgICBAcGFyYW0gYiBvbmUtYWZ0ZXItbGFzdCBsb25nIGluIHJhbmdlICovXG5cdGFwcGVuZDEgKGEsIGIpIHtcblx0XHRpZiAoYT49YikgcmV0dXJuO1xuXHRcdGlmICgodGhpcy5zej4wKSAmJiAoYTw9dGhpcy5yW3RoaXMuc3otMV0pKSB7XG5cdFx0XHRpZiAoYTx0aGlzLnJbdGhpcy5zei0yXSkgY29uc29sZS5lcnJvcihcImJhZCBhcHBlbmQgb3BlcmF0aW9uXCIpO1xuXHRcdFx0aWYgKGI+dGhpcy5yW3RoaXMuc3otMV0pIHRoaXMuclt0aGlzLnN6LTFdPWI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIHRoaXMuZW5zdXJlQ2FwYWNpdHkodGhpcy5zeisyKTtcblx0XHRsZXQgY2FwID0gdGhpcy5zeisyO1xuXHRcdGlmICh0aGlzLnIubGVuZ3RoIDwgY2FwKSB7XG5cdFx0XHRsZXQgbmV3c2l6ZSA9IE1hdGgubWF4KCAyICogdGhpcy5yLmxlbmd0aCxjYXApO1xuXHRcdFx0bGV0IHJuZXcgPSBuZXcgSW50MzJBcnJheShuZXdzaXplKTtcblx0XHRcdHJuZXcuc2V0KHRoaXMucik7XG5cdFx0XHR0aGlzLnIgPSBybmV3O1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLnJbdGhpcy5zel0gPSBhO1xuXHRcdHRoaXMuclt0aGlzLnN6KzFdID0gYjtcblx0XHR0aGlzLnN6Kz0yO1xuXHR9O1xuXHRcblx0LyoqIE1ha2Ugc3VyZSB0aGUgb2JqZWN0IGNhbiBob2xkIGF0IGxlYXN0IHRoZSBnaXZlbiBudW1iZXIgb2YgZW50cmllcy4gXG5cdCAqIEBwYXJhbSBjYXAgaW50XG5cdCAqICovXG4gIFx0ZW5zdXJlQ2FwYWNpdHkoY2FwKSB7IFxuICBcdFx0aWYgKHRoaXMuci5sZW5ndGggPCBjYXApIFxuICBcdFx0XHR0aGlzLnJlc2l6ZSAoTWF0aC5tYXgoIDIgKiB0aGlzLnIubGVuZ3RoLGNhcCkpOyBcbiAgXHR9O1xuXHRcblx0LyoqXG5cdCAqIEBwYXJhbSBuZXdzaXplIGludFxuXHQgKi9cblx0cmVzaXplKG5ld3NpemUpIHtcblx0XHRpZiAobmV3c2l6ZTx0aGlzLnN6KSAgY29uc29sZS5lcnJvcihcInJlcXVlc3RlZCBhcnJheSBzaXplIHRvbyBzbWFsbFwiKTtcblx0XHRpZiAobmV3c2l6ZSA9PSB0aGlzLnIubGVuZ3RoKSByZXR1cm47XG5cdFx0bGV0IHJuZXcgPSBuZXcgSW50MzJBcnJheShuZXdzaXplKTtcblx0XHRsZXQgc2xpY2VkID0gdGhpcy5yLnNsaWNlKDAsIHRoaXMuc3ogKyAxKTtcbi8vXHRcdHRoaXMuYXJyYXlDb3B5KHRoaXMuciwgMCwgcm5ldywgMCwgdGhpcy5zeik7XG5cdFx0dGhpcy5yID0gc2xpY2VkO1xuICAgIH07XG5cdFxuLy9cdGFycmF5Q29weShzcmMsIHNyY0luZGV4LCBkZXN0LCBkZXN0SW5kZXgsIGxlbmd0aCkge1xuLy9cdFx0ZGVzdC5zcGxpY2UoZGVzdEluZGV4LCBsZW5ndGgsIC4uLnNyYy5zbGljZShzcmNJbmRleCwgc3JjSW5kZXggKyBsZW5ndGgpKTtcbi8vXHR9O1xuXG4gIFxuICBcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmFuZ2VTZXQ7IiwiLyoqXG4gKiBQYXJ0aWFsIHBvcnRpbmcgdG8gSmF2YXNjcmlwdCBvZiBWZWMzLmphdmEgZnJvbSBIZWFscGl4My4zMCAgXG4gKi9cblxuaW1wb3J0IEhwbG9jIGZyb20gJy4vSHBsb2MnO1xuaW1wb3J0IFBvaW50aW5nIGZyb20gJy4vUG9pbnRpbmcnO1xuXG5cInVzZSBzdHJpY3RcIjtcbmNsYXNzIFZlYzN7XG5cdFxuXHR4O1xuXHR5O1xuXHR6O1xuXHRcblx0Y29uc3RydWN0b3IoeCwgeSwgeil7XG5cblx0XHRpZiAodHlwZW9mIHggPT09IFBvaW50aW5nKSB7XG5cdFx0XHRsZXQgc3RoID0gSHBsb2Muc2luKHB0Zy50aGV0YSk7XG5cdFx0XHR0aGlzLng9c3RoKkhwbG9jLmNvcyhwdGcucGhpKTtcblx0XHRcdHRoaXMueT1zdGgqSHBsb2Muc2luKHB0Zy5waGkpO1xuXHRcdFx0dGhpcy56PUhwbG9jLmNvcyhwdGcudGhldGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy54ID0geDtcblx0XHRcdHRoaXMueSA9IHk7XG5cdFx0XHR0aGlzLnogPSB6O1xuXHRcdH1cblx0XHRcblx0fVxuXHRnZXRYKCl7XG5cdFx0ICByZXR1cm4gdGhpcy54O1xuXHR9O1xuXHRcdFxuXHRnZXRZKCl7XG5cdCAgcmV0dXJuIHRoaXMueTtcblx0fTtcblx0XG5cdGdldFooKXtcblx0ICByZXR1cm4gdGhpcy56O1xuXHR9O1xuXHRcblx0LyoqIFNjYWxlIHRoZSB2ZWN0b3IgYnkgYSBnaXZlbiBmYWN0b3JcbiAgICBAcGFyYW0gbiB0aGUgc2NhbGUgZmFjdG9yICovXG5cdHNjYWxlKG4pe1xuXHRcdHRoaXMueCo9bjsgXG5cdFx0dGhpcy55Kj1uOyBcblx0XHR0aGlzLnoqPW47XG5cdH07XG5cdFxuXHQvKiogVmVjdG9yIGNyb3NzIHByb2R1Y3QuXG4gICAgQHBhcmFtIHYgYW5vdGhlciB2ZWN0b3JcbiAgICBAcmV0dXJuIHRoZSB2ZWN0b3IgY3Jvc3MgcHJvZHVjdCBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCB7QGNvZGUgdn0gKi9cblx0Y3Jvc3Modil7XG5cdFx0cmV0dXJuIG5ldyBWZWMzKHRoaXMueSp2LnogLSB2LnkqdGhpcy56LCB0aGlzLnoqdi54IC0gdi56KnRoaXMueCwgdGhpcy54KnYueSAtIHYueCp0aGlzLnkpO1xuXHR9O1xuXHRcblx0LyoqIFZlY3RvciBhZGRpdGlvblxuXHQgICAgKiBAcGFyYW0gdiB0aGUgdmVjdG9yIHRvIGJlIGFkZGVkXG5cdCAgICAqIEByZXR1cm4gYWRkaXRpb24gcmVzdWx0ICovXG5cdGFkZCh2KXsgXG5cdFx0cmV0dXJuIG5ldyBWZWMzKHRoaXMueCt2LngsIHRoaXMueSt2LnksIHRoaXMueit2LnopOyBcblx0fTtcblx0XG5cdC8qKiBOb3JtYWxpemUgdGhlIHZlY3RvciAqL1xuXHRub3JtYWxpemUoKXtcblx0ICAgIGxldCBkID0gMS4vdGhpcy5sZW5ndGgoKTtcblx0ICAgIHRoaXMueCAqPSBkOyBcblx0ICAgIHRoaXMueSAqPSBkOyBcblx0ICAgIHRoaXMueiAqPSBkO1xuXHR9O1xuXHRcblx0LyoqIFJldHVybiBub3JtYWxpemVkIHZlY3RvciAqL1xuXHRub3JtKCkge1xuXHRcdGxldCBkID0gMS4vdGhpcy5sZW5ndGgoKTtcblx0XHRyZXR1cm4gbmV3IFZlYzModGhpcy54KmQsIHRoaXMueSpkLCB0aGlzLnoqZCk7XG5cdH07XG5cdCAgXG5cdC8qKiBWZWN0b3IgbGVuZ3RoXG4gICAgQHJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuICovXG5cdGxlbmd0aCgpeyBcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMubGVuZ3RoU3F1YXJlZCgpKTsgXG5cdH07XG5cbiAgLyoqIFNxdWFyZWQgdmVjdG9yIGxlbmd0aFxuICAgICAgQHJldHVybiB0aGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci4gKi9cblx0bGVuZ3RoU3F1YXJlZCgpeyBcblx0XHRyZXR1cm4gdGhpcy54KnRoaXMueCArIHRoaXMueSp0aGlzLnkgKyB0aGlzLnoqdGhpcy56OyBcbiAgXHR9O1xuICBcdFxuICBcdC8qKiBDb21wdXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdGhlIHRoaXMgdmVjdG9yIGFuZCB7QGNvZGUgdjF9LlxuICAgICAqIEBwYXJhbSB2MSBhbm90aGVyIHZlY3RvclxuICAgICAqIEByZXR1cm4gZG90IHByb2R1Y3QgKi9cbiAgXHRkb3QodjEpeyBcblx0ICAgcmV0dXJuIHRoaXMueCp2MS54ICsgdGhpcy55KnYxLnkgKyB0aGlzLnoqdjEuejsgXG4gICBcdH07XG4gICBcdFxuICAgXHQvKiogVmVjdG9yIHN1YnRyYWN0aW9uXG4gICAgICogQHBhcmFtIHYgdGhlIHZlY3RvciB0byBiZSBzdWJ0cmFjdGVkXG4gICAgICogQHJldHVybiBzdWJ0cmFjdGlvbiByZXN1bHQgKi9cbiAgIFx0c3ViKHYpeyBcbiAgIFx0XHRyZXR1cm4gbmV3IFZlYzModGhpcy54LXYueCwgdGhpcy55LXYueSwgdGhpcy56LXYueik7IFxuICAgXHR9O1xuXHRcbiAgIC8qKiBWZWN0b3IgY3Jvc3MgcHJvZHVjdC5cbiAgIEBwYXJhbSB2IGFub3RoZXIgdmVjdG9yXG4gICBAcmV0dXJuIHRoZSB2ZWN0b3IgY3Jvc3MgcHJvZHVjdCBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCB7QGNvZGUgdn0gKi9cbiAgIFx0Y3Jvc3Modil7IFxuICAgXHRcdHJldHVybiBuZXcgVmVjMyh0aGlzLnkqdi56IC0gdi55KnRoaXMueiwgdGhpcy56KnYueCAtIHYueip0aGlzLngsIHRoaXMueCp2LnkgLSB2LngqdGhpcy55KTsgXG4gICBcdH07XG4gICBcdFxuICAgXHQvKiogQW5nbGUgYmV0d2VlbiB0d28gdmVjdG9ycy5cbiAgICBAcGFyYW0gdjEgYW5vdGhlciB2ZWN0b3JcbiAgICBAcmV0dXJuIHRoZSBhbmdsZSBpbiByYWRpYW5zIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIHtAY29kZSB2MX07XG4gICAgICBjb25zdHJhaW5lZCB0byB0aGUgcmFuZ2UgWzAsUEldLiAqL1xuICAgXHRhbmdsZSh2MSkgeyBcbiAgIFx0XHRyZXR1cm4gSHBsb2MuYXRhbjIodGhpcy5jcm9zcyh2MSkubGVuZ3RoKCksIHRoaXMuZG90KHYxKSk7IFxuICAgXHR9XG4gICBcdFxuICAgXHQvKiogSW52ZXJ0IHRoZSBzaWducyBvZiBhbGwgY29tcG9uZW50cyAqL1xuICAgIGZsaXAoKSB7IFxuICAgIFx0dGhpcy54ICo9IC0xLjA7XG4gICAgXHR0aGlzLnkgKj0gLTEuMDtcbiAgICBcdHRoaXMueiAqPSAtMS4wO1xuICAgIH1cbiAgIFx0XG4gICBcdHN0YXRpYyBwb2ludGluZzJWZWMzKHBvaW50aW5nKXtcbiAgIFx0XHRsZXQgc3RoID0gSHBsb2Muc2luKHBvaW50aW5nLnRoZXRhKTtcbiAgIFx0ICAgIGxldCB4ID0gc3RoICogSHBsb2MuY29zKHBvaW50aW5nLnBoaSk7XG4gICBcdCAgICBsZXQgeSA9IHN0aCAqIEhwbG9jLnNpbihwb2ludGluZy5waGkpO1xuICAgXHQgICAgbGV0IHogPSBIcGxvYy5jb3MocG9pbnRpbmcudGhldGEpO1xuICAgXHQgICAgcmV0dXJuIG5ldyBWZWMzKHgsIHksIHopO1xuICAgXHQgICAgXG4gICBcdH07XG59IFxuXG5leHBvcnQgZGVmYXVsdCBWZWMzOyIsIi8qKlxuICogUGFydGlhbCBwb3J0aW5nIHRvIEphdmFzY3JpcHQgb2YgWHlmLmphdmEgZnJvbSBIZWFscGl4My4zMCAgXG4gKi9cblwidXNlIHN0cmljdFwiO1xuY2xhc3MgWHlme1xuXHRjb25zdHJ1Y3Rvcih4LCB5LCBmKXtcblx0XHR0aGlzLml4ID0geDtcblx0XHR0aGlzLml5ID0geTtcblx0XHR0aGlzLmZhY2UgPSBmO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBYeWYgXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuY2xhc3MgWnBoaXtcblx0XG5cdHo7XG5cdHBoaTtcblx0XG5cdC8qKiBDcmVhdGlvbiBmcm9tIGluZGl2aWR1YWwgY29tcG9uZW50cyAqL1xuXHRjb25zdHJ1Y3Rvcih6XywgcGhpXyl7XG4gICAgXHR0aGlzLno9el87IFxuXHRcdHRoaXMucGhpPXBoaV87IFxuXHR9O1xuXHRcbn1cblxuZXhwb3J0IGRlZmF1bHQgWnBoaTsiLCJcInVzZSBzdHJpY3RcIjtcbmNsYXNzIHBzdGFja3tcblx0XG5cdHA7XG5cdG87XG5cdHM7XG5cdG07XG5cdFxuXHQvKiogQ3JlYXRpb24gZnJvbSBpbmRpdmlkdWFsIGNvbXBvbmVudHMgKi9cblx0Y29uc3RydWN0b3Ioc3ope1xuICAgIFx0dGhpcy5wID0gbmV3IEFycmF5KHN6KTsgXG5cdFx0dGhpcy5vID0gbmV3IEludDMyQXJyYXkoc3opO1xuXHRcdHRoaXMucyA9IDA7XG5cdFx0dGhpcy5tID0gMDtcblx0fTtcblx0XG5cdC8qKlxuXHQgKiBAcGFyYW0gcCBsb25nXG5cdCAqIEBwYXJhbSBvIGludFxuXHQgKi9cblx0cHVzaCAocF8sIG9fKXsgXG5cdFx0dGhpcy5wW3RoaXMuc109IHBfOyBcblx0XHR0aGlzLm9bdGhpcy5zXT0gb187IFxuXHRcdCsrdGhpcy5zO1xuXHR9O1xuXHRcbiAgXHRwb3AgKCl7IFxuICBcdFx0LS10aGlzLnM7IFxuICBcdH07XG4gIFxuICBcdHBvcFRvTWFyayAoKXsgXG4gIFx0XHR0aGlzLnM9dGhpcy5tOyBcbiAgXHR9O1xuICBcblx0c2l6ZSAoKXsgXG5cdFx0cmV0dXJuIHRoaXMuczsgXG5cdH07XG4gIFxuXG5cdG1hcmsgKCl7IFxuXHRcdHRoaXMubT10aGlzLnM7IFxuXHR9O1xuICBcblx0b3RvcCAoKXsgXG5cdFx0cmV0dXJuIHRoaXMub1t0aGlzLnMtMV07IFxuXHR9O1xuICBcblx0cHRvcCAoKXsgXG5cdFx0cmV0dXJuIHRoaXMucFt0aGlzLnMtMV07IFxuXHR9O1xuXHRcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHN0YWNrOyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBTdW1tYXJ5LiAoYmxhIGJsYSBibGEpXG4gKlxuICogRGVzY3JpcHRpb24uIChibGEgYmxhIGJsYSlcbiAqIFxuICogQGxpbmsgICBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL2ZhYjc3L3djc2xpZ2h0XG4gKiBAYXV0aG9yIEZhYnJpemlvIEdpb3JkYW5vIDxmYWJyaXppb2dpb3JkYW5vNzdAZ21haWwuY29tPlxuICovXG5cbmltcG9ydCBQcm9qRmFjdG9yeSBmcm9tIFwiLi9wcm9qZWN0aW9ucy9Qcm9qRmFjdG9yeVwiO1xuaW1wb3J0IEhFQUxQaXhQcm9qZWN0aW9uIGZyb20gXCIuL3Byb2plY3Rpb25zL0hFQUxQaXhQcm9qZWN0aW9uXCI7XG5cbmltcG9ydCBIUFhUaWxlc01hcE5vdERlZmluZWQgZnJvbSBcIi4vZXhjZXB0aW9ucy9IUFhUaWxlc01hcE5vdERlZmluZWRcIjtcblxuY2xhc3MgV0NTTGlnaHQge1xuXG4gICAgX2lucHJvamVjdGlvbjtcbiAgICBfb3V0cHJvamVjdGlvbjtcbiAgICAvLyB1c2VkIG9ubHkgd2hlbiBIRUFMUGl4IGlzIHRoZSBpbnB1dCBwcm9qZWN0aW9uLiBNYXAgb2YgKFJBLCBEZWMsIG91dHBfaSwgb3V0cF9qKSBwb2ludHMgb3JnYW5pc2VkIHBlciB0aWxlLlxuICAgIF90aWxlc01hcDsgXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0geyp9IGNlbnRlciB7XCJyYVwiOixcImRlY1wifSBpbiBkZWdyZWVzXG4gICAgICogQHBhcmFtIHsqfSByYWRpdXMgZGVjaW1hbCBkZWdcbiAgICAgKiBAcGFyYW0geyp9IHB4c2l6ZSBkZWNpbWFsIGRlZ1xuICAgICAqIEBwYXJhbSB7Kn0gcHJvamVjdGlvbiBmcm9tIGNvbnN0YW50P1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNlbnRlciwgcmFkaXVzLCBweHNpemUsIG91dFByb2plY3Rpb25OYW1lLCBpblByb2plY3Rpb25OYW1lKSB7XG4gICAgICAgIHRoaXMuX3RpbGVzTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fb3V0cHJvamVjdGlvbiA9IFByb2pGYWN0b3J5LmdldChjZW50ZXIsIHJhZGl1cywgcHhzaXplLCBvdXRQcm9qZWN0aW9uTmFtZSk7XG4gICAgICAgICAgICB0aGlzLl9pbnByb2plY3Rpb24gPSBQcm9qRmFjdG9yeS5nZXQoY2VudGVyLCByYWRpdXMsIHB4c2l6ZSwgaW5Qcm9qZWN0aW9uTmFtZSk7XG4gICAgICAgICAgICB0aGlzLl9vdXRwcm9qZWN0aW9uLmdlbmVyYXRlUHhNYXRyaXgoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnByb2plY3Rpb24gaW5zdGFuY2VvZiBIRUFMUGl4UHJvamVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpbGVzTWFwID0gdGhpcy5faW5wcm9qZWN0aW9uLmdlbmVyYXRlVGlsZXNNYXAodGhpcy5fb3V0cHJvamVjdGlvbi5nZXRQeE1hcCgpKTtcbiAgICAgICAgICAgICAgICAvLyB0aGUgcHJvZ3JhbSBjYWxsaW5nIFdDU0xpZ2h0IG11c3QgaXRlcmF0ZSBvdmVyIHRpbGVzTWFwIGFuZDpcbiAgICAgICAgICAgICAgICAvLyAgLSByZXRyaWV2ZSB0aGUgRklUUyBmaWxlIGFuZCBleHRyYWN0IHRoZSBkYXRhIChwaXhlbHMgdmFsdWVzKVxuICAgICAgICAgICAgICAgIC8vICAtIGNhbGwgV0NTIHByb2Nlc3MoZGF0YSwgdGlsZXNNYXBbbl0pIHdoaWNoIGZpbGxzIHRoZSB2YWx1ZXMgaW4gdGhlIG91dHB1dCBmb3IgdGhlIGdpdmVuIGlucHV0IHRpbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlLmdldEVycm9yKCkpO1xuICAgICAgICAgICAgZXhpdCgtMSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHByb2Nlc3NEYXRhKGluRGF0YSwgdGlsZW5vKSB7XG5cbiAgICAgICAgLy8gZm9yZWFjaCBJbWFnZUl0ZW0gaWkgaW4gdGhpcy5fdGlsZXNNYXBbdGlsZW5vXTpcbiAgICAgICAgLy8gIC0gcHh2YWwgPSB0aGlzLl9pbnByb2plY3Rpb24ud29ybGQycGl4KGlpLnJhLCBpaS5kZWMpXG4gICAgICAgIC8vICAtIHRoaXMuX291dHByb2plY3Rpb24uX3B4bWFwW2lpLmldW2lpLmpdID0gcHh2YWxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdCBzaG91bGQgYmUgY2FsbGVkIG9ubHkgd2hlbiBIRUFMUGl4IGlzIHVzZWQgYXMgaW5wdXQgcHJvamVjdGlvbi4gXG4gICAgICovXG4gICAgZ2V0SEVBTFBpeFRpbGVzTWFwICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RpbGVzTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBIUFhUaWxlc01hcE5vdERlZmluZWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdGlsZXNNYXA7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdDU0xpZ2h0OyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBTdW1tYXJ5LiAoYmxhIGJsYSBibGEpXG4gKlxuICogRGVzY3JpcHRpb24uIChibGEgYmxhIGJsYSlcbiAqIFxuICogQGxpbmsgICBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL2ZhYjc3L3djc2xpZ2h0XG4gKiBAYXV0aG9yIEZhYnJpemlvIEdpb3JkYW5vIDxmYWJyaXppb2dpb3JkYW5vNzdAZ21haWwuY29tPlxuICovXG5cbmNsYXNzIEhQWFRpbGVzTWFwTm90RGVmaW5lZCB7XG5cbiAgICBfZXJyb3I7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9qZWN0aW9uKSAge1xuICAgICAgICB0aGlzLl9lcnJvciA9IFwiSEVBTFBpeCB0aWxlcyBtYXAgbm90IGRlZmluZWQuIENoZWNrIGlmIEhFQUxQaXggaXMgdXNlZCBhcyBpbnB1dCBwcm9qZWN0aW9uLlwiO1xuICAgIH1cblxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEhQWFRpbGVzTWFwTm90RGVmaW5lZDsiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogU3VtbWFyeS4gKGJsYSBibGEgYmxhKVxuICpcbiAqIERlc2NyaXB0aW9uLiAoYmxhIGJsYSBibGEpXG4gKiBcbiAqIEBsaW5rICAgZ2l0aHViIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWI3Ny93Y3NsaWdodFxuICogQGF1dGhvciBGYWJyaXppbyBHaW9yZGFubyA8ZmFicml6aW9naW9yZGFubzc3QGdtYWlsLmNvbT5cbiAqL1xuXG5jbGFzcyBQcm9qZWN0aW9uTm90Rm91bmQge1xuXG4gICAgX2Vycm9yO1xuXG4gICAgY29uc3RydWN0b3IocHJvamVjdGlvbikgIHtcbiAgICAgICAgdGhpcy5fZXJyb3IgPSBcIlByb2plY3Rpb24gXCIgKyBwcm9qZWN0aW9uICsgXCIgbm90IGZvdW5kXCI7XG4gICAgfVxuXG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvamVjdGlvbk5vdEZvdW5kOyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBTdW1tYXJ5LiAoYmxhIGJsYSBibGEpXG4gKlxuICogRGVzY3JpcHRpb24uIChibGEgYmxhIGJsYSlcbiAqIFxuICogQGxpbmsgICBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL2ZhYjc3L3djc2xpZ2h0XG4gKiBAYXV0aG9yIEZhYnJpemlvIEdpb3JkYW5vIDxmYWJyaXppb2dpb3JkYW5vNzdAZ21haWwuY29tPlxuICovXG5cbmNsYXNzIEltYWdlSXRlbSB7XG4gICAgX3JhOyAgICAvLyBkZWNpbWFsIGRlZ3JlZXNcbiAgICBfZGVjOyAgIC8vIGRlY2ltYWwgZGVncmVlc1xuICAgIF9pOyAgICAgLy8gaW50XG4gICAgX2o7ICAgICAvLyBpbnRcbiAgICBfdmFsdWU7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0geyp9IHJhIHdvcmxkIGNvb3JkaW5hdGVcbiAgICAgKiBAcGFyYW0geyp9IGRlYyB3b3JsZCBjb29yZGluYXRlXG4gICAgICogQHBhcmFtIHsqfSBpIHBpeGVsIGNvb3JkaW5hdGUgaW4gRklUU1xuICAgICAqIEBwYXJhbSB7Kn0gaiBwaXhlbCBjb29yZGluYXRlIGluIEZJVFNcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAocmEsIGRlYywgaSwgaikge1xuICAgICAgICB0aGlzLl9yYSA9IHJhO1xuICAgICAgICB0aGlzLl9kZWMgPSBkZWM7XG4gICAgICAgIHRoaXMuX2kgPSBpO1xuICAgICAgICB0aGlzLl9qID0gajtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsXG4gICAgICovXG4gICAgc2V0IHZhbHVlKHZhbCkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbDtcbiAgICB9XG5cbiAgICBnZXRSQSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JhO1xuICAgIH1cblxuICAgIGdldERlYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlYztcbiAgICB9XG5cbiAgICBnZXRpKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faTtcbiAgICB9XG5cbiAgICBnZXRqKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fajtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBJbWFnZUl0ZW07IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIFN1bW1hcnkuIChibGEgYmxhIGJsYSlcbiAqXG4gKiBEZXNjcmlwdGlvbi4gKGJsYSBibGEgYmxhKVxuICogXG4gKiBAbGluayAgIGdpdGh1YiBodHRwczovL2dpdGh1Yi5jb20vZmFiNzcvd2NzbGlnaHRcbiAqIEBhdXRob3IgRmFicml6aW8gR2lvcmRhbm8gPGZhYnJpemlvZ2lvcmRhbm83N0BnbWFpbC5jb20+XG4gKi9cblxuY2xhc3MgQWJzdHJhY3RQcm9qZWN0aW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG5cbiAgICAgICAgaWYgKG5ldy50YXJnZXQgPT09IEFic3RyYWN0UHJvamVjdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFic3RyYWN0IGNsYXNzIGNhbm5vdCBiZSBpbnN0YW50aWF0ZWQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJlcGFyZUZJVFNIZWFkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3Qgb3ZlcnJpZGUgcHJlcGFyZUZJVFNIZWFkZXIoKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdlbmVyYXRlUHhNYXRyaXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3Qgb3ZlcnJpZGUgZ2VuZXJhdGVNYXRyaXgoKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtkb3VibGV9IGkgXG4gICAgICAgICAqIEBwYXJhbSB7ZG91YmxlfSBqIFxuICAgICAgICAgKiBAcmV0dXJucyBSQSwgRGVjXG4gICAgICAgICAqL1xuICAgICAgICBpZiAodGhpcy5waXgyd29ybGQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3Qgb3ZlcnJpZGUgcGl4MndvcmxkKGksIGopXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge2RvdWJsZX0gcmEgXG4gICAgICAgICAqIEBwYXJhbSB7ZG91YmxlfSBkZWMgXG4gICAgICAgICAqIEByZXR1cm5zIFtYLCBZXSBwcm9qZWN0aW9uIG9uIHRoZSBjYXJ0ZXNpYW4gcGxhbmUgb2YgUkEgYW5kIERlY1xuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHRoaXMud29ybGQycGl4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNdXN0IG92ZXJyaWRlIHdvcmxkMnBpeChyYSwgZGVjKVwiKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFic3RyYWN0UHJvamVjdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogU3VtbWFyeS4gKGJsYSBibGEgYmxhKVxuICpcbiAqIERlc2NyaXB0aW9uLiAoYmxhIGJsYSBibGEpXG4gKiBcbiAqIEBsaW5rICAgZ2l0aHViIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWI3Ny93Y3NsaWdodFxuICogQGF1dGhvciBGYWJyaXppbyBHaW9yZGFubyA8ZmFicml6aW9naW9yZGFubzc3QGdtYWlsLmNvbT5cbiAqL1xuXG5cbmltcG9ydCBBYnN0cmFjdFByb2plY3Rpb24gZnJvbSAnLi9BYnN0cmFjdFByb2plY3Rpb24nO1xuaW1wb3J0IHtIcGxvYywgVmVjMywgUG9pbnRpbmd9IGZyb20gXCJoZWFscGl4anNcIjtcbmltcG9ydCBIZWFscGl4IGZyb20gXCJoZWFscGl4anNcIjtcblxuY29uc3QgUkFEMkRFRyA9IDE4MCAvIE1hdGguUEk7XG5jb25zdCBERUcyUkFEID0gTWF0aC5QSSAvIDE4MDtcbmNvbnN0IEggPSA0O1xuY29uc3QgSyA9IDM7XG5cbmNvbnN0IGhlYWxwaXhSZXNNYXBLMCA9IFs1OC42LCAwLCAxXTtcbmNvbnN0IHB4WHRpbGUgPSA1MTI7XG5cblxuY2xhc3MgSEVBTFBpeFByb2plY3Rpb24gZXh0ZW5kcyBBYnN0cmFjdFByb2plY3Rpb24ge1xuXG5cblxuXHRcblxuICAgIF9kZWx0YXJhOy8vTk9UIFVTRURcbiAgICBfZGVsdGFkZWM7Ly9OT1QgVVNFRFxuICAgIF9taW5yYTsvL05PVCBVU0VEXG4gICAgX21pbmRlYzsvL05PVCBVU0VEXG4gICAgX3N0ZXByYTsvL05PVCBVU0VEXG4gICAgX3N0ZXBkZWM7Ly9OT1QgVVNFRFxuICAgIF9ucDE7Ly9OT1QgVVNFRFxuICAgIF9ucDI7Ly9OT1QgVVNFRFxuICAgIF9zY2FsZTsvL05PVCBVU0VEXG5cbiAgICBfZm90dztcbiAgICBfbmF4aXMxO1xuICAgIF9uYXhpczI7XG4gICAgX3BpeG5vO1xuICAgIFRIRVRBWDtcblx0TUFYX1RJTEVTID0gMjA7XG5cdF9ISVBTUmVzTWFwSzAgPSBbNTguNi9weFh0aWxlLCAwLCAxXTtcblx0Ly8gX3B4c2l6ZTtcblx0Ly8gX3JhZGl1cztcblx0X3RpbGVzU2V0O1xuXHRfaHA7XG4gICAgLyoqIFxuICAgICAqIHRoZSBjb252ZXJzaW9uIGZyb20gUkEsIERlZyB0byBwaXhlbCAoaSwgaikgZ29lcyBpbiB0aGlzIHdheTpcbiAgICAgKiBjb252ZXJ0IChSQSwgRGVjKSB0byB0byBpbnRlcm1lZGlhdGUgY29vcmRpbmF0ZXMgKFgsIFkpIFdvcmxkMkludGVybWVkaWF0ZVxuICAgICAqIGNvbnZlcnQgKFgsIFkpIHRvIHBpeGVsIGNvb3JkaW5hdGVzIChpLCBqKVxuICAgICAqLyBcbiAgICBfeHlHcmlkUHJvajsgLy8gaW50ZXJtZWRpYXRlIGNvb3JkaW5hdGVzIGluIHRoZSBYLCBZIHBsYW5lXG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0geyp9IGNlbnRlciB7cmEsIGRlY30gaW4gZGVjaW1hbCBkZWdyZWVzXG5cdCAqIEBwYXJhbSB7Kn0gcmFkaXVzIGRlY2ltYWwgZGVncmVlc1xuXHQgKiBAcGFyYW0geyp9IHB4c2l6ZSBkZWNpbWFsIGRlZ3JlZXNcblx0ICovXG4gICAgY29uc3RydWN0b3IgKGNlbnRlciwgcmFkaXVzLCBweHNpemUpIHtcbiAgICAgICAgXG5cdFx0c3VwZXIoKTtcbiAgICAgICAgdGhpcy5USEVUQVggPSBIcGxvYy5hc2luKCAoSyAtIDEpL0sgKTtcblx0XHRsZXQgbnNpZGUgPSB0aGlzLmNvbXB1dGVOc2lkZShweHNpemUpO1xuXHRcdHRoaXMuX2hwID0gbmV3IEhlYWxwaXgobnNpZGUpO1xuXHRcdGxldCBwaGlUaGV0YV9yYWQgPSB0aGlzLmNvbnZlcnQyUGhpVGhldGEoY2VudGVyKTtcblx0XHRsZXQgYmJveCA9IHRoaXMuY29tcHV0ZUJib3gocGhpVGhldGFfcmFkLCB0aGlzLmRlZ1RvUmFkKHJhZGl1cykpO1xuXHRcdHRoaXMuX3RpbGVzU2V0ID0gaHAucXVlcnlQb2x5Z29uSW5jbHVzaXZlKGJib3gsIDMyKTtcblx0XHRcbiAgICB9XG5cblx0LyoqXG5cdCAqIFRhYmxlIDEgLSByZWYgcGFwZXIgSEVBTFBpeCDigJQgYSBGcmFtZXdvcmsgZm9yIEhpZ2ggUmVzb2x1dGlvbiBEaXNjcmV0aXphdGlvbixcblx0ICogYW5kIEZhc3QgQW5hbHlzaXMgb2YgRGF0YSBEaXN0cmlidXRlZCBvbiB0aGUgU3BoZXJlXG5cdCAqIEsuIE0uIEfCtG9yc2tpMSwyLCBFLiBIaXZvbjMsNCwgQS4gSi4gQmFuZGF5NSwgQi4gRC4gV2FuZGVsdDYsNywgRi4gSy4gSGFuc2VuOCwgTS5cblx0ICogUmVpbmVja2U1LCBNLiBCYXJ0ZWxtYW45XG5cdCAqL1xuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7ZGVjaW1hbCBkZWdyZWVzfSBweHNpemUgXG5cdCAqIEByZXR1cm5zIHtpbnR9IG5zaWRlXG5cdCAqL1xuXHRjb21wdXRlTnNpZGUocHhzaXplKXtcblx0XHQvKipcblx0XHQgKiB3aXRoIHNhbWUgb3JkZXIgayAodGFibGUgMSksIEhJUFMgYW5ndWxhciByZXNvbHV0aW9uIGlzIGhpZ2hlciBvZiBvcmRlciBvZiA1MTIgKDJeOSkgcGl4ZWxzIHRoYW4gXG5cdFx0ICogdGhlIEhFQUxQaXguIFRoaXMgaXMgYmVjYXVzZSBlYWNoIHRpbGUgaW4gYSBIaVBTIGlzIHJlcHJlc2VudGVkIGJ5IGRlZmF1bHQgYnkgNTEyeDUxMiBwaXhlbHMuXFxcblx0XHQgKiBBbmd1bGFyIHJlc29sdXRpb24gb2YgZGlmZmVyZW50IEhFQUxQaXggb3JkZXJzIGluIHJlc3BlY3QgdG8gdGhlIG9yZGVyIDAsIGNhbiBiZSBjYWxjdWxhdGVkIHRoaXNcblx0XHQgKiB3YXk6XG5cdFx0ICogXG5cdFx0ICogXHRMKGspID0gTCgwKSAvIDJeayA9IDU4LjYgLyAyXmtcblx0XHQgKiBcblx0XHQgKiBUaGVyZWZvcmUsIGluIHRoZSBjYXNlIG9mIEhpUFMgd2UgbmVlZCB0byB0YWtlIGludG8gYWNjb3VudCB0aGUgZXh0cmEgcmVzb2x1dGlvbiBnaXZlbiBieSB0aGUgXG5cdFx0ICogNTEyeDUxMiAoMl45KSB0aWxlcy4gSW4gdGhpcyBjYXNlIHRoZSBhYm92ZSBiZWNvbWVzOlxuXHRcdCAqIFx0XG5cdFx0ICogXHRMKGspID0gTCgwKSAvICgyXmsgKiAyXjkpIFxuXHRcdCAqIFxuXHRcdCAqIFRob3VnaCwgaW4gb3JkZXIgdG8gY29tcHV0ZSB0aGUgcmVxdWlyZWQgb3JkZXIgc3RhcnRpbmcgZnJvbSB0aGUgcHhzaXplIGRlc2lyZWQgKGluIGlucHV0KSB3ZVxuXHRcdCAqIG5lZWQgdG8gcGVyZm9ybSB0aGVzZSBzdGVwczpcblx0XHQgKiBcblx0XHQgKiBcdHB4c2l6ZSA9IEwoaykgPSBMKDApIC8gKDJeayAqIDJeOSlcblx0XHQgKiBcdDJeayA9IEwoMCkgLyAocHhzaXplICogMl45KVxuXHRcdCAqICBrICogTG9nIDIgPSBMb2cgTCgwKSAtIExvZyAocHhzaXplICogMl45KVxuXHRcdCAqIFx0ayA9IExvZyAoTCgwKS8yKSAtIExvZyAocHhzaXplICogMl44KVxuXHRcdCAqIFxuXHRcdCAqL1xuXHRcdGxldCB0aGV0YTBweCA9IHRoaXMuX0hJUFNSZXNNYXBLMFswXTtcblx0XHRsZXQgayA9IE1hdGgubG9nKHRoZXRhMHB4LzIpIC0gTWF0aC5sb2cocHhzaXplICogMioqOCk7XG5cdFx0ayA9IE1hdGNoLnJvdW5kKGspO1xuXHRcdGxldCBuc2lkZSA9IDIqKms7XG5cdFx0cmV0dXJuIG5zaWRlO1xuXHRcdFxuXHR9XG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0ge09iamVjdCB7cmEsIGRlY319IHBvaW50ICBkZWNpbWFsIGRlZ3JlZXNcblx0ICogQHJldHVybnMge09iamVjdCB7cGhpX3JhZCwgdGhldGFfcmFkfX0gaW4gcmFkaWFuc1xuXHQgKi9cblx0Y29udmVydDJQaGlUaGV0YSAocG9pbnQpIHtcblx0XHRsZXQgcGhpdGhldGFfcmFkID0ge307XG5cdFx0bGV0IHBoaVRoZXRhX2RlZyA9IHRoaXMuYXN0cm9EZWdUb1NwaGVyaWNhbChwb2ludC5yYSwgcG9pbnQuZGVjKTtcblx0XHRwaGl0aGV0YV9yYWQucGhpX3JhZCA9IHRoaXMuZGVnVG9SYWQocGhpVGhldGFfZGVnLnBoaSk7XG4gICAgICAgIHBoaXRoZXRhX3JhZC50aGV0YV9yYWQgPSB0aGlzLmRlZ1RvUmFkKHBoaVRoZXRhX2RlZy50aGV0YSk7XG5cdFx0cmV0dXJuIHBoaXRoZXRhX3JhZDtcblx0fVxuXG5cdGFzdHJvRGVnVG9TcGhlcmljYWxSYWQocmFEZWcsIGRlY0RlZykge1xuXHRcdGxldCBwaGlUaGV0YURlZyA9IHRoaXMuYXN0cm9EZWdUb1NwaGVyaWNhbChyYURlZywgZGVjRGVnKTtcblx0XHRsZXQgcGhpVGhldGFSYWQgPSB7XG5cdFx0XHRwaGlfcmFkOiBkZWdUb1JhZChwaGlUaGV0YURlZy5waGlEZWcpLFxuXHRcdFx0dGhldGFfcmFkOiBkZWdUb1JhZChwaGlUaGV0YURlZy50aGV0YURlZylcblx0XHR9XG5cdFx0cmV0dXJuIHBoaVRoZXRhUmFkO1xuXHR9XG5cblx0ZGVnVG9SYWQoZGVncmVlcykge1xuXHRcdHJldHVybiAoZGVncmVlcyAvIDE4MCApICogTWF0aC5QSSA7XG5cdH1cblxuXHRhc3Ryb0RlZ1RvU3BoZXJpY2FsKHJhRGVnLCBkZWNEZWcpe1xuXHRcblx0XHRsZXQgcGhpRGVnLCB0aGV0YURlZztcblx0XHRwaGlEZWcgPSByYURlZztcblx0XHRpZiAocGhpRGVnIDwgMCl7XG5cdFx0XHRwaGlEZWcgKz0gMzYwO1xuXHRcdH1cblx0XHRcblx0XHR0aGV0YURlZyA9IDkwIC0gZGVjRGVnO1xuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHRwaGk6IHBoaURlZyxcblx0XHRcdHRoZXRhOiB0aGV0YURlZ1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0IHtwaGlfcmFkLCB0aGV0YV9yYWR9fSBwaGlUaGV0YV9yYWQgQ2VudGVyIG9mIHRoZSBjaXJjbGUgaW4gcmFkaWFuc1xuXHQgKiBAcGFyYW0ge2RlY2ltYWx9IHJhZGl1c19yYWQgUmFkaXVzIG9mIHRoZSBjaXJjbGUgaW4gcmFkaWFuc1xuXHQgKiBAcmV0dXJucyBcblx0ICovXG5cdGNvbXB1dGVCYm94KHBoaVRoZXRhX3JhZCwgcmFkaXVzX3JhZCkge1xuXG5cdFx0bGV0IGJib3ggPSBbXTtcblx0XHRiYm94LnB1c2gobmV3IFBvaW50aW5nKG51bGwsIGZhbHNlLCBwaGlUaGV0YV9yYWQudGhldGFfcmFkLXIsIHBoaVRoZXRhX3JhZC5waGlfcmFkLXIpKTtcblx0XHRiYm94LnB1c2gobmV3IFBvaW50aW5nKG51bGwsIGZhbHNlLCBwaGlUaGV0YV9yYWQudGhldGFfcmFkLXIsIHBoaVRoZXRhX3JhZC5waGlfcmFkK3IpKTtcblx0XHRiYm94LnB1c2gobmV3IFBvaW50aW5nKG51bGwsIGZhbHNlLCBwaGlUaGV0YV9yYWQudGhldGFfcmFkK3IsIHBoaVRoZXRhX3JhZC5waGlfcmFkK3IpKTtcblx0XHRiYm94LnB1c2gobmV3IFBvaW50aW5nKG51bGwsIGZhbHNlLCBwaGlUaGV0YV9yYWQudGhldGFfcmFkLXIsIHBoaVRoZXRhX3JhZC5waGlfcmFkLXIpKTtcblxuICAgICAgICByZXR1cm4gYmJveDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgYW4gYXJyYXkgd2hlcmUgdGhlIGtleSBpcyB0aGUgSFBYIHRpbGUgbnVtYmVyIGFuZCB0aGUgdmFsdWUgaXMgYW4gYXJyYXkgb2Yge0ltYWdlSXRlbS5qc30gZnJvbSB0aGUgb3V0cHV0IHByb2plY3RlZCBpbWFnZVxuXHQgKiBAcGFyYW0ge0FycmF5W0FycmF5W0ltYWdlSXRlbV1dfSByYURlY01hcCBNYXAgb2YgUkEgRGVjIGdlbmVyYXRlZCBpbiB0aGUgT1VUUFVUIHByb2plY3Rpb24gd2l0aCBnZW5lcmF0ZVB4TWF0cml4KClcblx0ICogQHJldHVybnMge30gdGlsZXNNYXBcblx0ICovXG5cdGdlbmVyYXRlVGlsZXNNYXAocmFEZWNNYXApIHtcblx0XHRsZXQgdGlsZXNNYXAgPSBbXTtcblx0XHQvLyByb3dzXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCByYURlY01hcC5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly8gY29sc1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCByYURlY01hcFtpXS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRsZXQgaXRlbSA9IHJhRGVjTWFwW2ldW2pdO1xuXHRcdFx0XHRsZXQgcGhpVGhldGFfcmFkID0gYXN0cm9EZWdUb1NwaGVyaWNhbFJhZChpdGVtLmdldFJBKCksIGl0ZW0uZ2V0RGVjKCkpO1xuXHRcdFx0XHRsZXQgcHRnID0gbmV3IFBvaW50aW5nKG51bGwsIGZhbHNlLCBwaGlUaGV0YV9yYWQudGhldGFfcmFkLCBwaGlUaGV0YV9yYWQucGhpUmFkKVxuXHRcdFx0XHRsZXQgdGlsZSA9IHRoaXMuX2hwLmFuZzJwaXgocHRnKTtcblx0XHRcdFx0aWYgKHRpbGVzTWFwW3RpbGVdLmxlbmd0aCA9PSAwKXtcblx0XHRcdFx0XHR0aWxlc01hcFt0aWxlXSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRpbGVzTWFwW3RpbGVdLnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aWxlc01hcDtcblx0fVxuXHRcblxuICAgIGluaXQobnNpZGUsIHBpeG5vLCBuYXhpczEsIG5heGlzMikge1xuXG4gICAgICAgIHRoaXMuX25heGlzMSA9IG5heGlzMTtcbiAgICAgICAgdGhpcy5fbmF4aXMyID0gbmF4aXMyO1xuICAgICAgICB0aGlzLl9waXhubyA9IHBpeG5vO1xuXG4gICAgICAgIHRoaXMuX3h5R3JpZFByb2ogPSB7XG5cdFx0XHRcIm1pbl95XCI6IE5hTixcblx0XHRcdFwibWF4X3lcIjogTmFOLFxuXHRcdFx0XCJtaW5feFwiOiBOYU4sXG5cdFx0XHRcIm1heF94XCI6IE5hTixcblx0XHRcdFwiZ3JpZFBvaW50c0RlZ1wiOiBbXVxuXHRcdH1cblx0XHRpZiAoaXNOYU4obnNpZGUpKXtcblx0XHRcdHRocm93IG5ldyBFdmFsRXJyb3IoXCJuc2lkZSBub3Qgc2V0XCIpO1xuXHRcdH1cblxuXHRcdGxldCBoZWFscGl4ID0gbmV3IEhlYWxwaXgobnNpZGUpO1xuXHRcdGxldCBjb3JuZXJzVmVjMyA9IGhlYWxwaXguZ2V0Qm91bmRhcmllc1dpdGhTdGVwKHRoaXMuX3BpeG5vLCAxKTtcblx0XHRsZXQgcG9pbnRpbmdzID0gW107XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjb3JuZXJzVmVjMy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cG9pbnRpbmdzW2ldID0gbmV3IFBvaW50aW5nKGNvcm5lcnNWZWMzW2ldKTtcblx0XHRcdGlmIChpID49IDEpe1xuICAgICAgICAgICAgICAgIGxldCBhID0gcG9pbnRpbmdzW2ktMV0ucGhpO1xuICAgICAgICAgICAgICAgIGxldCBiID0gcG9pbnRpbmdzW2ldLnBoaTtcbiAgICAgICAgICAgICAgICAvLyBjYXNlIHdoZW4gUkEgaXMganVzdCBjcm9zc2luZyB0aGUgb3JpZ2luIChlLmcuIDM1N2RlZyAtIDNkZWcpXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGEgLSBiKSA+IE1hdGguUEkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50aW5nc1tpLTFdLnBoaSA8IHBvaW50aW5nc1tpXS5waGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50aW5nc1tpLTFdLnBoaSArPSAyICogTWF0aC5QSTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludGluZ3NbaV0ucGhpICs9IDIgKiBNYXRoLlBJO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSAgICBcbiAgICAgICAgICAgIH1cblx0XHR9XG5cblx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHBvaW50aW5ncy5sZW5ndGg7IGorKykge1xuXHRcdFx0bGV0IGNvVGhldGFSYWQgPSBwb2ludGluZ3Nbal0udGhldGE7XG4gICAgICAgICAgICAvLyBIRUFMUGl4IHdvcmtzIHdpdGggY29sYXRpdHVkZSAoMCBOb3J0aCBQb2xlLCAxODAgU291dGggUG9sZSlcbiAgICAgICAgICAgIC8vIGNvbnZlcnRpbmcgdGhlIGNvbGF0aXR1ZGUgaW4gbGF0aXR1ZGUgKGRlYylcblx0XHRcdGxldCBkZWNSYWQgPSBNYXRoLlBJLzIgLSBjb1RoZXRhUmFkO1xuXG5cdFx0XHRsZXQgcmFSYWQgPSBwb2ludGluZ3Nbal0ucGhpO1xuXHRcdFx0XG5cdFx0XHQvLyBwcm9qZWN0aW9uIG9uIGhlYWxwaXggZ3JpZFxuXHRcdFx0bGV0IHh5RGVnID0gdGhpcy53b3JsZDJpbnRlcm1lZGlhdGUocmFSYWQsIGRlY1JhZCk7XG5cdFx0XHR0aGlzLl94eUdyaWRQcm9qLmdyaWRQb2ludHNEZWdbaiAqIDJdID0geHlEZWdbMF07XG5cdFx0XHR0aGlzLl94eUdyaWRQcm9qLmdyaWRQb2ludHNEZWdbaiAqIDIgKyAxXSA9IHh5RGVnWzFdO1xuXG5cdFx0XHRpZiAoaXNOYU4odGhpcy5feHlHcmlkUHJvai5tYXhfeSkgfHwgeHlEZWdbMV0gPiB0aGlzLl94eUdyaWRQcm9qLm1heF95ICkge1xuXHRcdFx0XHR0aGlzLl94eUdyaWRQcm9qLm1heF95ID0geHlEZWdbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNOYU4odGhpcy5feHlHcmlkUHJvai5taW5feSkgfHwgeHlEZWdbMV0gPCB0aGlzLl94eUdyaWRQcm9qLm1pbl95KSB7XG5cdFx0XHRcdHRoaXMuX3h5R3JpZFByb2oubWluX3kgPSB4eURlZ1sxXTtcblx0XHRcdH1cblx0XHRcdGlmIChpc05hTih0aGlzLl94eUdyaWRQcm9qLm1heF94KSB8fCB4eURlZ1swXSA+IHRoaXMuX3h5R3JpZFByb2oubWF4X3gpIHtcblx0XHRcdFx0dGhpcy5feHlHcmlkUHJvai5tYXhfeCA9IHh5RGVnWzBdO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzTmFOKHRoaXMuX3h5R3JpZFByb2oubWluX3gpIHx8IHh5RGVnWzBdIDwgdGhpcy5feHlHcmlkUHJvai5taW5feCkge1xuXHRcdFx0XHR0aGlzLl94eUdyaWRQcm9qLm1pbl94ID0geHlEZWdbMF07XG5cdFx0XHR9XG5cblx0XHR9XG4gICAgfVxuXG4gICAgcGl4MndvcmxkIChpLCBqKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICBcInNreUNvb3Jkc1wiOiBbXSxcblx0XHRcdFwieHlDb29yZHNcIjogW11cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgeHkgPSB0aGlzLnBpeDJpbnRlcm1lZGlhdGUoaSwgaik7XG5cdFx0bGV0IHJhRGVjRGVnID0gdGhpcy5pbnRlcm1lZGlhdGUyd29ybGQoeHlbMF0sIHh5WzFdKTtcblxuXHRcdGlmIChyYURlY0RlZ1swXSA+IDM2MCl7XG5cdFx0XHRyYURlY0RlZ1swXSAtPSAzNjA7XG5cdFx0fVxuXG4gICAgICAgIHJlc3VsdC54eUNvb3JkcyA9IHh5O1xuICAgICAgICByZXN1bHQuc2t5Q29vcmRzID0gcmFEZWNEZWc7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuXHRcdC8vIHJldHVybiB7XG5cdFx0Ly8gXHRcInNreUNvb3Jkc1wiOiBbcmFEZWNEZWdbMF0sIHJhRGVjRGVnWzFdXSxcblx0XHQvLyBcdFwieHlDb29yZHNcIjogW3gsIHldXG5cdFx0Ly8gfTtcbiAgICB9XG5cbiAgICBwaXgyaW50ZXJtZWRpYXRlIChpLCBqKSB7XG4gICAgICAgIC8qKlxuXHQgXHQgKiAoaV9ub3JtLHdfcGl4ZWwpID0gKDAsMCkgY29ycmVzcG9uZCB0byB0aGUgbG93ZXItbGVmdCBjb3JuZXIgb2YgdGhlIGZhY2V0IGluIHRoZSBpbWFnZVxuXHRcdCAqIChpX25vcm0sd19waXhlbCkgPSAoMSwxKSBpcyB0aGUgdXBwZXIgcmlnaHQgY29ybmVyXG5cdFx0ICogZGltYW1vbmQgaW4gZmlndXJlIDEgZnJvbSBcIk1hcHBpbmcgb24gdGhlIEhFYWxwaXggZ3JpZFwiIHBhcGVyXG5cdFx0ICogKDAsMCkgbGVmdG1vc3QgY29ybmVyXG5cdFx0ICogKDEsMCkgdXBwZXIgY29ybmVyXG5cdFx0ICogKDAsMSkgbG93ZXN0IGNvcm5lclxuXHRcdCAqICgxLDEpIHJpZ2h0bW9zdCBjb3JuZXJcblx0XHQgKiBUaGFua3MgWUFHTyEgOnBcblx0XHQgKi9cbiAgICAgICAgbGV0IGlfbm9ybSA9IChpICsgMC41KSAvIHRoaXMuX25heGlzMTtcblx0XHRsZXQgal9ub3JtID0gKGogKyAwLjUpIC8gdGhpcy5fbmF4aXMyO1xuXG4gICAgICAgIGxldCB4SW50ZXJ2YWwgPSBNYXRoLmFicyh0aGlzLl94eUdyaWRQcm9qLm1heF94IC0gdGhpcy5feHlHcmlkUHJvai5taW5feCkgLyAyLjA7XG5cdFx0bGV0IHlJbnRlcnZhbCA9IE1hdGguYWJzKHRoaXMuX3h5R3JpZFByb2oubWF4X3kgLSB0aGlzLl94eUdyaWRQcm9qLm1pbl95KSAvIDIuMDtcblx0XHRsZXQgeU1lYW4gPSAodGhpcy5feHlHcmlkUHJvai5tYXhfeSArIHRoaXMuX3h5R3JpZFByb2oubWluX3kpIC8gMi4wO1xuXG4gICAgICAgIC8vIGJpLWxpbmVhciBpbnRlcnBvbGF0aW9uXG5cdFx0bGV0IHggPSB0aGlzLl94eUdyaWRQcm9qLm1heF94IC0geEludGVydmFsICogKGlfbm9ybSArIGpfbm9ybSk7XG5cdFx0bGV0IHkgPSB5TWVhbiAtIHlJbnRlcnZhbCAqIChqX25vcm0gLSBpX25vcm0pO1xuXHRcdFxuICAgICAgICByZXR1cm4gW3gsIHldO1xuICAgIH1cblxuXG4gICAgaW50ZXJtZWRpYXRlMndvcmxkKHgsIHkpIHtcblxuICAgICAgICBsZXQgcGhpRGVnLCB0aGV0YURlZztcblx0XHRsZXQgWXggPSA5MCAqIChLIC0gMSkgLyBIO1xuXG5cdFx0XG5cblx0XHRpZiAoTWF0aC5hYnMoeSkgPD0gWXgpIHsgLy8gZXF1YXRvcmlhbCBiZWx0c1xuXG5cdFx0XHRwaGlEZWcgPSB4O1xuXHRcdFx0dGhldGFEZWcgPSBNYXRoLmFzaW4oICh5ICAqIEgpIC8gKDkwICogSykpICogUkFEMkRFRztcblxuXHRcdH0gZWxzZSBpZiAoTWF0aC5hYnMoeSkgPiBZeCkgeyAvLyBwb2xhciByZWdpb25zXG5cblx0XHRcdGxldCBzaWdtYSA9IChLICsgMSkgLyAyIC0gTWF0aC5hYnMoeSAqIEgpIC8gMTgwO1xuXHRcdFx0bGV0IHcgPSAwOyAvLyBvbWVnYVxuXHRcdFx0aWYgKEsgJSAyICE9PSAwIHx8IHRoZXRhUmFkID4gMCkgeyAvLyBLIG9kZCBvciB0aGV0YXggPiAwXG5cdFx0XHRcdHcgPSAxO1xuXHRcdFx0fVxuXHRcdFx0bGV0IHhfYyA9IC0xODAgKyAoIDIgKiBNYXRoLmZsb29yKCh4ICsgMTgwKSAqIEgvMzYwICsgKDEgLSB3KSAvMiAgKSArIHcpICogKDE4MCAvIEgpO1xuXHRcdFx0cGhpRGVnID0geF9jICsgKCB4IC0geF9jKSAvIHNpZ21hO1xuXHRcdFx0bGV0IHRoZXRhUmFkID0gSHBsb2MuYXNpbiggMSAtIChzaWdtYSAqIHNpZ21hKSAvIEsgKTtcblx0XHRcdHRoZXRhRGVnID0gdGhldGFSYWQgKiBSQUQyREVHO1xuXHRcdFx0aWYgKHkgPD0gMCl7XG5cdFx0XHRcdHRoZXRhRGVnICo9IC0xO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW3BoaURlZywgdGhldGFEZWddO1xuXG4gICAgfVxuICAgIFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHsqfSByYWRlZyBcbiAgICAgKiBAcGFyYW0geyp9IGRlY2RlZ1xuICAgICAqICBcbiAgICAgKi9cbiAgICB3b3JsZDJwaXggKHJhZGVnLCBkZWNkZWcpIHtcbiAgICAgICAgbGV0IHBoaXJhZCA9IHJhZGVnICogREVHMlJBRDtcblx0XHRsZXQgdGhldGFyYWQgPSBkZWNkZWcgKiBERUcyUkFEO1xuICAgICAgICBsZXQgeHkgPSB0aGlzLndvcmxkMmludGVybWVkaWF0ZShwaGlyYWQsIHRoZXRhcmFkKTtcbiAgICAgICAgbGV0IGlqID0gdGhpcy5pbnRlcm1lZGlhdGUycGl4KHh5WzBdLCB4eVsxXSk7XG4gICAgICAgIHJldHVybiBpajtcbiAgICB9XG5cbiAgICBcbiAgICAvKipcbiAgICAgKiBQcm9qZWN0aW9uIG9mIHRoZSBXb3JsZCBjb29yZGluYXRlcyBpbnRvIHRoZSBpbnRlcm1lZGlhdGUgY29vcmRpbmF0ZXMgcGxhbmUgKFBhcGVyIC4uLi4uKVxuICAgICAqIEBwYXJhbSB7Kn0gcGhpUmFkIFxuICAgICAqIEBwYXJhbSB7Kn0gdGhldGFSYWQgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgIHdvcmxkMmludGVybWVkaWF0ZShwaGlSYWQsIHRoZXRhUmFkKSB7XG4gICAgICAgIGxldCB4X2dyaWQsIHlfZ3JpZDtcblxuXHRcdGlmICggTWF0aC5hYnModGhldGFSYWQpIDw9IHRoaXMuVEhFVEFYKSB7IC8vIGVxdWF0b3JpYWwgYmVsdHNcblx0XHRcdHhfZ3JpZCA9IHBoaVJhZCAqIFJBRDJERUc7XG5cdFx0XHRcblx0XHRcdHlfZ3JpZCA9IEhwbG9jLnNpbih0aGV0YVJhZCkgKiBLICogOTAgLyBIO1xuXHRcdFx0XG5cblx0XHR9IGVsc2UgaWYgKCBNYXRoLmFicyh0aGV0YVJhZCkgPiB0aGlzLlRIRVRBWCkgeyAvLyBwb2xhciB6b25lc1xuXG5cdFx0XHRsZXQgcGhpRGVnID0gcGhpUmFkICAqIFJBRDJERUc7XG5cblx0XHRcdGxldCB3ID0gMDsgLy8gb21lZ2Fcblx0XHRcdGlmIChLICUgMiAhPT0gMCB8fCB0aGV0YVJhZCA+IDApIHsgLy8gSyBvZGQgb3IgdGhldGF4ID4gMFxuXHRcdFx0XHR3ID0gMTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHNpZ21hID0gTWF0aC5zcXJ0KCBLICogKDEgLSBNYXRoLmFicyhIcGxvYy5zaW4odGhldGFSYWQpKSApICk7XG5cdFx0XHRsZXQgcGhpX2MgPSAtIDE4MCArICggMiAqIE1hdGguZmxvb3IoICgocGhpUmFkICsgMTgwKSAqIEgvMzYwKSArICgoMSAtIHcpLzIpICkgKyB3ICkgKiAoIDE4MCAvIEggKTtcblx0XHRcdFxuXHRcdFx0eF9ncmlkID0gcGhpX2MgKyAocGhpRGVnIC0gcGhpX2MpICogc2lnbWE7XG5cdFx0XHR5X2dyaWQgPSAoMTgwICAvIEgpICogKCAoKEsgKyAxKS8yKSAtIHNpZ21hKTtcblxuXHRcdFx0aWYgKHRoZXRhUmFkIDwgMCkge1xuXHRcdFx0XHR5X2dyaWQgKj0gLTE7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFt4X2dyaWQsIHlfZ3JpZF07XG5cbiAgICB9XG5cbiAgICBpbnRlcm1lZGlhdGUycGl4KHgsIHkpIHtcbiAgICAgICAgbGV0IHhJbnRlcnZhbCA9IE1hdGguYWJzKHRoaXMuX3h5R3JpZFByb2oubWF4X3ggLSB0aGlzLl94eUdyaWRQcm9qLm1pbl94KTtcblx0XHRsZXQgeUludGVydmFsID0gTWF0aC5hYnModGhpcy5feHlHcmlkUHJvai5tYXhfeSAtIHRoaXMuX3h5R3JpZFByb2oubWluX3kpO1xuXG5cdFx0bGV0IGlfbm9ybSwgal9ub3JtO1xuXHRcdGlmICggKHRoaXMuX3h5R3JpZFByb2oubWluX3ggPiAzNjAgfHwgdGhpcy5feHlHcmlkUHJvai5tYXhfeCA+IDM2MCkgJiYgeCA8IHRoaXMuX3h5R3JpZFByb2oubWluX3gpIHtcblx0XHRcdGlfbm9ybSA9ICh4ICsgMzYwIC0gdGhpcy5feHlHcmlkUHJvai5taW5feCkgLyB4SW50ZXJ2YWw7XHRcblx0XHR9ZWxzZSB7XG5cdFx0XHRpX25vcm0gPSAoeCAtIHRoaXMuX3h5R3JpZFByb2oubWluX3gpIC8geEludGVydmFsO1xuXHRcdH1cblx0XHRqX25vcm0gPSAoeSAtIHRoaXMuX3h5R3JpZFByb2oubWluX3kpIC8geUludGVydmFsO1xuXHRcdFxuXHRcdGxldCBpID0gMC41IC0gKGlfbm9ybSAtIGpfbm9ybSk7XG5cdFx0bGV0IGogPSAoaV9ub3JtICsgal9ub3JtKSAtIDAuNTtcblx0XHRpID0gTWF0aC5mbG9vcihpICogNTEyKTtcblx0XHRqID0gTWF0aC5mbG9vcihqICogNTEyKSArIDE7XG5cdFx0cmV0dXJuIFtpICwgal07XG5cbiAgICB9XG5cblxuICAgIGdlbmVyYXRlUHhNYXRyaXggKG1pbnJhLCBtaW5kZWMsIGRlbHRhcmEsIGRlbHRhZGVjLCBmb3R3LCBweHNjYWxlKSB7fVxuXG5cbiAgICAvKipcblx0ICogY29tcHV0ZSBib3VuZGFyaWVzIG9mIHRoZSBjdXJyZW50IGZhY2V0IGFuZCBjb21wdXRlIG1heCBhbmQgbWluIHRoZXRhIGFuZCBwaGkgcHJvamVjdGVkIG9uIHRoZSBIRUFMUGl4IGdyaWRcblx0ICogQHBhcmFtIHt9IG5zaWRlIG9wdGlvbmFsXG5cdCAqIEByZXR1cm5zIHJlc3VsdDogb2JqZWN0IGNvbnRhaW5pbmcgZmFjZXQncyBjb3JuZXJzIGNvb3JkaW5hdGVzIGFuZCBtaW4gYW5kIG1heCB0aGV0YSBhbmQgcGhpXG5cdCAqL1xuXHRnZXRGYWNldFByb2plY3RlZENvb3JkaW5hdGVzIChuc2lkZSkge1xuXHRcdFxuICAgICAgICAvLyBuc2lkZSA9IChuc2lkZSAhPT0gdW5kZWZpbmVkKSA/IG5zaWRlIDogTWF0aC5wb3coMiwgdGhpcy5faGVhZGVyLmdldFZhbHVlKCdPUkRFUicpKTtcblx0XHRcblx0XHRpZiAoaXNOYU4odGhpcy5fbnNpZGUpKXtcblx0XHRcdHRocm93IG5ldyBFdmFsRXJyb3IoXCJuc2lkZSBub3Qgc2V0XCIpO1xuXHRcdH1cblx0XHRsZXQgcGl4ID0gdGhpcy5waXhubztcblxuXHRcdGxldCBoZWFscGl4ID0gbmV3IEhlYWxwaXgodGhpcy5fbnNpZGUpO1xuXHRcdGxldCBjb3JuZXJzVmVjMyA9IGhlYWxwaXguZ2V0Qm91bmRhcmllc1dpdGhTdGVwKHBpeCwgMSk7XG5cdFx0bGV0IHBvaW50aW5ncyA9IFtdO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29ybmVyc1ZlYzMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBvaW50aW5nc1tpXSA9IG5ldyBQb2ludGluZyhjb3JuZXJzVmVjM1tpXSk7XG5cdFx0XHRpZiAoaSA+PSAxKXtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IHBvaW50aW5nc1tpLTFdLnBoaTtcbiAgICAgICAgICAgICAgICBsZXQgYiA9IHBvaW50aW5nc1tpXS5waGk7XG4gICAgICAgICAgICAgICAgLy8gY2FzZSB3aGVuIFJBIGlzIGp1c3QgY3Jvc3NpbmcgdGhlIG9yaWdpbiAoZS5nLiAzNTdkZWcgLSAzZGVnKVxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhhIC0gYikgPiBNYXRoLlBJKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb2ludGluZ3NbaS0xXS5waGkgPCBwb2ludGluZ3NbaV0ucGhpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludGluZ3NbaS0xXS5waGkgKz0gMiAqIE1hdGguUEk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRpbmdzW2ldLnBoaSArPSAyICogTWF0aC5QSTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9XG5cdFx0fVxuXG5cdFx0Ly8gLy8gY2FzZSB3aGVuIFJBIGlzIGp1c3QgY3Jvc3NpbmcgdGhlIG9yaWdpbiAoZS5nLiAzNTdkZWcgLSAzZGVnKVxuXHRcdC8vIGZvciAobGV0IGkgPSAwOyBpIDwgcG9pbnRpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdC8vIFx0bGV0IGEgPSBwb2ludGluZ3NbaV0ucGhpO1xuXHRcdC8vIFx0bGV0IGIgPSBwb2ludGluZ3NbaSsxXS5waGk7XG5cdFx0Ly8gXHRpZiAoTWF0aC5hYnMoYSAtIGIpID4gTWF0aC5QSSkge1xuXHRcdC8vIFx0XHRpZiAocG9pbnRpbmdzW2ldLnBoaSA8IHBvaW50aW5nc1tpKzFdLnBoaSkge1xuXHRcdC8vIFx0XHRcdHBvaW50aW5nc1tpXS5waGkgKz0gMiAqIE1hdGguUEk7XG5cdFx0Ly8gXHRcdH1lbHNle1xuXHRcdC8vIFx0XHRcdHBvaW50aW5nc1tpKzFdLnBoaSArPSAyICogTWF0aC5QSTtcblx0XHQvLyBcdFx0fVxuXHRcdC8vIFx0fSBcblx0XHQvLyB9XG5cblx0XHRsZXQgcmVzdWx0ID0ge1xuXHRcdFx0XCJtaW5feVwiOiBOYU4sXG5cdFx0XHRcIm1heF95XCI6IE5hTixcblx0XHRcdFwibWluX3hcIjogTmFOLFxuXHRcdFx0XCJtYXhfeFwiOiBOYU4sXG5cdFx0XHRcImdyaWRQb2ludHNEZWdcIjogW11cblx0XHR9XG5cdFx0XG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBwb2ludGluZ3MubGVuZ3RoOyBqKyspIHtcblx0XHRcdGxldCBjb1RoZXRhUmFkID0gcG9pbnRpbmdzW2pdLnRoZXRhO1xuXHRcdFx0bGV0IHRoZXRhUmFkID0gTWF0aC5QSS8yIC0gY29UaGV0YVJhZDtcblx0XHRcblx0XHRcdGxldCBwaGlSYWQgPSBwb2ludGluZ3Nbal0ucGhpO1xuXHRcdFx0XG5cblx0XHRcdC8vIHByb2plY3Rpb24gb24gaGVhbHBpeCBncmlkXG5cdFx0XHRsZXQgeHlEZWcgPSB0aGlzLnByb2plY3RPbkhQWEdyaWQocGhpUmFkLCB0aGV0YVJhZCk7XG5cdFx0XHRyZXN1bHQuZ3JpZFBvaW50c0RlZ1tqICogMl0gPSB4eURlZ1swXTtcblx0XHRcdHJlc3VsdC5ncmlkUG9pbnRzRGVnW2ogKiAyICsgMV0gPSB4eURlZ1sxXTtcblx0XHRcdFxuXHRcdFx0aWYgKGlzTmFOKHJlc3VsdC5tYXhfeSkgfHwgeHlEZWdbMV0gPiByZXN1bHQubWF4X3kgKSB7XG5cdFx0XHRcdHJlc3VsdC5tYXhfeSA9IHh5RGVnWzFdO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzTmFOKHJlc3VsdC5taW5feSkgfHwgeHlEZWdbMV0gPCByZXN1bHQubWluX3kpIHtcblx0XHRcdFx0cmVzdWx0Lm1pbl95ID0geHlEZWdbMV07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc05hTihyZXN1bHQubWF4X3gpIHx8IHh5RGVnWzBdID4gcmVzdWx0Lm1heF94KSB7XG5cblx0XHRcdFx0cmVzdWx0Lm1heF94ID0geHlEZWdbMF07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNOYU4ocmVzdWx0Lm1pbl94KSB8fCB4eURlZ1swXSA8IHJlc3VsdC5taW5feCkge1xuXHRcdFx0XHRyZXN1bHQubWluX3ggPSB4eURlZ1swXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhFQUxQaXhQcm9qZWN0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBTdW1tYXJ5LiAoYmxhIGJsYSBibGEpXG4gKlxuICogRGVzY3JpcHRpb24uIChibGEgYmxhIGJsYSlcbiAqIFxuICogQGxpbmsgICBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL2ZhYjc3L3djc2xpZ2h0XG4gKiBAYXV0aG9yIEZhYnJpemlvIEdpb3JkYW5vIDxmYWJyaXppb2dpb3JkYW5vNzdAZ21haWwuY29tPlxuICovXG5cblxuaW1wb3J0IEFic3RyYWN0UHJvamVjdGlvbiBmcm9tICcuL0Fic3RyYWN0UHJvamVjdGlvbic7XG4vLyBpbXBvcnQgUGFyc2VVdGlscyBmcm9tICcuLi9QYXJzZVV0aWxzJztcbmltcG9ydCBJbWFnZUl0ZW0gZnJvbSAnLi4vbW9kZWwvSW1hZ2VJdGVtJztcblxuY2xhc3MgTWVyY2F0b3JQcm9qZWN0aW9uIGV4dGVuZHMgQWJzdHJhY3RQcm9qZWN0aW9uIHtcblxuICAgIF9taW5yYTtcbiAgICBfbWluZGVjO1xuICAgIFxuICAgIF9uYXhpczE7XG4gICAgX25heGlzMjtcbiAgICBcbiAgICBfcHhzaXplO1xuXG4gICAgX3B4bWFwO1xuXG4gICAgX2ZpdHNoZWFkZXI7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0geyp9IGNlbnRlciB7cmEsIGRlY30gaW4gZGVjaW1hbCBkZWdyZWVzXG4gICAgICogQHBhcmFtIHsqfSByYWRpdXMgZGVjaW1hbCBkZWdyZWVzXG4gICAgICogQHBhcmFtIHsqfSBweHNpemUgZGVjaW1hbCBkZWdyZWVzXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKGNlbnRlciwgcmFkaXVzLCBweHNpemUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jb21wdXRlU3F1YXJlICgyICogcmFkaXVzLCBweHNpemUpO1xuICAgICAgICB0aGlzLl9taW5yYSA9IGNlbnRlci5yYURlZyAtIHJhZGl1cztcbiAgICAgICAgaWYgKHRoaXMuX21pbnJhIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5fbWlucmEgKz0gMzYwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21pbmRlYyA9IGNlbnRlci5kZWNEZWcgLSByYWRpdXM7XG4gICAgICAgIHRoaXMuX3B4c2l6ZSA9IHB4c2l6ZTtcblxuICAgICAgICB0aGlzLnByZXBhcmVGSVRTSGVhZGVyKCk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIHByZXBhcmVGSVRTSGVhZGVyICgpIHtcbiAgICAgICAgLy8gVE9ET1xuICAgICAgICB0aGlzLl9maXRzaGVhZGVyID0gXCJcIjtcbiAgICB9XG5cbiAgICBjb21wdXRlU3F1YXJlIChkLCBwcykge1xuICAgICAgICB0aGlzLl9uYXhpczEgPSAgZCAvIHBzO1xuICAgICAgICB0aGlzLl9uYXhpczIgPSB0aGlzLl9uYXhpczE7XG4gICAgfVxuXG4gICAgLyoqIFRPRE8gISEhIGNoZWNrIGFuZCBoYW5kbGUgUkEgcGFzc2luZyB0aHJvdWdoIDM2MC0wICovXG4gICAgcGl4MndvcmxkIChpLCBqKSB7XG5cbiAgICAgICAgbGV0IHJhLCBkZWM7XG4gICAgICAgIHJhID0gaSAqIHRoaXMuX3N0ZXByYSArIHRoaXMuX21pbnJhO1xuICAgICAgICBkZWMgPSBqICogdGhpcy5fc3RlcGRlYyArIHRoaXMuX21pbmRlYztcbiAgICAgICAgcmV0dXJuIFtyYSwgZGVjXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7Kn0gcmFkZWcgXG4gICAgICogQHBhcmFtIHsqfSBkZWNkZWdcbiAgICAgKiAgXG4gICAgICovXG4gICAgd29ybGQycGl4IChyYWRlZywgZGVjZGVnKSB7fVxuXG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGFuIGVtcHR5IGFycmF5IG9mIChJbWFnZUl0ZW0uanN9IHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGltYWdlL0ZJVFMuIFxuICAgICAqIEl0IHdpbGwgYmUgZmlsbGVkIHdpdGggcGl4ZWxzIHZhbHVlcyBpbiBhbm90aGVyIG1ldGhvZC5cbiAgICAgKi9cbiAgICBnZW5lcmF0ZVB4TWF0cml4ICgpIHtcbiAgICAgICAgdGhpcy5fcHhtYXAgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9ICAwOyBpIDwgdGhpcy5fbmF4aXMxOyBpKyspIHsgLy8gcm93c1xuXG4gICAgICAgICAgICBsZXQgcm93ID0gbmV3IEFycmF5KHRoaXMuX25heGlzMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAobGV0ICBqID0gMDsgaiA8IHRoaXMuX25heGlzMjsgaisrKSB7IC8vIGNvbHNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbWlucmEgPiAzNjApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWlucmEgLT0gMzYwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaWkgPSBuZXcgSW1hZ2VJdGVtICh0aGlzLl9taW5yYSArIHRoaXMuX3B4c2l6ZSAqIGosIHRoaXMuX21pbmRlYyArIHRoaXMuX3B4c2l6ZSAqIGksIGksIGopO1xuICAgICAgICAgICAgICAgIHJvd1tqXSA9IGlpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9weG1hcC5wdXNoKHJvdyk7IC8vIHJvdyBiYXNlZFxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQeE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B4bWFwO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVyY2F0b3JQcm9qZWN0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBTdW1tYXJ5LiAoYmxhIGJsYSBibGEpXG4gKlxuICogRGVzY3JpcHRpb24uIChibGEgYmxhIGJsYSlcbiAqIFxuICogQGxpbmsgICBnaXRodWIgaHR0cHM6Ly9naXRodWIuY29tL2ZhYjc3L3djc2xpZ2h0XG4gKiBAYXV0aG9yIEZhYnJpemlvIEdpb3JkYW5vIDxmYWJyaXppb2dpb3JkYW5vNzdAZ21haWwuY29tPlxuICovXG5cbmltcG9ydCBIRUFMUGl4UHJvamVjdGlvbiBmcm9tIFwiLi9IRUFMUGl4UHJvamVjdGlvblwiO1xuaW1wb3J0IE1lcmNhdG9yUHJvamVjdGlvbiBmcm9tIFwiLi9NZXJjYXRvclByb2plY3Rpb25cIjtcbmltcG9ydCBQcm9qZWN0aW9uTm90Rm91bmQgZnJvbSBcIi4uL2V4Y2VwdGlvbnMvUHJvamVjdGlvbk5vdEZvdW5kXCI7XG5cbmNsYXNzIFByb2pGYWN0b3J5ICB7XG5cbiAgICBzdGF0aWMgZ2V0UHJvamVjdGlvbihjZW50ZXIsIHJhZGl1cywgcHhzaXplLCBwcm9qZWN0aW9uTmFtZSkge1xuICAgICAgICBpZiAocHJvamVjdGlvbk5hbWUgPT09IFwiTWVyY2F0b3JcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNZXJjYXRvclByb2plY3Rpb24oY2VudGVyLCByYWRpdXMsIHB4c2l6ZSk7XG4gICAgICAgIH0gZWxzZSAgaWYgKHByb2plY3Rpb25OYW1lID09PSBcIkhFQUxQaXhcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyAgSEVBTFBpeFByb2plY3Rpb24oY2VudGVyLCByYWRpdXMsIHB4c2l6ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUHJvamVjdGlvbk5vdEZvdW5kKHByb2plY3Rpb25OYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvakZhY3Rvcnk7Il0sIm5hbWVzIjpbIlZlYzMiLCJDaXJjbGVGaW5kZXIiLCJwb2ludCIsIm5wIiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsImNlbnRlciIsImFkZCIsIm5vcm1hbGl6ZSIsImNvc3JhZCIsImRvdCIsImkiLCJnZXRDaXJjbGUiLCJxIiwiZ2V0Q2lyY2xlMiIsInExIiwicTIiLCJzdWIiLCJjcm9zcyIsImZsaXAiLCJ4IiwieSIsInoiLCJDb25zdGFudHMiLCJNYXRoIiwiUEkiLCJIcGxvYyIsIkZ4eWYiLCJmIiwiZngiLCJmeSIsImZhY2UiLCJqcmxsIiwiVWludDhBcnJheSIsImpwbGwiLCJoYWxmcGkiLCJsb2MiLCJqciIsIm5yIiwidG1wIiwic3RoIiwic3FydCIsImhhdmVfc3RoIiwicGhpIiwidG9IcGxvYyIsInRvVmVjMyIsIlh5ZiIsIlBvaW50aW5nIiwiWnBoaSIsInBzdGFjayIsIlJhbmdlU2V0IiwiSGVhbHBpeCIsIm5zaWRlX2luIiwib3JkZXJfbWF4IiwiaW52X2hhbGZwaSIsInR3b3RoaXJkIiwibnNfbWF4IiwicG93IiwiY3RhYiIsIlVpbnQxNkFycmF5IiwidXRhYiIsIkludDE2QXJyYXkiLCJ4b2Zmc2V0IiwieW9mZnNldCIsImZhY2VhcnJheSIsInN3YXBhcnJheSIsIm5zaWRlIiwibnBmYWNlIiwibnBpeCIsIm9yZGVyIiwibnNpZGUyb3JkZXIiLCJubDIiLCJubDMiLCJubDQiLCJmYWN0MiIsImZhY3QxIiwibmNhcCIsImJuIiwibXByIiwiY21wciIsInNtcHIiLCJtYXhQaXhyYWQiLCJjb3MiLCJzaW4iLCJwaXgiLCJwb2ludHMiLCJBcnJheSIsInh5ZiIsIm5lc3QyeHlmIiwiZGMiLCJ4YyIsIml4IiwieWMiLCJpeSIsImQiLCJzdGVwIiwiaXBpeCIsInJlc3VsdCIsIkludDMyQXJyYXkiLCJmYWNlX251bSIsIm5zbTEiLCJmcGl4IiwiZmxvb3IiLCJweDAiLCJzcHJlYWRfYml0cyIsInB5MCIsInB4cCIsInB5cCIsInB4bSIsInB5bSIsIm5ibnVtIiwiYml0cyIsInRpbnQiLCJ4eWYybmVzdCIsImxvZzIiLCJjb21wcmVzc19iaXRzIiwiaHBsb2MiLCJ6YSIsImFicyIsInR0IiwiZm1vZHVsbyIsInBpeE5vIiwidGVtcDEiLCJ0ZW1wMiIsImpwIiwiam0iLCJpZnAiLCJpZm0iLCJudHQiLCJtaW4iLCJ0cCIsInBpeDJsb2MiLCJ0b1pwaGkiLCJ1bmRlZmluZWQiLCJwdGciLCJtaXJyb3IiLCJsb2MycGl4IiwidjEiLCJ2MiIsInYiLCJyYXciLCJjb21wcmVzc2VkIiwidmVydGV4IiwiZmFjdCIsImluY2x1c2l2ZSIsIm52IiwidnYiLCJwb2ludGluZzJWZWMzIiwibm9ybWFsIiwiaW5kZXgiLCJiYWNrIiwiZmlyc3QiLCJtZWRpdW0iLCJsYXN0Iiwibm9ybSIsImhuZCIsImZsaXBUaG5kIiwic3BsaWNlIiwic2NhbGUiLCJuY2lyYyIsInJhZCIsImZpbGwiLCJjZiIsImdldENlbnRlciIsImFjb3MiLCJnZXRDb3NyYWQiLCJxdWVyeU11bHRpRGlzYyIsImNvbXB1dGVCbiIsImVycm9yIiwicmVzIiwib3BsdXMiLCJpbG9nMiIsIm9tYXgiLCJjcmxpbWl0IiwibyIsImRyIiwiRmxvYXQ2NEFycmF5Iiwic3RrIiwicHVzaCIsInNpemUiLCJwdG9wIiwib3RvcCIsInBvcCIsInB2IiwicGl4MnZlYyIsInpvbmUiLCJjcmFkIiwiaXoiLCJjaGVja19waXhlbCIsImFyZyIsIm1heCIsImNsejMyIiwiejEiLCJwaGkxIiwiejIiLCJwaGkyIiwicGl4c2V0Iiwic2Rpc3QiLCJhcHBlbmQiLCJwb3BUb01hcmsiLCJtYXJrIiwienBoaWEiLCJ4eXoxIiwiY29udmVydFpwaGkyeHl6IiwidmEiLCJ0MSIsInpwaGliIiwieHl6MiIsInZiIiwiYW5nbGUiLCJ6cGhpIiwicmFkaXVzIiwidnB0ZyIsImNycGRyIiwiY3JtZHIiLCJzaW5yYWQiLCJjZHIiLCJzZHIiLCJjdXJybyIsInBvcyIsInBpeDJ6cGhpIiwiY2FuZ2Rpc3QiLCJjb3NkaXN0X3pwaGkiLCJQSTRfQSIsIlBJNF9CIiwiUEk0X0MiLCJNXzFfUEkiLCJ0aGV0YSIsIl9waGkiLCJzdCIsInZlY3RvciIsInUiLCJzaW5jb3NoZWxwZXIiLCJ0IiwicyIsIm11bHNpZ24iLCJhdGFuMmsiLCJzaWduIiwiY29weVNpZ24iLCJtYWduaXR1ZGUiLCJhdGFuaGVscGVyIiwiciIsImlzaW5mIiwiaXNuYW4iLCJOYU4iLCJJbmZpbml0eSIsInZlYzMiLCJpbl90aGV0YSIsImluX3BoaSIsImF0YW4yIiwiY2FwIiwic3oiLCJ2YWwiLCJhcHBlbmQxIiwiYSIsImIiLCJuZXdzaXplIiwicm5ldyIsInNldCIsInJlc2l6ZSIsInNsaWNlZCIsInNsaWNlIiwibiIsImxlbmd0aFNxdWFyZWQiLCJwb2ludGluZyIsInpfIiwicGhpXyIsInAiLCJtIiwicF8iLCJvXyIsIlByb2pGYWN0b3J5IiwiSEVBTFBpeFByb2plY3Rpb24iLCJIUFhUaWxlc01hcE5vdERlZmluZWQiLCJXQ1NMaWdodCIsInB4c2l6ZSIsIm91dFByb2plY3Rpb25OYW1lIiwiaW5Qcm9qZWN0aW9uTmFtZSIsIl90aWxlc01hcCIsIl9vdXRwcm9qZWN0aW9uIiwiZ2V0IiwiX2lucHJvamVjdGlvbiIsImdlbmVyYXRlUHhNYXRyaXgiLCJnZW5lcmF0ZVRpbGVzTWFwIiwiZ2V0UHhNYXAiLCJlIiwiZ2V0RXJyb3IiLCJleGl0IiwiaW5EYXRhIiwidGlsZW5vIiwicHJvamVjdGlvbiIsIl9lcnJvciIsIlByb2plY3Rpb25Ob3RGb3VuZCIsIkltYWdlSXRlbSIsInJhIiwiZGVjIiwiaiIsIl9yYSIsIl9kZWMiLCJfaSIsIl9qIiwiX3ZhbHVlIiwiQWJzdHJhY3RQcm9qZWN0aW9uIiwiVHlwZUVycm9yIiwicHJlcGFyZUZJVFNIZWFkZXIiLCJwaXgyd29ybGQiLCJ3b3JsZDJwaXgiLCJSQUQyREVHIiwiREVHMlJBRCIsIkgiLCJLIiwiaGVhbHBpeFJlc01hcEswIiwicHhYdGlsZSIsIlRIRVRBWCIsImFzaW4iLCJjb21wdXRlTnNpZGUiLCJfaHAiLCJwaGlUaGV0YV9yYWQiLCJjb252ZXJ0MlBoaVRoZXRhIiwiYmJveCIsImNvbXB1dGVCYm94IiwiZGVnVG9SYWQiLCJfdGlsZXNTZXQiLCJocCIsInF1ZXJ5UG9seWdvbkluY2x1c2l2ZSIsInRoZXRhMHB4IiwiX0hJUFNSZXNNYXBLMCIsImsiLCJNYXRjaCIsInJvdW5kIiwicGhpdGhldGFfcmFkIiwicGhpVGhldGFfZGVnIiwiYXN0cm9EZWdUb1NwaGVyaWNhbCIsInBoaV9yYWQiLCJ0aGV0YV9yYWQiLCJyYURlZyIsImRlY0RlZyIsInBoaVRoZXRhRGVnIiwicGhpVGhldGFSYWQiLCJwaGlEZWciLCJ0aGV0YURlZyIsImRlZ3JlZXMiLCJyYWRpdXNfcmFkIiwicmFEZWNNYXAiLCJ0aWxlc01hcCIsIml0ZW0iLCJhc3Ryb0RlZ1RvU3BoZXJpY2FsUmFkIiwiZ2V0UkEiLCJnZXREZWMiLCJwaGlSYWQiLCJ0aWxlIiwiYW5nMnBpeCIsInBpeG5vIiwibmF4aXMxIiwibmF4aXMyIiwiX25heGlzMSIsIl9uYXhpczIiLCJfcGl4bm8iLCJfeHlHcmlkUHJvaiIsImlzTmFOIiwiRXZhbEVycm9yIiwiaGVhbHBpeCIsImNvcm5lcnNWZWMzIiwiZ2V0Qm91bmRhcmllc1dpdGhTdGVwIiwicG9pbnRpbmdzIiwiY29UaGV0YVJhZCIsImRlY1JhZCIsInJhUmFkIiwieHlEZWciLCJ3b3JsZDJpbnRlcm1lZGlhdGUiLCJncmlkUG9pbnRzRGVnIiwibWF4X3kiLCJtaW5feSIsIm1heF94IiwibWluX3giLCJ4eSIsInBpeDJpbnRlcm1lZGlhdGUiLCJyYURlY0RlZyIsImludGVybWVkaWF0ZTJ3b3JsZCIsInh5Q29vcmRzIiwic2t5Q29vcmRzIiwiaV9ub3JtIiwial9ub3JtIiwieEludGVydmFsIiwieUludGVydmFsIiwieU1lYW4iLCJZeCIsInNpZ21hIiwidyIsInRoZXRhUmFkIiwieF9jIiwicmFkZWciLCJkZWNkZWciLCJwaGlyYWQiLCJ0aGV0YXJhZCIsImlqIiwiaW50ZXJtZWRpYXRlMnBpeCIsInhfZ3JpZCIsInlfZ3JpZCIsInBoaV9jIiwibWlucmEiLCJtaW5kZWMiLCJkZWx0YXJhIiwiZGVsdGFkZWMiLCJmb3R3IiwicHhzY2FsZSIsIl9uc2lkZSIsInByb2plY3RPbkhQWEdyaWQiLCJNZXJjYXRvclByb2plY3Rpb24iLCJjb21wdXRlU3F1YXJlIiwiX21pbnJhIiwiX21pbmRlYyIsIl9weHNpemUiLCJfZml0c2hlYWRlciIsInBzIiwiX3N0ZXByYSIsIl9zdGVwZGVjIiwiX3B4bWFwIiwicm93IiwiaWkiLCJwcm9qZWN0aW9uTmFtZSJdLCJzb3VyY2VSb290IjoiIn0=