export class FITSProp {

    // static TILE_WIDTH:string = "TILE_WIDTH"
    // static ORDER:string = "ORDER"
    static NPIX:string = "NPIX"
    // static SIMPLE:string = "SIMPLE"

    private itemMap: Map<string, any> = new Map<string, any>()

    constructor(){}

    addItem(key:string, value:any) {
        this.itemMap.set(key, value)
    }

    getItem(key: string){
        return this.itemMap.get(key)
    }

}