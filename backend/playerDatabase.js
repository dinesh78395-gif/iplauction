const fs = require('fs');
const path = require('path');

class PlayerDatabase {
  constructor() {
    this.players = [];
    this.playersFilePath = path.join(__dirname, 'data', 'players.json');
  }

  /**
   * Load players from JSON file
   * @returns {Array} Array of player objects
   */
  loadPlayers() {
    try {
      const data = fs.readFileSync(this.playersFilePath, 'utf8');
      this.players = JSON.parse(data);
      return this.players;
    } catch (error) {
      console.error('Error loading players:', error);
      throw new Error('Failed to load player database');
    }
  }

  /**
   * Get player by ID
   * @param {string} id - Player ID
   * @returns {Object|null} Player object or null if not found
   */
  getPlayerById(id) {
    return this.players.find(player => player.id === id) || null;
  }

  /**
   * Get all unsold players
   * @returns {Array} Array of unsold players
   */
  getUnsoldPlayers() {
    return this.players.filter(player => !player.sold);
  }

  /**
   * Mark a player as sold
   * @param {string} id - Player ID
   * @param {string} team - Team name
   * @param {number} price - Sold price in lakhs
   * @returns {boolean} Success status
   */
  markPlayerSold(id, team, price) {
    const player = this.getPlayerById(id);
    if (!player) {
      return false;
    }
    
    player.sold = true;
    player.soldTeam = team;
    player.soldPrice = price;
    return true;
  }

  /**
   * Reset auction - mark all players as unsold
   * @returns {void}
   */
  resetAuction() {
    this.players.forEach(player => {
      player.sold = false;
      player.soldTeam = null;
      player.soldPrice = null;
    });
  }

  /**
   * Get all players
   * @returns {Array} Array of all players
   */
  getAllPlayers() {
    return this.players;
  }

  /**
   * Get players by role
   * @param {string} role - Player role (Batter, Bowler, All-Rounder, Wicketkeeper)
   * @returns {Array} Array of players with specified role
   */
  getPlayersByRole(role) {
    return this.players.filter(player => player.role === role);
  }

  /**
   * Get overseas players
   * @returns {Array} Array of overseas players
   */
  getOverseasPlayers() {
    return this.players.filter(player => player.overseas);
  }

  /**
   * Get Indian players
   * @returns {Array} Array of Indian players
   */
  getIndianPlayers() {
    return this.players.filter(player => !player.overseas);
  }
}

module.exports = PlayerDatabase;
