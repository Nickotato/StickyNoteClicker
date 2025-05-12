const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.createElement("div"); // Create score display
scoreDisplay.id = "score";
scoreDisplay.style.fontSize = "20px";
scoreDisplay.style.marginTop = "10px";
scoreDisplay.style.color = "#0f0";
gameContainer.appendChild(scoreDisplay);

// Set canvas size to be a multiple of box
const box = 17;
const gridSize = 15;
canvas.width = box * gridSize;
canvas.height = box * gridSize;

const rows = canvas.height / box;
const cols = canvas.width / box;

let snake, direction, nextDirection, food, game, score;

startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  gameContainer.style.display = "block";
  startGame();
});

function startGame() {
  snake = [{ x: 5 * box, y: 5 * box }];
  direction = null; // start still
  nextDirection = null;
  score = 0;
  updateScore();
  food = generateFood();

  document.removeEventListener("keydown", changeDirection);
  document.addEventListener("keydown", changeDirection);

  clearInterval(game);
  game = setInterval(draw, 150);
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;

  window.parent.postMessage(
    { type: "scoreUpdate", score: score },
    "*" // Use a specific origin in production for security
  );
}

function changeDirection(event) {
  const key = event.key.toLowerCase();
  if ((key === "arrowleft" || key === "a") && direction !== "RIGHT")
    nextDirection = "LEFT";
  else if ((key === "arrowup" || key === "w") && direction !== "DOWN")
    nextDirection = "UP";
  else if ((key === "arrowright" || key === "d") && direction !== "LEFT")
    nextDirection = "RIGHT";
  else if ((key === "arrowdown" || key === "s") && direction !== "UP")
    nextDirection = "DOWN";

  // Set initial direction if it's the first move
  if (!direction && nextDirection) {
    direction = nextDirection;
  }
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
  } while (snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let s of snake) {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(s.x, s.y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  if (!direction) return; // stand still until player moves

  // Move snake
  let head = { ...snake[0] };
  direction = nextDirection || direction;
  if (direction === "LEFT") head.x -= box;
  else if (direction === "RIGHT") head.x += box;
  else if (direction === "UP") head.y -= box;
  else if (direction === "DOWN") head.y += box;

  // Collision detection
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake.some((seg) => seg.x === head.x && seg.y === head.y)
  ) {
    clearInterval(game);
    alert("Game Over! Final Score: " + score);
    menu.style.display = "block";
    gameContainer.style.display = "none";
    return;
  }

  snake.unshift(head);

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = generateFood();
  } else {
    snake.pop();
  }
}
