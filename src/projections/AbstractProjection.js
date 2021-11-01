"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class AbstractProjection {

    constructor(){

        if (new.target === AbstractProjection) {
            throw new TypeError("Abstract class cannot be instantiated.");
        }

        if (this.getFITSHeader === undefined) {
            throw new TypeError("Must override getFITSHeader()");
        }

        // if (this.setFITSHeaderEntry === undefined) {
        //     throw new TypeError("Must override setFITSHeaderEntry()");
        // }

        // if (this.getFITSHeaderEntry === undefined) {
        //     throw new TypeError("Must override getFITSHeaderEntry()");
        // }





        // if (this.computePixValues === undefined) {
        //     throw new TypeError("Must override computePixValues()");
        // }

        // if (this.getPixValuesFromPxlist === undefined) {
        //     throw new TypeError("Must override getPixValuesFromPxlist()");
        // }

        if (this.setPxsValue === undefined) {
            throw new TypeError("Must override setPxsValue()");
        }

        if (this.world2pix === undefined) {
            throw new TypeError("Must override world2pix()");
        }

        if (this.pix2world === undefined) {
            throw new TypeError("Must override pix2world()");
        }

        if (this.getImageRADecList === undefined) {
            throw new TypeError("Must override getImageRADecList()");
        }

        if (this.getCanvas2d === undefined) {
            throw new TypeError("Must override getCanvas2d()");
        }

    }

}

export default AbstractProjection;