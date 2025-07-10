import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  Tooltip,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Assignment as TicketIcon,
  CheckCircle as ResolvedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

const priorityColors = {
  low: '#4CAF50',
  medium: '#FFA726',
  high: '#F44336',
  urgent: '#D32F2F',
};

const statusColors = {
  pending: '#FFA726',
  inProgress: '#2196F3',
  resolved: '#4CAF50',
  closed: '#9E9E9E',
};

const statusIcons = {
  pending: <PendingIcon />,
  inProgress: <ErrorIcon />,
  resolved: <ResolvedIcon />,
  closed: <CheckCircleIcon />,
};

function MyTickets() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Setting up ticket listener for user:', user.uid);
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          console.log('Received ticket update. Number of tickets:', querySnapshot.size);
          const ticketsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Ticket data:', { id: doc.id, ...data });
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
            };
          });
          setTickets(ticketsData);
          setLoading(false);
        },
        (err) => {
          console.error('Error in ticket listener:', err);
          setError(`Failed to fetch tickets: ${err.message}`);
          setLoading(false);
        }
      );

      return () => {
        console.log('Cleaning up ticket listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up ticket listener:', err);
      setError(`Error setting up ticket listener: ${err.message}`);
      setLoading(false);
    }
  }, [user]);

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'N/A';
    }
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              My Tickets
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-ticket')}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                },
              }}
            >
              New Ticket
            </Button>
          </Box>
        </motion.div>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inProgress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredTickets.map((ticket, index) => (
                <Grid item xs={12} key={ticket.id}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TicketIcon color="primary" />
                            <Box>
                              <Typography variant="h6" sx={{ mb: 0.5 }}>
                                {ticket.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Created on {formatDate(ticket.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={statusIcons[ticket.status]}
                              label={ticket.status}
                              sx={{
                                backgroundColor: statusColors[ticket.status],
                                color: 'white',
                              }}
                            />
                            <Chip
                              label={ticket.priority}
                              sx={{
                                backgroundColor: priorityColors[ticket.priority],
                                color: 'white',
                              }}
                            />
                            <Chip
                              label={ticket.category}
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {!loading && !error && filteredTickets.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              mt: 4,
              p: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first ticket to get started'}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default MyTickets; 
