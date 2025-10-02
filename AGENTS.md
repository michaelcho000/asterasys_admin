# Repository Guidelines

## Project Structure & Module Organization
- `src/app` App Router routes/layouts per feature (dashboard, authentication, settings). Example: `src/app/dashboard/page.tsx`.
- `src/components` reusable UI and charts; supporting helpers live in `src/services`, `src/utils`, and `src/lib`.
- `src/store` client stores; `src/types` shared contracts; `src/assets` design tokens and media.
- Automation in `scripts/`; source CSVs in `data/`; SQL seeds in `database/`; Prisma schema and migrations in `prisma/`.
- Role-specific automation handbooks live in `agents/`.

## Build, Test, and Development Commands
- `npm run dev` boot the local Next.js dashboard with hot reload.
- `npm run build` / `npm run start` produce and serve the production bundle.
- `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check` enforce ESLint/Prettier.
- `npm run type-check` run the TypeScript compiler with `noEmit`.
- `npm run test`, `npm run test:watch`, `npm run test:coverage` execute Jest suites and report coverage.
- `npm run db:migrate`, `npm run db:migrate:prod`, `npm run db:generate`, `npm run db:seed` manage Prisma schema evolution.
- `npm run process-data`, `npm run ingest` refresh derived marketing datasets.

## Coding Style & Naming Conventions
- Prettier: two-space indentation and single quotes; run formatters before PRs.
- Components and stores use PascalCase; hooks use camelCase with a `use` prefix (e.g., `useAuthStore`).
- Utilities use kebab-case filenames (e.g., `format-date.ts`).
- Add `'use client'` to interactive modules and prefer functional components.
- Resolve shared modules via `@/...` and document reusable shapes in `src/types`.

## Testing Guidelines
- Jest with Testing Library. Place specs alongside code as `*.test.jsx|tsx` or inside `__tests__/`.
- Maintain ≥70% global coverage and stub integrations with `__mocks__/`.
- Example: `npm run test:coverage`.

## Commit & Pull Request Guidelines
- Commits: short, imperative subjects (e.g., `Enhance competitor analysis and outdoor ads features`).
- Before PRs: run linting, tests, and type checks.
- PRs include scope, affected routes, validation steps, and screenshots; link tracking tickets and flag database or ingest side effects with rollback notes.

## Agent Playbooks & Tips
- Keep `agents/` updated when tooling or workflows change; cross-link new utilities and required environment variables.
- Store secrets in `.env.local`; never commit credentials. After Prisma schema changes, run `npm run db:generate`.

