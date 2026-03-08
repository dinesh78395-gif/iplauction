// Utility Functions for IPL Mock Auction

/**
 * Play bid sound effect
 */
function playBidSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error('Error playing bid sound:', error);
  }
}

/**
 * Play sold sound effect (auction hammer)
 */
function playSoldSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create hammer hit sound (two quick tones)
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 200;
      oscillator.type = 'square';
      
      const startTime = audioContext.currentTime + (i * 0.15);
      gainNode.gain.setValueAtTime(0.5, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    }
    
    // Add celebratory chime
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, 300);
  } catch (error) {
    console.error('Error playing sold sound:', error);
  }
}

/**
 * Play unsold sound effect
 */
function playUnsoldSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Descending tone to indicate failure
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Error playing unsold sound:', error);
  }
}

/**
 * Play next player sound effect
 */
function playNextPlayerSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Quick ascending tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    console.error('Error playing next player sound:', error);
  }
}

/**
 * Play pass sound effect
 */
function playPassSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Soft declining tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 500;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing pass sound:', error);
  }
}

/**
 * Play pause sound effect
 */
function playPauseSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Two-tone pause indicator
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 700;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.1);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.08);
    }
  } catch (error) {
    console.error('Error playing pause sound:', error);
  }
}

/**
 * Play resume sound effect
 */
function playResumeSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Ascending tone to indicate resumption
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing resume sound:', error);
  }
}

/**
 * Play button click sound effect
 */
function playClickSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    console.error('Error playing click sound:', error);
  }
}

/**
 * Play success sound effect
 */
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Three ascending tones
    const frequencies = [600, 800, 1000];
    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.1);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
}

/**
 * Play error sound effect
 */
function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Harsh buzzer sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing error sound:', error);
  }
}

/**
 * Play auction complete sound effect
 */
function playAuctionCompleteSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Victory fanfare
    const melody = [
      { freq: 523, time: 0 },      // C
      { freq: 659, time: 0.15 },   // E
      { freq: 784, time: 0.3 },    // G
      { freq: 1047, time: 0.45 }   // C (high)
    ];
    
    melody.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + note.time;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (error) {
    console.error('Error playing auction complete sound:', error);
  }
}

/**
 * Format currency in Indian format (crore/lakh)
 * @param {number} amount - Amount in crore
 * @param {boolean} showCrore - Show in crore or lakh
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, showCrore = false) {
  // Handle null/undefined/invalid values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showCrore ? '₹0.00 Cr' : '₹0 L';
  }
  
  if (showCrore) {
    return `₹${amount.toFixed(2)} Cr`;
  } else {
    const lakhs = amount * 100;
    return `₹${lakhs.toFixed(0)} L`;
  }
}

/**
 * Generate random room code
 * @returns {string} 6-character room code
 */
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {any} Stored data or null
 */
function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Clear localStorage
 * @param {string} key - Storage key (optional, clears all if not provided)
 */
function clearLocalStorage(key = null) {
  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get franchise color
 * @param {string} franchiseName - Name of franchise
 * @returns {string} Color code
 */
function getFranchiseColor(franchiseName) {
  const colors = {
    'Chennai Super Kings': '#FFFF3C',
    'Mumbai Indians': '#004BA0',
    'Royal Challengers Bengaluru': '#EC1C24',
    'Kolkata Knight Riders': '#3A225D',
    'Sunrisers Hyderabad': '#FF822A',
    'Rajasthan Royals': '#254AA5',
    'Delhi Capitals': '#282968',
    'Punjab Kings': '#ED1B24',
    'Lucknow Super Giants': '#00B2FF',
    'Gujarat Titans': '#1C2841'
  };
  return colors[franchiseName] || '#FFD700';
}

/**
 * Get role badge color
 * @param {string} role - Player role
 * @returns {string} Color code
 */
function getRoleBadgeColor(role) {
  const colors = {
    'Batter': '#00ff88',
    'Bowler': '#ff3b30',
    'All-Rounder': '#ff9500',
    'Wicketkeeper': '#00b2ff'
  };
  return colors[role] || '#ffd700';
}

/**
 * Format player name for display
 * @param {string} name - Player name
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted name
 */
function formatPlayerName(name, maxLength = 20) {
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + '...';
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Download JSON file
 * @param {object} data - Data to download
 * @param {string} filename - Filename
 */
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get timestamp string
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Shuffle array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    max-width: 400px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }

  .toast-success {
    border-left: 4px solid #00ff88;
  }

  .toast-error {
    border-left: 4px solid #ff3b30;
  }

  .toast-warning {
    border-left: 4px solid #ff9500;
  }

  .toast-info {
    border-left: 4px solid #00b2ff;
  }
`;
document.head.appendChild(toastStyles);


// Client-side Franchise Class (for Computer Mode)
class Franchise {
  constructor(name, isAI = false) {
    this.name = name;
    this.purse = 100; // Starting purse in crore
    this.squad = [];
    this.overseasCount = 0;
    this.isAI = isAI;
    this.isHost = false;
  }

  addPlayer(player, price) {
    const validation = this.canAddPlayer(player);
    if (!validation.valid) {
      return false;
    }

    if (price > this.purse) {
      return false;
    }

    this.squad.push({ ...player, purchasePrice: price });
    this.purse -= price;
    
    if (player.overseas) {
      this.overseasCount++;
    }

    return true;
  }

  canBid(amount) {
    return this.purse >= amount;
  }

  canAddPlayer(player) {
    if (this.squad.length >= 25) {
      return { valid: false, reason: 'Squad full (max 25 players)' };
    }

    if (player.overseas && this.overseasCount >= 8) {
      return { valid: false, reason: 'Overseas limit reached (max 8)' };
    }

    return { valid: true, reason: '' };
  }

  getSquadSize() {
    return this.squad.length;
  }

  getOverseasCount() {
    return this.overseasCount;
  }

  getRemainingPurse() {
    return this.purse;
  }

  getSquadByRole(role) {
    return this.squad.filter(player => player.role === role);
  }

  getTotalSpent() {
    return 100 - this.purse;
  }

  getWarnings() {
    return {
      squadSizeWarning: this.squad.length >= 23,
      overseasWarning: this.overseasCount >= 7
    };
  }

  reset() {
    this.purse = 100;
    this.squad = [];
    this.overseasCount = 0;
  }
}


// Client-side AuctionEngine Class (for Computer Mode)
class AuctionEngine {
  constructor() {
    this.currentPlayerIndex = 0;
    this.currentPlayer = null;
    this.currentBid = 0;
    this.highestBidder = null;
    this.auctionActive = false;
    this.auctionPaused = false;
    this.allPlayers = [];
    this.franchises = [];
  }

  initialize(franchises, players) {
    this.franchises = franchises;
    this.allPlayers = players.filter(p => !p.sold);
    this.currentPlayerIndex = 0;
    this.auctionActive = false;
    this.auctionPaused = false;
  }

  startAuction() {
    if (this.allPlayers.length === 0) {
      throw new Error('No players available for auction');
    }

    this.auctionActive = true;
    this.currentPlayerIndex = 0;
    this.currentPlayer = this.allPlayers[0];
    this.currentBid = this.currentPlayer.basePrice / 100;
    this.highestBidder = null;

    return this.currentPlayer;
  }

  placeBid(franchise, amount) {
    if (!this.auctionActive) {
      return { success: false, error: 'Auction not active' };
    }

    if (this.auctionPaused) {
      return { success: false, error: 'Auction is paused' };
    }

    const validation = this.validateBid(franchise, amount);
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    this.currentBid = amount;
    this.highestBidder = franchise;

    return { success: true, error: '' };
  }

  pass(franchise) {
    // Pass is always allowed
  }

  markSold() {
    if (!this.currentPlayer || !this.highestBidder) {
      return { success: false, error: 'No valid bid to complete sale' };
    }

    const player = this.currentPlayer;
    const franchise = this.highestBidder;
    const price = this.currentBid;

    const added = franchise.addPlayer(player, price);
    if (!added) {
      return { success: false, error: 'Failed to add player to franchise' };
    }

    player.sold = true;
    player.soldTeam = franchise.name;
    player.soldPrice = price * 100;

    return {
      success: true,
      player: player,
      franchise: franchise.name,
      price: price
    };
  }

  markUnsold() {
    if (!this.currentPlayer) {
      return { success: false, error: 'No current player' };
    }

    const player = this.currentPlayer;
    player.sold = false;

    return {
      success: true,
      player: player
    };
  }

  nextPlayer() {
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex >= this.allPlayers.length) {
      this.auctionActive = false;
      return null;
    }

    this.currentPlayer = this.allPlayers[this.currentPlayerIndex];
    this.currentBid = this.currentPlayer.basePrice / 100;
    this.highestBidder = null;

    return this.currentPlayer;
  }

  pauseAuction() {
    this.auctionPaused = true;
  }

  resumeAuction() {
    this.auctionPaused = false;
  }

  validateBid(franchise, amount) {
    if (franchise === this.highestBidder) {
      return { valid: false, reason: 'You are already the highest bidder' };
    }

    if (amount <= this.currentBid) {
      return { valid: false, reason: 'Bid must be higher than current bid' };
    }

    if (!franchise.canBid(amount)) {
      return { valid: false, reason: 'Insufficient purse' };
    }

    if (franchise.getSquadSize() >= 25) {
      return { valid: false, reason: 'Squad full (max 25 players)' };
    }

    if (this.currentPlayer.overseas && franchise.getOverseasCount() >= 8) {
      return { valid: false, reason: 'Overseas limit reached (max 8)' };
    }

    return { valid: true, reason: '' };
  }

  getAuctionState() {
    return {
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.currentPlayer,
      currentBid: this.currentBid,
      highestBidder: this.highestBidder ? this.highestBidder.name : null,
      auctionActive: this.auctionActive,
      auctionPaused: this.auctionPaused,
      totalPlayers: this.allPlayers.length,
      franchises: this.franchises.map(f => ({
        name: f.name,
        purse: f.getRemainingPurse(),
        squadSize: f.getSquadSize(),
        overseasCount: f.getOverseasCount(),
        isAI: f.isAI
      }))
    };
  }

  isAuctionComplete() {
    return !this.auctionActive && this.currentPlayerIndex >= this.allPlayers.length;
  }
}


// Client-side AIBiddingEngine Class (for Computer Mode)
class AIBiddingEngine {
  constructor() {
    this.minPlayersTarget = 18;
    this.minBudgetPerPlayer = 0.2;
    this.overbiddingCap = 3.0;
  }

  decideBid(franchise, currentPlayer, currentBid, allFranchises) {
    const squadSize = franchise.getSquadSize();
    const remainingPurse = franchise.getRemainingPurse();
    const playersNeeded = this.minPlayersTarget - squadSize;

    const reservedBudget = playersNeeded * this.minBudgetPerPlayer;
    const availableBudget = remainingPurse - reservedBudget;

    if (availableBudget <= 0 || playersNeeded <= 0) {
      return { action: 'pass' };
    }

    const squadNeeds = this.calculateSquadNeeds(franchise);
    const playerValue = this.evaluatePlayerValue(currentPlayer, franchise);

    const roleKey = currentPlayer.role.toLowerCase().replace('-', '');
    const fillsNeed = squadNeeds[roleKey] > 0;

    let maxBid = playerValue;
    if (fillsNeed) {
      maxBid *= 1.5;
    }

    maxBid *= (0.8 + Math.random() * 0.4);

    const basePriceInCrore = currentPlayer.basePrice / 100;
    const basePriceCap = basePriceInCrore * this.overbiddingCap;
    
    const hasCriticalNeed = squadNeeds[roleKey] >= 3;
    if (!hasCriticalNeed && maxBid > basePriceCap) {
      maxBid = basePriceCap;
    }

    if (currentBid >= maxBid || currentBid >= availableBudget) {
      return { action: 'pass' };
    }

    const increments = [0.1, 0.25, 0.5, 1];
    let bidAmount = currentBid;

    const valueRatio = (maxBid - currentBid) / maxBid;
    if (valueRatio > 0.5) {
      bidAmount += increments[3];
    } else if (valueRatio > 0.3) {
      bidAmount += increments[2];
    } else if (valueRatio > 0.15) {
      bidAmount += increments[1];
    } else {
      bidAmount += increments[0];
    }

    if (bidAmount > maxBid) {
      bidAmount = maxBid;
    }
    if (bidAmount > availableBudget) {
      bidAmount = availableBudget;
    }

    return { action: 'bid', amount: bidAmount };
  }

  evaluatePlayerValue(player, franchise) {
    const basePriceInCrore = player.basePrice / 100;
    let value = basePriceInCrore * 1.5;

    if (player.seasonsPlayedFrom2018 >= 5) {
      value *= 1.2;
    } else if (player.seasonsPlayedFrom2018 <= 2) {
      value *= 0.9;
    }

    const squadNeeds = this.calculateSquadNeeds(franchise);
    const roleKey = player.role.toLowerCase().replace('-', '');
    
    if (squadNeeds[roleKey] > 2) {
      value *= 1.3;
    } else if (squadNeeds[roleKey] > 0) {
      value *= 1.1;
    }

    return value;
  }

  calculateSquadNeeds(franchise) {
    const squad = franchise.squad;
    
    const counts = {
      batter: 0,
      bowler: 0,
      allrounder: 0,
      wicketkeeper: 0
    };

    squad.forEach(player => {
      const roleKey = player.role.toLowerCase().replace('-', '');
      counts[roleKey]++;
    });

    const targets = {
      batter: 6,
      bowler: 6,
      allrounder: 4,
      wicketkeeper: 2
    };

    const needs = {
      batter: Math.max(0, targets.batter - counts.batter),
      bowler: Math.max(0, targets.bowler - counts.bowler),
      allrounder: Math.max(0, targets.allrounder - counts.allrounder),
      wicketkeeper: Math.max(0, targets.wicketkeeper - counts.wicketkeeper)
    };

    return needs;
  }

  shouldBid(franchise, player, currentBid) {
    const decision = this.decideBid(franchise, player, currentBid, []);
    return decision.action === 'bid';
  }
}
