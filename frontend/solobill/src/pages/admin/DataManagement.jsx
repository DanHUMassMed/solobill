import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import PageHeader from '../../components/common/PageHeader';
import { invoiceRepo } from '../../db/repositories/invoiceRepository';
import { useNotification } from '../../context/NotificationContext';

export default function DataManagement() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [archive, setArchive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      notify('Please select both start and end dates', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Fetch invoices
      const invoices = await invoiceRepo.getByDateRange(startDate, endDate);
      
      if (invoices.length === 0) {
        notify('No invoices found in the selected date range', 'info');
        setLoading(false);
        return;
      }

      // Generate CSV
      const headers = [
        'Invoice Number', 
        'Date', 
        'Client', 
        'Project', 
        'Total Invoice Hours', 
        'Total Invoice Amount',
        'Line Date',
        'Line Description',
        'Line Hours'
      ];

      const rows = [];
      invoices.forEach(inv => {
        const baseRow = [
          inv.invoiceNumber,
          inv.invoiceDate,
          inv.client?.name || '',
          inv.project?.name || '',
          inv.totalHours,
          inv.totalAmount
        ];

        if (inv.lineItems && inv.lineItems.length > 0) {
          inv.lineItems.forEach(item => {
            rows.push([
              ...baseRow,
              item.dateDesc || '',
              item.workDesc || '',
              item.hours || 0
            ]);
          });
        } else {
          // Invoice with no line items
          rows.push([
            ...baseRow,
            '',
            '',
            0
          ]);
        }
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_${startDate}_to_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      let successMessage = `Successfully exported ${invoices.length} invoices.`;

      // Handle Archive (Delete)
      if (archive) {
        let deletedCount = 0;
        for (const inv of invoices) {
            if (inv.id) {
                await invoiceRepo.delete(inv.id);
                deletedCount++;
            }
        }
        successMessage += ` Archived (deleted) ${deletedCount} records.`;
      }

      notify(successMessage, 'success');

    } catch (error) {
      console.error('Export failed', error);
      notify('Failed to export invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader 
        title="Maintenance & Data" 
        subtitle="Export records for annual reporting or perform full system backups."
      />

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Invoice Archive (CSV)</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
            Download a detailed CSV of all invoices within a specific date range. Perfect for annual tax preparation.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
             <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
             <FormControlLabel
                control={
                    <Switch 
                        checked={archive} 
                        onChange={(e) => setArchive(e.target.checked)} 
                    />
                }
                label="Archive after export"
                sx={{ whiteSpace: 'nowrap' }}
            />
        </Stack>

        <Box sx={{ mt: 3 }}>
            <Button
                variant="contained"
                color="inherit"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={loading}
                sx={{ bgcolor: '#e0e0e0', color: 'text.primary', '&:hover': { bgcolor: '#d5d5d5' } }}
            >
                {loading ? 'Processing...' : 'DOWNLOAD INVOICES CSV'}
            </Button>
        </Box>
      </Paper>
    </Box>
  );
}
