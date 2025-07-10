import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Email as EmailIcon, Person as PersonIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

function Profile() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', location: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // If no profile, use auth info
          setProfile({
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            location: '',
            department: '',
          });
        }
      } catch (err) {
        setError('Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleEditOpen = () => {
    setEditData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      department: profile?.department || '',
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { ...profile, ...editData, email: user.email }, { merge: true });
      setProfile((prev) => ({ ...prev, ...editData, email: user.email }));
      setSuccess(true);
      setEditOpen(false);
    } catch (err) {
      setError('Error saving profile');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <MotionPaper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              textAlign: 'center',
              position: 'relative',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Avatar
              src={user?.photoURL || ''}
              sx={{ width: 96, height: 96, mx: 'auto', mb: 2, boxShadow: 3 }}
            >
              <PersonIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {profile?.name || user?.displayName || 'User'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <EmailIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body1" color="text.secondary">
                {profile?.email || user?.email}
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">
                  {profile?.phone || '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {profile?.location || '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body2">
                  {profile?.department || '—'}
                </Typography>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                fontWeight: 600,
                px: 4,
                py: 1.2,
                borderRadius: 2,
                mt: 2,
                boxShadow: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                },
              }}
            >
              Edit Profile
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>Profile updated!</Alert>}
          </MotionPaper>
        </motion.div>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Phone"
              name="phone"
              value={editData.phone}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Location"
              name="location"
              value={editData.location}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Department"
              name="department"
              value={editData.department}
              onChange={handleEditChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Profile; 
