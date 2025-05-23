/**
 * UI Manager for Running Cats game
 * Handles UI updates and interactions
 */

class UIManager {
  constructor(elements) {
    this.elements = elements;
    this.valueChangeTimerElement = null;
    
    // Create element for displaying the timer
    this.createValueChangeTimer();
  }
  
  /**
   * Creates a timer element for number change countdown
   */
  createValueChangeTimer() {
    // Create timer element
    this.valueChangeTimerElement = document.createElement('div');
    this.valueChangeTimerElement.className = 'value-change-timer';
    this.valueChangeTimerElement.innerHTML = '<span>Number changes in: </span><span class="time">15</span><span> sec</span>';
    
    // Add to player info block below the score
    if (this.elements.playerScore && this.elements.playerScore.parentNode) {
      const playerInfoBlock = this.elements.playerScore.parentNode;
      // Add after the score block
      playerInfoBlock.appendChild(this.valueChangeTimerElement);
    } else if (this.elements.gameScreen) {
      // If we couldn't find the score block, add to game screen
      this.elements.gameScreen.appendChild(this.valueChangeTimerElement);
    }
  }
  
  /**
   * Show the login screen
   */
  showLoginScreen() {
    this.elements.loginScreen.style.display = 'flex';
    this.elements.gameScreen.style.display = 'none';
  }
  
  /**
   * Show the game screen
   */
  showGameScreen() {
    this.elements.loginScreen.style.display = 'none';
    this.elements.gameScreen.style.display = 'flex';
  }
  
  /**
   * Update player information display
   * @param {Object} player - Player information
   */
  updatePlayerInfo(player) {
    if (!player) return;
    
    // Update player value - show the actual number
    if (this.elements.playerValue) {
      // Show the actual cat number
      this.elements.playerValue.textContent = player.value;
      
      // Visual feedback when value changes
      this.elements.playerValue.classList.add('highlight');
      setTimeout(() => {
        this.elements.playerValue.classList.remove('highlight');
      }, 300);
    }
    
    // Update player score
    if (this.elements.playerScore) {
      // Check if score has changed
      const currentScore = parseInt(this.elements.playerScore.textContent);
      if (currentScore !== player.score) {
        // Animate score change
        this.animateScoreChange(currentScore, player.score);
      }
    }
    
    // Update invulnerability status and notification
    const invulnerabilityNotification = document.getElementById('invulnerability-notification');
    
    if (player.hasInvulnerability && !player.isInvulnerable) {
      // Player has invulnerability skill but hasn't activated it yet
      document.body.classList.add('has-invulnerability');
      
      // Show the notification
      if (invulnerabilityNotification) {
        invulnerabilityNotification.classList.remove('hidden');
      }
    } else {
      document.body.classList.remove('has-invulnerability');
      
      // Hide the notification
      if (invulnerabilityNotification) {
        invulnerabilityNotification.classList.add('hidden');
      }
    }
    
    // Update active invulnerability status
    if (player.isInvulnerable) {
      document.body.classList.add('is-invulnerable');
    } else {
      document.body.classList.remove('is-invulnerable');
    }
    
    // Update super speed status
    if (player.superSpeedUntil > Date.now()) {
      document.body.classList.add('has-super-speed');
    } else {
      document.body.classList.remove('has-super-speed');
    }
  }
  
  /**
   * Animate score change
   * @param {Number} fromScore - Starting score
   * @param {Number} toScore - Ending score
   */
  animateScoreChange(fromScore, toScore) {
    // If score difference is small, just update directly
    if (Math.abs(toScore - fromScore) < 10) {
      this.elements.playerScore.textContent = toScore;
      this.elements.playerScore.classList.add('highlight');
      setTimeout(() => {
        this.elements.playerScore.classList.remove('highlight');
      }, 300);
      return;
    }
    
    // For larger changes, animate the counting
    const duration = 500; // ms
    const startTime = Date.now();
    
    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current value
      const currentValue = Math.round(fromScore + (toScore - fromScore) * easeProgress);
      this.elements.playerScore.textContent = currentValue;
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        // Final update and highlight
        this.elements.playerScore.textContent = toScore;
        this.elements.playerScore.classList.add('highlight');
        setTimeout(() => {
          this.elements.playerScore.classList.remove('highlight');
        }, 300);
      }
    };
    
    // Start animation
    animateFrame();
  }
  
  /**
   * Updates the timer for cat number change
   * @param {Number} timeRemaining - Remaining time in seconds
   * @param {Boolean} isHidden - Whether the player is hidden behind an island
   */
  updateValueChangeTimer(timeRemaining, isHidden) {
    if (!this.valueChangeTimerElement) return;
    
    // Only show the timer if the player is hidden behind an island
    if (isHidden) {
      this.valueChangeTimerElement.style.display = 'block';
      
      const timeElement = this.valueChangeTimerElement.querySelector('.time');
      if (timeElement) {
        timeElement.textContent = timeRemaining;
        
        // Add visual effect when time is running low
        if (timeRemaining <= 3) {
          this.valueChangeTimerElement.classList.add('urgent');
        } else {
          this.valueChangeTimerElement.classList.remove('urgent');
        }
      }
    } else {
      // Скрываем таймер, если игрок не под островком
      this.valueChangeTimerElement.style.display = 'none';
    }
  }
  
  /**
   * Update leaderboard display
   * @param {Array} leaderboard - Sorted array of players
   */
  updateLeaderboard(leaderboard) {
    if (!this.elements.leaderboardEntries) return;
    
    // Clear current leaderboard
    this.elements.leaderboardEntries.innerHTML = '';
    
    // Add entries for top players
    leaderboard.slice(0, 10).forEach((player, index) => {
      const entry = document.createElement('div');
      entry.className = 'leaderboard-entry';
      
      // Add rank
      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = `#${index + 1}`;
      entry.appendChild(rank);
      
      // Add name
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = player.name;
      entry.appendChild(name);
      
      // Add score (без отображения номера игрока)
      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = player.score; // Отображаем только очки
      entry.appendChild(score);
      
      // Highlight current player
      if (player.isCurrent) {
        entry.classList.add('current-player');
      }
      
      // Add to leaderboard
      this.elements.leaderboardEntries.appendChild(entry);
    });
  }
}

export default UIManager;
