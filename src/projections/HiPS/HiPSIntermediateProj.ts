//HiPSIntermediateProj.ts
import { Healpix, Hploc, Pointing } from "healpixjs";
import { AstroCoords } from "../../model/AstroCoords.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { Point } from "../../model/Point.js";
import { radToDeg } from "../../model/Utils.js";


export class HiPSIntermediateProj {

    static RES_ORDER_0: number = 58.6;
    static H: number = 4;
    static K: number = 3;
    static THETAX: number = Hploc.asin((HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.K);


    // static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace {

    //     let xyGridProj: HEALPixXYSpace = {
    //         "min_y": NaN,
    //         "max_y": NaN,
    //         "min_x": NaN,
    //         "max_x": NaN,
    //         "gridPointsDeg": []
    //     }


    //     let cornersVec3 = hp.getBoundariesWithStep(tileno, 1);
    //     let pointings = [];

    //     for (let i = 0; i < cornersVec3.length; i++) {
    //         pointings[i] = new Pointing(cornersVec3[i]);
    //         if (i >= 1) {
    //             let a = pointings[i - 1].phi;
    //             let b = pointings[i].phi;
    //             // case when RA is just crossing the origin (e.g. 357deg - 3deg)
    //             if (Math.abs(a - b) > Math.PI) {
    //                 if (pointings[i - 1].phi < pointings[i].phi) {
    //                     pointings[i - 1].phi += 2 * Math.PI;
    //                 } else {
    //                     pointings[i].phi += 2 * Math.PI;
    //                 }
    //             }
    //         }
    //     }

    //     for (let j = 0; j < pointings.length; j++) {
    //         let coThetaRad = pointings[j].theta;
    //         // HEALPix works with colatitude (0 North Pole, 180 South Pole)
    //         // converting the colatitude in latitude (dec)
    //         let decRad = Math.PI / 2 - coThetaRad;

    //         let raRad = pointings[j].phi;

    //         // projection on healpix grid
    //         // let p = new Point(CoordsType.ASTRO, NumberType.RADIANS, raRad, decRad);
    //         // let xyDeg = HiPSIntermediateProj.world2intermediate(p.getAstro());
    //         // Build a tiny AstroCoords inline to avoid Point’s RA wrap:
    //         const ac: AstroCoords = {
    //             raDeg: radToDeg(raRad), raRad,
    //             decDeg: radToDeg(decRad), decRad
    //         } as AstroCoords;
    //         const [xDeg, yDeg] = HiPSIntermediateProj.world2intermediate(ac);  // ✅ no RA re-wrap

    //         xyGridProj.gridPointsDeg[j * 2] = xDeg;
    //         xyGridProj.gridPointsDeg[j * 2 + 1] = yDeg;

    //         if (isNaN(xyGridProj.max_y) || yDeg > xyGridProj.max_y) {
    //             xyGridProj.max_y = yDeg;
    //         }
    //         if (isNaN(xyGridProj.min_y) || yDeg < xyGridProj.min_y) {
    //             xyGridProj.min_y = yDeg;
    //         }
    //         if (isNaN(xyGridProj.max_x) || xDeg > xyGridProj.max_x) {
    //             xyGridProj.max_x = xDeg;
    //         }
    //         if (isNaN(xyGridProj.min_x) || xDeg < xyGridProj.min_x) {
    //             xyGridProj.min_x = xDeg;
    //         }

    //     }
    //     return xyGridProj;
    // }
    static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace {
        const xy: HEALPixXYSpace = { min_y: NaN, max_y: NaN, min_x: NaN, max_x: NaN, gridPointsDeg: [] };

        const corners = hp.getBoundariesWithStep(tileno, 1);
        const pts: Pointing[] = [];

        // 1) enforce φ continuity in radians
        for (let i = 0; i < corners.length; i++) {
            pts[i] = new Pointing(corners[i]);
            if (i >= 1) {
                const a = pts[i - 1].phi, b = pts[i].phi;
                if (Math.abs(a - b) > Math.PI) {
                    if (a < b) pts[i - 1].phi += 2 * Math.PI;
                    else pts[i].phi += 2 * Math.PI;
                }
            }
        }

        // 2) project all boundary samples (WITHOUT Point to avoid RA wrap)
        const xs: number[] = [];
        const ys: number[] = [];
        for (let j = 0; j < pts.length; j++) {
            const coTheta = pts[j].theta;
            const decRad = Math.PI / 2 - coTheta;
            const raRad = pts[j].phi;
            const ac: AstroCoords = {
                raDeg: radToDeg(raRad), raRad,
                decDeg: radToDeg(decRad), decRad
            } as AstroCoords;

            const [xDeg, yDeg] = HiPSIntermediateProj.world2intermediate(ac);
            xs.push(xDeg);
            ys.push(yDeg);
        }

        // 3) Y-extrema are reliable: set min_y / max_y from them
        let minY = +Infinity, maxY = -Infinity;
        for (const y of ys) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
        const yMid = 0.5 * (minY + maxY);

        // 4) pick ONLY boundary samples near the mid-Y line to find left/right X
        //    (this avoids sector-hop outliers in X)
        const tol = Math.max(1e-6, 0.02 * (maxY - minY)); // 2% of Y span
        let minX = +Infinity, maxX = -Infinity;
        for (let k = 0; k < xs.length; k++) {
            if (Math.abs(ys[k] - yMid) <= tol) {
                if (xs[k] < minX) minX = xs[k];
                if (xs[k] > maxX) maxX = xs[k];
            }
        }

        // Fallback: if the midline filter caught nothing (rare), use a filtered percentile
        if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
            const pairs = xs.map((x, i) => ({ x, y: ys[i] }))
                .sort((a, b) => Math.abs(a.y - yMid) - Math.abs(b.y - yMid));
            const take = Math.max(4, Math.floor(pairs.length * 0.1)); // closest 10%
            minX = +Infinity; maxX = -Infinity;
            for (let i = 0; i < take; i++) {
                const x = pairs[i].x;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        }

        // 5) Save the unmodified projected samples and envelope
        xy.min_y = minY; xy.max_y = maxY;
        xy.min_x = minX; xy.max_x = maxX;

        for (let i = 0; i < xs.length; i++) {
            xy.gridPointsDeg[2 * i] = xs[i];
            xy.gridPointsDeg[2 * i + 1] = ys[i];
        }

        return xy;
    }

    static world2intermediate(ac: AstroCoords): [number, number] {
        let x_grid: number = NaN;
        let y_grid: number = NaN;

        if (Math.abs(ac.decRad) <= HiPSIntermediateProj.THETAX) { // equatorial belts
            x_grid = ac.raDeg;

            y_grid = Hploc.sin(ac.decRad) * HiPSIntermediateProj.K * 90 / HiPSIntermediateProj.H;


        } else if (Math.abs(ac.decRad) > HiPSIntermediateProj.THETAX) { // polar zones

            let raDeg = ac.raDeg;

            let w = 0; // omega
            if (HiPSIntermediateProj.K % 2 !== 0 || ac.decRad > 0) { // K odd or thetax > 0
                w = 1;
            }

            let sigma = Math.sqrt(HiPSIntermediateProj.K * (1 - Math.abs(Hploc.sin(ac.decRad))));
            let phi_c = - 180 + (2 * Math.floor(((ac.raDeg + 180) * HiPSIntermediateProj.H / 360) + ((1 - w) / 2)) + w) * (180 / HiPSIntermediateProj.H);

            x_grid = phi_c + (raDeg - phi_c) * sigma;
            y_grid = (180 / HiPSIntermediateProj.H) * (((HiPSIntermediateProj.K + 1) / 2) - sigma);

            if (ac.decRad < 0) {
                y_grid *= -1;
            }
        }

        return [x_grid, y_grid];
    }

    static intermediate2pix(x: number, y: number, xyGridProj: HEALPixXYSpace, pxXtile: number): [number, number] {

        const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
        const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);

        // let i_norm: number;
        // let j_norm: number;
        // if ((xyGridProj.min_x > 360 || xyGridProj.max_x > 360) && x < xyGridProj.min_x) {
        //     i_norm = (x + 360 - xyGridProj.min_x) / xInterval;
        // } else {
        //     i_norm = (x - xyGridProj.min_x) / xInterval;
        // }
        // j_norm = (y - xyGridProj.min_y) / yInterval;


        // let i = 0.5 - (i_norm - j_norm);
        // let j = (i_norm + j_norm) - 0.5;

        // // TODO CHECK THE FOLLOWING. BEFORE IT WAS i = Math.floor(i * HiPSHelper.pxXtile);
        // // pxXtile
        // // i = Math.floor(i * HiPSHelper.DEFAULT_Naxis1_2);
        // // j = Math.floor(j * HiPSHelper.DEFAULT_Naxis1_2);
        // // return [i, HiPSHelper.DEFAULT_Naxis1_2 - j - 1];

        // i = Math.floor(i * pxXtile);
        // j = Math.floor(j * pxXtile);
        // return [i, pxXtile - j - 1];

        // Bring x into [min_x, max_x) considering 360° wrap
        let xAdj = x;
        if (xInterval < 360) {
            if (xyGridProj.min_x < 0 && xAdj > xyGridProj.max_x) xAdj -= 360;
            if (xyGridProj.max_x > 360 && xAdj < xyGridProj.min_x) xAdj += 360;
            if (xAdj < xyGridProj.min_x) xAdj += 360;
            if (xAdj >= xyGridProj.max_x) xAdj -= 360;
        }

        const i_norm = (xAdj - xyGridProj.min_x) / xInterval;
        const j_norm = (y - xyGridProj.min_y) / yInterval;

        let i = 0.5 - (i_norm - j_norm);
        let j = (i_norm + j_norm) - 0.5;

        i = Math.floor(i * pxXtile);
        j = Math.floor(j * pxXtile);
        return [i, pxXtile - j - 1];
    }

    static pix2intermediate(i: number, j: number, xyGridProj: HEALPixXYSpace, naxis1: number, naxis2: number): [number, number] {
        /**
                   * (i_norm,w_pixel) = (0,0) correspond to the lower-left corner of the facet in the image
                 * (i_norm,w_pixel) = (1,1) is the upper right corner
                 * dimamond in figure 1 from "Mapping on the HEalpix grid" paper
                 * (0,0) leftmost corner
                 * (1,0) upper corner
                 * (0,1) lowest corner
                 * (1,1) rightmost corner
                 * Thanks YAGO! :p
                 */
        // let cnaxis1 = HiPSHelper.pxXtile;
        // let cnaxis2 = HiPSHelper.pxXtile;

        let cnaxis1 = naxis1;
        let cnaxis2 = naxis2;
        if (naxis1) {
            cnaxis1 = naxis1;
        }
        if (naxis2) {
            cnaxis2 = naxis2;
        }
        const i_norm = (i + 0.5) / cnaxis1;
        const j_norm = (j + 0.5) / cnaxis2;

        const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x) / 2.0;
        const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y) / 2.0;
        const yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;

        // bi-linear interpolation
        // const x = xyGridProj.max_x - xInterval * (i_norm + j_norm);
        const x = xyGridProj.min_x + xInterval * (i_norm + j_norm);
        const y = yMean - yInterval * (j_norm - i_norm);

        return [x, y];
    }

    // Ithink here I am passing RA and Dec becasue probably in the xyGridProj I am storing RA and Dec
    static intermediate2world(x: number, y: number): Point {

        let raDeg: number = NaN
        let decDeg: number = NaN
        const Yx = 90 * (HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.H; // = 45° for H=4,K=3



        if (Math.abs(y) <= Yx) { // equatorial belts
            // === Equatorial inverse ===
            // φ = x ;  sin(Dec) = y * H / (90 K)
            // raDeg = x
            // decDeg = radToDeg(Math.asin((y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K)))
            raDeg = x;
            const s = (y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K);
            const sClamped = Math.max(-1, Math.min(1, s));
            decDeg = radToDeg(Math.asin(sClamped));

        } else { // polar regions
            // === Polar inverse ===
            // σ = (K+1)/2 − |y| H / 180
            const sigma = (HiPSIntermediateProj.K + 1) / 2 - (Math.abs(y) * HiPSIntermediateProj.H) / 180
            // Recover z = sin(Dec) with hemisphere from y
            const zAbs = 1 - (sigma * sigma) / HiPSIntermediateProj.K; // |sin(Dec)|
            const z = (y >= 0 ? 1 : -1) * zAbs;
            const zClamped = Math.max(-1, Math.min(1, z));
            decDeg = radToDeg(Math.asin(zClamped));

            // const thetaRad = Hploc.asin(1 - (sigma * sigma) / HiPSIntermediateProj.K)
            // let w = 0 // omega
            // if (HiPSIntermediateProj.K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
            //     w = 1
            // }

            // ω from hemisphere (use y), or K odd
            const w = (HiPSIntermediateProj.K % 2 !== 0 || y > 0) ? 1 : 0;  // ✅ use hemisphere from y
            // Sector centre and RA
            const x_c = -180 + (2 * Math.floor((x + 180) * HiPSIntermediateProj.H / 360 + (1 - w) / 2) + w) * (180 / HiPSIntermediateProj.H)
            raDeg = x_c + (x - x_c) / (sigma || 1) // guard σ=0 at the pole
            // Optional: wrap RA to [0,360)
            raDeg = ((raDeg % 360) + 360) % 360;

            // decDeg = radToDeg(thetaRad)
            // if (y <= 0) {
            //     decDeg *= -1
            // }
        }
        // return [phiDeg, thetaDeg];
        // TODO CHECK THIS!
        // let p = new Point(CoordsType.SPHERICAL, NumberType.DEGREES, phiDeg, thetaDeg);
        const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, raDeg, decDeg);

        return p;
    }

}