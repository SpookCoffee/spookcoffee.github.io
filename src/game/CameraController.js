import * as THREE from 'three';
import { smooth } from './math.js';
/** A smooth third-person chase camera with a closer alternative view. */
export class CameraController {
  constructor(camera,vehicle){this.camera=camera;this.vehicle=vehicle;this.mode=0;this.camera.position.set(0,10,-105);}
  toggle(){this.mode=(this.mode+1)%2;}
  update(dt){
    const car=this.vehicle;
    const distance=this.mode===0?15:9;
    const height=this.mode===0?9:5;
    const look=new THREE.Vector3(car.position.x+Math.sin(car.heading)*7,1.5,car.position.z+Math.cos(car.heading)*7);
    const target=new THREE.Vector3(car.position.x-Math.sin(car.heading)*distance,height,car.position.z-Math.cos(car.heading)*distance);
    this.camera.position.lerp(target,1-Math.exp(-4*dt));this.camera.lookAt(look);
  }
}
