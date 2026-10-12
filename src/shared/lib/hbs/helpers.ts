function eq(v1: unknown, v2: unknown): boolean {
  return v1 === v2;
}

function time(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const options: Record<string, string> = { hour: '2-digit', minute: '2-digit' };
  return date.toLocaleTimeString('ru-RU', options);
}

export { eq, time };
