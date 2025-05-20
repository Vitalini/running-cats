/**
 * Game engine for Running Cats
 * Handles game state, player management, and collision detection
 */

class Game {
  constructor(width = 1000, height = 600) {
    this.width = width;
    this.height = height;
    this.players = new Map();
    this.leaderboard = [];
    
    // Set up survival points timer
    setInterval(() => this.awardSurvivalPoints(), 15000);
  }

  // Add a new player to the game
  addPlayer(id, name) {
    const player = {
      id,
      name: name || `Player ${id}`,
      x: Math.floor(Math.random() * (this.width - 30)),
      y: Math.floor(Math.random() * (this.height - 30)),
      size: 25, // Smaller cats
      value: this.generateRandomValue(),
      score: 0,
      color: this.getRandomColor(),
      superSpeedUntil: 0, // Timestamp when super speed ends
      lastJoined: Date.now(), // Track when player joined for survival points
      velocityX: 0, // Horizontal velocity for physics
      velocityY: 0, // Vertical velocity for physics
      acceleration: 0.5, // Acceleration rate
      friction: 0.9, // Friction to slow down movement
      maxSpeed: 6, // Maximum normal speed
      eatenCount: 0, // Count of players eaten without dying
      hasInvulnerability: false, // Whether player has invulnerability skill
      isInvulnerable: false, // Whether invulnerability is currently active
      invulnerableUntil: 0, // Timestamp when invulnerability ends
      movingUp: false, // Movement state flags
      movingDown: false,
      movingLeft: false,
      movingRight: false
    };
    
    this.players.set(id, player);
    this.updateLeaderboard();
    return player;
  }

  // Remove a player from the game
  removePlayer(id) {
    if (this.players.has(id)) {
      this.players.delete(id);
      this.updateLeaderboard();
      return true;
    }
    return false;
  }

  // Generate a random value between 1 and 100
  generateRandomValue() {
    return Math.floor(Math.random() * 100) + 1;
  }

  // Generate a random color
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Move a player in a specified direction with physics
  movePlayer(id, direction) {
    if (!this.players.has(id)) return null;
    
    const player = this.players.get(id);
    const now = Date.now();
    
    // Store the current movement state
    const currentMovement = {
      up: player.movingUp || false,
      down: player.movingDown || false,
      left: player.movingLeft || false,
      right: player.movingRight || false
    };
    
    // Check if super speed is active
    if (player.superSpeedUntil > now) {
      player.maxSpeed = 12; // Super speed (doubled from normal)
    } else if (player.maxSpeed !== 6) {
      player.maxSpeed = 6; // Reset to normal speed
    }
    
    // Check if invulnerability has expired
    if (player.isInvulnerable && player.invulnerableUntil < now) {
      player.isInvulnerable = false;
    }
    
    // Handle direction changes
    switch (direction) {
      case 'up':
        player.movingUp = true;
        break;
      case 'down':
        player.movingDown = true;
        break;
      case 'left':
        player.movingLeft = true;
        break;
      case 'right':
        player.movingRight = true;
        break;
      case 'up_release':
        player.movingUp = false;
        break;
      case 'down_release':
        player.movingDown = false;
        break;
      case 'left_release':
        player.movingLeft = false;
        break;
      case 'right_release':
        player.movingRight = false;
        break;
      case 'space':
        // Activate invulnerability if available
        if (player.hasInvulnerability && !player.isInvulnerable) {
          player.isInvulnerable = true;
          player.invulnerableUntil = now + 5000; // 5 seconds of invulnerability
          player.hasInvulnerability = false; // Use up the skill
          player.value = this.generateRandomValue(); // Change number when activating
        }
        break;
    }
    
    // Simple movement system with fixed speed regardless of direction
    // Track if multiple keys are pressed
    const keysPressed = (player.movingUp ? 1 : 0) + 
                       (player.movingDown ? 1 : 0) + 
                       (player.movingLeft ? 1 : 0) + 
                       (player.movingRight ? 1 : 0);
    
    // Base speed - will be divided if multiple keys are pressed
    const baseSpeed = player.maxSpeed;
    
    // Calculate movement in each direction
    let moveX = 0;
    let moveY = 0;
    
    // Apply movement based on keys pressed
    if (player.movingUp) moveY -= baseSpeed;
    if (player.movingDown) moveY += baseSpeed;
    if (player.movingLeft) moveX -= baseSpeed;
    if (player.movingRight) moveX += baseSpeed;
    
    // If multiple keys are pressed, reduce speed to maintain consistent movement
    if (keysPressed > 1) {
      moveX = moveX / keysPressed;
      moveY = moveY / keysPressed;
    }
    
    // Apply movement directly to velocity
    if (keysPressed > 0) {
      // Moving - set velocity directly
      player.velocityX = moveX;
      player.velocityY = moveY;
    } else {
      // Not moving - apply friction to gradually slow down
      player.velocityX *= player.friction;
      player.velocityY *= player.friction;
      
      // If velocity is very small, set it to zero to prevent tiny movements
      if (Math.abs(player.velocityX) < 0.1) player.velocityX = 0;
      if (Math.abs(player.velocityY) < 0.1) player.velocityY = 0;
    }
    
    // Apply velocity to position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Wrap around screen edges
    if (player.x < 0) {
      player.x = this.width - player.size;
    } else if (player.x > this.width - player.size) {
      player.x = 0;
    }
    
    if (player.y < 0) {
      player.y = this.height - player.size;
    } else if (player.y > this.height - player.size) {
      player.y = 0;
    }
    
    this.checkCollisions(player);
    return player;
  }

  // Check for collisions with other players
  checkCollisions(player) {
    if (player.isInvulnerable) return; // Skip collision checks if invulnerable
    
    this.players.forEach((otherPlayer) => {
      // Skip self-collision
      if (otherPlayer.id === player.id) return;
      
      // Skip if other player is invulnerable
      if (otherPlayer.isInvulnerable) return;
      
      // Check if players are colliding
      const dx = player.x - otherPlayer.x;
      const dy = player.y - otherPlayer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < player.size) {
        // Collision detected
        if (player.value > otherPlayer.value) {
          // Current player eats the other player
          this.eatPlayer(player, otherPlayer);
        } else if (player.value < otherPlayer.value) {
          // Other player eats the current player
          this.eatPlayer(otherPlayer, player);
        }
        // If values are equal, nothing happens
      }
    });
  }

  // Handle one player eating another
  eatPlayer(eater, eaten) {
    // Award points to the eater
    eater.score += Math.max(10, Math.floor(eaten.value / 2));
    eater.eatenCount++;
    
    // Award invulnerability skill after eating 3 players without dying
    if (eater.eatenCount >= 3 && !eater.hasInvulnerability && !eater.isInvulnerable) {
      eater.hasInvulnerability = true;
      eater.eatenCount = 0; // Reset counter
    }
    
    // Give super speed to the eater
    eater.superSpeedUntil = Date.now() + 5000; // 5 seconds of super speed
    
    // Reset the eaten player
    eaten.x = Math.floor(Math.random() * (this.width - 30));
    eaten.y = Math.floor(Math.random() * (this.height - 30));
    eaten.value = this.generateRandomValue();
    eaten.eatenCount = 0; // Reset eaten count
    eaten.hasInvulnerability = false; // Remove invulnerability skill
    
    // Update leaderboard
    this.updateLeaderboard();
  }

  // Award survival points to all players
  awardSurvivalPoints() {
    const now = Date.now();
    this.players.forEach((player) => {
      // Award 5 points for every 15 seconds of survival
      player.score += 5;
      
      // Every minute, give a random player the invulnerability skill
      if (now - player.lastJoined > 60000 && Math.random() < 0.1 && !player.hasInvulnerability && !player.isInvulnerable) {
        player.hasInvulnerability = true;
      }
    });
    
    // Update leaderboard
    this.updateLeaderboard();
  }

  // Update the leaderboard
  updateLeaderboard() {
    // Convert players map to array and sort by score
    const playersArray = Array.from(this.players.values());
    this.leaderboard = playersArray.sort((a, b) => b.score - a.score);
  }

  // Get the current game state
  getState() {
    return {
      players: Array.from(this.players.values()),
      leaderboard: this.leaderboard.slice(0, 10) // Top 10 players
    };
  }
}

module.exports = Game;
