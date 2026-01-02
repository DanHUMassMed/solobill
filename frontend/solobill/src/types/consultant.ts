export interface Consultant {
  id: string;
  name: string;
  addressL1: string;
  addressL2?: string;
  addressL3?: string;
  email: string;
  additionalFields?: string;
}