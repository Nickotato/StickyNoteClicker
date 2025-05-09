const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");

const box = 10;
const rows = canvas.height / box;
const cols = canvas.width / box;
console.log(rows, cols);

let snake, direction, food, game;

startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  gameContainer.style.display = "block";
  startGame();
});

function startGame() {
  snake = [{ x: 5 * box, y: 5 * box }];
  direction = "RIGHT";
  food = {
    x: Math.floor(Math.random() * cols) * box,
    y: Math.floor(Math.random() * rows) * box,
  };

  document.addEventListener("keydown", changeDirection);
  game = setInterval(draw, 150);
}

function changeDirection(event) {
  const key = event.key;
  if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
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

  // Move snake
  let head = { ...snake[0] };
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
    alert("Game Over!");
    menu.style.display = "block";
    gameContainer.style.display = "none";
    return;
  }

  snake.unshift(head);

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    food = {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
  } else {
    snake.pop();
  }
}
