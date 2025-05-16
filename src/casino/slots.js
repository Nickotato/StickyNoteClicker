export function renderSlotMachine(bet, updateMoneyDisplay, onReturn, adjustMoney) {
    const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];
    const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
  
    const spinReel = (reel, duration = 1000) => {
      return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          reel.innerText = getRandomSymbol();
          i++;
          if (i > duration / 50) {
            clearInterval(interval);
            resolve(reel.innerText);
          }
        }, 50);
      });
    };
  
    const gameSection = document.getElementById("casino-game-section");
    gameSection.innerHTML = `
      <h2>Slot Machine</h2>
      <div class="slot-reels">
        <div class="reel">🍋</div>
        <div class="reel">🍒</div>
        <div class="reel">7️⃣</div>
      </div>
      <p class="slot-status">Spinning...</p>
    `;
  
    const reelEls = gameSection.querySelectorAll(".reel");
  
    Promise.all([
      spinReel(reelEls[0], 1000),
      spinReel(reelEls[1], 1500),
      spinReel(reelEls[2], 2000)
    ]).then((results) => {
      const status = gameSection.querySelector(".slot-status");
      const [a, b, c] = results;
      let winnings = 0;
  
      if (a === b && b === c) {
        winnings = bet * 5;
        status.textContent = `🎉 Jackpot! You won $${winnings}`;
      } else if (a === b || b === c || a === c) {
        winnings = bet * 2;
        status.textContent = `Nice! You won $${winnings}`;
      } else {
        winnings = -bet;
        status.textContent = `You lost $${bet}`;
      }
  
      adjustMoney(winnings);
      updateMoneyDisplay();
  
      const btn = document.createElement("button");
      btn.id = "return-button";
      btn.textContent = "Return";
      btn.addEventListener("click", onReturn);
      gameSection.appendChild(btn);
    });
  }
  