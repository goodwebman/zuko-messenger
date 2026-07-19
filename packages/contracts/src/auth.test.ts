import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth';
import { feedQuerySchema } from './post';

describe('registerSchema', () => {
  it('принимает валидные данные', () => {
    const res = registerSchema.safeParse({
      username: 'alice',
      email: 'alice@zuko.dev',
      password: 'password123',
      displayName: 'Alice',
    });
    expect(res.success).toBe(true);
  });

  it('отклоняет короткий пароль', () => {
    const res = registerSchema.safeParse({
      username: 'alice',
      email: 'alice@zuko.dev',
      password: 'short',
      displayName: 'Alice',
    });
    expect(res.success).toBe(false);
  });

  it('отклоняет невалидный username', () => {
    const res = registerSchema.safeParse({
      username: 'bad name!',
      email: 'a@b.co',
      password: 'password123',
      displayName: 'A',
    });
    expect(res.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('требует непустые поля', () => {
    expect(loginSchema.safeParse({ login: '', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ login: 'alice', password: 'x' }).success).toBe(true);
  });
});

describe('feedQuerySchema', () => {
  it('приводит limit из строки и подставляет дефолт', () => {
    const res = feedQuerySchema.parse({ limit: '10' });
    expect(res.limit).toBe(10);
    expect(feedQuerySchema.parse({}).limit).toBe(20);
  });

  it('ограничивает максимум', () => {
    expect(feedQuerySchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});
