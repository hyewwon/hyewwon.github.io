import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [
  ,
  ,
  waveFramesDir,
  generatedFramesDir,
  sheetOutputPath,
  framesOutputDir,
  sharpModulePath,
] = process.argv;

if (
  !waveFramesDir ||
  !generatedFramesDir ||
  !sheetOutputPath ||
  !framesOutputDir ||
  !sharpModulePath
) {
  throw new Error(
    "Usage: node scripts/compose-direct-entry.mjs <wave-frames-dir> <generated-frames-dir> <sheet-output> <frames-output-dir> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const frameSize = 320;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const masks = {
  green: (red, green, blue) =>
    green > red * 1.05 && green > blue * 1.7 && red > 55 && green > 100 && blue < 120,
  cheek: (red, green, blue) =>
    red > 190 && green > 60 && green < 190 && blue > 30 && blue < 160 && red > green * 1.15,
  belly: (red, green, blue) =>
    red > 190 && green > 180 && blue > 80 && blue < 220 && Math.abs(red - green) < 55,
};

async function palette(framePath) {
  const { data, info } = await sharp(framePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const totals = Object.fromEntries(
    Object.keys(masks).map((name) => [name, { red: 0, green: 0, blue: 0, count: 0 }]),
  );

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const alpha = data[offset + 3];
      if (alpha < 160) continue;

      for (const [name, matches] of Object.entries(masks)) {
        if (!matches(red, green, blue)) continue;
        totals[name].red += red;
        totals[name].green += green;
        totals[name].blue += blue;
        totals[name].count += 1;
        break;
      }
    }
  }

  return Object.fromEntries(
    Object.entries(totals).map(([name, value]) => [
      name,
      {
        red: value.red / value.count,
        green: value.green / value.count,
        blue: value.blue / value.count,
      },
    ]),
  );
}

const referenceFrame = path.join(waveFramesDir, "frame-wave-v5-01.png");
const generatedReference = path.join(generatedFramesDir, "frame-direct-generated-01.png");
const referencePalette = await palette(referenceFrame);
const generatedPalette = await palette(generatedReference);
const corrections = Object.fromEntries(
  Object.keys(masks).map((name) => [
    name,
    {
      red: referencePalette[name].red - generatedPalette[name].red,
      green: referencePalette[name].green - generatedPalette[name].green,
      blue: referencePalette[name].blue - generatedPalette[name].blue,
    },
  ]),
);

async function correctGeneratedFrame(framePath, contentScale = 1) {
  const { data, info } = await sharp(framePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (data[offset + 3] === 0) continue;

      for (const [name, matches] of Object.entries(masks)) {
        if (!matches(red, green, blue)) continue;
        const correction = corrections[name];
        data[offset] = Math.max(0, Math.min(255, Math.round(red + correction.red)));
        data[offset + 1] = Math.max(
          0,
          Math.min(255, Math.round(green + correction.green)),
        );
        data[offset + 2] = Math.max(
          0,
          Math.min(255, Math.round(blue + correction.blue)),
        );
        break;
      }
    }
  }

  let frame = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  if (contentScale !== 1) {
    const scaledSize = Math.round(frameSize * contentScale);
    const offset = Math.round((scaledSize - frameSize) / 2);
    frame = await sharp(frame)
      .resize(scaledSize, scaledSize, { fit: "fill" })
      .extract({ left: offset, top: offset, width: frameSize, height: frameSize })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  return frame;
}

const generatedScales = {
  2: 1.35,
  3: 1.25,
  4: 1.25,
  5: 1.1,
  6: 1.1,
  7: 1.1,
  8: 1.1,
};

const sourceFrames = [
  { type: "wave", number: 1 },
  { type: "wave", number: 2 },
  { type: "wave", number: 3 },
  { type: "wave", number: 4 },
  { type: "wave", number: 8 },
  { type: "generated", number: 2 },
  { type: "generated", number: 3 },
  { type: "generated", number: 4 },
  { type: "generated", number: 5 },
  { type: "generated", number: 6 },
  { type: "generated", number: 7 },
  { type: "generated", number: 8 },
];

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

const composites = [];
for (let index = 0; index < sourceFrames.length; index += 1) {
  const source = sourceFrames[index];
  const sourcePath =
    source.type === "wave"
      ? path.join(
          waveFramesDir,
          `frame-wave-v5-${String(source.number).padStart(2, "0")}.png`,
        )
      : path.join(
          generatedFramesDir,
          `frame-direct-generated-${String(source.number).padStart(2, "0")}.png`,
        );
  const frame =
    source.type === "generated"
      ? await correctGeneratedFrame(sourcePath, generatedScales[source.number] ?? 1)
      : await sharp(sourcePath).png({ compressionLevel: 9 }).toBuffer();
  const filename = `frame-direct-v7-${String(index + 1).padStart(2, "0")}.png`;

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
    height: frameSize * 3,
    channels: 4,
    background: transparent,
  },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(sheetOutputPath);
