import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import PolygonLoader from './components/PolygonLoader';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateTicket from './components/CreateTicket';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import Profile from './components/Profile';
import MyTickets from './components/MyTickets';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#21CBF3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Main Content Wrapper
const MainContent = ({ children }) => (
  <Box
    component="main"
    sx={{
      flexGrow: 1,
      pt: { xs: 8, sm: 9 }, // Add top padding to account for fixed navbar
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  >
    {children}
  </Box>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time between 5-10 seconds
    const loadingTime = Math.random() * 5000 + 5000; // Random time between 5-10 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PolygonLoader />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <MainContent>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-ticket"
                element={
                  <PrivateRoute>
                    <CreateTicket />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <PrivateRoute>
                    <MyTickets />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ticket/:id"
                element={
                  <PrivateRoute>
                    <TicketDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </MainContent>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
