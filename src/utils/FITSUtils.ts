export class FITSUtils {
  static convertBlankToBytes(blank: number, nbytes: number): Uint8Array {
    const buffer = new ArrayBuffer(nbytes);

    const view = new DataView(buffer);

    switch (nbytes) {
      case 1:
        view.setUint8(0, blank);
        break;

      case 2:
        view.setInt16(0, blank, false);
        break;

      case 4:
        view.setInt32(0, blank, false);
        break;

      case 8:
        view.setBigInt64(0, BigInt(blank), false);
        break;

      default:
        throw new Error(`Unsupported FITS integer byte width: ${nbytes}`);
    }

    return new Uint8Array(buffer);
  }
}
