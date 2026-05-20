-- CreateEnum
CREATE TYPE "DriverLocationSource" AS ENUM ('HERE_SDK');

-- CreateTable
CREATE TABLE "DriverLiveLocation" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "transportOrderId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracyMeters" DOUBLE PRECISION,
    "speedMps" DOUBLE PRECISION,
    "bearingDegrees" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" "DriverLocationSource" NOT NULL DEFAULT 'HERE_SDK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverLiveLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverLiveLocation_transportOrderId_driverId_key" ON "DriverLiveLocation"("transportOrderId", "driverId");

-- CreateIndex
CREATE INDEX "DriverLiveLocation_transportOrderId_idx" ON "DriverLiveLocation"("transportOrderId");

-- CreateIndex
CREATE INDEX "DriverLiveLocation_driverId_idx" ON "DriverLiveLocation"("driverId");

-- AddForeignKey
ALTER TABLE "DriverLiveLocation" ADD CONSTRAINT "DriverLiveLocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLiveLocation" ADD CONSTRAINT "DriverLiveLocation_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "TransportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
