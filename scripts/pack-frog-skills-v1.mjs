import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const root='assets/image/character',out=path.join(root,'pages/desktop/skills-guide');
const neutral=await sharp(path.join(root,'shared/guide/frog-guide-neutral-v1.png')).ensureAlpha().raw().toBuffer();
const palm=await sharp(path.join(root,'pages/desktop/about-guide/frames-v4/frame-about-v4-09.png')).ensureAlpha().raw().toBuffer();
const size=384,atlasSize=1536;
// Existing artwork only. Small ankle shifts and rigid lean; no facial redraw.
const poses=[['neutral',0,0],['neutral',1,0],['neutral',2,1],['neutral',0,0],
 ['neutral',-2,-1],['neutral',0,0],['neutral',2,1],['neutral',0,0],
 ['neutral',-2,0],['palm',-2,0],['palm',-4,0],['palm',-4,0],
 ['palm',-2,0],['palm',0,0],['neutral',0,0],['neutral',0,0]];
await mkdir(path.join(out,'sprites'),{recursive:true});await mkdir(path.join(out,'frames-v1'),{recursive:true});
const frames=[];
for(let i=0;i<poses.length;i++){
 const [kind,angle,stride]=poses[i],src=kind==='palm'?palm:neutral,data=Buffer.alloc(size*size*4);
 const c=Math.cos(angle*Math.PI/180),s=Math.sin(angle*Math.PI/180);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let sx=c*(x-208)+s*(y-326)+208,sy=-s*(x-208)+c*(y-326)+326;
  if(stride&&sy>274){
   const weight=Math.min(1,(sy-274)/18),side=sx<208?1:-1;
   sx-=side*stride*4*weight;
   sy+=Math.max(0,side*stride)*4*weight;
  }
  sx=Math.round(sx);sy=Math.round(sy);
  if(sx>=0&&sy>=0&&sx<size&&sy<size)src.copy(data,(y*size+x)*4,(sy*size+sx)*4,(sy*size+sx)*4+4);
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(data[(y*size+x)*4+3])assert(x>8&&x<size-9&&y>8&&y<size-9,`Clipped frame ${i+1}`);
 frames.push(data);
 await sharp(data,{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(out,'frames-v1',`frame-skills-v1-${String(i+1).padStart(2,'0')}.png`));
}
assert(frames[0].equals(neutral)&&frames[15].equals(neutral),'Shared neutral changed');
const atlas=Buffer.alloc(atlasSize*atlasSize*4);
for(let i=0;i<16;i++)for(let y=0;y<size;y++)frames[i].copy(atlas,((Math.floor(i/4)*size+y)*atlasSize+(i%4)*size)*4,y*size*4,(y+1)*size*4);
const output=path.join(out,'sprites/frog-skills-guide-sheet-v1.png');
await sharp(atlas,{raw:{width:atlasSize,height:atlasSize,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:(i%4)*size,top:Math.floor(i/4)*size,width:size,height:size}).ensureAlpha().raw().toBuffer()).equals(frames[i]));
assert((await sharp(output).metadata()).hasAlpha);
console.log('PASS: Skills 16-cell RGBA atlas, safe margins, packed pixels, first/last identical to About handoff.');
