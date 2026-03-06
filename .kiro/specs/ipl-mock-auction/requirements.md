# Requirements Document

## Introduction

The IPL Mock Auction is a full-stack web application that simulates the Indian Premier League player auction experience. The system enables users to participate in realistic auction scenarios either offline against AI opponents (Computer Mode) or online with friends in real-time multiplayer sessions. The application provides an immersive auction experience with premium UI design, realistic bidding mechanics, and comprehensive squad management following official IPL rules.

## Glossary

- **System**: The IPL Mock Auction web application
- **Auction_Engine**: The core component managing auction state, bidding logic, and player assignments
- **AI_Bidder**: Automated bidding agent that simulates franchise behavior
- **Room_Manager**: Component handling multiplayer room creation, joining, and state management
- **Socket_Server**: Real-time communication server using Socket.IO
- **Player_Database**: JSON storage containing 200+ IPL player records
- **Franchise**: One of the 10 IPL teams participating in the auction
- **Squad**: Collection of players owned by a franchise
- **Purse**: Budget available to a franchise (starts at 100 crore)
- **Overseas_Player**: Non-Indian player subject to squad limits
- **Base_Price**: Minimum starting bid for a player
- **Host**: User who creates a multiplayer room and controls auction start
- **Room_Code**: Unique identifier for multiplayer sessions
- **Bid_Increment**: Predefined amount added to current bid (+10L, +25L, +50L, +1Cr)
- **UI_Layer**: Frontend presentation layer with HTML/CSS/JavaScript
- **Validation_Engine**: Component enforcing IPL squad rules and bid validity

## Requirements

### Requirement 1: Player Database Management

**User Story:** As a system administrator, I want a comprehensive player database, so that the auction has realistic player options with accurate attributes.

#### Acceptance Criteria

1. THE Player_Database SHALL contain a minimum of 200 IPL players from 2018 onward
2. WHEN a player record is stored, THE Player_Database SHALL include name, nationality, role, basePrice, overseas flag, previousIPLTeams, and seasonsPlayedFrom2018 attributes
3. THE Player_Database SHALL categorize players into exactly four roles: Batter, Bowler, All-Rounder, Wicketkeeper
4. THE Player_Database SHALL store player data in JSON format with structure compatible for MongoDB migration
5. WHEN the auction initializes, THE System SHALL load all player records with sold status set to false

### Requirement 2: Computer Mode (Offline Single-Player)

**User Story:** As a user, I want to play an offline auction against AI opponents, so that I can experience the auction without requiring internet connectivity or other players.

#### Acceptance Criteria

1. WHEN a user selects Computer Mode, THE System SHALL allow the user to enter their name and select one franchise
2. WHEN a user selects a franchise, THE System SHALL assign AI_Bidders to all remaining 9 franchises
3. THE System SHALL support Computer Mode operation with exactly 1 human player
4. WHERE multiple human players are present on the same device, THE System SHALL allow multiple franchise selections with remaining teams assigned to AI_Bidders
5. WHEN the auction starts in Computer Mode, THE Auction_Engine SHALL process all bidding without requiring network connectivity

### Requirement 3: Multiplayer Room System

**User Story:** As a user, I want to create or join online auction rooms, so that I can play with friends from different devices in real-time.

#### Acceptance Criteria

1. WHEN a user creates a room, THE Room_Manager SHALL generate a unique Room_Code and designate that user as Host
2. WHEN a user joins a room, THE Room_Manager SHALL validate the Room_Code and add the user if the room exists and auction has not started
3. THE Room_Manager SHALL prevent duplicate franchise selection within a room
4. WHEN users select franchises in the lobby, THE System SHALL display live updates of selected teams to all room participants
5. WHEN the Host initiates auction start, THE Room_Manager SHALL assign AI_Bidders to all unselected franchises
6. THE Room_Manager SHALL maintain room state including roomCode, hostId, players array, teams array, auctionStarted flag, currentPlayerIndex, currentBid, and highestBidder

### Requirement 4: Real-Time Communication

**User Story:** As a user in multiplayer mode, I want instant updates on bids and auction events, so that the experience feels synchronized and responsive.

#### Acceptance Criteria

1. THE Socket_Server SHALL emit roomCreated, roomJoined, teamSelected, auctionStarted, bidPlaced, playerSold, playerUnsold, and auctionFinished events
2. WHEN a bid is placed, THE Socket_Server SHALL broadcast the bid to all room participants within 100 milliseconds
3. WHEN a player disconnects before auction start, THE Room_Manager SHALL make their selected franchise available for selection
4. WHEN a player disconnects after auction start, THE System SHALL assign an AI_Bidder to control that franchise
5. WHERE a disconnected player reconnects with valid credentials, THE System SHALL restore their franchise control

### Requirement 5: Auction Rules Enforcement

**User Story:** As a franchise manager, I want the system to enforce official IPL squad rules, so that all teams build legal squads.

#### Acceptance Criteria

1. THE Validation_Engine SHALL prevent any franchise from exceeding 25 players in their squad
2. THE Validation_Engine SHALL prevent any franchise from acquiring more than 8 overseas players
3. THE Validation_Engine SHALL prevent bids when the franchise purse is insufficient to cover the bid amount
4. WHEN a franchise attempts an invalid bid, THE System SHALL display a warning message and reject the bid
5. THE Validation_Engine SHALL enforce that each franchise maintains a minimum target of 18 players before auction completion

### Requirement 6: Bidding Mechanics

**User Story:** As a franchise manager, I want to place bids with realistic increments, so that the auction feels authentic and strategic.

#### Acceptance Criteria

1. THE Auction_Engine SHALL provide bid increment options of +10 lakh, +25 lakh, +50 lakh, and +1 crore
2. WHEN a franchise places a valid bid, THE Auction_Engine SHALL update the current bid amount and set that franchise as the highest bidder
3. WHEN a franchise is the current highest bidder, THE System SHALL disable their bid buttons until another franchise bids
4. THE Auction_Engine SHALL provide Pass, Mark Sold, Mark Unsold, and Next Player controls
5. WHEN a player is marked sold, THE Auction_Engine SHALL deduct the sold price from the winning franchise's purse immediately and add the player to their squad

### Requirement 7: AI Bidding Intelligence

**User Story:** As a user playing against AI, I want realistic bidding behavior, so that the auction feels competitive and challenging.

#### Acceptance Criteria

1. WHEN evaluating a bid decision, THE AI_Bidder SHALL consider remaining purse, current squad size, overseas slots available, player role, and base price
2. THE AI_Bidder SHALL avoid bidding when the franchise has insufficient purse for minimum squad completion
3. THE AI_Bidder SHALL prioritize acquiring players in roles where the squad has gaps
4. THE AI_Bidder SHALL incorporate randomness to prevent predictable bidding patterns
5. THE AI_Bidder SHALL avoid overbidding beyond 300% of a player's base price unless the squad has critical role gaps

### Requirement 8: Auction Flow Management

**User Story:** As an auction participant, I want a structured auction flow, so that the process is organized and easy to follow.

#### Acceptance Criteria

1. THE Auction_Engine SHALL present players sequentially one at a time
2. WHEN a player is announced, THE System SHALL display player name, role, nationality, overseas status, and base price
3. WHEN bidding concludes for a player, THE System SHALL display "Going once, Going twice, Sold!" or "Unsold" messaging
4. WHEN a player is sold or marked unsold, THE Auction_Engine SHALL automatically advance to the next player
5. WHEN all players have been auctioned, THE Auction_Engine SHALL emit auctionFinished event and navigate to results page

### Requirement 9: User Interface Design

**User Story:** As a user, I want a premium, visually appealing interface, so that the auction experience feels immersive and professional.

#### Acceptance Criteria

1. THE UI_Layer SHALL use a color scheme of dark violet, black, and gold accents
2. THE UI_Layer SHALL implement glassmorphism effects on player cards and team dashboards
3. WHEN a player is sold, THE UI_Layer SHALL display an animated popup with auction hammer animation
4. THE UI_Layer SHALL provide smooth transitions between auction states with animation duration not exceeding 500 milliseconds
5. THE UI_Layer SHALL be fully responsive across desktop, mobile, and tablet screen sizes

### Requirement 10: Team Dashboard Display

**User Story:** As a franchise manager, I want to see my team's current status, so that I can make informed bidding decisions.

#### Acceptance Criteria

1. THE UI_Layer SHALL display franchise name, remaining purse, current squad size, and overseas player count
2. WHEN the purse or squad composition changes, THE UI_Layer SHALL update the dashboard within 200 milliseconds
3. WHEN a franchise approaches squad limits, THE System SHALL display warning indicators on the dashboard
4. THE UI_Layer SHALL show all 10 franchises with their current purse and squad size during the auction
5. WHERE a franchise is AI-controlled, THE UI_Layer SHALL display an AI badge next to the franchise name

### Requirement 11: Results and Statistics

**User Story:** As a user, I want to see comprehensive auction results, so that I can review squad compositions and auction statistics.

#### Acceptance Criteria

1. WHEN the auction finishes, THE System SHALL display all 10 franchise squads with player names, roles, and sold prices
2. THE System SHALL calculate and display the most expensive player, franchise with highest remaining purse, and franchise with largest squad
3. THE System SHALL display a list of all unsold players
4. THE System SHALL provide an export button to download results in JSON format
5. THE UI_Layer SHALL organize results by franchise with expandable squad views

### Requirement 12: Audio and Visual Feedback

**User Story:** As a user, I want audio and visual feedback during key auction moments, so that the experience is engaging and satisfying.

#### Acceptance Criteria

1. WHEN a player is marked sold, THE System SHALL play an auction hammer sound effect
2. WHEN a bid is placed, THE UI_Layer SHALL display a visual pulse animation on the bidding franchise's dashboard
3. WHEN a franchise wins a player, THE UI_Layer SHALL display a celebratory animation with the player card
4. THE UI_Layer SHALL use glow effects on the current highest bidder's display
5. WHEN hovering over interactive elements, THE UI_Layer SHALL provide visual feedback within 50 milliseconds

### Requirement 13: Auction Control Features

**User Story:** As a host or single player, I want control over auction pacing, so that I can manage the auction flow according to my preference.

#### Acceptance Criteria

1. WHERE the user is the Host in multiplayer or playing Computer Mode, THE System SHALL provide Pause and Resume controls
2. WHEN the auction is paused, THE Auction_Engine SHALL halt all bidding and AI actions
3. WHEN the auction is resumed, THE Auction_Engine SHALL restore the previous state and continue from the current player
4. THE System SHALL provide a Next Player button to manually advance when no bids are placed
5. THE System SHALL provide Mark Sold and Mark Unsold buttons for manual player disposition

### Requirement 14: Player Search and Filtering

**User Story:** As a user reviewing results, I want to search and filter players, so that I can quickly find specific players or player types.

#### Acceptance Criteria

1. THE UI_Layer SHALL provide a search input that filters players by name in real-time
2. THE UI_Layer SHALL provide filter options for role (Batter, Bowler, All-Rounder, Wicketkeeper)
3. THE UI_Layer SHALL provide filter options for nationality (Indian, Overseas)
4. THE UI_Layer SHALL provide filter options for sold status (Sold, Unsold)
5. WHEN filters are applied, THE UI_Layer SHALL update the displayed player list within 100 milliseconds

### Requirement 15: Connection Status and Error Handling

**User Story:** As a multiplayer user, I want to know my connection status, so that I understand if I'm experiencing network issues.

#### Acceptance Criteria

1. THE UI_Layer SHALL display a connection status indicator showing connected, disconnected, or reconnecting states
2. WHEN the Socket_Server connection is lost, THE System SHALL attempt automatic reconnection with exponential backoff
3. WHEN server-side validation rejects an action, THE System SHALL display a descriptive error message to the user
4. WHEN a room code is invalid, THE System SHALL display "Room not found" message
5. WHEN a franchise is already selected by another user, THE System SHALL display "Team already taken" message

### Requirement 16: Lobby Management

**User Story:** As a multiplayer user, I want to see who's in the lobby and which teams are taken, so that I can coordinate with other players.

#### Acceptance Criteria

1. THE UI_Layer SHALL display all connected users in the lobby with their selected franchises
2. THE UI_Layer SHALL display all available franchises with a lock icon on taken teams
3. WHERE a user is the Host, THE UI_Layer SHALL display a host badge next to their name
4. THE UI_Layer SHALL enable the Start Auction button only for the Host
5. WHEN a user joins or leaves, THE UI_Layer SHALL update the lobby display for all participants within 200 milliseconds

### Requirement 17: Data Persistence and State Management

**User Story:** As a system operator, I want auction state to be maintained reliably, so that sessions don't lose data during operation.

#### Acceptance Criteria

1. THE Room_Manager SHALL persist room state in server memory during active sessions
2. WHEN a room is created, THE System SHALL store the complete room state including all participants and auction progress
3. THE System SHALL maintain player sold status, sold team, and sold price throughout the auction
4. WHEN the auction completes, THE System SHALL retain final results for export
5. THE System SHALL structure all data storage to be compatible with future MongoDB migration

### Requirement 18: Performance and Responsiveness

**User Story:** As a user on any device, I want smooth performance, so that the application is enjoyable to use.

#### Acceptance Criteria

1. THE UI_Layer SHALL render all animations at a minimum of 30 frames per second
2. THE System SHALL handle bid processing and state updates without UI freezing
3. WHEN multiple bids occur in rapid succession, THE Socket_Server SHALL process them in order without data loss
4. THE UI_Layer SHALL load the auction page within 2 seconds on standard broadband connections
5. THE System SHALL support simultaneous operation of at least 10 concurrent auction rooms

### Requirement 19: Franchise Initialization

**User Story:** As a system, I want all franchises to start with equal resources, so that the auction is fair and balanced.

#### Acceptance Criteria

1. WHEN an auction initializes, THE System SHALL set each franchise's purse to exactly 100 crore
2. WHEN an auction initializes, THE System SHALL set each franchise's squad size to 0
3. WHEN an auction initializes, THE System SHALL set each franchise's overseas count to 0
4. THE System SHALL include all 10 official IPL franchises: Chennai Super Kings, Mumbai Indians, Royal Challengers Bengaluru, Kolkata Knight Riders, Sunrisers Hyderabad, Rajasthan Royals, Delhi Capitals, Punjab Kings, Lucknow Super Giants, Gujarat Titans
5. THE System SHALL ensure no retained players exist at auction start

### Requirement 20: Page Navigation and Structure

**User Story:** As a user, I want clear navigation between application sections, so that I can easily move through the auction process.

#### Acceptance Criteria

1. THE System SHALL provide a Home Page with Computer Mode and Multiplayer Mode selection buttons
2. WHEN Computer Mode is selected, THE System SHALL navigate to the Computer Mode Setup page
3. WHEN Multiplayer Mode is selected, THE System SHALL navigate to the Multiplayer Lobby page with Create Room and Join Room options
4. WHEN an auction starts, THE System SHALL navigate all participants to the Auction Room page
5. WHEN an auction finishes, THE System SHALL navigate all participants to the Results Page
