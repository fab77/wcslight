import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CartesianProjection,
  MercatorProjection,
  SinProjection,
  AitoffProjection,
} from "../../lib-esm/index.js";

import { TilesRaDecList2 } from "../../lib-esm/projections/hips/TilesRaDecList2.js";

import { ImagePixel } from "../../lib-esm/projections/hips/ImagePixel.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/projections");

const WIDTH = 32;
const HEIGHT = 32;

const BITPIX = 16;

const CENTER_RA = 180;
const CENTER_DEC = 0;

const PIXEL_SIZE = 0.1;

const TEST_COLUMN = 17;
const TEST_ROW = 16;

const EXPECTED_VALUE = TEST_ROW * WIDTH + TEST_COLUMN;

const projections = [
  {
    name: "Cartesian",
    file: "cartesian.fits",
    Projection: CartesianProjection,
    ctype1: "RA---CAR",
    ctype2: "DEC--CAR",
    pixelTolerance: 0,
  },
  {
    name: "Mercator",
    file: "mercator.fits",
    Projection: MercatorProjection,
    ctype1: "RA---MER",
    ctype2: "DEC--MER",
    pixelTolerance: 0,
  },
  {
    name: "SIN",
    file: "sin.fits",
    Projection: SinProjection,
    ctype1: "RA---SIN",
    ctype2: "DEC--SIN",
    pixelTolerance: 1,
  },
  {
    name: "Aitoff",
    file: "aitoff.fits",
    Projection: AitoffProjection,
    ctype1: "RA---AIT",
    ctype2: "DEC--AIT",
    pixelTolerance: 0,
  },
];

for (const {
  name,
  file,
  Projection,
  ctype1,
  ctype2,
  pixelTolerance,
} of projections) {
  test(`${name} projection reads FITS image correctly`, async () => {
    const fixturePath = path.join(FIXTURE_DIR, file);

    const projection = new Projection();

    const image = await projection.initFromFile(fixturePath);

    /*
     * Validate the jsfitsio PrimaryHDU.
     */
    assert.equal(image.naxis, 2);

    assert.deepEqual(image.shape, [WIDTH, HEIGHT]);

    assert.equal(image.bitpix, BITPIX);

    assert.ok(image.rawData);

    assert.equal(image.rawData.byteLength, WIDTH * HEIGHT * (BITPIX / 8));

    /*
     * Validate the projection state populated
     * by initFromFile().
     */
    assert.equal(projection.naxis1, WIDTH);

    assert.equal(projection.naxis2, HEIGHT);

    assert.equal(projection.bitpix, BITPIX);

    assert.equal(projection.craDeg, CENTER_RA);

    assert.equal(projection.cdecDeg, CENTER_DEC);

    assert.equal(projection.pxsize, PIXEL_SIZE);

    /*
     * Verify rawData -> row conversion.
     *
     * BITPIX=16 means two bytes per pixel.
     */
    assert.equal(projection.pxvalues.length, HEIGHT);

    for (const row of projection.pxvalues) {
      assert.equal(row.byteLength, WIDTH * 2);
    }

    /*
     * Validate WCS projection type.
     *
     * FITS string values may include quotes,
     * so use includes() rather than requiring
     * the exact serialized representation.
     */
    const header = projection.getFITSHeader();

    const actualCtype1 = String(header.findById("CTYPE1")?.value);

    const actualCtype2 = String(header.findById("CTYPE2")?.value);

    assert.ok(actualCtype1.includes(ctype1));

    assert.ok(actualCtype2.includes(ctype2));
  });

  test(`${name} projection performs pixel/world round-trip and reads pixel data`, async () => {
    const fixturePath = path.join(FIXTURE_DIR, file);

    const projection = new Projection();

    await projection.initFromFile(fixturePath);

    /*
     * Start from a pixel slightly away from the
     * projection center.
     *
     * We intentionally use (17,16), rather than
     * the exact central pixel (16,16), because
     * ImagePixel currently distinguishes its two
     * constructor overloads using integer values.
     */
    const world = projection.pix2world(
      TEST_COLUMN,
      TEST_ROW,
      projection.pxsize,
      projection.minra,
      projection.mindec,
    );

    const ra = world.getAstro().raDeg;

    const dec = world.getAstro().decDeg;

    assert.ok(Number.isFinite(ra));

    assert.ok(Number.isFinite(dec));

    const pixels = new TilesRaDecList2();

    const imagePixel = new ImagePixel(ra, dec, undefined);

    pixels.addImagePixel(imagePixel);

    projection.world2pix(pixels);

    /*
     * WCS round-trip:
     *
     * pixel -> sky -> pixel
     *
     * SIN may land on the adjacent pixel because
     * floating-point projection/inverse-projection
     * calculations can place the reconstructed
     * coordinate infinitesimally across a pixel
     * boundary.
     */
    if (pixelTolerance === 0) {
      assert.equal(imagePixel.geti(), TEST_COLUMN);
      assert.equal(imagePixel.getj(), TEST_ROW);
    } else {
      assert.ok(
        Math.abs(imagePixel.geti() - TEST_COLUMN) <= pixelTolerance,
        `${name}: expected i≈${TEST_COLUMN}, got ${imagePixel.geti()}`,
      );

      assert.ok(
        Math.abs(imagePixel.getj() - TEST_ROW) <= pixelTolerance,
        `${name}: expected j≈${TEST_ROW}, got ${imagePixel.getj()}`,
      );
    }

    /*
     * Verify that world2pix reads the value belonging
     * to the pixel it actually resolved.
     *
     * Fixture definition:
     *
     * value(row, column) = row * WIDTH + column
     */
    const actualColumn = imagePixel.geti();
    const actualRow = imagePixel.getj();

    const expectedSampledValue = actualRow * WIDTH + actualColumn;

    assert.equal(
      imagePixel.getValue(),
      expectedSampledValue,
      `${name}: sampled value does not match returned pixel coordinates`,
    );

    const bytes = imagePixel.getUint8Value();

    assert.ok(bytes);

    assert.equal(bytes.byteLength, 2);
  });
}
