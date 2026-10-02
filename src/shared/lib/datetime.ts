function time(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const options: Record<string, string> = { hour: '2-digit', minute: '2-digit' };
  return date.toLocaleTimeString('ru-RU', options);
}

function date(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const options: Record<string, string> = { day: '2-digit', month: 'short' };
  return date.toLocaleDateString('ru-RU', options);
}

export { date, time };
