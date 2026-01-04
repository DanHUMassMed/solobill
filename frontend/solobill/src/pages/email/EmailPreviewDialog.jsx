import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Alert,
  Typography,
  DialogActions,
  Button
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmailIcon from '@mui/icons-material/Email';

export default function EmailPreviewDialog({ open, onClose, emailPreview, onSend }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Email Preview</DialogTitle>

      <DialogContent>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: '#f5f5f5',
            fontFamily: 'monospace',
            mb: 2,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
        </Paper>

        <Alert
          severity="warning"
          icon={<WarningAmberIcon />}
          sx={{ bgcolor: '#fff4e5', color: '#663c00' }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Reminder:
          </Typography>
          Please attach the downloaded invoice(s) to your email before sending.
          Browsers cannot add attachments automatically.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>CANCEL</Button>
        <Button variant="contained" startIcon={<EmailIcon />} onClick={onSend}>
          OPEN EMAIL CLIENT
        </Button>
      </DialogActions>
    </Dialog>
  );
}
