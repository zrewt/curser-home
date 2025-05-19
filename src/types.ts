export interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export type Difficulty = 'easy' | 'medium' | 'hard'; 