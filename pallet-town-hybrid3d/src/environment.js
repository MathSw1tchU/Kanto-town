import * as THREE from 'three';

function makeGrassTexture() {
  const c=document.createElement('canvas'); c.width=128; c.height=128; const ctx=c.getContext('2d');
  ctx.fillStyle='#79ad58'; ctx.fillRect(0,0,128,128);
  const colors=['#82b963','#70a650','#6da04c','#8abd65','#659a49'];
  // Pixel-like flecks echo the GBA grass palette without looking like a flat plane.
  for(let i=0;i<950;i++){ctx.fillStyle=colors[(Math.random()*colors.length)|0];const x=(Math.random()*128)|0,y=(Math.random()*128)|0;ctx.fillRect(x,y,1+(Math.random()*3|0),1+(Math.random()*2|0));}
  const tex=new THREE.CanvasTexture(c); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(9,9); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestMipmapNearestFilter; tex.colorSpace=THREE.SRGBColorSpace; return tex;
}
function box(scene,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
export function addEnvironment(scene) {
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshStandardMaterial({map:makeGrassTexture(),roughness:1})); grass.rotation.x=-Math.PI/2; grass.position.y=-0.09; grass.receiveShadow=true; scene.add(grass);
  const pathMat=new THREE.MeshStandardMaterial({color:0xcbb98f,roughness:1});
  const pathEdge=new THREE.MeshStandardMaterial({color:0xa99570,roughness:1});
  // Pale compacted-earth paths with darker tile-like edging.
  box(scene,3.7,.08,11,pathEdge,0,-.005,-17); box(scene,3.3,.09,10.8,pathMat,0,.015,-17);
  box(scene,3.7,.08,10,pathEdge,0,-.005,16); box(scene,3.3,.09,9.8,pathMat,0,.015,16);
  box(scene,25,.08,3.8,pathEdge,0,-.004,-1.1); box(scene,24.6,.09,3.4,pathMat,0,.015,-1.1);
  box(scene,4.8,.08,8,pathMat,0,.015,-25); box(scene,4.8,.08,8,pathMat,0,.015,24);
  // Small square stepping stones around the houses.
  const stone=new THREE.MeshStandardMaterial({color:0xd9c89f,roughness:1});
  for(let i=0;i<5;i++) box(scene,1.15,.06,1.05,stone,-6,0.07,-1.8+i*1.05);
  for(let i=0;i<5;i++) box(scene,1.15,.06,1.05,stone,6,0.07,-1.8+i*1.05);

  // Rounded layered deciduous trees closer to the recognizable Kanto overworld silhouette.
  const trunkMat=new THREE.MeshStandardMaterial({color:0x795338,roughness:1});
  const leafMats=[0x347d43,0x438d49,0x2f713d,0x57964c].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true}));
  const treePositions=[[-14,-14],[-14,-5],[-14,5],[-13,14],[14,-14],[14,-5],[14,5],[14,14],[-18,1],[18,1],[-9,17],[9,17]];
  treePositions.forEach(([x,z],i)=>{
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,1.35,7),trunkMat); trunk.position.set(x,.65,z); trunk.castShadow=true; scene.add(trunk);
    const crown=new THREE.Group(); crown.position.set(x,2.05,z); scene.add(crown);
    [[0,0,0,1.35],[.65,.22,.05,.95],[-.62,.2,-.04,.92],[0,.62,.08,.82]].forEach(([ox,oy,oz,s],j)=>{const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),leafMats[(i+j)%leafMats.length]);leaf.position.set(ox,oy,oz);leaf.castShadow=true;leaf.receiveShadow=true;crown.add(leaf)});
  });
  // Rounded shrubs and tiny flower patches.
  const shrubMats=[0x4d984b,0x5da451,0x3f8544].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
  const shrubs=[[-9,1],[-10,3],[-9,5],[10,1],[10,3],[9,5],[-9,11],[9,11],[-4,13],[4,13]];
  shrubs.forEach(([x,z],i)=>{const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.55,1),shrubMats[i%3]);s.scale.set(1,.75,1);s.position.set(x,.42,z);s.castShadow=true;scene.add(s)});
  const flowerColors=[0xf2d36c,0xe98c9a,0xf4eee0];
  for(let i=0;i<24;i++){const x=-10+(i%8)*2.8,z=9+Math.floor(i/8)*1.3;const f=new THREE.Mesh(new THREE.SphereGeometry(.11,6,5),new THREE.MeshStandardMaterial({color:flowerColors[i%3]}));f.position.set(x,.16,z);scene.add(f)}
  // Short wooden fence sections, with deliberate gaps at paths.
  const fenceMat=new THREE.MeshStandardMaterial({color:0xe6d6ae,roughness:1});
  for(const z of [-15,15]) for(let x=-8;x<=8;x+=2){if(Math.abs(x)<3)continue;box(scene,.13,.58,.13,fenceMat,x,.29,z)}
}
