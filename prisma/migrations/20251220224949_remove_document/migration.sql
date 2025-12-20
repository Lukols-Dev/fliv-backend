/*
  Warnings:

  - You are about to drop the column `documentId` on the `OrderDocument` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storageKey]` on the table `OrderDocument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mimeType` to the `OrderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `OrderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `OrderDocument` table without a default value. This is not possible if the table is not empty.
  - Made the column `transportOrderId` on table `OrderDocument` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "OrderDocument" DROP CONSTRAINT "OrderDocument_documentId_fkey";

-- DropIndex
DROP INDEX "OrderDocument_documentId_idx";

-- AlterTable
ALTER TABLE "OrderDocument" DROP COLUMN "documentId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalFilename" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "uploadedByUserId" TEXT,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "transportOrderId" SET NOT NULL;

-- DropTable
DROP TABLE "Document";

-- CreateIndex
CREATE UNIQUE INDEX "OrderDocument_storageKey_key" ON "OrderDocument"("storageKey");

-- CreateIndex
CREATE INDEX "OrderDocument_uploadedByUserId_idx" ON "OrderDocument"("uploadedByUserId");

-- AddForeignKey
ALTER TABLE "OrderDocument" ADD CONSTRAINT "OrderDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
