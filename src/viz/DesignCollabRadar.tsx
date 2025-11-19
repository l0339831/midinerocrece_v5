import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TeamProjectsData = {
  name: string;
  count: number;
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
  const radarMax = Math.max(5, maxCount + 1);

  const indicators = data.map((item) => ({
    name: item.name,
    max: radarMax,
  }));

  const values = data.map((item) => item.count);

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
      show: false,
    },
    radar: {
      indicator: indicators,
      splitNumber: 5,
    },
    series: [
      {
        name: 'Proyectos',
        type: 'radar',
        data: [
          {
            value: values,
            name: 'Proyectos',
          },
        ],
        areaStyle: {
          opacity: 0.2,
        },
        lineStyle: {
          width: 2,
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
        <p className="text-xs text-muted badge">Proyectos</p>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[420px] w-full">
      <ReactECharts option={option} style={{ width: '100%', height: '350px' }} />
      </CardContent>
    </Card>
  );
}
