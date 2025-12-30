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
}

export const projectRepo = new ProjectRepository();
