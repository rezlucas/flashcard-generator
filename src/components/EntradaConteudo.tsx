"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { SeletorMateria } from "./SeletorMateria";
import { SeletorTipoCard } from "./SeletorTipoCard";

interface EntradaConteudoProps {
  conteudo: string;
  setConteudo: (v: string) => void;
  tipo: string;
  setTipo: (v: string) => void;
  materia: string;
  setMateria: (v: string) => void;
  tiposCard: string[];
  setTiposCard: (v: string[]) => void;
  onGerar: () => void;
  loading: boolean;
}

export function EntradaConteudo({
  conteudo,
  setConteudo,
  tipo,
  setTipo,
  materia,
  setMateria,
  tiposCard,
  setTiposCard,
  onGerar,
  loading,
}: EntradaConteudoProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Tabs value={tipo} onValueChange={setTipo}>
        <TabsList className="w-full">
          <TabsTrigger value="conceito" className="flex-1">Conceito</TabsTrigger>
          <TabsTrigger value="questao" className="flex-1">Questão errada</TabsTrigger>
        </TabsList>
        <TabsContent value="conceito" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Cole um conceito, definição ou tema que deseja memorizar.
          </p>
        </TabsContent>
        <TabsContent value="questao" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Cole a questão completa (enunciado + alternativas).
          </p>
        </TabsContent>
      </Tabs>

      <SeletorMateria value={materia} onChange={setMateria} />

      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder={
          tipo === "conceito"
            ? "Ex: Habeas data é o remédio constitucional que garante o acesso a informações..."
            : "Ex: (CESPE/2023) Acerca dos remédios constitucionais, assinale a opção correta..."
        }
        className="flex-1 min-h-[160px] text-base resize-none"
      />

      <SeletorTipoCard selecionados={tiposCard} onChange={setTiposCard} />

      <Button
        onClick={onGerar}
        disabled={loading || !conteudo.trim()}
        className="w-full h-12 text-base font-semibold cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Gerando flashcards...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar flashcards
          </>
        )}
      </Button>
    </div>
  );
}
