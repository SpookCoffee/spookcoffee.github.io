import * as THREE from 'three';
import { distanceToPath } from './math.js';

/**
 * The town is deliberately hand-made, not generated as a square grid.
 * Roads follow Catmull-Rom curves. The finished tofu shop is on a paved
 * side road; the WIP building sits at the unpaved end of the main road.
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
    this.tofuParking = { x: 69, z: 82, width: 24, depth: 18 };
    this.worksiteParking = { x: 21, z: 109, width: 15, depth: 16 };
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
    // Fully paved, established part of town. The side road branches east to
    // the finished tofu shop and connects directly to its paved parking lot.
    const paved = [
      [[2,-99],[2,-90],[-4,-62],[-8,-32],[-3,-11],[7,13],[14,37],[20,55],[18,82]],
      [[-7,-31],[1,-31],[12,-29],[20,-24]],
      [[12,29],[2,33],[-11,36],[-23,35]],
      [[20,55],[29,57],[38,66],[48,70],[57,77],[67,82],[78,85]]
    ];
    // Beyond the tofu-shop junction, the north end of MAIN ROAD is still being
    // built. This dirt continuation goes to the new work-in-progress site.
    // The first point slightly overlaps asphalt so the surfaces connect.
    const dirt = [
      [[18,81],[17,90],[14,101],[11,115]]
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
    // Parking surface labels match the actual pavement/gravel under the car.
    const tofuLot=this.tofuParking;
    if (Math.abs(position.x-tofuLot.x) < tofuLot.width/2 && Math.abs(position.z-tofuLot.z) < tofuLot.depth/2) return 'asphalt';
    const buildingLot=this.worksiteParking;
    if (Math.abs(position.x-buildingLot.x) < buildingLot.width/2 && Math.abs(position.z-buildingLot.z) < buildingLot.depth/2) return 'dirt';
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
    this.createTofuShopDistrict();
    this.createFutureWorksite();
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

  createTofuShopDistrict() {
    const x=90,z=87;
    const timber=this.material('#6f5847'),
          plaster=this.material('#d9d0be'),
          roofDark=this.material('#2f3334'),
          roofEdge=this.material('#474845'),
          concrete=this.material('#8a8980');

    // Finished shop: the road AND this parking lot are both paved asphalt.
    this.box(69,.012,82,24,.04,18,this.material('#454647'));
    for(let k=0;k<4;k++){
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.13,12.8),this.material('#cfcac0'));
      stripe.rotation.x=-Math.PI/2;stripe.position.set(69-24*.38+k*24*.25,.059,82);this.scene.add(stripe);
    }
    // Short walkway from parking to the front entrance.
    this.box(79,.07,82,5.5,.14,2.7,concrete);

    // Main tofu shop building: low, simple, and more rustic than the town's office-like buildings.
    this.box(92,0,87,22,7.2,15,plaster,{solid:true,pad:1.2,shadow:true});
    this.box(92,7.2,87,24,.55,17,roofDark,{shadow:true});
    this.box(92,7.75,87,26,.4,19,roofEdge,{shadow:true});
    // Front porch awning.
    this.box(81.4,3.1,87,1.0,.28,11.5,roofDark,{shadow:true});
    this.box(83.7,3.8,87,4.5,.25,12.5,roofEdge,{shadow:true});
    // Sliding-style front windows and door area facing the parking lot.
    const glass=this.material('#9ab7b0',.32);
    for(const dz of [-4.6,-1.5,1.6,4.7]) this.box(80.9,1.15,dz+87,.12,2.35,2.2,glass);
    this.box(80.9,.03,87,.18,3.1,2.7,roofDark);
    // Decorative timber beams.
    for(const dz of [-6.2,-2.1,2.1,6.2]) this.box(84.4,0,87+dz,.32,6.6,.32,timber);
    for(const dz of [-6.2,6.2]) this.box(92,0,87+dz,22,.45,.4,timber);

    // Simple roadside sign, facing back toward the parking area.
    this.sign('TOFU SHOP',77.8,5.45,87,'#f4f0e5',-1);

    // A small delivery van parked beside the shop adds to the tofu-delivery feel.
    this.box(101,0,80,5.2,2.6,2.7,this.material('#d8dbe0'),{shadow:true});
    this.box(102.1,2.35,80,2.5,1.2,2.5,this.material('#c6c9cf'),{shadow:true});
  }

  createFutureWorksite() {
    // Follow the MAIN road north past the tofu-shop intersection.
    // The final section of main road is unpaved and leads to this site.
    const x=36,z=111;
    const lot=this.worksiteParking;
    const dirt=this.material('#81765f'),
          column=this.material('#a4a09a'),
          beam=this.material('#4d4946'),
          gravel=this.material('#8d8170');

    // Gravel lot connected to the unpaved end of the main road.
    this.box(lot.x,.01,lot.z,lot.width,.05,lot.depth,dirt);
    // Undeveloped building footprint and half-finished concrete framework.
    this.box(x,.01,z,22,.05,20,dirt);
    this.box(x,0,z,16,.6,14,gravel,{shadow:true});
    for(const px of [28.5,43.5]) for(const pz of [104.5,117.5]) {
      this.box(px,.6,pz,.65,8.2,.65,column,{shadow:true});
    }
    this.box(x,4.1,z,16,.35,14,column,{shadow:true});
    this.box(x,8.3,z,16,.45,14,column,{shadow:true});
    this.box(x,0,z-7.2,16,.3,.4,beam);

    // Facing west, towards the dirt road and arriving drivers.
    this.sign('WORK IN PROGRESS',26.5,4.3,111,'#f8e0b2',-1);

    // Temporary safety barrels at the site entrance.
    const barrel=this.material('#a65f39'),stripe=this.material('#dad4c0');
    for(let i=0;i<3;i++){
      const bx=18.5+i*3.2;
      const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.65,.67,1.15,9),barrel);
      cylinder.position.set(bx,.62,100);cylinder.castShadow=true;this.scene.add(cylinder);
      this.box(bx,1,100,1.22,.16,1.22,stripe);
    }
    // Small piles of earth near the foundation.
    for(const [hx,hz,r] of [[48,101,3.8],[51,116,3.5],[30,122,2.6]]) {
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
      if(Math.hypot(x-43,z+24)<25 || Math.hypot(x+49,z-35)<26 || Math.hypot(x-90,z-87)<28 || Math.hypot(x-36,z-111)<25)continue;
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
