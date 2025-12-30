// src/db/repositories/ConsultantRepository.ts
import { BaseRepository } from './baseRepository';
import { Consultant } from '../../types/consultant';
import { db } from '../appDB';

export class ConsultantRepository extends BaseRepository<Consultant, string> {
    constructor() {
        super(db.consultants);
    }
}

export const consultantRepo = new ConsultantRepository();
