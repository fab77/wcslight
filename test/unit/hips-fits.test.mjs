import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HiPSProperties } from "../../lib-esm/projections/hips/HiPSProperties.js";

import {
  FITSHeaderItem,
  FITSHeaderManager,
  FITSParser,
  PrimaryHDU,
} from "jsfitsio";

import { HiPSFITS } from "../../lib-esm/projections/hips/HiPSFITS.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const FIXTURE = path.resolve(
  __dirname,
  "../fixtures/hips/decaps/Norder4/Dir0/Npix2326.fits",
);

test("HiPSFITS initializes from a PrimaryHDU and preserves HiPS metadata", async () => {
  const fitsFile = await FITSParser.loadFITSFile(FIXTURE);

  assert.ok(fitsFile);

  const source = fitsFile.primaryHDU;

  assert.ok(source);

  /*
   * HiPSFITS currently expects ORDER and NPIX
   * to be present in the FITS header.
   *
   * The real DECaPS tile fixture does not
   * necessarily contain these values, because
   * they are normally known from the HiPS path
   * and properties file.
   *
   * Build a controlled PrimaryHDU for testing
   * the HiPSFITS contract itself.
   */
  const header = new FITSHeaderManager();

  for (const item of source.header.getItems()) {
    /*
     * Do not copy END yet because ORDER/NPIX
     * must be inserted before it.
     */
    if (item.key !== "END") {
      header.insert(new FITSHeaderItem(item.key, item.value, item.comment));
    }
  }

  header.insert(new FITSHeaderItem(HiPSProperties.ORDER, 4, ""));

  header.insert(new FITSHeaderItem("NPIX", 2326, ""));

  header.insert(new FITSHeaderItem("END", "", ""));

  const primary = new PrimaryHDU(
    header,
    source.rawData,
    source.dataOffset,
    source.dataByteLength,
    source.bitpix,
    source.shape,
    source.typedData,
  );

  const hipsFits = new HiPSFITS(primary, null, null);

  assert.equal(hipsFits.getTileno(), 2326);

  const payload = hipsFits.getPayload();

  assert.equal(payload.length, source.shape[1]);

  const bytesPerElement = Math.abs(source.bitpix) / 8;

  const expectedRowByteLength = source.shape[0] * bytesPerElement;

  for (const row of payload) {
    assert.ok(row instanceof Uint8Array);

    assert.equal(row.byteLength, expectedRowByteLength);
  }

  const outputHeader = hipsFits.getHeader();

  assert.equal(Number(outputHeader.findById("BITPIX")?.value), source.bitpix);

  assert.equal(Number(outputHeader.findById("NAXIS")?.value), 2);

  assert.equal(Number(outputHeader.findById("NAXIS1")?.value), source.shape[0]);

  assert.equal(Number(outputHeader.findById("NAXIS2")?.value), source.shape[1]);

  assert.equal(Number(outputHeader.findById(HiPSProperties.ORDER)?.value), 4);

  assert.equal(Number(outputHeader.findById("NPIX")?.value), 2326);

  assert.equal(Number(outputHeader.findById("BLANK")?.value), -32768);

  assert.equal(Number(outputHeader.findById("BZERO")?.value), 50);

  const bscale = Number(outputHeader.findById("BSCALE")?.value);

  assert.ok(Number.isFinite(bscale));

  const datamin = Number(outputHeader.findById("DATAMIN")?.value);

  const datamax = Number(outputHeader.findById("DATAMAX")?.value);

  assert.ok(Number.isFinite(datamin));

  assert.ok(Number.isFinite(datamax));

  assert.ok(datamin <= datamax);

  /*
   * Regression test for the previous bug where
   * DATAMAX was accidentally written using min.
   */
  assert.notEqual(datamin, datamax);
});
