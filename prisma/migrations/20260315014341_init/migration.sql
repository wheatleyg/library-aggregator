/*
  Warnings:

  - You are about to drop the column `ISBN_13` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `authorFirstName` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `authorLastName` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publish_date` on the `Book` table. All the data in the column will be lost.
  - Added the required column `callNumber` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "isbn" TEXT,
    "lccn" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Book" ("id", "image", "title") SELECT "id", "image", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_callNumber_title_key" ON "Book"("callNumber", "title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
