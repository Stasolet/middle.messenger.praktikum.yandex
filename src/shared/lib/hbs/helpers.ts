function eq(v1: unknown, v2: unknown): boolean {
  return v1 === v2;
}

function toTimeDate(timestamp: string | number | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  const numeric = typeof timestamp === 'number' ? timestamp : Number(timestamp);

  // Date не разбирает epoch-числа в виде строки ('1699999999' → Invalid Date):
  // числа до 1e11 трактуем как секунды, остальные — как миллисекунды
  if (Number.isFinite(numeric)) {
    return new Date(numeric < 1e11 ? numeric * 1000 : numeric);
  }

  return new Date(timestamp);
}

function time(timestamp: string | number | Date): string {
  const options: Record<string, string> = { hour: '2-digit', minute: '2-digit' };
  return toTimeDate(timestamp).toLocaleTimeString('ru-RU', options);
}

export { eq, time };
