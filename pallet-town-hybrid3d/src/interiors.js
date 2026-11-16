import * as THREE from "three";

function mesh(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addBookshelf(group, x, z, width = 2.0) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a4e2d, roughness: 0.9 });
  const back = new THREE.MeshStandardMaterial({ color: 0x4f311b, roughness: 1 });
  group.add(mesh(new THREE.BoxGeometry(width, 2.1, 0.55), wood, x, 1.05, z));
  group.add(mesh(new THREE.BoxGeometry(width - 0.16, 1.9, 0.08), back, x, 1.05, z - 0.18));

  const bookColors = [0xc94a4a, 0x4a7ec9, 0x56a35a, 0xe0b646, 0x8f56a3];
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = 0.45 + shelf * 0.58;
    group.add(mesh(new THREE.BoxGeometry(width - 0.12, 0.08, 0.48), wood, x, sy - 0.22, z + 0.02));
    const count = Math.floor((width - 0.3) / 0.22);
    for (let b = 0; b < count; b++) {
      const bx = x - (width - 0.4) / 2 + b * 0.22;
      const bMat = new THREE.MeshStandardMaterial({ color: bookColors[(shelf + b) % bookColors.length] });
      group.add(mesh(new THREE.BoxGeometry(0.16, 0.38, 0.36), bMat, bx, sy, z + 0.14));
    }
  }
}

function addTableWithChairs(group, x, z, hasMap = false) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x9c663b, roughness: 0.85 });
  const cushion = new THREE.MeshStandardMaterial({ color: 0xc94b43, roughness: 0.8 });
  group.add(mesh(new THREE.BoxGeometry(2.1, 0.12, 1.4), wood, x, 0.72, z));
  for (const px of [-0.85, 0.85]) {
    for (const pz of [-0.5, 0.5]) {
      group.add(mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), wood, x + px, 0.35, z + pz));
    }
  }
  for (const cx of [x - 1.35, x + 1.35]) {
    group.add(mesh(new THREE.BoxGeometry(0.55, 0.1, 0.55), cushion, cx, 0.42, z));
    group.add(mesh(new THREE.BoxGeometry(0.1, 0.85, 0.55), wood, cx + (cx < x ? -0.22 : 0.22), 0.45, z));
  }
  if (hasMap) {
    const mapMat = new THREE.MeshStandardMaterial({ color: 0xf5ebd0, roughness: 0.7 });
    const landMat = new THREE.MeshStandardMaterial({ color: 0x6ab054, roughness: 0.8 });
    group.add(mesh(new THREE.BoxGeometry(1.1, 0.03, 0.8), mapMat, x, 0.79, z));
    group.add(mesh(new THREE.BoxGeometry(0.7, 0.04, 0.45), landMat, x - 0.05, 0.795, z));
  }
}

function addPottedPlant(group, x, z) {
  const pot = new THREE.MeshStandardMaterial({ color: 0xb85d3b, roughness: 0.9 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3b8c44, roughness: 0.8 });
  group.add(mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.45, 10), pot, x, 0.22, z));
  group.add(mesh(new THREE.DodecahedronGeometry(0.38, 1), leaf, x, 0.65, z));
}

function addPokeball(group, x, y, z) {
  const topRed = new THREE.MeshStandardMaterial({ color: 0xd9382e, roughness: 0.3 });
  const botWhite = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
  const bandBlack = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

  const ball = new THREE.Group();
  ball.position.set(x, y, z);

  const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), topRed);
  const bot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), botWhite);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.203, 0.203, 0.04, 16), bandBlack);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), botWhite);
  btn.rotation.x = Math.PI / 2;
  btn.position.z = 0.19;

  ball.add(top, bot, band, btn);
  group.add(ball);
}

function addStairs(group, targetId, isUp = true) {
  const stairGroup = new THREE.Group();
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x9c663b, roughness: 0.8 });
  const darkStepMat = new THREE.MeshStandardMaterial({ color: 0x694225, roughness: 0.9 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x5c381f, roughness: 0.9 });
  const pitWallMat = new THREE.MeshStandardMaterial({ color: 0x241911, roughness: 1 });

  if (isUp) {
    // Escada do térreo subindo para o 2º andar
    for (let s = 0; s < 5; s++) {
      const h = 0.24 + s * 0.24;
      const step = mesh(new THREE.BoxGeometry(1.5, h, 0.44), s % 2 === 0 ? stepMat : darkStepMat, 3.8, h / 2, -2.3 - s * 0.42);
      step.userData = { stairTarget: targetId };
      stairGroup.add(step);
    }
    const rail = mesh(new THREE.BoxGeometry(0.12, 1.35, 2.2), railMat, 3.05, 0.68, -3.15);
    rail.userData = { stairTarget: targetId };
    stairGroup.add(rail);
  } else {
    // Escada do 2º andar descendo através de um vão real abaixo do piso
    const pitBottom = mesh(new THREE.BoxGeometry(1.6, 0.1, 2.3), pitWallMat, 3.8, -1.25, -3.2);
    const pitBack = mesh(new THREE.BoxGeometry(1.6, 1.3, 0.1), pitWallMat, 3.8, -0.6, -4.35);
    const pitLeft = mesh(new THREE.BoxGeometry(0.1, 1.3, 2.3), pitWallMat, 3.0, -0.6, -3.2);
    const pitRight = mesh(new THREE.BoxGeometry(0.1, 1.3, 2.3), pitWallMat, 4.6, -0.6, -3.2);
    [pitBottom, pitBack, pitLeft, pitRight].forEach(p => { p.userData = { stairTarget: targetId }; stairGroup.add(p); });

    for (let s = 0; s < 5; s++) {
      const yPos = -0.12 - s * 0.22;
      const zPos = -2.35 - s * 0.42;
      const step = mesh(new THREE.BoxGeometry(1.48, 0.14, 0.44), s % 2 === 0 ? stepMat : darkStepMat, 3.8, yPos, zPos);
      step.userData = { stairTarget: targetId };
      stairGroup.add(step);
    }

    // Guarda-corpo de madeira ao redor da abertura no piso
    const railLeft = mesh(new THREE.BoxGeometry(0.12, 0.65, 2.35), railMat, 2.98, 0.32, -3.2);
    const railBack = mesh(new THREE.BoxGeometry(1.75, 0.65, 0.12), railMat, 3.8, 0.32, -4.35);
    const postFront = mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), railMat, 2.98, 0.37, -2.02);
    [railLeft, railBack, postFront].forEach(r => { r.userData = { stairTarget: targetId }; stairGroup.add(r); });
  }

  group.add(stairGroup);
}

export function createInterior(scene, id) {
  const group = new THREE.Group();
  group.userData = { interior: id };

  const isLab = id === "lab";
  const roomW = isLab ? 12 : 10;
  const roomD = isLab ? 11 : 9;

  const floorMat = new THREE.MeshStandardMaterial({
    color: isLab ? 0xdce3e8 : 0xc99e6b,
    roughness: isLab ? 0.5 : 0.85
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: isLab ? 0xeef3f7 : 0xf5e6cc,
    roughness: 0.95
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x7a5234, roughness: 1 });

  if (id === "bedroom") {
    // Piso dividido para deixar o vão aberto (x: 3.0 a 4.6, z: -4.35 a -2.05) onde a escada desce
    group.add(mesh(new THREE.BoxGeometry(8.0, 0.2, 9.0), floorMat, -1.0, -0.1, 0));
    group.add(mesh(new THREE.BoxGeometry(2.0, 0.2, 6.55), floorMat, 4.0, -0.1, 1.225));
    group.add(mesh(new THREE.BoxGeometry(0.4, 0.2, 2.45), floorMat, 4.8, -0.1, -3.275));
  } else {
    group.add(mesh(new THREE.BoxGeometry(roomW, 0.2, roomD), floorMat, 0, -0.1, 0));
  }

  group.add(mesh(new THREE.BoxGeometry(roomW, 2.9, 0.22), wallMat, 0, 1.45, -roomD / 2));
  group.add(mesh(new THREE.BoxGeometry(0.22, 2.9, roomD), wallMat, -roomW / 2, 1.45, 0));
  group.add(mesh(new THREE.BoxGeometry(0.22, 2.9, roomD), wallMat, roomW / 2, 1.45, 0));
  group.add(mesh(new THREE.BoxGeometry(roomW, 0.35, 0.22), trimMat, 0, 0.17, roomD / 2));

  if (id !== "bedroom") {
    const matColor = id === "player" ? 0xc4453d : id === "rival" ? 0x3d78b8 : 0x5c768d;
    const welcomeMat = new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.9 });
    group.add(mesh(new THREE.BoxGeometry(2.2, 0.04, 1.1), welcomeMat, 0, 0.02, roomD / 2 - 0.75));
  }

  if (id === "player") {
    addBookshelf(group, -3.6, -4.0, 2.1);
    addTableWithChairs(group, -0.4, 0.2, false);
    addPottedPlant(group, -4.2, 3.6);
    addPottedPlant(group, 4.2, 3.6);

    const tvBody = new THREE.MeshStandardMaterial({ color: 0x383c42, roughness: 0.6 });
    const tvScreen = new THREE.MeshStandardMaterial({
      color: 0x74b9ff,
      emissive: 0x2980b9,
      emissiveIntensity: 0.5
    });
    group.add(mesh(new THREE.BoxGeometry(1.3, 0.55, 0.7), tvBody, 0, 0.27, -4.0));
    group.add(mesh(new THREE.BoxGeometry(1.1, 0.85, 0.65), tvBody, 0, 0.95, -4.0));
    group.add(mesh(new THREE.BoxGeometry(0.86, 0.62, 0.05), tvScreen, 0, 0.96, -3.66));

    // Escada interativa para subir ao 2º andar (Quarto)
    addStairs(group, "bedroom", true);
  }

  if (id === "bedroom") {
    // 2º Andar: Quarto do Protagonista (Red)
    // Tapete azul central clássico
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x4a7ec9, roughness: 0.9 });
    const rugBorder = new THREE.MeshStandardMaterial({ color: 0xf5ebd0, roughness: 0.9 });
    group.add(mesh(new THREE.BoxGeometry(3.4, 0.03, 2.6), rugBorder, 0.2, 0.015, 0.6));
    group.add(mesh(new THREE.BoxGeometry(3.0, 0.04, 2.2), rugMat, 0.2, 0.02, 0.6));

    // Cama encostada na parede esquerda (com travesseiro branco e edredom vermelho)
    const bedWood = new THREE.MeshStandardMaterial({ color: 0x7a4e2d, roughness: 0.9 });
    const sheetWhite = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
    const blanketRed = new THREE.MeshStandardMaterial({ color: 0xc94238, roughness: 0.8 });
    group.add(mesh(new THREE.BoxGeometry(1.65, 0.42, 2.8), bedWood, -3.9, 0.21, 1.4));
    group.add(mesh(new THREE.BoxGeometry(1.5, 0.2, 2.65), sheetWhite, -3.9, 0.48, 1.4));
    group.add(mesh(new THREE.BoxGeometry(1.54, 0.22, 1.85), blanketRed, -3.9, 0.5, 1.8));
    group.add(mesh(new THREE.BoxGeometry(1.0, 0.16, 0.5), sheetWhite, -3.9, 0.64, 0.42));

    // Mesa com PC no canto superior esquerdo
    const deskWood = new THREE.MeshStandardMaterial({ color: 0x9c663b, roughness: 0.85 });
    const pcCase = new THREE.MeshStandardMaterial({ color: 0xe6e2d3, roughness: 0.5 });
    const pcScreen = new THREE.MeshStandardMaterial({
      color: 0x55efc4,
      emissive: 0x00b894,
      emissiveIntensity: 0.55
    });
    group.add(mesh(new THREE.BoxGeometry(1.8, 0.72, 1.0), deskWood, -3.7, 0.36, -3.8));
    group.add(mesh(new THREE.BoxGeometry(0.75, 0.62, 0.55), pcCase, -3.9, 1.03, -3.85));
    group.add(mesh(new THREE.BoxGeometry(0.58, 0.44, 0.05), pcScreen, -3.9, 1.04, -3.56));
    group.add(mesh(new THREE.BoxGeometry(0.65, 0.08, 0.32), pcCase, -3.9, 0.76, -3.45));
    // Banqueta do PC
    group.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.44, 12), blanketRed, -3.9, 0.22, -2.75));

    // Estante de livros ao lado do PC
    addBookshelf(group, -1.7, -4.0, 1.6);

    // TV com Videogame (SNES/NES) ligado no centro-norte
    const tvBody = new THREE.MeshStandardMaterial({ color: 0x383c42, roughness: 0.6 });
    const tvScreen = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xf39c12,
      emissiveIntensity: 0.5
    });
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
    const consolePurple = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.6 });
    group.add(mesh(new THREE.BoxGeometry(1.3, 0.5, 0.7), tvBody, 0.6, 0.25, -4.0));
    group.add(mesh(new THREE.BoxGeometry(1.1, 0.85, 0.65), tvBody, 0.6, 0.92, -4.0));
    group.add(mesh(new THREE.BoxGeometry(0.86, 0.62, 0.05), tvScreen, 0.6, 0.93, -3.66));
    // Console SNES no chão em frente à TV
    group.add(mesh(new THREE.BoxGeometry(0.65, 0.14, 0.5), consoleMat, 0.6, 0.07, -3.0));
    group.add(mesh(new THREE.BoxGeometry(0.35, 0.16, 0.22), consolePurple, 0.6, 0.08, -3.0));

    // Vaso de planta no canto inferior direito
    addPottedPlant(group, 4.2, 3.6);

    // Escada para descer de volta ao térreo
    addStairs(group, "player", false);
  }

  if (id === "rival") {
    addBookshelf(group, -3.6, -4.0, 2.2);
    addBookshelf(group, 3.6, -4.0, 2.2);
    addTableWithChairs(group, 0, 0.1, true);
    addPottedPlant(group, -4.2, 3.6);
    addPottedPlant(group, 4.2, 3.6);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x6e472b });
    const artMat = new THREE.MeshStandardMaterial({ color: 0x7ec8e3 });
    group.add(mesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), frameMat, 0, 1.75, -4.35));
    group.add(mesh(new THREE.BoxGeometry(1.36, 0.86, 0.1), artMat, 0, 1.75, -4.34));
  }

  if (id === "lab") {
    addBookshelf(group, -4.2, -5.0, 2.8);
    addBookshelf(group, 4.2, -5.0, 2.8);
    addBookshelf(group, -5.4, 1.2, 0.6);
    addPottedPlant(group, -5.2, 4.6);
    addPottedPlant(group, 5.2, 4.6);

    const deskMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e0, roughness: 0.6 });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x55efc4,
      emissive: 0x00b894,
      emissiveIntensity: 0.45
    });
    group.add(mesh(new THREE.BoxGeometry(3.2, 0.85, 1.1), deskMat, -3.4, 0.42, -1.6));
    group.add(mesh(new THREE.BoxGeometry(0.85, 0.65, 0.55), deskMat, -4.1, 1.15, -1.6));
    group.add(mesh(new THREE.BoxGeometry(0.68, 0.48, 0.05), screenMat, -4.1, 1.16, -1.31));
    group.add(mesh(new THREE.BoxGeometry(0.85, 0.65, 0.55), deskMat, -2.6, 1.15, -1.6));
    group.add(mesh(new THREE.BoxGeometry(0.68, 0.48, 0.05), screenMat, -2.6, 1.16, -1.31));

    const starterTable = new THREE.MeshStandardMaterial({ color: 0xe6ecf2, roughness: 0.4 });
    const tableTrim = new THREE.MeshStandardMaterial({ color: 0x4a69bd, roughness: 0.6 });
    group.add(mesh(new THREE.BoxGeometry(3.2, 0.85, 1.2), starterTable, 3.1, 0.42, -1.2));
    group.add(mesh(new THREE.BoxGeometry(3.26, 0.12, 1.26), tableTrim, 3.1, 0.82, -1.2));

    addPokeball(group, 2.2, 1.06, -1.2);
    addPokeball(group, 3.1, 1.06, -1.2);
    addPokeball(group, 4.0, 1.06, -1.2);

    const machineMat = new THREE.MeshStandardMaterial({ color: 0x8395a7, roughness: 0.5 });
    group.add(mesh(new THREE.BoxGeometry(2.0, 1.7, 0.9), machineMat, 0, 0.85, -4.8));
    group.add(mesh(new THREE.BoxGeometry(1.4, 0.6, 0.06), screenMat, 0, 1.2, -4.34));
  }

  const interiorLight = new THREE.PointLight(0xffdca8, 0.65, 22, 1.8);
  interiorLight.position.set(0, 2.7, 0.5);
  group.add(interiorLight);

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffe2ad,
    emissive: 0xffb85c,
    emissiveIntensity: 0.6
  });
  group.add(mesh(new THREE.SphereGeometry(0.18, 10, 8), lampMat, 0, 2.95, 0));

  group.userData.interiorLight = interiorLight;
  group.visible = false;
  scene.add(group);
  return group;
}