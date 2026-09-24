"use strict";
/* =====================================================
   06_ai.js — REIGN OF BATTLE
   Enemy AI: solveShot, enemyAIStart, updateAI
   ===================================================== */

// ===== AI STATE =====
let aiThinkTime = 0;
let aiState = "idle";       // "idle" | "thinking"
let aiTargetAngle = 45;
let aiTargetPower = 500;

// ===== START AI TURN =====
function enemyAIStart() {
  aiState = "thinking";
  aiThinkTime = 0;
  const sol = solveShot(enemy, player);
  aiTargetAngle = sol.angle;
  aiTargetPower = sol.power;
  enemy.targetAngle = aiTargetAngle;
}

// ===== SOLVE SHOT (simulate 200 candidates) =====
function solveShot(shooter, target) {
  let bestAngle = 45;
  let bestPower = 500;
  let bestDist  = Infinity;

  for (let i = 0; i < 200; i++) {
    const angle = MIN_ANGLE + Math.random() * (MAX_ANGLE - MIN_ANGLE);
    const power = 200 + Math.random() * 700;

    const rad = (angle * Math.PI) / 180;
    const dir = shooter.facing;

    const tip = getBarrelTip(shooter);
    let sx = tip.x;
    let sy = tip.y;
    let vx = Math.cos(rad) * power * dir;
    let vy = -Math.sin(rad) * power;

    for (let s = 0; s < 400; s++) {
      vy += GRAVITY * FIXED_DT;
      vx += wind * FIXED_DT;
      sx += vx * FIXED_DT;
      sy += vy * FIXED_DT;

      const gi = Math.round(sx);
      if (gi >= 0 && gi < W && sy >= heights[gi]) {
        const d = Math.hypot(sx - target.x, sy - (target.y - 16));
        if (d < bestDist) {
          bestDist  = d;
          bestAngle = angle;
          bestPower = power;
        }
        break;
      }
      if (sx < -50 || sx > W + 50 || sy > H + 100) break;
    }
  }

  // Slight inaccuracy so AI isn't perfect
  bestAngle += (Math.random() - 0.5) * 4;
  bestPower += (Math.random() - 0.5) * 30;

  return { angle: bestAngle, power: bestPower };
}

// ===== UPDATE AI (called every physics step) =====
function updateAI(dt) {
  if (turn !== "enemy" || currentScreen !== "playing" || gameMode === "2P") return;

  aiThinkTime += dt;

  if (aiState === "thinking") {
    // Small repositioning early in the turn
    const dist = Math.abs(enemy.x - player.x);
    if (dist > 400 && aiThinkTime < 0.6) {
      const dir = player.x < enemy.x ? -1 : 1;
      enemy.x += dir * 120 * dt;
      enemy.x = Math.max(W * 0.20, Math.min(W * 0.80, enemy.x));
      snapTank(enemy);
    }

    // Smooth aim
    enemy.targetAngle = aiTargetAngle;
    enemy.power += (aiTargetPower - enemy.power) * Math.min(1, dt * 6);

    // Fire after 1.3 seconds
    if (aiThinkTime > 1.3) {
      fireTank(enemy);
      aiState = "idle";
    }
  }
}