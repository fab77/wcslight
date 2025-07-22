export class RADecMinMaxCentral {
    centralRA: number
    centralDec: number
    minRA: number
    minDec: number
    maxRA: number
    maxDec: number
    
    constructor(centralRA: number, centralDec: number, minRA: number,
    minDec: number, maxRA: number, maxDec: number) {
        this.centralDec = centralDec
        this.centralRA = centralRA

        this.maxDec = maxDec
        this.maxRA = maxRA

        this.minRA = minRA
        this.minDec = minDec
    }

    getMinRA() {
        return this.minRA
    }
    
    getMinDec() {
        return this.minDec
    }
    
    getMaxRA() {
        return this.maxRA
    }
    
    getMaxDec() {
        return this.maxDec
    }

    getCentralRA() {
        return this.centralRA
    }
    
    getCentralDec() {
        return this.centralDec
    }


    setMinRA(minRA: number) {
        this.minRA = minRA
    }
    
    setMinDec(minDec: number) {
        this.minDec = minDec
    }
    
    setMaxRA(maxRA: number) {
        this.maxRA = maxRA
    }
    
    setMaxDec(maxDec: number) {
        this.maxDec = maxDec
    }

    setCentralRA(cRA: number) {
        this.centralRA = cRA
    }
    
    setCentralDec(cDec: number) {
        this.centralDec = cDec
    }

}