import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartAltIcon,
  Upload as UploadIcon,
  HelpOutline as HelpOutlineIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { templateRepo } from '../../db/repositories/templateRepository';
import { ValidationRules } from '../../utils/validation';
import nunjucks from 'nunjucks';
import { mockInvoice } from '../../utils/mockData';

// Configure Nunjucks
const env = new nunjucks.Environment();
env.addFilter('formatDate', (str) => {
  if (!str) return '';
  return new Date(str).toLocaleDateString();
});
env.addFilter('fixed', (num) => {
  if (num === undefined || num === null) return '0.00';
  return parseFloat(num).toFixed(2);
});
env.addFilter('currency', (value) => {
  if (value == null || isNaN(value)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
});

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState('');
  const [activeEmailId, setActiveEmailId] = useState('');
  
  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', action: null });
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  
  // Upload states
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('invoice');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadTemplates = async () => {
    const all = await templateRepo.getAll();
    setTemplates(all);
    
    const activeInvoice = all.find(t => t.type === 'invoice' && t.isActive);
    const activeEmail = all.find(t => t.type === 'email' && t.isActive);
    
    if (activeInvoice) setActiveInvoiceId(activeInvoice.id);
    if (activeEmail) setActiveEmailId(activeEmail.id);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSetActive = async (id, type) => {
    await templateRepo.setActive(id);
    if (type === 'invoice') setActiveInvoiceId(id);
    else setActiveEmailId(id);
    showSnackbar('Active template updated');
    loadTemplates();
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Template',
      message: 'Are you sure you want to permanently delete this template?',
      action: async () => {
        await templateRepo.delete(id);
        showSnackbar('Template deleted');
        loadTemplates();
      }
    });
    setConfirmOpen(true);
  };

  const handleReset = (id) => {
    setConfirmConfig({
      title: 'Reset Template',
      message: 'Reset this default template to its original version? Any changes you made will be lost.',
      action: async () => {
        await templateRepo.resetDefault(id);
        showSnackbar('Template reset to default');
        loadTemplates();
      }
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmConfig.action) {
      await confirmConfig.action();
    }
    setConfirmOpen(false);
  };

  const handlePreview = (template) => {
    setCurrentTemplate(template);
    setPreviewOpen(true);
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setEditedContent(template.content);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    await templateRepo.put({
      ...currentTemplate,
      content: editedContent,
      updatedAt: Date.now()
    });
    setEditOpen(false);
    showSnackbar('Template saved');
    loadTemplates();
  };

  const handleUpload = async () => {
    const errors = {};
    const nameCheck = ValidationRules.required(uploadName, 'Template Name');
    if (nameCheck !== true) errors.name = nameCheck;
    
    if (!uploadFile) errors.file = 'Please select a file';

    if (Object.keys(errors).length > 0) {
        setUploadErrors(errors);
        return;
    }

    const content = await uploadFile.text();
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: uploadName,
      type: uploadType,
      content: content,
      isDefault: false,
      isActive: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await templateRepo.add(newTemplate);
    setUploadOpen(false);
    setUploadName('');
    setUploadFile(null);
    setUploadErrors({});
    showSnackbar('Template uploaded successfully');
    loadTemplates();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderPreviewContent = () => {
    if (!currentTemplate) return null;
    try {
      const rendered = env.renderString(currentTemplate.content, mockInvoice);
      return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
    } catch (error) {
      return <Alert severity="error">Error rendering template: {error.message}</Alert>;
    }
  };

  const invoiceTemplates = templates.filter(t => t.type === 'invoice');
  const emailTemplates = templates.filter(t => t.type === 'email');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
            Back
        </Button>
        <Typography variant="h4">Template Management</Typography>
      </Box>

      {/* Active Selection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Active Template Selection</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the templates currently used for generation.
        </Typography>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Active Invoice Template</InputLabel>
              <Select
                value={activeInvoiceId}
                label="Active Invoice Template"
                onChange={(e) => handleSetActive(e.target.value, 'invoice')}
              >
                {invoiceTemplates.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Active Email Template</InputLabel>
              <Select
                value={activeEmailId}
                label="Active Email Template"
                onChange={(e) => handleSetActive(e.target.value, 'email')}
              >
                {emailTemplates.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* All Templates List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">Manage All Templates</Typography>
            <Typography variant="body2" color="text.secondary">
              Edit, preview, or delete your stored templates.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
                startIcon={<HelpOutlineIcon />} 
                onClick={() => navigate('/admin/templates/guide')}
            >
                Variable Guide
            </Button>
            <Button 
                variant="contained" 
                startIcon={<UploadIcon />}
                onClick={() => setUploadOpen(true)}
            >
                Upload New
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <List>
          {templates.map((template, index) => (
            <React.Fragment key={template.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <Tooltip title="Preview">
                      <IconButton onClick={() => handlePreview(template)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(template)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {template.isDefault ? (
                      <Tooltip title="Reset to Default">
                        <IconButton onClick={() => handleReset(template.id)}>
                          <RestartAltIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(template.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemIcon>
                  <DescriptionIcon color={template.isActive ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary={template.name}
                  secondary={`${template.type.charAt(0).toUpperCase() + template.type.slice(1)} Template${template.isDefault ? ' • System Default' : ''}${template.isActive ? ' • ACTIVE' : ''}`}
                />
              </ListItem>
              {index < templates.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
          {templates.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No templates found.
            </Typography>
          )}
        </List>
      </Paper>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Preview: {currentTemplate?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ bgcolor: '#fff', p: 2, border: '1px solid #ddd' }}>
            {renderPreviewContent()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Edit Template: {currentTemplate?.name}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            rows={20}
            variant="outlined"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DialogTitle>Upload New Template</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Template Name"
              fullWidth
              value={uploadName}
              onChange={(e) => {
                setUploadName(e.target.value);
                if (uploadErrors.name) setUploadErrors({...uploadErrors, name: null});
              }}
              error={!!uploadErrors.name}
              helperText={uploadErrors.name}
            />
            <FormControl fullWidth>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={uploadType}
                label="Template Type"
                onChange={(e) => setUploadType(e.target.value)}
              >
                <MenuItem value="invoice">Invoice</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
            <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  color={uploadErrors.file ? "error" : "primary"}
                  sx={{ width: '100%', mb: 1 }}
                >
                  Select HTML File
                  <input
                    type="file"
                    hidden
                    accept=".html"
                    onChange={(e) => {
                        setUploadFile(e.target.files[0]);
                        if (uploadErrors.file) setUploadErrors({...uploadErrors, file: null});
                    }}
                  />
                </Button>
                {uploadErrors.file && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', ml: 1 }}>
                        {uploadErrors.file}
                    </Typography>
                )}
                {uploadFile && !uploadErrors.file && (
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Selected: {uploadFile.name}
                  </Typography>
                )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload}>Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{confirmConfig.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmConfig.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={confirmConfig.title.includes('Delete') ? 'error' : 'primary'} 
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplateManagement;
