import {
  FITSFile,
  FITSHeaderManager,
  FITSWriter,
  ParsePayload,
  PrimaryHDU,
} from "jsfitsio";

export class FITSWriterAdapter {
  static writeImage(
    header: FITSHeaderManager,
    data: Array<Uint8Array>,
    filePath: string,
  ): void {
    const bitpix = Number(header.findById(FITSHeaderManager.BITPIX)?.value);

    if (!Number.isFinite(bitpix)) {
      throw new Error("BITPIX not defined or invalid");
    }

    const naxis = Number(header.findById(FITSHeaderManager.NAXIS)?.value);

    if (!Number.isInteger(naxis) || naxis < 0) {
      throw new Error("NAXIS not defined or invalid");
    }

    const shape: number[] = [];

    for (let axis = 1; axis <= naxis; axis++) {
      const dimension = Number(
        header.findById(FITSHeaderManager.naxisKey(axis))?.value,
      );

      if (!Number.isInteger(dimension) || dimension < 0) {
        throw new Error(`NAXIS${axis} not defined or invalid`);
      }

      shape.push(dimension);
    }

    /*
     * wcslight internally stores FITS image data as
     * multiple Uint8Array chunks/rows.
     *
     * jsfitsio 3 uses one contiguous raw payload.
     */
    const dataByteLength = data.reduce(
      (total, chunk) => total + chunk.byteLength,
      0,
    );

    const rawData = new Uint8Array(dataByteLength);

    let offset = 0;

    for (const chunk of data) {
      rawData.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const typedData = ParsePayload.createTypedArray(rawData, bitpix);

    const primaryHDU = new PrimaryHDU(
      header,
      rawData,

      /*
       * dataOffset describes the original source-file
       * position when parsing.
       *
       * For a newly created in-memory HDU there is no
       * source-file offset yet. FITSWriter computes the
       * actual serialized layout.
       */
      0,

      dataByteLength,
      bitpix,
      shape,
      typedData,
    );

    const fitsFile = new FITSFile([primaryHDU]);

    FITSWriter.writeFITSFileModel(fitsFile, filePath);
  }
}
