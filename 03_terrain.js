"use strict";
/* =====================================================
   03_terrain.js — REIGN OF BATTLE
   Terrain heightmap, generation, carving, tank snap
   ===================================================== */

// ===== HEIGHTMAP =====
const heights = new Float32Array(W);
let terrainSeed = Math.random() * 100;

// ===== TERRAIN GENERATION =====
function genTerrain(seed) {
  const pw = 450;
  const cMin = W / 2 - pw / 2;
  const cMax = W / 2 + pw / 2;
  const targetFlatH = H - 170;

  for (let x = 0; x < W; x++) {
    const w1 = Math.sin(x * 0.003 + seed) * 95;
    const w2 = Math.sin(x * 0.009 + seed * 2.3) * 35;
    const w3 = Math.sin(x * 0.024 + seed * 5.1) * 10;
    let raw = (H * 0.65) + w1 + w2 + w3;

    // Flatten center valley
    if (x >= cMin && x <= cMax) {
      const d = Math.min(x - cMin, cMax - x);
      const f = Math.min(d / 90, 1);
      raw = raw * (1 - f) + targetFlatH * f;
    }
    heights[x] = Math.max(H - 300, Math.min(H - 130, raw));
  }

  // 7 smoothing passes
  for (let p = 0; p < 7; p++) {
    for (let x = 1; x < W - 1; x++) {
      heights[x] = (heights[x - 1] + heights[x] + heights[x + 1]) / 3;
    }
  }
}

// ===== CARVE (destructible) =====
function carve(x, y, radius) {
  const r = Math.max(1, radius);
  const x0 = Math.max(0, Math.floor(x - (r + 15)));
  const x1 = Math.min(W - 1, Math.ceil(x + (r + 15)));

  for (let gx = x0; gx <= x1; gx++) {
    const dx = gx - x;
    const noise = Math.sin(gx * 0.3) * 5 + Math.sin(gx * 1.7) * 3;
    const effR = Math.max(1, r + noise);
    if (Math.abs(dx) <= effR) {
      const h = Math.sqrt(Math.max(0, effR * effR - dx * dx));
      heights[gx] = Math.max(heights[gx], y + h);
      if (heights[gx] > H - 10) heights[gx] = H - 10;
    }
  }

  // 3 smoothing passes inside carve area
  for (let p = 0; p < 3; p++) {
    for (let gx = Math.max(1, x0); gx <= Math.min(W - 2, x1); gx++) {
      heights[gx] = (heights[gx - 1] + heights[gx] + heights[gx + 1]) / 3;
    }
  }
}

// ===== SNAP TANK TO TERRAIN =====
function snapTank(t) {
  const xi = Math.max(0, Math.min(W - 1, Math.round(t.x)));
  t.y = heights[xi] - 16;
}