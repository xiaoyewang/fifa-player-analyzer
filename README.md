# FIFA Player Analyzer

A web application for analyzing FIFA player statistics with an AI-powered chat interface.

## Features

- Browse and search FIFA player database
- Compare player statistics
- View detailed player information
- AI-powered chat interface for natural language queries about players
- Interactive data visualizations

## Architecture

- **Frontend**: React.js application
- **Backend**: Node.js with Express
- **Database**: SQLite for player data storage
- **AI Integration**: Amazon Bedrock with Claude model

## Local Development Setup

### Prerequisites

- Node.js (v14+)
- AWS account with access to Amazon Bedrock
- FIFA player statistics dataset (CSV format)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   PORT=5001
   AWS_REGION=us-east-1
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## AWS Deployment

This application can be deployed to AWS using the AWS CDK. See the [deployment guide](./deployment/README.md) for detailed instructions.

## License

MIT
