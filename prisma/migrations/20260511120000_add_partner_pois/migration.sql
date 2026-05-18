-- CreateEnum
CREATE TYPE "PartnerPoiType" AS ENUM ('FUEL', 'PARKING', 'SERVICE', 'OTHER');

-- CreateTable
CREATE TABLE "PartnerPoi" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" "PartnerPoiType" NOT NULL DEFAULT 'FUEL',
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPoi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerPoi_isActive_latitude_longitude_idx" ON "PartnerPoi"("isActive", "latitude", "longitude");
