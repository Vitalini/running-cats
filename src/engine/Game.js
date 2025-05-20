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
    this.lastValueChangeTime = Date.now();
    this.valueChangeInterval = 8000; // 8 seconds until number change
    
    // Create islands for checking if a player is on them
    this.islands = this.createIslands();
    
    // Track which players are on islands
    this.playersOnIslands = new Map();
    
    // Periodic check for granting invulnerability ability (without awarding points)
    setInterval(() => {
      this.checkForInvulnerabilitySkill();
    }, 60000); // Check every minute
    
    // Timer for updating the number change timer
    setInterval(() => {
      // Only reset the timer for players who have been continuously on an island
      this.players.forEach((player, playerId) => {
        if (!this.playersOnIslands.has(playerId)) {
          // Player is not on an island, no timer needed
          return;
        }
        
        // Check if player is still on an island
        if (this.isPlayerInIsland(player)) {
          // If the timer has expired, change the player's number
          const now = Date.now();
          const playerIslandData = this.playersOnIslands.get(playerId);
          
          // Make sure we have valid data
          if (!playerIslandData || !playerIslandData.enteredTime) {
            console.log(`Fixing missing timer data for player ${playerId}`);
            this.playersOnIslands.set(playerId, {
              enteredTime: now,
              isOnIsland: true
            });
            return; // Skip this player and exit the function
          }
          
          const elapsed = now - playerIslandData.enteredTime;
          
          if (elapsed >= this.valueChangeInterval) {
            // Change the player's number
            console.log(`Changing number for player ${playerId}`);
            player.value = this.generateRandomValue();
            // Reset the timer for this player
            this.playersOnIslands.set(playerId, {
              enteredTime: now,
              isOnIsland: true
            });
          }
        } else {
          // Player has left the island, remove from tracking
          this.playersOnIslands.delete(playerId);
        }
      });
    }, 1000); // Check every second
  }
  
  // Creates islands for server-side checking
  createIslands() {
    const islands = [];
    const numIslands = Math.floor(Math.random() * 5) + 8; // 8-12 islands
    
    for (let i = 0; i < numIslands; i++) {
      const size = Math.floor(Math.random() * 20) + 20; // 20-40px
      const x = Math.floor(Math.random() * (this.width - size * 2)) + size;
      const y = Math.floor(Math.random() * (this.height - size * 2)) + size;
      
      // Check that islands don't overlap
      let overlapping = false;
      for (const island of islands) {
        const dx = x - island.x;
        const dy = y - island.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < size + island.size + 15) {
          overlapping = true;
          break;
        }
      }
      
      if (!overlapping) {
        islands.push({ x, y, size });
      }
    }
    
    return islands;
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
      movingRight: false,
      recentlyRespawned: true // Флаг недавнего перерождения
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
    
    // Check if player is on an island and track entry/exit
    const isOnIsland = this.isPlayerInIsland(player);
    const wasOnIsland = this.playersOnIslands.has(id);
    
    // If player just entered an island
    if (isOnIsland && !wasOnIsland) {
      // Start tracking this player on an island
      const now = Date.now();
      console.log(`Player ${id} entered island at ${now}`);
      this.playersOnIslands.set(id, {
        enteredTime: now,
        isOnIsland: true
      });
    } 
    // If player just left an island
    else if (!isOnIsland && wasOnIsland) {
      // Remove player from island tracking
      console.log(`Player ${id} left island`);
      this.playersOnIslands.delete(id);
    }
    // If player is still on an island, make sure the timer data exists
    else if (isOnIsland && wasOnIsland) {
      const data = this.playersOnIslands.get(id);
      if (!data || !data.enteredTime) {
        console.log(`Fixing timer data for player ${id}`);
        this.playersOnIslands.set(id, {
          enteredTime: Date.now(),
          isOnIsland: true
        });
      }
    }
    
    this.checkCollisions(player);
    return player;
  }

  // Check for collisions with other players
  checkCollisions(player) {
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
        if (player.isInvulnerable) {
          // Invulnerable player always eats other players
          this.eatPlayer(player, otherPlayer);
        } else if (otherPlayer.isInvulnerable) {
          // Other player is invulnerable, so they eat the current player
          this.eatPlayer(otherPlayer, player);
        } else if (player.value > otherPlayer.value) {
          // Current player eats the other player (normal case)
          this.eatPlayer(player, otherPlayer);
        } else if (player.value < otherPlayer.value) {
          // Other player eats the current player (normal case)
          this.eatPlayer(otherPlayer, player);
        }
        // If values are equal, nothing happens
      }
    });
  }

  // Handle one player eating another
  eatPlayer(eater, eaten) {
    // Check if the eater is on an island
    const isEaterInIsland = this.isPlayerInIsland(eater);
    
    // Award points only if the eater is not on an island
    if (!isEaterInIsland) {
      // Award points to the eater
      eater.score += Math.max(10, Math.floor(eaten.value / 2));
    }
    
    // Increment eaten count in any case
    eater.eatenCount++;
    
    // Award invulnerability skill after eating 3 players without dying
    if (eater.eatenCount >= 3 && !eater.hasInvulnerability && !eater.isInvulnerable) {
      eater.hasInvulnerability = true;
      eater.eatenCount = 0; // Reset counter
    }
    
    // Give super speed to the eater
    eater.superSpeedUntil = Date.now() + 5000; // 5 seconds of super speed
    
    // Change the eater's number after eating another player
    console.log(`Player ${eater.id} ate player ${eaten.id} - changing number`);
    eater.value = this.generateRandomValue();
    
    // Reset the eaten player
    eaten.x = Math.floor(Math.random() * (this.width - 30));
    eaten.y = Math.floor(Math.random() * (this.height - 30));
    eaten.value = this.generateRandomValue();
    eaten.eatenCount = 0; // Reset eaten count
    eaten.hasInvulnerability = false; // Remove invulnerability skill
    eaten.recentlyRespawned = true; // Устанавливаем флаг недавнего перерождения
    
    // Update leaderboard
    this.updateLeaderboard();
  }

  // Проверка для выдачи способности неуязвимости (без начисления очков)
  checkForInvulnerabilitySkill() {
    const now = Date.now();
    this.players.forEach((player) => {
      // Каждую минуту даем шанс получить способность неуязвимости
      if (now - player.lastJoined > 60000 && Math.random() < 0.15 && !player.hasInvulnerability && !player.isInvulnerable) {
        player.hasInvulnerability = true;
      }
    });
  }

  // Update the leaderboard
  updateLeaderboard() {
    // Convert players map to array and sort by score
    const playersArray = Array.from(this.players.values());
    this.leaderboard = playersArray.sort((a, b) => b.score - a.score);
  }

  // Get remaining time until cat number change for a specific player
  getTimeUntilValueChange(playerId) {
    // If player is not on an island, return 0 (no timer)
    if (!this.playersOnIslands.has(playerId)) {
      return 0;
    }
    
    // Get the time when the player entered the island
    const now = Date.now();
    const playerIslandData = this.playersOnIslands.get(playerId);
    
    // Make sure we have valid data
    if (!playerIslandData || !playerIslandData.enteredTime) {
      // Reset the timer for this player with current time
      this.playersOnIslands.set(playerId, {
        enteredTime: now,
        isOnIsland: true
      });
      return 8; // Return full timer duration in seconds
    }
    
    const elapsed = now - playerIslandData.enteredTime;
    const remaining = Math.max(0, this.valueChangeInterval - elapsed);
    
    return Math.ceil(remaining / 1000); // Return in seconds
  }
  
  // Check if a player is on an island
  isPlayerInIsland(player) {
    // Check each island
    for (const island of this.islands || []) {
      // Calculate the closest point on the cat to the island center
      const closestX = Math.max(player.x, Math.min(island.x, player.x + player.size));
      const closestY = Math.max(player.y, Math.min(island.y, player.y + player.size));
      
      // Calculate distance from this closest point to the island center
      const dx = closestX - island.x;
      const dy = closestY - island.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If any part of the cat touches the island (more sensitive detection)
      if (distance < island.size * 1.1) { // Increased detection radius by 10%
        return true;
      }
    }
    
    return false;
  }
  
  // Get the current game state
  getState() {
    // Create player states with individual timers
    const playerStates = Array.from(this.players.entries()).map(([playerId, player]) => {
      // Add player-specific timer information
      return {
        ...player,
        timeUntilValueChange: this.getTimeUntilValueChange(playerId),
        isOnIsland: this.playersOnIslands.has(playerId)
      };
    });
    
    return {
      players: playerStates,
      leaderboard: this.leaderboard,
      islands: this.islands // Include island data for all clients
    };
  }
}

module.exports = Game;
