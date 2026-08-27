import { describe, expect, it } from 'vitest';
import { scoreTaps } from './scoring';

describe('scoreTaps', () => {
  it('awards a perfect aligned take', () => {
    const result = scoreTaps([1000, 1500, 2000], [1000, 1500, 2000], 500);
    expect(result.score).toBe(100);
    expect(result.notes.every((note) => note.kind === 'on')).toBe(true);
  });
  it('marks early, late, missed, and extra taps honestly', () => {
    const result = scoreTaps([1000, 1500, 2000], [900, 1620, 2800], 500);
    expect(result.notes.map((note) => note.kind)).toEqual(['early', 'late', 'missed']);
    expect(result.extraTaps).toBe(1);
    expect(result.score).toBeLessThan(60);
  });
  it('subtracts the saved calibration offset', () => {
    const result = scoreTaps([1000], [1120], 500, 120);
    expect(result.notes[0].kind).toBe('on');
  });
});
