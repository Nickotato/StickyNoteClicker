import { soundEffects, playSoundEffects } from "./audio.mjs";
import {
  readableNumber,
  getTotalCost,
  getRandomStickyNoteColor,
} from "./utils.mjs";
import { WorkerClass } from "./defaults/classes/Worker.mjs";

let buyAmount = 1;

export function initializeShop(game, updateVisualDisplay) {
  const shopSection = document.querySelector(".shop-section");
  shopSection.innerHTML = "";

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

  const visualTab = document.createElement("button");
  visualTab.className = "shop-tab stickynote";
  visualTab.textContent = "Visual";
  tabsContainer.appendChild(visualTab);

  const workerContent = document.createElement("div");
  workerContent.className = "shop-content active";
  workerContent.id = "worker-content";
  shopSection.appendChild(workerContent);

  const upgradeContent = document.createElement("div");
  upgradeContent.className = "shop-content";
  upgradeContent.id = "upgrade-content";
  shopSection.appendChild(upgradeContent);

  const visualContent = document.createElement("div");
  visualContent.className = "shop-content";
  visualContent.id = "visual-content";
  shopSection.appendChild(visualContent);

  const bulkBuySection = document.createElement("div");
  bulkBuySection.className = "bulkBuySection";
  const [bulk1, bulk5, bulk10] = ["div", "div", "div"].map((tag) =>
    document.createElement(tag)
  );

  bulk1.className = "shop-tab bulkBuyButton active";
  bulk5.className = "shop-tab bulkBuyButton";
  bulk10.className = "shop-tab bulkBuyButton";
  bulk1.textContent = "1";
  bulk5.textContent = "5";
  bulk10.textContent = "10";
  [bulk1, bulk5, bulk10].forEach((el) => bulkBuySection.appendChild(el));
  shopSection.appendChild(bulkBuySection);

  ///////////////////////////
  ////SMALL SCREEN LOGIC////
  /////////////////////////

  if (window.innerWidth <= 768) {
    workerTab.classList.remove("active");
  }

  window.addEventListener("resize", () => {
    moveShopSectionIfMobile();
  });

  workerTab.addEventListener("click", () => {
    let before = undefined;
    if (window.innerWidth <= 768) {
      before = toggleShopSection(workerTab, upgradeTab, visualTab, shopSection);
    }

    playSoundEffects(soundEffects.click2);
    workerTab.classList.add("active");
    upgradeTab.classList.remove("active");
    workerContent.classList.add("active");
    upgradeContent.classList.remove("active");
    visualTab.classList.remove("active");
    visualContent.classList.remove("active");

    if (window.innerWidth <= 768 && before) {
      workerTab.classList.remove("active");
    }
  });

  upgradeTab.addEventListener("click", () => {
    let before = undefined;
    if (window.innerWidth <= 768) {
      before = toggleShopSection(upgradeTab, workerTab, visualTab, shopSection);
    }

    playSoundEffects(soundEffects.click2);
    upgradeTab.classList.add("active");
    workerTab.classList.remove("active");
    upgradeContent.classList.add("active");
    workerContent.classList.remove("active");
    visualTab.classList.remove("active");
    visualContent.classList.remove("active");

    if (window.innerWidth <= 768 && before) {
      upgradeTab.classList.remove("active");
    }
  });

  visualTab.addEventListener("click", () => {
    let before = undefined;
    if (window.innerWidth <= 768) {
      before = toggleShopSection(visualTab, workerTab, upgradeTab, shopSection);
    }

    playSoundEffects(soundEffects.click2);

    visualTab.classList.add("active");
    workerTab.classList.remove("active");
    upgradeTab.classList.remove("active");

    visualContent.classList.add("active");
    workerContent.classList.remove("active");
    upgradeContent.classList.remove("active");

    if (window.innerWidth <= 768 && before) {
      visualTab.classList.remove("active");
    }
  });

  bulkBuySection.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("bulkBuyButton")) {
      buyAmount = parseInt(target.textContent);
      const allButtons = bulkBuySection.querySelectorAll(".bulkBuyButton");
      allButtons.forEach((btn) => btn.classList.remove("active"));
      target.classList.add("active");
    }
  });

  createWorkerElements(game, workerContent);
  createUpgradeElements(game, upgradeContent);
  createVisualElements(game, visualContent, updateVisualDisplay);
}

export function moveShopSectionIfMobile() {
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

function toggleShopSection(tab, othertab1, othertab2, shopSection) {
  if (tab.classList.contains("active")) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return true;
  } else if (
    !(
      tab.classList.contains("active") ||
      othertab1.classList.contains("active") ||
      othertab2.classList.contains("active")
    )
  ) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return false;
  } else if (
    !tab.classList.contains("active") &&
    (othertab1.classList.contains("active") ||
      othertab2.classList.contains("active")) &&
    !shopSection.classList.contains("open")
  ) {
    shopSection.classList.toggle("open");
    playSoundEffects(soundEffects.whoosh1);
    return false;
  }
}

function createWorkerElements(game, workerContent) {
  workerContent.innerHTML = "";

  Object.values(game.workers).forEach((worker) => {
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

    if (!worker.visible && game.money >= worker.cost * 0.6) {
      worker.visible = true;
    }
    const isUnlocked = worker.visible;

    if (!isUnlocked) {
      workerEl.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
          <span style="font-size: 64px; color: grey;">?</span>
        </div>
      `;
    } else {
      workerEl.innerHTML = `
        <button class="shop-item-button">${worker.name}</button>
        <p class="shop-item-description">${worker.description}</p>
        <p class="shop-item-owned">You own ${worker.owned}</p>
        <p class="shop-item-cost">Cost: ${getTotalCost(
          worker.cost,
          1.15,
          buyAmount
        ).toFixed(0)}</p>
        <p class="shop-item-produce">Produces: ${worker.produce}/s</p>
      `;
    }
    console.log(worker instanceof WorkerClass); // should be true
    console.log(worker.owned);

    workerContent.appendChild(workerEl);

    // Always attach listener, even if not unlocked
    workerEl.addEventListener("click", () => {
      if (!worker.visible) {
        playSoundEffects(soundEffects.hover);
        return;
      }

      const totalCost = getTotalCost(worker.cost, 1.15, buyAmount);
      if (game.money >= totalCost) {
        playSoundEffects(soundEffects.orb);
        workerEl.disabled = true;
        setTimeout(() => (workerEl.disabled = false), 500);

        game.money -= totalCost;
        worker.owned += buyAmount;
        // worker.cost *= Math.pow(1.15, buyAmount);

        const ownedText = workerEl.querySelector(".shop-item-owned");
        const costText = workerEl.querySelector(".shop-item-cost");
        if (ownedText) {
          ownedText.textContent = `You own ${worker.owned}`;
        }
        if (costText) {
          costText.textContent = `Cost: ${worker.cost.toFixed(0)}`;
        }
      } else {
        playSoundEffects(soundEffects.hover);
      }
    });
  });
}

export function updateShopDescriptions(game) {
  updateWorkerDescriptions(game);
  updateUpgradesDescription(game);
  updateVisualDescriptions(game);
}

function updateWorkerDescriptions(game) {
  const workerItems = document.querySelectorAll(".worker-item");

  workerItems.forEach((workerEl, index) => {
    const worker = Object.values(game.workers)[index];
    if (!worker.visible && game.money >= worker.cost * 0.6) {
      worker.visible = true;
    }
    const isUnlocked = worker.visible;

    if (isUnlocked) {
      workerEl.innerHTML = `
          <button class="shop-item-button">${worker.name}</button>
          <p class="shop-item-description">${worker.description}</p>
          <p class="shop-item-owned">You own ${worker.owned}</p>
          <p class="shop-item-cost">Cost: ${
            game.isReadableNumbersOn
              ? readableNumber(getTotalCost(worker.cost, 1.15, buyAmount))
              : getTotalCost(worker.cost, 1.15, buyAmount).toFixed(0)
          }</p>
          <p class="shop-item-produce">Produces: ${
            game.isReadableNumbersOn
              ? readableNumber(worker.produce)
              : worker.produce.toFixed(0)
          }/s</p>
        `;

      if (game.money < getTotalCost(worker.cost, 1.15, buyAmount)) {
        workerEl.style.filter = "brightness(0.5)";
      } else {
        workerEl.style.filter = "";
      }
    } else {
      workerEl.innerHTML = `<div class="locked-worker">?</div>`;
      const lock = workerEl.querySelector(".locked-worker");
      lock.style.fontSize = "3em";
      lock.style.textAlign = "center";
      lock.style.padding = "20px";
    }
  });
}

function updateUpgradesDescription(game) {
  const upgradeItems = document.querySelectorAll(".upgrades-note");
  upgradeItems.forEach((upgradeEl, index) => {
    const upgrade = Object.values(game.upgrades)[index];

    const totalCost = getTotalCost(
      upgrade.cost,
      upgrade.costMultiplier,
      buyAmount
    );

    if (game.money < totalCost || upgrade.owned + buyAmount > upgrade.max) {
      upgradeEl.style.filter = "brightness(0.5)";
    } else {
      upgradeEl.style.filter = "";
    }

    function upgradeAmountText() {
      if (upgrade.key === "upgrade1") {
        return `extra ${(upgrade.owned * upgrade.value * 100).toFixed(
          0
        )}% of NPS`;
      } else if (upgrade.key === "upgrade2") {
        return `${(upgrade.value * upgrade.owned * 100).toFixed(
          1
        )}% of cps multiplied by NPS`;
      } else if (upgrade.key === "upgrade3") {
        const amountString = game.isReadableNumbersOn
          ? readableNumber(upgrade.value ** upgrade.owned)
          : (upgrade.value ** upgrade.owned).toFixed(0);
        return `You get ${amountString} per click`;
      } else if (upgrade.key === "upgrade4") {
        return `You get ${(upgrade.value * upgrade.owned * 100).toFixed(
          0
        )}% of notes earned offline`;
      } else if (upgrade.key === "upgrade5") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      } else if (upgrade.key === "upgrade6") {
        return upgrade.owned === 1 ? `You have access` : `Access Denied`;
      } else if (upgrade.key === "upgrade7") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      }
    }

    upgradeEl.innerHTML = `
        <button class="shop-item-button">${upgrade.id}</button>
        <p class="shop-item-description">${upgrade.description}</p>
        <p class="shop-item-cost">Cost: ${
          game.isReadableNumbersOn
            ? readableNumber(totalCost)
            : totalCost.toFixed(0)
        }</p>
        <p class="shop-item-text">${upgradeAmountText()}</p>
      `;
  });
}

function updateVisualDescriptions(game) {
  const visualItems = document.querySelectorAll(".visual-note");

  visualItems.forEach((visualEl, index) => {
    const visual = Object.values(game.visuals)[index];

    if (visual.owned) {
      visualEl.style.filter = visual.selected
        ? "brightness(1.2)"
        : "brightness(0.9)";
    } else if (game.money < visual.cost) {
      visualEl.style.filter = "brightness(0.5)";
    } else {
      visualEl.style.filter = "brightness(1)";
    }

    visualEl.innerHTML = `
        <button class="shop-item-button">${visual.name}</button>
        <p class="shop-item-cost">Cost: ${
          game.isReadableNumbersOn
            ? readableNumber(visual.cost)
            : visual.cost.toFixed(0)
        }</p>
        <p class="shop-item-status">${
          visual.owned ? (visual.selected ? "Selected" : "Owned") : "Not Owned"
        }</p>
      `;
  });
}

function createUpgradeElements(game, upgradeContent) {
  upgradeContent.innerHTML = "";

  Object.values(game.upgrades).forEach((upgrade) => {
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
          game.upgrades.upgrade1.owned *
          game.upgrades.upgrade1.value *
          100
        ).toFixed(0)}% of NPS`;
      } else if (upgrade.key === "upgrade2") {
        return `${(
          game.upgrades.upgrade2.value *
          game.upgrades.upgrade2.owned *
          100
        ).toFixed(1)}% of cps multiplied by NPS`;
      } else if (upgrade.key === "upgrade3") {
        const amountString = game.isReadableNumbersOn
          ? readableNumber(upgrade.value ** upgrade.owned)
          : (upgrade.value ** upgrade.owned).toFixed(0);
        return `You get ${amountString} per click`;
      } else if (upgrade.key === "upgrade4") {
        return `You get ${(upgrade.value * upgrade.owned * 100).toFixed(
          0
        )}% of notes earned offline`;
      } else if (upgrade.key === "upgrade5") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      } else if (upgrade.key === "upgrade6") {
        return upgrade.owned === 1 ? `You have access` : `Access Denied`;
      } else if (upgrade.key === "upgrade7") {
        return upgrade.owned === 1 ? `You own this` : `You do not own this`;
      }
    }

    upgradeEl.innerHTML = `
        <button class="shop-item-button">${upgrade.id}</button>
        <p class="shop-item-description">${upgrade.description}</p>
        <p class="shop-item-cost">Cost: ${
          game.isReadableNumbersOn
            ? readableNumber(upgrade.cost)
            : upgrade.cost.toFixed(0)
        }</p>
        <p class="shop-item-text">${upgradeAmountText()}</p>
      `;

    upgradeContent.appendChild(upgradeEl);

    const button = upgradeEl;
    const text = upgradeEl.querySelector(".shop-item-text");
    const costText = upgradeEl.querySelector(".shop-item-cost");

    button.addEventListener("click", () => {
      const totalCost = getTotalCost(
        upgrade.cost,
        upgrade.costMultiplier,
        buyAmount
      );

      if (game.money >= totalCost && upgrade.owned + buyAmount <= upgrade.max) {
        if (upgrade.key === "upgrade4" && upgrade.owned >= upgrade.max) {
          alert("Cannot go above 100%");
          return;
        } else if (
          (upgrade.key === "upgrade5" ||
            upgrade.key === "upgrade6" ||
            upgrade.key === "upgrade7") &&
          upgrade.owned >= upgrade.max
        ) {
          alert("Cannot buy more than 1");
          return;
        }

        game.money -= totalCost;
        playSoundEffects(soundEffects.orb);

        upgrade.owned += buyAmount;
        upgrade.cost *= Math.pow(upgrade.costMultiplier, buyAmount);

        text.textContent = `${upgradeAmountText()}`;
        costText.textContent = `Cost: ${
          game.isReadableNumbersOn
            ? readableNumber(upgrade.cost)
            : upgrade.cost.toFixed(0)
        })`;

        if (upgrade.owned + buyAmount > upgrade.max) {
          button.style.filter = `brightness(0.7)`;
          button.style.transition = `all 0.2s ease-in-out`;
        }
      } else {
        playSoundEffects(soundEffects.hover);
      }
    });
  });
}

function createVisualElements(game, visualContent, updateVisualDisplay) {
  visualContent.innerHTML = "";

  Object.values(game.visuals).forEach((visual) => {
    const visualEl = document.createElement("div");
    visualEl.className = `shop-item stickynote no-select visual-note ${
      visual.selected ? "selected" : ""
    }`;

    const angle = Math.random() * 10 - 5;
    let transform = `rotate(${angle}deg)`;
    if (Math.random() < 0.05) transform += " rotate(180deg)";
    visualEl.style.transform = transform;

    visualEl.style.margin = "10px";
    visualEl.style.background = getRandomStickyNoteColor();

    visualEl.addEventListener("mouseenter", () => {
      visualEl.style.transform = "rotate(0deg)";
    });

    visualEl.addEventListener("mouseleave", () => {
      visualEl.style.transform = transform;
    });

    if (visual.owned) {
      visualEl.style.filter = visual.selected
        ? "brightness(1.2)"
        : "brightness(0.9)";
    } else if (visual.owned + buyAmount > 1) {
      visualEl.style.filter = `brightness(0.7)`;
    }

    visualEl.innerHTML = `
        <button class="shop-item-button">${visual.name}</button>
        <p class="shop-item-cost">Cost: ${
          game.isReadableNumbersOn
            ? readableNumber(visual.cost)
            : visual.cost.toFixed(0)
        }</p>
        <p class="shop-item-status">${
          visual.owned ? (visual.selected ? "Selected" : "Owned") : "Not Owned"
        }</p>
      `;

    visualEl.addEventListener("click", () => {
      if (!visual.owned) {
        if (game.money >= visual.cost) {
          game.money -= visual.cost;
          visual.owned = true;
          playSoundEffects(soundEffects.orb);
        } else {
          playSoundEffects(soundEffects.hover);
          return;
        }
      } else {
        // Deselect others of the same type
        Object.values(game.visuals).forEach((v) => {
          if (v.type === visual.type) v.selected = false;
        });

        // Select this visual
        visual.selected = true;
      }

      updateVisualDescriptions(game);
      updateVisualDisplay();
    });

    visualContent.appendChild(visualEl);
  });

  updateVisualDescriptions(game);
  updateVisualDisplay();
}
