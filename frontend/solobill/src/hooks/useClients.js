import { clientRepo } from '../db/repositories/clientRepository';
import { ClientValidator } from '../utils/validation';
import { useResource } from './useResource';

export const useClients = () => {
  const { items: clients, loading, save, remove, refresh } = useResource(clientRepo, ClientValidator, 'Client');

  return {
    clients,
    loading,
    saveClient: save,
    deleteClient: remove,
    refreshClients: refresh
  };
};
