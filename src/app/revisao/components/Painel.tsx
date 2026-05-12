"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Clock, CalendarDays, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardData, Materia, SessaoPrefill, RevisaoAgendada } from "../types";
import { tipoBadgeClass, tipoLabel, prioridadeTipo, formatMin, formatDate, toDateStr } from "../utils";
import { Heatmap } from "./Heatmap";
import { CalendarioRevisoes } from "./CalendarioRevisoes";

type Props = {
  materias: Materia[];
  refreshKey: number;
  onMarcarFeito: (p: SessaoPrefill) => void;
};

export function Painel({ materias, refreshKey, onMarcarFeito }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revisao/dashboard");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const materiaMap: Record<string, string> = Object.fromEntries(materias.map((m) => [m.id, m.nome]));
  const corMap: Record<string, string> = Object.fromEntries(materias.map((m) => [m.id, m.cor]));

  async function handleAdiar(id: string) {
    try {
      await fetch(`/api/revisao/revisoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adiar" }),
      });
      toast.success("Revisão adiada para amanhã.");
      load();
    } catch {
      toast.error("Erro ao adiar revisão.");
    }
  }

  async function handleAdiantar(id: string) {
    try {
      await fetch(`/api/revisao/revisoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adiantar" }),
      });
      toast.success("Revisão adiantada para hoje.");
      load();
    } catch {
      toast.error("Erro ao adiantar revisão.");
    }
  }

  if (loading || !data) {
    return <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">Carregando...</div>;
  }

  const hoje = toDateStr(new Date());

  function sortByPrio(list: RevisaoAgendada[]) {
    return [...list].sort((a, b) => {
      const pa = prioridadeTipo(a.tipo) * 10 + Math.max(0, Math.floor((Date.parse(hoje) - Date.parse(a.dataAlvo)) / 86400000));
      const pb = prioridadeTipo(b.tipo) * 10 + Math.max(0, Math.floor((Date.parse(hoje) - Date.parse(b.dataAlvo)) / 86400000));
      return pb - pa;
    });
  }

  function ReviewItem({ r, isOverdue }: { r: RevisaoAgendada; isOverdue?: boolean }) {
    const atraso = Math.max(0, Math.floor((Date.parse(hoje) - Date.parse(r.dataAlvo)) / 86400000));
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
          isOverdue ? "border-red-900/60 bg-red-950/20" : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/40"
        }`}
      >
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${tipoBadgeClass(r.tipo)}`}>
          {tipoLabel(r.tipo)}
        </span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: corMap[r.materiaId] ?? "#6366f1" }} />
          <span className="text-sm font-medium text-zinc-200 truncate">{materiaMap[r.materiaId] ?? r.materiaId}</span>
          {atraso > 0 && <span className="text-xs text-red-400 flex-shrink-0">{atraso}d</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Adiar: move para amanhã */}
          <button
            onClick={() => handleAdiar(r.id)}
            title="Adiar para amanhã"
            className="text-[10px] text-zinc-500 hover:text-amber-400 border border-zinc-700 hover:border-amber-700/60 rounded px-1.5 py-1 transition-colors"
          >
            ↓ Adiar
          </button>
          {/* Marcar como feito */}
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2.5"
            onClick={() => onMarcarFeito({ revisaoId: r.id, materiaId: r.materiaId, tipo: r.tipo, sessaoOrigemId: r.sessaoOrigemId })}
          >
            Feito
          </Button>
        </div>
      </div>
    );
  }

  function ProximaItem({ r }: { r: RevisaoAgendada }) {
    const diasAte = Math.ceil((Date.parse(r.dataAlvo + "T12:00:00") - Date.parse(hoje + "T12:00:00")) / 86400000);
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${tipoBadgeClass(r.tipo)}`}>
          {tipoLabel(r.tipo)}
        </span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: corMap[r.materiaId] ?? "#6366f1" }} />
          <span className="text-sm text-zinc-400 truncate">{materiaMap[r.materiaId] ?? r.materiaId}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-zinc-500">{diasAte === 1 ? "amanhã" : formatDate(r.dataAlvo)}</span>
          {/* Adiantar: traz para hoje */}
          <button
            onClick={() => handleAdiantar(r.id)}
            title="Adiantar para hoje"
            className="text-[10px] text-zinc-500 hover:text-blue-400 border border-zinc-700 hover:border-blue-700/60 rounded px-1.5 py-1 transition-colors"
          >
            ↑ Hoje
          </button>
        </div>
      </div>
    );
  }

  const futuras = data.futuras ?? [];
  const totalPendente = data.hoje.length + data.atrasadas.length;
  const todasPendentes = [...data.atrasadas, ...data.hoje, ...futuras];

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{data.hoje.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Revisar hoje</div>
        </div>
        <div className={`bg-zinc-900 border rounded-lg p-4 text-center ${data.atrasadas.length > 0 ? "border-red-900/60" : "border-zinc-800"}`}>
          <div className={`text-2xl font-bold ${data.atrasadas.length > 0 ? "text-red-400" : "text-zinc-100"}`}>
            {data.atrasadas.length}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Atrasadas</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{futuras.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Agendadas</div>
        </div>
      </div>

      {/* Revisar agora */}
      {totalPendente === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-zinc-300 font-medium">Tudo em dia!</p>
          <p className="text-zinc-500 text-sm mt-1">Nenhuma revisão pendente para hoje.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-zinc-200">Revisar agora</span>
            <Badge variant="secondary" className="ml-auto bg-zinc-800 text-zinc-400 text-xs">{totalPendente}</Badge>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {data.atrasadas.length > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Atrasadas ({data.atrasadas.length})</span>
              </div>
            )}
            {sortByPrio(data.atrasadas).map((r) => <ReviewItem key={r.id} r={r} isOverdue />)}
            {data.atrasadas.length > 0 && data.hoje.length > 0 && <div className="border-t border-zinc-800 my-1" />}
            {sortByPrio(data.hoje).map((r) => <ReviewItem key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Próximas (3 dias) */}
      {data.proximas.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <CalendarDays className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-400">Próximas (3 dias)</span>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {[...data.proximas].sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo)).map((r) => (
              <ProximaItem key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}

      {/* Calendário de revisões */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">Calendário de revisões</span>
          <span className="text-xs text-zinc-600 ml-auto">{todasPendentes.length} pendentes</span>
        </div>
        <CalendarioRevisoes
          pendentes={todasPendentes}
          materias={materias}
          onAdiantar={handleAdiantar}
        />
      </div>

      {/* Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">Atividade — últimos 12 meses</span>
          {data.sessoes.length > 0 && (
            <span className="text-xs text-zinc-500 ml-auto">
              {formatMin(data.sessoes.reduce((a, s) => a + s.duracaoMin, 0))} total
            </span>
          )}
        </div>
        <Heatmap sessoes={data.sessoes} materiaNames={materiaMap} />
      </div>
    </div>
  );
}
