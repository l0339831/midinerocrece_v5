// src/features/viz/SentimentModel_v1.ts
// Lote 10.0 — Modelo a partir de /uploads/sentiment.json
// Estructura esperada: Array<{ drivers: string; sentiments: 'detractor'|'neutro'|'promotor'; cantidad: number }>

export type SentimentKey = 'detractor' | 'neutro' | 'promotor'

export type SentimentJSONRow = {
  drivers: string
  sentiments: SentimentKey
  cantidad: number
}

export type Aggregated = {
  labels: string[]            // "Driver (n=total)"
  drivers: string[]           // nombre puro, sin (n=)
  totals: number[]
  detractorAbs: number[]
  neutroAbs: number[]
  promotorAbs: number[]
  detractorPct: number[]
  neutroPct: number[]
  promotorPct: number[]
}

export function aggregateFromJSON(rows: SentimentJSONRow[], sortByTotalDesc = true): Aggregated {
  const map = new Map<string, { detr: number; neut: number; prom: number; total: number }>()

  for (const r of rows || []) {
    if (!r) continue
    const driver = String(r.drivers ?? '').trim()
    const s = String(r.sentiments ?? '').toLowerCase() as SentimentKey
    const n = Number(r.cantidad ?? 0)
    if (!driver || !Number.isFinite(n)) continue

    if (!map.has(driver)) map.set(driver, { detr: 0, neut: 0, prom: 0, total: 0 })
    const acc = map.get(driver)!
    if (s === 'detractor') acc.detr += n
    else if (s === 'neutro') acc.neut += n
    else if (s === 'promotor') acc.prom += n
    acc.total += n
  }

  let entries = Array.from(map.entries()).map(([driver, c]) => ({
    driver,
    total: c.total,
    detrAbs: c.detr,
    neutAbs: c.neut,
    promAbs: c.prom,
  }))

  if (sortByTotalDesc) {
    entries.sort((a, b) => b.total - a.total)
  }

  const labels: string[] = []
  const drivers: string[] = []
  const totals: number[] = []
  const detractorAbs: number[] = []
  const neutroAbs: number[] = []
  const promotorAbs: number[] = []
  const detractorPct: number[] = []
  const neutroPct: number[] = []
  const promotorPct: number[] = []

  for (const e of entries) {
    const t = Math.max(1, e.total)
    labels.push(`${e.driver} (n=${e.total})`)
    drivers.push(e.driver)
    totals.push(e.total)
    detractorAbs.push(e.detrAbs)
    neutroAbs.push(e.neutAbs)
    promotorAbs.push(e.promAbs)
    detractorPct.push(Math.round((e.detrAbs / t) * 100))
    neutroPct.push(Math.round((e.neutAbs / t) * 100))
    // asegurar suma 100 con ajuste final
    const prom = 100 - detractorPct[detractorPct.length-1] - neutroPct[neutroPct.length-1]
    promotorPct.push(Math.max(0, prom))
  }

  return {
    labels, drivers, totals,
    detractorAbs, neutroAbs, promotorAbs,
    detractorPct, neutroPct, promotorPct,
  }
}