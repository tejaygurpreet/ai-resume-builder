# Pricing update (2026)

## Database

- `Subscription.plan` values: `free`, `export`, `pro` (plus `planInterval` for Pro: `monthly` | `annual` | `lifetime`).
- Run Prisma migration `20260320120000_export_plan_enum_data` (or `npx prisma migrate deploy`) to set `plan = 'export'` where `oneTimeExport` was true on `free`.

## Stripe

Create new prices in Dashboard and set:

| Env | Purpose |
|-----|---------|
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Pro $9.99/mo |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Pro $79/yr |
| `STRIPE_PRO_LIFETIME_PRICE_ID` | Pro $199 once |
| `STRIPE_EXPORT_PRICE_ID` | Export Access $29 once |

Legacy `STRIPE_PRO_PRICE_ID` and `STRIPE_ONE_TIME_PRICE_ID` are still read as fallbacks.

## Product behavior

- **Free:** 2 exports/month, ad gate before export, 3 AI generations per resume (basic routes only).
- **Export Access:** Unlimited exports, no ads, no AI (existing `blockAiIfExportOnly`).
- **Pro:** Unlimited AI + exports, no ads.

## AdSense (optional)

- `NEXT_PUBLIC_ADSENSE_EXPORT_SLOT` — display ad unit for the export modal.
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` — defaults to your existing publisher ID if unset.
