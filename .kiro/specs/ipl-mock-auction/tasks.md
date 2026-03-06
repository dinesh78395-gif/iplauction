# Implementation Plan: IPL Mock Auction

## Overview

This implementation plan breaks down the IPL Mock Auction application into incremental, testable steps. The approach follows a bottom-up strategy: building core data structures and logic first, then adding the auction engine, AI intelligence, multiplayer functionality, and finally the UI layer. Each major component includes property-based tests to validate correctness properties from the design document.

The implementation uses:
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express, Socket.IO
- **Testing**: Jest with fast-check for property-based testing
- **Data Storage**: JSON files

## Tasks

- [x] 1. Project setup and structure
  - Create project directory structure (backend/, frontend/, backend/data/)
  - Initialize Node.js project with package.json
  - Install dependencies: express, socket.io, cors, jest, fast-check
  - Create .gitignore file
  - Set up Jest configuration for both frontend and backend testing
  - _Requirements: 17.5_

- [ ] 2. Create player database and data models
  - [x] 2.1 Create players.json with 200+ IPL players
    - Include all required attributes: id, name, nationality, role, basePrice, overseas, previousIPLTeams, seasonsPlayedFrom2018
    - Ensure players span all four roles: Batter, Bowler, All-Rounder, Wicketkeeper
    - Include mix of Indian and overseas players
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.2 Write property test for player database structure
    - **Property 1: Player Database Structure Validation**
    - **Property 2: Player Role Constraint**
    - **Validates: Requirements 1.2, 1.3**
  
  - [x] 2.3 Create PlayerDatabase class (backend/playerDatabase.js)
    - Implement loadPlayers(), getPlayerById(), getUnsoldPlayers(), markPlayerSold(), resetAuction()
    - Load players from JSON file
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 2.4 Write unit tests for PlayerDatabase class
    - Test loading players from JSON
    - Test marking players as sold
    - Test filtering unsold players
    - _Requirements: 1.1, 1.5_

- [ ] 3. Implement Franchise model and validation
  - [x] 3.1 Create Franchise class (backend/franchise.js)
    - Implement constructor, addPlayer(), canBid(), canAddPlayer(), getSquadSize(), getOverseasCount(), getRemainingPurse()
    - Initialize with name, 100 crore purse, empty squad, isAI flag
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [ ]* 3.2 Write property tests for Franchise constraints
    - **Property 12: Squad Size Limit Enforcement**
    - **Property 13: Overseas Player Limit Enforcement**
    - **Property 14: Bid Purse Validation**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [x] 3.3 Implement validation logic in canAddPlayer()
    - Check squad size limit (max 25)
    - Check overseas limit (max 8)
    - Return {valid: boolean, reason: string}
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ]* 3.4 Write unit tests for Franchise validation
    - Test squad size limit enforcement
    - Test overseas limit enforcement
    - Test purse validation
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Build Auction Engine core logic
  - [x] 4.1 Create AuctionEngine class (backend/auctionEngine.js)
    - Implement initialize(), startAuction(), placeBid(), pass(), markSold(), markUnsold(), nextPlayer()
    - Maintain auction state: currentPlayerIndex, currentPlayer, currentBid, highestBidder, auctionActive
    - _Requirements: 8.1, 8.4, 8.5_
  
  - [x] 4.2 Implement bid validation logic
    - Implement validateBid() method
    - Check: franchise is not highest bidder, bid > currentBid, sufficient purse, squad not full, overseas limit
    - Return {valid: boolean, reason: string}
    - _Requirements: 5.3, 5.4, 6.3_
  
  - [ ]* 4.3 Write property tests for auction engine
    - **Property 15: Invalid Bid Rejection**
    - **Property 16: Valid Bid State Update**
    - **Property 17: Highest Bidder Cannot Rebid**
    - **Property 18: Player Sale State Update**
    - **Property 23: Sequential Player Presentation**
    - **Property 25: Automatic Player Advancement**
    - **Property 26: Auction Completion**
    - **Validates: Requirements 5.4, 6.2, 6.3, 6.5, 8.1, 8.4, 8.5**
  
  - [x] 4.3 Implement pause and resume functionality
    - Add pauseAuction() and resumeAuction() methods
    - Maintain auctionPaused flag
    - Prevent bids when paused
    - _Requirements: 13.2, 13.3_
  
  - [ ]* 4.4 Write property tests for pause functionality
    - **Property 34: Pause Functionality**
    - **Property 35: Pause-Resume State Preservation**
    - **Validates: Requirements 13.2, 13.3**

- [x] 5. Checkpoint - Core auction logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement AI Bidding Engine
  - [x] 6.1 Create AIBiddingEngine class (backend/aiEngine.js)
    - Implement decideBid(), evaluatePlayerValue(), calculateSquadNeeds(), shouldBid()
    - Use decision factors: remaining purse, squad composition, overseas slots, player value, randomness
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.2 Implement budget preservation logic
    - Calculate reserved budget for minimum squad (18 - squadSize) * 0.2 crore
    - Pass if available budget <= 0
    - _Requirements: 7.2_
  
  - [x] 6.3 Implement role prioritization logic
    - Calculate squad needs by role
    - Increase max bid by 50% for needed roles
    - _Requirements: 7.3_
  
  - [x] 6.4 Implement overbidding cap
    - Cap bids at 300% of base price unless critical role gap
    - Add randomness (±20%) to max bid
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 6.5 Write property tests for AI bidding
    - **Property 19: AI Budget Preservation**
    - **Property 20: AI Role Prioritization**
    - **Property 21: AI Bid Randomness**
    - **Property 22: AI Overbidding Limit**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
  
  - [ ]* 6.6 Write unit tests for AI decision making
    - Test AI passes when budget insufficient
    - Test AI bids higher for needed roles
    - Test AI respects 300% cap
    - _Requirements: 7.2, 7.3, 7.5_

- [ ] 7. Build Room Manager for multiplayer
  - [x] 7.1 Create RoomManager class (backend/rooms.js)
    - Implement createRoom(), joinRoom(), selectTeam(), startAuction(), handleDisconnect()
    - Maintain rooms Map with roomCode as key
    - Generate unique 6-character room codes
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 7.2 Write property tests for room management
    - **Property 5: Room Code Uniqueness**
    - **Property 6: Room Join Validation**
    - **Property 7: Franchise Selection Uniqueness**
    - **Property 8: Room State Completeness**
    - **Property 10: Disconnect Handling**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.6, 4.3, 4.4**
  
  - [x] 7.3 Implement AI assignment for unselected teams
    - When auction starts, assign AI to all unselected franchises
    - Set isAI flag on franchises
    - _Requirements: 3.5_
  
  - [ ]* 7.4 Write property test for AI assignment
    - **Property 4: AI Assignment Completeness**
    - **Validates: Requirements 2.2, 2.4, 3.5**
  
  - [x] 7.5 Implement disconnect and reconnect handling
    - Before auction start: make franchise available
    - After auction start: assign AI to franchise
    - On reconnect: restore franchise control
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 7.6 Write property test for reconnection
    - **Property 11: Reconnection Restoration**
    - **Validates: Requirements 4.5**

- [ ] 8. Create Express server with Socket.IO
  - [x] 8.1 Create server.js with Express and Socket.IO setup
    - Initialize Express app
    - Set up Socket.IO with CORS
    - Serve static files from frontend/
    - Listen on port 3000
    - _Requirements: 4.1_
  
  - [x] 8.2 Implement Socket.IO event handlers
    - Handle: createRoom, joinRoom, selectTeam, startAuction, placeBid, pass, markSold, markUnsold, nextPlayer, pauseAuction, resumeAuction
    - Emit: roomCreated, roomJoined, teamSelected, playerJoined, playerLeft, auctionStarted, bidPlaced, playerSold, playerUnsold, nextPlayerAnnounced, auctionPaused, auctionResumed, auctionFinished, error
    - _Requirements: 4.1_
  
  - [ ]* 8.3 Write property test for event emission
    - **Property 9: Socket Event Emission**
    - **Validates: Requirements 4.1**
  
  - [x] 8.4 Implement server-side validation
    - Validate all incoming events
    - Return descriptive error messages
    - _Requirements: 5.4, 15.3_
  
  - [ ]* 8.5 Write unit tests for Socket.IO handlers
    - Test room creation flow
    - Test bid placement flow
    - Test error handling
    - _Requirements: 4.1, 15.3_

- [x] 9. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create frontend HTML structure
  - [x] 10.1 Create index.html (Home Page)
    - Title, animated background
    - Computer Mode and Multiplayer Mode buttons
    - Link to style.css and script.js
    - _Requirements: 20.1_
  
  - [x] 10.2 Create computer-setup.html (Computer Mode Setup)
    - Player name input
    - Franchise selection grid (10 teams)
    - Start Auction button
    - _Requirements: 2.1_
  
  - [x] 10.3 Create lobby.html (Multiplayer Lobby)
    - Create Room / Join Room toggle
    - Room code input
    - Connected players list
    - Available franchises grid
    - Start Auction button (host only)
    - Connection status indicator
    - _Requirements: 3.1, 3.2, 16.1, 16.2, 16.3, 16.4_
  
  - [x] 10.4 Create auction.html (Auction Room)
    - Player card (center)
    - Bidding controls (bottom)
    - Team dashboard (side)
    - Live bid feed (side)
    - Auction status (top)
    - Pause/Resume buttons
    - _Requirements: 6.1, 6.4, 8.2, 10.1, 13.1_
  
  - [x] 10.5 Create results.html (Results Page)
    - Franchise squad cards (expandable)
    - Statistics panel
    - Unsold players list
    - Export results button
    - Return to home button
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 11. Implement CSS styling
  - [x] 11.1 Create style.css with base styles
    - Color scheme: dark violet (#1a0033), black (#000000), gold (#ffd700)
    - Typography: Modern sans-serif fonts
    - Reset and base styles
    - _Requirements: 9.1_
  
  - [x] 11.2 Implement glassmorphism effects
    - Semi-transparent backgrounds with backdrop-filter
    - Apply to player cards and team dashboards
    - _Requirements: 9.2_
  
  - [x] 11.3 Create animations and transitions
    - Smooth transitions (max 500ms)
    - Hover effects on interactive elements
    - Glow effects for highest bidder
    - Pulse animation for bids
    - Sold popup animation with hammer
    - _Requirements: 9.3, 12.2, 12.3, 12.4_
  
  - [x] 11.4 Implement responsive design
    - Mobile-first approach
    - Breakpoints for tablet and desktop
    - Flexible layouts with CSS Grid and Flexbox
    - _Requirements: 9.5_

- [ ] 12. Build frontend JavaScript - Core utilities
  - [x] 12.1 Create script.js with utility functions
    - DOM manipulation helpers
    - Format currency (crore/lakh)
    - Generate room codes
    - Local storage helpers
    - _Requirements: 17.4_
  
  - [x] 12.2 Implement client-side Franchise class
    - Mirror backend Franchise class for Computer Mode
    - Include all validation logic
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 12.3 Implement client-side AuctionEngine class
    - Mirror backend AuctionEngine for Computer Mode
    - Include all auction logic
    - _Requirements: 8.1, 8.4, 8.5_
  
  - [x] 12.4 Implement client-side AIBiddingEngine class
    - Mirror backend AI logic for Computer Mode
    - Include all decision-making logic
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Implement Home Page functionality
  - [x] 13.1 Add event listeners for mode selection
    - Computer Mode button → navigate to computer-setup.html
    - Multiplayer Mode button → navigate to lobby.html
    - _Requirements: 20.2, 20.3_
  
  - [ ]* 13.2 Write unit tests for navigation
    - Test mode selection navigation
    - _Requirements: 20.2, 20.3_

- [ ] 14. Implement Computer Mode Setup functionality
  - [x] 14.1 Add franchise selection logic
    - Display 10 franchise cards
    - Highlight selected franchise
    - Store selection in state
    - _Requirements: 2.1, 2.2_
  
  - [x] 14.2 Implement Start Auction button
    - Validate player name and franchise selection
    - Initialize auction with 1 human + 9 AI franchises
    - Load players from local JSON
    - Navigate to auction.html with Computer Mode flag
    - _Requirements: 2.2, 2.3, 2.5_
  
  - [ ]* 14.3 Write property test for AI assignment
    - **Property 3: Auction Initialization State**
    - **Validates: Requirements 1.5, 19.1, 19.2, 19.3, 19.5**

- [ ] 15. Implement Multiplayer Lobby functionality
  - [x] 15.1 Add Socket.IO client connection
    - Connect to server on page load
    - Handle connection, disconnect, reconnect events
    - Display connection status
    - _Requirements: 15.1, 15.2_
  
  - [ ]* 15.2 Write property test for connection status
    - **Property 37: Connection Status Display**
    - **Property 38: Exponential Backoff Reconnection**
    - **Validates: Requirements 15.1, 15.2**
  
  - [x] 15.3 Implement Create Room functionality
    - Emit createRoom event with player name
    - Receive roomCreated event with room code
    - Display room code prominently
    - _Requirements: 3.1_
  
  - [x] 15.4 Implement Join Room functionality
    - Validate room code input
    - Emit joinRoom event
    - Handle roomJoined or error events
    - _Requirements: 3.2, 15.4_
  
  - [x] 15.5 Implement franchise selection in lobby
    - Display 10 franchise cards
    - Show lock icon on taken teams
    - Emit selectTeam event on selection
    - Update UI on teamSelected event
    - _Requirements: 3.3, 16.2_
  
  - [ ]* 15.6 Write property tests for lobby display
    - **Property 40: Lobby User Display**
    - **Property 41: Franchise Lock Icon Display**
    - **Property 42: Host Badge Display**
    - **Property 43: Start Button Host-Only Enablement**
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.4**
  
  - [x] 15.7 Implement Start Auction button (host only)
    - Enable only for host
    - Emit startAuction event
    - Navigate to auction.html on auctionStarted event
    - _Requirements: 3.5, 16.4_

- [x] 16. Checkpoint - Frontend setup complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement Auction Room UI rendering
  - [x] 17.1 Create player card rendering
    - Display name, role badge, nationality flag, overseas/Indian indicator, base price
    - Update on nextPlayerAnnounced event
    - _Requirements: 8.2_
  
  - [ ]* 17.2 Write property test for player display
    - **Property 24: Player Display Completeness**
    - **Validates: Requirements 8.2**
  
  - [x] 17.3 Create team dashboard rendering
    - Display all 10 franchises
    - Show name, purse, squad size, overseas count, AI badge
    - Update on bidPlaced and playerSold events
    - _Requirements: 10.1, 10.4, 10.5_
  
  - [ ]* 17.4 Write property test for dashboard display
    - **Property 27: Dashboard Display Completeness**
    - **Property 28: Squad Limit Warning Display**
    - **Validates: Requirements 10.1, 10.3, 10.5**
  
  - [x] 17.5 Create live bid feed
    - Display recent bids with timestamps
    - Auto-scroll to latest bid
    - _Requirements: 6.2_
  
  - [x] 17.6 Create auction status messaging
    - Display "Going once...", "Going twice...", "Sold!" or "Unsold"
    - Animate text transitions
    - _Requirements: 8.3_

- [ ] 18. Implement Auction Room bidding logic
  - [x] 18.1 Add bid button event listeners
    - +10L, +25L, +50L, +1Cr buttons
    - Calculate new bid amount
    - Computer Mode: call local AuctionEngine.placeBid()
    - Multiplayer Mode: emit placeBid event
    - _Requirements: 6.1, 6.2_
  
  - [x] 18.2 Implement Pass button
    - Computer Mode: call local AuctionEngine.pass()
    - Multiplayer Mode: emit pass event
    - _Requirements: 6.4_
  
  - [x] 18.3 Implement Mark Sold/Unsold buttons (host/single player only)
    - Show only for host or Computer Mode
    - Computer Mode: call local AuctionEngine.markSold()/markUnsold()
    - Multiplayer Mode: emit markSold/markUnsold events
    - _Requirements: 6.4, 6.5_
  
  - [x] 18.4 Implement Next Player button
    - Computer Mode: call local AuctionEngine.nextPlayer()
    - Multiplayer Mode: emit nextPlayer event
    - _Requirements: 6.4, 13.4_
  
  - [x] 18.5 Handle bid validation errors
    - Display error toasts for invalid bids
    - Show specific messages: "Insufficient purse", "Squad full", "Overseas limit reached", "Already highest bidder"
    - _Requirements: 5.4, 15.3_
  
  - [ ]* 18.6 Write property test for validation errors
    - **Property 39: Validation Error Messaging**
    - **Validates: Requirements 15.3**

- [ ] 19. Implement Auction Room AI bidding (Computer Mode)
  - [x] 19.1 Create AI bidding loop
    - After each bid/pass, check if current highest bidder is AI
    - If AI, call AIBiddingEngine.decideBid()
    - Execute AI decision with delay (500-1000ms for realism)
    - _Requirements: 7.1_
  
  - [x] 19.2 Implement AI bid execution
    - If action is "bid", call AuctionEngine.placeBid() with AI franchise and amount
    - If action is "pass", call AuctionEngine.pass() with AI franchise
    - Update UI after AI action
    - _Requirements: 7.1_
  
  - [x] 19.3 Handle AI bidding during pause
    - Pause AI bidding loop when auction is paused
    - Resume when auction is resumed
    - _Requirements: 13.2_

- [ ] 20. Implement Auction Room multiplayer event handling
  - [x] 20.1 Handle bidPlaced event
    - Update current bid and highest bidder
    - Update team dashboard
    - Add to bid feed
    - Apply glow effect to highest bidder
    - _Requirements: 6.2, 12.4_
  
  - [ ]* 20.2 Write property test for glow effect
    - **Property 32: Glow Effect on Highest Bidder**
    - **Validates: Requirements 12.4**
  
  - [x] 20.3 Handle playerSold event
    - Play auction hammer sound
    - Show sold popup animation
    - Update franchise squad and purse
    - Advance to next player
    - _Requirements: 6.5, 12.1, 12.3_
  
  - [x] 20.4 Handle playerUnsold event
    - Show unsold message
    - Advance to next player
    - _Requirements: 8.4_
  
  - [x] 20.5 Handle nextPlayerAnnounced event
    - Update player card with new player
    - Reset current bid to base price
    - Reset highest bidder
    - _Requirements: 8.1, 8.4_
  
  - [x] 20.6 Handle auctionFinished event
    - Navigate to results.html
    - Pass auction results data
    - _Requirements: 8.5, 20.5_
  
  - [ ]* 20.7 Write property test for auction navigation
    - **Property 46: Auction Navigation**
    - **Validates: Requirements 20.4, 20.5**

- [ ] 21. Implement pause and resume functionality
  - [x] 21.1 Add Pause/Resume button (host/Computer Mode only)
    - Show only for host or Computer Mode
    - Toggle between Pause and Resume
    - Computer Mode: call local AuctionEngine.pauseAuction()/resumeAuction()
    - Multiplayer Mode: emit pauseAuction/resumeAuction events
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [x] 21.2 Handle pause state in UI
    - Disable bid buttons when paused
    - Show "Auction Paused" overlay
    - _Requirements: 13.2_
  
  - [ ]* 21.3 Write property test for pause controls
    - **Property 33: Pause Control Availability**
    - **Validates: Requirements 13.1**

- [x] 22. Checkpoint - Auction room complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Implement Results Page functionality
  - [x] 23.1 Render franchise squads
    - Display all 10 franchises with expandable squad views
    - Show player name, role, sold price for each player
    - Show total spent, remaining purse, squad size, overseas count
    - _Requirements: 11.1_
  
  - [ ]* 23.2 Write property test for results display
    - **Property 29: Results Squad Display**
    - **Property 31: Unsold Players List**
    - **Validates: Requirements 11.1, 11.3**
  
  - [x] 23.3 Calculate and display statistics
    - Most expensive player (max sold price)
    - Franchise with highest remaining purse
    - Franchise with largest squad
    - _Requirements: 11.2_
  
  - [ ]* 23.4 Write property test for statistics calculation
    - **Property 30: Results Statistics Calculation**
    - **Validates: Requirements 11.2**
  
  - [x] 23.5 Display unsold players list
    - Show all players with sold = false
    - Include name, role, base price
    - _Requirements: 11.3_
  
  - [x] 23.6 Implement export results button
    - Generate JSON with complete auction results
    - Trigger download
    - _Requirements: 11.4_
  
  - [x] 23.7 Add Return to Home button
    - Navigate to index.html
    - Clear auction state
    - _Requirements: 20.1_

- [ ] 24. Implement player search and filtering
  - [x] 24.1 Add search input on results page
    - Filter players by name in real-time
    - Update displayed lists
    - _Requirements: 14.1_
  
  - [x] 24.2 Add filter dropdowns
    - Role filter (Batter, Bowler, All-Rounder, Wicketkeeper)
    - Nationality filter (Indian, Overseas)
    - Sold status filter (Sold, Unsold)
    - _Requirements: 14.2, 14.3, 14.4_
  
  - [ ]* 24.3 Write property test for filtering
    - **Property 36: Player Filtering Correctness**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**

- [ ] 25. Add audio and visual effects
  - [x] 25.1 Add auction hammer sound effect
    - Include audio file in frontend/assets/
    - Play on playerSold event
    - _Requirements: 12.1_
  
  - [x] 25.2 Implement sold popup animation
    - Show animated popup with player card
    - Include hammer animation
    - Auto-dismiss after 2 seconds
    - _Requirements: 12.3_
  
  - [x] 25.3 Implement bid pulse animation
    - Apply pulse effect to bidding franchise dashboard
    - Trigger on bidPlaced event
    - _Requirements: 12.2_

- [ ] 26. Implement error handling and edge cases
  - [x] 26.1 Add client-side error handling
    - Network error handling with retry
    - Invalid input validation
    - Display user-friendly error messages
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [x] 26.2 Add server-side error handling
    - Validate all incoming events
    - Handle invalid room codes, duplicate selections, invalid bids
    - Return descriptive error messages
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [ ]* 26.3 Write unit tests for error scenarios
    - Test invalid room code
    - Test duplicate franchise selection
    - Test invalid bids
    - _Requirements: 15.4, 15.5_

- [ ] 27. Implement state persistence
  - [x] 27.1 Add room state persistence
    - Maintain room state in server memory
    - Update state on all auction events
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ]* 27.2 Write property test for state persistence
    - **Property 44: Room State Persistence**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

- [ ] 28. Optimize performance
  - [x] 28.1 Implement efficient DOM updates
    - Use document fragments for batch updates
    - Debounce search and filter operations
    - _Requirements: 18.2_
  
  - [ ] 28.2 Optimize Socket.IO event handling
    - Handle rapid bid sequences correctly
    - Queue events if processing
    - _Requirements: 18.3_
  
  - [ ]* 28.3 Write property test for concurrent bids
    - **Property 45: Concurrent Bid Processing**
    - **Validates: Requirements 18.3**

- [ ] 29. Final testing and polish
  - [ ]* 29.1 Run all property-based tests
    - Verify all 46 properties pass with 100+ iterations
    - Fix any failing properties
  
  - [ ]* 29.2 Run all unit tests
    - Ensure 80%+ code coverage
    - Fix any failing tests
  
  - [x] 29.3 Manual testing of complete flows
    - Test Computer Mode end-to-end
    - Test Multiplayer Mode with multiple clients
    - Test disconnect/reconnect scenarios
    - Test all edge cases
  
  - [ ] 29.4 Polish UI and animations
    - Verify responsive design on mobile, tablet, desktop
    - Smooth all animations
    - Ensure consistent styling
    - _Requirements: 9.5_

- [x] 30. Final checkpoint - Project complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data models → core logic → AI → multiplayer → UI
- Computer Mode and Multiplayer Mode share the same UI but use different state management (local vs. Socket.IO)
