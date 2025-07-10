import React from 'react';
import { Box, Typography } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Logo = ({ size = 'medium' }) => {
  const fontSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  const iconSize = size === 'small' ? 32 : size === 'large' ? 56 : 40;
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <SupportAgentIcon sx={{ fontSize: iconSize, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          fontSize,
          letterSpacing: 1,
          background: 'linear-gradient(90deg, #fff 0%, #b3e5fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          userSelect: 'none',
        }}
      >
        Service<span style={{ color: '#21CBF3', WebkitTextFillColor: 'unset', background: 'unset', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>Desk</span>
      </Typography>
    </Box>
  );
};

export default Logo; 
