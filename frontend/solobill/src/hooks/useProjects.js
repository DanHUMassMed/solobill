import { useState, useEffect, useCallback } from 'react';
import { projectRepo } from '../db/repositories/projectRepository';
import { clientRepo } from '../db/repositories/clientRepository';
import { ProjectValidator } from '../utils/validation';
import { useResource } from './useResource';

export const useProjects = () => {
  const { items: projects, loading: projectsLoading, save, remove, refresh } = useResource(projectRepo, ProjectValidator, 'Project');
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // We still need to load clients for the dropdown/grouping
  const loadClients = useCallback(async () => {
      try {
          setClientsLoading(true);
          const allClients = await clientRepo.getAll();
          setClients(allClients);
      } catch (error) {
          console.error("Failed to load clients for projects", error);
      } finally {
          setClientsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    projects,
    clients,
    loading: projectsLoading || clientsLoading,
    saveProject: save,
    deleteProject: remove,
    refreshProjects: () => {
        refresh();
        loadClients();
    }
  };
};
