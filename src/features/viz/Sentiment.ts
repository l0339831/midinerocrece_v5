
import { parseCSVMatrix } from '@/utils/csv'

export type Sentiment = 'Detractor' | 'Neutro' | 'Promotor'

export type DriverStacks = {
  labels: string[]
  detractorPct: number[]
  neutroPct: number[]
  promotorPct: number[]
  totals: number[]
  detractorAbs: number[]
  neutroAbs: number[]
  promotorAbs: number[]
}

export async function fetchCsvText(path: string): Promise<string> {
  const res = await fetch(path)
  if (!res.ok) {
    return Promise.reject(new Error(`CSV fetch failed: ${res.status}`)).then(() => '')
  }
  return await res.text()
}

export function scoreToSentiment(score: number): Sentiment {
  if (score <= 3) return 'Detractor'
  if (score === 4) return 'Neutro'
  return 'Promotor'
}

function roundRowTo100(a: number, b: number, c: number): [number, number, number] {
  const rA = Math.floor(a), rB = Math.floor(b), rC = Math.floor(c)
  let sum = rA + rB + rC
  const res = [rA, rB, rC]
  const diffs = [
    { idx: 0, frac: a - rA },
    { idx: 1, frac: b - rB },
    { idx: 2, frac: c - rC },
  ].sort((u, v) => v.frac - u.frac)
  let i = 0
  while (sum < 100 && i < 3) { res[diffs[i].idx]++; sum++; i++ }
  return [res[0], res[1], res[2]]
}

function cleanDriverName(name: string): string | null {
  const s = (name ?? '').trim().replace(/^"(.*)"$/, '$1')
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower.includes('http') || lower.includes('@import') || lower.includes('display=swap')) return null
  if (!/[a-záéíóúñ]/i.test(s)) return null
  return s.length > 48 ? s.slice(0, 48) : s
}

export function computeDriverStacksFromText(csvText: string) {
  const rows = parseCSVMatrix(csvText)
  return computeDriverStacks(rows)
}

export function computeDriverStacks(rows: string[][]) {
  if (!rows.length) {
    return { labels: [], detractorPct: [], neutroPct: [], promotorPct: [], totals: [], detractorAbs: [], neutroAbs: [], promotorAbs: [] }
  }
  const data = rows.slice(1)
  const IDX_SCORE = 1
  const DRIVER_IDXS = [2, 3, 4]

  const acc: Record<string, { detr: number; neut: number; prom: number; total: number }> = {}

  for (const row of data) {
    const raw = row[IDX_SCORE]
    if (!raw) continue
    const score = Number(String(raw).replace(',', '.'))
    if (!Number.isFinite(score)) continue
    const s = score <= 3 ? 'Detractor' : (score === 4 ? 'Neutro' : 'Promotor')

    for (const di of DRIVER_IDXS) {
      const name = cleanDriverName(row[di] ?? '')
      if (!name) continue
      if (!acc[name]) acc[name] = { detr: 0, neut: 0, prom: 0, total: 0 }
      acc[name].total += 1
      if (s === 'Detractor') acc[name].detr += 1
      else if (s === 'Neutro') acc[name].neut += 1
      else acc[name].prom += 1
    }
  }

  const entries = Object.entries(acc).map(([label, c]) => {
    const t = Math.max(1, c.total)
    const pA = (c.detr / t) * 100
    const pB = (c.neut / t) * 100
    const pC = (c.prom / t) * 100
    const [ra, rb, rc] = roundRowTo100(pA, pB, pC)
    return { label, total: c.total, detrAbs: c.detr, neutAbs: c.neut, promAbs: c.prom, detrPct: ra, neutPct: rb, promPct: rc }
  })

  entries.sort((u, v) => v.detrPct - u.detrPct)

  return {
    labels: entries.map(e => `${e.label} (n=${e.total})`),
    detractorPct: entries.map(e => e.detrPct),
    neutroPct: entries.map(e => e.neutPct),
    promotorPct: entries.map(e => e.promPct),
    totals: entries.map(e => e.total),
    detractorAbs: entries.map(e => e.detrAbs),
    neutroAbs: entries.map(e => e.neutAbs),
    promotorAbs: entries.map(e => e.promAbs),
  }
}
