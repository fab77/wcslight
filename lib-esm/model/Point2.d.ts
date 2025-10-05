/**
 * @author Fabrizio Giordano (Fab77)
 */
import { CartesianCoords } from './CartesianCoords.js';
import { AstroCoords } from './AstroCoords.js';
import { CoordsType } from './CoordsType.js';
import { SphericalCoords } from './SphericalCoords.js';
import { NumberType } from './NumberType.js';
export declare class Point {
    private astro;
    private spherical;
    private cartesian;
    constructor(in_type: CoordsType, unit: NumberType, ...coords: Array<number>);
    getSpherical(): SphericalCoords;
    getAstro(): AstroCoords;
    getCartesian(): CartesianCoords;
}
//# sourceMappingURL=Point2.d.ts.map