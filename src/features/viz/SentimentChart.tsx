// Lote 10.0 — Chart apilado horizontal a partir de /uploads/sentiment.json
import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SentimentJSONRow, SentimentKey } from '@/features/viz/SentimentModel'
import { aggregateFromJSON } from '@/features/viz/SentimentModel'

function computeAverageBySentiment(rows: SentimentJSONRow[]): Record<SentimentKey, number> {
  const stats: Record<SentimentKey, { sum: number; count: number }> = {
    detractor: { sum: 0, count: 0 },
    neutro: { sum: 0, count: 0 },
    promotor: { sum: 0, count: 0 },
  }

  for (const row of rows || []) {
    const key = String(row?.sentiments ?? '').toLowerCase() as SentimentKey
    const value = Number(row?.cantidad ?? 0)
    if (!stats[key] || !Number.isFinite(value)) continue
    stats[key].sum += value
    stats[key].count += 1
  }

  return {
    detractor: stats.detractor.count ? stats.detractor.sum / stats.detractor.count : 0,
    neutro: stats.neutro.count ? stats.neutro.sum / stats.neutro.count : 0,
    promotor: stats.promotor.count ? stats.promotor.sum / stats.promotor.count : 0,
  }
}

export default function SentimentChart_v095() {
  const [option, setOption] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const url = `src/data/sentiment.json?bust=${Date.now()}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`)
        const json = (await res.json()) as SentimentJSONRow[]
        const agg = aggregateFromJSON(json, true)

        if (!agg.labels.length) throw new Error('Dataset vacío o sin drivers')

        const avgBySentiment = computeAverageBySentiment(json)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('mdc_sentiment_avg', JSON.stringify(avgBySentiment))
          } catch (storageErr) {
            console.warn('[SentimentChart_v095] no se pudo guardar mdc_sentiment_avg', storageErr)
          }
        }

        const detrData = agg.detractorPct.map((pct, i) => ({ value: pct, count: agg.detractorAbs[i] }))
        const neutData = agg.neutroPct.map((pct, i) => ({ value: pct, count: agg.neutroAbs[i] }))
        const promData = agg.promotorPct.map((pct, i) => ({ value: pct, count: agg.promotorAbs[i] }))

        setError(null)
        setOption({
          color: ['#c51111', '#f59e0b', '#16a34a'],
          legend: { data: ['Detractor', 'Neutro', 'Promotor'] },
          grid: { containLabel: true },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          xAxis: { 
            type: 'value', 
            max: 100, 
            axisLabel: { formatter: '{value}%' }, 
            splitLine: { show: true } 
          },
          yAxis: { 
            type: 'category', data: agg.labels, axisTick: { show: false }, axisLine: { show: false }
          },
          series: [
            { name: 'Detractor', type: 'bar', stack: 'sentiments', 
              labelLayout: { hideOverlap: true },
              emphasis: { focus: 'series' },
              label: { show: true, position: 'insideLeft', formatter: (p:any) => (p.value >= 8 ? `${p.value}%` : '') },
              itemStyle: {}, data: detrData },
            { name: 'Neutro', type: 'bar', stack: 'sentiments',
              labelLayout: { hideOverlap: true },
              emphasis: { focus: 'series' },
              label: { show: true, position: 'inside', formatter: (p:any) => (p.value >= 8 ? `${p.value}%` : '') },
              data: neutData },
            { name: 'Promotor', type: 'bar', stack: 'sentiments',
              labelLayout: { hideOverlap: true },
              emphasis: { focus: 'series' },
              label: { show: true, position: 'insideRight', formatter: (p:any) => (p.value >= 8 ? `${p.value}%` : '') },
              itemStyle: {}, data: promData },
          ],
        })
      } catch (e:any) {
        console.error('[SentimentChart_v095] error', e)
        setError(e?.message || 'Error al cargar sentiment.json')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Drivers principales</CardTitle>
        <p className="text-xs text-muted badge">CSAT Inversiones</p>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[420px] w-full">
        {loading && <div className="text-sm opacity-70">Cargando…</div>}
        {!loading && error && <div className="text-sm text-destructive whitespace-pre-wrap">{error}</div>}
        {!loading && !error && option && (
          <ReactECharts option={option} style={{ height: 380, width: '100%' }} notMerge lazyUpdate />
        )}
      </CardContent>
    </Card>
  )
}
