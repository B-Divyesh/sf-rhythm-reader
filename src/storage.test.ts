import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSettings, readHistory, readSettings, recordDrill, streakDays, takeStorageRecoveryNotice } from './storage';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) } });

describe('practice history', () => {
  beforeEach(() => { memory.clear(); takeStorageRecoveryNotice(); });
  it('groups drills by UTC day and keeps the best score', () => {
    recordDrill(70, new Date('2026-08-27T10:00:00Z'));
    const history = recordDrill(92, new Date('2026-08-27T18:00:00Z'));
    expect(history[0]).toEqual({ date: '2026-08-27', drills: 2, best: 92 });
  });
  it('counts an unbroken streak ending today', () => {
    expect(streakDays([{ date: '2026-08-25', drills: 1, best: 80 }, { date: '2026-08-26', drills: 1, best: 80 }, { date: '2026-08-27', drills: 1, best: 80 }], new Date('2026-08-27T12:00:00Z'))).toBe(3);
  });

  it('normalizes parseable invalid settings to the safe defaults', () => {
    memory.set('rr_settings:v1', JSON.stringify({
      meter: '999', style: 'not-a-style', bars: '∞', tempo: 'fast', difficulty: 99,
      lockLevel: 'maybe', inputMode: 'unknown', calibrationMs: 'NaN',
    }));

    expect(readSettings()).toEqual(defaultSettings);
    expect(JSON.parse(memory.get('rr_settings:v1') ?? '')).toEqual(defaultSettings);
    expect(takeStorageRecoveryNotice()).toMatch(/reset/i);
  });

  it('retains every valid persisted setting, including a numeric bar choice', () => {
    const saved = { meter: '6/8', style: 'march', bars: 4, tempo: 160, difficulty: 5, lockLevel: false, inputMode: 'mic', calibrationMs: -120 } as const;
    memory.set('rr_settings:v1', JSON.stringify(saved));
    expect(readSettings()).toEqual(saved);
    expect(takeStorageRecoveryNotice()).toBe('');
  });

  it('repairs null settings and rejects non-step, out-of-range numeric values', () => {
    memory.set('rr_settings:v1', 'null');
    expect(readSettings()).toEqual(defaultSettings);

    memory.set('rr_settings:v1', JSON.stringify({ ...defaultSettings, tempo: 85, difficulty: 0, calibrationMs: 251 }));
    expect(readSettings()).toEqual(defaultSettings);
  });

  it('filters malformed history entries and rewrites a normalized safe history', () => {
    memory.set('rr_history:v1', JSON.stringify([
      null,
      { date: '2026-08-27', drills: 2, best: 92 },
      { date: '2026-02-30', drills: 1, best: 80 },
      { date: '2026-08-27', drills: 1, best: 95 },
      { date: '2026-08-26', drills: -1, best: 80 },
    ]));

    expect(readHistory()).toEqual([{ date: '2026-08-27', drills: 3, best: 95 }]);
    expect(JSON.parse(memory.get('rr_history:v1') ?? '')).toEqual([{ date: '2026-08-27', drills: 3, best: 95 }]);
    expect(takeStorageRecoveryNotice()).toMatch(/reset/i);
  });

  it('recovers from a non-array history object without exposing it to the trainer', () => {
    memory.set('rr_history:v1', '{}');
    expect(readHistory()).toEqual([]);
    expect(memory.get('rr_history:v1')).toBe('[]');
  });

  it('keeps demo settings and history in demo-prefixed keys', async () => {
    const { configureStorage, resetDemoStorage, saveSettings, seedDemoStorage } = await import('./storage');
    memory.set('rr_settings:v1', JSON.stringify({ ...defaultSettings, meter: '3/4' }));
    configureStorage(true);
    seedDemoStorage(new Date('2026-08-28T12:00:00Z'));
    expect(readSettings().style).toBe('pop');
    saveSettings({ ...defaultSettings, meter: '6/8' });
    expect(JSON.parse(memory.get('rr_settings:v1') ?? '{}').meter).toBe('3/4');
    expect(JSON.parse(memory.get('demo:rr_settings:v1') ?? '{}').meter).toBe('6/8');
    expect(memory.has('demo:rr_history:v1')).toBe(true);
    resetDemoStorage();
    expect([...memory.keys()].filter((key) => key.startsWith('demo:'))).toEqual([]);
    configureStorage(false);
  });
});
