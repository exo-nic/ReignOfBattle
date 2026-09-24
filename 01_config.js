"use strict";
/* =====================================================
   01_config.js — REIGN OF BATTLE
   Canvas + global state + constants + TANK_SPECS
   No function calls. Declarations only.
   ===================================================== */

// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = 1280;
const H = 720;

// ===== TIMESTEP =====
const FIXED_DT = 1 / 60;
let physicsAccumulator = 0;
let dtGlobal = 1 / 60;
let globalTime = 0;
let lastTime = performance.now();

// ===== PHYSICS =====
const GRAVITY = 1100;
const MAX_WIND = 180;
let wind = 0;
let windTimer = 3;

// ===== AIM =====
const MIN_ANGLE = 5;
const MAX_ANGLE = 89;
const BARREL_LENGTH = 42;

// ===== GAME STATE =====
let currentScreen = "menu";   // "menu" | "playing" | "over" | "garage"
let turn = "player";
let aimLocked = false;
let winner = null;
let playingStartTime = 0;
let gameMode = "1P";
let resultMsg = "";

// ===== FADE TRANSITION =====
let fadeAlpha = 0;
let isFading = false;
let pendingScreen = null;

// ===== OVERLAY MODAL =====
let overlayView = null;
let overlayMessage = "";

// ===== COMBAT FX =====
let camShake = 0;
let hitFlash = 0;

// ===== ARRAYS =====
const projectiles = [];
const particles  = [];
const craters    = [];
const dmgNums    = [];

// ===== STARFIELD =====
const stars = [];
for (let i = 0; i < 45; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * (H * 0.55),
    size: 1 + Math.random() * 1.5,
    speed: 1.5 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
    baseAlpha: 0.15 + Math.random() * 0.35
  });
}

// ===== CLOUDS (parallax) =====
const clouds = [
  { x: 100,  y: 80,  w: 180, h: 42, speed: 12 },
  { x: 600,  y: 130, w: 240, h: 50, speed: 18 },
  { x: 1050, y: 65,  w: 160, h: 36, speed: 10 }
];

// ===== AUDIO =====
let audioCtx = null;
let soundOn = true;

// ===== LOCAL STORAGE KEYS =====
const LS_TANK_KEY  = "reign_selectedTank";
const LS_SOUND_KEY = "reign_soundOn";

// Load sound preference
try {
  const s = localStorage.getItem(LS_SOUND_KEY);
  if (s !== null) soundOn = (s === "1");
} catch (e) { /* offline-safe */ }

// ===== TANK SPECS (5 tanks, canvas-drawn colors) =====
const TANK_SPECS = [
  {
    name: "ABRAMS",
    title: "Heavy Artillery · Tier 1",
    bodyColor: "#508252",
    darkColor: "#375d3c",
    turretColor: "#64875f",
    rimColor:   "#74b374"
  },
  {
    name: "FROST",
    title: "Cryo Cannon · Tier 2",
    bodyColor: "#3a6d8c",
    darkColor: "#22475e",
    turretColor: "#4f8eb5",
    rimColor:   "#7ed0f7"
  },
  {
    name: "BLAZER",
    title: "Plasma Mortar · Tier 3",
    bodyColor: "#8f3e2b",
    darkColor: "#5e2316",
    turretColor: "#b3533b",
    rimColor:   "#ff8264"
  },
  {
    name: "SPECTRE",
    title: "Stealth Railgun · Tier 4",
    bodyColor: "#4a3c69",
    darkColor: "#2f2445",
    turretColor: "#67548f",
    rimColor:   "#ae94e6"
  },
  {
    name: "TOXIC",
    title: "Acid Howitzer · Tier 5",
    bodyColor: "#5c7329",
    darkColor: "#3a4a16",
    turretColor: "#789437",
    rimColor:   "#b4de50"
  }
];

// ===== SELECTED TANK (from localStorage) =====
let selectedTankIdx = 0;
try {
  const t = localStorage.getItem(LS_TANK_KEY);
  if (t !== null) {
    const n = parseInt(t, 10);
    if (n >= 0 && n < TANK_SPECS.length) selectedTankIdx = n;
  }
} catch (e) { /* offline-safe */ }

// Enemy uses FROST (index 1) in both 1P and 2P modes
const ENEMY_TANK_IDX = 1;

// ===== MENU FOCUS =====
let focusedButton = -1;

// ===== CONTROL MODE (for joystick feature) =====
const LS_CTRL_KEY = "reign_controlMode";
let controlMode = "auto";   // "auto" | "mouse" | "joystick"
try {
  const cm = localStorage.getItem(LS_CTRL_KEY);
  if (cm) controlMode = cm;
} catch (e) {}

const IS_TOUCH_DEVICE = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

function effectiveControlMode() {
  if (controlMode === "auto") return IS_TOUCH_DEVICE ? "joystick" : "mouse";
  return controlMode;
}

function setControlMode(mode) {
  controlMode = mode;
  try { localStorage.setItem(LS_CTRL_KEY, mode); } catch (e) {}
}

// ===== FIX / ADDED: SCENERY (trees, bushes) =====
const scenery = [];
(function initScenery() {
  const treeSpots = [
    { x: 60,   type: "tree" },
    { x: 200,  type: "bush" },
    { x: 380,  type: "tree" },
    { x: 560,  type: "bush" },
    { x: 760,  type: "tree" },
    { x: 940,  type: "bush" },
    { x: 1080, type: "tree" },
    { x: 1230, type: "tree" }
  ];
  for (const t of treeSpots) {
    scenery.push({
      x: t.x,
      type: t.type,
      scale: 0.75 + Math.random() * 0.5
    });
  }
})();

// ===== MUSIC CONFIG =====
const LS_MUSIC_KEY = "reign_musicOn";
let musicOn = true;
try {
  const m = localStorage.getItem(LS_MUSIC_KEY);
  if (m !== null) musicOn = (m === "1");
} catch (e) { /* offline-safe */ }