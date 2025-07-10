import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Assignment as TicketIcon,
  CheckCircle as ResolvedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Animated Stat Card Component
const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay,
      type: "spring",
      stiffness: 100
    }}
    whileHover={{ 
      scale: 1.05,
      transition: { duration: 0.2 }
    }}
  >
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          transform: 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
        },
        '&:hover::before': {
          transform: 'translateY(0)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            </motion.div>
          </Box>
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            <IconButton
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
              }}
            >
              {icon}
            </IconButton>
          </motion.div>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Decorative Background Pattern
const BackgroundPattern = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
      backgroundImage: `radial-gradient(circle at 1px 1px, #2196F3 1px, transparent 0)`,
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
    }}
  />
);

function Dashboard() {
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    urgentTickets: 0,
  });

  useEffect(() => {
    if (!user) return;

    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const stats = {
        totalTickets: querySnapshot.size,
        resolvedTickets: 0,
        pendingTickets: 0,
        urgentTickets: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'resolved') stats.resolvedTickets++;
        if (data.status === 'pending') stats.pendingTickets++;
        if (data.priority === 'urgent') stats.urgentTickets++;
      });

      setStats(stats);
    }, (error) => {
      console.error('Error fetching real-time stats:', error);
      // Optionally set an error state here if you want to display it
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();

  }, [user]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        pt: 4,
        pb: 8,
      }}
    >
      <BackgroundPattern />
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }}
        >
          <Box sx={{ mb: 6, position: 'relative' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome back, {user?.displayName?.split(' ')[0]}!
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '600px',
              }}
            >
              Here's an overview of your support tickets and their current status.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tickets"
              value={stats.totalTickets}
              icon={<TicketIcon />}
              color={theme.palette.primary.main}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resolved"
              value={stats.resolvedTickets}
              icon={<ResolvedIcon />}
              color={theme.palette.success.main}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={stats.pendingTickets}
              icon={<PendingIcon />}
              color={theme.palette.warning.main}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Urgent"
              value={stats.urgentTickets}
              icon={<ErrorIcon />}
              color={theme.palette.error.main}
              delay={0.4}
            />
          </Grid>

          {/* Decorative Elements */}
          <Grid item xs={12}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <StarIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {stats.resolvedTickets} tickets resolved this month
                  </Typography>
                </Paper>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TrendingIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {((stats.resolvedTickets / stats.totalTickets) * 100).toFixed(0)}% resolution rate
                  </Typography>
                </Paper>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard; 
