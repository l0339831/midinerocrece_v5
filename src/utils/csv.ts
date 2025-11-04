
import Papa from 'papaparse'
import type { Row } from '@/db/storage'

export function parseCSV(text: string): Row[] {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
  return data as Row[]
}

export function toCSV(rows: Row[]): string {
  return Papa.unparse(rows)
}
