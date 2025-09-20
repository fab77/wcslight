export class HiPSProperties {

    static TILE_WIDTH:string = "hips_tile_width"
    static FRAME:string = "hips_frame"
    static ORDER:string = "hips_order"
    static GALACTIC:string = "galactic"
    static SCALE:string = "hips_pixel_scale"
    static BITPIX:string = "hips_pixel_bitpix"


    private itemMap: Map<string, any> = new Map<string, any>()

    constructor(){}

    addItem(key:string, value:any) {
        this.itemMap.set(key, value)
    }

    getItem(key: string){
        return this.itemMap.get(key)
    }

    isGalactic(){
        return this.itemMap.get(HiPSProperties.FRAME) == HiPSProperties.GALACTIC
    }

}