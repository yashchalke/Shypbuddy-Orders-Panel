-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'NEW';

-- AlterTable
ALTER TABLE "Buyer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "orderno" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "state" TEXT;
