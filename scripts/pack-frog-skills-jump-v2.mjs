import {mkdir,copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const source=process.argv[3];
assert(source,'Provide the generated atlas path');
const out='assets/image/character/pages/desktop/skills-guide';
for(const dir of ['source','sprites','frames-v2'])await mkdir(path.join(out,dir),{recursive:true});
await copyFile(source,path.join(out,'source/frog-skills-jump-generated-v2.png'));
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const cell=384,frames=[];
for(let i=0;i<16;i++){
 if(i===0){frames.push(await sharp('assets/image/character/shared/guide/frog-guide-neutral-v1.png').ensureAlpha().raw().toBuffer());continue;}
 const x0=Math.round(i%4*info.width/4),y0=Math.round(Math.floor(i/4)*info.height/4);
 const w=Math.round((i%4+1)*info.width/4)-x0,h=Math.round((Math.floor(i/4)+1)*info.height/4)-y0;
 const pixels=Buffer.alloc(w*h*4);
 // Production extraction: the generator baked neutral checkerboard pixels
 // into RGB. Remove only near-gray background, retaining chromatic artwork.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=((y+y0)*info.width+x+x0)*3,t=(y*w+x)*4;
  const rgb=[data[s],data[s+1],data[s+2]],chroma=Math.max(...rgb)-Math.min(...rgb);
  pixels[t]=rgb[0];pixels[t+1]=rgb[1];pixels[t+2]=rgb[2];
  pixels[t+3]=Math.round(Math.max(0,Math.min(1,(chroma-10)/18))*255);
 }
 const trimmed=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).png().toBuffer();
 const meta=await sharp(trimmed).metadata();
 // One scale for every pose: no frame-wise stretching or face rescaling.
 const fw=Math.round(meta.width*1.04),fh=Math.round(meta.height*1.04);
 const left=Math.round(208-fw/2),top=i>=4&&i<=8?Math.round(204-fh/2):326-fh;
 assert(left>8&&top>8&&left+fw<376&&top+fh<376,`Safety gutter ${i+1}`);
 const sprite=await sharp(trimmed).resize(fw,fh).png().toBuffer();
 frames.push(await sharp({create:{width:cell,height:cell,channels:4,background:'#00000000'}}).composite([{input:sprite,left,top}]).raw().toBuffer());
}
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){
 await sharp(frames[i],{raw:{width:cell,height:cell,channels:4}}).png().toFile(path.join(out,'frames-v2',`frame-skills-jump-v2-${String(i+1).padStart(2,'0')}.png`));
 for(let y=0;y<cell;y++)frames[i].copy(atlas,((Math.floor(i/4)*cell+y)*1536+i%4*cell)*4,y*cell*4,(y+1)*cell*4);
}
const output=path.join(out,'sprites/frog-skills-jump-sheet-v2.png');
await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*cell,top:Math.floor(i/4)*cell,width:cell,height:cell}).raw().toBuffer()).equals(frames[i]));
assert(frames[0].equals(await sharp('assets/image/character/shared/guide/frog-guide-neutral-v1.png').ensureAlpha().raw().toBuffer()));
console.log('PASS 16 RGBA cells, safe gutters, exact About neutral handoff, atlas pixel checks');
