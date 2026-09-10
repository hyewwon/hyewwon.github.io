import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const source=process.argv[3];assert(source,'Provide generated supporting poses');
const out='assets/image/character/pages/desktop/experience-guide';
for(const dir of ['source','sprites','frames-v3'])await mkdir(path.join(out,dir),{recursive:true});
await copyFile(source,path.join(out,'source/frog-experience-support-v3.png'));
const N=384,reference=await sharp('assets/image/character/pages/desktop/skills-guide/frames-v3/frame-skills-jump-v3-16.png').ensureAlpha().raw().toBuffer();
function components(data,w,h){
 const seen=new Uint8Array(w*h),groups=[];
 for(let q=0;q<seen.length;q++){
  if(seen[q]||data[q*4+3]<32)continue;
  const pixels=[],stack=[q];seen[q]=1;
  while(stack.length){const k=stack.pop(),x=k%w,y=Math.floor(k/w);pixels.push(k);
   for(const t of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(t>=0&&!seen[t]&&data[t*4+3]>=32){seen[t]=1;stack.push(t);}
  }groups.push(pixels);
 }return groups.sort((a,b)=>b.length-a.length);
}
const {data:raw,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const poses=[];
for(let i=0;i<4;i++){
 const x0=Math.round(i%2*info.width/2),y0=Math.round(Math.floor(i/2)*info.height/2),w=Math.round((i%2+1)*info.width/2)-x0,h=Math.round((Math.floor(i/2)+1)*info.height/2)-y0;
 const pixels=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=((y+y0)*info.width+x+x0)*4,t=(y*w+x)*4;
  const rgb=[raw[s],raw[s+1],raw[s+2]],bright=Math.max(...rgb),chroma=bright-Math.min(...rgb);
  const alpha=raw[s+3]<255?raw[s+3]:bright<100?255:Math.round(Math.max(0,Math.min(1,(chroma-12)/22))*255);
  for(let c=0;c<3;c++)pixels[t+c]=alpha?rgb[c]:0;pixels[t+3]=alpha;
 }
 // Unmix bright checkerboard edge RGB before resampling; keep actual alpha.
 const keyed=Buffer.from(pixels);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=(y*w+x)*4;if(!keyed[p+3]||keyed[p+3]===255)continue;
  let found=false;
  for(let r=1;r<=4&&!found;r++)for(let dy=-r;dy<=r&&!found;dy++)for(let dx=-r;dx<=r;dx++){
   const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;
   const q=(yy*w+xx)*4;
   if(keyed[q+3]===255&&keyed[q]<110&&keyed[q+1]<125&&keyed[q+2]<70){keyed.copy(pixels,p,q,q+3);found=true;break;}
  }
 }
 // Never allow detached pieces from a neighbouring cell to affect alignment.
 const groups=components(pixels,w,h),keep=new Set(groups[0]);
 for(let k=0;k<w*h;k++)if(!keep.has(k))pixels.fill(0,k*4,k*4+4);
 const cut=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).raw().toBuffer({resolveWithObject:true});
 const scale=258/cut.info.height,rw=Math.round(cut.info.width*scale),rh=258;
 // Register by the original eye/head anchor, NOT overall silhouette width.
 // All four supporting drawings share the same left shoulder and feet.
 const left=91,top=68;
 const patch=await sharp(cut.data,{raw:{width:cut.info.width,height:cut.info.height,channels:4}}).resize(rw,rh).png().toBuffer();
 poses.push(await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:patch,left,top}]).raw().toBuffer());
 await sharp(poses[i],{raw:{width:N,height:N,channels:4}}).png().toFile(path.join(out,'source',`aligned-support-v3-${i}.png`));
}
// Replace only the moving right arm. Every unmasked pixel remains original.
function armMask(x,y){const boundary=y<158?271:y<181?271-(y-158)*1.65:y<195?234:Math.min(246,234+(y-195)*.4);return y>=130&&y<277&&x>=boundary;}
function armPose(pose){const dst=Buffer.from(reference);for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(armMask(x,y)){
 const p=(y*N+x)*4;
 if(y<179)dst.fill(0,p,p+4); // Never import even a sliver of the generated head.
 else pose.copy(dst,p,p,p+4);
}return dst;}
const half=armPose(poses[0]),rest=armPose(poses[1]);
// Original leg pixels move locally below the hip; head and torso are never resized.
function walk(stride){const dst=Buffer.from(rest);for(let y=273;y<N;y++)for(let x=0;x<N;x++){
 const weight=Math.min(1,(y-273)/20),side=x<190?1:-1;
 const sx=Math.round(x-side*stride*6*weight),sy=Math.round(y+Math.max(0,side*stride)*6*weight),p=(y*N+x)*4;
 if(sx>=0&&sx<N&&sy>=0&&sy<N)rest.copy(dst,p,(sy*N+sx)*4,(sy*N+sx)*4+4);else dst.fill(0,p,p+4);
 }return dst;}
// Small relaxed eyelids come from the generated patch; the rest of the face is original.
function blink(level){
 const dst=Buffer.from(rest);
 for(const [cx,cy,rx,ry]of [[168,102,13,15],[234,101,12,15]])for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
  if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue;
  const p=(y*N+x)*4;
  // Sample the generated closed-eye band and register to the original small pupils.
  const gx=Math.round(cx===168?x:x+1),gy=y;
  poses[level].copy(dst,p,(gy*N+gx)*4,(gy*N+gx)*4+4);
 }return dst;
}
const frames=[reference,half,rest,rest,walk(1),walk(.5),walk(-1),walk(-.5),rest,rest,rest,rest,rest,blink(2),blink(2),rest];
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){
 const f=frames[i];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(f[(y*N+x)*4+3]>32)assert(x>8&&x<375&&y>8&&y<375,`frame ${i+1} gutter`);
 const groups=components(f,N,N);assert(groups.filter(g=>g.length>20).length===1,`frame ${i+1} detached fragment`);
 await sharp(f,{raw:{width:N,height:N,channels:4}}).png().toFile(path.join(out,'frames-v3',`frame-experience-v3-${String(i+1).padStart(2,'0')}.png`));
 for(let y=0;y<N;y++)f.copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
}
const output=path.join(out,'sprites/frog-experience-walk-sheet-v3.png');await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*N,top:Math.floor(i/4)*N,width:N,height:N}).raw().toBuffer()).equals(frames[i]));
for(let i=0;i<16;i++)if(i!==13&&i!==14)for(let y=0;y<179;y++)for(let x=0;x<270;x++)if(!armMask(x,y)){const p=(y*N+x)*4;assert(frames[i].subarray(p,p+4).equals(reference.subarray(p,p+4)),'Original face changed');}
assert(frames[0].equals(reference));assert(frames[12].equals(frames[15]));
for(const f of frames)for(let y=179;y<273;y++)for(let x=125;x<234;x++){
 const p=(y*N+x)*4;assert(f.subarray(p,p+4).equals(reference.subarray(p,p+4)),'Central torso changed');
}
for(const i of [13,14])for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const eye=((x-168)/13)**2+((y-102)/15)**2<=1||((x-234)/12)**2+((y-101)/15)**2<=1;
 if(!eye){const p=(y*N+x)*4;assert(frames[i].subarray(p,p+4).equals(rest.subarray(p,p+4)),'Blink moved body or face');}
}
await writeFile(path.join(out,'quality-v3.json'),JSON.stringify({firstFrameExact:true,originalFaceExactOutsideBlinkAndArmMask:true,centralTorsoExact:true,blinkOnlyWithinEyeEllipses:true,singleConnectedCharacter:true,frames:16,cellSize:384},null,2)+'\n');
console.log('PASS: original head pixels, exact handoff, single character per frame, safe gutters, exact atlas packing.');
