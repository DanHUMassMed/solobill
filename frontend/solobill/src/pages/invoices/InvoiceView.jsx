import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { templateRepo } from '../../db/repositories/templateRepository';
import nunjucks from 'nunjucks';
import html2pdf from 'html2pdf.js';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, loading: invoicesLoading } = useInvoices();
  
  const [templateHtml, setTemplateHtml] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  
  const iframeRef = useRef(null);

  const invoice = invoices.find(i => i.id === id);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const template = await templateRepo.getActiveByType('invoice');
        if (template) {
          setTemplateHtml(template.content);
        }
      } catch (error) {
        console.error("Failed to load invoice template", error);
      } finally {
        setLoadingTemplate(false);
      }
    };
    loadTemplate();
  }, []);

  useEffect(() => {
    if (invoice && templateHtml) {
      try {
        const env = new nunjucks.Environment();
        env.addFilter('formatDate', (str) => {
            if (!str) return '';
            return new Date(str).toLocaleDateString();
        });
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
        // Prepare Data Context
        const rate = Number(invoice.project.contractingRate) || 0;
        const totalHours = invoice.lineItems.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
        const totalAmount = totalHours * rate;

        const context = {
            invoice: {
                invoiceNumber: invoice.invoiceNumber,
                date: invoice.invoiceDate,
                // Optional overrides if they existed in invoice object, otherwise fallbacks used in template
                totalHours: totalHours,
                totalAmount: totalAmount,
                lineItems: invoice.lineItems.map(item => ({
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

        const html = env.renderString(templateHtml, context);
        setRenderedHtml(html);

      } catch (e) {
        console.error("Template rendering error", e);
      }
    }
  }, [invoice, templateHtml]);

  const handlePrint = () => {
    if (iframeRef.current) {
        iframeRef.current.contentWindow.print();
    }
  };

  const handleDownloadPdf = () => {
    if (!renderedHtml) return;
    
    // Create a temporary element
    const element = document.createElement('div');
    element.innerHTML = renderedHtml;
    
    const opt = {
      margin: 0,
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (invoicesLoading || loadingTemplate) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (!invoice) {
    return <Box sx={{ p: 4 }}><Typography>Invoice not found.</Typography></Box>;
  }

  if (!templateHtml) {
      return <Box sx={{ p: 4 }}><Typography color="error">Active invoice template not found. Please check Admin settings.</Typography></Box>;
  }

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPdf}>
                Download PDF
            </Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
            </Button>
        </Box>
      </Box>

      <Paper sx={{ flexGrow: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
        {renderedHtml && (
            <iframe 
                ref={iframeRef}
                title="Invoice Preview"
                srcDoc={renderedHtml}
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        )}
      </Paper>
    </Box>
  );
}
