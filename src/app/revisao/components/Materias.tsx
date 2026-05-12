"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Materia } from "../types";
import { formatMin } from "../utils";

type Props = { materias: Materia[]; sessoesPorMateria: Record<string, { count: number; min: number }>; onChanged: () => void };

type FormState = { open: boolean; id: string | null; nome: string; cor: string; paiId: string | null };

const FORM_DEFAULT: FormState = { open: false, id: null, nome: "", cor: "#6366f1", paiId: null };

export function Materias({ materias, sessoesPorMateria, onChanged }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);

  const pais = materias.filter((m) => !m.paiId);

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function openAdd(paiId: string | null = null) {
    setForm({ open: true, id: null, nome: "", cor: "#6366f1", paiId });
  }

  function openEdit(m: Materia) {
    setForm({ open: true, id: m.id, nome: m.nome, cor: m.cor, paiId: m.paiId });
  }

  async function handleSave() {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
    setSaving(true);
    try {
      if (form.id) {
        await fetch(`/api/revisao/materias/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: form.nome, cor: form.cor }),
        });
        toast.success("Matéria atualizada!");
      } else {
        await fetch("/api/revisao/materias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: form.nome, cor: form.cor, paiId: form.paiId }),
        });
        toast.success("Matéria criada!");
      }
      setForm(FORM_DEFAULT);
      onChanged();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar esta matéria?")) return;
    await fetch(`/api/revisao/materias/${id}`, { method: "DELETE" });
    toast.success("Matéria removida.");
    onChanged();
  }

  async function importarPadrao() {
    if (!confirm("Criar as matérias padrão (concursos TI)?")) return;
    const estrutura = [
      { nome: "Arquitetura de Computadores", cor: "#8b5cf6", filhas: [{ nome: "Virtualização", cor: "#a78bfa" }] },
      { nome: "Banco de Dados", cor: "#3b82f6", filhas: [{ nome: "SQL", cor: "#60a5fa" }] },
      { nome: "Ciência de Dados e IA", cor: "#06b6d4", filhas: [] },
      { nome: "Desenvolvimento de Software", cor: "#10b981", filhas: [{ nome: "HTML", cor: "#34d399" }, { nome: "Python", cor: "#6ee7b7" }] },
      { nome: "Engenharia de Software", cor: "#f59e0b", filhas: [] },
      { nome: "Redes de Computadores", cor: "#ef4444", filhas: [] },
      { nome: "Segurança da Informação", cor: "#ec4899", filhas: [
        { nome: "Ataques e Malwares", cor: "#f472b6" },
        { nome: "Backup", cor: "#fb7185" },
        { nome: "Certificação Digital", cor: "#fcd34d" },
        { nome: "Criptografia", cor: "#a78bfa" },
        { nome: "Firewall, IDS e Antivírus", cor: "#60a5fa" },
        { nome: "IPSec", cor: "#34d399" },
        { nome: "SSL/TLS", cor: "#6ee7b7" },
        { nome: "VPN", cor: "#fca5a5" },
      ]},
    ];
    for (const item of estrutura) {
      const res = await fetch("/api/revisao/materias", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: item.nome, cor: item.cor }),
      });
      const pai = await res.json();
      for (const f of item.filhas) {
        await fetch("/api/revisao/materias", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: f.nome, cor: f.cor, paiId: pai.id }),
        });
      }
    }
    toast.success("Matérias importadas!");
    onChanged();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{materias.length} matéria(s)</span>
        <div className="flex gap-2">
          {materias.length === 0 && (
            <Button variant="ghost" size="sm" onClick={importarPadrao} className="text-zinc-400 text-xs">
              Importar padrão (TI)
            </Button>
          )}
          <Button size="sm" onClick={() => openAdd()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nova matéria
          </Button>
        </div>
      </div>

      {materias.length === 0 && (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg p-8 text-center">
          <p className="text-zinc-500 text-sm">Nenhuma matéria cadastrada.</p>
          <p className="text-zinc-600 text-xs mt-1">Clique em "Nova matéria" ou importe a estrutura padrão.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {pais.map((p) => {
          const filhas = materias.filter((m) => m.paiId === p.id);
          const isOpen = expanded.has(p.id);
          const stats = sessoesPorMateria[p.id];
          return (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                <button
                  className={`text-zinc-500 transition-transform ${isOpen ? "rotate-90" : ""} ${filhas.length === 0 ? "invisible" : ""}`}
                  onClick={() => toggleExpand(p.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                <span className="flex-1 text-sm font-medium text-zinc-200">{p.nome}</span>
                <span className="text-xs text-zinc-500 hidden sm:block">
                  {stats ? `${stats.count} sessões · ${formatMin(stats.min)}` : "—"}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openAdd(p.id)} className="p-1.5 rounded text-zinc-600 hover:text-blue-400 hover:bg-blue-950/30 transition-colors" title="Adicionar sub-matéria">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isOpen && filhas.length > 0 && (
                <div className="border-t border-zinc-800 bg-zinc-950/30">
                  {filhas.map((f) => {
                    const fs = sessoesPorMateria[f.id];
                    return (
                      <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 pl-10 hover:bg-zinc-800/20 transition-colors border-b border-zinc-800/40 last:border-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.cor }} />
                        <span className="flex-1 text-sm text-zinc-300">{f.nome}</span>
                        <span className="text-xs text-zinc-600 hidden sm:block">
                          {fs ? `${fs.count} sessões · ${formatMin(fs.min)}` : "—"}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(f)} className="p-1.5 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog de matéria */}
      <Dialog open={form.open} onOpenChange={(v) => !v && setForm(FORM_DEFAULT)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{form.id ? "Editar matéria" : "Nova matéria"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Nome *</label>
              <input
                autoFocus
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: SQL"
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.cor}
                  onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                  className="h-9 w-16 rounded cursor-pointer bg-zinc-800 border border-zinc-700"
                />
                <span className="text-sm text-zinc-400">{form.cor}</span>
              </div>
            </div>
            {form.paiId && (
              <p className="text-xs text-zinc-500">
                Sub-matéria de: {materias.find((m) => m.id === form.paiId)?.nome}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setForm(FORM_DEFAULT)} className="text-zinc-400">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
