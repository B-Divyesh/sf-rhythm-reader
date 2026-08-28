import type { Settings } from './types';

const REAL_SETTINGS_KEY = 'rr_settings:v1';
const REAL_HISTORY_KEY = 'rr_history:v1';
const DEMO_PREFIX = 'demo:';
const METERS = ['4/4', '3/4', '6/8'] as const;
const STYLES = ['folk', 'march', 'pop', 'swing', 'clave'] as const;
const INPUT_MODES = ['tap', 'mic'] as const;
const MAX_HISTORY_DAYS = 90;
const MAX_DRILLS_PER_DAY = 1_000_000;

let repairedPersistedState = false;
let demoMode = false;

function settingsKey(): string { return `${demoMode ? DEMO_PREFIX : ''}${REAL_SETTINGS_KEY}`; }
function historyKey(): string { return `${demoMode ? DEMO_PREFIX : ''}${REAL_HISTORY_KEY}`; }

/** Selects an isolated storage namespace before any settings or history are read. */
export function configureStorage(useDemoNamespace: boolean): void {
  demoMode = useDemoNamespace;
  repairedPersistedState = false;
}

export function resetDemoStorage(): void {
  localStorage.removeItem(`${DEMO_PREFIX}${REAL_SETTINGS_KEY}`);
  localStorage.removeItem(`${DEMO_PREFIX}${REAL_HISTORY_KEY}`);
}

export function seedDemoStorage(now = new Date()): void {
  if (!demoMode) return;
  if (localStorage.getItem(settingsKey()) === null) {
    writeJson(settingsKey(), { ...defaultSettings, style: 'pop', tempo: 88, difficulty: 2 });
  }
  if (localStorage.getItem(historyKey()) === null) {
    const days = [4, 2, 1].map((back, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - back));
      return { date: date.toISOString().slice(0, 10), drills: index + 1, best: [72, 84, 91][index] };
    });
    writeJson(historyKey(), days);
  }
}

export interface DayRecord { date: string; drills: number; best: number }

export const defaultSettings: Settings = {
  meter: '4/4', style: 'folk', bars: 2, tempo: 84, difficulty: 2,
  lockLevel: true, inputMode: 'tap', calibrationMs: 0,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isOneOf<Value extends string | number>(value: unknown, allowed: readonly Value[]): value is Value {
  return (typeof value === 'string' || typeof value === 'number') && allowed.includes(value as Value);
}

function isIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;
}

function sameJson(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

function readJson(key: string): { found: boolean; value: unknown; validJson: boolean } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { found: false, value: undefined, validJson: true };
    return { found: true, value: JSON.parse(raw), validJson: true };
  } catch {
    return { found: true, value: undefined, validJson: false };
  }
}

function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* Storage can be unavailable in a private or restricted browser. */ }
}

function markRepaired(): void {
  repairedPersistedState = true;
}

/** Returns a one-session explanation after corrupted local data was repaired. */
export function takeStorageRecoveryNotice(): string {
  if (!repairedPersistedState) return '';
  repairedPersistedState = false;
  return 'Damaged practice data was reset. You can start a new rhythm.';
}

export function readSettings(): Settings {
  const key = settingsKey();
  const stored = readJson(key);
  if (!stored.found) return { ...defaultSettings };

  const source = isPlainObject(stored.value) ? stored.value : {};
  const normalized: Settings = {
    meter: isOneOf(source.meter, METERS) ? source.meter : defaultSettings.meter,
    style: isOneOf(source.style, STYLES) ? source.style : defaultSettings.style,
    bars: isOneOf(source.bars, [2, 3, 4] as const) ? source.bars : defaultSettings.bars,
    tempo: isIntegerInRange(source.tempo, 50, 160) && source.tempo % 2 === 0 ? source.tempo : defaultSettings.tempo,
    difficulty: isIntegerInRange(source.difficulty, 1, 5) ? source.difficulty : defaultSettings.difficulty,
    lockLevel: typeof source.lockLevel === 'boolean' ? source.lockLevel : defaultSettings.lockLevel,
    inputMode: isOneOf(source.inputMode, INPUT_MODES) ? source.inputMode : defaultSettings.inputMode,
    calibrationMs: isIntegerInRange(source.calibrationMs, -250, 250) ? source.calibrationMs : defaultSettings.calibrationMs,
  };

  if (!stored.validJson || !sameJson(stored.value, normalized)) {
    markRepaired();
    writeJson(key, normalized);
  }
  return normalized;
}

export function saveSettings(settings: Settings): void {
  writeJson(settingsKey(), settings);
}

export function readHistory(): DayRecord[] {
  const key = historyKey();
  const stored = readJson(key);
  if (!stored.found) return [];
  const records = Array.isArray(stored.value) ? stored.value : [];
  const byDate = new Map<string, DayRecord>();

  for (const value of records) {
    if (!isPlainObject(value) || !isValidDate(value.date) || !isIntegerInRange(value.drills, 1, MAX_DRILLS_PER_DAY) || !isIntegerInRange(value.best, 0, 100)) continue;
    const existing = byDate.get(value.date);
    byDate.set(value.date, {
      date: value.date,
      drills: Math.min(MAX_DRILLS_PER_DAY, (existing?.drills ?? 0) + value.drills),
      best: Math.max(existing?.best ?? 0, value.best),
    });
  }
  const normalized = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX_HISTORY_DAYS);
  if (!stored.validJson || !sameJson(stored.value, normalized)) {
    markRepaired();
    writeJson(key, normalized);
  }
  return normalized;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function recordDrill(score: number, now = new Date()): DayRecord[] {
  const date = now.toISOString().slice(0, 10);
  const history = readHistory();
  const existing = history.find((day) => day.date === date);
  if (existing) { existing.drills += 1; existing.best = Math.max(existing.best, score); }
  else history.push({ date, drills: 1, best: score });
  const trimmed = history.sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX_HISTORY_DAYS);
  writeJson(historyKey(), trimmed);
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
