-- Make User.phone required and unique; remove phoneNormalized (values merged into phone)

-- Canonical phone: prefer digits from phoneNormalized when present
UPDATE "User" SET "phone" = "phoneNormalized" WHERE "phoneNormalized" IS NOT NULL;

-- Drop accounts that still have no phone (should be none if you had no legacy users)
DELETE FROM "User" WHERE "phone" IS NULL OR "phone" = '';

-- Remove old unique index and column
DROP INDEX IF EXISTS "User_phoneNormalized_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "phoneNormalized";

-- Enforce required phone
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;

-- Unique phone numbers
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
