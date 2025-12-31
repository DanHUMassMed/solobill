import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem
} from '@mui/material';
import AdditionalFields from '../../components/common/AdditionalFields';

const initialProjectState = {
  id: '',
  clientId: '',
  name: '',
  poNumber: '',
  contractingTitle: '',
  contractingRate: '',
  contractingDesc: ''
};

export default function ProjectDialog({ open, onClose, onSave, project, clients }) {
  const [formData, setFormData] = useState(initialProjectState);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData(project);
        try {
          setAdditionalFields(project.additionalFields ? JSON.parse(project.additionalFields) : []);
        } catch (e) {
          setAdditionalFields([]);
        }
      } else {
        setFormData(initialProjectState);
        setAdditionalFields([]);
      }
      setErrors({});
    }
  }, [open, project]);

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
      <DialogTitle>{project?.id ? 'Edit Project' : 'Add New Project'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Client"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.clientId}
            helperText={errors.clientId || "Select the client for this project"}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="PO Number"
            name="poNumber"
            value={formData.poNumber}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Contracting Title"
            name="contractingTitle"
            value={formData.contractingTitle}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Rate ($/hr)"
            name="contractingRate"
            value={formData.contractingRate}
            onChange={handleChange}
            fullWidth
            required
            type="number"
            error={!!errors.contractingRate}
            helperText={errors.contractingRate}
          />
          <TextField
            label="Description"
            name="contractingDesc"
            value={formData.contractingDesc}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
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
