import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  InputAdornment, 
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';

export default function Invoices() {
  const { invoices, projects, clients, deleteInvoice, snackbar, closeSnackbar } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const navigate = useNavigate();

  // Grouping Logic
  const getGroupedData = () => {
    // 1. Filter invoices based on search
    const filteredInvoices = invoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Build Hierarchy
    // We want to display Clients -> Projects -> Invoices
    // We also want to capture invoices whose client/project might have been deleted (optional, but good practice)
    // For this strict requirement "Client Accordion contains Projects Accordion", we'll iterate active clients.

    const grouped = [];

    clients.forEach(client => {
        // Find projects for this client
        const clientProjects = projects.filter(p => p.clientId === client.id);
        
        // Find invoices for these projects (or directly for this client if we want to be robust)
        // Strictly following: Client -> Project -> Invoice
        
        const projectsWithInvoices = [];

        clientProjects.forEach(project => {
            const projectInvoices = filteredInvoices.filter(inv => inv.project.id === project.id);
            if (projectInvoices.length > 0) {
                projectsWithInvoices.push({
                    ...project,
                    invoices: projectInvoices
                });
            }
        });

        if (projectsWithInvoices.length > 0) {
            grouped.push({
                ...client,
                projects: projectsWithInvoices
            });
        }
    });

    return grouped;
  };

  const groupedData = getGroupedData();

  const handleDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteInvoice(deleteConfirmation.id);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Invoices</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/invoices/create')}
        >
          Create Invoice
        </Button>
      </Box>

      <Paper sx={{ p: 1, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search invoices by number, client, or project..."
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

      {groupedData.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
           No invoices found matching your criteria.
        </Typography>
      ) : (
        groupedData.map((client) => (
          <Accordion key={client.id} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: '#f5f5f5' }}
            >
              <Typography variant="h6">{client.name}</Typography>
              <Chip size="small" label={client.projects.reduce((acc, p) => acc + p.invoices.length, 0)} sx={{ ml: 2 }} />
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {client.projects.map((project) => (
                  <Accordion key={project.id} defaultExpanded sx={{ mb: 1, border: '1px solid #eee', boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{project.name}</Typography>
                          <Chip size="small" label={project.invoices.length} sx={{ ml: 2 }} variant="outlined"/>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                            {project.invoices.map((invoice) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={invoice.id}>
                                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" color="primary">
                                                    {invoice.invoiceNumber}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {invoice.invoiceDate}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <ArticleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                                <Typography variant="body2">
                                                    {invoice.lineItems.length} items
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" align="right">
                                                ${invoice.lineItems.reduce((sum, item) => {
                                                    const rate = Number(invoice.project.contractingRate) || 0;
                                                    const hours = Number(item.hours) || 0;
                                                    return sum + (rate * hours);
                                                }, 0).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
                                            <Button 
                                                size="small" 
                                                startIcon={<VisibilityIcon />} 
                                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button 
                                                size="small" 
                                                color="error" 
                                                onClick={() => setDeleteConfirmation({ open: true, id: invoice.id })}
                                            >
                                                Delete
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                      </AccordionDetails>
                  </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
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
