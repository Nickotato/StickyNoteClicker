export function readableNumber(number) {
    if (number < 1000) {
        return number.toFixed(0);
    }

    const suffixes = [
        "", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
        "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod",
        "Vg", "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg",
        "Tg", "Utg", "Dtg", "Ttg", "Qatg", "Qitg", "Sxtg", "Sptg", "Octg", "Notg",
        "Qag", "Qig", "Sxg", "Spg", "Ocg", "Nog", "Ct" // Centillion
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




export function getTotalCost(baseCost, growthRate, amount) {
    if (1 === growthRate) {
        // if (amount > 1) return "cannot buy more than 1"
        return baseCost
    };
    return baseCost * ((1 - Math.pow(growthRate, amount)) / (1 - growthRate));
  }

  export function getCardSrc(cardName) {
    switch (cardName) {
      // Hearts
      case '2_of_hearts': return require('url:./images/casino/blackjack/2_of_hearts.png');
      case '3_of_hearts': return require('url:./images/casino/blackjack/3_of_hearts.png');
      case '4_of_hearts': return require('url:./images/casino/blackjack/4_of_hearts.png');
      case '5_of_hearts': return require('url:./images/casino/blackjack/5_of_hearts.png');
      case '6_of_hearts': return require('url:./images/casino/blackjack/6_of_hearts.png');
      case '7_of_hearts': return require('url:./images/casino/blackjack/7_of_hearts.png');
      case '8_of_hearts': return require('url:./images/casino/blackjack/8_of_hearts.png');
      case '9_of_hearts': return require('url:./images/casino/blackjack/9_of_hearts.png');
      case '10_of_hearts': {
        const options = [
          require('url:./images/casino/blackjack/10_of_hearts.png'),
          require('url:./images/casino/blackjack/jack_of_hearts.png'),
          require('url:./images/casino/blackjack/queen_of_hearts.png'),
          require('url:./images/casino/blackjack/king_of_hearts.png')
        ];
        return options[Math.floor(Math.random() * options.length)];
      }
      case 'jack_of_hearts': return require('url:./images/casino/blackjack/jack_of_hearts.png');
      case 'queen_of_hearts': return require('url:./images/casino/blackjack/queen_of_hearts.png');
      case 'king_of_hearts': return require('url:./images/casino/blackjack/king_of_hearts.png');
      case 'ace_of_hearts': return require('url:./images/casino/blackjack/ace_of_hearts.png');
  
      // Spades
      case '2_of_spades': return require('url:./images/casino/blackjack/2_of_spades.png');
      case '3_of_spades': return require('url:./images/casino/blackjack/3_of_spades.png');
      case '4_of_spades': return require('url:./images/casino/blackjack/4_of_spades.png');
      case '5_of_spades': return require('url:./images/casino/blackjack/5_of_spades.png');
      case '6_of_spades': return require('url:./images/casino/blackjack/6_of_spades.png');
      case '7_of_spades': return require('url:./images/casino/blackjack/7_of_spades.png');
      case '8_of_spades': return require('url:./images/casino/blackjack/8_of_spades.png');
      case '9_of_spades': return require('url:./images/casino/blackjack/9_of_spades.png');
      case '10_of_spades': {
        const options = [
          require('url:./images/casino/blackjack/10_of_spades.png'),
          require('url:./images/casino/blackjack/jack_of_spades.png'),
          require('url:./images/casino/blackjack/queen_of_spades.png'),
          require('url:./images/casino/blackjack/king_of_spades.png')
        ];
        return options[Math.floor(Math.random() * options.length)];
      }
      case 'jack_of_spades': return require('url:./images/casino/blackjack/jack_of_spades.png');
      case 'queen_of_spades': return require('url:./images/casino/blackjack/queen_of_spades.png');
      case 'king_of_spades': return require('url:./images/casino/blackjack/king_of_spades.png');
      case 'ace_of_spades': return require('url:./images/casino/blackjack/ace_of_spades.png');
  
      // Clubs
      case '2_of_clubs': return require('url:./images/casino/blackjack/2_of_clubs.png');
      case '3_of_clubs': return require('url:./images/casino/blackjack/3_of_clubs.png');
      case '4_of_clubs': return require('url:./images/casino/blackjack/4_of_clubs.png');
      case '5_of_clubs': return require('url:./images/casino/blackjack/5_of_clubs.png');
      case '6_of_clubs': return require('url:./images/casino/blackjack/6_of_clubs.png');
      case '7_of_clubs': return require('url:./images/casino/blackjack/7_of_clubs.png');
      case '8_of_clubs': return require('url:./images/casino/blackjack/8_of_clubs.png');
      case '9_of_clubs': return require('url:./images/casino/blackjack/9_of_clubs.png');
      case '10_of_clubs': {
        const options = [
          require('url:./images/casino/blackjack/10_of_clubs.png'),
          require('url:./images/casino/blackjack/jack_of_clubs.png'),
          require('url:./images/casino/blackjack/queen_of_clubs.png'),
          require('url:./images/casino/blackjack/king_of_clubs.png')
        ];
        return options[Math.floor(Math.random() * options.length)];
      }
      case 'jack_of_clubs': return require('url:./images/casino/blackjack/jack_of_clubs.png');
      case 'queen_of_clubs': return require('url:./images/casino/blackjack/queen_of_clubs.png');
      case 'king_of_clubs': return require('url:./images/casino/blackjack/king_of_clubs.png');
      case 'ace_of_clubs': return require('url:./images/casino/blackjack/ace_of_clubs.png');
  
      // Diamonds
      case '2_of_diamonds': return require('url:./images/casino/blackjack/2_of_diamonds.png');
      case '3_of_diamonds': return require('url:./images/casino/blackjack/3_of_diamonds.png');
      case '4_of_diamonds': return require('url:./images/casino/blackjack/4_of_diamonds.png');
      case '5_of_diamonds': return require('url:./images/casino/blackjack/5_of_diamonds.png');
      case '6_of_diamonds': return require('url:./images/casino/blackjack/6_of_diamonds.png');
      case '7_of_diamonds': return require('url:./images/casino/blackjack/7_of_diamonds.png');
      case '8_of_diamonds': return require('url:./images/casino/blackjack/8_of_diamonds.png');
      case '9_of_diamonds': return require('url:./images/casino/blackjack/9_of_diamonds.png');
      case '10_of_diamonds': {
        const options = [
          require('url:./images/casino/blackjack/10_of_diamonds.png'),
          require('url:./images/casino/blackjack/jack_of_diamonds.png'),
          require('url:./images/casino/blackjack/queen_of_diamonds.png'),
          require('url:./images/casino/blackjack/king_of_diamonds.png')
        ];
        return options[Math.floor(Math.random() * options.length)];
      }
      case 'jack_of_diamonds': return require('url:./images/casino/blackjack/jack_of_diamonds.png');
      case 'queen_of_diamonds': return require('url:./images/casino/blackjack/queen_of_diamonds.png');
      case 'king_of_diamonds': return require('url:./images/casino/blackjack/king_of_diamonds.png');
      case 'ace_of_diamonds': return require('url:./images/casino/blackjack/ace_of_diamonds.png');
  
      // Fallback
      default:
        return require('url:./images/casino/blackjack/back.png');
    }
  }

  export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }