-- AlterTable
ALTER TABLE "CasinoSettings" ADD COLUMN     "registeredAt" TIMESTAMP(3),
ADD COLUMN     "registeredCasinoId" TEXT,
ADD COLUMN     "registeredPublicKey" TEXT;
