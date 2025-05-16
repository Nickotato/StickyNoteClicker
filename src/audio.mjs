const storedSFX = localStorage.getItem("sfxVolume");
const storedMusic = localStorage.getItem("musicVolume");

export let soundEffectVolume = storedSFX !== null ? parseFloat(storedSFX) : 0.5;
export let musicVolume = storedMusic !== null ? parseFloat(storedMusic) : 0.5;

export let soundEffects = {
  click1: new Audio(require("url:./sounds/SFX/comedypop.mp3")),
  click2: new Audio(require("url:./sounds/SFX/click2.mp3")),
  click3: new Audio(require("url:./sounds/SFX/pop.mp3")),

  whoosh1: new Audio(require("url:./sounds/SFX/Whoosh1.mp3")),
  whoosh2: new Audio(require("url:./sounds/SFX/Whoosh2.mp3")),
  spyglass: new Audio(require("url:./sounds/SFX/spyglass.mp3")),
  hover: new Audio(require("url:./sounds/SFX/hover.mp3")),
  orb: new Audio(require("url:./sounds/SFX/orb.mp3")),
  shop: new Audio(require("url:./sounds/SFX/eshop.wav")),
};

export let musicTracks = {
  nichijou: new Audio(require("url:./sounds/music/nichijou.mp3")),
  // Add more music tracks here
};

for (const audio of Object.values(soundEffects)) {
  audio.volume = soundEffectVolume;
}

for (const track of Object.values(musicTracks)) {
  track.loop = true;
  track.volume = musicVolume;
}

export function playSoundEffects(sound) {
  for (const value of Object.values(soundEffects)) {
    if (value === sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }
}

let currentMusic = null;

export function playBackgroundMusic(trackName = "nichijou") {
  if (currentMusic) {
    currentMusic.pause();
  }

  currentMusic = musicTracks[trackName];
  if (!currentMusic) {
    console.warn(`Music track "${trackName}" not found.`);
    return;
  }

  currentMusic.currentTime = 0;
  currentMusic.play().catch((e) => {
    console.warn("Autoplay blocked, waiting for user interaction.", e);
  });
}

export function setSoundEffectVolume(volume) {
  for (const audio of Object.values(soundEffects)) {
    audio.volume = volume;
  }
  localStorage.setItem("sfxVolume", volume);
}

export function setMusicVolume(volume) {
  musicVolume = volume;
  localStorage.setItem("musicVolume", volume);

  for (const track of Object.values(musicTracks)) {
    track.volume = volume;
  }

  // Apply volume to currently playing music
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.volume = volume;
    setTimeout(() => {
      currentMusic.play().catch((e) => {
        console.warn("Play blocked after volume change:", e);
      });
    }, 50);
  }
}

export function toggleSfxMute(isMuted) {
  for (const sound of Object.values(soundEffects)) {
    sound.muted = isMuted;
  }
}

export function toggleMusicMute(isMuted) {
  for (const track of Object.values(musicTracks)) {
    track.muted = isMuted;
  }
}


