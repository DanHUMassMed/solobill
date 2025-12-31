import { useState, useEffect, useCallback } from 'react';
import { clientRepo } from '../db/repositories/clientRepository';
import { ClientValidator } from '../utils/validation';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const allClients = await clientRepo.getAll();
      setClients(allClients);
    } catch (error) {
      console.error("Failed to load clients", error);
      showSnackbar('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const saveClient = async (clientData, additionalFields) => {
    const { isValid, errors } = ClientValidator.validate(clientData);

    if (!isValid) {
      return { success: false, errors };
    }

    try {
      const dataToSave = {
        ...clientData,
        id: clientData.id || crypto.randomUUID(),
        additionalFields: JSON.stringify(additionalFields)
      };

      if (clientData.id) {
        await clientRepo.put(dataToSave);
        showSnackbar('Client updated successfully', 'success');
      } else {
        await clientRepo.add(dataToSave);
        showSnackbar('Client added successfully', 'success');
      }
      
      await loadClients();
      return { success: true };
    } catch (error) {
      console.error("Failed to save client", error);
      showSnackbar('Failed to save client', 'error');
      return { success: false, error };
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientRepo.delete(id);
      showSnackbar('Client deleted successfully', 'success');
      await loadClients();
      return true;
    } catch (error) {
      console.error("Failed to delete client", error);
      showSnackbar('Failed to delete client', 'error');
      return false;
    }
  };

  return {
    clients,
    loading,
    snackbar,
    closeSnackbar,
    saveClient,
    deleteClient,
    refreshClients: loadClients
  };
};
