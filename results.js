// Results.js - Auction Results Page Logic

let auctionResults = null;
let allPlayers = [];
let filteredPlayers = [];

// Initialize Results Page
function initializeResults() {
  auctionResults = loadFromLocalStorage('auctionResults');

  if (!auctionResults) {
    showToast('No auction results found', 'error');
    setTimeout(() => window.location.href = 'index.html', 2000);
    return;
  }

  // Collect all players
  auctionResults.franchises.forEach(franchise => {
    allPlayers.push(...franchise.squad);
  });
  allPlayers.push(...auctionResults.unsoldPlayers);

  filteredPlayers = [...allPlayers];

  displayStatistics();
  displaySquads();
  displayUnsoldPlayers();
  setupFilters();
}

// Display Statistics
function displayStatistics() {
  // Most Expensive Player
  let mostExpensive = { player: null, price: 0, team: '' };
  auctionResults.franchises.forEach(franchise => {
    franchise.squad.forEach(player => {
      if (player.purchasePrice > mostExpensive.price) {
        mostExpensive = {
          player: player,
          price: player.purchasePrice,
          team: franchise.name
        };
      }
    });
  });

  if (mostExpensive.player) {
    document.getElementById('mostExpensivePlayer').textContent = 
      `${mostExpensive.player.name} - ${formatCurrency(mostExpensive.price)} (${mostExpensive.team})`;
  }

  // Highest Remaining Purse
  let highestPurse = { team: '', purse: 0 };
  auctionResults.franchises.forEach(franchise => {
    if (franchise.remainingPurse > highestPurse.purse) {
      highestPurse = {
        team: franchise.name,
        purse: franchise.remainingPurse
      };
    }
  });

  document.getElementById('highestPurse').textContent = 
    `${highestPurse.team} - ${formatCurrency(highestPurse.purse, true)}`;

  // Largest Squad
  let largestSquad = { team: '', size: 0 };
  auctionResults.franchises.forEach(franchise => {
    if (franchise.squadSize > largestSquad.size) {
      largestSquad = {
        team: franchise.name,
        size: franchise.squadSize
      };
    }
  });

  document.getElementById('largestSquad').textContent = 
    `${largestSquad.team} - ${largestSquad.size} players`;
}

// Display Squads
function displaySquads() {
  const squadsContainer = document.getElementById('squadsContainer');
  squadsContainer.innerHTML = '';

  auctionResults.franchises.forEach(franchise => {
    const squadCard = document.createElement('div');
    squadCard.className = 'squad-card';
    
    const playersHTML = franchise.squad.map(player => `
      <div class="squad-player-item">
        <span>${player.name} (${player.role})</span>
        <span>${formatCurrency(player.purchasePrice)}</span>
      </div>
    `).join('');

    squadCard.innerHTML = `
      <div class="squad-header">
        <span class="squad-name">${franchise.name}</span>
        <span style="font-size: 1.5rem;">▼</span>
      </div>
      <div class="squad-summary">
        <span>Total Spent: ${formatCurrency(franchise.totalSpent, true)}</span>
        <span>Remaining: ${formatCurrency(franchise.remainingPurse, true)}</span>
        <span>Squad Size: ${franchise.squadSize}/25</span>
        <span>Overseas: ${franchise.overseasCount}/8</span>
      </div>
      <div class="squad-players">
        ${playersHTML || '<p style="text-align: center; color: var(--color-text-secondary);">No players</p>'}
      </div>
    `;

    squadCard.addEventListener('click', () => {
      playClickSound();
      squadCard.classList.toggle('expanded');
    });

    squadsContainer.appendChild(squadCard);
  });
}

// Display Unsold Players
function displayUnsoldPlayers() {
  const unsoldList = document.getElementById('unsoldPlayersList');
  const unsoldCount = document.getElementById('unsoldCount');
  
  unsoldCount.textContent = auctionResults.unsoldPlayers.length;
  unsoldList.innerHTML = '';

  auctionResults.unsoldPlayers.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'unsold-player-card';
    
    playerCard.innerHTML = `
      <div class="unsold-player-name">${player.name}</div>
      <div class="unsold-player-role">${player.role}</div>
      <div class="unsold-player-role" style="font-size: 0.75rem;">${formatCurrency(player.basePrice / 100)}</div>
    `;

    unsoldList.appendChild(playerCard);
  });
}

// Setup Filters
function setupFilters() {
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const nationalityFilter = document.getElementById('nationalityFilter');
  const statusFilter = document.getElementById('statusFilter');

  const applyFilters = debounce(() => {
    const searchTerm = searchInput.value.toLowerCase();
    const role = roleFilter.value;
    const nationality = nationalityFilter.value;
    const status = statusFilter.value;

    filteredPlayers = allPlayers.filter(player => {
      // Search filter
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm)) {
        return false;
      }

      // Role filter
      if (role && player.role !== role) {
        return false;
      }

      // Nationality filter
      if (nationality === 'indian' && player.overseas) {
        return false;
      }
      if (nationality === 'overseas' && !player.overseas) {
        return false;
      }

      // Status filter
      if (status === 'sold' && !player.sold) {
        return false;
      }
      if (status === 'unsold' && player.sold) {
        return false;
      }

      return true;
    });

    updateFilteredDisplay();
  }, 300);

  searchInput.addEventListener('input', applyFilters);
  roleFilter.addEventListener('change', applyFilters);
  nationalityFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
}

// Update Filtered Display
function updateFilteredDisplay() {
  // Update unsold players list with filtered results
  const unsoldList = document.getElementById('unsoldPlayersList');
  const unsoldFiltered = filteredPlayers.filter(p => !p.sold);
  
  document.getElementById('unsoldCount').textContent = unsoldFiltered.length;
  unsoldList.innerHTML = '';

  unsoldFiltered.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'unsold-player-card';
    
    playerCard.innerHTML = `
      <div class="unsold-player-name">${player.name}</div>
      <div class="unsold-player-role">${player.role}</div>
      <div class="unsold-player-role" style="font-size: 0.75rem;">${formatCurrency(player.basePrice / 100)}</div>
    `;

    unsoldList.appendChild(playerCard);
  });

  // Update squads with filtered players
  const squadsContainer = document.getElementById('squadsContainer');
  squadsContainer.innerHTML = '';

  auctionResults.franchises.forEach(franchise => {
    const filteredSquad = franchise.squad.filter(player => 
      filteredPlayers.includes(player)
    );

    if (filteredSquad.length === 0 && filteredPlayers.some(p => p.sold)) {
      return; // Skip franchise if no players match filter
    }

    const squadCard = document.createElement('div');
    squadCard.className = 'squad-card';
    
    const playersHTML = filteredSquad.map(player => `
      <div class="squad-player-item">
        <span>${player.name} (${player.role})</span>
        <span>${formatCurrency(player.purchasePrice)}</span>
      </div>
    `).join('');

    squadCard.innerHTML = `
      <div class="squad-header">
        <span class="squad-name">${franchise.name}</span>
        <span style="font-size: 1.5rem;">▼</span>
      </div>
      <div class="squad-summary">
        <span>Total Spent: ${formatCurrency(franchise.totalSpent, true)}</span>
        <span>Remaining: ${formatCurrency(franchise.remainingPurse, true)}</span>
        <span>Squad Size: ${franchise.squadSize}/25</span>
        <span>Overseas: ${franchise.overseasCount}/8</span>
      </div>
      <div class="squad-players">
        ${playersHTML || '<p style="text-align: center; color: var(--color-text-secondary);">No players match filter</p>'}
      </div>
    `;

    squadCard.addEventListener('click', () => {
      playClickSound();
      squadCard.classList.toggle('expanded');
    });

    squadsContainer.appendChild(squadCard);
  });
}

// Export Results
document.getElementById('exportResultsBtn').addEventListener('click', () => {
  playClickSound();
  const exportData = {
    timestamp: new Date().toISOString(),
    franchises: auctionResults.franchises,
    unsoldPlayers: auctionResults.unsoldPlayers,
    statistics: {
      totalPlayers: allPlayers.length,
      soldPlayers: allPlayers.filter(p => p.sold).length,
      unsoldPlayers: auctionResults.unsoldPlayers.length
    }
  };

  const filename = `ipl-auction-results-${Date.now()}.json`;
  downloadJSON(exportData, filename);
  playSuccessSound();
  showToast('Results exported successfully!', 'success');
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initializeResults();
});
