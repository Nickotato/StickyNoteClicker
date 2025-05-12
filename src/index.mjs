document.addEventListener('DOMContentLoaded', () => {
  // Check if the user has already acknowledged the beta status
  const hasSeenBetaAlert = localStorage.getItem('hasSeenBetaAlert');

  if (!hasSeenBetaAlert) {
    alert('🚧 This website is currently in beta. Features may change or break unexpectedly.');
    localStorage.setItem('hasSeenBetaAlert', 'true');
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
import {readableNumber, getTotalCost, getCardSrc} from "./utils.mjs"

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

const bulkBuySection = document.createElement("div");
bulkBuySection.className="bulkBuySection";
const [bulk1, bulk10, bulk100] = ["div", "div", "div"].map(tag => document.createElement(tag));

bulk1.className = "shop-tab bulkBuyButton active";
bulk10.className = "shop-tab bulkBuyButton";
bulk100.className = "shop-tab bulkBuyButton";
bulk1.textContent = "1";
bulk10.textContent = "10";
bulk100.textContent = "100";
[bulk1, bulk10, bulk100].forEach(el => bulkBuySection.appendChild(el));
shopSection.appendChild(bulkBuySection);




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

let planeMultiplier = 0;
let isReadableNumbersOn = false;
let buyAmount = 1;

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
        <p class="shop-item-cost">Cost: ${getTotalCost(worker.cost, 1.15, buyAmount).toFixed(0)}</p>
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
        const totalCost = getTotalCost(worker.cost, 1.15, buyAmount);
      
        if (money >= totalCost) {
          playSoundEffects(soundEffects.orb);
          button.disabled = true;
          setTimeout(() => (button.disabled = false), 500);
      
          money -= totalCost;
          worker.owned += buyAmount;
          worker.cost *= Math.pow(1.15, buyAmount); // Apply exponential cost growth
      
          ownedText.textContent = `You own ${worker.owned}`;
          costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
          updateMoneyText();
          updateMoneyPerSecondText();
        } else {
          playSoundEffects(soundEffects.hover);
        }
      });;
      worker.listenerAttached = true;
    }
  });
}

function createUpgradeElements() {
  upgradeContent.innerHTML = "";
  Object.values(upgrades).forEach((upgrade) => {
    const upgradeEl = document.createElement("div");
    upgradeEl.className = `shop-item stickynote no-select upgrades-note ${upgrade}`;

    const angle = Math.random() * 10 - 5;
    let transform = `rotate(${angle}deg)`;
    if (Math.random() < 0.05) transform += " rotate(180deg)";
    upgradeEl.style.transform = transform;

    upgradeEl.style.margin = "10px";
    upgradeEl.style.background = getRandomStickyNoteColor();

    if (upgrade.owned + buyAmount > upgrade.max) {
      upgradeEl.style.filter = `brightness(0.7)`;
      upgradeEl.style.transition = `all 0.2s ease-in-out`;
    }

    upgradeEl.addEventListener("mouseenter", () => {
      upgradeEl.style.transform = "rotate(0deg)";
    });

    upgradeEl.addEventListener("mouseleave", () => {
      upgradeEl.style.transform = transform;
    });


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
      } else if (upgrade.key === "upgrade6") {
        return upgrade.owned === 1 ? `You have access` : `Access Denied`;
      }  else if (upgrade.key === "upgrade7") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      }
    }

    upgradeEl.innerHTML = `
      <button class="shop-item-button">${upgrade.id}</button>
      <p class="shop-item-description">${upgrade.description}</p>
      <p class="shop-item-cost">Cost: ${isReadableNumbersOn ? readableNumber(upgrade.cost) : upgrade.cost.toFixed(0)}</p>
      <p class="shop-item-text">${upgradeAmountText()}</p>
    `;

    upgradeContent.appendChild(upgradeEl);

    const button = upgradeEl;
    const text = upgradeEl.querySelector(".shop-item-text");
    const costText = upgradeEl.querySelector(".shop-item-cost");

    button.addEventListener("click", () => {
      const totalCost = getTotalCost(upgrade.cost, findUpgradeCost(upgrade.key), buyAmount);

      
      if (money >= totalCost && upgrade.owned + buyAmount <= upgrade.max) {
        if (upgrade.key === "upgrade4" && upgrade.owned >= upgrade.max) {
          alert("cannot go above 100%");
          return;
        } else if (upgrade.key === "upgrade5" && upgrade.owned >= upgrade.max) {
          alert("Cannot buy more than 1");
          return;
        }

        money -= totalCost;
        playSoundEffects(soundEffects.orb);

        upgrade.owned += buyAmount;
        upgrade.cost *= Math.pow(findUpgradeCost(upgrade.key), buyAmount);

        text.textContent = `${upgradeAmountText()}`;
        costText.textContent = `Cost: ${isReadableNumbersOn ? readableNumber(upgrade.cost) : upgrade.cost.toFixed(0)} (${buyAmount}x)`;

        if (upgrade.owned + buyAmount > upgrade.max) {
          button.style.filter = `brightness(0.7)`;
          button.style.transition = `all 0.2s ease-in-out`;
        }

        updateMoneyText();
      } else {
        playSoundEffects(soundEffects.hover);
      }
    });
  });
}


function findUpgradeCost(key) {
  if (key === "upgrade1") return 3;
  else if (key === "upgrade2") return 10;
  else if (key === "upgrade3") return 2.5;
  else if (key === "upgrade4") return 5;
  else if (key === "upgrade5") return 1;
  else if (key === "upgrade6") return 1;
  else if (key === "upgrade7") return 1;
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

bulkBuySection.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("bulkBuyButton")) {
    buyAmount = parseInt(target.textContent);

    // Remove 'active' from all buttons, then add to clicked one
    const allButtons = bulkBuySection.querySelectorAll(".bulkBuyButton");
    allButtons.forEach(btn => btn.classList.remove("active"));
    target.classList.add("active");
  }
});

function initGame() {
  if (localStorage.getItem("stickyNotesGame") != null) load();
  createWorkerElements();
  createUpgradeElements();
  updateMoneyText();
  updateMoneyPerSecondText();
  updateRateDisplays();
  updateAchievementStats();

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
      // Start hidden and off-screen
      rateDisplays.style.opacity = '0';
  
  
      rateDisplays.style.opacity = '1';
      // Slide in
      setTimeout(() => {
        rateDisplays.style.left = '20px'; // animate to visible position
      }, 100);
    }
  }
  
  if (clickCooldownTimeout) clearTimeout(clickCooldownTimeout);
  clickCooldownTimeout = setTimeout(() => {
    isClicking = false;
    const rateDisplays = document.getElementById("rate-displays");
  
    // Slide back out
    rateDisplays.style.opacity = '0';
    rateDisplays.style.left = '-300px';
  }, 500);
  ;
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
  if (isReadableNumbersOn) moneyText.textContent = `You have ${readableNumber(money)} sticky notes`;
   else moneyText.textContent = `You have ${money.toFixed(0)} sticky notes`;
}

function updateMoneyPerSecondText() {
  const NPS = calculateMoneyPerSecond();
  if (isReadableNumbersOn) perSec.textContent = `${readableNumber(NPS)} notes per second`;
  else perSec.textContent = `${NPS.toFixed(0)} notes per second`;
}

function calculateMoneyPerSecond(initial) {
  let moneyPerSec = 0;
  const rateDisplays = document.getElementById("rate-displays");

  let workerIncome = 0;
  Object.values(workers).forEach((worker) => {
    let baseIncome = worker.produce * worker.owned;
  
    // Upgrade 7: Bonus every 5 owned
    if (upgrades.upgrade7.owned > 0 && worker.owned >= 5) {
      const multiplesOfFive = Math.floor(worker.owned / 5);
      const bonusUnits = multiplesOfFive * 5;
      const normalUnits = worker.owned - bonusUnits;
    
      const bonusIncome = bonusUnits * worker.produce * (1 + upgrades.upgrade7.value);
      const normalIncome = normalUnits * worker.produce;
    
      baseIncome = bonusIncome + normalIncome;
    } else {
      baseIncome = worker.owned * worker.produce;
    }
    
  
    workerIncome += baseIncome;
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
  if ( planeMultiplier > 0 ) {
    moneyPerSec += planeMultiplier * initialMoneyPerSec;
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
        <p class="shop-item-cost">Cost: ${isReadableNumbersOn ? (readableNumber(getTotalCost(worker.cost, 1.15, buyAmount))) : getTotalCost(worker.cost, 1.15, buyAmount).toFixed(0)}</p>
        <p class="shop-item-produce">Produces: ${isReadableNumbersOn ? (readableNumber(worker.produce)) : worker.produce.toFixed(0)}/s</p>
      `;

      if (money < getTotalCost(worker.cost, 1.15, buyAmount)) {
        workerEl.style.filter = "brightness(0.5)";
      } else workerEl.style.filter = "";

      // Reattach click handler
      const button = workerEl;
      const ownedText = workerEl.querySelector(".shop-item-owned");
      const costText = workerEl.querySelector(".shop-item-cost");

      if (worker.listenerAttached) return;

      button.addEventListener("click", () => {
        const totalCost = getTotalCost(worker.cost, 1.15, buyAmount);
      
        if (money >= totalCost) {
          playSoundEffects(soundEffects.orb);
          button.disabled = true;
          setTimeout(() => (button.disabled = false), 500);
      
          money -= totalCost;
          worker.owned += buyAmount;
          worker.cost *= Math.pow(1.15, buyAmount); // Apply exponential cost growth
      
          ownedText.textContent = `You own ${worker.owned.toFixed(0)}`;
          costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
          updateMoneyText();
          updateMoneyPerSecondText();
        } else {
          playSoundEffects(soundEffects.hover);
        }
      });;

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

function updateUpgradesDescription() {
  const upgradeItems = document.querySelectorAll(".upgrades-note");
  upgradeItems.forEach((upgradeEl, index) => {
    const upgrade = Object.values(upgrades)[index];

    if (money < getTotalCost(upgrade.cost, findUpgradeCost(upgrade.key), buyAmount) || upgrade.owned + buyAmount > upgrade.max) {
      upgradeEl.style.filter = "brightness(0.5)";
    } else upgradeEl.style.filter = "";

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
      } else if (upgrade.key === "upgrade6") {
        return upgrade.owned === 1 ? `You have access` : `Access Denied`;
      }  else if (upgrade.key === "upgrade7") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      }
    }

    upgradeEl.innerHTML = `
      <button class="shop-item-button">${upgrade.id}</button>
      <p class="shop-item-description">${upgrade.description}</p>
      <p class="shop-item-cost">Cost: ${isReadableNumbersOn ? readableNumber(getTotalCost(upgrade.cost, findUpgradeCost(upgrade.key), buyAmount)) : getTotalCost(upgrade.cost, findUpgradeCost(upgrade.key), buyAmount).toFixed(0)}</p>
      <p class="shop-item-text">${upgradeAmountText()}</p>
    `;
  }
  )
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
      isReadableNumbersOn,
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
          const owned = gameState.upgrades[key].owned || 0;
          const baseCost = defaultUpgrades[key].cost;
          const newCost = Math.floor(
            baseCost * Math.pow(findUpgradeCost(key), owned)
          );

          upgrades[key] = {
            ...defaultUpgrades[key],
            owned: owned,
            cost: newCost,
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
    isReadableNumbersOn = gameState.isReadableNumbersOn || false;

    if (upgrades.upgrade4.owned > 0) {
      const lastOnline = parseInt(
        localStorage.getItem("lastOnline") || Date.now()
      );
      const now = Date.now();
      const secondsOffline = Math.floor((now - lastOnline) / 1000);
      if (secondsOffline <= 60) return;
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
  updateUpgradesDescription();

  checkForAchievements();
  updateCasinoMoneyDisplay();

  if (upgrades.upgrade6.owned > 0) {
    const casinoButton = document.getElementById("casino-screen-note");
  
    if (casinoButton && casinoButton.style.display === "none") {
      casinoButton.style.display = "block"; // or "inline-block", depending on your layout
    }
  }

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
window.unlockSecret = function (code) {
  if (code === "money123") {
    console.log(
      "%cYou unlocked 999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 notes!",
      "color: gold; font-size: 16px;"
    );
    money = 999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
  } else if (code === "achievements") {
    achievements.forEach((ach) => {
      unlockAchievement(ach.id);
    });
  } else if (code === "resetBigness") {
    upgrades.upgrade3.owned = 0;
  } else if (code === "spawnPlane") {
    spawnAirplane();
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

let multiplierEndTime = 0;  // The time when the multiplier will end
let countdownInterval = null; // Timer for the countdown
let countdownDisplay = null; // Element for the countdown timer
let paper = null; // The paper element to hold the timer

function createCountdownExtraStyles() {
  // Check if elements already exist to avoid creating them multiple times
  if (countdownDisplay && !paper) {
    // Creating a clip at the top of the clipboard
    let clip = document.createElement('div');
    clip.style.position = 'absolute';
    clip.style.top = '-10px';
    clip.style.left = '50%';
    clip.style.transform = 'translateX(-50%)';
    clip.style.width = '60px';
    clip.style.height = '15px';
    clip.style.backgroundColor = '#999';
    clip.style.borderRadius = '8px';
    clip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    clip.style.zIndex = '1041';

    paper = document.createElement('div');
    paper.classList.add = "clipboard-paper";
    paper.style.position = 'absolute';
    paper.style.top = '0px';
    paper.style.left = '50%';
    paper.style.transform = 'translateX(-50%)';
    paper.style.width = 'calc(100% - 10px)';
    paper.style.height = 'calc(100% - 10px)';
    paper.style.backgroundColor = '#fff';
    paper.style.borderRadius = '8px';
    paper.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.1)';
    paper.style.backgroundImage = 'linear-gradient(to bottom, #fff, #f9f9f9)';
    paper.style.zIndex = '1010';
    paper.style.position = 'relative';
    paper.style.overflow = 'hidden';
    paper.style.display = 'flex';
    paper.style.flexDirection = 'column';
    paper.style.justifyContent = 'center';
    paper.style.alignItems = 'center';

    // Add the elements to the countdown display once
    countdownDisplay.appendChild(clip);
    countdownDisplay.appendChild(paper);
  }
}

function createCountdownDisplay() {
  // Create the countdown display if it doesn't exist
  if (!countdownDisplay) {
    countdownDisplay = document.createElement('div');
    countdownDisplay.classList.add('countdown-display');
    countdownDisplay.style.position = 'fixed';
    countdownDisplay.style.top = '50%';
    countdownDisplay.style.left = '-300px';
    countdownDisplay.style.transform = 'translateY(-50%)';
    countdownDisplay.style.width = '130px'; 
    countdownDisplay.style.height = '180px';
    countdownDisplay.style.backgroundColor = '#deb887';
    countdownDisplay.style.border = '2px solid #8B4513';
    countdownDisplay.style.borderRadius = '10px';
    countdownDisplay.style.boxShadow = '5px 5px 15px rgba(0, 0, 0, 0.1)';
    countdownDisplay.style.zIndex = '1000';
    countdownDisplay.style.transition = 'left 0.5s ease-in-out';
    // Adding the countdown display to the page
    document.body.appendChild(countdownDisplay);

    // Trigger the slide-in effect after appending to the body
    setTimeout(() => {
      countdownDisplay.style.left = '20px'; // Move to visible position
    }, 10);

    // Create the extra styles only once
    createCountdownExtraStyles();
  }
}

// Function to update the countdown display
function updateCountdownDisplay(timeLeft) {
  if (countdownDisplay) {
    // Update the countdown text inside the clipboard, only change the timer text
    const timerElement = document.createElement('div');
    timerElement.style.textAlign = 'center';
    timerElement.style.fontWeight = 'bold';
    timerElement.style.fontSize = '24px';
    timerElement.style.padding = '10px 0';
    timerElement.textContent = `${Math.floor(timeLeft / 1000)}`;
    timerElement.style.zIndex = '1030'; // Ensure the countdown text appears on top
    
    // Clear previous timer and append the new one to the paper element
    paper.innerHTML = ''; // Clear any previous timer element
    paper.appendChild(timerElement);
  }
}

function startMultiplierCountdown() {
  createCountdownDisplay();  // Ensure countdown display exists
  
  if (countdownInterval) clearInterval(countdownInterval);  // Clear any existing countdown

  // Start a new countdown
  countdownInterval = setInterval(() => {
    const timeLeft = Math.max(0, multiplierEndTime - Date.now());  // Calculate time left

    updateCountdownDisplay(timeLeft);  // Update the display with the remaining time

    if (timeLeft <= 0) {
      planeMultiplier = 0;  // Reset the multiplier if time is up
      clearInterval(countdownInterval);
      countdownInterval = null;
      paper.innerHTML = 'Multiplier ended!';
      setTimeout(() => countdownDisplay.remove(), 2000);  // Remove the countdown display after 2 seconds
    }
  }, 1000);  // Check every second
}

function spawnAirplane() {
  const airplane = document.createElement('div');
  airplane.classList.add('airplane');

  // Random vertical position (avoid too low or high)
  const top = Math.random() * 60 + 10;
  airplane.style.top = `${top}vh`;

  document.body.appendChild(airplane);

  // Click to pop
  airplane.addEventListener('click', () => {
    // Get position on screen
    const rect = airplane.getBoundingClientRect();
  
    // Convert to transform-friendly values
    const x = rect.left;
    const y = rect.top;
  
    // Set transform to exact screen position
    airplane.style.position = 'fixed'; // prevent scroll issues
    airplane.style.top = '0';
    airplane.style.left = '0';
    airplane.style.transform = `translate(${x}px, ${y}px)`;
  
    // Remove animations
    airplane.style.animation = 'none';
  
    // Now run the pop effect
    airplane.classList.add('pop');
  
    // Activate the multiplier and set the multiplier end time
    planeMultiplier = 20;
    multiplierEndTime = Date.now() + 60000; // 1 minute multiplier
    startMultiplierCountdown(); // Start the countdown
  
    setTimeout(() => airplane.remove(), 300);
  });
  
  // Remove after flying across
  setTimeout(() => {
    if (document.body.contains(airplane)) {
      airplane.remove();
    }
  }, 10000); // match animation duration
}

function startSpawning() {
  setInterval(() => {
    // Spawn new airplanes at random intervals between 60,000ms (1 minute) and 90,000ms (1.5 minutes)
    const randomInterval = Math.random() * 30000 + 60000; // between 60s and 90s
    if (Math.random() < 0.7) {
      console.log("Spawned Paper Airplane");
      spawnAirplane();
    }
  }, 60000); // Spawn a new airplane every minute, but interval is random
}

startSpawning();

// This function will be used to reset the timer and add 60 seconds when a new plane is hit
function addTimeToMultiplier() {
  if (planeMultiplier > 0) {
    multiplierEndTime += 60000; // Add 60 seconds to the countdown
  }
}

///////////////////////////////
////SETTINGS FUNCTIONALITY////
/////////////////////////////

const readableNumbersToggle = document.getElementById("readable-numbers-toggle");
const readableNumbersNote = document.getElementById("readable-numbers-note");


// Handle "Readable Numbers" toggle independently from audio settings
readableNumbersNote.addEventListener("click", () => {
  isReadableNumbersOn = !isReadableNumbersOn;
  readableNumbersToggle.textContent = isReadableNumbersOn ? "On" : "Off";

  // Toggle pin color based on the state
  readableNumbersNote.classList.toggle("green", isReadableNumbersOn);
});

/////////////////////
////CASINO LOGIC////
///////////////////

const playButton = document.getElementById('play-game');
const gameSelect = document.getElementById('game-select');
const betAmountInput = document.getElementById('bet-amount');
const gameResultDiv = document.getElementById('game-result');
const gameSection = document.getElementById('casino-game-section');
const moneyDisplay = document.getElementById('current-money-display');

let currentGame = {
  playerCards: [],
  dealerCards: [],
  bet: 0
};

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

function updateCasinoMoneyDisplay() {
  moneyDisplay.textContent = `Current Notes: ${isReadableNumbersOn ? readableNumber(money) : money.toFixed(0)}`;
}

function drawCard() {
  const value = Math.floor(Math.random() * 10) + 2;
  const cardValue = (value === 10 && Math.random() < 0.25) ? 11 : value;
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return { value: cardValue, suit };
}

function renderCards(cards) {
  return cards.map(card => {
    let displayValue = card.value === 11 ? 'ace' : card.value;
    const imageName = `${displayValue}_of_${card.suit}`;
    return `<img src="${getCardSrc(imageName)}" class="card" width="80" />`;
  }).join('');
}

function calculateTotal(cards) {
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter(card => card.value === 11).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderBlackjackGame(end = false, message = '') {
  const { playerCards, dealerCards, bet } = currentGame;
  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);

  let controls = '';
  if (!end) {
    controls = `
      <button id="hit-button">Hit</button>
      <button id="stand-button">Stand</button>
    `;
  }

  gameSection.innerHTML = `
    <h2>Blackjack</h2>
    <div class="blackjack-hand">
      <h3>Your Hand (${playerTotal}):</h3>
      <div class="cards">${renderCards(playerCards)}</div>
    </div>
    <div class="blackjack-hand">
      <h3>Dealer's Hand (${end ? dealerTotal : '?'}):</h3>
      <div class="cards">
        ${end ? renderCards(dealerCards) : `
          <img src=${require('url:./images/casino/blackjack/back.png')} class="card" width="80" />
          <img src=${require('url:./images/casino/blackjack/back.png')} class="card back" width="80" />
        `}
      </div>
    </div>
    <p>${message}</p>
    ${controls}
    ${end ? `<p>New Balance: $${isReadableNumbersOn ? readableNumber(money) : money.toFixed(0)}</p><button id="return-button">Return</button>` : ''}
  `;

  if (!end) {
    document.getElementById('hit-button').addEventListener('click', playerHits);
    document.getElementById('stand-button').addEventListener('click', playerStands);
  } else {
    document.getElementById('return-button').addEventListener('click', () => {
      mainContainer.style.transform = 'translate(100%, 0)';
    });
  }
}

function playerHits() {
  currentGame.playerCards.push(drawCard());
  const total = calculateTotal(currentGame.playerCards);
  if (total > 21) {
    money -= currentGame.bet;
    updateCasinoMoneyDisplay();
    renderBlackjackGame(true, 'You busted!');
  } else {
    renderBlackjackGame();
  }
}

function playerStands() {
  while (calculateTotal(currentGame.dealerCards) < 17) {
    currentGame.dealerCards.push(drawCard());
  }

  const playerTotal = calculateTotal(currentGame.playerCards);
  const dealerTotal = calculateTotal(currentGame.dealerCards);

  let resultText = '';
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    money += currentGame.bet;
    resultText = 'You win!';
  } else if (playerTotal < dealerTotal) {
    money -= currentGame.bet;
    resultText = 'Dealer wins!';
  } else {
    resultText = 'Push!';
  }

  updateCasinoMoneyDisplay();
  renderBlackjackGame(true, resultText);
}

playButton.addEventListener('click', () => {
  const bet = parseInt(betAmountInput.value);
  const selectedGame = gameSelect.value;

  if (bet <= 0 || bet > money) {
    gameResultDiv.textContent = "Invalid bet.";
    return;
  }

  gameResultDiv.textContent = '';

  // Reset the game section's theme class
  gameSection.classList.remove('blackjack-theme', 'roulette-theme', 'slots-theme', 'ride-the-bus-theme');
  
  // Add the corresponding class based on the selected game
  if (selectedGame === 'blackjack') {
    gameSection.classList.add('blackjack-theme');
  } else if (selectedGame === 'roulette') {
    gameSection.classList.add('roulette-theme');
  } else if (selectedGame === 'slots') {
    gameSection.classList.add('slots-theme');
  } else if (selectedGame === 'ride-the-bus') {
    gameSection.classList.add('ride-the-bus-theme');
  }

  mainContainer.style.transition = 'transform 1s ease-in-out';
  mainContainer.style.transform = 'translate(100%, 100vh)';

  if (selectedGame === 'blackjack') {
    currentGame = {
      playerCards: [drawCard(), drawCard()],
      dealerCards: [drawCard()],
      bet
    };
    renderBlackjackGame();
  } else {
    const result = Math.random() < 0.5 ? 'win' : 'lose';
    money = result === 'win' ? money + bet : money - bet;
    updateCasinoMoneyDisplay();

    gameSection.innerHTML = `
      <h2>${selectedGame.replace(/-/g, ' ')}</h2>
      <p>You placed a ${isReadableNumbersOn ? readableNumber(bet) : bet.toFixed(0)} note bet. You ${result}!</p>
      <p>New Balance: ${isReadableNumbersOn ? readableNumber(money) : money.toFixed(0)} notes</p>
      <button id="return-button">Return to Game Selection</button>
    `;

    setTimeout(() => {
      document.getElementById('return-button').addEventListener('click', () => {
        mainContainer.style.transform = 'translate(100%, 0)';
      });

      if (result === 'lose') {
        setTimeout(() => {
          mainContainer.style.transform = 'translate(100%, 0)';
        }, 2000);
      }
    }, 100);
  }
});


// Initialize display
updateCasinoMoneyDisplay();
