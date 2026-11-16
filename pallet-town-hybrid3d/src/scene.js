import * as THREE from 'three';
export function createScene(){const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bc9e8);scene.fog=new THREE.Fog(0x9bc9e8,55,115);return scene}
