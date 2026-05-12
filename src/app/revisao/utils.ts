import type { TipoRevisao } from "./types";

export function formatMin(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

export function tipoBadgeClass(tipo: string): string {
  if (tipo === "Revisão 24h") return "bg-blue-900/40 text-blue-300 border border-blue-800/50";
  if (tipo === "Revisão 7d") return "bg-amber-900/40 text-amber-300 border border-amber-800/50";
  if (tipo === "Revisão 30d") return "bg-emerald-900/40 text-emerald-300 border border-emerald-800/50";
  return "bg-zinc-800 text-zinc-400";
}

export function tipoLabel(tipo: string): string {
  const map: Record<string, string> = {
    "Revisão 24h": "24h",
    "Revisão 7d": "7d",
    "Revisão 30d": "30d",
  };
  return map[tipo] ?? tipo;
}

export function prioridadeTipo(tipo: TipoRevisao): number {
  if (tipo === "Revisão 30d") return 3;
  if (tipo === "Revisão 7d") return 2;
  return 1;
}
