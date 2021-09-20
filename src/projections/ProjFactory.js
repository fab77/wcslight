"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import HEALPixProjection from "./HEALPixProjection";
import MercatorProjection from "./MercatorProjection";
import ProjectionNotFound from "../exceptions/ProjectionNotFound";

class ProjFactory  {

    static getProjection(center, radius, pxsize, projectionName) {
        if (projectionName === "Mercator") {
            return new MercatorProjection(center, radius, pxsize);
        } else  if (projectionName === "HEALPix") {
            return new  HEALPixProjection(center, radius, pxsize);
        } else {
            throw new ProjectionNotFound(projectionName);
        }
    }
}

export default ProjFactory;