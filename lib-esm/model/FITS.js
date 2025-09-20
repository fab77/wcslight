export class FITS {
    constructor(header, data) {
        this.payload = [];
        this.header = header;
        this.setData(data);
    }
    setData(data) {
        this.payload = Array.from(data.values()).flatMap(row => row);
    }
    getHeader() {
        return this.header;
    }
    getData() {
        return this.payload;
    }
}
//# sourceMappingURL=FITS.js.map