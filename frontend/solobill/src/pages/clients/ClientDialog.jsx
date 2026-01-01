import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField
} from '@mui/material';
import AdditionalFields from '../../components/common/AdditionalFields';

const initialClientState = {
  id: '',
  name: '',
  addressL1: '',
  addressL2: '',
  addressL3: '',
  contactNm: '',
  billingRepName: '',
  billingRepEmail: ''
};

export default function ClientDialog({ open, onClose, onSave, client }) {
  const [formData, setFormData] = useState(initialClientState);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData(client);
        try {
          setAdditionalFields(client.additionalFields ? JSON.parse(client.additionalFields) : []);
        } catch {
          setAdditionalFields([]);
        }
      } else {
        setFormData(initialClientState);
        setAdditionalFields([]);
      }
      setErrors({});
    }
  }, [open, client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = () => {
    onSave(formData, additionalFields, setErrors);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client?.id ? 'Edit Client' : 'Add New Client'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Client Name (Bill To Name)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name || "Bill To Name on the Invoice"}
          />
          <TextField
            label="Address Line 1"
            name="addressL1"
            value={formData.addressL1}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.addressL1}
            helperText={errors.addressL1 || "Bill To Address Line 1 on the Invoice"}
          />
          <TextField
            label="Address Line 2"
            name="addressL2"
            value={formData.addressL2}
            onChange={handleChange}
            fullWidth
            helperText="Bill To Address Line 2 on the Invoice"
          />
          <TextField
            label="Address Line 3"
            name="addressL3"
            value={formData.addressL3}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Client Contact Name"
            name="contactNm"
            value={formData.contactNm}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.contactNm}
            helperText={errors.contactNm || "Bill To Name on the Invoice"}
          />
          <TextField
            label="Billing Representative Name"
            name="billingRepName"
            value={formData.billingRepName}
            onChange={handleChange}
            fullWidth
            helperText="Billing Representative Name on the Email"
          />
          <TextField
            label="Billing Representative Email"
            name="billingRepEmail"
            value={formData.billingRepEmail}
            onChange={handleChange}
            fullWidth
            error={!!errors.billingRepEmail}
            helperText={errors.billingRepEmail || "Billing Representative Email for sending the Invoice"}
          />
          
          <AdditionalFields 
              fields={additionalFields} 
              onChange={setAdditionalFields} 
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
