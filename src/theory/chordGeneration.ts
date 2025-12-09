import {
  Chord,
  KeySignature,
  Mode,
  Voicing,
  VoicingCategory,
  Pitch
} from './types';
import { calculatePitches, getNoteLetter, KEY_ACCIDENTALS, noteToMidiPitch } from './pitchCalculation';
import { validatePitches } from './rangeValidation';
import { VoicingSelection, getVoicingsForSelections } from './voicingSelection';

/**
 * Check if a specific combination of root, key, and voicing is valid
 */
function isValidCombination(
  rootScaleDegree: number,
  keySignature: KeySignature,
  voicing: Voicing
): boolean {
  try {
    const pitches = calculatePitches(rootScaleDegree, keySignature, voicing);
    const isValid = validatePitches(pitches);
    if (!isValid) {
      console.log(`Invalid: root=${rootScaleDegree}, key=${keySignature}, pitches=`, pitches);
    }
    return isValid;
  } catch (error) {
    console.error(`Error calculating pitches:`, error);
    return false;
  }
}

/**
 * Get all valid (root, referenceRoot) combinations for a given voicing and key
 * Tests multiple octaves for each root to find all SATB-compatible voicings
 */
export function getValidRoots(
  voicing: Voicing,
  keySignature: KeySignature
): Array<{ root: number; referenceRoot: Pitch }> {
  const validCombinations: Array<{ root: number; referenceRoot: Pitch }> = [];

  // Test all 7 scale degrees
  for (let root = 1; root <= 7; root++) {
    // Try multiple octaves (1-5) for the reference root (bass note)
    for (let octave = 1; octave <= 5; octave++) {
      // Calculate the reference root pitch for this octave
      const noteLetter = getNoteLetter(root, keySignature);
      const accidental = KEY_ACCIDENTALS[keySignature][noteLetter] || 0;
      const referenceRoot = noteToMidiPitch(noteLetter, accidental, octave);

      try {
        // Calculate pitches with this reference root
        const pitches = calculatePitches(root, keySignature, voicing, referenceRoot);

        // Check if all pitches are in valid SATB ranges
        if (validatePitches(pitches)) {
          validCombinations.push({ root, referenceRoot });
        }
      } catch (error) {
        // Skip invalid combinations
      }
    }
  }

  return validCombinations;
}

/**
 * Generate a random chord from enabled voicing selections and key signatures
 */
export function generateRandomChord(
  enabledSelections: VoicingSelection[],
  enabledKeys: KeySignature[],
  mode: Mode
): Chord | null {
  if (enabledSelections.length === 0 || enabledKeys.length === 0) {
    console.log('No selections or keys enabled');
    return null;
  }

  // Get all voicings for the selections
  const selectedVoicings = getVoicingsForSelections(enabledSelections);

  // Collect all valid combinations
  const validCombinations: Array<{
    category: VoicingCategory;
    voicingIndex: number;
    voicing: Voicing;
    key: KeySignature;
    root: number;
    referenceRoot: Pitch;
  }> = [];

  // Check all combinations
  for (const { category, index, voicing } of selectedVoicings) {
    for (const key of enabledKeys) {
      const validRootCombos = getValidRoots(voicing, key);
      console.log(`Category: ${category}, Index: ${index}, Key: ${key}, Valid combinations:`, validRootCombos.length);
      for (const { root, referenceRoot } of validRootCombos) {
        validCombinations.push({
          category,
          voicingIndex: index,
          voicing,
          key,
          root,
          referenceRoot
        });
      }
    }
  }

  console.log('Total valid combinations:', validCombinations.length);

  if (validCombinations.length === 0) {
    return null;
  }

  // Pick a random valid combination
  const randomIndex = Math.floor(Math.random() * validCombinations.length);
  const selected = validCombinations[randomIndex];

  // Calculate pitches using the selected reference root
  const pitches = calculatePitches(selected.root, selected.key, selected.voicing, selected.referenceRoot);

  return {
    root: selected.root,
    keySignature: selected.key,
    mode,
    voicing: selected.voicing,
    pitches
  };
}

/**
 * Generate a specific chord (useful for testing)
 */
export function generateChord(
  rootScaleDegree: number,
  keySignature: KeySignature,
  mode: Mode,
  voicing: Voicing
): Chord | null {
  if (!isValidCombination(rootScaleDegree, keySignature, voicing)) {
    return null;
  }

  const pitches = calculatePitches(rootScaleDegree, keySignature, voicing);

  return {
    root: rootScaleDegree,
    keySignature,
    mode,
    voicing,
    pitches
  };
}
