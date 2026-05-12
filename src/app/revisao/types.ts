export type Materia = {
  id: string;
  nome: string;
  paiId: string | null;
  cor: string;
  ativa: boolean;
  criadaEm: string;
  filhas?: Materia[];
};

export type Sessao = {
  id: string;
  materiaId: string;
  data: string;
  duracaoMin: number;
  tipo: TipoSessao;
  observacoes: string | null;
  sessaoOrigemId: string | null;
  criadaEm: string;
};

export type RevisaoAgendada = {
  id: string;
  materiaId: string;
  sessaoOrigemId: string;
  dataAlvo: string;
  tipo: TipoRevisao;
  status: StatusRevisao;
  concluidaEm: string | null;
  sessaoConcluidaId: string | null;
};

export type TipoSessao =
  | "Estudo Inicial"
  | "Revisão 24h"
  | "Revisão 7d"
  | "Revisão 30d"
  | "Avulsa";

export type TipoRevisao = "Revisão 24h" | "Revisão 7d" | "Revisão 30d";

export type StatusRevisao = "Pendente" | "Concluída" | "Pulada";

export type DashboardData = {
  hoje: RevisaoAgendada[];
  atrasadas: RevisaoAgendada[];
  proximas: RevisaoAgendada[];
  futuras: RevisaoAgendada[];
  sessoes: Sessao[];
};

export type EstatisticasData = {
  porMateria: Record<string, number>;
  totalMin: number;
  totalSessoes: number;
};

export type SessaoPrefill = {
  revisaoId: string;
  materiaId: string;
  tipo: TipoRevisao;
  sessaoOrigemId: string;
};
