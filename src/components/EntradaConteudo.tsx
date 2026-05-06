"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Palette } from "lucide-react";
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
  frente: string;
  setFrente: (v: string) => void;
  verso: string;
  setVerso: (v: string) => void;
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
  frente,
  setFrente,
  verso,
  setVerso,
  onGerar,
  loading,
}: EntradaConteudoProps) {
  const modoColorir = tipo === "colorir";
  const podeSalvar = modoColorir
    ? frente.trim() !== "" && verso.trim() !== ""
    : conteudo.trim() !== "";

  return (
    <div className="flex flex-col gap-4 h-full">
      <Tabs value={tipo} onValueChange={setTipo}>
        <TabsList className="w-full">
          <TabsTrigger value="conceito" className="flex-1">Conceito</TabsTrigger>
          <TabsTrigger value="colorir" className="flex-1">Colorir card</TabsTrigger>
        </TabsList>

        <TabsContent value="conceito" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Cole um conceito ou tema que deseja transformar em flashcards.
          </p>
        </TabsContent>
        <TabsContent value="colorir" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Cole a frente e o verso de um card existente — o sistema aplica as cores mnemônicas.
          </p>
        </TabsContent>
      </Tabs>

      <SeletorMateria value={materia} onChange={setMateria} />

      {modoColorir ? (
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Frente do card
            </label>
            <Textarea
              value={frente}
              onChange={(e) => setFrente(e.target.value)}
              placeholder="Cole aqui o conteúdo da frente do flashcard..."
              className="min-h-[100px] text-base resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Verso do card
            </label>
            <Textarea
              value={verso}
              onChange={(e) => setVerso(e.target.value)}
              placeholder="Cole aqui o conteúdo do verso do flashcard..."
              className="min-h-[100px] text-base resize-none"
            />
          </div>
        </div>
      ) : (
        <>
          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Ex: Habeas data é o remédio constitucional que garante o acesso a informações..."
            className="flex-1 min-h-[160px] text-base resize-none"
          />
          <SeletorTipoCard selecionados={tiposCard} onChange={setTiposCard} />
        </>
      )}

      <Button
        onClick={onGerar}
        disabled={loading || !podeSalvar}
        className="w-full h-12 text-base font-semibold cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {modoColorir ? "Aplicando cores..." : "Gerando flashcards..."}
          </>
        ) : modoColorir ? (
          <>
            <Palette className="mr-2 h-5 w-5" />
            Aplicar cores
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
