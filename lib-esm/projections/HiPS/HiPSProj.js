var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FITSList } from "./FITSList.js";
import { HiPSProp } from "./HiPSProp.js";
import { HiPSPropManager } from "./HiPSPropManager.js";
import { Healpix, Pointing } from "healpixjs";
import { degToRad } from "../../model/Utils.js";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { TilesRaDecList } from "./TilesRaDecList.js";
import { HiPSFITS } from "./HiPSFITS.js";
export class HiPSProj {
    constructor(baseHiPSPath) {
        this.healpix = null;
        this.hipsProp = null;
        this.baseURL = baseHiPSPath;
        this.ctype1 = 'RA---HPX';
        this.ctype2 = 'DEC--HPX';
        this.fitsList = new FITSList();
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const hipsProp = yield this.parsePropertyFile();
            const order = hipsProp.getItem(HiPSProp.ORDER);
            const nside = Math.pow(2, order);
            this.healpix = new Healpix(nside);
        });
    }
    parsePropertyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const hipsProp = HiPSPropManager.parsePropertyFile(this.baseURL);
            return hipsProp;
        });
    }
    // getImageRADecList(center: Point, radiusDeg: number): Array<[number, number]> {
    getImageRADecList(center, radiusDeg) {
        if (this.healpix == null) {
            return null;
        }
        const ptg = new Pointing(null, false, center.spherical.thetaRad, center.spherical.phiRad);
        const radius_rad = degToRad(radiusDeg);
        // with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        const rangeset = this.healpix.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
        // TODO try to replace tileslist with FITSList!!!
        const tileslist = [];
        for (let p = 0; p < rangeset.r.length; p++) {
            if (!tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                tileslist.push(rangeset.r[p]);
            }
        }
        let cpix = this.healpix.ang2pix(ptg);
        if (!tileslist.includes(cpix)) {
            tileslist.push(cpix);
        }
        let raDecList = [];
        let minra = center.astro.raDeg - radiusDeg;
        let maxra = center.astro.raDeg + radiusDeg;
        let mindec = center.astro.decDeg - radiusDeg;
        let maxdec = center.astro.decDeg + radiusDeg;
        tileslist.forEach((tileno) => {
            var _a, _b;
            for (let j = 0; j < ((_a = this.hipsProp) === null || _a === void 0 ? void 0 : _a.getItem(HiPSProp.TILE_WIDTH)); j++) {
                for (let i = 0; i < ((_b = this.hipsProp) === null || _b === void 0 ? void 0 : _b.getItem(HiPSProp.TILE_WIDTH)); i++) {
                    const point = this.pix2world(i, j, tileno);
                    if (point == null)
                        continue;
                    if (point.astro.raDeg < minra || point.astro.raDeg > maxra ||
                        point.astro.decDeg < mindec || point.astro.decDeg > maxdec) {
                        continue;
                    }
                    raDecList.push([point.astro.raDeg, point.astro.decDeg]);
                }
            }
        });
        const tilesRaDecList = new TilesRaDecList(raDecList, tileslist);
        return tilesRaDecList;
    }
    pix2world(i, j, tileno) {
        var _a, _b;
        let p = null;
        if (this.healpix) {
            const xyGridProj = HiPSIntermediateProj.setupByTile(tileno, this.healpix);
            let xy = HiPSIntermediateProj.pix2intermediate(i, j, xyGridProj, (_a = this.hipsProp) === null || _a === void 0 ? void 0 : _a.getItem(HiPSProp.TILE_WIDTH), (_b = this.hipsProp) === null || _b === void 0 ? void 0 : _b.getItem(HiPSProp.TILE_WIDTH));
            // TODO CHECK BELOW before it was only which is supposed to be wrong since intermediate2world returns SphericalCoords, not AstroCoords
            /**
            let raDecDeg = HiPSHelper.intermediate2world(xy[0], xy[1]);
            if (raDecDeg[0] > 360){
                raDecDeg[0] -= 360;
            }
            return raDecDeg;
            */
            p = HiPSIntermediateProj.intermediate2world(xy[0], xy[1]);
            // if (p.spherical.phiDeg > 360){
            // 	sc.phiDeg -= 360;
            // }
        }
        else {
            throw new Error("Healpix not set."); // or handle the issue as per your use case
        }
        return p;
    }
    setPxsValue(inputValues, tilesRaDecList, fitsHeaderParams) {
        var _a, _b;
        const tileWidth = (_a = this.hipsProp) === null || _a === void 0 ? void 0 : _a.getItem(HiPSProp.TILE_WIDTH);
        if (tileWidth == null) {
            console.error("TILE_WIDTH not set");
            throw new Error("TILE_WIDTH not set");
        }
        if (this.healpix == null) {
            console.error("healpix not set");
            throw new Error("healpix not set");
        }
        const bitpix = Number((_b = fitsHeaderParams.findById("BITPIX")) === null || _b === void 0 ? void 0 : _b.value);
        if (!bitpix) {
            throw new Error("BITPIX is undefined");
        }
        let fistList = new FITSList();
        tilesRaDecList.getTilesNumberList().forEach((tileno) => {
            const hipsFits = new HiPSFITS(null, tileno, this.hipsProp, this.healpix);
            hipsFits.setPayload(tilesRaDecList.getRaDecList(), inputValues, fitsHeaderParams);
            hipsFits.setHeader(fitsHeaderParams);
            this.fitsList.addFITS(hipsFits);
        });
        return fistList;
    }
}
//# sourceMappingURL=HiPSProj.js.map