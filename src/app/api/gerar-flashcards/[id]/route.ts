import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/gerar-flashcards/[id]">
) {
  const { id } = await ctx.params;
  try {
    await prisma.geracao.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
