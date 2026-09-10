import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp'), source = process.argv[3];
const root = 'assets/image/character/pages/desktop', out = `${root}/guide-polish-v1`, N = 384;
const inputs = {
  about: 'about-guide/frames-v4/frame-about-v4-', skills: 'skills-guide/frames-v3/frame-skills-jump-v3-',
  experience: 'experience-guide/frames-v6/frame-experience-v6-', projects: 'projects-guide/frames-v4/frame-projects-v4-',
};
await mkdir(out, { recursive: true }); await copyFile(source, `${out}/blink-source.png`);
const clamp = v => Math.max(0, Math.min(1, v)), sets = {}, report = {};
async function contour(raw) {
  const result = Buffer.from(raw), alpha = await sharp(raw, { raw: { width: N, height: N, channels: 4 } }).extractChannel(3).blur(.55).raw().toBuffer();
  for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) {
    const p = (y * N + x) * 4;
    if (raw[p + 3] === 255 && alpha[y * N + x] >= 254) continue;
    result[p + 3] = Math.round(clamp((alpha[y * N + x] - 30) / 198) * 255);
    if (!result[p + 3]) { result.fill(0, p, p + 4); continue; }
    if (result[p + 3] === 255 && raw[p + 3] > 180) continue;
    let chosen = -1, best = Infinity;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const q = ((y + dy) * N + x + dx) * 4, d = dx * dx + dy * dy;
      if (d < best && raw[q + 3] > 250 && raw[q] < 125 && raw[q + 1] < 150 && raw[q + 2] < 80) { chosen = q; best = d; }
    }
    if (chosen >= 0) raw.copy(result, p, chosen, chosen + 3);
  }
  return result;
}
function eyes(raw) {
  const mask = new Uint8Array(N * N), groups = [];
  for (let y = 60; y < 115; y++) for (let x = 120; x < 280; x++) {
    const p = (y * N + x) * 4;
    if (raw[p + 3] > 100 && raw[p] < 135 && raw[p] > raw[p + 1] * 1.25) mask[y * N + x] = 1;
  }
  for (let q = 0; q < mask.length; q++) if (mask[q]) {
    const stack = [q], group = []; mask[q] = 0;
    while (stack.length) { const i = stack.pop(); group.push(i); for (const k of [i - 1, i + 1, i - N, i + N]) if (mask[k]) { mask[k] = 0; stack.push(k); } }
    if (group.length > 10) groups.push(group);
  }
  return groups.sort((a,b) => b.length-a.length).slice(0,2).map(g => ({ pixels: g, x: Math.min(...g.map(p => p % N)), r: Math.max(...g.map(p => p % N)), y: Math.min(...g.map(p => Math.floor(p/N))), b: Math.max(...g.map(p => Math.floor(p/N))) })).sort((a,b) => a.x-b.x);
}
const generated = await sharp(source).resize(N,N).ensureAlpha().raw().toBuffer(), closed = eyes(generated);
assert.equal(closed.length, 2);
async function blink(original) {
  const result = Buffer.from(original), open = eyes(original); assert.equal(open.length, 2);
  for (let i = 0; i < 2; i++) {
    const a = open[i], b = closed[i], skin = ((a.y - 4) * N + Math.round((a.x+a.r)/2)) * 4;
    // Replace the eye including its brown/green antialias rim; leaving that
    // rim in place would look like an oval outline around a closed eyelid.
    for (let y = a.y - 3; y <= a.b + 3; y++) for (let x = a.x - 3; x <= a.r + 3; x++) {
      const p = (y * N + x) * 4;
      const rx=(a.r-a.x)/2+2, ry=(a.b-a.y)/2+2;
      const d=((x-(a.x+a.r)/2)/rx)**2+((y-(a.y+a.b)/2)/ry)**2;
      const t=clamp((1.35-d)/.35);
      for(let c=0;c<3;c++)result[p+c]=Math.round(original[skin+c]*t+original[p+c]*(1-t));
    }
    const w = b.r-b.x+1, h = b.b-b.y+1, eye = Buffer.alloc(w*h*4);
    for (const q of b.pixels) { const p = ((Math.floor(q/N)-b.y)*w+q%N-b.x)*4; generated.copy(eye,p,q*4,q*4+3); eye[p+3]=255; }
    const ew = a.r-a.x+4, eh = Math.max(5, Math.round((a.b-a.y+1)*.43));
    const cut = await sharp(eye,{raw:{width:w,height:h,channels:4}}).resize(ew,eh).raw().toBuffer();
    const x0 = Math.round((a.x+a.r-ew)/2), y0 = Math.round((a.y+a.b-eh)/2);
    for (let y=0;y<eh;y++) for(let x=0;x<ew;x++) { const p=((y+y0)*N+x+x0)*4,q=(y*ew+x)*4,t=cut[q+3]/255; for(let c=0;c<3;c++)result[p+c]=Math.round(cut[q+c]*t+result[p+c]*(1-t)); }
  }
  return result;
}
for (const [name, path] of Object.entries(inputs)) {
  await mkdir(`${out}/${name}`, { recursive: true });
  const frames = [];
  for(let i=1;i<=16;i++) frames.push(await contour(await sharp(`${root}/${path}${String(i).padStart(2,'0')}.png`).ensureAlpha().raw().toBuffer()));
  if(name==='about'||name==='skills') frames.push(await blink(frames[15]));
  sets[name] = frames;
  const atlas=Buffer.alloc(1536*Math.ceil(frames.length/4)*N*4);
  for(let i=0;i<frames.length;i++) {
    await sharp(frames[i],{raw:{width:N,height:N,channels:4}}).png().toFile(`${out}/${name}/frame-${String(i+1).padStart(2,'0')}.png`);
    for(let y=0;y<N;y++)frames[i].copy(atlas,((Math.floor(i/4)*N+y)*1536+i%4*N)*4,y*N*4,(y+1)*N*4);
  }
  await sharp(atlas,{raw:{width:1536,height:Math.ceil(frames.length/4)*N,channels:4}}).png().toFile(`${out}/${name}-sheet.png`);
  if(frames.length===17) assert(frames[15].subarray(120*N*4).equals(frames[16].subarray(120*N*4)), 'Blink changes body');
  report[name] = { count: frames.length, width: N, height: N, blinkFrame: frames.length===17?17:15 };
}
assert(sets.about[15].equals(sets.skills[0]), 'About/Skills handoff changed');
assert(sets.experience[15].equals(sets.projects[0]), 'Experience/Projects handoff changed');
await writeFile(`${out}/manifest.json`,JSON.stringify({sets:report,exactHandoffs:true,method:'Original RGB retained in opaque interiors; fringe alpha cleaned; generated eyelids only'},null,2)+'\n');
console.log('PASS 66 standalone frames, exact handoffs, blink body unchanged.');
