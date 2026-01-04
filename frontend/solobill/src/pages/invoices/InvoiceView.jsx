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
import { nunjucksEnv } from '../../utils/templateUtils';
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
          const env = nunjucksEnv();
          const html = env.renderString(templateHtml, {invoice: invoice});
          setRenderedHtml(html);
        } catch (error) {
          console.error("Template rendering error", error);
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
