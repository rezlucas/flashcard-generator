"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Materia, SessaoPrefill, TipoSessao } from "../types";
import { toDateStr } from "../utils";

const TIPOS: TipoSessao[] = [
  "Estudo Inicial",
  "Revisão 24h",
  "Revisão 7d",
  "Revisão 30d",
  "Avulsa",
];

type Props = {
  open: boolean;
  onClose: () => void;
  materias: Materia[];
  prefill: SessaoPrefill | null;
  onSaved: () => void;
};

export function ModalNovaSessao({ open, onClose, materias, prefill, onSaved }: Props) {
  const [materiaId, setMateriaId] = useState("");
  const [data, setData] = useState(toDateStr(new Date()));
  const [duracao, setDuracao] = useState("");
  const [tipo, setTipo] = useState<TipoSessao>("Estudo Inicial");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMateriaId(prefill?.materiaId ?? "");
      setTipo(prefill?.tipo ?? "Estudo Inicial");
      setData(toDateStr(new Date()));
      setDuracao("");
      setObs("");
    }
  }, [open, prefill]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!materiaId || !data || !duracao) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/revisao/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materiaId,
          data,
          duracaoMin: Number(duracao),
          tipo,
          observacoes: obs || null,
          sessaoOrigemId: prefill?.sessaoOrigemId ?? null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        tipo === "Estudo Inicial"
          ? "Sessão salva! Revisões agendadas em 24h, 7d e 30d."
          : "Revisão registrada!"
      );
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  const pais = materias.filter((m) => !m.paiId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {prefill ? "Marcar revisão como feita" : "Nova Sessão de Estudo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Matéria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Matéria *</label>
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Selecione...</option>
              {pais.map((p) => {
                const filhas = materias.filter((m) => m.paiId === p.id);
                return (
                  <optgroup key={p.id} label={p.nome}>
                    <option value={p.id}>{p.nome}</option>
                    {filhas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {"  ↳ " + f.nome}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Data e duração */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Data *</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Duração (min) *</label>
              <input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                placeholder="45"
                min="1"
                max="600"
                required
                autoFocus={!!prefill}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Tipo *</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    tipo === t
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Observações</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: fiz 12 cards novos no Anki..."
              rows={3}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
