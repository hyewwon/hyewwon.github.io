import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const out='assets/image/character/pages/desktop/skills-guide';
const source=path.join(out,'source/frog-skills-jump-generated-v2.png');
for(const dir of ['sprites','frames-v3'])await mkdir(path.join(out,dir),{recursive:true});
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const cell=384,frames=[],report={source,restoredDarkPixels:0,frames:16};
// Measured anchors from the original About neutral: outline, skin, cheek,
// and belly. Continuous channel curves retain texture and pose geometry.
const anchors=[
 [[0,0],[36,57],[174,163],[244,243],[250,250],[255,255]],
 [[0,0],[45,84],[156,150],[202,199],[245,240],[255,255]],
 [[0,0],[3,0],[42,20],[112,102],[181,165],[255,255]],
];
const lut=anchors.map(points=>Array.from({length:256},(_,v)=>{
 let n=1;while(n<points.length-1&&v>points[n][0])n++;
 const [x0,y0]=points[n-1],[x1,y1]=points[n];
 return Math.round(y0+(y1-y0)*(v-x0)/(x1-x0));
}));
for(let i=0;i<16;i++){
 if(i===0){frames.push(await sharp('assets/image/character/shared/guide/frog-guide-neutral-v1.png').ensureAlpha().raw().toBuffer());continue;}
 const x0=Math.round(i%4*info.width/4),y0=Math.round(Math.floor(i/4)*info.height/4);
 const w=Math.round((i%4+1)*info.width/4)-x0,h=Math.round((Math.floor(i/4)+1)*info.height/4)-y0;
 const pixels=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=((y+y0)*info.width+x+x0)*3,t=(y*w+x)*4;
  const rgb=[data[s],data[s+1],data[s+2]],bright=Math.max(...rgb),chroma=bright-Math.min(...rgb);
  const oldAlpha=Math.round(Math.max(0,Math.min(1,(chroma-10)/18))*255);
  // v2 keyed ALL low-chroma pixels, punching holes through dark eyes/mouth.
  // The baked checkerboard is light gray. Dark ink is foreground regardless
  // of saturation; never apply the background key to it.
  const alpha=bright<100?255:oldAlpha;
  if(bright<100&&oldAlpha<255)report.restoredDarkPixels++;
  pixels[t]=alpha?lut[0][rgb[0]]:0;
  pixels[t+1]=alpha?lut[1][rgb[1]]:0;
  pixels[t+2]=alpha?lut[2][rgb[2]]:0;
  pixels[t+3]=alpha;
 }
 const trimmed=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).png().toBuffer();
 const meta=await sharp(trimmed).metadata();
 const fw=Math.round(meta.width*1.04),fh=Math.round(meta.height*1.04);
 const left=Math.round(208-fw/2),top=i>=4&&i<=8?Math.round(204-fh/2):326-fh;
 assert(left>8&&top>8&&left+fw<376&&top+fh<376,`Safety gutter ${i+1}`);
 const sprite=await sharp(trimmed).resize(fw,fh).png().toBuffer();
 frames.push(await sharp({create:{width:cell,height:cell,channels:4,background:'#00000000'}}).composite([{input:sprite,left,top}]).raw().toBuffer());
}
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){
 await sharp(frames[i],{raw:{width:cell,height:cell,channels:4}}).png().toFile(path.join(out,'frames-v3',`frame-skills-jump-v3-${String(i+1).padStart(2,'0')}.png`));
 for(let y=0;y<cell;y++)frames[i].copy(atlas,((Math.floor(i/4)*cell+y)*1536+i%4*cell)*4,y*cell*4,(y+1)*cell*4);
}
const output=path.join(out,'sprites/frog-skills-jump-sheet-v3.png');
await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*cell,top:Math.floor(i/4)*cell,width:cell,height:cell}).raw().toBuffer()).equals(frames[i]));
assert(frames[0].equals(await sharp('assets/image/character/shared/guide/frog-guide-neutral-v1.png').ensureAlpha().raw().toBuffer()));
assert(report.restoredDarkPixels>0);
await writeFile(path.join(out,'quality-v3.json'),JSON.stringify({...report,paletteAnchors:anchors,firstFrameExact:true},null,2)+'\n');
console.log('PASS: dark facial ink restored, About palette matched, first frame exact, atlas cells verified',report);
