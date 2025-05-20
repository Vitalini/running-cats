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
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Render the entire game state
   * @param {Object} gameState - Current game state
   * @param {String} currentPlayerId - ID of the current player
   */
  renderGame(gameState, currentPlayerId) {
    this.clear();
    
    // Draw players
    gameState.players.forEach(player => {
      const isCurrentPlayer = player.id === currentPlayerId;
      const hasSuperSpeed = player.maxSpeed > 10;
      const isInvulnerable = player.isInvulnerable;
      const hasInvulnerabilitySkill = player.hasInvulnerability;
      
      this.drawCat(
        player.x, 
        player.y, 
        player.size, 
        player.color, 
        player.value, 
        isCurrentPlayer, 
        hasSuperSpeed, 
        isInvulnerable, 
        hasInvulnerabilitySkill
      );
    });
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
   */
  drawCat(x, y, size, color, value, isCurrentPlayer = false, hasSuperSpeed = false, isInvulnerable = false, hasInvulnerabilitySkill = false) {
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
    
    // Draw available invulnerability skill indicator
    if (hasInvulnerabilitySkill && !isInvulnerable) {
      this.ctx.strokeStyle = '#00FFFF'; // Cyan
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]); // Dashed line
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 1.3, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]); // Reset to solid line
    }
    
    // Draw value
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `${size / 2}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(value, x + size / 2, y + size / 2 + size/4);
    
    // Restore the context state
    this.ctx.restore();
  }
}

export default Renderer;
