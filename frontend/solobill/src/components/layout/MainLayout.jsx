import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined'; 
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalService } from '../../context/LocalServiceContext';


const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    backgroundColor: theme.palette.grey[100], 
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export default function MainLayout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const { service } = useLocalService();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
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
          <Typography variant="h6" noWrap component="div">
            {getCurrentTitle()}
          </Typography>
          {/* Local service status */}
          {service ? (
            <Typography variant="body2" sx={{ ml: 2, color: 'limegreen' }}>
              🟢 Local service active
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ ml: 2, color: 'orange' }}>
              🟡 Browser-only mode
            </Typography>
          )}

        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
              <img
                src="/solobill_logo.png"
                alt="SoloBill"
                style={{ height: 50, marginRight: 2 }}
              />
             </Box>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ViewSidebarOutlinedIcon sx={{ transform: 'rotate(180deg)' }} /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)} selected={location.pathname === item.path}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
             <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/admin')} selected={location.pathname === '/admin'}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItemButton>
            </ListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
