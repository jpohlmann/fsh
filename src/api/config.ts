export function getApiUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
}

export function isDailyApiConfigured(): boolean {
  return getApiUrl().length > 0;
}
