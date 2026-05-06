import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { PROMPT_SISTEMA, buildUserMessage } from "@/lib/prompt-flashcard";

export async function POST(req: NextRequest) {
  try {
    const { conteudo, tipo, materia, tiposCard } = await req.json();

    if (!conteudo?.trim()) {
      return NextResponse.json({ error: "Conteúdo é obrigatório" }, { status: 400 });
    }

    const tiposAtivos: string[] = tiposCard?.length ? tiposCard : ["basico"];

    const resposta = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        { role: "user", content: buildUserMessage(conteudo, tipo, materia, tiposAtivos) },
      ],
    });

    const texto = resposta.choices[0]?.message?.content ?? "";
    const limpo = texto.replace(/```json|```/g, "").trim();
    const dados = JSON.parse(limpo);

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
    console.error("Erro ao gerar flashcards:", error);
    return NextResponse.json(
      { error: "Erro ao gerar flashcards. Verifique sua GROQ_API_KEY." },
      { status: 500 }
    );
  }
}
