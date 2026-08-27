export type Meter = '4/4' | '3/4' | '6/8';
export type Style = 'folk' | 'march' | 'pop' | 'swing' | 'clave';
export type InputMode = 'tap' | 'mic';

export interface RhythmNote {
  beat: number;
  duration: number;
  bar: number;
  accent?: boolean;
}

export interface Pattern {
  id: string;
  meter: Meter;
  style: Style;
  bars: number;
  difficulty: number;
  beatsPerBar: number;
  notes: RhythmNote[];
}

export type TimingKind = 'early' | 'on' | 'late' | 'missed';

export interface NoteResult {
  expectedMs: number;
  actualMs?: number;
  offsetMs?: number;
  kind: TimingKind;
}

export interface ScoreResult {
  score: number;
  notes: NoteResult[];
  extraTaps: number;
  meanAbsOffset: number;
  message: string;
}

export interface Settings {
  meter: Meter;
  style: Style;
  bars: number;
  tempo: number;
  difficulty: number;
  lockLevel: boolean;
  inputMode: InputMode;
  calibrationMs: number;
}
