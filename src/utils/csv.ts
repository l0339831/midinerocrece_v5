import Papa from 'papaparse'
import type { Row } from '@/db/storage'

function normalizeText(text: string): string { return text.replace(/^\uFEFF/, '') }
function detectDelimiter(text: string): string {
  const sc = (text.match(/;/g) || []).length
  const cc = (text.match(/,/g) || []).length
  return sc >= cc ? ';' : ','
}

export function parseCSVRows(text: string): Row[] {
  const clean = normalizeText(text)
  const delimiter = detectDelimiter(clean)

const result = Papa.parse(clean, {
  header: true,
  skipEmptyLines: true,
  delimiter,
  dynamicTyping: false,
  transformHeader: (h: string) => h.trim(),
}) as { data: Record<string, unknown>[] }

  return result.data as unknown as Row[]
}

export function toCSV(rows: Row[]): string { return Papa.unparse(rows) }

export function parseCSVMatrix(text: string, delimiter?: string): string[][] {
  const clean = normalizeText(text)
  const d = delimiter ?? detectDelimiter(clean)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const pushField = () => { row.push(field); field = '' }
  const pushRow = () => { rows.push(row); row = [] }
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (inQuotes) {
      if (ch === '"') {
        const next = clean[i + 1]
        if (next === '"') { field += '"'; i++ } else { inQuotes = false }
      } else { field += ch }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === d) pushField()
      else if (ch === '\r') { /* ignore */ }
      else if (ch === '\n') { pushField(); pushRow() }
      else field += ch
    }
  }
  pushField()
  if (row.length) pushRow()
  return rows.filter(r => r.some(c => String(c).trim().length > 0))
}

