/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { MercatorProjection } from './projections/MercatorProjection.js';
import { HiPSProjection } from './projections/HiPSProjection.js';
import { Point } from './model/Point.js';
import { AbstractProjection } from './projections/AbstractProjection.js';
import { CutoutResult } from './model/CutoutResult.js';
import { HEALPixProjection } from './projections/HEALPixProjection.js';
import { GnomonicProjection } from './projections/GnomonicProjection.js';
export declare class WCSLight {
    static cutout(center: Point, radius: number, pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult>;
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static generateFITS(fitsheader: any, fitsdata: any): string;
    static changeProjection(filepath: any, outprojname: any): void;
    static getProjection(projectionName: string): MercatorProjection | HiPSProjection | HEALPixProjection | GnomonicProjection | null;
    static getAvaillableProjections(): string[];
}
//# sourceMappingURL=WCSLight.d.ts.map