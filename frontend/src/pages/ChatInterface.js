import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

function ChatInterface({ players, loading }) {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: 'Welcome to FIFA Player Analyzer! Ask me anything about players, stats, or comparisons.'
    }
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setProcessing(true);
    
    try {
      const response = await axios.post('/api/query', { query: input });
      
      // Add the assistant's response
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.answer
      }]);
      
      // If there are query results, set them
      if (response.data.results) {
        setQueryResults(response.data.results);
      } else {
        setQueryResults(null);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message, index) => {
    let backgroundColor, textAlign;
    
    switch (message.type) {
      case 'user':
        backgroundColor = '#e3f2fd';
        textAlign = 'right';
        break;
      case 'assistant':
        backgroundColor = '#f5f5f5';
        textAlign = 'left';
        break;
      case 'system':
        backgroundColor = '#fffde7';
        textAlign = 'center';
        break;
      default:
        backgroundColor = '#f5f5f5';
        textAlign = 'left';
    }
    
    return (
      <ListItem key={index} sx={{ display: 'flex', justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            maxWidth: '80%', 
            backgroundColor,
            borderRadius: '10px',
            whiteSpace: 'pre-wrap'
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
        </Paper>
      </ListItem>
    );
  };

  const renderQueryResults = () => {
    if (!queryResults || queryResults.length === 0) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Query Results
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                {Object.keys(queryResults[0]).map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {queryResults.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
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
        FIFA Player AI Assistant
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              height: '70vh', 
              display: 'flex', 
              flexDirection: 'column'
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <List>
                {messages.map((message, index) => renderMessage(message, index))}
                <div ref={messagesEndRef} />
              </List>
            </Box>
            
            <Divider />
            
            <Box sx={{ mt: 2, display: 'flex' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask about players, stats, or comparisons..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={processing}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={processing || !input.trim()}
              >
                {processing ? <CircularProgress size={24} /> : 'Send'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Example Questions
              </Typography>
              <List dense>
                <ListItem>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => setInput("Who are the top 5 players with the highest pace?")}
                  >
                    Who are the top 5 players with the highest pace?
                  </Button>
                </ListItem>
                <ListItem>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => setInput("Find players similar to Mbappé")}
                  >
                    Find players similar to Mbappé
                  </Button>
                </ListItem>
                <ListItem>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => setInput("Show me the best defenders in the Premier League")}
                  >
                    Show me the best defenders in the Premier League
                  </Button>
                </ListItem>
                <ListItem>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => setInput("Compare Messi and Ronaldo's stats")}
                  >
                    Compare Messi and Ronaldo's stats
                  </Button>
                </ListItem>
                <ListItem>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => setInput("Find players with 5-star skills and at least 85 pace")}
                  >
                    Find players with 5-star skills and at least 85 pace
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          {queryResults && renderQueryResults()}
        </Grid>
      </Grid>
    </Container>
  );
}

export default ChatInterface;
