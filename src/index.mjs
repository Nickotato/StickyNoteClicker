document.addEventListener("DOMContentLoaded", () => {
  // Check if the user has already acknowledged the beta status
  const hasSeenBetaAlert = localStorage.getItem("hasSeenBetaAlert");

  if (!hasSeenBetaAlert) {
    alert(
      "🚧 This website is currently in beta. Features may change or break unexpectedly."
    );
    localStorage.setItem("hasSeenBetaAlert", "true");
  }
});

import "./styles.css";
import {
  bgMusic,
  playBackgroundMusic,
  setSoundEffectVolume,
  setMusicVolume,
  soundEffectVolume,
  musicVolume,
  toggleSfxMute,
  toggleMusicMute,
  soundEffects,
  playSoundEffects,
} from "./audio.mjs";
import {
  readableNumber,
  getTotalCost,
  getCardSrc,
  capitalize,
  getRandomStickyNoteColor,
  spawnFloatingNote,
  spawnFloatingNumber,
} from "./utils.mjs";

import {
  defaultWorkers,
  defaultUpgrades,
  defaultAchievements,
  defaultVisuals,
} from "./defaults/defaults.mjs";
import { setUpSettings, updateSaveSlotUI } from "./settings.mjs";
import {
  initializeShop,
  updateShopDescriptions,
  moveShopSectionIfMobile,
} from "./shop.mjs";
import {
  checkForAchievements,
  addAchievementNote,
  updateAchievementStats,
} from "./achivementsLogic.mjs";
import {
  initializeCasino,
  updateCasinoMoneyDisplay,
} from "./casino/casino.mjs";
import { save, load, newGame } from "./main-game/saveLoad.mjs";

const screenChangeButtons = document.querySelectorAll(".move-screen-buttons");
const mainContainer = document.getElementById("main-container");
const stickynotes = document.querySelectorAll(".stickynote");

screenChangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playSoundEffects(soundEffects.whoosh1);
    const noSpacesString = button.textContent.trim();
    if (noSpacesString === "Games") {
      mainContainer.style.transform = `translate(-100%, 0)`;
    } else if (noSpacesString === "Settings") {
      mainContainer.style.transform = `translate(0, -100vh)`;
    } else if (noSpacesString === "Note") {
      mainContainer.style.transform = `translate(0, 0)`;
    } else if (noSpacesString === "Achievements") {
      mainContainer.style.transform = `translate(-100%, -100vh)`;
    } else if (noSpacesString === "Casino") {
      mainContainer.style.transform = `translate(100%, 0)`;
    }
  });
});

stickynotes.forEach((note) => {
  note.addEventListener("click", () => {
    if (note.classList.contains("drop-note")) {
      note.classList.add("used");
      setTimeout(() => note.classList.remove("used"), 500);
    }
  });
});

// Game logic
const mainButton = document.getElementById("main-stickynote");
const moneyText = document.getElementById("notes-amount");
const perSec = document.getElementById("per-sec");
const cpsText = document.getElementById("cps");

const game = {
  _money: 0,
  set money(val) {
    this._money = val;
    updateMoneyText();
    updateMoneyPerSecondText();
  },
  get money() {
    return this._money;
  },
  isReadableNumbersOn: true,
  workers: { ...defaultWorkers },
  upgrades: { ...defaultUpgrades },
  visuals: { ...defaultVisuals },
  achievements: [...defaultAchievements],
  unlockedAchievements: 0,
  totalClicks: 0,
  totalNotes: 0,
  noteValue: 1,
  clickTimestamps: [],
  clickBonus: 1,
  upgrade1Bonus: 0,
  upgrade2Bonus: 0,
  totalRate: 0,
  currentSaveSlot: "save1",
  get totalAchievements() {
    return this.achievements.length;
  },
};

const CPS_WINDOW_MS = 1000;
let isClicking = false;
let clickCooldownTimeout = null;

let planeMultiplier = 0;

document.addEventListener(
  "click",
  () => {
    playBackgroundMusic();
  },
  { once: true }
);

mainButton.addEventListener("click", (event) => {
  event.stopPropagation();
  playSoundEffects(soundEffects.click1);

  if (game.upgrades.upgrade3.owned > 0)
    game.clickBonus =
      game.noteValue *
      game.upgrades.upgrade3.value ** game.upgrades.upgrade3.owned;
  game.money += game.clickBonus;
  game.totalNotes += game.clickBonus;
  game.totalClicks++;
  game.clickTimestamps.push(Date.now());
  updateMoneyText();

  // 👉 Determine spawn position
  const rect = mainButton.getBoundingClientRect();
  let x, y;

  if (event.clientX === 0 && event.clientY === 0) {
    // Spacebar or keyboard click — center note
    x = rect.left + rect.width / 2 - 10;
    y = rect.top + rect.height / 2 - 50;
  } else {
    // Mouse click — use actual position
    x = event.clientX;
    y = event.clientY;
  }

  spawnFloatingNote(x, y);
  spawnFloatingNumber(x, y, game.clickBonus, game);

  if (!isClicking) {
    isClicking = true;
    const rateDisplays = document.getElementById("rate-displays");

    if (game.upgrades.upgrade1.owned > 0 || game.upgrades.upgrade2.owned > 0) {
      // Start hidden and off-screen
      rateDisplays.style.opacity = "0";

      rateDisplays.style.opacity = "1";
      // Slide in
      setTimeout(() => {
        rateDisplays.style.left = "20px"; // animate to visible position
      }, 100);
    }
  }

  if (clickCooldownTimeout) clearTimeout(clickCooldownTimeout);
  clickCooldownTimeout = setTimeout(() => {
    isClicking = false;
    const rateDisplays = document.getElementById("rate-displays");

    // Slide back out
    rateDisplays.style.opacity = "0";
    rateDisplays.style.left = "-300px";
  }, 500);
});

function calculateNoteValue() {
  let value = 1;
  if (game.upgrades.upgrade5.owned) {
    value *= game.upgrades.upgrade5.value;
  }
  game.noteValue = value;
}

export function calculateMoneyPerSecond(initial) {
  let moneyPerSec = 0;
  const rateDisplays = document.getElementById("rate-displays");

  let workerIncome = 0;
  Object.values(game.workers).forEach((worker) => {
    let baseIncome = worker.produce * worker.owned;

    // Upgrade 7: Bonus every 5 owned
    if (game.upgrades.upgrade7.owned > 0 && worker.owned >= 5) {
      const multiplesOfFive = Math.floor(worker.owned / 5);
      const bonusUnits = multiplesOfFive * 5;
      const normalUnits = worker.owned - bonusUnits;

      const bonusIncome =
        bonusUnits * worker.produce * (1 + game.upgrades.upgrade7.value);
      const normalIncome = normalUnits * worker.produce;

      baseIncome = bonusIncome + normalIncome; // * game.noteValue;
    } else {
      baseIncome = worker.owned * worker.produce; // * game.noteValue;
    }

    workerIncome += baseIncome;
  });

  moneyPerSec += workerIncome;
  const initialMoneyPerSec = moneyPerSec;

  if (initial === "initial") return initialMoneyPerSec;

  game.upgrade1Bonus = 0;
  game.upgrade2Bonus = 0;

  if (
    isClicking &&
    (game.upgrades.upgrade1.owned > 0 || game.upgrades.upgrade2.owned > 0)
  ) {
    rateDisplays.style.display = "flex";

    if (game.upgrades.upgrade1.owned > 0) {
      game.upgrade1Bonus =
        initialMoneyPerSec *
        (game.upgrades.upgrade1.owned * game.upgrades.upgrade1.value);
      moneyPerSec += game.upgrade1Bonus;
    }

    if (game.upgrades.upgrade2.owned > 0) {
      const cps = calculateCPS();
      game.upgrade2Bonus =
        initialMoneyPerSec *
        (cps * game.upgrades.upgrade2.value * game.upgrades.upgrade2.owned);
      moneyPerSec += game.upgrade2Bonus;
    }
  } else {
    rateDisplays.style.display = "none";
  }

  game.totalRate = moneyPerSec - initialMoneyPerSec;
  // if (game.upgrades.upgrade5.owned > 0) {
  moneyPerSec *= game.noteValue;
  // }
  if (planeMultiplier > 0) {
    moneyPerSec += planeMultiplier * initialMoneyPerSec;
  }
  updateRateDisplays(moneyPerSec);

  return moneyPerSec;
}

function updateMoneyText() {
  if (game.isReadableNumbersOn)
    moneyText.textContent = `You have ${readableNumber(
      game.money
    )} sticky notes`;
  else moneyText.textContent = `You have ${game.money.toFixed(0)} sticky notes`;
}

function updateMoneyPerSecondText() {
  const NPS = calculateMoneyPerSecond();
  if (game.isReadableNumbersOn)
    perSec.textContent = `${readableNumber(NPS)} notes per second`;
  else perSec.textContent = `${NPS.toFixed(0)} notes per second`;
}

function calculateCPS() {
  const now = Date.now();
  game.clickTimestamps = game.clickTimestamps.filter(
    (timestamp) => now - timestamp < CPS_WINDOW_MS
  );
  return game.clickTimestamps.length;
}

function updateCPS() {
  const cps = calculateCPS();
  cpsText.textContent = `${cps} cps`;
}

function updateRateDisplays(moneyPerSec) {
  const baseRateEl = document.getElementById("base-rate");
  const upgrade1RateEl = document.getElementById("upgrade1-rate");
  const upgrade2RateEl = document.getElementById("upgrade2-rate");
  const totalRateEl = document.getElementById("total-rate");

  const base = calculateMoneyPerSecond("initial");

  upgrade1RateEl.style.display =
    game.upgrades.upgrade1.owned > 0 ? "block" : "none";
  upgrade2RateEl.style.display =
    game.upgrades.upgrade2.owned > 0 ? "block" : "none";

  if (base === 0) {
    return;
  }

  baseRateEl.textContent = `Base NPS: +${base.toFixed(1)}`;
  upgrade1RateEl.textContent = `+${(game.upgrade1Bonus / base).toFixed(1)}x`;
  upgrade2RateEl.textContent = `+${(game.upgrade2Bonus / base).toFixed(1)}x`;
  totalRateEl.textContent = `Total bonus: ${(moneyPerSec / base).toFixed(1)}x`;
}

function updateVisualDisplay() {
  const selectedVisuals = Object.values(game.visuals).filter((v) => v.selected);

  selectedVisuals.forEach((visual) => {
    if (visual.type === "note") {
      if (visual.id === "clearNote") mainButton.innerHTML = "";
      else
        mainButton.innerHTML = `<img src=${visual.image} class="main-note-img"/>`;
    } else if (visual.type === "note-color" && visual.selected) {
      mainButton.style.background = visual.color;
    } else if (visual.type === "background" && visual.selected) {
      const leftSection = document.querySelector(".left-section");
      if (visual.image)
        leftSection.style.backgroundImage = `url(${visual.image})`;
      if (visual.color) leftSection.style.background = visual.color;
    }
  });
}

function initGame(saveSlot = "save1") {
  game.currentSaveSlot = saveSlot;

  const saveKey = `stickyNotesGame_${saveSlot}`;
  if (localStorage.getItem(saveKey) != null) {
    load(game, saveSlot); // Load existing save
  } else {
    newGame(game, saveSlot, false); // No confirm if it's first-time init
  }
  updateMoneyText();
  updateMoneyPerSecondText();
  updateRateDisplays();
  updateAchievementStats(game);
  updateSaveSlotUI(saveSlot);
  initializeShop(game, updateVisualDisplay);
  moveShopSectionIfMobile();
  setUpSettings(game, initGame);
  initializeCasino(game, mainContainer);

  document.getElementById("delete-save").addEventListener("click", () => {
    newGame(game, game.currentSaveSlot); // Confirmed reset on delete
  });
}

function update() {
  calculateNoteValue();
  game.money += calculateMoneyPerSecond() / 10;
  game.totalNotes += calculateMoneyPerSecond() / 10;
  updateMoneyPerSecondText();
  updateMoneyText();
  updateShopDescriptions(game);

  checkForAchievements(game, mainContainer);
  updateCasinoMoneyDisplay(game);

  if (game.upgrades.upgrade6.owned > 0) {
    const casinoButton = document.getElementById("casino-screen-note");

    if (casinoButton && casinoButton.style.display === "none") {
      casinoButton.style.display = "block"; // or "inline-block", depending on your layout
    }
  }

  save(game);
}

setInterval(update, 100);
setInterval(updateCPS, 100);
initGame();

////////////////////
////GAMES LOGIC////
//////////////////

document.addEventListener("DOMContentLoaded", () => {
  const gameNotes = document.querySelectorAll(".game-note");

  gameNotes.forEach((note) => {
    note.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevents click from closing the note immediately
      const gameName = note.getAttribute("data-game");
      showCenteredGame(note, gameName);
    });
  });

  // Add event listener to close game notes when clicking outside
  document.body.addEventListener("click", closeCenteredGame);
});

function showCenteredGame(note, gameName) {
  const gamesSection = document.getElementById("games-section");
  if (!gamesSection) return;

  let overlay = gamesSection.querySelector(".game-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("game-overlay");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "5";
    gamesSection.appendChild(overlay);
  }

  overlay.style.display = "flex";
  note.classList.add("centered");

  // 🔁 Scale up iframe when centered
  const iframe = note.querySelector("iframe");
  if (iframe) {
    iframe.style.transform = "scale(1)";
  }
}

function closeCenteredGame(e) {
  const gamesSection = document.getElementById("games-section");
  const overlay = gamesSection?.querySelector(".game-overlay");
  const centeredNote = document.querySelector(".game-note.centered");

  if (overlay && centeredNote) {
    if (e.target === overlay || !centeredNote.contains(e.target)) {
      overlay.style.display = "none";
      centeredNote.classList.remove("centered");

      // 🔁 Scale iframe back down
      const iframe = centeredNote.querySelector("iframe");
      if (iframe) {
        iframe.style.transform = "scale(0.70)";
      }
    }
  }
}

///////////////////////////
////SMALL SCREEN LOGIC////
/////////////////////////

document.addEventListener("dblclick", function (e) {
  e.preventDefault();
});

////////////////////////
////ADMIN FUNCTIONS////
//////////////////////

window.unlockSecret = function (code, value) {
  if (code === "money123") {
    if (!value) return;
    console.log(
      `%cYou unlocked ${value} notes!`,
      "color: gold; font-size: 16px;"
    );
    game.money = value;
  } else if (code === "achievements") {
    game.achievements.forEach((ach) => {
      unlockAchievement(ach.id);
    });
  } else if (code === "resetBigness") {
    game.upgrades.upgrade3.owned = 0;
  } else if (code === "spawnPlane") {
    spawnAirplane();
  } else if (code === "casino") {
    game.upgrades.upgrade6.owned = 1;
  } else {
    console.log("Invalid code.");
  }
};

window.addEventListener("message", function (event) {
  // Optional: check origin
  // if (event.origin !== "https://trusted-origin.com") return;

  if (event.data && event.data.type === "scoreUpdate") {
    const score = event.data.score;
    console.log(score);
  }
});

///////////////////////////
////AIRPLANE FUNCTIONS////
/////////////////////////

let multiplierEndTime = 0; // The time when the multiplier will end
let countdownInterval = null; // Timer for the countdown
let countdownDisplay = null; // Element for the countdown timer
let paper = null; // The paper element to hold the timer

function createCountdownExtraStyles() {
  // Check if elements already exist to avoid creating them multiple times
  if (countdownDisplay && !paper) {
    // Creating a clip at the top of the clipboard
    let clip = document.createElement("div");
    clip.style.position = "absolute";
    clip.style.top = "-10px";
    clip.style.left = "50%";
    clip.style.transform = "translateX(-50%)";
    clip.style.width = "60px";
    clip.style.height = "15px";
    clip.style.backgroundColor = "#999";
    clip.style.borderRadius = "8px";
    clip.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    clip.style.zIndex = "1041";

    paper = document.createElement("div");
    paper.classList.add = "clipboard-paper";
    paper.style.position = "absolute";
    paper.style.top = "0px";
    paper.style.left = "50%";
    paper.style.transform = "translateX(-50%)";
    paper.style.width = "calc(100% - 10px)";
    paper.style.height = "calc(100% - 10px)";
    paper.style.backgroundColor = "#fff";
    paper.style.borderRadius = "8px";
    paper.style.boxShadow = "inset 0 0 10px rgba(0, 0, 0, 0.1)";
    paper.style.backgroundImage = "linear-gradient(to bottom, #fff, #f9f9f9)";
    paper.style.zIndex = "1010";
    paper.style.position = "relative";
    paper.style.overflow = "hidden";
    paper.style.display = "flex";
    paper.style.flexDirection = "column";
    paper.style.justifyContent = "center";
    paper.style.alignItems = "center";

    // Add the elements to the countdown display once
    countdownDisplay.appendChild(clip);
    countdownDisplay.appendChild(paper);
  }
}

function createCountdownDisplay() {
  // Create the countdown display if it doesn't exist
  if (!countdownDisplay) {
    countdownDisplay = document.createElement("div");
    countdownDisplay.classList.add("countdown-display");
    countdownDisplay.style.position = "fixed";
    countdownDisplay.style.top = "50%";
    countdownDisplay.style.left = "-300px";
    countdownDisplay.style.transform = "translateY(-50%)";
    countdownDisplay.style.width = "130px";
    countdownDisplay.style.height = "180px";
    countdownDisplay.style.backgroundColor = "#deb887";
    countdownDisplay.style.border = "2px solid #8B4513";
    countdownDisplay.style.borderRadius = "10px";
    countdownDisplay.style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.1)";
    countdownDisplay.style.zIndex = "1000";
    countdownDisplay.style.transition = "left 0.5s ease-in-out";
    // Adding the countdown display to the page
    document.body.appendChild(countdownDisplay);

    // Trigger the slide-in effect after appending to the body
    setTimeout(() => {
      countdownDisplay.style.left = "20px"; // Move to visible position
    }, 10);

    // Create the extra styles only once
    createCountdownExtraStyles();
  }
}

// Function to update the countdown display
function updateCountdownDisplay(timeLeft) {
  if (countdownDisplay) {
    // Update the countdown text inside the clipboard, only change the timer text
    const timerElement = document.createElement("div");
    timerElement.style.textAlign = "center";
    timerElement.style.fontWeight = "bold";
    timerElement.style.fontSize = "24px";
    timerElement.style.padding = "10px 0";
    timerElement.textContent = `${Math.floor(timeLeft / 1000)}`;
    timerElement.style.zIndex = "1030"; // Ensure the countdown text appears on top

    // Clear previous timer and append the new one to the paper element
    paper.innerHTML = ""; // Clear any previous timer element
    paper.appendChild(timerElement);
  }
}

function startMultiplierCountdown() {
  createCountdownDisplay(); // Ensure countdown display exists

  if (countdownInterval) clearInterval(countdownInterval); // Clear any existing countdown

  // Start a new countdown
  countdownInterval = setInterval(() => {
    const timeLeft = Math.max(0, multiplierEndTime - Date.now()); // Calculate time left

    updateCountdownDisplay(timeLeft); // Update the display with the remaining time

    if (timeLeft <= 0) {
      planeMultiplier = 0; // Reset the multiplier if time is up
      clearInterval(countdownInterval);
      countdownInterval = null;
      paper.innerHTML = "Multiplier ended!";
      setTimeout(() => countdownDisplay.remove(), 2000); // Remove the countdown display after 2 seconds
    }
  }, 1000); // Check every second
}

function spawnAirplane() {
  console.log("Airplane Spawned");
  const airplane = document.createElement("div");
  airplane.classList.add("airplane");

  // Choose a random entry side
  const sides = ["left", "right", "top", "bottom"];
  const side = sides[Math.floor(Math.random() * sides.length)];

  let startX, startY, endX, endY;

  // Define start and end positions based on side
  switch (side) {
    case "left":
      startX = -100;
      startY = Math.random() * window.innerHeight;
      endX = window.innerWidth + 100;
      endY = startY + (Math.random() * 200 - 100); // drift
      break;
    case "right":
      startX = window.innerWidth + 100;
      startY = Math.random() * window.innerHeight;
      endX = -100;
      endY = startY + (Math.random() * 200 - 100);
      break;
    case "top":
      startX = Math.random() * window.innerWidth;
      startY = -100;
      endX = startX + (Math.random() * 200 - 100);
      endY = window.innerHeight + 100;
      break;
    case "bottom":
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 100;
      endX = startX + (Math.random() * 200 - 100);
      endY = -100;
      break;
  }

  // Set styles for starting position
  airplane.style.position = "fixed";
  airplane.style.left = `${startX}px`;
  airplane.style.top = `${startY}px`;
  airplane.style.transition = "transform 10s linear";
  airplane.style.zIndex = 999;

  document.body.appendChild(airplane);

  // Animate to end position
  requestAnimationFrame(() => {
    airplane.style.transform = `translate(${endX - startX}px, ${
      endY - startY
    }px)`;
  });

  // Click to activate multiplier
  airplane.addEventListener("click", () => {
    const rect = airplane.getBoundingClientRect();
    airplane.style.transition = "none";
    airplane.style.transform = `translate(0, 0) translate(${rect.left}px, ${rect.top}px)`;
    airplane.classList.add("pop");
    planeMultiplier = 20;
    multiplierEndTime = Date.now() + 60000;
    startMultiplierCountdown();
    setTimeout(() => airplane.remove(), 300);
  });

  // Remove after flight ends
  setTimeout(() => {
    if (document.body.contains(airplane)) {
      airplane.remove();
    }
  }, 10000);
}

function startSpawning() {
  function spawnLoop() {
    const delay = Math.random() * 120000 + 60000; // Between 60s and 180s
    if (Math.random() < 0.8) spawnAirplane();
    setTimeout(spawnLoop, delay);
  }
  spawnLoop();
}

startSpawning();

// This function will be used to reset the timer and add 60 seconds when a new plane is hit
function addTimeToMultiplier() {
  if (planeMultiplier > 0) {
    multiplierEndTime += 60000; // Add 60 seconds to the countdown
  }
}
