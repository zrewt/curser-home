// src/api/index.ts or similar

import { Question } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

export const api = {
  async getQuestions(count: number = 5): Promise<Question[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/questions?count=${count}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }
};
