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
spyglass.volue = soundEffectVolume;

export function playClickSound() {
  clickSound1.currentTime = 0;
  clickSound1
    .play()
    .then(() => {
      //playing
    })
    .catch((error) => {
      console.log("Error playing audio:", error);
    });
}

export function playWhooshSound() {
  whoosh1.currentTime = 0;
  whoosh1.play();
  
}

export function playSpyglassSound() {
  spyglass.currentTime = 0;
  spyglass.play();
}

export function playBackgroundMusic() {
  bgMusic.play().catch((e) => {
    console.warn("Autoplay blocked, waiting for user interaction.");
  });
}

export function toggleMute(isMuted) {
  bgMusic.muted = isMuted;
  clickSound.muted = isMuted;
}

export function setSoundEffectVolume(volume) {
  soundEffectVolume = volume;
  whoosh1.volume = volume;
  localStorage.setItem("sfxVolume", volume);
}


export function setMusicVolume(volume) {
  musicVolume = volume;
  bgMusic.volume = musicVolume;
  localStorage.setItem("musicVolume", volume);
}
