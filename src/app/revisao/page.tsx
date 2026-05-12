"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { Plus, ArrowLeft, LayoutDashboard, FileText, FolderTree, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Materia, SessaoPrefill, Sessao } from "./types";
import { Painel } from "./components/Painel";
import { Sessoes } from "./components/Sessoes";
import { Materias } from "./components/Materias";
import { Estatisticas } from "./components/Estatisticas";
import { ModalNovaSessao } from "./components/ModalNovaSessao";

export default function RevisaoPage() {
  const [activeTab, setActiveTab] = useState("painel");
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<SessaoPrefill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMaterias = useCallback(async () => {
    const res = await fetch("/api/revisao/materias");
    if (res.ok) setMaterias(await res.json());
  }, []);

  const loadSessoes = useCallback(async () => {
    const res = await fetch("/api/revisao/sessoes");
    if (res.ok) setSessoes(await res.json());
  }, []);

  useEffect(() => {
    loadMaterias();
    loadSessoes();
  }, [loadMaterias, loadSessoes]);

  function handleMarcarFeito(p: SessaoPrefill) {
    setPrefill(p);
    setModalOpen(true);
  }

  function handleNovaSessao() {
    setPrefill(null);
    setModalOpen(true);
  }

  async function handleSessaoSaved() {
    setModalOpen(false);
    setPrefill(null);
    await Promise.all([loadMaterias(), loadSessoes()]);
    setRefreshKey((k) => k + 1);
  }

  // Pré-calcula stats de sessões por matéria para o componente Matérias
  const sessoesPorMateria: Record<string, { count: number; min: number }> = {};
  for (const s of sessoes) {
    const e = sessoesPorMateria[s.materiaId] ?? { count: 0, min: 0 };
    sessoesPorMateria[s.materiaId] = { count: e.count + 1, min: e.min + s.duracaoMin };
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="min-h-screen bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Flashcards</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-100">
                Revisão 24/7/30
              </h1>
              <p className="text-xs text-zinc-500 capitalize hidden sm:block">{hoje}</p>
            </div>
          </div>
          <Button
            onClick={handleNovaSessao}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Nova Sessão</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 h-auto p-1 gap-1">
              <TabsTrigger
                value="painel"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-500 gap-1.5 text-xs sm:text-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Painel
              </TabsTrigger>
              <TabsTrigger
                value="sessoes"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-500 gap-1.5 text-xs sm:text-sm"
              >
                <FileText className="h-3.5 w-3.5" />
                Sessões
              </TabsTrigger>
              <TabsTrigger
                value="materias"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-500 gap-1.5 text-xs sm:text-sm"
              >
                <FolderTree className="h-3.5 w-3.5" />
                Matérias
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-500 gap-1.5 text-xs sm:text-sm"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="painel" className="mt-0">
              <Painel
                materias={materias}
                refreshKey={refreshKey}
                onMarcarFeito={handleMarcarFeito}
              />
            </TabsContent>

            <TabsContent value="sessoes" className="mt-0">
              <Sessoes materias={materias} refreshKey={refreshKey} />
            </TabsContent>

            <TabsContent value="materias" className="mt-0">
              <Materias
                materias={materias}
                sessoesPorMateria={sessoesPorMateria}
                onChanged={() => { loadMaterias(); loadSessoes(); }}
              />
            </TabsContent>

            <TabsContent value="estatisticas" className="mt-0">
              <Estatisticas materias={materias} refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ModalNovaSessao
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPrefill(null); }}
        materias={materias}
        prefill={prefill}
        onSaved={handleSessaoSaved}
      />
    </>
  );
}
