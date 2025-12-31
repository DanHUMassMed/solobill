import { useState, useEffect, useCallback } from 'react';
import { projectRepo } from '../db/repositories/projectRepository';
import { clientRepo } from '../db/repositories/clientRepository';
import { ProjectValidator } from '../utils/validation';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allProjects, allClients] = await Promise.all([
        projectRepo.getAll(),
        clientRepo.getAll()
      ]);
      setProjects(allProjects);
      setClients(allClients);
    } catch (error) {
      console.error("Failed to load data", error);
      showSnackbar('Failed to load projects', 'error');
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

  const saveProject = async (projectData, additionalFields) => {
    const { isValid, errors } = ProjectValidator.validate(projectData);

    if (!isValid) {
      return { success: false, errors };
    }

    try {
      const dataToSave = {
        ...projectData,
        id: projectData.id || crypto.randomUUID(),
        additionalFields: JSON.stringify(additionalFields)
      };

      if (projectData.id) {
        await projectRepo.put(dataToSave);
        showSnackbar('Project updated successfully', 'success');
      } else {
        await projectRepo.add(dataToSave);
        showSnackbar('Project added successfully', 'success');
      }
      
      await loadData();
      return { success: true };
    } catch (error) {
      console.error("Failed to save project", error);
      showSnackbar('Failed to save project', 'error');
      return { success: false, error };
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectRepo.delete(id);
      showSnackbar('Project deleted successfully', 'success');
      await loadData();
      return true;
    } catch (error) {
      console.error("Failed to delete project", error);
      showSnackbar('Failed to delete project', 'error');
      return false;
    }
  };

  return {
    projects,
    clients,
    loading,
    snackbar,
    closeSnackbar,
    saveProject,
    deleteProject,
    refreshProjects: loadData
  };
};
