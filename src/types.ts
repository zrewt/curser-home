export type Difficulty = 'easy' | 'medium' | 'hard';
export type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

export interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: Difficulty;
  sport: Sport;
} 