import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField
} from '@mui/material';
import {AdditionalFields} from '../../components/common/AdditionalFields';
import FormDialog from '../../components/common/FormDialog';

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
  const additionalFieldsRef = useRef(null);
  const [formData, setFormData] = useState(initialClientState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData(client);
      } else {
        setFormData(initialClientState);
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
    if (!additionalFieldsRef.current) {
      // This should never happen, but makes JSX + React happy
      return;
    }
    const additionalFields = additionalFieldsRef.current.getValueForSave();

    onSave(formData, additionalFields, setErrors);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSave={handleSubmit}
      title={client?.id ? 'Edit Client' : 'Add New Client'}
    >
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
          ref={additionalFieldsRef}
          value={formData.additionalFields}
        />
      </Box>
    </FormDialog>
  );
}

