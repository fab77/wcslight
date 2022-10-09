/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
export class ImagePixel {
    constructor(i = null, j = null, tileno = null) {
        this._i = i;
        this._j = j;
        this._tileno = tileno;
    }
    geti() {
        return this._i;
    }
    getj() {
        return this._j;
    }
    get tileno() {
        return this._tileno;
    }
}
