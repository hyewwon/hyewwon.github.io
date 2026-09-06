import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [
  ,
  ,
  waveFramesDir,
  takeoffFramesDir,
  airborneFramesDir,
  sheetOutputPath,
  framesOutputDir,
  sharpModulePath,
] = process.argv;

if (
  !waveFramesDir ||
  !takeoffFramesDir ||
  !airborneFramesDir ||
  !sheetOutputPath ||
  !framesOutputDir ||
  !sharpModulePath
) {
  throw new Error(
    "Usage: node scripts/compose-seamless-entry.mjs <wave-dir> <takeoff-dir> <airborne-dir> <sheet-output> <frames-output-dir> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const frameSize = 320;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const masks = {
  green: (r, g, b) => g > r * 1.05 && g > b * 1.7 && r > 55 && g > 100 && b < 120,
  cheek: (r, g, b) =>
    r > 190 && g > 60 && g < 190 && b > 30 && b < 160 && r > g * 1.15,
  belly: (r, g, b) =>
    r > 190 && g > 180 && b > 80 && b < 220 && Math.abs(r - g) < 55,
};

async function getPalette(framePath) {
  const { data, info } = await sharp(framePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const totals = Object.fromEntries(
    Object.keys(masks).map((name) => [name, { r: 0, g: 0, b: 0, count: 0 }]),
  );

  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] < 160) continue;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    for (const [name, matches] of Object.entries(masks)) {
      if (!matches(red, green, blue)) continue;
      totals[name].r += red;
      totals[name].g += green;
      totals[name].b += blue;
      totals[name].count += 1;
      break;
    }
  }

  return Object.fromEntries(
    Object.entries(totals).map(([name, value]) => [
      name,
      {
        r: value.r / value.count,
        g: value.g / value.count,
        b: value.b / value.count,
      },
    ]),
  );
}

function difference(target, source) {
  return Object.fromEntries(
    Object.keys(masks).map((name) => [
      name,
      {
        r: target[name].r - source[name].r,
        g: target[name].g - source[name].g,
        b: target[name].b - source[name].b,
      },
    ]),
  );
}

async function correctFrame(framePath, corrections, scale) {
  const { data, info } = await sharp(framePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] === 0) continue;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    for (const [name, matches] of Object.entries(masks)) {
      if (!matches(red, green, blue)) continue;
      const correction = corrections[name];
      data[offset] = Math.max(0, Math.min(255, Math.round(red + correction.r)));
      data[offset + 1] = Math.max(0, Math.min(255, Math.round(green + correction.g)));
      data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue + correction.b)));
      break;
    }
  }

  let frame = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  if (scale !== 1) {
    const scaledSize = Math.round(frameSize * scale);
    const offset = Math.round((scaledSize - frameSize) / 2);
    frame = await sharp(frame)
      .resize(scaledSize, scaledSize, { fit: "fill" })
      .extract({ left: offset, top: offset, width: frameSize, height: frameSize })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  return frame;
}

const waveReference = path.join(waveFramesDir, "frame-wave-v5-01.png");
const referencePalette = await getPalette(waveReference);
const takeoffCorrections = difference(
  referencePalette,
  await getPalette(path.join(takeoffFramesDir, "frame-takeoff-v8-01.png")),
);
const airborneCorrections = difference(
  referencePalette,
  await getPalette(path.join(airborneFramesDir, "frame-airborne-v8-01.png")),
);

const sources = [
  ...[1, 2, 3, 4, 8].map((number) => ({ type: "wave", number, scale: 1 })),
  { type: "takeoff", number: 2, scale: 1.13 },
  { type: "takeoff", number: 3, scale: 1.13 },
  { type: "takeoff", number: 4, scale: 1.1 },
  { type: "takeoff", number: 5, scale: 1 },
  { type: "takeoff", number: 6, scale: 1 },
  { type: "airborne", number: 1, scale: 1.12 },
  { type: "airborne", number: 2, scale: 1.15 },
  { type: "airborne", number: 3, scale: 1.2 },
  { type: "airborne", number: 4, scale: 1.1 },
  { type: "airborne", number: 5, scale: 1.1 },
  { type: "airborne", number: 6, scale: 1.1 },
];

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

const composites = [];
for (let index = 0; index < sources.length; index += 1) {
  const source = sources[index];
  let sourcePath;
  let frame;

  if (source.type === "wave") {
    sourcePath = path.join(
      waveFramesDir,
      `frame-wave-v5-${String(source.number).padStart(2, "0")}.png`,
    );
    frame = await sharp(sourcePath).png({ compressionLevel: 9 }).toBuffer();
  } else {
    const prefix = source.type === "takeoff" ? "frame-takeoff-v8" : "frame-airborne-v8";
    const directory = source.type === "takeoff" ? takeoffFramesDir : airborneFramesDir;
    const corrections =
      source.type === "takeoff" ? takeoffCorrections : airborneCorrections;
    sourcePath = path.join(
      directory,
      `${prefix}-${String(source.number).padStart(2, "0")}.png`,
    );
    frame = await correctFrame(sourcePath, corrections, source.scale);
  }

  const filename = `frame-seamless-v8-${String(index + 1).padStart(2, "0")}.png`;
  await sharp(frame).toFile(path.join(framesOutputDir, filename));
  composites.push({
    input: frame,
    left: (index % 4) * frameSize,
    top: Math.floor(index / 4) * frameSize,
  });
}

await sharp({
  create: {
    width: frameSize * 4,
    height: frameSize * 4,
    channels: 4,
    background: transparent,
  },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(sheetOutputPath);
