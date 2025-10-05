import { FITSList } from "./FITSList.js";
import { HiPSProperties } from "./HiPSProperties.js";
import { HiPSPropManager } from "./HiPSPropManager.js";
import { Point } from "../../model/Point.js";
import { Pointing } from "healpixjs";
import { degToRad } from "../../model/Utils.js";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { FITSParser } from "jsfitsio";
import { HiPSFITS } from "./HiPSFITS.js";
import { ImagePixel } from "./ImagePixel.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { TilesRaDecList2 } from "./TilesRaDecList2.js";
export class HiPSProjection {
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
        const order = healpix.order ?? Math.log2(healpix.nside); // adapt to your healpixjs
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
        let promises = [];
        for (let hipstileno of tilesset) {
            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            console.log(`Identified source file ${fitsurl}`);
            // TODO change the code below to used HiPSFITS and FITSList instead!
            promises.push(FITSParser.loadFITS(fitsurl).then((fitsParsed) => {
                if (fitsParsed) {
                    const bitpix = Number(fitsParsed.header.findById("BITPIX")?.value);
                    const naxis1 = Number(fitsParsed.header.findById("NAXIS1")?.value);
                    const naxis2 = Number(fitsParsed.header.findById("NAXIS2")?.value);
                    if (!bitpix || !naxis1 || !naxis2) {
                        console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`);
                        return;
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
                    // if (naxis1 * naxis2 * Math.abs(bitpix / 8) != fitsParsed.data.length) {
                    //     console.error(`fits data length ${fitsParsed.data.length} does not match expected size ${naxis1 * naxis2 * Math.abs(bitpix / 8)} for fits file ${fitsurl}`)
                    //     return
                    // }
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
            }));
        }
        await Promise.all(promises);
        if (raDecList.getBSCALE() == null) {
            raDecList.setBSCALE(1);
        }
        if (raDecList.getBZERO() == null) {
            raDecList.setBZERO(0);
        }
        if (raDecList.getBLANK() == null) {
            raDecList.setBLANK(0);
        }
        return raDecList;
    }
}
//# sourceMappingURL=HiPSProjection.js.map