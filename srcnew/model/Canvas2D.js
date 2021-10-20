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

class Canvas2D {

    _values;
    _width;
    _height;
    _min;
    _max;
    _currmin;
    _currmax;
    _colormap;
    _tfunction;

    /**
     * 
     * @param {*} pvmin minimum phisical value
     * @param {*} pvmax maximum phisical value
     * @param {*} data [] of [] of decimal values
     */
    constructor (pvmin, pvmax, data, tfunction = "linear", colormap = "grayscale", inverse = false) {
        
        this._min = pvmin;
        this._max = pvmax;
        this._currmin = this._min;
        this._currmax = this._max;

        this._width = data[0].length;
        this._height = data.length;
        
        this._values = data;
        this._originalData = data;
        
        this._inverse = inverse;

        this._tfunction == tfunction;
        this._colormap = colormap;
        
    }

    reset () {

        this._tfunction = "linear";
        this._colormap = "grayscale"; 
        this._inverse = false;
        this._values = this._originalData;
        this._currmin = this._min;
        this._currmax = this._max;

    }
    

    setTransferFunction(tFunction) {

        if (tFunction == "linear"){
			this._tfunction = "linear";
		} else if (tFunction == "log'"){
			this._tfunction = "log";
		} else if (tFunction == "sqrt"){
			this._tfunction = "sqrt";
		} else {
            throw new TransferFunctionNotDefined(tFunction);
        }

    }

    setColorMap(cmap) {

        if (cmap == "grayscale") {
            this._colormap = "grayscale";
        } else if (cmap == "planck") {
            this._colormap = "planck";
        } else if (cmap == "eosb") {
            this._colormap = "eosb";
        } else if (cmap == "rainbow") {
            this._colormap = "rainbow";
        } else if (cmap == "cmb") {
            this._colormap = "cmb";
        } else if (cmap == "cubehelix") {
            this._colormap = "cubehelix";
        } else {
            throw new ColorMapNotDefined(cmap);
        }
    }

    setInverse(bool) {
        this._inverse = bool;
    }

    setMinMax(minVal, maxVal) {

        this._currmin = minVal;
        this._currmax = maxVal;
            
    }

    /**
     * function to be called after minmax or transfer function has changed to update the 
     * this._processedData containing pixels values
     */
    process() {

        for (let j = 0; j < this._height; j++) {
            for (let i = 0; i < this._width; i++) {
                let val = this._originalData[j][i];
                if (val < this._currmin || val > this._currmax) {
                    val = NaN;
                } else{
                    val = this.appylyTransferFunction(val);
                    this._values[j][i] = val;
                }
            }
        }

        return this.getCanvas2DBrowse();

    }

    appylyTransferFunction(val) {

        if (this._tFunction == 'linear'){
			return val;
		} else if (this._tFunction == 'log'){
			return Math.log(val);
		} else if (this._tFunction == 'sqrt'){
			return Math.sqrt(val);
		}
        return val;

    }

    /**
     * 
     * @returns an Javascript Canvas 2d image
     */
     getCanvas2DBrowse() {
        let c = document.createElement('canvas');
    	c.width = this._width;
        c.height = this._height;
        let ctx = c.getContext("2d");
        let imgData = ctx.createImageData(c.width, c.height);
    	
        let pos;
        let colors;
		for (let row = 0; row < c.height; row++){
    		for (let col = 0; col < c.width; col++){

    			/** to invert x and y replace the pos computation with the following */
    			/** pos = ((c.width - row) * (c.height) + col ) * 4; */
//    			pos = ( col * c.width + row ) * 4;
    			pos = ( (c.width - row) * c.width + col ) * 4;

    			colors = this.colorPixel(this._values[row][col]);

    			imgData.data[pos] = colors.r;
    			imgData.data[pos+1] = colors.g;
    			imgData.data[pos+2] = colors.b;
    			imgData.data[pos+3] = 0xff; // alpha
    			
    		}
    	}
    	ctx.putImageData(imgData, 0, 0);
    	let img = new Image();
        img.src = c.toDataURL();
        return img;

    }

    colorPixel (v){
		
        if (v == "NaN" ){
            if (this._inverse){
                return {
                    r:255,
                    g:255,
                    b:255
                };
            }
			return {
				r:0,
				g:0,
				b:0
			};
		}
		
        // // TODO Check that. Probably better to use normalized values on [0, 1]
        // // and this._currentpvmin and this._currentpvmax
		// if ( v < 0 ) v = -v;
		let colormap_idx = ( (v - this._min) / (this._max-this._min)) * 256;
		let idx = Math.round(colormap_idx);
		let colorMap = ColorMaps[this._colorMap];
		// if (idx<0){
		// 	idx = -idx;
		// }
		
		if (this._colorMap == 'grayscale'){
			if (this._inverse){
				return {
					r: (255 - idx),
					g: (255 - idx),
					b: (255 - idx)
				};
			}
			
			return {
				r:idx,
				g:idx,
				b:idx
			};
		}else{
			if (this._inverse){
				return {
					r: (255 - colorMap.r[idx]),
					g: (255 - colorMap.g[idx]),
					b: (255 - colorMap.b[idx])
				};
			}
			
			return {
				r:colorMap.r[idx],
				g:colorMap.g[idx],
				b:colorMap.b[idx]
			};
		}

	}

}

export default Canvas2D;