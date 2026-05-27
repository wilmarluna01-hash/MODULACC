import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface AudioAttempt {
  userId: string;
  exerciseId: string;
  exerciseType: 'attention' | 'memory' | 'discrimination';
  difficulty: number;
  startedAt: Timestamp;
  durationMs: number;
  reactionTimeMs: number;
  isCorrect: boolean;
  stimulusResponse: string;
  score: number;
}

export const saveAttempt = async (attempt: AudioAttempt) => {
  try {
    await addDoc(collection(db, 'audioAttempts'), attempt);
  } catch (error) {
    console.error("Error saving audio attempt:", error);
    throw error;
  }
};

export const getUnlockedLevel = (attempts: AudioAttempt[], type: 'attention' | 'memory' | 'discrimination'): number => {
  const typeAttempts = attempts.filter(a => a.exerciseType === type);
  
  const getLevelAttempts = (level: number) => typeAttempts.filter(a => a.difficulty === level);
  
  const checkLevel = (attempts: AudioAttempt[]) => {
    if (attempts.length < 5) return false;
    const recent = attempts.slice(-5);
    const correctCount = recent.filter(a => a.isCorrect).length;
    return (correctCount / 5) >= 0.7;
  };

  if (checkLevel(getLevelAttempts(2))) return 3;
  if (checkLevel(getLevelAttempts(1))) return 2;
  return 1;
};

export const getProgressStats = (attempts: AudioAttempt[]) => {
  const types = ['attention', 'memory', 'discrimination'] as const;
  return types.map(type => {
    const typeAttempts = attempts.filter(a => a.exerciseType === type);
    const correct = typeAttempts.filter(a => a.isCorrect).length;
    const avgReaction = typeAttempts.length > 0 
      ? typeAttempts.reduce((acc, curr) => acc + curr.reactionTimeMs, 0) / typeAttempts.length 
      : 0;
    
    return {
      type,
      total: typeAttempts.length,
      accuracy: typeAttempts.length > 0 ? (correct / typeAttempts.length) * 100 : 0,
      avgReaction
    };
  });
};
