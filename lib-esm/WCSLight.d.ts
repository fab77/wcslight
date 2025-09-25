/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { Point } from './model/Point.js';
import { AbstractProjection } from './projections/AbstractProjection.js';
import { FITSList } from './projections/hips/FITSList.js';
import { HiPSFITS } from './projections/hips/HiPSFITS.js';
import { CutoutResult } from './projections/hips/CutoutResult.js';
export declare class WCSLight {
    /**
     * This function receives a FITS and generate a cutout on HiPS FITS.
     * @param center of the cutout in degrees
     * @param radius of the cutout in degrees
     * @param pxsize of the cutout in degrees
     * @param filePath of the input FITS file
     * @returns fitsList of FITS in HiPS format
     */
    static fitsCutoutToHiPS(center: Point, radius: number, pxsize: number, filePath: string): Promise<FITSList | null>;
    static extractProjectionType(filePath: string): Promise<AbstractProjection | null>;
    static hipsCutoutToFITS(center: Point, radius: number, pixelAngSize: number, baseHiPSURL: string, outproj: AbstractProjection, hipsOrder?: number | null): Promise<CutoutResult | null>;
    static hipsFITSChangeProjection(): HiPSFITS | null;
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static getAvaillableProjections(): string[];
}
//# sourceMappingURL=WCSLight.d.ts.map