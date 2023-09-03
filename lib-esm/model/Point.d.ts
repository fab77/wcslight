/**
 * @author Fabrizio Giordano (Fab77)
 */
import { CartesianCoords } from './CartesianCoords.js';
import { AstroCoords } from './AstroCoords.js';
import { CoordsType } from './CoordsType.js';
import { SphericalCoords } from './SphericalCoords.js';
import { NumberType } from './NumberType.js';
export declare class Point {
    #private;
    constructor(in_type: CoordsType, unit: NumberType, ...coords: Array<number>);
    get spherical(): SphericalCoords;
    get astro(): AstroCoords;
    get cartesian(): CartesianCoords;
}
//# sourceMappingURL=Point.d.ts.map