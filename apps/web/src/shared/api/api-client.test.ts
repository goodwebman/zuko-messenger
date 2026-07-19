import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api-client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('возвращает распарсенный JSON при 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { id: '1', name: 'ok' })),
    );
    const data = await apiFetch<{ id: string; name: string }>('/x');
    expect(data).toEqual({ id: '1', name: 'ok' });
  });

  it('кидает ApiError с сообщением сервера при 4xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { error: 'Занято' })));
    await expect(apiFetch('/x', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 409,
      message: 'Занято',
    });
  });

  it('при 401 рефрешит сессию и повторяет запрос', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) return Promise.resolve(new Response(null, { status: 200 }));
      if (fetchMock.mock.calls.length <= 1) return Promise.resolve(new Response(null, { status: 401 }));
      return Promise.resolve(jsonResponse(200, { ok: true }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await apiFetch<{ ok: boolean }>('/protected');
    expect(data).toEqual({ ok: true });
    // основной(401) + refresh + повтор = 3 вызова
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('ApiError доступен как класс', () => {
    const err = new ApiError(400, 'bad');
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
  });
});
