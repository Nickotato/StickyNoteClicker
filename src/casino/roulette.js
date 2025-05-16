export function renderRoulette(bet, updateMoneyDisplay, onReturn, adjustMoney) {
    const gameSection = document.getElementById("casino-game-section");
    const numbers = Array.from({ length: 37 }, (_, i) => i); // 0 to 36
    const colors = (n) => (n === 0 ? "green" : n % 2 === 0 ? "black" : "red");
  
    const spinTo = Math.floor(Math.random() * 37);
    const angle = 360 * 5 + (spinTo * (360 / 37));
  
    gameSection.innerHTML = `
      <h2>Roulette</h2>
      <div class="roulette-wheel-container">
        <div class="roulette-wheel" id="wheel"></div>
      </div>
      <p class="roulette-result">Spinning...</p>
    `;
  
    const wheel = document.getElementById("wheel");
    wheel.style.transition = "transform 4s ease-out";
    wheel.style.transform = `rotate(${angle}deg)`;
  
    setTimeout(() => {
      const result = spinTo;
      const resultColor = colors(result);
      let winnings = 0;
      let win = false;
  
      // Win if even number and not 0
      if (result !== 0 && result % 2 === 0) {
        winnings = bet * 2;
        win = true;
      } else {
        winnings = -bet;
      }
  
      adjustMoney(winnings);
      updateMoneyDisplay();
  
      gameSection.querySelector(".roulette-result").innerHTML = `
        Ball landed on <strong style="color:${resultColor}">${result} (${resultColor})</strong>. 
        ${win ? `You won $${bet * 2}` : `You lost $${bet}`}.
      `;
  
      const btn = document.createElement("button");
      btn.id = "return-button";
      btn.textContent = "Return";
      btn.addEventListener("click", onReturn);
      gameSection.appendChild(btn);
    }, 4100);
  }
  