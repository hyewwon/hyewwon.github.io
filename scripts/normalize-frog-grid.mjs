import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [
  ,
  ,
  inputPath,
  sheetOutputPath,
  framesOutputDir,
  sharpModulePath,
  framePrefix,
  columnsInput,
  rowsInput,
  stabilizeCountInput = "6",
  contentScaleInput = "1",
] = process.argv;

if (
  !inputPath ||
  !sheetOutputPath ||
  !framesOutputDir ||
  !sharpModulePath ||
  !framePrefix ||
  !columnsInput ||
  !rowsInput
) {
  throw new Error(
    "Usage: node scripts/normalize-frog-grid.mjs <input> <sheet-output> <frames-output-dir> <sharp-module-path> <frame-prefix> <columns> <rows> [stabilize-count] [content-scale]",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const columns = Number(columnsInput);
const rows = Number(rowsInput);
const stabilizeCount = Number(stabilizeCountInput);
const contentScale = Number(contentScaleInput);
const frameSize = 320;
const alphaThreshold = 32;
const occupiedLineThreshold = 8;

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

function findCenters(axis) {
  const length = axis === "x" ? info.width : info.height;
  const crossLength = axis === "x" ? info.height : info.width;
  const counts = [];

  for (let position = 0; position < length; position += 1) {
    let count = 0;

    for (let cross = 0; cross < crossLength; cross += 1) {
      const x = axis === "x" ? position : cross;
      const y = axis === "x" ? cross : position;
      if (data[(y * info.width + x) * 4 + 3] > alphaThreshold) count += 1;
    }

    counts.push(count);
  }

  const clusters = [];
  let start = null;

  for (let position = 0; position <= counts.length; position += 1) {
    if (position < counts.length && counts[position] > occupiedLineThreshold) {
      if (start === null) start = position;
      continue;
    }

    if (start !== null) {
      clusters.push([start, position - 1]);
      start = null;
    }
  }

  return clusters.map(([from, to]) => (from + to) / 2);
}

const columnCenters = findCenters("x");
const rowCenters = findCenters("y");

if (columnCenters.length !== columns || rowCenters.length !== rows) {
  throw new Error(
    `Expected ${columns}×${rows} occupied clusters, found ${columnCenters.length}×${rowCenters.length}.`,
  );
}

const sourceCellSize = Math.round(Math.min(info.width / columns, info.height / rows));
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const sheet = sharp({
  create: {
    width: columns * frameSize,
    height: rows * frameSize,
    channels: 4,
    background: transparent,
  },
});
const composites = [];

async function findWaveAnchor(frame) {
  const { data: frameData, info: frameInfo } = await sharp(frame)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let xTotal = 0;
  let yTotal = 0;
  let count = 0;

  // The pale belly is unchanged while the waving arm moves. Using it as the
  // registration mark keeps the body planted instead of centering the wider
  // arm silhouette and making the frog appear to sway.
  for (let y = 140; y < 250; y += 1) {
    for (let x = 75; x < 245; x += 1) {
      const pixel = (y * frameInfo.width + x) * 4;
      const red = frameData[pixel];
      const green = frameData[pixel + 1];
      const blue = frameData[pixel + 2];
      const alpha = frameData[pixel + 3];

      if (
        alpha > 100 &&
        red > 225 &&
        green > 210 &&
        blue > 90 &&
        green - red < 25
      ) {
        xTotal += x;
        yTotal += y;
        count += 1;
      }
    }
  }

  return count ? { x: xTotal / count, y: yTotal / count } : null;
}

async function stabilizeWaveFrame(frame, targetAnchor) {
  const anchor = await findWaveAnchor(frame);
  if (!anchor || !targetAnchor) return frame;

  const margin = 32;
  const left = margin + Math.round(targetAnchor.x - anchor.x);
  const top = margin + Math.round(targetAnchor.y - anchor.y);
  const padded = await sharp({
    create: {
      width: frameSize + margin * 2,
      height: frameSize + margin * 2,
      channels: 4,
      background: transparent,
    },
  })
    .composite([{ input: frame, left, top }])
    .png()
    .toBuffer();

  return sharp(padded)
    .extract({ left: margin, top: margin, width: frameSize, height: frameSize })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

let waveAnchor = null;

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

for (let row = 0; row < rows; row += 1) {
  for (let column = 0; column < columns; column += 1) {
    const index = row * columns + column;
    const left = Math.max(
      0,
      Math.min(
        info.width - sourceCellSize,
        Math.round(columnCenters[column] - sourceCellSize / 2),
      ),
    );
    const top = Math.max(
      0,
      Math.min(
        info.height - sourceCellSize,
        Math.round(rowCenters[row] - sourceCellSize / 2),
      ),
    );
    let frame = await sharp(inputPath)
      .extract({ left, top, width: sourceCellSize, height: sourceCellSize })
      .resize(frameSize, frameSize, { fit: "fill" })
      .png({ compressionLevel: 9 })
      .toBuffer();

    if (index === 0 && stabilizeCount > 0) waveAnchor = await findWaveAnchor(frame);
    if (index < stabilizeCount) frame = await stabilizeWaveFrame(frame, waveAnchor);

    if (contentScale !== 1) {
      const scaledSize = Math.round(frameSize * contentScale);
      const offset = Math.round((scaledSize - frameSize) / 2);
      frame = await sharp(frame)
        .resize(scaledSize, scaledSize, { fit: "fill" })
        .extract({ left: offset, top: offset, width: frameSize, height: frameSize })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
    const filename = `${framePrefix}-${String(index + 1).padStart(2, "0")}.png`;

    await sharp(frame).toFile(path.join(framesOutputDir, filename));
    composites.push({ input: frame, left: column * frameSize, top: row * frameSize });
  }
}

await sheet.composite(composites).png({ compressionLevel: 9 }).toFile(sheetOutputPath);
