require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./players.db');

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
  // Let the SDK use its default credential provider chain
});

// Create players table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      name TEXT,
      alt_pos TEXT,
      accelerate TEXT,
      club TEXT,
      nation TEXT,
      league TEXT,
      skills INTEGER,
      weak_foot INTEGER,
      intl_rep INTEGER,
      foot TEXT,
      height TEXT,
      weight INTEGER,
      revision TEXT,
      age TEXT,
      club_id INTEGER,
      league_id INTEGER,
      roles TEXT,
      playstyles TEXT,
      pace INTEGER,
      shooting INTEGER,
      passing INTEGER,
      dribbling INTEGER,
      defending INTEGER,
      physical INTEGER,
      acceleration INTEGER,
      sprint_speed INTEGER,
      att_position INTEGER,
      finishing INTEGER,
      shot_power INTEGER,
      long_shots INTEGER,
      volleys INTEGER,
      penalties INTEGER,
      vision INTEGER,
      crossing INTEGER,
      fk_acc INTEGER,
      short_pass INTEGER,
      long_pass INTEGER,
      curve INTEGER,
      agility INTEGER,
      balance INTEGER,
      reactions INTEGER,
      ball_control INTEGER,
      dribbling_stat INTEGER,
      composure INTEGER,
      interceptions INTEGER,
      heading_acc INTEGER,
      def_aware INTEGER,
      stand_tackle INTEGER,
      slide_tackle INTEGER,
      jumping INTEGER,
      stamina INTEGER,
      strength INTEGER,
      aggression INTEGER
    )
  `);
});

// Import CSV data
app.get('/api/import-data', (req, res) => {
  const results = [];
  const csvPath = path.resolve('/Users/wangxy/futbin-dump/output/player_stats.csv');
  
  // Clear existing data
  db.run('DELETE FROM players', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Read and import CSV
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const stmt = db.prepare(`
          INSERT INTO players (
            id, name, alt_pos, accelerate, club, nation, league, skills, weak_foot, 
            intl_rep, foot, height, weight, revision, age, club_id, league_id, roles, 
            playstyles, pace, shooting, passing, dribbling, defending, physical, 
            acceleration, sprint_speed, att_position, finishing, shot_power, long_shots, 
            volleys, penalties, vision, crossing, fk_acc, short_pass, long_pass, curve, 
            agility, balance, reactions, ball_control, dribbling_stat, composure, 
            interceptions, heading_acc, def_aware, stand_tackle, slide_tackle, jumping, 
            stamina, strength, aggression
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        results.forEach((player) => {
          stmt.run(
            player.ID,
            player.Name,
            player['Alt POS'],
            player.AcceleRATE,
            player.Club,
            player.Nation,
            player.League,
            player.Skills,
            player['Weak Foot'],
            player['Intl. Rep'],
            player.Foot,
            player.Height,
            player.Weight,
            player.Revision,
            player.Age,
            player['Club ID'],
            player['League ID'],
            player.Roles,
            player.Playstyles,
            player.Pace,
            player.Shooting,
            player.Passing,
            player.Dribbling,
            player.Defending,
            player.Physical,
            player.Acceleration,
            player['Sprint Speed'],
            player['Att. Position'],
            player.Finishing,
            player['Shot Power'],
            player['Long Shots'],
            player.Volleys,
            player.Penalties,
            player.Vision,
            player.Crossing,
            player['FK Acc.'],
            player['Short Pass'],
            player['Long Pass'],
            player.Curve,
            player.Agility,
            player.Balance,
            player.Reactions,
            player['Ball Control'],
            player.Dribbling,
            player.Composure,
            player.Interceptions,
            player['Heading Acc.'],
            player['Def. Aware'],
            player['Stand Tackle'],
            player['Slide Tackle'],
            player.Jumping,
            player.Stamina,
            player.Strength,
            player.Aggression
          );
        });
        
        stmt.finalize();
        res.json({ message: `Imported ${results.length} players successfully` });
      });
  });
});

// Get all players
app.get('/api/players', (req, res) => {
  db.all('SELECT * FROM players', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get player by ID
app.get('/api/players/:id', (req, res) => {
  db.get('SELECT * FROM players WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(row);
  });
});

// Find similar players based on attributes
app.get('/api/players/:id/similar', (req, res) => {
  const { id } = req.params;
  const { attributes = 'pace,shooting,passing,dribbling,defending,physical' } = req.query;
  
  const attributeList = attributes.split(',');
  
  db.get('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Build a query to find similar players
    let query = 'SELECT *, ';
    let distanceCalc = '';
    
    attributeList.forEach((attr, index) => {
      distanceCalc += `(${player[attr]} - ${attr}) * (${player[attr]} - ${attr})`;
      if (index < attributeList.length - 1) {
        distanceCalc += ' + ';
      }
    });
    
    query += `SQRT(${distanceCalc}) as distance FROM players WHERE id != ? ORDER BY distance ASC LIMIT 10`;
    
    db.all(query, [id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// Natural language query using Claude
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Get all players to provide context to Claude
    db.all('SELECT * FROM players LIMIT 20', async (err, players) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      try {
        // Since we can't access Claude due to region restrictions,
        // provide a fallback response
        const fallbackResponse = {
          answer: `I understand you're asking: "${query}"\n\nI'd like to help, but I'm currently unable to access the AI service due to regional restrictions. Here are some options:\n\n1. You can query the database directly using the search functionality\n2. Try using specific filters in the UI to find players\n3. For this specific query about players with highest pace, you can use the sorting feature in the dashboard`
        };
        
        res.json(fallbackResponse);
      } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Error processing natural language query' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection when server shuts down
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
