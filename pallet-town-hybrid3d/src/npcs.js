import * as THREE from "three";

export const CHARACTERS = {
  red: {
    name: "Red",
    quote: "Hora de começar nossa jornada por Kanto!",
    shirt: "#d93025",
    pants: "#2b303a",
    shoes: "#d93025",
    hat: "#d93025",
    hatTrim: "#ffffff",
    hair: null,
    defaultExpr: "happy"
  },
  leaf: {
    name: "Leaf",
    quote: "O Prof. Carvalho já está esperando no Laboratório!",
    shirt: "#16a085",
    pants: "#2b303a",
    shoes: "#ffffff",
    hat: "#ffffff",
    hatTrim: "#d93025",
    hair: "#8c522b",
    defaultExpr: "normal"
  },
  blue: {
    name: "Blue",
    quote: "Hmpf! Você ainda está escolhendo seu primeiro Pokémon?",
    shirt: "#22252a",
    pants: "#2c3e50",
    shoes: "#22252a",
    hat: null,
    hair: "#9c5a2b",
    defaultExpr: "smug"
  },
  oak: {
    name: "Prof. Carvalho",
    quote: "Este mundo é habitado por criaturas chamadas Pokémon!",
    shirt: "#f8f9fa",
    innerShirt: "#8e2430",
    pants: "#5d4037",
    shoes: "#2c221e",
    hat: null,
    hair: "#95a5a6",
    defaultExpr: "normal"
  }
};

function strokeFill(ctx, drawFn, fill, stroke = "#141414", lw = 6) {
  ctx.beginPath();
  drawFn();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawStickmanCharacter(ctx, id, state) {
  const c = CHARACTERS[id];
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { walkPhase, idlePhase, action, expr, lookX, emote, jumpOffset, facing, selected } = state;

  const isWalking = action === "walk";
  const isWaving = action === "wave";
  const breath = Math.sin(idlePhase) * 3;
  const walkBob = isWalking ? Math.abs(Math.sin(walkPhase)) * -8 : 0;
  const bodyTilt = isWalking ? Math.sin(walkPhase) * 0.08 : Math.sin(idlePhase * 0.5) * 0.03;
  const legAngle = isWalking ? Math.sin(walkPhase) * 0.44 : 0.08;
  const armAngle = isWalking ? -Math.sin(walkPhase) * 0.55 : Math.sin(idlePhase) * 0.12 + 0.25;

  ctx.save();
  ctx.translate(W / 2, 238 + walkBob - jumpOffset);

  // Indicador discreto de seleção nos pés
  if (selected) {
    ctx.beginPath();
    ctx.ellipse(0, 122, 46, 12, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  if (facing < 0) ctx.scale(-1, 1);

  // 1. PERNAS E TÊNIS
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 16, 62);
    ctx.rotate(side * legAngle);

    strokeFill(ctx, () => ctx.roundRect(-8, 0, 16, 54, 8), c.pants, "#141414", 5.5);
    strokeFill(ctx, () => ctx.roundRect(-12, 46, 32, 18, [10, 12, 6, 6]), c.shoes, "#141414", 5.5);
    strokeFill(ctx, () => ctx.roundRect(-12, 58, 32, 7, 3), "#ffffff", "#141414", 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(2, 49, 8, 3);
    ctx.fillRect(4, 53, 8, 3);
    ctx.restore();
  }

  // 2. TRONCO E BRAÇOS
  ctx.save();
  ctx.rotate(bodyTilt);

  // Braço de trás
  ctx.save();
  ctx.translate(-26, 8 + breath * 0.4);
  ctx.rotate(armAngle);
  strokeFill(ctx, () => ctx.roundRect(-7, 0, 14, 42, 7), "#f7f7f5", "#141414", 5.5);
  strokeFill(ctx, () => ctx.roundRect(-9, -2, 18, 18, 6), c.shirt, "#141414", 5.5);
  strokeFill(ctx, () => ctx.arc(0, 44, 8, 0, Math.PI * 2), "#f7f7f5", "#141414", 5);
  ctx.restore();

  // Tronco
  const torsoH = 62 - breath * 0.4;
  if (id === "oak") {
    strokeFill(ctx, () => ctx.roundRect(-26, 0, 52, torsoH, 12), c.innerShirt, "#141414", 6);
    strokeFill(ctx, () => ctx.roundRect(-30, -2, 26, torsoH + 12, 8), c.shirt, "#141414", 5.5);
    strokeFill(ctx, () => ctx.roundRect(4, -2, 26, torsoH + 12, 8), c.shirt, "#141414", 5.5);
  } else {
    strokeFill(ctx, () => ctx.roundRect(-27, 0, 54, torsoH, 13), c.shirt, "#141414", 6);
    if (id === "red") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-4, 4, 8, torsoH - 8);
    }
    if (id === "blue") {
      strokeFill(ctx, () => ctx.arc(0, 18, 5, 0, Math.PI * 2), "#f5c518", "#141414", 3.5);
    }
  }

  // Braço da frente (com suporte para acenar "wave")
  ctx.save();
  ctx.translate(26, 8 + breath * 0.4);
  if (isWaving) {
    ctx.rotate(-2.45 + Math.sin(idlePhase * 2.8) * 0.35);
  } else {
    ctx.rotate(-armAngle);
  }
  strokeFill(ctx, () => ctx.roundRect(-7, 0, 14, 42, 7), "#f7f7f5", "#141414", 5.5);
  strokeFill(ctx, () => ctx.roundRect(-9, -2, 18, 18, 6), c.shirt, "#141414", 5.5);
  strokeFill(ctx, () => ctx.arc(0, 44, 8, 0, Math.PI * 2), "#f7f7f5", "#141414", 5);
  ctx.restore();

  // 3. CABEÇA REDONDA STICKMAN
  const headY = -66 + breath * 0.6;
  const headTilt = isWalking ? -bodyTilt * 0.5 : Math.sin(idlePhase * 0.7) * 0.04;

  ctx.save();
  ctx.translate(0, headY);
  ctx.rotate(headTilt);

  if (id === "leaf") {
    strokeFill(ctx, () => {
      ctx.moveTo(42, -10);
      ctx.quadraticCurveTo(76, -6, 68, 28);
      ctx.quadraticCurveTo(52, 22, 42, 8);
      ctx.closePath();
    }, c.hair, "#141414", 5.5);
  }

  strokeFill(ctx, () => ctx.arc(0, 0, 56, 0, Math.PI * 2), "#f7f7f5", "#141414", 6.5);

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 53, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
  ctx.beginPath();
  ctx.arc(16, 6, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. EXPRESSÕES FACIAIS COMPLETAS (6 expressões + piscar)
  const exOffset = lookX * 3;
  for (const side of [-1, 1]) {
    const ex = side * 21 + exOffset;
    const ey = 2;

    if (expr === "blink") {
      strokeFill(ctx, () => {
        ctx.moveTo(ex - 10, ey);
        ctx.lineTo(ex + 10, ey);
      }, null, "#141414", 5.5);
    } else if (expr === "happy" || emote) {
      strokeFill(ctx, () => {
        ctx.arc(ex, ey + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
      }, null, "#141414", 5.5);
    } else if (expr === "sad") {
      ctx.fillStyle = "#141414";
      ctx.beginPath();
      ctx.ellipse(ex, ey + 3, 7.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const rY = expr === "surprised" ? 15.5 : 13.5;
      ctx.fillStyle = "#141414";
      ctx.beginPath();
      ctx.ellipse(ex, ey, 8.5, rY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 2.5, ey - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sobrancelhas por expressão
    strokeFill(ctx, () => {
      if (expr === "angry") {
        ctx.moveTo(ex - 11, ey - 18 - side * 6);
        ctx.lineTo(ex + 11, ey - 18 + side * 6);
      } else if (expr === "sad") {
        ctx.moveTo(ex - 11, ey - 16 + side * 5);
        ctx.lineTo(ex + 11, ey - 16 - side * 5);
      } else if (expr === "smug") {
        ctx.moveTo(ex - 11, ey - 18 - side * 4);
        ctx.lineTo(ex + 11, ey - 18 + side * 4);
      } else if (expr === "surprised") {
        ctx.arc(ex, ey - 22, 10, Math.PI * 1.15, Math.PI * 1.85);
      } else {
        ctx.moveTo(ex - 10, ey - 19 + side * 2);
        ctx.lineTo(ex + 10, ey - 19 - side * 2);
      }
    }, null, "#141414", 5);
  }

  // Boca por expressão
  const mx = exOffset * 0.8;
  const my = 28;
  if (emote || expr === "happy") {
    strokeFill(ctx, () => {
      ctx.arc(mx, my - 2, 13, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.closePath();
    }, "#e74c3c", "#141414", 5);
  } else if (expr === "surprised") {
    strokeFill(ctx, () => {
      ctx.ellipse(mx, my + 2, 7, 10, 0, 0, Math.PI * 2);
    }, "#141414", "#141414", 4);
  } else if (expr === "angry") {
    strokeFill(ctx, () => {
      ctx.moveTo(mx - 12, my + 6);
      ctx.lineTo(mx - 4, my);
      ctx.lineTo(mx + 4, my + 5);
      ctx.lineTo(mx + 12, my);
    }, null, "#141414", 5);
  } else if (expr === "sad") {
    strokeFill(ctx, () => {
      ctx.arc(mx, my + 10, 10, Math.PI * 1.15, Math.PI * 1.85);
    }, null, "#141414", 5);
  } else if (expr === "smug") {
    strokeFill(ctx, () => {
      ctx.moveTo(mx - 12, my + 2);
      ctx.quadraticCurveTo(mx, my + 8, mx + 14, my - 3);
    }, null, "#141414", 5);
  } else {
    strokeFill(ctx, () => {
      ctx.arc(mx, my - 2, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    }, null, "#141414", 5);
  }

  // 5. ACESSÓRIO DO PERSONAGEM
  if (c.hat) {
    strokeFill(ctx, () => ctx.roundRect(-48, -68, 96, 32, [28, 28, 6, 6]), c.hat, "#141414", 6);
    strokeFill(ctx, () => ctx.roundRect(-52, -42, 108, 12, 6), c.hatTrim, "#141414", 5.5);
    if (id === "red") {
      strokeFill(ctx, () => ctx.arc(0, -70, 5, 0, Math.PI * 2), c.hat, "#141414", 4);
      strokeFill(ctx, () => {
        ctx.arc(0, -44, 14, Math.PI, 0);
        ctx.closePath();
      }, "#ffffff", "#141414", 4.5);
    }
  } else if (c.hair) {
    strokeFill(ctx, () => {
      ctx.moveTo(-42, -38);
      ctx.lineTo(-48, -62);
      ctx.lineTo(-22, -52);
      ctx.lineTo(-4, -74);
      ctx.lineTo(16, -52);
      ctx.lineTo(44, -64);
      ctx.lineTo(40, -38);
      ctx.quadraticCurveTo(0, -46, -42, -38);
      ctx.closePath();
    }, c.hair, "#141414", 5.5);
  }

  if (emote) {
    strokeFill(ctx, () => ctx.roundRect(-22, -124, 44, 38, 12), "#ffffff", "#141414", 5);
    ctx.fillStyle = "#e03126";
    ctx.font = "900 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", 0, -95);
  }

  ctx.restore();
  ctx.restore();
  ctx.restore();
}

export function spawnStickmanNPC(parent, id, x, z, patrol = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  const initState = {
    walkPhase: 0,
    idlePhase: Math.random() * Math.PI * 2,
    action: patrol ? "walk" : "idle",
    expr: CHARACTERS[id].defaultExpr,
    lockedExpr: null,
    lookX: 0,
    emote: false,
    jumpOffset: 0,
    facing: 1,
    selected: false
  };
  drawStickmanCharacter(ctx, id, initState);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide
  });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, 0.03, z);
  parent.add(shadow);

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0), mat);
  mesh.position.set(x, 1.0, z);
  mesh.userData = {
    npcId: id,
    name: CHARACTERS[id].name,
    quote: CHARACTERS[id].quote,
    canvas,
    ctx,
    texture,
    state: initState,
    blinkTimer: 1.6 + Math.random() * 2.4,
    lookTimer: 1.4 + Math.random() * 2.0,
    emoteTimer: 0,
    jumpTimer: 0,
    pauseTimer: 0,
    baseX: x,
    baseZ: z,
    patrol,
    dir: 1,
    shadow
  };

  parent.add(mesh);
  return mesh;
}

export function createNPCs(envGroup, interiors) {
  const list = [];

  list.push(spawnStickmanNPC(envGroup, "red", -6.0, -3.2, null));
  list.push(spawnStickmanNPC(envGroup, "leaf", 6.0, -3.2, { axis: "x", range: 1.9, velocity: 0.95 }));
  list.push(spawnStickmanNPC(envGroup, "blue", 3.5, 11.2, { axis: "x", range: 2.5, velocity: 1.15 }));

  if (interiors.lab) {
    list.push(spawnStickmanNPC(interiors.lab, "oak", 0, -2.5, { axis: "x", range: 1.6, velocity: 0.75 }));
  }
  if (interiors.rival) {
    list.push(spawnStickmanNPC(interiors.rival, "blue", -2.2, 1.3, null));
  }
  if (interiors.bedroom) {
    list.push(spawnStickmanNPC(interiors.bedroom, "red", 0.6, -2.0, null));
  }

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
      if (actionName === "jump") {
        mesh.userData.jumpTimer = 0.5;
      }
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

        d.lookTimer -= dt;
        if (d.lookTimer <= 0) {
          d.lookTimer = 1.8 + Math.random() * 2.2;
          st.lookX = [-1, 0, 1][(Math.random() * 3) | 0];
        }

        const baseExpr = st.lockedExpr || CHARACTERS[d.npcId].defaultExpr;
        d.blinkTimer -= dt;
        if (d.emoteTimer > 0) {
          d.emoteTimer -= dt;
          st.emote = true;
          st.expr = "happy";
        } else {
          st.emote = false;
          if (d.blinkTimer <= -0.15) {
            st.expr = baseExpr;
            d.blinkTimer = 2.2 + Math.random() * 2.5;
          } else if (d.blinkTimer <= 0) {
            st.expr = "blink";
          } else {
            st.expr = baseExpr;
          }
        }

        if (d.jumpTimer > 0) {
          d.jumpTimer = Math.max(0, d.jumpTimer - dt);
          st.jumpOffset = Math.sin((d.jumpTimer / 0.45) * Math.PI) * 34;
        } else if (st.action === "jump") {
          st.jumpOffset = Math.abs(Math.sin(st.idlePhase * 1.8)) * 30;
        } else {
          st.jumpOffset = 0;
        }

        if (d.manualWalkTimer > 0) {
          d.manualWalkTimer -= dt;
          st.action = "walk";
          st.walkPhase += dt * 10.5;
          if (d.manualWalkTimer <= 0) st.action = "idle";
        } else if (d.targetPos) {
          const tx = d.targetPos.x - npc.position.x;
          const tz = d.targetPos.z - npc.position.z;
          const dist = Math.hypot(tx, tz);
          if (dist > 0.08) {
            st.action = "walk";
            st.walkPhase += dt * 10.0;
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
        } else if (d.patrol && d.emoteTimer <= 0) {
          if (d.pauseTimer > 0) {
            d.pauseTimer -= dt;
            st.action = "idle";
          } else {
            st.action = "walk";
            st.walkPhase += dt * 8.5;
            st.facing = d.dir;
            if (d.patrol.axis === "x") {
              npc.position.x += d.dir * d.patrol.velocity * dt;
              if (Math.abs(npc.position.x - d.baseX) >= d.patrol.range) {
                d.dir *= -1;
                d.pauseTimer = 1.2 + Math.random() * 1.4;
              }
            } else {
              npc.position.z += d.dir * d.patrol.velocity * dt;
              if (Math.abs(npc.position.z - d.baseZ) >= d.patrol.range) {
                d.dir *= -1;
                d.pauseTimer = 1.2 + Math.random() * 1.4;
              }
            }
            d.shadow.position.x = npc.position.x;
            d.shadow.position.z = npc.position.z;
          }
        } else if (st.action === "walk") {
          st.walkPhase += dt * 8.5;
        }

        drawStickmanCharacter(d.ctx, d.npcId, st);
        d.texture.needsUpdate = true;

        npc.rotation.y = Math.atan2(
          camera.position.x - npc.position.x,
          camera.position.z - npc.position.z
        );
      }
    }
  };
}