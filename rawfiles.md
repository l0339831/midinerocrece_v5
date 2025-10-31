# Raw files inventory (auto-mapped)

This file maps raw/non-transpiled files in the repository so contributors and AI agents can find authoritative fixtures, documents and config quickly.

---

## Root-level files

- `__overview_mockup.html` — static mockup / design preview of the app layout. Useful for visual reference when implementing UI.
- `Attributions.md` — license and attribution notes for bundled assets.
- `README.md` — project overview and developer instructions.
- `index.html` — Vite entry HTML; contains app mount point and basic meta.
- `package.json` — npm manifest (scripts, deps). Not a built asset but important for environment and scripts (`dev`, `build`, `preview`).
- `package-lock.json` — pinned dependency tree for reproducible installs.
- `tsconfig.json` — TypeScript compiler configuration (project-level).
- `tsconfig.app.json` — app-specific TypeScript settings.
- `tsconfig.node.json` — Node/Tooling TypeScript settings.

## Uploads (data fixtures)

- `uploads/sat_dataset_2.csv` — sample CSAT dataset. IMPORTANT: CSVs in this project use `;` (semicolon) as the separator. Use this file to exercise the import flow.
- `uploads/proyectos.json` — example projects payload used to seed or test project lists.

## VS Code / workspace settings

- `.vscode/extensions.json` — recommended extensions for the workspace (kept in repo to ensure consistent tooling). Other `.vscode` files are ignored by `.gitignore` to avoid committing local overrides.

## Docs / guidelines

- `src/guidelines/Guidelines.md` — project-specific development and UX guidelines.

## Notes for contributors & agents

- Treat files under `uploads/` as canonical test fixtures for import and persistence flows. Do not alter them unless intentionally re-seeding datasets.
- If you add raw assets (images, videos, large datasets), prefer placing them under `uploads/` and update this file with a short description.
- This file is intended to be small and human-readable. If you'd like, I can:
	- Auto-generate and keep this list up-to-date via a script.
	- Add a CI check that validates CSV separator/header presence for files in `uploads/`.

---

Generated on: 2025-10-31

## Source files (src/)

Below is a file-by-file map of everything under `src/`. Short descriptions explain purpose and where to look for behavior.

### Top-level
- `src/App.tsx` — main app layout and routing shell.
- `src/main.tsx` — app bootstrap (React DOM mount).
- `src/index.css` — global CSS imports and base styles used by Vite.
- `src/styles/globals.css` — design tokens and component-level utility styles.

### Data & storage
- `src/data/storage.ts` — Dexie (IndexedDB) schema and helper functions (`saveDataset`, `loadDataset`, `saveProjects`, `loadProjects`).

### Imports / assets
- `src/imports/Container.tsx` — import-related wrapper/component used by the file import flow.
- `src/imports/svg-vuccrd6ozi.ts` — embedded SVG asset exported as a TS module.

### Features & pages
- `src/components/figma/ImageWithFallback.tsx` — image component with fallback behavior (used for design/embed images).

### UI components (shared)
These are small UI primitives and wrappers (mostly Radix + design tokens). Use them when building views.
- `src/components/ui/accordion.tsx` — accordion wrapper component.
- `src/components/ui/alert-dialog.tsx` — alert-dialog wrapper.
- `src/components/ui/alert.tsx` — inline alerts and banners.
- `src/components/ui/aspect-ratio.tsx` — aspect-ratio helper.
- `src/components/ui/avatar.tsx` — avatar component.
- `src/components/ui/badge.tsx` — badge/pill UI.
- `src/components/ui/breadcrumb.tsx` — breadcrumb navigation.
- `src/components/ui/button.tsx` — primary button styles and variants.
- `src/components/ui/calendar.tsx` — calendar/date-picker wrapper.
- `src/components/ui/card.tsx` — card layout component.
- `src/components/ui/carousel.tsx` — embla-based carousel wrapper.
- `src/components/ui/chart.tsx` — small chart wrapper used by visualizations.
- `src/components/ui/checkbox.tsx` — checkbox control.
- `src/components/ui/collapsible.tsx` — collapsible panel.
- `src/components/ui/command.tsx` — command palette helper.
- `src/components/ui/context-menu.tsx` — context menu wrapper.
- `src/components/ui/dialog.tsx` — modal dialog wrapper.
- `src/components/ui/dropdown-menu.tsx` — dropdown menu helper.
- `src/components/ui/drawer.tsx` — drawer (side sheet) component.
- `src/components/ui/hover-card.tsx` — hover card helper.
- `src/components/ui/input.tsx` — text input with styling and helpers.
- `src/components/ui/input-otp.tsx` — OTP input component.
- `src/components/ui/label.tsx` — form label component.
- `src/components/ui/menubar.tsx` — top menubar wrapper.
- `src/components/ui/navigation-menu.tsx` — site navigation menu.
- `src/components/ui/pagination.tsx` — pagination controls.
- `src/components/ui/popover.tsx` — popover helper.
- `src/components/ui/progress.tsx` — progress bar component.
- `src/components/ui/resizable.tsx` — resizable containers/panels.
- `src/components/ui/scroll-area.tsx` — custom scroll area.
- `src/components/ui/separator.tsx` — divider/separator UI.
- `src/components/ui/select.tsx` — select/dropdown control.
- `src/components/ui/sheet.tsx` — bottom/top sheet layout.
- `src/components/ui/skeleton.tsx` — skeleton loading placeholders.
- `src/components/ui/slider.tsx` — slider input.
- `src/components/ui/skeleton.tsx` — loading skeletons (duplicate path may indicate variants).
- `src/components/ui/sonner.tsx` — toast/notifications wrapper using Sonner.
- `src/components/ui/switch.tsx` — switch/toggle control.
- `src/components/ui/table.tsx` — table component used for bulk editing flows.
- `src/components/ui/tabs.tsx` — tabbed navigation.
- `src/components/ui/toggle.tsx` — toggle button wrapper.
- `src/components/ui/toggle-group.tsx` — group of toggle buttons.
- `src/components/ui/tooltip.tsx` — tooltip helper.
- `src/components/ui/textarea.tsx` — multi-line text input.
- `src/components/ui/utils.ts` — small UI utilities used across components.
- `src/components/ui/use-mobile.ts` — mobile-detection hook.

### Guidelines & docs (in repo)
- `src/guidelines/Guidelines.md` — UX and development guidelines referenced by contributors.

---

If you'd like, I can now:
- Expand each file entry with the first 2–3 exported symbols and their types (useful for code navigation).
- Auto-generate links to each file within `rawfiles.md` (relative paths) so clicking opens them in the editor.
- Add a CI job that ensures `rawfiles.md` remains up-to-date.

Please tell me which of the above you'd prefer next and I'll implement it.
