// Lote 10.0 — Chart apilado horizontal a partir de /uploads/sentiment.json
import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SentimentJSONRow } from '@/features/viz/SentimentModel'
import { aggregateFromJSON } from '@/features/viz/SentimentModel'

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

        const leftPx = Math.max(220, Math.min(480, Math.round(Math.max(...agg.labels.map(s => s.length)) * 7)))
        const detrData = agg.detractorPct.map((pct, i) => ({ value: pct, count: agg.detractorAbs[i] }))
        const neutData = agg.neutroPct.map((pct, i) => ({ value: pct, count: agg.neutroAbs[i] }))
        const promData = agg.promotorPct.map((pct, i) => ({ value: pct, count: agg.promotorAbs[i] }))

        setError(null)
        setOption({
          color: ['#dc2626', '#f9cd0cff', '#16a34a'],
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
            type: 'category', data: agg.labels, axisTick: { show: false }, axisLine: { show: false },
            axisLabel: { width: leftPx - 24, overflow: 'truncate', interval: 0 },
          },
          series: [
            { name: 'Detractor', type: 'bar', stack: 'sentiments', barWidth: 14,
              labelLayout: { hideOverlap: true },
              label: { show: true, position: 'insideLeft', formatter: (p:any) => (p.value >= 8 ? `${p.value}%` : '') },
              itemStyle: {}, data: detrData },
            { name: 'Neutro', type: 'bar', stack: 'sentiments', barWidth: 14,
              labelLayout: { hideOverlap: true },
              label: { show: true, position: 'inside', formatter: (p:any) => (p.value >= 8 ? `${p.value}%` : '') },
              data: neutData },
            { name: 'Promotor', type: 'bar', stack: 'sentiments', barWidth: 14,
              labelLayout: { hideOverlap: true },
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
      <CardHeader><CardTitle>CSAT Inversiones Drivers</CardTitle></CardHeader>
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