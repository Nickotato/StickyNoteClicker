export {readableNumber, getCost, getTotalCost, getCardSrc, capitalize, getRandomStickyNoteColor, spawnFloatingNote, spawnFloatingNumber}

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

 function readableNumber(number) {
  if (number < 1000) {
    return number.toFixed(0);
  }

  const suffixes = [
    "",
    "k",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
    "Ud",
    "Dd",
    "Td",
    "Qad",
    "Qid",
    "Sxd",
    "Spd",
    "Ocd",
    "Nod",
    "Vg",
    "Uvg",
    "Dvg",
    "Tvg",
    "Qavg",
    "Qivg",
    "Sxvg",
    "Spvg",
    "Ocvg",
    "Novg",
    "Tg",
    "Utg",
    "Dtg",
    "Ttg",
    "Qatg",
    "Qitg",
    "Sxtg",
    "Sptg",
    "Octg",
    "Notg",
    "Qag",
    "Qig",
    "Sxg",
    "Spg",
    "Ocg",
    "Nog",
    "Ct", // Centillion
  ];

  let index = 0;

  while (number >= 1000 && index < suffixes.length - 1) {
    number /= 1000;
    index++;
  }

  if (index < suffixes.length) {
    return number.toFixed(2) + suffixes[index];
  }

  // Fallback for extremely large numbers with base shown
  const exponent = Math.floor(Math.log10(number));
  const base = number / Math.pow(10, exponent);
  return base.toFixed(2) + "e" + exponent;
}

function getCost(baseCost, growthRate, amountOwned) {
  Math.floor(baseCost * Math.pow(growthRate, amountOwned));
}

 function getTotalCost(cost, growthRate, amount) {
  if (1 === growthRate) {
    // if (amount > 1) return "cannot buy more than 1"
    return cost;
  }
  return cost * ((1 - Math.pow(growthRate, amount)) / (1 - growthRate));
  // default.baseCost * growthMultiplier^amount.owned;
}

 function getCardSrc(cardName) {
  switch (cardName) {
    // Hearts
    case "2_of_hearts":
      return require("url:./images/casino/blackjack/2_of_hearts.png");
    case "3_of_hearts":
      return require("url:./images/casino/blackjack/3_of_hearts.png");
    case "4_of_hearts":
      return require("url:./images/casino/blackjack/4_of_hearts.png");
    case "5_of_hearts":
      return require("url:./images/casino/blackjack/5_of_hearts.png");
    case "6_of_hearts":
      return require("url:./images/casino/blackjack/6_of_hearts.png");
    case "7_of_hearts":
      return require("url:./images/casino/blackjack/7_of_hearts.png");
    case "8_of_hearts":
      return require("url:./images/casino/blackjack/8_of_hearts.png");
    case "9_of_hearts":
      return require("url:./images/casino/blackjack/9_of_hearts.png");
    case "10_of_hearts": {
      const options = [
        require("url:./images/casino/blackjack/10_of_hearts.png"),
        require("url:./images/casino/blackjack/jack_of_hearts.png"),
        require("url:./images/casino/blackjack/queen_of_hearts.png"),
        require("url:./images/casino/blackjack/king_of_hearts.png"),
      ];
      return options[Math.floor(Math.random() * options.length)];
    }
    case "jack_of_hearts":
      return require("url:./images/casino/blackjack/jack_of_hearts.png");
    case "queen_of_hearts":
      return require("url:./images/casino/blackjack/queen_of_hearts.png");
    case "king_of_hearts":
      return require("url:./images/casino/blackjack/king_of_hearts.png");
    case "ace_of_hearts":
      return require("url:./images/casino/blackjack/ace_of_hearts.png");

    // Spades
    case "2_of_spades":
      return require("url:./images/casino/blackjack/2_of_spades.png");
    case "3_of_spades":
      return require("url:./images/casino/blackjack/3_of_spades.png");
    case "4_of_spades":
      return require("url:./images/casino/blackjack/4_of_spades.png");
    case "5_of_spades":
      return require("url:./images/casino/blackjack/5_of_spades.png");
    case "6_of_spades":
      return require("url:./images/casino/blackjack/6_of_spades.png");
    case "7_of_spades":
      return require("url:./images/casino/blackjack/7_of_spades.png");
    case "8_of_spades":
      return require("url:./images/casino/blackjack/8_of_spades.png");
    case "9_of_spades":
      return require("url:./images/casino/blackjack/9_of_spades.png");
    case "10_of_spades": {
      const options = [
        require("url:./images/casino/blackjack/10_of_spades.png"),
        require("url:./images/casino/blackjack/jack_of_spades.png"),
        require("url:./images/casino/blackjack/queen_of_spades.png"),
        require("url:./images/casino/blackjack/king_of_spades.png"),
      ];
      return options[Math.floor(Math.random() * options.length)];
    }
    case "jack_of_spades":
      return require("url:./images/casino/blackjack/jack_of_spades.png");
    case "queen_of_spades":
      return require("url:./images/casino/blackjack/queen_of_spades.png");
    case "king_of_spades":
      return require("url:./images/casino/blackjack/king_of_spades.png");
    case "ace_of_spades":
      return require("url:./images/casino/blackjack/ace_of_spades.png");

    // Clubs
    case "2_of_clubs":
      return require("url:./images/casino/blackjack/2_of_clubs.png");
    case "3_of_clubs":
      return require("url:./images/casino/blackjack/3_of_clubs.png");
    case "4_of_clubs":
      return require("url:./images/casino/blackjack/4_of_clubs.png");
    case "5_of_clubs":
      return require("url:./images/casino/blackjack/5_of_clubs.png");
    case "6_of_clubs":
      return require("url:./images/casino/blackjack/6_of_clubs.png");
    case "7_of_clubs":
      return require("url:./images/casino/blackjack/7_of_clubs.png");
    case "8_of_clubs":
      return require("url:./images/casino/blackjack/8_of_clubs.png");
    case "9_of_clubs":
      return require("url:./images/casino/blackjack/9_of_clubs.png");
    case "10_of_clubs": {
      const options = [
        require("url:./images/casino/blackjack/10_of_clubs.png"),
        require("url:./images/casino/blackjack/jack_of_clubs.png"),
        require("url:./images/casino/blackjack/queen_of_clubs.png"),
        require("url:./images/casino/blackjack/king_of_clubs.png"),
      ];
      return options[Math.floor(Math.random() * options.length)];
    }
    case "jack_of_clubs":
      return require("url:./images/casino/blackjack/jack_of_clubs.png");
    case "queen_of_clubs":
      return require("url:./images/casino/blackjack/queen_of_clubs.png");
    case "king_of_clubs":
      return require("url:./images/casino/blackjack/king_of_clubs.png");
    case "ace_of_clubs":
      return require("url:./images/casino/blackjack/ace_of_clubs.png");

    // Diamonds
    case "2_of_diamonds":
      return require("url:./images/casino/blackjack/2_of_diamonds.png");
    case "3_of_diamonds":
      return require("url:./images/casino/blackjack/3_of_diamonds.png");
    case "4_of_diamonds":
      return require("url:./images/casino/blackjack/4_of_diamonds.png");
    case "5_of_diamonds":
      return require("url:./images/casino/blackjack/5_of_diamonds.png");
    case "6_of_diamonds":
      return require("url:./images/casino/blackjack/6_of_diamonds.png");
    case "7_of_diamonds":
      return require("url:./images/casino/blackjack/7_of_diamonds.png");
    case "8_of_diamonds":
      return require("url:./images/casino/blackjack/8_of_diamonds.png");
    case "9_of_diamonds":
      return require("url:./images/casino/blackjack/9_of_diamonds.png");
    case "10_of_diamonds": {
      const options = [
        require("url:./images/casino/blackjack/10_of_diamonds.png"),
        require("url:./images/casino/blackjack/jack_of_diamonds.png"),
        require("url:./images/casino/blackjack/queen_of_diamonds.png"),
        require("url:./images/casino/blackjack/king_of_diamonds.png"),
      ];
      return options[Math.floor(Math.random() * options.length)];
    }
    case "jack_of_diamonds":
      return require("url:./images/casino/blackjack/jack_of_diamonds.png");
    case "queen_of_diamonds":
      return require("url:./images/casino/blackjack/queen_of_diamonds.png");
    case "king_of_diamonds":
      return require("url:./images/casino/blackjack/king_of_diamonds.png");
    case "ace_of_diamonds":
      return require("url:./images/casino/blackjack/ace_of_diamonds.png");

    // Fallback
    default:
      return require("url:./images/casino/blackjack/back.png");
  }
}

 function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

 function getRandomStickyNoteColor() {
  const rand = Math.random();
  let cumulative = 0;
  for (let entry of stickyNoteColorChances) {
    cumulative += entry.chance;
    if (rand < cumulative) return entry.color;
  }
  return stickyNoteColorChances[stickyNoteColorChances.length - 1].color;
}

 function spawnFloatingNote(x, y) {
  const note = document.createElement("div");
  note.className = "floating-note";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  note.style.backgroundColor = getRandomStickyNoteColor();

  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1200);
}

 function spawnFloatingNumber(x, y, amount, game) {
  const number = document.createElement("div");
  number.className = "floating-number";
  number.style.left = `${x}px`;
  number.style.top = `${y}px`;
  number.textContent = `+${
    game.isReadableNumbersOn ? readableNumber(amount) : amount.toFixed(0)
  }`;

  document.body.appendChild(number);
  setTimeout(() => number.remove(), 800);
}
