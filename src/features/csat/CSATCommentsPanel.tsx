import { useRef, useState, type ChangeEventHandler } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type CSATCommentRow = {
  date: string;
  nota_csat: number | null;
  driver_detractor: string;
  driver_neutro: string;
  driver_promotor: string;
  comentario: string;
  segmento_cx: string;
  partyID: string;
  banca: string;
};

export default function CSATCommentsPanel() {
  const [rows, setRows] = useState<CSATCommentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClickImport = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    Papa.parse<CSATCommentRow>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors?.length) {
          console.error('[CSATCommentsPanel] Parse errors:', result.errors);
        }

        const parsed: CSATCommentRow[] = (result.data as any[]).map((raw) => {
          const notaValue = typeof raw.nota_csat === 'string' ? parseInt(raw.nota_csat.trim(), 10) : Number(raw.nota_csat);
          const nota_csat = Number.isFinite(notaValue) ? Number(notaValue) : null;

          return {
            date: String(raw.date ?? '').trim(),
            nota_csat,
            driver_detractor: String(raw.driver_detractor ?? '').trim(),
            driver_neutro: String(raw.driver_neutro ?? '').trim(),
            driver_promotor: String(raw.driver_promotor ?? '').trim(),
            comentario: String(raw.comentario ?? '').trim(),
            segmento_cx: String(raw.segmento_cx ?? '').trim(),
            partyID: String(raw.partyID ?? '').trim(),
            banca: String(raw.banca ?? '').trim(),
          };
        });

        setRows(parsed);
      },
      error: (err) => {
        console.error('[CSATCommentsPanel] Error parsing CSV', err);
        setError('No se pudo leer el archivo. Verificá el formato CSV con separador ;');
      },
    });
  };

  const totalComentarios = rows.length;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <CardTitle>Comentarios CSAT</CardTitle>
          <p className="text-xs text-muted">
            Importá un archivo CSV para visualizar comentarios de clientes por segmento y driver.
          </p>
          {fileName && (
            <p className="text-[11px] text-muted mt-1">
              Archivo cargado: <span className="font-mono">{fileName}</span> · {totalComentarios} comentarios
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleClickImport}>
            Importar CSV de CSAT
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <p className="text-xs text-destructive">{error}</p>}

        {!rows.length && !error && (
          <p className="text-xs text-muted">No hay comentarios cargados. Importá un archivo CSV para comenzar.</p>
        )}

        {rows.length > 0 && (
          <div className="table-cnt-overflow-x mt-2">
            <Table className="table-w-100 text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">Año</TableHead>
                  <TableHead className="min-w-[80px]">CSAT</TableHead>
                  <TableHead className="min-w-[160px]">Driver detractor</TableHead>
                  <TableHead className="min-w-[160px]">Driver neutro</TableHead>
                  <TableHead className="min-w-[160px]">Driver promotor</TableHead>
                  <TableHead className="min-w-[320px]">Comentario</TableHead>
                  <TableHead className="min-w-[140px]">Segmento CX</TableHead>
                  <TableHead className="min-w-[120px]">PartyID</TableHead>
                  <TableHead className="min-w-[120px]">Banca</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`${row.partyID || 'row'}-${index}`}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.nota_csat ?? '-'}</TableCell>
                    <TableCell>{row.driver_detractor || '-'}</TableCell>
                    <TableCell>{row.driver_neutro || '-'}</TableCell>
                    <TableCell>{row.driver_promotor || '-'}</TableCell>
                    <TableCell className="whitespace-pre-wrap">{row.comentario || '-'}</TableCell>
                    <TableCell>{row.segmento_cx || '-'}</TableCell>
                    <TableCell>{row.partyID || '-'}</TableCell>
                    <TableCell>{row.banca || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
