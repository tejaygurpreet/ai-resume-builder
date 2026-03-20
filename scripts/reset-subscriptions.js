/**
 * OptimaCV / ai-resume-builder — wipe subscription + Stripe-linked DB fields, reset every user to Free.
 *
 * Does NOT touch Stripe.com (do that in Dashboard → Test mode separately).
 *
 * Run (from repo root):
 *   cd ai-resume-builder && npm run db:reset-subscriptions
 *
 * Requires DATABASE_URL (e.g. from .env.local).
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { config } = require("dotenv");

// Load .env then .env.local so local overrides match `next dev`
config({ path: path.resolve(__dirname, "../.env") });
config({ path: path.resolve(__dirname, "../.env.local") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.subscription.deleteMany({});
  console.log(`Deleted ${deleted.count} subscription row(s).`);

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  if (users.length === 0) {
    console.log("No users found; nothing to recreate.");
    return;
  }

  for (const u of users) {
    await prisma.subscription.create({
      data: {
        userId: u.id,
        plan: "free",
        status: "active",
      },
    });
  }

  console.log(
    `Created fresh Free subscription rows for ${users.length} user(s).`
  );
  console.log("Stripe fields cleared (new rows have no customer/subscription IDs).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
