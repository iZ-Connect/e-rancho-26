import { fetchUsersFromSheet } from './googleSheets';
import { Militar } from '../types';

let currentUser: Militar | null = null;

export async function login(
  cpf: string,
  pin: string
): Promise<Militar | null> {

  try {
    const users = await fetchUsersFromSheet();

    const cleanCpf = cpf.replace(/\D/g, '').padStart(11, '0');

    const user = users.find(
      u =>
        u.cpf === cleanCpf &&
        String(u.pin) === String(pin) &&
        u.active
    );

    if (!user) return null;

    currentUser = user;

    return user;

  } catch (err) {
    console.error('Erro login', err);
    return null;
  }
}

export function logout() {
  currentUser = null;
}

export function getCurrentUser(): Militar | null {
  return currentUser;
}
