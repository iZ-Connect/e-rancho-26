import { ref, get, set, update, remove, push, child } from 'firebase/database';
import { db } from './firebaseConfig';
import { Militar, Arranchamento, Cardapio, Bloqueio } from '../../types';

export const dbService = {
  // LOGIN ATUALIZADO PARA FUNCIONAR COM O NOVO BANCO
  async login(cpf: string, pin: string): Promise<Militar> {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, '/')); // Busca na raiz

      if (snapshot.exists()) {
        const data = snapshot.val();
        const militares = Object.values(data) as any[];

        // Busca flexível: ignora maiúsculas/minúsculas nas chaves e valores
        const militar = militares.find(m => {
          const dbCpf = String(m.cpf || m.CPF || '').trim();
          const dbPin = String(m.pin || m.PIN || '').trim();
          return dbCpf === cpf.trim() && dbPin === pin.trim();
        });

        if (militar) {
          if (militar.ativo === false) {
            throw new Error("Usuário inativo. Procure o S1.");
          }
          // Normaliza o objeto para o formato que o App espera
          return {
            ...militar,
            cpf: String(militar.cpf || militar.CPF),
            pin: String(militar.pin || militar.PIN),
            nome_guerra: militar.nome_guerra || militar["Nome de Guerra"] || "Militar",
            perfil: militar.perfil || militar["Usuário"] || "MILITAR"
          } as Militar;
        }
      }
      throw new Error("CPF ou PIN inválidos.");
    } catch (error: any) {
      throw new Error(error.message || "Erro ao conectar com o banco.");
    }
  },

  // Busca todos os militares para relatórios e ADM
  async getMilitares(): Promise<Militar[]> {
    const snapshot = await get(ref(db, '/'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Militar[];
    }
    return [];
  },

  // Salva ou remove arranchamento
  async toggleArranchamento(arranchamento: Arranchamento, active: boolean) {
    const id = `${arranchamento.militar_cpf}_${arranchamento.data}`;
    const arranchRef = ref(db, `arranchamentos/${id}`);

    if (active) {
      await set(arranchRef, {
        ...arranchamento,
        timestamp: new Date().toISOString()
      });
    } else {
      await remove(arranchRef);
    }
  },

  // Busca arranchamentos do militar ou geral
  async getArranchamentos(militarCpf?: string): Promise<Arranchamento[]> {
    const snapshot = await get(ref(db, 'arranchamentos'));
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as Arranchamento[];
      return militarCpf ? data.filter(a => a.militar_cpf === militarCpf) : data;
    }
    return [];
  }
};