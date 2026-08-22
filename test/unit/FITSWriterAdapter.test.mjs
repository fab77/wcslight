import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";

import { FITSHeaderItem, FITSHeaderManager, FITSParser } from "jsfitsio";

import { FITSWriterAdapter } from "../../lib-esm/utils/FITSWriterAdapter.js";

const OUTPUT_FILE = "./test/output/fits-writer-adapter.fits";

test("FITSWriterAdapter writes a FITS image readable by jsfitsio", async () => {
  await fs.rm(OUTPUT_FILE, { force: true });

  try {
    const header = new FITSHeaderManager();

    header.insert(new FITSHeaderItem("SIMPLE", "T", ""));

    header.insert(new FITSHeaderItem("BITPIX", 16, ""));

    header.insert(new FITSHeaderItem("NAXIS", 2, ""));

    header.insert(new FITSHeaderItem("NAXIS1", 2, ""));

    header.insert(new FITSHeaderItem("NAXIS2", 2, ""));

    header.insert(new FITSHeaderItem("BSCALE", 1, ""));

    header.insert(new FITSHeaderItem("BZERO", 0, ""));

    header.insert(new FITSHeaderItem("END", "", ""));

    /*
     * 2 x 2 Int16 image:
     *
     * 1  2
     * 3  4
     *
     * FITS numerical data is big-endian.
     */
    const row0 = new Uint8Array([0x00, 0x01, 0x00, 0x02]);

    const row1 = new Uint8Array([0x00, 0x03, 0x00, 0x04]);

    FITSWriterAdapter.writeImage(header, [row0, row1], OUTPUT_FILE);

    const stat = await fs.stat(OUTPUT_FILE);

    assert.ok(stat.size > 0);

    const fitsFile = await FITSParser.loadFITSFile(OUTPUT_FILE);

    assert.ok(fitsFile);

    assert.equal(fitsFile.length, 1);

    const image = fitsFile.primaryHDU;

    assert.ok(image);

    assert.equal(image.bitpix, 16);

    assert.deepEqual(image.shape, [2, 2]);

    assert.equal(image.elementCount, 4);

    assert.ok(image.typedData instanceof Int16Array);

    assert.deepEqual(Array.from(image.typedData), [1, 2, 3, 4]);

    assert.deepEqual(
      Array.from(image.rawData),
      [0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04],
    );
  } finally {
    await fs.rm(OUTPUT_FILE, { force: true });
  }
});
