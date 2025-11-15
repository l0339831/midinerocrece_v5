import { create } from 'zustand';

export type SortColumn = 'driver' | 'proyecto' | 'estado';

export type DatosRow = {
  id: string;
  cliente: string;
  comentario: string;
  driver: string;
  dolor: string;
  recurrencia: string;
  criticidad: string;
  prioridad: string;
  proyecto: string;
  estado: string;
};

export const SAMPLE_ROWS: DatosRow[] = [
  {
    id: 'row-1',
    cliente: 'Renta Media',
    comentario:
      'La app tarda demasiado en mostrar el histórico de rentabilidad y termina forzando a entrar en la web. Necesito descargar reportes largos con filtros por fecha.',
    driver: 'Experiencia App inversiones',
    dolor: 'No puedo descargar el histórico completo de rentabilidad ni reportes extendidos',
    recurrencia: 'Alta',
    criticidad: 'Media',
    prioridad: 'Media',
    proyecto: 'Análisis App inversiones',
    estado: 'En desarrollo',
  },
  {
    id: 'row-2',
    cliente: 'Renta Alta',
    comentario:
      'Cuando cargamos archivos CSV con más de 500 filas el sistema se cuelga y hay que reiniciar toda la sesión. Esto afecta la conciliación mensual de múltiples países.',
    driver: 'Carga de archivos masivos',
    dolor: 'Imposible importar CSV largos sin reiniciar la sesión completa',
    recurrencia: 'Baja',
    criticidad: 'Alta',
    prioridad: 'Alta',
    proyecto: 'Carga CSV regional',
    estado: 'En Backlog de tribu',
  },
  {
    id: 'row-3',
    cliente: 'Renta Baja',
    comentario:
      'Los agentes no pueden reasignar casos cuando el workflow queda bloqueado por validaciones de datos replicados. Es un proceso ruidoso con reclamos internos.',
    driver: 'Workflow CX',
    dolor: 'No hay mecanismo de desbloqueo rápido cuando el workflow queda invalidado',
    recurrencia: 'Alta',
    criticidad: 'Media',
    prioridad: 'Media',
    proyecto: 'Desbloqueo workflow CX',
    estado: 'Se hizo EQC',
  },
];

type DiagnosticoState = {
  rows: DatosRow[];
  setRows: (updater: (prev: DatosRow[]) => DatosRow[]) => void;
};

export const useDiagnosticoStore = create<DiagnosticoState>((set) => ({
  rows: SAMPLE_ROWS,
  setRows: (updater) =>
    set((state) => ({
      rows: updater(state.rows),
    })),
}));
