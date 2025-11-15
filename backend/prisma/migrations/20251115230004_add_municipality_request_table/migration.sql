-- CreateTable
CREATE TABLE "municipality_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prefectureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "municipality_requests_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "prefectures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
