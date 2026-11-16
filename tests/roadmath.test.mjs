import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, distance2D, segmentDistance, distanceToPath } from '../src/game/math.js';
test('clamp respects limits',()=>{assert.equal(clamp(12,0,10),10);assert.equal(clamp(-2,0,10),0);});
test('two-dimensional distance',()=>assert.equal(distance2D({x:0,z:0},{x:3,z:4}),5));
test('nearest segment point works',()=>assert.equal(segmentDistance({x:5,z:3},{x:0,z:0},{x:10,z:0}),3));
test('distance to winding path',()=>assert.equal(distanceToPath({x:4,z:4},[{x:0,z:0},{x:10,z:0},{x:10,z:10}]),4));
