import React from 'react';
import { Typography, Paper, TextField, Button, Box } from '@mui/material';

export default function ConsultantInfo() {
  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Consultant Information</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        This information will be displayed on your invoices.
      </Typography>
      
      <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Full Name" required fullWidth defaultValue="Daniel Higgins" />
        <TextField label="Address Line 1" required fullWidth defaultValue="19 Winifreds Way" />
        <TextField label="Address Line 2" fullWidth defaultValue="Rutland MA 01543" />
        <TextField label="Address Line 3 (Optional)" fullWidth />
        <TextField label="Email Address" required fullWidth defaultValue="dphiggins@gmail.com" />
        
        <Button variant="contained" color="primary" size="large">
            SAVE INFORMATION
        </Button>
      </Box>
    </Paper>
  );
}
