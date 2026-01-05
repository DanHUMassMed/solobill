import { AdditionalFields } from './additionalFields';

export interface Project {
  id: string;
  clientId: string;
  name: string;
  poNumber: string;
  contractingTitle: string;
  contractingRate: string | number;
  contractingDesc: string;
  additionalFields?: AdditionalFields;
}