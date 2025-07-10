import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

function AdminTicketList({ statusFilter = null }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
  });
  const statuses = ['pending', 'resolved', 'rejected', 'closed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const categories = ['technical', 'billing', 'general', 'feature request', 'bug report'];
  const theme = useTheme();

  useEffect(() => {
    setLoading(true);
    const ticketsCollectionRef = collection(db, 'tickets');
    let q = query(ticketsCollectionRef, orderBy('createdAt', 'desc'));

    if (statusFilter) {
      q = query(ticketsCollectionRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTickets(ticketsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tickets:", err);
        setError('Failed to fetch tickets. Please check permissions.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      if (newStatus === 'rejected') {
        setSelectedTicket(ticketId);
        setRejectDialogOpen(true);
        return;
      }
      
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      console.log(`Ticket ${ticketId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleRejectConfirm = async () => {
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket);
      await updateDoc(ticketRef, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        updatedAt: new Date(),
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error rejecting ticket:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.userEmail.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || ticket.category === filters.category;
    const matchesPriority = !filters.priority || ticket.priority === filters.priority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
      <Typography variant="h5" gutterBottom>
        {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Tickets` : 'All Tickets'}
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
              >
                <MenuItem value="">All Priorities</MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="admin tickets table">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.light, 0.1) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created By (Email)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
              {statusFilter === 'rejected' && (
                <TableCell sx={{ fontWeight: 'bold' }}>Rejection Reason</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                  ...(ticket.status === 'rejected' && {
                    backgroundColor: alpha(theme.palette.error.light, 0.1),
                  }),
                }}
              >
                <TableCell component="th" scope="row">
                  {ticket.title}
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      disableUnderline
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status} sx={{ fontSize: '0.875rem' }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{ticket.priority}</TableCell>
                <TableCell>{ticket.userEmail}</TableCell>
                <TableCell>{ticket.createdAt ? new Date(ticket.createdAt.toDate()).toLocaleString() : 'N/A'}</TableCell>
                {statusFilter === 'rejected' && (
                  <TableCell>{ticket.rejectionReason || 'No reason provided'}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredTickets.length === 0 && !loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="subtitle1">
            {filters.search || filters.category || filters.priority
              ? 'No tickets match the current filters.'
              : `No ${statusFilter || ''} tickets found.`}
          </Typography>
        </Box>
      )}

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Ticket</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Reject Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminTicketList; 
