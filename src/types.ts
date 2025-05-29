export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  question: string;
  answers: string[];
  correctAnswer: string;
  difficulty: Difficulty;
} 