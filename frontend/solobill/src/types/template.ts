export type TemplateType = 'invoice' | 'email' | 'csv';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
