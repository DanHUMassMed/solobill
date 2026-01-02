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
  Alert,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useClients } from '../../hooks/useClients';
import { useInvoices } from '../../hooks/useInvoices';
import { templateRepo } from '../../db/repositories/templateRepository';

import nunjucks from 'nunjucks';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function Email() {
  const { clients, loading: clientsLoading } = useClients();
  const { invoices, loading: invoicesLoading } = useInvoices();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [downloadedInvoiceIds, setDownloadedInvoiceIds] = useState([]);
  
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
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
    performDownload();
  };

  const handleEmailClick = async () => {
    if (selectedInvoiceIds.length === 0) return;

    // Check if all selected are downloaded
    const allDownloaded = selectedInvoiceIds.every(id => downloadedInvoiceIds.includes(id));
    
    if (!allDownloaded) {
      setDownloadConfirmOpen(true);
    } else {
      openEmailPreview();
    }
  };

  const performDownload = async () => {
    setProcessing(true);
    try {
      const invoiceTemplate = await templateRepo.getActiveByType('invoice');
      if (!invoiceTemplate) {
        alert("No active invoice template found.");
        setProcessing(false);
        return;
      }

      const blobs = [];
      const env = new nunjucks.Environment();
      env.addFilter('formatDate', (str) => str ? new Date(str).toLocaleDateString() : '');
      env.addFilter('fixed', (num) => {
          const n = Number(num);
          return isNaN(n) ? '0.00' : n.toFixed(2);
      });
      env.addFilter('currency', (value) => {
        if (value == null || isNaN(value)) return '$0.00';

        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(value);
      });
      // Generate PDFs
      for (const invoice of selectedInvoices) {
        const html = renderInvoiceHtml(invoice, invoiceTemplate.content, env);
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
      
      // If dialog was open (flow from email button), close it and open email preview
      if (downloadConfirmOpen) {
        setDownloadConfirmOpen(false);
        openEmailPreview(); 
      }

    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to generate files.");
    } finally {
      setProcessing(false);
    }
  };

  const openEmailPreview = async () => {
    setProcessing(true);
    try {
      const emailTemplate = await templateRepo.getActiveByType('email');
      if (!emailTemplate) {
        alert("No active email template found.");
        setProcessing(false);
        return;
      }

      const env = new nunjucks.Environment();
      env.addFilter('formatDate', (str) => str ? new Date(str).toLocaleDateString() : '');
      env.addFilter('fixed', (num) => {
          const n = Number(num);
          return isNaN(n) ? '0.00' : n.toFixed(2);
      });
      env.addFilter('currency', (value) => {
        if (value == null || isNaN(value)) return '$0.00';

        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(value);
      });
      // Calculate totals for email context
      let totalAmount = 0;
      selectedInvoices.forEach(inv => {
         const rate = Number(inv.project.contractingRate) || 0;
         const hours = inv.invoiceLineItems.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
         totalAmount += (rate * hours);
      });

      const context = {
        client: {
            name: selectedClient.name,
            contactNm: selectedClient.contactNm // Assuming this field exists or similar
        },
        invoices: selectedInvoices.map(inv => ({
            number: inv.invoiceNumber,
            date: inv.invoiceDate,
            amount: (Number(inv.project.contractingRate) * inv.invoiceLineItems.reduce((h, i) => h + Number(i.hours), 0)).toFixed(2)
        })),
        totalAmount: totalAmount.toFixed(2),
        consultant: selectedInvoices[0]?.consultant || {} // Use first invoice's consultant snapshot
      };

      const body = env.renderString(emailTemplate.content, context);
      setEmailBody(body);
      setEmailPreviewOpen(true);

    } catch (error) {
        console.error("Email preview generation failed", error);
        alert("Failed to generate email preview.");
    } finally {
        setProcessing(false);
    }
  };

  const handleSendEmailClient = () => {
    const subject = `Invoice(s) from ${selectedInvoices[0]?.consultant.name} for ${selectedClient.name}`;
    const body = encodeURIComponent(emailBody);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    setEmailPreviewOpen(false);
  };

  // --- Helpers ---

  const renderInvoiceHtml = (invoice, templateStr, env) => {
     const rate = Number(invoice.project.contractingRate) || 0;
     const totalHours = invoice.invoiceLineItems.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
     const totalAmount = totalHours * rate;

     const context = {
        invoice: {
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.invoiceDate,
            totalHours: totalHours,
            totalAmount: totalAmount,
            lineItems: invoice.invoiceLineItems.map(item => ({
                description: item.workDesc ? `${item.dateDesc} - ${item.workDesc}` : item.dateDesc,
                hours: Number(item.hours)
            }))
        },
        consultant: {
            name: invoice.consultant.name,
            address_l1: invoice.consultant.addressL1,
            address_l2: invoice.consultant.addressL2,
            address_l3: invoice.consultant.addressL3,
            email: invoice.consultant.email
        },
        client: {
            client_name: invoice.client.name,
            client_address_l1: invoice.client.addressL1,
            client_address_l2: invoice.client.addressL2,
            client_address_l3: invoice.client.addressL3
        },
        project: {
            project_name: invoice.project.name,
            po_number: invoice.project.poNumber,
            consulting_title: invoice.project.contractingTitle,
            bill_description: invoice.project.contractingDesc,
            consulting_rate: rate
        }
    };
    return env.renderString(templateStr, context);
  };

  const generatePdfBlob = async (html) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    // We need to append to body to render styles properly? 
    // html2pdf can handle off-screen elements but styles might need to be inline or present.
    // The Invoice Template uses <style> block, so it should be fine.
    
    const opt = {
      margin: 0,
      filename: 'myfile.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // We use .output('blob')
    return await html2pdf().set(opt).from(element).output('blob');
  };


  if (clientsLoading || invoicesLoading) {
     return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>E-Mail Invoices</Typography>

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
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="h6">Invoices for {selectedClient?.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    Select invoices to "attach" to the email or download.
                </Typography>
            </Box>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {clientInvoices.length === 0 ? (
                    <ListItem><ListItemText primary="No invoices found for this client." /></ListItem>
                ) : (
                    clientInvoices.map((invoice) => {
                        const total = (Number(invoice.project.contractingRate) * invoice.invoiceLineItems.reduce((h, i) => h + Number(i.hours), 0)).toFixed(2);
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
                                        secondary={`${new Date(invoice.invoiceDate).toLocaleDateString()} | Total: $${total}`}
                                    />
                                </ListItemButton>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })
                )}
            </List>
            
            {/* Actions Footer */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: '#f9f9f9' }}>
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
                    disabled={selectedInvoiceIds.length === 0 || processing}
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
      <Dialog
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', whiteSpace: 'pre-wrap', mb: 2 }}>
             <Box sx={{ borderBottom: '1px solid #ddd', pb: 1, mb: 1 }}>
                <Typography variant="body2"><strong>To:</strong> {selectedClient?.billingRepEmail || selectedClient?.email || 'client@example.com'}</Typography>
                <Typography variant="body2"><strong>Subject:</strong> Invoice(s) from {selectedInvoices[0]?.consultant.name} for {selectedClient?.name}</Typography>
             </Box>
             {emailBody}
          </Paper>

          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ bgcolor: '#fff4e5', color: '#663c00' }}>
            <Typography variant="subtitle2" fontWeight="bold">Reminder:</Typography>
            Please attach the downloaded invoice(s) to your email before sending. 
            For security reasons, browsers require attachments to be added manually.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailPreviewOpen(false)}>CANCEL</Button>
          <Button onClick={handleSendEmailClient} variant="contained" startIcon={<EmailIcon />}>
            OPEN EMAIL CLIENT
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
