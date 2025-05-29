// src/api/index.ts or similar

import { Question, Difficulty } from '../types';

const API_URL = 'http://localhost:3001/api';

export const api = {
  async getQuestions(count: number = 5, difficulty: Difficulty = 'medium'): Promise<Question[]> {
    const response = await fetch(`${API_URL}/questions?count=${count}&difficulty=${difficulty}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  }
};
