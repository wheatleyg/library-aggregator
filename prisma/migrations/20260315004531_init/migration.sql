-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "authorFirstName" TEXT NOT NULL,
    "authorLastName" TEXT NOT NULL,
    "ISBN_13" TEXT NOT NULL,
    "publish_date" DATETIME NOT NULL,
    "genre" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_ISBN_13_key" ON "Book"("ISBN_13");
