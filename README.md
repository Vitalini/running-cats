# 🐱 Running Cats Race 🐱

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

A fun multiplayer 2D game where players control cats and race against each other. Catch smaller cats, avoid bigger ones, and compete for the top spot on the leaderboard!

![Running Cats Game Screenshot](docs/screenshot.png)

## 🎮 Game Features

- **Multiplayer Racing**: Compete with other players in real-time
- **Cat Characters**: Control cute, square-shaped cats with unique colors
- **Power-ups**: Gain invulnerability and super speed
- **Strategic Islands**: Hide behind islands to change your cat's number
- **Dynamic Number System**: Your cat's number changes after hiding for 8 seconds
- **Visual Indicators**: Special effects for super speed and invulnerability
- **Leaderboard**: See who's winning in real-time
- **Responsive Controls**: Smooth movement with arrow keys or WASD
- **Mobile Support**: Play on your phone or tablet with touch controls

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.0.0 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vitalini/running-cats.git
   cd running-cats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and go to: [http://localhost:3000](http://localhost:3000)

## 🎯 How to Play

1. Enter your name and click "Start Game"
2. Use arrow keys or WASD to move your cat
3. Try to catch cats smaller than yours (with lower numbers)
4. Avoid cats larger than yours (with higher numbers)
5. Hide behind islands to change your cat's number after 8 seconds
6. Press SPACE to activate invulnerability (when available)
7. Eat 3 cats to earn the invulnerability ability
8. The timer only appears when you're hiding behind an island
9. Leaving an island resets the timer when you return
10. Compete for the highest score on the leaderboard

## 🏗️ Project Structure

```
running-cats/
├── docs/                   # Documentation files
├── public/                 # Static files served to the client
│   ├── index.html          # Main HTML file
│   ├── css/                # Compiled CSS files
│   ├── js/                 # Compiled JavaScript files
│   └── assets/             # Images and other assets
├── src/                    # Source code
│   ├── engine/             # Game engine
│   │   └── Game.js         # Core game logic
│   ├── server/             # Server-side code
│   │   └── server.js       # Express and Socket.IO server
│   ├── js/                 # Client-side JavaScript
│   │   ├── game.js         # Main game client
│   │   ├── renderer.js     # Game rendering
│   │   ├── inputHandler.js # User input handling
│   │   └── uiManager.js    # UI management
│   └── css/                # CSS styles
│       └── style.css       # Main stylesheet
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

## 🔧 Development

To run the game in development mode with automatic restarts:

```bash
npm run dev
```

## 📦 Deployment

### Deploying to Render.com (Free)

Render.com offers a free plan for web services that supports WebSockets, which are necessary for the multiplayer functionality of the game.

1. Create an account on [Render.com](https://render.com)
2. In the Render dashboard, click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following parameters:
   - Name: running-cats (or any other name)
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free
5. Click "Create Web Service"

After the deployment is complete, your game will be available at the URL provided by Render.com.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 🙏 Acknowledgements

- [Socket.IO](https://socket.io/) for real-time communication
- [Express](https://expressjs.com/) for the web server
- [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for rendering

---

Created with ❤️ by Vitalini

- Use arrow keys or WASD keys for movement
- Press space for a speed boost (if available)
- Collect power-ups along the way
- Avoid obstacles to maintain your speed

## Technologies

- Node.js
- Express
- Socket.IO
- HTML5 Canvas
