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
    _projection;

    /**
     * 
     * @param {*} pvmin minimum phisical value
     * @param {*} pvmax maximum phisical value
     * @param {*} data [] of [] of decimal values
     */
    constructor (pixelvalues, projection, tfunction = "linear", colormap = "grayscale", inverse = false) {
        
        // initial settings use to reset the image to its initial status
        this._orig_tfunction = tfunction;
        this._orig_colormap = colormap;
        this._orig_inverse = inverse;
        this._orig_min = projection.getFITSHeader()["DATAMIN"];
        this._orig_max = projection.getFITSHeader()["DATAMAX"];

        this._currmin = this._orig_min;
        this._currmax = this._orig_max;

        this._bzero = projection.getFITSHeader()["BZERO"];
        this._bscale = projection.getFITSHeader()["BSCALE"];
        this._blank = projection.getFITSHeader()["BLANK"];

        this._width = data[0].length;
        this._height = data.length;
        
        this._physicalvalues = [];
        this._pixelvalues = pixelvalues;
        
        this._inverse = inverse;

        this._tfunction == tfunction;
        this._colormap = colormap;

        this._projection = projection;
        
    }

    /**
     * function to be called after minmax or transfer function has changed to update the 
     * this._processedData containing pixels values
     */
     process() {

        for (let j = 0; j < this._height; j++) {
            for (let i = 0; i < this._width; i++) {
                let val = this.pixel2Physical(this._pixelvalues[j][i]);
                if (val < this._currmin || val > this._currmax) {
                    val = NaN;
                } else {
                    val = this.appylyTransferFunction(val);
                    this._physicalvalues[j][i] = val;
                }
            }
        }

        return this._physicalvalues;

    }

    pixel2Physical(value){
        let pval = this._bzero + this._bscale * value;
        return pval;
    }

    reset () {

        this._tfunction = this._orig_tfunction;
        this._colormap = this._orig_colormap; 
        this._inverse = this._orig_inverse;
        this._currmin = this._orig_min;
        this._currmax = this._orig_max;
        this.process();

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

    			colors = this.colorPixel(this._physicalvalues[row][col]);

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
		let colormap_idx = ( (v - this._currmin) / (this._currmax-this._currmin)) * 256;
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

    getValueByRaDec(ra, dec) {
        let [i, j] = this._projection.world2pix(ra, dec);
        return this.getValueByPixelCoords(i, j);
    }

    getValueByPixelCoords(i, j) {
        let [cx, cy] = this.ij2canvasxy(i, j);
        return this.getValueByCanvasCoords(cx, cy);
    }

    getValueByCanvasCoords(cx, cy) {
        return this._physicalvalues[cy][cx];
    }

    getRaDecByCanvasCoords(cx, cy) {
        let [i, j] = this.canvasxy2ij(cx, cy);
        return this.getRaDecByPixelCoords(i, j);
    }

    getRaDecByPixelCoords(i, j){
        let [ra, dec] = this._projection.pix2world(i, j);
        return [ra, dec];
    }



}

export default Canvas2D;