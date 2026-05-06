-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "tipoCard" TEXT NOT NULL DEFAULT 'basico',
    "geracaoId" TEXT NOT NULL,
    CONSTRAINT "Flashcard_geracaoId_fkey" FOREIGN KEY ("geracaoId") REFERENCES "Geracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Flashcard" ("frente", "geracaoId", "id", "tags", "verso") SELECT "frente", "geracaoId", "id", "tags", "verso" FROM "Flashcard";
DROP TABLE "Flashcard";
ALTER TABLE "new_Flashcard" RENAME TO "Flashcard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
