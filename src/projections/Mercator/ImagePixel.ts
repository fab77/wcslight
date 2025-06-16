/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */



export class ImagePixel {
    i: number;     
    j: number;     
    
    constructor (i: number, j: number) {
        this.i = i;
        this.j = j;
    }

    geti() {
        return this.i;
    }

    getj() {
        return this.j;
    }

}
