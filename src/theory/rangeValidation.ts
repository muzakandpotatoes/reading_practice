import { Pitch, VOICE_RANGES, Voice } from './types';

/**
 * Check if a pitch is within the valid range for a given voice
 */
export function isPitchInRange(pitch: Pitch, voice: Voice): boolean {
  const range = VOICE_RANGES[voice];
  return pitch >= range.min && pitch <= range.max;
}

/**
 * Validate that all four pitches are within their respective SATB ranges
 *
 * @param pitches - Array of pitches [soprano, alto, tenor, bass]
 * @returns true if all pitches are valid, false otherwise
 */
export function validatePitches(pitches: [Pitch, Pitch, Pitch, Pitch]): boolean {
  const [soprano, alto, tenor, bass] = pitches;

  return (
    isPitchInRange(soprano, 'soprano') &&
    isPitchInRange(alto, 'alto') &&
    isPitchInRange(tenor, 'tenor') &&
    isPitchInRange(bass, 'bass')
  );
}

/**
 * Get which voices are out of range (for debugging)
 */
export function getOutOfRangeVoices(pitches: [Pitch, Pitch, Pitch, Pitch]): Voice[] {
  const voices: Voice[] = ['soprano', 'alto', 'tenor', 'bass'];
  const outOfRange: Voice[] = [];

  pitches.forEach((pitch, index) => {
    if (!isPitchInRange(pitch, voices[index])) {
      outOfRange.push(voices[index]);
    }
  });

  return outOfRange;
}
