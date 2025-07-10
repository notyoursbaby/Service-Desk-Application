import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TicketIcon,
  CheckCircle as ResolvedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AdminTicketList from './AdminTicketList';
import UserListTable from './UserListTable';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { ...icon.props.sx, fontSize: 40 } })}
          </Box>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

function AdminDashboard() {
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    rejectedTickets: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        console.log('Fetching users...');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        console.log('Total users fetched:', totalUsers);

        // Fetch tickets count and status
        console.log('Fetching tickets...');
        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const totalTickets = ticketsSnapshot.size;
        console.log('Total tickets fetched:', totalTickets);
        let resolvedTickets = 0;
        let pendingTickets = 0;
        let rejectedTickets = 0;

        ticketsSnapshot.forEach((doc) => {
          const ticket = doc.data();
          console.log('Ticket status:', ticket.status);
          if (ticket.status === 'resolved') resolvedTickets++;
          if (ticket.status === 'pending') pendingTickets++;
          if (ticket.status === 'rejected') rejectedTickets++;
        });

        console.log('Resolved tickets:', resolvedTickets);
        console.log('Pending tickets:', pendingTickets);
        console.log('Rejected tickets:', rejectedTickets);

        setStats({
          totalUsers,
          totalTickets,
          resolvedTickets,
          pendingTickets,
          rejectedTickets,
        });
        console.log('Stats updated:', { totalUsers, totalTickets, resolvedTickets, pendingTickets, rejectedTickets });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleCardClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        pt: 4,
        pb: 8,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: theme.palette.primary.dark,
            }}
          >
            Admin Dashboard Overview
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => handleCardClick('users')} style={{ cursor: 'pointer' }}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<PeopleIcon sx={{ color: theme.palette.primary.main }} />}
                color={theme.palette.primary.main}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => handleCardClick('allTickets')} style={{ cursor: 'pointer' }}>
              <StatCard
                title="Total Tickets"
                value={stats.totalTickets}
                icon={<TicketIcon sx={{ color: theme.palette.info.main }} />}
                color={theme.palette.info.main}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => handleCardClick('resolvedTickets')} style={{ cursor: 'pointer' }}>
              <StatCard
                title="Resolved Tickets"
                value={stats.resolvedTickets}
                icon={<ResolvedIcon sx={{ color: theme.palette.success.main }} />}
                color={theme.palette.success.main}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => handleCardClick('pendingTickets')} style={{ cursor: 'pointer' }}>
              <StatCard
                title="Pending Tickets"
                value={stats.pendingTickets}
                icon={<PendingIcon sx={{ color: theme.palette.warning.main }} />}
                color={theme.palette.warning.main}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => handleCardClick('rejectedTickets')} style={{ cursor: 'pointer' }}>
              <StatCard
                title="Rejected Tickets"
                value={stats.rejectedTickets}
                icon={<RejectedIcon sx={{ color: theme.palette.error.main }} />}
                color={theme.palette.error.main}
              />
            </div>
          </Grid>
        </Grid>

        {/* Conditional rendering of tables based on selected category */}
        {selectedCategory === 'users' && <UserListTable />}
        {selectedCategory === 'allTickets' && <AdminTicketList />}
        {selectedCategory === 'resolvedTickets' && <AdminTicketList statusFilter="resolved" />}
        {selectedCategory === 'pendingTickets' && <AdminTicketList statusFilter="pending" />}
        {selectedCategory === 'rejectedTickets' && <AdminTicketList statusFilter="rejected" />}
      </Container>
    </Box>
  );
}

export default AdminDashboard; 
