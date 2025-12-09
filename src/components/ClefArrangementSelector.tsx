import { ClefArrangement } from '../theory/types';

interface ClefArrangementSelectorProps {
  selected: ClefArrangement;
  onChange: (arrangement: ClefArrangement) => void;
}

export function ClefArrangementSelector({ selected, onChange }: ClefArrangementSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Staff Arrangement</h3>
      <div className="flex gap-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="staff-arrangement"
            checked={selected === 'SA/TB'}
            onChange={() => onChange('SA/TB')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Two staves</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="staff-arrangement"
            checked={selected === 'Four staves'}
            onChange={() => onChange('Four staves')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Four staves</span>
        </label>
      </div>
    </div>
  );
}
