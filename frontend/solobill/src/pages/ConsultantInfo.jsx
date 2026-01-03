import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, TextField, Button, Box, Divider } from '@mui/material';
import AdditionalFields from '../components/common/AdditionalFields';
import { useConsultant } from '../hooks/useConsultant';
import { useNotification } from '../context/NotificationContext';
import PageHeader from '../components/common/PageHeader';
const initialConsultantState = {
  id: '',
  name: '',
  addressL1: '',
  addressL2: '',
  addressL3: '',
  email: '',
};

export default function ConsultantInfo() {
  const [formData, setFormData] = useState(initialConsultantState);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [errors, setErrors] = useState({});

  const { consultant, loading, saveConsultant } = useConsultant();
  const { notify } = useNotification();

  useEffect(() => {
    if (consultant) {
      setFormData({
        id: consultant.id,
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
  }, [consultant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    const result = await saveConsultant(formData, additionalFields);
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
      notify('Please fix the errors before saving', 'warning');
    } else if (result.success) {
      setErrors({});
    }
  };

  if (loading) {
      return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
            <PageHeader 
              title="Consultant"
              
            />
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          This information will be displayed on your invoices.
        </Typography>
      </Box>
      
      <Paper component="form" noValidate autoComplete="off" sx={{ display: 'flex', p: 3, flexDirection: 'column', gap: 2 }}>
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
            sx={{ mb: 2 }}
        />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>

              </Grid>

        <TextField 
            label="Line 1" 
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
            label="Line 2" 
            name="addressL2"
            value={formData.addressL2}
            onChange={handleChange}
            fullWidth 
            placeholder="e.g. Futurama City, CA 90210"
        />
        <TextField 
            label="Line 3 (Optional)" 
            name="addressL3"
            value={formData.addressL3}
            onChange={handleChange}
            fullWidth 
        />
        </Grid>
        </Box>

         <Divider sx={{ my: 2 }} />
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

            onClick={handleSave}
            sx={{ mt: 2 }}
        >
            SAVE INFORMATION
        </Button>
      </Paper>
    </Box>
  );
}
