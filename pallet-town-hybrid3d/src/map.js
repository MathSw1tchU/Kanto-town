import * as THREE from "three";

export function createPalletTownMap(scene) {
  const mapGroup = new THREE.Group();

  // 1. Terreno de grama clássico
  const grassGeo = new THREE.PlaneGeometry(90, 90);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x58c758, roughness: 0.95 });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  mapGroup.add(grass);

  // 2. Caminhos de terra batida (Layout original exato)
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });
  
  // Caminho vertical principal conectando o norte ao sul
  const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(5, 52), pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.01, 4);
  mapGroup.add(mainPath);

  // Caminho horizontal inferior (em frente ao laboratório)
  const southPath = new THREE.Mesh(new THREE.PlaneGeometry(44, 4), pathMat);
  southPath.rotation.x = -Math.PI / 2;
  southPath.position.set(0, 0.01, 10);
  mapGroup.add(southPath);

  // Caminho horizontal superior (em frente às casas do Red e Blue)
  const northPath = new THREE.Mesh(new THREE.PlaneGeometry(44, 4), pathMat);
  northPath.rotation.x = -Math.PI / 2;
  northPath.position.set(0, 0.01, -8);
  mapGroup.add(northPath);

  // 3. ÁGUA COM MOVIMENTO (Lago ao sul, divisa inferior de Pallet Town)
  const waterGeo = new THREE.PlaneGeometry(38, 16);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a86ff, 
    roughness: 0.15, 
    metalness: 0.4,
    transparent: true,
    opacity: 0.88
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, 0.02, 28);
  mapGroup.add(waterMesh);

  mapGroup.userData = {
    waterMesh,
    update(time) {
      waterMesh.position.y = 0.02 + Math.sin(time * 3.5) * 0.04;
    }
  };

  // 4. ESTRUTURA DAS CASAS (Posicionamento exato GBA)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfdfcdc, roughness: 0.5 });
  const roofRedMat = new THREE.MeshStandardMaterial({ color: 0xd93025, roughness: 0.4 });
  const roofBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.4 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x8ecae6, roughness: 0.1 });

  function createDetailedHouse(rx, rz, type = "red") {
    const houseGroup = new THREE.Group();
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 6.2), wallMat);
    body.position.y = 2.1;
    body.castShadow = true;
    body.receiveShadow = true;
    houseGroup.add(body);

    const roofMat = (type === "blue") ? roofBlueMat : roofRedMat;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 3.0, 4), roofMat);
    roof.position.y = 5.7;
    roof.rotation.y = Math.PI / 4;
    houseGroup.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.3, 0.2), doorMat);
    door.position.set(0, 1.15, 3.15);
    houseGroup.add(door);

    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), glassMat);
    win1.position.set(-2.2, 2.3, 3.15);
    houseGroup.add(win1);

    const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), glassMat);
    win2.position.set(2.2, 2.3, 3.15);
    houseGroup.add(win2);

    if (type === "lab") {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), wallMat);
      sign.position.set(3.6, 1.3, 3.2);
      houseGroup.add(sign);
    }

    houseGroup.position.set(rx, 0, rz);
    mapGroup.add(houseGroup);
    return houseGroup;
  }

  // POSIÇÕES CLÁSSICAS EXATAS DE FIRE-RED / LEAF-GREEN:
  // Casa do Red (Esquerda da zona norte)
  createDetailedHouse(-12, -12, "red");
  // Casa do Blue / Rival (Direita da zona norte)
  createDetailedHouse(12, -12, "blue");
  // Laboratório do Professor Carvalho (Centro exato da zona sul, em frente ao lago)
  createDetailedHouse(0, 4, "lab");

  // 5. CERCAS BRANCAS E FLORESTA NAS BORDAS
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  function createFence(x, z, rotY = 0) {
    const fence = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.35), fenceMat);
    fence.position.set(x, 0.45, z);
    fence.rotation.y = rotY;
    fence.castShadow = true;
    mapGroup.add(fence);
  }

  for (let x = -26; x <= 26; x += 3.2) {
    createFence(x, -20); // Cerca norte
    createFence(x, 19);  // Cerca sul
  }

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.9 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2b9348, roughness: 0.7 });

  function createTree(x, z) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.2, 8), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), leavesMat);
    leaves.position.y = 3.0;
    leaves.castShadow = true;
    tree.add(leaves);

    tree.position.set(x, 0, z);
    mapGroup.add(tree);
  }

  for (let z = -20; z <= 24; z += 5) {
    createTree(-32, z);
    createTree(32, z);
  }
  for (let x = -30; x <= 30; x += 5) {
    createTree(x, -22);
  }

  scene.add(mapGroup);
  return mapGroup;
}
