"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BotaoCopiar } from "./BotaoCopiar";

export interface FlashcardData {
  id: string;
  frente: string;
  verso: string;
  tags: string;
  tipoCard: string;
}

interface FlashcardPreviewProps {
  flashcard: FlashcardData;
  index: number;
}

const TIPO_INFO: Record<string, { label: string; ankiNota: string; cor: string }> = {
  basico:    { label: "Básico",             ankiNota: "Basic",                          cor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  digitar:   { label: "Digite a resposta",  ankiNota: "Basic (type in the answer)",     cor: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" },
  cloze:     { label: "Omissão de palavras",ankiNota: "Cloze",                          cor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  invertido: { label: "Invertido opcional", ankiNota: "Basic (optional reversed card)", cor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
};

function SafeHTML({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    import("dompurify").then((mod) => {
      const DOMPurify = mod.default;
      if (ref.current) {
        ref.current.innerHTML = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ["span", "b", "br", "ul", "li", "strong", "em", "p"],
          ALLOWED_ATTR: ["style"],
        });
      }
    });
  }, [html]);
  return <div ref={ref} className="text-sm leading-relaxed" />;
}

function ClozePreview({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    import("dompurify").then((mod) => {
      const DOMPurify = mod.default;
      // Substitui {{c1::texto}} por span destacado para visualização
      const comDestaque = html.replace(
        /\{\{c(\d+)::([^}]+)\}\}/g,
        '<span style="background-color:#E0CFFF;color:#5B21B6;padding:1px 5px;border-radius:4px;font-weight:700;border:1px dashed #5B21B6">[c$1: $2]</span>'
      );
      if (ref.current) {
        ref.current.innerHTML = DOMPurify.sanitize(comDestaque, {
          ALLOWED_TAGS: ["span", "b", "br", "ul", "li", "strong", "em", "p"],
          ALLOWED_ATTR: ["style"],
        });
      }
    });
  }, [html]);
  return <div ref={ref} className="text-sm leading-relaxed" />;
}

export function FlashcardPreview({ flashcard, index }: FlashcardPreviewProps) {
  const tipo = flashcard.tipoCard ?? "basico";
  const info = TIPO_INFO[tipo] ?? TIPO_INFO.basico;
  const tags = flashcard.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const tsvColunas =
    tipo === "invertido"
      ? `${flashcard.frente}\t${flashcard.verso}\ty\t${flashcard.tags}`
      : `${flashcard.frente}\t${flashcard.verso}\t${flashcard.tags}`;

  return (
    <Card className="overflow-hidden">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.cor}`}>
            {info.label}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground italic">
          Anki: <strong>{info.ankiNota}</strong>
        </span>
      </div>

      <CardContent className="p-0">
        {tipo === "cloze" ? (
          /* Cloze: campo único + extra */
          <div className="flex flex-col divide-y">
            <div className="p-4 bg-white text-zinc-900">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Texto (com lacunas)
              </p>
              <ClozePreview html={flashcard.frente} />
            </div>
            {flashcard.verso && (
              <div className="p-4 bg-white text-zinc-900">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  Extra (contexto)
                </p>
                <SafeHTML html={flashcard.verso} />
              </div>
            )}
          </div>
        ) : tipo === "digitar" ? (
          /* Digitar: layout simples, sem HTML */
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4 bg-white text-zinc-900">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Pergunta
              </p>
              <p className="text-sm text-zinc-900">{flashcard.frente}</p>
            </div>
            <div className="p-4 bg-white text-zinc-900">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Resposta
              </p>
              <p className="text-sm font-bold text-zinc-900">{flashcard.verso}</p>
            </div>
          </div>
        ) : (
          /* Básico / Invertido: frente e verso lado a lado com HTML */
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4 bg-white text-zinc-900">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Frente
              </p>
              <SafeHTML html={flashcard.frente} />
            </div>
            <div className="p-4 bg-white text-zinc-900">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                {tipo === "invertido" ? "Verso (+ invertido)" : "Verso"}
              </p>
              <SafeHTML html={flashcard.verso} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/40 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <BotaoCopiar texto={flashcard.frente} label="Frente" />
          <BotaoCopiar texto={flashcard.verso} label="Verso" />
          <BotaoCopiar texto={tsvColunas} label="TSV" variant="default" />
        </div>
      </CardFooter>
    </Card>
  );
}
