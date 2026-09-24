"use strict";
/* =====================================================
   07_icons.js — REIGN OF BATTLE
   Canvas vector icons (no image assets)
   ===================================================== */

// ===== CART =====
function drawCart(cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color || "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 8);
  ctx.lineTo(cx - 6,  cy - 8);
  ctx.lineTo(cx - 3,  cy + 3);
  ctx.lineTo(cx + 8,  cy + 3);
  ctx.lineTo(cx + 12, cy - 5);
  ctx.lineTo(cx - 4,  cy - 5);
  ctx.stroke();
  ctx.fillStyle = color || "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - 2, cy + 7, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 7, cy + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== CALENDAR =====
function drawCalendar(cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color || "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 9, cy - 7, 18, 16);
  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(cx - 9, cy - 7, 18, 4);
  ctx.fillRect(cx - 6, cy - 10, 2, 3);
  ctx.fillRect(cx + 4, cy - 10, 2, 3);
  ctx.fillStyle = "#ff5a5a";
  ctx.fillRect(cx - 1.5, cy - 1, 3, 5);
  ctx.fillRect(cx - 1.5, cy + 5, 3, 2.5);
  ctx.restore();
}

// ===== PAPER =====
function drawPaper(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(cx - 8, cy - 9, 16, 18);
  ctx.fillStyle = "#0f192d";
  ctx.fillRect(cx - 5, cy - 5, 10, 2);
  ctx.fillRect(cx - 5, cy - 1, 10, 2);
  ctx.fillRect(cx - 5, cy + 3, 7,  2);
  ctx.restore();
}

// ===== PEOPLE =====
function drawPeople(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffffff";
  ctx.beginPath(); ctx.arc(cx - 7, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 11, cy + 1, 8, 7, 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx + 3, cy + 1, 8, 7, 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - 5, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 5, cy + 1, 10, 9, 2); ctx.fill();
  ctx.restore();
}

// ===== SCROLL =====
function drawScroll(cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color || "#ffc441";
  ctx.fillStyle   = color || "#ffc441";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 8, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(cx - 10, cy - 6, 16, 14);
  ctx.strokeStyle = "#50b864";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy);
  ctx.lineTo(cx - 2, cy + 4);
  ctx.lineTo(cx + 4, cy - 3);
  ctx.stroke();
  ctx.restore();
}

// ===== GIFT =====
function drawGift(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffc441";
  ctx.fillRect(cx - 9,  cy - 4, 18, 14);
  ctx.fillRect(cx - 11, cy - 8, 22, 4);
  ctx.fillStyle = "#ff5a5a";
  ctx.fillRect(cx - 2, cy - 8, 4, 18);
  ctx.fillRect(cx - 9, cy + 2, 18, 3);
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 10, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 10, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== WRENCH =====
function drawWrench(cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = color || "#ffc441";
  ctx.fillRect(-3, -7, 6, 14);
  ctx.beginPath(); ctx.arc(0, 7, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -7, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0f192d";
  ctx.fillRect(-2.5, -14, 5, 8);
  ctx.restore();
}

// ===== TANK ICON =====
function drawTankIcon(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffc441";
  ctx.beginPath(); ctx.roundRect(cx - 10, cy + 1, 20, 7, 2); ctx.fill();
  ctx.fillStyle = "#1e2430";
  ctx.fillRect(cx - 12, cy + 4, 24, 4);
  ctx.fillStyle = color || "#ffc441";
  ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx + 2, cy - 3, 10, 2.5);
  ctx.restore();
}

// ===== GEAR =====
function drawGear(cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color || "#5fd8ff";
  ctx.fillStyle   = color || "#5fd8ff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const gx = cx + Math.cos(a) * (size * 0.65);
    const gy = cy + Math.sin(a) * (size * 0.65);
    ctx.fillRect(gx - 2.5, gy - 2.5, 5, 5);
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== DIAMOND =====
function drawDiamond(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#5fd8ff";
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.7);
  ctx.lineTo(cx + size * 0.6, cy - size * 0.15);
  ctx.lineTo(cx, cy + size * 0.7);
  ctx.lineTo(cx - size * 0.6, cy - size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.5);
  ctx.lineTo(cx + size * 0.35, cy - size * 0.15);
  ctx.lineTo(cx, cy + size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ===== COIN =====
function drawCoin(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffc441";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffe885";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#8a6200";
  ctx.font = `bold ${Math.round(size * 0.65)}px 'Silkscreen', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("C", cx, cy + 0.5);
  ctx.restore();
}

// ===== TROPHY =====
function drawTrophy(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle   = color || "#ffc441";
  ctx.strokeStyle = color || "#ffc441";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 24, cy - 28);
  ctx.lineTo(cx + 24, cy - 28);
  ctx.lineTo(cx + 18, cy + 2);
  ctx.quadraticCurveTo(cx, cy + 16, cx - 18, cy + 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 24, cy - 14, 10, -Math.PI * 0.4, Math.PI * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 24, cy - 14, 10, Math.PI * 0.4, Math.PI * 1.4, true);
  ctx.stroke();
  ctx.fillRect(cx - 5,  cy + 12, 10, 16);
  ctx.fillRect(cx - 22, cy + 28, 44, 10);
  ctx.strokeStyle = "#151e33";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 18); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx + 12, cy - 18);
  ctx.moveTo(cx - 12, cy - 8);  ctx.lineTo(cx, cy);      ctx.lineTo(cx + 12, cy - 8);
  ctx.stroke();
  ctx.restore();
}

// ===== BRAIN + AI =====
function drawBrainAndAIIcon(cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color || "#5fd8ff";
  ctx.fillStyle   = color || "#5fd8ff";
  ctx.lineWidth = 2.5;

  const lx = cx - 36, ly = cy;
  ctx.beginPath(); ctx.arc(lx, ly - 8, 22, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.arc(lx - 6, ly - 8, 8, 0, Math.PI);
  ctx.arc(lx + 6, ly - 8, 8, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx + 18, ly + 2);
  ctx.lineTo(lx + 24, ly + 6);
  ctx.lineTo(lx + 18, ly + 14);
  ctx.stroke();

  ctx.strokeStyle = "#ffc441";
  ctx.fillStyle   = "#ffc441";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy - 32);
  ctx.lineTo(cx - 4, cy - 2);
  ctx.lineTo(cx + 5, cy - 2);
  ctx.lineTo(cx - 5, cy + 32);
  ctx.stroke();

  const rx = cx + 36, ry = cy;
  ctx.strokeStyle = color || "#5fd8ff";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(rx, ry - 8, 22, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx, ry - 30); ctx.lineTo(rx, ry - 37); ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, ry - 39, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rx - 8, ry - 14);
  ctx.lineTo(rx - 8, ry - 2);
  ctx.lineTo(rx + 8, ry - 2);
  ctx.lineTo(rx + 8, ry - 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rx - 8, ry - 14, 2.5, 0, Math.PI * 2);
  ctx.arc(rx + 8, ry - 14, 2.5, 0, Math.PI * 2);
  ctx.arc(rx, ry + 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== TWO PLAYERS VS =====
function drawTwoPlayersVSIcon(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#ffffff";

  const p1x = cx - 44;
  ctx.beginPath(); ctx.arc(p1x, cy - 14, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(p1x - 22, cy + 8, 44, 36, [16,16,4,4]); ctx.fill();

  const p2x = cx + 44;
  ctx.beginPath(); ctx.arc(p2x, cy - 14, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(p2x - 22, cy + 8, 44, 36, [16,16,4,4]); ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 24px 'Press Start 2P', monospace";
  ctx.fillStyle = "#ffc441";
  ctx.shadowColor = "rgba(255,196,65,0.7)";
  ctx.shadowBlur = 10;
  ctx.fillText("VS", cx, cy);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ===== PLAY TRIANGLE =====
function drawPlayTriangle(cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color || "#3a2508";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.4, cy - size * 0.5);
  ctx.lineTo(cx + size * 0.6, cy);
  ctx.lineTo(cx - size * 0.4, cy + size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}