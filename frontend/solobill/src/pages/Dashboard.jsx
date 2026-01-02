import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Avatar,
  CircularProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  Add as AddIcon, 
  PersonAdd as PersonAddIcon, 
  AttachMoney, 
  AccessTime, 
  Work, 
  People,
  Visibility
} from '@mui/icons-material';

import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import PageHeader from '../components/common/PageHeader';

// --- Helper Components ---

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
           <Avatar 
             sx={{ 
               bgcolor: alpha(color, 0.15), 
               color: color, 
               width: 48, 
               height: 48, 
               borderRadius: 2 
             }} 
             variant="rounded"
           >
              {icon}
           </Avatar>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
           <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, loading, error } = useDashboardMetrics();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
     return (
        <Box sx={{ p: 3 }}>
           <Typography color="error">Error loading dashboard data.</Typography>
        </Box>
     );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Theme Colors
  const BLUE_COLOR = theme.palette.primary.main;
  const GREEN_COLOR = theme.palette.success.main;
  const WARNING_COLOR = theme.palette.warning.main;
  const INFO_COLOR = theme.palette.info.main;
  
  const PIE_COLORS = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader 
        title="Business Overview"
        actions={
          <>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/invoices/create')}
            >
              New Invoice
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/clients')}
            >
              Add Client
            </Button>
          </>
        }
      />

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Monthly Revenue"
            value={formatCurrency(data.monthlyRevenue)}
            subtitle={`Year to date: ${formatCurrency(data.ytdRevenue)}`}
            icon={<AttachMoney />}
            color={BLUE_COLOR}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Monthly Hours"
            value={data.monthlyHours}
            subtitle={`Year to date: ${data.ytdHours}`}
            icon={<AccessTime />}
            color={GREEN_COLOR}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Projects"
            value={data.activeProjects}
            subtitle="Total ongoing engagements"
            icon={<Work />}
            color={WARNING_COLOR}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Clients"
            value={data.totalClients}
            subtitle="Registered in your network"
            icon={<People />}
            color={INFO_COLOR}
          />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue & Hours Trends (Last 6 Months)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.revenueTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke={BLUE_COLOR} />
                  <YAxis yAxisId="right" orientation="right" stroke={GREEN_COLOR} />
                  <Tooltip 
                    formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value, 
                        name === 'revenue' ? 'Revenue' : 'Hours'
                    ]}
                    contentStyle={{ backgroundColor: theme.palette.background.paper }}
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="hours" name="Hours" fill={GREEN_COLOR} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={BLUE_COLOR} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Client Revenue Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Client
            </Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {data.clientRevenue.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.clientRevenue}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.clientRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                    <Typography color="text.secondary">No revenue data yet</Typography>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Invoices */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Invoices</Typography>
            <Button size="small" onClick={() => navigate('/invoices')}>View All</Button>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="recent invoices table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Client / Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentInvoices.length > 0 ? (
                  data.recentInvoices.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                         <Avatar variant="rounded" sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            <Box sx={{ fontSize: '0.8rem' }}>INV</Box>
                         </Avatar>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle2">{row.client?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">#{row.invoiceNumber}</Typography>
                      </TableCell>
                      <TableCell>{new Date(row.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                          <Typography fontWeight="bold">
                             {formatCurrency(row.totalAmount)}
                          </Typography>
                      </TableCell>
                      <TableCell align="center">
                          <IconButton size="small" onClick={() => navigate(`/invoices/${row.id}`)} aria-label="view invoice">
                              <Visibility fontSize="small" />
                          </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={5} align="center">
                          <Typography sx={{ py: 3 }} color="text.secondary">No recent invoices found</Typography>
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}