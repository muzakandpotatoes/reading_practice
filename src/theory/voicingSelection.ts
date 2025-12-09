import { Voicing, VoicingCategory } from './types';
import { VOICINGS } from './voicings';

export type DoublingType = 'SB' | 'AB' | 'TB' | 'ST' | 'TA' | 'AS';
export type SpacingType = 'close' | 'spread';
export type InversionType = 'root' | 'fifth' | 'third';

export interface VoicingSelection {
  doubling: DoublingType;
  spacing: SpacingType;
  inversion: InversionType;
}

/**
 * Convert a voicing selection to a VoicingCategory and index
 */
export function selectionToCategory(selection: VoicingSelection): {
  category: VoicingCategory;
  index: number;
} {
  const { doubling, spacing, inversion } = selection;

  // Build category name
  const spacingSuffix = spacing === 'close' ? '-close' : '-spread';
  let category: VoicingCategory;

  if (doubling === 'ST') {
    category = `${doubling}-doubled-bottom${spacingSuffix}` as VoicingCategory;
  } else {
    category = `${doubling}-doubled${spacingSuffix}` as VoicingCategory;
  }

  // Map inversion to index
  const inversionIndex =
    inversion === 'root' ? 0 :
    inversion === 'fifth' ? 1 :
    2; // third

  return { category, index: inversionIndex };
}

/**
 * Get the actual voicing for a selection
 */
export function getVoicingForSelection(selection: VoicingSelection): Voicing | null {
  const { category, index } = selectionToCategory(selection);
  const voicings = VOICINGS[category];

  if (!voicings || index >= voicings.length) {
    return null;
  }

  return voicings[index];
}

/**
 * Get all voicings for a list of selections
 */
export function getVoicingsForSelections(selections: VoicingSelection[]): Array<{
  category: VoicingCategory;
  index: number;
  voicing: Voicing;
}> {
  const result: Array<{
    category: VoicingCategory;
    index: number;
    voicing: Voicing;
  }> = [];

  for (const selection of selections) {
    const voicing = getVoicingForSelection(selection);
    if (voicing) {
      const { category, index } = selectionToCategory(selection);
      result.push({ category, index, voicing });
    }
  }

  return result;
}

/**
 * Check if two selections are equal
 */
export function selectionsEqual(a: VoicingSelection, b: VoicingSelection): boolean {
  return a.doubling === b.doubling &&
         a.spacing === b.spacing &&
         a.inversion === b.inversion;
}
