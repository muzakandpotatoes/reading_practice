import { useEffect, useRef } from 'react';
import { Vex } from 'vexflow';
import { Chord, ClefArrangement, KeySignature } from '../theory/types';

const { Factory } = Vex.Flow;

interface ChordRendererProps {
  chord: Chord | null;
  clefArrangement: ClefArrangement;
}

/**
 * Convert MIDI pitch to VexFlow note string
 * VexFlow uses format like "C/4" for middle C
 * Uses appropriate enharmonic spelling based on key signature
 */
function pitchToVexNote(pitch: number, keySignature: KeySignature): string {
  const octave = Math.floor(pitch / 12) - 1;
  const pitchClass = pitch % 12;

  // Determine if this is a sharp or flat key
  const flatKeys: KeySignature[] = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  const isFlat = flatKeys.includes(keySignature);

  // Note names for sharp keys (default)
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Note names for flat keys
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  const noteNames = isFlat ? flatNames : sharpNames;
  const noteName = noteNames[pitchClass];

  // Convert sharps/flats to VexFlow format
  const baseNote = noteName[0];
  const accidental = noteName.length > 1 ? noteName[1] : '';

  return `${baseNote}${accidental}/${octave}`;
}

/**
 * Get key signature for VexFlow
 */
function getVexKeySignature(key: KeySignature): string {
  // Map to VexFlow key signature format
  const keyMap: Record<KeySignature, string> = {
    'C': 'C',
    'G': 'G',
    'D': 'D',
    'A': 'A',
    'E': 'E',
    'B': 'B',
    'F#': 'F#',
    'F': 'F',
    'Bb': 'Bb',
    'Eb': 'Eb',
    'Ab': 'Ab',
    'Db': 'Db',
    'Gb': 'Gb'
  };
  return keyMap[key];
}

export function ChordRenderer({ chord, clefArrangement }: ChordRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !chord) {
      return;
    }

    // Clear previous content
    containerRef.current.innerHTML = '';

    const container = containerRef.current;
    // Create a unique ID for this render
    const renderId = `vexflow-${Date.now()}`;
    const div = document.createElement('div');
    div.id = renderId;
    container.appendChild(div);

    // Adjust height based on clef arrangement
    const height = clefArrangement === 'Four staves' ? 400 : 250;

    const vf = new Factory({
      renderer: { elementId: renderId, width: 600, height }
    });

    const context = vf.getContext();
    context.setFont('Arial', 10);

    try {
      if (clefArrangement === 'SA/TB') {
        renderSATB(vf, context, chord);
      } else {
        renderFourStaves(vf, context, chord);
      }
    } catch (error) {
      console.error('Error rendering chord:', error);
    }

    vf.draw();
  }, [chord, clefArrangement]);

  if (!chord) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-gray-300">
        <p className="text-gray-500">Select options and click Next to generate a chord</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}

/**
 * Render SA/TB arrangement (treble + bass staves)
 */
function renderSATB(vf: any, context: any, chord: Chord) {
  const [soprano, alto, tenor, bass] = chord.pitches;
  const keySignature = getVexKeySignature(chord.keySignature);

  // Create two staves
  const trebleStave = vf.Stave({ x: 50, y: 0, width: 500 })
    .addClef('treble')
    .addKeySignature(keySignature);

  const bassStave = vf.Stave({ x: 50, y: 100, width: 500 })
    .addClef('bass')
    .addKeySignature(keySignature);

  // Create notes for treble clef (soprano and alto)
  const trebleNotes = vf.StaveNote({
    keys: [pitchToVexNote(alto, chord.keySignature), pitchToVexNote(soprano, chord.keySignature)],
    duration: 'w'
  });

  // Create notes for bass clef (tenor and bass)
  const bassNotes = vf.StaveNote({
    keys: [pitchToVexNote(bass, chord.keySignature), pitchToVexNote(tenor, chord.keySignature)],
    duration: 'w',
    clef: 'bass'
  });

  // Create voices and format
  const trebleVoice = vf.Voice().addTickable(trebleNotes);
  const bassVoice = vf.Voice().addTickable(bassNotes);

  new Vex.Flow.Formatter()
    .joinVoices([trebleVoice])
    .format([trebleVoice], 450);

  new Vex.Flow.Formatter()
    .joinVoices([bassVoice])
    .format([bassVoice], 450);

  trebleVoice.draw(context, trebleStave);
  bassVoice.draw(context, bassStave);
}

/**
 * Render four individual staves
 */
function renderFourStaves(vf: any, context: any, chord: Chord) {
  const [soprano, alto, tenor, bass] = chord.pitches;
  const keySignature = getVexKeySignature(chord.keySignature);
  const tenorUp = tenor + 12; // Tenor written up an octave

  // Create four staves
  const sopranoStave = vf.Stave({ x: 50, y: 10, width: 500 })
    .addClef('treble')
    .addKeySignature(keySignature);

  const altoStave = vf.Stave({ x: 50, y: 90, width: 500 })
    .addClef('treble')
    .addKeySignature(keySignature);

  const tenorStave = vf.Stave({ x: 50, y: 170, width: 500 })
    .addClef('treble')
    .addKeySignature(keySignature);

  const bassStave = vf.Stave({ x: 50, y: 250, width: 500 })
    .addClef('bass')
    .addKeySignature(keySignature);

  // Create notes for each voice
  const sopranoNote = vf.StaveNote({ keys: [pitchToVexNote(soprano, chord.keySignature)], duration: 'w' });
  const altoNote = vf.StaveNote({ keys: [pitchToVexNote(alto, chord.keySignature)], duration: 'w' });
  const tenorNote = vf.StaveNote({ keys: [pitchToVexNote(tenorUp, chord.keySignature)], duration: 'w' });
  const bassNote = vf.StaveNote({ keys: [pitchToVexNote(bass, chord.keySignature)], duration: 'w', clef: 'bass' });

  // Create voices
  const sopranoVoice = vf.Voice().addTickable(sopranoNote);
  const altoVoice = vf.Voice().addTickable(altoNote);
  const tenorVoice = vf.Voice().addTickable(tenorNote);
  const bassVoice = vf.Voice().addTickable(bassNote);

  // Format each voice
  new Vex.Flow.Formatter().joinVoices([sopranoVoice]).format([sopranoVoice], 450);
  new Vex.Flow.Formatter().joinVoices([altoVoice]).format([altoVoice], 450);
  new Vex.Flow.Formatter().joinVoices([tenorVoice]).format([tenorVoice], 450);
  new Vex.Flow.Formatter().joinVoices([bassVoice]).format([bassVoice], 450);

  // Draw each voice
  sopranoVoice.draw(context, sopranoStave);
  altoVoice.draw(context, altoStave);
  tenorVoice.draw(context, tenorStave);
  bassVoice.draw(context, bassStave);
}
