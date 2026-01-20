-- Safely migrate Notification.message -> Notification.data (Json)
-- Requirements:
-- 1) add data as nullable
-- 2) backfill old rows with {}
-- 3) make data required
-- 4) drop message

ALTER TABLE "Notification"
ADD COLUMN "data" JSONB;

UPDATE "Notification"
SET "data" = '{}'::jsonb
WHERE "data" IS NULL;

ALTER TABLE "Notification"
ALTER COLUMN "data" SET NOT NULL;

ALTER TABLE "Notification"
DROP COLUMN "message";

