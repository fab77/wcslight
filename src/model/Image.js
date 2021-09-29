"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class Image {

    _rawData;   // original data in format of Array of Array of ImagePixel. Used to fill _processedData and to reset it to the original values
    _processedData; // Array of Array of values in the same posistion of the _rawData
    _tFunction; // transfer function
    _cMap;      // color map
    _inverse;   // invert color map
    _pvmin;     // minimum px value
    _pvmax;     // minimum px value
    _currentpvmin; // min value used in _processedData
    _currentpvmax; // max value used in _processedData
    /**
     * 
     * @param {Array of ImagePixel} rowData 
     */
    constructor(rawData) {

        this._rawData = rawData;
        this._processedData = [];
        this._pvmin = undefined;
        this._pvmax = undefined;

    }

    /**
     * 
     * @param {ImagePixel} imgpx 
     */
     setPxValue (imgpx) {

        this._rawData[imgpx.i][imgpx.j] = imgpx;
        this._processedData[imgpx.i][imgpx.j] = imgpx.getValue();

    }

    reset () {

        for (let i = 0; i < this._rawData.length; i++){
            let row = this._rawData[i];
            for (let j = 0; j < row.length; j++){
                let imgpx = row[j];
                this._processedData[i][j] = imgpx.getValue();
            }
        }

    }

    getImage () {

        return this._processedData;

    }

    getRawImage () {

        return this._rawData;

    }

    setTransferFunction(tFunction) {
        // TODO update _currentpvmin and _currentpvmax 

    }

    setColorMap(cMap) {

    }

    setInverse(bool) {

    }

    setMinMax(minVal, maxVal) {
        if (this._pvmin === undefined) {
            this._pvmin = minVal;
        }

        if (this._pvmax === undefined) {
            this._pvmax = maxVal;
        }

        this._currentpvmin = minVal;
        this._currentpvmax = maxVal;

        this._processedData.forEach(function (row, i) {
            row.forEach(function (val, j) {
                if (val < this._currentpvmin || val > this._currentpvmax) {
                    this._processedData[i][j] = "NaN";
                } else {
                    this._processedData[i][j] = this._rawData[i][j].getValue();
                }
            });
            // row.forEach(val => {
            //     if (val < this._currentpvmin || val > this._currentpvmax) {

            //     }
            // })

        });
            
    }
}

export default Image;