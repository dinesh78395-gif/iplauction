# IPL Mock Auction

Full-stack web application for simulating IPL player auctions with Computer Mode (offline with AI) and Multiplayer Mode (online real-time).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Start the server:
```bash
npm start
```

4. Open browser to `http://localhost:3000`

## Project Structure

- `backend/` - Node.js server with Express and Socket.IO
- `frontend/` - HTML, CSS, JavaScript client
- `backend/data/` - JSON data files (players.json)

## Features

- Computer Mode: Play offline against 9 AI opponents
- Multiplayer Mode: Create/join rooms and play with friends
- Real-time bidding with Socket.IO
- IPL squad rules enforcement (25 player limit, 8 overseas limit)
- Premium UI with glassmorphism effects
