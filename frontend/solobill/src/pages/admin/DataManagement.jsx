import React, { useState, useRef } from 'react';
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
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningIcon from '@mui/icons-material/Warning';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { invoiceRepo } from '../../db/repositories/invoiceRepository';
import { db } from '../../db/appDB';
import { useNotification } from '../../context/NotificationContext';

export default function DataManagement() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [archive, setArchive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  
  const fileInputRef = useRef(null);
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

  const handleBackup = async () => {
    setLoading(true);
    try {
      const allData = await db.transaction('r', db.tables, async () => {
        return {
           clients: await db.clients.toArray(),
           projects: await db.projects.toArray(),
           invoices: await db.invoices.toArray(),
           templates: await db.templates.toArray(),
           consultants: await db.consultants.toArray()
        };
      });

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: allData
      };

      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `solobill_backup_${dateStr}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify('Backup created successfully', 'success');
    } catch (error) {
      console.error("Backup failed", error);
      notify('Failed to create backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRestoreFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRestoreFile(file);
      setConfirmRestoreOpen(true);
    }
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  const handleRestore = async () => {
    if (!restoreFile) return;

    setConfirmRestoreOpen(false);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const backup = JSON.parse(content);

        if (!backup.data || !backup.version) {
           throw new Error('Invalid backup file format');
        }

        await db.transaction('rw', db.tables, async () => {
           // Clear existing tables
           await Promise.all(db.tables.map(table => table.clear()));

           // Restore data
           const { clients, projects, invoices, templates, consultants } = backup.data;
           
           if (clients?.length) await db.clients.bulkAdd(clients);
           if (projects?.length) await db.projects.bulkAdd(projects);
           if (invoices?.length) await db.invoices.bulkAdd(invoices);
           if (templates?.length) await db.templates.bulkAdd(templates);
           if (consultants?.length) await db.consultants.bulkAdd(consultants);
        });

        notify('System restored successfully', 'success');
        setRestoreFile(null);
      } catch (error) {
        console.error("Restore failed", error);
        notify(`Restore failed: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(restoreFile);
  };

  const handleReset = async () => {
    setConfirmResetOpen(false);
    setLoading(true);
    try {
        await db.transaction('rw', db.tables, async () => {
            await Promise.all(db.tables.map(table => table.clear()));
        });
        notify('All data has been deleted successfully', 'success');
    } catch (error) {
        console.error("Reset failed", error);
        notify('Failed to delete data', 'error');
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

      <Paper sx={{ p: 3, maxWidth: 800, mb: 4 }}>
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

      {/* System Migration Section */}
      <Paper sx={{ p: 3, maxWidth: 800, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StorageIcon color="primary" />
            <Typography variant="h6">System Migration (JSON)</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
            Export your entire database (Clients, Projects, Invoices, Templates) to a single file for migration or full backup.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleBackup}
                disabled={loading}
            >
                BACKUP ALL DATA
            </Button>
            
            <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={onRestoreFileChange}
            />
            
            <Button
                variant="outlined"
                color="warning"
                startIcon={<RestoreIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                RESTORE FROM BACKUP
            </Button>
        </Stack>
      </Paper>

      {/* Danger Zone */}
      <Paper sx={{ p: 3, maxWidth: 800, border: '1px solid', borderColor: 'error.main' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WarningIcon color="error" />
            <Typography variant="h6" color="error">Danger Zone</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
            Permanently delete all data from the application. This action cannot be undone. Please ensure you have a backup before proceeding.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setConfirmResetOpen(true)}
            disabled={loading}
        >
            DELETE ALL DATA
        </Button>
      </Paper>

      <ConfirmDialog
        open={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        onConfirm={handleRestore}
        title="Confirm Restore"
        message="This will overwrite all current data with the backup file. This action cannot be undone. Are you sure?"
        confirmText="Restore Data"
        confirmColor="warning"
      />

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleReset}
        title="Delete All Data?"
        message="Are you absolutely sure? This will wipe all Clients, Projects, Invoices, and Templates. This action CANNOT be undone."
        confirmText="DELETE EVERYTHING"
        confirmColor="error"
      />
    </Box>
  );
}

