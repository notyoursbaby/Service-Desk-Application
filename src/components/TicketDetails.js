import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketDoc = await getDoc(doc(db, 'tickets', id));
        if (ticketDoc.exists()) {
          setTicket({
            id: ticketDoc.id,
            ...ticketDoc.data(),
            createdAt: ticketDoc.data().createdAt?.toDate(),
          });
        } else {
          setError('Ticket not found');
        }
      } catch (error) {
        setError('Error fetching ticket details');
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const ticketRef = doc(db, 'tickets', id);
      const comment = {
        text: newComment,
        createdAt: new Date(),
        createdBy: user.email,
      };

      await updateDoc(ticketRef, {
        updates: arrayUnion(comment),
      });

      setNewComment('');
      // Refresh ticket data
      const updatedDoc = await getDoc(ticketRef);
      setTicket({
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate(),
      });
    } catch (error) {
      setError('Error adding comment');
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {ticket.title}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Category
            </Typography>
            <Chip label={ticket.category} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Priority
            </Typography>
            <Chip
              label={ticket.priority}
              color={
                ticket.priority === 'urgent'
                  ? 'error'
                  : ticket.priority === 'high'
                  ? 'warning'
                  : 'info'
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={ticket.status}
              color={
                ticket.status === 'open'
                  ? 'success'
                  : ticket.status === 'in-progress'
                  ? 'warning'
                  : 'default'
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Created
            </Typography>
            <Typography>{ticket.createdAt?.toLocaleString()}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography paragraph>{ticket.description}</Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Updates
        </Typography>

        {ticket.updates?.map((update, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {update.createdBy} - {update.createdAt.toDate().toLocaleString()}
            </Typography>
            <Typography paragraph>{update.text}</Typography>
          </Box>
        ))}

        <Box component="form" onSubmit={handleAddComment} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !newComment.trim()}
            sx={{ mt: 2 }}
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default TicketDetails; 
