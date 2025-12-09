import {
  Pitch,
  Voicing,
  VoicingDegree,
  KeySignature
} from './types';

// Note letters in diatonic order
export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Semitones from C for each natural note
const NATURAL_SEMITONES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

// Key signature accidentals (which notes are sharped or flatted)
export const KEY_ACCIDENTALS: Record<KeySignature, Record<string, number>> = {
  'C': {},
  'G': { 'F': 1 },
  'D': { 'F': 1, 'C': 1 },
  'A': { 'F': 1, 'C': 1, 'G': 1 },
  'E': { 'F': 1, 'C': 1, 'G': 1, 'D': 1 },
  'B': { 'F': 1, 'C': 1, 'G': 1, 'D': 1, 'A': 1 },
  'F#': { 'F': 1, 'C': 1, 'G': 1, 'D': 1, 'A': 1, 'E': 1 },
  'F': { 'B': -1 },
  'Bb': { 'B': -1, 'E': -1 },
  'Eb': { 'B': -1, 'E': -1, 'A': -1 },
  'Ab': { 'B': -1, 'E': -1, 'A': -1, 'D': -1 },
  'Db': { 'B': -1, 'E': -1, 'A': -1, 'D': -1, 'G': -1 },
  'Gb': { 'B': -1, 'E': -1, 'A': -1, 'D': -1, 'G': -1, 'C': -1 }
};

/**
 * Parse a voicing degree to extract the scale degree and octave displacement
 * Examples:
 *   1 -> { degree: 1, octaveShift: 0 }
 *   "1'" -> { degree: 1, octaveShift: 1 }
 *   "3''" -> { degree: 3, octaveShift: 2 }
 */
function parseVoicingDegree(degree: VoicingDegree): { degree: number; octaveShift: number } {
  if (typeof degree === 'number') {
    return { degree, octaveShift: 0 };
  }

  // Count the number of prime marks
  const primeCount = (degree.match(/'/g) || []).length;
  const scaleDegreeParsed = parseInt(degree.replace(/'/g, ''));

  return {
    degree: scaleDegreeParsed,
    octaveShift: primeCount
  };
}

/**
 * Get the note letter for a scale degree in a given key (diatonic calculation)
 * @param scaleDegree - Scale degree (can be > 7 or < 1)
 * @param keySignature - The key signature
 * @returns Note letter (C, D, E, F, G, A, or B)
 */
export function getNoteLetter(scaleDegree: number, keySignature: KeySignature): string {
  // Get the tonic note letter of the key
  const tonicLetter = keySignature[0]; // 'C' from 'C', 'G' from 'G', 'D' from 'Db', etc.
  const tonicIndex = NOTE_LETTERS.indexOf(tonicLetter);

  // Add (scaleDegree - 1) diatonic steps
  const noteIndex = tonicIndex + scaleDegree - 1;
  const wrappedIndex = ((noteIndex % 7) + 7) % 7;

  return NOTE_LETTERS[wrappedIndex];
}

/**
 * Calculate the MIDI pitch for a note letter with accidental and octave
 */
export function noteToMidiPitch(noteLetter: string, accidental: number, octave: number): Pitch {
  const basePitch = NATURAL_SEMITONES[noteLetter];
  return (octave + 1) * 12 + basePitch + accidental;
}

/**
 * Calculate the absolute pitch (MIDI note number) for a voicing degree
 * given a reference root note
 *
 * @param voicingDegree - The scale degree relative to chord root (e.g., 1="root", 3="third", 5="fifth")
 * @param referenceRoot - MIDI note number of the chord root
 * @param keySignature - The key signature
 * @param rootScaleDegree - The scale degree of the chord root in the key (1-7)
 */
function calculatePitchFromDegree(
  voicingDegree: VoicingDegree,
  referenceRoot: Pitch,
  keySignature: KeySignature,
  rootScaleDegree: number
): Pitch {
  const { degree, octaveShift } = parseVoicingDegree(voicingDegree);

  // Calculate absolute scale degree in the key (relative to chord root)
  const absoluteScaleDegree = rootScaleDegree + (degree - 1);

  // Get the note letter diatonically
  const noteLetter = getNoteLetter(absoluteScaleDegree, keySignature);

  // Get the accidental from the key signature
  const accidental = KEY_ACCIDENTALS[keySignature][noteLetter] || 0;

  // Calculate which octave this note should be in
  // Start from reference root's octave and adjust
  const referenceOctave = Math.floor(referenceRoot / 12) - 1;
  const rootNoteLetter = getNoteLetter(rootScaleDegree, keySignature);
  const rootNoteIndex = NOTE_LETTERS.indexOf(rootNoteLetter);
  const noteIndex = NOTE_LETTERS.indexOf(noteLetter);

  // Calculate how many diatonic steps from root to this note
  const diatonicSteps = (degree - 1);
  const octavesCrossed = Math.floor(diatonicSteps / 7);

  // Determine base octave
  let octave = referenceOctave + octavesCrossed;

  // If the note letter is lower in the alphabet than root but we haven't crossed an octave, we need to go up
  if (octavesCrossed === 0 && noteIndex < rootNoteIndex) {
    octave += 1;
  }

  // Apply explicit octave shift from prime marks
  octave += octaveShift;

  // Convert to MIDI pitch
  return noteToMidiPitch(noteLetter, accidental, octave);
}

/**
 * Find an appropriate reference root note for the bass voice
 * This should be at or below the lowest note in the voicing
 *
 * @param rootScaleDegree - The scale degree of the chord root (1-7)
 * @param keySignature - The key signature
 * @param voicing - The voicing array
 * @returns MIDI note number of the reference root
 */
function findReferenceRoot(
  rootScaleDegree: number,
  keySignature: KeySignature,
  _voicing: Voicing
): Pitch {
  // Get the note letter for the root
  const noteLetter = getNoteLetter(rootScaleDegree, keySignature);

  // Get the accidental from key signature
  const accidental = KEY_ACCIDENTALS[keySignature][noteLetter] || 0;

  // Start with octave 3 as reference (around middle C)
  let octave = 3;
  let pitch = noteToMidiPitch(noteLetter, accidental, octave);

  // Normalize to C3-B3 range (MIDI 48-59)
  while (pitch >= 60) {
    octave -= 1;
    pitch = noteToMidiPitch(noteLetter, accidental, octave);
  }
  while (pitch < 48) {
    octave += 1;
    pitch = noteToMidiPitch(noteLetter, accidental, octave);
  }

  return pitch;
}

/**
 * Calculate all four pitches (SATB) for a given chord
 *
 * @param rootScaleDegree - The scale degree of the chord root (1-7)
 * @param keySignature - The key signature
 * @param voicing - The voicing array [bass, tenor, alto, soprano]
 * @param explicitReferenceRoot - Optional explicit reference root (bass pitch). If not provided, one will be calculated.
 * @returns Array of MIDI pitches [soprano, alto, tenor, bass]
 */
export function calculatePitches(
  rootScaleDegree: number,
  keySignature: KeySignature,
  voicing: Voicing,
  explicitReferenceRoot?: Pitch
): [Pitch, Pitch, Pitch, Pitch] {
  if (voicing.length !== 4) {
    throw new Error('Voicing must have exactly 4 notes');
  }

  // Use explicit reference root if provided, otherwise calculate one
  const referenceRoot = explicitReferenceRoot ?? findReferenceRoot(rootScaleDegree, keySignature, voicing);

  // Calculate pitches for each voice (input is [bass, tenor, alto, soprano])
  const [bass, tenor, alto, soprano] = voicing.map(degree =>
    calculatePitchFromDegree(degree, referenceRoot, keySignature, rootScaleDegree)
  );

  // Return in SATB order from top to bottom
  return [soprano, alto, tenor, bass];
}

/**
 * Get the note name for a MIDI pitch
 * Useful for debugging
 */
export function pitchToNoteName(pitch: Pitch): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(pitch / 12) - 1;
  const noteName = noteNames[pitch % 12];
  return `${noteName}${octave}`;
}

/**
 * Get the chord quality name based on the root scale degree and mode
 */
export function getChordQuality(rootScaleDegree: number, mode: 'major' | 'minor'): string {
  const majorQualities = [
    'I',      // Tonic - Major
    'ii',     // Supertonic - minor
    'iii',    // Mediant - minor
    'IV',     // Subdominant - Major
    'V',      // Dominant - Major
    'vi',     // Submediant - minor
    'vii°'    // Leading tone - diminished
  ];

  const minorQualities = [
    'i',      // Tonic - minor
    'ii°',    // Supertonic - diminished
    'III',    // Mediant - Major
    'iv',     // Subdominant - minor
    'v',      // Dominant - minor (natural minor)
    'VI',     // Submediant - Major
    'VII'     // Subtonic - Major
  ];

  const qualities = mode === 'major' ? majorQualities : minorQualities;
  const index = ((rootScaleDegree - 1) % 7 + 7) % 7;
  return qualities[index];
}

/**
 * Get the note name with appropriate accidental for the key signature
 */
export function getNoteNameInKey(pitch: Pitch, _keySignature: KeySignature): string {
  // This is a simplified version - a full implementation would need
  // to consider the key signature to choose between enharmonic equivalents
  return pitchToNoteName(pitch);
}
