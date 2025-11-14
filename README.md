# MiDineroCrece v5

**MiDineroCrece** es una SPA (Vite + React + TypeScript) para explorar y visualizar información financiera con enfoque en usabilidad, medición y navegación por **vistas** desde un **nav lateral**.  
Esta versión mantiene la **misma arquitectura** validada en iteraciones anteriores y respeta los **estilos existentes** del proyecto.

> 🗺️ Índice rápido de archivos (fuente de verdad): `rawfiles.md`  
> 📐 Mockup visual de referencia (no runtime): `__overview_mockup.html`

---

## Tabla de contenidos

- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Scripts](#scripts)
- [Inicio rápido](#inicio-rápido)
- [Datos y almacenamiento](#datos-y-almacenamiento)
- [Navegación por vistas](#navegación-por-vistas)
- [Estilos](#estilos)
- [Guías de desarrollo](#guías-de-desarrollo)
- [Métricas operativas (opcional)](#métricas-operativas-opcional)
- [Troubleshooting](#troubleshooting)
- [Créditos y licencias](#créditos-y-licencias)

---

## Stack

- **Vite** (dev server & build)
- **React 18** + **TypeScript**
- **IndexedDB (Dexie)** para persistencia local
- **UI components** (wrappers en `src/components/ui/*`)

---

## Estructura del proyecto

```
Root
├─ __overview_mockup.html        # Mockup estático (referencia visual, no participa del runtime)
├─ index.html                    # Entry de Vite (mount point)
├─ package.json / package-lock.json
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json
├─ uploads/                      # Fixtures de datos (ver “Datos y almacenamiento”)
│  ├─ sat_dataset_2.csv          # CSV con separador ';'
│  └─ proyectos.json             # Payload de ejemplo para listas de proyectos
└─ src/
   ├─ main.tsx                   # Bootstrap React (ReactDOM.createRoot)
   ├─ App.tsx                    # App shell + routing de vistas
   ├─ index.css                  # Import base
   ├─ styles/globals.css         # Tokens/utilidades del diseño del proyecto
   │
   ├─ data/storage.ts            # Dexie schema + helpers (save/load)
   │
   ├─ imports/
   │  ├─ Container.tsx           # Wrapper/flujo de importación
   │  └─ svg-*.ts                # Asset SVG embebido como módulo TS
   │
   ├─ components/
   │  ├─ figma/ImageWithFallback.tsx
   │  └─ ui/                     # Primitivas UI (wrappers tipo Radix/shadcn)
   │     ├─ button.tsx, input.tsx, table.tsx, dialog.tsx, drawer.tsx, …
   │     ├─ navigation-menu.tsx, pagination.tsx, tabs.tsx, tooltip.tsx, …
   │     └─ utils.ts, use-mobile.ts
   │
   └─ guidelines/Guidelines.md   # Pautas de desarrollo/UX del proyecto
```

> Para descripciones y enlaces raw de cada archivo, ver **`rawfiles.md`** (inventario mantenido en el repo).

---

## Scripts

```bash
# Instalar dependencias
npm install

# Entorno de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build (servidor estático local)
npm run preview
```

---

## Inicio rápido

1. **Instalá dependencias**: `npm install`.  
2. **Levantá el entorno**: `npm run dev` y abrí la URL que muestre Vite (ej: `http://localhost:5173`).  
3. **Explorá vistas** desde el **nav izquierdo**.  
4. (Opcional) **Cargá fixtures** desde `uploads/` para probar flujos de importación y persistencia.

---

## Datos y almacenamiento

La app usa **IndexedDB** mediante **Dexie**. Los helpers viven en `src/data/storage.ts`:

- `saveDataset(data: YourType[])`
- `loadDataset(): Promise<YourType[]>`
- `saveProjects(data: Project[])`
- `loadProjects(): Promise<Project[]>`

**Fixtures de prueba:**

- `uploads/sat_dataset_2.csv` → **Separador `;` (punto y coma)**  
- `uploads/proyectos.json`

> Recomendación: tratá `uploads/` como **fuente canónica de pruebas**. Si necesitás reseed, documentá el cambio en `rawfiles.md`.

---

## Navegación por vistas

- v5 adopta navegación **“por vistas”** desde el **nav izquierdo**.  
- El shell en `src/App.tsx` organiza layout y rutas.  
- Los componentes en `src/components/ui/*` proveen menús, drawers, resizable panels, tabs y otros primitivos para construir la navegación.

---

## Estilos

- **No se agregan nuevas hojas de estilo**.  
- Se reutilizan `src/index.css` y `src/styles/globals.css` (tokens/variables/utilidades). 

---

## Guías de desarrollo

- Consultá `src/guidelines/Guidelines.md` para convenciones de UX/desarrollo.  
- Para conocer propósito y enlaces raw de cada archivo, usá `rawfiles.md` (índice auto-mantenido).

---

## Troubleshooting

- **CSV**: recordá que los CSV usan **`;`** como separador (no `,`).  
- **Estilos**: si algo “no se ve”, confirmá que los imports de `index.css`/`styles/globals.css` estén presentes en el entry.  
- **IndexedDB**: al cambiar el schema, incrementá la versión de Dexie en `storage.ts` y definí migraciones si hiciera falta.

---

## Créditos y licencias

- Ver **`Attributions.md`** para licencias de assets.  
- Este repositorio incluye recomendaciones de entorno en `.vscode/extensions.json` para alinear el tooling del equipo.