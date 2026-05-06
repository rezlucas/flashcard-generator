"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface BotaoCopiarProps {
  texto: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

export function BotaoCopiar({
  texto,
  label,
  variant = "outline",
  className,
}: BotaoCopiarProps) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Button variant={variant} size="sm" onClick={copiar} className={className}>
      {copiado ? (
        <Check className="h-3.5 w-3.5 mr-1.5" />
      ) : (
        <Copy className="h-3.5 w-3.5 mr-1.5" />
      )}
      {label}
    </Button>
  );
}
