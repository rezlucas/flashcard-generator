"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MATERIAS = [
  "Auto-detectar",
  "Direito Constitucional",
  "Direito Administrativo",
  "Direito Penal",
  "Direito Civil",
  "Direito Processual Civil",
  "Direito Processual Penal",
  "Direito Tributário",
  "Direito do Trabalho",
  "Direito Previdenciário",
  "Direito Ambiental",
  "Língua Portuguesa",
  "Raciocínio Lógico e Matemático",
  "Informática",
  "Administração Pública",
  "Controle Externo",
  "Auditoria",
  "Contabilidade Pública",
  "Economia",
  "Atualidades",
];

interface SeletorMateriaProps {
  value: string;
  onChange: (value: string) => void;
}

export function SeletorMateria({ value, onChange }: SeletorMateriaProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecionar matéria" />
      </SelectTrigger>
      <SelectContent>
        {MATERIAS.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
