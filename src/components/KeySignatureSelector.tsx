import { KeySignature, Mode } from '../theory/types';

interface KeySignatureSelectorProps {
  selectedKeys: KeySignature[];
  onChange: (keys: KeySignature[]) => void;
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ALL_KEYS: KeySignature[] = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#',
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'
];

export function KeySignatureSelector({ selectedKeys, onChange, selectedMode, onModeChange }: KeySignatureSelectorProps) {
  const handleToggle = (key: KeySignature) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter(k => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  const handleSelectAll = () => {
    onChange([...ALL_KEYS]);
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Key Signatures</h3>
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

      {/* Mode selector */}
      <div className="flex gap-4 pb-2 border-b border-gray-200">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            checked={selectedMode === 'major'}
            onChange={() => onModeChange('major')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Major</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            checked={selectedMode === 'minor'}
            onChange={() => onModeChange('minor')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Minor</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_KEYS.map(key => (
          <label
            key={key}
            className="inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedKeys.includes(key)}
              onChange={() => handleToggle(key)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {key}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
