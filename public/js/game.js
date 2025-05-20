/**
 * Main Game Client for Running Cats
 * Coordinates all game components and handles socket communication
 */

import Renderer from './renderer.js';
import InputHandler from './inputHandler.js';
import UIManager from './uiManager.js';

class GameClient {
  constructor() {
    // Game configuration
    this.config = {
      canvasWidth: 1000,
      canvasHeight: 600
    };
    
    // Game state
    this.gameState = {
      players: [],
      leaderboard: []
    };
    
    // Player information
    this.player = {
      id: null,
      name: '',
      value: 0,
      score: 0
    };
    
    // DOM elements
    this.elements = {
      loginScreen: document.getElementById('login-screen'),
      gameScreen: document.getElementById('game-screen'),
      playerNameInput: document.getElementById('player-name'),
      startGameButton: document.getElementById('start-game'),
      canvas: document.getElementById('game-canvas'),
      playerValue: document.getElementById('player-value'),
      playerScore: document.getElementById('player-score'),
      leaderboardEntries: document.getElementById('leaderboard-entries')
    };
    
    // Initialize components
    this.initializeComponents();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize socket connection
    this.initializeSocket();
  }
  
  /**
   * Initialize game components
   */
  initializeComponents() {
    // Create renderer
    this.renderer = new Renderer(
      this.elements.canvas,
      this.config.canvasWidth,
      this.config.canvasHeight
    );
    
    // Create UI manager
    this.uiManager = new UIManager(this.elements);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Start game button click event
    this.elements.startGameButton.addEventListener('click', this.startGame.bind(this));
    
    // Enter key in name input field
    this.elements.playerNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.startGame();
      }
    });
  }
  
  /**
   * Initialize socket connection
   */
  initializeSocket() {
    // Wait for io to be defined (in case it's loading from CDN)
    if (typeof io === 'undefined') {
      console.log('Waiting for Socket.IO to load...');
      setTimeout(this.initializeSocket.bind(this), 100);
      return;
    }
    
    try {
      // Get the current host
      const currentHost = window.location.hostname;
      
      // Connect to the appropriate backend
      console.log('Connecting to backend...');
      this.socket = io();
      
      // Handle connection errors
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        console.log('Attempting to reconnect...');
      });
      
      // Set up socket event handlers once connected
      this.setupSocketHandlers();
      
      // Create input handler after socket is initialized
      this.inputHandler = new InputHandler(this.socket);
    } catch (err) {
      console.error('Socket initialization error:', err);
    }
  }
  
  /**
   * Set up socket event handlers
   */
  setupSocketHandlers() {
    // Socket event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('gameState', (state) => {
      this.gameState = state;
      this.updateGame();
    });
    
    this.socket.on('registered', ({ player: newPlayer }) => {
      this.player.id = newPlayer.id;
      this.player.value = newPlayer.value;
      this.player.score = newPlayer.score;
      console.log('Registered as player:', this.player);
    });
  }
  
  /**
   * Start the game
   */
  startGame() {
    const playerName = this.elements.playerNameInput.value.trim();
    if (!playerName) {
      alert('Please enter your name');
      return;
    }
    
    this.player.name = playerName;
    
    // Check if socket is initialized
    if (!this.socket) {
      alert('Connecting to server, please try again in a moment...');
      this.initializeSocket(); // Try to initialize socket again
      return;
    }
    
    // Register with the server
    this.socket.emit('register', { name: playerName });
    
    // Show game screen
    this.uiManager.showGameScreen();
    
    // Start movement interval
    this.inputHandler.startMovementInterval();
    
    // Start game loop
    this.startGameLoop();
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    // Set up the game loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Game loop
   */
  gameLoop() {
    // Update the game
    this.updateGame();
    
    // Continue the game loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Update the game
   */
  updateGame() {
    // Find current player in game state
    const currentPlayer = this.gameState.players.find(p => p.id === this.player.id);
    
    // Update player info
    if (currentPlayer) {
      this.player.value = currentPlayer.value;
      this.player.score = currentPlayer.score;
      this.uiManager.updatePlayerInfo(currentPlayer);
    }
    
    // Update leaderboard
    const leaderboardWithCurrent = this.gameState.leaderboard.map(player => ({
      ...player,
      isCurrent: player.id === this.player.id
    }));
    this.uiManager.updateLeaderboard(leaderboardWithCurrent);
    
    // Render the game
    this.renderer.renderGame(this.gameState, this.player.id);
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gameClient = new GameClient();
});

export default GameClient;
