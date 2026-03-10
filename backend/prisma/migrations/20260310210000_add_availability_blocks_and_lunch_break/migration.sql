ALTER TABLE "Availability"
ADD COLUMN "lunchStart" TEXT,
ADD COLUMN "lunchEnd" TEXT;

CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AvailabilityBlock"
ADD CONSTRAINT "AvailabilityBlock_artistId_fkey"
FOREIGN KEY ("artistId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "AvailabilityBlock_artistId_date_idx" ON "AvailabilityBlock"("artistId", "date");