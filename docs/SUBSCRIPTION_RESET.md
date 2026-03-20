# Reset subscriptions & Stripe test data (OptimaCV)

Use this when you want a **clean slate** for billing after test/live mixing or bad Stripe IDs in the database.

## What this app stores

- There is **no** `subscriptionTier` column on `User`. Plan state lives in the **`Subscription`** table: `plan` (`free` | `export` | `pro`), `stripeCustomerId`, `stripeSubscriptionId`, `planInterval`, `oneTimeExport`, etc.

## 1. Reset the database (subscriptions only)

From the **`ai-resume-builder`** directory:

```bash
npm install
npm run db:reset-subscriptions
```

This will:

1. **Delete every row** in `Subscription`.
2. **Create a new row** per user with `plan: "free"`, `status: "active"` (same as a new signup). All Stripe-related fields are unset.

Users, resumes, and auth are **not** deleted.

If `DATABASE_URL` is missing, ensure `.env` / `.env.local` exists (the script loads both via `dotenv`).

## 2. Clear Stripe **test mode** data (manual)

Do this in the [Stripe Dashboard](https://dashboard.stripe.com) with **Test mode** toggled **on**:

1. **Customers** — select all (or bulk) → delete customers (subscriptions/payment methods go with them where applicable).
2. Or use **Developers → Data** (if available on your account) to bulk-delete test objects.
3. Optionally **Products / Prices** — only delete if you want to recreate them; usually you keep prices and only delete **customers & subscriptions**.

We cannot run Dashboard actions from this repo.

## 3. After reset — smoke test

1. Use **one** Stripe mode locally: e.g. only **test** keys in `.env.local` (`STRIPE_SECRET_KEY` or `STRIPE_TEST_SECRET_KEY` + test price IDs).
2. Sign up a **new** test user (or use an existing user; they are now Free).
3. Buy **Pro Monthly** → complete Checkout.
4. Upgrade to **Pro Annual** → should prorate or redirect without mode mismatch if keys/prices match.

## Optional: raw SQL (PostgreSQL)

If you prefer SQL over the script:

```sql
DELETE FROM "Subscription";
```

Then recreate one `free` row per user (IDs must be unique strings; easiest is to use the Node script above so Prisma generates `cuid()` IDs correctly).
