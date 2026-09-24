"use strict";
/* =====================================================
   08_hud.js — REIGN OF BATTLE
   Sky, terrain, scenery, craters, projectiles, particles, trajectory,
   HUD panels, damage numbers, game over, fade
   ===================================================== */

// ===== SKY =====
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,    "#101a2e");
  g.addColorStop(0.65, "#0b1220");
  g.addColorStop(1,    "#05060a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  for (const s of stars) {
    const twinkle = s.baseAlpha + Math.sin(globalTime * s.speed + s.phase) * 0.22;
    const alpha = Math.max(0.08, Math.min(0.7, twinkle));
    ctx.fillStyle = `rgba(220,240,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  for (const c of clouds) {
    c.x += c.speed * dtGlobal;
    if (c.x > W + c.w) c.x = -c.w - 50;

    const cloudGrad = ctx.createRadialGradient(
      c.x + c.w * 0.5, c.y + c.h * 0.5, c.h * 0.2,
      c.x + c.w * 0.5, c.y + c.h * 0.5, c.w * 0.55
    );
    cloudGrad.addColorStop(0,   "rgba(95,140,190,0.12)");
    cloudGrad.addColorStop(0.6, "rgba(70,105,155,0.06)");
    cloudGrad.addColorStop(1,   "rgba(40,65,100,0)");
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.ellipse(c.x + c.w * 0.5, c.y + c.h * 0.5, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Sun
  const sx = W * 0.78;
  const sy = H * 0.18;

  const outerHalo = ctx.createRadialGradient(sx, sy, 10, sx, sy, 110);
  outerHalo.addColorStop(0,    "rgba(255,196,65,0.15)");
  outerHalo.addColorStop(0.45, "rgba(255,196,65,0.06)");
  outerHalo.addColorStop(1,    "rgba(255,196,65,0)");
  ctx.fillStyle = outerHalo;
  ctx.beginPath(); ctx.arc(sx, sy, 110, 0, Math.PI * 2); ctx.fill();

  const glow = ctx.createRadialGradient(sx, sy, 5, sx, sy, 55);
  glow.addColorStop(0,    "rgba(255,240,180,0.7)");
  glow.addColorStop(0.35, "rgba(255,196,65,0.5)");
  glow.addColorStop(1,    "rgba(255,196,65,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(sx, sy, 55, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffc441";
  ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();

  // Far hills
  const farGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
  farGrad.addColorStop(0, "rgba(85,130,175,0.25)");
  farGrad.addColorStop(1, "rgba(20,35,60,0.05)");
  ctx.fillStyle = farGrad;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) {
    ctx.lineTo(x, H * 0.62 + Math.sin(x * 0.003 + 1.2) * 70);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Mid hills
  const midGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  midGrad.addColorStop(0,   "rgba(50,85,125,0.45)");
  midGrad.addColorStop(0.7, "rgba(25,45,75,0.35)");
  midGrad.addColorStop(1,   "rgba(10,20,35,0.2)");
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) {
    ctx.lineTo(x, H * 0.68 + Math.sin(x * 0.006 + 3.5) * 50);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

// ===== TERRAIN =====
function drawTerrain() {
  const g = ctx.createLinearGradient(0, 200, 0, H);
  g.addColorStop(0.0, "#4a8f40");
  g.addColorStop(0.1, "#3a7030");
  g.addColorStop(0.4, "#6b4a2e");
  g.addColorStop(1.0, "#2a1a0f");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x < W; x++) ctx.lineTo(x, heights[x]);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(25,45,20,0.75)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, heights[0] + 3);
  for (let x = 1; x < W; x++) ctx.lineTo(x, heights[x] + 3);
  ctx.stroke();

  ctx.strokeStyle = "#5cb350";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, heights[0]);
  for (let x = 1; x < W; x++) ctx.lineTo(x, heights[x]);
  ctx.stroke();

  ctx.strokeStyle = "#80d870";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, heights[0] - 1);
  for (let x = 1; x < W; x++) ctx.lineTo(x, heights[x] - 1);
  ctx.stroke();

  ctx.fillStyle = "rgba(160,235,140,0.4)";
  for (let x = 12; x < W; x += 28) {
    const y = heights[x] + 2;
    ctx.fillRect(x, y, 2, 2);
    if (x % 56 === 0) ctx.fillRect(x + 4, y + 3, 2, 1);
  }
}

// ===== ADDED: SCENERY (Trees & Bushes) =====
function drawScenery() {
  for (const s of scenery) {
    const xi = Math.max(0, Math.min(W - 1, Math.round(s.x)));
    const gy = heights[xi];
    if (gy >= H - 5) continue;
    if (s.type === "tree") drawTree(s.x, gy, s.scale);
    else                   drawBush(s.x, gy, s.scale);
  }
}

function drawTree(x, baseY, scale) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  // Trunk
  ctx.fillStyle = "#4a3220";
  ctx.fillRect(-3, -18, 6, 18);
  // Canopy
  ctx.fillStyle = "#2e6b35";
  ctx.beginPath();
  ctx.arc(-8, -28, 12, 0, Math.PI * 2);
  ctx.arc( 8, -28, 12, 0, Math.PI * 2);
  ctx.arc( 0, -40, 14, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = "#4d9a55";
  ctx.beginPath();
  ctx.arc(-4, -38, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBush(x, baseY, scale) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#2e6b35";
  ctx.beginPath();
  ctx.arc(-7, -6, 9, 0, Math.PI * 2);
  ctx.arc( 7, -6, 9, 0, Math.PI * 2);
  ctx.arc( 0, -10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4d9a55";
  ctx.beginPath();
  ctx.arc(-3, -11, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== CRATERS =====
function drawCraters() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const c of craters) {
    const t = c.age / c.maxAge;
    const a = (1 - t) * 0.6;
    const rad = c.r * (1 + t * 0.5);
    const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, rad);
    g.addColorStop(0,   `rgba(255,200,100,${a})`);
    g.addColorStop(0.5, `rgba(255,120,40,${a * 0.5})`);
    g.addColorStop(1,   "rgba(255,80,20,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ===== PROJECTILES =====
function drawProjectiles() {
  for (const p of projectiles) {
    for (let i = 0; i < p.trail.length; i++) {
      const pt = p.trail[i];
      const frac = i / p.trail.length;
      const a = frac * 0.7;
      const r = 1.5 + frac * 3.5;
      ctx.fillStyle = `rgba(255,200,110,${a})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 14);
    g.addColorStop(0,    "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,210,80,0.9)");
    g.addColorStop(0.7,  "rgba(255,130,20,0.4)");
    g.addColorStop(1,    "rgba(255,80,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ===== PARTICLES =====
function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = `rgba(${p.color},${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ===== TRAJECTORY PREVIEW =====
function drawTrajectory() {
  const activeTank = turn === "player" ? player : enemy;
  if (gameMode === "1P" && turn !== "player") return;
  if (aimLocked || currentScreen === "over" || !activeTank.alive) return;

  // Aim range arc
  ctx.save();
  ctx.strokeStyle = "rgba(255,196,65,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const arcRadius = 80;
  const startA = (-MIN_ANGLE * Math.PI) / 180;
  const endA   = (-MAX_ANGLE * Math.PI) / 180;
  ctx.arc(activeTank.x, activeTank.y - 14, arcRadius,
          startA * activeTank.facing,
          endA   * activeTank.facing,
          activeTank.facing === -1);
  ctx.stroke();
  ctx.restore();

  const tip = getBarrelTip(activeTank);
  const rad = (activeTank.turretAngle * Math.PI) / 180;
  let sx = tip.x, sy = tip.y;
  let vx = Math.cos(rad) * activeTank.power * activeTank.facing;
  let vy = -Math.sin(rad) * activeTank.power;
  const dt = FIXED_DT;

  let impactX = null, impactY = null;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 80; i++) {
    const px = sx, py = sy;
    vy += GRAVITY * dt;
    vx += wind * dt;
    sx += vx * dt;
    sy += vy * dt;

    const gi = Math.round(sx);
    if (gi < 0 || gi >= W) break;
    if (sy >= heights[gi]) {
      impactX = px;
      impactY = py;
      break;
    }
    const a = 0.6 - (i / 80) * 0.45;

    ctx.fillStyle = `rgba(255,210,110,${a * 0.2})`;
    ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,230,150,${a})`;
    ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  if (impactX !== null) {
    const pulse = 0.75 + Math.sin(globalTime * 6) * 0.25;
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${pulse})`;
    ctx.fillStyle   = `rgba(255,255,255,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(impactX, impactY, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(impactX - 14, impactY);
    ctx.lineTo(impactX + 14, impactY);
    ctx.moveTo(impactX, impactY - 14);
    ctx.lineTo(impactX, impactY + 14);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(impactX, impactY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const chevBob = Math.sin(globalTime * 8) * 3;
    const cy = impactY - 26 + chevBob;
    ctx.strokeStyle = `rgba(255,196,65,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(impactX - 8, cy - 6);
    ctx.lineTo(impactX,     cy);
    ctx.lineTo(impactX + 8, cy - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(impactX - 6, cy - 12);
    ctx.lineTo(impactX,     cy - 6);
    ctx.lineTo(impactX + 6, cy - 12);
    ctx.stroke();

    ctx.restore();
  }
}

// ===== DAMAGE NUMBERS =====
function drawDamageNumbers() {
  ctx.save();
  for (const d of dmgNums) {
    const alpha = Math.max(0, 1 - d.age / d.maxAge);
    const col = d.isCrit ? "#ffffff" : "#ff5a5a";
    ctx.globalAlpha = alpha;
    ctx.font = "bold 15px 'Press Start 2P', Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(`-${d.val}`, d.x, d.y);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = d.isCrit ? 8 : 4;
    ctx.fillText(`-${d.val}`, d.x, d.y);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ===== PANEL BACKGROUND =====
function drawPanelBackground(x, y, w, h, radius, borderColor, glowColor, isTurnActive) {
  ctx.save();

  if (isTurnActive) {
    const pulse = 6 + Math.sin(globalTime * 5) * 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = pulse;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
  }

  ctx.fillStyle = "rgba(15,25,45,0.95)";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();

  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 2;
  for (let sx = -h; sx < w + h; sx += 12) {
    ctx.beginPath();
    ctx.moveTo(x + sx, y);
    ctx.lineTo(x + sx + h, y + h);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, Math.max(2, radius - 1));
  ctx.stroke();

  const topAccent = ctx.createLinearGradient(x + 10, y, x + w - 10, y);
  topAccent.addColorStop(0,   "rgba(255,255,255,0)");
  topAccent.addColorStop(0.5, borderColor);
  topAccent.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = topAccent;
  ctx.fillRect(x + 10, y + 2, w - 20, 2);

  ctx.restore();
  ctx.restore();
}

// ===== HUD =====
function drawHUD() {
  ctx.save();

  const isPlayerTurn = turn === "player";

  drawUnitPanel(20, 15, 340, player, "player", isPlayerTurn);
  drawUnitPanel(W - 360, 15, 340, enemy, "enemy", !isPlayerTurn);

  // Wind panel
  const wPanelW = 160, wPanelH = 55;
  const wPanelX = W / 2 - wPanelW / 2;
  const wPanelY = 15;
  drawPanelBackground(wPanelX, wPanelY, wPanelW, wPanelH, 10, "#5fd8ff", "#5fd8ff", false);

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 11px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = "#9fb0c8";
  ctx.fillText("WIND", W / 2, wPanelY + 18);

  const bounce = Math.sin(globalTime * 4) * 2;
  const wa = Math.round(Math.abs(wind));
  const wd = wind >= 0 ? "→" : "←";
  const wc = Math.abs(wind) >= 90 ? "#ffc441" : "#5fd8ff";
  ctx.fillStyle = wc;
  ctx.font = "bold 18px 'Silkscreen', Segoe UI, Arial";
  const arrowShift = wind >= 0 ? bounce : -bounce;
  ctx.fillText(`${wd} ${wa}`, W / 2 + arrowShift, wPanelY + 42);
  ctx.restore();

  // Turn indicator
  const turnText = gameMode === "2P"
    ? (isPlayerTurn ? "PLAYER 1 TURN" : "PLAYER 2 TURN")
    : (isPlayerTurn ? "YOUR TURN" : "ENEMY TURN");
  const turnColor = isPlayerTurn ? "#ffc441" : "#ff5a5a";
  const pulseScale = 1 + Math.sin(globalTime * 6) * 0.03;

  ctx.save();
  ctx.translate(W / 2, 110);
  ctx.scale(pulseScale, pulseScale);
  ctx.font = "bold 20px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = turnColor;
  ctx.shadowColor = turnColor;
  ctx.shadowBlur = 10;
  ctx.textAlign = "center";
  ctx.fillText(turnText, 0, 0);
  ctx.font = "bold 14px 'Silkscreen', Segoe UI, Arial";
  ctx.shadowBlur = 6;
  ctx.fillText("▼", 0, 18);
  ctx.restore();

  ctx.restore();
}

// ===== UNIT PANEL =====
function drawUnitPanel(x, y, w, tank, team, isActive) {
  const isPlayer = team === "player";
  const borderCol = isPlayer ? "#ffc441" : "#ff5a5a";
  const titleText = isPlayer ? "PLAYER 1" : (gameMode === "2P" ? "PLAYER 2" : "OPPONENT");
  const subCol = isPlayer ? "#9fb0c8" : "#ffb0b0";

  drawPanelBackground(x, y, w, 76, 10, borderCol, borderCol, isActive);

  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "bold 14px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = borderCol;
  ctx.fillText(titleText, x + 16, y + 26);

  ctx.font = "bold 11px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = subCol;
  const specName = tank.spec ? tank.spec.name : "TANK";
  ctx.fillText(`${specName} · SHELL`, x + 16, y + 43);

  const barX = x + 16;
  const barY = y + 50;
  const barW = w - 32;
  const barH = 16;

  ctx.fillStyle = "rgba(10,15,25,0.9)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const hpFrac = Math.max(0, Math.min(1, tank.hp / tank.maxHp));
  if (hpFrac > 0) {
    const fillWidth = Math.max(8, barW * hpFrac);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barH, 8);
    ctx.clip();

    const fillGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    if (isPlayer) {
      fillGrad.addColorStop(0, "#8ef0a0");
      fillGrad.addColorStop(1, "#50b864");
    } else {
      fillGrad.addColorStop(0, "#ff8080");
      fillGrad.addColorStop(1, "#dc3535");
    }
    ctx.fillStyle = fillGrad;
    ctx.fillRect(barX, barY, fillWidth, barH);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(barX, barY + 1, fillWidth, 2);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 9; i++) {
    const tx = barX + (barW * (i * 0.1));
    ctx.beginPath();
    ctx.moveTo(tx, barY + 3);
    ctx.lineTo(tx, barY + barH - 3);
    ctx.stroke();
  }

  ctx.textAlign = "right";
  ctx.font = "bold 11px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillText(`${Math.round(tank.hp)}/${tank.maxHp}`, barX + barW - 9, barY + 12.5 + 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${Math.round(tank.hp)}/${tank.maxHp}`, barX + barW - 10, barY + 12.5);

  ctx.restore();
}

// ===== GAME OVER =====
function drawGameOver() {
  ctx.fillStyle = "rgba(5,8,15,0.85)";
  ctx.fillRect(0, 0, W, H);

  let msg = "";
  let col = "#ffc441";
  if (gameMode === "2P") {
    msg = winner === "player" ? "PLAYER 1 WINS!" : winner === "enemy" ? "PLAYER 2 WINS!" : "DRAW";
    col = winner === "player" ? "#ffc441" : winner === "enemy" ? "#ffc441" : "#9fb0c8";
  } else {
    msg = winner === "player" ? "VICTORY!" : winner === "enemy" ? "DEFEAT" : "DRAW";
    col = winner === "player" ? "#ffc441" : winner === "enemy" ? "#dc7a7a" : "#9fb0c8";
  }

  ctx.textAlign = "center";
  ctx.font = "bold 52px 'Press Start 2P', Segoe UI, Arial";
  ctx.strokeStyle = "rgba(15,8,4,0.75)";
  ctx.lineWidth = 6;
  ctx.strokeText(msg, W / 2, H / 2 - 20);

  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 20;
  ctx.fillText(msg, W / 2, H / 2 - 20);
  ctx.shadowBlur = 0;

  ctx.font = "26px 'Bebas Neue', 'Segoe UI', Arial";
  ctx.fillStyle = "#9fb0c8";
ctx.fillText("Press R to Restart · ESC for Menu", W / 2, H / 2 + 50);
}

// ===== FADE =====
function drawFade() {
  if (fadeAlpha > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(5,6,10,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// ===== FADE UPDATE =====
function updateFade(dt) {
  if (isFading) {
    fadeAlpha += dt * 2.5;
    if (fadeAlpha >= 1) {
      fadeAlpha = 1;
      currentScreen = pendingScreen;
      isFading = false;
      updateMusicForScreen();   // NEW: handle music on screen change
    }
  } else if (fadeAlpha > 0) {
    fadeAlpha -= dt * 2.5;
    if (fadeAlpha < 0) fadeAlpha = 0;
  }
}