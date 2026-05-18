-- AlterTable
ALTER TABLE "TransportOrderRoutePoint" ADD COLUMN     "arrivalLatitude" DOUBLE PRECISION,
ADD COLUMN     "arrivalLongitude" DOUBLE PRECISION,
ADD COLUMN     "arrivedAt" TIMESTAMP(3);
