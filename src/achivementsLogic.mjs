export function checkForAchievements(game, mainContainer) {
  if (game.totalNotes >= 1) {
    unlockAchievement("firstNote", game);
  }
  if (game.totalNotes >= 100) {
    unlockAchievement("hundredNotes", game);
  }
  if (Object.values(game.workers).some((worker) => worker.owned > 0)) {
    unlockAchievement("firstWorker", game);
  }
  if (Object.values(game.upgrades).some((upgrade) => upgrade.owned > 0)) {
    unlockAchievement("firstUpgrade", game);
  }
  if (mainContainer.style.transform === "translate(0px, -100vh)") {
    unlockAchievement("settings", game);
  }
  if (
    Object.values(game.workers).some(
      (worker) => worker.owned > 0 && worker.id === "worker5"
    )
  ) {
    unlockAchievement("crime", game);
  }
}

function unlockAchievement(id, game) {
  const achievement = game.achievements.find((a) => a.id === id);

  if (achievement && !achievement.unlocked) {
    game.unlockedAchievements++;
    achievement.unlocked = true;
    showAchievementNotification(achievement);
    addAchievementNote(achievement);
    updateAchievementStats(game);
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

export function addAchievementNote(achievement) {
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

export function updateAchievementStats(game) {
  const achievementNumber = document.getElementById("achievements-number");

  achievementNumber.textContent = `${game.unlockedAchievements} / ${game.totalAchievements}`;
}

export function clearAchievementNotes() {
  const achievementSection = document.getElementById("achievements-section");
  if (achievementSection) {
    const notes =
      achievementSection.getElementsByClassName("achievements-note");
    // Convert to array to avoid live collection issues while removing
    Array.from(notes).forEach((note) => note.remove());
  }
}
