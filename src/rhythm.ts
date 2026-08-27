import type { Meter, Pattern, RhythmNote, Style } from './types';

export const FREE_STYLES: Style[] = ['folk', 'march'];
export const STYLE_LABELS: Record<Style, string> = {
  folk: 'Folk steps',
  march: 'March',
  pop: 'Pop backbeat',
  swing: 'Swing',
  clave: '3–2 clave',
};

const simpleGestures: Record<Style, number[][]> = {
  folk: [[0], [0, .5], [0, .75], [0, .5, .75], [0, .25, .5]],
  march: [[0], [0, .5], [0, .25, .5, .75], [0, .5, .75], [.25, .5, .75]],
  pop: [[0], [0, .5], [.5], [0, .25, .5], [0, .5, .75]],
  swing: [[0], [0, 2 / 3], [0, 1 / 3, 2 / 3], [2 / 3]],
  clave: [[0], [.5], [0, .5], [0, .75]],
};

export function beatsPerBar(meter: Meter): number {
  return meter === '3/4' ? 3 : meter === '6/8' ? 2 : 4;
}

export function beatLabel(meter: Meter): string {
  return meter === '6/8' ? 'dotted-quarter beat' : 'quarter-note beat';
}

function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function rng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePattern(
  meter: Meter,
  style: Style,
  bars: number,
  difficulty: number,
  seed = `${Date.now()}-${Math.random()}`,
): Pattern {
  const random = rng(hash(`${meter}-${style}-${bars}-${difficulty}-${seed}`));
  const perBar = beatsPerBar(meter);
  const notes: RhythmNote[] = [];
  const gestures = simpleGestures[style];
  const maxIndex = Math.min(gestures.length, Math.max(2, difficulty + 1));

  if (style === 'clave') {
    const clave = [0, 1.5, 2, 4, 5];
    for (let bar = 0; bar < bars; bar += 1) {
      for (const beat of clave) {
        const within = beat % (perBar * 2);
        if (within < perBar && (bar % 2 === Math.floor(beat / perBar))) notes.push({ beat: bar * perBar + within, duration: .5, bar, accent: true });
      }
    }
  } else {
    for (let bar = 0; bar < bars; bar += 1) {
      for (let beat = 0; beat < perBar; beat += 1) {
        let choices = gestures.slice(0, maxIndex);
        if (beat === 0) choices = choices.filter((gesture) => gesture[0] === 0);
        const gesture = choices[Math.floor(random() * choices.length)] ?? [0];
        for (const offset of gesture) {
          notes.push({ beat: bar * perBar + beat + offset, duration: gesture.length > 1 ? .25 : .75, bar, accent: beat === 0 });
        }
      }
    }
  }

  return {
    id: hash(`${seed}-${notes.map((note) => note.beat).join(',')}`).toString(36),
    meter,
    style,
    bars,
    difficulty,
    beatsPerBar: perBar,
    notes,
  };
}

export function spokenCount(pattern: Pattern): string {
  const count = pattern.meter === '6/8' ? ['ONE-and-a', 'TWO-and-a'] : Array.from({ length: pattern.beatsPerBar }, (_, index) => `${index + 1}`);
  return count.join(' · ');
}
