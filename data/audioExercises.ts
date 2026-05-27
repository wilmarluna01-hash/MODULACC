export interface Stimulus {
  id: string;
  frequency: number;
  duration: number;
  type: OscillatorType;
}

export interface AudioExercise {
  id: string;
  type: 'attention' | 'memory' | 'discrimination';
  difficulty: 1 | 2 | 3;
  title: string;
  instructions: string;
  stimuli: Stimulus[];
  targetStimulus?: string;
  sequence?: string[];
  noiseLevel?: number;
  timeLimit?: number;
}

export const audioExercises: AudioExercise[] = [
  {
    id: 'att-1',
    type: 'attention',
    difficulty: 1,
    title: 'Detección de tono agudo',
    instructions: 'Presiona el botón cuando escuches un tono agudo.',
    stimuli: [
      { id: 's1', frequency: 440, duration: 1, type: 'sine' },
      { id: 's2', frequency: 880, duration: 1, type: 'sine' }
    ],
    targetStimulus: 's2',
    noiseLevel: 0,
    timeLimit: 5
  },
  {
    id: 'mem-1',
    type: 'memory',
    difficulty: 1,
    title: 'Secuencia simple',
    instructions: 'Memoriza la secuencia de sonidos.',
    stimuli: [
      { id: 'a1', frequency: 220, duration: 0.5, type: 'sine' },
      { id: 'a2', frequency: 440, duration: 0.5, type: 'sine' }
    ],
    sequence: ['a1', 'a2'],
    noiseLevel: 0,
    timeLimit: 10
  },
  {
    id: 'dis-1',
    type: 'discrimination',
    difficulty: 1,
    title: '¿Son iguales?',
    instructions: 'Indica si los dos sonidos son iguales.',
    stimuli: [
      { id: 'd1', frequency: 440, duration: 0.5, type: 'sine' },
      { id: 'd2', frequency: 440, duration: 0.5, type: 'sine' }
    ],
    noiseLevel: 0.1,
    timeLimit: 5
  }
];
