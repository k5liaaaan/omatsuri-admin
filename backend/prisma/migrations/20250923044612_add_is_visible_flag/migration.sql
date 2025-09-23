-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_festivals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "municipalityId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "foodStalls" TEXT,
    "sponsors" TEXT,
    "organizerId" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "festivals_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "festivals_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_festivals" ("address", "content", "createdAt", "foodStalls", "id", "municipalityId", "name", "organizerId", "sponsors", "updatedAt") SELECT "address", "content", "createdAt", "foodStalls", "id", "municipalityId", "name", "organizerId", "sponsors", "updatedAt" FROM "festivals";
DROP TABLE "festivals";
ALTER TABLE "new_festivals" RENAME TO "festivals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
