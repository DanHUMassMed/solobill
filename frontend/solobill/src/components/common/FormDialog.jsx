import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';

export default function FormDialog({ 
  open, 
  onClose, 
  onSave, 
  title, 
  children,
  saveText = "Save",
  cancelText = "Cancel",
  maxWidth = "sm",
  fullWidth = true,
  loading = false
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{cancelText}</Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
