import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Divider,
  Stack,
  Chip
} from '@mui/material';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import InfoIcon from '@mui/icons-material/Info';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { useRegisterSW } from 'virtual:pwa-register/react';

import versionJson from '../../../package.json';

export default function About() {
  const [checking, setChecking] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState(null);
  const { notify } = useNotification();
  const [currentVersion, setCurrentVersion] = useState(versionJson.version);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const fetchVersionInfo = async (path = '/version.json') => {
    try {
      const response = await fetch(path, {
        cache: 'no-store',
        headers: { 'cache-control': 'no-cache' },
        serviceWorker: 'none',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch version info (${response.status})`)
      }

      const data = await response.json()

      if (!data?.version) {
        throw new Error('Version field missing from version.json')
      }

      return data.version
    } catch (err) {
      console.error('fetchVersionInfo error:', err)
      throw err // rethrow so callers can react
    }
  }

  
  const handleCheckUpdates = async () => {
    setChecking('Checking...');
    if (needRefresh) {
      setUpdateDialogOpen(true);
      setChecking(null);
      return;
    }
    try {      
      const remoteVersion = await fetchVersionInfo()
      if (remoteVersion !== currentVersion) {
        setNeedRefresh(true);
        setNewVersionInfo(remoteVersion);
        // setUpdateDialogOpen(true);
      } else {
        // Check if SW has an update waiting
        if (needRefresh) {
          setUpdateDialogOpen(true);
        } else {
          notify('You are using the latest version.', 'success');
        }
      }

    } catch (error) {
      console.error("Update check failed", error);
      notify('Failed to check for updates', 'error');
    } finally {
      setChecking(null);
    }
  };

  const handleUpdateConfirm = async () => {
    setChecking('Updating...');
    setUpdateDialogOpen(false);  
    await new Promise(r => setTimeout(r, 5000))
    await updateServiceWorker(true);
    console.log('handleUpdateConfirm after updateServiceWorker');
    setChecking(null);
    const remoteVersion = await fetchVersionInfo()
    setCurrentVersion(remoteVersion)
    window.location.reload();
  };

  const handleUpdateCancel = () => {
    setUpdateDialogOpen(false);
    setChecking(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader 
        title="About SoloBill" 
        subtitle="Application information and updates."
      />

      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <InfoIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          SoloBill Consultant Invoicing
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          A lightweight, offline-first PWA for managing clients, projects, and generating invoices.
        </Typography>

        <Box sx={{ my: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="subtitle1">Current Version:</Typography>
            <Chip label={`v${currentVersion}`} color="primary" variant="outlined" />
            {needRefresh && (
              <Chip label="Update Available" color="warning" size="small" />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Button
          variant="contained"
          startIcon={<SystemUpdateIcon />}
          onClick={handleCheckUpdates}
          disabled={checking !== null}
        >
          {checking
            ? checking
            : needRefresh
              ? 'Update Application'
              : 'Check for Updates'}
        </Button>

      </Paper>

      <ConfirmDialog
        open={updateDialogOpen}
        onClose={handleUpdateCancel}
        onConfirm={handleUpdateConfirm}
        title="Update Available"
        message={
          newVersionInfo?.version
            ? `A new version (${newVersionInfo.version}) is available. Do you want to reload the application to update?`
            : 'A new version is available. Do you want to reload the application to update?'
        }
        confirmText="Update Now"
        confirmColor="primary"
      />
    </Box>
  );
}