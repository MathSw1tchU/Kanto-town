import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

const CHARACTER_SHEETS = {
  red: "./assets/red.jpg",
  leaf: "./assets/leaf.jpg",
  blue: "./assets/blue.jpg",
  oak: "./assets/oak.jpg"
};

export const CHARACTERS = {
  red: { name: "Red", quote: "Hora de começar nossa jornada por Kanto!", defaultExpr: "happy" },
  leaf: { name: "Leaf", quote: "O Prof. Carvalho já está esperando no Laboratório!", defaultExpr: "normal" },
  blue: { name: "Blue", quote: "Hmpf! Meu Pokémon já está muito mais forte que o seu!", defaultExpr: "smug" },
  oak: { name: "Prof. Carvalho", quote: "Este mundo é habitado por criaturas chamadas Pokémon!", defaultExpr: "normal" }
};

const EXPR_MAP = { normal: 0, happy: 1, surprised: 2, angry: 3, smug: 4, blink: 5 };

// Shader avançado com controle de escala e deslocamento vertical/horizontal por célula
const preciseSpriteShader = {
  uniforms: {
    tMap: { value: null },
    uvScale: { value: new THREE.Vector2(1.0 / 6.0, 1.0 / 2.0) },
    uvOffset: { value: new THREE.Vector2(0.0, 0.0) },
    uvShift: { value: new THREE.Vector2(0.0, 0.02) } // Deslocamento fino para alinhar pernas e cabeça
  },
  vertexShader: `
    varying vec2 vUv;
    uniform vec2 uvScale;
    uniform vec2 uvOffset;
    uniform vec2 uvShift;
    void main() {
      // Aplica zoom interno de enquadramento (0.82) e deslocamento de centralização
      vec2 centeredUv = (uv - vec2(0.5)) * 0.82 + vec2(0.5) + uvShift;
      vUv = centeredUv * uvScale + uvOffset;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tMap;
    void main() {
      vec4 texColor = texture2D(tMap, vUv);
      // Remove o fundo branco de forma limpa
      float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
      if (brightness > 0.93) {
        discard;
      }
      gl_FragColor = texColor;
    }
  `
};

export function spawnStickmanNPC(parent, id, x, z, patrol = null) {
  const imageUrl = CHARACTER_SHEETS[id];
  const texture = textureLoader.load(imageUrl);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tMap: { value: texture },
      uvScale: { value: new THREE.Vector2(1.0 / 6.0, 1.0 / 2.0) },
      uvOffset: { value: new THREE.Vector2(0.0, 0.5) },
      uvShift: { value: new THREE.Vector2(0.0, 0.025) }
    },
    vertexShader: preciseSpriteShader.vertexShader,
    fragmentShader: preciseSpriteShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.26 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, 0.03, z);
  parent.add(shadow);

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.08), mat);
  mesh.position.set(x, 1.04, z);

  const initState = {
    walkPhase: 0,
    idlePhase: Math.random() * Math.PI * 2,
    action: patrol ? "walk" : "idle",
    expr: CHARACTERS[id].defaultExpr,
    lockedExpr: null,
    facing: 1,
    selected: false,
    item: null
  };

  mesh.userData = {
    npcId: id,
    name: CHARACTERS[id].name,
    quote: CHARACTERS[id].quote,
    texture,
    customMat: mat,
    state: initState,
    blinkTimer: 1.6 + Math.random() * 2.4,
    emoteTimer: 0,
    jumpTimer: 0,
    baseX: x,
    baseZ: z,
    patrol,
    shadow
  };

  parent.add(mesh);
  return mesh;
}

export function createNPCs(envGroup, interiors) {
  const list = [];

  return {
    meshes: list,
    spawn(parent, id, x, z) {
      const m = spawnStickmanNPC(parent, id, x, z, null);
      list.push(m);
      return m;
    },
    remove(mesh) {
      const idx = list.indexOf(mesh);
      if (idx !== -1) list.splice(idx, 1);
      if (mesh.userData.shadow && mesh.userData.shadow.parent) {
        mesh.userData.shadow.parent.remove(mesh.userData.shadow);
      }
      if (mesh.parent) mesh.parent.remove(mesh);
    },
    walkTo(mesh, x, z) {
      mesh.userData.patrol = null;
      mesh.userData.targetPos = { x, z };
    },
    moveBy(mesh, dx, dz, dt) {
      if (!mesh) return;
      mesh.userData.patrol = null;
      mesh.userData.targetPos = null;
      const speed = 4.2;
      mesh.position.x += dx * speed * dt;
      mesh.position.z += dz * speed * dt;
      mesh.userData.baseX = mesh.position.x;
      mesh.userData.baseZ = mesh.position.z;
      mesh.userData.shadow.position.x = mesh.position.x;
      mesh.userData.shadow.position.z = mesh.position.z;
      mesh.userData.state.action = "walk";
      mesh.userData.manualWalkTimer = 0.14;
      if (Math.abs(dx) > 0.05) {
        mesh.userData.state.facing = dx >= 0 ? 1 : -1;
      }
    },
    setExpression(mesh, exprName) {
      mesh.userData.state.lockedExpr = exprName;
      mesh.userData.state.expr = exprName;
    },
    setAction(mesh, actionName) {
      mesh.userData.patrol = null;
      mesh.userData.state.action = actionName;
      if (actionName === "jump") mesh.userData.jumpTimer = 0.5;
    },
    setItem(mesh, itemName) {
      mesh.userData.state.item = mesh.userData.state.item === itemName ? null : itemName;
    },
    flipFacing(mesh) {
      mesh.userData.state.facing *= -1;
    },
    triggerEmote(mesh) {
      mesh.userData.emoteTimer = 2.2;
      mesh.userData.jumpTimer = 0.45;
    },
    update(dt, camera) {
      for (const npc of list) {
        if (!npc.parent || !npc.parent.visible) continue;
        const d = npc.userData;
        const st = d.state;

        st.idlePhase += dt * 3.5;

        const baseExpr = st.lockedExpr || CHARACTERS[d.npcId].defaultExpr;
        d.blinkTimer -= dt;
        if (d.emoteTimer > 0) {
          d.emoteTimer -= dt;
          st.expr = "happy";
        } else {
          if (d.blinkTimer <= -0.15) {
            st.expr = baseExpr;
            d.blinkTimer = 2.2 + Math.random() * 2.5;
          } else if (d.blinkTimer <= 0) {
            st.expr = "blink";
          } else {
            st.expr = baseExpr;
          }
        }

        let col = 0;
        let row = 0;

        if (st.item === "pokeball") {
          col = 4; row = 1;
        } else if (st.action === "walk") {
          st.walkPhase += dt * 7.0;
          const walkFrame = Math.floor(st.walkPhase * 2.5) % 2;
          col = walkFrame === 0 ? 1 : 2;
          row = 1;
        } else if (st.action === "wave") {
          col = 3; row = 1;
        } else if (st.action === "jump" || d.jumpTimer > 0) {
          col = 5; row = 1;
        } else {
          col = EXPR_MAP[st.expr] !== undefined ? EXPR_MAP[st.expr] : 0;
          row = 0;
        }

        const uX = col / 6.0;
        const uY = 1.0 - (row + 1) / 2.0;
        d.customMat.uniforms.uvOffset.value.set(uX, uY);

        if (d.manualWalkTimer > 0) {
          d.manualWalkTimer -= dt;
        } else if (d.targetPos) {
          const tx = d.targetPos.x - npc.position.x;
          const tz = d.targetPos.z - npc.position.z;
          const dist = Math.hypot(tx, tz);
          if (dist > 0.08) {
            st.action = "walk";
            const step = Math.min(dist, 3.8 * dt);
            const vx = (tx / dist) * step;
            const vz = (tz / dist) * step;
            npc.position.x += vx;
            npc.position.z += vz;
            d.baseX = npc.position.x;
            d.baseZ = npc.position.z;
            d.shadow.position.x = npc.position.x;
            d.shadow.position.z = npc.position.z;
            if (Math.abs(vx) > 0.002) st.facing = vx >= 0 ? 1 : -1;
          } else {
            d.targetPos = null;
            st.action = "idle";
          }
        }

        npc.rotation.y = Math.atan2(
          camera.position.x - npc.position.x,
          camera.position.z - npc.position.z
        );
      }
    }
  };
}