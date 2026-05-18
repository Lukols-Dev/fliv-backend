-- Add route point behavior first so existing rows can receive a routing behavior.
CREATE TYPE "TransportOrderRoutePointBehavior" AS ENUM ('STOP', 'PASS_THROUGH');

ALTER TABLE "TransportOrderRoutePoint"
  ADD COLUMN "behavior" "TransportOrderRoutePointBehavior" NOT NULL DEFAULT 'STOP';

UPDATE "TransportOrderRoutePoint"
SET "behavior" = 'PASS_THROUGH'
WHERE "type" = 'VIA';

-- Replace the old business type enum and migrate previous VIA rows to OTHER.
CREATE TYPE "TransportOrderRoutePointType_new" AS ENUM (
  'LOADING',
  'UNLOADING',
  'FUEL',
  'PARKING',
  'SERVICE',
  'OTHER'
);

ALTER TABLE "TransportOrderRoutePoint"
  ALTER COLUMN "type" TYPE "TransportOrderRoutePointType_new"
  USING (
    CASE
      WHEN "type"::text = 'VIA' THEN 'OTHER'
      ELSE "type"::text
    END
  )::"TransportOrderRoutePointType_new";

DROP TYPE "TransportOrderRoutePointType";
ALTER TYPE "TransportOrderRoutePointType_new" RENAME TO "TransportOrderRoutePointType";

CREATE TABLE "TransportOrderRoutePlan" (
  "id" TEXT NOT NULL,
  "transportOrderId" TEXT NOT NULL,
  "routingProfile" JSONB NOT NULL,
  "vehicleSpec" JSONB,
  "distanceMeters" INTEGER NOT NULL,
  "durationSeconds" INTEGER NOT NULL,
  "polyline" TEXT NOT NULL,
  "calculationHash" TEXT NOT NULL,
  "calculatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TransportOrderRoutePlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransportOrderRoutePreview" (
  "id" TEXT NOT NULL,
  "transportOrderId" TEXT NOT NULL,
  "calculationHash" TEXT NOT NULL,
  "calculationInput" JSONB NOT NULL,
  "calculatedRoute" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TransportOrderRoutePreview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransportOrderRoutePlan_transportOrderId_key"
  ON "TransportOrderRoutePlan"("transportOrderId");

CREATE INDEX "TransportOrderRoutePreview_transportOrderId_idx"
  ON "TransportOrderRoutePreview"("transportOrderId");

CREATE INDEX "TransportOrderRoutePreview_expiresAt_idx"
  ON "TransportOrderRoutePreview"("expiresAt");

ALTER TABLE "TransportOrderRoutePlan"
  ADD CONSTRAINT "TransportOrderRoutePlan_transportOrderId_fkey"
  FOREIGN KEY ("transportOrderId") REFERENCES "TransportOrder"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
