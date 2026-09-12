// Runs before npm ci, without installed dependencies, to catch incomplete lock entries.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
assert.equal(lock.lockfileVersion, 3, 'Expected npm lockfile version 3');
assert(lock.packages && lock.packages[''], 'Missing root package in lockfile');
for (const [path, entry] of Object.entries(lock.packages)) {
  if (entry.link) continue;
  assert(typeof entry.version === 'string' && entry.version.trim(), `Missing package version: ${path || '(root)'}`);
  if (entry.resolved?.startsWith('https://registry.npmjs.org/')) {
    assert(entry.integrity, `Missing package integrity: ${path}`);
  }
}
console.log('PASS: lockfile package versions and registry integrity metadata');
