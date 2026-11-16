import * as THREE from 'three';

export const TIME_MODES = ['day', 'afternoon', 'night'];

export function createLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xdff3ff, 0x65734b, 2.0);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d2, 2.2);
  sun.position.set(-18, 28, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);
  return { hemi, sun };
}

const PRESETS = {
  day: {
    hemi: 2.0, sun: 2.2, sunColor: 0xfff1d2,
    sky: 0x9bc9e8, ground: 0x65734b, windowGlow: 0.08, interior: 0.35
  },
  afternoon: {
    hemi: 1.45, sun: 1.75, sunColor: 0xffa45e,
    sky: 0xe9a879, ground: 0x70513c, windowGlow: 0.28, interior: 0.65
  },
  night: {
    hemi: 0.42, sun: 0.08, sunColor: 0x9bb8ff,
    sky: 0x101d3d, ground: 0x26334a, windowGlow: 2.4, interior: 1.8
  }
};

export function setTimeOfDay(lights, scene, mode, buildings = [], interiors = []) {
  const preset = PRESETS[mode] || PRESETS.day;
  lights.hemi.intensity = preset.hemi;
  lights.hemi.groundColor.setHex(preset.ground);
  lights.sun.intensity = preset.sun;
  lights.sun.color.setHex(preset.sunColor);
  scene.background.setHex(preset.sky);
  scene.fog.color.setHex(preset.sky);

  buildings.forEach((building) => {
    const glow = building.userData.windowGlow;
    if (glow) glow.forEach((material) => { material.emissiveIntensity = preset.windowGlow; });
    const spill = building.userData.windowLight;
    if (spill) spill.intensity = mode === 'night' ? 0.8 : mode === 'afternoon' ? 0.12 : 0;
  });

  interiors.forEach((group) => {
    if (group.userData.interiorLight) group.userData.interiorLight.intensity = preset.interior;
  });
}
