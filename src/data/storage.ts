import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Row } from '@/types';

export interface ProjectList { id: string; items: string[]; updatedAt: number; }

class MDCDB extends Dexie {
  rows!: Table<Row, string>;
  projects!: Table<ProjectList, string>;
  constructor() {
    super('mdc_db');
    this.version(2).stores({ rows: 'id', projects: 'id' });
  }
}
export const db = new MDCDB();

export async function saveDataset(rows: Row[]) {
  await db.open();
  await db.rows.clear();
  await db.rows.bulkPut(rows);
}
export async function loadDataset(): Promise<Row[]> {
  await db.open();
  return db.rows.toArray();
}
export async function saveProjects(list: string[]) {
  await db.open();
  const uniq = Array.from(new Set(list.filter(Boolean)));
  await db.projects.put({ id: 'projects', items: uniq, updatedAt: Date.now() });
}
export async function loadProjects(): Promise<string[]> {
  await db.open();
  const rec = await db.projects.get('projects');
  return rec?.items ?? [];
}
