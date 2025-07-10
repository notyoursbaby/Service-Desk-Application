import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import Lottie from 'lottie-react';
import loginAnimation from '../assets/login-animation.json';
import './Login.css';
import TypingTitle from './TypingTitle';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('login-no-scroll');
    return () => {
      document.body.classList.remove('login-no-scroll');
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#f5f7fa',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          {/* Left side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={6}
              className="login-fade-in"
              sx={{
                padding: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(33,150,243,0.10)',
              }}
            >
              <div className="login-logo">
                <HeadsetMicIcon sx={{ color: '#2196F3', fontSize: 38 }} />
              </div>
              <TypingTitle
                className="login-typing-title"
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: '#1a237e',
                  textAlign: 'center',
                  letterSpacing: 1,
                  minHeight: 48,
                  display: 'block',
                  marginBottom: 8,
                }}
              />

              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  color: '#1976d2',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                Your support, our priority!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: '#666',
                  textAlign: 'center',
                }}
              >
                Sign in to manage your service tickets and get support
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#4285F4',
                  '&:hover': {
                    backgroundColor: '#357ABD',
                  },
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 16px 0 rgba(66,133,244,0.15)',
                }}
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </Paper>
          </Grid>

          {/* Right side - Animation */}
          <Grid item xs={12} md={6}>
            <Box
              className="login-fade-in"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minHeight: { xs: 200, md: 400 },
              }}
            >
              <Lottie
                animationData={loginAnimation}
                className="lottie-shadow"
                style={{ width: '100%', maxWidth: 500 }}
                loop={true}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
export default Login;
