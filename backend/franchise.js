class Franchise {
  constructor(name, isAI = false) {
    this.name = name;
    this.purse = 100; // Starting purse in crore
    this.squad = [];
    this.overseasCount = 0;
    this.isAI = isAI;
    this.isHost = false;
  }

  /**
   * Add a player to the franchise squad
   * @param {Object} player - Player object
   * @param {number} price - Purchase price in crore
   * @returns {boolean} Success status
   */
  addPlayer(player, price) {
    const validation = this.canAddPlayer(player);
    if (!validation.valid) {
      return false;
    }

    // Check if franchise can afford the player
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

  /**
   * Check if franchise can place a bid
   * @param {number} amount - Bid amount in crore
   * @returns {boolean} Can bid or not
   */
  canBid(amount) {
    return this.purse >= amount;
  }

  /**
   * Check if franchise can add a player (squad rules validation)
   * @param {Object} player - Player object
   * @returns {Object} Validation result with valid flag and reason
   */
  canAddPlayer(player) {
    // Check squad size limit (max 25)
    if (this.squad.length >= 25) {
      return { valid: false, reason: 'Squad full (max 25 players)' };
    }

    // Check overseas limit (max 8)
    if (player.overseas && this.overseasCount >= 8) {
      return { valid: false, reason: 'Overseas limit reached (max 8)' };
    }

    return { valid: true, reason: '' };
  }

  /**
   * Get current squad size
   * @returns {number} Number of players in squad
   */
  getSquadSize() {
    return this.squad.length;
  }

  /**
   * Get overseas player count
   * @returns {number} Number of overseas players
   */
  getOverseasCount() {
    return this.overseasCount;
  }

  /**
   * Get remaining purse
   * @returns {number} Remaining purse in crore
   */
  getRemainingPurse() {
    return this.purse;
  }

  /**
   * Get squad by role
   * @param {string} role - Player role
   * @returns {Array} Players with specified role
   */
  getSquadByRole(role) {
    return this.squad.filter(player => player.role === role);
  }

  /**
   * Get total spent amount
   * @returns {number} Total amount spent in crore
   */
  getTotalSpent() {
    return 100 - this.purse;
  }

  /**
   * Check if franchise is approaching squad limits
   * @returns {Object} Warning flags for squad size and overseas count
   */
  getWarnings() {
    return {
      squadSizeWarning: this.squad.length >= 23,
      overseasWarning: this.overseasCount >= 7
    };
  }

  /**
   * Reset franchise to initial state
   * @returns {void}
   */
  reset() {
    this.purse = 100;
    this.squad = [];
    this.overseasCount = 0;
  }
}

module.exports = Franchise;
