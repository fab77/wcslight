export class HiPSProp {

    static TILE_WIDTH:string = "TILE_WIDTH"
    static FRAME:string = "FRAME"
    static ORDER:string = "ORDER"
    static GALACTIC:string = "galactic"
    // static NAXIS:string = "NAXIS"
    // static NAXIS1:string = "NAXIS1"
    // static NAXIS2:string = "NAXIS2"
    // static BITPIX:string = "BITPIX"
    // static BSCALE:string = "BSCALE"
    // static BZERO:string = "BZERO"
    // static SIMPLE:string = "SIMPLE"


    private itemMap: Map<string, any> = new Map<string, any>()

    constructor(){}

    addItem(key:string, value:any) {
        this.itemMap.set(key, value)
    }

    getItem(key: string){
        return this.itemMap.get(key)
    }

    isGalactic(){
        return this.itemMap.get(HiPSProp.FRAME) == HiPSProp.GALACTIC
    }

}