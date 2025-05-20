/**
 * Renderer for Running Cats game
 * Handles all rendering operations for the game
 */

class Renderer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    
    // Set canvas dimensions
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Create islands
    this.islands = [];
    this.createIslands();
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Creates islands on the game field
   */
  createIslands() {
    // Create 8-12 islands
    const numIslands = Math.floor(Math.random() * 5) + 8; // 8-12 islands
    
    for (let i = 0; i < numIslands; i++) {
      const size = Math.floor(Math.random() * 20) + 20; // 20-40px - larger size for islands
      const x = Math.floor(Math.random() * (this.width - size * 2)) + size;
      const y = Math.floor(Math.random() * (this.height - size * 2)) + size;
      
      // Check that islands don't overlap
      let overlapping = false;
      for (const island of this.islands) {
        const dx = x - island.x;
        const dy = y - island.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < size + island.size + 15) { // Increase distance between islands
          overlapping = true;
          break;
        }
      }
      
      if (!overlapping) {
        this.islands.push({ x, y, size });
      }
    }
  }
  
  /**
   * Draws islands on the game field
   */
  drawIslands() {
    for (const island of this.islands) {
      this.ctx.save();
      
      // Main part of the island
      this.ctx.fillStyle = '#8B4513';
      this.ctx.beginPath();
      this.ctx.arc(island.x, island.y, island.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Vegetation
      this.ctx.fillStyle = '#2E8B57';
      this.ctx.beginPath();
      this.ctx.arc(island.x, island.y - island.size/2, island.size/2, 0, Math.PI);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  /**
   * Checks if a player is hidden behind an island
   * @param {Number} x - Player's X coordinate
   * @param {Number} y - Player's Y coordinate
   * @param {Number} size - Player's size
   * @param {Boolean} isCurrentPlayer - Whether this is the current player
   * @returns {Boolean} - true if the player is hidden, false if visible
   */
  isPlayerHidden(x, y, size, isCurrentPlayer) {
    // If this is a check for the current player and isCurrentPlayer=true,
    // then we just check the position, not the visibility
    const checkPositionOnly = isCurrentPlayer;
    
    // Check if the player is behind any island
    for (const island of this.islands) {
      // Check for any overlap between the cat and the island
      // Calculate the closest point on the cat to the island center
      const closestX = Math.max(x, Math.min(island.x, x + size));
      const closestY = Math.max(y, Math.min(island.y, y + size));
      
      // Calculate distance from this closest point to the island center
      const dx = closestX - island.x;
      const dy = closestY - island.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If any part of the cat touches the island (more sensitive detection)
      if (distance < island.size * 1.1) { // Increased detection radius by 10%
        // If this is just a position check, return true
        if (checkPositionOnly) {
          return true;
        }
        
        // Otherwise hide the player from others
        return !isCurrentPlayer;
      }
    }
    
    return false;
  }

  /**
   * Render the entire game state
   * @param {Object} gameState - Current game state
   * @param {String} currentPlayerId - ID of the current player
   */
  renderGame(gameState, currentPlayerId) {
    this.clear();
    
    // Сначала рисуем игроков, которые не скрыты
    gameState.players.forEach(player => {
      const isCurrentPlayer = player.id === currentPlayerId;
      const hasSuperSpeed = player.maxSpeed > 10;
      const isInvulnerable = player.isInvulnerable;
      const hasInvulnerabilitySkill = player.hasInvulnerability;
      
      // Check if player is hidden behind an island
      const isHidden = this.isPlayerHidden(player.x, player.y, player.size, isCurrentPlayer);
      
      // Check if player is on an island (for visual effect)
      const isOnIsland = player.isOnIsland || false;
      
      if (!isHidden) {
        this.drawCat(
          player.x, 
          player.y, 
          player.size, 
          player.color, 
          player.value, 
          isCurrentPlayer, 
          hasSuperSpeed, 
          isInvulnerable, 
          hasInvulnerabilitySkill,
          isOnIsland
        );
      }
    });
    
    // Затем рисуем островки поверх игроков
    this.drawIslands();
  }
  
  /**
   * Draw a cat with a number
   * @param {Number} x - X position
   * @param {Number} y - Y position
   * @param {Number} size - Size of the cat
   * @param {String} color - Color of the cat
   * @param {Number} value - Value to display on the cat
   * @param {Boolean} isCurrentPlayer - Whether this is the current player
   * @param {Boolean} hasSuperSpeed - Whether the cat has super speed
   * @param {Boolean} isInvulnerable - Whether the cat is invulnerable
   * @param {Boolean} hasInvulnerabilitySkill - Whether the cat has invulnerability skill
   * @param {Boolean} isOnIsland - Whether the cat is on an island
   */
  drawCat(x, y, size, color, value, isCurrentPlayer = false, hasSuperSpeed = false, isInvulnerable = false, hasInvulnerabilitySkill = false, isOnIsland = false) {
    // Save the current context state
    this.ctx.save();
    
    // Draw cat body (slightly square-shaped)
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
    
    // Draw cat ears
    this.ctx.fillStyle = color;
    // Left ear
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - size/5, y - size/4);
    this.ctx.lineTo(x + size/5, y);
    this.ctx.fill();
    // Right ear
    this.ctx.beginPath();
    this.ctx.moveTo(x + size, y);
    this.ctx.lineTo(x + size + size/5, y - size/4);
    this.ctx.lineTo(x + size - size/5, y);
    this.ctx.fill();
    
    // Draw cat face
    // Eyes
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(x + size/3, y + size/3, size/8, 0, Math.PI * 2);
    this.ctx.arc(x + size - size/3, y + size/3, size/8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Pupils
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(x + size/3, y + size/3, size/16, 0, Math.PI * 2);
    this.ctx.arc(x + size - size/3, y + size/3, size/16, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Nose
    this.ctx.fillStyle = '#FF9999';
    this.ctx.beginPath();
    this.ctx.moveTo(x + size/2, y + size/2);
    this.ctx.lineTo(x + size/2 - size/10, y + size/2 + size/10);
    this.ctx.lineTo(x + size/2 + size/10, y + size/2 + size/10);
    this.ctx.fill();
    
    // Whiskers
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    // Left whiskers
    this.ctx.beginPath();
    this.ctx.moveTo(x + size/3, y + size/2 + size/10);
    this.ctx.lineTo(x, y + size/2);
    this.ctx.moveTo(x + size/3, y + size/2 + size/10);
    this.ctx.lineTo(x, y + size/2 + size/5);
    this.ctx.stroke();
    // Right whiskers
    this.ctx.beginPath();
    this.ctx.moveTo(x + size - size/3, y + size/2 + size/10);
    this.ctx.lineTo(x + size, y + size/2);
    this.ctx.moveTo(x + size - size/3, y + size/2 + size/10);
    this.ctx.lineTo(x + size, y + size/2 + size/5);
    this.ctx.stroke();
    
    // Draw border for current player
    if (isCurrentPlayer) {
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x, y, size, size);
    }
    
    // Draw super speed indicator
    if (hasSuperSpeed) {
      this.ctx.strokeStyle = '#FFFF00'; // Yellow
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 1.5, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Draw invulnerability indicator - only when actually invulnerable
    if (isInvulnerable) {
      this.ctx.strokeStyle = '#FF00FF'; // Magenta
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 1.2, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Add a pulsing effect
      const pulseSize = size / 1.2 + Math.sin(Date.now() / 200) * 5;
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, pulseSize, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Убираем круг для доступной неуязвимости, вместо этого добавляем значок
    if (hasInvulnerabilitySkill && !isInvulnerable) {
      // Добавляем маленький значок щита в углу
      this.ctx.fillStyle = '#00FFFF'; // Cyan
      this.ctx.font = `${size / 3}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⚡', x + size - size/4, y + size/4); // Значок молнии
    }
    
    // Add hiding indicator if the cat is on an island
    if (isOnIsland) {
      // Add a subtle hiding effect - semi-transparent halo
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size * 0.9, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
    
    // Display the cat's number
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `${size / 2}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(value, x + size / 2, y + size / 2 + size/4);
    
    // Добавляем визуальные индикаторы для больших котов
    if (value > 75) {
      // Корона для самых больших котов
      this.ctx.fillStyle = '#FFD700'; // Золотой цвет
      this.ctx.beginPath();
      this.ctx.moveTo(x + size/2, y - size/6);
      this.ctx.lineTo(x + size/3, y);
      this.ctx.lineTo(x + size*2/3, y);
      this.ctx.fill();
    } else if (value > 50) {
      // Звездочка для крупных котов
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${size / 3}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⭐', x + size / 2, y - size/6);
    }
    
    // Restore the context state
    this.ctx.restore();
  }
}

export default Renderer;
