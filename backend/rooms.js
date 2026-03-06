const AuctionEngine = require('./auctionEngine');
const Franchise = require('./franchise');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room object
    this.socketToRoom = new Map(); // socketId -> roomCode
  }

  /**
   * Generate unique 6-character room code
   * @returns {string} Room code
   */
  generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Create a new room
   * @param {string} hostSocketId - Socket ID of host
   * @param {string} hostName - Name of host player
   * @returns {Object} Room code and room object
   */
  createRoom(hostSocketId, hostName) {
    const roomCode = this.generateRoomCode();
    
    const room = {
      roomCode: roomCode,
      hostId: hostSocketId,
      players: [{
        socketId: hostSocketId,
        name: hostName,
        franchiseName: null
      }],
      franchises: this.initializeFranchises(),
      auctionStarted: false,
      auctionEngine: null,
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    this.socketToRoom.set(hostSocketId, roomCode);

    return { roomCode, room };
  }

  /**
   * Initialize all 10 IPL franchises
   * @returns {Array} Array of franchise names
   */
  initializeFranchises() {
    return [
      { name: 'Chennai Super Kings', taken: false, socketId: null },
      { name: 'Mumbai Indians', taken: false, socketId: null },
      { name: 'Royal Challengers Bengaluru', taken: false, socketId: null },
      { name: 'Kolkata Knight Riders', taken: false, socketId: null },
      { name: 'Sunrisers Hyderabad', taken: false, socketId: null },
      { name: 'Rajasthan Royals', taken: false, socketId: null },
      { name: 'Delhi Capitals', taken: false, socketId: null },
      { name: 'Punjab Kings', taken: false, socketId: null },
      { name: 'Lucknow Super Giants', taken: false, socketId: null },
      { name: 'Gujarat Titans', taken: false, socketId: null }
    ];
  }

  /**
   * Join an existing room
   * @param {string} roomCode - Room code to join
   * @param {string} socketId - Socket ID of joining player
   * @param {string} playerName - Name of joining player
   * @returns {Object} Result with success flag and room/error
   */
  joinRoom(roomCode, socketId, playerName) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.auctionStarted) {
      return { success: false, error: 'Auction already started' };
    }

    // Check if player already in room
    const existingPlayer = room.players.find(p => p.socketId === socketId);
    if (existingPlayer) {
      return { success: true, room };
    }

    room.players.push({
      socketId: socketId,
      name: playerName,
      franchiseName: null
    });

    this.socketToRoom.set(socketId, roomCode);

    return { success: true, room };
  }

  /**
   * Select a franchise in the room
   * @param {string} roomCode - Room code
   * @param {string} socketId - Socket ID of player
   * @param {string} franchiseName - Name of franchise to select
   * @returns {Object} Result with success flag and error
   */
  selectTeam(roomCode, socketId, franchiseName) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.auctionStarted) {
      return { success: false, error: 'Auction already started' };
    }

    // Check if franchise is already taken
    const franchise = room.franchises.find(f => f.name === franchiseName);
    if (!franchise) {
      return { success: false, error: 'Invalid franchise name' };
    }

    if (franchise.taken && franchise.socketId !== socketId) {
      return { success: false, error: 'Team already taken' };
    }

    // Remove player's previous selection if any
    const player = room.players.find(p => p.socketId === socketId);
    if (player && player.franchiseName) {
      const prevFranchise = room.franchises.find(f => f.name === player.franchiseName);
      if (prevFranchise) {
        prevFranchise.taken = false;
        prevFranchise.socketId = null;
      }
    }

    // Assign franchise to player
    franchise.taken = true;
    franchise.socketId = socketId;
    
    if (player) {
      player.franchiseName = franchiseName;
    }

    return { success: true };
  }

  /**
   * Start the auction
   * @param {string} roomCode - Room code
   * @param {string} socketId - Socket ID of player starting (must be host)
   * @param {Array} players - Array of player objects for auction
   * @returns {Object} Result with success flag and error
   */
  startAuction(roomCode, socketId, players) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (socketId !== room.hostId) {
      return { success: false, error: 'Only host can start auction' };
    }

    if (room.auctionStarted) {
      return { success: false, error: 'Auction already started' };
    }

    // Create Franchise objects for all teams
    const franchiseObjects = room.franchises.map(f => {
      const franchise = new Franchise(f.name, !f.taken);
      if (f.socketId === room.hostId) {
        franchise.isHost = true;
      }
      return franchise;
    });

    // Initialize auction engine
    room.auctionEngine = new AuctionEngine();
    room.auctionEngine.initialize(franchiseObjects, players);
    room.auctionStarted = true;

    return { success: true, auctionEngine: room.auctionEngine };
  }

  /**
   * Handle player disconnect
   * @param {string} socketId - Socket ID of disconnected player
   * @returns {Object} Room and player info
   */
  handleDisconnect(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) {
      return null;
    }

    const room = this.rooms.get(roomCode);
    if (!room) {
      return null;
    }

    const player = room.players.find(p => p.socketId === socketId);
    
    if (!room.auctionStarted) {
      // Before auction: remove player and free their franchise
      room.players = room.players.filter(p => p.socketId !== socketId);
      
      if (player && player.franchiseName) {
        const franchise = room.franchises.find(f => f.name === player.franchiseName);
        if (franchise) {
          franchise.taken = false;
          franchise.socketId = null;
        }
      }

      // If host disconnects, assign new host
      if (socketId === room.hostId && room.players.length > 0) {
        room.hostId = room.players[0].socketId;
      }

      // Delete room if empty
      if (room.players.length === 0) {
        this.rooms.delete(roomCode);
      }
    } else {
      // After auction start: assign AI to franchise
      if (player && player.franchiseName && room.auctionEngine) {
        const franchise = room.auctionEngine.franchises.find(f => f.name === player.franchiseName);
        if (franchise) {
          franchise.isAI = true;
        }
      }
    }

    this.socketToRoom.delete(socketId);

    return { room, player };
  }

  /**
   * Get room by code
   * @param {string} roomCode - Room code
   * @returns {Object|null} Room object or null
   */
  getRoomByCode(roomCode) {
    return this.rooms.get(roomCode) || null;
  }

  /**
   * Get room by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Object|null} Room object or null
   */
  getRoomBySocketId(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    return roomCode ? this.rooms.get(roomCode) : null;
  }

  /**
   * Get all rooms
   * @returns {Array} Array of room objects
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

module.exports = RoomManager;
