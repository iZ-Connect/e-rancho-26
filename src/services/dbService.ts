import { ref, get, set, update, remove, child } from 'firebase/database';
import { db } from './firebase';
import { Militar, Arranchamento, Cardapio, Aviso, Bloqueio } from '../types';

const SESSION_KEY = 'erancho_user_session';
const SEEN_NOTICES_KEY = 'erancho_seen_notices';

export const dbService = {

  // --- INICIALIZAÇÃO ---
  async init() {
    console.log("Serviço Firebase Iniciado");
    return true;
  },

  // --- SESSÃO DO USUÁRIO ---
  saveSession(user: Militar) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession(): Militar | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- LOGIN E MILITARES ---
  async login(cpf: string, pin: string): Promise<Militar> {
    try {
      const dbRef = ref(db, 'militares');
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const militares = Object.values(data) as any[];

        const militar = militares.find(m => {
          const dbCpf = String(m.cpf || '').trim();
          const dbPin = String(m.pin || '').trim();
          return dbCpf === cpf.trim() && dbPin === pin.trim();
        });

        if (militar) {
          if (militar.ativo === false) throw new Error("Usuário inativo.");
          return militar as Militar;
        }
      }
      throw new Error("CPF ou PIN inválidos.");
    } catch (error: any) {
      throw new Error(error.message || "Erro de conexão.");
    }
  },

  async getMilitares(): Promise<Militar[]> {
    const snapshot = await get(ref(db, 'militares'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Militar[] : [];
  },

  async getMilitarByEmail(email: string) {
    const militares = await this.getMilitares();
    return militares.find((m: any) =>
      String(m.email || '').toLowerCase() === email.toLowerCase()
    ) || null;
  },

  async updateMilitar(militar: Militar) {
    if (militar.id === undefined) throw new Error("ID inválido");
    await update(ref(db, `militares/${militar.id}`), militar);
  },

  // --- CARDÁPIO ---
  async saveCardapio(cardapio: Cardapio) {
    // Salva com a data como ID (funciona como criar ou editar)
    await set(ref(db, `cardapio/${cardapio.data}`), cardapio);
  },

  // ADICIONE ESTA FUNÇÃO NOVA:
  async deleteCardapio(data: string) {
    await remove(ref(db, `cardapio/${data}`));
  },

  async getCardapio(): Promise<Cardapio[]> {
    const snapshot = await get(ref(db, 'cardapio'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Cardapio[] : [];
  },

  async getCardapio(): Promise<Cardapio[]> {
    const snapshot = await get(ref(db, 'cardapio'));
    // Retorna a lista de cardápios
    return snapshot.exists() ? Object.values(snapshot.val()) as Cardapio[] : [];
  },

  // --- AVISOS (ESSA PARTE TAMBÉM FALTAVA) ---
  async saveAviso(aviso: Aviso) {
    await set(ref(db, `avisos/${aviso.id}`), aviso);
  },

  async deactivateAviso(id: string) {
    await update(ref(db, `avisos/${id}`), { ativo: false });
  },

  async getAvisos(): Promise<Aviso[]> {
    const snapshot = await get(ref(db, 'avisos'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Aviso[] : [];
  },

  async getUnseenActiveNotices(): Promise<Aviso[]> {
    const avisos = await this.getAvisos();
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    return avisos.filter(a => a.ativo && !seenIds.includes(a.id));
  },

  markNoticeAsSeen(id: string) {
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      localStorage.setItem(SEEN_NOTICES_KEY, JSON.stringify(seenIds));
    }
  },

  // --- ARRANCHAMENTOS E OUTROS ---
  async saveArranchamento(cpf: string, data: string, refeicao: 'almoco' | 'jantar') {
    // Lógica simplificada de toggle para o exemplo
    console.log("Salvar arranchamento:", cpf, data, refeicao);
    // Implemente a lógica real de salvar aqui se necessário
  },

  async toggleArranchamento(arranchamento: Arranchamento, active: boolean) {
    const id = `${arranchamento.militar_cpf}_${arranchamento.data}`;
    const arranchRef = ref(db, `arranchamentos/${id}`);
    if (active) {
      await set(arranchRef, { ...arranchamento, timestamp: new Date().toISOString() });
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

  async getBloqueios(): Promise<Bloqueio[]> {
    const snapshot = await get(ref(db, 'bloqueios'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Bloqueio[] : [];
  },

  async togglePresenca(cpf: string, data: string, tipo: 'almoco' | 'jantar') {
    console.log(`Presença: ${cpf}, ${data}, ${tipo}`);
  }
};