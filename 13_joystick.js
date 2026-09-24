"use strict";
/* =====================================================
   13_joystick.js — REIGN OF BATTLE
   Two joysticks (move + aim) + FIRE button
   ===================================================== */

// ===== LAYOUT CONSTANTS =====
const JOY_MOVE = { cx: 145,     cy: H - 130, r: 82, knobR: 77, dx: 0, dy: 0, active: false };
const JOY_AIM  = { cx: W - 145, cy: H - 130, r: 82, knobR: 77, dx: 0, dy: 0, active: false };
const FIRE_BTN = { x: W - 390, y: H - 130, w: 110, h: 110, flash: 0 };

// ===== HELPERS =====
function _inCircle(px, py, cx, cy, r) { return Math.hypot(px - cx, py - cy) <= r; }
function _inRect2(px, py, x, y, w, h) { return px >= x && px <= x + w && py >= y && py <= y + h; }

// ===== TOUCH START =====
function joyTouchStart(px, py) {
  // FIRE button
  if (_inRect2(px, py, FIRE_BTN.x, FIRE_BTN.y, FIRE_BTN.w, FIRE_BTN.h)) {
    FIRE_BTN.flash = 0.25;
    const atk = turn === "player" ? player : enemy;
    if (!aimLocked && atk.alive) fireTank(atk);
    return true;
  }
  // Left joystick = MOVE
  if (_inCircle(px, py, JOY_MOVE.cx, JOY_MOVE.cy, JOY_MOVE.r + 30)) {
    JOY_MOVE.active = true;
    joyMoveUpdate(px, py);
    return true;
  }
  // Right joystick = AIM
  if (_inCircle(px, py, JOY_AIM.cx, JOY_AIM.cy, JOY_AIM.r + 30)) {
    JOY_AIM.active = true;
    joyAimUpdate(px, py);
    return true;
  }
  return false;
}

function joyTouchMove(px, py) {
  if (JOY_MOVE.active) { joyMoveUpdate(px, py); return true; }
  if (JOY_AIM.active)  { joyAimUpdate(px, py);  return true; }
  return false;
}

function joyTouchEnd() {
  JOY_MOVE.active = false; JOY_MOVE.dx = 0; JOY_MOVE.dy = 0;
  JOY_AIM.active  = false; JOY_AIM.dx  = 0; JOY_AIM.dy  = 0;
}

// ===== UPDATE JOYSTICK VALUES (normalized -1..1) =====
function joyMoveUpdate(px, py) {
  const dx = px - JOY_MOVE.cx;
  const dy = py - JOY_MOVE.cy;
  const d  = Math.min(JOY_MOVE.r, Math.hypot(dx, dy));
  const a  = Math.atan2(dy, dx);
  JOY_MOVE.dx = Math.cos(a) * d / JOY_MOVE.r;
  JOY_MOVE.dy = Math.sin(a) * d / JOY_MOVE.r;
}

function joyAimUpdate(px, py) {
  const dx = px - JOY_AIM.cx;
  const dy = py - JOY_AIM.cy;
  const d  = Math.min(JOY_AIM.r, Math.hypot(dx, dy));
  const a  = Math.atan2(dy, dx);
  JOY_AIM.dx = Math.cos(a) * d / JOY_AIM.r;
  JOY_AIM.dy = Math.sin(a) * d / JOY_AIM.r;
}

// ===== APPLY AIM TO TANK =====
function applyJoystickAim(t) {
  if (!t.alive) return;
  const dist = Math.hypot(JOY_AIM.dx, JOY_AIM.dy);
  if (dist < 0.15 && !JOY_AIM.active) return;   // keep last aim
  if (dist < 0.15) return;

  const targetRad = Math.atan2(-JOY_AIM.dy, JOY_AIM.dx * t.facing);
  let targetDeg = (targetRad * 180) / Math.PI;
  targetDeg = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, targetDeg));
  t.targetAngle = targetDeg;

  t.power = 200 + dist * 700;
}

// ===== APPLY MOVEMENT TO TANK =====
function applyJoystickMove(t, dt) {
  if (aimLocked || !t.alive) return;
  if (Math.abs(JOY_MOVE.dx) < 0.25) return;
  t.x += JOY_MOVE.dx * 120 * dt;
  t.x = Math.max(40, Math.min(W - 40, t.x));
  snapTank(t);
}

// ===== VISUAL TIMERS =====
function updateJoystickVisuals(dt) {
  if (FIRE_BTN.flash > 0) FIRE_BTN.flash = Math.max(0, FIRE_BTN.flash - dt);
}

// ===== DRAW =====
function drawJoysticks() {
  if (currentScreen !== "playing") return;
  if (effectiveControlMode() !== "joystick") return;

  drawJoyBase(JOY_MOVE, "#5fd8ff", "move");
  drawJoyBase(JOY_AIM,  "#ffc441", "aim");
  drawFireBtn();

  ctx.save();
  ctx.font = "bold 11px 'Silkscreen', Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#9fb0c8";
  ctx.fillText("MOVE", JOY_MOVE.cx, JOY_MOVE.cy + JOY_MOVE.r + 22);
  ctx.fillText("AIM",  JOY_AIM.cx,  JOY_AIM.cy  + JOY_AIM.r  + 22);
  ctx.restore();
}

function drawJoyBase(j, color, iconType) {
  ctx.save();

  // === LAYER 1: Base ring ===
  const baseSize = j.r * 2.0;
  const baseOffsetX = 1.8;   // ← adjust করবো
  const baseOffsetY = 2.9;   // ← adjust করবো

  if (hasIcon("base_ring")) {
    ctx.drawImage(
      ICONS.base_ring,
      j.cx - baseSize / 2 + baseOffsetX,
      j.cy - baseSize / 2 + baseOffsetY,
      baseSize, baseSize
    );
  } else {
    // fallback...
  }

  // === LAYER 2: Knob ===
  const kx = j.cx + j.dx * j.r * 0.55;
  const ky = j.cy + j.dy * j.r * 0.55;
    const kr = j.knobR;

  if (hasIcon("knob_base")) {
    ctx.drawImage(ICONS.knob_base, kx - kr, ky - kr, kr * 2, kr * 2);
  } else {
    // Fallback: hand-drawn knob
    ctx.beginPath();
    ctx.arc(kx, ky, kr + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2a3a52";
    ctx.fill();

    const knobGrad = ctx.createRadialGradient(
      kx - kr * 0.35, ky - kr * 0.42, kr * 0.12,
      kx, ky, kr
    );
    knobGrad.addColorStop(0,    "#eaf3ff");
    knobGrad.addColorStop(0.55, "#b8cee6");
    knobGrad.addColorStop(1,    "#7d97b3");
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fillStyle = knobGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(kx, ky - kr * 0.4, kr * 0.55, kr * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
  }

  // === LAYER 3: AIM icon ===
  if (iconType === "aim") {
    if (hasIcon("icon_aim")) {
      const is = kr * 1.4;
      ctx.drawImage(ICONS.icon_aim, kx - is / 2, ky - is / 2, is, is);
    } else {
      // Fallback: hand-drawn crosshair
      ctx.strokeStyle = "#3a4a66";
      ctx.fillStyle   = "#3a4a66";
      ctx.lineWidth   = Math.max(2, kr * 0.12);
      ctx.lineCap     = "round";

      const ringR    = kr * 0.42;
      const prongLen = kr * 0.85;
      const prongGap = kr * 0.55;

      ctx.beginPath();
      ctx.arc(kx, ky, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(kx, ky - prongGap); ctx.lineTo(kx, ky - prongLen);
      ctx.moveTo(kx, ky + prongGap); ctx.lineTo(kx, ky + prongLen);
      ctx.moveTo(kx - prongGap, ky); ctx.lineTo(kx - prongLen, ky);
      ctx.moveTo(kx + prongGap, ky); ctx.lineTo(kx + prongLen, ky);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(kx, ky, kr * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawFireBtn() {
  const b = FIRE_BTN;
  const pressed = b.flash > 0;

  ctx.save();

  // Calculate center
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;

  // Press animation: scale down slightly, glow up
  const scale = pressed ? 0.92 : 1.0;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  // Optional glow on press
  if (pressed) {
    ctx.shadowColor = "rgba(255,122,20,0.9)";
    ctx.shadowBlur = 25;
  }

  // Draw the fire button image (or fallback)
  if (hasIcon("fire_btn")) {
    ctx.drawImage(ICONS.fire_btn, b.x, b.y, b.w, b.h);
  } else {
    // Fallback: canvas-drawn circle + rocket
    drawFireFallback(cx, cy, b.w / 2);
  }

  ctx.restore();
}

// Fallback in case PNG missing
function drawFireFallback(cx, cy, radius) {
  // Orange gradient circle
  const grad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  grad.addColorStop(0, "#ffd45e");
  grad.addColorStop(1, "#ff7a14");

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#7a4e10";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Rocket icon
  ctx.fillStyle = "#3a2508";
  // Nose (triangle)
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 0.5);
  ctx.lineTo(cx - radius * 0.2, cy - radius * 0.2);
  ctx.lineTo(cx + radius * 0.2, cy - radius * 0.2);
  ctx.closePath();
  ctx.fill();

  // Body (rect)
  ctx.fillRect(cx - radius * 0.2, cy - radius * 0.2, radius * 0.4, radius * 0.5);

  // Wings
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.2, cy + radius * 0.1);
  ctx.lineTo(cx - radius * 0.4, cy + radius * 0.3);
  ctx.lineTo(cx - radius * 0.2, cy + radius * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + radius * 0.2, cy + radius * 0.1);
  ctx.lineTo(cx + radius * 0.4, cy + radius * 0.3);
  ctx.lineTo(cx + radius * 0.2, cy + radius * 0.3);
  ctx.closePath();
  ctx.fill();

  // Flame
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.moveTo(cx, cy + radius * 0.5);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.3);
  ctx.lineTo(cx + radius * 0.1, cy + radius * 0.3);
  ctx.closePath();
  ctx.fill();
}