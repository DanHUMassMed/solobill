import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  InputAdornment, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { clientRepo } from '../db/repositories/clientRepository';
import AdditionalFields from '../components/common/AdditionalFields';
import { ClientValidator } from '../utils/validation';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await clientRepo.getAll();
      setClients(allClients);
    } catch (error) {
      console.error("Failed to load clients", error);
      showSnackbar('Failed to load clients', 'error');
    }
  };

  const handleOpenDialog = (client = null) => {
    setErrors({});
    if (client) {
      setCurrentClient(client);
      try {
        setAdditionalFields(client.additionalFields ? JSON.parse(client.additionalFields) : []);
      } catch (e) {
        setAdditionalFields([]);
      }
    } else {
      setCurrentClient({
        id: '',
        name: '',
        addressL1: '',
        addressL2: '',
        addressL3: '',
        contactNm: '',
        billingRepName: '',
        billingRepEmail: ''
      });
      setAdditionalFields([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClient(null);
    setAdditionalFields([]);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentClient(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    const { isValid, errors: validationErrors } = ClientValidator.validate(currentClient);

    if (!isValid) {
      setErrors(validationErrors);
      showSnackbar('Please fix the errors before saving', 'warning');
      return;
    }

    try {
      const clientData = {
        ...currentClient,
        id: currentClient.id || crypto.randomUUID(),
        additionalFields: JSON.stringify(additionalFields)
      };

      if (currentClient.id) {
        await clientRepo.put(clientData);
        showSnackbar('Client updated successfully', 'success');
      } else {
        await clientRepo.add(clientData);
        showSnackbar('Client added successfully', 'success');
      }
      
      handleCloseDialog();
      loadClients();
    } catch (error) {
      console.error("Failed to save client", error);
      showSnackbar('Failed to save client', 'error');
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const handleDelete = async () => {
    try {
      if (deleteConfirmation.id) {
        await clientRepo.delete(deleteConfirmation.id);
        showSnackbar('Client deleted successfully', 'success');
        loadClients();
      }
    } catch (error) {
        console.error("Failed to delete client", error);
        showSnackbar('Failed to delete client', 'error');
    } finally {
        setDeleteConfirmation({ open: false, id: null });
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
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
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

      {/* Add/Edit Client Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentClient?.id ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Client Name (Bill To Name)"
              name="name"
              value={currentClient?.name || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name || "Bill To Name on the Invoice"}
            />
            <TextField
              label="Address Line 1"
              name="addressL1"
              value={currentClient?.addressL1 || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.addressL1}
              helperText={errors.addressL1 || "Bill To Address Line 1 on the Invoice"}
            />
            <TextField
              label="Address Line 2"
              name="addressL2"
              value={currentClient?.addressL2 || ''}
              onChange={handleChange}
              fullWidth
              helperText="Bill To Address Line 2 on the Invoice"
            />
             <TextField
              label="Address Line 3"
              name="addressL3"
              value={currentClient?.addressL3 || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Client Contact Name"
              name="contactNm"
              value={currentClient?.contactNm || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.contactNm}
              helperText={errors.contactNm || "Bill To Name on the Invoice"}
            />
            <TextField
              label="Billing Representative Name"
              name="billingRepName"
              value={currentClient?.billingRepName || ''}
              onChange={handleChange}
              fullWidth
              helperText="Billing Representative Name on the Email"
            />
            <TextField
              label="Billing Representative Email"
              name="billingRepEmail"
              value={currentClient?.billingRepEmail || ''}
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}