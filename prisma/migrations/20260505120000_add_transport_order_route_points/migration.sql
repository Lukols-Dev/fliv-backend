-- CreateEnum
CREATE TYPE "TransportOrderRoutePointType" AS ENUM ('LOADING', 'UNLOADING', 'VIA');

-- CreateEnum
CREATE TYPE "TransportOrderRoutePointSource" AS ENUM ('DISPATCHER', 'SYSTEM', 'HERE');

-- CreateTable
CREATE TABLE "TransportOrderRoutePoint" (
    "id" TEXT NOT NULL,
    "transportOrderId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "TransportOrderRoutePointType" NOT NULL,
    "source" "TransportOrderRoutePointSource" NOT NULL DEFAULT 'DISPATCHER',
    "isManual" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportOrderRoutePoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransportOrderRoutePoint_transportOrderId_sequence_key" ON "TransportOrderRoutePoint"("transportOrderId", "sequence");

-- CreateIndex
CREATE INDEX "TransportOrderRoutePoint_transportOrderId_idx" ON "TransportOrderRoutePoint"("transportOrderId");

-- AddForeignKey
ALTER TABLE "TransportOrderRoutePoint" ADD CONSTRAINT "TransportOrderRoutePoint_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "TransportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
