export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { HistoricoActions } from "./HistoricoActions";

export default async function HistoricoPage() {
  const geracoes = await prisma.geracao.findMany({
    orderBy: { criadoEm: "desc" },
    include: { flashcards: true },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Histórico</h1>
          <p className="text-xs text-muted-foreground">
            {geracoes.length} geração(ões) salva(s)
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
        {geracoes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma geração ainda. Crie seus primeiros flashcards!</p>
            <Link href="/">
              <Button className="mt-4">Gerar flashcards</Button>
            </Link>
          </div>
        ) : (
          geracoes.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {g.materia ?? "Matéria não identificada"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(g.criadoEm).toLocaleString("pt-BR")} ·{" "}
                      {g.tipo} · {g.flashcards.length} flashcard(s)
                    </p>
                  </div>
                  <HistoricoActions geracaoId={g.id} conteudo={g.conteudoBruto} tipo={g.tipo} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {g.conteudoBruto}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {g.flashcards.flatMap((f) =>
                    f.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge key={`${f.id}-${tag}`} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                  ).slice(0, 8)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
