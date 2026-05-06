"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HistoricoActionsProps {
  geracaoId: string;
  conteudo: string;
  tipo: string;
}

export function HistoricoActions({ geracaoId, conteudo, tipo }: HistoricoActionsProps) {
  const router = useRouter();
  const [deletando, setDeletando] = useState(false);

  async function excluir() {
    if (!confirm("Excluir esta geração e todos os seus flashcards?")) return;
    setDeletando(true);
    try {
      const res = await fetch(`/api/gerar-flashcards/${geracaoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      toast.success("Geração excluída");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setDeletando(false);
    }
  }

  function regerar() {
    const params = new URLSearchParams({ conteudo, tipo });
    window.location.href = `/?${params.toString()}`;
  }

  return (
    <div className="flex gap-1 shrink-0">
      <Button variant="ghost" size="sm" onClick={regerar} title="Re-gerar">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={excluir}
        disabled={deletando}
        className="text-destructive hover:text-destructive"
        title="Excluir"
      >
        {deletando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
