/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { FITSParser } from 'jsfitsio';
import { MercatorProjection } from './projections/mercator/MercatorProjection.js';
import { HiPSProjection } from './projections/hips/HiPSProjection.js';
import { HiPSPropManager } from './projections/hips/HiPSPropManager.js';
import { HiPSProperties } from './projections/hips/HiPSProperties.js';
import { HiPSHelper } from './projections/HiPSHelper.js';
import { CutoutResult } from './projections/hips/CutoutResult.js';
export class WCSLight {
    /**
     * This function receives a FITS and generate a cutout on HiPS FITS.
     * @param center of the cutout in degrees
     * @param radius of the cutout in degrees
     * @param pxsize of the cutout in degrees
     * @param filePath of the input FITS file
     * @returns fitsList of FITS in HiPS format
     */
    static async fitsCutoutToHiPS(center, radius, pxsize, filePath) {
        const HiPS_TILE_WIDTH = 512;
        // 0. here is missing the validation/check that the input file used to get the value, contains the center ...
        // 1. open input fits file and understand the projection and set up in inprojection details like NAXIS1-2, CDELT1-2, CRVAL1-2, minRa and minDec
        const inProjection = await WCSLight.extractProjectionType(filePath);
        if (!inProjection)
            return null;
        // const bitpix = inProjection.getBitpix()
        // 2. from HiPS output projection, compute the list of RA,Dec and related tileno based on center, radius, pxsize, and tilewidth forced to 512
        const outTilesRaDecList = HiPSProjection.getImageRADecList(center, radius, pxsize, HiPS_TILE_WIDTH);
        if (!outTilesRaDecList) {
            return null;
        }
        // 3. by using the list of RA and Dec on point 2., convert RA,Dec into i,j used in the input projection to get pixel values (try to merge the 2 calls below in one single method)
        inProjection.world2pix(outTilesRaDecList);
        // const invalues = await inProjection.getPixValues(tilesRaDecList)
        // 4. collect the details required to construct the output HiPS projection header 
        // const fitsHeaderParams = inProjection.getCommonFitsHeaderParams();
        // here pass inProjection.getFITSHeader()
        // 5. generate output HiPS FITS file(s)
        const fitsFileList = HiPSProjection.getFITSFiles(outTilesRaDecList, inProjection.getFITSHeader(), pxsize, HiPS_TILE_WIDTH);
        for (let hipsFitsEntry of fitsFileList.getFITSList()) {
            const tileno = hipsFitsEntry[0];
            const hipsFits = hipsFitsEntry[1];
            const data = hipsFits.getPayload();
            const header = hipsFits.getHeader();
            const FITS_FILE_PATH = `./hips_${tileno}.fits`;
            const fitsParsed = { header: header, data: data };
            FITSParser.saveFITSLocally(fitsParsed, FITS_FILE_PATH);
        }
        return fitsFileList;
    }
    // only MERCATOR supported at the moment
    static async extractProjectionType(filePath) {
        let fits = await FITSParser.loadFITS(filePath);
        if (!fits)
            return null;
        const ctype = String(fits.header.findById("CTYPE1")?.value);
        if (ctype.includes("MER")) {
            let projection = new MercatorProjection();
            await projection.initFromFile(filePath);
            return projection;
        }
        return null;
    }
    // TODO: instead of using AbstractProjection, use a constant file with supported projection names
    static async hipsCutoutToFITS(center, radius, pixelAngSize, baseHiPSURL, outproj, hipsOrder = null) {
        const hipsProp = await HiPSPropManager.parsePropertyFile(baseHiPSURL);
        const hipsMaxOrder = hipsProp.getItem(HiPSProperties.ORDER);
        const hipsFrame = hipsProp.getItem(HiPSProperties.FRAME);
        const TILE_WIDTH = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
        let isGalactic = false;
        if (hipsFrame.toLowerCase() == 'galactic') {
            isGalactic = true;
        }
        if (!hipsOrder) {
            const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH, hipsMaxOrder);
            hipsOrder = Number(healpix.order);
        }
        /*
        below how naxis are computed
        outproj.getImageRADecList -> computeSquaredNaxes -> set naxis1 and naxis2
        */
        const naxisWidth = outproj.computeNaxisWidth(radius, pixelAngSize);
        const outRADecList = outproj.getImageRADecList(center, radius, pixelAngSize, naxisWidth);
        if (!outRADecList)
            return null;
        const raDecMinMaxCentral = outRADecList.computeRADecMinMaxCentral();
        const cRA = raDecMinMaxCentral?.getCentralRA();
        const cDec = raDecMinMaxCentral?.getCentralDec();
        if (cRA === undefined || cDec === undefined)
            return null;
        // TODO check if possible to compute in the word2pix, when iterating onver ImagePixels, the min and max value.
        const raDecWithValues = await HiPSProjection.world2pix(outRADecList, hipsOrder, isGalactic, TILE_WIDTH, baseHiPSURL);
        if (!raDecWithValues)
            return null;
        const minValue = raDecWithValues.getMinMaxValues()?.getMinValue();
        const maxValue = raDecWithValues.getMinMaxValues()?.getMaxValue();
        if (minValue === undefined || maxValue === undefined)
            return null;
        /** info required:
         * SIMPLE  = T
            BITPIX  = -64
            NAXIS   = 2
            NAXIS1  = 512
            NAXIS2  = 512
            BSCALE  = 1
            BZERO   = 0
            CTYPE1  = RA---HPX
            CTYPE2  = DEC--HPX
            DATAMIN = 0
            DATAMAX = 0
            hips_order= 7
            NPIX    = 113056
            CRPIX1  = 56528
            CRPIX2  = 56528
            ORIGIN  = WCSLight v.0.x
            COMMENT =  / WCSLight v0.x developed by F.Giordano and Y.Ascasibar
            CRVAL1  = 170.15625
            CRVAL2  = 18.5243910738658
            END
         */
        // TODO BLANK, BZERO, BSCALE must be taken from the FITS tiles and not from the HiPS metadata.
        const BLANK = raDecWithValues.getBLANK();
        const BZERO = raDecWithValues.getBZERO();
        const BSCALE = raDecWithValues.getBSCALE();
        if (BLANK === null || BZERO === null || BSCALE === null)
            return null;
        console.log(`BLANK: ${BLANK}, BZERO: ${BZERO}, BSCALE: ${BSCALE}`);
        // validate BITPIX
        const BITPIX = parseInt(hipsProp.getItem(HiPSProperties.BITPIX));
        if (BITPIX != 8 && BITPIX != 16 && BITPIX != 32 && BITPIX != -32 && BITPIX != -64) {
            throw new Error("unsupported BITPIX value");
        }
        const fits = outproj.generateFITSFile(pixelAngSize, hipsProp.getItem(HiPSProperties.BITPIX), naxisWidth, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues);
        console.log(fits);
        const FITS_FILE_PATH = `./cartesian2.fits`;
        const fitsParsed = { header: fits.getHeader(), data: fits.getData() };
        FITSParser.saveFITSLocally(fitsParsed, FITS_FILE_PATH);
        let hipsUsed = Array();
        raDecWithValues.getTilesList().forEach((hipstileno) => {
            const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
            const fitsurl = baseHiPSURL + "/Norder" + hipsOrder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
            hipsUsed.push(fitsurl);
        });
        const result = new CutoutResult(fits, hipsUsed);
        return result;
    }
    static hipsFITSChangeProjection() {
        return null;
    }
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static generateFITS(fitsheader, fitsdata) {
        const fitsParsed = {
            header: fitsheader,
            data: fitsdata
        };
        // const blobUrl = FITSParser.generateFITSForWeb(fitsheader, fitsdata);
        const blobUrl = FITSParser.generateFITSForWeb(fitsParsed);
        return blobUrl;
    }
    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }
}
//# sourceMappingURL=WCSLight.js.map