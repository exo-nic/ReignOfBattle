"use strict";
/* =====================================================
   09_menu.js — REIGN OF BATTLE
   Main menu (8 buttons), overlay modal, credits & options
   ===================================================== */

// ===== MENU BUTTONS (8, mobile-friendly) =====
const mainMenuButtons = [
  { id: "campaign",  label: "CAMPAIGN",          icon: "trophy", hovered: false },
  { id: "1p",        label: "1-PLAYER vs AI",    icon: "play",   hovered: false },
  { id: "2p",        label: "2-PLAYER HOT-SEAT", icon: "people", hovered: false },
  { id: "garage",    label: "GARAGE",            icon: "wrench", hovered: false },
  { id: "editor",    label: "LEVEL EDITOR",      icon: "edit",   hovered: false },
  { id: "howToPlay", label: "HOW TO PLAY",       icon: "book",   hovered: false },
  { id: "options",   label: "OPTIONS",           icon: "gear",   hovered: false },
  { id: "credits",   label: "CREDITS",           icon: "info",   hovered: false }
];

// ===== LAYOUT =====
const MENU_BTN_W   = 400;
const MENU_BTN_H   = 56;
const MENU_GAP     = 10;
const MENU_START_Y = 145;

mainMenuButtons.forEach((btn, idx) => {
  btn.w = MENU_BTN_W;
  btn.h = MENU_BTN_H;
  btn.x = W / 2 - MENU_BTN_W / 2;
  btn.y = MENU_START_Y + idx * (MENU_BTN_H + MENU_GAP);
});

// ===== MENU AMBIENT FIRE =====
let menuFireTimerPlayer = 1.0;
let menuFireTimerEnemy  = 2.5;

function updateMenu(dt) {
  menuFireTimerPlayer -= dt;
  if (menuFireTimerPlayer <= 0) {
    player.targetAngle = 30 + Math.random() * 45;
    player.power = 400 + Math.random() * 200;
    fireTank(player);
    menuFireTimerPlayer = 3.5 + Math.random() * 2.0;
  }

  menuFireTimerEnemy -= dt;
  if (menuFireTimerEnemy <= 0) {
    enemy.targetAngle = 30 + Math.random() * 45;
    enemy.power = 400 + Math.random() * 200;
    fireTank(enemy);
    menuFireTimerEnemy = 3.5 + Math.random() * 2.0;
  }
}

// ===== TRANSITION =====
function startTransitionTo(screenName) {
  if (isFading) return;
  isFading = true;
  pendingScreen = screenName;
}

// ===== OVERLAY MODAL =====
function showOverlay(title, msg) {
  overlayView = title;
  overlayMessage = msg || "Coming soon!";
}

function drawOverlayModal() {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(0, 0, W, H);

  let mw = 600, mh = 400;
  if (overlayView === "CREDITS") { mw = 780; mh = 620; }
  if (overlayView === "OPTIONS") { mw = 620; mh = 500; }

  const mx = W / 2 - mw / 2;
  const my = H / 2 - mh / 2;

  drawPanelBackground(mx, my, mw, mh, 14, "#ffc441", "#ffc441", true);

  ctx.textAlign = "center";
  ctx.font = "bold 22px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = "#ffc441";
  ctx.fillText(overlayView, W / 2, my + 52);

  if (overlayView === "OPTIONS") {
    drawOptionsContent(mx, my, mw, mh);
  } else if (overlayView === "CREDITS") {
    drawCreditsContent(mx, my, mw, mh);
  } else {
    ctx.font = "22px 'Bebas Neue', 'Segoe UI', Arial";
    ctx.fillStyle = "#9fb0c8";
    const lines = overlayMessage.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, my + 115 + i * 35);
    });
  }

  ctx.font = "20px 'Bebas Neue', 'Segoe UI', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.fillText("ESC / CLOSE", W / 2, my + mh - 22);

  ctx.restore();
}

// ===== CREDITS =====
function drawCreditsContent(mx, my, mw, mh) {
  const cx = mx + mw / 2;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 14px 'Silkscreen', Arial";
  ctx.fillStyle = "#ffc441";
  ctx.fillText("===============================", cx, my + 95);

  ctx.font = "bold 18px 'Press Start 2P', Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,196,65,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText("REIGN OF BATTLE", cx, my + 125);
  ctx.shadowBlur = 0;

  ctx.font = "bold 14px 'Silkscreen', Arial";
  ctx.fillStyle = "#ffc441";
  ctx.fillText("===============================", cx, my + 152);

  ctx.textBaseline = "alphabetic";

  const sections = [
    { header: "[ GAME DESIGN & PROGRAMMING ]",
      items: ["• Lead Developer  : [Tahmid]", "• Code & Mechanics : [Tahmid]"] },
    { header: "[ ART & GRAPHICS ]",
      items: ["• Tank & Turret Sprites : Kenney",
              "• Environment & Tileset : Kenney",
              "• UI Elements : [আর্টিস্টের নাম]"] },
    { header: "[ AUDIO & SOUND ]",
      items: ["• Background Music : [কম্পোজার]",
              "• Sound Effects (SFX) : Kenney / Freesound.org"] },
    { header: "[ FONTS & RESOURCES ]",
      items: ['• Main Font : "Press Start 2P" by CodeMan38'] },
    { header: "[ SPECIAL THANKS ]",
      items: ["• Playtesters : [বন্ধুদের নাম]",
              "• Special Thanks To : [মেন্টর / কমিউনিটি]"] }
  ];

  let y = my + 185;
  for (const s of sections) {
    ctx.font = "22px 'Bebas Neue', Arial";
    ctx.fillStyle = "#5fd8ff";
    ctx.fillText(s.header, cx, y);
    y += 22;

    ctx.font = "13px 'Silkscreen', 'Segoe UI', Arial";
    ctx.fillStyle = "#d8e2f0";
    for (const item of s.items) {
      ctx.fillText(item, cx, y);
      y += 18;
    }
    y += 8;
  }

  ctx.font = "22px 'Bebas Neue', Arial";
  ctx.fillStyle = "#ffc441";
  ctx.fillText("===============================", cx, y + 6);

  ctx.font = "bold 15px 'Press Start 2P', Arial";
  ctx.fillStyle = "#ffffffe5";
  ctx.shadowColor = "rgba(110,220,130,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText("Thanks for Playing!", cx, y + 36);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ===== MENU CLICK HANDLER =====
function selectMenuButton(btn) {
  mainMenuButtons.forEach(b => b.hovered = false);

  if (btn.id === "1p") {
    resetGame("1P");
    startTransitionTo("playing");
  } else if (btn.id === "2p") {
    resetGame("2P");
    startTransitionTo("playing");
  } else if (btn.id === "garage") {
    startTransitionTo("garage");
  } else if (btn.id === "campaign") {
    showOverlay("CAMPAIGN",
      "Story Campaign Coming Soon!\n" +
      "Fight across 20 missions\n" +
      "Unlock new tanks and weapons");
  } else if (btn.id === "editor") {
    showOverlay("LEVEL EDITOR",
      "Create Your Own Battlefields!\n" +
      "Design terrain · Place tanks\n" +
      "Share with friends");
  } else if (btn.id === "options") {
    showOverlay("OPTIONS", "");
  } else if (btn.id === "howToPlay") {
    showOverlay("HOW TO PLAY",
      `CONTROLS:\n` +
      `- MOUSE / JOYSTICK: AIM TURRET\n` +
      `- W / S: ADJUST POWER\n` +
      `- LEFT CLICK / SPACE / FIRE BTN: FIRE\n` +
      `- A / D: MOVE TANK\n` +
      `- ESC: RETURN TO MENU`);
  } else if (btn.id === "credits") {
    showOverlay("CREDITS", "");
  }
}

// ===== SMALL MENU ICONS (20px) =====
function drawMenuIcon(type, cx, cy, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  if (type === "trophy") {
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 8);
    ctx.lineTo(cx + 7, cy - 8);
    ctx.lineTo(cx + 5, cy + 1);
    ctx.quadraticCurveTo(cx, cy + 5, cx - 5, cy + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 2, cy + 3, 4, 5);
    ctx.fillRect(cx - 7, cy + 8, 14, 2.5);
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 4, 3, -Math.PI * 0.4, Math.PI * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 7, cy - 4, 3, Math.PI * 0.4, Math.PI * 1.4, true);
    ctx.stroke();

  } else if (type === "play") {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 8);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx - 6, cy + 8);
    ctx.closePath();
    ctx.fill();

  } else if (type === "people") {
    ctx.beginPath(); ctx.arc(cx - 5, cy - 5, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 5, cy - 5, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx - 9, cy - 0.5, 8, 9, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx + 1, cy - 0.5, 8, 9, 2); ctx.fill();

  } else if (type === "wrench") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 4);
    ctx.fillRect(-2, -6, 4, 12);
    ctx.beginPath(); ctx.arc(0, -7, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0f192d";
    ctx.fillRect(-1.5, -11, 3, 5);
    ctx.restore();

  } else if (type === "edit") {
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 8);
    ctx.lineTo(cx + 5, cy - 6);
    ctx.lineTo(cx + 8, cy - 3);
    ctx.lineTo(cx - 4, cy + 11);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 8);
    ctx.lineTo(cx - 4, cy + 11);
    ctx.lineTo(cx - 8, cy + 10);
    ctx.closePath();
    ctx.fillStyle = "#0f192d";
    ctx.fill();

  } else if (type === "book") {
    ctx.strokeRect(cx - 8, cy - 9, 16, 18);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx, cy + 9);
    ctx.stroke();
    ctx.fillRect(cx - 8, cy - 9, 16, 2);

  } else if (type === "gear") {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const gx = cx + Math.cos(a) * 9;
      const gy = cy + Math.sin(a) * 9;
      ctx.fillRect(gx - 2, gy - 2, 4, 4);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === "info") {
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 1);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();
  }

  ctx.restore();
}

// ===== DRAW MENU =====
function drawMenuScreen() {
  drawSky();
  drawTerrain();
  drawCraters();
  drawTank(player);
  drawTank(enemy);
  drawProjectiles();
  drawParticles();

  ctx.fillStyle = "rgba(5,8,18,0.68)";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.save();
  ctx.textAlign = "center";
  const titleY = 70;
  const pulse = Math.sin(globalTime * 3) * 0.02 + 1;
  ctx.translate(W / 2, titleY);
  ctx.scale(pulse, pulse);

  ctx.font = "bold 36px 'Press Start 2P', Segoe UI, Arial";
  ctx.fillStyle = "#ffc441";
  ctx.shadowColor = "rgba(255,196,65,0.7)";
  ctx.shadowBlur = 12;
  ctx.fillText("REIGN OF BATTLE", 0, 0);

  ctx.font = "20px 'Bebas Neue', 'Segoe UI', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.shadowColor = "#5fd8ff";
  ctx.shadowBlur = 8;
  ctx.fillText("ARTILLERY DUEL", 0, 28);
  ctx.restore();

  // Buttons
    mainMenuButtons.forEach((btn, idx) => {
    const isFocused = (focusedButton === idx);
    const isHovered = btn.hovered;
    const active = isFocused || isHovered;

    ctx.save();

    const scale = active ? 1.02 : 1.0;
    const bxc = btn.x + btn.w / 2;
    const byc = btn.y + btn.h / 2;
    ctx.translate(bxc, byc);
    ctx.scale(scale, scale);
    ctx.translate(-bxc, -byc);

    // Glow — কম করা
    if (active) {
      ctx.shadowColor = "rgba(95,216,255,0.7)";
      ctx.shadowBlur = 10;    // 16 → 10
    }

    const bg = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
    if (active) {
      bg.addColorStop(0, "rgba(30,45,80,0.98)");
      bg.addColorStop(1, "rgba(15,25,50,1)");
    } else {
      bg.addColorStop(0, "rgba(20,30,55,0.92)");
      bg.addColorStop(1, "rgba(10,16,32,0.96)");
    }
    ctx.fillStyle = bg;

    ctx.strokeStyle = active ? "#5fd8ff" : "rgba(255,196,65,0.35)";
    ctx.lineWidth = active ? 2.5 : 1.8;

    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icon — fixed position (always at 34)
    const iconColor = active ? "#5fd8ff" : "#c8d8e8";
    const iconX = btn.x + 34;
    const iconY = btn.y + btn.h / 2;
    drawMenuIcon(btn.icon, iconX, iconY, iconColor);


    // Label — fixed position
    ctx.font = "bold 15px 'Press Start 2P', Segoe UI, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? "#ffffff" : "#d0dced";
    ctx.shadowBlur = 0;
    ctx.fillText(btn.label, btn.x + 60, btn.y + btn.h / 2 + 1);

    ctx.restore();
  });

  // Footer
  ctx.save();
  ctx.font = "bold 11px 'Silkscreen', Segoe UI, Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.textAlign = "center";
  ctx.fillText("DEVELOPED BY TAHMID | 2026 | REIGN OF BATTLE",
               W / 2, H - 20);
  ctx.restore();

  if (overlayView) drawOverlayModal();
}

// ===== MOUSE CLICK ON MENU =====
function handleMenuClick(px, py) {
  if (overlayView) {
    if (overlayView === "OPTIONS" && handleOptionsClick(px, py)) return;
    overlayView = null;
    return;
  }
  mainMenuButtons.forEach((btn) => {
    if (px >= btn.x && px <= btn.x + btn.w &&
        py >= btn.y && py <= btn.y + btn.h) {
      selectMenuButton(btn);
    }
  });
}

// ===== SOUND TOGGLE =====
function toggleSound() {
  soundOn = !soundOn;
  try {
    localStorage.setItem(LS_SOUND_KEY, soundOn ? "1" : "0");
  } catch (e) {}
}

// ===== OPTIONS CONTENT =====
function drawOptionsContent(mx, my, mw, mh) {
  const cx = mx + mw / 2;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "22px 'Bebas Neue', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.fillText("CONTROLS", cx, my + 95);

  const ctrlTotalW = 400;
  const ctrlX = cx - ctrlTotalW / 2;
  const ctrlY = my + 115;
  const ctrlH = 42;
  const ctrlSegW = ctrlTotalW / 3;
  const ctrlLabels = ["AUTO", "MOUSE+KB", "JOYSTICK"];
  const ctrlModes  = ["auto", "mouse", "joystick"];
  const ctrlActive = Math.max(0, ctrlModes.indexOf(controlMode));

  drawSegmentedButton(ctrlX, ctrlY, ctrlTotalW, ctrlH, ctrlSegW,
                      ctrlLabels, ctrlActive);

  ctx.font = "22px 'Bebas Neue', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.fillText("SOUND FX", cx, my + 195);

  const sndTotalW = 240;
  const sndX = cx - sndTotalW / 2;
  const sndY = my + 215;
  const sndH = 42;
  const sndSegW = sndTotalW / 2;
  const sndLabels = ["ON", "OFF"];
  const sndActive = soundOn ? 0 : 1;
  drawSegmentedButton(sndX, sndY, sndTotalW, sndH, sndSegW,
                      sndLabels, sndActive);

  ctx.font = "22px 'Bebas Neue', Arial";
  ctx.fillStyle = "#5fd8ff";
  ctx.fillText("MUSIC", cx, my + 295);

  const musTotalW = 240;
  const musX = cx - musTotalW / 2;
  const musY = my + 315;
  const musH = 42;
  const musSegW = musTotalW / 2;
  const musLabels = ["ON", "OFF"];
  const musActive = musicOn ? 0 : 1;
  drawSegmentedButton(musX, musY, musTotalW, musH, musSegW,
                      musLabels, musActive);

  ctx.font = "20px 'Bebas Neue', Arial";
  ctx.fillStyle = "#9fb0c8";
  const modeText = effectiveControlMode() === "joystick"
    ? "ACTIVE: JOYSTICK (TOUCH-FRIENDLY)"
    : "ACTIVE: MOUSE + KEYBOARD";
  ctx.fillText(modeText, cx, my + 390);

  ctx.restore();
}

function drawSegmentedButton(x, y, w, h, segW, labels, activeIdx) {
  ctx.save();

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.clip();

  for (let i = 0; i < labels.length; i++) {
    const sx = x + i * segW;
    const act = (i === activeIdx);
    ctx.fillStyle = act ? "rgba(110,220,130,0.95)" : "rgba(15,25,45,0.95)";
    ctx.fillRect(sx, y, segW, h);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(95,216,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();

  ctx.strokeStyle = "rgba(95,216,255,0.35)";
  ctx.lineWidth = 1;
  for (let i = 1; i < labels.length; i++) {
    const dx = x + i * segW;
    ctx.beginPath();
    ctx.moveTo(dx, y + 3);
    ctx.lineTo(dx, y + h - 3);
    ctx.stroke();
  }

  ctx.font = "22px 'Bebas Neue', Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < labels.length; i++) {
    const sx = x + i * segW + segW / 2;
    const act = (i === activeIdx);
    ctx.fillStyle = act ? "#0f2a17" : "#9fb0c8";
    ctx.fillText(labels[i], sx, y + h / 2 + 1);
  }
}

function handleOptionsClick(px, py) {
  const mw = 620, mh = 500;
  const mx = W / 2 - mw / 2;
  const my = H / 2 - mh / 2;
  const cx = mx + mw / 2;

  const ctrlTotalW = 400;
  const ctrlX = cx - ctrlTotalW / 2;
  const ctrlY = my + 115;
  const ctrlH = 42;
  const ctrlSegW = ctrlTotalW / 3;
  if (py >= ctrlY && py <= ctrlY + ctrlH &&
      px >= ctrlX && px <= ctrlX + ctrlTotalW) {
    const idx = Math.floor((px - ctrlX) / ctrlSegW);
    const modes = ["auto", "mouse", "joystick"];
    if (idx >= 0 && idx < 3) {
      setControlMode(modes[idx]);
      return true;
    }
  }

  const sndTotalW = 240;
  const sndX = cx - sndTotalW / 2;
  const sndY = my + 215;
  const sndH = 42;
  const sndSegW = sndTotalW / 2;
  if (py >= sndY && py <= sndY + sndH &&
      px >= sndX && px <= sndX + sndTotalW) {
    const idx = Math.floor((px - sndX) / sndSegW);
    soundOn = (idx === 0);
    try { localStorage.setItem(LS_SOUND_KEY, soundOn ? "1" : "0"); } catch(e) {}
    return true;
  }

  const musTotalW = 240;
  const musX = cx - musTotalW / 2;
  const musY = my + 315;
  const musH = 42;
  const musSegW = musTotalW / 2;
  if (py >= musY && py <= musY + musH &&
      px >= musX && px <= musX + musTotalW) {
    const idx = Math.floor((px - musX) / musSegW);
    setMusicOn(idx === 0);
    return true;
  }

  return false;
}

// ===== MENU HOVER (mouse) =====
function updateMenuHover(px, py) {
  let hoveredAny = false;

  mainMenuButtons.forEach((btn) => {
    if (px >= btn.x && px <= btn.x + btn.w &&
        py >= btn.y && py <= btn.y + btn.h) {
      btn.hovered = true;
      hoveredAny = true;
    } else {
      btn.hovered = false;
    }
  });

  // Sync focused to hovered button (glow follows mouse)
  if (hoveredAny) {
    for (let i = 0; i < mainMenuButtons.length; i++) {
      if (mainMenuButtons[i].hovered) { focusedButton = i; break; }
    }
  } else {
    focusedButton = -1;
  }
}