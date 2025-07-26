// src/api/index.ts or similar

import { Question, Difficulty } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

export const api = {
  async getQuestions(count: number = 5, difficulty: Difficulty = 'medium', sport: Sport = 'all'): Promise<Question[]> {
    try {
      // Add timestamp to prevent caching and ensure fresh random questions
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_BASE_URL}/questions?count=${count}&difficulty=${difficulty}&sport=${sport}&_t=${timestamp}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
  async getDailyQuiz(): Promise<Question[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/daily-quiz`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily quiz');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily quiz:', error);
      throw error;
    }
  },
};
