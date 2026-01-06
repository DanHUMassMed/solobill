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

  const consultantVariables = [
    { name: 'consultant.name', description: 'Your full name' },
    { name: 'consultant.companyName', description: 'Your company name' },
    { name: 'consultant.email', description: 'Your email address' },
    { name: 'consultant.addressL1', description: 'Your address line one' },
    { name: 'consultant.addressL2', description: 'Your address line two' },
    { name: 'consultant.addressL3', description: 'Your address line three' },
    { name: 'consultant.additionalFields.termDays', description: 'Billing Terms in days (Custom field)' },
    { name: 'consultant.additionalFields.phone', description: 'Your phone number (Custom field)' },
  ];

  const clientVariables = [
    { name: 'client.name', description: 'Client name' },
    { name: 'client.contactNm', description: 'Client contact name' },
    { name: 'client.billingRepNm', description: 'Client billing representative name' },
    { name: 'client.billingRepEmail', description: 'Client billing representative email' },
    { name: 'client.addressL1', description: 'Client address line one' },
    { name: 'client.addressL2', description: 'Client address line two' },
    { name: 'client.addressL3', description: 'Client address line three' },
  ];

    const projectVariables = [
    { name: 'project.name', description: 'Project name' },
    { name: 'project.poNumber', description: 'Project Purchase Order Number' },
    { name: 'project.contractingTitle', description: 'Your title for the project' },
    { name: 'project.contractingRate', description: 'Your hourly rate for the project' },
    { name: 'project.contractingDesc', description: 'Summary description of the project' },
  ];

    const invoiceVariables = [
    { name: 'invoice.invoiceNumber', description: 'Unique invoice number' },
    { name: 'invoice.invoiceDate', description: 'Invoice date (defaults to current date)' },
    { name: 'invoice.totalHours', description: 'Sum of all line item hours' },
    { name: 'invoice.totalAmount', description: 'Total amount due on this invoice' },
    { name: 'invoice.lineItems.dateDesc', description: 'Date description' },
    { name: 'invoice.lineItems.workDesc', description: 'Work description (defaults to contractingDesc)' },
    { name: 'invoice.lineItems.hours', description: 'Hours worked (on this line item)' },
  ];


  const customFilters = [
    { filter: 'formatDate', example: '{{ invoice.date | formatDate }}', result: '12/29/2025' },
    { filter: 'currency', example: '{{ invoice.totalAmount | currency }}', result: '$1,500.00' },
  ];

  return (
    <>
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

  <Paper sx={{ p: 3, mb: 4 }}>
    <Typography variant="h6" color="primary" gutterBottom>
      Client Variables (`client.`)
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
          {clientVariables.map((row) => (
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
      Project Variables (`project.`)
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
          {projectVariables.map((row) => (
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
      Additional Information Variables
    </Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Any custom <strong>Name / Value</strong> pairs entered in the
      <em> Additional Information</em> section are exposed as template variables.
      The <strong>Name</strong> becomes the variable key.
    </Typography>

    <Typography variant="body2">
      Example: <code>{'{{ invoice.additionalFields.paymentMethod }}'}</code>
    </Typography>
  </Paper>
</>


  );
};

export default TemplateVariableGuide;
