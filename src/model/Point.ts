/**
 * @author Fabrizio Giordano (Fab77)
 */

import {
  sphericalToCartesian,
  cartesianToSpherical,
  sphericalToAstro,
  astroToSpherical,
  fillSpherical,
  fillAstro
} from './Utils.js';
import { CartesianCoords } from './CartesianCoords.js';
import { AstroCoords } from './AstroCoords.js';
import { CoordsType } from './CoordsType.js';
import { SphericalCoords } from './SphericalCoords.js';
import { NumberType } from './NumberType.js';
import { Config } from '../Config.js';

const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;
const clampDec = (deg: number) => Math.max(-90, Math.min(90, deg));

export class Point {
  private astro!: AstroCoords;
  private spherical!: SphericalCoords;
  private cartesian!: CartesianCoords;

  constructor(in_type: CoordsType, unit: NumberType, ...coords: number[]) {
    if (in_type === CoordsType.CARTESIAN) {
      // Initialise cartesian first (avoid writing into undefined)
      this.cartesian = {
        x: parseFloat(coords[0].toFixed(Config.MAX_DECIMALS)),
        y: parseFloat(coords[1].toFixed(Config.MAX_DECIMALS)),
        z: parseFloat(coords[2].toFixed(Config.MAX_DECIMALS))
      } as CartesianCoords;

      this.spherical = cartesianToSpherical(this.cartesian);
      this.astro = sphericalToAstro(this.spherical);

    } else if (in_type === CoordsType.ASTRO) {
      const c = fillAstro(coords[0], coords[1], unit);
      if (!c) throw new Error('Invalid Astro coordinates');

      this.astro = c;
      this.spherical = astroToSpherical(this.astro);
      this.cartesian = sphericalToCartesian(this.spherical, 1.0);

    } else if (in_type === CoordsType.SPHERICAL) {
      const s = fillSpherical(coords[0], coords[1], unit);
      if (!s) throw new Error('Invalid Spherical coordinates');

      this.spherical = s;
      this.cartesian = sphericalToCartesian(this.spherical, 1.0);
      this.astro = sphericalToAstro(this.spherical);

    } else {
      throw new Error(`CoordsType ${in_type} not recognised.`);
    }

    // --- Normalise & keep systems consistent ---
    // Robust wrap for RA/phi
    const raWrapped = wrap360(this.astro.raDeg);
    const phiWrapped = wrap360(this.spherical.phiDeg);

    // Only reassign if changed (avoids unnecessary recompute)
    if (raWrapped !== this.astro.raDeg) {
      this.astro.raDeg = raWrapped;
      // keep spherical/cartesian aligned with astro
      this.spherical = astroToSpherical(this.astro);
      this.cartesian = sphericalToCartesian(this.spherical, 1.0);
    }
    if (phiWrapped !== this.spherical.phiDeg) {
      this.spherical.phiDeg = phiWrapped;
      // keep astro/cartesian aligned with spherical
      this.cartesian = sphericalToCartesian(this.spherical, 1.0);
      this.astro = sphericalToAstro(this.spherical);
    }

    // Clamp Dec defensively and re-sync if it changed
    const decClamped = clampDec(this.astro.decDeg);
    if (decClamped !== this.astro.decDeg) {
      this.astro.decDeg = decClamped;
      this.spherical = astroToSpherical(this.astro);
      this.cartesian = sphericalToCartesian(this.spherical, 1.0);
    }
  }

  getSpherical() {
    return this.spherical;
  }

  getAstro() {
    return this.astro;
  }

  getCartesian() {
    return this.cartesian;
  }
}
