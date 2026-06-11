import React, { useState, useEffect, useRef } from 'react';
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
  Snackbar,
  Chip,
  ListItemButton,
  InputAdornment
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartAltIcon,
  Upload as UploadIcon,
  HelpOutline as HelpOutlineIcon,
  Search as SearchIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { templateRepo } from '../../db/repositories/templateRepository';
import { consultantRepo } from '../../db/repositories/consultantRepository';
import { clientRepo } from '../../db/repositories/clientRepository';
import { projectRepo } from '../../db/repositories/projectRepository';
import { ValidationRules } from '../../utils/validation';
import { mockInvoice, mockInvoices } from '../../utils/mockData';
import { nunjucksEnv, mailToHTML } from '../../utils/templateUtils';


const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState('');
  const [activeEmailId, setActiveEmailId] = useState('');
  const [activeCsvId, setActiveCsvId] = useState('');

  const editorRef = useRef(null);
  const [dynamicVars, setDynamicVars] = useState({ consultant: [], client: [], project: [] });
  const [showGuide, setShowGuide] = useState(false);
  const [guideSearch, setGuideSearch] = useState('');
  
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
    const activeCsv = all.find(t => t.type === 'csv' && t.isActive);
    
    if (activeInvoice) setActiveInvoiceId(activeInvoice.id);
    if (activeEmail) setActiveEmailId(activeEmail.id);
    if (activeCsv) setActiveCsvId(activeCsv.id);
  };

  useEffect(() => {
    loadTemplates();

    const scanDatabase = async () => {
      try {
        const [consultants, clients, projects] = await Promise.all([
          consultantRepo.getAll(),
          clientRepo.getAll(),
          projectRepo.getAll()
        ]);
        const consultantSet = new Set();
        const clientSet = new Set();
        const projectSet = new Set();
        consultants.forEach(c => c.additionalFields && Object.keys(c.additionalFields).forEach(k => consultantSet.add(k)));
        clients.forEach(c => c.additionalFields && Object.keys(c.additionalFields).forEach(k => clientSet.add(k)));
        projects.forEach(p => p.additionalFields && Object.keys(p.additionalFields).forEach(k => projectSet.add(k)));

        setDynamicVars({
          consultant: Array.from(consultantSet),
          client: Array.from(clientSet),
          project: Array.from(projectSet)
        });
      } catch (err) {
        console.error("Failed to scan dynamic variables", err);
      }
    };
    scanDatabase();
  }, []);

  const handleInsertVariable = (path) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const tag = `{{ ${path} }}`;
    const newContent = text.substring(0, start) + tag + text.substring(end);

    setEditedContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const getInsertableVariables = () => {
    const list = [
      { path: 'invoice.consultant.name', label: 'Consultant Name', category: 'Consultant' },
      { path: 'invoice.consultant.companyName', label: 'Company Name', category: 'Consultant' },
      { path: 'invoice.consultant.email', label: 'Email Address', category: 'Consultant' },
      { path: 'invoice.consultant.addressL1', label: 'Address L1', category: 'Consultant' },

      { path: 'invoice.client.name', label: 'Client Name', category: 'Client' },
      { path: 'invoice.client.addressL1', label: 'Address L1', category: 'Client' },
      { path: 'invoice.client.contactNm', label: 'Contact Name', category: 'Client' },
      { path: 'invoice.client.billingRepName', label: 'Billing Rep Name', category: 'Client' },
      { path: 'invoice.client.billingRepEmail', label: 'Billing Rep Email', category: 'Client' },

      { path: 'invoice.project.name', label: 'Project Name', category: 'Project' },
      { path: 'invoice.project.poNumber', label: 'PO Number', category: 'Project' },
      { path: 'invoice.project.contractingTitle', label: 'Contracting Title', category: 'Project' },
      { path: 'invoice.project.contractingRate', label: 'Hourly Rate', category: 'Project' },
      { path: 'invoice.project.contractingDesc', label: 'Project Description', category: 'Project' },

      { path: 'invoice.invoiceNumber', label: 'Invoice Number', category: 'Invoice' },
      { path: 'invoice.invoiceDate', label: 'Invoice Date', category: 'Invoice' },
      { path: 'invoice.totalHours', label: 'Total Hours', category: 'Invoice' },
      { path: 'invoice.totalAmount', label: 'Total Amount', category: 'Invoice' },

      { path: 'item.dateDesc', label: 'Item Date/Desc', category: 'Line Item' },
      { path: 'item.workDesc', label: 'Item Work Detail', category: 'Line Item' },
      { path: 'item.hours', label: 'Item Hours', category: 'Line Item' }
    ];

    dynamicVars.consultant.forEach(key => {
      list.push({ path: `invoice.consultant.additionalFields.${key}`, label: `Consultant: ${key}`, category: 'Custom' });
    });
    dynamicVars.client.forEach(key => {
      list.push({ path: `invoice.client.additionalFields.${key}`, label: `Client: ${key}`, category: 'Custom' });
    });
    dynamicVars.project.forEach(key => {
      list.push({ path: `invoice.project.additionalFields.${key}`, label: `Project: ${key}`, category: 'Custom' });
    });

    return list;
  };

  const renderLivePreview = () => {
    if (!currentTemplate) return null;
    try {
      const env = nunjucksEnv();
      let rendered = '';
      if (currentTemplate.type === 'invoice') {
        rendered = env.renderString(editedContent, { invoice: mockInvoice });
      } else if (currentTemplate.type === 'email') {
        rendered = env.renderString(editedContent, { invoices: mockInvoices });
        rendered = mailToHTML(rendered);
      } else if (currentTemplate.type === 'csv') {
        rendered = env.renderString(editedContent, { invoices: mockInvoices });
        rendered = `<pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; padding: 10px; background: #fafafa; border: 1px solid #ddd; margin: 0;">${rendered}</pre>`;
      }
      return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
    } catch (error) {
      return (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Syntax Error: {error.message}
        </Alert>
      );
    }
  };

  const handleSetActive = async (id, type) => {
    await templateRepo.setActive(id);
    if (type === 'invoice') setActiveInvoiceId(id);
    else if (type === 'email') setActiveEmailId(id);
    else if (type === 'csv') setActiveCsvId(id);
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

  const handleDownload = (template) => {
    try {
      const blob = new Blob([template.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const extension = template.type === 'csv' ? 'csv' : 'njk';
      const sanitizedName = template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("download", `${sanitizedName}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar(`Downloaded ${template.name}`);
    } catch (err) {
      console.error("Failed to download template", err);
      showSnackbar("Failed to download template", "error");
    }
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
    if (nameCheck !== true) {
      errors.name = nameCheck;
    } else {
      const nameExists = templates.some(t => t.name.trim().toLowerCase() === uploadName.trim().toLowerCase());
      if (nameExists) {
        errors.name = 'A template with this name already exists';
      }
    }
    
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
      const env = nunjucksEnv();
      let rendered = ''
      if(currentTemplate.type === 'invoice'){ 
        rendered = env.renderString(currentTemplate.content, {invoice: mockInvoice});
      } else if (currentTemplate.type === 'email') {
        rendered = env.renderString(currentTemplate.content, {invoices: mockInvoices});
        rendered = mailToHTML(rendered)
      } else if (currentTemplate.type === 'csv') {
        rendered = env.renderString(currentTemplate.content, {invoices: mockInvoices});
        rendered = `<pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace;">${rendered}</pre>`;
      }
      return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
    } catch (error) {
      return <Alert severity="error">Error rendering template: {error.message}</Alert>;
    }
  };

  const invoiceTemplates = templates.filter(t => t.type === 'invoice');
  const emailTemplates = templates.filter(t => t.type === 'email');
  const csvTemplates = templates.filter(t => t.type === 'csv');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Template Management</Typography>
      </Box>

      {/* Active Selection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Active Template Selection</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the templates currently used for generation.
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Active CSV Template</InputLabel>
              <Select
                value={activeCsvId}
                label="Active CSV Template"
                onChange={(e) => handleSetActive(e.target.value, 'csv')}
              >
                {csvTemplates.map(t => (
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
                    <Tooltip title="Download">
                      <IconButton onClick={() => handleDownload(template)}>
                        <DownloadIcon />
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

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Edit Template: {currentTemplate?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto', p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 1. Edit Screen / Code Editor */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                inputRef={editorRef}
                fullWidth
                multiline
                rows={12}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Paste or write your template code here..."
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-root': { 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    alignItems: 'flex-start'
                  }
                }}
              />
            </Box>

            {/* 2. Variable Guide Toggle & Expandable Guide */}
            <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#fcfcfc', display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button 
                    size="small" 
                    variant={showGuide ? "contained" : "outlined"} 
                    onClick={() => setShowGuide(!showGuide)}
                    startIcon={showGuide ? <VisibilityIcon /> : <HelpOutlineIcon />}
                  >
                    {showGuide ? "Hide Variable Guide" : "Show Variable Guide"}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Click variables to insert at cursor, or copy to clipboard.
                  </Typography>
                </Box>
              </Box>
              
              {showGuide && (
                <Box sx={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #ddd' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <TextField
                      placeholder="Search variables..."
                      fullWidth
                      size="small"
                      value={guideSearch}
                      onChange={(e) => setGuideSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 2, maxHeight: '300px', overflowY: 'auto', bgcolor: '#fafafa' }}>
                    {['Consultant', 'Client', 'Project', 'Invoice', 'Line Item', 'Custom'].map(cat => {
                      const items = getInsertableVariables()
                        .filter(v => v.category === cat)
                        .filter(v => 
                          v.path.toLowerCase().includes(guideSearch.toLowerCase()) || 
                          v.label.toLowerCase().includes(guideSearch.toLowerCase())
                        );
                      
                      if (items.length === 0) return null;
                      
                      return (
                        <Box key={cat} sx={{ mb: 2.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', display: 'block', mb: 1 }}>
                            {cat}
                          </Typography>
                          <Grid container spacing={1}>
                            {items.map(item => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.path}>
                                <Box 
                                  sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #eee', 
                                    borderRadius: 1, 
                                    bgcolor: '#fff',
                                    overflow: 'hidden',
                                    '&:hover': { bgcolor: '#f0f7ff' } 
                                  }}
                                >
                                  <Box 
                                    onClick={() => handleInsertVariable(item.path)}
                                    sx={{ py: 0.5, px: 1, flexGrow: 1, cursor: 'pointer', minWidth: 0 }}
                                    title="Click to insert at cursor"
                                  >
                                    <code style={{ fontSize: '0.8rem', color: '#d32f2f', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.path}</code>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      {item.label}
                                    </Typography>
                                  </Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const textToCopy = `{{ ${item.path} }}`;
                                      navigator.clipboard.writeText(textToCopy);
                                      showSnackbar(`Copied ${textToCopy} to clipboard!`, 'success');
                                    }}
                                    sx={{ p: 0.75, mr: 0.5 }}
                                    title="Copy Nunjucks Tag"
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* 3. Live Render Preview */}
            <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" fontWeight="bold">Live Preview</Typography>
              </Box>
              <Box sx={{ p: 3, bgcolor: '#fff', minHeight: '150px', overflowX: 'auto' }}>
                {renderLivePreview()}
              </Box>
            </Box>

          </Box>
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
              required
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
                <MenuItem value="csv">CSV Export</MenuItem>
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
                  Select Jinja Template
                  <input
                    type="file"
                    hidden
                    accept=".jinja,.jinja2,.njk,.html,.txt"
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
