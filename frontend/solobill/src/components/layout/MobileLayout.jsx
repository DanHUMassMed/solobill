import * as React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Consultant', icon: <PersonIcon />, path: '/consultant' },
    { text: 'Clients', icon: <PeopleIcon />, path: '/clients' },
    { text: 'Projects', icon: <WorkIcon />, path: '/projects' },
    { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
    { text: 'Email', icon: <EmailIcon />, path: '/email' },
  ];

  const getCurrentTitle = () => {
    if (location.pathname === '/admin') return 'Admin';
    if (location.pathname === '/admin/templates') return 'Template Management';
    if (location.pathname === '/admin/templates/guide') return 'Template Variable Guide';
    if (location.pathname === '/admin/data') return 'Data Management';
    if (location.pathname === '/admin/about') return 'About SoloBill';
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.text : 'SoloBill';
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/')} sx={{ mr: 1 }} aria-label="go home">
            <HomeIcon />
          </IconButton>

          {location.pathname.startsWith('/admin/') && (
            <IconButton color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 1 }} aria-label="back to admin">
              <ArrowBackIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap>
            {getCurrentTitle()}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <img
            src="/solobill_logo.png"
            alt="SoloBill"
            style={{ height: 50 }}
          />
        </Box>

        <Divider />

        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/admin'}
              onClick={() => handleNavigate('/admin')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
          minHeight: '100vh',
          backgroundColor: theme => theme.palette.grey[100],
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
