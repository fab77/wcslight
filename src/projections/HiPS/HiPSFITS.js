"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiPSFITS = void 0;
var jsfitsio_1 = require("jsfitsio");
var HiPSProp_js_1 = require("./HiPSProp.js");
var HiPSIntermediateProj_js_1 = require("./HiPSIntermediateProj.js");
var healpixjs_1 = require("healpixjs");
var Utils_js_1 = require("../../model/Utils.js");
var NumberType_js_1 = require("../../model/NumberType.js");
var HiPSFITS = /** @class */ (function () {
    function HiPSFITS(path, tileno, hipsProp, healpix) {
        // private payload: Uint8Array<ArrayBufferLike>[] = []
        this.payload = [];
        this.min = NaN;
        this.max = NaN;
        if (path) {
            this.init(path);
        }
        else if (!tileno || !hipsProp || !healpix) {
            console.error("tileno, hipsProp or healpix are not defined");
            throw new Error("tileno, hipsProp or healpix are not defined");
        }
        else {
            this.order = hipsProp.getItem(HiPSProp_js_1.HiPSProp.ORDER);
            var naxis1 = hipsProp.getItem(HiPSProp_js_1.HiPSProp.TILE_WIDTH);
            var naxis2 = hipsProp.getItem(HiPSProp_js_1.HiPSProp.TILE_WIDTH);
            this.tileno = tileno;
            if (naxis1 != naxis2) {
                console.error("NAXIS1 and NAXIS2 do not match.");
                throw new Error("NAXIS1 and NAXIS2 do not match.");
            }
            this.tileno = naxis1;
            this.healpix = healpix;
            this.intermediateXYGrid = HiPSIntermediateProj_js_1.HiPSIntermediateProj.setupByTile(this.tileno, this.healpix);
        }
        console.log(this);
    }
    HiPSFITS.prototype.getTileno = function () {
        return this.tileno;
    };
    HiPSFITS.prototype.init = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var fits, naxis1, naxis2;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, jsfitsio_1.FITSParser.loadFITS(path)];
                    case 1:
                        fits = _e.sent();
                        if (fits == null) {
                            console.warn("fits ".concat(path, " doesn't exist"));
                            return [2 /*return*/, null];
                        }
                        this.header = fits.header;
                        this.payload = fits.data;
                        this.order = Number((_a = fits.header.findById(HiPSProp_js_1.HiPSProp.ORDER)) === null || _a === void 0 ? void 0 : _a.value);
                        naxis1 = Number((_b = fits.header.findById(jsfitsio_1.FITSHeaderManager.NAXIS1)) === null || _b === void 0 ? void 0 : _b.value);
                        naxis2 = Number((_c = fits.header.findById(jsfitsio_1.FITSHeaderManager.NAXIS2)) === null || _c === void 0 ? void 0 : _c.value);
                        this.tileno = Number((_d = fits.header.findById("NPIX")) === null || _d === void 0 ? void 0 : _d.value);
                        if (isNaN(this.order) || isNaN(naxis1) || isNaN(naxis2) || isNaN(this.tileno)) {
                            console.warn("fits ".concat(path, " doesn't exist"));
                            return [2 /*return*/, null];
                        }
                        if (naxis1 != naxis2) {
                            console.error("NAXIS1 and NAXIS2 do not match.");
                            return [2 /*return*/, null];
                        }
                        this.tileWidth = naxis1;
                        console.log(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    HiPSFITS.prototype.getFITS = function () {
        // return <FITSParsed>{header: this.header, data: this.payload}
        return { header: this.header, data: this.payload };
    };
    HiPSFITS.prototype.setPayload = function (raDecList, originalValues, fitsHeaderParams) {
        var _a, _b, _c, _d;
        this.payload = new Array(this.tileWidth);
        var bytesXelem = Number((_a = fitsHeaderParams.findById(jsfitsio_1.FITSHeaderManager.BITPIX)) === null || _a === void 0 ? void 0 : _a.value);
        if (!bytesXelem) {
            console.error("BITPIX not defined");
            throw new Error("BITPIX not defined");
        }
        for (var row = 0; row < this.tileWidth; row++) {
            this.payload[row] = new Uint8Array(this.tileWidth * bytesXelem);
        }
        for (var rdidx = 0; rdidx < raDecList.length; rdidx++) {
            var _e = raDecList[rdidx], ra = _e[0], dec = _e[1];
            var ac = (0, Utils_js_1.fillAstro)(ra, dec, NumberType_js_1.NumberType.DEGREES);
            var sc = (0, Utils_js_1.astroToSpherical)(ac);
            var ptg = new healpixjs_1.Pointing(null, false, sc.thetaRad, sc.phiRad);
            var pixtileno = this.healpix.ang2pix(ptg);
            var xy = HiPSIntermediateProj_js_1.HiPSIntermediateProj.world2intermediate(ac);
            var ij = HiPSIntermediateProj_js_1.HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, this.tileWidth);
            var col = ij[0];
            var row = ij[1];
            if (pixtileno != this.tileno) {
                continue;
            }
            for (var b = 0; b < bytesXelem; b++) {
                var byte = originalValues[rdidx * bytesXelem + b];
                this.payload[row][col * bytesXelem + b] = byte;
                // TODO check what's nodata!
                // if (nodata.get("" + pixtileno + "")) {
                // 	if (byte != 0) {
                // 		nodata.set("" + pixtileno + "", false);
                // 	}
                // }
                var bitpix = Number((_b = fitsHeaderParams.findById(jsfitsio_1.FITSHeaderManager.BITPIX)) === null || _b === void 0 ? void 0 : _b.value);
                var valpixb = jsfitsio_1.ParseUtils.extractPixelValue(0, this.payload[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), bitpix);
                if (valpixb == null) {
                    continue;
                }
                var bzero = Number((_c = fitsHeaderParams.findById(jsfitsio_1.FITSHeaderManager.BZERO)) === null || _c === void 0 ? void 0 : _c.value);
                var bscale = Number((_d = fitsHeaderParams.findById(jsfitsio_1.FITSHeaderManager.BSCALE)) === null || _d === void 0 ? void 0 : _d.value);
                var valphysical = bzero + bscale * valpixb;
                if (valphysical < this.min || isNaN(this.min)) {
                    this.min = valphysical;
                }
                else if (valphysical > this.max || isNaN(this.max)) {
                    this.max = valphysical;
                }
            }
        }
    };
    HiPSFITS.prototype.addMandatoryItemToHeader = function (key, fitsHeaderParams) {
        var _a;
        var value = (_a = fitsHeaderParams.findById(key)) === null || _a === void 0 ? void 0 : _a.value;
        if (value === undefined || value == null) {
            console.error("".concat(key, " not defined"));
            throw new Error(key + " is not defined");
        }
        var item = new jsfitsio_1.FITSHeaderItem(key, value, "");
        this.header.insert(item);
    };
    HiPSFITS.prototype.addItemToHeader = function (key, fitsHeaderParams) {
        var _a;
        var value = (_a = fitsHeaderParams.findById(key)) === null || _a === void 0 ? void 0 : _a.value;
        if (value !== undefined || value != null) {
            var item = new jsfitsio_1.FITSHeaderItem(key, value, "");
            this.header.insert(item);
        }
    };
    HiPSFITS.prototype.setHeader = function (fitsHeaderParams) {
        this.header = new jsfitsio_1.FITSHeaderManager();
        this.addMandatoryItemToHeader(jsfitsio_1.FITSHeaderManager.SIMPLE, fitsHeaderParams);
        this.addMandatoryItemToHeader(jsfitsio_1.FITSHeaderManager.BITPIX, fitsHeaderParams);
        this.addItemToHeader(jsfitsio_1.FITSHeaderManager.BLANK, fitsHeaderParams);
        this.addItemToHeader(jsfitsio_1.FITSHeaderManager.BSCALE, fitsHeaderParams);
        this.addItemToHeader(jsfitsio_1.FITSHeaderManager.BZERO, fitsHeaderParams);
        this.header.insert(new jsfitsio_1.FITSHeaderItem("NAXIS", Number(2), ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("NAXIS1", Number(this.tileWidth), ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("NAXIS2", Number(this.tileWidth), ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.DATAMIN, this.min, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.DATAMAX, this.min, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(HiPSProp_js_1.HiPSProp.ORDER, Number(this.order), ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("NPIX", Number(this.tileno), ""));
        var crpix = this.tileno / 2;
        this.header.insert(new jsfitsio_1.FITSHeaderItem("CRPIX1", crpix, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("CRPIX2", crpix, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("ORIGIN", "WCSLight v.0.x", ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("COMMENT", "", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        var vec3 = this.healpix.pix2vec(this.tileno);
        var ptg = new healpixjs_1.Pointing(vec3);
        var crval1 = (0, Utils_js_1.radToDeg)(ptg.phi);
        var crval2 = 90 - (0, Utils_js_1.radToDeg)(ptg.theta);
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.CRVAL1, crval1, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem(jsfitsio_1.FITSHeaderManager.CRVAL2, crval2, ""));
        this.header.insert(new jsfitsio_1.FITSHeaderItem("END", "", ""));
    };
    HiPSFITS.CTYPE1 = "RA---HPX";
    HiPSFITS.CTYPE2 = "DEC--HPX";
    return HiPSFITS;
}());
exports.HiPSFITS = HiPSFITS;
