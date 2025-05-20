/**
 * Client for the 2D square eating game
 */

// Game configuration
const config = {
  canvasWidth: 1000,
  canvasHeight: 600
};

// Game state
let gameState = {
  players: [],
  foods: [],
  leaderboard: []
};

// Player information
let player = {
  id: null,
  name: '',
  value: 0,
  score: 0
};

// Key state tracking
const keyState = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Movement interval
let movementInterval = null;

// DOM elements
const elements = {
  loginScreen: document.getElementById('login-screen'),
  gameScreen: document.getElementById('game-screen'),
  playerNameInput: document.getElementById('player-name'),
  startGameButton: document.getElementById('start-game'),
  canvas: document.getElementById('game-canvas'),
  playerValue: document.getElementById('player-value'),
  playerScore: document.getElementById('player-score'),
  leaderboardEntries: document.getElementById('leaderboard-entries')
};

// Set up canvas
const ctx = elements.canvas.getContext('2d');
elements.canvas.width = config.canvasWidth;
elements.canvas.height = config.canvasHeight;

// Connect to the server with fallback for deployed environments
let socket;

// Function to initialize socket connection
function initializeSocket() {
  // Wait for io to be defined (in case it's loading from CDN)
  if (typeof io === 'undefined') {
    console.log('Waiting for Socket.IO to load...');
    setTimeout(initializeSocket, 100);
    return;
  }
  
  try {
    // Get the current host
    const currentHost = window.location.hostname;
    
    // If we're on Firebase hosting or localhost
    if (currentHost.includes('firebaseapp.com') || 
        currentHost.includes('web.app') || 
        currentHost === 'localhost' || 
        currentHost === '127.0.0.1') {
      
      // Connect to the same host (Firebase will route to the function)
      console.log('Connecting to Firebase backend...');
      socket = io();
    } else {
      // Default connection for other environments
      console.log('Connecting to default backend...');
      socket = io();
    }
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      console.log('Attempting to reconnect...');
      
      // You can implement additional reconnection logic here if needed
    });
    
    // Set up socket event handlers once connected
    setupSocketHandlers();
  } catch (err) {
    console.error('Socket initialization error:', err);
  }
}

// Initialize socket connection
initializeSocket();

// Event listeners
elements.startGameButton.addEventListener('click', startGame);
window.addEventListener('keydown', handleKeyPress);
window.addEventListener('keyup', handleKeyRelease);
window.addEventListener('blur', handleWindowBlur);

// Function to set up socket event handlers
function setupSocketHandlers() {
  // Socket event handlers
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('gameState', (state) => {
    gameState = state;
    updatePlayerInfo();
    updateLeaderboard();
    renderGame();
  });
  
  socket.on('registered', ({ player: newPlayer }) => {
    player.id = newPlayer.id;
    player.value = newPlayer.value;
    player.score = newPlayer.score;
    console.log('Registered as player:', player);
  });
}

// Start the game
function startGame() {
  const playerName = elements.playerNameInput.value.trim();
  if (!playerName) {
    alert('Please enter your name');
    return;
  }
  
  player.name = playerName;
  
  // Check if socket is initialized
  if (!socket) {
    alert('Connecting to server, please try again in a moment...');
    initializeSocket(); // Try to initialize socket again
    return;
  }
  
  // Register with the server
  socket.emit('register', { name: playerName });
  
  // Show game screen
  elements.loginScreen.style.display = 'none';
  elements.gameScreen.style.display = 'flex';
  
  // Start movement interval
  startMovementInterval();
}

// Start the movement interval
function startMovementInterval() {
  // Clear any existing interval
  if (movementInterval) {
    clearInterval(movementInterval);
  }
  
  // Set up a new interval to send movement commands
  movementInterval = setInterval(() => {
    if (!player.id) return;
    
    // Send movement commands based on current key state
    if (keyState.up) {
      socket.emit('move', { direction: 'up' });
    }
    if (keyState.down) {
      socket.emit('move', { direction: 'down' });
    }
    if (keyState.left) {
      socket.emit('move', { direction: 'left' });
    }
    if (keyState.right) {
      socket.emit('move', { direction: 'right' });
    }
  }, 50); // Send movement commands every 50ms
}

// Handle keyboard press
function handleKeyPress(event) {
  if (!player.id) return;
  
  // Prevent default behavior for game controls
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '].includes(event.key)) {
    event.preventDefault();
  }
  
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      keyState.up = true;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      keyState.down = true;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      keyState.left = true;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      keyState.right = true;
      break;
    case ' ': // Spacebar
      socket.emit('move', { direction: 'space' });
      break;
  }
}

// Handle keyboard release
function handleKeyRelease(event) {
  if (!player.id) return;
  
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      keyState.up = false;
      socket.emit('move', { direction: 'up_release' });
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      keyState.down = false;
      socket.emit('move', { direction: 'down_release' });
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      keyState.left = false;
      socket.emit('move', { direction: 'left_release' });
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      keyState.right = false;
      socket.emit('move', { direction: 'right_release' });
      break;
  }
}

// Handle window blur (when user switches tabs/windows)
function handleWindowBlur() {
  // Reset all key states when window loses focus
  keyState.up = false;
  keyState.down = false;
  keyState.left = false;
  keyState.right = false;
  
  // Send release commands for all directions
  socket.emit('move', { direction: 'up_release' });
  socket.emit('move', { direction: 'down_release' });
  socket.emit('move', { direction: 'left_release' });
  socket.emit('move', { direction: 'right_release' });
}

// Update player information display
function updatePlayerInfo() {
  const currentPlayer = gameState.players.find(p => p.id === player.id);
  if (currentPlayer) {
    player.value = currentPlayer.value;
    player.score = currentPlayer.score;
    player.maxSpeed = currentPlayer.maxSpeed;
    player.hasInvulnerability = currentPlayer.hasInvulnerability;
    player.isInvulnerable = currentPlayer.isInvulnerable;
    player.eatenCount = currentPlayer.eatenCount;
    
    elements.playerValue.textContent = player.value;
    elements.playerScore.textContent = player.score;
    
    // Build status text
    let statusText = '';
    
    // Display super speed status if active
    if (currentPlayer.maxSpeed > 10) {
      statusText += `<span style="color: yellow;">[SUPER SPEED!]</span> `;
    }
    
    // Display invulnerability status
    if (currentPlayer.isInvulnerable) {
      statusText += `<span style="color: #FF00FF;">[INVULNERABLE!]</span> `;
    } else if (currentPlayer.hasInvulnerability) {
      statusText += `<span style="color: #00FFFF;">[PRESS SPACE FOR INVULNERABILITY]</span> `;
    }
    
    // Display eaten count if approaching invulnerability
    if (currentPlayer.eatenCount > 0 && currentPlayer.eatenCount < 5 && !currentPlayer.hasInvulnerability) {
      statusText += `<span style="color: #AAFFAA;">[${currentPlayer.eatenCount}/5 EATEN]</span>`;
    }
    
    if (statusText) {
      elements.playerValue.innerHTML = `${player.value} ${statusText}`;
    }
  }
}

// Update leaderboard display
function updateLeaderboard() {
  elements.leaderboardEntries.innerHTML = '';
  
  // Create a map of player IDs to colors
  const playerColors = {};
  gameState.players.forEach(p => {
    playerColors[p.id] = p.color;
  });
  
  gameState.leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.className = 'leaderboard-entry';
    
    // Set the text color to match the player's square color
    if (playerColors[entry.id]) {
      entryElement.style.color = playerColors[entry.id];
    }
    
    // Add special styling for current player
    if (entry.id === player.id) {
      entryElement.classList.add('current-player');
      // Keep the special styling but also use the player's color
      entryElement.style.fontWeight = 'bold';
    }
    
    entryElement.innerHTML = `
      <span>${index + 1}. ${entry.name}</span>
      <span>${entry.score}</span>
    `;
    
    elements.leaderboardEntries.appendChild(entryElement);
  });
}

// Render the game
function renderGame() {
  // Clear canvas
  ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
  
  // Draw players
  gameState.players.forEach(p => {
    const isCurrentPlayer = p.id === player.id;
    const hasSuperSpeed = p.maxSpeed > 10;
    const isInvulnerable = p.isInvulnerable;
    const hasInvulnerabilitySkill = p.hasInvulnerability;
    
    drawSquare(
      p.x, 
      p.y, 
      p.size, 
      p.color, 
      p.value, 
      isCurrentPlayer, 
      hasSuperSpeed, 
      isInvulnerable, 
      hasInvulnerabilitySkill
    );
  });
}

// Draw a cat with a number
function drawSquare(x, y, size, color, value, isCurrentPlayer = false, hasSuperSpeed = false, isInvulnerable = false, hasInvulnerabilitySkill = false) {
  // Save the current context state
  ctx.save();
  
  // Draw cat body (slightly square-shaped)
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  
  // Draw cat ears
  ctx.fillStyle = color;
  // Left ear
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size/5, y - size/4);
  ctx.lineTo(x + size/5, y);
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size + size/5, y - size/4);
  ctx.lineTo(x + size - size/5, y);
  ctx.fill();
  
  // Draw cat face
  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + size/3, y + size/3, size/8, 0, Math.PI * 2);
  ctx.arc(x + size - size/3, y + size/3, size/8, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + size/3, y + size/3, size/16, 0, Math.PI * 2);
  ctx.arc(x + size - size/3, y + size/3, size/16, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#FF9999';
  ctx.beginPath();
  ctx.moveTo(x + size/2, y + size/2);
  ctx.lineTo(x + size/2 - size/10, y + size/2 + size/10);
  ctx.lineTo(x + size/2 + size/10, y + size/2 + size/10);
  ctx.fill();
  
  // Whiskers
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  // Left whiskers
  ctx.beginPath();
  ctx.moveTo(x + size/3, y + size/2 + size/10);
  ctx.lineTo(x, y + size/2);
  ctx.moveTo(x + size/3, y + size/2 + size/10);
  ctx.lineTo(x, y + size/2 + size/5);
  ctx.stroke();
  // Right whiskers
  ctx.beginPath();
  ctx.moveTo(x + size - size/3, y + size/2 + size/10);
  ctx.lineTo(x + size, y + size/2);
  ctx.moveTo(x + size - size/3, y + size/2 + size/10);
  ctx.lineTo(x + size, y + size/2 + size/5);
  ctx.stroke();
  
  // Draw border for current player
  if (isCurrentPlayer) {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
  }
  
  // Draw super speed indicator
  if (hasSuperSpeed) {
    ctx.strokeStyle = '#FFFF00'; // Yellow
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw invulnerability indicator - only when actually invulnerable
  if (isInvulnerable) {
    ctx.strokeStyle = '#FF00FF'; // Magenta
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 1.2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add a pulsing effect
    const pulseSize = size / 1.2 + Math.sin(Date.now() / 200) * 5;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw available invulnerability skill indicator
  if (hasInvulnerabilitySkill && !isInvulnerable) {
    ctx.strokeStyle = '#00FFFF'; // Cyan
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed line
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 1.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset to solid line
  }
  
  // Draw value
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x + size / 2, y + size / 2 + size/4);
  
  // Restore the context state
  ctx.restore();
}
