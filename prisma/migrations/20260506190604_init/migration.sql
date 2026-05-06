-- CreateTable
CREATE TABLE "Geracao" (
    "id" TEXT NOT NULL,
    "conteudoBruto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "materia" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Geracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "tipoCard" TEXT NOT NULL DEFAULT 'basico',
    "geracaoId" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_geracaoId_fkey" FOREIGN KEY ("geracaoId") REFERENCES "Geracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
