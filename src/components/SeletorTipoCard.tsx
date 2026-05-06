"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const TIPOS_CARD = [
  {
    id: "basico",
    label: "Básico",
    desc: "Frente e verso com cores mnemônicas",
  },
  {
    id: "digitar",
    label: "Digite a resposta",
    desc: "Cards simples e diretos — você digita a resposta",
  },
  {
    id: "cloze",
    label: "Omissão de palavras",
    desc: "Texto com lacunas para preencher",
  },
  {
    id: "invertido",
    label: "Invertido opcional",
    desc: "Gera também o card na ordem inversa",
  },
] as const;

interface SeletorTipoCardProps {
  selecionados: string[];
  onChange: (tipos: string[]) => void;
}

export function SeletorTipoCard({ selecionados, onChange }: SeletorTipoCardProps) {
  function toggle(id: string) {
    if (selecionados.includes(id)) {
      if (selecionados.length === 1) return; // mínimo 1
      onChange(selecionados.filter((t) => t !== id));
    } else {
      onChange([...selecionados, id]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Tipos de card
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TIPOS_CARD.map(({ id, label, desc }) => {
          const ativo = selecionados.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors ${
                ativo
                  ? "border-primary bg-primary/10"
                  : "border-border bg-transparent hover:bg-muted/50"
              }`}
            >
              <Checkbox
                id={id}
                checked={ativo}
                className="mt-0.5 pointer-events-none"
                readOnly
              />
              <div>
                <Label htmlFor={id} className="cursor-pointer text-xs font-semibold leading-none">
                  {label}
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
