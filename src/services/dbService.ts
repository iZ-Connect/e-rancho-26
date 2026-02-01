import { ref, get, set, update, remove } from 'firebase/database';
import { db } from './firebase';
import { Militar, Arranchamento, Cardapio, Aviso, Bloqueio } from '../types';

const SESSION_KEY = 'erancho_user_session';
const SEEN_NOTICES_KEY = 'erancho_seen_notices';

export const dbService = {

  async init() {
    console.log("Serviço Firebase Iniciado");
    return true;
  },

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

  async login(cpf: string, pin: string): Promise<Militar> {
    try {
      const dbRef = ref(db, 'militares');
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const militares = Object.values(data) as any[];

        const militar = militares.find(m => {
          // Proteção contra nulos
          if (!m) return false;
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

  // --- CORREÇÃO PRINCIPAL AQUI ---
  async getMilitares(): Promise<Militar[]> {
    const snapshot = await get(ref(db, 'militares'));
    if (snapshot.exists()) {
      const rawData = Object.values(snapshot.val());
      // FILTRA APENAS REGISTROS VÁLIDOS (que têm CPF)
      return rawData.filter((m: any) => m && m.cpf) as Militar[];
    }
    return [];
  },

  async addMilitar(militar: Militar) {
    const newId = Date.now().toString();
    const militarComId = { ...militar, id: newId };
    await set(ref(db, `militares/${newId}`), militarComId);
  },

  async updateMilitar(militar: Militar) {
    if (!militar.id) throw new Error("ID inválido");
    await update(ref(db, `militares/${militar.id}`), militar);
  },

  async deleteMilitar(cpf: string) {
    const militares = await this.getMilitares();
    const militar = militares.find(m => String(m.cpf) === String(cpf));

    if (militar && militar.id) {
      await remove(ref(db, `militares/${militar.id}`));
    }

    const arranchamentos = await this.getArranchamentos();
    const agendamentosDoMilitar = arranchamentos.filter(a => String(a.militar_cpf) === String(cpf));

    for (const agendamento of agendamentosDoMilitar) {
      const idAgendamento = `${agendamento.militar_cpf}_${agendamento.data}`;
      await remove(ref(db, `arranchamentos/${idAgendamento}`));
    }
  },

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

  async saveAviso(aviso: Aviso) {
    await set(ref(db, `avisos/${aviso.id}`), aviso);
  },

  async deleteAviso(id: string) {
    await remove(ref(db, `avisos/${id}`));
  },

  async getAvisos(): Promise<Aviso[]> {
    const snapshot = await get(ref(db, 'avisos'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Aviso[] : [];
  },

  async getUnseenActiveNotices(): Promise<Aviso[]> {
    const avisos = await this.getAvisos();
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    return avisos.filter(a => !seenIds.includes(a.id));
  },

  markNoticeAsSeen(id: string) {
    const seenIds = JSON.parse(localStorage.getItem(SEEN_NOTICES_KEY) || '[]');
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      localStorage.setItem(SEEN_NOTICES_KEY, JSON.stringify(seenIds));
    }
  },

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

  async getArranchamentos(militarCpf?: string): Promise<Arranchamento[]> {
    const snapshot = await get(ref(db, 'arranchamentos'));
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as Arranchamento[];
      return militarCpf ? data.filter(a => a.militar_cpf === militarCpf) : data;
    }
    return [];
  },

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

  async togglePresenca(cpf: string, data: string, tipo: 'almoco' | 'jantar') {
    const id = `${cpf}_${data}`;
    const arranchRef = ref(db, `arranchamentos/${id}`);

    const snapshot = await get(arranchRef);
    let record = snapshot.val();

    if (!record) {
      record = {
        id: id,
        militar_cpf: cpf,
        data: data,
        almoco: false,
        jantar: false,
        presenca_almoco: false,
        presenca_jantar: false
      };
    }

    if (tipo === 'almoco') record.presenca_almoco = true;
    if (tipo === 'jantar') record.presenca_jantar = true;

    await set(arranchRef, record);
  }
};