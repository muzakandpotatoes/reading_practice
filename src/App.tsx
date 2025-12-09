import { useState, useEffect, useCallback } from 'react';
import { Chord, ClefArrangement, KeySignature, Mode } from './theory/types';
import { generateRandomChord } from './theory/chordGeneration';
import { getChordQuality, calculatePitches, getNoteLetter, NOTE_LETTERS } from './theory/pitchCalculation';
import { VoicingSelection } from './theory/voicingSelection';
import { ChordRenderer } from './components/ChordRenderer';
import { KeySignatureSelector } from './components/KeySignatureSelector';
import { VoicingSelector } from './components/VoicingSelector';
import { ClefArrangementSelector } from './components/ClefArrangementSelector';

function App() {
  // State for user selections
  const [selectedKeys, setSelectedKeys] = useState<KeySignature[]>(['C', 'G', 'D']);
  const [selectedMode, setSelectedMode] = useState<Mode>('major');
  const [selectedVoicings, setSelectedVoicings] = useState<VoicingSelection[]>([
    { doubling: 'SB', spacing: 'close', inversion: 'root' },
    { doubling: 'SB', spacing: 'close', inversion: 'fifth' }
  ]);
  const [clefArrangement, setClefArrangement] = useState<ClefArrangement>('SA/TB');
  const [showAnnotation, setshowAnnotation] = useState(true);
  const [hideAnnotation, sethideAnnotation] = useState(false);

  // Current chord state (with octave offset for transposition)
  const [currentChord, setCurrentChord] = useState<(Chord & { octaveOffset?: number }) | null>(null);

  // Generate a new chord
  const generateNewChord = useCallback(() => {
    const chord = generateRandomChord(selectedVoicings, selectedKeys, selectedMode);
    if (chord) {
      setCurrentChord({ ...chord, octaveOffset: 0 });
    } else {
      setCurrentChord(null);
    }
    setshowAnnotation(!hideAnnotation);
  }, [selectedVoicings, selectedKeys, selectedMode, hideAnnotation]);

  // Generate initial chord on mount
  useEffect(() => {
    generateNewChord();
  }, [generateNewChord]);

  // Handle Next button
  const handleNext = useCallback(() => {
    generateNewChord();
  }, [generateNewChord]);

  // Transpose chord up or down by one scale degree (diatonic step)
  const transposeChord = useCallback((direction: 'up' | 'down') => {
    if (!currentChord) return;

    let octaveOffset = currentChord.octaveOffset || 0;

    // Get old root note letter
    const oldRootLetter = getNoteLetter(currentChord.root, currentChord.keySignature);
    const oldNoteIndex = NOTE_LETTERS.indexOf(oldRootLetter);

    // Move to next/previous scale degree
    const newRoot = direction === 'up'
      ? (currentChord.root % 7) + 1
      : currentChord.root === 1 ? 7 : currentChord.root - 1;

    // Get new root note letter
    const newRootLetter = getNoteLetter(newRoot, currentChord.keySignature);
    const newNoteIndex = NOTE_LETTERS.indexOf(newRootLetter);

    // Track octave based on note letter wrapping (matches calculatePitchFromDegree logic)
    if (direction === 'up' && newNoteIndex < oldNoteIndex) {
      octaveOffset += 1; // Wrapped around C (e.g., B→C)
    } else if (direction === 'down' && newNoteIndex > oldNoteIndex) {
      octaveOffset -= 1; // Wrapped around C going down (e.g., C→B)
    }

    // Recalculate pitches diatonically with the new root
    const normalizedPitches = calculatePitches(
      newRoot,
      currentChord.keySignature,
      currentChord.voicing
    );

    // Apply octave offset to maintain continuous motion
    const newPitches: [number, number, number, number] = [
      normalizedPitches[0] + (octaveOffset * 12),
      normalizedPitches[1] + (octaveOffset * 12),
      normalizedPitches[2] + (octaveOffset * 12),
      normalizedPitches[3] + (octaveOffset * 12)
    ];

    setCurrentChord({
      ...currentChord,
      root: newRoot,
      pitches: newPitches,
      octaveOffset
    });
  }, [currentChord]);

  // Handle keyboard shortcuts
  useEffect(() => {
    // Helper to check if user is typing in a text input
    const isTypingInTextInput = (target: EventTarget | null): boolean => {
      if (target instanceof HTMLInputElement) {
        const type = target.type.toLowerCase();
        return type === 'text' || type === 'search' || type === 'email' ||
               type === 'number' || type === 'tel' || type === 'url' || type === 'password';
      }
      return target instanceof HTMLTextAreaElement;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = Next (only when body has focus to avoid conflicts)
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleNext();
      }
      // A = Toggle annotation (only when body has focus)
      if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey && e.target === document.body) {
        e.preventDefault();
        setshowAnnotation(prev => !prev);
      }
      // K = Transpose up (works everywhere except text inputs)
      if (e.code === 'KeyK' && !e.ctrlKey && !e.metaKey && !isTypingInTextInput(e.target)) {
        e.preventDefault();
        transposeChord('up');
      }
      // J = Transpose down (works everywhere except text inputs)
      if (e.code === 'KeyJ' && !e.ctrlKey && !e.metaKey && !isTypingInTextInput(e.target)) {
        e.preventDefault();
        transposeChord('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, transposeChord]);

  // Get chord information for display
  const getChordInfo = () => {
    if (!currentChord) return null;

    const quality = getChordQuality(currentChord.root, currentChord.mode);
    const voicingStr = currentChord.voicing.map(d => String(d)).join(' ');

    // Get the root note name (scale degree + key)
    const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const keyRoot = currentChord.keySignature[0]; // First letter of key
    const keyIndex = noteNames.indexOf(keyRoot);
    const rootIndex = (keyIndex + currentChord.root - 1) % 7;
    const rootNote = noteNames[rootIndex];

    // Determine chord quality suffix (M, m, °)
    const qualityChar = quality === quality.toUpperCase() ? 'M' :
                       quality.includes('°') ? '°' : 'm';

    return {
      key: `${currentChord.keySignature} ${currentChord.mode}`,
      chord: `${rootNote}${qualityChar}`,
      voicing: voicingStr,
      function: quality
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Music Reading Practice
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Signatures */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <KeySignatureSelector
                selectedKeys={selectedKeys}
                onChange={setSelectedKeys}
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
              />
            </div>

            {/* Voicings */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <VoicingSelector
                selectedVoicings={selectedVoicings}
                onChange={setSelectedVoicings}
              />
            </div>

            {/* Clef Arrangement */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <ClefArrangementSelector
                selected={clefArrangement}
                onChange={setClefArrangement}
              />
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Options</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideAnnotation}
                  onChange={(e) => {
                    sethideAnnotation(e.target.checked);
                    if (e.target.checked) {
                      setshowAnnotation(false);
                    } else {
                      setshowAnnotation(true);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Hide annotation
                </span>
              </label>
            </div>
          </div>

          {/* Right column: Chord display and controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chord renderer */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ChordRenderer
                chord={currentChord}
                clefArrangement={clefArrangement}
              />
            </div>

            {/* Annotation display */}
            {showAnnotation && currentChord && (() => {
              const info = getChordInfo();
              return info ? (
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="space-y-2 text-gray-800">
                    <div className="flex gap-4">
                      <span className="font-semibold w-20">Key:</span>
                      <span>{info.key}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold w-20">Chord:</span>
                      <span>{info.chord}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold w-20">Voicing:</span>
                      <span>{info.voicing}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold w-20">Function:</span>
                      <span>{info.function}</span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNext}
                disabled={selectedKeys.length === 0 || selectedVoicings.length === 0}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next Chord (Space)
              </button>
              {hideAnnotation && (
                <button
                  onClick={() => setshowAnnotation(prev => !prev)}
                  disabled={!currentChord}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {showAnnotation ? 'Hide' : 'Show'} Annotation (A)
                </button>
              )}
            </div>

            {/* Keyboard shortcuts help */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Keyboard Shortcuts:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Space</kbd> - Next chord</li>
                <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">A</kbd> - Toggle annotation</li>
                <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">K</kbd> - Transpose up (diatonic step)</li>
                <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">J</kbd> - Transpose down (diatonic step)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
