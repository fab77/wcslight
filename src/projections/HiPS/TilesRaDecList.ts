export class TilesRaDecList {

    raDecList!: Array<[number, number]>
    tilesNumberList!: Array<number>

    constructor(raDecList: Array<[number, number]>, tilesNumberList: Array<number>) {
        this.raDecList = raDecList
        this.tilesNumberList = tilesNumberList
    }

    getRaDecList() {
        return this.raDecList
    }

    getTilesNumberList() {
        return this.tilesNumberList
    }
  }
  