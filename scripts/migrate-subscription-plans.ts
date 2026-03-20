/**
 * One-off: set plan = 'export' for users with oneTimeExport on free (legacy).
 * Run: npx tsx scripts/migrate-subscription-plans.ts
 * (Same as prisma migration 20260320120000_export_plan_enum_data.sql)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const r = await prisma.subscription.updateMany({
    where: { oneTimeExport: true, plan: "free" },
    data: { plan: "export" },
  });
  console.log("Updated subscriptions to plan=export:", r.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
