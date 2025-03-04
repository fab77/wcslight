import { Hploc, Pointing } from "healpixjs";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { Point } from "../../model/Point.js";
import { radToDeg } from "../../model/Utils.js";
export class HiPSIntermediateProj {
    static setupByTile(tileno, hp) {
        let xyGridProj = {
            "min_y": NaN,
            "max_y": NaN,
            "min_x": NaN,
            "max_x": NaN,
            "gridPointsDeg": []
        };
        let cornersVec3 = hp.getBoundariesWithStep(tileno, 1);
        let pointings = [];
        for (let i = 0; i < cornersVec3.length; i++) {
            pointings[i] = new Pointing(cornersVec3[i]);
            if (i >= 1) {
                let a = pointings[i - 1].phi;
                let b = pointings[i].phi;
                // case when RA is just crossing the origin (e.g. 357deg - 3deg)
                if (Math.abs(a - b) > Math.PI) {
                    if (pointings[i - 1].phi < pointings[i].phi) {
                        pointings[i - 1].phi += 2 * Math.PI;
                    }
                    else {
                        pointings[i].phi += 2 * Math.PI;
                    }
                }
            }
        }
        for (let j = 0; j < pointings.length; j++) {
            let coThetaRad = pointings[j].theta;
            // HEALPix works with colatitude (0 North Pole, 180 South Pole)
            // converting the colatitude in latitude (dec)
            let decRad = Math.PI / 2 - coThetaRad;
            let raRad = pointings[j].phi;
            // projection on healpix grid
            let p = new Point(CoordsType.ASTRO, NumberType.RADIANS, raRad, decRad);
            let xyDeg = HiPSIntermediateProj.world2intermediate(p.getAstro());
            xyGridProj.gridPointsDeg[j * 2] = xyDeg[0];
            xyGridProj.gridPointsDeg[j * 2 + 1] = xyDeg[1];
            if (isNaN(xyGridProj.max_y) || xyDeg[1] > xyGridProj.max_y) {
                xyGridProj.max_y = xyDeg[1];
            }
            if (isNaN(xyGridProj.min_y) || xyDeg[1] < xyGridProj.min_y) {
                xyGridProj.min_y = xyDeg[1];
            }
            if (isNaN(xyGridProj.max_x) || xyDeg[0] > xyGridProj.max_x) {
                xyGridProj.max_x = xyDeg[0];
            }
            if (isNaN(xyGridProj.min_x) || xyDeg[0] < xyGridProj.min_x) {
                xyGridProj.min_x = xyDeg[0];
            }
        }
        return xyGridProj;
    }
    static world2intermediate(ac) {
        let x_grid = NaN;
        let y_grid = NaN;
        if (Math.abs(ac.decRad) <= HiPSIntermediateProj.THETAX) { // equatorial belts
            x_grid = ac.raDeg;
            y_grid = Hploc.sin(ac.decRad) * HiPSIntermediateProj.K * 90 / HiPSIntermediateProj.H;
        }
        else if (Math.abs(ac.decRad) > HiPSIntermediateProj.THETAX) { // polar zones
            let raDeg = ac.raDeg;
            let w = 0; // omega
            if (HiPSIntermediateProj.K % 2 !== 0 || ac.decRad > 0) { // K odd or thetax > 0
                w = 1;
            }
            let sigma = Math.sqrt(HiPSIntermediateProj.K * (1 - Math.abs(Hploc.sin(ac.decRad))));
            let phi_c = -180 + (2 * Math.floor(((ac.raDeg + 180) * HiPSIntermediateProj.H / 360) + ((1 - w) / 2)) + w) * (180 / HiPSIntermediateProj.H);
            x_grid = phi_c + (raDeg - phi_c) * sigma;
            y_grid = (180 / HiPSIntermediateProj.H) * (((HiPSIntermediateProj.K + 1) / 2) - sigma);
            if (ac.decRad < 0) {
                y_grid *= -1;
            }
        }
        return [x_grid, y_grid];
    }
    static intermediate2pix(x, y, xyGridProj, pxXtile) {
        let xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
        let yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);
        let i_norm;
        let j_norm;
        if ((xyGridProj.min_x > 360 || xyGridProj.max_x > 360) && x < xyGridProj.min_x) {
            i_norm = (x + 360 - xyGridProj.min_x) / xInterval;
        }
        else {
            i_norm = (x - xyGridProj.min_x) / xInterval;
        }
        j_norm = (y - xyGridProj.min_y) / yInterval;
        let i = 0.5 - (i_norm - j_norm);
        let j = (i_norm + j_norm) - 0.5;
        // TODO CHECK THE FOLLOWING. BEFORE IT WAS i = Math.floor(i * HiPSHelper.pxXtile);
        // pxXtile
        // i = Math.floor(i * HiPSHelper.DEFAULT_Naxis1_2);
        // j = Math.floor(j * HiPSHelper.DEFAULT_Naxis1_2);
        // return [i, HiPSHelper.DEFAULT_Naxis1_2 - j - 1];
        i = Math.floor(i * pxXtile);
        j = Math.floor(j * pxXtile);
        return [i, pxXtile - j - 1];
    }
    static pix2intermediate(i, j, xyGridProj, naxis1, naxis2) {
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
        const x = xyGridProj.max_x - xInterval * (i_norm + j_norm);
        const y = yMean - yInterval * (j_norm - i_norm);
        return [x, y];
    }
    static intermediate2world(x, y) {
        let phiDeg = NaN;
        let thetaDeg = NaN;
        const Yx = 90 * (HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.H;
        if (Math.abs(y) <= Yx) { // equatorial belts
            phiDeg = x;
            thetaDeg = radToDeg(Math.asin((y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K)));
        }
        else if (Math.abs(y) > Yx) { // polar regions
            const sigma = (HiPSIntermediateProj.K + 1) / 2 - Math.abs(y * HiPSIntermediateProj.H) / 180;
            const thetaRad = Hploc.asin(1 - (sigma * sigma) / HiPSIntermediateProj.K);
            let w = 0; // omega
            if (HiPSIntermediateProj.K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
                w = 1;
            }
            const x_c = -180 + (2 * Math.floor((x + 180) * HiPSIntermediateProj.H / 360 + (1 - w) / 2) + w) * (180 / HiPSIntermediateProj.H);
            phiDeg = x_c + (x - x_c) / sigma;
            thetaDeg = radToDeg(thetaRad);
            if (y <= 0) {
                thetaDeg *= -1;
            }
        }
        // return [phiDeg, thetaDeg];
        // TODO CHECK THIS!
        // let p = new Point(CoordsType.SPHERICAL, NumberType.DEGREES, phiDeg, thetaDeg);
        const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, phiDeg, thetaDeg);
        return p;
    }
}
HiPSIntermediateProj.DEFAULT_Naxis1_2 = 512; // TODO check where it is used. Is that configurable?
// static RES_ORDER_0: number = 58.6 / HiPSHelper.pxXtile;
HiPSIntermediateProj.RES_ORDER_0 = 58.6;
HiPSIntermediateProj.H = 4;
HiPSIntermediateProj.K = 3;
HiPSIntermediateProj.THETAX = Hploc.asin((HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.K);
//# sourceMappingURL=HiPSIntermediateProj.js.map