"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Materia, Sessao } from "../types";
import { tipoBadgeClass, formatMin, formatDate, toDateStr } from "../utils";

const PAGE_SIZE = 15;

type Props = { materias: Materia[]; refreshKey: number };

export function Sessoes({ materias, refreshKey }: Props) {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtMateria, setFiltMateria] = useState("");
  const [filtTipo, setFiltTipo] = useState("");
  const [filtDe, setFiltDe] = useState("");
  const [filtAte, setFiltAte] = useState("");
  const [pagina, setPagina] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtMateria) params.set("materiaId", filtMateria);
    if (filtTipo) params.set("tipo", filtTipo);
    if (filtDe) params.set("de", filtDe);
    if (filtAte) params.set("ate", filtAte);
    const res = await fetch("/api/revisao/sessoes?" + params);
    setSessoes(await res.json());
    setLoading(false);
  }, [filtMateria, filtTipo, filtDe, filtAte]);

  useEffect(() => { setPagina(1); load(); }, [load, refreshKey]);

  const materiaMap: Record<string, string> = Object.fromEntries(
    materias.map((m) => [m.id, m.nome])
  );
  const corMap: Record<string, string> = Object.fromEntries(
    materias.map((m) => [m.id, m.cor])
  );
  const pais = materias.filter((m) => !m.paiId);

  async function deletar(id: string) {
    if (!confirm("Excluir esta sessão?")) return;
    await fetch(`/api/revisao/sessoes/${id}`, { method: "DELETE" });
    toast.success("Sessão excluída.");
    load();
  }

  const total = sessoes.length;
  const inicio = (pagina - 1) * PAGE_SIZE;
  const paginas = Math.ceil(total / PAGE_SIZE);
  const visíveis = sessoes.slice(inicio, inicio + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filtMateria}
          onChange={(e) => setFiltMateria(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[180px]"
        >
          <option value="">Todas as matérias</option>
          {pais.map((p) => {
            const filhas = materias.filter((m) => m.paiId === p.id);
            return (
              <optgroup key={p.id} label={p.nome}>
                <option value={p.id}>{p.nome}</option>
                {filhas.map((f) => (
                  <option key={f.id} value={f.id}>{"  ↳ " + f.nome}</option>
                ))}
              </optgroup>
            );
          })}
        </select>

        <select
          value={filtTipo}
          onChange={(e) => setFiltTipo(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Todos os tipos</option>
          {["Estudo Inicial", "Revisão 24h", "Revisão 7d", "Revisão 30d", "Avulsa"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="date"
          value={filtDe}
          onChange={(e) => setFiltDe(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          title="De"
        />
        <input
          type="date"
          value={filtAte}
          onChange={(e) => setFiltAte(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          title="Até"
        />
      </div>

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Matéria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duração</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Observações</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500">Carregando...</td>
                </tr>
              ) : visíveis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500">Nenhuma sessão encontrada.</td>
                </tr>
              ) : (
                visíveis.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{formatDate(s.data)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: corMap[s.materiaId] ?? "#6366f1" }} />
                        <span className="text-zinc-200">{materiaMap[s.materiaId] ?? s.materiaId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${tipoBadgeClass(s.tipo)}`}>
                        {s.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{formatMin(s.duracaoMin)}</td>
                    <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate hidden md:table-cell">
                      {s.observacoes ?? "—"}
                    </td>
                    <td className="px-2">
                      <button
                        onClick={() => deletar(s.id)}
                        className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-500">
              {inicio + 1}–{Math.min(inicio + PAGE_SIZE, total)} de {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                className="h-7 px-2 text-zinc-400"
              >
                ‹
              </Button>
              {Array.from({ length: Math.min(paginas, 5) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === pagina ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPagina(p)}
                  className={`h-7 w-7 p-0 text-xs ${p === pagina ? "bg-blue-600 text-white" : "text-zinc-400"}`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={pagina >= paginas}
                onClick={() => setPagina((p) => p + 1)}
                className="h-7 px-2 text-zinc-400"
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
