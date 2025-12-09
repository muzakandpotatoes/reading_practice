import { Voicing, VoicingCategory } from './types';

// All voicing definitions from voicings_note.txt
// Note: The order is [bass, tenor, alto, soprano] from bottom to top
// Prime notation (') indicates octave displacement up from the reference root

export const VOICINGS: Record<VoicingCategory, Voicing[]> = {
  'SB-doubled-close': [
    [1, 3, 5, "1'"],
    [5, "1'", "3'", "5'"],
    [3, 5, "1'", "3'"]  // For supertonic, mediant, submediant only
  ],
  'SB-doubled-spread': [
    [1, 5, "3'", "1''"],
    [5, "3'", "1''", "5''"],
    [3, "1'", "5'", "3''"]  // For supertonic, mediant, submediant only
  ],
  'AB-doubled-close': [
    [1, 5, "1'", "3'"],
    [5, "3'", "5'", "1''"],
    [3, "1'", "3'", "5'"]
  ],
  'AB-doubled-spread': [
    [1, 3, "1'", "5'"],
    [5, "1'", "5'", "3''"],
    [3, 5, "3'", "1''"]
  ],
  'TB-doubled-close': [
    [1, "1'", "3'", "5'"],
    [5, "5'", "1''", "3''"],
    [3, "3'", "5'", "1''"]
  ],
  'TB-doubled-spread': [
    [1, "1'", "5'", "3''"],
    [5, "5'", "3''", "1'''"],
    [3, "3'", "1''", "5''"]
  ],
  'ST-doubled-bottom-close': [
    [1, 3, 5, "3'"],
    [5, "1'", "3'", "1''"],
    [3, 5, "1'", "5'"]
  ],
  'ST-doubled-bottom-spread': [
    [1, 5, "3'", "5'"],
    [5, "3'", "1''", "3''"],
    [3, "1'", "5'", "1''"]
  ],
  'TA-doubled-close': [
    [1, 3, "3'", "5'"],  // For supertonic, mediant, submediant only
    [5, "1'", "1''", "3''"],
    [3, 5, "5'", "1''"]
  ],
  'TA-doubled-spread': [
    [1, 5, "5'", "3''"],
    [5, "3'", "3''", "1'''"],  // For supertonic, mediant, submediant only
    [3, "1'", "1''", "5''"]
  ],
  'AS-doubled-close': [
    [1, 3, 5, "5'"],
    [5, "1'", "3'", "3''"],  // For supertonic, mediant, submediant only
    [3, 5, "1'", "1''"]
  ],
  'AS-doubled-spread': [
    [1, 5, "3'", "3''"],  // For supertonic, mediant, submediant only
    [5, "3'", "1''", "1'''"],
    [3, "1'", "5'", "5''"]
  ]
};

// Get all voicing categories
export function getAllVoicingCategories(): VoicingCategory[] {
  return Object.keys(VOICINGS) as VoicingCategory[];
}

// Get voicings for a specific category
export function getVoicingsForCategory(category: VoicingCategory): Voicing[] {
  return VOICINGS[category];
}

// Get all voicings as a flat array
export function getAllVoicings(): Array<{ category: VoicingCategory; voicing: Voicing; index: number }> {
  const result: Array<{ category: VoicingCategory; voicing: Voicing; index: number }> = [];

  for (const category of getAllVoicingCategories()) {
    const voicings = VOICINGS[category];
    voicings.forEach((voicing, index) => {
      result.push({ category, voicing, index });
    });
  }

  return result;
}
