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
    // Keyboard controls
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
    window.addEventListener('keyup', this.handleKeyRelease.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    
    // Check if this is a touch device
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (this.isTouchDevice) {
      this.setupTouchControls();
    }
    
    // Handle window resize to show/hide mobile controls
    window.addEventListener('resize', this.handleResize.bind(this));
    // Initial check
    this.handleResize();
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
  
  /**
   * Set up touch controls for mobile devices
   */
  setupTouchControls() {
    // Get mobile control elements
    this.mobileControls = document.getElementById('mobile-controls');
    this.upButton = document.getElementById('up-btn');
    this.downButton = document.getElementById('down-btn');
    this.leftButton = document.getElementById('left-btn');
    this.rightButton = document.getElementById('right-btn');
    this.actionButton = document.getElementById('action-btn');
    
    // Touch start events
    this.upButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keyState.up = true;
      this.socket.emit('move', { direction: 'up' });
    });
    
    this.downButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keyState.down = true;
      this.socket.emit('move', { direction: 'down' });
    });
    
    this.leftButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keyState.left = true;
      this.socket.emit('move', { direction: 'left' });
    });
    
    this.rightButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keyState.right = true;
      this.socket.emit('move', { direction: 'right' });
    });
    
    this.actionButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.socket.emit('move', { direction: 'space' });
    });
    
    // Touch end events
    this.upButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keyState.up = false;
      this.socket.emit('move', { direction: 'up_release' });
    });
    
    this.downButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keyState.down = false;
      this.socket.emit('move', { direction: 'down_release' });
    });
    
    this.leftButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keyState.left = false;
      this.socket.emit('move', { direction: 'left_release' });
    });
    
    this.rightButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keyState.right = false;
      this.socket.emit('move', { direction: 'right_release' });
    });
    
    // Also add mouse events for testing on desktop
    this.upButton.addEventListener('mousedown', () => {
      this.keyState.up = true;
      this.socket.emit('move', { direction: 'up' });
    });
    
    this.downButton.addEventListener('mousedown', () => {
      this.keyState.down = true;
      this.socket.emit('move', { direction: 'down' });
    });
    
    this.leftButton.addEventListener('mousedown', () => {
      this.keyState.left = true;
      this.socket.emit('move', { direction: 'left' });
    });
    
    this.rightButton.addEventListener('mousedown', () => {
      this.keyState.right = true;
      this.socket.emit('move', { direction: 'right' });
    });
    
    this.actionButton.addEventListener('mousedown', () => {
      this.socket.emit('move', { direction: 'space' });
    });
    
    // Mouse up events
    this.upButton.addEventListener('mouseup', () => {
      this.keyState.up = false;
      this.socket.emit('move', { direction: 'up_release' });
    });
    
    this.downButton.addEventListener('mouseup', () => {
      this.keyState.down = false;
      this.socket.emit('move', { direction: 'down_release' });
    });
    
    this.leftButton.addEventListener('mouseup', () => {
      this.keyState.left = false;
      this.socket.emit('move', { direction: 'left_release' });
    });
    
    this.rightButton.addEventListener('mouseup', () => {
      this.keyState.right = false;
      this.socket.emit('move', { direction: 'right_release' });
    });
    
    // Mouse leave events (in case mouse up happens outside the button)
    this.upButton.addEventListener('mouseleave', () => {
      if (this.keyState.up) {
        this.keyState.up = false;
        this.socket.emit('move', { direction: 'up_release' });
      }
    });
    
    this.downButton.addEventListener('mouseleave', () => {
      if (this.keyState.down) {
        this.keyState.down = false;
        this.socket.emit('move', { direction: 'down_release' });
      }
    });
    
    this.leftButton.addEventListener('mouseleave', () => {
      if (this.keyState.left) {
        this.keyState.left = false;
        this.socket.emit('move', { direction: 'left_release' });
      }
    });
    
    this.rightButton.addEventListener('mouseleave', () => {
      if (this.keyState.right) {
        this.keyState.right = false;
        this.socket.emit('move', { direction: 'right_release' });
      }
    });
  }
  
  /**
   * Handle window resize to show/hide mobile controls
   */
  handleResize() {
    if (!this.mobileControls) return;
    
    // Show mobile controls on small screens or touch devices
    if (window.innerWidth <= 768 || this.isTouchDevice) {
      this.mobileControls.classList.remove('hidden');
    } else {
      this.mobileControls.classList.add('hidden');
    }
  }
  
  /**
   * Update the visibility of the action button based on invulnerability availability
   * @param {boolean} hasInvulnerability - Whether the player has invulnerability available
   */
  updateActionButtonVisibility(hasInvulnerability) {
    if (!this.actionButton) return;
    
    if (hasInvulnerability) {
      this.actionButton.classList.remove('hidden');
    } else {
      this.actionButton.classList.add('hidden');
    }
  }
}

export default InputHandler;
