import { describe, expect, it } from 'vitest';
import { beatsPerBar, generatePattern } from './rhythm';

describe('rhythm grammar', () => {
  it('uses two pulse beats for compound 6/8', () => expect(beatsPerBar('6/8')).toBe(2));
  it('generates deterministic in-range patterns', () => {
    const first = generatePattern('4/4', 'folk', 3, 3, 'fixed');
    const second = generatePattern('4/4', 'folk', 3, 3, 'fixed');
    expect(first.notes).toEqual(second.notes);
    expect(first.notes.every((note) => note.beat >= 0 && note.beat < 12)).toBe(true);
    expect(new Set(first.notes.map((note) => note.bar))).toEqual(new Set([0, 1, 2]));
  });
});
