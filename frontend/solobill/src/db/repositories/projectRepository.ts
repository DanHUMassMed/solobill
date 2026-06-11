// src/db/repositories/ProjectRepository.ts
import { BaseRepository } from './baseRepository';
import { Project } from '../../types/project';
import { db } from '../appDB';

export class ProjectRepository extends BaseRepository<Project, string> {
    constructor() {
        super(db.projects);
    }

    getByClient(clientId: string) {
        return this.table.where('clientId').equals(clientId).toArray();
    }

    deleteByClientId(clientId: string) {
        return this.table.where('clientId').equals(clientId).delete();
    }

    async checkUniqueness(name: string, id?: string, clientId?: string): Promise<boolean> {
        if (!clientId) return true;
        const match = await this.table
            .where('clientId')
            .equals(clientId)
            .filter(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== id)
            .first();
        return !match;
    }

}

export const projectRepo = new ProjectRepository();
