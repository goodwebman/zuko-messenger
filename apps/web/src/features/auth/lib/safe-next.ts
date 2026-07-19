/**
 * Куда вернуть после входа. Принимаем только относительный путь внутри сайта:
 * `//evil.com` и `https://…` — это open redirect, поэтому отбрасываем.
 */
export function safeNext(raw: string | null, fallback = '/feed'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
