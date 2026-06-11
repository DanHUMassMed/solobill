// src/db/repositories/ClientRepository.ts
import { BaseRepository } from './baseRepository';
import { Client } from '../../types/client';
import { db } from '../appDB';

export class ClientRepository extends BaseRepository<Client, string> {
    constructor() {
        super(db.clients);
    }

    getByName(name: string) {
        return this.table.where('name').equalsIgnoreCase(name).toArray();
    }

    deleteCascade(clientId: string) {
    return db.transaction(
        'rw',
        db.clients,
        db.projects,
        () =>
        db.projects
            .where('clientId')
            .equals(clientId)
            .delete()
            .then(() => db.clients.delete(clientId))
    );
    }

    async checkUniqueness(name: string, id?: string): Promise<boolean> {
        const match = await this.table
            .filter(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== id)
            .first();
        return !match;
    }

}

export const clientRepo = new ClientRepository();
