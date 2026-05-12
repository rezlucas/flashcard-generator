-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "paiId" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#6366f1',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "duracaoMin" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "observacoes" TEXT,
    "sessaoOrigemId" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisaoAgendada" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "sessaoOrigemId" TEXT NOT NULL,
    "dataAlvo" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "concluidaEm" TIMESTAMP(3),
    "sessaoConcluidaId" TEXT,

    CONSTRAINT "RevisaoAgendada_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisaoAgendada" ADD CONSTRAINT "RevisaoAgendada_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisaoAgendada" ADD CONSTRAINT "RevisaoAgendada_sessaoOrigemId_fkey" FOREIGN KEY ("sessaoOrigemId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisaoAgendada" ADD CONSTRAINT "RevisaoAgendada_sessaoConcluidaId_fkey" FOREIGN KEY ("sessaoConcluidaId") REFERENCES "Sessao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
