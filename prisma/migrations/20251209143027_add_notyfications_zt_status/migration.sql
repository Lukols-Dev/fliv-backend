-- CreateEnum
CREATE TYPE "TransportOrderEventType" AS ENUM ('STATUS_CHANGED', 'INCIDENT_DETOUR', 'INCIDENT_ACCIDENT', 'INCIDENT_DELAY', 'ROUTE_PAUSED', 'ROUTE_RESUMED', 'ROUTE_FINISHED', 'PROBLEM_REPORTED', 'ORDER_ASSIGNED', 'ORDER_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS_CHANGED', 'ORDER_EVENT');

-- AlterEnum
ALTER TYPE "TransportOrderStatus" ADD VALUE 'PAUSED';

-- CreateTable
CREATE TABLE "TransportOrderEvent" (
    "id" TEXT NOT NULL,
    "transportOrderId" TEXT NOT NULL,
    "type" "TransportOrderEventType" NOT NULL,
    "previousStatus" "TransportOrderStatus",
    "newStatus" "TransportOrderStatus",
    "description" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportOrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransportOrderEvent_transportOrderId_idx" ON "TransportOrderEvent"("transportOrderId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "TransportOrderEvent" ADD CONSTRAINT "TransportOrderEvent_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "TransportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
