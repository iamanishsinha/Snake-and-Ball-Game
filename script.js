/* ===============================
   CLASSIC SNAKE – FIXED JS
   =============================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");

/* -------- GRID SETTINGS -------- */
const CELL_SIZE = 16           // smaller squares
const GRID_SIZE = canvas.width / CELL_SIZE; // 480 / 16 = 30

/* -------- GAME STATE -------- */
let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let food = {};
let score = 0;

let highScore = localStorage.getItem("snakeHigh") || 0;
highScoreEl.textContent = highScore;

/* -------- SPEED (SLOW & CLASSIC) -------- */
let speed = 5;     //  start
let lastTime = 0;
let accumulator = 0;

let running = false;
let paused = false;

/* -------- INIT GAME -------- */
function initGame() {
    snake = [
        { x: 15, y: 15 },
        { x: 14, y: 15 },
        { x: 13, y: 15 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    speed = 4;

    scoreEl.textContent = score;
    food = spawnFood();

    overlay.style.display = "none";
    running = true;
    paused = false;

    lastTime = performance.now();
    accumulator = 0;

    requestAnimationFrame(gameLoop);
}

/* -------- FOOD -------- */
function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

/* -------- GAME LOOP -------- */
function gameLoop(time) {
    if (!running) return;

    const delta = (time - lastTime) / 1000;
    lastTime = time;
    accumulator += delta;

    const step = 1 / speed;

    while (accumulator >= step) {
        update();
        accumulator -= step;
    }

    draw(accumulator / step);
    requestAnimationFrame(gameLoop);
}

/* -------- UPDATE -------- */
function update() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;

    // wall collision
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= GRID_SIZE || head.y >= GRID_SIZE
    ) {
        return gameOver();
    }

    // self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        food = spawnFood();

        // very gentle speed increase
        if (score % 6 === 0) {
            speed += 3;
        }
    } else {
        snake.pop();
    }
}

/* -------- DRAW -------- */
function draw(alpha) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* food */
    ctx.fillStyle = "#dc860ed6";
    ctx.fillRect(
        food.x * CELL_SIZE,
        food.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
    );

    /* snake */
    for (let i = snake.length - 1; i >= 0; i--) {
        let x = snake[i].x;
        let y = snake[i].y;

        // smooth head interpolation
        if (i === 0 && snake.length > 1) {
            const prev = snake[1];
            x += (snake[0].x - prev.x) * alpha;
            y += (snake[0].y - prev.y) * alpha;
        }

        ctx.fillStyle = i === 0 ? "#789115f6" : "#cac411f4";
        ctx.fillRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    }
}

/* -------- GAME OVER -------- */
function gameOver() {
    running = false;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHigh", highScore);
        highScoreEl.textContent = highScore;
    }

    overlayText.textContent = "GAME OVER\nPRESS ENTER";
    overlay.style.display = "flex";
}

/* -------- INPUT (KEYBOARD ONLY) -------- */
document.addEventListener("keydown", e => {

    if (e.key === "Enter" && !running) {
        initGame();
        return;
    }

    if (!running) return;

    if (e.key === " ") {
        paused = !paused;

        if (paused) {
            running = false;
            overlayText.textContent = "PAUSED";
            overlay.style.display = "flex";
        } else {
            overlay.style.display = "none";
            running = true;
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    if (paused) return;

    if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
});

/* -------- START SCREEN -------- */
overlay.style.display = "flex";
overlayText.textContent = "PRESS ENTER TO START";
