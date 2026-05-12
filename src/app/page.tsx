"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { History, Download, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntradaConteudo } from "@/components/EntradaConteudo";
import { FlashcardPreview, type FlashcardData } from "@/components/FlashcardPreview";

interface GeracaoResult {
  id: string;
  materia: string | null;
  flashcards: FlashcardData[];
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [conteudo, setConteudo] = useState(searchParams.get("conteudo") ?? "");
  const [tipo, setTipo] = useState(searchParams.get("tipo") ?? "conceito");
  const [materia, setMateria] = useState("Auto-detectar");
  const [tiposCard, setTiposCard] = useState(["basico", "digitar", "cloze", "invertido"]);
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<GeracaoResult | null>(null);

  const gerar = useCallback(async () => {
    setLoading(true);
    try {
      let res: Response;

      if (tipo === "colorir") {
        if (!frente.trim() || !verso.trim()) return;
        res = await fetch("/api/colorir-flashcard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frente, verso, materia }),
        });
      } else {
        if (!conteudo.trim()) return;
        res = await fetch("/api/gerar-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conteudo, tipo, materia, tiposCard }),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro desconhecido");
      }
      const dados: GeracaoResult = await res.json();
      setResultado(dados);
      toast.success(
        tipo === "colorir"
          ? "Cores aplicadas com sucesso!"
          : `${dados.flashcards.length} flashcard(s) gerado(s)!`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao processar");
    } finally {
      setLoading(false);
    }
  }, [conteudo, tipo, materia, tiposCard, frente, verso]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        gerar();
      }
      if (resultado && e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        const card = resultado.flashcards[idx];
        if (card) {
          const tsv =
            card.tipoCard === "invertido"
              ? `${card.frente}\t${card.verso}\ty\t${card.tags}`
              : `${card.frente}\t${card.verso}\t${card.tags}`;
          navigator.clipboard.writeText(tsv);
          toast.success(`Flashcard #${e.key} copiado como TSV!`);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gerar, resultado]);

  function exportarTSV() {
    if (!resultado) return;
    const tsv = resultado.flashcards
      .map((f) =>
        f.tipoCard === "invertido"
          ? `${f.frente}\t${f.verso}\ty\t${f.tags}`
          : `${f.frente}\t${f.verso}\t${f.tags}`
      )
      .join("\n");
    navigator.clipboard.writeText(tsv);
    toast.success("Todos os flashcards copiados como TSV!");
  }

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="min-h-screen bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-100">
              Flashcards para Anki
            </h1>
            <p className="text-xs text-zinc-400">
              Concursos Públicos · IA + paleta mnemônica
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/historico">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </Link>
            <Link href="/revisao">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Revisão 24/7/30
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
          <aside>
            <EntradaConteudo
              conteudo={conteudo}
              setConteudo={setConteudo}
              tipo={tipo}
              setTipo={setTipo}
              materia={materia}
              setMateria={setMateria}
              tiposCard={tiposCard}
              setTiposCard={setTiposCard}
              frente={frente}
              setFrente={setFrente}
              verso={verso}
              setVerso={setVerso}
              onGerar={gerar}
              loading={loading}
            />
            <p className="text-xs text-zinc-500 mt-2 text-center">
              Atalho: <kbd className="bg-zinc-800 px-1 rounded text-zinc-300">Ctrl+Enter</kbd> para gerar
            </p>
          </aside>

          <section className="flex flex-col gap-4">
            {resultado ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg text-zinc-100">
                      {resultado.materia ?? (tipo === "colorir" ? "Card colorido" : "Flashcards gerados")}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {resultado.flashcards.length} flashcard(s) · pressione 1–9 para copiar TSV
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setResultado(null)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Novo
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportarTSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Copiar todos (TSV)
                    </Button>
                  </div>
                </div>
                {resultado.flashcards.map((fc, i) => (
                  <FlashcardPreview key={fc.id} flashcard={fc} index={i} />
                ))}
                <ImportInstructions />
              </>
            ) : (
              <EmptyState tipo={tipo} />
            )}
          </section>
        </main>
      </div>
    </>
  );
}

function EmptyState({ tipo }: { tipo: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-3 text-zinc-500">
      <div className="text-5xl">{tipo === "colorir" ? "🎨" : "🎴"}</div>
      <p className="text-base font-medium text-zinc-300">
        {tipo === "colorir"
          ? "Cole a frente e o verso do seu card"
          : "Cole um conceito ou tema"}
      </p>
      <p className="text-sm">
        {tipo === "colorir"
          ? "O sistema aplica as cores mnemônicas mantendo o conteúdo original."
          : "Os flashcards aparecerão aqui com cores mnemônicas prontas para o Anki."}
      </p>
    </div>
  );
}

function ImportInstructions() {
  return (
    <details className="border border-zinc-800 rounded-lg p-4 bg-zinc-900 text-sm mt-2">
      <summary className="cursor-pointer font-medium text-zinc-400">
        Como importar no Anki
      </summary>
      <ol className="mt-3 space-y-1.5 list-decimal list-inside text-sm text-zinc-300">
        <li>No Anki: <strong>Arquivo → Importar</strong></li>
        <li>Selecione o tipo de nota correto (indicado em cada card acima)</li>
        <li>Marque: <strong>"Permitir HTML em campos" ✓</strong></li>
        <li>Separador: <strong>Tab</strong></li>
        <li>Mapeie os campos na ordem: Frente → Verso → Tags</li>
        <li>Para "Invertido opcional": Frente → Verso → Add Reverse → Tags</li>
      </ol>
    </details>
  );
}
