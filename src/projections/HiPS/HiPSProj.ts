import { FITSList } from "./FITSList.js";
import { HiPSProp } from "./HiPSProp.js"
import { HiPSPropManager } from "./HiPSPropManager.js";
import { Point } from "../../model/Point.js";
import { Healpix, Pointing, RangeSet } from "healpixjs";
import { degToRad } from "../../model/Utils.js";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { FITSHeaderManager, FITSParser } from "jsfitsio";
import { TilesRaDecList } from "./TilesRaDecList.js";
import { HiPSFITS } from "./HiPSFITS.js";
// import { ImagePixel } from "../../model/ImagePixel.js";
import { ImagePixel } from "./ImagePixel.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { TilesRaDecList2 } from "./TilesRaDecList2.js";



export class HiPSProj {

    private baseURL: string
    private healpix: Healpix | null = null
    private hipsProp: HiPSProp | null = null

    constructor(baseHiPSPath: string) {
        this.baseURL = baseHiPSPath
        this.init()
        if (this.healpix == null) {
            console.warn("healpix is null")
            throw new Error("healpix is null")
        }
        if (this.hipsProp == null) {
            console.warn("HiPSProp is null")
            throw new Error("HiPSProp is null")
        }
    }

    async init() {
        const hipsProp = await this.parsePropertyFile()
        const order = hipsProp.getItem(HiPSProp.ORDER)
        this.healpix = HiPSHelper.getHelpixByOrder(order)
    }

    private async parsePropertyFile() {
        const hipsProp = HiPSPropManager.parsePropertyFile(this.baseURL)
        return hipsProp
    }

    static getImageRADecList(center: Point, radiusDeg: number, pixelAngSize: number, TILE_WIDTH: number): TilesRaDecList2 | null {



        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH)

        // let tilesRaDecList2 = new TilesRaDecList2(healpix.order)
        let tilesRaDecList2 = new TilesRaDecList2()


        const ptg = new Pointing(null, false, center.getSpherical().thetaRad, center.getSpherical().phiRad);
        const radius_rad = degToRad(radiusDeg);

        // ??? with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        const rangeset: RangeSet = healpix.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 

        // TODO try to replace tileslist with FITSList!!!
        // const tileslist: Array<number> = [];
        for (let p = 0; p < rangeset.r.length; p++) {

            // if (!tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
            //     tileslist.push(rangeset.r[p]);
            // }
            if (!tilesRaDecList2.getTilesList().includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                tilesRaDecList2.addTileNumber(rangeset.r[p])
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

        tilesRaDecList2.getTilesList().forEach((tileno: number) => {
            // tileslist.forEach((tileno: number) => {

            for (let j = 0; j < TILE_WIDTH; j++) {
                for (let i = 0; i < TILE_WIDTH; i++) {

                    const point: Point | null = HiPSProj.pix2world(i, j, tileno, healpix, TILE_WIDTH);

                    if (point == null) continue
                    if (point.getAstro().raDeg < minra || point.getAstro().raDeg > maxra ||
                        point.getAstro().decDeg < mindec || point.getAstro().decDeg > maxdec) {
                        continue;
                    }
                    tilesRaDecList2.addImagePixel(new ImagePixel(point.getAstro().raDeg, point.getAstro().decDeg, tileno))
                    // raDecList.push([point.getAstro().raDeg, point.getAstro().decDeg]);
                }
            }
        })

        // const tilesRaDecList = new TilesRaDecList(raDecList, tileslist)
        // return tilesRaDecList
        return tilesRaDecList2
    }

    static pix2world(i: number, j: number, tileno: number, healpix: Healpix, TILE_WIDTH: number): Point | null {

        let p = null
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
        } else {
            throw new Error("Healpix not set."); // or handle the issue as per your use case
        }


        return p;
    }

    // static getFITSFiles(inputValues: Uint8Array, tilesRaDecList: TilesRaDecList, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH?: number): FITSList {
    static getFITSFiles(tilesRaDecList: TilesRaDecList2, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH: number): FITSList {

        const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH)

        let fitsList = new FITSList()

        tilesRaDecList.getTilesList().forEach((tileno: number) => {
            let hipsProp = new HiPSProp()
            hipsProp.addItem(HiPSProp.ORDER, healpix.order)
            hipsProp.addItem(HiPSProp.TILE_WIDTH, TILE_WIDTH)
            const hipsFits = new HiPSFITS(null, tileno, hipsProp)

            const imagePixelsByTilesNo = tilesRaDecList.getImagePixelsByTile(tileno)

            hipsFits.initFromUint8Array(imagePixelsByTilesNo, fitsHeaderParams, TILE_WIDTH)
            fitsList.addFITS(hipsFits)
        })
        return fitsList

    }

    static async world2pix(radeclist: TilesRaDecList2, hipsOrder: number, isGalactic: boolean, TILE_WIDTH: number, baseHiPSURL: string): Promise<TilesRaDecList2 | null> {

        const healpix = HiPSHelper.getHelpixByOrder(hipsOrder)

        let tileno: number;
        let prevTileno: number | null = null;
        /* if HiPS in galactic => convert the full list of (RA, Dec) to Galactic  (l, b) */
        if (isGalactic) {
            HiPSProj.convertToGalactic(radeclist);
        }
        let xyGridProj: HEALPixXYSpace | null = null



        radeclist.getImagePixelList().forEach((imgpx) => {
            const ra = imgpx.getRADeg()
            const dec = imgpx.getDecDeg()

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
                imgpx.setij(ij[0], ij[1])
                imgpx.setTileNumber(tileno)
            }
            radeclist.addTileNumber(tileno)
        });
        let result = await HiPSProj.getPixelValues(radeclist, baseHiPSURL, hipsOrder)
        return result
    }

    // TODO move this to Utils.js
    static convertToGalactic(radeclist: TilesRaDecList2) {
        // let finalradeclist: number[][] = [];
        const deg2rad = Math.PI / 180
        const rad2deg = 180 / Math.PI
        const l_NCP = deg2rad * 122.930
        const d_NGP = deg2rad * 27.1284
        const a_NGP = deg2rad * 192.8595
        radeclist.getImagePixelList().forEach( (imgpx) => {
            const ra = imgpx.getRADeg()
            const dec = imgpx.getDecDeg()
            const ra_rad = deg2rad * ra
            const dec_rad = deg2rad * dec
            // sin(b)
            const sin_b = Math.sin(d_NGP) * Math.sin(dec_rad) +
                Math.cos(d_NGP) * Math.cos(dec_rad) * Math.cos(ra_rad - a_NGP);
            const b = Math.asin(sin_b)
            const b_deg = b * rad2deg

            // l_NCP - l
            const lNCP_minus_l = Math.atan((Math.cos(dec_rad) * Math.sin(ra_rad - a_NGP)) /
                (Math.sin(dec_rad) * Math.cos(d_NGP) - Math.cos(dec_rad) * Math.sin(d_NGP) * Math.cos(ra_rad - a_NGP)));
            const l = l_NCP - lNCP_minus_l
            const l_deg = l * rad2deg
            imgpx.setRADecDeg(l_deg, b_deg)
            // finalradeclist.push([l_deg, b_deg])
        });
        // return finalradeclist;
    }

    static async getPixelValues(raDecList: TilesRaDecList2, baseHiPSURL: string, hipsOrder: number): Promise<TilesRaDecList2 | null> {

        const tilesset = raDecList.getTilesList()
        let promises = [];
        
        for (let hipstileno of tilesset) {

            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            console.log(`Identified source file ${fitsurl}`)

            // TODO change the code below to used HiPSFITS and FITSList instead!
            promises.push(FITSParser.loadFITS(fitsurl).then((fitsParsed) => {

                if (fitsParsed) {

                    const bitpix = Number(fitsParsed.header.findById("BITPIX")?.value)
                    const naxis1 = Number(fitsParsed.header.findById("NAXIS1")?.value)
                    const naxis2 = Number(fitsParsed.header.findById("NAXIS2")?.value)
                    if (!bitpix || !naxis1 || !naxis2) {
                        console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`)
                        return
                    }

                    const bytesXelem = Math.abs(bitpix / 8);

                    raDecList.getImagePixelsByTile(hipstileno).forEach((imgpx) => {
                        const valueBytes = new Uint8Array(bytesXelem);
                        for (let b = 0; b < bytesXelem; b++) {
                            valueBytes[b] = fitsParsed.data[imgpx.getj()][imgpx.geti() * bytesXelem + b];
                        }
                        imgpx.setValue(valueBytes, bitpix);
                        raDecList.setMinMaxValue(imgpx.getValue())
                    })
                }
            }));
        }
        await Promise.all(promises);
        return raDecList
    }

}