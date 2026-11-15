import { distance2D } from './math.js';
/** Detect parking areas and ask before leaving this site. */
export class ParkingManager {
  constructor(destinations,onPark){this.destinations=destinations;this.onPark=onPark;this.cooldowns=new Set();this.timer=0;this.active=null;}
  update(dt,position,speed,isModalOpen){
    const nearby=this.destinations.find(d=>distance2D(position,d.position)<d.radius);
    for(const d of this.destinations) if(distance2D(position,d.position)>d.radius+5)this.cooldowns.delete(d.id);
    if(!nearby||this.cooldowns.has(nearby.id)||isModalOpen){this.timer=0;return;}
    if(Math.abs(speed)<.85){this.timer+=dt;if(this.timer>.75){this.cooldowns.add(nearby.id);this.timer=0;this.active=nearby;this.onPark(nearby);}}
    else this.timer=0;
  }
  reset(){this.cooldowns.clear();this.timer=0;this.active=null;}
}
