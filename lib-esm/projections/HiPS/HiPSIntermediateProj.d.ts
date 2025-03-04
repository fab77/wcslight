import { Healpix } from "healpixjs";
import { AstroCoords } from "../../model/AstroCoords.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { Point } from "../../model/Point.js";
export declare class HiPSIntermediateProj {
    static DEFAULT_Naxis1_2: number;
    static RES_ORDER_0: number;
    static H: number;
    static K: number;
    static THETAX: number;
    static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace;
    static world2intermediate(ac: AstroCoords): [number, number];
    static intermediate2pix(x: number, y: number, xyGridProj: HEALPixXYSpace, pxXtile: number): [number, number];
    static pix2intermediate(i: number, j: number, xyGridProj: HEALPixXYSpace, naxis1: number, naxis2: number): [number, number];
    static intermediate2world(x: number, y: number): Point;
}
//# sourceMappingURL=HiPSIntermediateProj.d.ts.map