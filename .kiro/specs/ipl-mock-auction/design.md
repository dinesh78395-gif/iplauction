# Design Document: IPL Mock Auction

## Overview

The IPL Mock Auction is a full-stack web application built with a client-server architecture. The frontend uses vanilla HTML, CSS, and JavaScript to provide a responsive, premium UI experience. The backend uses Node.js with Express and Socket.IO for real-time multiplayer functionality. The system supports two distinct modes: Computer Mode (offline single-device play with AI opponents) and Multiplayer Mode (online real-time play with Socket.IO).

The application follows a modular architecture with clear separation between:
- **Frontend Layer**: UI rendering, user interactions, client-side state management
- **Backend Layer**: Room management, auction state, validation, AI logic
- **Communication Layer**: Socket.IO for real-time bidirectional events
- **Data Layer**: JSON-based storage for players and room state

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Client)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Home Page   │  │ Computer Mode│  │  Multiplayer │     │
│  │              │  │    Setup     │  │    Lobby     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Auction Room (Shared UI)                  │  │
│  │  - Player Card Display                               │  │
│  │  - Bidding Controls                                  │  │
│  │  - Team Dashboards                                   │  │
│  │  - Live Bid Updates                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Results Page                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Socket.IO (Multiplayer)
                            │ Local State (Computer Mode)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Server)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Room Manager │  │Auction Engine│  │  AI Engine   │     │
│  │              │  │              │  │              │     │
│  │ - Create     │  │ - Bid Logic  │  │ - Decision   │     │
│  │ - Join       │  │ - Validation │  │   Making     │     │
│  │ - State      │  │ - Flow Ctrl  │  │ - Strategy   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Socket.IO Server                             │  │
│  │  - Event Broadcasting                                │  │
│  │  - Connection Management                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ players.json │  │ Room State   │                        │
│  │              │  │ (In-Memory)  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Mode-Specific Architecture

**Computer Mode (Offline)**:
- All logic runs client-side in the browser
- No server communication required
- AI bidding executed locally via imported AI engine logic
- State managed in browser memory
- Single page application flow

**Multiplayer Mode (Online)**:
- Client-server architecture with Socket.IO
- Server maintains authoritative game state
- All bids validated server-side
- AI bidding executed on server for unselected teams
- Real-time event broadcasting to all room participants

## Components and Interfaces

### 1. Player Database Component

**Responsibility**: Load, store, and provide access to player data

**Data Structure**:
```javascript
{
  "id": "string",           // Unique identifier
  "name": "string",         // Player full name
  "nationality": "string",  // Country
  "role": "string",         // Batter|Bowler|All-Rounder|Wicketkeeper
  "basePrice": number,      // In lakhs (e.g., 20 = 20 lakh)
  "overseas": boolean,      // true if non-Indian
  "previousIPLTeams": ["string"], // Array of team names
  "seasonsPlayedFrom2018": number, // Count of seasons
  "sold": boolean,          // Auction status
  "soldTeam": "string",     // Franchise name if sold
  "soldPrice": number       // Final price in lakhs
}
```

**Interface**:
```javascript
class PlayerDatabase {
  loadPlayers()              // Returns: Player[]
  getPlayerById(id)          // Returns: Player
  getUnsoldPlayers()         // Returns: Player[]
  markPlayerSold(id, team, price) // Returns: void
  resetAuction()             // Returns: void
}
```

### 2. Franchise Component

**Responsibility**: Manage individual franchise state and squad

**Data Structure**:
```javascript
{
  "name": "string",          // Franchise name
  "purse": number,           // Remaining budget in crore
  "squad": [Player],         // Array of owned players
  "overseasCount": number,   // Count of overseas players
  "isAI": boolean,           // AI-controlled flag
  "isHost": boolean          // Host flag (multiplayer only)
}
```

**Interface**:
```javascript
class Franchise {
  constructor(name, isAI)
  addPlayer(player, price)   // Returns: boolean (success)
  canBid(amount)             // Returns: boolean
  canAddPlayer(player)       // Returns: {valid: boolean, reason: string}
  getSquadSize()             // Returns: number
  getOverseasCount()         // Returns: number
  getRemainingPurse()        // Returns: number
}
```

### 3. Auction Engine Component

**Responsibility**: Core auction logic, bidding flow, and state management

**State Structure**:
```javascript
{
  "currentPlayerIndex": number,
  "currentPlayer": Player,
  "currentBid": number,
  "highestBidder": Franchise,
  "auctionActive": boolean,
  "auctionPaused": boolean,
  "allPlayers": [Player],
  "franchises": [Franchise]
}
```

**Interface**:
```javascript
class AuctionEngine {
  initialize(franchises, players)  // Returns: void
  startAuction()                   // Returns: void
  placeBid(franchise, amount)      // Returns: {success: boolean, error: string}
  pass(franchise)                  // Returns: void
  markSold()                       // Returns: void
  markUnsold()                     // Returns: void
  nextPlayer()                     // Returns: Player | null
  pauseAuction()                   // Returns: void
  resumeAuction()                  // Returns: void
  validateBid(franchise, amount)   // Returns: {valid: boolean, reason: string}
  getAuctionState()                // Returns: AuctionState
}
```

**Validation Logic**:
```javascript
validateBid(franchise, amount) {
  // Check if franchise is highest bidder
  if (franchise === highestBidder) {
    return {valid: false, reason: "You are already the highest bidder"}
  }
  
  // Check if bid is higher than current
  if (amount <= currentBid) {
    return {valid: false, reason: "Bid must be higher than current bid"}
  }
  
  // Check purse sufficiency
  if (franchise.purse < amount) {
    return {valid: false, reason: "Insufficient purse"}
  }
  
  // Check squad size
  if (franchise.squadSize >= 25) {
    return {valid: false, reason: "Squad full (max 25 players)"}
  }
  
  // Check overseas limit
  if (currentPlayer.overseas && franchise.overseasCount >= 8) {
    return {valid: false, reason: "Overseas limit reached (max 8)"}
  }
  
  return {valid: true}
}
```

### 4. AI Bidding Engine Component

**Responsibility**: Generate intelligent bidding decisions for AI-controlled franchises

**Decision Factors**:
- Remaining purse vs. players needed
- Current squad composition (role gaps)
- Overseas slots available
- Player base price and value assessment
- Randomness for unpredictability

**Interface**:
```javascript
class AIBiddingEngine {
  decideBid(franchise, currentPlayer, currentBid, allFranchises)
    // Returns: {action: "bid"|"pass", amount: number}
  
  evaluatePlayerValue(player, franchise)
    // Returns: number (max willing to pay)
  
  calculateSquadNeeds(franchise)
    // Returns: {batters: number, bowlers: number, allRounders: number, wicketkeepers: number}
  
  shouldBid(franchise, player, currentBid)
    // Returns: boolean
}
```

**AI Strategy Algorithm**:
```javascript
decideBid(franchise, currentPlayer, currentBid, allFranchises) {
  const squadSize = franchise.getSquadSize()
  const remainingPurse = franchise.getRemainingPurse()
  const playersNeeded = 18 - squadSize
  
  // Reserve budget for minimum squad
  const reservedBudget = playersNeeded * 0.2 // 20 lakh per player minimum
  const availableBudget = remainingPurse - reservedBudget
  
  // Don't bid if can't afford minimum squad
  if (availableBudget <= 0) {
    return {action: "pass"}
  }
  
  // Evaluate player value based on squad needs
  const squadNeeds = this.calculateSquadNeeds(franchise)
  const playerValue = this.evaluatePlayerValue(currentPlayer, franchise)
  
  // Check if player fills a need
  const fillsNeed = squadNeeds[currentPlayer.role.toLowerCase()] > 0
  
  // Calculate max willing to pay
  let maxBid = playerValue
  if (fillsNeed) {
    maxBid *= 1.5 // Willing to pay 50% more for needed roles
  }
  
  // Add randomness (±20%)
  maxBid *= (0.8 + Math.random() * 0.4)
  
  // Cap at 300% of base price unless critical need
  const basePriceCap = currentPlayer.basePrice * 3
  if (!fillsNeed && maxBid > basePriceCap) {
    maxBid = basePriceCap
  }
  
  // Decide to bid or pass
  if (currentBid >= maxBid || currentBid >= availableBudget) {
    return {action: "pass"}
  }
  
  // Calculate bid increment
  const increments = [0.1, 0.25, 0.5, 1] // In crore
  let bidAmount = currentBid
  
  // Choose increment based on how much we value the player
  const valueRatio = (maxBid - currentBid) / maxBid
  if (valueRatio > 0.5) {
    bidAmount += increments[3] // Aggressive: +1 crore
  } else if (valueRatio > 0.3) {
    bidAmount += increments[2] // Moderate: +50 lakh
  } else {
    bidAmount += increments[1] // Conservative: +25 lakh
  }
  
  return {action: "bid", amount: bidAmount}
}
```

### 5. Room Manager Component (Server-Side)

**Responsibility**: Manage multiplayer rooms, connections, and state synchronization

**Room State Structure**:
```javascript
{
  "roomCode": "string",      // 6-character unique code
  "hostId": "string",        // Socket ID of host
  "players": [{              // Connected players
    "socketId": "string",
    "name": "string",
    "franchiseName": "string"
  }],
  "auctionStarted": boolean,
  "auctionEngine": AuctionEngine, // Instance of auction engine
  "createdAt": timestamp
}
```

**Interface**:
```javascript
class RoomManager {
  createRoom(hostSocketId, hostName)
    // Returns: {roomCode: string}
  
  joinRoom(roomCode, socketId, playerName)
    // Returns: {success: boolean, room: Room}
  
  selectTeam(roomCode, socketId, franchiseName)
    // Returns: {success: boolean, error: string}
  
  startAuction(roomCode, socketId)
    // Returns: {success: boolean, error: string}
  
  handleDisconnect(socketId)
    // Returns: void
  
  getRoomByCode(roomCode)
    // Returns: Room | null
  
  getRoomBySocketId(socketId)
    // Returns: Room | null
}
```

### 6. Socket.IO Event System

**Client → Server Events**:
```javascript
// Room management
"createRoom" → {playerName: string}
"joinRoom" → {roomCode: string, playerName: string}
"selectTeam" → {franchiseName: string}
"startAuction" → {}

// Auction actions
"placeBid" → {amount: number}
"pass" → {}
"markSold" → {}
"markUnsold" → {}
"nextPlayer" → {}
"pauseAuction" → {}
"resumeAuction" → {}
```

**Server → Client Events**:
```javascript
// Room events
"roomCreated" → {roomCode: string}
"roomJoined" → {room: Room, players: Player[]}
"teamSelected" → {socketId: string, franchiseName: string}
"playerJoined" → {player: Player}
"playerLeft" → {socketId: string}

// Auction events
"auctionStarted" → {auctionState: AuctionState}
"bidPlaced" → {franchise: string, amount: number}
"playerSold" → {player: Player, franchise: string, price: number}
"playerUnsold" → {player: Player}
"nextPlayerAnnounced" → {player: Player}
"auctionPaused" → {}
"auctionResumed" → {}
"auctionFinished" → {results: AuctionResults}

// Error events
"error" → {message: string}
```

### 7. UI Layer Components

**Home Page**:
- Title with animated gradient background
- Two mode selection cards (Computer Mode, Multiplayer Mode)
- Glassmorphism styling with hover effects

**Computer Mode Setup**:
- Player name input field
- Franchise selection grid (10 teams with logos/colors)
- Start Auction button
- Visual indication of selected franchise

**Multiplayer Lobby**:
- Create Room / Join Room toggle
- Room code input (for joining)
- Connected players list with franchise selections
- Available franchises grid with lock icons on taken teams
- Host badge display
- Start Auction button (host only)
- Connection status indicator

**Auction Room**:
- **Player Card** (center): Name, role badge, nationality flag, overseas/Indian indicator, base price, current bid, highest bidder
- **Bidding Controls** (bottom): +10L, +25L, +50L, +1Cr buttons, Pass button, Mark Sold/Unsold (host/single player only)
- **Team Dashboard** (side/top): All 10 franchises with purse, squad size, overseas count, AI badge
- **Live Bid Feed** (side): Recent bid history with timestamps
- **Auction Status** (top): "Going once...", "Going twice...", "Sold!" messaging
- **Warning Toasts**: Validation errors, limit warnings

**Results Page**:
- Franchise squad cards (expandable)
- Statistics panel: Most expensive player, highest remaining purse, largest squad
- Unsold players list
- Export results button
- Return to home button

## Data Models

### Player Model
```javascript
{
  id: string,
  name: string,
  nationality: string,
  role: "Batter" | "Bowler" | "All-Rounder" | "Wicketkeeper",
  basePrice: number,        // In lakhs
  overseas: boolean,
  previousIPLTeams: string[],
  seasonsPlayedFrom2018: number,
  sold: boolean,
  soldTeam: string | null,
  soldPrice: number | null  // In lakhs
}
```

### Franchise Model
```javascript
{
  name: string,
  purse: number,            // In crore
  squad: Player[],
  overseasCount: number,
  isAI: boolean,
  isHost: boolean
}
```

### Room Model
```javascript
{
  roomCode: string,
  hostId: string,
  players: [{
    socketId: string,
    name: string,
    franchiseName: string
  }],
  auctionStarted: boolean,
  auctionEngine: AuctionEngine,
  createdAt: number
}
```

### Auction State Model
```javascript
{
  currentPlayerIndex: number,
  currentPlayer: Player,
  currentBid: number,
  highestBidder: Franchise | null,
  auctionActive: boolean,
  auctionPaused: boolean,
  allPlayers: Player[],
  franchises: Franchise[]
}
```

### Auction Results Model
```javascript
{
  franchises: [{
    name: string,
    squad: Player[],
    totalSpent: number,
    remainingPurse: number,
    squadSize: number,
    overseasCount: number
  }],
  unsoldPlayers: Player[],
  statistics: {
    mostExpensivePlayer: {player: Player, price: number, team: string},
    highestRemainingPurse: {team: string, purse: number},
    largestSquad: {team: string, size: number}
  }
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Player Database Structure Validation

*For any* player record in the database, the record must contain all required attributes: name, nationality, role, basePrice, overseas flag, previousIPLTeams, and seasonsPlayedFrom2018.

**Validates: Requirements 1.2**

### Property 2: Player Role Constraint

*For any* player in the database, the role must be exactly one of: Batter, Bowler, All-Rounder, or Wicketkeeper.

**Validates: Requirements 1.3**

### Property 3: Auction Initialization State

*For any* auction initialization, all franchises must start with purse = 100 crore, squad size = 0, overseas count = 0, and all players must have sold = false.

**Validates: Requirements 1.5, 19.1, 19.2, 19.3, 19.5**

### Property 4: AI Assignment Completeness

*For any* auction start (Computer Mode or Multiplayer), the total number of human-controlled franchises plus AI-controlled franchises must equal exactly 10.

**Validates: Requirements 2.2, 2.4, 3.5**

### Property 5: Room Code Uniqueness

*For any* two rooms created by the Room Manager, their room codes must be different.

**Validates: Requirements 3.1**

### Property 6: Room Join Validation

*For any* room join attempt, the join succeeds if and only if the room code exists and the auction has not started.

**Validates: Requirements 3.2**

### Property 7: Franchise Selection Uniqueness

*For any* room, no two players can have the same franchise selected.

**Validates: Requirements 3.3**

### Property 8: Room State Completeness

*For any* room managed by the Room Manager, the room state must contain roomCode, hostId, players array, teams array, auctionStarted flag, currentPlayerIndex, currentBid, and highestBidder.

**Validates: Requirements 3.6**

### Property 9: Socket Event Emission

*For any* auction action (room creation, bid placement, player sold, etc.), the corresponding Socket.IO event must be emitted to all room participants.

**Validates: Requirements 4.1**

### Property 10: Disconnect Handling

*For any* player disconnect, if the auction has not started, their franchise becomes available; if the auction has started, their franchise becomes AI-controlled.

**Validates: Requirements 4.3, 4.4**

### Property 11: Reconnection Restoration

*For any* valid reconnection attempt by a disconnected player, their franchise control must be restored to them.

**Validates: Requirements 4.5**

### Property 12: Squad Size Limit Enforcement

*For any* franchise at any point during the auction, the squad size must not exceed 25 players.

**Validates: Requirements 5.1**

### Property 13: Overseas Player Limit Enforcement

*For any* franchise at any point during the auction, the overseas player count must not exceed 8.

**Validates: Requirements 5.2**

### Property 14: Bid Purse Validation

*For any* bid attempt, the bid is rejected if the franchise's remaining purse is less than the bid amount.

**Validates: Requirements 5.3**

### Property 15: Invalid Bid Rejection

*For any* invalid bid attempt (insufficient purse, squad full, overseas limit reached, or already highest bidder), the bid must be rejected and an error message displayed.

**Validates: Requirements 5.4**

### Property 16: Valid Bid State Update

*For any* valid bid placement, the current bid amount must be updated to the new bid, and the bidding franchise must become the highest bidder.

**Validates: Requirements 6.2**

### Property 17: Highest Bidder Cannot Rebid

*For any* franchise that is currently the highest bidder, their bid buttons must be disabled until another franchise places a bid.

**Validates: Requirements 6.3**

### Property 18: Player Sale State Update

*For any* player marked as sold, the winning franchise's purse must decrease by the sold price, the player must be added to their squad, and the player's sold status must be updated.

**Validates: Requirements 6.5**

### Property 19: AI Budget Preservation

*For any* AI bidding decision, if the franchise's remaining purse is insufficient to acquire the minimum remaining players needed (18 - current squad size) at 20 lakh each, the AI must pass.

**Validates: Requirements 7.2**

### Property 20: AI Role Prioritization

*For any* AI bidding decision, if the franchise has a gap in a specific role (fewer than 2 players of that role), the AI's maximum bid for players of that role should be higher than for players of roles where the squad is balanced.

**Validates: Requirements 7.3**

### Property 21: AI Bid Randomness

*For any* two AI bidding decisions with identical franchise state and player, the bid amounts may differ due to incorporated randomness.

**Validates: Requirements 7.4**

### Property 22: AI Overbidding Limit

*For any* AI bid on a player where the franchise does not have a critical role gap, the bid must not exceed 300% of the player's base price.

**Validates: Requirements 7.5**

### Property 23: Sequential Player Presentation

*For any* point during the auction, exactly one player must be the current player being auctioned.

**Validates: Requirements 8.1**

### Property 24: Player Display Completeness

*For any* player being auctioned, the UI must display name, role, nationality, overseas status, and base price.

**Validates: Requirements 8.2**

### Property 25: Automatic Player Advancement

*For any* player marked as sold or unsold, the auction engine must automatically advance to the next player.

**Validates: Requirements 8.4**

### Property 26: Auction Completion

*For any* auction where all players have been processed (sold or unsold), the auction engine must emit the auctionFinished event.

**Validates: Requirements 8.5**

### Property 27: Dashboard Display Completeness

*For any* franchise during the auction, the dashboard must display franchise name, remaining purse, squad size, overseas count, and AI badge (if AI-controlled).

**Validates: Requirements 10.1, 10.5**

### Property 28: Squad Limit Warning Display

*For any* franchise approaching squad limits (squad size ≥ 23 or overseas count ≥ 7), warning indicators must be displayed on their dashboard.

**Validates: Requirements 10.3**

### Property 29: Results Squad Display

*For any* completed auction, the results page must display all 10 franchise squads with each player's name, role, and sold price.

**Validates: Requirements 11.1**

### Property 30: Results Statistics Calculation

*For any* completed auction, the system must correctly calculate and display: most expensive player (max sold price), franchise with highest remaining purse (max purse), and franchise with largest squad (max squad size).

**Validates: Requirements 11.2**

### Property 31: Unsold Players List

*For any* completed auction, the results page must display all players where sold = false.

**Validates: Requirements 11.3**

### Property 32: Glow Effect on Highest Bidder

*For any* current highest bidder during the auction, a glow effect class must be applied to their dashboard display.

**Validates: Requirements 12.4**

### Property 33: Pause Control Availability

*For any* user who is the Host (in multiplayer) or playing Computer Mode, pause and resume controls must be available.

**Validates: Requirements 13.1**

### Property 34: Pause Functionality

*For any* paused auction, no bids (human or AI) can be processed until the auction is resumed.

**Validates: Requirements 13.2**

### Property 35: Pause-Resume State Preservation

*For any* auction that is paused and then resumed, the auction state (current player, current bid, highest bidder) must remain unchanged.

**Validates: Requirements 13.3**

### Property 36: Player Filtering Correctness

*For any* applied filter (search text, role, nationality, or sold status), only players matching all active filter criteria must be displayed.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

### Property 37: Connection Status Display

*For any* multiplayer session, the UI must display the current connection state (connected, disconnected, or reconnecting).

**Validates: Requirements 15.1**

### Property 38: Exponential Backoff Reconnection

*For any* lost Socket.IO connection, reconnection attempts must occur with exponentially increasing delays.

**Validates: Requirements 15.2**

### Property 39: Validation Error Messaging

*For any* server-side validation rejection, a descriptive error message must be displayed to the user.

**Validates: Requirements 15.3**

### Property 40: Lobby User Display

*For any* multiplayer lobby, all connected users must be displayed with their selected franchises (or "Not Selected" if none).

**Validates: Requirements 16.1**

### Property 41: Franchise Lock Icon Display

*For any* franchise in the lobby that is already selected by another user, a lock icon must be displayed.

**Validates: Requirements 16.2**

### Property 42: Host Badge Display

*For any* user who is the Host in a multiplayer lobby, a host badge must be displayed next to their name.

**Validates: Requirements 16.3**

### Property 43: Start Button Host-Only Enablement

*For any* multiplayer lobby, the Start Auction button must be enabled only for the Host user.

**Validates: Requirements 16.4**

### Property 44: Room State Persistence

*For any* room operation (bid, player sold, disconnect, etc.), the complete room state must be maintained consistently in server memory.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

### Property 45: Concurrent Bid Processing

*For any* sequence of rapid bids in multiplayer mode, all bids must be processed in the order received without data loss.

**Validates: Requirements 18.3**

### Property 46: Auction Navigation

*For any* auction start or auction finish event, all participants must be navigated to the appropriate page (Auction Room or Results Page respectively).

**Validates: Requirements 20.4, 20.5**

## Error Handling

### Client-Side Error Handling

**Network Errors**:
- Display connection status indicator (connected/disconnected/reconnecting)
- Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
- Queue actions during disconnection and replay on reconnection
- Show "Connection lost" toast notification

**Validation Errors**:
- Display inline error messages for invalid bids
- Show warning toasts for squad limit approaches
- Disable invalid actions (e.g., bid buttons when squad full)
- Provide clear error messages: "Insufficient purse", "Squad full", "Overseas limit reached"

**User Input Errors**:
- Validate room codes (6 characters, alphanumeric)
- Validate player names (non-empty, max 20 characters)
- Show inline validation messages on input fields

### Server-Side Error Handling

**Room Management Errors**:
- Invalid room code: Return error "Room not found"
- Duplicate franchise selection: Return error "Team already taken"
- Non-host attempting to start: Return error "Only host can start auction"
- Room full: Return error "Room is full"

**Auction Errors**:
- Invalid bid (insufficient purse): Reject with "Insufficient purse"
- Invalid bid (squad full): Reject with "Squad full (max 25 players)"
- Invalid bid (overseas limit): Reject with "Overseas limit reached (max 8)"
- Invalid bid (already highest bidder): Reject with "You are already the highest bidder"
- Bid on non-existent player: Reject with "Invalid player"

**Socket.IO Errors**:
- Connection timeout: Trigger reconnection logic
- Event emission failure: Log error and retry
- Invalid event data: Log error and send error event to client

**Data Errors**:
- Player database load failure: Show error page with retry option
- Corrupted room state: Log error and reset room
- Invalid player data: Skip player and log warning

### Error Recovery Strategies

**Graceful Degradation**:
- If Socket.IO fails, offer Computer Mode as fallback
- If player database is incomplete, continue with available players
- If AI engine fails, allow manual control of AI teams

**State Recovery**:
- Persist room state periodically
- On server restart, attempt to restore active rooms
- Provide "Resume Auction" option for interrupted sessions

**User Feedback**:
- Always provide clear, actionable error messages
- Show loading states during async operations
- Provide retry buttons for failed operations
- Log errors to console for debugging

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Test specific bid scenarios (e.g., bid with exact purse amount)
- Test edge cases (e.g., last player in auction, squad at exactly 25 players)
- Test error conditions (e.g., invalid room codes, duplicate franchise selection)
- Test UI component rendering and interactions
- Test Socket.IO event emission and handling

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random auction states and verify constraints hold
- Generate random bid sequences and verify state consistency
- Generate random player data and verify database operations
- Generate random AI decisions and verify strategy compliance
- Run minimum 100 iterations per property test

### Testing Framework Selection

**Frontend Testing**:
- **Unit Tests**: Jest with jsdom for DOM testing
- **Property Tests**: fast-check (JavaScript property-based testing library)
- **E2E Tests**: Playwright for full user flow testing

**Backend Testing**:
- **Unit Tests**: Jest with supertest for API testing
- **Property Tests**: fast-check for auction logic and AI behavior
- **Integration Tests**: Socket.IO client for real-time event testing

### Property Test Configuration

Each property-based test must:
- Run minimum 100 iterations (configured in fast-check)
- Include a comment tag: `// Feature: ipl-mock-auction, Property N: [property description]`
- Reference the design document property number
- Use appropriate generators for test data (players, franchises, bids, etc.)

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 46 correctness properties implemented
- **Integration Test Coverage**: All Socket.IO events and room flows
- **E2E Test Coverage**: Complete user journeys for both modes

### Example Property Test Structure

```javascript
// Feature: ipl-mock-auction, Property 12: Squad Size Limit Enforcement
test('franchise squad size never exceeds 25', () => {
  fc.assert(
    fc.property(
      fc.array(playerGenerator(), {minLength: 1, maxLength: 30}),
      fc.array(fc.integer({min: 1, max: 10}), {minLength: 1, maxLength: 30}),
      (players, bidSequence) => {
        const franchise = new Franchise("Test Team", false);
        const engine = new AuctionEngine();
        
        // Simulate auction with random bids
        for (let i = 0; i < Math.min(players.length, bidSequence.length); i++) {
          if (franchise.canAddPlayer(players[i]).valid) {
            franchise.addPlayer(players[i], bidSequence[i]);
          }
        }
        
        // Property: squad size never exceeds 25
        expect(franchise.getSquadSize()).toBeLessThanOrEqual(25);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Data Generators

**Player Generator**:
```javascript
const playerGenerator = () => fc.record({
  id: fc.uuid(),
  name: fc.string({minLength: 5, maxLength: 30}),
  nationality: fc.oneof(fc.constant("India"), fc.string({minLength: 3, maxLength: 20})),
  role: fc.constantFrom("Batter", "Bowler", "All-Rounder", "Wicketkeeper"),
  basePrice: fc.integer({min: 20, max: 200}), // 20 lakh to 2 crore
  overseas: fc.boolean(),
  previousIPLTeams: fc.array(fc.string(), {maxLength: 5}),
  seasonsPlayedFrom2018: fc.integer({min: 0, max: 7}),
  sold: fc.constant(false),
  soldTeam: fc.constant(null),
  soldPrice: fc.constant(null)
});
```

**Franchise Generator**:
```javascript
const franchiseGenerator = () => fc.record({
  name: fc.constantFrom(
    "Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bengaluru",
    "Kolkata Knight Riders", "Sunrisers Hyderabad", "Rajasthan Royals",
    "Delhi Capitals", "Punjab Kings", "Lucknow Super Giants", "Gujarat Titans"
  ),
  isAI: fc.boolean()
});
```

**Bid Sequence Generator**:
```javascript
const bidSequenceGenerator = (basePrice) => fc.array(
  fc.integer({min: basePrice, max: basePrice * 10}),
  {minLength: 1, maxLength: 20}
);
```

### Critical Test Scenarios

**Computer Mode**:
1. Single human player with 9 AI opponents
2. AI bidding behavior across full auction
3. Offline operation (no network calls)
4. Pause and resume functionality
5. Complete auction flow to results

**Multiplayer Mode**:
6. Room creation and joining
7. Franchise selection with uniqueness
8. Real-time bid synchronization
9. Disconnect and reconnect handling
10. AI takeover for disconnected players
11. Host controls (start, pause, resume)
12. Complete auction flow with multiple human players

**Validation**:
13. Squad size limit enforcement (25 players)
14. Overseas limit enforcement (8 players)
15. Purse validation (cannot bid more than available)
16. Highest bidder cannot rebid
17. Minimum squad target warning (18 players)

**AI Behavior**:
18. AI respects budget constraints
19. AI prioritizes role gaps
20. AI incorporates randomness
21. AI avoids overbidding (300% cap)
22. AI completes minimum squad

**Edge Cases**:
23. Last player in auction
24. All players unsold
25. Franchise with 0 purse remaining
26. Rapid bid succession
27. Simultaneous disconnections
28. Room with 10 human players (no AI)
29. Room with 1 human player (9 AI)

### Continuous Integration

- Run all tests on every commit
- Fail build if any test fails or coverage drops below threshold
- Run property tests with increased iterations (1000) in CI
- Generate coverage reports and track trends
- Run E2E tests on staging environment before deployment
