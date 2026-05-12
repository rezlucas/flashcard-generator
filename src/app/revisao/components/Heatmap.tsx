"use client";

import { useMemo, useState } from "react";
import type { Sessao } from "../types";
import { toDateStr, addDays, formatMin } from "../utils";

const LEVEL_CLASSES = [
  "bg-zinc-800",
  "bg-blue-900",
  "bg-blue-700",
  "bg-blue-500",
  "bg-blue-400",
];

function getLevel(min: number): number {
  if (!min) return 0;
  if (min <= 30) return 1;
  if (min <= 60) return 2;
  if (min <= 120) return 3;
  return 4;
}

type DayData = {
  date: string;
  min: number;
  level: number;
  future: boolean;
  sessoes: { nome: string; min: number }[];
};

type Props = { sessoes: Sessao[]; materiaNames: Record<string, string> };

export function Heatmap({ sessoes, materiaNames }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    day: DayData;
  } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const hoje = new Date();
    const hojeStr = toDateStr(hoje);
    const inicioSemana = addDays(hoje, -364);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

    const minByDate: Record<string, number> = {};
    const sessoesByDate: Record<string, { nome: string; min: number }[]> = {};
    for (const s of sessoes) {
      minByDate[s.data] = (minByDate[s.data] ?? 0) + s.duracaoMin;
      if (!sessoesByDate[s.data]) sessoesByDate[s.data] = [];
      sessoesByDate[s.data].push({
        nome: materiaNames[s.materiaId] ?? s.materiaId,
        min: s.duracaoMin,
      });
    }

    const weeks: DayData[][] = [];
    const monthLabels: { weekIdx: number; label: string }[] = [];
    const seen = new Set<string>();
    let cur = new Date(inicioSemana);
    let week: DayData[] = [];

    while (cur <= hoje || week.length > 0) {
      const str = toDateStr(cur);
      const mesKey = str.slice(0, 7);
      if (!seen.has(mesKey)) {
        seen.add(mesKey);
        monthLabels.push({ weekIdx: weeks.length, label: cur.toLocaleString("pt-BR", { month: "short" }) });
      }
      week.push({
        date: str,
        min: minByDate[str] ?? 0,
        level: getLevel(minByDate[str] ?? 0),
        future: str > hojeStr,
        sessoes: sessoesByDate[str] ?? [],
      });
      if (cur.getDay() === 6) {
        weeks.push(week);
        week = [];
      }
      cur = addDays(cur, 1);
      if (str === hojeStr && cur > hoje) break;
    }
    if (week.length) weeks.push(week);

    return { weeks, monthLabels };
  }, [sessoes, materiaNames]);

  return (
    <div className="relative overflow-x-auto">
      {/* Month labels */}
      <div className="flex gap-[2px] mb-1 pl-7">
        {weeks.map((_, i) => {
          const lbl = monthLabels.find((m) => m.weekIdx === i);
          return (
            <div key={i} className="w-3 flex-shrink-0 text-[9px] text-zinc-500 font-medium">
              {lbl?.label ?? ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-[2px]">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[2px] mr-1 flex-shrink-0">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className={`w-3 h-3 text-[9px] text-zinc-600 flex items-center ${i % 2 !== 0 ? "invisible" : ""}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px] flex-shrink-0">
            {Array.from({ length: 7 }, (_, di) => {
              const day = week.find((d) => {
                const date = new Date(d.date + "T12:00:00");
                return date.getDay() === di;
              });
              if (!day) return <div key={di} className="w-3 h-3" />;
              return (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${
                    day.future ? "opacity-0 pointer-events-none" : LEVEL_CLASSES[day.level]
                  }`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ x: rect.left, y: rect.top, day });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-zinc-500">Menos</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-zinc-500">Mais</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-200 shadow-xl pointer-events-none max-w-[200px]"
          style={{ left: tooltip.x + 16, top: tooltip.y - 8 }}
        >
          <div className="font-semibold mb-1">
            {new Date(tooltip.day.date + "T12:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {tooltip.day.min > 0 && ` — ${formatMin(tooltip.day.min)}`}
          </div>
          {tooltip.day.sessoes.length === 0 ? (
            <div className="text-zinc-500">Sem sessões</div>
          ) : (
            tooltip.day.sessoes.map((s, i) => (
              <div key={i} className="text-zinc-400">
                {s.nome}: {formatMin(s.min)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
