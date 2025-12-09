// Quick test of chord generation
import { generateRandomChord } from './src/theory/chordGeneration.ts';

const chord = generateRandomChord(['SB-doubled-close'], ['C']);
console.log('Generated chord:', chord);
