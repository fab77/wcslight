/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { Healpix } from 'healpixjs';
import { HEALPixXYSpace } from "../model/HEALPixXYSpace.js";
import { Point } from "../model/Point.js";
import { AstroCoords } from "../model/AstroCoords.js";
export declare class HiPSHelper {
    static DEFAULT_Naxis1_2: number;
    static RES_ORDER_0: number;
    static H: number;
    static K: number;
    static THETAX: number;
    /**
     * Table 1 - ref paper HEALPix — a Framework for High Resolution Discretization,
     * and Fast Analysis of Data Distributed on the Sphere
     * K. M. G´orski1,2, E. Hivon3,4, A. J. Banday5, B. D. Wandelt6,7, F. K. Hansen8, M.
     * Reinecke5, M. Bartelman9
     */
    /**
     *
     * @param {decimal degrees} pxsize
     * @returns {int} nside
     */
    static computeHiPSOrder(pxsize: number, pxXtile: number): number;
    static computeHiPSOrder2(pxsize: number, pxXtile: number): number;
    static computeOrder(pxAngSizeDeg: number, pxTileWidth: number): number;
    static computePxAngularSize(pxTileWidth: number, order: number): {
        rad: number;
        deg: number;
        arcmin: number;
        arcsec: number;
    };
    /**
     * Reference: HiPS – Hierarchical Progressive Survey page 11
     * pxsize =~ sqrt[4 * PI / (12 * (512 * 2^order)^2)]
     * @param {*} order
     */
    static computePxSize(order: number, pxXtile: number): number;
    /**
     *
     * @param {Object {phi_rad, theta_rad}} phiTheta_rad Center of the circle in radians
     * @param {decimal} r Radius of the circle in radians
     * @returns
     */
    static computeBbox(point: Point, r: number): number[];
    static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace;
    static world2intermediate(ac: AstroCoords): [number, number];
    static intermediate2pix(x: number, y: number, xyGridProj: HEALPixXYSpace, pxXtile: number): [number, number];
    static pix2intermediate(i: number, j: number, xyGridProj: HEALPixXYSpace, naxis1: number, naxis2: number): [number, number];
    static intermediate2world(x: number, y: number): Point;
}
//# sourceMappingURL=HiPSHelper.d.ts.map