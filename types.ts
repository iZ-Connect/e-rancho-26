export enum UserRole {
  MILITAR = 'Militar', // Ajustado para bater com o valor "Militar" do seu Firebase
  FISC_SU = 'FISC_SU',
  ADM_LOCAL = 'ADM_LOCAL',
  ADM_GERAL = 'ADM_GERAL'
}

export interface Militar {
  cpf: string | number; // O Firebase pode interpretar o CPF como número
  "Nome Completo": string; // Mapeado do seu print
  "Nome de Guerra": string; // Mapeado do seu print
  "Posto": string; // Mapeado do seu print
  "pin": string | number; // No Firebase está como 'pin'
  "Usuário": string; // Mapeado do seu print
  "Ativo?": boolean; // Mapeado do seu print
  id_planilha: number; // Mapeado do seu print

  // Mantemos as propriedades de sistema que o App.tsx utiliza
  perfil: UserRole;
  must_change_pin: boolean;
  setor_nome?: string;
}

export interface Setor {
  id: number;
  nome: string;
}

export interface Arranchamento {
  id: string;
  militar_cpf: string;
  data: string; // ISO YYYY-MM-DD
  almoco: boolean;
  jantar: boolean;
  presenca_almoco: boolean;
  presenca_jantar: boolean;
}

export interface Cardapio {
  data: string;
  almoço: string;
  jantar: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'amarelo' | 'vermelho';
  ativo: boolean;
  dataCriacao: string;
}

export interface Bloqueio {
  data: string;
  motivo: string;
  criadoPor: string;
}

export interface AuthState {
  user: Militar | null;
  isAuthenticated: boolean;
}