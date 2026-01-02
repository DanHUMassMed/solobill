import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Grid,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';

export default function InvoiceCreate() {
  const { 
    projects, 
    clients, 
    consultant, 
    createInvoice, 
    generateInvoiceNumber,
    snackbar,
    closeSnackbar
  } = useInvoices();
  
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [validationErrors, setValidationErrors] = useState({});
  const [lineItems, setLineItems] = useState([
    { id: crypto.randomUUID(), dateDesc: '', workDesc: '', hours: '' }
  ]);


  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [selectedProjectId, projects]);

  useEffect(() => {
    if (selectedProject) {
      setLineItems([
        {
          id: crypto.randomUUID(),
          dateDesc: '',
          workDesc: selectedProject.contractingDesc || '',
          hours: ''
        }
      ]);
    } else {
      // optional: reset lineItems if no project is selected
      setLineItems([{ id: crypto.randomUUID(), dateDesc: '', workDesc: '', hours: '' }]);
    }
  }, [selectedProject]);

  const selectedClient = useMemo(() => {
    if (!selectedProject) return null;
    return clients.find(c => c.id === selectedProject.clientId);
  }, [selectedProject, clients]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), dateDesc: '', workDesc: '', hours: '' }]);
  };

  const handleRemoveLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalHours = lineItems.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
  const rate = selectedProject ? Number(selectedProject.contractingRate) : 0;
  const totalAmount = totalHours * rate;

  const validate = () => {
    const errors = {};
    if (!selectedProjectId) errors.project = "Project is required";
    
    let hasItemErrors = false;
    lineItems.forEach((item, index) => {
        if (!item.dateDesc) { errors[`dateDesc_${index}`] = true; hasItemErrors = true; }

    });

    if (hasItemErrors) {
        errors.items = "Please fill in all required fields";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (generate = false) => {
    if (!validate()) {
        // Simple alert or snackbar
        return;
    }

    if (!consultant) {
        alert("Consultant profile is missing. Please set it up in the Consultant page first.");
        return;
    }

    const invoiceData = {
        id: crypto.randomUUID(),
        invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        totalHours,
        totalAmount,
        consultant: consultant, // Snapshot
        client: selectedClient, // Snapshot
        project: selectedProject, // Snapshot
        lineItems: lineItems.map(item => ({
            ...item,
            hours: Number(item.hours)
        }))
    };

    const result = await createInvoice(invoiceData);
    if (result.success) {
        if (generate) {
            navigate(`/invoices/${invoiceData.id}`);
        } else {
            navigate('/invoices');
        }
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" gutterBottom>Create Invoice</Typography>

      {/* Project Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom>Select Project</Typography>
            <TextField
                select
                fullWidth
                label="Project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                error={!!validationErrors.project}
                helperText={validationErrors.project}
            >
                {projects.map((project) => {
                    const client = clients.find(c => c.id === project.clientId);
                    return (
                        <MenuItem key={project.id} value={project.id}>
                            {project.name} ({client ? client.name : 'Unknown Client'})
                        </MenuItem>
                    );
                })}
            </TextField>

            {selectedProject && selectedClient && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>Project Details</Typography>
                    <Grid container spacing={2}>
                        <Grid xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold">Client:</Typography>
                            <Typography variant="body2">{selectedClient.name}</Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold">PO #:</Typography>
                            <Typography variant="body2">{selectedProject.poNumber || 'TBD'}</Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold">Title:</Typography>
                            <Typography variant="body2">{selectedProject.contractingTitle}</Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold">Rate:</Typography>
                            <Typography variant="body2">${selectedProject.contractingRate}/hr</Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </CardContent>
      </Card>

      {/* Work Log */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom>Work Log</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
                Enter specific dates (e.g., "Oct 12, 2025") or date ranges and the hours worked.
            </Typography>

            {lineItems.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                    <TextField
                        label="Date / Description"
                        fullWidth
                        value={item.dateDesc}
                        onChange={(e) => handleLineItemChange(item.id, 'dateDesc', e.target.value)}
                        error={!!validationErrors[`dateDesc_${index}`]}
                        placeholder="Week of Oct. 15"
                    />
                    <TextField
                        label="Work Description"
                        fullWidth
                        value={item.workDesc}
                        onChange={(e) => handleLineItemChange(item.id, 'workDesc', e.target.value)}
                        placeholder="Details..."
                    />
                    <TextField
                        label="Hours"
                        type="number"
                        sx={{ width: 150 }}
                        value={item.hours}
                        onChange={(e) => handleLineItemChange(item.id, 'hours', e.target.value)}
                    />
                    <IconButton 
                        color="error" 
                        onClick={() => handleRemoveLineItem(item.id)} 
                        disabled={lineItems.length === 1}
                        sx={{ mt: 1 }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={handleAddLineItem}>
                Add Line Item
            </Button>
            
            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="h6">Total Hours: {totalHours}</Typography>
                <Typography variant="h5" color="primary">Total Amount: ${totalAmount.toFixed(2)}</Typography>
            </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
            variant="outlined" 
            startIcon={<SaveIcon />} 
            size="large"
            onClick={() => handleSave(false)}
        >
            Save Invoice
        </Button>
        <Button 
            variant="contained" 
            startIcon={<DescriptionIcon />} 
            size="large"
            onClick={() => handleSave(true)}
        >
            Generate Invoice
        </Button>
      </Box>

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
