import assert from "node:assert/strict";
import test from "node:test";

import {
  Point,
  CoordsType,
  NumberType,
  AitoffProjection,
} from "../../lib-esm/index.js";

const CENTER_RA = 160.752615;
const CENTER_DEC = -64.4051202;

const RADIUS_DEG = 0.05;
const PIXEL_SIZE_DEG = 0.005;

test("Aitoff projection maps projected center to requested sky center", () => {
  const projection = new AitoffProjection();

  const center = new Point(
    CoordsType.ASTRO,
    NumberType.DEGREES,
    CENTER_RA,
    CENTER_DEC,
  );

  const width = projection.computeNaxisWidth(RADIUS_DEG, PIXEL_SIZE_DEG);

  assert.equal(width, 20);

  const pixels = projection.getImageRADecList(
    center,
    RADIUS_DEG,
    PIXEL_SIZE_DEG,
    width,
  );

  const pixelList = pixels.getImagePixelList();

  assert.equal(pixelList.length, width * width);

  const centerI = 10;
  const centerJ = 10;

  const centerIndex = centerJ * width + centerI;

  const centerPixel = pixelList[centerIndex];

  assert.ok(centerPixel);

  assert.ok(
    Math.abs(centerPixel.getRADeg() - CENTER_RA) < 1e-10,
    `Expected RA=${CENTER_RA}, got ${centerPixel.getRADeg()}`,
  );

  assert.ok(
    Math.abs(centerPixel.getDecDeg() - CENTER_DEC) < 1e-10,
    `Expected Dec=${CENTER_DEC}, got ${centerPixel.getDecDeg()}`,
  );
});

test("Aitoff projection produces finite sky coordinates around the center", () => {
  const projection = new AitoffProjection();

  const center = new Point(
    CoordsType.ASTRO,
    NumberType.DEGREES,
    CENTER_RA,
    CENTER_DEC,
  );

  const width = projection.computeNaxisWidth(RADIUS_DEG, PIXEL_SIZE_DEG);

  const pixels = projection.getImageRADecList(
    center,
    RADIUS_DEG,
    PIXEL_SIZE_DEG,
    width,
  );

  const pixelList = pixels.getImagePixelList();

  const sampleIndices = [
    9 * width + 10,
    10 * width + 9,
    10 * width + 11,
    11 * width + 10,
  ];

  for (const index of sampleIndices) {
    const pixel = pixelList[index];

    assert.ok(pixel);

    assert.ok(Number.isFinite(pixel.getRADeg()));

    assert.ok(Number.isFinite(pixel.getDecDeg()));

    assert.ok(Math.abs(pixel.getRADeg() - CENTER_RA) < 0.1);

    assert.ok(Math.abs(pixel.getDecDeg() - CENTER_DEC) < 0.1);
  }
});
