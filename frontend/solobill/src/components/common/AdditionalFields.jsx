import React from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function AdditionalFields({ fields, onChange }) {
  const handleFieldChange = (index, key, newValue) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: newValue };
    onChange(newFields);
  };

  const handleAddField = () => {
    onChange([...fields, { name: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Additional Information
      </Typography>
      {fields.map((field, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Field Name"
            value={field.name}
            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Value"
            value={field.value}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
            fullWidth
            size="small"
          />
          <IconButton onClick={() => handleRemoveField(index)} color="error" aria-label="delete field">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddField}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Field
      </Button>
    </Box>
  );
}
