
export enum Role {
  Student = 'student',
  Admin = 'admin',
  Tutor = 'tutor',
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

export interface AccessibilityProfile {
  preferredVoice: "female" | "male";
  readingSpeed: number;
  audioFeedbackEnabled: boolean;
  highContrastMode: boolean;
  fontSize: "small" | "medium" | "large";
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  accessibilityProfile?: AccessibilityProfile;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<User | void>;
  loginWithGoogle: () => Promise<User | void>;
  register: (email: string, pass: string, name: string, role: Role) => Promise<User | void>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
}

export type ExerciseType = 
  | 'multiple_choice'      // lo que existe hoy
  | 'text_input'           // lo que existe hoy
  | 'audio_attention'      // NUEVO: escuchar y detectar estímulo objetivo
  | 'audio_memory'         // NUEVO: escuchar secuencia y reproducirla
  | 'audio_discrimination' // NUEVO: distinguir entre dos sonidos

export type DifficultyLevel = 1 | 2 | 3;

export interface AudioConfig {
  stimulusText: string;        // texto que se leerá como estímulo principal
  distractorTexts?: string[];  // textos distractor (para attention y discrimination)
  sequenceItems?: string[];    // items de la secuencia (para memory)
  noiseLevel?: number;         // 0 a 1, nivel de ruido de fondo
  targetItem?: string;         // el ítem que el usuario debe identificar
}

export interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  instruction: string;
  content?: string; // Text content to read/analyze
  audioUrl?: string; // Optional URL to the audio file
  correctAnswer: string; // Updated from optional to required for easier handling
  possibleAnswers?: string[]; // For multiple choice
  explanation?: string; // Explanation for the correct answer
  fileUrl?: string; // Base64 encoded file content or URL
  fileName?: string; // Original name of the uploaded file
  order: number; // Order of appearance
  createdAt: Date;
  authorId: string;
  subject?: string;

  // Campos nuevos — todos opcionales para no romper ejercicios existentes
  exerciseType?: ExerciseType;  // si está vacío, se trata como 'multiple_choice' o 'text_input'
  difficulty?: DifficultyLevel;
  audioConfig?: AudioConfig;
}

export interface ExerciseResponse {
  exerciseId: string;
  userId: string;
  answer?: string; // Text answer or selected option
  audioResponseUrl?: string; // URL to recorded audio answer
  isCorrect?: boolean;
  timestamp: Date;
  reactionTimeMs?: number; // Added for auditory exercises
  exerciseType?: ExerciseType; // Added for auditory exercises
  difficulty?: DifficultyLevel; // Added for auditory exercises
}

export interface ProgressData {
  moduleId: string;
  score: number; // e.g., percentage
  completedExercises: number;
  totalExercises: number;
  lastAccessed: Date;
}

export interface ChartDataPoint {
  name: string; // e.g., module name or date
  value: number; // e.g., score or completion
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}
