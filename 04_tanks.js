"use strict";
/* =====================================================
   04_tanks.js — REIGN OF BATTLE
   Tank objects, barrel tip, fire logic, canvas drawTank
   ===================================================== */

// ===== CREATE TANK =====
function makeTank(x, facing, team, specIdx) {
  return {
    x: x,
    y: 0,
    power: 500,
    facing: facing,
    hp: 1000,
    maxHp: 1000,
    team: team,
    alive: true,
    recoil: 0,
    flashT: 0,
    turretAngle: 45,
    targetAngle: 45,
    spec: TANK_SPECS[specIdx] || TANK_SPECS[0]
  };
}

// ===== INSTANCES =====
let player = makeTank(W * 0.15,  1, "player", selectedTankIdx);
let enemy  = makeTank(W * 0.85, -1, "enemy",  ENEMY_TANK_IDX);

// ===== BARREL TIP =====
function getBarrelTip(t) {
  const rad = (t.turretAngle * Math.PI) / 180;
  const pivotY = t.y - 14;
  const tipX = t.x + Math.cos(rad) * BARREL_LENGTH * t.facing;
  const tipY = pivotY - Math.sin(rad) * BARREL_LENGTH;
  return { x: tipX, y: tipY };
}

// ===== FIRE =====
function fireTank(t) {
  if (projectiles.length > 0 && currentScreen === "playing") return;
  if (!t.alive) return;

  if (soundOn && currentScreen === "playing") playFireSound();

  const tip = getBarrelTip(t);
  const rad = (t.turretAngle * Math.PI) / 180;
  const speed = t.power;

  projectiles.push({
    x: tip.x,
    y: tip.y,
    vx: Math.cos(rad) * speed * t.facing,
    vy: -Math.sin(rad) * speed,
    trail: [],
    owner: t
  });

  t.recoil = 1;
  t.flashT = 0.15;
  spawnMuzzleParticles(tip.x, tip.y, t.turretAngle, t.facing);

  if (currentScreen === "playing") aimLocked = true;
}

// ===== DRAW TANK (canvas vector) =====
function drawTank(t) {
  // Wreck rendering
  if (!t.alive) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 14, 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3f4c";
    ctx.fillRect(-35, -11, 70, 22);
    ctx.strokeStyle = "#dc4646";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, -20); ctx.lineTo(15, 5);
    ctx.moveTo( 15, -20); ctx.lineTo(-15, 5);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(t.x, t.y);

  const bob = Math.sin(globalTime * 2 + t.x * 0.01) * 0.8;
  ctx.translate(0, bob);

  if (t.facing === -1) ctx.scale(-1, 1);
  ctx.translate(-t.recoil * 6, 0);

  // Shadow
  const shadowGrad = ctx.createRadialGradient(0, 14, 2, 0, 14, 42);
  shadowGrad.addColorStop(0,   "rgba(0,0,0,0.55)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.25)");
  shadowGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 14, 42, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const spec = t.spec || TANK_SPECS[0];
  const bodyC   = spec.bodyColor;
  const darkC   = spec.darkColor;
  const turretC = spec.turretColor;
  const rimC    = spec.rimColor;

  // Body
  ctx.fillStyle = bodyC;
  ctx.strokeStyle = darkC;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-35, -11, 70, 22, 6);
  ctx.fill();
  ctx.stroke();

  // Wheels
  ctx.fillStyle = "#1e2430";
  for (let bx = -26; bx <= 26; bx += 13) {
    ctx.beginPath(); ctx.arc(bx, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#333c4d";
    ctx.beginPath(); ctx.arc(bx, 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e2430";
  }

  // Rim light
  ctx.strokeStyle = rimC;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-32, -10);
  ctx.lineTo( 32, -10);
  ctx.stroke();

  // Top band
  ctx.fillStyle = darkC;
  ctx.fillRect(-22, -14, 44, 5);

  // Turret dome
  ctx.fillStyle = turretC;
  ctx.beginPath();
  ctx.arc(0, -14, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkC;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Turret highlight
  ctx.fillStyle = rimC;
  ctx.beginPath();
  ctx.arc(-3, -17, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Barrel + flash
  ctx.save();
  ctx.translate(0, -14);
  ctx.rotate((-t.turretAngle * Math.PI) / 180);

  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(BARREL_LENGTH, 0);
  ctx.stroke();

  ctx.strokeStyle = darkC;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(BARREL_LENGTH, 0);
  ctx.stroke();

  ctx.strokeStyle = rimC;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(6, -2); ctx.lineTo(BARREL_LENGTH - 4, -2);
  ctx.stroke();

  // Muzzle cap
  ctx.fillStyle = "#0a0f14";
  ctx.beginPath();
  ctx.arc(BARREL_LENGTH, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rimC;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (t.flashT > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const alpha = Math.min(1, t.flashT / 0.15);
    const radius = 22 * alpha;
    const haloGrad = ctx.createRadialGradient(BARREL_LENGTH, 0, 2, BARREL_LENGTH, 0, radius);
    haloGrad.addColorStop(0,   `rgba(255,245,200,${alpha * 0.7})`);
    haloGrad.addColorStop(0.4, `rgba(255,200,70,${alpha * 0.5})`);
    haloGrad.addColorStop(1,   "rgba(255,140,30,0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(BARREL_LENGTH, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(BARREL_LENGTH, 0, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}