"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RevisaoAgendada, Materia } from "../types";
import { tipoBadgeClass, toDateStr } from "../utils";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

type Props = {
  pendentes: RevisaoAgendada[];
  materias: Materia[];
  onAdiantar: (id: string) => void;
};

export function CalendarioRevisoes({ pendentes, materias, onAdiantar }: Props) {
  const hoje = new Date();
  const hojeStr = toDateStr(hoje);
  const [mesBase, setMesBase] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const corMap = Object.fromEntries(materias.map((m) => [m.id, m.cor]));
  const nomeMap = Object.fromEntries(materias.map((m) => [m.id, m.nome]));

  // Agrupa todas as pendentes (atrasadas + hoje + futuras) por data
  const porDia: Record<string, RevisaoAgendada[]> = {};
  for (const r of pendentes) {
    if (!porDia[r.dataAlvo]) porDia[r.dataAlvo] = [];
    porDia[r.dataAlvo].push(r);
  }

  // Gera células do mês
  const primeiroDia = mesBase;
  const ultimoDia = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 0);
  const offsetInicio = primeiroDia.getDay(); // 0=Dom

  const celulas: (string | null)[] = [];
  for (let i = 0; i < offsetInicio; i++) celulas.push(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    celulas.push(toDateStr(new Date(mesBase.getFullYear(), mesBase.getMonth(), d)));
  }
  while (celulas.length % 7 !== 0) celulas.push(null);

  const revisoesDodia = diaSelecionado ? (porDia[diaSelecionado] ?? []) : [];
  const isFuturo = diaSelecionado ? diaSelecionado > hojeStr : false;

  return (
    <div>
      {/* Navegação do mês */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() - 1, 1))}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-zinc-200">
          {MESES[mesBase.getMonth()]} {mesBase.getFullYear()}
        </span>
        <button
          onClick={() => setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1))}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Cabeçalho dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-zinc-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-[3px]">
        {celulas.map((dateStr, i) => {
          if (!dateStr) return <div key={i} className="min-h-[42px]" />;

          const revisoes = porDia[dateStr] ?? [];
          const isHoje = dateStr === hojeStr;
          const isPast = dateStr < hojeStr;
          const isSelected = dateStr === diaSelecionado;
          const hasReviews = revisoes.length > 0;
          const isOverdue = isPast && hasReviews;

          return (
            <div
              key={dateStr}
              onClick={() => setDiaSelecionado(dateStr === diaSelecionado ? null : dateStr)}
              className={[
                "relative flex flex-col items-center py-1 px-0.5 rounded-md cursor-pointer min-h-[42px] transition-all select-none",
                isHoje ? "ring-1 ring-blue-500 bg-blue-600/10" : "",
                isOverdue ? "bg-red-900/20" : "",
                isSelected ? "ring-1 ring-zinc-400 bg-zinc-800/80" : "",
                hasReviews && !isOverdue && !isHoje ? "hover:bg-zinc-800/60" : "",
                isPast && !hasReviews ? "opacity-30 pointer-events-none" : "",
                !hasReviews && !isHoje ? "cursor-default" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-xs font-medium leading-none mb-1",
                  isHoje ? "text-blue-400 font-bold" : isPast ? "text-zinc-600" : "text-zinc-300",
                ].join(" ")}
              >
                {new Date(dateStr + "T12:00:00").getDate()}
              </span>

              {/* Dots coloridos por matéria */}
              {hasReviews && (
                <div className="flex flex-wrap gap-[2px] justify-center max-w-[28px]">
                  {revisoes.slice(0, 4).map((r, j) => (
                    <span
                      key={j}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: corMap[r.materiaId] ?? "#6366f1" }}
                    />
                  ))}
                  {revisoes.length > 4 && (
                    <span className="text-[8px] text-zinc-500 leading-none">+{revisoes.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-600">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500/30 ring-1 ring-blue-500" /> Hoje</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-900/40" /> Atrasada</div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Revisão</div>
      </div>

      {/* Detalhe do dia selecionado */}
      {diaSelecionado && (
        <div className="mt-3 bg-zinc-800/50 border border-zinc-700/60 rounded-lg p-3">
          <p className="text-xs font-semibold text-zinc-400 mb-2">
            {new Date(diaSelecionado + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>

          {revisoesDodia.length === 0 ? (
            <p className="text-xs text-zinc-600">Sem revisões neste dia.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {revisoesDodia.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: corMap[r.materiaId] ?? "#6366f1" }}
                  />
                  <span className="text-xs text-zinc-200 flex-1 truncate">
                    {nomeMap[r.materiaId] ?? r.materiaId}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tipoBadgeClass(r.tipo)}`}>
                    {r.tipo}
                  </span>
                  {/* Adiantar só aparece para revisões futuras */}
                  {isFuturo && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAdiantar(r.id); setDiaSelecionado(null); }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-800/60 hover:border-blue-600 rounded px-1.5 py-0.5 transition-colors flex-shrink-0"
                      title="Adiantar para hoje"
                    >
                      ↑ Hoje
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
