import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DESTINATIONS } from '../src/data/destinations.js';

const world = readFileSync(new URL('../src/game/World.js', import.meta.url), 'utf8');
const hud = readFileSync(new URL('../src/ui/Hud.js', import.meta.url), 'utf8');

test('GitHub destination has a valid URL and dedicated parking trigger', () => {
  const github = DESTINATIONS.find(d => d.id === 'github');
  assert.ok(github, 'GitHub destination missing');
  assert.equal(github.url, 'https://github.com/SpookCoffee');
  assert.ok(github.radius > 0);
  assert.ok(github.position.z < -89, 'GitHub should be behind original spawn');
  assert.equal(new Set(DESTINATIONS.map(d=>d.id)).size, DESTINATIONS.length);
});

test('3D cul-de-sac has a visible disc and usable asphalt surface', () => {
  assert.match(world, /createCuldesac\(\)/);
  assert.match(world, /CircleGeometry\(r, 64\)/);
  assert.match(world, /this\.githubParking/);
  assert.match(world, /this\.building\(33,-106/);
});

test('Minimap and shortcuts recognize GitHub without a duplicate manual entry', () => {
  assert.match(hud, /d\.id==='github'\?'GH'/);
  assert.match(hud, /world\.culdesac/);
  assert.doesNotMatch(hud, /gh\.href='https:\/\/github\.com\/SpookCoffee'/);
});
