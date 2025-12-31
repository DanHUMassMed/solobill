import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Divider,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, Link } from 'react-router-dom';

const TemplateVariableGuide = () => {
  const navigate = useNavigate();

  const invoiceVariables = [
    { name: 'invoice.invoiceNumber', description: '8-digit unique number' },
    { name: 'invoice.date', description: 'Creation date (use | formatDate)' },
    { name: 'invoice.po_number', description: 'Purchase Order number' },
    { name: 'invoice.clientName', description: 'Name of the client' },
    { name: 'invoice.projectName', description: 'Name of the project' },
    { name: 'invoice.totalHours', description: 'Sum of all line item hours' },
    { name: 'invoice.totalAmount', description: 'Total amount due (use | fixed)' },
    { name: 'invoice.consulting_title', description: 'Snapshotted project title' },
    { name: 'invoice.consulting_rate', description: 'Snapshotted hourly rate' },
    { name: 'invoice.client_address_l1', description: 'Snapshotted client address line 1' },
    { name: 'invoice.billing_representative', description: 'Snapshotted billing contact' },
  ];

  const consultantVariables = [
    { name: 'consultant.name', description: 'Your current full name' },
    { name: 'consultant.email', description: 'Your current email address' },
    { name: 'consultant.address_l1', description: 'Your current address line 1' },
  ];

  const customFilters = [
    { filter: 'formatDate', example: '{{ invoice.date | formatDate }}', result: '12/29/2025' },
    { filter: 'fixed', example: '{{ invoice.totalAmount | fixed }}', result: '1500.00' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/templates')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Template Variable Guide</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Invoice Variables (`invoice.`)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          These variables contain data specific to the invoice being generated. Values are snapshotted at creation time.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Variable</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceVariables.map((row) => (
                <TableRow key={row.name}>
                  <TableCell><code>{row.name}</code></TableCell>
                  <TableCell>{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Consultant Variables (`consultant.`)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Variable</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultantVariables.map((row) => (
                <TableRow key={row.name}>
                  <TableCell><code>{row.name}</code></TableCell>
                  <TableCell>{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Custom Filters
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Filter</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Example</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customFilters.map((row) => (
                <TableRow key={row.filter}>
                  <TableCell><code>{row.filter}</code></TableCell>
                  <TableCell><code>{row.example}</code></TableCell>
                  <TableCell>{row.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TemplateVariableGuide;
