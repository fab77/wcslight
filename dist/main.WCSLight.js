(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["wcslight"] = factory();
	else
		root["wcslight"] = factory();
})(window, function() {
return (window["webpackJsonpwcslight"] = window["webpackJsonpwcslight"] || []).push([["main"],{

/***/ "./src/WCSLight.js":
/*!*************************!*\
  !*** ./src/WCSLight.js ***!
  \*************************/
/*! exports provided: default */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
      this._outprojection = _projections_ProjFactory__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].get(center, radius, pxsize, outProjectionName);
      this._inprojection = _projections_ProjFactory__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].get(center, radius, pxsize, inProjectionName);

      this._outprojection.generatePxMatrix();

      if (this._inprojection instanceof _projections_HEALPixProjection__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"]) {
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
    value: function processData(inData, tileno) {
      var _this = this;

      if (isNumber(tileno)) {
        // HEALPix in projection
        // foreach ImageItem ii in this._tilesMap[tileno]:
        //  - pxval = this._inprojection.world2pix(ii.ra, ii.dec)
        //  - this._outprojection._pxmap[ii.i][ii.j] = pxval
        this._tilesMap[tileno].forEach(function (imgpx) {
          var pxij = _this._inprojection.world2pix(imgpx.ra, imgpx.dec);

          var pxval = _this._inprojection.getValue(pxij.i, pxij.j); // <-- TODO to be implemented!!!


          _this._outprojection._pxmap[imgpx.i][imgpx.j] = pxval;
        });
      }
    }
    /**
     * It should be called only when HEALPix is used as input projection. 
     */

  }, {
    key: "getHEALPixTilesMap",
    value: function getHEALPixTilesMap() {
      if (this._tilesMap === undefined) {
        throw new _exceptions_HPXTilesMapNotDefined__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"]();
      }

      return this._tilesMap;
    }
  }]);

  return WCSLight;
}();

/* harmony default export */ __webpack_exports__["default"] = (WCSLight);

/***/ }),

/***/ "./src/exceptions/HPXTilesMapNotDefined.js":
/*!*************************************************!*\
  !*** ./src/exceptions/HPXTilesMapNotDefined.js ***!
  \*************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

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

/* harmony default export */ __webpack_exports__["a"] = (HPXTilesMapNotDefined);

/***/ }),

/***/ "./src/exceptions/ProjectionNotFound.js":
/*!**********************************************!*\
  !*** ./src/exceptions/ProjectionNotFound.js ***!
  \**********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

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

/* harmony default export */ __webpack_exports__["a"] = (ProjectionNotFound);

/***/ }),

/***/ "./src/model/ImagePixel.js":
/*!*********************************!*\
  !*** ./src/model/ImagePixel.js ***!
  \*********************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

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

var ImagePixel = /*#__PURE__*/function () {
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
  function ImagePixel(ra, dec, i, j) {
    _classCallCheck(this, ImagePixel);

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


  _createClass(ImagePixel, [{
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

  return ImagePixel;
}();

/* harmony default export */ __webpack_exports__["a"] = (ImagePixel);

/***/ }),

/***/ "./src/projections/AbstractProjection.js":
/*!***********************************************!*\
  !*** ./src/projections/AbstractProjection.js ***!
  \***********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

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

/* harmony default export */ __webpack_exports__["a"] = (AbstractProjection);

/***/ }),

/***/ "./src/projections/HEALPixProjection.js":
/*!**********************************************!*\
  !*** ./src/projections/HEALPixProjection.js ***!
  \**********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _AbstractProjection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractProjection */ "./src/projections/AbstractProjection.js");
!(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());

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


 // import Healpix from "healpixjs";

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

    _this.THETAX = !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).asin((K - 1) / K);

    var nside = _this.computeNside(pxsize);

    _this._hp = new Healpix(nside);

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
      bbox.push(new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad - r));
      bbox.push(new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad + r));
      bbox.push(new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(null, false, phiTheta_rad.theta_rad + r, phiTheta_rad.phi_rad + r));
      bbox.push(new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(null, false, phiTheta_rad.theta_rad - r, phiTheta_rad.phi_rad - r));
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
          var ptg = new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phiRad);

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

      var healpix = new Healpix(nside);
      var cornersVec3 = healpix.getBoundariesWithStep(this._pixno, 1);
      var pointings = [];

      for (var i = 0; i < cornersVec3.length; i++) {
        pointings[i] = new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(cornersVec3[i]);

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
        var thetaRad = !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).asin(1 - sigma * sigma / K);
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
        y_grid = !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).sin(thetaRad) * K * 90 / H;
      } else if (Math.abs(thetaRad) > this.THETAX) {
        // polar zones
        var phiDeg = phiRad * RAD2DEG;
        var w = 0; // omega

        if (K % 2 !== 0 || thetaRad > 0) {
          // K odd or thetax > 0
          w = 1;
        }

        var sigma = Math.sqrt(K * (1 - Math.abs(!(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).sin(thetaRad))));
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
      var healpix = new Healpix(this._nside);
      var cornersVec3 = healpix.getBoundariesWithStep(pix, 1);
      var pointings = [];

      for (var i = 0; i < cornersVec3.length; i++) {
        pointings[i] = new !(function webpackMissingModule() { var e = new Error("Cannot find module 'healpixjs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(cornersVec3[i]);

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
}(_AbstractProjection__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]);

/* harmony default export */ __webpack_exports__["a"] = (HEALPixProjection);

/***/ }),

/***/ "./src/projections/MercatorProjection.js":
/*!***********************************************!*\
  !*** ./src/projections/MercatorProjection.js ***!
  \***********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _AbstractProjection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractProjection */ "./src/projections/AbstractProjection.js");
/* harmony import */ var _model_ImagePixel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/ImagePixel */ "./src/model/ImagePixel.js");

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
     * @return an empty array of (ImagePixel.js} representing the output image/FITS. 
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

          var ii = new _model_ImagePixel__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"](this._minra + this._pxsize * j, this._mindec + this._pxsize * i, i, j);
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
}(_AbstractProjection__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]);

/* harmony default export */ __webpack_exports__["a"] = (MercatorProjection);

/***/ }),

/***/ "./src/projections/ProjFactory.js":
/*!****************************************!*\
  !*** ./src/projections/ProjFactory.js ***!
  \****************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _HEALPixProjection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HEALPixProjection */ "./src/projections/HEALPixProjection.js");
/* harmony import */ var _MercatorProjection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MercatorProjection */ "./src/projections/MercatorProjection.js");
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
        return new _MercatorProjection__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"](center, radius, pxsize);
      } else if (projectionName === "HEALPix") {
        return new _HEALPixProjection__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](center, radius, pxsize);
      } else {
        throw new _exceptions_ProjectionNotFound__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](projectionName);
      }
    }
  }]);

  return ProjFactory;
}();

/* harmony default export */ __webpack_exports__["a"] = (ProjFactory);

/***/ })

},[["./src/WCSLight.js","runtime~main"]]]);
});
//# sourceMappingURL=main.WCSLight.js.map