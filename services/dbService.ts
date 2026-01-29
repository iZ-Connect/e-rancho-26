
import { Militar, Role, Arranchamento, Cardapio, SpecialArranchamento } from '../types';

// In a real scenario, these functions would fetch from a Google Apps Script Web App
// returning data from the "Rancho" sheet.

const STORAGE_KEYS = {
  MILITARES: 'erancho_militares',
  ARRANCHAMENTOS: 'erancho_arranchamentos',
  CARDAPIO: 'erancho_cardapio',
  ESPECIAL: 'erancho_especial'
};

const defaultMilitares: Militar[] = [
  {
    id: '1',
    cpf: '12345678901',
    nomeCompleto: 'João da Silva',
    nomeGuerra: 'Silva',
    posto: 'Sargento',
    setor: 'Logística',
    pin: '123456',
    role: Role.ADM_GERAL,
    ativo: true
  },
  {
    id: '2',
    cpf: '98765432100',
    nomeCompleto: 'Maria Oliveira',
    nomeGuerra: 'Oliveira',
    posto: 'Tenente',
    setor: 'Administração',
    pin: '000000',
    role: Role.MILITAR,
    ativo: true
  },
  {
    id: '3',
    cpf: '11122233344',
    nomeCompleto: 'Carlos Santos',
    nomeGuerra: 'Santos',
    posto: 'Cabo',
    setor: 'Guarda',
    pin: '123456',
    role: Role.FISCAL,
    ativo: true
  }
];

export const dbService = {
  getMilitares: (): Militar[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MILITARES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MILITARES, JSON.stringify(defaultMilitares));
      return defaultMilitares;
    }
    return JSON.parse(data);
  },

  saveMilitares: (militares: Militar[]) => {
    localStorage.setItem(STORAGE_KEYS.MILITARES, JSON.stringify(militares));
  },

  getArranchamentos: (): Arranchamento[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ARRANCHAMENTOS);
    return data ? JSON.parse(data) : [];
  },

  saveArranchamento: (arr: Arranchamento) => {
    const current = dbService.getArranchamentos();
    const index = current.findIndex(a => a.militarId === arr.militarId && a.data === arr.data);
    if (index > -1) {
      current[index] = arr;
    } else {
      current.push(arr);
    }
    localStorage.setItem(STORAGE_KEYS.ARRANCHAMENTOS, JSON.stringify(current));
  },

  togglePresenca: (militarId: string, data: string, tipo: 'almoço' | 'jantar') => {
    const current = dbService.getArranchamentos();
    const index = current.findIndex(a => a.militarId === militarId && a.data === data);
    if (index > -1) {
      if (tipo === 'almoço') current[index].presencaAlmoço = !current[index].presencaAlmoço;
      else current[index].presencaJantar = !current[index].presencaJantar;
      localStorage.setItem(STORAGE_KEYS.ARRANCHAMENTOS, JSON.stringify(current));
    }
  },

  getCardapio: (): Cardapio[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CARDAPIO);
    return data ? JSON.parse(data) : [];
  },

  saveCardapio: (cardapio: Cardapio[]) => {
    localStorage.setItem(STORAGE_KEYS.CARDAPIO, JSON.stringify(cardapio));
  },

  getEspecial: (): SpecialArranchamento[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ESPECIAL);
    return data ? JSON.parse(data) : [];
  },

  saveEspecial: (esp: SpecialArranchamento) => {
    const current = dbService.getEspecial();
    current.push(esp);
    localStorage.setItem(STORAGE_KEYS.ESPECIAL, JSON.stringify(current));
  }
};
