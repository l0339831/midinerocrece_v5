import Dexie, { Table } from 'dexie';
import { Row, isRow, normalizeRow } from '@/types';

const DB_NAME = 'MDC5DB';
const SCHEMA = "rows: '++id,createdAt'";

type PersistedRow = Omit<Row, 'id'> & { createdAt: number } & { id?: number };

class MDC5DB extends Dexie {
  public rows!: Table<PersistedRow, number>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      rows: '++id,createdAt',
    });
  }
}

const db = new MDC5DB();

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const readTimestamp = (record: Record<string, unknown>): number | null => (
  toNumber(record['createdAt'])
);

const ensureTimestamp = (row: Row, fallback: number): number => {
  const fromWorkflow = readTimestamp(row.workflow);
  if (fromWorkflow !== null) return fromWorkflow;
  const fromSrc = readTimestamp(row.src);
  if (fromSrc !== null) return fromSrc;
  return fallback;
};

const assertRowShape = (row: Row, index: number) => {
  if (!isRow(row)) {
    throw new Error(`Invalid row at index ${index}: expected { id, src, workflow } shape.`);
  }
};

const toPersistedRow = (row: Row, createdAt: number): PersistedRow => {
  const normalized = normalizeRow(row);
  const { id: _omitId, ...rest } = normalized;
  return {
    ...rest,
    createdAt,
  };
};

const fromPersistedRow = (row: PersistedRow): Row => {
  if (typeof row.id !== 'number' || !Number.isFinite(row.id)) {
    throw new Error('Stored row is missing its numeric primary key.');
  }
  const { createdAt: _ignored, ...rest } = row;
  const base = rest as Omit<Row, 'id'>;
  return normalizeRow({
    ...base,
    id: String(row.id),
  });
};

export async function saveDataset(rows: Row[]): Promise<void> {
  if (!Array.isArray(rows)) {
    throw new Error('saveDataset expects an array of Row items.');
  }

  const baseTime = Date.now();
  const prepared = rows.map((row, index) => {
    assertRowShape(row, index);
    return toPersistedRow(row, ensureTimestamp(row, baseTime + index));
  });

  await db.transaction('rw', db.rows, async () => {
    await db.rows.clear();
    if (prepared.length > 0) {
      await db.rows.bulkAdd(prepared);
    }
  });
}

export async function loadDataset(): Promise<Row[]> {
  const stored = await db.rows.orderBy('id').toArray();
  return stored.map(fromPersistedRow);
}

export async function countRows(): Promise<number> {
  return db.rows.count();
}

export async function clearAll(): Promise<void> {
  await db.rows.clear();
}

const devSelfTest = async () => {
  if (typeof window === 'undefined') return;
  const backup = await db.rows.toArray();
  try {
    const sample: Row[] = [
      { id: 'sample-1', src: { foo: 'bar' }, workflow: { createdAt: Date.now() } },
      { id: 'sample-2', src: { foo: 'baz' }, workflow: {} },
    ];
    await saveDataset(sample);
    const loaded = await loadDataset();
    const sameLength = loaded.length === sample.length;
    const samePayload = loaded.every(
      (row, idx) => JSON.stringify(row.src) === JSON.stringify(sample[idx].src),
    );
    if (!sameLength || !samePayload) {
      throw new Error('Dexie dev self-test failed: mismatch after round-trip.');
    }
  } catch (error) {
    console.warn('[storage] dev self-test failed', error);
    throw error;
  } finally {
    await db.rows.clear();
    if (backup.length > 0) {
      await db.rows.bulkAdd(backup);
    }
  }
};

if (import.meta.env?.DEV) {
  devSelfTest().then(
    () => console.info('[storage] saveDataset/loadDataset self-test passed'),
    () => { /* already logged */ },
  );
}

export const STORAGE_SCHEMA = SCHEMA;
