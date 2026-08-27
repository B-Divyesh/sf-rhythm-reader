import type { NoteResult, ScoreResult } from './types';

export function scoreTaps(expectedMs: number[], tapsMs: number[], beatMs: number, calibrationMs = 0): ScoreResult {
  const corrected = tapsMs.map((tap) => tap - calibrationMs);
  const used = new Set<number>();
  const tolerance = Math.min(260, beatMs * .38);
  const onTime = Math.min(75, beatMs * .12);
  const notes: NoteResult[] = expectedMs.map((expected) => {
    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;
    corrected.forEach((tap, index) => {
      const distance = Math.abs(tap - expected);
      if (!used.has(index) && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex < 0 || closestDistance > tolerance) return { expectedMs: expected, kind: 'missed' };
    used.add(closestIndex);
    const actualMs = corrected[closestIndex];
    const offsetMs = actualMs - expected;
    const kind = Math.abs(offsetMs) <= onTime ? 'on' : offsetMs < 0 ? 'early' : 'late';
    return { expectedMs: expected, actualMs, offsetMs, kind };
  });
  const extraTaps = Math.max(0, corrected.length - used.size);
  const hits = notes.filter((note) => note.offsetMs !== undefined);
  const meanAbsOffset = hits.length
    ? Math.round(hits.reduce((sum, note) => sum + Math.abs(note.offsetMs ?? 0), 0) / hits.length)
    : 0;
  const timingPoints = notes.reduce((sum, note) => {
    if (note.offsetMs === undefined) return sum;
    return sum + Math.max(0, 1 - Math.abs(note.offsetMs) / tolerance);
  }, 0);
  const raw = expectedMs.length ? timingPoints / expectedMs.length : 0;
  const score = Math.max(0, Math.round((raw * 100) - extraTaps * 3));
  const message = score >= 92 ? 'Locked in. Clean and steady.'
    : score >= 78 ? 'Solid take. Check the marked edges.'
      : score >= 55 ? 'The shape is there. Slow it down once.'
        : 'Try it again under tempo and count aloud.';
  return { score, notes, extraTaps, meanAbsOffset, message };
}
