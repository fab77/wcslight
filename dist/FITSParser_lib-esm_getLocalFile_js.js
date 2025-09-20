(self["webpackChunkwcslight"] = self["webpackChunkwcslight"] || []).push([["FITSParser_lib-esm_getLocalFile_js"],{

/***/ "?540f":
/*!**********************************!*\
  !*** node:fs/promises (ignored) ***!
  \**********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "../FITSParser/lib-esm/getLocalFile.js":
/*!*********************************************!*\
  !*** ../FITSParser/lib-esm/getLocalFile.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getLocalFile: () => (/* binding */ getLocalFile)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:fs/promises */ "?540f");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// import path from 'path';
// import {fileURLToPath} from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
function getLocalFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        // let buffer: Buffer;
        try {
            const response = yield (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(path);
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
    });
}
//# sourceMappingURL=getLocalFile.js.map

/***/ })

}]);
//# sourceMappingURL=FITSParser_lib-esm_getLocalFile_js.js.map