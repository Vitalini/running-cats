/**
 * Server for Running Cats game
 * Handles socket connections, player registration, and game state updates
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const Game = require('../engine/Game');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Create a new game instance
const game = new Game();

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle player registration
  socket.on('register', ({ name }) => {
    const player = game.addPlayer(socket.id, name);
    socket.emit('registered', { player });
    
    // Broadcast updated game state to all clients
    io.emit('gameState', game.getState());
  });
  
  // Handle player movement
  socket.on('move', ({ direction }) => {
    const updatedPlayer = game.movePlayer(socket.id, direction);
    if (updatedPlayer) {
      // Broadcast updated game state to all clients
      io.emit('gameState', game.getState());
    }
  });
  
  // Обработка изменения номера кота при укрытии под островком
  socket.on('changeValue', ({ playerId }) => {
    // Получаем игрока
    const player = game.players.get(playerId);
    if (player) {
      // Меняем номер кота
      player.value = game.generateRandomValue();
      
      // Отправляем обновленное состояние игры
      io.emit('gameState', game.getState());
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    game.removePlayer(socket.id);
    
    // Broadcast updated game state to all clients
    io.emit('gameState', game.getState());
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
