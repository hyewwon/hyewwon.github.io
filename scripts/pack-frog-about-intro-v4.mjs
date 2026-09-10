import { mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const source = 'assets/image/character/pages/splash/seamless-entry/frames-v12';
const out = 'assets/image/character/pages/desktop/about-guide';
const shared = 'assets/image/character/shared/guide';
const cell = 384, sourceSize = 320, padding = 32;
const poses = [[1,0],[1,3],[1,6],[1,9],[1,9],[1,6],[1,3],[1,0],
  [2,0],[3,0],[2,0],[3,0],[2,0],[1,0],[1,0],[1,0]];
const originals = new Map();
for (const n of [1,2,3]) {
  const {data,info} = await sharp(path.join(source, `frame-seamless-v12-${String(n).padStart(2,'0')}.png`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width, sourceSize); assert.equal(info.height, sourceSize);
  originals.set(n, data);
}
for (const dir of [path.join(out,'sprites'),path.join(out,'frames-v4'),shared]) await mkdir(dir,{recursive:true});
const frames = [];
for (let i=0;i<poses.length;i++) {
  const [pose,degrees] = poses[i], original = originals.get(pose);
  const data = Buffer.alloc(cell*cell*4);
  // Rigid rotation only: never squash, stretch, recolor or redraw the source.
  // Nearest-neighbor sampling retains original RGBA values (including edges).
  const angle=degrees*Math.PI/180, cos=Math.cos(angle), sin=Math.sin(angle);
  const pivotX=176, pivotY=294;
  for(let y=0;y<cell;y++) for(let x=0;x<cell;x++) {
    const dx=x-padding-pivotX, dy=y-padding-pivotY;
    const sx=Math.round(cos*dx+sin*dy+pivotX), sy=Math.round(-sin*dx+cos*dy+pivotY);
    if(sx>=0&&sx<sourceSize&&sy>=0&&sy<sourceSize) original.copy(data,(y*cell+x)*4,(sy*sourceSize+sx)*4,(sy*sourceSize+sx)*4+4);
  }
  // Safety gutter: all opaque artwork remains clear of cell boundaries.
  for(let y=0;y<cell;y++) for(let x=0;x<cell;x++) {
    if(data[(y*cell+x)*4+3]) assert(x>8&&x<cell-9&&y>8&&y<cell-9,`Clipped pose ${i+1}`);
  }
  frames.push(data);
  await sharp(data,{raw:{width:cell,height:cell,channels:4}}).png().toFile(path.join(out,'frames-v4',`frame-about-v4-${String(i+1).padStart(2,'0')}.png`));
}
assert(frames[0].equals(frames.at(-1)), 'Start/end pose mismatch');
const width=cell*4, height=cell*4, atlas=Buffer.alloc(width*height*4);
for(let i=0;i<frames.length;i++) for(let y=0;y<cell;y++) {
  frames[i].copy(atlas,((Math.floor(i/4)*cell+y)*width+(i%4)*cell)*4,y*cell*4,(y+1)*cell*4);
}
const output=path.join(out,'sprites/frog-about-intro-sheet-v4.png');
await sharp(atlas,{raw:{width,height,channels:4}}).png().toFile(output);
await copyFile(path.join(out,'frames-v4/frame-about-v4-16.png'),path.join(shared,'frog-guide-neutral-v1.png'));
for(let i=0;i<frames.length;i++) {
  const decoded=await sharp(output).extract({left:(i%4)*cell,top:Math.floor(i/4)*cell,width:cell,height:cell}).ensureAlpha().raw().toBuffer();
  assert(decoded.equals(frames[i]),`Atlas mismatch ${i+1}`);
  if(poses[i][1]===0) {
    const inner=await sharp(decoded,{raw:{width:cell,height:cell,channels:4}}).extract({left:padding,top:padding,width:sourceSize,height:sourceSize}).raw().toBuffer();
    assert(inner.equals(originals.get(poses[i][0])),`Original pose changed ${i+1}`);
  }
}
console.log(JSON.stringify({output,width,height,frames:16,hasAlpha:(await sharp(output).metadata()).hasAlpha,clipping:false,startEndIdentical:true,unrotatedPosesExactRGBA:true},null,2));
