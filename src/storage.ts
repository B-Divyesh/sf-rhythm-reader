import type { Settings } from './types';

const SETTINGS_KEY = 'rr_settings:v1';
const HISTORY_KEY = 'rr_history:v1';

export interface DayRecord { date: string; drills: number; best: number }

export const defaultSettings: Settings = {
  meter: '4/4', style: 'folk', bars: 2, tempo: 84, difficulty: 2,
  lockLevel: true, inputMode: 'tap', calibrationMs: 0,
};

export function readSettings(): Settings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch { return { ...defaultSettings }; }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function readHistory(): DayRecord[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as DayRecord[]; }
  catch { return []; }
}

export function recordDrill(score: number, now = new Date()): DayRecord[] {
  const date = now.toISOString().slice(0, 10);
  const history = readHistory();
  const existing = history.find((day) => day.date === date);
  if (existing) { existing.drills += 1; existing.best = Math.max(existing.best, score); }
  else history.push({ date, drills: 1, best: score });
  const trimmed = history.sort((a, b) => a.date.localeCompare(b.date)).slice(-90);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function streakDays(history: DayRecord[], now = new Date()): number {
  const dates = new Set(history.map((day) => day.date));
  let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
