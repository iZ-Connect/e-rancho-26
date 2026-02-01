import { ref, get, set, update, remove } from 'firebase/database';
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
    await set(ref(db, `cardapio/${cardapio.data}`), cardapio);
  },

  async deleteCardapio(data: string) {
    await remove(ref(db, `cardapio/${data}`));
  },

  async getCardapio(): Promise<Cardapio[]> {
    const snapshot = await get(ref(db, 'cardapio'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Cardapio[] : [];
  },

  // --- AVISOS (ATUALIZADO PARA EXCLUIR DE VERDADE) ---
  async saveAviso(aviso: Aviso) {
    await set(ref(db, `avisos/${aviso.id}`), aviso);
  },

  async deleteAviso(id: string) {
    // Agora usa REMOVE para apagar do banco, não apenas desativar
    await remove(ref(db, `avisos/${id}`));
  },

  async getAvisos(): Promise<Aviso[]> {
    const snapshot = await get(ref(db, 'avisos'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Aviso[] : [];
  },

  async getUnseenActiveNotices(): Promise<Aviso[]> {
    const avisos = await this.getAvisos();
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    // Filtra avisos que existem e não foram vistos (removido filtro de 'ativo' pois agora apagamos os inativos)
    return avisos.filter(a => !seenIds.includes(a.id));
  },

  markNoticeAsSeen(id: string) {
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      localStorage.setItem(SEEN_NOTICES_KEY, JSON.stringify(seenIds));
    }
  },

  // --- ARRANCHAMENTOS ---
  async saveArranchamento(cpf: string, data: string, refeicao: string) {
    const id = `${cpf}_${data}`;
    const arranchRef = ref(db, `arranchamentos/${id}`);

    const snapshot = await get(arranchRef);
    let currentData = snapshot.val();

    if (!currentData) {
      currentData = {
        id: id,
        militar_cpf: cpf,
        data: data,
        almoco: false,
        jantar: false,
        presenca_almoco: false,
        presenca_jantar: false
      };
    }

    const tipo = refeicao.toLowerCase();

    if (tipo.includes('almoc') || tipo.includes('almoç')) {
      currentData.almoco = !currentData.almoco;
    }
    else if (tipo.includes('jantar')) {
      currentData.jantar = !currentData.jantar;
    }

    const estaVazio =
      currentData.almoco === false &&
      currentData.jantar === false &&
      !currentData.presenca_almoco &&
      !currentData.presenca_jantar;

    if (estaVazio) {
      await remove(arranchRef);
    } else {
      await set(arranchRef, currentData);
    }
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

  // --- BLOQUEIOS ---
  async saveBloqueio(bloqueio: Bloqueio) {
    await set(ref(db, `bloqueios/${bloqueio.data}`), bloqueio);
  },

  async removeBloqueio(data: string) {
    await remove(ref(db, `bloqueios/${data}`));
  },

  async getBloqueios(): Promise<Bloqueio[]> {
    const snapshot = await get(ref(db, 'bloqueios'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Bloqueio[] : [];
  },

  // --- PRESENÇA ---
  async togglePresenca(cpf: string, data: string, tipo: 'almoco' | 'jantar') {
    const id = `${cpf}_${data}`;
    const arranchRef = ref(db, `arranchamentos/${id}`);

    const snapshot = await get(arranchRef);
    if (snapshot.exists()) {
      const updates: any = {};
      if (tipo === 'almoco') updates.presenca_almoco = true;
      if (tipo === 'jantar') updates.presenca_jantar = true;
      await update(arranchRef, updates);
    }
  }
};