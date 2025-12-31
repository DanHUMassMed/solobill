import { BaseRepository } from './baseRepository';
import { Template, TemplateType } from '../../types/template';
import { db } from '../appDB';

export class TemplateRepository extends BaseRepository<Template, string> {
  constructor() {
    super(db.templates);
  }

  async getActiveByType(type: TemplateType) {
    return this.table.where({ type, isActive: true }).first();
  }

  async getByType(type: TemplateType) {
    return this.table.where('type').equals(type).toArray();
  }

  async setActive(id: string) {
    const template = await this.getById(id);
    if (!template) return;

    // Deactivate all of same type
    await this.table.where('type').equals(template.type).modify({ isActive: false });
    
    // Activate this one
    await this.table.update(id, { isActive: true });
  }

  async resetDefault(id: string) {
    const template = await this.getById(id);
    if (!template || !template.isDefault) return;

    let fileName = '';
    if (id === 'default-invoice') fileName = 'invoice_template.html';
    else if (id === 'default-email') fileName = 'email_template.html';
    else if (id === 'default-invoice-2') fileName = 'invoice_template2.html';
    
    if (fileName) {
        const response = await fetch(`/templates/${fileName}`);
        const content = await response.text();
        await this.table.update(id, { content, updatedAt: Date.now() });
    }
  }

  async initDefaultTemplates() {
    const defaultTemplates: {id: string, name: string, type: TemplateType, file: string, isActive: boolean}[] = [
      {
        id: 'default-invoice',
        name: 'System Default Invoice',
        type: 'invoice',
        file: 'invoice_template.html',
        isActive: true,
      },
      {
        id: 'default-invoice-2',
        name: 'System Default Invoice 2',
        type: 'invoice',
        file: 'invoice_template2.html',
        isActive: false,
      },
      {
        id: 'default-email',
        name: 'System Default Email',
        type: 'email',
        file: 'email_template.html',
        isActive: true,
      }
    ];

    for (const t of defaultTemplates) {
      try {
        const existing = await this.getById(t.id);
        if (!existing) {
          const response = await fetch(`/templates/${t.file}`);
          if (response.ok) {
            const content = await response.text();
            await this.add({
              id: t.id,
              name: t.name,
              type: t.type,
              content,
              isDefault: true,
              isActive: t.isActive,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            console.log(`Restored default template: ${t.name}`);
          }
        }
      } catch (error) {
        console.error(`Failed to load default template ${t.file}`, error);
      }
    }
  }
}

export const templateRepo = new TemplateRepository();
