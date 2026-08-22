import { Healpix, Hploc, Pointing } from "astrospatial-core/healpix";
import { AstroCoords } from "../../model/AstroCoords.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { Point } from "../../model/Point.js";
import { radToDeg } from "../../model/Utils.js";

/*
 * Internal HPX projection helper used by HiPS tile rasterization.
 *
 * This implements the HEALPix intermediate-plane equations used by
 * HiPS. It is not a replacement for a FITS-WCS implementation:
 * WCSLib remains the external authority for validating serialized
 * FITS WCS headers, especially near HPX branch cuts.
 */
export class HiPSIntermediateProj {
  static RES_ORDER_0: number = 58.6;
  static H: number = 4;
  static K: number = 3;
  static THETAX: number = Hploc.asin(
    (HiPSIntermediateProj.K - 1) / HiPSIntermediateProj.K,
  );

  static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace {
    const xy: HEALPixXYSpace = {
      min_y: NaN,
      max_y: NaN,
      min_x: NaN,
      max_x: NaN,
      gridPointsDeg: [],
    };

    const corners = hp.getBoundariesWithStep(tileno, 1);
    const pts: Pointing[] = [];
    const phis: number[] = [];

    for (let i = 0; i < corners.length; i++) {
      pts[i] = new Pointing(corners[i]);
      phis[i] = pts[i].phi;

      if (i >= 1) {
        const a = phis[i - 1];
        const b = phis[i];

        if (Math.abs(a - b) > Math.PI) {
          if (a < b) phis[i - 1] = a + 2 * Math.PI;
          else phis[i] = b + 2 * Math.PI;
        }
      }
    }

    /*
     * Project all boundary samples without going through Point,
     * because Point normalizes RA and would hide wrap information
     * needed by tiles crossing the 0/360 meridian.
     */
    const xs: number[] = [];
    const ys: number[] = [];
    for (let j = 0; j < pts.length; j++) {
      const coTheta = pts[j].theta;
      const decRad = Math.PI / 2 - coTheta;
      const raRad = phis[j];
      const ac: AstroCoords = {
        raDeg: radToDeg(raRad),
        raRad,
        decDeg: radToDeg(decRad),
        decRad,
      } as AstroCoords;

      const [xDeg, yDeg] = HiPSIntermediateProj.world2intermediate(ac);
      xs.push(xDeg);
      ys.push(yDeg);
    }

    /*
     * Y-extrema are stable across HPX sectors.
     */
    let minY = +Infinity,
      maxY = -Infinity;
    for (const y of ys) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const yMid = 0.5 * (minY + maxY);

    /*
     * Use boundary samples near the middle of the tile to derive
     * the local left/right X range. This avoids sector-hop outliers
     * in polar or wrapped tiles.
     */
    const tol = Math.max(1e-6, 0.02 * (maxY - minY));
    let minX = +Infinity,
      maxX = -Infinity;
    for (let k = 0; k < xs.length; k++) {
      if (Math.abs(ys[k] - yMid) <= tol) {
        if (xs[k] < minX) minX = xs[k];
        if (xs[k] > maxX) maxX = xs[k];
      }
    }

    /*
     * Fallback for very small or awkward samples: use the boundary
     * points closest to the middle Y line.
     */
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      const pairs = xs
        .map((x, i) => ({ x, y: ys[i] }))
        .sort((a, b) => Math.abs(a.y - yMid) - Math.abs(b.y - yMid));
      const take = Math.max(4, Math.floor(pairs.length * 0.1));
      minX = +Infinity;
      maxX = -Infinity;
      for (let i = 0; i < take; i++) {
        const x = pairs[i].x;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }

    xy.min_y = minY;
    xy.max_y = maxY;
    xy.min_x = minX;
    xy.max_x = maxX;

    for (let i = 0; i < xs.length; i++) {
      xy.gridPointsDeg[2 * i] = xs[i];
      xy.gridPointsDeg[2 * i + 1] = ys[i];
    }

    return xy;
  }

  static world2intermediate(ac: AstroCoords): [number, number] {
    let x_grid: number = NaN;
    let y_grid: number = NaN;

    if (Math.abs(ac.decRad) <= HiPSIntermediateProj.THETAX) {
      x_grid = ac.raDeg;

      y_grid =
        (Hploc.sin(ac.decRad) * HiPSIntermediateProj.K * 90) /
        HiPSIntermediateProj.H;
    } else if (Math.abs(ac.decRad) > HiPSIntermediateProj.THETAX) {
      const raDeg = ac.raDeg;

      let w = 0;
      if (HiPSIntermediateProj.K % 2 !== 0 || ac.decRad > 0) {
        w = 1;
      }

      const sigma = Math.sqrt(
        HiPSIntermediateProj.K * (1 - Math.abs(Hploc.sin(ac.decRad))),
      );
      const phi_c =
        -180 +
        (2 *
          Math.floor(
            ((ac.raDeg + 180) * HiPSIntermediateProj.H) / 360 + (1 - w) / 2,
          ) +
          w) *
          (180 / HiPSIntermediateProj.H);

      x_grid = phi_c + (raDeg - phi_c) * sigma;
      y_grid =
        (180 / HiPSIntermediateProj.H) *
        ((HiPSIntermediateProj.K + 1) / 2 - sigma);

      if (ac.decRad < 0) {
        y_grid *= -1;
      }
    }

    return [x_grid, y_grid];
  }

  static intermediate2pix(
    x: number,
    y: number,
    xyGridProj: HEALPixXYSpace,
    pxXtile: number,
  ): [number, number] {
    const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
    const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);

    /*
     * Bring x into the local tile interval when the tile does
     * not span a full 360 degrees.
     */
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
    let j = i_norm + j_norm - 0.5;

    i = Math.floor(i * pxXtile);
    j = Math.floor(j * pxXtile);
    return [i, pxXtile - j - 1];
  }

  static pix2intermediate(
    i: number,
    j: number,
    xyGridProj: HEALPixXYSpace,
    naxis1: number,
    naxis2: number,
  ): [number, number] {
    /*
     * Diamond coordinates in the HEALPix intermediate plane:
     *
     *   (0, 0) -> left corner
     *   (1, 0) -> upper corner
     *   (0, 1) -> lower corner
     *   (1, 1) -> right corner
     *
     * Image rows are top-down, so the final Y interpolation
     * uses j_norm with the opposite sign.
     */
    const cnaxis1 = naxis1;
    const cnaxis2 = naxis2;
    const i_norm = (i + 0.5) / cnaxis1;
    const j_norm = (j + 0.5) / cnaxis2;

    const xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x) / 2.0;
    const yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y) / 2.0;
    const yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;

    const x = xyGridProj.min_x + xInterval * (i_norm + j_norm);
    const y = yMean - yInterval * (j_norm - i_norm);

    return [x, y];
  }

  static intermediate2world(x: number, y: number): Point {
    let raDeg: number = NaN;
    let decDeg: number = NaN;
    const Yx = (90 * (HiPSIntermediateProj.K - 1)) / HiPSIntermediateProj.H;

    if (Math.abs(y) <= Yx) {
      raDeg = x;
      const s = (y * HiPSIntermediateProj.H) / (90 * HiPSIntermediateProj.K);
      const sClamped = Math.max(-1, Math.min(1, s));
      decDeg = radToDeg(Math.asin(sClamped));
    } else {
      const sigma =
        (HiPSIntermediateProj.K + 1) / 2 -
        (Math.abs(y) * HiPSIntermediateProj.H) / 180;

      const zAbs = 1 - (sigma * sigma) / HiPSIntermediateProj.K;
      const z = (y >= 0 ? 1 : -1) * zAbs;
      const zClamped = Math.max(-1, Math.min(1, z));
      decDeg = radToDeg(Math.asin(zClamped));

      const w = HiPSIntermediateProj.K % 2 !== 0 || y > 0 ? 1 : 0;
      const x_c =
        -180 +
        (2 *
          Math.floor(((x + 180) * HiPSIntermediateProj.H) / 360 + (1 - w) / 2) +
          w) *
          (180 / HiPSIntermediateProj.H);
      raDeg = x_c + (x - x_c) / (sigma || 1);
      raDeg = ((raDeg % 360) + 360) % 360;
    }

    return new Point(CoordsType.ASTRO, NumberType.DEGREES, raDeg, decDeg);
  }
}
