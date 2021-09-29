"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

 
 import InHiPSProjection from "./InHiPSProjection";
import ProjectionNotFound from "../exceptions/ProjectionNotFound";

class InProjFactory  {

    static getProjection(center, radius, pxsize, projectionName) {
        if (projectionName === "HiPS") {
            return new  InHiPSProjection(pxsize);
        } else {
            throw new ProjectionNotFound(projectionName);
        }
    }
}

export default InProjFactory;