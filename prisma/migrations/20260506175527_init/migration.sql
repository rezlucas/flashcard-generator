-- CreateTable
CREATE TABLE "Geracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conteudoBruto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "materia" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "geracaoId" TEXT NOT NULL,
    CONSTRAINT "Flashcard_geracaoId_fkey" FOREIGN KEY ("geracaoId") REFERENCES "Geracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
