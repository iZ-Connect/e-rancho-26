import { ref, get, set, update, remove, child } from 'firebase/database';
import { db } from './firebase';
// Adicionei 'Aviso' nas importações
import { Militar, Arranchamento, Cardapio, Aviso } from '../types';

export const dbService = {

  // LOGIN (Atualizado para buscar dentro da pasta 'militares')
  async login(cpf: string, pin: string): Promise<Militar> {
    try {
      // Mudança importante: busca em 'militares', não na raiz '/'
      const dbRef = ref(db, 'militares');
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const militares = Object.values(data) as any[];

        // Busca flexível
        const militar = militares.find(m => {
          const dbCpf = String(m.cpf || '').trim();
          const dbPin = String(m.pin || '').trim();
          return dbCpf === cpf.trim() && dbPin === pin.trim();
        });

        if (militar) {
          if (militar.ativo === false) {
            throw new Error("Usuário inativo. Procure o S1.");
          }
          return militar as Militar;
        }
      }
      throw new Error("CPF ou PIN inválidos.");
    } catch (error: any) {
      throw new Error(error.message || "Erro ao conectar com o banco.");
    }
  },

  async getMilitarByEmail(email: string) {
    const snapshot = await get(child(ref(db), 'militares'));

    if (!snapshot.exists()) return null;

    const militares = snapshot.val();
    const militar = Object.values(militares).find((m: any) =>
      String(m.email || '').toLowerCase() === email.toLowerCase()
    );

    return militar || null;
  },

  // --- ARRRANCHAMENTOS ---

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

  async getArranchamentos(militarCpf?: string): Promise<Arranchamento[]> {
    const snapshot = await get(ref(db, 'arranchamentos'));
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as Arranchamento[];
      return militarCpf ? data.filter(a => a.militar_cpf === militarCpf) : data;
    }
    return [];
  },

  // --- NOVAS FUNÇÕES PARA O CARDÁPIO ---

  async saveCardapio(cardapio: Cardapio) {
    // Salva usando a data como ID (ex: cardapio/2026-02-01) para evitar duplicatas no mesmo dia
    const cardapioRef = ref(db, `cardapio/${cardapio.data}`);
    await set(cardapioRef, cardapio);
  },

  async getCardapio(): Promise<Cardapio[]> {
    const snapshot = await get(ref(db, 'cardapio'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Cardapio[];
    }
    return [];
  },

  // --- NOVAS FUNÇÕES PARA AVISOS ---

  async saveAviso(aviso: Aviso) {
    const avisoRef = ref(db, `avisos/${aviso.id}`);
    await set(avisoRef, aviso);
  },

  async deactivateAviso(id: string) {
    const avisoRef = ref(db, `avisos/${id}`);
    // Apenas atualiza o campo 'ativo' para false, não apaga o histórico
    await update(avisoRef, { ativo: false });
  },

  async getAvisos(): Promise<Aviso[]> {
    const snapshot = await get(ref(db, 'avisos'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Aviso[];
    }
    return [];
  }
};