// src/api/index.ts or similar

import { Question, Difficulty } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

export const api = {
  async getQuestions(count: number = 5, difficulty: Difficulty = 'medium'): Promise<Question[]> {
    try {
      // Add timestamp to prevent caching and ensure fresh random questions
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_BASE_URL}/questions?count=${count}&difficulty=${difficulty}&_t=${timestamp}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch questions');
      }
      
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No questions available');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
