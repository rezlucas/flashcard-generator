import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { conteudo, tipo, dados } = await req.json();

    const geracao = await prisma.geracao.create({
      data: {
        conteudoBruto: conteudo,
        tipo,
        materia: dados.materia,
        flashcards: {
          create: dados.flashcards.map((f: { tipo: string; frente: string; verso: string }) => ({
            frente: f.frente,
            verso: f.verso,
            tipoCard: f.tipo ?? "basico",
            tags: dados.tags.join(","),
          })),
        },
      },
      include: { flashcards: true },
    });

    return NextResponse.json(geracao);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
