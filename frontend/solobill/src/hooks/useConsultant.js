import { consultantRepo } from '../db/repositories/consultantRepository';
import { ConsultantValidator } from '../utils/validation';
import { useResource } from './useResource';

export const useConsultant = () => {
  const { items, loading, save, refresh } = useResource(consultantRepo, ConsultantValidator, 'Consultant');
  
  // Since we have only one consultant profile, we take the first one
  const consultant = items.length > 0 ? items[0] : null;

  return {
    consultant,
    loading,
    saveConsultant: save,
    refreshConsultant: refresh
  };
};
