import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

function TicketList() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const theme = useTheme();

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const statuses = ['all', 'open', 'in-progress', 'resolved', 'closed', 'pending', 'rejected'];
  const priorities = ['all', 'low', 'medium', 'high', 'urgent'];
  const sortOptions = [
    { label: 'Newest First', value: 'createdAt_desc' },
    { label: 'Oldest First', value: 'createdAt_asc' },
    { label: 'Priority (High to Low)', value: 'priority_desc' },
    { label: 'Priority (Low to High)', value: 'priority_asc' },
  ];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let ticketsCollectionRef = collection(db, 'tickets');
    let q = query(
      ticketsCollectionRef,
      where('userId', '==', user.uid),
      orderBy(filters.sortBy === 'createdAt_desc' || filters.sortBy === 'createdAt_asc' ? 'createdAt' : filters.sortBy.split('_')[0], filters.sortOrder)
    );

     // Apply status filter if not 'all'
     if (filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }

    // Apply priority filter if not 'all'
    if (filters.priority !== 'all') {
      q = query(q, where('priority', '==', filters.priority));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      // Apply search filter client-side
      const filtered = ticketList.filter(ticket =>
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.category.toLowerCase().includes(filters.search.toLowerCase())
      );

      setTickets(filtered);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tickets:", err);
      setError('Failed to fetch tickets. Please check permissions.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, filters]); // Add filters to dependency array

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => {
      let sortBy = prev.sortBy;
      let sortOrder = prev.sortOrder;

      if (name === 'sortBy') {
        const [field, order] = value.split('_');
        sortBy = field;
        sortOrder = order;
      }

      return {
        ...prev,
        [name]: value,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };
    });
  };

  const handleViewRejection = (ticket) => {
    setSelectedTicket(ticket);
    setRejectionDialogOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'info';
      case 'closed':
        return 'default';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tickets
        </Typography>

        {/* Filter and Sort Options */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tickets..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              value={filters.search}
              onChange={(e) => handleFilterChange({ target: { name: 'search', value: e.target.value } })}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                label="Priority"
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
             <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sortBy"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={handleFilterChange}
                label="Sort By"
                startAdornment={
                  <InputAdornment position="start">
                     <SortIcon />
                   </InputAdornment>
                 }
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  sx={{
                    ...(ticket.status === 'rejected' && {
                      backgroundColor: theme.palette.error.light,
                    }),
                  }}
                >
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {ticket.createdAt?.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.status === 'rejected' && (
                      <IconButton
                        onClick={() => handleViewRejection(ticket)}
                        color="error"
                        size="small"
                      >
                        <InfoIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Rejection Details Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <CancelIcon color="error" />
          Ticket Rejected
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ticket Details:
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Title:</strong> {selectedTicket?.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Category:</strong> {selectedTicket?.category}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Priority:</strong> {selectedTicket?.priority}
            </Typography>
          </Box>
          <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
            <Typography variant="subtitle1" color="error" gutterBottom>
              Rejection Reason:
            </Typography>
            <Typography variant="body1">
              {selectedTicket?.rejectionReason || 'No reason provided'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {tickets.length === 0 && !loading && !error && ( // Use tickets.length here, not filteredTickets.length
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="subtitle1">No tickets found.</Typography>
        </Box>
      )}
    </Container>
  );
}

export default TicketList;
