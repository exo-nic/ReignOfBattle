"use strict";
/* =====================================================
   12_loop.js — REIGN OF BATTLE
   Audio helper, resetGame, physicsStep, renderFrame,
   frame loop, resize, init
   ===================================================== */

// ===== AUDIO (called from 04_tanks.js) =====
function playFireSound() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";

    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) { /* silent fail */ }
}

// ===== RESET GAME =====
function resetGame(mode) {
  gameMode = mode || "1P";
  terrainSeed = Math.random() * 100;
  genTerrain(terrainSeed);

  player = makeTank(W * 0.15,  1, "player", selectedTankIdx);
  enemy  = makeTank(W * 0.85, -1, "enemy",  ENEMY_TANK_IDX);
  snapTank(player);
  snapTank(enemy);

  projectiles.length = 0;
  particles.length   = 0;
  craters.length     = 0;
  dmgNums.length     = 0;

  turn = "player";
  winner = null;
  aiState = "idle";
  aiThinkTime = 0;

  camShake = 0;
  hitFlash = 0;
  aimLocked = false;
  physicsAccumulator = 0;
  playingStartTime = globalTime;
}

// ===== PHYSICS STEP (60 Hz) =====
function physicsStep(fdt) {
  // Wind
  windTimer -= fdt;
  if (windTimer <= 0) {
    wind = (Math.random() - 0.5) * 2 * MAX_WIND;
    windTimer = 4 + Math.random() * 4;
  }

  // Smooth turret angle + timers
  [player, enemy].forEach(t => {
    t.turretAngle += (t.targetAngle - t.turretAngle) * Math.min(1, fdt * 10);
    if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - fdt * 4);
    if (t.flashT > 0) t.flashT = Math.max(0, t.flashT - fdt);
  });

  // Camera shake + hit flash
  if (camShake > 0) camShake = Math.max(0, camShake - fdt * 30);
  if (hitFlash > 0) hitFlash = Math.max(0, hitFlash - fdt * 2);

  // Craters age + prune expired
  for (let i = craters.length - 1; i >= 0; i--) {
    craters[i].age += fdt;
    if (craters[i].age >= craters[i].maxAge) craters.splice(i, 1);
  }

  // Fade transition
  updateFade(fdt);

  // ===== Screen routing =====
  if (currentScreen === "menu") {
    updateMenu(fdt);
    updateProjectiles(fdt);
    updateParticles(fdt);
    return;
  }
  if (currentScreen === "garage") {
    updateProjectiles(fdt);
    updateParticles(fdt);
    return;
  }

  // Playing state
  handleKeyboard(fdt);

  // NEW (৪.১): Joystick movement (mobile)
  if (effectiveControlMode() === "joystick") {
    const atk = turn === "player" ? player : enemy;
    applyJoystickMove(atk, fdt);
    updateJoystickVisuals(fdt);
  }

  const activeTank = turn === "player" ? player : enemy;
  aimAtMouse(activeTank);

  if (gameMode === "1P") updateAI(fdt);

  updateProjectiles(fdt);
  updateParticles(fdt);
  updateDamageNumbers(fdt);
}

// ===== RENDER FRAME =====
function renderFrame() {
  ctx.clearRect(0, 0, W, H);

  if (currentScreen === "menu") {
    ctx.save();
    drawMenuScreen();
    drawFade();
    ctx.restore();
    return;
  }

  if (currentScreen === "garage") {
    ctx.save();
    drawGarageScreen();
    drawFade();
    ctx.restore();
    return;
  }

  // Playing / Over
  ctx.save();
  if (camShake > 0) {
    const sx = (Math.random() - 0.5) * camShake;
    const sy = (Math.random() - 0.5) * camShake;
    ctx.translate(sx, sy);
  }

  drawSky();
  drawTerrain();
  drawCraters();
  drawTank(player);
  drawTank(enemy);
  drawProjectiles();
  drawParticles();
  drawTrajectory();
  drawDamageNumbers();

  // Intro title overlay (first 4.5s)
  const sinceStart = globalTime - playingStartTime;
  if (sinceStart < 4.5) {
    const fade = sinceStart < 3.5 ? 1 : Math.max(0, (4.5 - sinceStart));
    const bob = Math.sin(globalTime * 1.6) * 4;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.textAlign = "center";
    ctx.font = "bold 56px 'Press Start 2P', monospace";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(15,8,4,0.85)";
    ctx.strokeText("REIGN OF BATTLE", W / 2, 200 + bob);
    ctx.shadowColor = "rgba(255,196,65,0.7)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ffc441";
    ctx.fillText("REIGN OF BATTLE", W / 2, 200 + bob);
    ctx.shadowBlur = 0;
    ctx.font = "bold 20px 'Silkscreen', sans-serif";
    ctx.fillStyle = "#9fb0c8";
    ctx.fillText("Rule the Battlefield", W / 2, 250 + bob);
    ctx.restore();
  }

  drawHUD();

  // NEW (৪.২): Joystick overlay
  drawJoysticks();

  if (currentScreen === "over") drawGameOver();

  if (hitFlash > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255,60,60,${hitFlash * 0.4})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  drawFade();
  ctx.restore();
}

// ===== MAIN LOOP =====
function frame(now) {
  const rawDt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  globalTime += rawDt;
  dtGlobal = rawDt;

  physicsAccumulator += rawDt;
  while (physicsAccumulator >= FIXED_DT) {
    physicsStep(FIXED_DT);
    physicsAccumulator -= FIXED_DT;
  }

  renderFrame();
  requestAnimationFrame(frame);
}

// ===== RESIZE =====
function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = W * scale * dpr;
  canvas.height = H * scale * dpr;
  canvas.style.width  = (W * scale) + "px";
  canvas.style.height = (H * scale) + "px";
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  updateRotateWarning();
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", updateRotateWarning);

function updateRotateWarning() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobile = window.innerWidth < 900;
  const w = document.getElementById("rotate-warning");
  if (!w) return;
  w.style.display = (isMobile && isPortrait) ? "flex" : "none";
}

// ===== INIT =====
resize();
genTerrain(terrainSeed);
snapTank(player);
snapTank(enemy);
requestAnimationFrame(frame);