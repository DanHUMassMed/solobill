export interface Client {
  id: string;
  name: string;
  addressL1: string;
  addressL2?: string;
  addressL3?: string;
  contactNm?: string;
  billingRepName?: string;
  billingRepEmail?: string;
  additionalFields?: string;
}