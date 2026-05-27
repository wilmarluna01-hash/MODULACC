import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type DiagnosticResult = {
  attentionScore: number;
  memoryScore: number;
  discriminationScore: number;
  overallLevel: "basic" | "intermediate" | "advanced";
  recommendedDifficulty: number;
};

export type PerformanceMetric = {
    accuracy: number;        // Percentage 0-100
    reactionTime: number;    // Average ms
    errors: number;
};

export class DiagnosticEngine {
  async startDiagnostic(userId: string) {
    console.log("Starting diagnostic for:", userId);
    // Initialize session data in Firestore
  }

  calculateUserLevel(metrics: { attention: PerformanceMetric; memory: PerformanceMetric; discrimination: PerformanceMetric }): DiagnosticResult {
    const attentionScore = (metrics.attention.accuracy * 0.5) + ((10000 / Math.max(metrics.attention.reactionTime, 1)) * 0.2) + ((100 - metrics.attention.errors * 5) * 0.3);
    const memoryScore = (metrics.memory.accuracy * 0.5) + ((100 - metrics.memory.errors * 10) * 0.5);
    const discriminationScore = (metrics.discrimination.accuracy); // Simplified

    const totalScore = (attentionScore * 0.5) + (metrics.attention.reactionTime < 2000 ? 50 : 0) + (memoryScore * 0.3); // Dummy formula, needs refinement

    let overallLevel: "basic" | "intermediate" | "advanced" = "basic";
    if (totalScore > 70) overallLevel = "advanced";
    else if (totalScore > 40) overallLevel = "intermediate";

    return {
      attentionScore,
      memoryScore,
      discriminationScore,
      overallLevel,
      recommendedDifficulty: totalScore > 70 ? 3 : totalScore > 40 ? 2 : 1
    };
  }

  // Placeholder for dynamic exercise generation (ideally Gemini powered)
  async generateNextExercise(level: number, type: 'attention' | 'memory' | 'discrimination') {
    return { id: 'ex1', prompt: 'Escucha...', type };
  }
}

export const diagnosticEngine = new DiagnosticEngine();
