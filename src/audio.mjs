const storedSFX = localStorage.getItem("sfxVolume");
const storedMusic = localStorage.getItem("musicVolume");

export let soundEffectVolume = storedSFX !== null ? parseFloat(storedSFX) : 0.5;
export let musicVolume = storedMusic !== null ? parseFloat(storedMusic) : 0.5;

export const bgMusic = new Audio();
bgMusic.src = require("url:./sounds/music/nichijou.mp3");
bgMusic.loop = true;
bgMusic.volume = musicVolume;

export const clickSound1 = new Audio();
clickSound1.src = require("url:./sounds/SFX/comedypop.mp3");
clickSound1.volume = soundEffectVolume;

export const clickSound2 = new Audio();
clickSound2.src = require("url:./sounds/SFX/pop.mp3");
clickSound2.volume = soundEffectVolume;

export const whoosh1 = new Audio();
whoosh1.src = require("url:./sounds/SFX/Whoosh1.mp3");
whoosh1.volume = soundEffectVolume;

export const whoosh2 = new Audio();
whoosh2.src = require("url:./sounds/SFX/Whoosh2.mp3");
whoosh2.volume = soundEffectVolume;

const spyglass = new Audio(require("url:./sounds/SFX/spyglass.mp3"));
spyglass.volume = soundEffectVolume;

const click2 = new Audio(require("url:./sounds/SFX/click2.mp3"));
click2.volume = soundEffectVolume;

const hover = new Audio(require("url:./sounds/SFX/hover.mp3"));
hover.volume = soundEffectVolume;

const orb = new Audio(require("url:./sounds/SFX/orb.mp3"));
orb.volume = soundEffectVolume;

const shop = new Audio(require("url:./sounds/SFX/eshop.wav"));
shop.volume = soundEffectVolume;

export function playClickSound() {
  const sound = clickSound1.cloneNode(); // Clone allows overlap
  sound.volume = soundEffectVolume;
  sound.play().catch((e) => console.warn("Sound blocked:", e));
}

export function playWhooshSound() {
  whoosh1.currentTime = 0;
  whoosh1.play();
}

export function playWhoosh2Sound() {
  whoosh2.currentTime = 0;
  whoosh2.play();
}

export function playSpyglassSound() {
  spyglass.currentTime = 0;
  spyglass.play();
}

export function playClick2Sound() {
  click2.currentTime = 0;
  click2.play();
}

export function playHoverSound() {
  hover.currentTime = 0;
  hover.play();
}

export function playOrbSound() {
  orb.currentTime = 0;
  orb.play();
}

export function playShopSound() {
  shop.currentTime = 0;
  shop.play();
}

export function playBackgroundMusic() {
  bgMusic.play().catch((e) => {
    console.warn("Autoplay blocked, waiting for user interaction.");
  });
}

export function setSoundEffectVolume(volume) {
  soundEffectVolume = volume;
  clickSound1.volume = volume;
  clickSound2.volume = volume;
  whoosh1.volume = volume;
  whoosh2.volume = volume;
  spyglass.volume = volume;

  // soundEffects.forEach(effect => effect.volume = volume)
  localStorage.setItem("sfxVolume", volume);
}

export function setMusicVolume(volume) {
  musicVolume = volume;
  localStorage.setItem("musicVolume", volume);

  // Apply volume and force reloading for iOS
  bgMusic.pause();
  bgMusic.volume = volume;

  // Small delay before replaying (helps trigger correct state on iOS)
  setTimeout(() => {
    bgMusic.play().catch((e) => {
      console.warn("Play blocked after volume change:", e);
    });
  }, 50);
}

export function toggleSfxMute(isMuted) {
  clickSound1.muted = isMuted;
  clickSound2.muted = isMuted;
  whoosh1.muted = isMuted;
  whoosh2.muted = isMuted;
  spyglass.muted = isMuted;
}

export function toggleMusicMute(isMuted) {
  bgMusic.muted = isMuted;
}
