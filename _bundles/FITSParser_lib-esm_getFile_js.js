"use strict";
(self["webpackChunkwcslight"] = self["webpackChunkwcslight"] || []).push([["FITSParser_lib-esm_getFile_js"],{

/***/ "../FITSParser/lib-esm/getFile.js":
/*!****************************************!*\
  !*** ../FITSParser/lib-esm/getFile.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getFile": () => (/* binding */ getFile)
/* harmony export */ });
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cross-fetch */ "../FITSParser/node_modules/cross-fetch/dist/browser-ponyfill.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function getFile(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        response = yield cross_fetch__WEBPACK_IMPORTED_MODULE_0__(uri);
        if (!response.ok) {
            return new ArrayBuffer(0);
        }
        else {
            return response.arrayBuffer();
        }
    });
}
//# sourceMappingURL=getFile.js.map

/***/ })

}]);
//# sourceMappingURL=FITSParser_lib-esm_getFile_js.js.map