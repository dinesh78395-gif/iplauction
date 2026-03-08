// Lobby.js - Multiplayer Lobby Logic

let socket = null;
let currentRoom = null;
let mySocketId = null;
let myFranchise = null;
let isHost = false;

// Initialize Socket.IO connection
function initializeSocket() {
  socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Connected to server');
    mySocketId = socket.id;
    updateConnectionStatus('connected');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('disconnected');
  });

  socket.on('reconnecting', () => {
    updateConnectionStatus('reconnecting');
  });

  // Room events
  socket.on('roomCreated', handleRoomCreated);
  socket.on('roomJoined', handleRoomJoined);
  socket.on('teamSelected', handleTeamSelected);
  socket.on('playerJoined', handlePlayerJoined);
  socket.on('playerLeft', handlePlayerLeft);
  socket.on('auctionStarted', handleAuctionStarted);
  socket.on('error', handleError);
}

// Update connection status indicator
function updateConnectionStatus(status) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');

  statusIndicator.className = 'status-indicator';
  
  if (status === 'connected') {
    statusIndicator.classList.add('connected');
    statusText.textContent = 'Connected';
  } else if (status === 'disconnected') {
    statusIndicator.classList.add('disconnected');
    statusText.textContent = 'Disconnected';
  } else {
    statusText.textContent = 'Connecting...';
  }
}

// Toggle between Create and Join Room
document.getElementById('createRoomToggle').addEventListener('click', () => {
  playClickSound();
  document.getElementById('createRoomToggle').classList.add('active');
  document.getElementById('joinRoomToggle').classList.remove('active');
  document.getElementById('createRoomForm').classList.remove('hidden');
  document.getElementById('joinRoomForm').classList.add('hidden');
});

document.getElementById('joinRoomToggle').addEventListener('click', () => {
  playClickSound();
  document.getElementById('joinRoomToggle').classList.add('active');
  document.getElementById('createRoomToggle').classList.remove('active');
  document.getElementById('joinRoomForm').classList.remove('hidden');
  document.getElementById('createRoomForm').classList.add('hidden');
});

// Create Room
document.getElementById('createRoomBtn').addEventListener('click', () => {
  playClickSound();
  const playerName = document.getElementById('createPlayerName').value.trim();
  
  if (!playerName) {
    playErrorSound();
    showToast('Please enter your name', 'error');
    return;
  }

  socket.emit('createRoom', { playerName });
});

// Join Room
document.getElementById('joinRoomBtn').addEventListener('click', () => {
  playClickSound();
  const roomCode = document.getElementById('joinRoomCode').value.trim().toUpperCase();
  const playerName = document.getElementById('joinPlayerName').value.trim();
  
  if (!roomCode || !playerName) {
    playErrorSound();
    showToast('Please enter room code and your name', 'error');
    return;
  }

  socket.emit('joinRoom', { roomCode, playerName });
});

// Handle Room Created
function handleRoomCreated({ roomCode, room }) {
  playSuccessSound();
  currentRoom = room;
  isHost = true;
  
  document.getElementById('roomSetup').classList.add('hidden');
  document.getElementById('lobbyContent').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').textContent = roomCode;
  
  updatePlayersList(room.players);
  setupFranchiseSelection();
  
  showToast('Room created successfully!', 'success');
}

// Handle Room Joined
function handleRoomJoined({ room }) {
  playSuccessSound();
  currentRoom = room;
  isHost = room.hostId === mySocketId;
  
  document.getElementById('roomSetup').classList.add('hidden');
  document.getElementById('lobbyContent').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').textContent = room.roomCode;
  
  updatePlayersList(room.players);
  setupFranchiseSelection();
  updateFranchiseAvailability(room.franchises);
  
  showToast('Joined room successfully!', 'success');
}

// Handle Team Selected
function handleTeamSelected({ socketId, franchiseName }) {
  playClickSound();
  // Update franchise availability
  const franchiseCards = document.querySelectorAll('.franchise-card-small');
  franchiseCards.forEach(card => {
    if (card.dataset.franchise === franchiseName) {
      card.classList.add('locked');
      card.querySelector('.lock-icon').classList.remove('hidden');
      
      if (socketId === mySocketId) {
        card.classList.add('selected');
        myFranchise = franchiseName;
      }
    }
  });

  // Update players list
  if (currentRoom) {
    const player = currentRoom.players.find(p => p.socketId === socketId);
    if (player) {
      player.franchiseName = franchiseName;
      updatePlayersList(currentRoom.players);
    }
  }
}

// Handle Player Joined
function handlePlayerJoined({ socketId, name }) {
  if (currentRoom) {
    currentRoom.players.push({ socketId, name, franchiseName: null });
    updatePlayersList(currentRoom.players);
    showToast(`${name} joined the room`, 'info');
  }
}

// Handle Player Left
function handlePlayerLeft({ socketId, player }) {
  if (currentRoom) {
    currentRoom.players = currentRoom.players.filter(p => p.socketId !== socketId);
    updatePlayersList(currentRoom.players);
    
    if (player && player.franchiseName) {
      // Free up the franchise
      const franchiseCard = document.querySelector(`[data-franchise="${player.franchiseName}"]`);
      if (franchiseCard) {
        franchiseCard.classList.remove('locked', 'selected');
        franchiseCard.querySelector('.lock-icon').classList.add('hidden');
      }
    }
    
    showToast(`${player?.name || 'A player'} left the room`, 'warning');
  }
}

// Handle Auction Started
function handleAuctionStarted({ auctionState, currentPlayer }) {
  playSuccessSound();
  // Store multiplayer mode data
  saveToLocalStorage('multiplayerMode', {
    roomCode: currentRoom.roomCode,
    myFranchise: myFranchise,
    isHost: isHost,
    mode: 'multiplayer'
  });

  // Navigate to auction page
  window.location.href = 'auction.html';
}

// Handle Error
function handleError({ message }) {
  playErrorSound();
  showToast(message, 'error');
}

// Update Players List
function updatePlayersList(players) {
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = '';

  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    if (player.socketId === currentRoom.hostId) {
      playerItem.classList.add('host');
    }

    const franchiseText = player.franchiseName || 'Not Selected';
    playerItem.innerHTML = `
      <span>${player.name}</span>
      <span style="color: var(--color-text-secondary); font-size: 0.875rem;">${franchiseText}</span>
    `;

    playersList.appendChild(playerItem);
  });

  // Update start button
  if (isHost) {
    document.getElementById('startAuctionLobbyBtn').disabled = false;
  }
}

// Setup Franchise Selection
function setupFranchiseSelection() {
  const franchiseCards = document.querySelectorAll('.franchise-card-small');
  
  franchiseCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('locked')) {
        playErrorSound();
        showToast('This franchise is already taken', 'warning');
        return;
      }

      playClickSound();
      const franchiseName = card.dataset.franchise;
      socket.emit('selectTeam', { franchiseName });
    });
  });
}

// Update Franchise Availability
function updateFranchiseAvailability(franchises) {
  franchises.forEach(franchise => {
    const card = document.querySelector(`[data-franchise="${franchise.name}"]`);
    if (card && franchise.taken) {
      card.classList.add('locked');
      card.querySelector('.lock-icon').classList.remove('hidden');
    }
  });
}

// Copy Room Code
document.getElementById('copyRoomCodeBtn').addEventListener('click', async () => {
  playClickSound();
  const roomCode = document.getElementById('roomCodeDisplay').textContent;
  const success = await copyToClipboard(roomCode);
  
  if (success) {
    playSuccessSound();
    showToast('Room code copied!', 'success');
  } else {
    playErrorSound();
    showToast('Failed to copy room code', 'error');
  }
});

// Start Auction (Host Only)
document.getElementById('startAuctionLobbyBtn').addEventListener('click', () => {
  playClickSound();
  if (!isHost) {
    playErrorSound();
    showToast('Only the host can start the auction', 'error');
    return;
  }

  if (!myFranchise) {
    playErrorSound();
    showToast('Please select a franchise first', 'warning');
    return;
  }

  socket.emit('startAuction');
});

// Leave Lobby
document.getElementById('leaveLobbyBtn').addEventListener('click', () => {
  playClickSound();
  if (socket) {
    socket.disconnect();
  }
  window.location.href = 'index.html';
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initializeSocket();
});
