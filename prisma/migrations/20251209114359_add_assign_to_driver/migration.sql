-- AlterTable
ALTER TABLE "TransportOrder" ADD COLUMN     "assignedDriverUserId" TEXT;

-- CreateIndex
CREATE INDEX "TransportOrder_assignedDriverUserId_idx" ON "TransportOrder"("assignedDriverUserId");

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_assignedDriverUserId_fkey" FOREIGN KEY ("assignedDriverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
