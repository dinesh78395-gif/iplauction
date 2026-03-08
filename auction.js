// Auction.js - Auction Room Logic

// Team color mappings (jersey colors) - Using lighter, more vibrant colors for visibility
const teamColors = {
  'Chennai Super Kings': { primary: '#FDB913', secondary: '#0080FF', textOnPrimary: '#000000' },
  'Mumbai Indians': { primary: '#0099FF', secondary: '#FFD700', textOnPrimary: '#FFFFFF' },
  'Royal Challengers Bengaluru': { primary: '#FF3333', secondary: '#FFD700', textOnPrimary: '#FFFFFF' },
  'Kolkata Knight Riders': { primary: '#9966FF', secondary: '#FFD700', textOnPrimary: '#FFFFFF' },
  'Sunrisers Hyderabad': { primary: '#FF9933', secondary: '#000000', textOnPrimary: '#000000' },
  'Rajasthan Royals': { primary: '#4A90E2', secondary: '#FF69B4', textOnPrimary: '#FFFFFF' },
  'Delhi Capitals': { primary: '#3399FF', secondary: '#FF4444', textOnPrimary: '#FFFFFF' },
  'Punjab Kings': { primary: '#FF3344', secondary: '#FFD700', textOnPrimary: '#FFFFFF' },
  'Lucknow Super Giants': { primary: '#5DADE2', secondary: '#FF6B6B', textOnPrimary: '#000000' },
  'Gujarat Titans': { primary: '#5B9BD5', secondary: '#85C1E9', textOnPrimary: '#FFFFFF' }
};

let mode = null; // 'computer' or 'multiplayer'
let socket = null;
let auctionEngine = null;
let aiEngine = null;
let franchises = [];
let players = [];
let myFranchise = null;
let isHost = false;
let aiTimeout = null;
let autoSellTimeout = null;
let lastBidTime = null;

// Initialize auction based on mode
async function initializeAuction() {
  // Check mode
  const computerMode = loadFromLocalStorage('computerMode');
  const multiplayerMode = loadFromLocalStorage('multiplayerMode');

  if (computerMode) {
    mode = 'computer';
    await initializeComputerMode(computerMode);
  } else if (multiplayerMode) {
    mode = 'multiplayer';
    initializeMultiplayerMode(multiplayerMode);
  } else {
    showToast('No auction data found', 'error');
    setTimeout(() => window.location.href = 'index.html', 2000);
  }
}

// Initialize Computer Mode
async function initializeComputerMode(data) {
  try {
    // Load players from API
    const response = await fetch('https://iplauction-096t.onrender.com/api/players');
    players = await response.json();

    // Create franchises
    const franchiseNames = [
      'Chennai Super Kings', 'Mumbai Indians', 'Royal Challengers Bengaluru',
      'Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Rajasthan Royals',
      'Delhi Capitals', 'Punjab Kings', 'Lucknow Super Giants', 'Gujarat Titans'
    ];

    franchises = franchiseNames.map(name => {
      const isAI = name !== data.selectedFranchise;
      return new Franchise(name, isAI);
    });

    myFranchise = franchises.find(f => f.name === data.selectedFranchise);

    // Apply team theme colors
    applyTeamTheme(data.selectedFranchise);

    // Initialize engines
    auctionEngine = new AuctionEngine();
    auctionEngine.initialize(franchises, players);
    
    aiEngine = new AIBiddingEngine();

    // Start auction
    const firstPlayer = auctionEngine.startAuction();
    displayPlayer(firstPlayer);
    updateDashboard();

    // Hide manual control buttons in computer mode (auto-sell is enabled)
    document.getElementById('markSoldBtn').classList.add('hidden');
    document.getElementById('markUnsoldBtn').classList.add('hidden');
    document.getElementById('nextPlayerBtn').classList.add('hidden');

    // Trigger initial AI bidding after a delay
    setTimeout(() => processAIBids(), 2000);

    showToast('Auction started!', 'success');
  } catch (error) {
    console.error('Error initializing computer mode:', error);
    playErrorSound();
    showToast('Failed to load auction data', 'error');
  }
}

// Apply team theme colors
function applyTeamTheme(teamName) {
  const colors = teamColors[teamName];
  if (!colors) return;
  
  // Update CSS variables
  document.documentElement.style.setProperty('--color-accent', colors.primary);
  document.documentElement.style.setProperty('--color-accent-hover', colors.secondary);
  
  // Create a custom style element for dynamic theming
  let styleEl = document.getElementById('dynamic-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme';
    document.head.appendChild(styleEl);
  }
  
  styleEl.textContent = `
    :root {
      --color-accent: ${colors.primary};
      --color-accent-hover: ${colors.secondary};
    }
    
    /* Ensure buttons have good contrast and visibility */
    .btn-primary, .btn-bid {
      background: ${colors.primary} !important;
      color: ${colors.textOnPrimary} !important;
      border: 2px solid ${colors.secondary} !important;
      font-weight: 700 !important;
      text-shadow: ${colors.textOnPrimary === '#000000' ? '0 1px 2px rgba(255,255,255,0.5)' : '0 1px 2px rgba(0,0,0,0.5)'} !important;
    }
    
    .btn-primary:hover, .btn-bid:hover {
      background: ${colors.secondary} !important;
      color: ${colors.textOnPrimary === '#000000' ? '#FFFFFF' : '#000000'} !important;
      border-color: ${colors.primary} !important;
      box-shadow: 0 0 25px ${colors.primary}, 0 0 50px ${colors.primary}80 !important;
      transform: scale(1.05) !important;
    }
    
    /* Accent text with maximum visibility */
    .current-bid-amount, .player-base-price {
      color: ${colors.primary} !important;
      text-shadow: 0 0 15px ${colors.primary}, 0 0 30px ${colors.primary}80, 0 2px 4px rgba(0,0,0,0.8) !important;
      font-weight: 800 !important;
    }
    
    .franchise-info-name:not(.ai) {
      color: ${colors.primary} !important;
      text-shadow: 0 0 10px ${colors.primary}CC, 0 2px 4px rgba(0,0,0,0.8) !important;
      font-weight: 700 !important;
    }
    
    .bid-item-amount {
      color: ${colors.primary} !important;
      text-shadow: 0 0 8px ${colors.primary}AA, 0 1px 2px rgba(0,0,0,0.8) !important;
      font-weight: 700 !important;
    }
    
    /* Highest bidder glow - more prominent */
    .franchise-dashboard-item.highest-bidder {
      border: 3px solid ${colors.primary} !important;
      box-shadow: 0 0 30px ${colors.primary}, 0 0 60px ${colors.primary}60, inset 0 0 30px ${colors.primary}30 !important;
      background: linear-gradient(135deg, rgba(${hexToRgb(colors.primary)}, 0.15), rgba(${hexToRgb(colors.secondary)}, 0.1)) !important;
    }
    
    /* View Squad button with better visibility */
    .btn-view-squad {
      background: ${colors.primary} !important;
      color: ${colors.textOnPrimary} !important;
      border: 2px solid ${colors.secondary} !important;
      font-weight: 700 !important;
      text-shadow: ${colors.textOnPrimary === '#000000' ? '0 1px 2px rgba(255,255,255,0.5)' : '0 1px 2px rgba(0,0,0,0.5)'} !important;
    }
    
    .btn-view-squad:hover {
      background: ${colors.secondary} !important;
      color: ${colors.textOnPrimary === '#000000' ? '#FFFFFF' : '#000000'} !important;
      box-shadow: 0 0 15px ${colors.primary}, 0 0 30px ${colors.primary}80 !important;
      transform: translateY(-2px) !important;
    }
    
    /* Sold popup with vibrant colors */
    .sold-popup {
      border: 4px solid ${colors.primary} !important;
      box-shadow: 0 0 50px ${colors.primary}, 0 0 100px ${colors.primary}80 !important;
      background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(${hexToRgb(colors.primary)}, 0.2)) !important;
    }
    
    .sold-price {
      color: ${colors.primary} !important;
      text-shadow: 0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}80, 0 2px 4px rgba(0,0,0,0.8) !important;
    }
    
    /* Player card accent */
    .player-card {
      border-top: 4px solid ${colors.primary} !important;
      box-shadow: 0 0 20px ${colors.primary}40 !important;
    }
    
    /* Pause/Resume button */
    #pauseResumeBtn {
      background: ${colors.primary} !important;
      color: ${colors.textOnPrimary} !important;
      border: 2px solid ${colors.secondary} !important;
    }
    
    #pauseResumeBtn:hover {
      background: ${colors.secondary} !important;
      box-shadow: 0 0 20px ${colors.primary} !important;
    }
  `;
  
  // Add a more vibrant gradient background
  document.body.style.background = `linear-gradient(135deg, 
    rgba(0, 0, 0, 0.95) 0%, 
    rgba(${hexToRgb(colors.primary)}, 0.18) 40%, 
    rgba(${hexToRgb(colors.secondary)}, 0.12) 60%,
    rgba(0, 0, 0, 0.95) 100%)`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 215, 0';
}

// Initialize Multiplayer Mode
function initializeMultiplayerMode(data) {
  myFranchise = data.myFranchise;
  isHost = data.isHost;

 
// Connect to socket
  socket = io("https://iplauction-096t.onrender.com");

  socket.on('connect', () => {
    console.log('Connected to auction');
  });

  socket.on('bidPlaced', handleBidPlaced);
  socket.on('playerSold', handlePlayerSold);
  socket.on('playerUnsold', handlePlayerUnsold);
  socket.on('nextPlayerAnnounced', handleNextPlayer);
  socket.on('auctionPaused', handleAuctionPaused);
  socket.on('auctionResumed', handleAuctionResumed);
  socket.on('auctionFinished', handleAuctionFinished);
  socket.on('error', handleError);

  // Show host controls
  if (isHost) {
    document.getElementById('markSoldBtn').classList.remove('hidden');
    document.getElementById('markUnsoldBtn').classList.remove('hidden');
    document.getElementById('nextPlayerBtn').classList.remove('hidden');
  }
}

// Display Player Card
function displayPlayer(player) {
  document.getElementById('playerName').textContent = player.name;
  document.getElementById('playerNationality').textContent = player.nationality;
  document.getElementById('playerRole').textContent = player.role;
  document.getElementById('playerType').textContent = player.overseas ? '🌍 Overseas' : '🇮🇳 Indian';
  document.getElementById('playerBasePrice').textContent = formatCurrency(player.basePrice / 100);
  
  const currentBid = mode === 'computer' ? auctionEngine.currentBid : 0;
  document.getElementById('currentBidAmount').textContent = formatCurrency(currentBid);
  document.getElementById('highestBidder').textContent = 'No bids yet';

  // Update player counter
  const currentIndex = mode === 'computer' ? auctionEngine.currentPlayerIndex + 1 : 1;
  const totalPlayers = mode === 'computer' ? auctionEngine.allPlayers.length : 200;
  document.getElementById('playerCounter').textContent = `Player ${currentIndex} of ${totalPlayers}`;
  
  // Reset auto-sell timer
  if (mode === 'computer') {
    startAutoSellTimer();
    // Trigger AI bidding for new player after a short delay
    setTimeout(() => processAIBids(), 1500);
  }
}

// Start auto-sell timer (10 seconds after last bid)
function startAutoSellTimer() {
  clearTimeout(autoSellTimeout);
  lastBidTime = Date.now();
  
  autoSellTimeout = setTimeout(() => {
    if (mode === 'computer' && auctionEngine.auctionActive && !auctionEngine.auctionPaused) {
      // Auto-sell to highest bidder or mark unsold
      if (auctionEngine.highestBidder) {
        const result = auctionEngine.markSold();
        if (result.success) {
          playSoldSound();
          showSoldPopup(result.player, result.franchise, result.price);
          setTimeout(() => {
            const nextPlayer = auctionEngine.nextPlayer();
            if (nextPlayer) {
              playNextPlayerSound();
              displayPlayer(nextPlayer);
              updateDashboard();
              document.getElementById('bidFeed').innerHTML = '<div class="bid-feed-empty">No bids yet</div>';
            } else {
              finishAuction();
            }
          }, 2500);
        }
      } else {
        // No bids, mark unsold
        playUnsoldSound();
        auctionEngine.markUnsold();
        showToast('Player went unsold', 'info');
        setTimeout(() => {
          const nextPlayer = auctionEngine.nextPlayer();
          if (nextPlayer) {
            playNextPlayerSound();
            displayPlayer(nextPlayer);
            updateDashboard();
            document.getElementById('bidFeed').innerHTML = '<div class="bid-feed-empty">No bids yet</div>';
          } else {
            finishAuction();
          }
        }, 1000);
      }
    }
  }, 10000);
}

// Update Dashboard
function updateDashboard() {
  const dashboardContainer = document.getElementById('franchisesDashboard');
  dashboardContainer.innerHTML = '';

  const franchisesList = mode === 'computer' ? franchises : [];

  franchisesList.forEach(franchise => {
    const item = document.createElement('div');
    item.className = 'franchise-dashboard-item';
    
    if (mode === 'computer' && auctionEngine.highestBidder === franchise) {
      item.classList.add('highest-bidder');
    }

    const warnings = franchise.getWarnings();
    if (warnings.squadSizeWarning || warnings.overseasWarning) {
      item.classList.add('warning');
    }

    // Create elements
    const franchiseInfo = document.createElement('div');
    franchiseInfo.className = 'franchise-info';
    
    const franchiseName = document.createElement('span');
    franchiseName.className = `franchise-info-name ${franchise.isAI ? 'ai' : ''}`;
    franchiseName.textContent = franchise.name;
    franchiseInfo.appendChild(franchiseName);
    
    const franchiseStats = document.createElement('div');
    franchiseStats.className = 'franchise-stats';
    franchiseStats.innerHTML = `
      <span>Purse: ${formatCurrency(franchise.getRemainingPurse(), true)}</span>
      <span>Squad: ${franchise.getSquadSize()}/25</span>
      <span>Overseas: ${franchise.getOverseasCount()}/8</span>
    `;
    
    const viewButton = document.createElement('button');
    viewButton.className = 'btn-view-squad';
    viewButton.textContent = 'View Squad';
    viewButton.style.cssText = 'font-size: 0.75rem; padding: 0.25rem 0.75rem; margin-top: 0.5rem; width: 100%; background: var(--color-accent); color: var(--color-bg-primary); border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;';
    
    // Add click handler directly
    viewButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      playClickSound();
      showSquadModal(franchise.name);
    };
    
    item.appendChild(franchiseInfo);
    item.appendChild(franchiseStats);
    item.appendChild(viewButton);
    
    dashboardContainer.appendChild(item);
  });
}

// Show Squad Modal
function showSquadModal(franchiseName) {
  const franchise = franchises.find(f => f.name === franchiseName);
  if (!franchise) return;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'squad-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: var(--color-bg-secondary);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  `;
  
  let playersHTML = '';
  if (franchise.squad.length > 0) {
    franchise.squad.forEach(player => {
      // The price is stored as 'purchasePrice' in the Franchise class
      const price = player.purchasePrice || player.soldPrice || 0;
      
      // Smart price formatting: show in lakhs if less than 1 crore, otherwise in crore
      const priceDisplay = (price && price < 1)
        ? formatCurrency(price, false) 
        : formatCurrency(price, true);
      
      playersHTML += `
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--color-bg-primary); border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div>
            <div style="font-weight: 600;">${player.name}</div>
            <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${player.role} • ${player.overseas ? 'Overseas' : 'Indian'}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: var(--color-accent); font-weight: 600;">${priceDisplay}</div>
          </div>
        </div>
      `;
    });
  } else {
    playersHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">No players yet</p>';
  }
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0;">${franchiseName}</h2>
      <button class="btn-close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-primary);">✕</button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
      <div style="text-align: center; padding: 1rem; background: var(--color-bg-primary); border-radius: 0.5rem;">
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Total Spent</div>
        <div style="font-size: 1.25rem; font-weight: 600; color: var(--color-accent);">${formatCurrency(franchise.getTotalSpent(), true)}</div>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--color-bg-primary); border-radius: 0.5rem;">
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Remaining</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${formatCurrency(franchise.getRemainingPurse(), true)}</div>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--color-bg-primary); border-radius: 0.5rem;">
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Squad Size</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${franchise.getSquadSize()}/25</div>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--color-bg-primary); border-radius: 0.5rem;">
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Overseas</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${franchise.getOverseasCount()}/8</div>
      </div>
    </div>
    <h3 style="margin-bottom: 1rem;">Squad (${franchise.squad.length})</h3>
    <div style="max-height: 300px; overflow-y: auto;">
      ${playersHTML}
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal handlers
  const closeModal = () => {
    playClickSound();
    document.body.removeChild(modal);
  };
  
  modalContent.querySelector('.btn-close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Bid Buttons
document.querySelectorAll('.btn-bid').forEach(button => {
  button.addEventListener('click', () => {
    const increment = parseFloat(button.dataset.increment);
    placeBid(increment);
  });
});

// Place Bid
function placeBid(increment) {
  if (mode === 'computer') {
    const newBid = auctionEngine.currentBid + increment;
    const result = auctionEngine.placeBid(myFranchise, newBid);

    if (result.success) {
      playBidSound();
      document.getElementById('currentBidAmount').textContent = formatCurrency(newBid);
      document.getElementById('highestBidder').textContent = `Highest Bidder: ${myFranchise.name}`;
      addToBidFeed(myFranchise.name, newBid);
      updateDashboard();

      // Reset auto-sell timer
      startAutoSellTimer();

      // Trigger AI bidding after delay
      setTimeout(() => processAIBids(), 1000);
    } else {
      playErrorSound();
      showToast(result.error, 'error');
    }
  } else {
    // Multiplayer mode
    const currentBid = parseFloat(document.getElementById('currentBidAmount').textContent.replace(/[₹,L]/g, '')) / 100;
    const newBid = currentBid + increment;
    socket.emit('placeBid', { amount: newBid });
  }
}

// Process AI Bids (Computer Mode)
function processAIBids() {
  if (mode !== 'computer' || !auctionEngine.auctionActive || auctionEngine.auctionPaused) {
    return;
  }

  const aiFranchises = franchises.filter(f => f.isAI);
  
  for (const franchise of aiFranchises) {
    if (franchise === auctionEngine.highestBidder) {
      continue;
    }

    const decision = aiEngine.decideBid(
      franchise,
      auctionEngine.currentPlayer,
      auctionEngine.currentBid,
      franchises
    );

    if (decision.action === 'bid') {
      const result = auctionEngine.placeBid(franchise, decision.amount);
      
      if (result.success) {
        playBidSound();
        document.getElementById('currentBidAmount').textContent = formatCurrency(decision.amount);
        document.getElementById('highestBidder').textContent = `Highest Bidder: ${franchise.name}`;
        addToBidFeed(franchise.name, decision.amount);
        updateDashboard();

        // Reset auto-sell timer
        startAutoSellTimer();

        // Continue AI bidding
        aiTimeout = setTimeout(() => processAIBids(), 800 + Math.random() * 400);
        return;
      }
    }
  }
}

// Add to Bid Feed
function addToBidFeed(franchiseName, amount) {
  const bidFeed = document.getElementById('bidFeed');
  
  // Remove empty message
  const emptyMessage = bidFeed.querySelector('.bid-feed-empty');
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const bidItem = document.createElement('div');
  bidItem.className = 'bid-item';
  bidItem.innerHTML = `
    <span class="bid-item-franchise">${franchiseName}</span> bid 
    <span class="bid-item-amount">${formatCurrency(amount)}</span>
    <span style="color: var(--color-text-secondary); font-size: 0.75rem; margin-left: 0.5rem;">${getTimestamp()}</span>
  `;

  bidFeed.insertBefore(bidItem, bidFeed.firstChild);

  // Keep only last 10 bids
  while (bidFeed.children.length > 10) {
    bidFeed.removeChild(bidFeed.lastChild);
  }
}

// Pass Button
document.getElementById('passBtn').addEventListener('click', () => {
  playPassSound();
  if (mode === 'multiplayer') {
    socket.emit('pass');
  }
  showToast('Passed on this player', 'info');
});

// Mark Sold Button
document.getElementById('markSoldBtn').addEventListener('click', () => {
  if (mode === 'computer') {
    const result = auctionEngine.markSold();
    if (result.success) {
      playSoldSound();
      showSoldPopup(result.player, result.franchise, result.price);
      setTimeout(() => {
        document.getElementById('nextPlayerBtn').click();
      }, 2500);
    } else {
      showToast(result.error, 'error');
    }
  } else {
    socket.emit('markSold');
  }
});

// Mark Unsold Button
document.getElementById('markUnsoldBtn').addEventListener('click', () => {
  if (mode === 'computer') {
    playUnsoldSound();
    auctionEngine.markUnsold();
    showToast('Player marked as unsold', 'info');
    setTimeout(() => {
      document.getElementById('nextPlayerBtn').click();
    }, 1000);
  } else {
    socket.emit('markUnsold');
  }
});

// Next Player Button
document.getElementById('nextPlayerBtn').addEventListener('click', () => {
  if (mode === 'computer') {
    const nextPlayer = auctionEngine.nextPlayer();
    
    if (nextPlayer) {
      playNextPlayerSound();
      displayPlayer(nextPlayer);
      updateDashboard();
      document.getElementById('bidFeed').innerHTML = '<div class="bid-feed-empty">No bids yet</div>';
    } else {
      // Auction finished
      finishAuction();
    }
  } else {
    socket.emit('nextPlayer');
  }
});

// Pause/Resume Button
document.getElementById('pauseResumeBtn').addEventListener('click', () => {
  if (mode === 'computer') {
    if (auctionEngine.auctionPaused) {
      playResumeSound();
      auctionEngine.resumeAuction();
      document.getElementById('pauseResumeBtn').textContent = 'Pause';
      document.getElementById('pauseOverlay').classList.add('hidden');
      startAutoSellTimer(); // Restart auto-sell timer
      showToast('Auction resumed', 'success');
    } else {
      playPauseSound();
      auctionEngine.pauseAuction();
      document.getElementById('pauseResumeBtn').textContent = 'Resume';
      document.getElementById('pauseOverlay').classList.remove('hidden');
      document.getElementById('pauseMessage').textContent = 'Auction is paused. Click Resume to continue.';
      clearTimeout(aiTimeout);
      clearTimeout(autoSellTimeout); // Clear auto-sell timer
      showToast('Auction paused', 'info');
    }
  } else {
    if (document.getElementById('pauseResumeBtn').textContent === 'Pause') {
      socket.emit('pauseAuction');
    } else {
      socket.emit('resumeAuction');
    }
  }
});

// Back to Home Button
document.getElementById('backToHomeBtn').addEventListener('click', () => {
  playClickSound();
  if (confirm('Are you sure you want to exit the auction? All progress will be lost.')) {
    // Clear timers
    clearTimeout(aiTimeout);
    clearTimeout(autoSellTimeout);
    
    // Clear local storage
    localStorage.removeItem('computerMode');
    localStorage.removeItem('multiplayerMode');
    
    // Disconnect socket if in multiplayer
    if (socket) {
      socket.disconnect();
    }
    
    // Navigate to home
    window.location.href = 'index.html';
  }
});

// Resume from Overlay Button
document.getElementById('resumeFromOverlayBtn').addEventListener('click', () => {
  if (mode === 'computer') {
    // Trigger the pause/resume button click
    document.getElementById('pauseResumeBtn').click();
  } else {
    // In multiplayer, only host can resume
    if (isHost) {
      socket.emit('resumeAuction');
    } else {
      playErrorSound();
      showToast('Only the host can resume the auction', 'error');
    }
  }
});

// Show Sold Popup
function showSoldPopup(player, franchiseName, price) {
  const popup = document.getElementById('soldPopup');
  document.getElementById('soldPlayerName').textContent = player.name;
  document.getElementById('soldTeamName').textContent = franchiseName;
  document.getElementById('soldPrice').textContent = formatCurrency(price);
  
  popup.classList.remove('hidden');
  
  setTimeout(() => {
    popup.classList.add('hidden');
  }, 2500);
}

// Finish Auction
function finishAuction() {
  playAuctionCompleteSound();
  
  // Save results
  const results = {
    franchises: franchises.map(f => ({
      name: f.name,
      squad: f.squad,
      totalSpent: f.getTotalSpent(),
      remainingPurse: f.getRemainingPurse(),
      squadSize: f.getSquadSize(),
      overseasCount: f.getOverseasCount()
    })),
    unsoldPlayers: players.filter(p => !p.sold)
  };

  saveToLocalStorage('auctionResults', results);
  
  showToast('Auction Complete!', 'success');
  setTimeout(() => {
    window.location.href = 'results.html';
  }, 2000);
}

// Multiplayer Event Handlers
function handleBidPlaced({ franchise, amount, auctionState }) {
  playBidSound();
  document.getElementById('currentBidAmount').textContent = formatCurrency(amount);
  document.getElementById('highestBidder').textContent = `Highest Bidder: ${franchise}`;
  addToBidFeed(franchise, amount);
}

function handlePlayerSold({ player, franchise, price }) {
  playSoldSound();
  showSoldPopup(player, franchise, price);
}

function handlePlayerUnsold({ player }) {
  playUnsoldSound();
  showToast(`${player.name} went unsold`, 'info');
}

function handleNextPlayer({ player, auctionState }) {
  playNextPlayerSound();
  displayPlayer(player);
  document.getElementById('bidFeed').innerHTML = '<div class="bid-feed-empty">No bids yet</div>';
}

function handleAuctionPaused() {
  playPauseSound();
  document.getElementById('pauseResumeBtn').textContent = 'Resume';
  document.getElementById('pauseOverlay').classList.remove('hidden');
  showToast('Auction paused by host', 'info');
}

function handleAuctionResumed() {
  playResumeSound();
  document.getElementById('pauseResumeBtn').textContent = 'Pause';
  document.getElementById('pauseOverlay').classList.add('hidden');
  showToast('Auction resumed', 'success');
}

function handleAuctionFinished({ results }) {
  playAuctionCompleteSound();
  saveToLocalStorage('auctionResults', results);
  showToast('Auction Complete!', 'success');
  setTimeout(() => {
    window.location.href = 'results.html';
  }, 2000);
}

function handleError({ message }) {
  playErrorSound();
  showToast(message, 'error');
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initializeAuction();
});
