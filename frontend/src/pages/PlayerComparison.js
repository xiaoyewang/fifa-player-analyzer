import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  Button,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Radar, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function PlayerComparison({ players, loading }) {
  const [searchParams] = useSearchParams();
  const initialPlayer1Id = searchParams.get('player1');
  const initialPlayer2Id = searchParams.get('player2');

  const [selectedPlayer1, setSelectedPlayer1] = useState(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [attributes, setAttributes] = useState({
    pace: true,
    shooting: true,
    passing: true,
    dribbling: true,
    defending: true,
    physical: true
  });
  const [attributeWeights, setAttributeWeights] = useState({
    pace: 1,
    shooting: 1,
    passing: 1,
    dribbling: 1,
    defending: 1,
    physical: 1
  });

  useEffect(() => {
    if (players.length > 0) {
      if (initialPlayer1Id) {
        const player1 = players.find(p => p.id === parseInt(initialPlayer1Id));
        if (player1) setSelectedPlayer1(player1);
      }
      
      if (initialPlayer2Id) {
        const player2 = players.find(p => p.id === parseInt(initialPlayer2Id));
        if (player2) setSelectedPlayer2(player2);
      }
    }
  }, [players, initialPlayer1Id, initialPlayer2Id]);

  const handlePlayer1Change = (event) => {
    const player = players.find(p => p.id === event.target.value);
    setSelectedPlayer1(player);
  };

  const handlePlayer2Change = (event) => {
    const player = players.find(p => p.id === event.target.value);
    setSelectedPlayer2(player);
  };

  const handleAttributeChange = (event) => {
    setAttributes({
      ...attributes,
      [event.target.name]: event.target.checked
    });
  };

  const handleWeightChange = (attribute, value) => {
    setAttributeWeights({
      ...attributeWeights,
      [attribute]: value
    });
  };

  const findSimilarPlayers = async () => {
    if (!selectedPlayer1) return;
    
    setLoadingSimilar(true);
    
    try {
      // Get selected attributes as a comma-separated string
      const selectedAttributes = Object.keys(attributes)
        .filter(attr => attributes[attr])
        .join(',');
      
      const response = await axios.get(`/api/players/${selectedPlayer1.id}/similar?attributes=${selectedAttributes}`);
      setSimilarPlayers(response.data);
    } catch (error) {
      console.error('Error finding similar players:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Prepare data for radar chart
  const radarData = {
    labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
    datasets: [
      selectedPlayer1 && {
        label: selectedPlayer1.name,
        data: [
          selectedPlayer1.pace,
          selectedPlayer1.shooting,
          selectedPlayer1.passing,
          selectedPlayer1.dribbling,
          selectedPlayer1.defending,
          selectedPlayer1.physical
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      selectedPlayer2 && {
        label: selectedPlayer2.name,
        data: [
          selectedPlayer2.pace,
          selectedPlayer2.shooting,
          selectedPlayer2.passing,
          selectedPlayer2.dribbling,
          selectedPlayer2.defending,
          selectedPlayer2.physical
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ].filter(Boolean)
  };

  // Prepare data for detailed stats comparison
  const getDetailedStatsData = () => {
    if (!selectedPlayer1 && !selectedPlayer2) return null;
    
    const labels = [
      'Acceleration', 'Sprint Speed', 'Positioning', 'Finishing',
      'Shot Power', 'Long Shots', 'Vision', 'Crossing',
      'Short Pass', 'Long Pass', 'Agility', 'Balance',
      'Reactions', 'Ball Control', 'Interceptions', 'Heading',
      'Stamina', 'Strength'
    ];
    
    const datasets = [
      selectedPlayer1 && {
        label: selectedPlayer1.name,
        data: [
          selectedPlayer1.acceleration, selectedPlayer1.sprint_speed,
          selectedPlayer1.att_position, selectedPlayer1.finishing,
          selectedPlayer1.shot_power, selectedPlayer1.long_shots,
          selectedPlayer1.vision, selectedPlayer1.crossing,
          selectedPlayer1.short_pass, selectedPlayer1.long_pass,
          selectedPlayer1.agility, selectedPlayer1.balance,
          selectedPlayer1.reactions, selectedPlayer1.ball_control,
          selectedPlayer1.interceptions, selectedPlayer1.heading_acc,
          selectedPlayer1.stamina, selectedPlayer1.strength
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      selectedPlayer2 && {
        label: selectedPlayer2.name,
        data: [
          selectedPlayer2.acceleration, selectedPlayer2.sprint_speed,
          selectedPlayer2.att_position, selectedPlayer2.finishing,
          selectedPlayer2.shot_power, selectedPlayer2.long_shots,
          selectedPlayer2.vision, selectedPlayer2.crossing,
          selectedPlayer2.short_pass, selectedPlayer2.long_pass,
          selectedPlayer2.agility, selectedPlayer2.balance,
          selectedPlayer2.reactions, selectedPlayer2.ball_control,
          selectedPlayer2.interceptions, selectedPlayer2.heading_acc,
          selectedPlayer2.stamina, selectedPlayer2.strength
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      }
    ].filter(Boolean);
    
    return {
      labels,
      datasets
    };
  };

  const detailedStatsData = getDetailedStatsData();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Player Comparison
      </Typography>
      
      <Grid container spacing={4}>
        {/* Player Selection */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="player1-label">Player 1</InputLabel>
                  <Select
                    labelId="player1-label"
                    value={selectedPlayer1?.id || ''}
                    label="Player 1"
                    onChange={handlePlayer1Change}
                  >
                    {players.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name} ({player.club})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5">VS</Typography>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="player2-label">Player 2</InputLabel>
                  <Select
                    labelId="player2-label"
                    value={selectedPlayer2?.id || ''}
                    label="Player 2"
                    onChange={handlePlayer2Change}
                  >
                    {players.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name} ({player.club})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Main Stats Comparison */}
        {(selectedPlayer1 || selectedPlayer2) && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Main Stats Comparison
              </Typography>
              <Box sx={{ height: 400 }}>
                <Radar data={radarData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Player Info */}
        {(selectedPlayer1 || selectedPlayer2) && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Player Information
              </Typography>
              
              <Grid container spacing={2}>
                {selectedPlayer1 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedPlayer1.name}
                      </Typography>
                      <Typography variant="body2">
                        Club: {selectedPlayer1.club}
                      </Typography>
                      <Typography variant="body2">
                        Nation: {selectedPlayer1.nation}
                      </Typography>
                      <Typography variant="body2">
                        Position: {selectedPlayer1.alt_pos || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Age: {selectedPlayer1.age?.split(' ')[0] || 'N/A'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${selectedPlayer1.foot} Foot`} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                        <Chip 
                          label={`${selectedPlayer1.skills}★ Skills`} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                        <Chip 
                          label={`${selectedPlayer1.weak_foot}★ Weak Foot`} 
                          size="small" 
                          sx={{ mb: 0.5 }} 
                        />
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {selectedPlayer2 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedPlayer2.name}
                      </Typography>
                      <Typography variant="body2">
                        Club: {selectedPlayer2.club}
                      </Typography>
                      <Typography variant="body2">
                        Nation: {selectedPlayer2.nation}
                      </Typography>
                      <Typography variant="body2">
                        Position: {selectedPlayer2.alt_pos || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Age: {selectedPlayer2.age?.split(' ')[0] || 'N/A'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${selectedPlayer2.foot} Foot`} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                        <Chip 
                          label={`${selectedPlayer2.skills}★ Skills`} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                        <Chip 
                          label={`${selectedPlayer2.weak_foot}★ Weak Foot`} 
                          size="small" 
                          sx={{ mb: 0.5 }} 
                        />
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Find Similar Players
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Select attributes to consider for similarity:
              </Typography>
              
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={attributes.pace} onChange={handleAttributeChange} name="pace" />}
                  label="Pace"
                />
                <FormControlLabel
                  control={<Checkbox checked={attributes.shooting} onChange={handleAttributeChange} name="shooting" />}
                  label="Shooting"
                />
                <FormControlLabel
                  control={<Checkbox checked={attributes.passing} onChange={handleAttributeChange} name="passing" />}
                  label="Passing"
                />
                <FormControlLabel
                  control={<Checkbox checked={attributes.dribbling} onChange={handleAttributeChange} name="dribbling" />}
                  label="Dribbling"
                />
                <FormControlLabel
                  control={<Checkbox checked={attributes.defending} onChange={handleAttributeChange} name="defending" />}
                  label="Defending"
                />
                <FormControlLabel
                  control={<Checkbox checked={attributes.physical} onChange={handleAttributeChange} name="physical" />}
                  label="Physical"
                />
              </FormGroup>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={findSimilarPlayers}
                disabled={!selectedPlayer1 || loadingSimilar}
                sx={{ mt: 2 }}
              >
                {loadingSimilar ? 'Finding...' : 'Find Similar Players'}
              </Button>
              
              {similarPlayers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Players similar to {selectedPlayer1.name}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {similarPlayers.slice(0, 5).map((player) => (
                      <Chip 
                        key={player.id}
                        label={`${player.name} (${Math.round(player.distance * 100) / 100})`}
                        onClick={() => setSelectedPlayer2(player)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Detailed Stats Comparison */}
        {detailedStatsData && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Stats Comparison
              </Typography>
              <Box sx={{ height: 500 }}>
                <Bar 
                  data={detailedStatsData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    },
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default PlayerComparison;
