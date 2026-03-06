class AIBiddingEngine {
  constructor() {
    this.minPlayersTarget = 18;
    this.minBudgetPerPlayer = 0.2; // 20 lakh in crore
    this.overbiddingCap = 3.0; // 300% of base price
  }

  /**
   * Decide whether to bid or pass
   * @param {Franchise} franchise - AI franchise
   * @param {Object} currentPlayer - Current player being auctioned
   * @param {number} currentBid - Current bid amount in crore
   * @param {Array} allFranchises - All franchises in auction
   * @returns {Object} Decision with action ('bid' or 'pass') and amount
   */
  decideBid(franchise, currentPlayer, currentBid, allFranchises) {
    const squadSize = franchise.getSquadSize();
    const remainingPurse = franchise.getRemainingPurse();
    const playersNeeded = this.minPlayersTarget - squadSize;

    // Reserve budget for minimum squad
    const reservedBudget = playersNeeded * this.minBudgetPerPlayer;
    const availableBudget = remainingPurse - reservedBudget;

    // Don't bid if can't afford minimum squad
    if (availableBudget <= 0 || playersNeeded <= 0) {
      return { action: 'pass' };
    }

    // Evaluate player value based on squad needs
    const squadNeeds = this.calculateSquadNeeds(franchise);
    const playerValue = this.evaluatePlayerValue(currentPlayer, franchise);

    // Check if player fills a need
    const roleKey = currentPlayer.role.toLowerCase().replace('-', '');
    const fillsNeed = squadNeeds[roleKey] > 0;

    // Calculate max willing to pay
    let maxBid = playerValue;
    if (fillsNeed) {
      maxBid *= 1.5; // Willing to pay 50% more for needed roles
    }

    // Add randomness (±20%)
    maxBid *= (0.8 + Math.random() * 0.4);

    // Cap at 300% of base price unless critical need
    const basePriceInCrore = currentPlayer.basePrice / 100;
    const basePriceCap = basePriceInCrore * this.overbiddingCap;
    
    const hasCriticalNeed = squadNeeds[roleKey] >= 3;
    if (!hasCriticalNeed && maxBid > basePriceCap) {
      maxBid = basePriceCap;
    }

    // Decide to bid or pass
    if (currentBid >= maxBid || currentBid >= availableBudget) {
      return { action: 'pass' };
    }

    // Calculate bid increment
    const increments = [0.1, 0.25, 0.5, 1]; // In crore
    let bidAmount = currentBid;

    // Choose increment based on how much we value the player
    const valueRatio = (maxBid - currentBid) / maxBid;
    if (valueRatio > 0.5) {
      bidAmount += increments[3]; // Aggressive: +1 crore
    } else if (valueRatio > 0.3) {
      bidAmount += increments[2]; // Moderate: +50 lakh
    } else if (valueRatio > 0.15) {
      bidAmount += increments[1]; // Conservative: +25 lakh
    } else {
      bidAmount += increments[0]; // Minimal: +10 lakh
    }

    // Ensure bid doesn't exceed max or available budget
    if (bidAmount > maxBid) {
      bidAmount = maxBid;
    }
    if (bidAmount > availableBudget) {
      bidAmount = availableBudget;
    }

    return { action: 'bid', amount: bidAmount };
  }

  /**
   * Evaluate player value
   * @param {Object} player - Player object
   * @param {Franchise} franchise - Franchise evaluating the player
   * @returns {number} Estimated value in crore
   */
  evaluatePlayerValue(player, franchise) {
    const basePriceInCrore = player.basePrice / 100;
    
    // Base value is 150% of base price
    let value = basePriceInCrore * 1.5;

    // Adjust for experience (seasons played)
    if (player.seasonsPlayedFrom2018 >= 5) {
      value *= 1.2; // 20% premium for experienced players
    } else if (player.seasonsPlayedFrom2018 <= 2) {
      value *= 0.9; // 10% discount for less experienced
    }

    // Adjust for role scarcity
    const squadNeeds = this.calculateSquadNeeds(franchise);
    const roleKey = player.role.toLowerCase().replace('-', '');
    
    if (squadNeeds[roleKey] > 2) {
      value *= 1.3; // High need
    } else if (squadNeeds[roleKey] > 0) {
      value *= 1.1; // Moderate need
    }

    return value;
  }

  /**
   * Calculate squad needs by role
   * @param {Franchise} franchise - Franchise to analyze
   * @returns {Object} Needs by role (batters, bowlers, allrounders, wicketkeepers)
   */
  calculateSquadNeeds(franchise) {
    const squad = franchise.squad;
    
    // Count current players by role
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

    // Calculate needs (target: 6 batters, 6 bowlers, 4 all-rounders, 2 wicketkeepers)
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

  /**
   * Check if AI should bid on current player
   * @param {Franchise} franchise - AI franchise
   * @param {Object} player - Current player
   * @param {number} currentBid - Current bid amount
   * @returns {boolean} Should bid or not
   */
  shouldBid(franchise, player, currentBid) {
    const decision = this.decideBid(franchise, player, currentBid, []);
    return decision.action === 'bid';
  }
}

module.exports = AIBiddingEngine;
