import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db, type Driver, type Project, type Status } from '@/db/storage';

export default function BulkEditor() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newDriverName, setNewDriverName] = useState('');
  const [isSavingDriver, setIsSavingDriver] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectFileKey, setProjectFileKey] = useState(0);
  const [importSummary, setImportSummary] = useState<{ totalInFile: number; totalImported: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImportingProjects, setIsImportingProjects] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newStatusName, setNewStatusName] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadDrivers = useCallback(async () => {
    try {
      const rows = await db.drivers.orderBy('name').toArray();
      setDrivers(rows);
    } catch (error) {
      console.error('[BulkEditor] no se pudieron cargar drivers', error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const rows = await db.projects.orderBy('name').toArray();
      setProjects(rows);
    } catch (error) {
      console.error('[BulkEditor] no se pudieron cargar proyectos', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const rows = await db.statuses.orderBy('name').toArray();
      setStatuses(rows);
    } catch (error) {
      console.error('[BulkEditor] no se pudieron cargar estados', error);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    loadProjects();
    loadStatuses();
  }, [loadDrivers, loadProjects, loadStatuses]);

  const handleAddDriver = async () => {
    const trimmed = newDriverName.trim();
    if (!trimmed) return;
    setIsSavingDriver(true);
    try {
      await db.drivers.add({ name: trimmed });
      setNewDriverName('');
      await loadDrivers();
    } catch (error) {
      console.error('[BulkEditor] error al crear driver', error);
    } finally {
      setIsSavingDriver(false);
    }
  };

  const handleDeleteDriver = async (id?: number) => {
    if (typeof id === 'undefined') return;
    try {
      await db.drivers.delete(id);
      await loadDrivers();
    } catch (error) {
      console.error('[BulkEditor] error al eliminar driver', error);
    }
  };

  const handleAddProject = async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    setIsSavingProject(true);
    try {
      await db.projects.add({ name: trimmed });
      setNewProjectName('');
      await loadProjects();
    } catch (error) {
      console.error('[BulkEditor] error al crear proyecto', error);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id?: number) => {
    if (typeof id === 'undefined') return;
    try {
      await db.projects.delete(id);
      await loadProjects();
    } catch (error) {
      console.error('[BulkEditor] error al eliminar proyecto', error);
    }
  };

  const handleAddStatus = async () => {
    const trimmed = newStatusName.trim();
    if (!trimmed) return;
    setIsSavingStatus(true);
    try {
      await db.statuses.add({ name: trimmed });
      setNewStatusName('');
      await loadStatuses();
    } catch (error) {
      console.error('[BulkEditor] error al crear estado', error);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleDeleteStatus = async (id?: number) => {
    if (typeof id === 'undefined') return;
    try {
      await db.statuses.delete(id);
      await loadStatuses();
    } catch (error) {
      console.error('[BulkEditor] error al eliminar estado', error);
    }
  };

  const handleImportProjects = async () => {
    if (!projectFile) return;
    setIsImportingProjects(true);
    setImportError(null);
    setImportSummary(null);
    try {
      const text = await projectFile.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('El archivo debe contener un array de strings.');
      }
      if (!parsed.every((item) => typeof item === 'string')) {
        throw new Error('El archivo debe contener solo strings.');
      }
      const totalInFile = parsed.length;
      const seen = new Set<string>();
      const sanitized: string[] = [];
      for (const item of parsed as string[]) {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);
        sanitized.push(trimmed);
      }
      await db.projects.clear();
      if (sanitized.length) {
        await db.projects.bulkAdd(sanitized.map((name) => ({ name })));
      }
      await loadProjects();
      setImportSummary({ totalInFile, totalImported: sanitized.length });
      setProjectFile(null);
      setProjectFileKey((prev) => prev + 1);
    } catch (error) {
      console.error('[BulkEditor] error al importar proyectos', error);
      setImportError(
        error instanceof Error
          ? error.message
          : 'No se pudo importar el archivo. Verificá que el formato sea correcto.'
      );
    } finally {
      setIsImportingProjects(false);
    }
  };

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <CardTitle>Editor de listas maestras</CardTitle>
        <CardDescription>
          Gestioná los drivers y proyectos que luego se usan en la vista de diagnóstico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Drivers</h3>
            <p className="text-xs text-muted-foreground">Usados en la columna &ldquo;Driver&rdquo;.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-driver">Nuevo driver</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="new-driver"
                placeholder="Ej: Experiencia App inversiones"
                value={newDriverName}
                onChange={(event) => setNewDriverName(event.target.value)}
              />
              <Button
                onClick={handleAddDriver}
                disabled={!newDriverName.trim() || isSavingDriver}
                className="shrink-0 sm:w-auto"
              >
                {isSavingDriver ? 'Guardando…' : 'Agregar'}
              </Button>
            </div>
          </div>
          <div>
            {drivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay drivers configurados. Agregá el primero arriba.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id ?? driver.name}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {typeof driver.id === 'number' ? driver.id : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDriver(driver.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Proyectos</h3>
            <p className="text-xs text-muted-foreground">Usados en la columna &ldquo;Proyecto&rdquo;.</p>
          </div>
        <div className="space-y-2">
          <Label htmlFor="new-project">Nuevo proyecto</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="new-project"
                placeholder="Ej: Automatización onboarding"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
              />
              <Button
                onClick={handleAddProject}
                disabled={!newProjectName.trim() || isSavingProject}
                className="shrink-0 sm:w-auto"
              >
                {isSavingProject ? 'Guardando…' : 'Agregar'}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projects-file">Importar proyectos (.json)</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                key={projectFileKey}
                id="projects-file"
                type="file"
                accept="application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProjectFile(file);
                  setImportSummary(null);
                  setImportError(null);
                }}
                className="text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleImportProjects}
                disabled={!projectFile || isImportingProjects}
                className="sm:w-auto"
              >
                {isImportingProjects ? 'Importando…' : 'Importar JSON'}
              </Button>
            </div>
            {importSummary && (
              <p className="text-xs text-muted-foreground">
                Importados {importSummary.totalImported} proyectos (originalmente {importSummary.totalInFile} en el archivo).
              </p>
            )}
            {importError && <p className="text-xs text-destructive">{importError}</p>}
          </div>
          <div>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay proyectos configurados. Agregá el primero arriba.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id ?? project.name}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {typeof project.id === 'number' ? project.id : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Estados</h3>
            <p className="text-xs text-muted-foreground">Usados en la columna &ldquo;Estado&rdquo;.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-status">Nuevo estado</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="new-status"
                placeholder="Ej: En desarrollo"
                value={newStatusName}
                onChange={(event) => setNewStatusName(event.target.value)}
              />
              <Button
                onClick={handleAddStatus}
                disabled={!newStatusName.trim() || isSavingStatus}
                className="shrink-0 sm:w-auto"
              >
                {isSavingStatus ? 'Guardando…' : 'Agregar'}
              </Button>
            </div>
          </div>
          <div>
            {statuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay estados configurados. Agregá el primero arriba.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statuses.map((status) => (
                    <TableRow key={status.id ?? status.name}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {typeof status.id === 'number' ? status.id : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{status.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStatus(status.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
        <p>Drivers y proyectos se usan en la vista de diagnóstico para mantener consistencia.</p>
      </CardFooter>
    </Card>
  );
}
