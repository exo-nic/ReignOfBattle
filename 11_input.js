"use strict";
/* =====================================================
   11_input.js — REIGN OF BATTLE
   Mouse, keyboard, touch handlers + aim/keyboard helpers
   ===================================================== */

// ===== INPUT STATE =====
let mouseX = W / 2;
let mouseY = H / 2;
const keys = {};

// ===== MOUSE MOVE =====
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouseX = (e.clientX - r.left) * (W / r.width);
  mouseY = (e.clientY - r.top)  * (H / r.height);

  if (currentScreen === "menu" && !overlayView) {
    updateMenuHover(mouseX, mouseY);
  } else if (currentScreen === "garage") {
    updateGarageHover(mouseX, mouseY);
  }
});

// ===== MOUSE DOWN =====
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  if (currentScreen === "menu") {
    handleMenuClick(mouseX, mouseY);
  } else if (currentScreen === "garage") {
    handleGarageClick(mouseX, mouseY);
  } else if (currentScreen === "playing") {
    if (effectiveControlMode() === "joystick") {
      if (joyTouchStart(mouseX, mouseY)) return;
    } else {
      const activeTank = turn === "player" ? player : enemy;
      if (gameMode === "1P" && turn !== "player") return;
      if (!aimLocked) fireTank(activeTank);
    }
  }
});

// ===== TOUCH START =====
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouseX = (touch.clientX - r.left) * (W / r.width);
  mouseY = (touch.clientY - r.top)  * (H / r.height);

  // NEW: joystick routing
  if (currentScreen === "playing" && effectiveControlMode() === "joystick") {
    if (joyTouchStart(mouseX, mouseY)) return;
  }

  if (currentScreen === "menu") {
    handleMenuClick(mouseX, mouseY);
  } else if (currentScreen === "garage") {
    handleGarageClick(mouseX, mouseY);
  } else if (currentScreen === "playing") {
    const activeTank = turn === "player" ? player : enemy;
    if (gameMode === "1P" && turn !== "player") return;
    if (!aimLocked) fireTank(activeTank);
  } else if (currentScreen === "over") {
    resetGame(gameMode);
    currentScreen = "playing";
  }
}, { passive: false });

// ===== TOUCH MOVE =====
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouseX = (touch.clientX - r.left) * (W / r.width);
  mouseY = (touch.clientY - r.top)  * (H / r.height);

  // NEW: joystick routing
  if (currentScreen === "playing" && effectiveControlMode() === "joystick") {
    if (joyTouchMove(mouseX, mouseY)) return;
  }
}, { passive: false });

// Cursor style
canvas.style.cursor = "crosshair";

// ===== KEYBOARD: DOWN =====
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Global sound toggle
  if (e.key === "m" || e.key === "M") {
    toggleSound();
    return;
  }

  // ESC handling
  if (e.key === "Escape") {
    if (overlayView) {
      overlayView = null;
    } else if (currentScreen === "garage") {
      garageIdx = selectedTankIdx;
      startTransitionTo("menu");
    } else if (currentScreen === "playing" || currentScreen === "over") {
      startTransitionTo("menu");
    }
    return;
  }

  // MENU navigation
  if (currentScreen === "menu" && !overlayView) {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      focusedButton = (focusedButton - 1 + mainMenuButtons.length) % mainMenuButtons.length;
      mainMenuButtons.forEach((b, i) => b.hovered = (i === focusedButton));
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      focusedButton = (focusedButton + 1) % mainMenuButtons.length;
      mainMenuButtons.forEach((b, i) => b.hovered = (i === focusedButton));
    } else if (e.key === "Enter" || e.key === " ") {
      selectMenuButton(mainMenuButtons[focusedButton]);
    }
    return;
  }

  // GARAGE navigation
  if (currentScreen === "garage") {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      garageIdx = (garageIdx - 1 + TANK_SPECS.length) % TANK_SPECS.length;
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      garageIdx = (garageIdx + 1) % TANK_SPECS.length;
    } else if (e.key === "Enter") {
      selectedTankIdx = garageIdx;
      try { localStorage.setItem(LS_TANK_KEY, String(selectedTankIdx)); }
      catch (err) { /* offline-safe */ }
      startTransitionTo("menu");
    }
    return;
  }

  // GAME OVER restart
  if (currentScreen === "over" && (e.key === "r" || e.key === "R")) {
    resetGame(gameMode);
    currentScreen = "playing";
    return;
  }
});

// ===== KEYBOARD: UP =====
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ===== AIM FROM MOUSE =====
function aimAtMouse(t) {
  if (aimLocked) return;
  if (gameMode === "1P" && turn !== "player") return;
  if (!t.alive) return;

  // NEW: route to joystick mode
  if (effectiveControlMode() === "joystick") {
    applyJoystickAim(t);
    return;
  }

  const dx = mouseX - t.x;
  const dy = mouseY - (t.y - 14);
  let targetRad = Math.atan2(-dy, dx * t.facing);
  let targetDeg = (targetRad * 180) / Math.PI;

  targetDeg = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, targetDeg));
  t.targetAngle = targetDeg;

  const dist = Math.hypot(dx, dy);
  const tp = 180 + (dist / 500) * 720;
  t.power = Math.max(180, Math.min(900, tp));
}

// ===== KEYBOARD GAMEPLAY CONTROLS =====
function handleKeyboard(dt) {
  if (currentScreen !== "playing") return;

  const activeTank = turn === "player" ? player : enemy;
  if (gameMode === "1P" && turn !== "player") return;

  // Angle
  if (keys["ArrowUp"])   activeTank.targetAngle = Math.min(MAX_ANGLE, activeTank.targetAngle + 60 * dt);
  if (keys["ArrowDown"]) activeTank.targetAngle = Math.max(MIN_ANGLE, activeTank.targetAngle - 60 * dt);
  if (keys["["])         activeTank.targetAngle = MIN_ANGLE;
  if (keys["]"])         activeTank.targetAngle = MAX_ANGLE;
  if (keys["\\"])        activeTank.targetAngle = 45;

  // Power
  if (keys["w"] || keys["W"]) activeTank.power = Math.min(900, activeTank.power + 250 * dt);
  if (keys["s"] || keys["S"]) activeTank.power = Math.max(180, activeTank.power - 250 * dt);

  // Movement
  let moveDir = 0;
  if (keys["a"] || keys["A"] || keys["ArrowLeft"])  moveDir = -1;
  if (keys["d"] || keys["D"] || keys["ArrowRight"]) moveDir =  1;

  if (moveDir !== 0 && !aimLocked) {
    activeTank.x += moveDir * 80 * dt;
    activeTank.x = Math.max(40, Math.min(W - 40, activeTank.x));
    snapTank(activeTank);
  }

  // Fire
  if (keys[" "]) {
    fireTank(activeTank);
    keys[" "] = false;
  }
}

// ===== TOUCH END (joystick release) =====
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (currentScreen === "playing" && effectiveControlMode() === "joystick") {
    joyTouchEnd();
  }
}, { passive: false });

// ===== MOUSE → JOYSTICK (PC testing in joystick mode) =====
canvas.addEventListener("mousemove", (e) => {
  if (currentScreen === "playing" && effectiveControlMode() === "joystick") {
    joyTouchMove(mouseX, mouseY);
  }
});

canvas.addEventListener("mouseup", () => {
  if (currentScreen === "playing" && effectiveControlMode() === "joystick") {
    joyTouchEnd();
  }
});