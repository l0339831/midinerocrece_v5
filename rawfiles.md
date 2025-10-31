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
