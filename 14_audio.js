"use strict";
/* =====================================================
   14_audio.js — REIGN OF BATTLE
   Background music player with loop + fade + toggle
   ===================================================== */

// ===== AUDIO OBJECT =====
const bgMusic = new Audio();
bgMusic.src = "assets/sounds/menu_music.mp3";
bgMusic.loop = true;
bgMusic.volume = 0.35;
bgMusic.preload = "auto";

let musicReady = false;
let musicPlaying = false;
let musicUnlockTried = false;

bgMusic.addEventListener("canplaythrough", () => {
  musicReady = true;
});

bgMusic.addEventListener("error", () => {
  console.warn("Music file missing or unreadable:", bgMusic.src);
});

// ===== PLAY / PAUSE =====
function playMusic() {
  if (!musicOn) return;
  if (!musicReady) return;
  if (musicPlaying) return;

  const p = bgMusic.play();
  if (p && p.catch) {
    p.catch(() => { /* autoplay blocked — wait for user action */ });
  }
  musicPlaying = true;
}

function pauseMusic() {
  if (!musicPlaying) return;
  bgMusic.pause();
  musicPlaying = false;
}

// ===== TOGGLE =====
function setMusicOn(on) {
  musicOn = on;
  try { localStorage.setItem(LS_MUSIC_KEY, on ? "1" : "0"); } catch (e) {}
  if (!on) {
    pauseMusic();
  } else {
    if (currentScreen === "menu" || currentScreen === "garage") {
      playMusic();
    }
  }
}

// ===== SCREEN-BASED =====
function updateMusicForScreen() {
  if (currentScreen === "menu" || currentScreen === "garage") {
    playMusic();
  } else {
    pauseMusic();
  }
}

// ===== AUTOPLAY UNLOCK =====
// Browsers block autoplay until first user interaction
function tryUnlockMusic() {
  if (musicUnlockTried && musicPlaying) return;
  musicUnlockTried = true;
  if (currentScreen === "menu" || currentScreen === "garage") {
    if (musicReady) {
      playMusic();
    } else {
      bgMusic.addEventListener("canplaythrough", () => {
        if (currentScreen === "menu" || currentScreen === "garage") {
          playMusic();
        }
      }, { once: true });
    }
  }
}

window.addEventListener("click",      tryUnlockMusic);
window.addEventListener("keydown",    tryUnlockMusic);
window.addEventListener("touchstart", tryUnlockMusic, { passive: true });