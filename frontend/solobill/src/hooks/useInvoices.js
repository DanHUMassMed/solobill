import { useState, useEffect, useCallback } from 'react';
import { invoiceRepo } from '../db/repositories/invoiceRepository';
import { projectRepo } from '../db/repositories/projectRepository';
import { clientRepo } from '../db/repositories/clientRepository';
import { consultantRepo } from '../db/repositories/consultantRepository';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allInvoices, allProjects, allClients, allConsultants] = await Promise.all([
        invoiceRepo.getAll(),
        projectRepo.getAll(),
        clientRepo.getAll(),
        consultantRepo.getAll()
      ]);
      
      setInvoices(allInvoices);
      setProjects(allProjects);
      setClients(allClients);
      setConsultant(allConsultants.length > 0 ? allConsultants[0] : null);

    } catch (error) {
      console.error("Failed to load data", error);
      showSnackbar('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const createInvoice = async (invoiceData) => {
    try {
      // Ensure we have a valid invoice object with required snapshots
      await invoiceRepo.create(invoiceData);
      showSnackbar('Invoice created successfully', 'success');
      await loadData();
      return { success: true };
    } catch (error) {
      console.error("Failed to create invoice", error);
      showSnackbar(`Failed to create invoice: ${error.message}`, 'error');
      return { success: false, error };
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await invoiceRepo.delete(id);
      showSnackbar('Invoice deleted successfully', 'success');
      await loadData();
      return true;
    } catch (error) {
      console.error("Failed to delete invoice", error);
      showSnackbar('Failed to delete invoice', 'error');
      return false;
    }
  };

  return {
    invoices,
    projects,
    clients,
    consultant,
    loading,
    snackbar,
    closeSnackbar,
    createInvoice,
    deleteInvoice,
    refreshInvoices: loadData
  };
};
