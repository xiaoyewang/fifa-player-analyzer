import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function Dashboard({ players, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPlayers = filteredPlayers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get top players by overall rating (average of main stats)
  const topPlayers = [...players].sort((a, b) => {
    const aAvg = (parseInt(a.pace) + parseInt(a.shooting) + parseInt(a.passing) + 
                 parseInt(a.dribbling) + parseInt(a.defending) + parseInt(a.physical)) / 6;
    const bAvg = (parseInt(b.pace) + parseInt(b.shooting) + parseInt(b.passing) + 
                 parseInt(b.dribbling) + parseInt(b.defending) + parseInt(b.physical)) / 6;
    return bAvg - aAvg;
  }).slice(0, 5);

  // Prepare data for radar chart
  const radarData = {
    labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
    datasets: topPlayers.map((player, index) => ({
      label: player.name,
      data: [player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical],
      backgroundColor: `rgba(${index * 50}, ${255 - index * 30}, ${150 + index * 20}, 0.2)`,
      borderColor: `rgba(${index * 50}, ${255 - index * 30}, ${150 + index * 20}, 1)`,
      borderWidth: 1,
    })),
  };

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
        FIFA Player Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {/* Top Players Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Players Comparison
            </Typography>
            <Box sx={{ height: 400 }}>
              <Radar data={radarData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Featured Players */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Featured Players
            </Typography>
            {topPlayers.map((player) => (
              <Card key={player.id} sx={{ mb: 2 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{player.name}</Typography>
                    <Chip 
                      label={player.club} 
                      size="small" 
                      sx={{ backgroundColor: '#e3f2fd' }} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Chip 
                      label={`PAC ${player.pace}`} 
                      size="small" 
                      sx={{ mr: 0.5, backgroundColor: '#e8f5e9' }} 
                    />
                    <Chip 
                      label={`SHO ${player.shooting}`} 
                      size="small" 
                      sx={{ mr: 0.5, backgroundColor: '#fff3e0' }} 
                    />
                    <Chip 
                      label={`PAS ${player.passing}`} 
                      size="small" 
                      sx={{ mr: 0.5, backgroundColor: '#e0f7fa' }} 
                    />
                    <Chip 
                      label={`DRI ${player.dribbling}`} 
                      size="small" 
                      sx={{ mr: 0.5, backgroundColor: '#f3e5f5' }} 
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" component={RouterLink} to={`/player/${player.id}`}>
                    View Details
                  </Button>
                  <Button size="small" component={RouterLink} to={`/compare?player1=${player.id}`}>
                    Compare
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Paper>
        </Grid>
        
        {/* Player Search */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Player Search
            </Typography>
            <TextField
              fullWidth
              label="Search players by name, club, or nation"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="player table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Nation</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Pace</TableCell>
                    <TableCell>Shooting</TableCell>
                    <TableCell>Passing</TableCell>
                    <TableCell>Dribbling</TableCell>
                    <TableCell>Defending</TableCell>
                    <TableCell>Physical</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell component="th" scope="row">
                        {player.name}
                      </TableCell>
                      <TableCell>{player.club}</TableCell>
                      <TableCell>{player.nation}</TableCell>
                      <TableCell>{player.alt_pos || 'N/A'}</TableCell>
                      <TableCell>{player.pace}</TableCell>
                      <TableCell>{player.shooting}</TableCell>
                      <TableCell>{player.passing}</TableCell>
                      <TableCell>{player.dribbling}</TableCell>
                      <TableCell>{player.defending}</TableCell>
                      <TableCell>{player.physical}</TableCell>
                      <TableCell>
                        <Button size="small" component={RouterLink} to={`/player/${player.id}`}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredPlayers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
