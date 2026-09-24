"use strict";
/* =====================================================
   05_physics.js — REIGN OF BATTLE
   Projectiles, damage, particles, end turn
   ===================================================== */

// ===== PROJECTILES =====
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.vy += GRAVITY * dt;
    p.vx += wind * dt;
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 30) p.trail.shift();

    const gi = Math.round(p.x);
    if (gi >= 0 && gi < W && p.y >= heights[gi]) {
      const hitY = heights[gi];
      spawnImpactParticles(p.x, hitY);
      carve(p.x, hitY, 55);
      camShake = 10;
      craters.push({ x: p.x, y: hitY, r: 55, age: 0, maxAge: 2.5 });

      if (currentScreen === "playing") {
        applyDamage(p.x, hitY, 55, 440, p.owner);
      }
      projectiles.splice(i, 1);
      if (currentScreen === "playing") endTurn();
      continue;
    }

    if (p.x < -60 || p.x > W + 60 || p.y > H + 100) {
      projectiles.splice(i, 1);
      if (currentScreen === "playing") endTurn();
    }
  }
}

// ===== DAMAGE =====
function applyDamage(x, y, radius, baseDmg, owner) {
  [player, enemy].forEach(t => {
    if (!t.alive) return;
    const dx = t.x - x;
    const dy = (t.y - 16) - y;
    const dist = Math.hypot(dx, dy);

    if (dist < radius * 1.4) {
      const falloff = Math.max(0, 1 - dist / (radius * 1.4));
      let dmg = Math.round(baseDmg * falloff);

      if (t === owner) {
        if (dist < radius * 0.6) {
          dmg = Math.round(dmg * 0.3);
          t.hp = Math.max(0, t.hp - dmg);
        } else {
          dmg = 0;
        }
      } else {
        t.hp = Math.max(0, t.hp - dmg);
      }

      if (dmg > 0) {
        hitFlash = 0.3;
        spawnDamageNumber(t.x, t.y - 16, dmg);
      }
      if (t.hp <= 0) t.alive = false;
    }
  });
}

// ===== DAMAGE NUMBERS =====
function spawnDamageNumber(x, y, dmg) {
  dmgNums.push({
    x: x + (Math.random() - 0.5) * 20,
    y: y - 20,
    val: dmg,
    isCrit: dmg >= 280,
    age: 0,
    maxAge: 1.0
  });
}

function updateDamageNumbers(dt) {
  for (let i = dmgNums.length - 1; i >= 0; i--) {
    const d = dmgNums[i];
    d.y -= 35 * dt;
    d.age += dt;
    if (d.age >= d.maxAge) dmgNums.splice(i, 1);
  }
}

// ===== END TURN =====
function endTurn() {
  aimLocked = false;

  if (!player.alive || !enemy.alive) {
    currentScreen = "over";
    if (!player.alive && !enemy.alive) winner = "draw";
    else if (!enemy.alive) winner = "player";
    else winner = "enemy";
    return;
  }

  if (gameMode === "2P") {
    turn = turn === "player" ? "enemy" : "player";
  } else {
    if (turn === "player") {
      turn = "enemy";
      enemyAIStart();
    } else {
      turn = "player";
    }
  }
}

// ===== PARTICLES =====
function spawnImpactParticles(x, y) {
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 150 + Math.random() * 220;
    const colors = ["255,220,80", "255,180,50", "255,130,40", "255,90,30"];
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 90,
      life: 0.5 + Math.random() * 0.4,
      maxLife: 0.9,
      size: 3 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 200 + Math.random() * 260;
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 120,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      size: 1.2 + Math.random() * 1.3,
      color: "255,250,200"
    });
  }
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 100 + Math.random() * 150;
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 60,
      life: 0.7 + Math.random() * 0.5,
      maxLife: 1.2,
      size: 5 + Math.random() * 4,
      color: "60,50,40"
    });
  }
}

function spawnMuzzleParticles(x, y, angleDeg, facing) {
  const rad = (angleDeg * Math.PI) / 180;
  for (let i = 0; i < 8; i++) {
    const spread = (Math.random() - 0.5) * 0.8;
    const sp = 100 + Math.random() * 140;
    particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(rad + spread) * sp * facing,
      vy: -Math.sin(rad + spread) * sp - 20,
      life: 0.25 + Math.random() * 0.2,
      maxLife: 0.45,
      size: 2.5 + Math.random() * 3.5,
      color: i < 3 ? "255,230,150" : "90,80,70"
    });
  }
  for (let i = 0; i < 5; i++) {
    const spread = (Math.random() - 0.5) * 0.4;
    const sp = 140 + Math.random() * 120;
    particles.push({
      x, y,
      vx: Math.cos(rad + spread) * sp * facing,
      vy: -Math.sin(rad + spread) * sp,
      life: 0.2,
      maxLife: 0.2,
      size: 1.5,
      color: "255,255,220"
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += GRAVITY * 0.5 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}