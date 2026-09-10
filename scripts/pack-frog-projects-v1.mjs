import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const [jumpSource,walkSource,repairSource]=process.argv.slice(3);
assert(jumpSource&&walkSource&&repairSource,'Provide generated jump, walk and repair sources');
const root='assets/image/character/pages/desktop',exp=`${root}/experience-guide`,out=`${root}/projects-guide`,N=384;
for(const d of [`${exp}/frames-v6`,`${out}/source`,`${out}/frames-v1`,`${out}/sprites`,`${out}/previews`])await mkdir(d,{recursive:true});
for(const [s,p]of [[jumpSource,`${out}/source/frog-projects-jump-v1.png`],[walkSource,`${out}/source/frog-projects-walk-v1.png`],[repairSource,`${exp}/source/frog-experience-opacity-repair-v6.png`]])await copyFile(s,p);
function component(raw,w,h){
 const seen=new Uint8Array(w*h),groups=[];
 for(let q=0;q<seen.length;q++){if(seen[q]||raw[q*4+3]<32)continue;const stack=[q],pixels=[];seen[q]=1;
  while(stack.length){const k=stack.pop(),x=k%w,y=Math.floor(k/w);pixels.push(k);for(const t of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(t>=0&&!seen[t]&&raw[t*4+3]>=32){seen[t]=1;stack.push(t);}}
  groups.push(pixels);
 }return groups.sort((a,b)=>b.length-a.length);
}
async function extract(source,cols,rows){
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),cuts=[];
 for(let i=0;i<cols*rows;i++){
  const x0=Math.round(i%cols*info.width/cols),y0=Math.round(Math.floor(i/cols)*info.height/rows),w=Math.round((i%cols+1)*info.width/cols)-x0,h=Math.round((Math.floor(i/cols)+1)*info.height/rows)-y0,raw=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4,s=((y+y0)*info.width+x+x0)*4,r=data[s],g=data[s+1],b=data[s+2],chroma=Math.max(r,g,b)-Math.min(r,g,b);data.copy(raw,p,s,s+4);raw[p+3]=data[s+3]<255?data[s+3]:Math.max(r,g,b)<100?255:Math.round(Math.max(0,Math.min(1,(chroma-12)/22))*255);}
  const keep=new Set(component(raw,w,h)[0]);for(let p=0;p<w*h;p++)if(!keep.has(p))raw.fill(0,p*4,p*4+4);
  // Remove pale generated backdrop from partially covered outline pixels.
  const original=Buffer.from(raw);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4;if(!raw[p+3]||raw[p+3]===255)continue;let best=Infinity,qBest=-1;
   for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const q=(yy*w+xx)*4,d=dx*dx+dy*dy;if(d<best&&original[q+3]===255&&original[q]<120&&original[q+1]<150&&original[q+2]<80){best=d;qBest=q;}}
   if(qBest>=0)original.copy(raw,p,qBest,qBest+3);
  }
  cuts.push(await sharp(raw,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).raw().toBuffer({resolveWithObject:true}));
 }return cuts;
}
const originals=[];for(let i=1;i<=16;i++)originals.push(await sharp(`${exp}/frames-v5/frame-experience-v5-${String(i).padStart(2,'0')}.png`).ensureAlpha().raw().toBuffer());
const repairedCut=(await extract(repairSource,1,1))[0];
const repaired=await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:await sharp(repairedCut.data,{raw:{width:repairedCut.info.width,height:repairedCut.info.height,channels:4}}).resize({height:258}).png().toBuffer(),left:86,top:68}]).raw().toBuffer();
let fixedPixels=0;
function solidify(raw){const dst=Buffer.from(raw);for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){
 const p=(y*N+x)*4;if(!raw[p+3]||raw[p+3]===255)continue;
 let inside=true;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(raw[((y+dy)*N+x+dx)*4+3]<10)inside=false;
 const neck=x>=236&&x<=245&&y>=174&&y<=179&&repaired[p+3]>200;
 if(inside||neck){dst[p+3]=255;fixedPixels++;}
 }return dst;}
const rest=solidify(originals[13]),blink=Buffer.from(rest);
for(let y=82;y<121;y++)for(let x=150;x<250;x++)if(((x-168)/14)**2+((y-102)/16)**2<=1||((x-234)/13)**2+((y-101)/16)**2<=1){const p=(y*N+x)*4;originals[14].copy(blink,p,p,p+4);}
const left=Buffer.alloc(N*N*4);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=380-x;if(sx>=0&&sx<N)rest.copy(left,(y*N+x)*4,(y*N+sx)*4,(y*N+sx)*4+4);}
const experience=[originals[0],originals[1],rest,left,...originals.slice(4,12),left,rest,blink,rest];
async function pack(frames,dir,version,name){
 const atlas=Buffer.alloc(1536*1536*4);for(let i=0;i<16;i++){
  const raw=frames[i];assert(component(raw,N,N).filter(g=>g.length>20).length===1,`Detached part ${name} ${i+1}`);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(raw[(y*N+x)*4+3]>32)assert(x>8&&x<375&&y>8&&y<375,`Clipped ${name} ${i+1}`);
  await sharp(raw,{raw:{width:N,height:N,channels:4}}).png().toFile(`${dir}/frames-v${version}/frame-${name}-v${version}-${String(i+1).padStart(2,'0')}.png`);
  for(let y=0;y<N;y++)raw.copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
 }
 const file=`${dir}/sprites/frog-${name==='experience'?'experience-turn-walk':'projects-climb-walk'}-sheet-v${version}.png`;
 await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(file);
 for(let i=0;i<16;i++)assert((await sharp(file).extract({left:i%4*N,top:Math.floor(i/4)*N,width:N,height:N}).raw().toBuffer()).equals(frames[i]));
}
await pack(experience,exp,6,'experience');
function palette(raw){const groups=[[],[],[],[]];for(let p=0;p<raw.length;p+=4){const[r,g,b,a]=raw.subarray(p,p+4);if(a<250)continue;const c=g<100&&r<100&&b<60?0:g>90&&g>r&&r>80&&b<90?1:r>220&&g>90&&g<190&&b<150?2:r>190&&g>190&&b>70?3:-1;if(c>=0)groups[c].push([r,g,b]);}return groups.map(group=>[0,1,2].map(c=>group.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(group.length/2)]));}
function headWidth(cut){let l=Infinity,r=0;for(let y=0;y<cut.info.height*.42;y++)for(let x=0;x<cut.info.width;x++)if(cut.data[(y*cut.info.width+x)*4+3]>128){l=Math.min(l,x);r=Math.max(r,x);}return r-l+1;}
const jump=await extract(jumpSource,4,3),walk=await extract(walkSource,3,2),targetPalette=palette(rest);
async function poses(cuts,baseScale){
 const src=palette(cuts[0].data),curves=[0,1,2].map(c=>[[0,0],...src.map((rgb,i)=>[rgb[c],targetPalette[i][c]]),[255,255]].sort((a,b)=>a[0]-b[0]));
 const lut=curves.map(points=>Array.from({length:256},(_,v)=>{let n=1;while(n<points.length-1&&v>points[n][0])n++;const[a,b]=points[n-1],[x,y]=points[n];return Math.round(b+(y-b)*(v-a)/Math.max(1,x-a));}));
 const frames=[];for(const c of cuts){for(let p=0;p<c.data.length;p+=4)if(c.data[p+3])for(let k=0;k<3;k++)c.data[p+k]=lut[k][c.data[p+k]];
  const w=Math.round(c.info.width*baseScale),h=Math.round(c.info.height*baseScale),left=Math.round((N-w)/2),top=326-h;
  assert(w<360&&top>8,'Art exceeds safe cell');const png=await sharp(c.data,{raw:{width:c.info.width,height:c.info.height,channels:4}}).resize(w,h).png().toBuffer();
  frames.push(await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:png,left,top}]).raw().toBuffer());
 }return frames;
}
const jumpScale=258/jump[0].info.height,walkScale=258/walk[0].info.height;
const jp=await poses(jump,jumpScale),wp=await poses(walk,walkScale);
const frames=[rest,jp[1],jp[2],jp[3],jp[4],jp[5],jp[6],rest,wp[0],wp[1],wp[3],wp[4],jp[7],rest,blink,rest];
await pack(frames,out,1,'projects');
for(let i=4;i<12;i++)assert(experience[i].equals(originals[i]),'Approved Experience walk changed');
assert(frames[0].equals(experience[15]),'Experience handoff mismatch');
for(let p=0;p<rest.length;p+=4)assert(rest.subarray(p,p+3).equals(originals[13].subarray(p,p+3)),'Original color changed');
await writeFile(`${exp}/quality-v6.json`,JSON.stringify({fixedPixels,rgbPreserved:true,rearWalkUnchanged:true,restAndBlinkSameContour:true},null,2));
await writeFile(`${out}/motion-v1.json`,JSON.stringify({version:1,grid:{columns:4,rows:4,frameSize:N},footBaseline:326,phases:{handoff:[1],crouch:[2,3],jump:[4,5,6],land:[7,8],walkLoop:[9,10,11,12],settle:[13,14],blink:[15,14]},timings:{handoffMs:240,crouchMs:360,jumpMs:900,landMs:300,walkFrameMs:140},exactExperienceHandoff:true,jumpScale,walkScale},null,2));
console.log('PASS', {fixedPixels,exactExperienceHandoff:true,jumpScale,walkScale,frames:16});
