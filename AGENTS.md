# Agent Notes

- Use `pnpm`; this repo has `pnpm-lock.yaml` and no npm/yarn/bun lockfile.
- Next.js is `16.2.6`. Read the relevant guide in `node_modules/next/dist/docs/` before Next-specific edits; APIs and file conventions may differ from older Next.js versions.
- Next 16 calls Middleware "Proxy". If request middleware is needed, create `src/proxy.ts` because the app uses `src/`.
- App Router entrypoints live in `src/app`; the `@/*` alias maps to `src/*`.
- This is a single-package app; `pnpm-workspace.yaml` only configures PNPM build approvals.

## Commands

- `pnpm dev`: start the Next dev server.
- `pnpm lint`: run ESLint.
- `pnpm typecheck`: run `tsc --noEmit`.
- `pnpm build`: run `prisma generate` then `next build`.
- No test runner is configured; use lint, typecheck, and build for verification unless tests are added.

## Database

- Prisma config is in `prisma.config.ts`; it loads `.env` via `dotenv/config` and expects `DATABASE_URL`.
- Local Postgres runs through Docker Compose: `pnpm db:up`, `pnpm db:down`, `pnpm db`.
- Create/apply dev migrations with `pnpm db:migrate <name>`; inspect data with `pnpm db:studio`.
- Prisma schema and migrations are versioned under `src/server/db/`.
- The generated Prisma client goes to `src/generated/prisma` and is gitignored. Regenerate it with `pnpm exec prisma generate` after schema or generator changes.
- `src/lib/prisma.ts` imports the generated client from `@/generated/prisma/client`; update that import if the generator output moves.

## Styling

- Tailwind CSS v4 is wired through `src/app/globals.css` and `postcss.config.mjs`; do not add Tailwind v3 config unless the toolchain changes.
