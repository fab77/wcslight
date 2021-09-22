"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class ProjectionNotFound {

    _error;

    constructor(projection)  {
        this._error = "Projection " + projection + " not found";
    }

    getError() {
        return this._error;
    }

}

export default ProjectionNotFound;