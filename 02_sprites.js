"use strict";
/* =====================================================
   02_sprites.js — REIGN OF BATTLE
   Sprite + icon loader
   ===================================================== */

// ===== KENNEY SPRITE CACHE =====
const KENNEY = {};

function loadKenneySprites() {
  // Reserved for future Kenney sprite loading.
}
loadKenneySprites();

function hasSprite(key) {
  const img = KENNEY[key];
  return !!(img && img.complete && img.naturalWidth > 0);
}

// ===== UI ICONS (joystick SVG) =====
const ICONS = {};

function loadIcons() {
  const iconPaths = {
    base_ring: "assets/icons/base_ring.png",
    knob_base: "assets/icons/knob_base.png",
    icon_aim:  "assets/icons/icon_aim.png",
    fire_btn:  "assets/icons/fire_btn.png"     // NEW
  };

  Object.keys(iconPaths).forEach(key => {
    const img = new Image();
    img.src = iconPaths[key];
    img.onload  = () => { ICONS[key] = img; };
    img.onerror = () => { console.warn("Missing icon:", iconPaths[key]); };
  });
}

loadIcons();

function hasIcon(key) {
  const img = ICONS[key];
  return !!(img && img.complete && img.naturalWidth > 0);
}