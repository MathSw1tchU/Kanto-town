import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createCamera(THREE, renderer, scene) {
  const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.1, 180);
  camera.position.set(22, 20, 26);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = 1.1;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 1.1;

  // Liberdade completa: permite ir do nível do chão até visão de topo
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 1.8;
  controls.maxDistance = 85;

  return { camera, controls };
}