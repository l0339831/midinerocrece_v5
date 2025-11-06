import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Dexie from "dexie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Tipos base */
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

/** Persistencia Dexie */
class KPIDataBase extends Dexie {
  kpis!: Dexie.Table<KPI, string>;
  constructor() {
    super("mdc_v5");
    this.version(1).stores({
      kpis: "key",
    });
  }
}
const db = new KPIDataBase();

/** Defaults SIEMPRE 0 */
const INITIAL_KPIS: KPI[] = [
  { key: "csatChannel", label: "CSAT Canal", value: 0, kind: "percent", unit: "%", subtitle: "vs Q3 · -2pp" },
  { key: "csatInvestments", label: "CSAT Inversiones", value: 0, kind: "percent", unit: "%", subtitle: "vs Q3 · -2pp" },
  { key: "csatComments", label: "Comentarios", value: 0, kind: "count", subtitle: "" },
  { key: "placeholder", label: "Proyectos", value: 0, kind: "count" },
];

const INITIAL_KPI_MAP: Record<KPIKey, KPI> = INITIAL_KPIS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {} as Record<KPIKey, KPI>);

/** localStorage helpers */
const LS_KEY = "mdc_v5.kpis";
function readKpisFromLS(): Partial<Record<KPIKey, number>> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function writeKpisToLS(kpis: KPI[]) {
  try {
    const map: Partial<Record<KPIKey, number>> = {};
    for (const k of kpis) map[k.key] = k.value;
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch { /* no-op */ }
}

/**
 * drafts: flag de edición por KPI.
 * Si `drafts[key]` es `true` → está en modo edición (contentEditable).
 * No guardamos el valor parcial en React state para evitar re-renders que muevan el caret.
 */
type DraftState = Record<KPIKey, boolean>;
const createDraftFlags = (): DraftState =>
  INITIAL_KPIS.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {} as DraftState);

export default function KPIBoard() {
  const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [editing, setEditing] = useState<DraftState>(createDraftFlags());

  // Hydratación LS -> Dexie -> defaults
  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const fromLS = readKpisFromLS();
        if (fromLS && isMounted) {
          const merged = INITIAL_KPIS.map((item) =>
            typeof fromLS[item.key] === "number" ? { ...item, value: Number(fromLS[item.key]) } : item
          );
          setKpis(merged);
        }

        const persisted = await db.kpis.toArray();
        if (!isMounted) return;

        if (persisted.length && !fromLS) {
          const merged = INITIAL_KPIS.map((item) => {
            const m = persisted.find((e) => e.key === item.key);
            return m ? { ...item, value: m.value } : item;
          });
          setKpis(merged);
        } else if (!persisted.length) {
          await db.kpis.bulkPut(INITIAL_KPIS);
        }
      } catch (error) {
        console.error("Unable to hydrate KPI data", error);
      }
    };
    void hydrate();
    return () => { isMounted = false; };
  }, []);

  /** Formateadores */
  const percentFormatter = useMemo(
    () => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, signDisplay: "exceptZero" }),
    []
  );
  const countFormatter = useMemo(
    () => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }),
    []
  );

  const formatValue = (kpi: KPI) => {
    const base = kpi.kind === "percent" ? percentFormatter.format(kpi.value) : countFormatter.format(kpi.value);
    return `${base}${kpi.unit ?? ""}`;
  };

  /** Acciones de edición */
  const enterEdit = (key: KPIKey) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
  };

  const cancelEdit = (key: KPIKey) => {
    setEditing((prev) => ({ ...prev, [key]: false }));
  };

  const commit = async (key: KPIKey, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) { cancelEdit(key); return; }
    const nextValue = Number(trimmed.replace(",", "."));
    if (Number.isNaN(nextValue)) { cancelEdit(key); return; }

    let updatedList: KPI[] = [];
    setKpis((prev) => {
      const next = prev.map((item) => (item.key === key ? { ...item, value: nextValue } : item));
      updatedList = next;
      return next;
    });
    cancelEdit(key);

    try {
      await db.kpis.put({ ...(INITIAL_KPI_MAP[key]), value: nextValue });
    } catch (error) {
      console.error("Unable to persist KPI update (Dexie)", error);
    }
    writeKpisToLS(updatedList);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.key}
          title={kpi.label}
          value={kpi.value}
          formattedValue={formatValue(kpi)}
          isEditing={editing[kpi.key]}
          subtitle={kpi.subtitle}
          trend={kpi.kind === "percent" ? (kpi.value > 0 ? "positive" : kpi.value < 0 ? "negative" : "neutral") : "neutral"}
          onEnterEdit={() => enterEdit(kpi.key)}
          onCommit={(value) => commit(kpi.key, value)}
          onCancel={() => cancelEdit(kpi.key)}
        />
      ))}
    </div>
  );
}

/** Card con contentEditable sin re-render en cada tecla (caret estable) */
interface KPICardProps {
  title: string;
  value: number;
  formattedValue: string;
  isEditing: boolean;
  subtitle?: string;
  trend: "positive" | "negative" | "neutral";
  onEnterEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

function KPICard({
  title,
  value,
  formattedValue,
  isEditing,
  subtitle,
  trend,
  onEnterEdit,
  onCommit,
  onCancel,
}: KPICardProps) {
  const trendClass =
    trend === "positive" ? "text-success" :
    trend === "negative" ? "text-destructive" :
    "text-foreground";

  const ref = useRef<HTMLDivElement>(null);
  const draftRef = useRef<string>("");

  // Al entrar en edición: setear texto a valor numérico y seleccionar todo
  useEffect(() => {
    if (isEditing && ref.current) {
      draftRef.current = String(value);
      ref.current.textContent = draftRef.current;
      ref.current.focus();
      const sel = window.getSelection?.();
      if (sel && ref.current.firstChild) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    // Al salir de edición: limpiar texto para que lectura muestre formattedValue
    if (!isEditing && ref.current) {
      ref.current.textContent = "";
    }
  }, [isEditing, value]);

  const handleCardClick = () => {
    if (!isEditing) onEnterEdit();
  };

  const handleInput = () => {
    if (!ref.current) return;
    // Filtra caracteres: números, coma, punto, guión
    const onlyNumber = (ref.current.textContent ?? "").replace(/[^\d\-,.]/g, "");
    if (onlyNumber !== ref.current.textContent) {
      // Corrige el contenido sin perder el caret (usar range si se quiere ultra fino)
      ref.current.textContent = onlyNumber;
      // Colocar caret al final
      const sel = window.getSelection?.();
      if (sel && ref.current.firstChild) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    draftRef.current = onlyNumber;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit(draftRef.current);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
    }
  };

  const handleBlur = () => {
    onCommit(draftRef.current);
  };

  return (
    <Card className="hover:shadow-sm transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Lectura: render controlado por React */}
        {!isEditing && (
          <div className={`text-5xl font-bold ${trendClass}`}>
            {formattedValue}
          </div>
        )}

        {/* Edición: contentEditable no controlado → sin re-render por tecla */}
        {isEditing && (
          <div
            ref={ref}
            className={`text-5xl font-bold ${trendClass} kpi-ce`}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            aria-label={`${title} editor`}
          />
        )}

        {subtitle && (
          <p className="text-xs text-muted mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
