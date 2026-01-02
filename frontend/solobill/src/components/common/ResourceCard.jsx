import React from 'react';
import { Card, CardContent, CardActions, Typography, Box } from '@mui/material';

export default function ResourceCard({ title, subtitle, content, actions, icon }) {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle2" color="primary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          {content}
        </Box>
      </CardContent>
      {actions && (
        <CardActions 
          disableSpacing 
          sx={{ 
            justifyContent: 'flex-end', 
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1
          }}
        >
          {actions}
        </CardActions>
      )}
    </Card>
  );
}
