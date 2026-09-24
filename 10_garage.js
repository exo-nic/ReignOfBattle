"use strict";
/* =====================================================
   10_garage.js — REIGN OF BATTLE
   Garage screen: preview 5 tanks, SELECT saves, PLAY starts 1P
   ===================================================== */

// ===== GARAGE STATE =====
let garageIdx = selectedTankIdx;   // previewed tank (temporary)

const garageHover = {
  back:   false,
  left:   false,
  right:  false,
  select: false,
  play:   false
};

// ===== HIT HELPERS =====
function _inRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// ===== LAYOUT CONSTANTS =====
const GAR_BACK   = { x: 20,  y: 20,  w: 120, h: 50 };
const GAR_LEFT   = { x: 120, y: 340, r: 26 };           // circle center
const GAR_RIGHT  = { x: W - 120, y: 340, r: 26 };
const GAR_SELECT = { x: W / 2 - 200, y: H - 90, w: 180, h: 60 };
const GAR_PLAY   = { x: W / 2 + 20,  y: H - 90, w: 180, h: 60 };

// ===== HOVER =====
function updateGarageHover(px, py) {
  garageHover.back   = _inRect(px, py, GAR_BACK.x, GAR_BACK.y, GAR_BACK.w, GAR_BACK.h);
  garageHover.left   = Math.hypot(px - GAR_LEFT.x,  py - GAR_LEFT.y)  <= GAR_LEFT.r + 4;
  garageHover.right  = Math.hypot(px - GAR_RIGHT.x, py - GAR_RIGHT.y) <= GAR_RIGHT.r + 4;
  garageHover.select = _inRect(px, py, GAR_SELECT.x, GAR_SELECT.y, GAR_SELECT.w, GAR_SELECT.h);
  garageHover.play   = _inRect(px, py, GAR_PLAY.x,   GAR_PLAY.y,   GAR_PLAY.w,   GAR_PLAY.h);
}

// ===== CLICK =====
function handleGarageClick(px, py) {
  // BACK
  if (_inRect(px, py, GAR_BACK.x, GAR_BACK.y, GAR_BACK.w, GAR_BACK.h)) {
    garageIdx = selectedTankIdx;   // discard preview
    startTransitionTo("menu");
    return;
  }

  // ARROWS
  if (Math.hypot(px - GAR_LEFT.x,  py - GAR_LEFT.y)  <= GAR_LEFT.r + 4) {
    garageIdx = (garageIdx - 1 + TANK_SPECS.length) % TANK_SPECS.length;
    return;
  }
  if (Math.hypot(px - GAR_RIGHT.x, py - GAR_RIGHT.y) <= GAR_RIGHT.r + 4) {
    garageIdx = (garageIdx + 1) % TANK_SPECS.length;
    return;
  }

  // SELECT (save + return to menu)
  if (_inRect(px, py, GAR_SELECT.x, GAR_SELECT.y, GAR_SELECT.w, GAR_SELECT.h)) {
    selectedTankIdx = garageIdx;
    try { localStorage.setItem(LS_TANK_KEY, String(selectedTankIdx)); }
    catch (e) { /* offline-safe */ }
    startTransitionTo("menu");
    return;
  }

  // PLAY (start 1P with current preview selection)
  if (_inRect(px, py, GAR_PLAY.x, GAR_PLAY.y, GAR_PLAY.w, GAR_PLAY.h)) {
    selectedTankIdx = garageIdx;
    try { localStorage.setItem(LS_TANK_KEY, String(selectedTankIdx)); }
    catch (e) { /* offline-safe */ }
    resetGame("1P");
    startTransitionTo("playing");
  }
}

// ===== DRAW GARAGE =====
function drawGarageScreen() {
  // Background battlefield
  drawSky();
  drawTerrain();
  drawCraters();
  drawProjectiles();
  drawParticles();

  // Dark wash
  ctx.fillStyle = "rgba(5,8,18,0.78)";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 30px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = "#ffc441";
  ctx.shadowColor = "rgba(255,196,65,0.7)";
  ctx.shadowBlur = 12;
  ctx.fillText("GARAGE", W / 2, 70);
  ctx.restore();

  // BACK button
  ctx.save();
  if (garageHover.back) {
    ctx.shadowColor = "rgba(95,216,255,0.7)";
    ctx.shadowBlur = 10;
  }
  ctx.fillStyle = "rgba(15,25,45,0.95)";
  ctx.strokeStyle = garageHover.back ? "#ffc441" : "#5fd8ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(GAR_BACK.x, GAR_BACK.y, GAR_BACK.w, GAR_BACK.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.font = "22px 'Bebas Neue', 'Segoe UI', Arial";
  ctx.fillStyle = garageHover.back ? "#ffc441" : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("< BACK", GAR_BACK.x + GAR_BACK.w / 2, GAR_BACK.y + GAR_BACK.h / 2);
  ctx.restore();

  // Main showcase panel
  const scW = 520, scH = 380;
  const scX = W / 2 - scW / 2;
  const scY = 130;

  ctx.save();
  const scGrad = ctx.createRadialGradient(W / 2, scY + scH * 0.55, 40,
                                          W / 2, scY + scH * 0.55, 260);
  scGrad.addColorStop(0, "rgba(40,55,85,0.55)");
  scGrad.addColorStop(1, "rgba(15,25,45,0.95)");
  ctx.fillStyle = scGrad;
  ctx.strokeStyle = "#ffc441";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(scX, scY, scW, scH, 16);
  ctx.fill();
  ctx.stroke();

  // Preview tank (large, bobbing)
  const curSpec = TANK_SPECS[garageIdx];
  const tankBob = Math.sin(globalTime * 1.5) * 4;

  ctx.save();
  ctx.translate(W / 2, scY + scH * 0.55 + tankBob);
  ctx.scale(2.6, 2.6);
  const demoTank = {
    x: 0, y: 0,
    alive: true,
    facing: 1,
    team: "player",
    spec: curSpec,
    turretAngle: 28,
    targetAngle: 28,
    recoil: 0,
    flashT: 0
  };
  drawTank(demoTank);
  ctx.restore();

  // Tank name + title
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 22px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = "#ffc441";
  ctx.shadowColor = "rgba(255,196,65,0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText(curSpec.name, W / 2, scY + scH - 80);
  ctx.shadowBlur = 0;

  ctx.font = "22px 'Bebas Neue', 'Segoe UI', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.fillText(curSpec.title, W / 2, scY + scH - 48);
  ctx.restore();

  // Left arrow
  ctx.save();
  if (garageHover.left) {
    ctx.shadowColor = "rgba(255,196,65,0.8)";
    ctx.shadowBlur = 10;
  }
  ctx.fillStyle = "rgba(15,25,45,0.95)";
  ctx.strokeStyle = garageHover.left ? "#ffc441" : "rgba(95,216,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(GAR_LEFT.x, GAR_LEFT.y, GAR_LEFT.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 20px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = garageHover.left ? "#ffc441" : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("<", GAR_LEFT.x - 1, GAR_LEFT.y);
  ctx.restore();

  // Right arrow
  ctx.save();
  if (garageHover.right) {
    ctx.shadowColor = "rgba(255,196,65,0.8)";
    ctx.shadowBlur = 10;
  }
  ctx.fillStyle = "rgba(15,25,45,0.95)";
  ctx.strokeStyle = garageHover.right ? "#ffc441" : "rgba(95,216,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(GAR_RIGHT.x, GAR_RIGHT.y, GAR_RIGHT.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 20px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = garageHover.right ? "#ffc441" : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(">", GAR_RIGHT.x + 1, GAR_RIGHT.y);
  ctx.restore();

  // Dot indicator (5 dots)
  const dotY = scY + scH + 26;
  const dotR = 6;
  const dotSpacing = 26;
  const totalW = (TANK_SPECS.length - 1) * dotSpacing;
  const dotStart = W / 2 - totalW / 2;

  for (let i = 0; i < TANK_SPECS.length; i++) {
    const dx = dotStart + i * dotSpacing;
    const isSel = (i === garageIdx);
    const isSaved = (i === selectedTankIdx);

    ctx.beginPath();
    ctx.arc(dx, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = isSel ? "#ffc441" : "rgba(255,255,255,0.25)";
    ctx.fill();

    if (isSaved && !isSel) {
      ctx.strokeStyle = "#6edc82";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // SELECT button
  ctx.save();
  if (garageHover.select) {
    ctx.shadowColor = "rgba(110,220,130,0.8)";
    ctx.shadowBlur = 12;
  }
  const selGrad = ctx.createLinearGradient(GAR_SELECT.x, GAR_SELECT.y,
                                           GAR_SELECT.x, GAR_SELECT.y + GAR_SELECT.h);
  selGrad.addColorStop(0, "#6edc82");
  selGrad.addColorStop(1, "#3a9e50");
  ctx.fillStyle = selGrad;
  ctx.strokeStyle = "#1e5a2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(GAR_SELECT.x, GAR_SELECT.y, GAR_SELECT.w, GAR_SELECT.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px 'Press Start 2P', 'Segoe UI', Arial";
  ctx.fillStyle = "#0f2a17";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const selLabel = (garageIdx === selectedTankIdx) ? "SELECTED" : "SELECT";
  ctx.fillText(selLabel, GAR_SELECT.x + GAR_SELECT.w / 2, GAR_SELECT.y + GAR_SELECT.h / 2 + 1);
  ctx.restore();

  // PLAY button
  ctx.save();
  if (garageHover.play) {
    ctx.shadowColor = "rgba(255,122,20,0.8)";
    ctx.shadowBlur = 14;
  }
  const playGrad = ctx.createLinearGradient(GAR_PLAY.x, GAR_PLAY.y,
                                            GAR_PLAY.x, GAR_PLAY.y + GAR_PLAY.h);
  playGrad.addColorStop(0, "#ffc441");
  playGrad.addColorStop(1, "#ff7a14");
  ctx.fillStyle = playGrad;
  ctx.strokeStyle = "#7a4e10";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(GAR_PLAY.x, GAR_PLAY.y, GAR_PLAY.w, GAR_PLAY.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = "#3a2508";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PLAY", GAR_PLAY.x + GAR_PLAY.w / 2, GAR_PLAY.y + GAR_PLAY.h / 2 + 1);
  ctx.restore();
}