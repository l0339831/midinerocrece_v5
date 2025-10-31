import { useState } from 'react';
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
        <h2>Mi Dinero Crece v4.0</h2>

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

function KPICard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}) {
  const getTrendColor = () => {
    if (trend === 'positive') return 'text-primary';
    if (trend === 'negative') return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <Card className="hover:shadow-elevation-sm transition-shadow">
      <CardContent className="p-6">
        <p>{title}</p>
        <p className={`text-5xl mb-1 ${getTrendColor()}`}>{value}</p>
        {subtitle && <p className="caption text-muted">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function CSATBreakdown() {
  const data = [
    {
      label: 'Detractores',
      value: '59.8%',
      color: 'text-destructive',
    },
    { label: 'Neutros', value: '23.3%', color: 'text-primary' },
    {
      label: 'Promotores',
      value: '14%',
      color: 'text-light-green',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>CSAT Canal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span>{item.label}</span>
            <span className={item.color}>{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SentimentChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Drivers — Distribución por sentimiento</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[380px]">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
          <p className="text-muted">Gráfico de distribución por sentimiento</p>
        </div>
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

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-16">
        <Header />

        <main className="px-12 py-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="CSAT Canal" value="-18%" trend="negative" />
            <KPICard
              title="CSAT Inversiones"
              value="5%"
              subtitle="vs Q3 · -2pp · n=100"
              trend="positive"
            />
            <KPICard title="Comentarios" value="87" trend="neutral" />
            <KPICard title="Proyectos" value="12" trend="neutral" />
          </div>

          {/* Chart and Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SentimentChart />
            </div>
            <div className="space-y-6">
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
