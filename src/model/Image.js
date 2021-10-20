"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

 import ColorMaps from './ColorMaps';
 import Canvas2D from './Canvas2D';

class Image {

    _naxis1;
    _naxis2;
    _canvas2d;
    _projection;
    _headerDetails;
    /**
     * 
     * @param { [[ImagePixel]] } pixelsMatrix
     */
    constructor(projection) {

        this._pvmin = undefined;
        this._pvmax = undefined;
        this._projection = projection;

        

        this._headerDetails = {
            "pvmin" : undefined,
            "pvmax" : undefined,
            "blank" : undefined,
            "bscale" : undefined,
            "bzero" : undefined,
            "bitpix" : undefined,
            "naxis1" : this._projection.naxis1,
            "naxis2" : this._projection.naxis2
        };

        this._pixelsValues = new Array(this._headerDetails.naxis2);
       
        // TODO really want to init Canvas here?
        this._canvas2d = new Canvas2D(this._naxis1, this._naxis2, this._headerDetails.pvmin, this._headerDetails.pvmax);

    }

    

    /**
     * 
     * @param {ImagePixel} imgpx 
     */
    setPxValue (imgpx) {

        if (this._pixelsValues[imgpx.j] === undefined) {
            this._pixelsValues[imgpx.j] = new Array(this._headerDetails.naxis1);
        }

        if (imgpx.getValue() === this._headerDetails.blank){ // do I really need that?
            this._pixelsValues[imgpx.j][imgpx.i] = this._headerDetails.blank;
        } else {
            this._pixelsValues = imgpx.getValue();
        }
        
    }

    updateFITSHeader(headerinfo) {
        
        
        if (this._headerDetails.pvmin === undefined || this._headerDetails.pvmin > headerinfo.min) {
            this._headerDetails.pvmin = headerinfo.min;
        }

        if (this._headerDetails.pvmax === undefined || this._headerDetails.pvmax < headerinfo.max) {
            this._headerDetails.pvmax = headerinfo.max;
        }

        if (this._headerDetails.blank === undefined) {
            this._headerDetails.blank = headerinfo.blank;
        } else if (this._headerDetails.blank !== headerinfo.blank) {
            throw new ErrorEvent("BLANK value changed!");
        }

        if (this._headerDetails.bscale === undefined) {
            this._headerDetails.bscale = headerinfo.bscale;
        } else if (this._headerDetails.bscale !== headerinfo.bscale) {
            throw new ErrorEvent("BSCALE value changed!");
        }

        if (this._headerDetails.bzero === undefined) {
            this._headerDetails.bzero = headerinfo.bzero;
        } else if (this._headerDetails.bzero !== headerinfo.bzero) {
            throw new ErrorEvent("BZERO value changed!");
        }

        if (this._headerDetails.bitpix === undefined) {
            this._headerDetails.bitpix = headerinfo.bitpix;
        } else if (this._headerDetails.bitpix !== headerinfo.bitpix) {
            throw new ErrorEvent("BITPIX value changed!");
        }

    }

    finalizeFITSHeader () {
        this._projection.finalizeFITSHeader(this._headerDetails);
    }

    getCanvas2d() {
        this._canvas2d.addData()
    }
    // setTransferFunction(tFunction) {

    //     if (this._tFunction == "linear"){
	// 		this._tFunction = "linear";
	// 	} else if (this._tFunction == "log'"){
	// 		this._tFunction = "log";
	// 	} else if (this._tFunction == "sqrt"){
	// 		this._tFunction = "sqrt";
	// 	} else {
    //         throw new TransferFunctionNotDefined(tFunction);
    //     }

    // }

    // setColorMap(cmap) {

    //     if (cmap == "grayscale") {
    //         this._colorMap = "grayscale";
    //     } else if (cmap == "planck") {
    //         this._colorMap = "planck";
    //     } else if (cmap == "eosb") {
    //         this._colorMap = "eosb";
    //     } else if (cmap == "rainbow") {
    //         this._colorMap = "rainbow";
    //     } else if (cmap == "cmb") {
    //         this._colorMap = "cmb";
    //     } else if (cmap == "cubehelix") {
    //         this._colorMap = "cubehelix";
    //     } else {
    //         throw new ColorMapNotDefined(cmap);
    //     }
    // }

    // setInverse(bool) {
    //     this._inverse = bool;
    // }

    

    // /**
    //  * function to be called after minmax or transfer function has changed to update the 
    //  * this._processedData containing pixels values
    //  */
    // update() {
    //     this._pixelsMatrix.forEach(function (row, j) {
    //         row.forEach(function (val, j) {
    //             // reprocess this._pixelsMatrix and update this._processedData
    //             let imgpx = this._pixelsMatrix[i][j];
    //             let val = imgpx.value;
    //             // apply tfunction if defined
    //             val = applyTFunction(val);
    //             if (val < this._currentpvmin || val > this._currentpvmax) {
    //                 // TODO here I need to set BLANK 
    //                 this._processedData[i][j] = "NaN";
    //             } else {
    //                 this._processedData[i][j] = this.appylyTransferFunction(val);
    //             }
    //         });
    //     });
    // }

    // appylyTransferFunction(val) {

    //     if (this._tFunction == 'linear'){
	// 		return val;
	// 	} else if (this._tFunction == 'log'){
	// 		return Math.log(val);
	// 	} else if (this._tFunction == 'sqrt'){
	// 		return Math.sqrt(val);
	// 	}
    //     return val;

    // }



    // /** do I need that? */
    // getRawImage () {
    //     return this._pixelsMatrix;
    // }

    // /**
    //  * 
    //  * @returns FITS data
    //  */
    // getImage () {
    //     return this._processedData;
    // }

//     /**
//      * 
//      * @returns an Javascript Canvas 2d image
//      */
//     getCanvas2DBrowse() {
//         let c = document.createElement('canvas');
//     	c.width = this._naxis1;
//         c.height = this._naxis2;
//         let ctx = c.getContext("2d");
//         let imgData = ctx.createImageData(c.width, c.height);
    	
//         let pos;
//         let colors;
// 		for (let row=0; row < this._naxis2; row++){
//     		for (let col=0; col < this._naxis1; col++){

//     			/** to invert x and y replace the pos computation with the following */
//     			/** pos = ((c.width - row) * (c.height) + col ) * 4; */
// //    			pos = ( col * c.width + row ) * 4;
//     			pos = ( (this._naxis1 - row) * c.width + col ) * 4;

//     			colors = this.colorPixel(this._processedData[row][col]);

//     			imgData.data[pos] = colors.r;
//     			imgData.data[pos+1] = colors.g;
//     			imgData.data[pos+2] = colors.b;
//     			imgData.data[pos+3] = 0xff; // alpha
    			
//     		}
//     	}
//     	ctx.putImageData(imgData, 0, 0);
//     	let img = new Image();
//         img.src = c.toDataURL();
//         return img;

//     }

    // colorPixel (v){
		
    //     if (v == "NaN" ){
    //         if (this._inverse){
    //             return {
    //                 r:255,
    //                 g:255,
    //                 b:255
    //             };
    //         }
	// 		return {
	// 			r:0,
	// 			g:0,
	// 			b:0
	// 		};
	// 	}
		
    //     // // TODO Check that. Probably better to use normalized values on [0, 1]
    //     // // and this._currentpvmin and this._currentpvmax
	// 	// if ( v < 0 ) v = -v;
	// 	let colormap_idx = ( (v - this._currentpvmin) / (this._currentpvmax-this._currentpvmin)) * 256;
	// 	let idx = Math.round(colormap_idx);
	// 	let colorMap = ColorMaps[this._colorMap];
	// 	// if (idx<0){
	// 	// 	idx = -idx;
	// 	// }
		
	// 	if (this._colorMap == 'grayscale'){
	// 		if (this._inverse){
	// 			return {
	// 				r: (255 - idx),
	// 				g: (255 - idx),
	// 				b: (255 - idx)
	// 			};
	// 		}
			
	// 		return {
	// 			r:idx,
	// 			g:idx,
	// 			b:idx
	// 		};
	// 	}else{
	// 		if (this._inverse){
	// 			return {
	// 				r: (255 - colorMap.r[idx]),
	// 				g: (255 - colorMap.g[idx]),
	// 				b: (255 - colorMap.b[idx])
	// 			};
	// 		}
			
	// 		return {
	// 			r:colorMap.r[idx],
	// 			g:colorMap.g[idx],
	// 			b:colorMap.b[idx]
	// 		};
	// 	}

	// }

    
}

export default Image;