import Dexie, { Table } from 'dexie';
import { Consultant } from '../types/consultant';
import { Client } from '../types/client';
import { Project } from '../types/project';
import { Invoice } from '../types/invoice';
import { Template } from '../types/template';

export class AppDB extends Dexie {
  consultants!: Table<Consultant, string>;
  clients!: Table<Client, string>;
  projects!: Table<Project, string>;
  invoices!: Table<Invoice, string>;
  templates!: Table<Template, string>;

  constructor() {
    super('SoloBillDB');

    this.version(1).stores({
      consultants: 'id, email', 
      clients: 'id, name',
      projects: 'id, clientId, name',
      invoices: `
        id,
        invoiceNumber,
        invoiceDate,
        client.id,
        project.id
      `,
      templates: 'id, name, type, isActive'
    });
  }
}

export const db = new AppDB();
