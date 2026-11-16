import * as THREE from 'three';
import { distanceToPath } from './math.js';

/**
 * The town is deliberately hand-made, not generated as a square grid.
 * Roads follow Catmull-Rom curves; the new district branches onto a dirt track.
 */
export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders=[];
    this.paths=[];
    this.obstacles=[];
    // At the south end of town: an asphalt turning circle and Source Hub.
    this.culdesac = { x: 2, z: -106, radius: 12.5 };
    this.githubParking = { x: 18, z: -106, width: 17, depth: 15 };
    this.createEnvironment();
    this.createRoads();
    this.createTown();
    this.createTrees();
  }
  material(color, roughness=1) { return new THREE.MeshStandardMaterial({ color, roughness }); }
  box(x,y,z,w,h,d,material, opts={}) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y+h/2,z);mesh.castShadow=!!opts.shadow;mesh.receiveShadow=true;this.scene.add(mesh);
    if(opts.solid) this.colliders.push({x,z,w,d,pad:opts.pad??1.4});
    return mesh;
  }
  createEnvironment() {
    this.scene.background = new THREE.Color('#a6b7ad');
    this.scene.fog = new THREE.Fog('#a6b7ad',90,240);
    this.scene.add(new THREE.HemisphereLight('#d6ebed','#4d5947',2.0));
    const sun=new THREE.DirectionalLight('#fff0d7',2.65);
    sun.position.set(50,92,-65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-125;sun.shadow.camera.right=125;sun.shadow.camera.top=140;sun.shadow.camera.bottom=-140;
    sun.shadow.normalBias=.015;this.scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(450,450),this.material('#697a5d'));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.045;ground.receiveShadow=true;this.scene.add(ground);
    // Random-looking, deterministic grass patches — every page load stays the same.
    const grass=['#657855','#6b7c5d','#70805c','#768469'];
    let seed=29122;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    const patchGeo=new THREE.PlaneGeometry(3.5,2.2);
    for(let i=0;i<150;i++){
      const x=(rand()-.5)*250,z=(rand()-.5)*250;
      const mesh=new THREE.Mesh(patchGeo,this.material(grass[i%grass.length]));
      mesh.rotation.x=-Math.PI/2;mesh.rotation.z=rand()*Math.PI;
      mesh.position.set(x,.004,z);mesh.receiveShadow=true;this.scene.add(mesh);
    }
    // A distant backdrop of low, irregular ridgelines.
    const hills=this.material('#647363');
    for(let i=0;i<14;i++){
      const x=-165+i*25;
      const hill=new THREE.Mesh(new THREE.ConeGeometry(22+(i%3)*7,16+(i%4)*5,7),hills);
      hill.position.set(x,5,160+(i%2)*9);this.scene.add(hill);
    }
  }
  createRoads() {
    const paved = [
      [[2,-99],[2,-90],[-4,-62],[-8,-32],[-3,-11],[7,13],[14,37],[20,55],[18,82],[10,112]],
      [[-7,-31],[1,-31],[12,-29],[20,-24]],
      [[12,29],[2,33],[-11,36],[-23,35]]
    ];
    const dirt = [
      [[20,55],[29,57],[38,66],[48,70],[57,77],[67,82],[78,85]]
    ];
    for(const coordinates of paved) this.addRoad(coordinates,8.6,'asphalt');
    for(const coordinates of dirt) this.addRoad(coordinates,6.7,'dirt');
    this.createCuldesac();
  }
  /**
   * Paved turning circle at the southern dead-end of the main road.
   * The existing road slightly overlaps it so there is no disconnected gap.
   */
  createCuldesac() {
    const { x, z, radius } = this.culdesac;
    const makeDisc = (r, y, color) => {
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(r, 64), this.material(color)
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(x, y, z);
      disc.receiveShadow = true;
      this.scene.add(disc);
    };
    // A thin gravel shoulder surrounds the paved circular end of the road.
    makeDisc(radius + 1.25, .03, '#55534d');
    makeDisc(radius, .055, '#414448');
  }
  addRoad(coordinates,width,type) {
    const points=coordinates.map(([x,z])=>new THREE.Vector3(x,0,z));
    const spline=new THREE.CatmullRomCurve3(points,false,'catmullrom',.55);
    const count=type==='dirt'?100:Math.max(50,coordinates.length*17);
    const smoothPoints=spline.getPoints(count).map(p=>({x:p.x,z:p.z}));
    this.paths.push({points:smoothPoints,width,type});
    if(type==='asphalt') {
      this.roadStrip(smoothPoints,width+1.55,.025,this.material('#4a4946'));
      this.roadStrip(smoothPoints,width,.045,this.material('#414448'));
      // Subtle road markings: short dash segments follow the curves.
      const stripeMat=this.material('#d5ccb2');
      for(let i=3;i<smoothPoints.length-5;i+=12){
        this.roadStrip(smoothPoints.slice(i,i+5),.11,.064,stripeMat);
      }
    } else {
      this.roadStrip(smoothPoints,width+1.5,.028,this.material('#846c4e'));
      this.roadStrip(smoothPoints,width,.048,this.material('#aa875d'));
      // Two worn tire tracks through the construction area.
      for(const offset of [-1.55,1.55]) this.roadStrip(smoothPoints,.37,.055,this.material('#947553'),offset);
    }
  }
  roadStrip(points,width,y,material,offset=0) {
    const verts=[];const indices=[];
    for(let i=0;i<points.length;i++){
      const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
      const dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1;
      const nx=dz/len,nz=-dx/len;
      for(const side of [-1,1]) verts.push(points[i].x+nx*(offset+side*width*.5),y,points[i].z+nz*(offset+side*width*.5));
      if(i>0){const a=(i-1)*2,b=i*2;indices.push(a,b,a+1,b,b+1,a+1);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;mesh.material.side=THREE.DoubleSide;this.scene.add(mesh);return mesh;
  }
  getSurface(position){
    // The circular turnaround and GitHub parking lot should count as asphalt.
    if (Math.hypot(position.x-this.culdesac.x, position.z-this.culdesac.z) < this.culdesac.radius) return 'asphalt';
    const lot=this.githubParking;
    if (Math.abs(position.x-lot.x) < lot.width/2 && Math.abs(position.z-lot.z) < lot.depth/2) return 'asphalt';
    let dirt=false;
    for(const path of this.paths){
      if(distanceToPath(position,path.points) < path.width*.59) {
        if(path.type==='asphalt')return 'asphalt';
        dirt=true;
      }
    }
    return dirt?'dirt':'grass';
  }
  createTown() {
    const asphalt=this.material('#454647'),concrete=this.material('#8a8980');
    const paint=this.material('#cfcac0');
    const createParking=(x,z,w,d,dir='x')=>{
      this.box(x,.012,z,w,.04,d,asphalt);
      // individual stalls with painted stripes, not a big featureless rectangle
      for(let k=0;k<4;k++){
        const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.13,d*.76),paint);
        stripe.rotation.x=-Math.PI/2;stripe.position.set(x-w*.38+k*w*.25,.059,z);this.scene.add(stripe);
      }
    };
    createParking(20,-24,24,22);
    createParking(-21,35,24,22);
    // A compact parking lot opens off the east side of the turning circle.
    // The GitHub building is beyond the lot, so the turnaround stays drivable.
    const lot=this.githubParking;
    createParking(lot.x,lot.z,lot.width,lot.depth);
    this.building(43,-24,22,17,9,'#64404c','CONTACT-ID','#e1c5cc');
    this.building(-49,35,23,19,13,'#4a5660','PORTFOLIO','#efe6d3');
    // Small developer hub at the end of the road; sign faces its parking area.
    this.building(33,-106,12,14,7.5,'#30343d','GITHUB','#f1d4df');
    // Footpath slabs lead from lots to front doors.
    this.box(32,.05,-24,15,.14,3.2,concrete);
    this.box(-34,.05,35,13,.14,3.2,concrete);
    // Short sidewalk connecting GitHub parking to its entrance.
    this.box(26,.07,-106,3,.14,2.6,concrete);
    this.createConstructionSite();
    this.addStreetFurniture();
  }
  building(x,z,w,d,h,color,name,signColor) {
    const wall=this.material(color),roof=this.material('#292a2a');
    const building=this.box(x,0,z,w,h,d,wall,{solid:true,pad:1.3,shadow:true});
    this.box(x,h,z,w+1.4,.68,d+1.4,roof,{shadow:true});
    const glass=this.material('#94b7b0',.32);
    // Face parking area (towards the center of the town).
    const face=x<0?1:-1;
    for(const dz of [-d*.28,0,d*.28]) {
      this.box(x+face*(w/2+.04),2.5,z+dz,.14,3.7,2.3,glass);
    }
    this.box(x+face*(w/2+.15),.03,z,.2,3.3,2.6,roof);
    this.sign(name,x+face*(w/2+.45),h*.82,z,signColor,face);
    // decorative hedges
    for(const dz of [-d*.42,d*.42])this.box(x+face*(w/2+3),0,z+dz,2.6,.7,2.8,this.material('#43593f'));
  }
  /**
   * Create a readable sign facing the nearby parking area.
   *
   * A PlaneGeometry faces +Z before rotation. When a building is on the
   * opposite side of the street, the front must point in the opposite
   * X direction or its letters will look mirrored from behind.
   *
   * face =  1: front faces +X (Portfolio side)
   * face = -1: front faces -X (Contact-ID and construction side)
   */
  sign(text, x, y, z, color = '#ffffff', face = 1) {
    // Draw the label once on a canvas and use it as the sign's texture.
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 180;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#252529';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#75636a';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    ctx.font = 'bold 75px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2, 955);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Don't render the back of the sign: that would show reversed text.
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide
    });

    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.85), material);
    sign.position.set(x, y, z);
    sign.rotation.y = face === 1 ? Math.PI / 2 : -Math.PI / 2;
    this.scene.add(sign);
  }

  createConstructionSite() {
    const x=90,z=87;
    // Gravel construction yard along the winding dirt access road.
    this.box(86,.01,87,41,.05,36,this.material('#81765f'));
    this.box(91,0,86,23,1,21,this.material('#75766e'),{shadow:true});
    // unfinished steel-concrete building with open floors, pillars and scaffolding
    const column=this.material('#a4a09a'),beam=this.material('#4d4946'),unbuilt=this.material('#8d8170');
    for (let level=0;level<3;level++) {
      const y=level*3.9+.2;
      this.box(91,y,87,19,.35,16,column);
      for(const px of [83,99])for(const pz of [80,94])this.box(px,y+.3,pz,.7,3.5,.7,column);
    }
    for(const x0 of [81,101]) for(const z0 of [78,96]) this.box(x0,0,z0,.4,11,.4,beam);
    this.box(87,0,68,22,.25,1.6,unbuilt);
    this.sign('COMING SOON',76,4.25,73,'#f8e0b2',-1);
    // Crane: tall mast, jib, dangling hook (not a functional construction machine).
    const orange=this.material('#be844b');
    this.box(109,0,103,1.35,25,1.35,orange);
    this.box(100,24,103,31,.8,.8,orange);
    this.box(88,18,103,.12,6,.12,this.material('#1c2222'));
    this.box(88,17.9,103,1.6,.55,.5,beam);
    // Road closed barrels and a striped barricade on the yard edge.
    const barrel=this.material('#a65f39'),stripe=this.material('#dad4c0');
    for(let i=0;i<4;i++){
      const bx=64+i*3;
      const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.65,.67,1.15,9),barrel);
      cylinder.position.set(bx,.62,71);cylinder.castShadow=true;this.scene.add(cylinder);
      this.box(bx,1.0,71,1.22,.16,1.22,stripe);
    }
    // Small spoil heaps to emphasize a town in progress.
    for(const [hx,hz,r] of [[110,70,5],[103,111,4],[66,102,4]]) {
      const mound=new THREE.Mesh(new THREE.ConeGeometry(r,r*.68,10),this.material('#887560'));
      mound.position.set(hx,r*.32,hz);this.scene.add(mound);
    }
  }
  addStreetFurniture(){
    const post=this.material('#4d4d4a');const lamp=this.material('#f4ecd5');
    for(const [x,z] of [[-14,-61],[8,-10],[-19,12],[27,23],[3,72]]) {
      this.box(x,0,z,.35,7,.35,post);
      this.box(x+1.35,6.8,z,2.7,.23,.3,post);
      this.box(x+2.35,6.5,z,.8,.16,.65,lamp);
    }
  }
  createTrees(){
    const trunk=this.material('#5e493b'),leaf=[this.material('#435d48'),this.material('#4b674e'),this.material('#60745b')];
    const trunkGeo=new THREE.CylinderGeometry(.28,.43,3.8,6);
    const crownGeo=new THREE.ConeGeometry(2.3,7.3,7);
    let seed=424242;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<185;i++){
      const x=(rand()-.5)*255,z=(rand()-.5)*255,here={x,z};
      if(Math.abs(x)>124||Math.abs(z)>124)continue;
      if(this.paths.some(p=>distanceToPath(here,p.points)<p.width*.5+6))continue;
      // Avoid trees inside the turning circle, parking lot or new building.
      if(Math.hypot(x-this.culdesac.x,z-this.culdesac.z)<this.culdesac.radius+4)continue;
      if(Math.abs(x-25)<25 && Math.abs(z+106)<19)continue;
      if(Math.hypot(x-43,z+24)<25 || Math.hypot(x+49,z-35)<26 || Math.hypot(x-90,z-87)<33)continue;
      const tree=new THREE.Group();
      const trunkMesh=new THREE.Mesh(trunkGeo,trunk);trunkMesh.position.y=1.9;tree.add(trunkMesh);
      const crown=new THREE.Mesh(crownGeo,leaf[i%leaf.length]);crown.position.y=6.4;tree.add(crown);
      tree.position.set(x,0,z);const scale=.8+rand()*.65;tree.scale.setScalar(scale);
      tree.traverse(obj=>{if(obj.isMesh)obj.castShadow=true;});this.scene.add(tree);
    }
  }
  checkCollision(pos) {
    if(Math.abs(pos.x)>122||Math.abs(pos.z)>122)return true;
    return this.colliders.some(c=>Math.abs(pos.x-c.x)<c.w/2+c.pad && Math.abs(pos.z-c.z)<c.d/2+c.pad);
  }
}
