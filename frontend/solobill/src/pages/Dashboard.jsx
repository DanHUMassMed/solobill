import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function Dashboard() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography>Welcome to SoloBill.</Typography>
    </Paper>
  );
}
