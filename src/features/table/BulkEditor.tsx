import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS = ['En diagnóstico', 'En Backlog de tribu', 'En desarrollo', 'En monitoreo'];
const PRIORITY_OPTIONS = ['Alta', 'Media', 'Baja'];
const OWNER_OPTIONS = ['Equipo CX', 'Tribu Omnicanal', 'Squad Producto', 'Equipo Comercial'];

export type BulkEditorPayload = {
  status: string;
  priority: string;
  owner: string;
  note: string;
  notifyOwners: boolean;
};

type BulkEditorProps = {
  selectedCount?: number;
  onApply?: (payload: BulkEditorPayload) => void;
  onReset?: () => void;
};

export default function BulkEditor({ selectedCount = 0, onApply, onReset }: BulkEditorProps) {
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[0]);
  const [owner, setOwner] = useState(OWNER_OPTIONS[0]);
  const [note, setNote] = useState('');
  const [notifyOwners, setNotifyOwners] = useState(true);

  const handleReset = useCallback(() => {
    setStatus(STATUS_OPTIONS[0]);
    setPriority(PRIORITY_OPTIONS[0]);
    setOwner(OWNER_OPTIONS[0]);
    setNote('');
    setNotifyOwners(true);
    onReset?.();
  }, [onReset]);

  const handleApply = useCallback(() => {
    const payload: BulkEditorPayload = {
      status,
      priority,
      owner,
      note: note.trim(),
      notifyOwners,
    };
    onApply?.(payload);
    if (!onApply) {
      console.table(payload);
    }
  }, [status, priority, owner, note, notifyOwners, onApply]);

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Editor masivo de casos</CardTitle>
          <CardDescription>
            Actualiza el estado y prioridad de los drivers seleccionados antes de moverlos al backlog.
          </CardDescription>
        </div>

        <Badge variant={selectedCount > 0 ? 'default' : 'outline'}>
          {selectedCount === 0 ? 'Sin selección' : `${selectedCount} filas`}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bulk-status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="bulk-status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-priority">Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="bulk-priority">
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-owner">Dueño / Equipo</Label>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger id="bulk-owner">
                <SelectValue placeholder="Elegir equipo" />
              </SelectTrigger>
              <SelectContent>
                {OWNER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-note">Notas rápidas</Label>
          <Textarea
            id="bulk-note"
            placeholder="Describe la acción acordada o el ticket de seguimiento…"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="bulk-notify" className="flex items-center gap-2 text-sm font-medium">
              Notificar dueños
            </Label>
            <p className="text-xs text-muted-foreground max-w-sm">
              Envía un ping automático a los responsables para que sepan qué cambiará en las próximas iteraciones.
            </p>
          </div>

          <Switch id="bulk-notify" checked={notifyOwners} onCheckedChange={setNotifyOwners} />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={handleReset}>
          Limpiar selección
        </Button>
        <div className="flex flex-1 gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleReset}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={selectedCount === 0}>
            Aplicar cambios
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
