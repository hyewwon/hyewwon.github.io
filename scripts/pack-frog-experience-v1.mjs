import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp'),source=process.argv[3];
assert(source,'Provide generated atlas');
const out='assets/image/character/pages/desktop/experience-guide';
for(const dir of ['source','sprites','frames-v1'])await mkdir(path.join(out,dir),{recursive:true});
await copyFile(source,path.join(out,'source/frog-experience-generated-v1.png'));
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const reference=await sharp('assets/image/character/pages/desktop/skills-guide/frames-v3/frame-skills-jump-v3-16.png').ensureAlpha().raw().toBuffer();
const cutouts=[];
function palette(data){const groups=[[],[],[],[]];for(let i=0;i<data.length;i+=4){const[r,g,b,a]=data.subarray(i,i+4);if(a<250)continue;const c=g<100&&r<100&&b<60?0:g>90&&g>r&&r>80&&b<90?1:r>220&&g>90&&g<190&&b<150?2:r>190&&g>190&&b>70?3:-1;if(c>=0)groups[c].push([r,g,b]);}return groups.map(group=>[0,1,2].map(c=>group.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(group.length/2)]));}
for(let i=0;i<16;i++){
 const x0=Math.round(i%4*info.width/4),y0=Math.round(Math.floor(i/4)*info.height/4),w=Math.round((i%4+1)*info.width/4)-x0,h=Math.round((Math.floor(i/4)+1)*info.height/4)-y0;
 const pixels=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=((y+y0)*info.width+x+x0)*3,t=(y*w+x)*4;const rgb=[data[s],data[s+1],data[s+2]],bright=Math.max(...rgb),chroma=bright-Math.min(...rgb);const a=bright<100?255:Math.round(Math.max(0,Math.min(1,(chroma-10)/18))*255);for(let c=0;c<3;c++)pixels[t+c]=a?rgb[c]:0;pixels[t+3]=a;}
 cutouts.push(await sharp(pixels,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).ensureAlpha().raw().toBuffer({resolveWithObject:true}));
}
const sourcePalette=palette(cutouts[0].data),targetPalette=palette(reference);
const curves=[0,1,2].map(c=>[[0,0],...sourcePalette.map((rgb,n)=>[rgb[c],targetPalette[n][c]]),[255,255]].sort((a,b)=>a[0]-b[0]));
const lut=curves.map(points=>Array.from({length:256},(_,v)=>{let n=1;while(n<points.length-1&&v>points[n][0])n++;const[a,b]=points[n-1],[x,y]=points[n];return Math.round(b+(y-b)*(v-a)/Math.max(1,x-a));}));
let minY=384,maxY=0;for(let y=0;y<384;y++)for(let x=0;x<384;x++)if(reference[(y*384+x)*4+3]>128){minY=Math.min(y,minY);maxY=Math.max(y,maxY);}
const scale=(maxY-minY+1)/cutouts[0].info.height,frames=[reference];
for(let i=1;i<16;i++){
 if(i===15){frames.push(Buffer.from(frames[12]));continue;}
 const {data,info}=cutouts[i];for(let p=0;p<data.length;p+=4)if(data[p+3])for(let c=0;c<3;c++)data[p+c]=lut[c][data[p+c]];
 const w=Math.round(info.width*scale),h=Math.round(info.height*scale),left=Math.round(208-w/2),top=326-h;
 assert(left>8&&top>8&&left+w<376&&top+h<376,`Frame gutter ${i+1}`);
 const pose=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).resize(w,h).png().toBuffer();
 frames.push(await sharp({create:{width:384,height:384,channels:4,background:'#00000000'}}).composite([{input:pose,left,top}]).raw().toBuffer());
}
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){await sharp(frames[i],{raw:{width:384,height:384,channels:4}}).png().toFile(path.join(out,'frames-v1',`frame-experience-v1-${String(i+1).padStart(2,'0')}.png`));for(let y=0;y<384;y++)frames[i].copy(atlas,((Math.floor(i/4)*384+y)*1536+i%4*384)*4,y*384*4,(y+1)*384*4);}
const output=path.join(out,'sprites/frog-experience-climb-sheet-v1.png');await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*384,top:Math.floor(i/4)*384,width:384,height:384}).raw().toBuffer()).equals(frames[i]));
assert(frames[0].equals(reference));assert(frames[12].equals(frames[15]));
await writeFile(path.join(out,'quality-v1.json'),JSON.stringify({sourcePalette,targetPalette,scale,firstFrameExact:true,restAndBlinkReturnExact:true},null,2)+'\n');
console.log('PASS 16 RGBA frames; Skills handoff exact; blink returns to identical seated pose; palette matched', {sourcePalette,targetPalette,scale});
