import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp'),source=process.argv[3];
assert(source,'Provide rear-walk source');
const out='assets/image/character/pages/desktop/experience-guide',N=384;
for(const dir of ['source','sprites','frames-v4'])await mkdir(path.join(out,dir),{recursive:true});
await copyFile(source,path.join(out,'source/frog-experience-rear-walk-v4.png'));
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

const readFrame=n=>sharp(path.join(out,'frames-v3',`frame-experience-v3-${String(n).padStart(2,'0')}.png`)).ensureAlpha().raw().toBuffer();
const point=await readFrame(1),half=await readFrame(2),rest=await readFrame(13),blink=await readFrame(14);
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cutouts=[];
for(let i=0;i<8;i++){
 const x0=Math.round(i%4*info.width/4),y0=Math.round(Math.floor(i/4)*info.height/2),w=Math.round((i%4+1)*info.width/4)-x0,h=Math.round((Math.floor(i/4)+1)*info.height/2)-y0;
 const rgba=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=((y+y0)*info.width+x+x0)*4,p=(y*w+x)*4,rgb=[data[s],data[s+1],data[s+2]],max=Math.max(...rgb),chroma=max-Math.min(...rgb);
  const a=data[s+3]<255?data[s+3]:max<100?255:Math.round(Math.max(0,Math.min(1,(chroma-12)/22))*255);
  for(let c=0;c<3;c++)rgba[p+c]=a?rgb[c]:0;rgba[p+3]=a;
 }
 const keep=new Set(components(rgba,w,h)[0]);
 for(let p=0;p<w*h;p++)if(!keep.has(p))rgba.fill(0,p*4,p*4+4);
 // Transparent edge color must not retain pale checkerboard contamination.
 const original=Buffer.from(rgba);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=(y*w+x)*4;if(!rgba[p+3]||rgba[p+3]===255)continue;let found=false;
  for(let r=1;r<=4&&!found;r++)for(let dy=-r;dy<=r&&!found;dy++)for(let dx=-r;dx<=r;dx++){
   const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const q=(yy*w+xx)*4;
   if(original[q+3]===255&&original[q]<110&&original[q+1]<125&&original[q+2]<70){original.copy(rgba,p,q,q+3);found=true;break;}
  }
 }
 cutouts.push(await sharp(rgba,{raw:{width:w,height:h,channels:4}}).trim({background:'#00000000',threshold:1}).raw().toBuffer({resolveWithObject:true}));
}
function palette(raw){const groups=[[],[],[],[]];for(let p=0;p<raw.length;p+=4){const[r,g,b,a]=raw.subarray(p,p+4);if(a<250)continue;const c=g<100&&r<100&&b<60?0:g>90&&g>r&&r>80&&b<90?1:r>220&&g>90&&g<190&&b<150?2:r>190&&g>190&&b>70?3:-1;if(c>=0)groups[c].push([r,g,b]);}return groups.map(group=>[0,1,2].map(c=>group.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(group.length/2)]));}
const sourcePalette=palette(cutouts[0].data),targetPalette=palette(rest);
const curves=[0,1,2].map(c=>[[0,0],...sourcePalette.map((rgb,i)=>[rgb[c],targetPalette[i][c]]),[255,255]].sort((a,b)=>a[0]-b[0]));
const lut=curves.map(points=>Array.from({length:256},(_,v)=>{let n=1;while(n<points.length-1&&v>points[n][0])n++;const[a,b]=points[n-1],[x,y]=points[n];return Math.round(b+(y-b)*(v-a)/Math.max(1,x-a));}));
const scale=258/cutouts[2].info.height,poses=[];
for(const cut of cutouts){
 const raw=cut.data;for(let p=0;p<raw.length;p+=4)if(raw[p+3])for(let c=0;c<3;c++)raw[p+c]=lut[c][raw[p+c]];
 let headLeft=999,headRight=0;for(let y=0;y<Math.floor(cut.info.height*.42);y++)for(let x=0;x<cut.info.width;x++)if(raw[(y*cut.info.width+x)*4+3]>128){headLeft=Math.min(headLeft,x);headRight=Math.max(headRight,x);}
 const w=Math.round(cut.info.width*scale),h=Math.round(cut.info.height*scale),left=Math.round(190-(headLeft+headRight)/2*scale),top=326-h;
 assert(left>8&&top>8&&left+w<376&&top+h<376,'Safe padding');
 const png=await sharp(raw,{raw:{width:cut.info.width,height:cut.info.height,channels:4}}).resize(w,h).png().toBuffer();
 poses.push(await sharp({create:{width:N,height:N,channels:4,background:'#00000000'}}).composite([{input:png,left,top}]).raw().toBuffer());
}
// The front turn preserves the established face, palette and small eyes.
const frontLeft=Buffer.alloc(N*N*4);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=380-x;if(sx>=0&&sx<N)rest.copy(frontLeft,(y*N+x)*4,(y*N+sx)*4,(y*N+sx)*4+4);}
const frames=[point,half,rest,frontLeft,poses[1],poses[2],poses[3],poses[4],poses[5],poses[6],poses[2],poses[1],frontLeft,rest,blink,rest];
const atlas=Buffer.alloc(1536*1536*4);
for(let i=0;i<16;i++){
 const f=frames[i];assert(components(f,N,N).filter(g=>g.length>20).length===1,`frame ${i+1} detached piece`);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(f[(y*N+x)*4+3]>32)assert(x>8&&x<375&&y>8&&y<375,`frame ${i+1} edge clipping`);
 await sharp(f,{raw:{width:N,height:N,channels:4}}).png().toFile(path.join(out,'frames-v4',`frame-experience-v4-${String(i+1).padStart(2,'0')}.png`));
 for(let y=0;y<N;y++)f.copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
}
const output=path.join(out,'sprites/frog-experience-turn-walk-sheet-v4.png');
await sharp(atlas,{raw:{width:1536,height:1536,channels:4}}).png().toFile(output);
for(let i=0;i<16;i++)assert((await sharp(output).extract({left:i%4*N,top:Math.floor(i/4)*N,width:N,height:N}).raw().toBuffer()).equals(frames[i]));
assert(frames[0].equals(point)&&frames[13].equals(rest)&&frames[15].equals(rest));
await writeFile(path.join(out,'quality-v4.json'),JSON.stringify({sourcePalette,targetPalette,scale,exactStartAndRest:true,singleConnectedCharacter:true,frames:16,cellSize:384},null,2)+'\n');
console.log('PASS rear turn/walk atlas: exact front anchors, palette registration, uniform scale, no fragments, safe borders.',{sourcePalette,targetPalette,scale});
