/*
  Warnings:

  - Added the required column `applicableWeight` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitprice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'RTO', 'CANCELLED');

-- DropIndex
DROP INDEX "Buyer_userId_phone_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "applicableWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "unitprice" DOUBLE PRECISION NOT NULL;
