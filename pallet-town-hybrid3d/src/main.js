import * as THREE from "three";
import { createScene } from "./scene.js?v=11";
import { createLighting, setTimeOfDay, TIME_MODES } from "./lighting.js?v=11";
import { addEnvironment } from "./environment.js?v=11";
import { createBuilding } from "./buildings.js?v=11";
import { createInterior } from "./interiors.js?v=11";
import { createCamera } from "./camera.js?v=11";
import { createCinematics } from "./cinematics.js?v=11";
import { createNPCs } from "./npcs.js?v=11";
import { createDirectorUI } from "./director.js?v=11";
import { MAP } from "../config/map.js?v=11";

const scene = createScene();
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
document.body.appendChild(renderer.domElement);

const lights = createLighting(scene);
const envGroup = addEnvironment(scene);
const { camera, controls } = createCamera(THREE, renderer, scene);
const cinema = createCinematics(camera, controls);

const buildings = MAP.buildings.map(b => createBuilding(scene, b));
const interiors = Object.fromEntries(MAP.buildings.map(b => [b.id, createInterior(scene, b.id)]));
interiors.bedroom = createInterior(scene, "bedroom");
const npcs = createNPCs(envGroup, interiors);

const interiorNames = {
  player: "Casa do protagonista (1º andar)",
  bedroom: "Quarto do protagonista (2º andar)",
  rival: "Casa do rival",
  lab: "Laboratório do Professor Carvalho"
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let inside = null;
let timeIndex = 0;

const location = document.querySelector("#location");
const exitBtn = document.querySelector("#exit");

const director = createDirectorUI({
  camera,
  controls,
  npcs,
  getActiveParent: () => (inside ? interiors[inside] : envGroup),
  onFocusNPC: npc => {
    controls.target.set(npc.position.x, 1.0, npc.position.z);
    camera.position.set(npc.position.x + 2.5, 2.8, npc.position.z + 4.8);
  }
});

function enter(id) {
  inside = id;
  director.selectNPC(null);
  envGroup.visible = false;
  buildings.forEach(b => (b.visible = false));
  Object.values(interiors).forEach(g => (g.visible = false));
  interiors[id].visible = true;
  camera.position.set(0, 7.5, 12.5);
  controls.target.set(0, 1, 0);
  location.textContent = "Interior: " + (interiorNames[id] || id);
  exitBtn.textContent = id === "bedroom" ? "Descer escada" : "Voltar à cidade";
  exitBtn.hidden = false;
}

function leave() {
  if (inside === "bedroom") {
    enter("player");
    return;
  }
  inside = null;
  director.selectNPC(null);
  Object.values(interiors).forEach(g => (g.visible = false));
  envGroup.visible = true;
  buildings.forEach(b => (b.visible = true));
  camera.position.set(22, 20, 26);
  controls.target.set(0, 0, 0);
  location.textContent = "Exploração livre";
  exitBtn.textContent = "Voltar à cidade";
  exitBtn.hidden = true;
}

let downPos = { x: 0, y: 0 };
renderer.domElement.addEventListener("pointerdown", e => {
  downPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener("pointerup", e => {
  // Ignora se o usuário arrastou para girar/mover a câmera
  if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 8) return;

  const r = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // 1. Se o modo mover personagem no chão estiver ativo
  if (director.isMoveMode()) {
    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, pt)) {
      director.handleGroundTap(pt);
    }
    return;
  }

  // 2. Seleção/interação com personagens
  const activeNPCs = npcs.meshes.filter(m => m.parent && m.parent.visible);
  const npcHits = raycaster.intersectObjects(activeNPCs, false);
  if (npcHits.length) {
    const hitNPC = npcHits[0].object;
    director.selectNPC(hitNPC);
    npcs.triggerEmote(hitNPC);
    location.textContent = hitNPC.userData.name + ": \"" + hitNPC.userData.quote + "\"";
    return;
  }

  // 3. Portas e escadas
  if (!inside) {
    const hits = raycaster.intersectObjects(buildings.map(b => b.userData.door), false);
    if (hits.length) enter(hits[0].object.userData.doorId);
  } else {
    const activeRoom = interiors[inside];
    const hits = raycaster.intersectObjects(activeRoom.children, true);
    const stairHit = hits.find(h => h.object.userData && h.object.userData.stairTarget);
    if (stairHit) enter(stairHit.object.userData.stairTarget);
  }
});

exitBtn.addEventListener("click", leave);

const timeButton = document.querySelector("#daynight");
const timeLabels = { day: "Horário: Dia", afternoon: "Horário: Tarde", night: "Horário: Noite" };

function cycleTime() {
  timeIndex = (timeIndex + 1) % TIME_MODES.length;
  const mode = TIME_MODES[timeIndex];
  setTimeOfDay(lights, scene, mode, buildings, Object.values(interiors));
  timeButton.textContent = timeLabels[mode];
}

timeButton.addEventListener("click", cycleTime);
setTimeOfDay(lights, scene, "day", buildings, Object.values(interiors));
timeButton.textContent = timeLabels.day;

document.querySelector("#cinema").addEventListener("click", () => cinema.start());

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  controls.update();
  cinema.update(dt);
  director.update(dt);
  npcs.update(dt, camera);
  renderer.render(scene, camera);
}

animate();
document.querySelector("#loading").remove();