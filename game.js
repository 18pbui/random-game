const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const xGraphCanvas = document.getElementById('xGraphCanvas');
const xGraphCtx = xGraphCanvas.getContext('2d');
const yGraphCanvas = document.getElementById('yGraphCanvas');
const yGraphCtx = yGraphCanvas.getContext('2d');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const cursorImage = document.getElementById('cursorImage');

let x = canvas.width / 2;
let y = canvas.height / 2;
let trail = [];
let keys = {};
let velocityX = 0;
let velocityY = 0;
let gameStarted = false;
let timerStarted = false;
let timer = 0;
let timerInterval;
let gameInterval;
const acceleration = 0.2; // Fixed acceleration value
const maxSpeed = 5; // Reduced max speed for smoother movement
const friction = 0.95;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the trail as a continuous line
    if (trail.length > 0) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.stroke();
    }

    // Draw the custom cursor image
    ctx.drawImage(cursorImage, x - cursorImage.width / 2, y - cursorImage.height / 2);

    // Display the timer
    ctx.font = '20px Arial';
    ctx.fillText(`Time: ${timer}s`, 10, 20);

    // Draw the x coordinate graph
    xGraphCtx.clearRect(0, 0, xGraphCanvas.width, xGraphCanvas.height);
    xGraphCtx.beginPath();
    xGraphCtx.strokeStyle = 'red'; // Set color to red for x graph
    xGraphCtx.moveTo(0, xGraphCanvas.height / 2);
    for (let i = 0; i < trail.length; i++) {
        const time = i;
        const coordX = trail[i].x;
        xGraphCtx.lineTo(time, xGraphCanvas.height - coordX / canvas.width * xGraphCanvas.height);
    }
    xGraphCtx.stroke();

    // Add label to x coordinate graph
    xGraphCtx.fillStyle = 'black';
    xGraphCtx.font = '16px Arial';
    xGraphCtx.fillText('X Coordinate', 10, 20);

    // Draw the y coordinate graph
    yGraphCtx.clearRect(0, 0, yGraphCanvas.width, yGraphCanvas.height);
    yGraphCtx.beginPath();
    yGraphCtx.strokeStyle = 'blue'; // Set color to blue for y graph
    yGraphCtx.moveTo(0, yGraphCanvas.height / 2);
    for (let i = 0; i < trail.length; i++) {
        const time = i;
        const coordY = trail[i].y;
        yGraphCtx.lineTo(time, yGraphCanvas.height - coordY / canvas.height * yGraphCanvas.height);
    }
    yGraphCtx.stroke();

    // Add label to y coordinate graph
    yGraphCtx.fillStyle = 'black';
    yGraphCtx.font = '16px Arial';
    yGraphCtx.fillText('Y Coordinate', 10, 20);
}

function updatePosition() {
    if (!gameStarted) return;

    if (keys['ArrowUp']) velocityY = Math.max(-maxSpeed, velocityY - acceleration);
    if (keys['ArrowDown']) velocityY = Math.min(maxSpeed, velocityY + acceleration);
    if (keys['ArrowLeft']) velocityX = Math.max(-maxSpeed, velocityX - acceleration);
    if (keys['ArrowRight']) velocityX = Math.min(maxSpeed, velocityX + acceleration);
    if (keys['w']) velocityY = Math.max(-maxSpeed, velocityY - acceleration);
    if (keys['s']) velocityY = Math.min(maxSpeed, velocityY + acceleration);
    if (keys['a']) velocityX = Math.max(-maxSpeed, velocityX - acceleration);
    if (keys['d']) velocityX = Math.min(maxSpeed, velocityX + acceleration);

    velocityX *= friction;
    velocityY *= friction;

    x = Math.max(0, Math.min(canvas.width, x + velocityX));
    y = Math.max(0, Math.min(canvas.height, y + velocityY));

    trail.push({ x: x, y: y });
    draw();

    if (!timerStarted && (velocityX !== 0 || velocityY !== 0)) {
        startTimer();
    }
}

function keyDownHandler(event) {
    keys[event.key] = true;
    updatePosition();
}

function keyUpHandler(event) {
    keys[event.key] = false;
}

function touchStartHandler(event) {
    event.preventDefault();
    keys['touch'] = true;
    updateTouchPosition(event.touches[0]);
}

function touchMoveHandler(event) {
    event.preventDefault();
    updateTouchPosition(event.touches[0]);
}

function touchEndHandler(event) {
    event.preventDefault();
    keys['touch'] = false;
}

function updateTouchPosition(touch) {
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    const diffX = touchX - x;
    const diffY = touchY - y;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    if (dist > 0) {
        velocityX = (diffX / dist) * maxSpeed;
        velocityY = (diffY / dist) * maxSpeed;
    }

    if (!timerStarted && (velocityX !== 0 || velocityY !== 0)) {
        startTimer();
    }
}

function startTimer() {
    timerStarted = true;
    timerInterval = setInterval(() => {
        timer++;
        draw();
    }, 1000);
}

function resetGame() {
    x = canvas.width / 2;
    y = canvas.height / 2;
    trail = [];
    velocityX = 0;
    velocityY = 0;
    gameStarted = false;
    timerStarted = false;
    timer = 0;
    clearInterval(timerInterval);
    clearInterval(gameInterval); // Clear the game loop interval
    startButton.disabled = false;
    draw();
}

function startGame() {
    gameStarted = true;
    startButton.disabled = true; // Disable the start button after starting the game
    gameInterval = setInterval(updatePosition, 20); // Start the game loop interval
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);
canvas.addEventListener('touchend', touchEndHandler);

draw();
