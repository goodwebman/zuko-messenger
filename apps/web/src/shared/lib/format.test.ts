import { describe, expect, it } from 'vitest';
import { initials, timeAgo } from './format';

describe('initials', () => {
  it('берёт первые буквы двух слов', () => {
    expect(initials('Alice Smith')).toBe('AS');
  });
  it('обрабатывает одно слово', () => {
    expect(initials('Bob')).toBe('B');
  });
  it('игнорирует лишние пробелы', () => {
    expect(initials('  john   doe  ')).toBe('JD');
  });
});

describe('timeAgo', () => {
  it('свежее время → «только что»', () => {
    expect(timeAgo(new Date().toISOString())).toBe('только что');
  });
  it('минуты', () => {
    const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('5 мин');
  });
  it('часы', () => {
    const iso = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('3 ч');
  });
  it('дни', () => {
    const iso = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('2 д');
  });
});
