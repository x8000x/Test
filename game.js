// Game State
const gameState = {
    playerX: 0,
    playerY: 0,
    direction: 'down',
    lastDirection: 'down',
    isMoving: false,
    currentState: 'idle-down', // Animation state machine
    speed: 2,
    maxSpeed: 8,
    friction: 0.85,
    velocityX: 0,
    velocityY: 0
};

// Animation State Machine
const animationStates = {
    'walk-down': 'walk-down',
    'walk-up': 'walk-up',
    'walk-left': 'walk-left',
    'walk-right': 'walk-right',
    'idle-down': 'idle-down',
    'idle-up': 'idle-up',
    'idle-left': 'idle-left',
    'idle-right': 'idle-right'
};

// Transition to new animation state
function transitionToState(newState) {
    if (gameState.currentState !== newState) {
        gameState.currentState = newState;
        applyAnimationState(newState);
    }
}

// Apply animation state to player
function applyAnimationState(state) {
    // Remove all animation classes
    player.classList.remove(
        'walk-down', 'walk-up', 'walk-left', 'walk-right',
        'idle-down', 'idle-up', 'idle-left', 'idle-right'
    );
    
    // Add new state class
    player.classList.add(state);
    
    // Handle flip for left direction
    if (state.includes('left')) {
        player.classList.add('flipped');
    } else {
        player.classList.remove('flipped');
    }
}

// DOM Elements
const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const joystickContainer = document.getElementById('joystickContainer');
const joystickKnob = document.getElementById('joystickKnob');
const statsDiv = document.getElementById('stats');

// Joystick State
let joystickActive = false;
let joystickX = 0;
let joystickY = 0;
let joystickRadius = 40;
let joystickCenterX = 0;
let joystickCenterY = 0;

// Initialize player position to center
function initializeGame() {
    gameState.playerX = gameContainer.clientWidth / 2;
    gameState.playerY = gameContainer.clientHeight / 2;
    updatePlayerPosition();
    getJoystickCenter();
    transitionToState('idle-down');
}

// Get joystick center coordinates
function getJoystickCenter() {
    const rect = joystickContainer.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
}

// Update joystick knob visual position
function updateJoystickKnob() {
    const maxDistance = 40;
    const distance = Math.sqrt(joystickX ** 2 + joystickY ** 2);
    
    let constrainedX = joystickX;
    let constrainedY = joystickY;

    if (distance > maxDistance) {
        constrainedX = (joystickX / distance) * maxDistance;
        constrainedY = (joystickY / distance) * maxDistance;
    }

    // Explicitly constrain to center when values are near zero
    if (Math.abs(constrainedX) < 1) constrainedX = 0;
    if (Math.abs(constrainedY) < 1) constrainedY = 0;

    joystickKnob.style.transform = `translate(calc(-50% + ${constrainedX}px), calc(-50% + ${constrainedY}px))`;
}

// Calculate direction from joystick input
function calculateDirection() {
    if (joystickX === 0 && joystickY === 0) {
        gameState.isMoving = false;
        // Transition to idle state for last direction
        transitionToState(`idle-${gameState.lastDirection}`);
        return;
    }

    gameState.isMoving = true;

    const angle = Math.atan2(joystickY, joystickX);
    const degrees = (angle * 180) / Math.PI + 90;
    const normalizedDegrees = ((degrees % 360) + 360) % 360;

    // Determine direction based on angle and transition to walk state
    if (normalizedDegrees >= 45 && normalizedDegrees < 135) {
        gameState.direction = 'right';
        gameState.lastDirection = 'right';
        transitionToState('walk-right');
    } else if (normalizedDegrees >= 135 && normalizedDegrees < 225) {
        gameState.direction = 'down';
        gameState.lastDirection = 'down';
        transitionToState('walk-down');
    } else if (normalizedDegrees >= 225 && normalizedDegrees < 315) {
        gameState.direction = 'left';
        gameState.lastDirection = 'left';
        transitionToState('walk-left');
    } else {
        gameState.direction = 'up';
        gameState.lastDirection = 'up';
        transitionToState('walk-up');
    }
}

// Update player movement based on joystick
function updatePlayerMovement() {
    // Normalize movement vector for consistent speed in all directions
    const distance = Math.sqrt(joystickX ** 2 + joystickY ** 2);
    
    if (distance === 0) return;
    
    // Normalize to unit vector then multiply by speed
    const normalizedX = joystickX / distance;
    const normalizedY = joystickY / distance;
    
    const moveX = normalizedX * gameState.speed;
    const moveY = normalizedY * gameState.speed;

    gameState.playerX += moveX;
    gameState.playerY += moveY;

    // Boundary checking
    const padding = 25;
    gameState.playerX = Math.max(padding, Math.min(gameState.playerX, gameContainer.clientWidth - padding));
    gameState.playerY = Math.max(padding, Math.min(gameState.playerY, gameContainer.clientHeight - padding));

    updatePlayerPosition();
}

// Update player sprite position
function updatePlayerPosition() {
    player.style.left = gameState.playerX + 'px';
    player.style.top = gameState.playerY + 'px';
}

// Update UI stats
function updateStats() {
    document.getElementById('posX').textContent = Math.round(gameState.playerX);
    document.getElementById('posY').textContent = Math.round(gameState.playerY);
    document.getElementById('direction').textContent = gameState.direction.charAt(0).toUpperCase() + gameState.direction.slice(1);
    
    const distance = Math.sqrt(joystickX ** 2 + joystickY ** 2);
    const displaySpeed = Math.round((distance / 50) * gameState.speed);
    document.getElementById('speed').textContent = displaySpeed;
}

// Handle joystick input
function handleJoystickInput(event) {
    const clientX = event.clientX || event.pageX;
    const clientY = event.clientY || event.pageY;

    joystickX = clientX - joystickCenterX;
    joystickY = clientY - joystickCenterY;

    updateJoystickKnob();
    calculateDirection();
}

// Reset joystick
function resetJoystick() {
    joystickActive = false;
    joystickX = 0;
    joystickY = 0;
    joystickKnob.classList.remove('active');
    joystickKnob.style.transform = 'translate(calc(-50%), calc(-50%))';
    gameState.isMoving = false;
    transitionToState(`idle-${gameState.lastDirection}`);
}

// ==================== TOUCH EVENTS ====================
joystickContainer.addEventListener('touchstart', (e) => {
    joystickActive = true;
    joystickKnob.classList.add('active');
    joystickKnob.style.transition = 'none'; // Disable transition while dragging
    handleJoystickInput(e.touches[0]);
}, { passive: false });

joystickContainer.addEventListener('touchmove', (e) => {
    if (joystickActive) {
        e.preventDefault();
        handleJoystickInput(e.touches[0]);
    }
}, { passive: false });

joystickContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystickKnob.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Re-enable transition
    resetJoystick();
}, { passive: false });

joystickContainer.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    joystickKnob.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Re-enable transition
    resetJoystick();
}, { passive: false });

// ==================== MOUSE EVENTS ====================
joystickContainer.addEventListener('mousedown', (e) => {
    joystickActive = true;
    joystickKnob.classList.add('active');
    joystickKnob.style.transition = 'none'; // Disable transition while dragging
    handleJoystickInput(e);
});

// Use document-level mousemove and mouseup for proper tracking
document.addEventListener('mousemove', (e) => {
    if (joystickActive) {
        handleJoystickInput(e);
    }
});

document.addEventListener('mouseup', (e) => {
    if (joystickActive) {
        joystickKnob.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Re-enable transition
        resetJoystick();
    }
});

// Prevent default drag behavior
joystickContainer.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// ==================== KEYBOARD EVENTS ====================
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    joystickX = 0;
    joystickY = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) joystickY = -50;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) joystickY = 50;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) joystickX = -50;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) joystickX = 50;

    if (Object.values(keys).some(v => v)) {
        joystickActive = true;
        calculateDirection();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    if (!Object.values(keys).some(v => v)) {
        resetJoystick();
    }
});

// ==================== WINDOW EVENTS ====================
window.addEventListener('resize', () => {
    getJoystickCenter();
});

// ==================== GAME LOOP ====================
function gameLoop() {
    updatePlayerMovement();
    calculateDirection();
    updateStats();
    requestAnimationFrame(gameLoop);
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    initializeGame();
    getJoystickCenter();
    gameLoop();
});
