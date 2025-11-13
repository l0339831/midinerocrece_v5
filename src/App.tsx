import { useEffect, useState } from "react";
import KPIBoard from './features/kpi/KPIBoard';
import ReactECharts from 'echarts-for-react';
import SentimentChart_v093 from '@/features/viz/SentimentChart';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Home, BarChart3, Sparkles, Upload, FileText, type LucideIcon } from 'lucide-react';
import Datos from "./views/Datos";

type ViewKey = 'home' | 'datos' | 'proyectos' | 'exportar';

const allowedViews: ViewKey[] = ['home', 'datos', 'proyectos', 'exportar'];

function getViewFromHash(): ViewKey {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw) return 'home';
  return allowedViews.includes(raw as ViewKey) ? (raw as ViewKey) : 'home';
}

function Sidebar({ current, onChange }: { current: ViewKey; onChange: (v: ViewKey) => void }) {
  const navItems: Array<{ id: ViewKey; icon: LucideIcon; label: string }> = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'datos', icon: FileText, label: 'Diagóstico' },
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
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onChange(item.id);
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

type SentimentAverage = { detractor: number; neutro: number; promotor: number }
const defaultSentimentAverage: SentimentAverage = { detractor: 0, neutro: 0, promotor: 0 }

function CSATBreakdown() {
  const [averages, setAverages] = useState<SentimentAverage>(defaultSentimentAverage)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('mdc_sentiment_avg')
      if (!raw) return
      const parsed = JSON.parse(raw) ?? {}
      setAverages({
        detractor: Number(parsed.detractor) || 0,
        neutro: Number(parsed.neutro) || 0,
        promotor: Number(parsed.promotor) || 0,
      })
    } catch (err) {
      console.warn('[CSATBreakdown] no se pudo leer mdc_sentiment_avg', err)
    }
  }, [])

  const formatValue = (value: number) => `${value.toFixed(1)}%`

  const data = [
    {
      label: 'Detractores',
      value: formatValue(averages.detractor),
      color: 'text-destructive',
      fontSize: 'xx-large',
      labelSize: 'large',
      borderBottom: '1px solid #d4d4d4',
    },
    {
      label: 'Neutros',
      value: formatValue(averages.neutro),
      color: 'text-warning',
      fontSize: 'xx-large',
      labelSize: 'large',
      borderBottom: '1px solid #d4d4d4',
    },
    {
      label: 'Promotores',
      value: formatValue(averages.promotor),
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
        <p className="text-xs text-muted">CSAT Inversiones (comentarios)</p>
        <br />
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

type CSATOFBRow = {
  period: string;
  csat: number;
  responses: number;
}

function CSATStackedBar() {
  const [option, setOption] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `src/data/csat_ofb_2025.json?bust=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
        const rows = (await res.json()) as Array<Record<string, string>>;
        const normalized: CSATOFBRow[] = rows.map((row) => ({
          period: String(row['Metadatos de la encuesta - Fecha registrada'] ?? '').trim(),
          csat: parseFloat(String(row['CSAT'] ?? '0').replace('%', '')) || 0,
          responses: Number(String(row['Number of responses (CSAT)'] ?? '0').replace(/,/g, '')) || 0,
        })).filter((row) => !!row.period);
        if (!normalized.length) throw new Error('Dataset csat_ofb_2025 vacío');
        const labels = normalized.map((row) => row.period);
        const csatSeries = normalized.map((row) => Number(row.csat.toFixed(1)));
        const maxResponses = Math.max(...normalized.map((row) => row.responses), 1);
        const responsesScaled = normalized.map((row) => Number(((row.responses / maxResponses) * 100).toFixed(1)));
        const rawResponses = normalized.map((row) => row.responses);
        setOption({
          color: ['#fa530bff', '#fec691ff'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params: any[]) => {
              if (!params?.length) return '';
              const idx = params[0].dataIndex;
              const parts = [`<strong>${labels[idx]}</strong>`];
              params.forEach((p) => {
                if (p.seriesName === 'CSAT') {
                  parts.push(`${p.marker} ${p.seriesName}: ${csatSeries[idx]}%`);
                } else {
                  const responsesFmt = rawResponses[idx].toLocaleString('es-AR');
                  parts.push(`${p.marker} ${p.seriesName}: ${responsesFmt} resp.`);
                }
              });
              return parts.join('<br/>');
            },
          },
          legend: { data: ['CSAT', 'Rtas.'] },
          grid: { left: 48, right: 24, top: 40, bottom: 40 },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: labels,
            axisLabel: { rotate: 0 },
          },
          yAxis: {
            type: 'value',
            axisLabel: { formatter: '{value}%' },
            min: 0,
            max: (value: { max: number }) => Math.min(120, Math.ceil(value.max / 10) * 10),
          },
          series: [
            {
              name: 'CSAT',
              type: 'line',
              stack: 'total',
              smooth: true,
              symbolSize: 5,
              areaStyle: { opacity: 0.35 },
              emphasis: { focus: 'series' },
              data: csatSeries,
            },
            {
              name: 'Rtas.',
              type: 'line',
              stack: 'total',
              smooth: true,
              symbolSize: 2,
              areaStyle: { opacity: 0.2 },
              emphasis: { focus: 'series' },
              data: responsesScaled,
            },
          ],
        });
        setError(null);
      } catch (err: any) {
        console.error('[CSATStackedBar] error', err);
        setError(err?.message || 'Error al cargar csat_ofb_2025.json');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>CSAT Canal</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-4">
        {loading && <div className="text-sm opacity-70">Cargando…</div>}
        {!loading && error && <div className="text-sm text-destructive whitespace-pre-wrap">{error}</div>}
        {!loading && !error && option && (
          <ReactECharts option={option} style={{ height: 280, width: '100%' }} notMerge lazyUpdate />
        )}
      </CardContent>
    </Card>
  );
}

function TablePlaceholder() {
  return (
    <Card>
      <CardContent>
    <Datos />
      </CardContent>
    </Card>
  );
}

function ViewPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm opacity-80">{description}</p>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<ViewKey>(() => getViewFromHash());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => setView(getViewFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const handleViewChange = (next: ViewKey) => {
    setView(next);
    if (typeof window !== 'undefined') {
      window.location.hash = next === 'home' ? '/' : `/${next}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar current={view} onChange={handleViewChange} />

      <div className="ml-16">
        <Header />

        <main className="px-6 py-6 space-y-6">
          {view === 'home' && (
            <>
              <KPIBoard />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 fit-content">
                  <SentimentChart_v093 />
                </div>
                <div className="space-y-6 fit-content">
                  <CSATBreakdown />
                  <CSATStackedBar />
                </div>
              </div>
              
            </>
          )}
          {view === 'datos' && (
            <>
            <TablePlaceholder />
            </>
          )}
          {view === 'proyectos' && (
            <ViewPlaceholder title="Proyectos" description="Esta vista listará y administrará proyectos." />
          )}
          {view === 'exportar' && (
            <ViewPlaceholder title="Exportar" description="Esta vista contendrá flujos y reportes de exportación." />
          )}
        </main>
      </div>
    </div>
  );
}
