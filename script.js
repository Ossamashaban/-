// Game variables
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game constants
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;

// Game state
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Player paddle
const player = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED
};

// Computer paddle
const computer = {
    x: canvas.width - PADDLE_WIDTH - 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED * 0.8
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
    radius: BALL_SIZE,
    speed: INITIAL_BALL_SPEED
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Space to start/pause
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement tracking
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawPaddle(paddle) {
    // Main paddle
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Glow effect
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(paddle.x - 2, paddle.y - 2, paddle.width + 4, paddle.height + 4);
}

function drawBall() {
    // Main ball
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore, canvas.width / 4, 60);
    ctx.fillText(computerScore, (canvas.width * 3) / 4, 60);
}

// Update functions
function updatePlayerPaddle() {
    // Arrow keys or mouse
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // Mouse movement
    const mouseTarget = mouseY - player.height / 2;
    if (Math.abs(mouseTarget - player.y) > 5) {
        player.y += (mouseTarget - player.y) * 0.1;
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
}

function updateComputerPaddle() {
    // AI that follows the ball
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // Slight delay to make it less unbeatable
    const targetY = ballCenter - computer.height / 2;
    
    if (computerCenter < ballCenter - 20) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + 20) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Paddle collision - Player
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.3, 10);
        ball.dx = Math.abs(ball.dx) * (ball.speed / INITIAL_BALL_SPEED);
    }
    
    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.3, 10);
        ball.dx = -Math.abs(ball.dx) * (ball.speed / INITIAL_BALL_SPEED);
    }
    
    // Scoring - Player scores
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
    
    // Scoring - Computer scores
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenter();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawScore();
    
    // Update game state if running
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
