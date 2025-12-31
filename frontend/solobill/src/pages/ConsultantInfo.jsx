import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, Box, Snackbar, Alert } from '@mui/material';
import { consultantRepo } from '../db/repositories/consultantRepository';
import AdditionalFields from '../components/common/AdditionalFields';

export default function ConsultantInfo() {
  const [formData, setFormData] = useState({
    name: '',
    addressL1: '',
    addressL2: '',
    addressL3: '',
    email: '',
  });
  const [additionalFields, setAdditionalFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const consultants = await consultantRepo.getAll();
        if (consultants && consultants.length > 0) {
          const consultant = consultants[0];
          setFormData({
            name: consultant.name || '',
            addressL1: consultant.addressL1 || '',
            addressL2: consultant.addressL2 || '',
            addressL3: consultant.addressL3 || '',
            email: consultant.email || '',
          });
          
          if (consultant.additionalFields) {
            try {
              setAdditionalFields(JSON.parse(consultant.additionalFields));
            } catch (e) {
              console.error("Failed to parse additional fields", e);
              setAdditionalFields([]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load consultant info", error);
        showSnackbar('Failed to load information', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.addressL1 || !formData.email) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const consultantData = {
        ...formData,
        additionalFields: JSON.stringify(additionalFields)
      };
      
      await consultantRepo.put(consultantData);
      showSnackbar('Information saved successfully', 'success');
    } catch (error) {
      console.error("Failed to save consultant info", error);
      showSnackbar('Failed to save information', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
      return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Consultant Information</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        This information will be displayed on your invoices.
      </Typography>
      
      <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField 
            label="Full Name" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required 
            fullWidth 
            placeholder="e.g. Daniel Higgins"
        />
        <TextField 
            label="Address Line 1" 
            name="addressL1"
            value={formData.addressL1}
            onChange={handleChange}
            required 
            fullWidth 
            placeholder="e.g. 19 Winifreds Way"
        />
        <TextField 
            label="Address Line 2" 
            name="addressL2"
            value={formData.addressL2}
            onChange={handleChange}
            fullWidth 
            placeholder="e.g. Rutland MA 01543"
        />
        <TextField 
            label="Address Line 3 (Optional)" 
            name="addressL3"
            value={formData.addressL3}
            onChange={handleChange}
            fullWidth 
        />
        <TextField 
            label="Email Address" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
            fullWidth 
            placeholder="e.g. dphiggins@gmail.com"
        />

        <AdditionalFields 
            fields={additionalFields} 
            onChange={setAdditionalFields} 
        />
        
        <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSave}
            sx={{ mt: 2 }}
        >
            SAVE INFORMATION
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}