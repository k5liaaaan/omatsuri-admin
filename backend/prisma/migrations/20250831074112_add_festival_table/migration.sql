-- CreateTable
CREATE TABLE "festivals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "municipalityId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "foodStalls" TEXT,
    "sponsors" TEXT,
    "organizerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "festivals_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "festivals_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
