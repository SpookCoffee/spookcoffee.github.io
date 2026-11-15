import * as THREE from 'three';
import { clamp, smooth } from './math.js';
/** Arcade handling deliberately prioritizes fun over real car simulation. */
export class Vehicle {
  constructor(scene) {
    this.position = new THREE.Vector3(2, 0, -89);
    this.heading = -0.08; // 0 faces north (+Z)
    this.speed = 0; // world units per second
    this.group = new THREE.Group();
    scene.add(this.group);
    this.wheels = [];
    this.buildModel();
    this.sync();
  }
  buildModel() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x70253b, metalness: .25, roughness: .43 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a1d2c, metalness: .2, roughness: .55 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x9bb9b5, roughness: .2, metalness: .4 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: .9 });
    const light = new THREE.MeshStandardMaterial({ color: 0xf6e9c7, emissive: 0x524a32 });
    const backLight = new THREE.MeshStandardMaterial({ color: 0xc54149, emissive: 0x6b131b });
    const box = (w,h,d,x,y,z,material) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); mesh.position.set(x,y,z); mesh.castShadow=true; this.group.add(mesh); return mesh; };
    box(2.2,.68,4.4,0,.76,0,bodyMat);
    box(1.95,.8,2.22,0,1.4,-.2,roofMat);
    box(1.82,.52,.04,0,1.49,.95,glass); // front glass
    box(1.82,.52,.04,0,1.49,-1.32,glass);
    box(1.92,.09,.04,0,.9,2.22,new THREE.MeshStandardMaterial({color:0x171717}));
    for (const x of [-.78,.78]) {
      box(.44,.18,.10,x,.85,2.23,light);
      box(.39,.14,.09,x,.86,-2.22,backLight);
      for (const z of [-1.37,1.32]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.32,12),tire);
        wheel.rotation.z=Math.PI/2; wheel.position.set(x*1.36,.47,z);
        this.group.add(wheel); this.wheels.push(wheel);
      }
    }
  }
  reset() { this.position.set(2,0,-89); this.speed=0; this.heading=-.08; this.sync(); }
  sync() { this.group.position.copy(this.position); this.group.rotation.y = this.heading; }
  update(dt, input, surface, collisionCheck, locked) {
    if(locked) return;
    const traction = surface === 'asphalt' ? 1 : surface === 'dirt' ? .72 : .52;
    const max = (surface === 'asphalt' ? 24 : surface === 'dirt' ? 17 : 12);
    const throttle = Number(input.forward) - Number(input.backward);
    if(throttle) this.speed = clamp(this.speed + throttle * dt * (this.speed * throttle < 0 ? 23 : 15) * traction, -max * .48, max);
    else this.speed = smooth(this.speed,0,2.1,dt);
    if(input.brake) this.speed = smooth(this.speed,0,8,dt);
    const steer = Number(input.right) - Number(input.left);
    // Steering direction reverses while backing up.
    const steerResponse = clamp(Math.abs(this.speed)/5,0,1);
    this.heading += steer * (this.speed>=0 ? 1 : -1) * 1.45 * dt * steerResponse;
    const next = this.position.clone();
    next.x += Math.sin(this.heading) * this.speed * dt;
    next.z += Math.cos(this.heading) * this.speed * dt;
    if (collisionCheck(next)) {
      this.speed *= -.16; // bump instead of passing through buildings
    } else {
      this.position.copy(next);
    }
    for(const wheel of this.wheels) wheel.rotation.x += this.speed*dt*1.2;
    this.group.rotation.z = smooth(this.group.rotation.z, -steer*.05 * steerResponse,4,dt);
    this.sync();
  }
}
