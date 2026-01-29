import Papa from 'papaparse';
import { Militar, Role } from '../types';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/16xwdOjGn8Xv5uhykgedVWsfKM-K5_ADkVSo3OlvM4LA/export?format=csv';

function mapUserRole(sheetRole: string): Role {
  const role = (sheetRole || '').trim().toLowerCase();

  if (role.includes('adm geral')) return Role.ADM_GERAL;
  if (role.includes('adm local')) return Role.ADM_LOCAL;
  if (role.includes('fiscal')) return Role.FISCAL;

  return Role.MILITAR;
}

export async function fetchUsersFromSheet(): Promise<Militar[]> {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,

        complete: (results) => {
          const users: Militar[] = results.data
            .filter((row: any) => row['CPF'])
            .map((row: any) => {

              const isActive =
                row['Ativo?'] === 'TRUE' ||
                row['Ativo?'] === 'true' ||
                row['Ativo?'] === true ||
                row['Ativo?'] === 'on';

              return {
                id: String(row['ID'] || row['CPF']),

                cpf: String(row['CPF'])
                  .replace(/\D/g, '')
                  .padStart(11, '0'),

                nomeCompleto: row['Nome Completo'] || '',
                nomeGuerra: row['Nome de Guerra'] || '',
                posto: row['Posto'] || '',
                setor: row['Setor'] || '',

                role: mapUserRole(row['Usuário']),

                ativo: isActive,

                pin: String(row['PIN'] || '1234')
              };
            });

          resolve(users);
        },

        error: () => resolve([])
      });
    });
  } catch {
    return [];
  }
}
