import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import { useNotification } from '../../context/NotificationContext';
import { consultantRepo } from '../../db/repositories/consultantRepository';
import { clientRepo } from '../../db/repositories/clientRepository';
import { projectRepo } from '../../db/repositories/projectRepository';

const TemplateVariableGuide = () => {
  const { notify } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicVars, setDynamicVars] = useState({ consultant: [], client: [], project: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scanDatabase = async () => {
      try {
        setLoading(true);
        const [consultants, clients, projects] = await Promise.all([
          consultantRepo.getAll(),
          clientRepo.getAll(),
          projectRepo.getAll()
        ]);

        const consultantSet = new Set();
        const clientSet = new Set();
        const projectSet = new Set();

        consultants.forEach(c => {
          if (c.additionalFields) {
            Object.keys(c.additionalFields).forEach(k => consultantSet.add(k));
          }
        });
        clients.forEach(c => {
          if (c.additionalFields) {
            Object.keys(c.additionalFields).forEach(k => clientSet.add(k));
          }
        });
        projects.forEach(p => {
          if (p.additionalFields) {
            Object.keys(p.additionalFields).forEach(k => projectSet.add(k));
          }
        });

        setDynamicVars({
          consultant: Array.from(consultantSet),
          client: Array.from(clientSet),
          project: Array.from(projectSet)
        });
      } catch (err) {
        console.error("Failed to scan dynamic template fields", err);
      } finally {
        setLoading(false);
      }
    };
    scanDatabase();
  }, []);

  const handleCopy = (variablePath) => {
    const textToCopy = `{{ ${variablePath} }}`;
    navigator.clipboard.writeText(textToCopy);
    notify(`Copied ${textToCopy} to clipboard!`, 'success');
  };

  // Base list of fixed variables
  const getStaticVariables = () => {
    return [
      // Consultant
      { path: 'invoice.consultant.name', type: 'standard', section: 'Consultant', desc: 'Your full name' },
      { path: 'invoice.consultant.companyName', type: 'standard', section: 'Consultant', desc: 'Your company name' },
      { path: 'invoice.consultant.email', type: 'standard', section: 'Consultant', desc: 'Your email address' },
      { path: 'invoice.consultant.addressL1', type: 'standard', section: 'Consultant', desc: 'Your address line 1' },
      { path: 'invoice.consultant.addressL2', type: 'standard', section: 'Consultant', desc: 'Your address line 2 (Optional)' },
      { path: 'invoice.consultant.addressL3', type: 'standard', section: 'Consultant', desc: 'Your address line 3 (Optional)' },
      
      // Client
      { path: 'invoice.client.name', type: 'standard', section: 'Client', desc: 'Client billing name' },
      { path: 'invoice.client.addressL1', type: 'standard', section: 'Client', desc: 'Client address line 1' },
      { path: 'invoice.client.addressL2', type: 'standard', section: 'Client', desc: 'Client address line 2 (Optional)' },
      { path: 'invoice.client.addressL3', type: 'standard', section: 'Client', desc: 'Client address line 3 (Optional)' },
      { path: 'invoice.client.contactNm', type: 'standard', section: 'Client', desc: 'Client general contact name' },
      { path: 'invoice.client.billingRepName', type: 'standard', section: 'Client', desc: 'Billing representative name (used in email body)' },
      { path: 'invoice.client.billingRepEmail', type: 'standard', section: 'Client', desc: 'Billing representative email address' },
      
      // Project
      { path: 'invoice.project.name', type: 'standard', section: 'Project', desc: 'Associated project name' },
      { path: 'invoice.project.poNumber', type: 'standard', section: 'Project', desc: 'Purchase Order (PO) number' },
      { path: 'invoice.project.contractingTitle', type: 'standard', section: 'Project', desc: 'Consultant contracting title' },
      { path: 'invoice.project.contractingRate', type: 'standard', section: 'Project', desc: 'Hourly billing rate' },
      { path: 'invoice.project.contractingDesc', type: 'standard', section: 'Project', desc: 'Brief description of services rendered' },
      
      // Invoice
      { path: 'invoice.invoiceNumber', type: 'standard', section: 'Invoice', desc: 'Unique invoice number' },
      { path: 'invoice.invoiceDate', type: 'standard', section: 'Invoice', desc: 'Invoice issue date (YYYY-MM-DD)' },
      { path: 'invoice.totalHours', type: 'standard', section: 'Invoice', desc: 'Sum of all hours worked on this invoice' },
      { path: 'invoice.totalAmount', type: 'standard', section: 'Invoice', desc: 'Total amount due on this invoice' },
      
      // Line Items (Loop variables)
      { path: 'item.dateDesc', type: 'loop', section: 'Line Items', desc: 'Date or description of work day (inside loops)' },
      { path: 'item.workDesc', type: 'loop', section: 'Line Items', desc: 'Detail of work done (inside loops)' },
      { path: 'item.hours', type: 'loop', section: 'Line Items', desc: 'Hours worked on line item (inside loops)' },
      { path: '(item.hours * invoice.project.contractingRate) | currency', type: 'loop', section: 'Line Items', desc: 'Formatted billing amount for the line item' }
    ];
  };

  // Compile full variables list (Static + Dynamic scanned keys)
  const compileAllVariables = () => {
    const list = getStaticVariables();

    // Consultant dynamic variables
    dynamicVars.consultant.forEach(key => {
      list.push({
        path: `invoice.consultant.additionalFields.${key}`,
        type: 'custom',
        section: 'Consultant',
        desc: `Custom Consultant Profile Field: "${key}"`
      });
    });

    // Client dynamic variables
    dynamicVars.client.forEach(key => {
      list.push({
        path: `invoice.client.additionalFields.${key}`,
        type: 'custom',
        section: 'Client',
        desc: `Custom Client Field: "${key}"`
      });
    });

    // Project dynamic variables
    dynamicVars.project.forEach(key => {
      list.push({
        path: `invoice.project.additionalFields.${key}`,
        type: 'custom',
        section: 'Project',
        desc: `Custom Project Field: "${key}"`
      });
    });

    return list;
  };

  const allVariables = compileAllVariables();

  // Filter based on search query
  const filteredVariables = allVariables.filter(v => 
    v.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSectionTable = (sectionName) => {
    const items = filteredVariables.filter(v => v.section === sectionName);
    if (items.length === 0) return null;

    return (
      <Paper sx={{ p: 2, mb: 4 }} key={sectionName}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {sectionName} Variables ({sectionName.toLowerCase()}.*)
          <Chip label={`${items.length} fields`} size="small" variant="outlined" />
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Variable Path</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', align: 'center', width: '10%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.path} hover>
                  <TableCell>
                    <code style={{ fontSize: '0.9rem', color: '#d32f2f' }}>{row.path}</code>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type.toUpperCase()} 
                      size="small" 
                      color={row.type === 'custom' ? 'info' : row.type === 'loop' ? 'secondary' : 'default'}
                      variant={row.type === 'custom' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{row.desc}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleCopy(row.path)} title="Copy Nunjucks Tag">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Scanning system for variables...</Typography>
      </Box>
    );
  }

  const sections = ['Consultant', 'Client', 'Project', 'Invoice', 'Line Items'];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">Dynamic Template Variables Reference</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This guide automatically lists all variables currently available in the system. Standard fields are defined by the schema, and Custom fields are compiled in real-time from additional fields added in your Profile, Client cards, and Project logs.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Click the copy button (<ContentCopyIcon fontSize="inherit" />) next to any variable to copy the Nunjucks-ready tag (e.g., <code>{"{{ invoice.client.name }}"}</code>) to your clipboard.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          placeholder="Search variables by path, category, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Paper>

      {/* Render tables */}
      {sections.map(section => renderSectionTable(section))}

      {/* Formatting & Logic Help Card */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Nunjucks Rendering Filters
            </Typography>
            <Typography variant="body2" paragraph>
              Apply formatting filters to variables using the pipe (<code>|</code>) character:
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Filter</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Syntax Example</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rendered Output</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell><strong>formatDate</strong></TableCell>
                  <TableCell><code>{"{{ invoice.invoiceDate | formatDate }}"}</code></TableCell>
                  <TableCell>12/29/2025</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell><strong>currency</strong></TableCell>
                  <TableCell><code>{"{{ invoice.totalAmount | currency }}"}</code></TableCell>
                  <TableCell>$1,500.00</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell><strong>fixed</strong></TableCell>
                  <TableCell><code>{"{{ invoice.totalHours | fixed }}"}</code></TableCell>
                  <TableCell>120.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Work Log Loop Loop (Table rendering)
            </Typography>
            <Typography variant="body2" paragraph>
              To render line items inside your HTML invoices, wrap the row structure inside a Nunjucks loop block:
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px', 
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
              border: '1px solid #e0e0e0'
            }}>
{`<table>
  {% for item in invoice.lineItems %}
  <tr>
    <td>{{ item.dateDesc }}</td>
    <td>{{ item.workDesc }}</td>
    <td>{{ item.hours }}</td>
    <td>{{ (item.hours * invoice.project.contractingRate) | currency }}</td>
  </tr>
  {% endfor %}
</table>`}
            </pre>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateVariableGuide;
