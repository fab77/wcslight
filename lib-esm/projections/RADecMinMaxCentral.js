export class RADecMinMaxCentral {
    centralRA;
    centralDec;
    minRA;
    minDec;
    maxRA;
    maxDec;
    constructor(centralRA, centralDec, minRA, minDec, maxRA, maxDec) {
        this.centralDec = centralDec;
        this.centralRA = centralRA;
        this.maxDec = maxDec;
        this.maxRA = maxRA;
        this.minRA = minRA;
        this.minDec = minDec;
    }
    getMinRA() {
        return this.minRA;
    }
    getMinDec() {
        return this.minDec;
    }
    getMaxRA() {
        return this.maxRA;
    }
    getMaxDec() {
        return this.maxDec;
    }
    getCentralRA() {
        return this.centralRA;
    }
    getCentralDec() {
        return this.centralDec;
    }
    setMinRA(minRA) {
        this.minRA = minRA;
    }
    setMinDec(minDec) {
        this.minDec = minDec;
    }
    setMaxRA(maxRA) {
        this.maxRA = maxRA;
    }
    setMaxDec(maxDec) {
        this.maxDec = maxDec;
    }
    setCentralRA(cRA) {
        this.centralRA = cRA;
    }
    setCentralDec(cDec) {
        this.centralDec = cDec;
    }
}
//# sourceMappingURL=RADecMinMaxCentral.js.map