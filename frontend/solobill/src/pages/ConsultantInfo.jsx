import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, Box } from '@mui/material';
import { consultantRepo } from '../db/repositories/consultantRepository';
import AdditionalFields from '../components/common/AdditionalFields';
import { ConsultantValidator } from '../utils/validation';
import { useNotification } from '../context/NotificationContext';

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
  const [errors, setErrors] = useState({});
  const { notify } = useNotification();

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
        notify('Failed to load information', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [notify]);

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
      notify('Please fix the errors before saving', 'warning');
      return;
    }

    try {
      const consultantData = {
        ...formData,
        additionalFields: JSON.stringify(additionalFields)
      };
      
      await consultantRepo.put(consultantData);
      notify('Information saved successfully', 'success');
      setErrors({});
    } catch (error) {
      console.error("Failed to save consultant info", error);
      notify('Failed to save information', 'error');
    }
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
            placeholder="e.g. Alex Quantum"
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
            placeholder="e.g. 42 Innovation Drive"
            error={!!errors.addressL1}
            helperText={errors.addressL1}
        />
        <TextField 
            label="Address Line 2" 
            name="addressL2"
            value={formData.addressL2}
            onChange={handleChange}
            fullWidth 
            placeholder="e.g. Futurama City, CA 90210"
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
            placeholder="e.g. alex.quantum@example.com"
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
    </Paper>
  );
}
