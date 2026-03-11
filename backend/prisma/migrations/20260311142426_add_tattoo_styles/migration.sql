-- DropIndex
DROP INDEX "AvailabilityBlock_artistId_date_idx";

-- CreateTable
CREATE TABLE "TattooStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TattooStyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TattooStyle_artistId_name_key" ON "TattooStyle"("artistId", "name");

-- AddForeignKey
ALTER TABLE "TattooStyle" ADD CONSTRAINT "TattooStyle_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
