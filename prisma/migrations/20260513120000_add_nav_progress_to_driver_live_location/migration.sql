-- AlterTable
ALTER TABLE "DriverLiveLocation"
  ADD COLUMN "remainingDistanceMeters"  INTEGER,
  ADD COLUMN "traveledDistanceMeters"   INTEGER,
  ADD COLUMN "remainingDurationSeconds" INTEGER;
