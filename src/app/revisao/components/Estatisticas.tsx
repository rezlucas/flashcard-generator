"use client";

import { useEffect, useState, useCallback } from "react";
import type { Materia } from "../types";
import { formatMin } from "../utils";

type Periodo = "dia" | "semana" | "mes" | "ano" | "tudo";
type StatsData = {
  porMateria: Record<string, number>;
  totalMin: number;
  totalSessoes: number;
  pendentes: number;
  streak: number;
};

type Props = { materias: Materia[]; refreshKey: number };

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "dia", label: "Dia" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
  { key: "ano", label: "Ano" },
  { key: "tudo", label: "Tudo" },
];

// SVG Donut chart — sem dependência externa
function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const r = 68;
  const cx = 100;
  const cy = 100;
  const C = 2 * Math.PI * r;

  let angle = -90;
  const arcs = segments.map((s) => {
    const pct = s.value / total;
    const start = angle;
    angle += pct * 360;
    return { ...s, pct, start };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {arcs.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={26}
          strokeDasharray={`${s.pct * C} ${C}`}
          transform={`rotate(${s.start} ${cx} ${cy})`}
        >
          <title>{s.label}: {formatMin(s.value)} ({Math.round(s.pct * 100)}%)</title>
        </circle>
      ))}
      <circle cx={cx} cy={cy} r={r - 26} fill="transparent" />
    </svg>
  );
}

// Bar chart horizontal — sem dependência externa
function BarChart({ segments, max }: { segments: { label: string; value: number; color: string }[]; max: number }) {
  return (
    <div className="flex flex-col gap-2">
      {segments.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-32 text-right text-xs text-zinc-400 truncate flex-shrink-0">{s.label}</div>
          <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(s.value / max) * 100}%`, background: s.color }}
            />
          </div>
          <div className="w-16 text-xs text-zinc-500 flex-shrink-0">{formatMin(s.value)}</div>
        </div>
      ))}
    </div>
  );
}

export function Estatisticas({ materias, refreshKey }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: Periodo) => {
    setLoading(true);
    const res = await fetch(`/api/revisao/estatisticas?periodo=${p}`);
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(periodo); }, [load, periodo, refreshKey]);

  const materiaMap: Record<string, string> = Object.fromEntries(materias.map((m) => [m.id, m.nome]));
  const corMap: Record<string, string> = Object.fromEntries(materias.map((m) => [m.id, m.cor]));

  const segments = data
    ? Object.entries(data.porMateria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id, min]) => ({ label: materiaMap[id] ?? id, value: min, color: corMap[id] ?? "#6366f1" }))
    : [];

  const maxBar = segments[0]?.value ?? 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total estudado", value: data ? formatMin(data.totalMin) : "—" },
          { label: "Sessões", value: data?.totalSessoes ?? "—" },
          { label: "Streak (dias)", value: data?.streak ?? "—" },
          { label: "Rev. pendentes", value: data?.pendentes ?? "—" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-zinc-100">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Período tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              periodo === p.key
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center text-zinc-500 text-sm">
          Carregando...
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center text-zinc-500 text-sm">
          Sem dados para este período.
        </div>
      ) : (
        <>
          {/* Donut + legenda */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Tempo por matéria</h3>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-full sm:w-auto flex-shrink-0">
                <DonutChart segments={segments} total={data!.totalMin} />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {segments.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-zinc-400 flex-1 truncate">{s.label}</span>
                    <span className="text-xs text-zinc-500 flex-shrink-0 ml-auto">
                      {formatMin(s.value)} ({Math.round((s.value / data!.totalMin) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top matérias por tempo</h3>
            <BarChart segments={segments} max={maxBar} />
          </div>
        </>
      )}
    </div>
  );
}
