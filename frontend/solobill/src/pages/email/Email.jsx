import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  MenuItem, 
  Checkbox, 
  Button, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PageHeader from '../../components/common/PageHeader';
import EmailPreviewDialog from './EmailPreviewDialog';

import { useInvoices } from '../../hooks/useInvoices';
import { templateRepo } from '../../db/repositories/templateRepository';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { nunjucksEnv, generatePdfBlob, mailToHTML } from '../../utils/templateUtils';

export default function Email() {
  const { clients, invoices, loading: invoicesLoading } = useInvoices();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [downloadedInvoiceIds, setDownloadedInvoiceIds] = useState([]);
  
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [mailto, setMailto] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [processing, setProcessing] = useState(false);

  // Filter invoices for selected client
  const clientInvoices = useMemo(() => {
    if (!selectedClientId) return [];
    return invoices
      .filter(inv => inv.client.id === selectedClientId)
      .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)); // Newest first
  }, [selectedClientId, invoices]);

  // Derived state
  const selectedInvoices = useMemo(() => {
    return clientInvoices.filter(inv => selectedInvoiceIds.includes(inv.id));
  }, [clientInvoices, selectedInvoiceIds]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Check if all selected invoices are downloaded
  const allSelectedDownloaded = useMemo(() => {
    if (selectedInvoiceIds.length === 0) return false;
    return selectedInvoiceIds.every(id => downloadedInvoiceIds.includes(id));
  }, [selectedInvoiceIds, downloadedInvoiceIds]);

  // Handlers
  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setSelectedInvoiceIds([]);
    setDownloadedInvoiceIds([]);
  };

  const handleToggleInvoice = (id) => {
    setSelectedInvoiceIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDownloadClick = () => {
    if (selectedInvoiceIds.length === 0) return;
    setDownloadConfirmOpen(true);
  };

  const handleEmailClick = async () => {
    if (selectedInvoiceIds.length === 0) return;
    openEmailPreview();
  };

  const performDownload = async () => {
    setProcessing(true);
    const blobs = [];
    try {
      const env = nunjucksEnv();
      const template = await templateRepo.getActiveByType('invoice');
      for (const invoice of selectedInvoices) {
        const html = env.renderString(template.content, {invoice: invoice});
        const blob = await generatePdfBlob(html);
        blobs.push({ 
            name: `Invoice-${invoice.invoiceNumber}.pdf`, 
            blob,
            id: invoice.id 
        });
      }

      if (blobs.length === 1) {
        saveAs(blobs[0].blob, blobs[0].name);
      } else {
        const zip = new JSZip();
        blobs.forEach(file => {
          zip.file(file.name, file.blob);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const dateStr = new Date().toISOString().split('T')[0];
        saveAs(zipBlob, `Invoices_${dateStr}.zip`);
      }

      // Mark as downloaded
      setDownloadedInvoiceIds(prev => [...new Set([...prev, ...selectedInvoiceIds])]);
      setDownloadConfirmOpen(false);

    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to generate files.");
    } finally {
      setProcessing(false);
    }
  };

  const openEmailPreview = async () => {
    setProcessing(true);
    try{
      const env = nunjucksEnv();
      const template = await templateRepo.getActiveByType('email');
      const mailto_str = env.renderString(template.content, {invoices: selectedInvoices});
      setMailto(mailto_str);
      setEmailPreview(mailToHTML(mailto_str));
      setEmailPreviewOpen(true);
    } catch (error) {
        console.error("Email preview generation failed", error);
        alert("Failed to generate email preview.");
    } finally {
        setProcessing(false);
    }
  };


  const handleSendEmailClient = () => {
    window.location.href =mailto;
    setEmailPreviewOpen(false);
  };

  
  if (invoicesLoading) {
     return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader 
        title="E-Mail Invoices"
      />

      {/* Client Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>Select Client</Typography>
        <TextField
          select
          fullWidth
          value={selectedClientId}
          onChange={handleClientChange}
          label="Client"
        >
            {clients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
            ))}
        </TextField>
      </Paper>

      {/* Invoices List */}
      {selectedClientId && (
          <Paper sx={{ mb: 3, display: 'flex', flexDirection: 'column', maxHeight: '60vh' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="h6">Invoices for {selectedClient?.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    Select invoices to "attach" to the email or download.
                </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {clientInvoices.length === 0 ? (
                        <ListItem><ListItemText primary="No invoices found for this client." /></ListItem>
                    ) : (
                        clientInvoices.map((invoice) => {
                            const total = (Number(invoice.project.contractingRate) * invoice.lineItems.reduce((h, i) => h + Number(i.hours), 0)).toFixed(2);
                            const labelId = `checkbox-list-label-${invoice.id}`;
                            const isSelected = selectedInvoiceIds.includes(invoice.id);

                            return (
                                <React.Fragment key={invoice.id}>
                                    <ListItemButton
                                        role={undefined}
                                        dense
                                        onClick={() => handleToggleInvoice(invoice.id)}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={isSelected}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            id={labelId}
                                            primary={`#${invoice.invoiceNumber} - ${invoice.project.name}`}
                                            secondary={`${invoice.invoiceDate} | Total: $${total}`}
                                        />
                                    </ListItemButton>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            );
                        })
                    )}
                </List>
            </Box>
            
            {/* Actions Footer */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
                <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    disabled={selectedInvoiceIds.length === 0 || processing}
                    onClick={handleDownloadClick}
                >
                    DOWNLOAD ({selectedInvoiceIds.length})
                </Button>
                <Button 
                    variant="contained" 
                    startIcon={<EmailIcon />} 
                    disabled={selectedInvoiceIds.length === 0 || processing || !allSelectedDownloaded}
                    onClick={handleEmailClick}
                >
                    SEND E-MAIL ({selectedInvoiceIds.length})
                </Button>
            </Box>
          </Paper>
      )}

      {/* Confirm Download Dialog */}
      <Dialog
        open={downloadConfirmOpen}
        onClose={() => setDownloadConfirmOpen(false)}
      >
        <DialogTitle>Confirm Download</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To enable the email button, you must first download the selected invoices.
            Do you want to proceed with downloading {selectedInvoiceIds.length} invoice(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadConfirmOpen(false)}>CANCEL</Button>
          <Button onClick={performDownload} variant="contained" autoFocus>
            SAVE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        emailPreview={emailPreview}
        onSend={handleSendEmailClient}
      />

    </Box>
  );
}
