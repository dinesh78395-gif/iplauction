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

  /**
   * Initialize auction with franchises and players
   * @param {Array} franchises - Array of Franchise objects
   * @param {Array} players - Array of player objects
   * @returns {void}
   */
  initialize(franchises, players) {
    this.franchises = franchises;
    this.allPlayers = players.filter(p => !p.sold);
    this.currentPlayerIndex = 0;
    this.auctionActive = false;
    this.auctionPaused = false;
  }

  /**
   * Start the auction
   * @returns {Object} First player to be auctioned
   */
  startAuction() {
    if (this.allPlayers.length === 0) {
      throw new Error('No players available for auction');
    }

    this.auctionActive = true;
    this.currentPlayerIndex = 0;
    this.currentPlayer = this.allPlayers[0];
    this.currentBid = this.currentPlayer.basePrice / 100; // Convert lakhs to crore
    this.highestBidder = null;

    return this.currentPlayer;
  }

  /**
   * Place a bid
   * @param {Franchise} franchise - Franchise placing the bid
   * @param {number} amount - Bid amount in crore
   * @returns {Object} Result with success flag and error message
   */
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

  /**
   * Franchise passes on current player
   * @param {Franchise} franchise - Franchise passing
   * @returns {void}
   */
  pass(franchise) {
    // Pass is always allowed, no action needed
    // In multiplayer, this would be tracked for UI updates
  }

  /**
   * Mark current player as sold to highest bidder
   * @returns {Object} Result with player and franchise info
   */
  markSold() {
    if (!this.currentPlayer || !this.highestBidder) {
      return { success: false, error: 'No valid bid to complete sale' };
    }

    const player = this.currentPlayer;
    const franchise = this.highestBidder;
    const price = this.currentBid;

    // Add player to franchise
    const added = franchise.addPlayer(player, price);
    if (!added) {
      return { success: false, error: 'Failed to add player to franchise' };
    }

    // Mark player as sold
    player.sold = true;
    player.soldTeam = franchise.name;
    player.soldPrice = price * 100; // Convert crore to lakhs

    return {
      success: true,
      player: player,
      franchise: franchise.name,
      price: price
    };
  }

  /**
   * Mark current player as unsold
   * @returns {Object} Result with player info
   */
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

  /**
   * Move to next player
   * @returns {Object|null} Next player or null if auction complete
   */
  nextPlayer() {
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex >= this.allPlayers.length) {
      this.auctionActive = false;
      return null;
    }

    this.currentPlayer = this.allPlayers[this.currentPlayerIndex];
    this.currentBid = this.currentPlayer.basePrice / 100; // Convert lakhs to crore
    this.highestBidder = null;

    return this.currentPlayer;
  }

  /**
   * Pause the auction
   * @returns {void}
   */
  pauseAuction() {
    this.auctionPaused = true;
  }

  /**
   * Resume the auction
   * @returns {void}
   */
  resumeAuction() {
    this.auctionPaused = false;
  }

  /**
   * Validate a bid
   * @param {Franchise} franchise - Franchise placing the bid
   * @param {number} amount - Bid amount in crore
   * @returns {Object} Validation result
   */
  validateBid(franchise, amount) {
    // Check if franchise is highest bidder
    if (franchise === this.highestBidder) {
      return { valid: false, reason: 'You are already the highest bidder' };
    }

    // Check if bid is higher than current
    if (amount <= this.currentBid) {
      return { valid: false, reason: 'Bid must be higher than current bid' };
    }

    // Check purse sufficiency
    if (!franchise.canBid(amount)) {
      return { valid: false, reason: 'Insufficient purse' };
    }

    // Check squad size
    if (franchise.getSquadSize() >= 25) {
      return { valid: false, reason: 'Squad full (max 25 players)' };
    }

    // Check overseas limit
    if (this.currentPlayer.overseas && franchise.getOverseasCount() >= 8) {
      return { valid: false, reason: 'Overseas limit reached (max 8)' };
    }

    return { valid: true, reason: '' };
  }

  /**
   * Get current auction state
   * @returns {Object} Current auction state
   */
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

  /**
   * Check if auction is complete
   * @returns {boolean} True if all players processed
   */
  isAuctionComplete() {
    return !this.auctionActive && this.currentPlayerIndex >= this.allPlayers.length;
  }
}

module.exports = AuctionEngine;
