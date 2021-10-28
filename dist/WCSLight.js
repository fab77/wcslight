"use strict";
(self["webpackChunkwcslight"] = self["webpackChunkwcslight"] || []).push([["wcslight"],{

/***/ "./src/WCSLight.js":
/*!*************************!*\
  !*** ./src/WCSLight.js ***!
  \*************************/
/***/ (() => {


/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WCSLight = /*#__PURE__*/function () {
  /** @constructs WCSLight */
  function WCSLight() {
    _classCallCheck(this, WCSLight);
  }
  /**
   * cutout use case
   * @example <caption> </caption>
   * cutout({"raDeg" : 21, "decDeg" : 19}, 0.001, 0.0005, "HiPS", "Mercator");
   * @param {Object} center e.g. {"raDeg" : 21, "decDeg" : 19}
   * @param {number} radius radius in decimal degrees
   * @param {number} pxsize pixel size in decimal degrees
   * @param {string} inprojname 
   * @param {string} outprojname 
   * @param {string[]} [filelist]
   * @param {string} [baseuri] e.g. "http://<base hips URL> or <base file system dir>";
   * @returns {Image}
   */


  _createClass(WCSLight, null, [{
    key: "cutout",
    value: function cutout(center, radius, pxsize, inproj, outproj) {
      var result = []; // todo this should return a map. one key per output file ra, dec map
      // in case of out mercator, the map will contains only 1 key

      var outRADecMap = outproj.getImageRADecList(center, radius, pxsize);

      var _iterator = _createForOfIteratorHelper(outRADecMap),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

          var outRADecList = value; // start here a loop over outRADecList (which is a Map)
          // outRADecMAP.foreach(outRADecList){

          var inputPixelsList = inproj.world2pix(outRADecList);
          var invalues = inproj.getPixValuesFromPxlist(inputPixelsList);
          var fitsHeaderParams = inproj.getFITSHeader();
          var fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams, key);
          var fitsheader = outproj.getFITSHeader();
          var canvas2d = outproj.getCanvas2d();
          result.push({
            "fitsheader": fitsheader,
            "fitsdata": fitsdata,
            "canvas2d": canvas2d
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return result;
    }
    /**
     * 
     * @param {*} fitsheader 
     * @param {*} fitsdata 
     * @returns {URL}
     */

  }, {
    key: "writeFITS",
    value: function writeFITS(fitsheader, fitsdata) {
      var encodedData = FITSParser.writeFITS(fitsheader, fitsdata);
      return encodedData;
    }
  }, {
    key: "changeProjection",
    value: function changeProjection(filepath, outprojname) {// TODO
    }
  }, {
    key: "getProjection",
    value: function getProjection(projectionName, filepathlist) {
      if (projectionName === "Mercator") {
        return new MercatorProjection();
      } else if (projectionName === "HiPS") {
        return new HiPSProjection();
      } else if (projectionName === "HEALPix") {
        return new HEALPixProjection();
      } else {
        throw new ProjectionNotFound(projectionName);
      }
    }
  }]);

  return WCSLight;
}();

/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (WCSLight);

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/WCSLight.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2NzbGlnaHQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU1BO0FBRUY7QUFDQSxzQkFBZTtBQUFBO0FBQUU7QUFFakI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O1dBQ0ksZ0JBQWVDLE1BQWYsRUFBdUJDLE1BQXZCLEVBQStCQyxNQUEvQixFQUF1Q0MsTUFBdkMsRUFBK0NDLE9BQS9DLEVBQXdEO0FBRXBELFVBQUlDLE1BQU0sR0FBRyxFQUFiLENBRm9ELENBR3BEO0FBQ0E7O0FBQ0EsVUFBSUMsV0FBVyxHQUFHRixPQUFPLENBQUNHLGlCQUFSLENBQTBCUCxNQUExQixFQUFrQ0MsTUFBbEMsRUFBMENDLE1BQTFDLENBQWxCOztBQUxvRCxpREFNekJJLFdBTnlCO0FBQUE7O0FBQUE7QUFNcEQsNERBQXdDO0FBQUE7QUFBQSxjQUE1QkUsR0FBNEI7QUFBQSxjQUF2QkMsS0FBdUI7O0FBQ3BDLGNBQUlDLFlBQVksR0FBR0QsS0FBbkIsQ0FEb0MsQ0FFcEM7QUFDQTs7QUFDQSxjQUFJRSxlQUFlLEdBQUdSLE1BQU0sQ0FBQ1MsU0FBUCxDQUFpQkYsWUFBakIsQ0FBdEI7QUFFQSxjQUFJRyxRQUFRLEdBQUdWLE1BQU0sQ0FBQ1csc0JBQVAsQ0FBOEJILGVBQTlCLENBQWY7QUFDQSxjQUFJSSxnQkFBZ0IsR0FBR1osTUFBTSxDQUFDYSxhQUFQLEVBQXZCO0FBRUEsY0FBSUMsUUFBUSxHQUFHYixPQUFPLENBQUNjLFdBQVIsQ0FBb0JMLFFBQXBCLEVBQThCRSxnQkFBOUIsRUFBZ0RQLEdBQWhELENBQWY7QUFDQSxjQUFJVyxVQUFVLEdBQUdmLE9BQU8sQ0FBQ1ksYUFBUixFQUFqQjtBQUNBLGNBQUlJLFFBQVEsR0FBR2hCLE9BQU8sQ0FBQ2lCLFdBQVIsRUFBZjtBQUNBaEIsVUFBQUEsTUFBTSxDQUFDaUIsSUFBUCxDQUFZO0FBQ1IsMEJBQWNILFVBRE47QUFFUix3QkFBWUYsUUFGSjtBQUdSLHdCQUFZRztBQUhKLFdBQVo7QUFLSDtBQXZCbUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUF5QnBELGFBQU9mLE1BQVA7QUFFSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLG1CQUFpQmMsVUFBakIsRUFBNkJGLFFBQTdCLEVBQXVDO0FBQ25DLFVBQUlNLFdBQVcsR0FBR0MsVUFBVSxDQUFDQyxTQUFYLENBQXFCTixVQUFyQixFQUFpQ0YsUUFBakMsQ0FBbEI7QUFDQSxhQUFPTSxXQUFQO0FBQ0g7OztXQUtELDBCQUF5QkcsUUFBekIsRUFBbUNDLFdBQW5DLEVBQWdELENBQzVDO0FBQ0g7OztXQUdELHVCQUFxQkMsY0FBckIsRUFBcUNDLFlBQXJDLEVBQW1EO0FBQy9DLFVBQUlELGNBQWMsS0FBSyxVQUF2QixFQUFtQztBQUMvQixlQUFPLElBQUlFLGtCQUFKLEVBQVA7QUFDSCxPQUZELE1BRVEsSUFBSUYsY0FBYyxLQUFLLE1BQXZCLEVBQStCO0FBQ25DLGVBQU8sSUFBS0csY0FBTCxFQUFQO0FBQ0gsT0FGTyxNQUVBLElBQUlILGNBQWMsS0FBSyxTQUF2QixFQUFrQztBQUN0QyxlQUFPLElBQUtJLGlCQUFMLEVBQVA7QUFDSCxPQUZPLE1BRUQ7QUFDSCxjQUFNLElBQUlDLGtCQUFKLENBQXVCTCxjQUF2QixDQUFOO0FBQ0g7QUFDSjs7Ozs7O0FBS0wsc0VBQWU3QixRQUFmIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2NzbGlnaHQvLi9zcmMvV0NTTGlnaHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIFN1bW1hcnkuIChibGEgYmxhIGJsYSlcbiAqXG4gKiBEZXNjcmlwdGlvbi4gKGJsYSBibGEgYmxhKVxuICogXG4gKiBAbGluayAgIGdpdGh1YiBodHRwczovL2dpdGh1Yi5jb20vZmFiNzcvd2NzbGlnaHRcbiAqIEBhdXRob3IgRmFicml6aW8gR2lvcmRhbm8gPGZhYnJpemlvZ2lvcmRhbm83N0BnbWFpbC5jb20+XG4gKi9cblxuY2xhc3MgV0NTTGlnaHQge1xuXG4gICAgLyoqIEBjb25zdHJ1Y3RzIFdDU0xpZ2h0ICovXG4gICAgY29uc3RydWN0b3IgKCkge31cblxuICAgIC8qKlxuICAgICAqIGN1dG91dCB1c2UgY2FzZVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPiA8L2NhcHRpb24+XG4gICAgICogY3V0b3V0KHtcInJhRGVnXCIgOiAyMSwgXCJkZWNEZWdcIiA6IDE5fSwgMC4wMDEsIDAuMDAwNSwgXCJIaVBTXCIsIFwiTWVyY2F0b3JcIik7XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNlbnRlciBlLmcuIHtcInJhRGVnXCIgOiAyMSwgXCJkZWNEZWdcIiA6IDE5fVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIGluIGRlY2ltYWwgZGVncmVlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBweHNpemUgcGl4ZWwgc2l6ZSBpbiBkZWNpbWFsIGRlZ3JlZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wcm9qbmFtZSBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3V0cHJvam5hbWUgXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gW2ZpbGVsaXN0XVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFzZXVyaV0gZS5nLiBcImh0dHA6Ly88YmFzZSBoaXBzIFVSTD4gb3IgPGJhc2UgZmlsZSBzeXN0ZW0gZGlyPlwiO1xuICAgICAqIEByZXR1cm5zIHtJbWFnZX1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3V0b3V0IChjZW50ZXIsIHJhZGl1cywgcHhzaXplLCBpbnByb2osIG91dHByb2opIHtcbiAgICAgICAgXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgLy8gdG9kbyB0aGlzIHNob3VsZCByZXR1cm4gYSBtYXAuIG9uZSBrZXkgcGVyIG91dHB1dCBmaWxlIHJhLCBkZWMgbWFwXG4gICAgICAgIC8vIGluIGNhc2Ugb2Ygb3V0IG1lcmNhdG9yLCB0aGUgbWFwIHdpbGwgY29udGFpbnMgb25seSAxIGtleVxuICAgICAgICBsZXQgb3V0UkFEZWNNYXAgPSBvdXRwcm9qLmdldEltYWdlUkFEZWNMaXN0KGNlbnRlciwgcmFkaXVzLCBweHNpemUpOyAgICAgXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG91dFJBRGVjTWFwKSB7XG4gICAgICAgICAgICBsZXQgb3V0UkFEZWNMaXN0ID0gdmFsdWU7XG4gICAgICAgICAgICAvLyBzdGFydCBoZXJlIGEgbG9vcCBvdmVyIG91dFJBRGVjTGlzdCAod2hpY2ggaXMgYSBNYXApXG4gICAgICAgICAgICAvLyBvdXRSQURlY01BUC5mb3JlYWNoKG91dFJBRGVjTGlzdCl7XG4gICAgICAgICAgICBsZXQgaW5wdXRQaXhlbHNMaXN0ID0gaW5wcm9qLndvcmxkMnBpeChvdXRSQURlY0xpc3QpO1xuXG4gICAgICAgICAgICBsZXQgaW52YWx1ZXMgPSBpbnByb2ouZ2V0UGl4VmFsdWVzRnJvbVB4bGlzdChpbnB1dFBpeGVsc0xpc3QpO1xuICAgICAgICAgICAgbGV0IGZpdHNIZWFkZXJQYXJhbXMgPSBpbnByb2ouZ2V0RklUU0hlYWRlcigpO1xuXG4gICAgICAgICAgICBsZXQgZml0c2RhdGEgPSBvdXRwcm9qLnNldFB4c1ZhbHVlKGludmFsdWVzLCBmaXRzSGVhZGVyUGFyYW1zLCBrZXkpO1xuICAgICAgICAgICAgbGV0IGZpdHNoZWFkZXIgPSBvdXRwcm9qLmdldEZJVFNIZWFkZXIoKTtcbiAgICAgICAgICAgIGxldCBjYW52YXMyZCA9IG91dHByb2ouZ2V0Q2FudmFzMmQoKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBcImZpdHNoZWFkZXJcIjogZml0c2hlYWRlcixcbiAgICAgICAgICAgICAgICBcImZpdHNkYXRhXCI6IGZpdHNkYXRhLFxuICAgICAgICAgICAgICAgIFwiY2FudmFzMmRcIjogY2FudmFzMmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHsqfSBmaXRzaGVhZGVyIFxuICAgICAqIEBwYXJhbSB7Kn0gZml0c2RhdGEgXG4gICAgICogQHJldHVybnMge1VSTH1cbiAgICAgKi9cbiAgICBzdGF0aWMgd3JpdGVGSVRTKGZpdHNoZWFkZXIsIGZpdHNkYXRhKSB7XG4gICAgICAgIGxldCBlbmNvZGVkRGF0YSA9IEZJVFNQYXJzZXIud3JpdGVGSVRTKGZpdHNoZWFkZXIsIGZpdHNkYXRhKTtcbiAgICAgICAgcmV0dXJuIGVuY29kZWREYXRhO1xuICAgIH1cblxuICAgIFxuXG5cbiAgICBzdGF0aWMgY2hhbmdlUHJvamVjdGlvbiAoZmlsZXBhdGgsIG91dHByb2puYW1lKSB7XG4gICAgICAgIC8vIFRPRE9cbiAgICB9XG5cblxuICAgIHN0YXRpYyBnZXRQcm9qZWN0aW9uKHByb2plY3Rpb25OYW1lLCBmaWxlcGF0aGxpc3QpIHtcbiAgICAgICAgaWYgKHByb2plY3Rpb25OYW1lID09PSBcIk1lcmNhdG9yXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWVyY2F0b3JQcm9qZWN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSAgaWYgKHByb2plY3Rpb25OYW1lID09PSBcIkhpUFNcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyAgSGlQU1Byb2plY3Rpb24oKTtcbiAgICAgICAgfSBlbHNlICBpZiAocHJvamVjdGlvbk5hbWUgPT09IFwiSEVBTFBpeFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3ICBIRUFMUGl4UHJvamVjdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFByb2plY3Rpb25Ob3RGb3VuZChwcm9qZWN0aW9uTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuXG5leHBvcnQgZGVmYXVsdCBXQ1NMaWdodDsiXSwibmFtZXMiOlsiV0NTTGlnaHQiLCJjZW50ZXIiLCJyYWRpdXMiLCJweHNpemUiLCJpbnByb2oiLCJvdXRwcm9qIiwicmVzdWx0Iiwib3V0UkFEZWNNYXAiLCJnZXRJbWFnZVJBRGVjTGlzdCIsImtleSIsInZhbHVlIiwib3V0UkFEZWNMaXN0IiwiaW5wdXRQaXhlbHNMaXN0Iiwid29ybGQycGl4IiwiaW52YWx1ZXMiLCJnZXRQaXhWYWx1ZXNGcm9tUHhsaXN0IiwiZml0c0hlYWRlclBhcmFtcyIsImdldEZJVFNIZWFkZXIiLCJmaXRzZGF0YSIsInNldFB4c1ZhbHVlIiwiZml0c2hlYWRlciIsImNhbnZhczJkIiwiZ2V0Q2FudmFzMmQiLCJwdXNoIiwiZW5jb2RlZERhdGEiLCJGSVRTUGFyc2VyIiwid3JpdGVGSVRTIiwiZmlsZXBhdGgiLCJvdXRwcm9qbmFtZSIsInByb2plY3Rpb25OYW1lIiwiZmlsZXBhdGhsaXN0IiwiTWVyY2F0b3JQcm9qZWN0aW9uIiwiSGlQU1Byb2plY3Rpb24iLCJIRUFMUGl4UHJvamVjdGlvbiIsIlByb2plY3Rpb25Ob3RGb3VuZCJdLCJzb3VyY2VSb290IjoiIn0=