import { DESTINATIONS } from '../data/destinations.js';
/** All standard HTML UI lives here — not inside the 3D scene. */
export class Hud {
  constructor() {
    this.speed=document.getElementById('speed-value');
    this.surface=document.getElementById('surface-value');
    this.map=document.getElementById('minimap');
    this.ctx=this.map.getContext('2d');
    this.panel=document.getElementById('modal-backdrop');
    this.title=document.getElementById('modal-title');
    this.kicker=document.getElementById('modal-kicker');
    this.message=document.getElementById('modal-message');
    this.confirm=document.getElementById('modal-confirm');
    this.cancel=document.getElementById('modal-cancel');
    this.modal=document.getElementById('modal');
    this.open=false;this.target=null;
    this.cancel.addEventListener('click',()=>this.hideModal());
    this.confirm.addEventListener('click',()=>{
      if(this.target?.url) window.location.assign(this.target.url);
      else this.hideModal();
    });
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&this.open)this.hideModal();});
    document.getElementById('quick-button').addEventListener('click',()=>this.openQuickLinks());
    document.getElementById('brand-home').addEventListener('click',e=>{e.preventDefault();this.openQuickLinks();});
  }
  showParking(dest){
    this.target=dest;
    this.kicker.textContent=dest.url?'YOU HAVE ARRIVED':'WORK IN PROGRESS';
    this.title.textContent=dest.name;
    this.message.textContent=dest.url ? `${dest.description} Would you like to enter?` : dest.description;
    this.confirm.textContent=dest.url?'Enter location →':'Back to town';
    this.cancel.hidden=!dest.url;
    this.showModal();
  }
  openQuickLinks(){
    this.target=null;
    this.kicker.textContent='SHORTCUTS';this.title.textContent='Explore SpookCoffee';
    this.message.textContent='Skip the drive and choose a destination. Your game progress will remain here if you choose to keep roaming.';
    this.confirm.textContent='View links';this.cancel.hidden=false;
    // In quick-links mode a simple link list is shown beneath the message.
    const list=document.createElement('div');list.className='quick-links';
    for(const item of DESTINATIONS.filter(d=>d.url)){
      const a=document.createElement('a');a.textContent=`${item.name} ↗`;a.href=item.url;list.appendChild(a);
    }
    const gh=document.createElement('a');gh.textContent='GitHub ↗';gh.href='https://github.com/SpookCoffee';gh.target='_blank';gh.rel='noopener noreferrer';list.appendChild(gh);
    this.message.replaceChildren(document.createTextNode(this.message.textContent),list);
    this.confirm.hidden=true;this.showModal();
  }
  showModal(){this.open=true;this.panel.hidden=false;this.modal.focus();}
  hideModal(){this.open=false;this.panel.hidden=true;this.confirm.hidden=false;this.cancel.hidden=false;this.message.replaceChildren();}
  update(vehicle,surface,world){
    this.speed.textContent=Math.round(Math.abs(vehicle.speed)*3.6);
    this.surface.textContent=surface.toUpperCase();
    this.surface.className=`surface-pill ${surface}`;
    this.drawMap(vehicle,world);
  }
  drawMap(vehicle,world){
    const c=this.ctx;if(!c)return;
    const W=this.map.width,H=this.map.height,scale=.72;
    c.clearRect(0,0,W,H);c.fillStyle='#1f2923';c.fillRect(0,0,W,H);
    const px=x=>W/2+(x-13)*scale;
    const py=z=>H/2-(z-4)*scale;
    for(const path of world.paths){
      c.strokeStyle=path.type==='dirt'?'#ae895f':'#55585b';c.lineWidth=path.width*scale;
      c.lineCap='round';c.lineJoin='round';c.beginPath();
      path.points.forEach((p,i)=>i?c.lineTo(px(p.x),py(p.z)):c.moveTo(px(p.x),py(p.z)));
      c.stroke();
    }
    for(const d of DESTINATIONS){
      c.beginPath();c.arc(px(d.position.x),py(d.position.z),5.4,0,Math.PI*2);
      c.fillStyle=d.color;c.fill();c.strokeStyle='#151515';c.lineWidth=1.4;c.stroke();
      c.font='bold 9px system-ui';c.textAlign='center';c.fillStyle='#f6f4ef';c.fillText(d.id==='construction'?'BUILD':d.id==='contact'?'ID':'CV',px(d.position.x),py(d.position.z)-11);
    }
    c.save();c.translate(px(vehicle.position.x),py(vehicle.position.z));c.rotate(-vehicle.heading);
    c.fillStyle='#ffd9df';c.strokeStyle='#401e27';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-8);c.lineTo(5,6);c.lineTo(0,3);c.lineTo(-5,6);c.closePath();c.fill();c.stroke();c.restore();
    c.strokeStyle='#536157';c.strokeRect(.5,.5,W-1,H-1);
  }
}
