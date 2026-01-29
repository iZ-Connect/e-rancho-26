
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

export const formatDateBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
};
