import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TeamProjectsData = {
  name: string;
  count: number;
  criticidad: number;
};

export type DesignCollabRadarProps = {
  data: TeamProjectsData[];
  title?: string;
  className?: string;
};

export default function DesignCollabRadar({ data, className }: DesignCollabRadarProps) {
  if (!data.length) {
    return (
      <div className={className}>
        <p className="text-sm text-muted">
          No hay datos de proyectos para mostrar el radar.
        </p>
      </div>
    );
  }

  const maxCount = data.reduce((max, item) => Math.max(max, item.count), 0);
  const maxCrit = data.reduce((max, item) => Math.max(max, item.criticidad), 0);
  const radarMax = Math.max(5, maxCount + 1, maxCrit);

  const indicators = data.map((item) => ({
    name: item.name,
    max: radarMax,
  }));

  const projectValues = data.map((item) => item.count);
  const criticidadValues = data.map((item) => item.criticidad);

  const option = {
    title: {
      text: '',
      left: 'center',
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: true,
      bottom: 0,
      data: ['Total proyectos', 'Criticidad en el negocio'],
    },
    radar: {
      shape: 'circle',
      indicator: indicators,
      splitNumber: 5,
    },
    color: ['#426049','#FF671F'],
    series: [
      {
        name: '',
        type: 'radar',
        data: [
          {
            value: projectValues,
            name: 'Total proyectos',
          },
          {
            value: criticidadValues,
            name: 'Criticidad en el negocio',
          },
        ],
        lineStyle: {
          width: 3,
        },
        symbol: 'circle',
        symbolSize: 4,
      },
    ],
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Impacto en la Tribu</CardTitle>
        <p className="text-xs text-muted">¿En dónde está la criticidad de los proyectos?</p>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[420px] w-full">
      <ReactECharts option={option} style={{ width: '100%', height: '400px' }} />
      </CardContent>
    </Card>
  );
}
