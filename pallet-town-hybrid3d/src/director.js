import * as THREE from "three";

export function createDirectorUI({ camera, controls, npcs, getActiveParent, onFocusNPC }) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;top:12px;right:12px;z-index:30;font-family:system-ui,sans-serif;max-width:270px;";

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "🎬 Diretor";
  toggleBtn.style.cssText = "float:right;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:8px 12px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);";
  wrap.appendChild(toggleBtn);

  const panel = document.createElement("div");
  panel.style.cssText = "clear:both;margin-top:42px;background:rgba(20,28,38,0.92);backdrop-filter:blur(8px);color:#f8fafc;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:10px;font-size:12px;box-shadow:0 10px 25px rgba(0,0,0,.45);display:none;flex-direction:column;gap:8px;";
  wrap.appendChild(panel);

  // D-Pad tátil no canto inferior esquerdo para andar livremente no celular
  const padWrap = document.createElement("div");
  padWrap.style.cssText = "position:fixed;bottom:18px;left:18px;z-index:30;display:none;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(3,44px);gap:4px;user-select:none;touch-action:none;";
  document.body.appendChild(padWrap);

  const activeDirs = { up: false, down: false, left: false, right: false };
  const makePadCell = (label, dirKey) => {
    const cell = document.createElement("button");
    if (!dirKey) {
      cell.style.cssText = "visibility:hidden;";
      return cell;
    }
    cell.textContent = label;
    cell.style.cssText = "background:rgba(30,41,59,0.82);color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:12px;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);box-shadow:0 4px 10px rgba(0,0,0,.35);";
    const start = e => { e.preventDefault(); activeDirs[dirKey] = true; cell.style.background = "#d97706"; };
    const end = e => { e.preventDefault(); activeDirs[dirKey] = false; cell.style.background = "rgba(30,41,59,0.82)"; };
    cell.addEventListener("pointerdown", start);
    cell.addEventListener("pointerup", end);
    cell.addEventListener("pointerleave", end);
    cell.addEventListener("pointercancel", end);
    return cell;
  };

  [
    ["", null], ["▲", "up"], ["", null],
    ["◀", "left"], ["", null], ["▶", "right"],
    ["", null], ["▼", "down"], ["", null]
  ].forEach(([lbl, key]) => padWrap.appendChild(makePadCell(lbl, key)));

  // Suporte também para teclado (WASD / Setas)
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") activeDirs.up = true;
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") activeDirs.down = true;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") activeDirs.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") activeDirs.right = true;
  });
  window.addEventListener("keyup", e => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") activeDirs.up = false;
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") activeDirs.down = false;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") activeDirs.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") activeDirs.right = false;
  });

  let isOpen = false;
  let selectedNPC = null;
  let moveMode = false;
  let followCam = false;

  toggleBtn.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? "flex" : "none";
    toggleBtn.style.background = isOpen ? "#d97706" : "#1e293b";
    if (!isOpen && moveMode) toggleMoveMode(false);
  });

  const row = (label) => {
    const d = document.createElement("div");
    d.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;align-items:center;";
    if (label) {
      const s = document.createElement("span");
      s.textContent = label;
      s.style.cssText = "width:100%;font-weight:700;color:#94a3b8;font-size:11px;text-transform:uppercase;";
      d.appendChild(s);
    }
    panel.appendChild(d);
    return d;
  };

  const makeBtn = (text, onClick, bg = "#334155") => {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.cssText = `background:${bg};color:#fff;border:none;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:600;cursor:pointer;`;
    b.addEventListener("click", onClick);
    return b;
  };

  const statusLbl = document.createElement("div");
  statusLbl.textContent = "Toque em um personagem para mover";
  statusLbl.style.cssText = "background:rgba(255,255,255,.08);padding:6px 8px;border-radius:8px;font-weight:600;color:#fde047;";
  panel.appendChild(statusLbl);

  function selectNPC(npc) {
    if (selectedNPC) selectedNPC.userData.state.selected = false;
    selectedNPC = npc;
    if (npc) {
      npc.userData.state.selected = true;
      statusLbl.textContent = "Controlando: " + npc.userData.name;
      padWrap.style.display = "grid";
    } else {
      statusLbl.textContent = "Toque em um personagem para mover";
      padWrap.style.display = "none";
      followCam = false;
      followBtn.textContent = "📷 Seguir: OFF";
      followBtn.style.background = "#334155";
    }
  }

  // 1. Expressões
  const exprRow = row("Expressão Facial");
  [
    ["😊 Feliz", "happy"],
    ["😐 Normal", "normal"],
    ["😏 Convencido", "smug"],
    ["😲 Surpreso", "surprised"],
    ["😠 Bravo", "angry"],
    ["😢 Triste", "sad"]
  ].forEach(([lbl, key]) => {
    exprRow.appendChild(makeBtn(lbl, () => {
      if (selectedNPC) npcs.setExpression(selectedNPC, key);
    }));
  });
  exprRow.appendChild(makeBtn("❗ Balão !", () => {
    if (selectedNPC) npcs.triggerEmote(selectedNPC);
  }, "#b91c1c"));

  // 2. Movimentos & Pose
  const actRow = row("Movimento e Pose");
  [
    ["🧍 Parado", "idle"],
    ["🚶 Andando", "walk"],
    ["👋 Acenar", "wave"],
    ["🗣️ Falando", "talk"],
    ["🙌 Cintura", "hips"],
    ["🦘 Pular", "jump"]
  ].forEach(([lbl, act]) => {
    actRow.appendChild(makeBtn(lbl, () => {
      if (selectedNPC) npcs.setAction(selectedNPC, act);
    }));
  });
  actRow.appendChild(makeBtn("🔄 Virar", () => {
    if (selectedNPC) npcs.flipFacing(selectedNPC);
  }, "#0f766e"));
  actRow.appendChild(makeBtn("🔴 Pokébola", () => {
    if (selectedNPC) npcs.setItem(selectedNPC, "pokeball");
  }, "#b91c1c"));
  actRow.appendChild(makeBtn("🔦 Lanterna", () => {
    if (selectedNPC) npcs.setItem(selectedNPC, "flashlight");
  }, "#b45309"));

  // 3. Posicionar e Elenco
  const sceneRow = row("Andar / Posicionar");
  const moveBtn = makeBtn("📍 Ir ao Toque: OFF", () => toggleMoveMode(!moveMode), "#475569");
  function toggleMoveMode(val) {
    moveMode = val;
    moveBtn.textContent = moveMode ? "📍 Toque no Chão..." : "📍 Ir ao Toque: OFF";
    moveBtn.style.background = moveMode ? "#16a34a" : "#475569";
  }
  sceneRow.appendChild(moveBtn);

  sceneRow.appendChild(makeBtn("🗑️ Remover", () => {
    if (selectedNPC) {
      npcs.remove(selectedNPC);
      selectNPC(null);
    }
  }, "#991b1b"));

  const addRow = row("Adicionar Personagem");
  [
    ["+ Red", "red"],
    ["+ Leaf", "leaf"],
    ["+ Blue", "blue"],
    ["+ Oak", "oak"]
  ].forEach(([lbl, id]) => {
    addRow.appendChild(makeBtn(lbl, () => {
      const parent = getActiveParent();
      const spawned = npcs.spawn(parent, id, controls.target.x, controls.target.z);
      selectNPC(spawned);
      npcs.triggerEmote(spawned);
    }, "#1d4ed8"));
  });

  // 4. Atalhos de Câmera
  const camRow = row("Câmera Livre");
  const followBtn = makeBtn("📷 Seguir: OFF", () => {
    if (!selectedNPC) return;
    followCam = !followCam;
    followBtn.textContent = followCam ? "📷 Seguir: ON" : "📷 Seguir: OFF";
    followBtn.style.background = followCam ? "#0284c7" : "#334155";
  });
  camRow.appendChild(followBtn);

  camRow.appendChild(makeBtn("🎯 Focar", () => {
    if (selectedNPC && onFocusNPC) onFocusNPC(selectedNPC);
  }));
  camRow.appendChild(makeBtn("🎥 Nível Chão", () => {
    const t = selectedNPC ? selectedNPC.position : controls.target;
    controls.target.set(t.x, 1.0, t.z);
    camera.position.set(t.x + 3.5, 1.8, t.z + 5.5);
  }));
  camRow.appendChild(makeBtn("🗺️ Geral", () => {
    followCam = false;
    followBtn.textContent = "📷 Seguir: OFF";
    followBtn.style.background = "#334155";
    controls.target.set(0, 0, 0);
    camera.position.set(22, 20, 26);
  }));

  document.body.appendChild(wrap);

  const forwardVec = new THREE.Vector3();
  const rightVec = new THREE.Vector3();

  return {
    selectNPC,
    getSelected: () => selectedNPC,
    isMoveMode: () => moveMode,
    handleGroundTap(point) {
      if (moveMode && selectedNPC && point) {
        npcs.walkTo(selectedNPC, point.x, point.z);
        toggleMoveMode(false);
        return true;
      }
      return false;
    },
    update(dt) {
      if (!selectedNPC || !selectedNPC.parent || !selectedNPC.parent.visible) return;

      // Calcula direção relativa à visão atual da câmera
      camera.getWorldDirection(forwardVec);
      forwardVec.y = 0;
      if (forwardVec.lengthSq() > 0.0001) forwardVec.normalize();
      rightVec.set(-forwardVec.z, 0, forwardVec.x);

      let moveX = 0;
      let moveZ = 0;
      if (activeDirs.up) { moveX += forwardVec.x; moveZ += forwardVec.z; }
      if (activeDirs.down) { moveX -= forwardVec.x; moveZ -= forwardVec.z; }
      if (activeDirs.right) { moveX += rightVec.x; moveZ += rightVec.z; }
      if (activeDirs.left) { moveX -= rightVec.x; moveZ -= rightVec.z; }

      const len = Math.hypot(moveX, moveZ);
      if (len > 0.01) {
        const prevX = selectedNPC.position.x;
        const prevZ = selectedNPC.position.z;
        npcs.moveBy(selectedNPC, moveX / len, moveZ / len, dt);
        if (followCam) {
          const dx = selectedNPC.position.x - prevX;
          const dz = selectedNPC.position.z - prevZ;
          controls.target.x += dx;
          controls.target.z += dz;
          camera.position.x += dx;
          camera.position.z += dz;
        }
      } else if (followCam) {
        controls.target.lerp(new THREE.Vector3(selectedNPC.position.x, 1.0, selectedNPC.position.z), 0.12);
      }
    }
  };
}