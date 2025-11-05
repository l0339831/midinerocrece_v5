import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import Dexie, { Table } from "dexie";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type KPIKey = "csatChannel" | "csatInvestments" | "csatComments" | "placeholder";

type KPIKind = "percent" | "count";

type KPI = {
  key: KPIKey;
  label: string;
  value: number;
  kind: KPIKind;
  unit?: string;
  subtitle?: string;
};

class KPIDataBase extends Dexie {
  kpis!: Table<KPI, string>;

  constructor() {
    super("midinerocrece");
    this.version(1).stores({ kpis: "key" });
  }
}

const db = new KPIDataBase();

const INITIAL_KPIS: KPI[] = [
  { key: "csatChannel", label: "CSAT Canal", value: -18, kind: "percent", unit: "%" },
  {
    key: "csatInvestments",
    label: "CSAT Inversiones",
    value: 5,
    kind: "percent",
    unit: "%",
    subtitle: "vs Q3 · -2pp · n=100",
  },
  { key: "csatComments", label: "Comentarios", value: 87, kind: "count" },
  { key: "placeholder", label: "Proyectos", value: 12, kind: "count" },
];

const INITIAL_KPI_MAP: Record<KPIKey, KPI> = INITIAL_KPIS.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<KPIKey, KPI>,
);

type DraftState = Record<KPIKey, string | undefined>;

const createEmptyDrafts = (): DraftState =>
  INITIAL_KPIS.reduce((acc, item) => {
    acc[item.key] = undefined;
    return acc;
  }, {} as DraftState);

export default function KPIBoard() {
  const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [drafts, setDrafts] = useState<DraftState>(createEmptyDrafts);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const persisted = await db.kpis.toArray();
        if (!isMounted) {
          return;
        }

        if (persisted.length) {
          const merged = INITIAL_KPIS.map((item) => {
            const match = persisted.find((entry) => entry.key === item.key);
            return match ? { ...item, ...match } : item;
          });
          setKpis(merged);
        } else {
          await db.kpis.bulkPut(INITIAL_KPIS);
        }
      } catch (error) {
        console.error("Unable to hydrate KPI data", error);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-ES", {
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
      }),
    [],
  );

  const countFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-ES", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  const formatValue = (kpi: KPI) => {
    const base =
      kpi.kind === "percent"
        ? percentFormatter.format(kpi.value)
        : countFormatter.format(kpi.value);
    return `${base}${kpi.unit ?? ""}`;
  };

  const handleDraftChange = (key: KPIKey, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const commit = async (key: KPIKey, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      setDrafts((prev) => ({ ...prev, [key]: undefined }));
      return;
    }

    const nextValue = Number(trimmed.replace(",", "."));
    if (Number.isNaN(nextValue)) {
      return;
    }

    let updatedEntry: KPI | undefined;

    setKpis((prev) => {
      const base = prev.find((item) => item.key === key) ?? INITIAL_KPI_MAP[key];
      if (!base) {
        return prev;
      }

      updatedEntry = { ...base, value: nextValue };

      return prev.map((item) => (item.key === key ? updatedEntry! : item));
    });

    setDrafts((prev) => ({ ...prev, [key]: undefined }));

    if (updatedEntry) {
      try {
        await db.kpis.put(updatedEntry);
      } catch (error) {
        console.error("Unable to persist KPI update", error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.key}
          title={kpi.label}
          value={kpi.value}
          formattedValue={formatValue(kpi)}
          draft={drafts[kpi.key]}
          subtitle={kpi.subtitle}
          trend={kpi.kind === "percent"
            ? kpi.value > 0
              ? "positive"
              : kpi.value < 0
                ? "negative"
                : "neutral"
            : "neutral"}
          onDraftChange={(value) => handleDraftChange(kpi.key, value)}
          onCommit={(value) => commit(kpi.key, value)}
          onResetDraft={() => setDrafts((prev) => ({ ...prev, [kpi.key]: undefined }))}
        />
      ))}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  formattedValue: string;
  draft: string | undefined;
  subtitle?: string;
  trend: "positive" | "negative" | "neutral";
  onDraftChange: (value: string) => void;
  onCommit: (value: string) => void;
  onResetDraft: () => void;
}

function KPICard({
  title,
  value,
  formattedValue,
  draft,
  subtitle,
  trend,
  onDraftChange,
  onCommit,
  onResetDraft,
}: KPICardProps) {
  const displayValue = draft ?? formattedValue;
  const trendClass =
    trend === "positive"
      ? "text-primary"
      : trend === "negative"
        ? "text-destructive"
        : "text-foreground";

  const inputValue = draft ?? String(value);

  const handleBlur = () => {
    if (draft === undefined) {
      return;
    }
    void onCommit(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (draft === undefined) {
        return;
      }
      event.preventDefault();
      void onCommit(draft);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onResetDraft();
      event.currentTarget.blur();
    }
  };

  return (
    <Card className="hover:shadow-elevation-sm transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={`text-5xl font-semibold leading-tight ${trendClass}`}>
          {displayValue}
        </p>
        {subtitle && (
          <p className="text-sm">
            {subtitle}
          </p>
        )}
        <Input
          aria-label={`Editar ${title}`}
          inputMode="decimal"
          placeholder="Actualizar valor"
          value={inputValue}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </CardContent>
    </Card>
  );
}
