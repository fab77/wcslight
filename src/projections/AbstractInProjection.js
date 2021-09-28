"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class AbstractInProjection {

    constructor(){

        if (new.target === AbstractInProjection) {
            throw new TypeError("Abstract class cannot be instantiated.");
        }

        if (this.computeBbox === undefined) {
            throw new TypeError("Must override computeBbox()");
        }

        if (this.getValue === undefined) {
            throw new TypeError("Must override getValue()");
        }

        if (this.generatePxMatrix === undefined) {
            throw new TypeError("Must override generatePxMatrix()");
        }
        /**
         * 
         * @param {double} ra 
         * @param {double} dec 
         * @returns [X, Y] projection on the cartesian plane of RA and Dec
         */
        if (this.world2pix === undefined) {
            throw new TypeError("Must override world2pix(ra, dec)");
        }

    }

}

export default AbstractInProjection;