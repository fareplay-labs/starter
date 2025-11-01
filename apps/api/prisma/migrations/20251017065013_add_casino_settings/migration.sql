-- CreateTable
CREATE TABLE "CasinoSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'Fare Casino',
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "poolAddress" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#8b5cf6',
    "status" "CasinoStatus" NOT NULL DEFAULT 'INACTIVE',
    "websiteUrl" TEXT,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasinoSettings_pkey" PRIMARY KEY ("id")
);
