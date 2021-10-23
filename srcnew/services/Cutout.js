"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class Cutout {

    _image;
    _projection;

    constructor (outimage, inprojection) {
        this._image = outimage;
        this._projection = inprojection;
    }

    /**
     * 
     * @param {matrix} inData Array of array Naxis1 x Naxis2 of data 
     * @param {pvmin} pvmin minimum px physical value
     * @param {pvmax} pvmax maximum px physical value
     * @param {int} tileno in case of HiPS or HEALPix, tile number, null otherwise
     */
     fillOutputImage(inData, headerinfo, tileno = null) {

        this._image.updateFITSHeader(headerinfo);

        
        if (this._projection instanceof HiPSProjection) {
            this._projection.world2pixByTile(this._image, tileno, inData);
            world2pix
        }
    }

    getFinalImage() {
        return this._image;
    }

}


export default Cutout;