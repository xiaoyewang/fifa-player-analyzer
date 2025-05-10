# FIFA Player Analyzer

A web application for analyzing FIFA player data, comparing players, and using natural language to search for players based on specific criteria.

## Features

1. **Player Dashboard**
   - View top players and their stats
   - Search and filter players
   - Interactive visualizations of player attributes

2. **Player Comparison**
   - Compare two players side by side
   - Radar charts for main attributes
   - Detailed comparison of specific stats
   - Find similar players based on selected attributes

3. **Natural Language Search**
   - Chat interface powered by Amazon Bedrock's Claude model
   - Ask questions about players in natural language
   - Get SQL-based results for specific queries
   - Interactive examples to get started

4. **Player Details**
   - Comprehensive view of player attributes
   - Visual representation of stats
   - Similar player recommendations

## Tech Stack

### Backend
- Express.js
- SQLite database
- Amazon Bedrock (Claude model) for natural language processing
- CSV parsing for data import

### Frontend
- React.js
- Material-UI for components
- Chart.js for data visualization
- Axios for API requests

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- AWS account with access to Amazon Bedrock
- AWS CLI configured with appropriate credentials

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd fifa-player-analyzer/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your AWS credentials:
   ```
   PORT=5000
   AWS_REGION=us-east-1
   # Add your AWS credentials if not using IAM roles
   # AWS_ACCESS_KEY_ID=your_access_key
   # AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

4. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd fifa-player-analyzer/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Data Import

The application automatically imports player data from the CSV file located at `/Users/wangxy/futbin-dump/output/player_stats.csv` when the server starts.

## Using the Application

1. **Dashboard**: Browse and search for players
2. **Compare Players**: Select two players to compare their stats side by side
3. **AI Chat**: Ask questions about players using natural language
4. **Player Details**: Click on a player to view detailed information

## Example Chat Queries

- "Who are the top 5 players with the highest pace?"
- "Find players similar to Mbappé"
- "Show me the best defenders in the Premier League"
- "Compare Messi and Ronaldo's stats"
- "Find players with 5-star skills and at least 85 pace"
