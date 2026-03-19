# Database migrations

## Current layout

A **single baseline migration** creates the full schema (all tables, indexes, FKs) in one step:

- `migrations/20250101000000_init_schema/migration.sql`

This replaces older fragmented migrations that only `ALTER`ed tables (e.g. `Subscription`) and failed on Prisma’s **shadow database** with **P3006**.

`User.phone` is **required** and **`@unique`**. Values are normalized digits (10–15) at signup for consistent uniqueness.

## Commands

| Command | When to use |
|--------|----------------|
| `npx prisma migrate reset` | **Dev only.** Drops the database, reapplies all migrations, runs seed if configured. **Destroys all data.** Use `--force` to skip the prompt. |
| `npx prisma migrate deploy` | Production / CI — apply pending migrations without shadow DB. |
| `npx prisma migrate dev` | Local dev — should work now that the baseline creates `Subscription` and related tables. |
| `npx prisma generate` | After schema or migration changes. |

## If you changed migration history (this fix)

Existing databases still have **old** `_prisma_migrations` rows and **old** table definitions. They are **out of sync** with this repo.

- **Development, data can be lost:**  
  `npx prisma migrate reset --force`  
  (or point `DATABASE_URL` at a fresh empty database, then `migrate deploy`)

- **Production / data to keep:**  
  Do **not** reset. Use [Prisma baselining](https://www.prisma.io/docs/guides/migrate/developing-and-prod#baselining-a-database) or restore from backup and align migrations with support from your team.
