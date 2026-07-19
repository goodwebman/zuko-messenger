import { env } from '../config/env';

export interface ApiIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly issues?: ApiIssue[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorBody {
  error?: string;
  issues?: ApiIssue[];
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null;
}

// Single-flight refresh: параллельные 401 ждут один общий запрос refresh.
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${env.API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Внутренний флаг: запрос уже повторялся после refresh. */
  retry?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, retry, headers, ...rest } = options;

  // FormData отправляем как есть — Content-Type с boundary выставит браузер сам.
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${env.API_URL}/api${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && !retry) {
    const ok = await refreshSession();
    if (ok) return apiFetch<T>(path, { ...options, retry: true });
  }

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null);
    const body = isErrorBody(data) ? data : {};
    throw new ApiError(res.status, body.error ?? 'Ошибка запроса', body.issues);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
