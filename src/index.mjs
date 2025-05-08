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

import { defaultWorkers } from "./workers.mjs";
import { defaultUpgrades } from "./upgrades.mjs";
import { defaultAchievements } from "./achievements.mjs";

let workers = {};
for (const key in defaultWorkers) {
  workers[key] = {
    ...defaultWorkers[key],
    listenerAttached: false, // ✅ add the flag here
  };
}

let upgrades = { ...defaultUpgrades };
let achievements = [...defaultAchievements];

const stickyNoteColors = {
  pink1: "#ff7eb9",
  pink2: "#ff65a3",
  yellow1: "#feff9c",
  yellow2: "#fff740",
  lightBlue: "#7afcff",
};

// Define color probabilities
const stickyNoteColorChances = [
  { color: stickyNoteColors.pink1, chance: 0.16 },
  { color: stickyNoteColors.pink2, chance: 0.1 },
  { color: stickyNoteColors.yellow1, chance: 0.4 },
  { color: stickyNoteColors.yellow2, chance: 0.2 },
  { color: stickyNoteColors.lightBlue, chance: 0.14 },
];

function getRandomStickyNoteColor() {
  const rand = Math.random();
  let cumulative = 0;
  for (let entry of stickyNoteColorChances) {
    cumulative += entry.chance;
    if (rand < cumulative) return entry.color;
  }
  return stickyNoteColorChances[stickyNoteColorChances.length - 1].color;
}

// Screen navigation
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
const shopSection = document.querySelector(".shop-section");

const tabsContainer = document.createElement("div");
tabsContainer.className = "tabs-container";
shopSection.appendChild(tabsContainer);

const workerTab = document.createElement("button");
workerTab.className = "shop-tab stickynote active";
workerTab.textContent = "Workers";
tabsContainer.appendChild(workerTab);

const upgradeTab = document.createElement("button");
upgradeTab.className = "shop-tab stickynote";
upgradeTab.textContent = "Upgrades";
tabsContainer.appendChild(upgradeTab);

const workerContent = document.createElement("div");
workerContent.className = "shop-content active";
workerContent.id = "worker-content";
shopSection.appendChild(workerContent);

const upgradeContent = document.createElement("div");
upgradeContent.className = "shop-content";
upgradeContent.id = "upgrade-content";
shopSection.appendChild(upgradeContent);

let money = 0;
let totalClicks = 0;
let totalNotes = 0;
let clickTimestamps = [];
const CPS_WINDOW_MS = 1000;
let isClicking = false;
let clickBonus = 1;
let clickCooldownTimeout = null;
let upgrade1Bonus = 0;
let upgrade2Bonus = 0;
let totalRate = 0;
let unlockedAchievements = 0;
let totalAchievements = achievements.length;

document.addEventListener(
  "click",
  () => {
    playBackgroundMusic();
  },
  { once: true }
);

function createWorkerElements() {
  workerContent.innerHTML = "";

  Object.values(workers).forEach((worker) => {
    const workerEl = document.createElement("div");
    workerEl.className = "shop-item stickynote worker-item no-select";

    const angle = Math.random() * 10 - 5;
    let transform = `rotate(${angle}deg)`;
    if (Math.random() < 0.02) transform += " rotate(180deg)";
    workerEl.style.transform = transform;

    workerEl.addEventListener("mouseenter", () => {
      workerEl.style.transform = "rotate(0deg)";
    });

    workerEl.addEventListener("mouseleave", () => {
      workerEl.style.transform = transform;
    });

    workerEl.style.margin = "10px";
    workerEl.style.background = getRandomStickyNoteColor();

    if (!worker.visible && money >= worker.cost * 0.9) {
      worker.visible = true;
    }
    const isUnlocked = worker.visible;

    if (!isUnlocked) {
      // Show only a big question mark
      workerEl.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
          <span style="font-size: 64px; color: grey;">?</span>
        </div>
      `;
    } else {
      // Show full worker details
      workerEl.innerHTML = `
        <button class="shop-item-button">${worker.name}</button>
        <p class="shop-item-description">${worker.description}</p>
        <p class="shop-item-owned">You own ${worker.owned}</p>
        <p class="shop-item-cost">Cost: ${worker.cost.toFixed(0)}</p>
        <p class="shop-item-produce">Produces: ${worker.produce}/s</p>
      `;
    }

    workerContent.appendChild(workerEl);

    // Enable purchase only if unlocked
    if (isUnlocked) {
      const button = workerEl;
      const ownedText = workerEl.querySelector(".shop-item-owned");
      const costText = workerEl.querySelector(".shop-item-cost");

      if (worker.listenerAttached) return;
      button.addEventListener("click", () => {
        if (money >= worker.cost) {
          playSoundEffects(soundEffects.orb);
          button.disabled = true; // disable immediately
          setTimeout(() => (button.disabled = false), 500); // re-enable after 200ms

          money -= worker.cost;
          worker.owned++;
          worker.cost *= 1.15;
          ownedText.textContent = `You own ${worker.owned}`;
          costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
          updateMoneyText();
          updateMoneyPerSecondText();
        } else {
          playSoundEffects(soundEffects.hover);
        }
      });
      worker.listenerAttached = true;
    }
  });
}

function createUpgradeElements() {
  upgradeContent.innerHTML = "";
  Object.values(upgrades).forEach((upgrade) => {
    const upgradeEl = document.createElement("div");
    upgradeEl.className = "shop-item stickynote no-select";

    const angle = Math.random() * 10 - 5;
    let transform = `rotate(${angle}deg)`;
    if (Math.random() < 0.05) transform += " rotate(180deg)";
    upgradeEl.style.transform = transform;

    upgradeEl.style.margin = "10px";
    upgradeEl.style.background = getRandomStickyNoteColor();

    if (upgrade.owned >= upgrade.max) {
      upgradeEl.style.filter = `brightness(0.7)`;
      upgradeEl.style.transition = `all 0.2s ease-in-out`;
    }

    function upgradeAmountText() {
      if (upgrade.key === "upgrade1") {
        return `extra ${(
          upgrades.upgrade1.owned *
          upgrades.upgrade1.value *
          100
        ).toFixed(0)}% of NPS`;
      } else if (upgrade.key === "upgrade2") {
        return `${(
          upgrades.upgrade2.value *
          upgrades.upgrade2.owned *
          100
        ).toFixed(1)}% of cps multiplied by NPS`;
      } else if (upgrade.key === "upgrade3") {
        return `You get ${upgrade.value ** upgrade.owned} per click`;
      } else if (upgrade.key === "upgrade4") {
        return `You get ${(upgrade.value * upgrade.owned * 100).toFixed(
          0
        )}% of notes earned offline`;
      } else if (upgrade.key === "upgrade5") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      }
    }

    upgradeEl.innerHTML = `
      <button class="shop-item-button">${upgrade.id}</button>
      <p class="shop-item-description">${upgrade.description}</p>
      <p class="shop-item-cost">Cost: ${upgrade.cost.toFixed(0)}</p>
      <p class="shop-item-text">${upgradeAmountText()}</p>
    `;

    upgradeContent.appendChild(upgradeEl);

    const button = upgradeEl;
    const text = upgradeEl.querySelector(".shop-item-text");
    const costText = upgradeEl.querySelector(".shop-item-cost");

    button.addEventListener("click", () => {
      if (money >= upgrade.cost) {
        if (upgrade.key === "upgrade4" && upgrade.owned >= upgrade.max) {
          alert("cannot go above 100%");
          return;
        } else if (upgrade.key === "upgrade5" && upgrade.owned >= upgrade.max) {
          alert("Cannot buy more than 1");
          return;
        }
        money -= upgrade.cost;
        playSoundEffects(soundEffects.orb);
        upgrade.owned++;
        upgrade.cost *= findUpgradeCost(upgrade.key);
        text.textContent = `${upgradeAmountText()}`;
        costText.textContent = `Cost: ${upgrade.cost.toFixed(0)}`;
        if (upgrade.owned >= upgrade.max) {
          button.style.filter = `brightness(0.7)`;
          button.style.transition = `all 0.2s ease-in-out`;
        }
        updateMoneyText();
      }
    });
  });
}

function findUpgradeCost(key) {
  if (key === "upgrade1") return 3;
  else if (key === "upgrade2") return 10;
  else if (key === "upgrade3") return 5;
  else if (key === "upgrade4") return 5;
  else if (key === "upgrade5") return 1;
}

workerTab.addEventListener("click", () => {
  let before = undefined;
  if (window.innerWidth <= 768) {
    before = toggleShopSection(workerTab, upgradeTab);
  }

  playSoundEffects(soundEffects.click2);
  workerTab.classList.add("active");
  upgradeTab.classList.remove("active");
  workerContent.classList.add("active");
  upgradeContent.classList.remove("active");

  if (window.innerWidth <= 768 && before) {
    workerTab.classList.remove("active");
  }
});

upgradeTab.addEventListener("click", () => {
  let before = undefined;
  if (window.innerWidth <= 768) {
    before = toggleShopSection(upgradeTab, workerTab);
  }

  playSoundEffects(soundEffects.click2);
  upgradeTab.classList.add("active");
  workerTab.classList.remove("active");
  upgradeContent.classList.add("active");
  workerContent.classList.remove("active");

  if (window.innerWidth <= 768 && before) {
    upgradeTab.classList.remove("active");
  }
});

function toggleShopSection(tab, othertab) {
  if (tab.classList.contains("active")) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return true;
  } else if (
    !(tab.classList.contains("active") || othertab.classList.contains("active"))
  ) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return false;
  } else if (
    !tab.classList.contains("active") &&
    othertab.classList.contains("active") &&
    !shopSection.classList.contains("open")
  ) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return false;
  }
}

function initGame() {
  if (localStorage.getItem("stickyNotesGame") != null) load();
  createWorkerElements();
  createUpgradeElements();
  updateMoneyText();
  updateMoneyPerSecondText();
  updateRateDisplays();
  updateAchievementStats();
  // achievements.forEach((ach) => {
  //   console.log(ach);
  //   if (ach.unlocked) addAchievementNote(ach.id);
  // });

  document.getElementById("delete-save").addEventListener("click", deleteSave);
}

mainButton.addEventListener("click", (event) => {
  event.stopPropagation();
  playSoundEffects(soundEffects.click1);

  if (upgrades.upgrade3.owned > 0)
    clickBonus = 1 * upgrades.upgrade3.value ** upgrades.upgrade3.owned;
  money += clickBonus;
  totalNotes += clickBonus;
  totalClicks++;
  clickTimestamps.push(Date.now());
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
  spawnFloatingNumber(x, y, clickBonus);

  if (!isClicking) {
    isClicking = true;
    const rateDisplays = document.getElementById("rate-displays");

    if (upgrades.upgrade1.owned > 0 || upgrades.upgrade2.owned > 0) {
      // Remove class in case it was already applied
      rateDisplays.classList.remove("visible");

      // Trigger reflow (forces browser to recognize the start state)
      void rateDisplays.offsetWidth;

      // Add class on next animation frame
      requestAnimationFrame(() => {
        rateDisplays.classList.add("visible");
      });
    }
  }

  if (clickCooldownTimeout) clearTimeout(clickCooldownTimeout);
  clickCooldownTimeout = setTimeout(() => {
    isClicking = false;
    document.getElementById("rate-displays").classList.remove("visible");
  }, 500);
});

// 👇 Utility Functions
function spawnFloatingNote(x, y) {
  const note = document.createElement("div");
  note.className = "floating-note";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  note.style.backgroundColor = getRandomStickyNoteColor();

  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1200);
}

function spawnFloatingNumber(x, y, amount) {
  const number = document.createElement("div");
  number.className = "floating-number";
  number.style.left = `${x}px`;
  number.style.top = `${y}px`;
  number.textContent = `+${amount}`;

  document.body.appendChild(number);
  setTimeout(() => number.remove(), 800);
}

function updateMoneyText() {
  moneyText.textContent = `You have ${money.toFixed(0)} sticky notes`;
}

function updateMoneyPerSecondText() {
  const NPS = calculateMoneyPerSecond();
  perSec.textContent = `${NPS.toFixed(0)} notes per second`;
}

function calculateMoneyPerSecond(initial) {
  let moneyPerSec = 0;
  const rateDisplays = document.getElementById("rate-displays");

  let workerIncome = 0;
  Object.values(workers).forEach((worker) => {
    workerIncome += worker.produce * worker.owned;
  });

  moneyPerSec += workerIncome;
  const initialMoneyPerSec = moneyPerSec;

  if (initial === "initial") return initialMoneyPerSec;

  upgrade1Bonus = 0;
  upgrade2Bonus = 0;

  if (
    isClicking &&
    (upgrades.upgrade1.owned > 0 || upgrades.upgrade2.owned > 0)
  ) {
    rateDisplays.style.display = "flex";

    if (upgrades.upgrade1.owned > 0) {
      upgrade1Bonus =
        initialMoneyPerSec *
        (upgrades.upgrade1.owned * upgrades.upgrade1.value);
      moneyPerSec += upgrade1Bonus;
    }

    if (upgrades.upgrade2.owned > 0) {
      const cps = calculateCPS();
      upgrade2Bonus =
        initialMoneyPerSec *
        (cps * upgrades.upgrade2.value * upgrades.upgrade2.owned);
      moneyPerSec += upgrade2Bonus;
    }
  } else {
    rateDisplays.style.display = "none";
  }

  totalRate = moneyPerSec - initialMoneyPerSec;
  if (upgrades.upgrade5.owned > 0) {
    moneyPerSec *= upgrades.upgrade5.value;
  }
  updateRateDisplays(moneyPerSec);

  return moneyPerSec;
}

function calculateCPS() {
  const now = Date.now();
  clickTimestamps = clickTimestamps.filter(
    (timestamp) => now - timestamp < CPS_WINDOW_MS
  );
  return clickTimestamps.length;
}

function updateRateDisplays(moneyPerSec) {
  const baseRateEl = document.getElementById("base-rate");
  const upgrade1RateEl = document.getElementById("upgrade1-rate");
  const upgrade2RateEl = document.getElementById("upgrade2-rate");
  const totalRateEl = document.getElementById("total-rate");

  const base = calculateMoneyPerSecond("initial");

  upgrade1RateEl.style.display = upgrades.upgrade1.owned > 0 ? "block" : "none";
  upgrade2RateEl.style.display = upgrades.upgrade2.owned > 0 ? "block" : "none";

  if (base === 0) {
    return;
  }

  baseRateEl.textContent = `Base NPS: +${base.toFixed(1)}`;
  upgrade1RateEl.textContent = `+${(upgrade1Bonus / base).toFixed(1)}x`;
  upgrade2RateEl.textContent = `+${(upgrade2Bonus / base).toFixed(1)}x`;
  totalRateEl.textContent = `Total bonus: ${(moneyPerSec / base).toFixed(1)}x`;
}

function updateWorkerDescriptions() {
  const workerItems = document.querySelectorAll(".worker-item");

  workerItems.forEach((workerEl, index) => {
    const worker = Object.values(workers)[index];
    // console.log(worker.cost);
    if (!worker.visible && money >= worker.cost * 0.9) {
      worker.visible = true;
    }
    const isUnlocked = worker.visible;

    if (isUnlocked) {
      // Reveal full content
      workerEl.innerHTML = `
        <button class="shop-item-button">${worker.name}</button>
        <p class="shop-item-description">${worker.description}</p>
        <p class="shop-item-owned">You own ${worker.owned}</p>
        <p class="shop-item-cost">Cost: ${worker.cost.toFixed(0)}</p>
        <p class="shop-item-produce">Produces: ${worker.produce}/s</p>
      `;

      // Reattach click handler
      const button = workerEl;
      const ownedText = workerEl.querySelector(".shop-item-owned");
      const costText = workerEl.querySelector(".shop-item-cost");

      if (worker.listenerAttached) return;

      button.addEventListener("click", () => {
        if (money >= worker.cost) {
          playSoundEffects(soundEffects.orb);
          button.disabled = true; // disable immediately
          setTimeout(() => (button.disabled = false), 500); // re-enable after 200ms

          money -= worker.cost;
          worker.owned++;
          worker.cost *= 1.15;
          ownedText.textContent = `You own ${worker.owned}`;
          costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
          updateMoneyText();
          updateMoneyPerSecondText();
        } else {
          playSoundEffects(soundEffects.hover);
        }
      });

      worker.listenerAttached = true; // ✅ Prevent duplicate listeners
    } else {
      // Locked state: show one big "?" and remove event listeners by clearing content
      workerEl.innerHTML = `<div class="locked-worker">?</div>`;
      const lock = workerEl.querySelector(".locked-worker");
      lock.style.fontSize = "3em";
      lock.style.textAlign = "center";
      lock.style.padding = "20px";
    }
  });
}

function save() {
  try {
    const gameState = {
      money,
      workers,
      upgrades,
      totalClicks,
      totalNotes,
      clickTimestamps,
      clickBonus,
      upgrade1Bonus,
      upgrade2Bonus,
      totalRate,
      achievements,
      unlockedAchievements,
    };
    localStorage.setItem("stickyNotesGame", JSON.stringify(gameState));
    localStorage.setItem("lastOnline", Date.now());
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function load() {
  const savedGame = localStorage.getItem("stickyNotesGame");
  if (savedGame) {
    const gameState = JSON.parse(savedGame);
    money = gameState.money || 0;

    if (gameState.workers) {
      Object.keys(defaultWorkers).forEach((key) => {
        if (gameState.workers[key]) {
          const owned = gameState.workers[key].owned || 0;
          const baseCost = defaultWorkers[key].cost;
          const newCost = Math.floor(baseCost * Math.pow(1.15, owned));

          workers[key] = {
            ...defaultWorkers[key],
            owned: owned,
            visible: gameState.workers[key].visible || false,
            cost: newCost,
            listenerAttached: false,
          };
        }
      });
    }

    if (gameState.upgrades) {
      Object.keys(defaultUpgrades).forEach((key) => {
        if (gameState.upgrades[key]) {
          upgrades[key] = {
            ...defaultUpgrades[key],
            owned: gameState.upgrades[key].owned,
            cost: gameState.upgrades[key].cost,
          };
        }
      });
    }

    if (gameState.achievements) {
      const savedAchievementsMap = Object.fromEntries(
        (gameState.achievements || []).map((a) => [a.id, a])
      );

      achievements = defaultAchievements.map((ach) => {
        const saved = savedAchievementsMap[ach.id];
        return {
          ...ach,
          unlocked: saved ? saved.unlocked : ach.unlocked,
        };
      });

      for (let i = 0; i < achievements.length; i++) {
        if (achievements[i].unlocked) {
          addAchievementNote(achievements[i]);
        }
      }
    }

    totalClicks = gameState.totalClicks || 0;
    totalNotes = gameState.totalNotes || 0;
    unlockedAchievements = gameState.unlockedAchievements || 0;
    clickTimestamps = gameState.clickTimestamps || [];
    clickBonus = gameState.clickBonus || 1;
    upgrade1Bonus = gameState.upgrade1Bonus || 0;
    upgrade2Bonus = gameState.upgrade2Bonus || 0;
    totalRate = gameState.totalRate || 0;

    if (upgrades.upgrade4.owned > 0) {
      const lastOnline = parseInt(
        localStorage.getItem("lastOnline") || Date.now()
      );
      const now = Date.now();
      const secondsOffline = Math.floor((now - lastOnline) / 1000);
      const moneyPerSecond = calculateMoneyPerSecond("initial");
      const offlineMultiplier =
        upgrades.upgrade4.owned * upgrades.upgrade4.value;
      const offlineEarnings =
        secondsOffline * moneyPerSecond * offlineMultiplier;
      money += offlineEarnings;
      alert(
        `You were away for ${secondsOffline} seconds and earned $${offlineEarnings.toFixed(
          0
        )}!`
      );
    }
  }
}

function update() {
  money += calculateMoneyPerSecond() / 10;
  totalNotes += calculateMoneyPerSecond() / 10;
  updateMoneyPerSecondText();
  updateMoneyText();
  updateWorkerDescriptions();

  checkForAchievements();

  save();
}

function updateCPS() {
  const cps = calculateCPS();
  cpsText.textContent = `${cps} cps`;
}

setInterval(update, 100);
setInterval(updateCPS, 100);
initGame();

function deleteSave() {
  if (
    confirm("Are you sure you want to delete your save? This cannot be undone!")
  ) {
    localStorage.removeItem("stickyNotesGame");
    money = 0;
    totalClicks = 0;
    totalNotes = 0;
    clickTimestamps = [];
    clickBonus = 1;
    upgrade1Bonus = 0;
    upgrade2Bonus = 0;
    totalRate = 0;
    unlockedAchievements = 0;
    workers = { ...defaultWorkers };
    upgrades = { ...defaultUpgrades };
    achievements = [...defaultAchievements];
    updateMoneyText();
    updateMoneyPerSecondText();
    createWorkerElements();
    createUpgradeElements();
    alert("Save data has been deleted. The game has been reset.");
  }
}

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
  // Get the parent section
  const gamesSection = document.getElementById("games-section");
  if (!gamesSection) return; // Safety check

  // Check if overlay already exists in this section
  let overlay = gamesSection.querySelector(".game-overlay");
  if (!overlay) {
    // Add dark overlay inside the games section
    overlay = document.createElement("div");
    overlay.classList.add("game-overlay");
    // Make overlay position absolute relative to gamesSection
    overlay.style.position = "absolute"; // Change from fixed
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    // z-index is now relative *within* gamesSection
    overlay.style.zIndex = "5"; // Keep lower than centered note
    gamesSection.appendChild(overlay); // Append here
  }
  overlay.style.display = "flex"; // Ensure it's visible

  // Center the selected game note
  note.classList.add("centered"); // This should have z-index: 1000 (or just higher than 5)

  // Load the game after the animation
  setTimeout(() => {
    loadGame(note, gameName);
  }, 500); // Wait for animation
}

function loadGame(note, gameName) {
  const gameContent = note.querySelector(".game-content");

  // Only load game if it's not already loaded
  if (gameContent.querySelector("iframe")) return;

  const gameIframe = document.createElement("iframe");
  gameIframe.src = getGameURL(gameName);
  gameIframe.style.width = "100%";
  gameIframe.style.height = "100%";
  gameIframe.style.border = "none";
  console.log(gameIframe);
  gameContent.appendChild(gameIframe);
}

function getGameURL(gameName) {
  // Assumes game files are inside a 'games' folder
  // relative to index.html
const gameString = JSON.stringify(gameName);
  switch (gameName) {
    case "game1":
      return "./games/snake.html"; // Path relative to index.html
    case "game2":
      return "./games/tictactoe.html";
    default:
      // Optional: handle unknown game names
      console.warn("Attempted to load unknown game:", gameName);
      // You could return a path to a placeholder/error page
      // return "games/unknown-game.html";
      return ""; // Or return an empty string
  }
}

function closeCenteredGame(e) {
  // Find the overlay *within* the games section
  const gamesSection = document.getElementById("games-section");
  const overlay = gamesSection
    ? gamesSection.querySelector(".game-overlay")
    : null;
  // Find the centered note (could be anywhere if moved, but likely still in gamesSection)
  const centeredNote = document.querySelector(".game-note.centered");

  // Close if clicking the overlay specifically OR if clicking outside the centered note
  // when both exist
  if (overlay && centeredNote) {
    // If the click target is the overlay OR the click target is NOT the centered note
    // AND is not a descendant of the centered note
    if (e.target === overlay || !centeredNote.contains(e.target)) {
      overlay.style.display = "none"; // Hide overlay instead of removing maybe? Or remove.
      // overlay.remove(); // Or remove it completely

      centeredNote.classList.remove("centered");
      const gameContent = centeredNote.querySelector(".game-content");
      // Clear the iframe or content if needed
      const iframe = gameContent.querySelector("iframe");
      if (iframe) iframe.remove();
      // Add back the placeholder text if desired
      // gameContent.innerHTML = `<p>${centeredNote.getAttribute('data-game')}</p>`;
    }
  }
}

////////////////////
////AUDIO LOGIC////
//////////////////

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
});

///////////////////////////
////SMALL SCREEN LOGIC////
/////////////////////////

document.addEventListener("dblclick", function (e) {
  e;
  e.preventDefault();
});

function moveShopSectionIfMobile() {
  const shopSection = document.querySelector(".shop-section");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (
    isMobile &&
    shopSection &&
    shopSection.parentElement.id === "main-section"
  ) {
    document.body.insertBefore(
      shopSection,
      document.getElementById("main-container")
    );
  }
}

// Run on load
moveShopSectionIfMobile();

// Also run again if user resizes window across breakpoint
window.addEventListener("resize", () => {
  moveShopSectionIfMobile();
});

if (window.innerWidth <= 768) {
  workerTab.classList.remove("active");
}

///////////////////////////
////ACHIEVEMENTS LOGIC////
/////////////////////////

function checkForAchievements() {
  if (totalNotes >= 1) {
    unlockAchievement("firstNote");
  }
  if (totalNotes >= 100) {
    unlockAchievement("hundredNotes");
  }
  if (Object.values(workers).some((worker) => worker.owned > 0)) {
    unlockAchievement("firstWorker");
  }
  if (Object.values(upgrades).some((upgrade) => upgrade.owned > 0)) {
    unlockAchievement("firstUpgrade");
  }
  if (mainContainer.style.transform === "translate(0px, -100vh)") {
    unlockAchievement("settings");
  }
  if (
    Object.values(workers).some(
      (worker) => worker.owned > 0 && worker.id === "worker5"
    )
  ) {
    unlockAchievement("crime");
  }
}

function unlockAchievement(id) {
  const achievement = achievements.find((a) => a.id === id);

  if (achievement && !achievement.unlocked) {
    unlockedAchievements++;
    achievement.unlocked = true;
    showAchievementNotification(achievement);
    addAchievementNote(achievement);
    updateAchievementStats();
  }
}

function showAchievementNotification(achievement) {
  const container = document.getElementById("achievement-popup-container");
  const popup = document.createElement("div");
  popup.className = "achievement-popup slide-in";
  popup.innerHTML = `
    <strong>${achievement.name}</strong><br>
    <small>${achievement.description}</small>
  `;

  // Inline base styles
  popup.style.cssText = `
  background: #feff9c; color: white; padding: 12px 20px;
  margin-top: 10px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  text-align: center; min-width: 200px;
  position: relative;
  animation: slideIn 0.4s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
  font-family: "Sniglet", sans-serif;
`;

  container.appendChild(popup);

  // Remove from DOM after animation
  setTimeout(() => {
    container.removeChild(popup);
  }, 3000);
}

function addAchievementNote(achievement) {
  const achievementSection = document.getElementById("achievements-section");
  const achievementNote = document.createElement("div");
  achievementNote.className = "stickynote achievements-note";
  achievementNote.innerHTML = `<strong>${achievement.name}</strong><br><small>${achievement.description}</small>`;
  achievementNote.dataset.position = achievement.position;

  // Find existing notes
  const existingNotes = Array.from(
    achievementSection.getElementsByClassName("achievements-note")
  );

  // Find correct place to insert
  let inserted = false;
  for (let i = 0; i < existingNotes.length; i++) {
    const notePosition = parseInt(existingNotes[i].dataset.position, 10);
    if (achievement.position < notePosition) {
      achievementSection.insertBefore(achievementNote, existingNotes[i]);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    achievementSection.appendChild(achievementNote);
  }
}

function updateAchievementStats() {
  const achievementNumber = document.getElementById("achievements-number");

  achievementNumber.textContent = `${unlockedAchievements} / ${totalAchievements}`;
}



////////////////////////
////ADMIN FUNCTIONS////
//////////////////////

// Expose a secret function globally
window.unlockSecret = function(code) {
  if (code === "money123") {
    console.log("%cYou unlocked 9999999999999 notes!", "color: gold; font-size: 16px;");
    money = 9999999999999
  } else if (code === "achievements") {
    achievements.forEach((ach) => {
      unlockAchievement(ach.id);
    })
  }else {
    console.log("Invalid code.");
  }
};
