export class MinMaxValue {
    min: number
    max: number
    
    constructor(min: number, max: number) {
        this.min = min
        this.max = max
    }

    getMinValue() {
        return this.min
    }
    
    getMaxValue() {
        return this.max
    }

}