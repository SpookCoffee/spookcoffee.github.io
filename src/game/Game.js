import * as THREE from 'three';
import { World } from './World.js';
import { Vehicle } from './Vehicle.js';
import { InputController } from './InputController.js';
import { CameraController } from './CameraController.js';
import { ParkingManager } from './ParkingManager.js';
import { DESTINATIONS } from '../data/destinations.js';
import { Hud } from '../ui/Hud.js';

/** Object-oriented entry point: owns the scene, camera, simulation and loop. */
export class Game {
  constructor(container){
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(65,1,.1,500);
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.4;
    container.appendChild(this.renderer.domElement);
    this.world=new World(this.scene);
    this.vehicle=new Vehicle(this.scene);
    this.input=new InputController();
    this.follow=new CameraController(this.camera,this.vehicle);
    this.hud=new Hud();
    this.parking=new ParkingManager(DESTINATIONS, dest=>this.hud.showParking(dest));
    this.clock=new THREE.Clock();
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()==='c'&&!this.hud.open)this.follow.toggle();
      if(e.key.toLowerCase()==='m')document.getElementById('map-card').classList.toggle('collapsed');
    });
    document.getElementById('reset-button').addEventListener('click',()=>{
      this.vehicle.reset();this.parking.reset();this.hud.hideModal();
    });
    this.loop=this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }
  resize(){
    const w=window.innerWidth,h=window.innerHeight;
    this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);
  }
  loop(){
    requestAnimationFrame(this.loop);
    const dt=Math.min(.05,this.clock.getDelta());
    const surface=this.world.getSurface(this.vehicle.position);
    this.vehicle.update(dt,this.input,surface,p=>this.world.checkCollision(p),this.hud.open);
    this.parking.update(dt,this.vehicle.position,this.vehicle.speed,this.hud.open);
    this.follow.update(dt);
    this.hud.update(this.vehicle,this.world.getSurface(this.vehicle.position),this.world);
    this.renderer.render(this.scene,this.camera);
  }
}
