import {
  readableNumber,
  getTotalCost,
  getCardSrc,
  capitalize,
  getRandomStickyNoteColor,
} from "../utils.mjs";

import { renderSlotMachine } from "./slots.js";
import { renderRoulette } from "./roulette.js";

export { updateCasinoMoneyDisplay };

const gameResultDiv = document.getElementById("game-result");
const gameSection = document.getElementById("casino-game-section");
const playButton = document.getElementById("play-game");
const betSlider = document.getElementById("bet-amount-slider");
const betInput = document.getElementById("bet-amount-input");
const betAmountDisplay = document.getElementById("bet-amount-display");
const gameNotes = document.querySelectorAll(".casino-game-note");
const moneyDisplay = document.getElementById("current-money-display");

let selectedGame = "blackjack"; // Default
let currentGame = {
  playerCards: [],
  dealerCards: [],
  rideTheBusCards: [], // To keep track of revealed cards
  bet: 0,
};

let game;
let mainContainer;

const suits = ["hearts", "diamonds", "clubs", "spades"];

function updateCasinoMoneyDisplay(game) {
  betSlider.max = game.money;

  moneyDisplay.textContent = `Current Notes: ${
    game.isReadableNumbersOn
      ? readableNumber(game.money)
      : game.money.toFixed(0)
  }`;
}

function drawCard() {
  const value = Math.floor(Math.random() * 10) + 2;
  const cardValue = value === 10 && Math.random() < 0.25 ? 11 : value;
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return { value: cardValue, suit };
}

function renderCard(card, faceDown = false) {
  if (faceDown) {
    return `<img src="${require("url:../images/casino/blackjack/back.png")}" class="card" width="80" />`;
  } else {
    let displayValue = card.value === 11 ? "ace" : card.value;
    const imageName = `${displayValue}_of_${card.suit}`;
    return `<img src="${getCardSrc(imageName)}" class="card" width="80" />`;
  }
}

function renderCards(cards) {
  return cards.map((card) => renderCard(card)).join("");
}

function calculateTotal(cards) {
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter((card) => card.value === 11).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderBlackjackGame(end = false, message = "") {
  const { playerCards, dealerCards, bet } = currentGame;
  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);

  let controls = "";
  if (!end) {
    controls = `
       <button id="hit-button" class="blackjack-controls">Hit</button>
       <button id="stand-button" class="blackjack-controls">Stand</button>
    `;
  }

  gameSection.innerHTML = `
    <h2>Blackjack</h2>
    <div class="blackjack-hand">
      <h3>Your Hand (${playerTotal}):</h3>
      <div class="cards">${renderCards(playerCards)}</div>
    </div>
    <div class="blackjack-hand">
      <h3>Dealer's Hand (${end ? dealerTotal : "?"}):</h3>
      <div class="cards">
        ${
          end
            ? renderCards(dealerCards)
            : `
<img src="${require("url:../images/casino/blackjack/back.png")}" class="card" width="80" />
<img src="${require("url:../images/casino/blackjack/back.png")}" class="card back" width="80" />
`
        }
      </div>
    </div>
    <p>${message}</p>
    ${controls}
    ${
      end
        ? `<p>New Balance: $${
            game.isReadableNumbersOn
              ? readableNumber(game.money)
              : game.money.toFixed(0)
          }</p><button id="return-button">Return</button>`
        : ""
    }
  `;

  if (!end) {
    document.getElementById("hit-button").addEventListener("click", playerHits);
    document
      .getElementById("stand-button")
      .addEventListener("click", playerStands);
  } else {
    document.getElementById("return-button").addEventListener("click", () => {
      mainContainer.style.transform = "translate(100%, 0)";
    });
  }
}

function playerHits() {
  currentGame.playerCards.push(drawCard());
  const total = calculateTotal(currentGame.playerCards);
  if (total > 21) {
    game.money -= currentGame.bet;
    updateCasinoMoneyDisplay(game);
    renderBlackjackGame(true, "You busted!");
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

  let resultText = "";
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    game.money += currentGame.bet;
    resultText = "You win!";
  } else if (playerTotal < dealerTotal) {
    game.money -= currentGame.bet;
    resultText = "Dealer wins!";
  } else {
    resultText = "Push!";
  }

  updateCasinoMoneyDisplay(game);
  renderBlackjackGame(true, resultText);
}

function renderRideTheBus(stage = 1, previousCard = null, multiplier = 1) {
  const stageTitles = [
    "Red or Black",
    "Higher or Lower",
    "In Between or Outside",
    "Guess the Suit",
  ];
  const stageMultipliers = [1, 2, 3, 20];
  const currentMultiplier = stageMultipliers[stage - 1];
  const nextMultiplier = stageMultipliers[stage] ?? currentMultiplier;

  // Render 4 card slots - face-up for revealed cards, face-down otherwise
  let displayedCards = [];
  for (let i = 0; i < 4; i++) {
    if (i < currentGame.rideTheBusCards.length) {
      displayedCards.push(renderCard(currentGame.rideTheBusCards[i]));
    } else {
      displayedCards.push(renderCard({}, true)); // face-down
    }
  }

  gameSection.innerHTML = `
    <h2>Ride the Bus</h2>
    <p>Stage ${stage}: ${stageTitles[stage - 1]}</p>
    <div class="cards">${displayedCards.join("")}</div>
    <div class="ride-the-bus-options">
      ${renderStageOptions(stage)}
    </div>
    <button id="walk-away">Walk Away with x${multiplier}</button>
  `;

  document.getElementById("walk-away").addEventListener("click", () => {
    console.log(currentGame.bet);
    console.log(stage);
    const payout = stage === 1 ? currentGame.bet : currentGame.bet * multiplier;
    game.money -= currentGame.bet;
    game.money += payout;
    updateCasinoMoneyDisplay(game);
    endRideTheBus(
      `You walked away with ${
        stage === 1 ? "your bet" : `x${multiplier}`
      } winnings!`
    );
  });

  setupStageHandlers(stage, multiplier, nextMultiplier);
}

function renderStageOptions(stage) {
  switch (stage) {
    case 1:
      return `<button data-choice="red">Red</button><button data-choice="black">Black</button>`;
    case 2:
      return `<button data-choice="higher">Higher</button><button data-choice="lower">Lower</button>`;
    case 3:
      return `<button data-choice="inbetween">In Between</button><button data-choice="outside">Outside</button>`;
    case 4:
      return suits
        .map((s) => `<button data-choice="${s}">${capitalize(s)}</button>`)
        .join("");
  }
}

function setupStageHandlers(stage, multiplier, nextMultiplier) {
  document
    .querySelectorAll(".ride-the-bus-options button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const choice = button.dataset.choice;
        const nextCard = drawCard();
        currentGame.rideTheBusCards.push(nextCard);

        const win = evaluateChoice(
          stage,
          choice,
          currentGame.rideTheBusCards[stage - 2],
          nextCard
        );

        if (win) {
          if (stage < 4) {
            renderRideTheBus(stage + 1, nextCard, nextMultiplier);
          } else {
            game.money += currentGame.bet * nextMultiplier;
            updateCasinoMoneyDisplay(game);
            endRideTheBus(`You won x${nextMultiplier} by guessing correctly!`);
          }
        } else {
          game.money -= currentGame.bet;
          updateCasinoMoneyDisplay(game);

          // Reveal the card before ending
          renderRideTheBus(stage + 1); // Will show the revealed card
          setTimeout(() => {
            endRideTheBus(`You lost!`);
          }, 1500); // Small delay to show the card
        }
      });
    });
}

function evaluateChoice(stage, choice, currentCard, nextCard) {
  //Plan to remove currentCard it is useless.
  currentCard = currentGame.rideTheBusCards[stage - 2];
  switch (stage) {
    case 1:
      return (
        (choice === "red" &&
          (nextCard.suit === "hearts" || nextCard.suit === "diamonds")) ||
        (choice === "black" &&
          (nextCard.suit === "clubs" || nextCard.suit === "spades"))
      );
    case 2:
      return (
        (choice === "higher" &&
          nextCard.value > currentGame.rideTheBusCards[0].value) ||
        (choice === "lower" &&
          nextCard.value < currentGame.rideTheBusCards[0].value)
      );
    case 3:
      const values = [
        currentGame.rideTheBusCards[0].value,
        currentGame.rideTheBusCards[1].value,
      ];
      return (
        (choice === "inbetween" &&
          nextCard.value > Math.min(...values) &&
          nextCard.value < Math.max(...values)) ||
        (choice === "outside" &&
          (nextCard.value < Math.min(...values) ||
            nextCard.value > Math.max(...values)))
      );

    case 4:
      return choice === nextCard.suit;
  }
  return false;
}

function endRideTheBus(message) {
  gameSection.innerHTML = `
     <h2>Ride the Bus</h2>
     <p>${message}</p>
     <p>New Balance: ${
       game.isReadableNumbersOn
         ? readableNumber(game.money)
         : game.money.toFixed(0)
     }</p>
     <button id="return-button">Return to Game Selection</button>
  `;

  document.getElementById("return-button").addEventListener("click", () => {
    mainContainer.style.transform = "translate(100%, 0)";
  });
}

export function initializeCasino(gameParam, mainContainerEl) {
  game = gameParam;
  mainContainer = mainContainerEl;
  updateCasinoMoneyDisplay(game);

  betSlider.addEventListener("input", () => {
    betInput.value = betSlider.value;
    betAmountDisplay.textContent = game.isReadableNumbersOn
      ? readableNumber(betSlider.value)
      : Number(betSlider.value).toFixed(0);
  });
  betInput.addEventListener("input", () => {
    let value = Math.max(1, parseInt(betInput.value) || 1);
    betSlider.value = value;
    betAmountDisplay.textContent = game.isReadableNumbersOn
      ? readableNumber(value)
      : value.toFixed(0);
  });

  // Game selection via sticky notes
  gameNotes.forEach((note) => {
    note.addEventListener("click", () => {
      gameNotes.forEach((n) => n.classList.remove("active"));
      note.classList.add("active");
      selectedGame = note.dataset.game;
    });
  });

  playButton.addEventListener("click", () => {
    const bet = parseInt(betSlider.value);

    if (bet <= 0 || bet > game.money) {
      gameResultDiv.textContent = "Invalid bet.";
      return;
    }

    gameResultDiv.textContent = "";

    // Reset theme classes
    gameSection.classList.remove(
      "blackjack-theme",
      "roulette-theme",
      "slots-theme",
      "ride-the-bus-theme"
    );

    // Apply new theme
    if (selectedGame === "blackjack") {
      gameSection.classList.add("blackjack-theme");
    } else if (selectedGame === "roulette") {
      gameSection.classList.add("roulette-theme");
    } else if (selectedGame === "slots") {
      gameSection.classList.add("slots-theme");
    } else if (selectedGame === "ride-the-bus") {
      gameSection.classList.add("ride-the-bus-theme");
    }

    mainContainer.style.transform = "translate(100%, 100vh)";

    if (selectedGame === "blackjack") {
      currentGame = {
        playerCards: [drawCard(), drawCard()],
        dealerCards: [drawCard()],
        bet,
      };
      renderBlackjackGame();
    } else if (selectedGame === "ride-the-bus") {
      currentGame = { bet, rideTheBusCards: [] }; // Initialize with one card
      renderRideTheBus(1, currentGame.rideTheBusCards[0]); // Start at stage 1 with the first card
    } else if (selectedGame === "slots") {
      gameSection.classList.add("slots-theme");
      renderSlotMachine(
        bet,
        updateCasinoMoneyDisplay,
        () => {
          mainContainer.style.transform = "translate(100%, 0)";
        },
        (amount) => {
          game.money += amount;
        }
      );
    } else if (selectedGame === "roulette") {
      gameSection.classList.add("roulette-theme");
      renderRoulette(
        bet,
        updateCasinoMoneyDisplay,
        () => {
          mainContainer.style.transform = "translate(100%, 0)";
        },
        (amount) => {
          game.money += amount;
        }
      );
    } else {
      const result = Math.random() < 0.5 ? "win" : "lose";
      game.money = result === "win" ? game.money + bet : game.money - bet;
      updateCasinoMoneyDisplay(game);

      gameSection.innerHTML = `
        <h2>${selectedGame.replace(/-/g, " ")}</h2>
        <p>You placed a ${
          game.isReadableNumbersOn ? readableNumber(bet) : bet.toFixed(0)
        } note bet. You ${result}!</p>
        <p>New Balance: ${
          game.isReadableNumbersOn
            ? readableNumber(game.money)
            : game.money.toFixed(0)
        } notes</p>
        <button id="return-button">Return to Game Selection</button>
      `;

      setTimeout(() => {
        document
          .getElementById("return-button")
          .addEventListener("click", () => {
            mainContainer.style.transform = "translate(100%, 0)";
          });

        if (result === "lose") {
          setTimeout(() => {
            mainContainer.style.transform = "translate(100%, 0)";
          }, 2000);
        }
      }, 100);
    }
  });
}
