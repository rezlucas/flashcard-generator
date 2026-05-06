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
  "Arquitetura de Computadores",
  "Banco de Dados",
  "Ciência de Dados e IA",
  "Desenvolvimento de Software",
  "Engenharia de Software",
  "Redes de Computadores",
  "Segurança da Informação",
  "Sistemas Operacionais",
  "Criminalística",
  "Direito Administrativo",
  "Direito Penal",
  "Direito Processual Penal",
  "Direito Constitucional",
  "Língua Portuguesa",
  "Raciocínio Lógico Matemático",
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
