
import { Militar, Setor, Arranchamento, UserRole } from '../types';
import { subDays, parseISO, isBefore } from 'date-fns';

declare var localforage: any;

// A URL abaixo deve ser a gerada na implantação do Apps Script
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzxdTH1fWlj1E3yCTLuQbLtM78ZdBpKIqqjx5nVg_Ee9MwXmDc3py_xKh4dVa4Qqs_l/exec';

const DB_KEYS = {
  MILITARES: 'sarc_militares',
  SETORES: 'sarc_setores',
  ARRANCHAMENTOS: 'sarc_arranchamentos',
};

export const dbService = {
  init: async () => {
    try {
      await dbService.syncFromSheets();

      const setores = await localforage.getItem(DB_KEYS.SETORES);
      if (!setores) {
        await localforage.setItem(DB_KEYS.SETORES, [{ id: 1, nome: '1ª Cia Fuz' }]);
      }

      const arranchamentos = await localforage.getItem(DB_KEYS.ARRANCHAMENTOS);
      if (!arranchamentos) {
        await localforage.setItem(DB_KEYS.ARRANCHAMENTOS, []);
      }

      await dbService.cleanupOldRecords();
    } catch (error) {
      console.error('Falha ao inicializar banco de dados:', error);
    }
  },

  syncFromSheets: async () => {
    try {
      const response = await fetch(SHEETS_API_URL);
      const sheetData = await response.json();

      const mappedMilitares: Militar[] = sheetData.map((row: any) => {
        // Função interna para traduzir o cargo da planilha para o código
        const traduzirPerfil = (p: string): UserRole => {
          const perfil = (p || '').toLowerCase();
          if (perfil.includes('geral') || perfil.includes('admin')) return UserRole.ADM_GERAL;
          if (perfil.includes('local')) return UserRole.ADM_LOCAL;
          if (perfil.includes('fiscal') || perfil.includes('fisc')) return UserRole.FISC_SU;
          return UserRole.MILITAR;
        };

        return {
          cpf: row.CPF.toString().replace(/\D/g, ''),
          nome: row["Nome Completo"],
          nome_guerra: row["Nome de Guerra"],
          posto_grad: row.Posto,
          pin_hash: row.PIN.toString(),
          perfil: traduzirPerfil(row["Usuário"]),
          status: row["Ativo?"],
          setor_id: 1,
          must_change_pin: false
        };
      }); // ✅ Fechamento corrigido aqui

      if (mappedMilitares.length > 0) {
        await localforage.setItem(DB_KEYS.MILITARES, mappedMilitares);
        console.log("Sincronizado com Google Sheets com sucesso.");
      }
    } catch (e) {
      console.warn("Offline ou erro ao sincronizar com Sheets. Usando cache local.");
    }
  },

  pushToSheets: async (militar: Militar) => {
    try {
      const payload = {
        action: 'upsert',
        data: {
          "ID": Date.now().toString().slice(-5),
          "CPF": militar.cpf,
          "Nome Completo": militar.nome,
          "Nome de Guerra": militar.nome_guerra || "",
          "Posto": militar.posto_grad,
          "Setor": "Padrão",
          "PIN": militar.pin_hash,
          "Usuário": militar.perfil,
          "Ativo?": militar.status
        }
      };

      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Erro ao enviar para Sheets:", e);
    }
  },

  deleteFromSheets: async (cpf: string) => {
    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', cpf })
      });
    } catch (e) {
      console.error("Erro ao deletar no Sheets:", e);
    }
  },

  cleanupOldRecords: async () => {
    try {
      const arranchamentos = (await localforage.getItem(DB_KEYS.ARRANCHAMENTOS) as Arranchamento[]) || [];
      const tenDaysAgo = subDays(new Date(), 10);
      // Fix: changed 'data_almoco' to 'data' which is the correct property in Arranchamento interface
      const freshArranchamentos = arranchamentos.filter(a => !isBefore(parseISO(a.data), tenDaysAgo));
      await localforage.setItem(DB_KEYS.ARRANCHAMENTOS, freshArranchamentos);
    } catch (error) { }
  },

  getMilitares: async (): Promise<Militar[]> => {
    return (await localforage.getItem(DB_KEYS.MILITARES)) || [];
  },
  saveMilitares: async (data: Militar[]) => {
    await localforage.setItem(DB_KEYS.MILITARES, data);
  },
  getSetores: async (): Promise<Setor[]> => {
    return (await localforage.getItem(DB_KEYS.SETORES)) || [];
  },
  saveSetores: async (data: Setor[]) => {
    await localforage.setItem(DB_KEYS.SETORES, data);
  },
  getArranchamentos: async (): Promise<Arranchamento[]> => {
    return (await localforage.getItem(DB_KEYS.ARRANCHAMENTOS)) || [];
  },
  saveArranchamentos: async (data: Arranchamento[]) => {
    await localforage.setItem(DB_KEYS.ARRANCHAMENTOS, data);
  }
};
