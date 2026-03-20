-- Map legacy Export Access rows to explicit plan "export" (plan was "free" + oneTimeExport).
UPDATE "Subscription"
SET plan = 'export'
WHERE "oneTimeExport" = true AND plan = 'free';
