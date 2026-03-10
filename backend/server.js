const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const RoomManager = require('./rooms');
const PlayerDatabase = require('./playerDatabase');
const AIBiddingEngine = require('./aiEngine');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.get("/", (req, res) => {
  res.send("IPL Auction Backend Running 🚀 - v2.0");
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// API endpoint to serve players data
app.get('/api/players', (req, res) => {
  try {
    const players = playerDatabase.getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to load players' });
  }
});

// Initialize managers
const roomManager = new RoomManager();
const playerDatabase = new PlayerDatabase();
const aiEngine = new AIBiddingEngine();

// Load players on startup
try {
  playerDatabase.loadPlayers();
  console.log(`Loaded ${playerDatabase.getAllPlayers().length} players`);
} catch (error) {
  console.error('Failed to load players:', error);
  process.exit(1);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create Room
  socket.on('createRoom', ({ playerName }) => {
    try {
      const { roomCode, room } = roomManager.createRoom(socket.id, playerName);
      socket.join(roomCode);
      socket.emit('roomCreated', { roomCode, room });
      console.log(`Room created: ${roomCode} by ${playerName}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join Room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    try {
      const result = roomManager.joinRoom(roomCode, socket.id, playerName);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.join(roomCode);
      socket.emit('roomJoined', { room: result.room });
      socket.to(roomCode).emit('playerJoined', {
        socketId: socket.id,
        name: playerName
      });
      console.log(`${playerName} joined room: ${roomCode}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Select Team
  socket.on('selectTeam', ({ franchiseName }) => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      const result = roomManager.selectTeam(room.roomCode, socket.id, franchiseName);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(room.roomCode).emit('teamSelected', {
        socketId: socket.id,
        franchiseName: franchiseName
      });
      console.log(`Team selected: ${franchiseName} by ${socket.id}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to select team' });
    }
  });

  // Start Auction
  socket.on('startAuction', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      const players = playerDatabase.getUnsoldPlayers();
      const result = roomManager.startAuction(room.roomCode, socket.id, players);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      const firstPlayer = result.auctionEngine.startAuction();
      const auctionState = result.auctionEngine.getAuctionState();

      io.to(room.roomCode).emit('auctionStarted', {
        auctionState: auctionState,
        currentPlayer: firstPlayer
      });
      console.log(`Auction started in room: ${room.roomCode}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to start auction' });
    }
  });

  // Place Bid
  socket.on("placeBid", ({ amount, franchise: franchiseNameFromClient }) => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      const player = room.players.find(p => p.socketId === socket.id);
      console.log('Place bid - Socket ID:', socket.id, 'Player:', player);
      
      if (!player || !player.franchiseName) {
        socket.emit('error', { message: 'No franchise selected' });
        return;
      }

      const franchiseObj = room.auctionEngine.franchises.find(f => f.name === player.franchiseName);
      console.log('Franchise found:', franchiseObj ? franchiseObj.name : 'NOT FOUND');
      console.log('Franchise from client:', franchiseNameFromClient);
      
      if (!franchiseObj) {
        socket.emit('error', { message: 'Franchise not found' });
        return;
      }

      const result = room.auctionEngine.placeBid(franchiseObj, amount);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      console.log('Bid placed by:', franchiseObj.name, 'Amount:', amount);
      
      io.to(room.roomCode).emit('bidPlaced', {
        franchise: franchiseObj.name,
        amount: amount,
        auctionState: room.auctionEngine.getAuctionState()
      });
    } catch (error) {
      console.error('Place bid error:', error);
      socket.emit('error', { message: 'Failed to place bid' });
    }
  });

  // Pass
  socket.on('pass', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        return;
      }

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || !player.franchiseName) {
        return;
      }

      const franchise = room.auctionEngine.franchises.find(f => f.name === player.franchiseName);
      if (franchise) {
        room.auctionEngine.pass(franchise);
      }
    } catch (error) {
      console.error('Pass error:', error);
    }
  });

  // Mark Sold
  socket.on('markSold', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can mark sold' });
        return;
      }

      const result = room.auctionEngine.markSold();
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(room.roomCode).emit('playerSold', {
        player: result.player,
        franchise: result.franchise,
        price: result.price
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark sold' });
    }
  });

  // Mark Unsold
  socket.on('markUnsold', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can mark unsold' });
        return;
      }

      const result = room.auctionEngine.markUnsold();
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(room.roomCode).emit('playerUnsold', {
        player: result.player
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark unsold' });
    }
  });

  // Next Player
  socket.on('nextPlayer', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can advance' });
        return;
      }

      const nextPlayer = room.auctionEngine.nextPlayer();
      
      if (!nextPlayer) {
        // Auction finished
        io.to(room.roomCode).emit('auctionFinished', {
          results: room.auctionEngine.getAuctionState()
        });
        return;
      }

      io.to(room.roomCode).emit('nextPlayerAnnounced', {
        player: nextPlayer,
        auctionState: room.auctionEngine.getAuctionState()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to advance to next player' });
    }
  });

  // Pause Auction
  socket.on('pauseAuction', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can pause' });
        return;
      }

      room.auctionEngine.pauseAuction();
      io.to(room.roomCode).emit('auctionPaused');
    } catch (error) {
      socket.emit('error', { message: 'Failed to pause auction' });
    }
  });

  // Resume Auction
  socket.on('resumeAuction', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room || !room.auctionEngine) {
        socket.emit('error', { message: 'Auction not active' });
        return;
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can resume' });
        return;
      }

      room.auctionEngine.resumeAuction();
      io.to(room.roomCode).emit('auctionResumed');
    } catch (error) {
      socket.emit('error', { message: 'Failed to resume auction' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const result = roomManager.handleDisconnect(socket.id);
    
    if (result && result.room) {
      io.to(result.room.roomCode).emit('playerLeft', {
        socketId: socket.id,
        player: result.player
      });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
