import "./styles.css";
import { workers } from "./workers.mjs";
import { upgrades } from "./upgrades.mjs";

// Screen navigation
const screenChangeButtons = document.querySelectorAll(".move-screen-buttons");
const mainContainer = document.getElementById("main-container");
const stickynotes = document.querySelectorAll(".stickynote");

screenChangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const string = button.textContent;
    const noSpacesString = string.trim();

    if (noSpacesString === "Games") {
      mainContainer.style.transform = `translate(-100%, 0)`;
    } else if (noSpacesString === "Settings") {
      mainContainer.style.transform = `translate(0, -100vh)`;
    } else if (noSpacesString === "Note") {
      mainContainer.style.transform = `translate(0, 0)`;
    }
  });
});

stickynotes.forEach((note) => {
  note.addEventListener("click", () => {
    if (note.classList.contains("drop-note")) {
      note.classList.add("used");
      setTimeout(() => {
        note.classList.remove("used");
      }, 500);
    }
  });
});

// Game logic
const mainButton = document.getElementById("main-stickynote");
const moneyText = document.getElementById("notes-amount");
const perSec = document.getElementById("per-sec");
const cpsText = document.getElementById("cps");
const shopSection = document.querySelector(".shop-section");

// Create tabs
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

// Create content sections
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
let clickTimestamps = [];
const CPS_WINDOW_MS = 1000;
let isClicking = false;
let clickBonus = 1;
let clickCooldownTimeout = null;
let upgrade1Bonus = 0;
let upgrade2Bonus = 0;
let totalRate = 0;

// Create worker elements dynamically
function createWorkerElements() {
  workerContent.innerHTML = "";
  Object.values(workers).forEach((worker) => {
    const workerEl = document.createElement("div");
    workerEl.className = "shop-item stickynote ";
    workerEl.style.rotate = `${Math.random() * 10 - 5}deg`;
    workerEl.style.margin = "10px";

    workerEl.innerHTML = `
      <button class="shop-item-button">${worker.name}</button>
      <p class="shop-item-text">${worker.description}</p>
      <p class="shop-item-text">You own ${worker.owned}</p>
      <p class="shop-item-cost">Cost: ${worker.cost.toFixed(0)}</p>
      <p class="shop-item-produce">Produces: ${worker.produce}/s</p>
    `;

    workerContent.appendChild(workerEl);

    const button = workerEl;
    const text = workerEl.querySelector(".shop-item-text");
    const costText = workerEl.querySelector(".shop-item-cost");

    button.addEventListener("click", () => {
      if (money >= worker.cost) {
        money -= worker.cost;
        worker.owned++;
        worker.cost *= 1.15;
        text.textContent = `You own ${worker.owned}`;
        costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
        updateMoneyText();
        updateMoneyPerSecondText();
      }
    });
  });
}

// Create upgrade elements dynamically
function createUpgradeElements() {
  upgradeContent.innerHTML = "";
  Object.values(upgrades).forEach((upgrade) => {
    const upgradeEl = document.createElement("div");
    upgradeEl.className = "shop-item stickynote";
    upgradeEl.style.rotate = `${Math.random() * 10 - 5}deg`;
    upgradeEl.style.margin = "10px";

    upgradeEl.innerHTML = `
      <button class="shop-item-button">${upgrade.id}</button>
      <p class="shop-item-description">${upgrade.description}</p>
      <p class="shop-item-cost">Cost: ${upgrade.cost.toFixed(0)}</p>
      <p class="shop-item-text">Owned: ${upgrade.owned}</p>
    `;

    upgradeContent.appendChild(upgradeEl);

    const button = upgradeEl.querySelector(".shop-item-button");
    const text = upgradeEl.querySelector(".shop-item-text");
    const costText = upgradeEl.querySelector(".shop-item-cost");

    button.addEventListener("click", () => {
      if (money >= upgrade.cost) {
        money -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost =
          upgrade.id === "upgrade1" ? upgrade.cost * 3 : upgrade.cost * 10;
        text.textContent = `Owned: ${upgrade.owned}`;
        costText.textContent = `Cost: ${upgrade.cost.toFixed(0)}`;
        updateMoneyText();
      }
    });
  });
}

// Tab switching
workerTab.addEventListener("click", () => {
  workerTab.classList.add("active");
  upgradeTab.classList.remove("active");
  workerContent.classList.add("active");
  upgradeContent.classList.remove("active");
});

upgradeTab.addEventListener("click", () => {
  upgradeTab.classList.add("active");
  workerTab.classList.remove("active");
  upgradeContent.classList.add("active");
  workerContent.classList.remove("active");
});

// Initialize the game
function initGame() {
  createWorkerElements();
  createUpgradeElements();
  updateMoneyText();
  updateMoneyPerSecondText();
  updateRateDisplays();
}

mainButton.addEventListener("click", () => {
  money += clickBonus;
  totalClicks++;
  clickTimestamps.push(Date.now());
  updateMoneyText();

  if (!isClicking) {
    isClicking = true;
    // Smooth fade-in for the displays
    const rateDisplays = document.getElementById("rate-displays");
    rateDisplays.style.display = "flex";
    rateDisplays.style.opacity = "0";
    setTimeout(() => {
      rateDisplays.style.opacity = "1";
    }, 10);
  }

  if (clickCooldownTimeout) {
    clearTimeout(clickCooldownTimeout);
  }

  clickCooldownTimeout = setTimeout(() => {
    isClicking = false;
    // Smooth fade-out for the displays
    const rateDisplays = document.getElementById("rate-displays");
    rateDisplays.style.opacity = "0";
    setTimeout(() => {
      rateDisplays.style.display = "none";
    }, 300);
  }, 200);
});

function updateMoneyText() {
  moneyText.textContent = `You have ${money.toFixed(0)} sticky notes`;
}

function updateMoneyPerSecondText() {
  perSec.textContent = `${calculateMoneyPerSecond().toFixed(
    0
  )} notes per second`;
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

  // Reset bonuses
  upgrade1Bonus = 0;
  upgrade2Bonus = 0;

  if (isClicking) {
    // Show the displays when clicking
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
    // Hide the displays when not clicking
    rateDisplays.style.display = "none";
  }

  totalRate = moneyPerSec - initialMoneyPerSec; // Only show the bonus amount
  updateRateDisplays();

  return moneyPerSec;
}

function calculateCPS() {
  const now = Date.now();
  clickTimestamps = clickTimestamps.filter(
    (timestamp) => now - timestamp < CPS_WINDOW_MS
  );
  return clickTimestamps.length;
}

function updateRateDisplays() {
  const upgrade1RateEl = document.getElementById("upgrade1-rate");
  const upgrade2RateEl = document.getElementById("upgrade2-rate");
  const totalRateEl = document.getElementById("total-rate");

  upgrade1RateEl.textContent = `Upgrade 1: +${upgrade1Bonus.toFixed(1)}`;
  upgrade2RateEl.textContent = `Upgrade 2: +${upgrade2Bonus.toFixed(1)}`;
  totalRateEl.textContent = `Total bonus: +${totalRate.toFixed(1)}`;
}

function update() {
  money += calculateMoneyPerSecond() / 10;
  updateMoneyPerSecondText();
  updateMoneyText();
}

function updateCPS() {
  const cps = calculateCPS();
  cpsText.textContent = `${cps} cps`;
}

setInterval(update, 100);
setInterval(updateCPS, 100);

// Start the game
initGame();
