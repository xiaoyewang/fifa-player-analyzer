import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function PlayerDetail({ players, loading }) {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (players.length > 0) {
      const foundPlayer = players.find(p => p.id === parseInt(id));
      setPlayer(foundPlayer);
      
      if (foundPlayer) {
        fetchSimilarPlayers(foundPlayer.id);
      }
    }
  }, [players, id]);

  const fetchSimilarPlayers = async (playerId) => {
    setLoadingSimilar(true);
    try {
      const response = await axios.get(`/api/players/${playerId}/similar`);
      setSimilarPlayers(response.data);
    } catch (error) {
      console.error('Error fetching similar players:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Prepare data for radar chart
  const radarData = player ? {
    labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
    datasets: [
      {
        label: player.name,
        data: [
          player.pace,
          player.shooting,
          player.passing,
          player.dribbling,
          player.defending,
          player.physical
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  } : null;

  if (loading || !player) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper function to render stat bars
  const renderStatBar = (label, value, color = '#1e88e5') => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">{value}</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={value} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }} 
      />
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" component={RouterLink} to="/">
          Back to Dashboard
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              {player.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={player.club} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={player.nation} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={player.league} 
                sx={{ mb: 1 }} 
              />
            </Box>
            
            <Typography variant="body1" gutterBottom>
              Position: {player.alt_pos || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Age: {player.age?.split(' ')[0] || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Height: {player.height}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Weight: {player.weight}kg
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${player.foot} Foot`} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${player.skills}★ Skills`} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${player.weak_foot}★ Weak Foot`} 
                size="small" 
                sx={{ mb: 1 }} 
              />
              <Chip 
                label={`${player.accelerate} AcceleRATE`} 
                size="small" 
                sx={{ mb: 1 }} 
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Roles:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {player.roles?.split(',').map((role, index) => (
                  <Chip 
                    key={index}
                    label={role.trim()}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Playstyles:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {player.playstyles?.split(',').map((style, index) => (
                  <Chip 
                    key={index}
                    label={style.trim()}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 400, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Main Stats
              </Typography>
              <Radar data={radarData} options={{ maintainAspectRatio: false }} />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pace
                    </Typography>
                    {renderStatBar('Acceleration', player.acceleration)}
                    {renderStatBar('Sprint Speed', player.sprint_speed)}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Shooting
                    </Typography>
                    {renderStatBar('Positioning', player.att_position, '#ff9800')}
                    {renderStatBar('Finishing', player.finishing, '#ff9800')}
                    {renderStatBar('Shot Power', player.shot_power, '#ff9800')}
                    {renderStatBar('Long Shots', player.long_shots, '#ff9800')}
                    {renderStatBar('Volleys', player.volleys, '#ff9800')}
                    {renderStatBar('Penalties', player.penalties, '#ff9800')}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Passing
                    </Typography>
                    {renderStatBar('Vision', player.vision, '#4caf50')}
                    {renderStatBar('Crossing', player.crossing, '#4caf50')}
                    {renderStatBar('FK Accuracy', player.fk_acc, '#4caf50')}
                    {renderStatBar('Short Pass', player.short_pass, '#4caf50')}
                    {renderStatBar('Long Pass', player.long_pass, '#4caf50')}
                    {renderStatBar('Curve', player.curve, '#4caf50')}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dribbling
                    </Typography>
                    {renderStatBar('Agility', player.agility, '#9c27b0')}
                    {renderStatBar('Balance', player.balance, '#9c27b0')}
                    {renderStatBar('Reactions', player.reactions, '#9c27b0')}
                    {renderStatBar('Ball Control', player.ball_control, '#9c27b0')}
                    {renderStatBar('Dribbling', player.dribbling_stat, '#9c27b0')}
                    {renderStatBar('Composure', player.composure, '#9c27b0')}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Defending
                    </Typography>
                    {renderStatBar('Interceptions', player.interceptions, '#795548')}
                    {renderStatBar('Heading Accuracy', player.heading_acc, '#795548')}
                    {renderStatBar('Defensive Awareness', player.def_aware, '#795548')}
                    {renderStatBar('Standing Tackle', player.stand_tackle, '#795548')}
                    {renderStatBar('Sliding Tackle', player.slide_tackle, '#795548')}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Physical
                    </Typography>
                    {renderStatBar('Jumping', player.jumping, '#f44336')}
                    {renderStatBar('Stamina', player.stamina, '#f44336')}
                    {renderStatBar('Strength', player.strength, '#f44336')}
                    {renderStatBar('Aggression', player.aggression, '#f44336')}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Similar Players
        </Typography>
        
        {loadingSimilar ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            {similarPlayers.slice(0, 4).map((similar) => (
              <Grid item xs={12} sm={6} md={3} key={similar.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {similar.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {similar.club} • {similar.nation}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`PAC ${similar.pace}`} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                      <Chip 
                        label={`SHO ${similar.shooting}`} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                      <Chip 
                        label={`PAS ${similar.passing}`} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                      <Chip 
                        label={`DRI ${similar.dribbling}`} 
                        size="small" 
                        sx={{ mb: 0.5 }} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Similarity: {Math.round((1 - similar.distance / 100) * 100)}%
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/player/${similar.id}`}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/compare?player1=${player.id}&player2=${similar.id}`}
                    >
                      Compare
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default PlayerDetail;
