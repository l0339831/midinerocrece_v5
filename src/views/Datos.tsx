import { Fragment, useEffect, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db, type Driver, type Project, type Status, type Product } from '@/db/storage';
import { useDiagnosticoStore, type SortColumn } from '@/features/datos/diagnosticoStore';

const CLIENTE_OPTIONS = [
  'Renta Alta',
  'Renta Media',
  'Renta Baja',
  'PYME PES',
  'PYME MICRO',
  'AGRO PES',
  'AGRO GRANDES',
  'EMPRESAS',
] as const;
const RECURRENCIA_OPTIONS = ['Alta', 'Media', 'Baja', 'Desconocida'] as const;
const CRITICIDAD_OPTIONS = ['Alta', 'Media', 'Baja'] as const;
const CANAL_OPTIONS = ['ONB', 'OFB', 'App', 'App Mayo'] as const;
const SQUAD_OPTIONS = ['Custodia', 'Cambios y GSEC ', 'FIMA', 'Títulos', 'Dinero'] as const;
const BASE_FUENTES = [
  'Entrevistas 1:1',
  'Encuestas',
  'Analytics',
  'Hotjar',
  'Feedback interno',
  'Workshop',
] as const;

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
  const rows = useDiagnosticoStore((state) => state.rows);
  const setRows = useDiagnosticoStore((state) => state.setRows);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ column: SortColumn; direction: 'asc' | 'desc' }>({
    column: 'driver',
    direction: 'asc',
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    (async () => {
      try {
        const list = await db.products.toArray();
        setProducts(list);
      } catch (error) {
        console.error('[Datos] no se pudieron cargar productos', error);
      }
    })();
  }, []);

  const fuenteOptions = useMemo(() => {
    const set = new Set<string>();
    BASE_FUENTES.forEach((item) => set.add(item));
    rows.forEach((row) => {
      const val = row.fuente?.trim();
      if (val) set.add(val);
    });
    return Array.from(set);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.cliente,
        row.producto,
        row.canal,
        row.squad,
        row.comentario,
        row.fuente,
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

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
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

  const handleChangeCliente = (rowId: string, newCliente: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nuevaPrioridad = computePrioridadFromClienteAndCriticidad(newCliente, row.criticidad ?? '');
        return {
          ...row,
          cliente: newCliente,
          prioridad: nuevaPrioridad,
        };
      })
    );
  };

  const handleChangeProducto = (rowId: string, newProducto: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, producto: newProducto } : row))
    );
  };

  const handleChangeSquad = (rowId: string, newSquad: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, squad: newSquad } : row))
    );
  };

  const handleChangeCanal = (rowId: string, newCanal: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, canal: newCanal } : row))
    );
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

  const handleChangeFuente = (rowId: string, newFuente: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, fuente: newFuente } : row))
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

      <datalist id="cliente-options">
        {CLIENTE_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <datalist id="canal-options">
        {CANAL_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <datalist id="squad-options">
        {SQUAD_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <datalist id="fuente-options">
        {fuenteOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <div className="table-cnt-overflow-x">
        <Table id='diagnosticoTable' className="table-w-100">
          <TableHeader>
            <TableRow>
            <TableHead className="w-8" />
            <TableHead className={`w-12`}>
              <Checkbox
                aria-label="Seleccionar todas las filas"
                checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
                onCheckedChange={(value) => toggleAll(value === true)}
              />
            </TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}>
              <button
                type="button"
                onClick={() => toggleSort('producto')}
                className="gap-1 px-3"
              >
                <b className='text-medium'>Productos</b>
                <span aria-hidden="true" className="text-xs px-2">
                  {renderSortIndicator('producto')}
                </span>
              </button>
            </TableHead>
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
            <TableHead className={`min-w-[160px] whitespace-normal break-words`}><b className='text-medium'>Canal</b></TableHead>
            <TableHead className={`min-w-[200px] whitespace-normal break-words`}>
              <button
                type="button"
                onClick={() => toggleSort('squad')}
                className="gap-1 px-3"
              >
                <b className='text-medium'>Squad</b>
                <span aria-hidden="true" className="text-xs px-2">
                  {renderSortIndicator('squad')}
                </span>
              </button>
            </TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}><b className='text-medium'>Fuente</b></TableHead>
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
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Recurrencia</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Criticidad</b></TableHead>
            <TableHead className={`min-w-[220px] whitespace-normal break-words`}><b className='px-3 text-medium'>Cliente</b></TableHead>            
            <TableHead className={`min-w-[220px] whitespace-normal`}><b className='px-3 text-medium'>Prioridad</b></TableHead>
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
              <TableCell colSpan={13} className="text-destructive text-center">
                No se encontraron filas que coincidan con “{query.trim()}”.
              </TableCell>
            </TableRow>
          )}
            {visibleRows.map((row) => (
            <Fragment key={row.id}>
              <TableRow data-state={selected[row.id] ? 'selected' : undefined}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => toggleRowExpanded(row.id)}
                    aria-label={expandedRows[row.id] ? 'Contraer fila' : 'Expandir fila'}
                    className="text-xs px-4"
                  >
                    {expandedRows[row.id] ? ' ▾ ' : ' ▸ '}
                  </button>
                </TableCell>
                <TableCell>
                  <Checkbox
                    aria-label={`Seleccionar fila ${row.id}`}
                    checked={!!selected[row.id]}
                    onCheckedChange={(value) => toggleRow(row.id, Boolean(value))}
                  />
                </TableCell>
                <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                  <Select
                    value={row.producto || ''}
                    onValueChange={(value) => handleChangeProducto(row.id, value)}
                    disabled={products.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          products.length === 0
                            ? 'Configurar productos en la otra pestaña'
                            : 'Sin completar'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id ?? product.name} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
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
                <TableCell className="min-w-[160px] whitespace-normal break-words px-cell">
                  <Input
                    type="text"
                    value={row.canal}
                    onChange={(event) => handleChangeCanal(row.id, event.target.value)}
                    list="canal-options"
                    placeholder="Ej: ONB, OFB, App..."
                  />
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-normal break-words px-cell">
                  <Input
                    type="text"
                    value={row.squad}
                    onChange={(event) => handleChangeSquad(row.id, event.target.value)}
                    list="squad-options"
                    placeholder="Ej: Custodia, FIMA..."
                  />
                </TableCell>
                <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                  <Input
                    type="text"
                    value={row.fuente}
                    onChange={(event) => handleChangeFuente(row.id, event.target.value)}
                    list="fuente-options"
                    placeholder="Ej: Entrevistas, Hotjar..."
                  />
                </TableCell>
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
                <TableCell className="min-w-[220px] whitespace-normal break-words px-cell">
                  <Input
                    type="text"
                    value={row.cliente}
                    onChange={(event) => handleChangeCliente(row.id, event.target.value)}
                    list="cliente-options"
                    placeholder="Ej: Renta Alta, PYME PES..."
                  />
                </TableCell>                
                <TableCell className="min-w-[220px] whitespace-normal break-words px-cell text-medium"><b>{row.prioridad}</b></TableCell>
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
              {expandedRows[row.id] && (
                <TableRow>
                  <TableCell colSpan={13} className="px-8 py-4">
                    <div className="space-y-4 p-6 table-details-bg">
                      <div>
                        <p className="text-xs whitespace-pre-wrap"><b>💬 Comentario: </b>
                          {row.comentario || 'Sin comentario registrado.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-destructive whitespace-pre-wrap"><b>🌶️ Dolor: </b> 
                          {row.dolor || 'Sin dolor registrado.'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
