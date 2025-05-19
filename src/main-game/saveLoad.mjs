import {
  defaultWorkers,
  defaultUpgrades,
  defaultAchievements,
  defaultVisuals,
} from "../defaults/defaults.mjs";
import {
  addAchievementNote,
  updateAchievementStats,
  clearAchievementNotes,
} from "../achivementsLogic.mjs";
import { initializeShop, updateShopDescriptions } from "../shop.mjs";
import { WorkerClass } from "../defaults/classes/Worker.mjs";
import {calculateMoneyPerSecond} from "../index.mjs"

export { save, load, newGame };

function save(game) {
  try {
    localStorage.setItem(
      `stickyNotesGame_${game.currentSaveSlot}`,
      JSON.stringify({
        money: game.money,
        totalClicks: game.totalClicks,
        totalNotes: game.totalNotes,
        clickTimestamps: game.clickTimestamps,
        clickBonus: game.clickBonus,
        upgrade1Bonus: game.upgrade1Bonus,
        upgrade2Bonus: game.upgrade2Bonus,
        totalRate: game.totalRate,
        achievements: game.achievements,
        unlockedAchievements: game.unlockedAchievements,
        isReadableNumbersOn: game.isReadableNumbersOn,
        workers: Object.fromEntries(
          Object.entries(game.workers).map(([key, worker]) => [
            key,
            typeof worker.toJSON === "function"
              ? worker.toJSON()
              : {
                  id: worker.id,
                  owned: worker.owned ?? 0,
                  visible: worker.visible ?? false,
                },
          ])
        ),
        upgrades: game.upgrades,
        visuals: game.visuals,
        // add other properties as needed
      })
    );
    localStorage.setItem(`lastOnline_${game.currentSaveSlot}`, Date.now());
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function load(game, saveSlot = "save1") {
  migrateOldSaveIfNeeded(saveSlot);
  
  const savedGameStr = localStorage.getItem(`stickyNotesGame_${saveSlot}`);
  if (!savedGameStr) {
    console.warn(`No save data found for ${saveSlot}. Starting new game`);
    newGame(game, saveSlot);
    return;
  }

  clearAchievementNotes();
  const savedGame = JSON.parse(savedGameStr);

  // Assign core game state
  game.money = savedGame.money ?? 0;
  game.totalClicks = savedGame.totalClicks ?? 0;
  game.totalNotes = savedGame.totalNotes ?? 0;
  game.unlockedAchievements = savedGame.unlockedAchievements ?? 0;
  game.isReadableNumbersOn = savedGame.isReadableNumbersOn ?? false;
  game.clickTimestamps = savedGame.clickTimestamps ?? [];
  game.clickBonus = savedGame.clickBonus ?? 1;
  game.upgrade1Bonus = savedGame.upgrade1Bonus ?? 0;
  game.upgrade2Bonus = savedGame.upgrade2Bonus ?? 0;
  game.totalRate = savedGame.totalRate ?? 0;

  // Load workers with recalculated costs
  // if (savedGame.workers) {
  //   Object.keys(defaultWorkers).forEach((key) => {
  //     const savedWorker = savedGame.workers[key] || {};
  //     const owned = savedWorker.owned || 0;
  //     // const baseCost = defaultWorkers[key].cost;
  //     // const cost = Math.floor(baseCost * Math.pow(1.15, owned));

  //     game.workers[key] = {
  //       ...defaultWorkers[key],
  //       owned,
  //       visible: savedWorker.visible || false,
  //       // cost,
  //     };
  //   });
  // }

  if (savedGame.workers) {
    Object.keys(defaultWorkers).forEach((key) => {
      const savedWorker = savedGame.workers[key];
      if (savedWorker) {
        game.workers[key] = WorkerClass.fromJSON(
          key,
          savedWorker,
          defaultWorkers
        );
      } else {
        game.workers[key] = defaultWorkers[key];
      }
    });
  }

  // return this._cost * Math.pow(1.15, this.owned);

  // Load upgrades with recalculated costs
  if (savedGame.upgrades) {
    Object.keys(defaultUpgrades).forEach((key) => {
      const savedUpgrade = savedGame.upgrades[key] || {};
      const owned = savedUpgrade.owned || 0;
      const baseCost = defaultUpgrades[key].cost;
      const cost = Math.floor(
        baseCost * Math.pow(defaultUpgrades[key].costMultiplier, owned)
      );

      game.upgrades[key] = {
        ...defaultUpgrades[key],
        owned,
        cost,
      };
    });
  }

  // Load visuals
  if (savedGame.visuals) {
    Object.keys(savedGame.visuals).forEach((key) => {
      if (game.visuals[key]) {
        game.visuals[key].owned = savedGame.visuals[key].owned ?? false;
        game.visuals[key].selected = savedGame.visuals[key].selected ?? false;
      }
    });
  }

  // Load achievements
  if (savedGame.achievements) {
    const savedAchievementsMap = Object.fromEntries(
      savedGame.achievements.map((a) => [a.id, a])
    );

    game.achievements.forEach((ach) => {
      const saved = savedAchievementsMap[ach.id];
      if (saved) ach.unlocked = saved.unlocked ?? false;
      if (ach.unlocked) addAchievementNote(ach, game);
    });
  }

  // Offline earnings calculation
  if (savedGame.lastOnline) {
    const lastOnline = savedGame.lastOnline;
    const now = Date.now();
    const secondsOffline = Math.floor((now - lastOnline) / 1000);
    if (secondsOffline > 60) {
      const moneyPerSecond = calculateMoneyPerSecond("initial");
      const multiplier =
        (game.upgrades.upgrade4?.owned || 0) *
        (game.upgrades.upgrade4?.value || 1);
      const offlineEarnings = secondsOffline * moneyPerSecond * multiplier;
      if (offlineEarnings > 0) {
        game.money += offlineEarnings;
        alert(
          `You were away for ${secondsOffline} seconds and earned ${readableNumber(
            offlineEarnings
          )}!`
        );
      }
    }
  }

  // Upgrade-based UI adjustments
  document.getElementById("casino-screen-note").style.display =
    (game.upgrades.upgrade6?.owned ?? 0) > 0 ? "block" : "none";

  game.currentSaveSlot = saveSlot;
  updateShopDescriptions(game);
}

function newGame(game, saveSlot = "save1", confirmReset = true) {
  if (
    confirmReset &&
    !confirm(
      "Are you sure you want to start a new game? This will delete your current progress!"
    )
  ) {
    return;
  }

  localStorage.removeItem(`stickyNotesGame_${saveSlot}`);
  localStorage.removeItem(`lastOnline_${saveSlot}`);

  game.money = 0;
  game.totalClicks = 0;
  game.totalNotes = 0;
  game.unlockedAchievements = 0;
  game.isReadableNumbersOn = false;
  game.currentSaveSlot = saveSlot;

  game.clickTimestamps = [];
  game.clickBonus = 1;
  game.upgrade1Bonus = 0;
  game.upgrade2Bonus = 0;
  game.totalRate = 0;

  game.workers = {};
Object.keys(defaultWorkers).forEach((key) => {
  game.workers[key] = WorkerClass.fromJSON(key, {
    owned: 0,
    visible: false,
  }, defaultWorkers);
});


  game.upgrades = { ...defaultUpgrades };
  Object.keys(game.upgrades).forEach((key) => {
    game.upgrades[key] = {
      ...game.upgrades[key],
      owned: 0,
      cost: defaultUpgrades[key].cost,
    };
  });

  game.visuals = { ...defaultVisuals };
  Object.keys(game.visuals).forEach((key) => {
    game.visuals[key] = {
      ...game.visuals[key],
      owned: false,
      selected: false,
    };
  });

  game.achievements = [...defaultAchievements].map((ach) => ({
    ...ach,
    unlocked: false,
  }));

  clearAchievementNotes();

  alert("New game started!");
}


function migrateOldSaveIfNeeded(saveSlot = "save1") {
  const newKey = `stickyNotesGame_${saveSlot}`;
  const oldKey = "stickyNotesGame";

  // If new save already exists, don't overwrite it
  // if (localStorage.getItem(newKey)) return;
  console.log(localStorage.getItem(oldKey));

  const oldSaveStr = localStorage.getItem(oldKey);
  if (!oldSaveStr) return;

  try {
    const oldSave = JSON.parse(oldSaveStr);
    const migratedSave = {
      money: oldSave.money || 0,
      totalClicks: oldSave.totalClicks || 0,
      totalNotes: oldSave.totalNotes || 0,
      unlockedAchievements: oldSave.unlockedAchievements || 0,
      isReadableNumbersOn: oldSave.isReadableNumbersOn || false,
      clickTimestamps: oldSave.clickTimestamps || [],
      clickBonus: oldSave.clickBonus || 1,
      upgrade1Bonus: oldSave.upgrade1Bonus || 0,
      upgrade2Bonus: oldSave.upgrade2Bonus || 0,
      totalRate: oldSave.totalRate || 0,
      lastOnline: parseInt(localStorage.getItem("lastOnline")) || Date.now(),
      workers: {},
      upgrades: {},
      achievements: oldSave.achievements || [],
      visuals: {}, // Optional, or migrate if relevant
    };

    // Migrate workers
    if (oldSave.workers) {
      Object.keys(oldSave.workers).forEach((key) => {
        const w = oldSave.workers[key];
        migratedSave.workers[key] = {
          id: key,
          owned: w.owned || 0,
          visible: w.visible || false,
        };
      });
    }

    // Migrate upgrades
    if (oldSave.upgrades) {
      Object.keys(oldSave.upgrades).forEach((key) => {
        const u = oldSave.upgrades[key];
        migratedSave.upgrades[key] = {
          owned: u.owned || 0,
        };
      });
    }

    // Save the migrated version under the new key
    localStorage.setItem(newKey, JSON.stringify(migratedSave));
    console.log("Old save migrated to new format.");
  } catch (e) {
    console.error("Failed to migrate old save:", e);
  }
}
