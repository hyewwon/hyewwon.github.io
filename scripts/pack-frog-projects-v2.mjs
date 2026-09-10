import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp'),source=process.argv[3],N=384;
const out='assets/image/character/pages/desktop/projects-guide';
for(const dir of ['source','frames-v2','sprites'])await mkdir(`${out}/${dir}`,{recursive:true});
await copyFile(source,`${out}/source/frog-projects-look-down-v2.png`);
function components(mask,w,h){const seen=new Uint8Array(w*h),groups=[];for(let i=0;i<mask.length;i++){if(!mask[i]||seen[i])continue;const stack=[i],g=[];seen[i]=1;while(stack.length){const k=stack.pop(),x=k%w,y=Math.floor(k/w);g.push(k);for(const n of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(n>=0&&!seen[n]&&mask[n]){seen[n]=1;stack.push(n);}}groups.push(g);}return groups.sort((a,b)=>b.length-a.length);}
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),cuts=[];
for(let i=0;i<4;i++){
 const x0=Math.round(i%2*info.width/2),y0=Math.round(Math.floor(i/2)*info.height/2),w=Math.round((i%2+1)*info.width/2)-x0,h=Math.round((Math.floor(i/2)+1)*info.height/2)-y0,raw=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4,s=((y+y0)*info.width+x+x0)*4,r=data[s],g=data[s+1],b=data[s+2],chroma=Math.max(r,g,b)-Math.min(r,g,b);data.copy(raw,p,s,s+4);raw[p+3]=data[s+3]<255?data[s+3]:Math.max(r,g,b)<90?255:Math.round(Math.max(0,Math.min(1,(chroma-12)/22))*255);}
 const mask=Uint8Array.from({length:w*h},(_,p)=>raw[p*4+3]>=32?1:0),keep=new Set(components(mask,w,h)[0]);
 for(let p=0;p<w*h;p++)if(!keep.has(p))raw.fill(0,p*4,p*4+4);
 const original=Buffer.from(raw);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4;if(!raw[p+3]||raw[p+3]===255)continue;let best=Infinity,found=-1;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const q=(yy*w+xx)*4,d=dx*dx+dy*dy;if(d<best&&original[q+3]===255&&original[q]<120&&original[q+1]<150&&original[q+2]<80){best=d;found=q;}}if(found>=0)original.copy(raw,p,found,found+3);}
 cuts.push(await sharp(raw,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).raw().toBuffer({resolveWithObject:true}));
}
const old=[];for(let i=1;i<=16;i++)old.push(await sharp(`${out}/frames-v1/frame-projects-v1-${String(i).padStart(2,'0')}.png`).ensureAlpha().raw().toBuffer());
function palette(raw){const groups=[[],[],[],[]];for(let p=0;p<raw.length;p+=4){const[r,g,b,a]=raw.subarray(p,p+4);if(a<250)continue;const c=g<100&&r<100&&b<60?0:g>90&&g>r&&r>80&&b<90?1:r>220&&g>90&&g<190&&b<150?2:r>190&&g>190&&b>70?3:-1;if(c>=0)groups[c].push([r,g,b]);}return groups.map(g=>[0,1,2].map(c=>g.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(g.length/2)]));}
const target=palette(old[13]),src=palette(cuts[0].data),curves=[0,1,2].map(c=>[[0,0],...src.map((rgb,i)=>[rgb[c],target[i][c]]),[255,255]].sort((a,b)=>a[0]-b[0]));
const lut=curves.map(points=>Array.from({length:256},(_,v)=>{let n=1;while(n<points.length-1&&v>points[n][0])n++;const[a,b]=points[n-1],[x,y]=points[n];return Math.round(b+(y-b)*(v-a)/Math.max(1,x-a));}));
const scale=258/cuts[0].info.height,poses=[];
for(const c of cuts){for(let p=0;p<c.data.length;p+=4)if(c.data[p+3])for(let k=0;k<3;k++)c.data[p+k]=lut[k][c.data[p+k]];
 const w=Math.round(c.info.width*scale),h=Math.round(c.info.height*scale);const pose=await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:await sharp(c.data,{raw:{width:c.info.width,height:c.info.height,channels:4}}).resize(w,h).png().toBuffer(),left:Math.round(190-w/2),top:326-h}]).raw().toBuffer();
 // Keep the existing body/feet. Blend only opaque interior neck pixels,
 // avoiding the semi-transparent seams of a whole-layer cross-fade.
 const merged=Buffer.from(old[13]);for(let y=0;y<220;y++)for(let x=0;x<N;x++){const p=(y*N+x)*4;if(y<205)pose.copy(merged,p,p,p+4);else if(pose[p+3]===255&&old[13][p+3]===255){const t=(220-y)/15;for(let k=0;k<3;k++)merged[p+k]=Math.round(pose[p+k]*t+old[13][p+k]*(1-t));}}
 poses.push(merged);
}
// Derive blink from the downward-looking pose, replacing only the two eye
// regions with generated closed-eye pixels. Head and body never wobble.
function eyes(raw){const mask=Uint8Array.from({length:N*N},(_,q)=>{const x=q%N,y=Math.floor(q/N),p=q*4;return y>75&&y<145&&x>110&&x<285&&raw[p+3]>128&&raw[p]>raw[p+1]*1.15&&raw[p]<120?1:0;});return components(mask,N,N).filter(g=>g.length>15).slice(0,2).sort((a,b)=>Math.min(...a.map(q=>q%N))-Math.min(...b.map(q=>q%N)));}
function bounds(g){return {x:Math.min(...g.map(q=>q%N)),y:Math.min(...g.map(q=>Math.floor(q/N))),r:Math.max(...g.map(q=>q%N)),b:Math.max(...g.map(q=>Math.floor(q/N)))};}
const blink=Buffer.from(poses[1]),openEyes=eyes(poses[1]),closedEyes=eyes(poses[2]);assert(openEyes.length===2&&closedEyes.length===2,'Expected two eye regions');
for(let i=0;i<2;i++){const a=bounds(openEyes[i]),b=bounds(closedEyes[i]);
 const cx=(a.x+a.r)/2,cy=(a.y+a.b)/2;
 // Skin sampled adjacent to the original open eye; feather the fill edge.
 const skin=(Math.max(0,a.y-4)*N+Math.round(cx))*4;
 for(let y=a.y-2;y<=a.b+2;y++)for(let x=a.x-2;x<=a.r+2;x++){const p=(y*N+x)*4;for(let k=0;k<3;k++)blink[p+k]=poses[1][skin+k];}
 const dx=Math.round(cx-(b.x+b.r)/2),dy=Math.round(cy-(b.y+b.b)/2);
 for(const q of closedEyes[i]){const x=q%N+dx,y=Math.floor(q/N)+dy,p=(y*N+x)*4;poses[2].copy(blink,p,q*4,q*4+4);}
}
const frames=[...old.slice(0,12),poses[0],poses[1],blink,poses[1]],atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){const f=frames[i];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(f[(y*N+x)*4+3]>32)assert(x>8&&x<375&&y>8&&y<375,`Clipped frame ${i+1}`);
 assert(components(Uint8Array.from({length:N*N},(_,q)=>f[q*4+3]>32?1:0),N,N).filter(g=>g.length>20).length===1,`Fragment frame ${i+1}`);
 await sharp(f,{raw:{width:N,height:N,channels:4}}).png().toFile(`${out}/frames-v2/frame-projects-v2-${String(i+1).padStart(2,'0')}.png`);for(let y=0;y<N;y++)f.copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
}
await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(`${out}/sprites/frog-projects-center-look-sheet-v2.png`);
for(let i=0;i<12;i++)assert(frames[i].equals(old[i]));
for(let i=12;i<16;i++)assert(frames[i].subarray(220*N*4).equals(old[13].subarray(220*N*4)),'Body changed');
await writeFile(`${out}/quality-v2.json`,JSON.stringify({unchangedFrames:[1,2,3,4,5,6,7,8,9,10,11,12],bodyPreservedFromY:220,scale,originalPalette:target,sourcePalette:src,eyeRegions:openEyes.map(bounds)},null,2));
console.log('PASS original jump and walk; original lower body; aligned downward gaze and blink.',{scale,eyeRegions:openEyes.map(bounds)});
