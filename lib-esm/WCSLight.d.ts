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
import { CutoutResult } from './model/CutoutResult.js';
import { FITSList } from './projections/hips/FITSList.js';
import { HiPSFITS } from './projections/hips/HiPSFITS.js';
export declare class WCSLight {
    static cutoutToHips(center: Point, radius: number, pxsize: number, filePath: string): Promise<FITSList | null>;
    static extractProjectionType(filePath: string): Promise<AbstractProjection | null>;
    static hipsCutout(center: Point, radius: number, pixelAngSize: number, baseHiPSURL: string, outproj: AbstractProjection, hipsOrder?: number | null): Promise<CutoutResult | null>;
    static hipsFITSChangeProjection(): HiPSFITS | null;
    static cutout(center: Point, radius: number, pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult>;
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static generateFITS(fitsheader: any, fitsdata: any): string;
    static changeProjection(filepath: any, outprojname: any): void;
    static getProjection(projectionName: string): any;
    static getAvaillableProjections(): string[];
}
//# sourceMappingURL=WCSLight.d.ts.map