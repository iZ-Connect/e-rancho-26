
export const normalizeCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '').padStart(11, '0');
};

export const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

export const getMinArranchamentoDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date;
};

/**
 * Calcula a data limite de 20 dias úteis após a data mínima
 */
export const getMaxArranchamentoDate = (startDate: Date): Date => {
  let date = new Date(startDate);
  let businessDaysCount = 0;
  while (businessDaysCount < 20) {
    date.setDate(date.getDate() + 1);
    if (isBusinessDay(date)) {
      businessDaysCount++;
    }
  }
  return date;
};

export const formatDateBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
};
