import { useState, useEffect } from 'react';
import {
  VoicingSelection,
  DoublingType,
  SpacingType,
  InversionType
} from '../theory/voicingSelection';

interface VoicingSelectorProps {
  selectedVoicings: VoicingSelection[];
  onChange: (selections: VoicingSelection[]) => void;
}

const DOUBLING_LABELS: Record<DoublingType, string> = {
  'SB': 'SB doubled',
  'AB': 'AB doubled',
  'TB': 'TB doubled',
  'ST': 'ST doubled',
  'TA': 'TA doubled',
  'AS': 'AS doubled'
};

const SPACING_LABELS: Record<SpacingType, string> = {
  'close': 'Close',
  'spread': 'Spread'
};

const INVERSION_LABELS: Record<InversionType, string> = {
  'root': 'Root on bottom',
  'fifth': 'Fifth on bottom',
  'third': 'Third on bottom'
};

export function VoicingSelector({ selectedVoicings, onChange }: VoicingSelectorProps) {
  // Track intended selections in each dimension (independent state)
  const [intendedDoublings, setIntendedDoublings] = useState<Set<DoublingType>>(() => {
    const set = new Set<DoublingType>();
    selectedVoicings.forEach(sel => set.add(sel.doubling));
    return set.size > 0 ? set : new Set(['SB']);
  });

  const [intendedSpacings, setIntendedSpacings] = useState<Set<SpacingType>>(() => {
    const set = new Set<SpacingType>();
    selectedVoicings.forEach(sel => set.add(sel.spacing));
    return set.size > 0 ? set : new Set(['close']);
  });

  const [intendedInversions, setIntendedInversions] = useState<Set<InversionType>>(() => {
    const set = new Set<InversionType>();
    selectedVoicings.forEach(sel => set.add(sel.inversion));
    return set.size > 0 ? set : new Set(['root', 'fifth']);
  });

  // Derive actual combinations from intended selections (Cartesian product)
  useEffect(() => {
    const combinations: VoicingSelection[] = [];
    for (const doubling of intendedDoublings) {
      for (const spacing of intendedSpacings) {
        for (const inversion of intendedInversions) {
          combinations.push({ doubling, spacing, inversion });
        }
      }
    }
    onChange(combinations);
  }, [intendedDoublings, intendedSpacings, intendedInversions, onChange]);

  const toggleDoubling = (doubling: DoublingType) => {
    setIntendedDoublings(prev => {
      const next = new Set(prev);
      if (next.has(doubling)) {
        next.delete(doubling);
      } else {
        next.add(doubling);
      }
      return next;
    });
  };

  const toggleSpacing = (spacing: SpacingType) => {
    setIntendedSpacings(prev => {
      const next = new Set(prev);
      if (next.has(spacing)) {
        next.delete(spacing);
      } else {
        next.add(spacing);
      }
      return next;
    });
  };

  const toggleInversion = (inversion: InversionType) => {
    setIntendedInversions(prev => {
      const next = new Set(prev);
      if (next.has(inversion)) {
        next.delete(inversion);
      } else {
        next.add(inversion);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setIntendedDoublings(new Set(['SB', 'AB', 'TB', 'ST', 'TA', 'AS'] as DoublingType[]));
    setIntendedSpacings(new Set(['close', 'spread'] as SpacingType[]));
    setIntendedInversions(new Set(['root', 'fifth', 'third'] as InversionType[]));
  };

  const handleSelectNone = () => {
    setIntendedDoublings(new Set());
    setIntendedSpacings(new Set());
    setIntendedInversions(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Voicings</h3>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Doubling */}
      <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
        {(Object.keys(DOUBLING_LABELS) as DoublingType[]).map(doubling => (
          <label
            key={doubling}
            className="inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={intendedDoublings.has(doubling)}
              onChange={() => toggleDoubling(doubling)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {DOUBLING_LABELS[doubling]}
            </span>
          </label>
        ))}
      </div>

      {/* Spacing */}
      <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
        {(Object.keys(SPACING_LABELS) as SpacingType[]).map(spacing => (
          <label
            key={spacing}
            className="inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={intendedSpacings.has(spacing)}
              onChange={() => toggleSpacing(spacing)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {SPACING_LABELS[spacing]}
            </span>
          </label>
        ))}
      </div>

      {/* Inversion */}
      <div className="flex flex-wrap gap-3">
        {(['root', 'third', 'fifth'] as InversionType[]).map(inversion => (
          <label
            key={inversion}
            className="inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={intendedInversions.has(inversion)}
              onChange={() => toggleInversion(inversion)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {INVERSION_LABELS[inversion]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
