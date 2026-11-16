import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DESTINATIONS } from '../src/data/destinations.js';

const world = readFileSync(new URL('../src/game/World.js', import.meta.url), 'utf8');

test('tofu shop remains on the side branch and WIP moves to main road', () => {
  const tofu=DESTINATIONS.find(d=>d.id==='tofu');
  const wip=DESTINATIONS.find(d=>d.id==='worksite');
  assert.ok(tofu);assert.ok(wip);
  assert.equal(tofu.url, '/Tofu-Delivery/');
  assert.ok(tofu.position.x>50);
  assert.ok(wip.position.x<30);
  assert.ok(wip.position.z>tofu.position.z);
  assert.equal(wip.url,null);
});

test('tofu branch is paved and northern main road is dirt', () => {
  assert.match(world,/\[\[20,55\],\[29,57\]/);
  assert.match(world,/\[\[18,81\],\[17,90\]/);
  assert.match(world,/this\.addRoad\(coordinates,8\.6,'asphalt'\)/);
  assert.match(world,/this\.addRoad\(coordinates,6\.7,'dirt'\)/);
  assert.match(world,/this\.tofuParking/);
  assert.match(world,/this\.worksiteParking/);
});
