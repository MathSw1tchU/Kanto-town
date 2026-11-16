import * as THREE from "three";

function makeGrassTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#68a847";
  ctx.fillRect(0, 0, 128, 128);
  const colors = ["#74b552", "#5d9b3e", "#58943a", "#7ec05a", "#4f8a34"];
  for (let i = 0; i < 1100; i++) {
    ctx.fillStyle = colors[(Math.random() * colors.length) | 0];
    ctx.fillRect((Math.random() * 128) | 0, (Math.random() * 128) | 0, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function box(parent, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function addSign(parent, x, z, isMetal = false) {
  const postMat = new THREE.MeshStandardMaterial({ color: 0x5c3c24, roughness: 1 });
  const boardMat = new THREE.MeshStandardMaterial({ color: isMetal ? 0xd8e0e8 : 0xc68e53, roughness: isMetal ? 0.4 : 0.9, metalness: isMetal ? 0.3 : 0 });
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 1 });
  box(parent, 0.14, 0.65, 0.14, postMat, x, 0.32, z);
  box(parent, 0.92, 0.56, 0.12, borderMat, x, 0.72, z);
  box(parent, 0.82, 0.46, 0.14, boardMat, x, 0.72, z);
}

function addMailbox(parent, x, z, roofColor) {
  const postMat = new THREE.MeshStandardMaterial({ color: 0x6b472a, roughness: 1 });
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xefe8d8, roughness: 0.8 });
  const topMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
  box(parent, 0.12, 0.7, 0.12, postMat, x, 0.35, z);
  box(parent, 0.44, 0.34, 0.52, boxMat, x, 0.78, z);
  box(parent, 0.48, 0.12, 0.56, topMat, x, 0.98, z);
}

function addFenceRow(parent, xStart, xEnd, z) {
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xf2ead7, roughness: 0.9 });
  const width = Math.abs(xEnd - xStart);
  const centerX = (xStart + xEnd) / 2;
  box(parent, width + 0.15, 0.1, 0.08, fenceMat, centerX, 0.58, z);
  box(parent, width + 0.15, 0.1, 0.08, fenceMat, centerX, 0.28, z);
  for (let x = Math.min(xStart, xEnd); x <= Math.max(xStart, xEnd); x += 1.2) {
    box(parent, 0.16, 0.74, 0.16, fenceMat, x, 0.37, z);
  }
}

export function addEnvironment(scene) {
  const envGroup = new THREE.Group();
  envGroup.userData = { environment: true };

  const grass = new THREE.Mesh(new THREE.PlaneGeometry(76, 56), new THREE.MeshStandardMaterial({ map: makeGrassTexture(), roughness: 1 }));
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, -0.09, -6);
  grass.receiveShadow = true;
  envGroup.add(grass);

  const sandMat = new THREE.MeshStandardMaterial({ color: 0xe3cf9b, roughness: 1 });
  box(envGroup, 76, 0.16, 2.2, sandMat, 0, -0.08, 22.2);

  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2b8be0, roughness: 0.22, metalness: 0.1, emissive: 0x0a2e52, emissiveIntensity: 0.25 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(76, 28), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.14, 36);
  water.receiveShadow = true;
  envGroup.add(water);

  const foamMat = new THREE.MeshStandardMaterial({ color: 0x8fd1ff, roughness: 0.4 });
  box(envGroup, 76, 0.03, 0.45, foamMat, 0, -0.12, 23.5);
  box(envGroup, 76, 0.03, 0.25, foamMat, 0, -0.12, 24.8);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8c598, roughness: 1 });
  const pathEdge = new THREE.MeshStandardMaterial({ color: 0xb09b72, roughness: 1 });

  box(envGroup, 4.0, 0.08, 14, pathEdge, 0, -0.005, -18);
  box(envGroup, 3.5, 0.09, 13.8, pathMat, 0, 0.015, -18);
  box(envGroup, 24, 0.08, 3.8, pathEdge, 0, -0.004, -1.2);
  box(envGroup, 23.5, 0.09, 3.3, pathMat, 0, 0.015, -1.2);
  box(envGroup, 3.8, 0.08, 22, pathEdge, 0, -0.005, 10.5);
  box(envGroup, 3.3, 0.09, 21.8, pathMat, 0, 0.015, 10.5);

  const stone = new THREE.MeshStandardMaterial({ color: 0xe6d6af, roughness: 1 });
  for (let i = 0; i < 3; i++) {
    box(envGroup, 1.3, 0.06, 0.9, stone, -6, 0.05, -2.6 - i * 0.85);
    box(envGroup, 1.3, 0.06, 0.9, stone, 6, 0.05, -2.6 - i * 0.85);
  }

  addMailbox(envGroup, -8.3, -4.2, 0xb84b43);
  addMailbox(envGroup, 3.7, -4.2, 0x477eb4);
  addSign(envGroup, -3.2, -3.8, false);
  addSign(envGroup, 8.8, -3.8, false);
  addSign(envGroup, -4.6, 2.4, true);
  addSign(envGroup, -2.6, -11.5, false);

  addFenceRow(envGroup, -9.5, -3.5, 2.4);
  addFenceRow(envGroup, 3.2, 9.2, 12.2);
  addFenceRow(envGroup, -11.5, -3.0, -13.5);
  addFenceRow(envGroup, 3.0, 11.5, -13.5);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x734b30, roughness: 1 });
  const leafMats = [0x2d7a3c, 0x3b8c44, 0x266934, 0x4ca149].map(color => new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
  const treePositions = [
    [-14.5, -15], [-14.5, -10], [-14.5, -5], [-14.5, 0], [-14.5, 5], [-14.5, 10], [-14.5, 15], [-14.5, 19],
    [14.5, -15], [14.5, -10], [14.5, -5], [14.5, 0], [14.5, 5], [14.5, 10], [14.5, 15], [14.5, 19],
    [-10, -17.5], [-5.5, -17.5], [5.5, -17.5], [10, -17.5],
    [-10, -22], [-5.5, -22], [5.5, -22], [10, -22],
    [-10.5, 16.5], [10.5, 16.5]
  ];

  treePositions.forEach(([x, z], i) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.4, 8), trunkMat);
    trunk.position.set(x, 0.65, z);
    trunk.castShadow = true;
    envGroup.add(trunk);
    const crown = new THREE.Group();
    crown.position.set(x, 2.15, z);
    envGroup.add(crown);
    [[0, 0, 0, 1.55], [0.7, 0.15, 0.1, 1.05], [-0.7, 0.15, -0.1, 1.05], [0, 0.75, 0, 0.95]].forEach(([ox, oy, oz, s], j) => {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), leafMats[(i + j) % leafMats.length]);
      leaf.position.set(ox, oy, oz);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      crown.add(leaf);
    });
  });

  const petalColors = [0xff5e7e, 0xffd84d, 0xffffff];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3b8c44, roughness: 1 });
  const flowerBeds = [
    [-7.5, 4.2], [-6.5, 4.2], [-5.5, 4.2], [-7.5, 5.2], [-6.5, 5.2], [-5.5, 5.2],
    [4.5, 13.6], [5.5, 13.6], [6.5, 13.6], [4.5, 14.6], [5.5, 14.6], [6.5, 14.6]
  ];

  flowerBeds.forEach(([bx, bz], idx) => {
    for (let k = 0; k < 4; k++) {
      const ox = (k % 2 === 0 ? -0.22 : 0.22);
      const oz = (k < 2 ? -0.22 : 0.22);
      box(envGroup, 0.08, 0.18, 0.08, stemMat, bx + ox, 0.08, bz + oz);
      const petalMat = new THREE.MeshStandardMaterial({ color: petalColors[(idx + k) % 3], roughness: 0.6 });
      box(envGroup, 0.22, 0.08, 0.22, petalMat, bx + ox, 0.2, bz + oz);
    }
  });

  scene.add(envGroup);
  return envGroup;
}