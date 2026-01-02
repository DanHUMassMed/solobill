import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export default function PageHeader({ title, actions, subtitle }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={2}>
          {actions}
        </Stack>
      )}
    </Box>
  );
}
