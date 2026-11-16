import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The original geometry tests do not import 3D browser modules, so syntax
// errors in World.js could go unnoticed. Check every source module here.
function jsFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? jsFiles(path) : entry.name.endsWith('.js') ? [path] : [];
  });
}

test('all browser JavaScript modules have valid syntax', () => {
  for (const file of jsFiles(fileURLToPath(new URL('../src/', import.meta.url)))) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  }
});
