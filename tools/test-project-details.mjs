import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Evaluate data and the pure renderer only; no page scripts or browser globals.
const source = readFileSync(new URL('../assets/js/projects.js', import.meta.url), 'utf8');
const data = source.slice(source.indexOf('  const projects ='), source.indexOf('  const content ='));
const projects = runInNewContext(`${data}\nprojects`);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const renderer = source.slice(source.indexOf('  function renderEditorial('), source.indexOf('  function openProject('));
const render = runInNewContext(`${renderer}\nrenderEditorial`, { escape });
assert.equal(projects.length, 21);
const multilineProject = {
  ...projects[0],
  editorial: { ...projects[0].editorial, intro: '첫 문장\n둘째 문장\r\n\r\n<script>태그</script>' },
};
assert.ok(render(multilineProject).includes('<p>첫 문장<br>둘째 문장<br><br>&lt;script&gt;태그&lt;/script&gt;</p>'));
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const project of projects) {
  assert.ok(project.editorial, `${project.id}: missing editorial data`);
  const { cases, groups } = project.editorial;
  assert.ok(cases.length > 0);
  assert.equal(new Set(cases.map(item => item.id)).size, cases.length);
  for (const item of cases) {
    for (const field of ['id', 'label', 'title', 'preview', 'need']) assert.ok(item[field], `${project.id}: missing ${field}`);
    assert.ok(item.implementation.length > 0);
    assert.ok(item.implementation.every(text => typeof text === 'string' && text.length));
  }
  for (const group of groups) {
    assert.ok(group.contributions.length);
    for (const index of group.contributions) assert.ok(project.contributions[index], `${project.id}: invalid contribution index`);
  }
  const html = render(project);
  assert.equal((html.match(/data-case-target=/g) || []).length, cases.length);
  assert.equal((html.match(/data-case-id=/g) || []).length, cases.length);
  assert.ok(!html.includes('undefined'));
  assert.ok(!html.includes('달라진 점'));
  assert.ok(!html.includes('store-preview-card__flow'));
  assert.equal(html.includes('그 밖에 맡은 일'), groups.length > 0 && project.category !== 'team');
  if (project.category === 'team') assert.ok(html.includes('팀 프로젝트의 주요 구현'));
}
const get = id => projects.find(p => p.id === id);
assert.equal(get('kb').editorial.cases[0].id, 'privacy');
assert.equal(get('developers-station').links[0].url, 'https://brunch.co.kr/@plusx/148');
assert.equal(get('emax').period, '2023.11–2024.01');
assert.ok(!JSON.stringify(get('emax')).includes('Event Scheduler'));
assert.ok(!JSON.stringify(get('envisager')).includes('앱 API'));
assert.ok(!JSON.stringify(get('performance')).includes('단독 배포'));
assert.ok(get('buildpay').editorial.cases.some(item => item.id === 'stamp'));
for (const id of ['opd', 'mango', 'akbocado', 'reshop', 'twith']) assert.ok(get(id).github.startsWith('https://github.com/'));
const probe = structuredClone(get('emax'));
probe.editorial.cases[0].title = '<script>unsafe</script>';
assert.ok(render(probe).includes('&lt;script&gt;unsafe&lt;/script&gt;'));
console.log(`PASS: ${projects.length} project detail schemas, rendered previews, anchors, groups, evidence corrections and escaping`);
