import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [
  ,
  ,
  waveFramesDir,
  hopFramesDir,
  flightFramesDir,
  turnFramesDir,
  previousFramesDir,
  sheetOutputPath,
  framesOutputDir,
  sharpModulePath,
] = process.argv;

if (
  !waveFramesDir ||
  !hopFramesDir ||
  !flightFramesDir ||
  !turnFramesDir ||
  !previousFramesDir ||
  !sheetOutputPath ||
  !framesOutputDir ||
  !sharpModulePath
) {
  throw new Error(
    "Usage: node scripts/compose-plump-entry.mjs <wave-dir> <hop-dir> <flight-dir> <turn-dir> <previous-frames-dir> <sheet-output> <frames-output-dir> <sharp-module-path>",
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
  const { data } = await sharp(framePath)
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

function getCorrections(target, source) {
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

async function scaleFrame(frame, scale) {
  if (scale === 1) return frame;

  const scaledSize = Math.round(frameSize * scale);
  const cropOffset = Math.round((scaledSize - frameSize) / 2);
  return sharp(frame)
    .resize(scaledSize, scaledSize, { fit: "fill" })
    .extract({ left: cropOffset, top: cropOffset, width: frameSize, height: frameSize })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function prepareGeneratedFrame(framePath, corrections, scale, clearLeft = 0) {
  const { data, info } = await sharp(framePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] === 0) continue;
    const pixelX = (offset / 4) % info.width;
    if (pixelX < clearLeft) {
      data[offset + 3] = 0;
      continue;
    }
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

  return scaleFrame(frame, scale);
}

const waveReferencePath = path.join(waveFramesDir, "frame-wave-v5-01.png");
const hopReferencePath = path.join(hopFramesDir, "frame-plump-hop-v9-01.png");
const flightReferencePath = path.join(
  flightFramesDir,
  "frame-extended-flight-v10-01.png",
);
const turnReferencePath = path.join(turnFramesDir, "frame-air-turn-v11-01.png");
const referencePalette = await getPalette(waveReferencePath);
const hopCorrections = getCorrections(
  referencePalette,
  await getPalette(hopReferencePath),
);
const flightCorrections = getCorrections(
  referencePalette,
  await getPalette(flightReferencePath),
);
const turnCorrections = getCorrections(
  referencePalette,
  await getPalette(turnReferencePath),
);
const canonicalFace = await sharp(waveReferencePath)
  .extract({ left: 90, top: 20, width: 150, height: 125 })
  .png({ compressionLevel: 9 })
  .toBuffer();

const sources = [
  ...[1, 2, 3, 3, 1].map((number) => ({ type: "wave", number })),
  { type: "hop", number: 1, scale: 1.25 },
  { type: "hop", number: 2, scale: 1.25 },
  { type: "hop", number: 3, scale: 1.25 },
  { type: "flight", number: 1, scale: 1.42 },
  { type: "flight", number: 2, scale: 1.42 },
  { type: "turn", number: 1, scale: 1.42 },
  { type: "turn", number: 2, scale: 1.42, clearLeft: 90 },
  { type: "turn", number: 3, scale: 1.42 },
  ...[14, 15, 16].map((number) => ({ type: "portal", number, scale: 1.1 })),
];

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

const composites = [];
for (let index = 0; index < sources.length; index += 1) {
  const source = sources[index];
  let frame;

  if (source.type === "wave") {
    frame = await sharp(
      path.join(waveFramesDir, `frame-wave-v5-${String(source.number).padStart(2, "0")}.png`),
    )
      .composite([{ input: canonicalFace, left: 90, top: 20 }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  } else if (source.type === "hop") {
    frame = await prepareGeneratedFrame(
      path.join(
        hopFramesDir,
        `frame-plump-hop-v9-${String(source.number).padStart(2, "0")}.png`,
      ),
      hopCorrections,
      source.scale,
    );
  } else if (source.type === "flight") {
    frame = await prepareGeneratedFrame(
      path.join(
        flightFramesDir,
        `frame-extended-flight-v10-${String(source.number).padStart(2, "0")}.png`,
      ),
      flightCorrections,
      source.scale,
    );
  } else if (source.type === "turn") {
    frame = await prepareGeneratedFrame(
      path.join(
        turnFramesDir,
        `frame-air-turn-v11-${String(source.number).padStart(2, "0")}.png`,
      ),
      turnCorrections,
      source.scale,
      source.clearLeft,
    );
  } else {
    const portalFrame = await sharp(
      path.join(
        previousFramesDir,
        `frame-seamless-v8-${String(source.number).padStart(2, "0")}.png`,
      ),
    )
      .png({ compressionLevel: 9 })
      .toBuffer();
    frame = await scaleFrame(portalFrame, source.scale);
  }

  const filename = `frame-seamless-v11-${String(index + 1).padStart(2, "0")}.png`;
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
