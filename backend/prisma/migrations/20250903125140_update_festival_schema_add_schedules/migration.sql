/*
  Warnings:

  - You are about to drop the column `endDate` on the `festivals` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `festivals` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "festival_schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "festivalId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "festival_schedules_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "festivals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_festivals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_festivals" ("address", "content", "createdAt", "foodStalls", "id", "municipalityId", "organizerId", "sponsors", "updatedAt") SELECT "address", "content", "createdAt", "foodStalls", "id", "municipalityId", "organizerId", "sponsors", "updatedAt" FROM "festivals";
DROP TABLE "festivals";
ALTER TABLE "new_festivals" RENAME TO "festivals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
