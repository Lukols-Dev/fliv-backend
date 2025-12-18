-- CreateEnum
CREATE TYPE "TransportOrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'LOADING', 'UNLOADING', 'COMPLETED', 'PROBLEM');

-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('DRIVER', 'DISPATCHER', 'SYSTEM');

-- CreateTable
CREATE TABLE "TransportOrder" (
    "id" TEXT NOT NULL,
    "ztNumber" TEXT NOT NULL,
    "pwNumber" TEXT,
    "status" "TransportOrderStatus" NOT NULL DEFAULT 'PENDING',
    "vehiclePlate" TEXT NOT NULL,
    "trailerPlate" TEXT,
    "driverFirstName" TEXT NOT NULL,
    "driverLastName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "contractNumber" TEXT,
    "payerName" TEXT,
    "payerVatId" TEXT,
    "payerEmail" TEXT,
    "fromCountry" TEXT NOT NULL,
    "toCountry" TEXT NOT NULL,
    "cargoWeightKg" DOUBLE PRECISION,
    "loadingDate" TIMESTAMP(3),
    "cargoDescription" TEXT,
    "temperatureSensitive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "originalFilename" TEXT,
    "description" TEXT,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDocument" (
    "id" TEXT NOT NULL,
    "transportOrderId" TEXT,
    "documentId" TEXT NOT NULL,
    "source" "DocumentSource" NOT NULL DEFAULT 'DISPATCHER',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransportOrder_ztNumber_key" ON "TransportOrder"("ztNumber");

-- CreateIndex
CREATE INDEX "TransportOrder_ztNumber_idx" ON "TransportOrder"("ztNumber");

-- CreateIndex
CREATE INDEX "TransportOrder_createdByUserId_idx" ON "TransportOrder"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_uploadedByUserId_idx" ON "Document"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "OrderDocument_transportOrderId_idx" ON "OrderDocument"("transportOrderId");

-- CreateIndex
CREATE INDEX "OrderDocument_documentId_idx" ON "OrderDocument"("documentId");

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDocument" ADD CONSTRAINT "OrderDocument_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "TransportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDocument" ADD CONSTRAINT "OrderDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
