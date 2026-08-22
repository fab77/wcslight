import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CartesianProjection,
  MercatorProjection,
  SinProjection,
  AitoffProjection,
} from "../lib-esm/index.js";

import { FITSWriterAdapter } from "../lib-esm/utils/FITSWriterAdapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "../test/fixtures/projections");

/*
 * All projection fixtures use exactly the same image data.
 *
 * This is important because later we can compare how the same
 * numerical image is interpreted by the different WCS projections.
 */
const WIDTH = 32;
const HEIGHT = 32;

const BITPIX = 16;

const BLANK = -32768;
const BZERO = 0;
const BSCALE = 1;

/*
 * Common WCS reference position.
 *
 * Keep the center away from RA=0/360 and the celestial poles
 * to avoid introducing boundary conditions in the basic fixtures.
 */
const CENTER_RA = 180;
const CENTER_DEC = 0;

/*
 * Degrees per pixel.
 *
 * 32 pixels * 0.1 deg/pixel = 3.2 degree field.
 */
const PIXEL_ANG_SIZE = 0.1;

/*
 * Pixel values:
 *
 * row 0:    0,   1,   2, ...
 * row 1:   32,  33,  34, ...
 * ...
 *
 * value(row, col) = row * WIDTH + col
 *
 * With a 32x32 image the range is:
 *
 * 0 .. 1023
 *
 * which fits comfortably inside BITPIX=16.
 */
const MIN_VALUE = 0;
const MAX_VALUE = WIDTH * HEIGHT - 1;

function createImageRows() {
  const rows = new Array(HEIGHT);

  for (let row = 0; row < HEIGHT; row++) {
    const buffer = new ArrayBuffer(WIDTH * 2);

    const view = new DataView(buffer);

    for (let column = 0; column < WIDTH; column++) {
      const value = row * WIDTH + column;

      /*
       * FITS numerical payload is big-endian.
       */
      view.setInt16(column * 2, value, false);
    }

    rows[row] = new Uint8Array(buffer);
  }

  return rows;
}

async function generateFixture(name, projection) {
  const header = projection.prepareHeader(
    PIXEL_ANG_SIZE,
    BITPIX,
    WIDTH,
    BLANK,
    BZERO,
    BSCALE,
    CENTER_RA,
    CENTER_DEC,
    MIN_VALUE,
    MAX_VALUE,
  );

  const rows = createImageRows();

  const outputPath = path.join(OUTPUT_DIR, `${name}.fits`);

  FITSWriterAdapter.writeImage(header, rows, outputPath);

  const stat = await fs.stat(outputPath);

  console.log(`${name.padEnd(10)} -> ${outputPath} (${stat.size} bytes)`);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  console.log("Generating WCS projection FITS fixtures...");

  console.log(`Image: ${WIDTH}x${HEIGHT}, BITPIX=${BITPIX}`);

  console.log(`Center: RA=${CENTER_RA}, Dec=${CENTER_DEC}`);

  console.log(`Pixel scale: ${PIXEL_ANG_SIZE} deg/pixel`);

  console.log("");

  await generateFixture("cartesian", new CartesianProjection());

  await generateFixture("mercator", new MercatorProjection());

  await generateFixture("sin", new SinProjection());

  await generateFixture("aitoff", new AitoffProjection());

  console.log("");
  console.log("Projection fixtures generated successfully.");
}

await main();
