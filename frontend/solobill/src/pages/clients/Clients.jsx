import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  InputAdornment, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useClients } from '../../hooks/useClients';
import ClientDialog from './ClientDialog';

export default function Clients() {
  const { clients, snackbar, closeSnackbar, saveClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });

  const handleOpenDialog = (client = null) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  const handleSave = async (clientData, additionalFields, setErrors) => {
    const result = await saveClient(clientData, additionalFields);
    if (result.success) {
      handleCloseDialog();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const handleDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteClient(deleteConfirmation.id);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contactNm && client.contactNm.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add Client
        </Button>
      </Box>

      <Paper sx={{ p: 1, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredClients.map((client) => (
          <Grid item xs={12} sm={6} md={4} key={client.id}>
            <Card variant="outlined" sx={{ 
                height: '100%', 
                width: '100%',
                display: 'flex', 
                flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {client.addressL1}
                  {client.addressL2 && <><br />{client.addressL2}</>}
                  {client.addressL3 && <><br />{client.addressL3}</>}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Billing Representative:</Typography>
                    <Typography variant="body2">
                        {client.billingRepName || 'N/A'}
                        {client.billingRepEmail && <><br />{client.billingRepEmail}</>}
                    </Typography>
                </Box>
                 {client.contactNm && (
                     <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">Contact:</Typography>
                         <Typography variant="body2">{client.contactNm}</Typography>
                     </Box>
                 )}
              </CardContent>
              <CardActions disableSpacing sx={{ justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(client)}>
                  Edit
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => confirmDelete(client.id)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {filteredClients.length === 0 && (
            <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
                    No clients found. Add a new client to get started.
                </Typography>
            </Grid>
        )}
      </Grid>

      <ClientDialog 
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        client={selectedClient}
      />

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this client? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteConfirmation({ open: false, id: null })}>Cancel</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
            Delete
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
