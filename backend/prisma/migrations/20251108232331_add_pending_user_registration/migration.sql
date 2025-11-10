-- AlterTable
ALTER TABLE "users" ADD COLUMN "organizerName" TEXT;

-- CreateTable
CREATE TABLE "pending_user_registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_user_registrations_email_key" ON "pending_user_registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pending_user_registrations_token_key" ON "pending_user_registrations"("token");
