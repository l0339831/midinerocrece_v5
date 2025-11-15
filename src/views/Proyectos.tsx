import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDiagnosticoStore } from '@/features/datos/diagnosticoStore';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

const FALLBACK = 'Sin completar';

const levelPalette = [
  { depth: 0, color: '#fbb4ae' },
  { depth: 1, color: '#b3cde3' },
  { depth: 2, color: '#ccebc5' },
  { depth: 3, color: '#decbe4' },
];

function normalize(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim();
  return trimmed ? trimmed : FALLBACK;
}

export default function Proyectos() {
  const rows = useDiagnosticoStore((state) => state.rows);

  const { nodes, links } = useMemo(() => {
    const nodeSet = new Set<string>();
    const linkMap = new Map<string, number>();

    rows.forEach((row) => {
      const driver = normalize(row.driver);
      const prioridad = normalize(row.prioridad);
      const proyecto = normalize(row.proyecto);
      const estado = normalize(row.estado);

      const steps: [string, number][] = [
        [driver, 0],
        [prioridad, 1],
        [proyecto, 2],
        [estado, 3],
      ];

      steps.forEach(([name]) => nodeSet.add(name));

      const pairs: [string, string][] = [
        [driver, prioridad],
        [prioridad, proyecto],
        [proyecto, estado],
      ];

      pairs.forEach(([source, target]) => {
        const key = `${source}|${target}`;
        linkMap.set(key, (linkMap.get(key) ?? 0) + 1);
      });
    });

    const nodes = Array.from(nodeSet).map((name) => ({ name }));
    const links = Array.from(linkMap.entries()).map(([key, value]) => {
      const [source, target] = key.split('|');
      return { source, target, value };
    });

    return { nodes, links };
  }, [rows]);

  const levels = levelPalette.map((level) => ({
    depth: level.depth,
    itemStyle: { color: level.color },
    lineStyle: { color: 'source', opacity: 0.6 },
  }));

  const option = useMemo(
    () => ({
      title: {
        text: '',
        left: 'center',
        top: 20,
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links,
          emphasis: {
            focus: 'adjacency',
          },
          lineStyle: {
            curveness: 0.8,
          },
          levels,
        },
      ],
    }),
    [nodes, links, levels]
  );

  return (
    <div className="grid grid-cols-1 gap-6 p-4 h-full">
      <Card className="col-span-1 lg:col-span-3 p-4 h-full overflow-hidden">
        <CardHeader className="border-b mb-4">
          <h2>Proyectos</h2>
          <CardDescription className="text-muted">
          Diagrama del flujo de proyectos del Q.
        </CardDescription>
        </CardHeader>
        
        <CardContent className="h-full p-6">
          <div className="mt-4 flex-1 min-h-[500px]">
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            </div>  
          
        </CardContent>  
      </Card>
    </div>
  );
}
