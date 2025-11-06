import { useEffect, useState } from "react";
import ReactECharts from 'echarts-for-react';
import KPIBoard from './features/kpi/KPIBoard';
import { fetchCsvText, computeDriverStacksFromText } from './features/viz/Sentiment';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Home, BarChart3, Sparkles, Upload, FileText } from 'lucide-react';

function Sidebar() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'datos', icon: FileText, label: 'Data' },
    { id: 'proyectos', icon: BarChart3, label: 'Proyectos' },
    { id: 'exportar', icon: Sparkles, label: 'Exportar' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6 z-50">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground caption">Mi</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.location.hash = item.id === 'home' ? '/' : `/${item.id}`;
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-sidebar-foreground hover:bg-muted/10'
              }`}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Header() {
  return (
    <div className="sticky top-0 bg-background border-b border-border z-40 px-12 py-6">
      <div className="flex items-center justify-between">
        <h2>Mi Dinero Crece</h2>

        <div className="flex gap-3">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            <span>Importar CSV/JSON</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            <span>CSAT_dataset.csv</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CSATBreakdown() {
  const data = [
    {
      label: 'Detractores',
      value: '59.8%',
      color: 'text-destructive',
      fontSize: 'xx-large',
      labelSize: 'large',
      borderBottom: '1px solid #d4d4d4',
    },
    { label: 'Neutros', 
      value: '23.3%', 
      color: 'text-muted',
      fontSize: 'xx-large',
      labelSize: 'large',
      borderBottom: '1px solid #d4d4d4',
    },
    {
      label: 'Promotores',
      value: '14%',
      color: 'text-success',
      fontSize: 'xx-large',
      labelSize: 'large',
      borderBottom: 'transparent',
    },
  ];

  return (
    <Card className="h-full csat-breakdown">
      <CardHeader>
        <CardTitle>Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between" style={{ borderBottom: item.borderBottom }}>
            <span style={{ fontSize: item.fontSize}}><b className={item.color}>{item.value}</b></span>
            <span style={{ fontSize: item.labelSize }}>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SentimentChart() {
  const [option, setOption] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const csvPath = '/uploads/csat_dataset_3.csv'
        const txt = await fetchCsvText(csvPath)
        const stacks = computeDriverStacksFromText(txt)

        const detrData = stacks.detractorPct.map((pct, i) => ({ value: pct, count: stacks.detractorAbs[i] }))
        const neutData = stacks.neutroPct.map((pct, i) => ({ value: pct, count: stacks.neutroAbs[i] }))
        const promData = stacks.promotorPct.map((pct, i) => ({ value: pct, count: stacks.promotorAbs[i] }))

        const opt = {
          color: ['#dc2626', '#9ca3af', '#16a34a'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params: any) => {
              const name = params[0]?.axisValueLabel || ''
              const lines = [`<div style="margin-bottom:4px;"><strong>${name}</strong></div>`]
              for (const p of params) {
                const cat = p.seriesName
                const pct = p.value
                const cnt = p.data?.count ?? 0
                lines.push(`${cat}: <strong>${pct}%</strong> — N: ${cnt}`)
              }
              return lines.join('<br/>');
            }
          },
          legend: { top: 8, left: 'center', data: ['Detractor', 'Neutro', 'Promotor'], itemWidth: 14, itemHeight: 10, icon: 'roundRect' },
          grid: { left: 16, right: 24, bottom: 16, top: 48, containLabel: true },
          xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { show: true } },
          yAxis: { type: 'category', data: stacks.labels, axisTick: { show: false }, axisLine: { show: false } },
          series: [
            { name: 'Detractor', type: 'bar', stack: 'total', barWidth: 26, label: { show: true, position: 'insideLeft', formatter: '{c}%' }, itemStyle: { borderRadius: [6,0,0,6] }, data: detrData },
            { name: 'Neutro', type: 'bar', stack: 'total', barWidth: 26, label: { show: true, position: 'inside', formatter: '{c}%' }, data: neutData },
            { name: 'Promotor', type: 'bar', stack: 'total', barWidth: 26, label: { show: true, position: 'insideRight', formatter: '{c}%' }, itemStyle: { borderRadius: [0,6,6,0] }, data: promData },
          ],
        }

        setOption(opt)
      } catch (err: any) {
        setError(err?.message || 'Error al cargar CSV')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Drivers</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[380px] w-full">
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!error && (loading ? <div className="text-sm opacity-70">Cargando…</div> : <ReactECharts option={option} style={{ height: 340, width: '100%' }} notMerge lazyUpdate />)}
      </CardContent>
    </Card>
  )
}

function TablePlaceholder() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">
          Espacio reservado para tabla/resumen
        </p>
      </CardContent>
    </Card>
  );
}

export default function App() {
  useEffect(() => {
    const boot = async () => {
      try {
        const hasBootstrap = localStorage.getItem('mdc_boot_3_5_0');
        if (!hasBootstrap) {
          // Preload sample assets so first-time navigation feels instant.
          // await fetch('./uploads/projects.json').catch(() => {});
          // await fetch('./uploads/csat_dataset.csv').catch(() => {});
          // localStorage.setItem('mdc_boot_3_5_0', '1');
        }
      } catch {
        // Ignore bootstrap errors; UI can still load without cached assets.
      }
    };

    boot();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-16">
        <Header />

        <main className="px-12 py-6 space-y-6">
          {/* KPI Cards */}
          <KPIBoard />

          {/* Chart and Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SentimentChart />
            </div>
            <div className="space-y-6 fit-content">
              <CSATBreakdown />
            </div>
          </div>

          {/* Table Placeholder */}
          <TablePlaceholder />
        </main>
      </div>
    </div>
  );
}
