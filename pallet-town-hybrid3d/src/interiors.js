import * as THREE from 'three';
function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
export function createInterior(scene,id){const group=new THREE.Group();group.userData={interior:id};const floor=new THREE.MeshStandardMaterial({color:0xc9ae83}),wall=new THREE.MeshStandardMaterial({color:0xf0dfc4}),wood=new THREE.MeshStandardMaterial({color:0x80563b}),blue=new THREE.MeshStandardMaterial({color:0x6a9bb2}),white=new THREE.MeshStandardMaterial({color:0xe8e8dc});
 group.add(mesh(new THREE.BoxGeometry(10,.2,9),floor,0,-.1,0));
 // paredes com abertura frontal para a câmera
 group.add(mesh(new THREE.BoxGeometry(10,3,.2),wall,0,1.5,-4.5));group.add(mesh(new THREE.BoxGeometry(.2,3,9),wall,-5,1.5,0));group.add(mesh(new THREE.BoxGeometry(.2,3,9),wall,5,1.5,0));group.add(mesh(new THREE.BoxGeometry(10,3,.2),wall,0,1.5,4.5));
 // móveis comuns
 group.add(mesh(new THREE.BoxGeometry(2.2,.7,1),wood,-2,.35,-2));group.add(mesh(new THREE.BoxGeometry(1.5,.8,.8),blue,2,.4,-2));
 if(id==='player'){group.add(mesh(new THREE.BoxGeometry(2,.45,1.2),blue,0,.55,1.8));group.add(mesh(new THREE.BoxGeometry(.8,1.2,.12),wood,-3,.6,-3.9))}
 if(id==='rival'){group.add(mesh(new THREE.BoxGeometry(1.4,.8,.8),wood,2,.4,1.5));group.add(mesh(new THREE.BoxGeometry(1,.5,.7),white,-2,.25,1.5))}
 if(id==='lab'){for(let i=0;i<3;i++){group.add(mesh(new THREE.BoxGeometry(.75,.9,.75),white,-3+i*3,.45,-2));group.add(mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshStandardMaterial({color:[0x5a9b58,0xc95b50,0x4c8ec8][i]}),-3+i*3,1.05,-2))}group.add(mesh(new THREE.BoxGeometry(2,.9,.8),blue,0,.45,1.5))}
 const interiorLight=new THREE.PointLight(0xffd39a,0.35,18,2);interiorLight.position.set(0,2.5,0);group.add(interiorLight);
 // Luminária simples no teto para reforçar a leitura do espaço durante a noite.
 const lampMat=new THREE.MeshStandardMaterial({color:0xffe2ad,emissive:0xffb85c,emissiveIntensity:0.45});
 group.add(mesh(new THREE.SphereGeometry(.16,10,8),lampMat,0,2.85,0));
 group.userData.interiorLight=interiorLight;
 group.visible=false;scene.add(group);return group}
