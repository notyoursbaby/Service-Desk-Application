import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { isAdmin } from '../utils/adminUtils';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsUserAdmin(adminStatus);
      }
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  if (loading || checkingAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !isUserAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute; 
