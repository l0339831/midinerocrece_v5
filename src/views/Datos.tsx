import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db, type Driver, type Project, type Status } from '@/db/storage';

type SortColumn = 'driver' | 'proyecto' | 'estado';

type DatosRow = {
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

const SAMPLE_ROWS: DatosRow[] = [
  {
    id: 'row-1',
    cliente: 'Renta Alta',
    comentario:
      'La app tarda demasiado en mostrar el histórico de rentabilidad y termina forzando a entrar en la web. Necesito descargar reportes largos con filtros por fecha.',
    driver: 'Blanqueo',
    dolor: 'No puedo descargar el histórico completo de rentabilidad ni reportes extendidos',
    recurrencia: 'Alta',
    criticidad: 'Media',
    prioridad: 'Media',
    proyecto: 'Overview SPA',
    estado: 'En Diseño',
  },
  {
    id: 'row-2',
    cliente: 'PYME MICRO',
    comentario:
      'Cuando cargamos archivos CSV con más de 500 filas el sistema se cuelga y hay que reiniciar toda la sesión. Esto afecta la conciliación mensual de múltiples países.',
    driver: 'Establidad',
    dolor: 'Imposible importar CSV largos sin reiniciar la sesión completa',
    recurrencia: 'Baja',
    criticidad: 'Alta',
    prioridad: 'Alta',
    proyecto: 'Overview SPA',
    estado: 'En Backlog',
  },
  {
    id: 'row-3',
    cliente: 'Renta Baja',
    comentario:
      'Los agentes no pueden reasignar casos cuando el workflow queda bloqueado por validaciones de datos replicados. Es un proceso ruidoso con reclamos internos.',
    driver: 'CVT MEP',
    dolor: 'No hay mecanismo de desbloqueo rápido cuando el workflow queda invalidado',
    recurrencia: 'Alta',
    criticidad: 'Media',
    prioridad: 'Media',
    proyecto: 'Overview SPA',
    estado: 'Se hizo EQC',
  },
];

const RECURRENCIA_OPTIONS = ['Alta', 'Media', 'Baja'] as const;
const CRITICIDAD_OPTIONS = ['Alta', 'Media', 'Baja'] as const;

type RentaBucket = 'ALTA' | 'MEDIA' | 'BAJA';

function getRentaBucketFromCliente(cliente: string): RentaBucket {
  const normalized = cliente.trim().toUpperCase();

  if (
    normalized === 'RENTA ALTA' ||
    normalized === 'PYME PES' ||
    normalized === 'AGRO GRANDES' ||
    normalized === 'EMPRESAS'
  ) {
    return 'ALTA';
  }

  if (
    normalized === 'RENTA MEDIA' ||
    normalized === 'PYME MICRO' ||
    normalized === 'AGRO PES'
  ) {
    return 'MEDIA';
  }

  return 'BAJA';
}

function computePrioridadFromClienteAndCriticidad(cliente: string, criticidad: string): 'Alta' | 'Media' | 'Baja' {
  const rentaBucket = getRentaBucketFromCliente(cliente);
  const critNorm = criticidad.trim().toLowerCase();

  switch (rentaBucket) {
    case 'ALTA':
      if (critNorm === 'alta') return 'Alta';
      if (critNorm === 'media') return 'Alta';
      if (critNorm === 'baja') return 'Media';
      break;
    case 'MEDIA':
      if (critNorm === 'alta') return 'Alta';
      if (critNorm === 'media') return 'Media';
      if (critNorm === 'baja') return 'Baja';
      break;
    case 'BAJA':
      if (critNorm === 'alta') return 'Media';
      if (critNorm === 'media') return 'Baja';
      if (critNorm === 'baja') return 'Baja';
      break;
  }

  return 'Media';
}

export default function Datos() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<DatosRow[]>(SAMPLE_ROWS);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ column: SortColumn; direction: 'asc' | 'desc' }>({
    column: 'driver',
    direction: 'asc',
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.drivers.toArray();
        setDrivers(list);
      } catch (error) {
        console.error('[Datos] no se pudieron cargar drivers', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.projects.toArray();
        setProjects(list);
      } catch (error) {
        console.error('[Datos] no se pudieron cargar proyectos', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.statuses.toArray();
        setStatuses(list);
      } catch (error) {
        console.error('[Datos] no se pudieron cargar estados', error);
      }
    })();
  }, []);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.cliente,
        row.comentario,
        row.driver,
        row.dolor,
        row.recurrencia,
        row.criticidad,
        row.prioridad,
        row.proyecto,
        row.estado,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, rows]);

  const visibleRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aValue = a[sort.column].toLowerCase();
      const bValue = b[sort.column].toLowerCase();
      if (aValue === bValue) return 0;
      const comparison = aValue.localeCompare(bValue, 'es', { sensitivity: 'base' });
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredRows, sort]);

  const allSelected = visibleRows.length > 0 && visibleRows.every((row) => selected[row.id]);
  const partiallySelected = visibleRows.some((row) => selected[row.id]) && !allSelected;

  const toggleRow = (rowId: string, next: boolean) => {
    setSelected((prev) => ({ ...prev, [rowId]: next }));
  };

  const toggleAll = (next: boolean) => {
    setSelected((prev) => {
      if (!next) {
        const clone = { ...prev };
        visibleRows.forEach((row) => {
          delete clone[row.id];
        });
        return clone;
      }
      const merged = { ...prev };
      visibleRows.forEach((row) => {
        merged[row.id] = true;
      });
      return merged;
    });
  };

  const toggleSort = (column: SortColumn) => {
    setSort((prev) => {
      if (prev.column !== column) {
        return { column, direction: 'asc' };
      }
      return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const renderSortIndicator = (column: SortColumn) => {
    if (sort.column !== column) return '↕';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const handleChangeDriver = (rowId: string, newDriverName: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, driver: newDriverName } : row))
    );
  };

  const handleChangeRecurrencia = (rowId: string, newRecurrencia: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, recurrencia: newRecurrencia } : row))
    );
  };

  const handleChangeCriticidad = (rowId: string, newCriticidad: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nuevaPrioridad = computePrioridadFromClienteAndCriticidad(row.cliente, newCriticidad);
        return {
          ...row,
          criticidad: newCriticidad,
          prioridad: nuevaPrioridad,
        };
      })
    );
  };

  const handleChangeProyecto = (rowId: string, newProyecto: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, proyecto: newProyecto } : row))
    );
  };

  const handleChangeEstado = (rowId: string, newEstado: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, estado: newEstado } : row))
    );
  };

  return (
    <section id='diagnotisco' className="space-y-4 py-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between">
        <span className="text-lg font-semibold">Filtrar en la tabla</span>
    
          <Input
            value={query}
            id="searchbarDatos"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar..."
            className="w-full" 
          />
      
        <p className="text-sm text-muted">
          <small>Mostrando {filteredRows.length} de {rows.length} filas</small>
        </p>
      </div>

      <Table className="min-w-[960px]">
        <TableCaption>Vista previa de dataset activo (10 columnas)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={`w-12`}>
              <Checkbox
                aria-label="Seleccionar todas las filas"
                checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
                onCheckedChange={(value) => toggleAll(value === true)}
              />
            </TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}><b className='px-3 text-medium'>Cliente</b></TableHead>
            <TableHead className={`min-w-[320px] whitespace-normal break-words`}><b className='text-medium'>Comentario</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}>
              <button
                type="button"
                onClick={() => toggleSort('driver')}
                className="gap-1 px-3"
              >
                <b className='text-medium'>Driver</b>
                <span aria-hidden="true" className="text-xs px-2">
                  {renderSortIndicator('driver')}
                </span>
              </button>
            </TableHead>
            <TableHead className={`min-w-[320px] whitespace-normal break-words text-destructive`}><b className='text-medium'>Dolor</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Recurrencia</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Criticidad</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Prioridad</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}>
              <button
                type="button"
                onClick={() => toggleSort('proyecto')}
                className="gap-1 px-3"
              >
                <b className='text-medium'>Proyecto</b>
                <span aria-hidden="true" className="text-xs px-2">
                  {renderSortIndicator('proyecto')}
                </span>
              </button>
            </TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}>
              <button
                type="button"
                onClick={() => toggleSort('estado')}
                className="gap-1 px-3"
              >
                <b className='text-medium'>Estado</b>
                <span aria-hidden="true" className="text-xs px-2">
                  {renderSortIndicator('estado')}
                </span>
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-destructive text-center">
                No se encontraron filas que coincidan con “{query.trim()}”.
              </TableCell>
            </TableRow>
          )}
          {visibleRows.map((row) => (
            <TableRow key={row.id} data-state={selected[row.id] ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  aria-label={`Seleccionar fila ${row.id}`}
                  checked={!!selected[row.id]}
                  onCheckedChange={(value) => toggleRow(row.id, Boolean(value))}
                />
              </TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">{row.cliente}</TableCell>
              <TableCell className="min-w-[320px] whitespace-normal break-words px-cell">{row.comentario}</TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                <Select
                  value={row.driver || ''}
                  onValueChange={(value) => handleChangeDriver(row.id, value)}
                  disabled={drivers.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        drivers.length === 0
                          ? 'Configurar drivers en la otra pestaña'
                          : 'Sin completar'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id ?? driver.name} value={driver.name}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="min-w-[320px] whitespace-normal break-words px-cell text-destructive">{row.dolor}</TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                <Select
                  value={row.recurrencia || ''}
                  onValueChange={(value) => handleChangeRecurrencia(row.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCIA_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                <Select
                  value={row.criticidad || ''}
                  onValueChange={(value) => handleChangeCriticidad(row.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRITICIDAD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell text-medium"><b>{row.prioridad}</b></TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                <Select
                  value={row.proyecto || ''}
                  onValueChange={(value) => handleChangeProyecto(row.id, value)}
                  disabled={projects.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        projects.length === 0 ? 'Configurar proyectos en la otra pestaña' : 'Sin completar'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id ?? project.name} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                <Select
                  value={row.estado || ''}
                  onValueChange={(value) => handleChangeEstado(row.id, value)}
                  disabled={statuses.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        statuses.length === 0 ? 'Configurar estados en la otra pestaña' : 'Sin completar'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id ?? status.name} value={status.name}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
