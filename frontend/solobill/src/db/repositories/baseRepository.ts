// src/db/repositories/BaseRepository.ts
import { Table } from 'dexie';

export abstract class BaseRepository<T, K> {
  protected table: Table<T, K>;

  constructor(table: Table<T, K>) {
    this.table = table;
  }

  getById(id: K) {
    return this.table.get(id);
  }

  getAll() {
    return this.table.toArray();
  }

  add(entity: T) {
    return this.table.add(entity);
  }

  put(entity: T) {
    return this.table.put(entity);
  }

  delete(id: K) {
    return this.table.delete(id);
  }

  clear() {
    return this.table.clear();
  }
}
