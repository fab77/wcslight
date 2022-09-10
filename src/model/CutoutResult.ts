import { FITSHeader } from "../../../FITSParser/src/model/FITSHeader";
import {AbstractProjection} from "src/projections/AbstractProjection";

export interface CutoutResult{
    
    fitsheader: FITSHeader[]; 
    fitsdata: Map<number, Uint8Array[]>; 
    inproj: AbstractProjection; 
    outproj: AbstractProjection;
    
}