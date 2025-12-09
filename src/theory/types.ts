// Voice types
export type Voice = 'soprano' | 'alto' | 'tenor' | 'bass';

// Voicing is an array of scale degrees with octave markers
// e.g., [1, 3, 5, "1'"] represents root, third, fifth, root up an octave
export type VoicingDegree = number | string;
export type Voicing = VoicingDegree[];

// Clef arrangement modes
export type ClefArrangement = 'SA/TB' | 'Four staves';

// Key signatures - we'll use integers 0-11 for semitones from C
export type KeySignature =
  | 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#'
  | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb';

// Mode (major or minor)
export type Mode = 'major' | 'minor';

// Map key signatures to semitones from C
export const KEY_SEMITONES: Record<KeySignature, number> = {
  'C': 0, 'G': 7, 'D': 2, 'A': 9, 'E': 4, 'B': 11, 'F#': 6,
  'F': 5, 'Bb': 10, 'Eb': 3, 'Ab': 8, 'Db': 1, 'Gb': 6
};

// Scale degrees in major scale (semitones from root)
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// SATB ranges (MIDI note numbers)
export const VOICE_RANGES = {
  soprano: { min: 60, max: 81 },  // C4 to A5
  alto: { min: 55, max: 76 },     // G3 to E5
  tenor: { min: 48, max: 67 },    // C3 to G4
  bass: { min: 40, max: 62 }      // E2 to D4
};

// Pitch representation (MIDI note number)
export type Pitch = number;

// Chord representation
export interface Chord {
  root: number;           // Scale degree (1-7)
  keySignature: KeySignature;
  mode: Mode;             // major or minor
  voicing: Voicing;
  pitches: [Pitch, Pitch, Pitch, Pitch]; // [soprano, alto, tenor, bass]
}

// Voicing categories
export type VoicingCategory =
  | 'SB-doubled-close'
  | 'SB-doubled-spread'
  | 'AB-doubled-close'
  | 'AB-doubled-spread'
  | 'TB-doubled-close'
  | 'TB-doubled-spread'
  | 'ST-doubled-bottom-close'
  | 'ST-doubled-bottom-spread'
  | 'TA-doubled-close'
  | 'TA-doubled-spread'
  | 'AS-doubled-close'
  | 'AS-doubled-spread';
