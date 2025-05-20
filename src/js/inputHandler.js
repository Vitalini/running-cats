/**
 * Input Handler for Running Cats game
 * Manages keyboard input and movement controls
 */

class InputHandler {
  constructor(socket) {
    this.socket = socket;
    this.keyState = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    // Bind event listeners
    this.bindEventListeners();
  }
  
  /**
   * Bind all event listeners
   */
  bindEventListeners() {
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
    window.addEventListener('keyup', this.handleKeyRelease.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
  }
  
  /**
   * Handle keyboard press
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyPress(event) {
    // Check if we're in the game screen (not the login screen)
    const isGameActive = document.getElementById('game-screen').style.display !== 'none';
    
    // Only prevent default behavior for game controls when the game is active
    if (isGameActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '].includes(event.key)) {
      event.preventDefault();
    }
    
    // If game is not active, don't process game controls
    if (!isGameActive) return;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (!this.keyState.up) {
          this.keyState.up = true;
          this.socket.emit('move', { direction: 'up' });
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (!this.keyState.down) {
          this.keyState.down = true;
          this.socket.emit('move', { direction: 'down' });
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (!this.keyState.left) {
          this.keyState.left = true;
          this.socket.emit('move', { direction: 'left' });
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (!this.keyState.right) {
          this.keyState.right = true;
          this.socket.emit('move', { direction: 'right' });
        }
        break;
      case ' ':
        // Space bar for invulnerability
        this.socket.emit('move', { direction: 'space' });
        break;
    }
  }
  
  /**
   * Handle keyboard release
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyRelease(event) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keyState.up = false;
        this.socket.emit('move', { direction: 'up_release' });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keyState.down = false;
        this.socket.emit('move', { direction: 'down_release' });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keyState.left = false;
        this.socket.emit('move', { direction: 'left_release' });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keyState.right = false;
        this.socket.emit('move', { direction: 'right_release' });
        break;
    }
  }
  
  /**
   * Handle window blur (when user switches tabs/windows)
   */
  handleWindowBlur() {
    // Reset all key states
    this.keyState.up = false;
    this.keyState.down = false;
    this.keyState.left = false;
    this.keyState.right = false;
    
    // Send release events for all directions
    this.socket.emit('move', { direction: 'up_release' });
    this.socket.emit('move', { direction: 'down_release' });
    this.socket.emit('move', { direction: 'left_release' });
    this.socket.emit('move', { direction: 'right_release' });
  }
  
  /**
   * Start the movement interval
   */
  startMovementInterval() {
    // Clear any existing interval
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
    }
    
    // Set up a new interval to send movement commands
    this.movementInterval = setInterval(() => {
      // Send movement commands based on current key state
      if (this.keyState.up) {
        this.socket.emit('move', { direction: 'up' });
      }
      if (this.keyState.down) {
        this.socket.emit('move', { direction: 'down' });
      }
      if (this.keyState.left) {
        this.socket.emit('move', { direction: 'left' });
      }
      if (this.keyState.right) {
        this.socket.emit('move', { direction: 'right' });
      }
    }, 50); // Send movement commands every 50ms
  }
  
  /**
   * Stop the movement interval
   */
  stopMovementInterval() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }
}

export default InputHandler;
