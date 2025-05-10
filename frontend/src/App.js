import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import PlayerComparison from './pages/PlayerComparison';
import ChatInterface from './pages/ChatInterface';
import PlayerDetail from './pages/PlayerDetail';
import axios from 'axios';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#ff6d00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // First, import the data
        await axios.get('/api/import-data');
        
        // Then fetch the players
        const response = await axios.get('/api/players');
        setPlayers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load player data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {error ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <h2>Error</h2>
              <p>{error}</p>
            </Box>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard players={players} loading={loading} />} />
              <Route path="/compare" element={<PlayerComparison players={players} loading={loading} />} />
              <Route path="/chat" element={<ChatInterface players={players} loading={loading} />} />
              <Route path="/player/:id" element={<PlayerDetail players={players} loading={loading} />} />
            </Routes>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
