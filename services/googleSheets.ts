import Papa from 'papaparse';
import { Militar, UserRole } from '../types';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/16xwdOjGn8Xv5uhykgedVWsfKM-K5_ADkVSo3OlvM4LA/export?format=csv';

function mapUserRole(sheetRole: string): UserRole {
  const role = (sheetRole || '').trim().toLowerCase();

  if (['fiscal do dia', 'adm local', 'adm geral', 'admin'].includes(role)) {
    return UserRole.ADMIN;
  }

  return UserRole.MILITARY;
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
              const name =
                row['Nome de Guerra'] ||
                row['Nome Completo'] ||
                'Militar';

              const avatarUrl =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

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

                name: row['Nome Completo'] || '',
                warName: row['Nome de Guerra'] || '',
                rank: row['Posto'] || '',
                sector: row['Setor'] || '',

                role: mapUserRole(row['Usuário']),

                avatarUrl,
                active: isActive,

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
