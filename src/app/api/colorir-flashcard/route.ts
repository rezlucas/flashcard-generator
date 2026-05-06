import { NextRequest, NextResponse } from "next/server";
import { getGroq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { PROMPT_COLORIR } from "@/lib/prompt-colorir";

export async function POST(req: NextRequest) {
  try {
    const { frente, verso, materia } = await req.json();

    if (!frente?.trim() || !verso?.trim()) {
      return NextResponse.json(
        { error: "Frente e verso são obrigatórios" },
        { status: 400 }
      );
    }

    const resposta = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: PROMPT_COLORIR },
        {
          role: "user",
          content: `FRENTE:\n${frente}\n\nVERSO:\n${verso}`,
        },
      ],
    });

    const texto = resposta.choices[0]?.message?.content ?? "";
    const limpo = texto.replace(/```json|```/g, "").trim();
    const dados = JSON.parse(limpo);

    const geracao = await prisma.geracao.create({
      data: {
        conteudoBruto: `FRENTE: ${frente}\nVERSO: ${verso}`,
        tipo: "colorir",
        materia: materia ?? null,
        flashcards: {
          create: [
            {
              frente: dados.frente,
              verso: dados.verso,
              tipoCard: "basico",
              tags: materia ? materia.toLowerCase().replace(/\s+/g, "-") : "",
            },
          ],
        },
      },
      include: { flashcards: true },
    });

    return NextResponse.json(geracao);
  } catch (error) {
    console.error("Erro ao colorir flashcard:", error);
    return NextResponse.json(
      { error: "Erro ao colorir flashcard." },
      { status: 500 }
    );
  }
}
