import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, Box, Snackbar, Alert } from '@mui/material';
import { consultantRepo } from '../db/repositories/consultantRepository';
import AdditionalFields from '../components/common/AdditionalFields';
import { ConsultantValidator } from '../utils/validation';

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
  const [errors, setErrors] = useState({});

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
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    const { isValid, errors: validationErrors } = ConsultantValidator.validate(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      showSnackbar('Please fix the errors before saving', 'warning');
      return;
    }

    try {
      const consultantData = {
        ...formData,
        additionalFields: JSON.stringify(additionalFields)
      };
      
      await consultantRepo.put(consultantData);
      showSnackbar('Information saved successfully', 'success');
      setErrors({});
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
            error={!!errors.name}
            helperText={errors.name}
        />
        <TextField 
            label="Address Line 1" 
            name="addressL1"
            value={formData.addressL1}
            onChange={handleChange}
            required 
            fullWidth 
            placeholder="e.g. 19 Winifreds Way"
            error={!!errors.addressL1}
            helperText={errors.addressL1}
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
            error={!!errors.email}
            helperText={errors.email}
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
