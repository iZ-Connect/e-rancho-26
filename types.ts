
export enum Role {
  MILITAR = 'MILITAR',
  FISCAL = 'FISCAL',
  ADM_LOCAL = 'ADM_LOCAL',
  ADM_GERAL = 'ADM_GERAL'
}

export interface Militar {
  id: string;
  cpf: string;
  nomeCompleto: string;
  nomeGuerra: string;
  posto: string;
  setor: string;
  pin: string;
  role: Role;
  ativo: boolean;
}

export interface RefeicaoStatus {
  almoço: boolean;
  jantar: boolean;
  presencaAlmoço?: boolean;
  presencaJantar?: boolean;
}

export interface Arranchamento {
  id: string;
  militarId: string;
  data: string; // ISO string YYYY-MM-DD
  almoço: boolean;
  jantar: boolean;
  presencaAlmoço: boolean;
  presencaJantar: boolean;
}

export interface SpecialArranchamento {
  id: string;
  quantidade: number;
  motivo: string;
  data: string;
  registradoPor: string;
}

export interface Cardapio {
  data: string;
  almoço: string;
  jantar: string;
}

export interface AuthState {
  user: Militar | null;
  isAuthenticated: boolean;
}
