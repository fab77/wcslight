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
import { Point } from "../../model/Point.js";
import { Pointing } from "healpixjs";
import { degToRad } from "../../model/Utils.js";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { FITSParser } from "jsfitsio";
import { TilesRaDecList } from "./TilesRaDecList.js";
import { HiPSFITS } from "./HiPSFITS.js";
import { ImagePixel } from "../../model/ImagePixel.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
export class HiPSProj {
    constructor(baseHiPSPath) {
        this.healpix = null;
        this.hipsProp = null;
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const hipsProp = yield this.parsePropertyFile();
            const order = hipsProp.getItem(HiPSProp.ORDER);
            this.healpix = HiPSHelper.getHelpixByOrder(order);
        });
    }
    parsePropertyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const hipsProp = HiPSPropManager.parsePropertyFile(this.baseURL);
            return hipsProp;
        });
    }
    // static getImageRADecList(center: Point, radiusDeg: number, hipsOrder: number, TILE_WIDTH?: number): TilesRaDecList | null {
    static getImageRADecList(center, radiusDeg, pixelAngSize, TILE_WIDTH) {
        // const hipsSide = 2**hipsOrder
        // const healpix = new Healpix(hipsSide)
        if (!TILE_WIDTH)
            TILE_WIDTH = 512;
        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);
        const ptg = new Pointing(null, false, center.getSpherical().thetaRad, center.getSpherical().phiRad);
        const radius_rad = degToRad(radiusDeg);
        // with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        const rangeset = healpix.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
        // TODO try to replace tileslist with FITSList!!!
        const tileslist = [];
        for (let p = 0; p < rangeset.r.length; p++) {
            if (!tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                tileslist.push(rangeset.r[p]);
            }
        }
        const cpix = healpix.ang2pix(ptg);
        if (!tileslist.includes(cpix)) {
            tileslist.push(cpix);
        }
        let raDecList = [];
        let minra = center.getAstro().raDeg - radiusDeg;
        let maxra = center.getAstro().raDeg + radiusDeg;
        let mindec = center.getAstro().decDeg - radiusDeg;
        let maxdec = center.getAstro().decDeg + radiusDeg;
        tileslist.forEach((tileno) => {
            for (let j = 0; j < TILE_WIDTH; j++) {
                for (let i = 0; i < TILE_WIDTH; i++) {
                    const point = HiPSProj.pix2world(i, j, tileno, healpix, TILE_WIDTH);
                    if (point == null)
                        continue;
                    if (point.getAstro().raDeg < minra || point.getAstro().raDeg > maxra ||
                        point.getAstro().decDeg < mindec || point.getAstro().decDeg > maxdec) {
                        continue;
                    }
                    raDecList.push([point.getAstro().raDeg, point.getAstro().decDeg]);
                }
            }
        });
        const tilesRaDecList = new TilesRaDecList(raDecList, tileslist);
        return tilesRaDecList;
    }
    static pix2world(i, j, tileno, healpix, TILE_WIDTH) {
        let p = null;
        if (healpix) {
            const xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
            let xy = HiPSIntermediateProj.pix2intermediate(i, j, xyGridProj, TILE_WIDTH, TILE_WIDTH);
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
    static getFITSFiles(inputValues, tilesRaDecList, fitsHeaderParams, pixelAngSize, TILE_WIDTH) {
        if (!TILE_WIDTH)
            TILE_WIDTH = 512;
        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);
        let fitsList = new FITSList();
        tilesRaDecList.getTilesNumberList().forEach((tileno) => {
            let hipsProp = new HiPSProp();
            hipsProp.addItem(HiPSProp.ORDER, healpix.order);
            hipsProp.addItem(HiPSProp.TILE_WIDTH, TILE_WIDTH);
            const hipsFits = new HiPSFITS(null, tileno, hipsProp);
            hipsFits.initFromUint8Array(tilesRaDecList.getRaDecList(), inputValues, fitsHeaderParams);
            fitsList.addFITS(hipsFits);
        });
        return fitsList;
    }
    static world2pix(radeclist, hipsOrder, isGalactic, TILE_WIDTH) {
        if (!TILE_WIDTH)
            TILE_WIDTH = 512;
        // const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH)
        const healpix = HiPSHelper.getHelpixByOrder(hipsOrder);
        let imgpxlist = [];
        let tileno;
        let prevTileno = null;
        /* if HiPS in galactic => convert the full list of (RA, Dec) to Galactic  (l, b) */
        if (isGalactic) {
            radeclist = HiPSProj.convertToGalactic(radeclist);
        }
        let xyGridProj = null;
        radeclist.forEach(([ra, dec]) => {
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
                imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
            }
        });
        return imgpxlist;
    }
    // TODO move this to Utils.js
    static convertToGalactic(radeclist) {
        let finalradeclist = [];
        const deg2rad = Math.PI / 180;
        const rad2deg = 180 / Math.PI;
        const l_NCP = deg2rad * 122.930;
        const d_NGP = deg2rad * 27.1284;
        const a_NGP = deg2rad * 192.8595;
        radeclist.forEach(([ra, dec]) => {
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
            finalradeclist.push([l_deg, b_deg]);
        });
        return finalradeclist;
    }
    static getPixelValues(inputPixelsList, baseHiPSURL, hipsOrder, TILE_WIDTH) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!TILE_WIDTH)
                TILE_WIDTH = 512;
            // const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH)
            const healpix = HiPSHelper.getHelpixByOrder(hipsOrder);
            const order = healpix.order;
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            let pixcount = inputPixelsList.length;
            // TODO change the code below to used HiPSFITS and FITSList instead!
            let values = new Uint8Array();
            // TODO change the code below to used HiPSFITS and FITSList instead!
            let fitsheaderlist = [];
            let promises = [];
            // let fitsList = new FITSList()
            for (let hipstileno of tilesset) {
                const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                const fitsurl = baseHiPSURL + "/Norder" + order + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
                console.log(`Identified source file ${fitsurl}`);
                // TODO change the code below to used HiPSFITS and FITSList instead!
                promises.push(FITSParser.loadFITS(fitsurl).then((fitsParsed) => {
                    var _a, _b, _c;
                    if (fitsParsed) {
                        // const hipsFits = new HiPSFITS(fitsParsed, null, null)
                        // hipsFits.initFromFITSParsed(fitsParsed)
                        // fitsList.addFITS(hipsFits)
                        const bitpix = Number((_a = fitsParsed.header.findById("BITPIX")) === null || _a === void 0 ? void 0 : _a.value);
                        const naxis1 = Number((_b = fitsParsed.header.findById("NAXIS1")) === null || _b === void 0 ? void 0 : _b.value);
                        const naxis2 = Number((_c = fitsParsed.header.findById("NAXIS2")) === null || _c === void 0 ? void 0 : _c.value);
                        if (!bitpix || !naxis1 || !naxis2) {
                            console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`);
                            return;
                        }
                        const bytesXelem = Math.abs(bitpix / 8);
                        if (values.length == 0) {
                            values = new Uint8Array(pixcount * bytesXelem);
                        }
                        fitsheaderlist.push(fitsParsed.header);
                        for (let p = 0; p < pixcount; p++) {
                            let imgpx = inputPixelsList[p];
                            if (imgpx.tileno === hipstileno) {
                                if (imgpx._j < naxis1 && imgpx._i < naxis2) {
                                    for (let b = 0; b < bytesXelem; b++) {
                                        values[p * bytesXelem + b] = fitsParsed.data[imgpx._j][imgpx._i * bytesXelem + b];
                                    }
                                }
                            }
                        }
                    }
                }));
            }
            yield Promise.all(promises);
            return values;
        });
    }
}
//# sourceMappingURL=HiPSProj.js.map