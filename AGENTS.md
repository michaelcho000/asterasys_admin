# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains App Router routes and layouts per feature area (dashboard, authentication, settings).
- `src/components` holds reusable UI and charts; supporting helpers live in `src/services`, `src/utils`, and `src/lib`.
- Client stores live in `src/store`, shared contracts in `src/types`, and design assets in `src/assets`.
- Automation scripts reside in `scripts/`, with source CSVs in `data/`, SQL seeds in `database/`, and Prisma schema plus migrations in `prisma/`.
- Role-specific automation handbooks are collected in `agents/`.

## Build, Test, and Development Commands
- `npm run dev` – boot the local Next.js dashboard with hot reload.
- `npm run build` / `npm run start` – produce and serve the production bundle.
- `npm run lint`, `npm run lint:fix`, `npm run format[:check]` – enforce ESLint and Prettier.
- `npm run type-check` – run the TypeScript compiler with `noEmit`.
- `npm run test`, `test:watch`, `test:coverage` – execute Jest suites and report coverage.
- `npm run db:migrate`, `db:migrate:prod`, `db:generate`, `db:seed` – manage Prisma schema evolution.
- `npm run process-data` / `npm run ingest` – refresh derived marketing datasets.

## Coding Style & Naming Conventions
Prettier supplies two-space indentation and single quotes; run formatters before committing. Use PascalCase for components and stores, camelCase with a `use` prefix for hooks, and kebab-case filenames for utilities. Add `'use client'` to interactive modules and prefer functional components. Resolve shared modules through the `@/...` aliases and document reusable shapes in `src/types`.

## Testing Guidelines
Jest with Testing Library powers the suites (see `jest.config.js`). Place specs alongside code as `*.test.jsx|tsx` or inside `__tests__/` folders. Preserve the configured 70% global coverage and stub integrations with `__mocks__/`. Favour `npm run test:coverage` before release branches.

## Commit & Pull Request Guidelines
Follow the log precedent: short, imperative subjects such as `Enhance competitor analysis and outdoor ads features`. Bundle related changes per commit and expand rationale in the body only when needed. Before opening a PR, run linting, tests, and type checks, then document scope, affected routes, and validation steps. Attach UI screenshots, link tracking tickets, and flag database or ingest side effects with rollback notes.

## Agent Playbooks
Refresh the relevant file in `agents/` whenever tooling or workflows shift so automated contributors stay aligned. Cross-link new utilities, call out required environment variables, and keep instructions action-oriented.
