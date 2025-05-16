import {
  setSoundEffectVolume,
  setMusicVolume,
  soundEffectVolume,
  musicVolume,
  toggleSfxMute,
  toggleMusicMute,
  soundEffects,
  playSoundEffects,
} from "./audio.mjs";

export function setUpSettings(game) {
  const navLayoutNotes = document.querySelectorAll(".navLayout-toggle");
  navLayoutNotes.forEach((note) => {
    note.addEventListener("click", () => {
      changeNavlayout(note);
    });
  });
  audioSettingsSetup();
  readableNumbersSetup(game);
}

export function changeNavlayout(note) {
  const navNotes = document.querySelectorAll(".nav-notes");
  navNotes.forEach((notes) => {
    notes.style.display = "flex";
  });
  switch (note.textContent) {
    case "Square":
      navNotes.forEach((notes) => {
        notes.style.display = "grid";
        notes.style.gridTemplateColumns = "1fr 1fr";
        notes.style.rowGap = "20px";
      });
      break;
    case "Sideways":
      navNotes.forEach((notes) => {
        notes.style.flexDirection = "row";
      });
      break;
    case "Down":
      navNotes.forEach((notes) => {
        notes.style.flexDirection = "column";
      });
      break;
  }
}

export function audioSettingsSetup() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  // let isMobile = undefined;
  // window.innerWidth <= 768 ? isMobile = true : isMobile = false;

  const sfxSlider = document.getElementById("sfx-volume");
  const musicSlider = document.getElementById("music-volume");
  const SFXMuteToggle = document.getElementById("sfx-mute-toggle");
  const musicMuteToggle = document.getElementById("music-mute-toggle");
  const sfxMute = document.getElementById("sfx-mute");
  const musicMute = document.getElementById("music-mute");

  // Get parent elements for styling
  const sfxNote = sfxMute.closest(".settings-note");
  const musicNote = musicMute.closest(".settings-note");

  if (isMobile) {
    // Hide sliders and show mute toggle
    sfxSlider.closest(".settings-note").style.display = "none";
    musicSlider.closest(".settings-note").style.display = "none";
    sfxMute.style.display = "block";
    musicMute.style.display = "block";

    let isSFXMuted = false;
    let isMusicMuted = false;

    // Set initial text
    SFXMuteToggle.textContent = "Mute";
    musicMuteToggle.textContent = "Mute";

    // Set initial color
    sfxNote.classList.add("green");
    musicNote.classList.add("green");

    sfxMute.addEventListener("click", (e) => {
      e.stopPropagation();
      isSFXMuted = !isSFXMuted;
      SFXMuteToggle.textContent = isSFXMuted ? "Unmute" : "Mute";

      // Toggle dot color
      sfxNote.classList.toggle("green", !isSFXMuted);

      toggleSfxMute(isSFXMuted);
    });

    musicMute.addEventListener("click", (e) => {
      e.stopPropagation();
      isMusicMuted = !isMusicMuted;
      musicMuteToggle.textContent = isMusicMuted ? "Unmute" : "Mute";

      // Toggle dot color
      musicNote.classList.toggle("green", !isMusicMuted);

      toggleMusicMute(isMusicMuted);
    });
  } else {
    // Desktop: initialize sliders
    sfxSlider.value = soundEffectVolume;
    musicSlider.value = musicVolume;

    sfxSlider.addEventListener("input", (e) => {
      setSoundEffectVolume(parseFloat(e.target.value));
    });

    musicSlider.addEventListener("input", (e) => {
      setMusicVolume(parseFloat(e.target.value));
    });

    // Ensure volume is applied on load
    setSoundEffectVolume(parseFloat(sfxSlider.value));
    setMusicVolume(parseFloat(musicSlider.value));

    const settingsNotes = document.querySelectorAll(".settings-note");
    settingsNotes.forEach((note) => {
      note.addEventListener("mouseenter", () => {
        playSoundEffects(soundEffects.spyglass);
      });
    });

    const moveScreenNotes = document.querySelectorAll(".move-screen-buttons");
    moveScreenNotes.forEach((note) => {
      note.addEventListener("mouseenter", () => {
        // Play a Sound
      });
    });
  }
}

export function readableNumbersSetup(game) {
  const readableNumbersNote = document.getElementById("readable-numbers-note");
  const readableNumbersToggle = document.getElementById(
    "readable-numbers-toggle"
  );

  // Set initial state
  readableNumbersToggle.textContent = game.isReadableNumbersOn ? "On" : "Off";
  readableNumbersNote.classList.toggle("green", game.isReadableNumbersOn);

  // Clone and replace the note (if really needed)
  const clone = readableNumbersNote.cloneNode(true);
  readableNumbersNote.parentNode.replaceChild(clone, readableNumbersNote);

  // Re-select the toggle since the original might be detached
  const newToggle = document.getElementById("readable-numbers-toggle");

  clone.addEventListener("click", () => {
    game.isReadableNumbersOn = !game.isReadableNumbersOn;
    newToggle.textContent = game.isReadableNumbersOn ? "On" : "Off";
    clone.classList.toggle("green", game.isReadableNumbersOn);
  });
}
