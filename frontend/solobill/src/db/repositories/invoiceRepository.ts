// src/db/repositories/InvoiceRepository.ts
import { BaseRepository } from './baseRepository';
import { Invoice } from '../../types/invoice';
import { db } from '../appDB';

export class InvoiceRepository extends BaseRepository<Invoice, string> {
    constructor() {
        super(db.invoices);
    }

    getByClient(clientId: string) {
        return this.table
            .where('client.id')
            .equals(clientId)
            .toArray();
    }

    getByProject(projectId: string) {
        return this.table
            .where('project.id')
            .equals(projectId)
            .toArray();
    }

    getByDateRange(start: string, end: string) {
        return this.table
            .where('invoiceDate')
            .between(start, end)
            .toArray();
    }

    getByInvoiceNumber(invoiceNumber: string) {
        return this.table
            .where('invoiceNumber')
            .equals(invoiceNumber)
            .first();
    }

    /**
     * Enforce immutability:
     * once created, invoices should not be modified.
     */
    async create(invoice: Invoice) {
        const exists = await this.getByInvoiceNumber(invoice.invoiceNumber);
        if (exists) {
            throw new Error('Invoice number already exists');
        }

        return this.add(Object.freeze(invoice));
    }

    /**
     * Explicitly disallow updates
     */
    async update() {
        throw new Error('Invoices are immutable');
    }
}

export const invoiceRepo = new InvoiceRepository();
