import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  const adminFeatures = [
    {
      title: 'Template Management',
      description: 'Manage HTML templates for invoices and emails.',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/templates'
    },
    {
      title: 'Data Management',
      description: 'Export invoices to CSV and archive old records.',
      icon: <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/data'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Control Panel
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure system settings and manage application resources.
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {adminFeatures.map((feature) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.title}>
            <Card>
              <CardActionArea onClick={() => navigate(feature.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Admin;
