import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp'),source=process.argv[3];
assert(source,'Provide local repair source');
const out='assets/image/character/pages/desktop/experience-guide',N=384;
for(const d of ['source','frames-v5','sprites'])await mkdir(path.join(out,d),{recursive:true});
await copyFile(source,path.join(out,'source/frog-experience-contour-repair-v5.png'));
const frames=[];for(let n=1;n<=16;n++)frames.push(await sharp(path.join(out,'frames-v4',`frame-experience-v4-${String(n).padStart(2,'0')}.png`)).ensureAlpha().raw().toBuffer());
// Only the generated neck/arm patch will be used. Keep original face/body pixels.
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let p=0;p<data.length;p+=4){const rgb=[data[p],data[p+1],data[p+2]],v=Math.max(...rgb),chroma=v-Math.min(...rgb);if(data[p+3]===255)data[p+3]=v<100?255:Math.round(Math.max(0,Math.min(1,(chroma-12)/22))*255);if(!data[p+3])data.fill(0,p,p+4);}
const cut=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).trim({background:'#00000000',threshold:1}).raw().toBuffer({resolveWithObject:true});
const scale=258/cut.info.height,w=Math.round(cut.info.width*scale);
const repaired=await sharp(cut.data,{raw:{width:cut.info.width,height:cut.info.height,channels:4}}).resize(w,258).png().toBuffer();
const patch=await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:repaired,left:86,top:68}]).raw().toBuffer();
// Match the local repair's solid skin and outline to the original before blending.
function medianSkin(raw,x0,x1,y0,y1){const channels=[[],[],[]];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const p=(y*N+x)*4;if(raw[p+3]<250||raw[p+1]<140||raw[p]>210||raw[p+2]>80)continue;for(let c=0;c<3;c++)channels[c].push(raw[p+c]);}return channels.map(a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)]);}
const oldSkin=medianSkin(frames[13],220,244,188,220),newSkin=medianSkin(patch,220,244,188,220);
for(let p=0;p<patch.length;p+=4)if(patch[p+3]){const weight=Math.max(0,Math.min(1,(patch[p+1]-95)/60));for(let c=0;c<3;c++)patch[p+c]=Math.max(0,Math.min(255,Math.round(patch[p+c]+(oldSkin[c]-newSkin[c])*weight)));}
const clamp=v=>Math.max(0,Math.min(1,v));
function neckRepair(original){const dst=Buffer.from(original);for(let y=174;y<294;y++)for(let x=230;x<298;x++){
 const p=(y*N+x)*4,t=clamp((x-230)/7)*clamp((y-174)/8)*clamp((294-y)/14),a=original[p+3]/255,b=patch[p+3]/255,alpha=a*(1-t)+b*t;
 for(let c=0;c<3;c++)dst[p+c]=alpha?Math.round((original[p+c]*a*(1-t)+patch[p+c]*b*t)/alpha):0;dst[p+3]=Math.round(alpha*255);
}return dst;}
async function cleanEdge(original){
 const a=await sharp(original,{raw:{width:N,height:N,channels:4}}).extractChannel(3).blur(.65).raw().toBuffer();
 const dst=Buffer.from(original);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const p=(y*N+x)*4,v=a[y*N+x];if(original[p+3]===255&&v>=254)continue;
  const alpha=Math.round(clamp((v-36)/190)*255);dst[p+3]=alpha;
  if(!alpha){dst.fill(0,p,p+4);continue;}
  let chosen=-1,best=Infinity;
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
   const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=N||yy>=N)continue;const q=(yy*N+xx)*4,d=dx*dx+dy*dy;
   if(d<best&&original[q+3]>=250&&original[q]<120&&original[q+1]<145&&original[q+2]<80){chosen=q;best=d;}
  }
  if(chosen>=0)original.copy(dst,p,chosen,chosen+3);
 }return dst;
}
const point=await cleanEdge(frames[0]),half=await cleanEdge(frames[1]),rest=await cleanEdge(neckRepair(frames[13]));
const blink=Buffer.from(rest);for(let y=82;y<121;y++)for(let x=150;x<250;x++){
 const eyeA=((x-168)/14)**2+((y-102)/16)**2<=1,eyeB=((x-234)/13)**2+((y-101)/16)**2<=1;
 if(eyeA||eyeB){const p=(y*N+x)*4;frames[14].copy(blink,p,p,p+4);}
}
const left=Buffer.alloc(N*N*4);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=380-x;if(sx>=0&&sx<N)rest.copy(left,(y*N+x)*4,(y*N+sx)*4,(y*N+sx)*4+4);}
const outputFrames=[point,half,rest,left,...frames.slice(4,12),left,rest,blink,rest];
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){
 const f=outputFrames[i];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(f[(y*N+x)*4+3]>32)assert(x>8&&x<375&&y>8&&y<375,`frame ${i+1} clipped`);
 await sharp(f,{raw:{width:N,height:N,channels:4}}).png().toFile(path.join(out,'frames-v5',`frame-experience-v5-${String(i+1).padStart(2,'0')}.png`));
 for(let y=0;y<N;y++)f.copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
}
const output=path.join(out,'sprites/frog-experience-turn-walk-sheet-v5.png');await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=4;i<12;i++)assert(outputFrames[i].equals(frames[i]),'Approved rear/profile/walk changed');
for(const i of [0,1,2,13,15])for(let y=90;y<155;y++)for(let x=154;x<245;x++){const p=(y*N+x)*4;assert(outputFrames[i].subarray(p,p+4).equals(frames[i].subarray(p,p+4)),`Facial details changed: frame ${i+1}, ${x},${y}`);}
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*N,top:Math.floor(i/4)*N,width:N,height:N}).raw().toBuffer()).equals(outputFrames[i]));
await writeFile(path.join(out,'quality-v5.json'),JSON.stringify({unchangedFramesOneBased:[5,6,7,8,9,10,11,12],faceDetailsPreserved:true,localRepairBox:[230,174,298,294],oldSkin,newSkin,frameCount:16,cellSize:N},null,2)+'\n');
console.log('PASS original face details; rear/profile/walk frames pixel-identical; safe borders; exact atlas cells.',{oldSkin,newSkin});
