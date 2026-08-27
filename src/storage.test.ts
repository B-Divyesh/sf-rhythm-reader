import { beforeEach, describe, expect, it } from 'vitest';
import { recordDrill, streakDays } from './storage';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) } });

describe('practice history', () => {
  beforeEach(() => memory.clear());
  it('groups drills by UTC day and keeps the best score', () => {
    recordDrill(70, new Date('2026-08-27T10:00:00Z'));
    const history = recordDrill(92, new Date('2026-08-27T18:00:00Z'));
    expect(history[0]).toEqual({ date: '2026-08-27', drills: 2, best: 92 });
  });
  it('counts an unbroken streak ending today', () => {
    expect(streakDays([{ date: '2026-08-25', drills: 1, best: 80 }, { date: '2026-08-26', drills: 1, best: 80 }, { date: '2026-08-27', drills: 1, best: 80 }], new Date('2026-08-27T12:00:00Z'))).toBe(3);
  });
});
