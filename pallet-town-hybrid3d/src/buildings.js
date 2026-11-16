import * as THREE from 'three';

function addBox(parent, w, h, d, material, x, y, z, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (opts.rotationY) mesh.rotation.y = opts.rotationY;
  parent.add(mesh);
  return mesh;
}

function makeKantoRoof(group, width, depth, color, isLab = false) {
  const roofMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true });
  const darkRoofMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.72),
    roughness: 0.9
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x3b2d26, roughness: 1 });

  const baseY = 2.65;
  const roofH = isLab ? 1.15 : 0.98;
  const topW = width * 0.62;
  const topD = depth * 0.56;
  const botW = width + 0.55;
  const botD = depth + 0.55;

  // Telhado trapezoidal (hip roof) fiel aos sprites de FireRed/LeafGreen
  const hw1 = botW / 2, hd1 = botD / 2;
  const hw2 = topW / 2, hd2 = topD / 2;
  const y0 = baseY, y1 = baseY + roofH;

  const vertices = new Float32Array([
    // Frente
    -hw1, y0, hd1,  hw1, y0, hd1,  hw2, y1, hd2,
    -hw1, y0, hd1,  hw2, y1, hd2, -hw2, y1, hd2,
    // Trás
     hw1, y0, -hd1, -hw1, y0, -hd1, -hw2, y1, -hd2,
     hw1, y0, -hd1, -hw2, y1, -hd2,  hw2, y1, -hd2,
    // Esquerda
    -hw1, y0, -hd1, -hw1, y0, hd1, -hw2, y1, hd2,
    -hw1, y0, -hd1, -hw2, y1, hd2, -hw2, y1, -hd2,
    // Direita
     hw1, y0, hd1,  hw1, y0, -hd1,  hw2, y1, -hd2,
     hw1, y0, hd1,  hw2, y1, -hd2,  hw2, y1, hd2,
    // Topo plano
    -hw2, y1, hd2,  hw2, y1, hd2,  hw2, y1, -hd2,
    -hw2, y1, hd2,  hw2, y1, -hd2, -hw2, y1, -hd2
  ]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();

  const roof = new THREE.Mesh(geo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // Beiral inferior escuro ao redor de todo o telhado
  addBox(group, botW + 0.1, 0.14, botD + 0.1, trimMat, 0, baseY, 0);
  // Borda superior do telhado
  addBox(group, topW + 0.12, 0.1, topD + 0.12, darkRoofMat, 0, y1 + 0.02, 0);

  if (!isLab) {
    // Chaminé clássica nas casas residenciais
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x9e4b3b, roughness: 0.9 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 1 });
    addBox(group, 0.52, 0.95, 0.52, brickMat, width * 0.26, y1 + 0.25, -depth * 0.12);
    addBox(group, 0.62, 0.12, 0.62, capMat, width * 0.26, y1 + 0.75, -depth * 0.12);
  } else {
    // Claraboia e unidade de ventilação características do Laboratório do Prof. Carvalho
    const skylightFrame = new THREE.MeshStandardMaterial({ color: 0x4c5b6b, roughness: 0.8 });
    const skylightGlass = new THREE.MeshStandardMaterial({
      color: 0x9bd6eb,
      emissive: 0x26546b,
      emissiveIntensity: 0.35,
      roughness: 0.2
    });
    addBox(group, 2.2, 0.24, 1.3, skylightFrame, 0.7, y1 + 0.12, 0.1);
    addBox(group, 1.95, 0.26, 1.05, skylightGlass, 0.7, y1 + 0.14, 0.1);

    const ventMat = new THREE.MeshStandardMaterial({ color: 0x7b8b9c, roughness: 0.7 });
    addBox(group, 0.85, 0.55, 0.85, ventMat, -1.7, y1 + 0.25, -0.2);
    addBox(group, 0.95, 0.1, 0.95, trimMat, -1.7, y1 + 0.55, -0.2);
  }
}

export function createBuilding(scene, data) {
  const g = new THREE.Group();
  g.position.set(data.x, 0, data.z);
  g.userData = { id: data.id, name: data.name, kind: data.kind };

  const wall = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.95, flatShading: true });
  const foundation = new THREE.MeshStandardMaterial({ color: 0x8c8474, roughness: 1 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3a24, roughness: 0.85 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x473629, roughness: 1 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x8cc6db,
    roughness: 0.25,
    metalness: 0.08,
    emissive: 0x163845,
    emissiveIntensity: 0.2
  });

  const windowGlow = [];

  // Alicerce de pedra
  addBox(g, data.w + 0.24, 0.28, data.d + 0.24, foundation, 0, 0.14, 0);
  // Paredes principais
  addBox(g, data.w, 2.48, data.d, wall, 0, 1.42, 0);
  // Pilastras nos cantos (detalhe marcante das casas de Kanto)
  const cornerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color).multiplyScalar(0.86),
    roughness: 0.95
  });
  for (const cx of [-data.w / 2, data.w / 2]) {
    for (const cz of [-data.d / 2, data.d / 2]) {
      addBox(g, 0.24, 2.5, 0.24, cornerMat, cx, 1.42, cz);
    }
  }

  // Degrau da entrada
  const doorW = data.kind === 'lab' ? 1.18 : 0.92;
  addBox(g, doorW + 0.5, 0.14, 0.45, foundation, 0, 0.07, data.d / 2 + 0.22);

  // Moldura e Porta interativa
  addBox(g, doorW + 0.26, 1.98, 0.16, frame, 0, 1.06, data.d / 2 + 0.08);
  const door = addBox(g, doorW, 1.82, 0.1, doorMat, 0, 0.98, data.d / 2 + 0.16);
  door.userData = { doorId: data.id };

  const knobMat = new THREE.MeshStandardMaterial({ color: 0xf2cf66, metalness: 0.6, roughness: 0.3 });
  addBox(g, 0.09, 0.09, 0.06, knobMat, doorW * 0.3, 0.96, data.d / 2 + 0.23);

  // Janelas com venezianas
  const winPositions = data.kind === 'lab'
    ? [-data.w * 0.34, -data.w * 0.17, data.w * 0.17, data.w * 0.34]
    : [-data.w * 0.29, data.w * 0.29];

  for (const x of winPositions) {
    const wWidth = data.kind === 'lab' ? 0.82 : 1.08;
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffe2a8,
      emissive: 0xffaa3b,
      emissiveIntensity: 0.08,
      roughness: 0.4
    });
    windowGlow.push(glowMat);

    addBox(g, wWidth + 0.16, 0.92, 0.14, frame, x, 1.76, data.d / 2 + 0.08);
    addBox(g, wWidth, 0.74, 0.06, glass, x, 1.76, data.d / 2 + 0.16);
    addBox(g, wWidth - 0.08, 0.66, 0.04, glowMat, x, 1.76, data.d / 2 + 0.19);
    // Cruz da janela
    addBox(g, 0.08, 0.78, 0.08, frame, x, 1.76, data.d / 2 + 0.21);
    addBox(g, wWidth + 0.04, 0.08, 0.08, frame, x, 1.76, data.d / 2 + 0.21);

    if (data.kind !== 'lab') {
      const shutter = new THREE.MeshStandardMaterial({ color: data.shutter || 0x9a7653, roughness: 1 });
      addBox(g, 0.18, 0.8, 0.12, shutter, x - wWidth / 2 - 0.14, 1.76, data.d / 2 + 0.13);
      addBox(g, 0.18, 0.8, 0.12, shutter, x + wWidth / 2 + 0.14, 1.76, data.d / 2 + 0.13);
    }
  }

  makeKantoRoof(g, data.w, data.d, data.roof, data.kind === 'lab');

  if (data.kind === 'lab') {
    // Letreiro frontal do Laboratório
    const signFrame = new THREE.MeshStandardMaterial({ color: 0x3b4856, roughness: 0.8 });
    const signMat = new THREE.MeshStandardMaterial({ color: 0xf7f2df, roughness: 0.9 });
    addBox(g, 2.3, 0.46, 0.12, signFrame, 0, 2.36, data.d / 2 + 0.1);
    addBox(g, 2.12, 0.32, 0.14, signMat, 0, 2.36, data.d / 2 + 0.11);
  }

  const windowLight = new THREE.PointLight(0xffbd70, 0, 8, 2);
  windowLight.position.set(0, 1.9, data.d / 2 + 1.15);
  g.add(windowLight);

  scene.add(g);
  g.userData.door = door;
  g.userData.windowGlow = windowGlow;
  g.userData.windowLight = windowLight;
  return g;
}
