# Mi Dinero Crece v3

**Objetivo:** una app web para **gestionar** datasets de CSAT (CSV/JSON) y **visualizarlos** sin depender de Excel. Permite **cargar, etiquetar y priorizar** comentarios; persistir **KPIs**; y construir visualizaciones.

---

## ✨ Qué hace

- **Importar datasets** `.csv`/`.json` (comentarios de clientes segmentados x Renta. Fuente CSAT).
  - CSV con **separador `;`** y encabezados.
- **Edición en lote**: _Driver_, _Dolor_, _Recurrencia_, _Criticidad_, _Factibilidad_, _Estado_.
- **Drivers** como **agrupadores** de comentarios (texto libre asistido por datalist); se sugieren a partir de:  
  `driver_detractor`, `driver_neutro`, `driver_promotor` (si existen en el dataset).
- **Prioridad (RxC)** se **calcula automáticamente** como matriz **Recurrencia × Criticidad** (no editable).
- **Sankey** (peso = **count de filas**) con flujo:  
  **Driver → Prioridad → Factibilidad → Proyectos → Estado**.
- **KPIs** (editable in place, con negativos): _CSAT Canal_, _CSAT Inversiones_, _Comentarios CSAT_.  
  Persisten en **IndexedDB**.

---

## 🧱 Arquitectura & Capas

```
src/
  App.tsx                      # Layout
  styles/variables.css         # Design tokens + UI base (cards, tabs, tabla, etc.)
  models/types.ts              # Tipos del dominio (Row, Dataset, estados, niveles)
  constants/catalogs.ts        # Matriz RxC (Reglas de prioridad)
  services/
    files.ts                   # Carga y parseo CSV (Papaparse)
    storage.ts                 # Dexie (IndexedDB) p/ datasets + KPIs
  stores/
    datasets.ts                # Estado y mutaciones de datasets (Zustand + Immer)
    kpis.ts                    # Estado/persistencia de KPIs
  features/
    table/Table.tsx            # Tabla (bulk edit, select-all, datalist)
    viz/Sankey.tsx             # Sankey ECharts
  viz/
    theme.ts                   # Registro de theme ECharts
  ui/
    KPIBoard.tsx               # KPI cards editables
    Breadcrumbs.tsx            # Migas simples
```

**Patrón:** “Feature-first” para vistas (`features/*`), con **capas claras**:

- `/services`: I/O (parseo de archivos, persistencia).
- `/models`: tipos de dominio (TS).
- `/stores`: **estado global** con **Zustand** (mutaciones con **Immer**).
- `/viz`: tema y utilidades de gráficos.

---

## 🧩 Librerías clave

- **React 18 + TypeScript + Vite** (rápido en StackBlitz).
- **Zustand** (estado) + **Immer** (mutaciones inmutables legibles).
- **Dexie** (IndexedDB) para persistir **datasets** y **KPIs** en el navegador.
- **PapaParse** para CSV con `;`.
- **ECharts + echarts-for-react** para el **Sankey** con tema personalizado.
- **Inter** desde Google Fonts.

> _No se incluyen por ahora_ tests, MSW, logger ni code-splitting: priorizamos edición/visualización rápida y uso en StackBlitz/iOS.

---

## 🗂️ Modelo de Datos (resumen)

```ts
type WfLevel = 'Baja' | 'Media' | 'Alta' | 'Sin asignar';
type Estado =
  | 'En Backlog de tribu' | 'En desarrollo' | 'Se hizo Diagrama de flujo'
  | 'Se hizo EQC' | 'En producción' | 'Descartado' | 'Sin asignar';

interface Row {
  id: string;
  src: Record<string, unknown>;   // columnas originales del CSV/JSON (incluye comentario)
  driver?: string;                // agrupador editable (datalist + input libre)
  workflow: {};
}

interface Dataset {
  id: string; name: string; rows: Row[];
  createdAt: number; updatedAt: number;
}
```

### Reglas importantes

- **RxC (Prioridad)** = matriz **Recurrencia × Criticidad** (no editable).
- Si falta algún valor de los 5 campos, se agrupa como **“Sin asignar”** en esa etapa.
- **Sankey** NO se filtra por `banca`, `segmento_cx` o `año`; esos campos se reservan para futuras visualizaciones.
- **Valor del Sankey**: **conteo** de filas por enlace.
- **Drivers**: un solo driver por fila (bulk edit disponible).

---

## 🎨 Visual & UX

- **Inter** en toda la UI.
- **Design tokens** (`variables.css`):
  - **Tabla** con zebra + hover, checkbox **select-all** en `<th>`.
- **KPI cards**: valor XL; acepta **negativos**; color: **verde ≥ 0**, **rojo < 0**.
- **Sankey**:
  - **Gradiente por link** (de color del **source** al **target**).
  - `nodeWidth` y `nodeGap` afinados; labels 12px/600.

---

## 🚀 Puesta en marcha

### StackBlitz (recomendado / iOS friendly)

1. Importá el repo o soltá la carpeta.
2. Verás el preview al guardar; botón **Importar CSV/JSON** para cargar datasets.

### Local (opcional)

```bash
pnpm i    # o npm i / yarn
pnpm dev  # abre http://localhost:5173
```

> **Permisos admin no requeridos**. Todo corre en el navegador y persiste en IndexedDB.

---

## 🔒 Persistencia

- **Datasets**: se guardan íntegros en IndexedDB (`Dexie`).
- **KPIs**: tabla independiente (`singleton`) con `csatCanal`, `csatInversiones`, `comentarios`.
- **Reset**: limpiar _Application → IndexedDB_ en herramientas del navegador.

---

## 🛠️ Convenciones & Calidad

- **TypeScript estricto**.
- Estructura “feature-first” para escalar vistas.
- En stores, cada mutación actualiza `updatedAt` del dataset.
- **Datalist** para drivers (evita duplicados típicos), pero **permite libre edición** y **borrar** correctamente.

---

## 📎 Notas sobre el CSV

- Separador: **`;`**.
- Columnas especiales (opcionales):  
  `driver_detractor`, `driver_neutro`, `driver_promotor` → se usan para **pre-cargar** `driver`.
- Campo de texto de comentario: se muestra completo con _title_ y se puede truncar a 3 líneas (opcional CSS).

---

## ⚙️ Scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

---

## 📦 Stack

- **React 18**, **TypeScript 5**, **Vite 5**
- **Zustand 4**, **Immer 10**
- **Dexie 4** (IndexedDB)
- **ECharts 5** + **echarts-for-react**
- **PapaParse 5**
- **Inter** (Google Fonts)

---
