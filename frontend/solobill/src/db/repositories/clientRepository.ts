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
}

export const clientRepo = new ClientRepository();
