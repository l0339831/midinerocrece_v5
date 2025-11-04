
import Dexie, { Table } from 'dexie'

export interface Project {
  id?: number
  name: string
}

export interface Row {
  id?: number
  date?: string
  mes?: string
  categoria?: string
  subcategoria?: string
  detalle?: string
  banca?: string
  segmento_cx?: string
  Relevancia?: string
  'Recurrencia (con qué frecuencia se repite)'?: string
  'Prioridad (RxR)'?: string
  'Factibilidad técnica de implementar'?: string
  Estados?: string
  driver?: string
  Proyecto?: string
}

export class MDCDB extends Dexie {
  dataset!: Table<Row, number>
  projects!: Table<Project, number>

  constructor() {
    super('mdc_v3_5_0')
    this.version(1).stores({
      dataset: '++id,date,mes,categoria,banca,segmento_cx,Estados,driver,Proyecto',
      projects: '++id,name',
    })
  }
}
export const db = new MDCDB()

export async function saveDataset(rows: Row[]): Promise<void> {
  try{
    await db.dataset.clear()
    await db.dataset.bulkAdd(rows)
  }catch(e: unknown){
    console.error('Dexie saveDataset failed', e instanceof Error ? e.message : e)
  }
}

export async function loadDataset(): Promise<Row[]> {
  try{
    return await db.dataset.toArray()
  }catch(e: unknown){
    console.error('Dexie loadDataset failed', e instanceof Error ? e.message : e)
    return []
  }
}

export async function saveProjects(names: string[]): Promise<void> {
  try{
    await db.projects.clear()
    await db.projects.bulkAdd(names.map(name => ({ name })))
  }catch(e: unknown){
    console.error('Dexie saveProjects failed', e instanceof Error ? e.message : e)
  }
}

export async function loadProjects(): Promise<string[]> {
  try{
    const rows = await db.projects.toArray()
    return rows.map(r => r.name)
  }catch(e: unknown){
    console.error('Dexie loadProjects failed', e instanceof Error ? e.message : e)
    return []
  }
}
