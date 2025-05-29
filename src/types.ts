export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: Difficulty;
} 