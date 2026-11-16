import * as THREE from 'three';

function addBox(parent, w, h, d, material, x, y, z, opts={}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true;
  if(opts.rotationY) mesh.rotation.y=opts.rotationY;
  parent.add(mesh); return mesh;
}

function makeGableRoof(group, width, depth, color) {
  const roofMat = new THREE.MeshStandardMaterial({color, roughness:0.92, flatShading:true});
  const trimMat = new THREE.MeshStandardMaterial({color:0x563b35, roughness:1});
  const ridgeY=3.55, eaveY=2.72, halfW=width/2+0.28, halfD=depth/2+0.34;
  // Two sloping roof planes, with the ridge running along the depth of the building.
  const vertices = new Float32Array([
    0,ridgeY,-halfD, -halfW,eaveY,-halfD, -halfW,eaveY,halfD,
    0,ridgeY,-halfD, -halfW,eaveY,halfD, 0,ridgeY,halfD,
    0,ridgeY,-halfD, 0,ridgeY,halfD, halfW,eaveY,halfD,
    0,ridgeY,-halfD, halfW,eaveY,halfD, halfW,eaveY,-halfD
  ]);
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(vertices,3)); geo.computeVertexNormals();
  const roof=new THREE.Mesh(geo,roofMat); roof.material.side=THREE.DoubleSide; roof.castShadow=true; roof.receiveShadow=true; group.add(roof);
  addBox(group,0.22,0.2,depth+0.82,trimMat,0,ridgeY+0.04,0);
  // Fascia along both eaves.
  addBox(group,0.16,0.2,depth+0.9,trimMat,-halfW,eaveY,0);
  addBox(group,0.16,0.2,depth+0.9,trimMat,halfW,eaveY,0);
  // Front and rear triangular gable boards.
  const gableShape=new THREE.Shape(); gableShape.moveTo(-width/2,0); gableShape.lineTo(width/2,0); gableShape.lineTo(0,0.83); gableShape.closePath();
  const gableGeo=new THREE.ShapeGeometry(gableShape);
  const gableMat=new THREE.MeshStandardMaterial({color:0xe7d5b4,roughness:1,side:THREE.DoubleSide});
  const front=new THREE.Mesh(gableGeo,gableMat); front.position.set(0,2.72,depth/2+0.015); group.add(front);
  const back=new THREE.Mesh(gableGeo,gableMat); back.position.set(0,2.72,-depth/2-0.015); back.rotation.y=Math.PI; group.add(back);
}

export function createBuilding(scene,data) {
  const g=new THREE.Group(); g.position.set(data.x,0,data.z);
  g.userData={id:data.id,name:data.name,kind:data.kind};
  const wall=new THREE.MeshStandardMaterial({color:data.color,roughness:1,flatShading:true});
  const foundation=new THREE.MeshStandardMaterial({color:0x9b927c,roughness:1});
  const dark=new THREE.MeshStandardMaterial({color:0x493b32,roughness:1});
  const frame=new THREE.MeshStandardMaterial({color:0x5a4636,roughness:1});
  const glass=new THREE.MeshStandardMaterial({color:0x83b8c8,roughness:0.3,metalness:0.05,emissive:0x142d35,emissiveIntensity:0.15});
  const windowGlow=[];
  addBox(g,data.w+0.22,0.28,data.d+0.22,foundation,0,0.14,0);
  addBox(g,data.w,2.58,data.d,wall,0,1.43,0);
  // Front wall trim and door frame.
  addBox(g,data.w,0.16,0.13,frame,0,0.16,data.d/2+0.08);
  const doorW=data.kind==='lab'?1.05:0.88;
  addBox(g,doorW+0.24,1.96,0.16,frame,0,1.02,data.d/2+0.105);
  const door=addBox(g,doorW,1.78,0.09,dark,0,0.91,data.d/2+0.2);
  door.userData={doorId:data.id};
  const knobMat=new THREE.MeshStandardMaterial({color:0xe5c36d,metalness:0.55,roughness:0.35});
  addBox(g,0.08,0.08,0.06,knobMat,doorW*0.28,0.92,data.d/2+0.27);

  // Symmetrical framed windows with shutters and visible crossbars.
  for(const x of [-data.w*0.29,data.w*0.29]) {
    const glowMat=new THREE.MeshStandardMaterial({color:0xffdca0,emissive:0xffa83c,emissiveIntensity:0.05,roughness:0.5});
    windowGlow.push(glowMat);
    addBox(g,1.12,0.92,0.14,frame,x,1.78,data.d/2+0.105);
    addBox(g,0.91,0.71,0.055,glass,x,1.78,data.d/2+0.19);
    addBox(g,0.82,0.62,0.035,glowMat,x,1.78,data.d/2+0.225);
    addBox(g,0.09,0.76,0.08,frame,x,1.78,data.d/2+0.25);
    addBox(g,0.96,0.09,0.08,frame,x,1.78,data.d/2+0.25);
    // Small shutters, a visual cue from the GBA house sprites.
    const shutter=new THREE.MeshStandardMaterial({color:data.shutter||0x9a7653,roughness:1});
    addBox(g,0.16,0.78,0.12,shutter,x-0.63,1.78,data.d/2+0.16);
    addBox(g,0.16,0.78,0.12,shutter,x+0.63,1.78,data.d/2+0.16);
  }
  makeGableRoof(g,data.w,data.d,data.roof);
  if(data.kind==='lab') {
    // Lab sign and small roof vent.
    const signMat=new THREE.MeshStandardMaterial({color:0xf5edcf,roughness:1});
    addBox(g,1.9,0.42,0.12,signMat,0,2.45,data.d/2+0.13);
    const ventMat=new THREE.MeshStandardMaterial({color:0x667783,roughness:1});
    addBox(g,0.65,0.48,0.65,ventMat,-data.w*0.3,3.2,-data.d*0.15);
  }
  const windowLight=new THREE.PointLight(0xffbd70,0,8,2); windowLight.position.set(0,1.9,data.d/2+1.15); g.add(windowLight);
  scene.add(g); g.userData.door=door; g.userData.windowGlow=windowGlow; g.userData.windowLight=windowLight; return g;
}
