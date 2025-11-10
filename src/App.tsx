import { useEffect, useState } from "react";
import KPIBoard from './features/kpi/KPIBoard';

import SentimentChart_v093 from '@/features/viz/SentimentChart';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Home, BarChart3, Sparkles, Upload, FileText, type LucideIcon } from 'lucide-react';
import Datos from './views/Datos';

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
        <p className="text-xs text-muted">CSAT Inversiones</p>
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

function CSATStackedBar() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>CSAT Stacked Bar</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-24">
        <p className="text-muted">
          Espacio reservado para comparar ambos CSATs
        </p>
      </CardContent>
    </Card>
  );
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

        <main className="px-12 py-6 space-y-6">
          {view === 'home' && (
            <>
              <KPIBoard />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SentimentChart_v093 />
                </div>
                <div className="space-y-6 fit-content">
                  <CSATStackedBar />
                  <CSATBreakdown />
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
